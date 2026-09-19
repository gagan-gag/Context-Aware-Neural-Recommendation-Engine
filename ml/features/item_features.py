"""
Item feature extraction module for AVERO recommendation system.
Extracts popularity, pricing, and temporal features from transaction data using PySpark.
"""

import logging
from typing import List, Optional

from pyspark.sql import DataFrame, SparkSession, Window
from pyspark.sql.functions import (
    avg,
    col,
    count,
    countDistinct,
    current_date,
    datediff,
    dense_rank,
    explode_outer,
    lit,
    max as spark_max,
    min as spark_min,
    percent_rank,
    rank,
    row_number,
    stddev,
    sum as spark_sum,
    variance,
    when,
)
from pyspark.sql.types import DoubleType, IntegerType

logger = logging.getLogger(__name__)


class ItemFeatureExtractor:
    """
    Extracts popularity, pricing, and temporal features from transaction data.
    Creates item feature vectors for recommendation models.
    """

    def __init__(self, spark: SparkSession):
        """
        Initialize item feature extractor with Spark session.

        Args:
            spark: Active SparkSession
        """
        self.spark = spark
        logger.info("ItemFeatureExtractor initialized")

    def calculate_popularity_features(self, transactions_df: DataFrame) -> DataFrame:
        """
        Calculate popularity metrics: purchase count, unique customers, freshness.

        Args:
            transactions_df: Clean transactions DataFrame

        Returns:
            DataFrame: Item popularity features
        """
        logger.info("Calculating popularity features")

        if "transaction_date" not in transactions_df.columns:
            raise ValueError("Transactions must include 'transaction_date' column")

        max_date = (
            transactions_df.agg(spark_max("transaction_date").alias("max_date")).collect()[0]["max_date"]
        )

        popularity_df = transactions_df.groupBy("article_id").agg(
            count("transaction_id").alias("total_purchases"),
            countDistinct("customer_id").alias("unique_customers"),
            datediff(lit(max_date), spark_max("transaction_date")).alias("days_since_purchase"),
            count("customer_id").alias("purchase_count"),
            spark_sum(when(col("sales_channel_id") == 1, 1).otherwise(0)).alias("online_purchases"),
            spark_sum(when(col("sales_channel_id") == 2, 1).otherwise(0)).alias("offline_purchases"),
        )

        total_purchases = transactions_df.groupBy("article_id").agg(count("transaction_id").alias("item_total_purchases"))
        total_transactions = transactions_df.count()
        popularity_df = popularity_df.join(total_purchases, on="article_id", how="left")
        popularity_df = popularity_df.withColumn(
            "popularity_score",
            when(col("item_total_purchases") > 0, (col("item_total_purchases") / total_transactions) * 100).otherwise(0.0),
        ).drop("item_total_purchases")

        logger.info(f"Popularity features calculated for {popularity_df.count()} items")
        return popularity_df

    def calculate_pricing_features(self, transactions_df: DataFrame) -> DataFrame:
        """
        Calculate pricing metrics: average, variance, range, volatility.

        Args:
            transactions_df: Clean transactions DataFrame with price column

        Returns:
            DataFrame: Item pricing features
        """
        logger.info("Calculating pricing features")

        pricing_df = transactions_df.groupBy("article_id").agg(
            avg("price").alias("avg_price"),
            spark_min("price").alias("min_price"),
            spark_max("price").alias("max_price"),
            stddev("price").alias("price_std_dev"),
            variance("price").alias("price_variance"),
            (spark_max("price") - spark_min("price")).alias("price_range"),
        )

        pricing_df = pricing_df.fillna(0.0, subset=["price_std_dev", "price_variance"])

        pricing_df = pricing_df.withColumn(
            "price_volatility",
            when(col("avg_price") > 0, col("price_std_dev") / col("avg_price")).otherwise(0.0),
        )

        logger.info(f"Pricing features calculated for {pricing_df.count()} items")
        return pricing_df

    def calculate_temporal_features(self, transactions_df: DataFrame) -> DataFrame:
        """
        Calculate temporal features: seasonal demand, trends, peak seasons.

        Args:
            transactions_df: Clean transactions DataFrame with temporal columns

        Returns:
            DataFrame: Item temporal features
        """
        logger.info("Calculating temporal features")

        seasonal_df = transactions_df.groupBy("article_id").agg(
            avg("transaction_month").alias("avg_purchase_month"),
            stddev("transaction_month").alias("month_std_dev"),
            avg("transaction_dayofweek").alias("avg_purchase_dayofweek"),
            stddev("transaction_dayofweek").alias("dayofweek_std_dev"),
        )

        seasonal_df = seasonal_df.fillna(0.0, subset=["month_std_dev", "dayofweek_std_dev"])

        monthly_counts = transactions_df.groupBy("article_id", "transaction_month").agg(
            count("transaction_id").alias("count_by_month")
        )
        window_spec = Window.partitionBy("article_id").orderBy(col("count_by_month").desc())
        peak_season = (
            monthly_counts.withColumn("rn", row_number().over(window_spec))
            .filter(col("rn") == 1)
            .select("article_id", "transaction_month")
            .withColumnRenamed("transaction_month", "peak_season_month")
        )

        date_range_df = transactions_df.groupBy("article_id").agg(
            spark_min("transaction_date").alias("first_sold_date"),
            spark_max("transaction_date").alias("last_sold_date"),
            datediff(spark_max("transaction_date"), spark_min("transaction_date")).alias("item_lifetime_days"),
        )

        temporal_df = date_range_df.join(seasonal_df, on="article_id", how="left").join(
            peak_season, on="article_id", how="left"
        )

        logger.info(f"Temporal features calculated for {temporal_df.count()} items")
        return temporal_df

    def calculate_customer_concentration(self, transactions_df: DataFrame) -> DataFrame:
        """
        Calculate customer concentration: HHI index, top customer contribution.

        Args:
            transactions_df: Clean transactions DataFrame

        Returns:
            DataFrame: Customer concentration metrics
        """
        logger.info("Calculating customer concentration features")

        customer_item_purchases = transactions_df.groupBy("article_id", "customer_id").agg(
            count("transaction_id").alias("customer_purchases")
        )

        item_totals = transactions_df.groupBy("article_id").agg(
            count("transaction_id").alias("total_purchases")
        )

        concentration_df = customer_item_purchases.join(item_totals, on="article_id", how="left")
        concentration_df = concentration_df.withColumn(
            "customer_market_share",
            col("customer_purchases") / col("total_purchases"),
        )

        hhi_df = concentration_df.groupBy("article_id").agg(
            spark_sum(col("customer_market_share") ** 2).alias("hhi_index"),
            count("customer_id").alias("unique_buyers"),
            spark_max("customer_market_share").alias("top_customer_share"),
        )

        logger.info(f"Customer concentration calculated for {hhi_df.count()} items")
        return hhi_df

    def create_item_feature_matrix(
        self,
        transactions_df: DataFrame,
        include_popularity: bool = True,
        include_pricing: bool = True,
        include_temporal: bool = True,
        include_concentration: bool = True,
    ) -> DataFrame:
        """
        Create complete item feature matrix by joining all feature types.

        Args:
            transactions_df: Clean transaction data
            include_popularity: Whether to include popularity features
            include_pricing: Whether to include pricing features
            include_temporal: Whether to include temporal features
            include_concentration: Whether to include concentration features

        Returns:
            DataFrame: Complete feature matrix per item
        """
        logger.info("Creating item feature matrix")

        feature_matrix = transactions_df.select("article_id").distinct()

        if include_popularity:
            popularity_df = self.calculate_popularity_features(transactions_df)
            feature_matrix = feature_matrix.join(popularity_df, on="article_id", how="left")

        if include_pricing:
            pricing_df = self.calculate_pricing_features(transactions_df)
            feature_matrix = feature_matrix.join(pricing_df, on="article_id", how="left")

        if include_temporal:
            temporal_df = self.calculate_temporal_features(transactions_df)
            feature_matrix = feature_matrix.join(temporal_df, on="article_id", how="left")

        if include_concentration:
            concentration_df = self.calculate_customer_concentration(transactions_df)
            feature_matrix = feature_matrix.join(concentration_df, on="article_id", how="left")

        numeric_cols = [
            field.name
            for field in feature_matrix.schema.fields
            if field.dataType in [IntegerType(), DoubleType()]
        ]
        feature_matrix = feature_matrix.fillna(0.0, subset=numeric_cols)

        logger.info(
            f"Item feature matrix created: {feature_matrix.count()} items, {len(feature_matrix.columns)} features"
        )

        return feature_matrix

    def get_feature_schema(self) -> List[str]:
        """
        Get list of all item feature column names.

        Returns:
            list: Feature column names
        """
        return [
            "article_id",
            "total_purchases",
            "unique_customers",
            "days_since_purchase",
            "purchase_count",
            "online_purchases",
            "offline_purchases",
            "popularity_score",
            "avg_price",
            "min_price",
            "max_price",
            "price_std_dev",
            "price_variance",
            "price_range",
            "price_volatility",
            "first_sold_date",
            "last_sold_date",
            "item_lifetime_days",
            "avg_purchase_month",
            "month_std_dev",
            "avg_purchase_dayofweek",
            "dayofweek_std_dev",
            "peak_season_month",
            "hhi_index",
            "unique_buyers",
            "top_customer_share",
        ]


def extract_item_features_job(
    spark: SparkSession,
    transactions_df: DataFrame,
    output_path: Optional[str] = None,
) -> DataFrame:
    """
    Standalone job for item feature extraction.
    Used in Airflow pipelines.

    Args:
        spark: SparkSession
        transactions_df: Processed transactions DataFrame
        output_path: Optional path to save features as parquet

    Returns:
        DataFrame: Item feature matrix
    """
    extractor = ItemFeatureExtractor(spark)
    feature_matrix = extractor.create_item_feature_matrix(transactions_df)

    if output_path:
        feature_matrix.write.mode("overwrite").parquet(output_path)
        logger.info(f"Item features saved to {output_path}")

    return feature_matrix


if __name__ == "__main__":
    spark = (
        SparkSession.builder.appName("ItemFeatureExtraction")
        .master("local[1]")
        .config("spark.sql.shuffle.partitions", "1")
        .config("spark.driver.host", "127.0.0.1")
        .config("spark.driver.bindAddress", "127.0.0.1")
        .getOrCreate()
    )

    extractor = ItemFeatureExtractor(spark)
    print("ItemFeatureExtractor initialized and ready")
    print(f"Features: {extractor.get_feature_schema()}")

    spark.stop()
