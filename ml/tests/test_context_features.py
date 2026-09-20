"""
Unit and integration tests for context feature extraction.
Tests temporal, sequential, interaction, and market basket features.
"""

import pytest
from pyspark.sql import DataFrame, SparkSession
from pyspark.sql.functions import col, lit, to_timestamp
from pyspark.sql.types import DoubleType, IntegerType, StringType, StructField, StructType

from ml.data.spark_session import create_local_spark_session
from ml.features.context_features import ContextFeatureExtractor


@pytest.fixture(scope="session")
def spark():
    """Create Spark session for tests."""
    spark_session = create_local_spark_session(app_name="test-context-features", shuffle_partitions=1)
    yield spark_session
    spark_session.stop()


@pytest.fixture
def feature_extractor(spark):
    """Create ContextFeatureExtractor instance."""
    return ContextFeatureExtractor(spark)


@pytest.fixture
def sample_transactions_df(spark):
    """Create sample transaction data with temporal features."""
    data = [
        ("T001", "2020-01-15", "C001", "A001", 50.0, 1, 2020, 1, 15, 4),
        ("T002", "2020-01-20", "C001", "A002", 55.0, 1, 2020, 1, 20, 2),
        ("T003", "2020-02-10", "C001", "A003", 60.0, 1, 2020, 2, 10, 2),
        ("T004", "2020-11-28", "C002", "A004", 100.0, 2, 2020, 11, 28, 7),
        ("T005", "2020-12-05", "C002", "A005", 120.0, 1, 2020, 12, 5, 7),
        ("T006", "2020-03-10", "C003", "A006", 30.0, 1, 2020, 3, 10, 2),
        ("T007", "2020-08-15", "C003", "A007", 35.0, 2, 2020, 8, 15, 7),
        ("T008", "2020-01-05", "C004", "A001", 50.0, 1, 2020, 1, 5, 1),
        ("T009", "2020-01-08", "C004", "A002", 55.0, 1, 2020, 1, 8, 4),
        ("T010", "2020-01-12", "C004", "A003", 60.0, 1, 2020, 1, 12, 1),
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


@pytest.fixture
def sample_user_features_df(spark):
    """Create sample user features."""
    data = [
        ("C001", 55.0, 165.0, 3),
        ("C002", 110.0, 220.0, 2),
        ("C003", 32.5, 65.0, 2),
        ("C004", 55.0, 165.0, 3),
    ]

    schema = StructType([
        StructField("customer_id", StringType(), True),
        StructField("avg_purchase_value", DoubleType(), True),
        StructField("monetary_value", DoubleType(), True),
        StructField("frequency", IntegerType(), True),
    ])

    return spark.createDataFrame(data, schema=schema)


@pytest.fixture
def sample_item_features_df(spark):
    """Create sample item features."""
    data = [
        ("A001", 50.0, 10, 0.1),
        ("A002", 55.0, 8, 0.15),
        ("A003", 60.0, 5, 0.2),
        ("A004", 100.0, 3, 0.25),
        ("A005", 120.0, 2, 0.3),
        ("A006", 30.0, 4, 0.1),
        ("A007", 35.0, 2, 0.15),
    ]

    schema = StructType([
        StructField("article_id", StringType(), True),
        StructField("avg_price", DoubleType(), True),
        StructField("total_purchases", IntegerType(), True),
        StructField("price_volatility", DoubleType(), True),
    ])

    return spark.createDataFrame(data, schema=schema)


class TestTemporalContext:
    """Test temporal context extraction."""

    def test_is_weekend_detection(self, feature_extractor, sample_transactions_df):
        """Test weekend vs weekday detection."""
        temporal = feature_extractor.extract_temporal_context(sample_transactions_df)

        t004 = temporal.filter(col("transaction_id") == "T004").collect()[0]
        assert t004["is_weekend"] == 1

        t001 = temporal.filter(col("transaction_id") == "T001").collect()[0]
        assert t001["is_weekend"] == 0

    def test_holiday_season_detection(self, feature_extractor, sample_transactions_df):
        """Test holiday season (Nov-Dec) detection."""
        temporal = feature_extractor.extract_temporal_context(sample_transactions_df)

        t004 = temporal.filter(col("transaction_id") == "T004").collect()[0]
        assert t004["is_holiday_season"] == 1

        t001 = temporal.filter(col("transaction_id") == "T001").collect()[0]
        assert t001["is_holiday_season"] == 0

    def test_quarter_extraction(self, feature_extractor, sample_transactions_df):
        """Test quarter extraction."""
        temporal = feature_extractor.extract_temporal_context(sample_transactions_df)

        t001 = temporal.filter(col("transaction_id") == "T001").collect()[0]
        assert t001["quarter"] == 1

        t004 = temporal.filter(col("transaction_id") == "T004").collect()[0]
        assert t004["quarter"] == 4

    def test_season_extraction(self, feature_extractor, sample_transactions_df):
        """Test season assignment."""
        temporal = feature_extractor.extract_temporal_context(sample_transactions_df)
        seasons = temporal.select("season", "transaction_month").distinct().collect()
        assert len(seasons) > 0

        for row in seasons:
            assert row["season"] in ["Winter", "Spring", "Summer", "Fall"]


class TestSequentialContext:
    """Test sequential context extraction."""

    def test_days_since_last_purchase(self, feature_extractor, sample_transactions_df):
        """Test days since last purchase calculation."""
        sequential = feature_extractor.extract_sequential_context(sample_transactions_df)

        t001 = sequential.filter(col("transaction_id") == "T001").collect()[0]
        assert t001["days_since_last_purchase"] == 0

        t002 = sequential.filter(col("transaction_id") == "T002").collect()[0]
        assert t002["days_since_last_purchase"] == 5

    def test_previous_item_tracking(self, feature_extractor, sample_transactions_df):
        """Test previous item ID tracking."""
        sequential = feature_extractor.extract_sequential_context(sample_transactions_df)

        t001 = sequential.filter(col("transaction_id") == "T001").collect()[0]
        assert t001["prev_article_id"] is None

        t002 = sequential.filter(col("transaction_id") == "T002").collect()[0]
        assert t002["prev_article_id"] == "A001"

    def test_purchase_streak_detection(self, feature_extractor, sample_transactions_df):
        """Test purchase streak within 30 days."""
        sequential = feature_extractor.extract_sequential_context(sample_transactions_df)

        t009 = sequential.filter(col("transaction_id") == "T009").collect()[0]
        assert t009["in_streak"] == 1

        t007 = sequential.filter(col("transaction_id") == "T007").collect()[0]
        assert t007["in_streak"] == 0


class TestInteractionContext:
    """Test interaction context extraction."""

    def test_price_alignment_score(
        self,
        feature_extractor,
        sample_transactions_df,
        sample_user_features_df,
        sample_item_features_df,
    ):
        """Test price alignment (price / user_avg_spend)."""
        interaction = feature_extractor.extract_interaction_context(
            sample_transactions_df,
            sample_user_features_df,
            sample_item_features_df,
        )

        alignment = interaction.select("price_alignment_score").filter(col("price_alignment_score").isNotNull()).count()
        assert alignment > 0

    def test_customer_tier_assignment(
        self,
        feature_extractor,
        sample_transactions_df,
        sample_user_features_df,
        sample_item_features_df,
    ):
        """Test customer tier based on total spend."""
        interaction = feature_extractor.extract_interaction_context(
            sample_transactions_df,
            sample_user_features_df,
            sample_item_features_df,
        )

        c002 = interaction.filter(col("customer_id") == "C002").select("customer_tier").collect()[0]
        assert c002["customer_tier"] in ["Gold", "Silver", "Bronze", "New"]

    def test_item_affinity_score(
        self,
        feature_extractor,
        sample_transactions_df,
        sample_user_features_df,
        sample_item_features_df,
    ):
        """Test item affinity score calculation."""
        interaction = feature_extractor.extract_interaction_context(
            sample_transactions_df,
            sample_user_features_df,
            sample_item_features_df,
        )

        affinities = interaction.select("item_affinity_score").collect()
        for row in affinities:
            assert row["item_affinity_score"] >= 0


class TestMarketBasketContext:
    """Test market basket feature extraction."""

    def test_basket_size_calculation(self, feature_extractor, sample_transactions_df):
        """Test basket size (total items per customer)."""
        basket = feature_extractor.extract_market_basket_context(sample_transactions_df)

        c001 = basket.filter(col("customer_id") == "C001").collect()[0]
        assert c001["basket_size"] == 3

        c004 = basket.filter(col("customer_id") == "C004").collect()[0]
        assert c004["basket_size"] == 3

    def test_unique_items_calculation(self, feature_extractor, sample_transactions_df):
        """Test unique item count."""
        basket = feature_extractor.extract_market_basket_context(sample_transactions_df)

        c001 = basket.filter(col("customer_id") == "C001").collect()[0]
        assert c001["unique_items"] == 3

    def test_product_diversity_score(self, feature_extractor, sample_transactions_df):
        """Test product diversity (unique / total)."""
        basket = feature_extractor.extract_market_basket_context(sample_transactions_df)

        diversity = basket.select("product_diversity_score").collect()
        for row in diversity:
            assert 0 <= row["product_diversity_score"] <= 1

    def test_repeat_purchase_ratio(self, feature_extractor, sample_transactions_df):
        """Test repeat purchase ratio."""
        basket = feature_extractor.extract_market_basket_context(sample_transactions_df)

        repeat = basket.select("repeat_purchase_ratio").collect()
        for row in repeat:
            assert 0 <= row["repeat_purchase_ratio"] <= 1


class TestContextFeatureMatrix:
    """Test complete context feature matrix creation."""

    def test_feature_matrix_creation(self, feature_extractor, sample_transactions_df):
        """Test context feature matrix is created."""
        feature_matrix = feature_extractor.create_context_feature_matrix(sample_transactions_df)

        assert feature_matrix is not None
        assert feature_matrix.count() == 10

    def test_feature_matrix_with_user_item_features(
        self,
        feature_extractor,
        sample_transactions_df,
        sample_user_features_df,
        sample_item_features_df,
    ):
        """Test context matrix with user/item feature integration."""
        feature_matrix = feature_extractor.create_context_feature_matrix(
            sample_transactions_df,
            user_features_df=sample_user_features_df,
            item_features_df=sample_item_features_df,
        )

        assert feature_matrix is not None
        assert "price_alignment_score" in feature_matrix.columns

    def test_feature_matrix_columns(self, feature_extractor, sample_transactions_df):
        """Test feature matrix has expected columns."""
        feature_matrix = feature_extractor.create_context_feature_matrix(sample_transactions_df)

        columns = feature_matrix.columns
        assert "is_weekend" in columns
        assert "days_since_last_purchase" in columns
        assert "basket_size" in columns

    def test_selective_feature_inclusion(self, feature_extractor, sample_transactions_df):
        """Test creating matrix with selective features."""
        temporal_only = feature_extractor.create_context_feature_matrix(
            sample_transactions_df,
            include_temporal=True,
            include_sequential=False,
            include_interaction=False,
            include_basket=False,
        )

        assert "is_weekend" in temporal_only.columns
        assert "days_since_last_purchase" not in temporal_only.columns


class TestFeatureSchema:
    """Test feature schema definition."""

    def test_get_feature_schema(self, feature_extractor):
        """Test feature schema retrieval."""
        schema = feature_extractor.get_feature_schema()

        assert isinstance(schema, list)
        assert "transaction_id" in schema
        assert "is_weekend" in schema
        assert "days_since_last_purchase" in schema

    def test_schema_completeness(self, feature_extractor):
        """Test schema has all feature types."""
        schema = feature_extractor.get_feature_schema()

        assert "hour_of_day" in schema
        assert "is_holiday_season" in schema

        assert "days_since_last_purchase" in schema
        assert "in_streak" in schema

        assert "basket_size" in schema
        assert "product_diversity_score" in schema


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
