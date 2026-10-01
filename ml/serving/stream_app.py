"""FastAPI endpoints for real-time streaming."""
from fastapi import FastAPI, WebSocket
from fastapi.responses import JSONResponse
import asyncio
import json
import numpy as np

from .stream_handler import StreamEvent, StreamProcessor
from .cached_model_server import CachedModelServer
from .batch_processor import BatchProcessor
from ml.models.integrated_two_tower import IntegratedTwoTowerModel
from ml.serving.redis_feature_store import RedisFeatureStore


app = FastAPI(
    title="RecomNova Streaming API",
    description="Real-time recommendation streaming",
    version="4.0.0"
)

# Global instances
stream_processor: StreamProcessor = None
cached_server: CachedModelServer = None


def init_streaming():
    """Initialize streaming."""
    global stream_processor, cached_server
    
    try:
        # Initialize feature store and cached server
        feature_store = RedisFeatureStore()
        
        model = IntegratedTwoTowerModel(
            user_embedding_dim=52,
            item_embedding_dim=44,
            context_embedding_dim=34,
            output_dim=32
        )
        
        candidate_embeddings = np.random.randn(10000, 32).astype(np.float32)
        
        cached_server = CachedModelServer(
            model=model,
            checkpoint_path="checkpoints/best_model_epoch_5.weights.h5",
            model_version="4.0",
            candidate_embeddings=candidate_embeddings,
            feature_store=feature_store
        )
        
        batch_processor = BatchProcessor(
            model_server=cached_server,
            batch_size=32,
            cache_enabled=True
        )
        
        # Create stream processor
        stream_processor = StreamProcessor(
            cached_server=cached_server,
            batch_processor=batch_processor,
            window_size=100
        )
        
        # Register handlers
        stream_processor.register_handler("view", stream_processor.handle_view_event)
        stream_processor.register_handler("click", stream_processor.handle_click_event)
        stream_processor.register_handler("purchase", stream_processor.handle_purchase_event)
        
        print("✅ Stream processor initialized")
    except Exception as e:
        print(f"❌ Error initializing streaming: {e}")
        raise


@app.on_event("startup")
async def startup_event():
    """Initialize on startup."""
    init_streaming()


@app.get("/health")
async def health_check():
    """Health check."""
    return {
        "status": "healthy",
        "component": "streaming",
        "processor_ready": stream_processor is not None
    }


@app.post("/events/view")
async def handle_view_event(
    user_id: int,
    item_id: int,
    context: dict = None
):
    """Handle view event."""
    if stream_processor is None:
        raise Exception("Stream processor not initialized")
    
    event = StreamEvent(
        event_type="view",
        user_id=user_id,
        item_id=item_id,
        data=context or {}
    )
    
    result = await stream_processor.handle_event(event)
    return result


@app.post("/events/click")
async def handle_click_event(
    user_id: int,
    item_id: int,
    position: int = None,
    context: dict = None
):
    """Handle click event."""
    if stream_processor is None:
        raise Exception("Stream processor not initialized")
    
    data = context or {}
    if position is not None:
        data["position"] = position
    
    event = StreamEvent(
        event_type="click",
        user_id=user_id,
        item_id=item_id,
        data=data
    )
    
    result = await stream_processor.handle_event(event)
    return result


@app.post("/events/purchase")
async def handle_purchase_event(
    user_id: int,
    item_id: int,
    value: float = None,
    context: dict = None
):
    """Handle purchase event."""
    if stream_processor is None:
        raise Exception("Stream processor not initialized")
    
    data = context or {}
    if value is not None:
        data["value"] = value
    
    event = StreamEvent(
        event_type="purchase",
        user_id=user_id,
        item_id=item_id,
        data=data
    )
    
    result = await stream_processor.handle_event(event)
    return result


@app.get("/stream-stats")
async def stream_stats():
    """Get streaming statistics."""
    if stream_processor is None:
        raise Exception("Stream processor not initialized")
    
    return stream_processor.get_stats()


@app.get("/event-buffer")
async def event_buffer():
    """Get current event buffer."""
    if stream_processor is None:
        raise Exception("Stream processor not initialized")
    
    return {
        "buffer": stream_processor.get_buffer(),
        "size": len(stream_processor.event_buffer)
    }


@app.post("/clear-buffer")
async def clear_buffer():
    """Clear event buffer."""
    if stream_processor is None:
        raise Exception("Stream processor not initialized")
    
    stream_processor.clear_buffer()
    return {"status": "buffer cleared"}


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "RecomNova Streaming API v4.0",
        "endpoints": [
            "POST /events/view",
            "POST /events/click",
            "POST /events/purchase",
            "GET /stream-stats",
            "GET /event-buffer"
        ]
    }