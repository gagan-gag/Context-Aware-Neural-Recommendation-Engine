"""FastAPI application for model serving."""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import numpy as np
from typing import List
import os

from .schemas import (
    RecommendationRequest,
    RecommendationResponse,
    RecommendationItem,
    BatchRecommendationRequest,
    BatchRecommendationResponse,
    HealthResponse,
    ModelInfoResponse
)
from .model_server import ModelServer
from ml.models.integrated_two_tower import IntegratedTwoTowerModel


# Initialize FastAPI app
app = FastAPI(
    title="RecomNova API",
    description="Context-Aware Neural Recommendation Engine",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model server
model_server: ModelServer = None


def init_model():
    """Initialize model on startup."""
    global model_server
    
    try:
        # Create model
        model = IntegratedTwoTowerModel(
            user_embedding_dim=52,
            item_embedding_dim=44,
            context_embedding_dim=34,
            output_dim=32
        )
        
        # Load checkpoint
        checkpoint_path = os.getenv(
            "CHECKPOINT_PATH",
            "checkpoints/best_model_epoch_5.weights.h5"
        )
        
        # Load candidate embeddings (placeholder)
        candidate_embeddings = np.random.randn(10000, 32).astype(np.float32)
        
        # Initialize server
        model_server = ModelServer(
            model=model,
            checkpoint_path=checkpoint_path,
            model_version="1.0",
            candidate_embeddings=candidate_embeddings
        )
        
        print("✅ Model server initialized")
    except Exception as e:
        print(f"❌ Error initializing model: {e}")
        raise


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "RecomNova API v1.0",
        "docs": "/docs",
        "health": "/health"
    }


# Initialize on startup
init_model()


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    if model_server is None:
        raise HTTPException(status_code=503, detail="Model not initialized")
    
    return model_server.get_health_status()


@app.get("/model-info", response_model=ModelInfoResponse)
async def model_info():
    """Get model information."""
    if model_server is None:
        raise HTTPException(status_code=503, detail="Model not initialized")
    
    return model_server.get_model_info()


@app.post("/recommendations", response_model=RecommendationResponse)
async def get_recommendations(request: RecommendationRequest):
    """
    Get recommendations for a user.
    
    Args:
        request: User features and context
    
    Returns:
        Top-K recommendations with scores
    """
    if model_server is None:
        raise HTTPException(status_code=503, detail="Model not initialized")
    
    try:
        result = model_server.get_recommendations(
            user_id=request.user_id,
            user_features=np.array(request.user_features),
            context_features=np.array(request.context_features),
            k=request.k
        )
        
        # Convert to response model
        recommendations = [
            RecommendationItem(
                item_id=rec["item_id"],
                score=rec["score"],
                rank=rec["rank"]
            )
            for rec in result["recommendations"]
        ]
        
        return RecommendationResponse(
            user_id=result["user_id"],
            recommendations=recommendations,
            timestamp=result["timestamp"],
            model_version=result["model_version"]
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/batch-recommendations", response_model=BatchRecommendationResponse)
async def batch_recommendations(request: BatchRecommendationRequest):
    """
    Get recommendations for multiple users.
    
    Args:
        request: Batch of user requests
    
    Returns:
        Recommendations for all users with timing
    """
    if model_server is None:
        raise HTTPException(status_code=503, detail="Model not initialized")
    
    try:
        requests_data = [
            {
                "user_id": req.user_id,
                "user_features": req.user_features,
                "context_features": req.context_features
            }
            for req in request.requests
        ]
        
        result = model_server.get_batch_recommendations(
            requests=requests_data,
            k=request.requests[0].k if request.requests else 10
        )
        
        # Convert to response model
        responses = [
            RecommendationResponse(
                user_id=res["user_id"],
                recommendations=[
                    RecommendationItem(
                        item_id=rec["item_id"],
                        score=rec["score"],
                        rank=rec["rank"]
                    )
                    for rec in res["recommendations"]
                ],
                timestamp=res["timestamp"],
                model_version=res["model_version"]
            )
            for res in result["results"]
        ]
        
        return BatchRecommendationResponse(
            results=responses,
            total_time_ms=result["total_time_ms"]
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "RecomNova API v1.0",
        "docs": "/docs",
        "health": "/health"
    }