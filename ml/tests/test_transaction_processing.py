import os
import shutil
import sys
from datetime import date
from pathlib import Path

import pytest
from pyspark.sql import SparkSession

from ml.data.transaction_processing import (
    TransactionValidationError,
    process_transactions,
    validate_transaction_schema,
)


def _get_safe_python_executable() -> str:
    current_python = Path(sys.executable).resolve()
    if current_python.exists():
        return str(current_python)

    safe_dir = Path(os.environ.get("TEMP", "/tmp")) / "avero-spark-runtime"
    safe_dir.mkdir(parents=True, exist_ok=True)
    safe_python = safe_dir / "python.exe"
    if not safe_python.exists():
        shutil.copy2(current_python, safe_python)
    return str(safe_python)


@pytest.fixture(scope="session")
def spark(tmp_path_factory):
    python_executable = _get_safe_python_executable()
    os.environ["PYSPARK_PYTHON"] = python_executable
    os.environ["PYSPARK_DRIVER_PYTHON"] = python_executable
    os.environ["SPARK_LOCAL_IP"] = "127.0.0.1"
    os.environ["SPARK_LOCAL_DIRS"] = str(tmp_path_factory.mktemp("spark-local"))
    local_spark_directory = tmp_path_factory.mktemp("spark-local")

    java_options = (
        "--add-opens=java.base/java.security=ALL-UNNAMED "
        "--add-opens=java.base/javax.security.auth=ALL-UNNAMED "
        "--add-opens=java.base/javax.security.auth.login=ALL-UNNAMED"
    )

    session = (
        SparkSession.builder
        .appName("AVERO Transaction Tests")
        .master("local[1]")
        .config("spark.ui.enabled", "false")
        .config("spark.local.dir", str(local_spark_directory))
        .config("spark.sql.shuffle.partitions", "1")
        .config("spark.default.parallelism", "1")
        .config("spark.sql.adaptive.enabled", "false")
        .config("spark.python.worker.reuse", "false")
        .config("spark.driver.host", "127.0.0.1")
        .config("spark.driver.bindAddress", "127.0.0.1")
        .config("spark.driver.extraJavaOptions", java_options)
        .config("spark.executor.extraJavaOptions", java_options)
        .getOrCreate()
    )

    yield session
    session.stop()


def test_process_transactions_removes_invalid_records(spark) -> None:
    transactions = spark.createDataFrame(
        [
            ("2020-09-20", "customer-1", "article-1", 0.50, 1),
            ("2020-09-20", "customer-1", "article-1", 0.50, 1),
            ("2020-09-21", None, "article-2", 0.60, 1),
            ("not-a-date", "customer-3", "article-3", 0.70, 1),
            ("2020-09-22", "customer-4", "article-4", -0.10, 1),
            ("2020-08-10", "customer-5", "article-5", 0.25, 2),
            ("2020-09-25", "customer-6", "article-6", 0.35, 2),
        ],
        ["t_dat", "customer_id", "article_id", "price", "sales_channel_id"],
    )

    cleaned, report = process_transactions(
        transactions,
        start_date=date(2020, 9, 1),
        end_date=date(2020, 9, 30),
    )

    assert cleaned.count() == 2
    assert report.input_rows == 7
    assert report.output_rows == 2
    assert report.removed_null_rows == 1
    assert report.removed_duplicate_rows == 1
    assert report.removed_invalid_date_rows == 1
    assert report.removed_invalid_price_rows == 1
    assert report.removed_outside_date_range_rows == 1


def test_schema_validation_rejects_missing_columns(spark) -> None:
    invalid_transactions = spark.createDataFrame(
        [("2020-09-20", "customer-1")],
        ["t_dat", "customer_id"],
    )

    with pytest.raises(
        TransactionValidationError,
        match="missing required columns",
    ):
        validate_transaction_schema(invalid_transactions)
