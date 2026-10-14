from typing import Annotated

from fastapi import APIRouter, Path, Query, status

from backend.app.core.config import get_settings
from backend.app.schemas.recommendations import (
    HealthResponse,
    Product,
    ProductCreate,
    ProductUpdate,
    RecommendationResponse,
)
from backend.app.services.demo_catalog import (
    add_custom_product,
    delete_custom_product,
    get_all_products,
    get_categories,
    get_custom_products,
    get_recommendations,
    get_trending,
    update_custom_product,
)

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["system"])
def health() -> HealthResponse:
    settings = get_settings()
    return HealthResponse(status="ok", mode=settings.mode, service=settings.app_name)


@router.get("/api/health", response_model=HealthResponse, tags=["system"])
def api_health() -> HealthResponse:
    settings = get_settings()
    return HealthResponse(status="ok", mode=settings.mode, service=settings.app_name)


@router.get("/api/recommendations", response_model=RecommendationResponse, tags=["recommendations"])
def recommendations_query(
    user_id: Annotated[str, Query(min_length=1, max_length=100)] = "avero-guest-001",
    top_k: Annotated[int, Query(ge=1, le=50)] = 10,
) -> RecommendationResponse:
    return get_recommendations(user_id, top_k)


@router.get("/api/v1/recommendations/{user_id}", response_model=RecommendationResponse, tags=["recommendations"])
def recommendations(
    user_id: Annotated[str, Path(min_length=1, max_length=100)],
    k: Annotated[int, Query(ge=1, le=50)] = 10,
) -> RecommendationResponse:
    return get_recommendations(user_id, k)


@router.get("/api/trending", response_model=RecommendationResponse, tags=["recommendations"])
def trending_products(k: Annotated[int, Query(ge=1, le=50)] = 12) -> RecommendationResponse:
    return get_trending(k)


@router.get("/api/categories", tags=["recommendations"])
def catalog_categories() -> dict:
    return {"categories": get_categories()}


# ─── Product Management Endpoints ──────────────────────────────────────────

@router.get("/api/products", response_model=list[Product], tags=["products"])
def list_products() -> list[Product]:
    return get_all_products()


@router.get("/api/custom-products", tags=["products"])
def list_custom_products() -> list[dict]:
    return get_custom_products()


@router.post("/api/products", response_model=Product, status_code=status.HTTP_201_CREATED, tags=["products"])
def create_product(payload: ProductCreate) -> Product:
    return add_custom_product(payload)


@router.put("/api/products/{article_id}", response_model=Product, tags=["products"])
def edit_product(
    article_id: Annotated[str, Path(min_length=3, max_length=50)],
    payload: ProductUpdate,
) -> Product:
    return update_custom_product(article_id, payload)


@router.delete("/api/products/{article_id}", tags=["products"])
def remove_product(
    article_id: Annotated[str, Path(min_length=3, max_length=50)]
) -> dict:
    return delete_custom_product(article_id)
