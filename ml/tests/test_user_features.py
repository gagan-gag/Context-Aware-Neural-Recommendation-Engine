"""
Unit and integration tests for user feature extraction.
Tests RFM calculation, behavioral features, temporal patterns, and full pipeline.
"""

import pytest
from pyspark.sql import DataFrame
from pyspark.sql.functions import col, lit, to_timestamp
from pyspark.sql.types import DoubleType, IntegerType, StringType, StructField, StructType

from ml.data.spark_session import create_local_spark_session
from ml.features.user_features import UserFeatureExtractor


@pytest.fixture(scope="session")
def spark():
    """Create Spark session for tests."""
    spark_session = create_local_spark_session(
        app_name="test-user-features",
        shuffle_partitions=1,
    )
    yield spark_session
    spark_session.stop()


@pytest.fixture
def feature_extractor(spark):
    """Create UserFeatureExtractor instance."""
    return UserFeatureExtractor(spark)


@pytest.fixture
def sample_transactions_df(spark):
    """Create sample transaction data with temporal features."""
    data = [
        ("T001", "2020-01-15", "C001", "A001", 50.0, 1, 2020, 1, 15, 4),
        ("T002", "2020-02-10", "C001", "A002", 75.0, 1, 2020, 2, 10, 2),
        ("T003", "2020-03-20", "C001", "A003", 60.0, 2, 2020, 3, 20, 5),
        ("T004", "2019-06-01", "C002", "A004", 45.0, 1, 2019, 6, 1, 3),
        ("T005", "2019-08-15", "C002", "A005", 55.0, 2, 2019, 8, 15, 1),
        ("T006", "2020-03-10", "C003", "A006", 30.0, 1, 2020, 3, 10, 2),
        ("T007", "2020-01-05", "C004", "A007", 100.0, 1, 2020, 1, 5, 4),
        ("T008", "2020-02-12", "C004", "A008", 120.0, 1, 2020, 2, 12, 3),
        ("T009", "2019-12-20", "C005", "A009", 70.0, 2, 2019, 12, 20, 6),
        ("T010", "2020-01-30", "C005", "A010", 80.0, 2, 2020, 1, 30, 1),
    ]

    schema = StructType([
        StructField("transaction_id", StringType(), True),
        StructField("t_dat", StringType(), True),
        StructField("customer_id", StringType(), True),
        StructField("article_id", StringType(), True),
        StructField("price", DoubleType(), True),
        StructField("sales_channel_id", IntegerType(), True),
        StructField("transaction_year", IntegerType(), True),
        StructField("transaction_month", IntegerType(), True),
        StructField("transaction_day", IntegerType(), True),
        StructField("transaction_dayofweek", IntegerType(), True),
    ])

    df = spark.createDataFrame(data, schema=schema)
    return df.withColumn("transaction_date", to_timestamp(col("t_dat"), "yyyy-MM-dd"))


class TestRFMCalculation:
    """Test RFM feature calculation."""

    def test_rfm_frequency(self, feature_extractor, sample_transactions_df):
        """Test frequency (purchase count) calculation."""
        rfm = feature_extractor.calculate_rfm_features(sample_transactions_df)

        c001 = rfm.filter(col("customer_id") == "C001").collect()[0]
        assert c001["frequency"] == 3

        c003 = rfm.filter(col("customer_id") == "C003").collect()[0]
        assert c003["frequency"] == 1

    def test_rfm_monetary(self, feature_extractor, sample_transactions_df):
        """Test monetary value (total spending) calculation."""
        rfm = feature_extractor.calculate_rfm_features(sample_transactions_df)

        c001 = rfm.filter(col("customer_id") == "C001").collect()[0]
        assert c001["monetary_value"] == 185.0

    def test_rfm_recency(self, feature_extractor, sample_transactions_df):
        """Test recency calculation."""
        rfm = feature_extractor.calculate_rfm_features(sample_transactions_df)
        recency_values = rfm.select("recency_days").collect()
        for row in recency_values:
            assert row["recency_days"] >= 0

    def test_avg_purchase_value(self, feature_extractor, sample_transactions_df):
        """Test average purchase value calculation."""
        rfm = feature_extractor.calculate_rfm_features(sample_transactions_df)

        c001 = rfm.filter(col("customer_id") == "C001").collect()[0]
        expected_avg = 185.0 / 3
        assert abs(c001["avg_purchase_value"] - expected_avg) < 0.1


