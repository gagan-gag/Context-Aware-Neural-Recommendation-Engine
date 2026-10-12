from typing import Annotated

from fastapi import APIRouter, Path, Query

from backend.app.core.config import get_settings
from backend.app.schemas.recommendations import HealthResponse, RecommendationResponse
from backend.app.services.demo_catalog import get_recommendations

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["system"])
def health() -> HealthResponse:
    settings = get_settings()
    return HealthResponse(status="ok", mode=settings.mode, service=settings.app_name)



@router.get("/api/recommendations", response_model=RecommendationResponse, tags=["recommendations"])
def recommendations_query(
    user_id: Annotated[str, Query(min_length=1, max_length=100)] = "test",
    top_k: Annotated[int, Query(ge=1, le=50)] = 10,
) -> RecommendationResponse:
    return get_recommendations(user_id, top_k)


@router.get("/api/v1/recommendations/{user_id}", response_model=RecommendationResponse, tags=["recommendations"])
def recommendations(user_id: Annotated[str, Path(min_length=1, max_length=100)], k: Annotated[int, Query(ge=1, le=50)] = 10) -> RecommendationResponse:
    return get_recommendations(user_id, k)


@router.get("/api/trending", response_model=RecommendationResponse, tags=["recommendations"])
def trending_products(k: Annotated[int, Query(ge=1, le=50)] = 12) -> RecommendationResponse:
    from backend.app.services.demo_catalog import get_trending
    return get_trending(k)


@router.get("/api/categories", tags=["recommendations"])
def catalog_categories() -> dict:
    from backend.app.services.demo_catalog import get_categories
    return {"categories": get_categories()}


