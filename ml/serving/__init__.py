"""Serving module for recommendations."""
from .schemas import (
    RecommendationItem,
    RecommendationRequest,
    RecommendationResponse,
    HealthCheckResponse,
    BatchRecommendationRequest,
    BatchRecommendationResponse,
    ErrorResponse,
    ModelInfoResponse
)
from .model_server import ModelServer
from .currency import CurrencyConverter, convert_usd_to_inr, format_inr
from .stream_handler import StreamEvent, StreamProcessor

__all__ = [
    "RecommendationItem",
    "RecommendationRequest",
    "RecommendationResponse",
    "HealthCheckResponse",
    "BatchRecommendationRequest",
    "BatchRecommendationResponse",
    "ErrorResponse",
    "ModelInfoResponse",
    "ModelServer",
    "CurrencyConverter",
    "convert_usd_to_inr",
    "format_inr",
    "StreamEvent",
    "StreamProcessor",
]