class TestBehavioralFeatures:
    """Test behavioral feature extraction."""

    def test_total_items_bought(self, feature_extractor, sample_transactions_df):
        """Test total items count."""
        behavioral = feature_extractor.calculate_behavioral_features(sample_transactions_df)

        c001 = behavioral.filter(col("customer_id") == "C001").collect()[0]
        assert c001["total_items_bought"] == 3

    def test_channel_preference_online(self, feature_extractor, sample_transactions_df):
        """Test online purchase counting."""
        behavioral = feature_extractor.calculate_behavioral_features(sample_transactions_df)

        c004 = behavioral.filter(col("customer_id") == "C004").collect()[0]
        assert c004["online_purchases"] == 2
        assert c004["offline_purchases"] == 0

    def test_channel_preference_offline(self, feature_extractor, sample_transactions_df):
        """Test offline purchase counting."""
        behavioral = feature_extractor.calculate_behavioral_features(sample_transactions_df)

        c005 = behavioral.filter(col("customer_id") == "C005").collect()[0]
        assert c005["offline_purchases"] == 2
        assert c005["online_purchases"] == 0

    def test_online_ratio_calculation(self, feature_extractor, sample_transactions_df):
        """Test online ratio (online purchases / total)."""
        behavioral = feature_extractor.calculate_behavioral_features(sample_transactions_df)

        c004 = behavioral.filter(col("customer_id") == "C004").collect()[0]
        assert c004["online_ratio"] == 1.0


class TestTemporalFeatures:
    """Test temporal feature calculation."""

    def test_customer_lifetime_days(self, feature_extractor, sample_transactions_df):
        """Test customer lifetime calculation."""
        temporal = feature_extractor.calculate_temporal_features(sample_transactions_df)

        c001 = temporal.filter(col("customer_id") == "C001").collect()[0]
        assert c001["customer_lifetime_days"] >= 64

    def test_purchase_velocity(self, feature_extractor, sample_transactions_df):
        """Test purchase velocity (purchases per month)."""
        temporal = feature_extractor.calculate_temporal_features(sample_transactions_df)

        c001 = temporal.filter(col("customer_id") == "C001").collect()[0]
        assert c001["purchase_velocity"] > 0

    def test_first_last_purchase_dates(self, feature_extractor, sample_transactions_df):
        """Test first and last purchase date tracking."""
        temporal = feature_extractor.calculate_temporal_features(sample_transactions_df)

        c001 = temporal.filter(col("customer_id") == "C001").collect()[0]
        assert c001["first_purchase_date"] is not None
        assert c001["last_purchase_date"] is not None
        assert c001["first_purchase_date"] <= c001["last_purchase_date"]


class TestFeatureMatrixGeneration:
    """Test complete feature matrix creation."""

    def test_feature_matrix_creation(self, feature_extractor, sample_transactions_df):
        """Test that feature matrix is created."""
        feature_matrix = feature_extractor.create_user_feature_matrix(sample_transactions_df)

        assert feature_matrix is not None
        assert feature_matrix.count() == 5

    def test_feature_matrix_columns(self, feature_extractor, sample_transactions_df):
        """Test that feature matrix has expected columns."""
        feature_matrix = feature_extractor.create_user_feature_matrix(sample_transactions_df)
        columns = feature_matrix.columns

        assert "customer_id" in columns
        assert "frequency" in columns
        assert "monetary_value" in columns
        assert "purchase_velocity" in columns

    def test_feature_matrix_no_nulls(self, feature_extractor, sample_transactions_df):
        """Test that feature matrix has no nulls in numeric fields."""
        feature_matrix = feature_extractor.create_user_feature_matrix(sample_transactions_df)

        numeric_cols = ["frequency", "monetary_value", "total_items_bought"]

        for col_name in numeric_cols:
            null_count = feature_matrix.filter(col(col_name).isNull()).count()
            assert null_count == 0

    def test_feature_matrix_selective_inclusion(self, feature_extractor, sample_transactions_df):
        """Test creating feature matrix with selective feature inclusion."""
        rfm_only = feature_extractor.create_user_feature_matrix(
            sample_transactions_df,
            include_rfm=True,
            include_behavioral=False,
            include_temporal=False,
        )

        assert "frequency" in rfm_only.columns
        assert "purchase_velocity" not in rfm_only.columns

    def test_feature_matrix_customers_preserved(self, feature_extractor, sample_transactions_df):
        """Test that all unique customers are in the feature matrix."""
        expected_customers = sample_transactions_df.select("customer_id").distinct().count()
        feature_matrix = feature_extractor.create_user_feature_matrix(sample_transactions_df)
        actual_customers = feature_matrix.count()

        assert actual_customers == expected_customers


class TestFeatureSchema:
    """Test feature schema definition."""

    def test_get_feature_schema(self, feature_extractor):
        """Test feature schema retrieval."""
        schema = feature_extractor.get_feature_schema()

        assert isinstance(schema, list)
        assert "customer_id" in schema
        assert "frequency" in schema
        assert "monetary_value" in schema
        assert "purchase_velocity" in schema

    def test_schema_contains_all_feature_types(self, feature_extractor):
        """Test schema has RFM, behavioral, and temporal features."""
        schema = feature_extractor.get_feature_schema()

        assert "recency_days" in schema
        assert "frequency" in schema
        assert "monetary_value" in schema
        assert "online_ratio" in schema
        assert "total_items_bought" in schema
        assert "purchase_velocity" in schema
        assert "customer_lifetime_days" in schema


if __name__ == "__main__":
    raise SystemExit(pytest.main([__file__, "-v"]))
