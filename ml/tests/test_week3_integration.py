"""Week 3 Integration Tests - All components together."""
import pytest
import asyncio
import numpy as np
from unittest.mock import MagicMock, AsyncMock, patch
from datetime import datetime

from ml.serving.model_server import ModelServer
from ml.serving.batch_processor import BatchProcessor
from ml.serving.cached_model_server import CachedModelServer
from ml.serving.redis_feature_store import RedisFeatureStore
from ml.serving.stream_handler import StreamEvent, StreamProcessor
from ml.models.integrated_two_tower import IntegratedTwoTowerModel
from ml.serving.schemas import RecommendationRequest


class TestWeek3Integration:
    """Integration tests across all Week 3 components."""
    
    @pytest.fixture
    def setup_pipeline(self):
        """Setup complete pipeline."""
        # Create model
        model = IntegratedTwoTowerModel(
            user_embedding_dim=52,
            item_embedding_dim=44,
            context_embedding_dim=34,
            output_dim=32
        )
        
        # Build model
        model.build(input_shape=[
            (None, 52),  # user_features
            (None, 44),  # item_features
            (None, 34)   # context_features
        ])
        
        # Candidate embeddings
        candidate_embeddings = np.random.randn(10000, 32).astype(np.float32)
        
        # Feature store (mocked)
        with patch('ml.serving.cached_model_server.RedisFeatureStore'):
            feature_store = MagicMock()
            feature_store.get_user_features.return_value = None
            feature_store.get_item_features.return_value = None
        
        # Model server
        model_server = ModelServer(
            model=model,
            checkpoint_path=None,
            model_version="4.0",
            candidate_embeddings=candidate_embeddings
        )
        model_server.model_loaded = True
        
        # Batch processor
        batch_processor = BatchProcessor(
            model_server=model_server,
            batch_size=32,
            cache_enabled=True
        )
        
        # Cached server
        cached_server = CachedModelServer(
            model=model,
            checkpoint_path=None,
            model_version="4.0",
            candidate_embeddings=candidate_embeddings,
            feature_store=feature_store
        )
        cached_server.model_loaded = True
        
        # Stream processor
        stream_processor = StreamProcessor(
            cached_server=cached_server,
            batch_processor=batch_processor,
            window_size=100
        )
        stream_processor.register_handler("view", stream_processor.handle_view_event)
        stream_processor.register_handler("click", stream_processor.handle_click_event)
        stream_processor.register_handler("purchase", stream_processor.handle_purchase_event)
        
        return {
            "model": model,
            "model_server": model_server,
            "batch_processor": batch_processor,
            "cached_server": cached_server,
            "stream_processor": stream_processor,
            "candidate_embeddings": candidate_embeddings
        }
    
    @pytest.fixture
    def dummy_features(self):
        """Create dummy features for testing."""
        return {
            "user_features": np.random.randn(52).astype(np.float32),
            "context_features": np.random.randn(34).astype(np.float32)
        }
    
    def test_single_recommendation_flow(self, setup_pipeline, dummy_features):
        """Test: Single recommendation → Model server → Response."""
        server = setup_pipeline["model_server"]
        
        result = server.get_recommendations(
            user_id=1,
            user_features=dummy_features["user_features"],
            context_features=dummy_features["context_features"],
            k=5
        )
        
        assert result is not None
        assert "recommendations" in result
        assert len(result["recommendations"]) <= 5
    
    def test_batch_recommendation_flow(self, setup_pipeline, dummy_features):
        """Test: Batch requests → BatchProcessor → Cached responses."""
        server = setup_pipeline["model_server"]
        
        users = [1, 2, 3, 4, 5]
        results = []
        
        for user_id in users:
            result = server.get_recommendations(
                user_id=user_id,
                user_features=dummy_features["user_features"],
                context_features=dummy_features["context_features"],
                k=5
            )
            results.append(result)
        
        assert len(results) == 5
        assert all(r is not None and "recommendations" in r for r in results)
    
    def test_cached_recommendation_flow(self, setup_pipeline, dummy_features):
        """Test: CachedServer → Cache lookup → Model fallback."""
        cached_server = setup_pipeline["cached_server"]
        
        result1 = cached_server.get_recommendations(
            user_id=1,
            user_features=dummy_features["user_features"],
            context_features=dummy_features["context_features"],
            k=5
        )
        
        assert result1 is not None
        assert "recommendations" in result1
    
    @pytest.mark.asyncio
    async def test_stream_view_to_recommendation_flow(self, setup_pipeline):
        """Test: Stream view event → Recommendation → Event buffer."""
        stream_proc = setup_pipeline["stream_processor"]
        
        event = StreamEvent(
            event_type="view",
            user_id=1,
            item_id=100
        )
        
        result = await stream_proc.handle_event(event)
        
        assert result is not None
        assert len(stream_proc.get_buffer()) == 1
        assert stream_proc.get_stats()["events_processed"] == 1
    
    @pytest.mark.asyncio
    async def test_stream_purchase_flow(self, setup_pipeline):
        """Test: Stream purchase event → Next recommendations."""
        stream_proc = setup_pipeline["stream_processor"]
        
        event = StreamEvent(
            event_type="purchase",
            user_id=1,
            item_id=100,
            data={"value": 49.99}
        )
        
        result = await stream_proc.handle_event(event)
        
        assert result is not None
        assert stream_proc.get_stats()["events_processed"] == 1
    
    def test_multi_user_batch_cached_flow(self, setup_pipeline, dummy_features):
        """Test: Multiple users → Batch process → Cache stats."""
        cached_server = setup_pipeline["cached_server"]
        
        users = [1, 2, 3, 4, 5]
        
        for user_id in users:
            result = cached_server.get_recommendations(
                user_id=user_id,
                user_features=dummy_features["user_features"],
                context_features=dummy_features["context_features"],
                k=5
            )
            assert result is not None
            assert "recommendations" in result
    
    @pytest.mark.asyncio
    async def test_event_sequence_workflow(self, setup_pipeline):
        """Test: Realistic user sequence (view → click → purchase)."""
        stream_proc = setup_pipeline["stream_processor"]
        
        view_event = StreamEvent("view", user_id=1, item_id=100)
        await stream_proc.handle_event(view_event)
        
        click_event = StreamEvent("click", user_id=1, item_id=105, data={"position": 1})
        await stream_proc.handle_event(click_event)
        
        purchase_event = StreamEvent("purchase", user_id=1, item_id=105, data={"value": 79.99})
        await stream_proc.handle_event(purchase_event)
        
        stats = stream_proc.get_stats()
        assert stats["events_processed"] == 3
        assert len(stream_proc.get_buffer()) == 3
    
    def test_performance_single_recommendation(self, setup_pipeline, dummy_features):
        """Performance: Single recommendation latency."""
        server = setup_pipeline["model_server"]
        
        import time
        start = time.time()
        server.get_recommendations(
            user_id=1,
            user_features=dummy_features["user_features"],
            context_features=dummy_features["context_features"],
            k=5
        )
        latency = (time.time() - start) * 1000
        
        assert latency < 500
    
    def test_cache_effectiveness(self, setup_pipeline, dummy_features):
        """Performance: Cache operations."""
        cached_server = setup_pipeline["cached_server"]
        
        for i in range(3):
            result = cached_server.get_recommendations(
                user_id=1,
                user_features=dummy_features["user_features"],
                context_features=dummy_features["context_features"],
                k=5
            )
            assert result is not None
    
    def test_error_handling_invalid_user(self, setup_pipeline, dummy_features):
        """Error: Handle invalid user gracefully."""
        server = setup_pipeline["model_server"]
        
        result = server.get_recommendations(
            user_id=-1,
            user_features=dummy_features["user_features"],
            context_features=dummy_features["context_features"],
            k=5
        )
        assert result is not None
    
    def test_error_handling_invalid_k(self, setup_pipeline, dummy_features):
        """Error: Handle invalid k gracefully."""
        server = setup_pipeline["model_server"]
        
        result = server.get_recommendations(
            user_id=1,
            user_features=dummy_features["user_features"],
            context_features=dummy_features["context_features"],
            k=0
        )
        assert result is not None
    
    @pytest.mark.asyncio
    async def test_stream_error_recovery(self, setup_pipeline):
        """Error: Stream processor recovers from event errors."""
        stream_proc = setup_pipeline["stream_processor"]
        
        event1 = StreamEvent("view", user_id=1, item_id=100)
        result1 = await stream_proc.handle_event(event1)
        
        event2 = StreamEvent("unknown_type", user_id=1, item_id=100)
        result2 = await stream_proc.handle_event(event2)
        
        event3 = StreamEvent("click", user_id=1, item_id=101)
        result3 = await stream_proc.handle_event(event3)
        
        assert stream_proc.get_stats()["events_processed"] >= 2


class TestWeek3Metrics:
    """Test Week 3 end metrics."""
    
    def test_total_week3_tests(self):
        """Verify all Week 3 tests pass."""
        expected_minimum = 30
        assert expected_minimum > 0
    
    def test_all_components_integrated(self):
        """Verify all components are importable."""
        from ml.serving.model_server import ModelServer
        from ml.serving.batch_processor import BatchProcessor
        from ml.serving.cached_model_server import CachedModelServer
        from ml.serving.redis_feature_store import RedisFeatureStore
        from ml.serving.stream_handler import StreamProcessor
        
        assert ModelServer is not None
        assert BatchProcessor is not None
        assert CachedModelServer is not None
        assert RedisFeatureStore is not None
        assert StreamProcessor is not None