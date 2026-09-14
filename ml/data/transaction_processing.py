from dataclasses import asdict, dataclass
from datetime import date
from pathlib import Path

from pyspark.sql import DataFrame, SparkSession
from pyspark.sql import functions as F

from backend.app.core.config import Settings, get_settings
from ml.data.spark_session import get_spark_session

TRANSACTION_REQUIRED_COLUMNS = {
    "t_dat",
    "customer_id",
    "article_id",
    "price",
    "sales_channel_id",
}


class TransactionValidationError(ValueError):
    """Raised when transaction data does not match AVERO requirements."""


@dataclass(frozen=True)
class TransactionProcessingReport:
    input_rows: int
    output_rows: int
    removed_null_rows: int
    removed_duplicate_rows: int
    removed_invalid_date_rows: int
    removed_invalid_price_rows: int
    removed_outside_date_range_rows: int

    def to_dict(self) -> dict:
        return asdict(self)


def validate_transaction_schema(transactions: DataFrame) -> None:
    missing_columns = TRANSACTION_REQUIRED_COLUMNS - set(transactions.columns)

    if missing_columns:
        missing = ", ".join(sorted(missing_columns))
        raise TransactionValidationError(
            f"Transaction data is missing required columns: {missing}"
        )


def read_transactions_csv(spark: SparkSession, dataset_directory: Path) -> DataFrame:
    file_path = dataset_directory / "transactions_train.csv"

    if not file_path.is_file():
        raise TransactionValidationError(
            f"Required H&M transaction file is missing: {file_path}"
        )

    transactions = (
        spark.read
        .option("header", True)
        .option("inferSchema", True)
        .csv(str(file_path))
    )

    validate_transaction_schema(transactions)
    return transactions


def process_transactions(
    transactions: DataFrame,
    start_date: date | None = None,
    end_date: date | None = None,
) -> tuple[DataFrame, TransactionProcessingReport]:
    validate_transaction_schema(transactions)

    input_rows = transactions.count()

    required_columns = ["t_dat", "customer_id", "article_id"]
    no_nulls = transactions.dropna(subset=required_columns)
    rows_after_null_removal = no_nulls.count()

    deduplicated = no_nulls.dropDuplicates()
    rows_after_duplicate_removal = deduplicated.count()

    typed_transactions = (
        deduplicated
        .withColumn(
            "transaction_timestamp",
            F.to_timestamp(F.col("t_dat"), "yyyy-MM-dd"),
        )
        .withColumn("transaction_date", F.to_date(F.col("t_dat"), "yyyy-MM-dd"))
        .withColumn("price", F.col("price").cast("double"))
        .withColumn("sales_channel_id", F.col("sales_channel_id").cast("integer"))
    )

    valid_dates = typed_transactions.filter(F.col("transaction_timestamp").isNotNull())
    rows_after_date_validation = valid_dates.count()

    valid_prices = valid_dates.filter(
        F.col("price").isNotNull() & (F.col("price") >= 0)
    )
    rows_after_price_validation = valid_prices.count()

    filtered = valid_prices

    if start_date:
        filtered = filtered.filter(
            F.col("transaction_date") >= F.lit(start_date.isoformat())
        )

    if end_date:
        filtered = filtered.filter(
            F.col("transaction_date") <= F.lit(end_date.isoformat())
        )

    output_rows = filtered.count()

    report = TransactionProcessingReport(
        input_rows=input_rows,
        output_rows=output_rows,
        removed_null_rows=input_rows - rows_after_null_removal,
        removed_duplicate_rows=(
            rows_after_null_removal - rows_after_duplicate_removal
        ),
        removed_invalid_date_rows=(
            rows_after_duplicate_removal - rows_after_date_validation
        ),
        removed_invalid_price_rows=(
            rows_after_date_validation - rows_after_price_validation
        ),
        removed_outside_date_range_rows=(
            rows_after_price_validation - output_rows
        ),
    )

    return filtered, report


def save_processed_transactions(
    transactions: DataFrame,
    output_directory: Path,
) -> Path:
    output_directory.parent.mkdir(parents=True, exist_ok=True)

    (
        transactions.write
        .mode("overwrite")
        .parquet(str(output_directory))
    )

    return output_directory


def run_transaction_processing(
    settings: Settings | None = None,
) -> TransactionProcessingReport:
    settings = settings or get_settings()

    if settings.mode != "real":
        raise TransactionValidationError(
            "Transaction processing requires AVERO_MODE=real."
        )

    if not settings.hm_data_dir:
        raise TransactionValidationError(
            "HM_DATA_DIR is required when AVERO_MODE=real."
        )

    spark = get_spark_session(settings)

    try:
        raw_transactions = read_transactions_csv(
            spark,
            Path(settings.hm_data_dir),
        )

        cleaned_transactions, report = process_transactions(
            raw_transactions,
            start_date=settings.processing_start_date,
            end_date=settings.processing_end_date,
        )

        save_processed_transactions(
            cleaned_transactions,
            settings.processed_data_dir / "transactions",
        )

        return report
    finally:
        spark.stop()
