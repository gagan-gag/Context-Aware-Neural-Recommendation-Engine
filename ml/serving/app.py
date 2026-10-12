import logging
from datetime import datetime
from typing import Optional
import numpy as np

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn


from ml.serving.schemas import (
    RecommendationRequest,
    RecommendationResponse,
    RecommendationItem,
    HealthCheckResponse
)
from ml.serving.model_server import ModelServer
from ml.serving.currency import format_inr


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s: %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="AVERO Recommendation Engine",
    description="Context-Aware Neural Recommendation System with INR Pricing",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model server
model_server: Optional[ModelServer] = None


@app.on_event("startup")
def startup_event():
    """Initialize model on startup."""
    init_model()


def init_model():
    """Initialize model server."""
    global model_server
    try:
        model_server = ModelServer(model_path=None)
        model_server.model_loaded = True
        logger.info("✅ Model server initialized successfully")
    except Exception as e:
        logger.error(f"❌ Error initializing model: {str(e)}")
        raise


@app.get("/", tags=["Info"])
async def root():
    """Root endpoint."""
    return {
        "message": "AVERO Recommendation Engine",
        "service": "AVERO Recommendation Engine",
        "version": "1.0.0",
        "currency": "INR",
        "docs": "/docs",
        "endpoints": {
            "recommendations": "/recommendations",
            "health": "/health",
            "model_info": "/model_info"
        }
    }



@app.get("/health", response_model=HealthCheckResponse, tags=["Health"])
async def health_check():
    """Health check endpoint."""
    if model_server is None:
        raise HTTPException(
            status_code=503,
            detail="Model server not initialized"
        )
    
    return HealthCheckResponse(
        status="healthy" if model_server.model_loaded else "unhealthy",
        model_loaded=model_server.model_loaded,
        timestamp=datetime.now().isoformat()
    )


@app.get("/model-info", tags=["Info"])
@app.get("/model_info", tags=["Info"])
async def get_model_info():
    """Get model information."""
    if model_server is None:
        raise HTTPException(
            status_code=503,
            detail="Model server not initialized"
        )
    
    return model_server.get_model_info()



