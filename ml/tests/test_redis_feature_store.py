"""Tests for Redis feature store."""
import pytest
import numpy as np
from unittest.mock import MagicMock, patch
from ml.serving.redis_feature_store import RedisFeatureStore


class TestRedisFeatureStore:
    """Test Redis feature store."""
    
    @pytest.fixture
    def feature_store(self):
        """Setup feature store (mocked Redis)."""
        with patch('ml.serving.redis_feature_store.redis.Redis'):
            store = RedisFeatureStore()
            store.client = MagicMock()
            store.connected = True
            return store
    
    def test_serialize_deserialize(self, feature_store):
        """Test serialization."""
        data = np.array([0.1, 0.2, 0.3])
        
        serialized = feature_store._serialize(data)
        deserialized = feature_store._deserialize(serialized)
        
        assert np.allclose(data, deserialized)
    
    def test_cache_user_features(self, feature_store):
        """Test caching user features."""
        user_id = 1
        user_feat = np.random.randn(52).astype(np.float32)
        context_feat = np.random.randn(34).astype(np.float32)
        
        result = feature_store.cache_user_features(user_id, user_feat, context_feat)
        
        assert result == True
        feature_store.client.setex.assert_called_once()
    
    def test_cache_item_features(self, feature_store):
        """Test caching item features."""
        item_id = 100
        item_emb = np.random.randn(44).astype(np.float32)
        metadata = {"popularity": 0.8, "price": 29.99}
        
        result = feature_store.cache_item_features(item_id, item_emb, metadata)
        
        assert result == True
        feature_store.client.setex.assert_called_once()
    
    def test_get_user_features_miss(self, feature_store):
        """Test cache miss for user."""
        feature_store.client.get.return_value = None
        
        user_feat, context_feat = feature_store.get_user_features(1)
        
        assert user_feat is None
        assert context_feat is None
    
    def test_batch_cache_users(self, feature_store):
        """Test batch caching."""
        users_dict = {
            1: (np.random.randn(52), np.random.randn(34)),
            2: (np.random.randn(52), np.random.randn(34)),
            3: (np.random.randn(52), np.random.randn(34))
        }
        
        count = feature_store.cache_batch_user_features(users_dict)
        
        assert count == 3
    
    def test_cache_stats(self, feature_store):
        """Test cache statistics."""
        feature_store.client.info.return_value = {
            "used_memory": 1024 * 1024,
            "evicted_keys": 0,
            "keyspace_hits": 100,
            "keyspace_misses": 25
        }
        feature_store.client.dbsize.return_value = 50
        
        stats = feature_store.get_stats()
        
        assert stats["status"] == "connected"
        assert stats["num_keys"] == 50
    
    def test_clear_cache(self, feature_store):
        """Test clearing cache."""
        result = feature_store.clear()
        
        assert result == True
        feature_store.client.flushdb.assert_called_once()
    
    def test_disconnected_operations(self):
        """Test operations when disconnected."""
        with patch('ml.serving.redis_feature_store.redis.Redis', side_effect=Exception("Connection failed")):
            store = RedisFeatureStore()
            
            assert store.connected == False
            
            result = store.cache_user_features(1, np.array([0.1]*52), np.array([0.2]*34))
            assert result == False