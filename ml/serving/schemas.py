"""Request/response schemas for serving API."""
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional


class RecommendationRequest(BaseModel):
    """Request for user recommendations."""
    
    user_id: int = Field(..., description="User ID")
    user_features: List[float] = Field(..., description="User embedding (52D)")
    context_features: List[float] = Field(..., description="Context embedding (34D)")
    k: int = Field(10, description="Number of recommendations")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "user_id": 123,
                "user_features": [0.1, 0.2, 0.3],
                "context_features": [0.5, 0.6, 0.7],
                "k": 10
            }
        }
    )


class RecommendationItem(BaseModel):
    """Single recommendation."""
    
    item_id: int = Field(..., description="Recommended item ID")
    score: float = Field(..., description="Recommendation score [0, 1]")
    rank: int = Field(..., description="Rank position")


class RecommendationResponse(BaseModel):
    """Response with recommendations."""
    
    user_id: int
    recommendations: List[RecommendationItem]
    timestamp: str
    model_version: str


class BatchRecommendationRequest(BaseModel):
    """Request for batch recommendations."""
    
    requests: List[RecommendationRequest]


class BatchRecommendationResponse(BaseModel):
    """Response for batch recommendations."""
    
    results: List[RecommendationResponse]
    total_time_ms: float


class HealthResponse(BaseModel):
    """Health check response."""
    
    status: str = Field(..., description="API status (healthy/unhealthy)")
    model_loaded: bool
    model_version: str
    timestamp: str


class ModelInfoResponse(BaseModel):
    """Model metadata response."""
    
    model_name: str
    model_version: str
    checkpoint_path: str
    user_embedding_dim: int
    item_embedding_dim: int
    context_embedding_dim: int
    query_embedding_dim: int
    training_date: Optional[str] = None
    evaluation_metrics: dict