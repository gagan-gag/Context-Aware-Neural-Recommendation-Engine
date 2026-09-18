"""
User feature extraction module for AVERO recommendation system.
Extracts RFM and behavioral features from transaction data using PySpark.
"""

import logging
from typing import List, Optional

from pyspark.sql import DataFrame, SparkSession, Window
from pyspark.sql.functions import (
    avg,
    array_distinct,
    collect_list,
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
    when,
)
from pyspark.sql.types import DoubleType, IntegerType

logger = logging.getLogger(__name__)


class UserFeatureExtractor:
    """
    Extracts RFM and behavioral features from transaction data.
    Creates customer feature vectors for recommendation models.
    """

    def __init__(self, spark: SparkSession):
        """
        Initialize feature extractor with Spark session.

        Args:
            spark: Active SparkSession
        """
        self.spark = spark
        logger.info("UserFeatureExtractor initialized")

    def calculate_rfm_features(self, transactions_df: DataFrame) -> DataFrame:
        """
        Calculate RFM (Recency, Frequency, Monetary) features per customer.

        Args:
            transactions_df: Clean transactions DataFrame with customer_id, price, transaction_date

        Returns:
            DataFrame: Customer RFM features
        """
        logger.info("Calculating RFM features")

        if "transaction_date" not in transactions_df.columns:
            raise ValueError("Transactions must include 'transaction_date' column")

        max_date = (
            transactions_df.agg(spark_max("transaction_date").alias("max_date")).collect()[0]["max_date"]
        )

        rfm_df = transactions_df.groupBy("customer_id").agg(
            datediff(lit(max_date), spark_max("transaction_date")).alias("recency_days"),
            count("transaction_id").alias("frequency"),
            spark_sum("price").alias("monetary_value"),
            avg("price").alias("avg_purchase_value"),
            stddev("price").alias("purchase_std_dev"),
            spark_min("price").alias("min_purchase_value"),
            spark_max("price").alias("max_purchase_value"),
        )

        rfm_df = rfm_df.fillna(0.0, subset=["purchase_std_dev"])
        logger.info(f"RFM features calculated for {rfm_df.count()} customers")
        return rfm_df

    def calculate_behavioral_features(self, transactions_df: DataFrame) -> DataFrame:
        """
        Calculate behavioral features: product diversity, channel preference, temporal patterns.

        Args:
            transactions_df: Clean transactions DataFrame

        Returns:
            DataFrame: Customer behavioral features
        """
        logger.info("Calculating behavioral features")

        behavioral_df = transactions_df.groupBy("customer_id").agg(
            count(col("article_id")).alias("total_items_bought"),
            countDistinct(col("article_id")).alias("unique_articles_bought"),
            spark_sum(when(col("sales_channel_id") == 1, 1).otherwise(0)).alias("online_purchases"),
            spark_sum(when(col("sales_channel_id") == 2, 1).otherwise(0)).alias("offline_purchases"),
        )

        behavioral_df = behavioral_df.withColumn(
            "online_ratio",
            when(col("total_items_bought") > 0, col("online_purchases") / col("total_items_bought")).otherwise(0.0),
        )

        logger.info(f"Behavioral features calculated for {behavioral_df.count()} customers")
        return behavioral_df

    def calculate_temporal_features(self, transactions_df: DataFrame) -> DataFrame:
        """
        Calculate temporal features: lifetime, velocity, seasonal patterns.

        Args:
            transactions_df: Clean transactions DataFrame with transaction_date, transaction_month, transaction_dayofweek

        Returns:
            DataFrame: Customer temporal features
        """
        logger.info("Calculating temporal features")

        date_range_df = transactions_df.groupBy("customer_id").agg(
            spark_min("transaction_date").alias("first_purchase_date"),
            spark_max("transaction_date").alias("last_purchase_date"),
            datediff(spark_max("transaction_date"), spark_min("transaction_date")).alias("customer_lifetime_days"),
            count("transaction_id").alias("total_transactions"),
        )

        temporal_df = date_range_df.withColumn(
            "purchase_velocity",
            when(col("customer_lifetime_days") > 0, col("total_transactions") / (col("customer_lifetime_days") / 30.0)).otherwise(col("total_transactions")),
        )

        seasonal_df = transactions_df.groupBy("customer_id").agg(
            avg("transaction_month").alias("avg_purchase_month"),
            stddev("transaction_month").alias("month_std_dev"),
            avg("transaction_dayofweek").alias("avg_purchase_dayofweek"),
        )

        seasonal_df = seasonal_df.fillna(0.0, subset=["month_std_dev"])

        temporal_features = temporal_df.join(seasonal_df, on="customer_id", how="inner")

        logger.info(f"Temporal features calculated for {temporal_features.count()} customers")
        return temporal_features

    def create_user_feature_matrix(
        self,
        transactions_df: DataFrame,
        include_rfm: bool = True,
        include_behavioral: bool = True,
        include_temporal: bool = True,
    ) -> DataFrame:
        """
        Create complete user feature matrix by joining RFM, behavioral, and temporal features.

        Args:
            transactions_df: Clean transaction data
            include_rfm: Whether to include RFM features
            include_behavioral: Whether to include behavioral features
            include_temporal: Whether to include temporal features

        Returns:
            DataFrame: Complete feature matrix per customer
        """
        logger.info("Creating user feature matrix")

        feature_matrix = transactions_df.select("customer_id").distinct()

        if include_rfm:
            rfm_df = self.calculate_rfm_features(transactions_df)
            feature_matrix = feature_matrix.join(rfm_df, on="customer_id", how="left")

        if include_behavioral:
            behavioral_df = self.calculate_behavioral_features(transactions_df)
            feature_matrix = feature_matrix.join(behavioral_df, on="customer_id", how="left")

        if include_temporal:
            temporal_df = self.calculate_temporal_features(transactions_df)
            feature_matrix = feature_matrix.join(temporal_df, on="customer_id", how="left")

        numeric_cols = [
            field.name
            for field in feature_matrix.schema.fields
            if field.dataType in [IntegerType(), DoubleType()]
        ]
        feature_matrix = feature_matrix.fillna(0.0, subset=numeric_cols)

        logger.info(
            f"Feature matrix created: {feature_matrix.count()} customers, {len(feature_matrix.columns)} features"
        )

        return feature_matrix

    def get_feature_schema(self) -> List[str]:
        """
        Get list of all feature column names.

        Returns:
            list: Feature column names
        """
        return [
            "customer_id",
            "recency_days",
            "frequency",
            "monetary_value",
            "avg_purchase_value",
            "purchase_std_dev",
            "min_purchase_value",
            "max_purchase_value",
            "total_items_bought",
            "unique_articles_bought",
            "online_purchases",
            "offline_purchases",
            "online_ratio",
            "first_purchase_date",
            "last_purchase_date",
            "customer_lifetime_days",
            "total_transactions",
            "purchase_velocity",
            "avg_purchase_month",
            "month_std_dev",
            "avg_purchase_dayofweek",
        ]

    def normalize_features(self, feature_matrix: DataFrame) -> DataFrame:
        """
        Normalize numerical features to 0-1 range using min-max scaling.

        Args:
            feature_matrix: Feature matrix DataFrame

        Returns:
            DataFrame: Normalized feature matrix
        """
        logger.info("Normalizing features")

        from pyspark.ml.feature import MinMaxScaler, VectorAssembler

        numeric_cols = [
            "recency_days",
            "frequency",
            "monetary_value",
            "avg_purchase_value",
            "purchase_std_dev",
            "min_purchase_value",
            "max_purchase_value",
            "total_items_bought",
            "unique_articles_bought",
            "online_purchases",
            "offline_purchases",
            "online_ratio",
            "customer_lifetime_days",
            "total_transactions",
            "purchase_velocity",
            "avg_purchase_month",
            "month_std_dev",
            "avg_purchase_dayofweek",
        ]

        existing_cols = [col_name for col_name in numeric_cols if col_name in feature_matrix.columns]

        if not existing_cols:
            logger.warning("No numeric columns found to normalize")
            return feature_matrix

        assembler = VectorAssembler(inputCols=existing_cols, outputCol="features")
        assembled = assembler.transform(feature_matrix)

        scaler = MinMaxScaler(inputCol="features", outputCol="scaled_features")
        scaler.fit(assembled).transform(assembled)

        logger.info("Features normalized successfully")
        return feature_matrix


def extract_user_features_job(
    spark: SparkSession,
    transactions_df: DataFrame,
    output_path: Optional[str] = None,
) -> DataFrame:
    """
    Standalone job for user feature extraction.
    Used in Airflow pipelines.

    Args:
        spark: SparkSession
        transactions_df: Processed transactions DataFrame
        output_path: Optional path to save features as parquet

    Returns:
        DataFrame: User feature matrix
    """
    extractor = UserFeatureExtractor(spark)
    feature_matrix = extractor.create_user_feature_matrix(transactions_df)

    if output_path:
        feature_matrix.write.mode("overwrite").parquet(output_path)
        logger.info(f"User features saved to {output_path}")

    return feature_matrix


if __name__ == "__main__":
    spark = (
        SparkSession.builder.appName("UserFeatureExtraction")
        .master("local[1]")
        .config("spark.sql.shuffle.partitions", "1")
        .config("spark.driver.host", "127.0.0.1")
        .config("spark.driver.bindAddress", "127.0.0.1")
        .getOrCreate()
    )

    extractor = UserFeatureExtractor(spark)
    print("UserFeatureExtractor initialized and ready")
    print(f"Features: {extractor.get_feature_schema()}")
    spark.stop()
