"""FastAPI with Redis feature caching."""
from fastapi import FastAPI
import numpy as np
from .schemas import (
    RecommendationRequest,
    RecommendationResponse,
    RecommendationItem
)
from .cached_model_server import CachedModelServer
from .redis_feature_store import RedisFeatureStore
from ml.models.integrated_two_tower import IntegratedTwoTowerModel


app = FastAPI(
    title="RecomNova API (Cached)",
    description="Recommendations with Redis feature caching",
    version="3.0.0"
)

# Global instances
cached_server: CachedModelServer = None
feature_store: RedisFeatureStore = None


def init_cached_server():
    """Initialize cached server."""
    global cached_server, feature_store
    
    try:
        # Initialize feature store
        feature_store = RedisFeatureStore(
            host="localhost",
            port=6379,
            default_ttl_hours=24
        )
        
        # Create model
        model = IntegratedTwoTowerModel(
            user_embedding_dim=52,
            item_embedding_dim=44,
            context_embedding_dim=34,
            output_dim=32
        )
        
        candidate_embeddings = np.random.randn(10000, 32).astype(np.float32)
        
        # Initialize cached server
        cached_server = CachedModelServer(
            model=model,
            checkpoint_path="checkpoints/best_model_epoch_5.weights.h5",
            model_version="3.0",
            candidate_embeddings=candidate_embeddings,
            feature_store=feature_store
        )
        
        print("✅ Cached model server initialized")
    except Exception as e:
        print(f"❌ Error initializing cached server: {e}")
        raise


@app.on_event("startup")
async def startup_event():
    """Initialize on startup."""
    init_cached_server()


@app.get("/health")
async def health_check():
    """Health check."""
    return {
        "status": "healthy",
        "model_loaded": cached_server.model_loaded if cached_server else False,
        "cache_connected": feature_store.connected if feature_store else False
    }


@app.post("/recommendations-cached", response_model=RecommendationResponse)
async def get_recommendations_cached(request: RecommendationRequest):
    """Get recommendations with caching."""
    if cached_server is None:
        raise Exception("Model not initialized")
    
    result = cached_server.get_recommendations(
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


@app.get("/cache-stats")
async def cache_stats():
    """Get cache statistics."""
    if cached_server is None:
        raise Exception("Model not initialized")
    
    return cached_server.get_cache_stats()


@app.post("/warm-cache")
async def warm_cache(user_ids: list):
    """Pre-populate cache."""
    if cached_server is None:
        raise Exception("Model not initialized")
    
    # Mock: In production, fetch actual features
    user_features_dict = {}
    for uid in user_ids:
        user_features_dict[uid] = (
            np.random.randn(52).astype(np.float32),
            np.random.randn(34).astype(np.float32)
        )
    
    cached = cached_server.warm_cache(user_ids, user_features_dict)
    
    return {"users_cached": cached, "total": len(user_ids)}


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "RecomNova API v3.0 (Cached)",
        "docs": "/docs",
        "features": ["Redis caching", "Feature warm-loading", "Cache statistics"]
    }