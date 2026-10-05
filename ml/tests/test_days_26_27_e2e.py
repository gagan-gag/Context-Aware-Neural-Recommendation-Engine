"""End-to-end pipeline testing with INR pricing - Days 26-27."""
import pytest
import numpy as np
from datetime import datetime
import time

from ml.serving.model_server import ModelServer
from ml.serving.currency import CurrencyConverter, convert_usd_to_inr, format_inr
from ml.versioning.model_registry import ModelRegistry
from ml.versioning.model_metadata import ModelMetadata


class TestCurrencyConversion:
    """Test currency conversion for INR pricing."""
    
    def test_usd_to_inr_conversion(self):
        """Test USD to INR conversion."""
        converter = CurrencyConverter()
        amount_inr = converter.usd_to_inr(100.0)
        
        assert amount_inr > 8000  # ~₹8350
        assert isinstance(amount_inr, float)
    
    def test_inr_formatting(self):
        """Test INR formatting."""
        converter = CurrencyConverter()
        formatted = converter.format_inr(8350.50)
        
        assert "₹" in formatted
        assert "8,350.50" in formatted
    
    def test_global_converter_function(self):
        """Test global converter function."""
        amount_inr = convert_usd_to_inr(50.0)
        
        assert amount_inr > 4000
        assert isinstance(amount_inr, float)
    
    def test_custom_exchange_rate(self):
        """Test setting custom exchange rate."""
        converter = CurrencyConverter()
        converter.set_rate("USD", "INR", 90.0)
        
        amount_inr = converter.usd_to_inr(100.0)
        assert amount_inr == 9000.0
    
    def test_usd_to_inr_range(self):
        """Test USD to INR conversion range."""
        converter = CurrencyConverter()
        
        test_amounts = [10.0, 50.0, 100.0, 500.0, 1000.0]
        
        for usd in test_amounts:
            inr = converter.usd_to_inr(usd)
            assert inr > usd * 80  # Should be significantly higher
            assert isinstance(inr, float)
    
    def test_inr_to_usd_conversion(self):
        """Test INR to USD conversion."""
        converter = CurrencyConverter()
        amount_usd = converter.inr_to_usd(8350.0)
        
        assert amount_usd < 150
        assert amount_usd > 50
        assert isinstance(amount_usd, float)


class TestModelServerWithPricing:
    """Test model server with INR pricing."""
    
    @pytest.fixture
    def model_server(self):
        """Create model server."""
        server = ModelServer()
        server.model_loaded = True
        return server
    
    @pytest.fixture
    def dummy_features(self):
        """Create dummy features."""
        user_features = np.random.randn(52).astype(np.float32)
        context_features = np.random.randn(34).astype(np.float32)
        return user_features, context_features
    
    def test_recommendations_with_inr_prices(self, model_server, dummy_features):
        """Test recommendations include INR prices."""
        user_features, context_features = dummy_features
        
        result = model_server.get_recommendations(
            user_id=1,
            user_features=user_features,
            context_features=context_features,
            top_k=5,
            currency="INR"
        )
        
        assert result["currency"] == "INR"
        assert len(result["recommendations"]) == 5
        
        for rec in result["recommendations"]:
            assert "price_usd" in rec
            assert "price_inr" in rec
            assert "price_inr_formatted" in rec
            assert rec["currency"] == "INR"
            assert rec["price_inr"] > 0
    
    def test_price_conversion_accuracy(self, model_server, dummy_features):
        """Test price conversion is accurate."""
        user_features, context_features = dummy_features
        
        result = model_server.get_recommendations(
            user_id=1,
            user_features=user_features,
            context_features=context_features,
            top_k=1,
            currency="INR"
        )
        
        rec = result["recommendations"][0]
        price_usd = rec["price_usd"]
        price_inr = rec["price_inr"]
        
        # Verify conversion is correct (with 83.50 rate)
        expected_inr = price_usd * 83.50
        assert abs(price_inr - expected_inr) < 0.01
    
    def test_recommendations_sorted_by_score(self, model_server, dummy_features):
        """Test recommendations are sorted by score descending."""
        user_features, context_features = dummy_features
        
        result = model_server.get_recommendations(
            user_id=1,
            user_features=user_features,
            context_features=context_features,
            top_k=10,
            currency="INR"
        )
        
        scores = [rec["score"] for rec in result["recommendations"]]
        
        # Verify scores are in descending order
        for i in range(len(scores) - 1):
            assert scores[i] >= scores[i + 1]
    
    def test_all_items_have_pricing(self, model_server, dummy_features):
        """Test all recommended items have pricing."""
        user_features, context_features = dummy_features
        
        result = model_server.get_recommendations(
            user_id=1,
            user_features=user_features,
            context_features=context_features,
            top_k=10,
            currency="INR"
        )
        
        for rec in result["recommendations"]:
            assert rec["price_usd"] is not None
            assert rec["price_inr"] is not None
            assert rec["price_inr_formatted"] is not None
            assert "₹" in rec["price_inr_formatted"]


