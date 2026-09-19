"""
Unit and integration tests for item feature extraction.
Tests popularity, pricing, temporal patterns, and concentration features.
"""

import pytest
from pyspark.sql import SparkSession, DataFrame
from pyspark.sql.functions import col, to_timestamp, lit
from pyspark.sql.types import StructType, StructField, StringType, IntegerType, DoubleType
from datetime import datetime, timedelta

from ml.data.spark_session import create_local_spark_session
from ml.features.item_features import ItemFeatureExtractor

@pytest.fixture(scope="session")
def spark():
    """Create Spark session for tests."""
    spark_session = create_local_spark_session(
        app_name="test-item-features",
        shuffle_partitions=1
    )
    yield spark_session
    spark_session.stop()

@pytest.fixture
def feature_extractor(spark):
    """Create ItemFeatureExtractor instance."""
    return ItemFeatureExtractor(spark)

@pytest.fixture
def sample_transactions_df(spark):
    """Create sample transaction data with temporal features."""
    data = [
        # Article A001: Popular, consistent pricing
        ("T001", "2020-01-15", "C001", "A001", 50.0, 1, 2020, 1, 15, 4),
        ("T002", "2020-02-10", "C002", "A001", 50.0, 1, 2020, 2, 10, 2),
        ("T003", "2020-03-20", "C003", "A001", 51.0, 2, 2020, 3, 20, 5),
        ("T004", "2020-04-05", "C004", "A001", 49.0, 2, 2020, 4, 5, 1),
        
        # Article A002: Niche, high variance pricing
        ("T005", "2019-06-01", "C001", "A002", 100.0, 1, 2019, 6, 1, 3),
        ("T006", "2020-01-15", "C005", "A002", 150.0, 2, 2020, 1, 15, 4),
        
        # Article A003: New item, few purchases
        ("T007", "2020-03-10", "C002", "A003", 30.0, 1, 2020, 3, 10, 2),
        
        # Article A004: Old item, low demand
        ("T008", "2019-01-05", "C003", "A004", 75.0, 2, 2019, 1, 5, 4),
        
        # Article A005: Single buyer (concentrated)
        ("T009", "2020-02-20", "C006", "A005", 60.0, 1, 2020, 2, 20, 3),
        ("T010", "2020-03-15", "C006", "A005", 62.0, 1, 2020, 3, 15, 1),
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
    
    # Add timestamp column
    df = df.withColumn(
        "transaction_date",
        to_timestamp(col("t_dat"), "yyyy-MM-dd")
    )
    
    return df

class TestPopularityFeatures:
    """Test popularity feature calculation."""
    
    def test_total_purchases(self, feature_extractor, sample_transactions_df):
        """Test total purchase count per item."""
        popularity = feature_extractor.calculate_popularity_features(sample_transactions_df)
        
        a001 = popularity.filter(col("article_id") == "A001").collect()[0]
        assert a001["total_purchases"] == 4
        
        a007 = popularity.filter(col("article_id") == "A003").collect()[0]
        assert a007["total_purchases"] == 1
    
    def test_unique_customers(self, feature_extractor, sample_transactions_df):
        """Test unique customer count per item."""
        popularity = feature_extractor.calculate_popularity_features(sample_transactions_df)
        
        a001 = popularity.filter(col("article_id") == "A001").collect()[0]
        assert a001["unique_customers"] == 4
    
    def test_days_since_purchase(self, feature_extractor, sample_transactions_df):
        """Test recency calculation."""
        popularity = feature_extractor.calculate_popularity_features(sample_transactions_df)
        
        # All items should have recency >= 0
        recency_values = popularity.select("days_since_purchase").collect()
        for row in recency_values:
            assert row["days_since_purchase"] >= 0
    
    def test_channel_preference(self, feature_extractor, sample_transactions_df):
        """Test online vs offline purchase counting."""
        popularity = feature_extractor.calculate_popularity_features(sample_transactions_df)
        
        a001 = popularity.filter(col("article_id") == "A001").collect()[0]
        assert a001["online_purchases"] == 2  # Channels 1 are online
        assert a001["offline_purchases"] == 2  # Channels 2 are offline

class TestPricingFeatures:
    """Test pricing feature calculation."""
    
    def test_average_price(self, feature_extractor, sample_transactions_df):
        """Test average price calculation."""
        pricing = feature_extractor.calculate_pricing_features(sample_transactions_df)
        
        a001 = pricing.filter(col("article_id") == "A001").collect()[0]
        expected_avg = (50.0 + 50.0 + 51.0 + 49.0) / 4
        assert abs(a001["avg_price"] - expected_avg) < 0.1
    
    def test_price_range(self, feature_extractor, sample_transactions_df):
        """Test price range (max - min)."""
        pricing = feature_extractor.calculate_pricing_features(sample_transactions_df)
        
        a002 = pricing.filter(col("article_id") == "A002").collect()[0]
        assert a002["price_range"] == 50.0  # 150 - 100
    
    def test_price_volatility(self, feature_extractor, sample_transactions_df):
        """Test price volatility (std_dev / avg)."""
        pricing = feature_extractor.calculate_pricing_features(sample_transactions_df)
        
        a001 = pricing.filter(col("article_id") == "A001").collect()[0]
        assert a001["price_volatility"] >= 0
        assert a001["price_volatility"] < 1  # Low volatility for consistent pricing
    
    def test_min_max_prices(self, feature_extractor, sample_transactions_df):
        """Test min and max price extraction."""
        pricing = feature_extractor.calculate_pricing_features(sample_transactions_df)
        
        a001 = pricing.filter(col("article_id") == "A001").collect()[0]
        assert a001["min_price"] == 49.0
        assert a001["max_price"] == 51.0

class TestTemporalFeatures:
    """Test temporal feature calculation."""
    
    def test_item_lifetime_days(self, feature_extractor, sample_transactions_df):
        """Test item lifetime calculation."""
        temporal = feature_extractor.calculate_temporal_features(sample_transactions_df)
        
        a001 = temporal.filter(col("article_id") == "A001").collect()[0]
        # From 2020-01-15 to 2020-04-05 = 81 days
        assert a001["item_lifetime_days"] >= 80
    
    def test_first_last_sold_dates(self, feature_extractor, sample_transactions_df):
        """Test first and last sold date tracking."""
        temporal = feature_extractor.calculate_temporal_features(sample_transactions_df)
        
        a001 = temporal.filter(col("article_id") == "A001").collect()[0]
        assert a001["first_sold_date"] is not None
        assert a001["last_sold_date"] is not None
        assert a001["first_sold_date"] <= a001["last_sold_date"]
    
    def test_monthly_patterns(self, feature_extractor, sample_transactions_df):
        """Test average purchase month extraction."""
        temporal = feature_extractor.calculate_temporal_features(sample_transactions_df)
        
        temporal_rows = temporal.select("avg_purchase_month").collect()
        for row in temporal_rows:
            assert 1 <= row["avg_purchase_month"] <= 12

class TestConcentrationFeatures:
    """Test customer concentration feature calculation."""
    
    def test_unique_buyers(self, feature_extractor, sample_transactions_df):
        """Test unique buyer count."""
        concentration = feature_extractor.calculate_customer_concentration(sample_transactions_df)
        
        a001 = concentration.filter(col("article_id") == "A001").collect()[0]
        assert a001["unique_buyers"] == 4
        
        a005 = concentration.filter(col("article_id") == "A005").collect()[0]
        assert a005["unique_buyers"] == 1  # Single buyer
    
    def test_top_customer_share(self, feature_extractor, sample_transactions_df):
        """Test top customer market share."""
        concentration = feature_extractor.calculate_customer_concentration(sample_transactions_df)
        
        a005 = concentration.filter(col("article_id") == "A005").collect()[0]
        assert a005["top_customer_share"] == 1.0  # 100% from one customer
    
    def test_hhi_index(self, feature_extractor, sample_transactions_df):
        """Test HHI concentration index."""
        concentration = feature_extractor.calculate_customer_concentration(sample_transactions_df)
        
        # HHI ranges from 0 (perfect competition) to 1 (monopoly)
        hhi_values = concentration.select("hhi_index").collect()
        for row in hhi_values:
            assert 0 <= row["hhi_index"] <= 1

class TestFeatureMatrixGeneration:
    """Test complete feature matrix creation."""
    
    def test_feature_matrix_creation(self, feature_extractor, sample_transactions_df):
        """Test that feature matrix is created."""
        feature_matrix = feature_extractor.create_item_feature_matrix(sample_transactions_df)
        
        assert feature_matrix is not None
        assert feature_matrix.count() == 5  # 5 unique items
    
    def test_feature_matrix_columns(self, feature_extractor, sample_transactions_df):
        """Test that feature matrix has expected columns."""
        feature_matrix = feature_extractor.create_item_feature_matrix(sample_transactions_df)
        columns = feature_matrix.columns
        
        # Check key columns exist
        assert "article_id" in columns
        assert "total_purchases" in columns
        assert "avg_price" in columns
        assert "price_volatility" in columns
    
    def test_feature_matrix_no_nulls(self, feature_extractor, sample_transactions_df):
        """Test that feature matrix has no nulls in numeric fields."""
        feature_matrix = feature_extractor.create_item_feature_matrix(sample_transactions_df)
        
        # Check specific numeric columns for nulls
        numeric_cols = ["total_purchases", "avg_price", "unique_customers"]
        
        for col_name in numeric_cols:
            null_count = feature_matrix.filter(col(col_name).isNull()).count()
            assert null_count == 0
    
    def test_feature_matrix_selective_inclusion(self, feature_extractor, sample_transactions_df):
        """Test creating feature matrix with selective feature inclusion."""
        # Popularity only
        pop_only = feature_extractor.create_item_feature_matrix(
            sample_transactions_df,
            include_popularity=True,
            include_pricing=False,
            include_temporal=False,
            include_concentration=False
        )
        
        assert "total_purchases" in pop_only.columns
        assert "avg_price" not in pop_only.columns

class TestFeatureSchema:
    """Test feature schema definition."""
    
    def test_get_feature_schema(self, feature_extractor):
        """Test feature schema retrieval."""
        schema = feature_extractor.get_feature_schema()
        
        assert isinstance(schema, list)
        assert "article_id" in schema
        assert "total_purchases" in schema
        assert "avg_price" in schema
        assert "price_volatility" in schema
    
    def test_schema_contains_all_feature_types(self, feature_extractor):
        """Test schema has popularity, pricing, temporal, and concentration features."""
        schema = feature_extractor.get_feature_schema()
        
        # Popularity
        assert "total_purchases" in schema
        assert "unique_customers" in schema
        
        # Pricing
        assert "avg_price" in schema
        assert "price_volatility" in schema
        
        # Temporal
        assert "item_lifetime_days" in schema
        
        # Concentration
        assert "hhi_index" in schema

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