@app.post("/recommendations", response_model=RecommendationResponse, tags=["Recommendations"])
async def get_recommendations(request: RecommendationRequest):
    """
    Get recommendations for a user with INR pricing.
    
    Returns recommendations with prices in Indian Rupees (₹).
    
    Args:
        request: RecommendationRequest with user_id, features, and top_k
    
    Returns:
        RecommendationResponse with recommendations and INR prices
    """
    if model_server is None:
        raise HTTPException(
            status_code=503,
            detail="Model server not initialized"
        )
    
    try:
        # Validate features
        if request.user_features.shape != (52,):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid user_features shape: expected (52,), got {request.user_features.shape}"
            )
        
        if request.context_features.shape != (34,):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid context_features shape: expected (34,), got {request.context_features.shape}"
            )
        
        # Get recommendations
        recommendations = model_server.get_recommendations(
            user_id=request.user_id,
            user_features=np.array(request.user_features, dtype=np.float32),
            context_features=np.array(request.context_features, dtype=np.float32),
            top_k=request.top_k,
            currency="INR"
        )
        
        # Build response
        return RecommendationResponse(
            user_id=request.user_id,
            recommendations=[
                RecommendationItem(
                    item_id=rec["item_id"],
                    score=rec["score"],
                    price_usd=rec.get("price_usd"),
                    price_inr=rec.get("price_inr"),
                    currency="INR"
                )
                for rec in recommendations["recommendations"]
            ],
            currency="INR",
            timestamp=datetime.now().isoformat()
        )
    
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"❌ Error getting recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/recommendations/batch", tags=["Recommendations"])
async def get_batch_recommendations(
    user_ids: list,
    user_features_list: list,
    context_features_list: list,
    top_k: int = 10
):
    """
    Get recommendations for multiple users.
    
    Args:
        user_ids: List of user IDs
        user_features_list: List of user feature arrays (each 52D)
        context_features_list: List of context feature arrays (each 34D)
        top_k: Number of recommendations per user
    
    Returns:
        List of recommendation responses with INR prices
    """
    if model_server is None:
        raise HTTPException(
            status_code=503,
            detail="Model server not initialized"
        )
    
    try:
        # Validate input
        if len(user_ids) != len(user_features_list):
            raise HTTPException(
                status_code=400,
                detail="Number of user_ids must match user_features_list"
            )
        
        if len(user_ids) != len(context_features_list):
            raise HTTPException(
                status_code=400,
                detail="Number of user_ids must match context_features_list"
            )
        
        # Convert to numpy arrays
        user_features_arrays = [
            np.array(uf, dtype=np.float32) for uf in user_features_list
        ]
        context_features_arrays = [
            np.array(cf, dtype=np.float32) for cf in context_features_list
        ]
        
        # Get batch recommendations
        results = model_server.get_batch_recommendations(
            user_ids=user_ids,
            user_features_list=user_features_arrays,
            context_features_list=context_features_arrays,
            top_k=top_k,
            currency="INR"
        )
        
        # Format results
        formatted_results = []
        for result in results:
            formatted_results.append({
                "user_id": result["user_id"],
                "recommendations": [
                    {
                        "item_id": rec["item_id"],
                        "score": rec["score"],
                        "price_usd": rec.get("price_usd"),
                        "price_inr": rec.get("price_inr"),
                        "price_inr_formatted": rec.get("price_inr_formatted"),
                        "currency": "INR"
                    }
                    for rec in result["recommendations"]
                ],
                "currency": "INR",
                "count": result["count"]
            })
        
        return {
            "total_users": len(user_ids),
            "results": formatted_results,
            "timestamp": datetime.now().isoformat()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error getting batch recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/recommendations/user/{user_id}", tags=["Recommendations"])
async def get_user_recommendations(
    user_id: int,
    top_k: int = 10
):
    """
    Get recommendations for a user (simplified endpoint for testing).
    
    Note: This endpoint uses random features for testing purposes.
    
    Args:
        user_id: User ID
        top_k: Number of recommendations
    
    Returns:
        Recommendations with INR prices
    """
    if model_server is None:
        raise HTTPException(
            status_code=503,
            detail="Model server not initialized"
        )
    
    try:
        # Generate dummy features for testing
        user_features = np.random.randn(52).astype(np.float32)
        context_features = np.random.randn(34).astype(np.float32)
        
        # Get recommendations
        recommendations = model_server.get_recommendations(
            user_id=user_id,
            user_features=user_features,
            context_features=context_features,
            top_k=top_k,
            currency="INR"
        )
        
        return {
            "user_id": user_id,
            "recommendations": [
                {
                    "item_id": rec["item_id"],
                    "score": rec["score"],
                    "price_usd": f"${rec['price_usd']:.2f}",
                    "price_inr": rec.get("price_inr_formatted", "N/A"),
                    "currency": "INR"
                }
                for rec in recommendations["recommendations"]
            ],
            "currency": "INR",
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        logger.error(f"❌ Error getting user recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/test/recommendation", tags=["Testing"])
async def test_recommendation():
    """
    Test endpoint for quick validation.
    
    Returns test recommendations with INR pricing.
    """
    if model_server is None:
        raise HTTPException(
            status_code=503,
            detail="Model server not initialized"
        )
    
    try:
        # Generate test features
        user_features = np.random.randn(52).astype(np.float32)
        context_features = np.random.randn(34).astype(np.float32)
        
        # Get recommendations
        result = model_server.get_recommendations(
            user_id=999,
            user_features=user_features,
            context_features=context_features,
            top_k=5,
            currency="INR"
        )
        
        return {
            "status": "success",
            "test_result": {
                "user_id": result["user_id"],
                "currency": result["currency"],
                "recommendation_count": len(result["recommendations"]),
                "sample_recommendations": [
                    {
                        "item_id": rec["item_id"],
                        "score": f"{rec['score']:.3f}",
                        "price_inr": rec.get("price_inr_formatted", "N/A")
                    }
                    for rec in result["recommendations"][:3]
                ]
            },
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        logger.error(f"❌ Error in test endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handle HTTP exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.now().isoformat()
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions."""
    logger.error(f"❌ Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "status_code": 500,
            "timestamp": datetime.now().isoformat()
        }
    )


if __name__ == "__main__":
    logger.info("🚀 Starting AVERO Recommendation Engine API")
    logger.info("📊 Currency: Indian Rupees (INR)")
    logger.info("🌐 Available at: http://localhost:8000")
    
    uvicorn.run(
        "ml.serving.app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )