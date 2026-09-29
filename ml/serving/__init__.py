"""Model serving module."""
from .model_server import ModelServer
from .batch_processor import BatchProcessor
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

__all__ = [
    "ModelServer",
    "BatchProcessor",
    "RecommendationRequest",
    "RecommendationResponse",
    "BatchRecommendationRequest",
    "BatchRecommendationResponse",
    "HealthResponse",
    "ModelInfoResponse",
    "app",
    "optimized_app"
]