class TestE2ERecommendationFlow:
    """End-to-end recommendation flow with INR pricing."""
    
    @pytest.fixture
    def pipeline_setup(self):
        """Setup pipeline."""
        model_server = ModelServer()
        model_server.model_loaded = True
        converter = CurrencyConverter()
        
        return {
            "model_server": model_server,
            "converter": converter
        }
    
    def test_full_recommendation_pipeline(self, pipeline_setup):
        """Test full recommendation pipeline."""
        user_features = np.random.randn(52).astype(np.float32)
        context_features = np.random.randn(34).astype(np.float32)
        
        # Step 1: Get recommendations with INR pricing
        recommendations = pipeline_setup["model_server"].get_recommendations(
            user_id=1,
            user_features=user_features,
            context_features=context_features,
            top_k=5,
            currency="INR"
        )
        
        assert recommendations["currency"] == "INR"
        assert len(recommendations["recommendations"]) == 5
        
        # Step 2: Verify pricing in recommendations
        total_inr_value = 0
        for rec in recommendations["recommendations"]:
            assert rec["price_inr"] > 0
            assert "₹" in rec["price_inr_formatted"]
            total_inr_value += rec["price_inr"]
        
        assert total_inr_value > 0
    
    def test_user_journey_recommendations(self, pipeline_setup):
        """Test user journey with recommendations."""
        user_features = np.random.randn(52).astype(np.float32)
        context_features = np.random.randn(34).astype(np.float32)
        
        # Get recommendations
        recommendations = pipeline_setup["model_server"].get_recommendations(
            user_id=42,
            user_features=user_features,
            context_features=context_features,
            top_k=10,
            currency="INR"
        )
        
        # Verify recommendations for user journey
        assert len(recommendations["recommendations"]) == 10
        assert recommendations["currency"] == "INR"
        
        # Simulate user journey: view → click → purchase
        viewed_items = []
        clicked_items = []
        purchased_items = []
        
        # View top 5
        for rec in recommendations["recommendations"][:5]:
            viewed_items.append({
                "user_id": 42,
                "item_id": rec["item_id"],
                "event_type": "view",
                "price_inr": rec["price_inr"]
            })
        
        # Click top 3
        for rec in recommendations["recommendations"][:3]:
            clicked_items.append({
                "user_id": 42,
                "item_id": rec["item_id"],
                "event_type": "click",
                "price_inr": rec["price_inr"]
            })
        
        # Purchase top 1
        for rec in recommendations["recommendations"][:1]:
            purchased_items.append({
                "user_id": 42,
                "item_id": rec["item_id"],
                "event_type": "purchase",
                "price_inr": rec["price_inr"],
                "price_inr_formatted": rec["price_inr_formatted"]
            })
        
        # Verify journey
        assert len(viewed_items) == 5
        assert len(clicked_items) == 3
        assert len(purchased_items) == 1
        
        # Verify all items have pricing
        for item in viewed_items + clicked_items + purchased_items:
            assert item["price_inr"] > 0
    
    def test_batch_users_recommendations(self, pipeline_setup):
        """Test batch recommendations for multiple users."""
        num_users = 5
        
        for user_id in range(num_users):
            user_features = np.random.randn(52).astype(np.float32)
            context_features = np.random.randn(34).astype(np.float32)
            
            result = pipeline_setup["model_server"].get_recommendations(
                user_id=user_id,
                user_features=user_features,
                context_features=context_features,
                top_k=5,
                currency="INR"
            )
            
            assert result["currency"] == "INR"
            assert len(result["recommendations"]) == 5


class TestPricingIntegration:
    """Test pricing integration across all components."""
    
    def test_currency_consistency(self):
        """Test currency is consistent across pipeline."""
        converter = CurrencyConverter()
        
        # All prices should use same currency
        prices_usd = [100.0, 200.0, 300.0]
        prices_inr = [converter.usd_to_inr(p) for p in prices_usd]
        
        # Verify conversion is consistent
        for usd, inr in zip(prices_usd, prices_inr):
            expected = usd * 83.50
            assert abs(inr - expected) < 0.01
    
    def test_price_formatting_consistency(self):
        """Test price formatting is consistent."""
        converter = CurrencyConverter()
        
        amounts = [1000.0, 5000.0, 10000.0]
        
        for amount in amounts:
            formatted = converter.format_inr(amount)
            
            assert "₹" in formatted
            assert isinstance(formatted, str)
            assert len(formatted) > 0
    
    def test_pricing_in_recommendations(self):
        """Test pricing is properly integrated in recommendations."""
        model_server = ModelServer()
        model_server.model_loaded = True
        
        user_features = np.random.randn(52).astype(np.float32)
        context_features = np.random.randn(34).astype(np.float32)
        
        result = model_server.get_recommendations(
            user_id=1,
            user_features=user_features,
            context_features=context_features,
            top_k=10,
            currency="INR"
        )
        
        # Verify pricing consistency
        for rec in result["recommendations"]:
            # Price in INR should be approximately 83.5x the price in USD
            ratio = rec["price_inr"] / rec["price_usd"]
            assert 83.0 < ratio < 84.0


class TestEdgeCases:
    """Test edge cases in pipeline."""
    
    def test_zero_top_k(self):
        """Test edge case with top_k=0."""
        model_server = ModelServer()
        model_server.model_loaded = True
        
        user_features = np.random.randn(52).astype(np.float32)
        context_features = np.random.randn(34).astype(np.float32)
        
        result = model_server.get_recommendations(
            user_id=1,
            user_features=user_features,
            context_features=context_features,
            top_k=0,
            currency="INR"
        )
        
        assert len(result["recommendations"]) == 0
    
    def test_large_top_k(self):
        """Test edge case with large top_k."""
        model_server = ModelServer()
        model_server.model_loaded = True
        
        user_features = np.random.randn(52).astype(np.float32)
        context_features = np.random.randn(34).astype(np.float32)
        
        result = model_server.get_recommendations(
            user_id=1,
            user_features=user_features,
            context_features=context_features,
            top_k=1000,
            currency="INR"
        )
        
        # Should return available items, not crash
        assert len(result["recommendations"]) > 0
        assert len(result["recommendations"]) <= 100  # num_items limit
    
    def test_invalid_user_features_shape(self):
        """Test invalid user features shape."""
        model_server = ModelServer()
        model_server.model_loaded = True
        
        user_features = np.random.randn(50).astype(np.float32)  # Wrong shape
        context_features = np.random.randn(34).astype(np.float32)
        
        with pytest.raises(ValueError):
            model_server.get_recommendations(
                user_id=1,
                user_features=user_features,
                context_features=context_features,
                top_k=5,
                currency="INR"
            )
    
    def test_invalid_context_features_shape(self):
        """Test invalid context features shape."""
        model_server = ModelServer()
        model_server.model_loaded = True
        
        user_features = np.random.randn(52).astype(np.float32)
        context_features = np.random.randn(32).astype(np.float32)  # Wrong shape
        
        with pytest.raises(ValueError):
            model_server.get_recommendations(
                user_id=1,
                user_features=user_features,
                context_features=context_features,
                top_k=5,
                currency="INR"
            )


