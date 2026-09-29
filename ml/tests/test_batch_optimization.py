"""Tests for batch processing optimization."""
import pytest
import asyncio
import numpy as np
from ml.serving.batch_processor import BatchProcessor
from ml.models.integrated_two_tower import IntegratedTwoTowerModel
from ml.serving.model_server import ModelServer


class TestBatchProcessor:
    """Test batch processor."""
    
    @pytest.fixture
    def batch_processor(self):
        """Setup batch processor."""
        model = IntegratedTwoTowerModel(
            user_embedding_dim=52,
            item_embedding_dim=44,
            context_embedding_dim=34,
            output_dim=32
        )
        
        candidate_embeddings = np.random.randn(1000, 32).astype(np.float32)
        
        server = ModelServer(
            model=model,
            checkpoint_path="fake_checkpoint.h5",
            model_version="2.0",
            candidate_embeddings=candidate_embeddings
        )
        server.model_loaded = True
        
        processor = BatchProcessor(
            model_server=server,
            batch_size=32,
            max_wait_ms=100,
            cache_enabled=True
        )
        
        return processor
    
    @pytest.mark.asyncio
    async def test_add_single_request(self, batch_processor):
        """Test adding single request."""
        request = {
            "user_id": 1,
            "user_features": np.random.randn(52).tolist(),
            "context_features": np.random.randn(34).tolist(),
            "k": 10
        }
        
        await batch_processor.add_request(request)
        
        assert len(batch_processor.queue) == 1
    
    @pytest.mark.asyncio
    async def test_add_multiple_requests(self, batch_processor):
        """Test adding multiple requests."""
        for i in range(5):
            request = {
                "user_id": i,
                "user_features": np.random.randn(52).tolist(),
                "context_features": np.random.randn(34).tolist(),
                "k": 10
            }
            await batch_processor.add_request(request)
        
        assert len(batch_processor.queue) == 5
    
    @pytest.mark.asyncio
    async def test_process_batch(self, batch_processor):
        """Test batch processing."""
        # Add requests
        for i in range(3):
            request = {
                "user_id": i,
                "user_features": np.random.randn(52).tolist(),
                "context_features": np.random.randn(34).tolist(),
                "k": 10
            }
            await batch_processor.add_request(request)
        
        # Process
        results = await batch_processor.process_batch()
        
        assert len(results) == 3
        assert all("recommendations" in r for r in results)
    
    def test_hash_request(self, batch_processor):
        """Test request hashing."""
        request1 = {
            "user_id": 1,
            "user_features": [0.1] * 52,
            "context_features": [0.5] * 34
        }
        
        request2 = {
            "user_id": 1,
            "user_features": [0.1] * 52,
            "context_features": [0.5] * 34
        }
        
        hash1 = batch_processor._hash_request(request1)
        hash2 = batch_processor._hash_request(request2)
        
        assert hash1 == hash2
    
    def test_cache_stats_initial(self, batch_processor):
        """Test cache stats initialization."""
        stats = batch_processor.get_cache_stats()
        
        assert stats["hits"] == 0
        assert stats["misses"] == 0
        assert stats["total"] == 0
        assert stats["hit_rate"] == 0.0
    
    def test_latency_stats_initial(self, batch_processor):
        """Test latency stats initialization."""
        stats = batch_processor.get_latency_stats()
        
        assert "p50" in stats
        assert "p95" in stats
        assert "p99" in stats
        assert "mean" in stats
    
    def test_clear_cache(self, batch_processor):
        """Test cache clearing."""
        batch_processor.cache["test_key"] = {"data": "test"}
        
        assert len(batch_processor.cache) == 1
        
        batch_processor.clear_cache()
        
        assert len(batch_processor.cache) == 0