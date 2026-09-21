"""
Unit tests for embedding preparation module.
Tests feature normalization, encoding, and embedding readiness.
"""

import pytest
from pyspark.sql import SparkSession
from pyspark.sql.functions import col
from pyspark.sql.types import DoubleType, IntegerType, StringType, StructField, StructType

from ml.data.spark_session import create_local_spark_session
from ml.features.embedding_preparation import EmbeddingPreparator
from ml.features.feature_vocabulary import FeatureVocabulary


@pytest.fixture(scope="session")
def spark():
    """Create Spark session for tests."""
    spark_session = create_local_spark_session(app_name="test-embedding-preparation", shuffle_partitions=1)
    yield spark_session
    spark_session.stop()


@pytest.fixture
def vocabulary():
    """Create FeatureVocabulary instance."""
    return FeatureVocabulary()


@pytest.fixture
def preparator(spark, vocabulary):
    """Create EmbeddingPreparator instance."""
    return EmbeddingPreparator(spark, vocabulary)


@pytest.fixture
def sample_user_df(spark):
    """Create sample user features."""
    data = [
        ("C001", 10.0, 50, 500.0, 55.0, 365.0, 1.4),
        ("C002", 30.0, 20, 200.0, 100.0, 180.0, 0.67),
        ("C003", 5.0, 100, 1000.0, 50.0, 730.0, 5.0),
    ]

    schema = StructType([
        StructField("customer_id", StringType(), True),
        StructField("recency_days", DoubleType(), True),
        StructField("frequency", IntegerType(), True),
        StructField("monetary_value", DoubleType(), True),
        StructField("avg_purchase_value", DoubleType(), True),
        StructField("customer_lifetime_days", DoubleType(), True),
        StructField("purchase_velocity", DoubleType(), True),
    ])

    return spark.createDataFrame(data, schema=schema)


@pytest.fixture
def sample_item_df(spark):
    """Create sample item features."""
    data = [
        ("A001", 100.0, 500, 50.0, 365.0, 0.3),
        ("A002", 50.0, 200, 100.0, 180.0, 0.5),
        ("A003", 500.0, 1000, 30.0, 730.0, 0.8),
    ]

    schema = StructType([
        StructField("article_id", StringType(), True),
        StructField("total_purchases", DoubleType(), True),
        StructField("unique_customers", IntegerType(), True),
        StructField("avg_price", DoubleType(), True),
        StructField("item_lifetime_days", DoubleType(), True),
        StructField("hhi_index", DoubleType(), True),
    ])

    return spark.createDataFrame(data, schema=schema)


@pytest.fixture
def sample_context_df(spark):
    """Create sample context features."""
    data = [
        ("T001", "C001", "A001", 10.0, 0, 1, 0, "Winter", "Gold", 5.0, 0.8),
        ("T002", "C002", "A002", 14.0, 1, 2, 1, "Spring", "Silver", 10.0, 0.5),
        ("T003", "C003", "A003", 18.0, 0, 3, 0, "Summer", "Bronze", 15.0, 0.9),
    ]

    schema = StructType([
        StructField("transaction_id", StringType(), True),
        StructField("customer_id", StringType(), True),
        StructField("article_id", StringType(), True),
        StructField("hour_of_day", DoubleType(), True),
        StructField("is_weekend", IntegerType(), True),
        StructField("quarter", IntegerType(), True),
        StructField("is_holiday_season", IntegerType(), True),
        StructField("season", StringType(), True),
        StructField("customer_tier", StringType(), True),
        StructField("days_since_last_purchase", DoubleType(), True),
        StructField("product_diversity_score", DoubleType(), True),
    ])

    return spark.createDataFrame(data, schema=schema)


