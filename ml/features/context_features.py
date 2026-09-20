"""
Context feature extraction module for AVERO recommendation system.
Extracts temporal, sequential, and interaction context from transaction data using PySpark.
"""

from typing import List, Optional

from pyspark.sql import DataFrame, SparkSession, Window
from pyspark.sql.functions import (
    array_distinct,
    avg,
    col,
    collect_list,
    count,
    datediff,
    dayofweek,
    hour,
    lag,
    month,
    quarter,
    row_number,
    size,
    sum as spark_sum,
    when,
    year,
)
from pyspark.sql.types import DoubleType, IntegerType
import logging

logger = logging.getLogger(__name__)


class ContextFeatureExtractor:
    """
    Extracts temporal, sequential, and interaction context features from transaction data.
    Creates rich context vectors for sequence-aware recommendation models.
    """

    def __init__(self, spark: SparkSession):
        """
        Initialize context feature extractor with Spark session.

        Args:
            spark: Active SparkSession
        """
        self.spark = spark
        logger.info("ContextFeatureExtractor initialized")

    def extract_temporal_context(self, transactions_df: DataFrame) -> DataFrame:
        """
        Extract time-based context: hour, day of week, season, holiday indicators.

        Args:
            transactions_df: Clean transactions DataFrame with transaction_date

        Returns:
            DataFrame: Transaction-level temporal context
        """
        logger.info("Extracting temporal context features")

        temporal_df = transactions_df
        if "transaction_year" not in temporal_df.columns:
            temporal_df = temporal_df.withColumn("transaction_year", year(col("transaction_date")))
        if "transaction_month" not in temporal_df.columns:
            temporal_df = temporal_df.withColumn("transaction_month", month(col("transaction_date")))
        if "transaction_dayofweek" not in temporal_df.columns:
            temporal_df = temporal_df.withColumn("transaction_dayofweek", dayofweek(col("transaction_date")))
        if "transaction_day" not in temporal_df.columns:
            temporal_df = temporal_df.withColumn(
                "transaction_day",
                col("transaction_date").cast("string").substr(9, 2).cast("int"),
            )
        if "transaction_hour" not in temporal_df.columns:
            temporal_df = temporal_df.withColumn("transaction_hour", hour(col("transaction_date")))

        temporal_df = temporal_df.select(
            "transaction_id",
            "customer_id",
            "article_id",
            "transaction_date",
            "transaction_year",
            "transaction_month",
            "transaction_dayofweek",
            "transaction_day",
            "transaction_hour",
        )

        temporal_df = temporal_df.withColumn(
            "hour_of_day",
            when(col("transaction_hour").isNotNull(), col("transaction_hour")).otherwise(0),
        )

        temporal_df = temporal_df.withColumn(
            "is_weekend",
            when(col("transaction_dayofweek").isin([6, 7]), 1).otherwise(0),
        )

        temporal_df = temporal_df.withColumn(
            "quarter",
            when(col("transaction_month").isin([1, 2, 3]), 1)
            .when(col("transaction_month").isin([4, 5, 6]), 2)
            .when(col("transaction_month").isin([7, 8, 9]), 3)
            .otherwise(4),
        )

        temporal_df = temporal_df.withColumn(
            "is_holiday_season",
            when(col("transaction_month").isin([11, 12]), 1).otherwise(0),
        )

        temporal_df = temporal_df.withColumn(
            "season",
            when(col("quarter") == 1, "Winter")
            .when(col("quarter") == 2, "Spring")
            .when(col("quarter") == 3, "Summer")
            .otherwise("Fall"),
        )

        logger.info(f"Temporal context extracted for {temporal_df.count()} transactions")
        return temporal_df

    def extract_sequential_context(self, transactions_df: DataFrame) -> DataFrame:
        """
        Extract sequential context: time since last purchase, previous items, purchase streaks.

        Args:
            transactions_df: Clean transactions DataFrame with transaction_date

        Returns:
            DataFrame: Transaction-level sequential context per customer
        """
        logger.info("Extracting sequential context features")

        window_spec = Window.partitionBy("customer_id").orderBy(col("transaction_date"))

        sequential_df = transactions_df.select(
            "transaction_id",
            "customer_id",
            "article_id",
            "transaction_date",
            "price",
        ).withColumn("row_num", row_number().over(window_spec))

        sequential_df = sequential_df.withColumn(
            "prev_purchase_date",
            lag("transaction_date").over(window_spec),
        )

        sequential_df = sequential_df.withColumn(
            "days_since_last_purchase",
            when(col("prev_purchase_date").isNotNull(), datediff(col("transaction_date"), col("prev_purchase_date"))).otherwise(0),
        )

        sequential_df = sequential_df.withColumn(
            "prev_article_id",
            lag("article_id").over(window_spec),
        )

        sequential_df = sequential_df.withColumn(
            "prev_price",
            lag("price").over(window_spec),
        )

        sequential_df = sequential_df.withColumn(
            "in_streak",
            when(col("days_since_last_purchase") <= 30, 1).otherwise(0),
        )

        sequential_df = sequential_df.withColumn(
            "streak_count",
            spark_sum(when(col("days_since_last_purchase") > 30, 1).otherwise(0)).over(
                Window.partitionBy("customer_id").orderBy("transaction_date")
            ),
        )

        logger.info(f"Sequential context extracted for {sequential_df.count()} transactions")
        return sequential_df.drop("row_num", "prev_purchase_date")

    def extract_interaction_context(
        self,
        transactions_df: DataFrame,
        user_features_df: DataFrame,
        item_features_df: DataFrame,
    ) -> DataFrame:
        """
        Extract interaction context: price alignment, customer tier, affinity scores.

        Args:
            transactions_df: Clean transactions DataFrame
            user_features_df: User feature matrix with avg_purchase_value
            item_features_df: Item feature matrix with avg_price

        Returns:
            DataFrame: Transaction-level interaction context
        """
        logger.info("Extracting interaction context features")

        user_context = user_features_df.select(
            col("customer_id"),
            col("avg_purchase_value").alias("user_avg_spend"),
            col("monetary_value").alias("user_total_spend"),
            col("frequency").alias("user_purchase_frequency"),
        )

        item_context = item_features_df.select(
            col("article_id"),
            col("avg_price").alias("item_avg_price"),
            col("total_purchases").alias("item_popularity"),
            col("price_volatility").alias("item_price_volatility"),
        )

        interaction_df = transactions_df.select(
            "transaction_id",
            "customer_id",
            "article_id",
            "price",
        ).join(user_context, on="customer_id", how="left").join(item_context, on="article_id", how="left")

        interaction_df = interaction_df.withColumn(
            "price_alignment_score",
            when(col("user_avg_spend") > 0, col("price") / col("user_avg_spend")).otherwise(1.0),
        )

        interaction_df = interaction_df.withColumn(
            "price_surprise_score",
            when(col("item_avg_price") > 0, (col("price") - col("item_avg_price")) / col("item_avg_price")).otherwise(0.0),
        )

        interaction_df = interaction_df.withColumn(
            "customer_tier",
            when(col("user_total_spend") >= 500, "Gold")
            .when(col("user_total_spend") >= 200, "Silver")
            .when(col("user_total_spend") >= 50, "Bronze")
            .otherwise("New"),
        )

        interaction_df = interaction_df.withColumn(
            "item_affinity_score",
            when(col("user_purchase_frequency") > 0, col("item_popularity") / col("user_purchase_frequency")).otherwise(col("item_popularity")),
        )

        logger.info(f"Interaction context extracted for {interaction_df.count()} transactions")
        return interaction_df

    def extract_market_basket_context(self, transactions_df: DataFrame) -> DataFrame:
        """
        Extract market basket features: co-purchase patterns, category affinity.

        Args:
            transactions_df: Clean transactions DataFrame with article_id

        Returns:
            DataFrame: Customer-level basket composition features
        """
        logger.info("Extracting market basket context features")

        basket_df = transactions_df.groupBy("customer_id").agg(
            collect_list("article_id").alias("purchased_items"),
            count("article_id").alias("basket_size"),
            count(col("article_id")).cast(DoubleType()).alias("basket_count_float"),
        )

        basket_df = basket_df.withColumn(
            "unique_items",
            size(array_distinct(col("purchased_items"))),
        )

        basket_df = basket_df.withColumn(
            "product_diversity_score",
            when(col("basket_count_float") > 0, col("unique_items") / col("basket_count_float")).otherwise(0.0),
        )

        basket_df = basket_df.withColumn(
            "repeat_purchase_ratio",
            when(col("basket_count_float") > 0, 1.0 - (col("unique_items") / col("basket_count_float"))).otherwise(0.0),
        )

        logger.info(f"Market basket context extracted for {basket_df.count()} customers")
        return basket_df.drop("basket_count_float")

    def create_context_feature_matrix(
        self,
        transactions_df: DataFrame,
        user_features_df: Optional[DataFrame] = None,
        item_features_df: Optional[DataFrame] = None,
        include_temporal: bool = True,
        include_sequential: bool = True,
        include_interaction: bool = True,
        include_basket: bool = True,
    ) -> DataFrame:
        """
        Create complete context feature matrix by joining all context types.

        Args:
            transactions_df: Clean transaction data
            user_features_df: User feature matrix (optional for interaction context)
            item_features_df: Item feature matrix (optional for interaction context)
            include_temporal: Whether to include temporal context
            include_sequential: Whether to include sequential context
            include_interaction: Whether to include interaction context
            include_basket: Whether to include basket context

        Returns:
            DataFrame: Complete context feature matrix per transaction (+ user basket features)
        """
        logger.info("Creating context feature matrix")

        feature_matrix = transactions_df.select(
            "transaction_id",
            "customer_id",
            "article_id",
            "transaction_date",
        )

        if include_temporal:
            temporal_df = self.extract_temporal_context(transactions_df)
            temporal_context = temporal_df.select(
                "transaction_id",
                "hour_of_day",
                "is_weekend",
                "quarter",
                "is_holiday_season",
                "season",
            )
            feature_matrix = feature_matrix.join(temporal_context, on="transaction_id", how="left")

        if include_sequential:
            sequential_df = self.extract_sequential_context(transactions_df)
            sequential_context = sequential_df.select(
                "transaction_id",
                "days_since_last_purchase",
                "prev_article_id",
                "prev_price",
                "in_streak",
                "streak_count",
            )
            feature_matrix = feature_matrix.join(sequential_context, on="transaction_id", how="left")

        if include_interaction and user_features_df is not None and item_features_df is not None:
            interaction_df = self.extract_interaction_context(
                transactions_df,
                user_features_df,
                item_features_df,
            )
            interaction_context = interaction_df.select(
                "transaction_id",
                "price_alignment_score",
                "price_surprise_score",
                "customer_tier",
                "item_affinity_score",
            )
            feature_matrix = feature_matrix.join(interaction_context, on="transaction_id", how="left")

        if include_basket:
            basket_df = self.extract_market_basket_context(transactions_df)
            basket_context = basket_df.select(
                "customer_id",
                "basket_size",
                "unique_items",
                "product_diversity_score",
                "repeat_purchase_ratio",
            )
            feature_matrix = feature_matrix.join(basket_context, on="customer_id", how="left")

        numeric_cols = [
            field.name
            for field in feature_matrix.schema.fields
            if field.dataType in [IntegerType(), DoubleType()]
        ]
        feature_matrix = feature_matrix.fillna(0.0, subset=numeric_cols)

        logger.info(
            f"Context feature matrix created: {feature_matrix.count()} transactions, {len(feature_matrix.columns)} features"
        )

        return feature_matrix

    def get_feature_schema(self) -> List[str]:
        """
        Get list of all context feature column names.

        Returns:
            list: Feature column names
        """
        return [
            "transaction_id",
            "customer_id",
            "article_id",
            "transaction_date",
            "hour_of_day",
            "is_weekend",
            "quarter",
            "is_holiday_season",
            "season",
            "days_since_last_purchase",
            "prev_article_id",
            "prev_price",
            "in_streak",
            "streak_count",
            "price_alignment_score",
            "price_surprise_score",
            "customer_tier",
            "item_affinity_score",
            "basket_size",
            "unique_items",
            "product_diversity_score",
            "repeat_purchase_ratio",
        ]


