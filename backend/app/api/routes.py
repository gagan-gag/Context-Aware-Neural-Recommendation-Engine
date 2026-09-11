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


@router.get("/api/v1/recommendations/{user_id}", response_model=RecommendationResponse, tags=["recommendations"])
def recommendations(user_id: Annotated[str, Path(min_length=1, max_length=100)], k: Annotated[int, Query(ge=1, le=20)] = 10) -> RecommendationResponse:
    return get_recommendations(user_id, k)
