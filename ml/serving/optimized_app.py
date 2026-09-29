"""Optimized FastAPI application with batch processing."""
from fastapi import FastAPI, BackgroundTasks
import numpy as np
from typing import List
import asyncio
from .schemas import (
    RecommendationRequest,
    RecommendationResponse,
    RecommendationItem,
    BatchRecommendationRequest,
    BatchRecommendationResponse,
    HealthResponse,
    ModelInfoResponse
)
from .batch_processor import BatchProcessor
from .model_server import ModelServer
from ml.models.integrated_two_tower import IntegratedTwoTowerModel


# Initialize app
app = FastAPI(
    title="RecomNova API (Optimized)",
    description="High-performance recommendation engine",
    version="2.0.0"
)

# Global instances
model_server: ModelServer = None
batch_processor: BatchProcessor = None


def init_model():
    """Initialize model."""
    global model_server, batch_processor
    
    try:
        model = IntegratedTwoTowerModel(
            user_embedding_dim=52,
            item_embedding_dim=44,
            context_embedding_dim=34,
            output_dim=32
        )
        
        # Mock checkpoint
        candidate_embeddings = np.random.randn(10000, 32).astype(np.float32)
        
        # Initialize server
        model_server = ModelServer(
            model=model,
            checkpoint_path="checkpoints/best_model_epoch_5.weights.h5",
            model_version="2.0",
            candidate_embeddings=candidate_embeddings
        )
        
        # Initialize batch processor
        batch_processor = BatchProcessor(
            model_server=model_server,
            batch_size=32,
            max_wait_ms=100,
            cache_enabled=True
        )
        
        print("✅ Optimized model server initialized")
    except Exception as e:
        print(f"❌ Error initializing model: {e}")
        raise


@app.on_event("startup")
async def startup_event():
    """Initialize on startup."""
    init_model()


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    if model_server is None:
        raise Exception("Model not initialized")
    
    return model_server.get_health_status()


@app.get("/model-info", response_model=ModelInfoResponse)
async def model_info():
    """Get model information."""
    if model_server is None:
        raise Exception("Model not initialized")
    
    return model_server.get_model_info()


@app.post("/recommendations", response_model=RecommendationResponse)
async def get_recommendations(request: RecommendationRequest):
    """Get recommendations for a user."""
    if model_server is None:
        raise Exception("Model not initialized")
    
    result = model_server.get_recommendations(
        user_id=request.user_id,
        user_features=np.array(request.user_features),
        context_features=np.array(request.context_features),
        k=request.k
    )
    
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


@app.post("/batch-recommendations-optimized", response_model=BatchRecommendationResponse)
async def batch_recommendations_optimized(request: BatchRecommendationRequest):
    """Optimized batch recommendations with caching."""
    if batch_processor is None:
        raise Exception("Batch processor not initialized")
    
    # Add all requests to queue
    for req in request.requests:
        await batch_processor.add_request({
            "user_id": req.user_id,
            "user_features": req.user_features,
            "context_features": req.context_features,
            "k": req.k
        })
    
    # Process batch
    results = await batch_processor.process_batch()
    
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
        for res in results
    ]
    
    return BatchRecommendationResponse(
        results=responses,
        total_time_ms=sum(batch_processor.get_latency_stats().values())
    )


@app.get("/cache-stats")
async def cache_stats():
    """Get cache statistics."""
    if batch_processor is None:
        raise Exception("Batch processor not initialized")
    
    return batch_processor.get_cache_stats()


@app.get("/latency-stats")
async def latency_stats():
    """Get latency statistics."""
    if batch_processor is None:
        raise Exception("Batch processor not initialized")
    
    return batch_processor.get_latency_stats()


@app.post("/clear-cache")
async def clear_cache():
    """Clear response cache."""
    if batch_processor is None:
        raise Exception("Batch processor not initialized")
    
    batch_processor.clear_cache()
    return {"status": "cache cleared"}


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "RecomNova API v2.0 (Optimized)",
        "docs": "/docs",
        "health": "/health",
        "features": [
            "Batch processing (32 requests)",
            "Response caching",
            "Latency tracking (p50/p95/p99)",
            "Cache statistics"
        ]
    }