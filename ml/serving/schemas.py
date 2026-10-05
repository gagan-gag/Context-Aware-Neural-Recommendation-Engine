"""Pydantic schemas for recommendation serving."""
from typing import List, Optional
from pydantic import BaseModel, Field


class RecommendationItem(BaseModel):
    """Recommendation item with pricing."""
    
    item_id: int = Field(..., description="Item ID")
    score: float = Field(..., description="Recommendation score (0-1)", ge=0, le=1)
    price_usd: Optional[float] = Field(None, description="Price in USD")
    price_inr: Optional[float] = Field(None, description="Price in Indian Rupees")
    currency: str = Field(default="INR", description="Currency code")
    
    class Config:
        """Pydantic config."""
        json_schema_extra = {
            "example": {
                "item_id": 42,
                "score": 0.95,
                "price_usd": 100.0,
                "price_inr": 8350.0,
                "currency": "INR"
            }
        }


class RecommendationRequest(BaseModel):
    """Request for recommendations."""
    
    user_id: int = Field(..., description="User ID", gt=0)
    user_features: List[float] = Field(
        ...,
        description="User features (52D vector)",
        min_items=52,
        max_items=52
    )
    context_features: List[float] = Field(
        ...,
        description="Context features (34D vector)",
        min_items=34,
        max_items=34
    )
    top_k: int = Field(default=10, description="Number of recommendations", ge=0, le=100)
    
    class Config:
        """Pydantic config."""
        json_schema_extra = {
            "example": {
                "user_id": 1,
                "user_features": [0.1] * 52,
                "context_features": [0.2] * 34,
                "top_k": 10
            }
        }


class RecommendationResponse(BaseModel):
    """Response with recommendations."""
    
    user_id: int = Field(..., description="User ID")
    recommendations: List[RecommendationItem] = Field(
        ...,
        description="List of recommended items with pricing"
    )
    currency: str = Field(default="INR", description="Currency code")
    timestamp: str = Field(..., description="Response timestamp (ISO format)")
    
    class Config:
        """Pydantic config."""
        json_schema_extra = {
            "example": {
                "user_id": 1,
                "recommendations": [
                    {
                        "item_id": 42,
                        "score": 0.95,
                        "price_usd": 100.0,
                        "price_inr": 8350.0,
                        "currency": "INR"
                    }
                ],
                "currency": "INR",
                "timestamp": "2024-01-01T12:00:00"
            }
        }


class HealthCheckResponse(BaseModel):
    """Health check response."""
    
    status: str = Field(..., description="Service status (healthy/unhealthy)")
    model_loaded: bool = Field(..., description="Whether model is loaded")
    timestamp: str = Field(..., description="Timestamp (ISO format)")
    
    class Config:
        """Pydantic config."""
        json_schema_extra = {
            "example": {
                "status": "healthy",
                "model_loaded": True,
                "timestamp": "2024-01-01T12:00:00"
            }
        }


class BatchRecommendationRequest(BaseModel):
    """Request for batch recommendations."""
    
    user_ids: List[int] = Field(..., description="List of user IDs")
    user_features_list: List[List[float]] = Field(
        ...,
        description="List of user feature vectors (each 52D)"
    )
    context_features_list: List[List[float]] = Field(
        ...,
        description="List of context feature vectors (each 34D)"
    )
    top_k: int = Field(default=10, description="Recommendations per user", ge=0, le=100)
    
    class Config:
        """Pydantic config."""
        json_schema_extra = {
            "example": {
                "user_ids": [1, 2, 3],
                "user_features_list": [[0.1] * 52, [0.2] * 52, [0.3] * 52],
                "context_features_list": [[0.1] * 34, [0.2] * 34, [0.3] * 34],
                "top_k": 5
            }
        }


class BatchRecommendationResponse(BaseModel):
    """Response for batch recommendations."""
    
    total_users: int = Field(..., description="Total users processed")
    results: List[RecommendationResponse] = Field(
        ...,
        description="Recommendations for each user"
    )
    timestamp: str = Field(..., description="Response timestamp")
    
    class Config:
        """Pydantic config."""
        json_schema_extra = {
            "example": {
                "total_users": 3,
                "results": [
                    {
                        "user_id": 1,
                        "recommendations": [],
                        "currency": "INR",
                        "timestamp": "2024-01-01T12:00:00"
                    }
                ],
                "timestamp": "2024-01-01T12:00:00"
            }
        }


class ErrorResponse(BaseModel):
    """Error response."""
    
    error: str = Field(..., description="Error message")
    status_code: int = Field(..., description="HTTP status code")
    timestamp: str = Field(..., description="Error timestamp")
    
    class Config:
        """Pydantic config."""
        json_schema_extra = {
            "example": {
                "error": "Invalid features shape",
                "status_code": 400,
                "timestamp": "2024-01-01T12:00:00"
            }
        }


class ModelInfoResponse(BaseModel):
    """Model information response."""
    
    model_path: Optional[str] = Field(None, description="Path to model")
    model_loaded: bool = Field(..., description="Whether model is loaded")
    user_feature_dim: int = Field(default=52, description="User feature dimension")
    context_feature_dim: int = Field(default=34, description="Context feature dimension")
    num_items: int = Field(default=100, description="Number of items in catalog")
    currency: str = Field(default="INR", description="Currency for pricing")
    exchange_rate_usd_to_inr: float = Field(
        default=83.50,
        description="USD to INR exchange rate"
    )
    
    class Config:
        """Pydantic config."""
        json_schema_extra = {
            "example": {
                "model_path": "checkpoints/model_v1.0.h5",
                "model_loaded": True,
                "user_feature_dim": 52,
                "context_feature_dim": 34,
                "num_items": 100,
                "currency": "INR",
                "exchange_rate_usd_to_inr": 83.50
            }
        }