class TestFeatureVocabulary:
    """Test feature vocabulary."""

    def test_vocabulary_initialization(self, vocabulary):
        """Test vocabulary initializes correctly."""
        assert vocabulary is not None
        assert len(vocabulary.user_features) > 0
        assert len(vocabulary.item_features) > 0
        assert len(vocabulary.context_features) > 0

    def test_user_embedding_config(self, vocabulary):
        """Test user embedding configuration."""
        config = vocabulary.get_user_embedding_config()
        assert isinstance(config, dict)
        assert all(isinstance(v, int) for v in config.values())
        assert sum(config.values()) == vocabulary.get_total_embedding_dim()["user"]

    def test_categorical_vocab_retrieval(self, vocabulary):
        """Test categorical vocabulary retrieval."""
        season_vocab = vocabulary.get_categorical_vocab("season")
        assert "Winter" in season_vocab
        assert "Summer" in season_vocab
        assert isinstance(season_vocab["Winter"], int)

    def test_normalization_params(self, vocabulary):
        """Test normalization parameter retrieval."""
        params = vocabulary.get_normalization_params("user")
        assert "recency_days" in params
        assert isinstance(params["recency_days"], tuple)
        assert len(params["recency_days"]) == 2


class TestNormalization:
    """Test continuous feature normalization."""

    def test_normalize_user_features(self, preparator, sample_user_df):
        """Test user feature normalization."""
        normalized = preparator.normalize_continuous_features(
            sample_user_df,
            "user",
            ["recency_days", "frequency"],
        )

        assert "recency_days_normalized" in normalized.columns
        assert "frequency_normalized" in normalized.columns

        normalized_values = normalized.select("recency_days_normalized").collect()
        for row in normalized_values:
            assert 0.0 <= row["recency_days_normalized"] <= 1.0

    def test_normalize_item_features(self, preparator, sample_item_df):
        """Test item feature normalization."""
        normalized = preparator.normalize_continuous_features(
            sample_item_df,
            "item",
            ["total_purchases", "avg_price"],
        )

        assert "total_purchases_normalized" in normalized.columns
        assert "avg_price_normalized" in normalized.columns


class TestCategoricalEncoding:
    """Test categorical feature encoding."""

    def test_encode_season(self, preparator, sample_context_df):
        """Test season encoding."""
        encoded = preparator.encode_categorical_features(
            sample_context_df,
            "context",
            {"season": ["Winter", "Spring", "Summer", "Fall"]},
        )

        assert "season_encoded" in encoded.columns

        winter = encoded.filter(col("season") == "Winter").select("season_encoded").collect()[0]
        assert winter["season_encoded"] == 0

    def test_encode_customer_tier(self, preparator, sample_context_df):
        """Test customer tier encoding."""
        encoded = preparator.encode_categorical_features(
            sample_context_df,
            "context",
            {"customer_tier": ["New", "Bronze", "Silver", "Gold"]},
        )

        assert "customer_tier_encoded" in encoded.columns

        gold = encoded.filter(col("customer_tier") == "Gold").select("customer_tier_encoded").collect()[0]
        assert gold["customer_tier_encoded"] == 3


class TestEmbeddingManifest:
    """Test embedding manifest creation."""

    def test_create_user_manifest(self, preparator, sample_user_df):
        """Test user embedding manifest."""
        manifest = preparator.create_embedding_manifest("user", sample_user_df)

        assert manifest["entity_type"] == "user"
        assert "embedding_dims" in manifest
        assert "total_embedding_dim" in manifest
        assert manifest["total_embedding_dim"] > 0

    def test_create_item_manifest(self, preparator, sample_item_df):
        """Test item embedding manifest."""
        manifest = preparator.create_embedding_manifest("item", sample_item_df)

        assert manifest["entity_type"] == "item"
        assert manifest["feature_count"] > 0

    def test_create_context_manifest(self, preparator, sample_context_df):
        """Test context embedding manifest."""
        manifest = preparator.create_embedding_manifest("context", sample_context_df)

        assert manifest["entity_type"] == "context"
        assert "categorical_vocabs" in manifest


class TestEmbeddingValidation:
    """Test embedding readiness validation."""

    def test_validate_after_normalization(self, preparator, sample_user_df):
        """Test validation after normalization."""
        normalized = preparator.normalize_continuous_features(
            sample_user_df,
            "user",
            ["recency_days", "frequency", "monetary_value"],
        )

        is_ready = preparator.validate_embedding_ready(normalized, "user")
        assert isinstance(is_ready, bool)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
