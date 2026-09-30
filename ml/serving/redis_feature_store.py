"""Redis-based feature store for caching embeddings."""
import redis
import json
import numpy as np
from typing import Dict, Optional, List, Tuple
from datetime import datetime, timedelta
import pickle


class RedisFeatureStore:
    """Store and retrieve features from Redis."""
    
    def __init__(self, 
                 host: str = "localhost",
                 port: int = 6379,
                 db: int = 0,
                 default_ttl_hours: int = 24):
        """
        Args:
            host: Redis host
            port: Redis port
            db: Redis database number
            default_ttl_hours: Default cache TTL in hours
        """
        self.host = host
        self.port = port
        self.db = db
        self.default_ttl = default_ttl_hours * 3600  # Convert to seconds
        
        try:
            self.client = redis.Redis(
                host=host,
                port=port,
                db=db,
                decode_responses=False
            )
            # Test connection
            self.client.ping()
            self.connected = True
            print(f"✅ Connected to Redis at {host}:{port}")
        except Exception as e:
            print(f"⚠️ Redis connection failed: {e}")
            self.client = None
            self.connected = False
    
    def _serialize(self, data: np.ndarray) -> bytes:
        """Serialize numpy array."""
        return pickle.dumps(data)
    
    def _deserialize(self, data: bytes) -> np.ndarray:
        """Deserialize numpy array."""
        return pickle.loads(data)
    
    def cache_user_features(self, 
                           user_id: int,
                           user_features: np.ndarray,
                           context_features: np.ndarray,
                           ttl: Optional[int] = None) -> bool:
        """
        Cache user features.
        
        Args:
            user_id: User ID
            user_features: User embedding (52D)
            context_features: Context embedding (34D)
            ttl: Time-to-live in seconds (default: default_ttl)
        
        Returns:
            Success status
        """
        if not self.connected:
            return False
        
        try:
            key = f"user:{user_id}"
            
            # Combine features
            combined = np.concatenate([user_features, context_features])
            data = self._serialize(combined)
            
            # Set with TTL
            ttl = ttl or self.default_ttl
            self.client.setex(key, ttl, data)
            
            return True
        except Exception as e:
            print(f"❌ Error caching user features: {e}")
            return False
    
    def get_user_features(self, user_id: int) -> Tuple[Optional[np.ndarray], Optional[np.ndarray]]:
        """
        Get user features from cache.
        
        Args:
            user_id: User ID
        
        Returns:
            (user_features, context_features) or (None, None)
        """
        if not self.connected:
            return None, None
        
        try:
            key = f"user:{user_id}"
            data = self.client.get(key)
            
            if data is None:
                return None, None
            
            combined = self._deserialize(data)
            user_features = combined[:52]
            context_features = combined[52:]
            
            return user_features, context_features
        except Exception as e:
            print(f"❌ Error retrieving user features: {e}")
            return None, None
    
    def cache_item_features(self,
                           item_id: int,
                           item_embedding: np.ndarray,
                           metadata: Dict = None,
                           ttl: Optional[int] = None) -> bool:
        """
        Cache item features.
        
        Args:
            item_id: Item ID
            item_embedding: Item embedding (44D)
            metadata: Additional metadata (popularity, price, etc)
            ttl: Time-to-live in seconds
        
        Returns:
            Success status
        """
        if not self.connected:
            return False
        
        try:
            key = f"item:{item_id}"
            
            data = {
                "embedding": item_embedding,
                "metadata": metadata or {},
                "cached_at": datetime.now().isoformat()
            }
            
            serialized = self._serialize(data)
            ttl = ttl or self.default_ttl
            
            self.client.setex(key, ttl, serialized)
            
            return True
        except Exception as e:
            print(f"❌ Error caching item features: {e}")
            return False
    
    def get_item_features(self, item_id: int) -> Tuple[Optional[np.ndarray], Optional[Dict]]:
        """
        Get item features from cache.
        
        Args:
            item_id: Item ID
        
        Returns:
            (item_embedding, metadata) or (None, None)
        """
        if not self.connected:
            return None, None
        
        try:
            key = f"item:{item_id}"
            data = self.client.get(key)
            
            if data is None:
                return None, None
            
            decoded = self._deserialize(data)
            return decoded["embedding"], decoded["metadata"]
        except Exception as e:
            print(f"❌ Error retrieving item features: {e}")
            return None, None
    
    def cache_batch_user_features(self,
                                 user_features_dict: Dict[int, Tuple[np.ndarray, np.ndarray]],
                                 ttl: Optional[int] = None) -> int:
        """
        Cache multiple users at once.
        
        Args:
            user_features_dict: {user_id: (user_features, context_features)}
            ttl: Time-to-live in seconds
        
        Returns:
            Number of successfully cached users
        """
        count = 0
        for user_id, (user_feat, context_feat) in user_features_dict.items():
            if self.cache_user_features(user_id, user_feat, context_feat, ttl):
                count += 1
        
        return count
    
    def cache_batch_item_features(self,
                                 item_features_dict: Dict[int, Tuple[np.ndarray, Dict]],
                                 ttl: Optional[int] = None) -> int:
        """
        Cache multiple items at once.
        
        Args:
            item_features_dict: {item_id: (item_embedding, metadata)}
            ttl: Time-to-live in seconds
        
        Returns:
            Number of successfully cached items
        """
        count = 0
        for item_id, (item_emb, metadata) in item_features_dict.items():
            if self.cache_item_features(item_id, item_emb, metadata, ttl):
                count += 1
        
        return count
    
    def get_stats(self) -> Dict:
        """Get cache statistics."""
        if not self.connected:
            return {"status": "disconnected"}
        
        try:
            info = self.client.info()
            return {
                "status": "connected",
                "used_memory_mb": info.get("used_memory", 0) / 1024 / 1024,
                "num_keys": self.client.dbsize(),
                "evicted_keys": info.get("evicted_keys", 0),
                "hits": info.get("keyspace_hits", 0),
                "misses": info.get("keyspace_misses", 0)
            }
        except Exception as e:
            return {"status": "error", "error": str(e)}
    
    def clear(self) -> bool:
        """Clear all cache."""
        if not self.connected:
            return False
        
        try:
            self.client.flushdb()
            return True
        except Exception as e:
            print(f"❌ Error clearing cache: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """Delete single key."""
        if not self.connected:
            return False
        
        try:
            self.client.delete(key)
            return True
        except Exception as e:
            print(f"❌ Error deleting key: {e}")
            return False
    
    def exists(self, key: str) -> bool:
        """Check if key exists."""
        if not self.connected:
            return False
        
        return self.client.exists(key) > 0