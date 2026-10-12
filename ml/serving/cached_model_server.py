"""Model server with feature caching."""
import tensorflow as tf
import numpy as np
from typing import Dict, Tuple
from datetime import datetime
from .model_server import ModelServer
from .redis_feature_store import RedisFeatureStore


class CachedModelServer(ModelServer):
    """ModelServer with Redis feature caching."""
    
    def __init__(self,
                 model: tf.keras.Model,
                 checkpoint_path: str,
                 model_version: str = "3.0",
                 candidate_embeddings: np.ndarray = None,
                 feature_store: RedisFeatureStore = None):
        """
        Args:
            model: IntegratedTwoTowerModel
            checkpoint_path: Path to model weights
            model_version: Model version string
            candidate_embeddings: Pre-computed item embeddings
            feature_store: RedisFeatureStore instance
        """
        super().__init__(
            model=model,
            checkpoint_path=checkpoint_path,
            model_version=model_version,
            candidate_embeddings=candidate_embeddings
        )
        
        # Feature store (create default if not provided)
        self.feature_store = feature_store or RedisFeatureStore()
        
        # Cache stats
        self.cache_hits = 0
        self.cache_misses = 0
    
    def get_recommendations(self,
                           user_id: int,
                           user_features: np.ndarray = None,
                           context_features: np.ndarray = None,
                           k: int = 10) -> Dict:
        """
        Get recommendations with feature caching.
        
        If features not provided, try to retrieve from cache.
        
        Args:
            user_id: User ID
            user_features: User embedding (52D) [optional - from cache if None]
            context_features: Context embedding (34D) [optional - from cache if None]
            k: Number of recommendations
        
        Returns:
            dict: Recommendations with scores
        """
        # Try to get from cache if not provided
        if user_features is None or context_features is None:
            cached_user, cached_context = self.feature_store.get_user_features(user_id)
            
            if cached_user is not None and cached_context is not None:
                user_features = cached_user
                context_features = cached_context
                self.cache_hits += 1
            else:
                self.cache_misses += 1
                # Return error if no features available
                if user_features is None or context_features is None:
                    raise ValueError(f"User {user_id} not found in cache and features not provided")
        else:
            # Features provided - cache them
            self.feature_store.cache_user_features(
                user_id, user_features, context_features
            )
            self.cache_misses += 1
        
        # Call parent implementation
        return super().get_recommendations(
            user_id=user_id,
            user_features=user_features,
            context_features=context_features,
            k=k
        )
    
    def get_cache_stats(self) -> Dict:
        """Get cache statistics."""
        total = self.cache_hits + self.cache_misses
        hit_rate = (self.cache_hits / total * 100) if total > 0 else 0.0
        
        redis_stats = self.feature_store.get_stats()
        
        return {
            "server_hits": self.cache_hits,
            "server_misses": self.cache_misses,
            "total": total,
            "hit_rate": hit_rate,
            "redis": redis_stats
        }
    
    def warm_cache(self,
                  user_ids: list,
                  user_features_dict: Dict[int, Tuple[np.ndarray, np.ndarray]]) -> int:
        """
        Pre-populate cache with user features.
        
        Args:
            user_ids: List of user IDs to cache
            user_features_dict: {user_id: (user_features, context_features)}
        
        Returns:
            Number of users cached
        """
        return self.feature_store.cache_batch_user_features(user_features_dict)