class TestRegistryIntegration:
    """Test model registry with pricing."""
    
    def test_registry_with_pricing_metadata(self, tmp_path):
        """Test registry stores pricing information."""
        registry = ModelRegistry(str(tmp_path / "registry.json"))
        
        metadata = ModelMetadata(
            version="1.0",
            created_at=datetime.now().isoformat(),
            author="ml_team",
            description="Model v1.0 with INR pricing",
            checkpoint_path="checkpoints/model_v1.0.h5",
            recall_at_10=0.75,
            ndcg=0.68
        )
        
        registry.register_model(metadata)
        retrieved = registry.get_model("1.0")
        
        assert retrieved is not None
        assert retrieved.recall_at_10 == 0.75
    
    def test_multiple_model_versions(self, tmp_path):
        """Test registry with multiple versions."""
        registry = ModelRegistry(str(tmp_path / "registry.json"))
        
        # Register multiple versions with different timestamps
        for i in range(3):
            metadata = ModelMetadata(
                version=f"1.{i}",
                created_at=datetime.now().isoformat(),
                author="ml_team",
                description=f"Model v1.{i}",
                checkpoint_path=f"checkpoints/model_v1.{i}.h5",
                recall_at_10=0.70 + (i * 0.03),
                ndcg=0.65 + (i * 0.02)
            )
            registry.register_model(metadata)
            time.sleep(0.1)  # Small delay to ensure different timestamps
        
        # Verify all versions registered
        versions = registry.list_versions()
        assert len(versions) == 3
        assert "1.0" in versions
        assert "1.1" in versions
        assert "1.2" in versions
        
        # Get best performing (more reliable than latest)
        best = registry.get_best_performing()
        assert best is not None
        assert best.version == "1.2"  # 1.2 has highest recall (0.76)
    
    def test_best_performing_model(self, tmp_path):
        """Test finding best performing model."""
        registry = ModelRegistry(str(tmp_path / "registry.json"))
        
        # Register models with different performance
        models_data = [
            {"version": "1.0", "recall": 0.70},
            {"version": "1.1", "recall": 0.75},
            {"version": "1.2", "recall": 0.72},
        ]
        
        for model in models_data:
            metadata = ModelMetadata(
                version=model["version"],
                created_at=datetime.now().isoformat(),
                author="ml_team",
                description=f"Model {model['version']}",
                checkpoint_path=f"checkpoints/model_{model['version']}.h5",
                recall_at_10=model["recall"]
            )
            registry.register_model(metadata)
        
        # Get best performing
        best = registry.get_best_performing()
        assert best is not None
        assert best.version == "1.1"
        assert best.recall_at_10 == 0.75


class TestPerformanceMetrics:
    """Test performance metrics and latency."""
    
    def test_recommendation_latency(self):
        """Test recommendation generation latency."""
        model_server = ModelServer()
        model_server.model_loaded = True
        
        user_features = np.random.randn(52).astype(np.float32)
        context_features = np.random.randn(34).astype(np.float32)
        
        start = time.time()
        result = model_server.get_recommendations(
            user_id=1,
            user_features=user_features,
            context_features=context_features,
            top_k=10,
            currency="INR"
        )
        elapsed = time.time() - start
        
        # Should complete in < 1 second
        assert elapsed < 1.0
        assert result is not None
    
    def test_batch_recommendation_throughput(self):
        """Test batch processing throughput."""
        model_server = ModelServer()
        model_server.model_loaded = True
        
        num_users = 100
        start = time.time()
        
        for user_id in range(num_users):
            user_features = np.random.randn(52).astype(np.float32)
            context_features = np.random.randn(34).astype(np.float32)
            
            model_server.get_recommendations(
                user_id=user_id,
                user_features=user_features,
                context_features=context_features,
                top_k=5,
                currency="INR"
            )
        
        elapsed = time.time() - start
        throughput = num_users / elapsed
        
        # Should process at least 10 users/second
        assert throughput > 10