def extract_context_features_job(
    spark: SparkSession,
    transactions_df: DataFrame,
    user_features_df: Optional[DataFrame] = None,
    item_features_df: Optional[DataFrame] = None,
    output_path: Optional[str] = None,
) -> DataFrame:
    """
    Standalone job for context feature extraction.
    Used in Airflow pipelines.

    Args:
        spark: SparkSession
        transactions_df: Processed transactions DataFrame
        user_features_df: User feature matrix (optional)
        item_features_df: Item feature matrix (optional)
        output_path: Optional path to save features as parquet

    Returns:
        DataFrame: Context feature matrix
    """
    extractor = ContextFeatureExtractor(spark)
    feature_matrix = extractor.create_context_feature_matrix(
        transactions_df,
        user_features_df=user_features_df,
        item_features_df=item_features_df,
    )

    if output_path:
        feature_matrix.write.mode("overwrite").parquet(output_path)
        logger.info(f"Context features saved to {output_path}")

    return feature_matrix


if __name__ == "__main__":
    spark = (
        SparkSession.builder.appName("ContextFeatureExtraction")
        .master("local[1]")
        .config("spark.sql.shuffle.partitions", "1")
        .config("spark.driver.host", "127.0.0.1")
        .config("spark.driver.bindAddress", "127.0.0.1")
        .getOrCreate()
    )

    extractor = ContextFeatureExtractor(spark)
    print("ContextFeatureExtractor initialized and ready")
    print(f"Features: {extractor.get_feature_schema()}")

    spark.stop()
