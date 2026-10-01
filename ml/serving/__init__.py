"""Model serving module."""
from .model_server import ModelServer
from .batch_processor import BatchProcessor
from .cached_model_server import CachedModelServer
from .redis_feature_store import RedisFeatureStore
from .stream_handler import StreamEvent, StreamProcessor
from .schemas import (
    RecommendationRequest,
    RecommendationResponse,
    BatchRecommendationRequest,
    BatchRecommendationResponse,
    HealthResponse,
    ModelInfoResponse
)
from .app import app
from .optimized_app import app as optimized_app
from .cached_app import app as cached_app
from .stream_app import app as stream_app

__all__ = [
    "ModelServer",
    "BatchProcessor",
    "CachedModelServer",
    "RedisFeatureStore",
    "StreamEvent",
    "StreamProcessor",
    "RecommendationRequest",
    "RecommendationResponse",
    "BatchRecommendationRequest",
    "BatchRecommendationResponse",
    "HealthResponse",
    "ModelInfoResponse",
    "app",
    "optimized_app",
    "cached_app",
    "stream_app"
]