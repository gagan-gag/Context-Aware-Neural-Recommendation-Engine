import json
from functools import lru_cache

from fastapi import HTTPException, status

from backend.app.core.config import get_settings
from backend.app.schemas.recommendations import Product, Recommendation, RecommendationResponse


@lru_cache
def _load_json(filename: str) -> list[dict]:
    path = get_settings().demo_data_dir / filename
    if not path.exists():
        raise RuntimeError(f"Demo data file is missing: {path}")
    return json.loads(path.read_text(encoding="utf-8"))


def get_recommendations(user_id: str, k: int) -> RecommendationResponse:
    users = {user["user_id"]: user for user in _load_json("users.json")}
    user = users.get(user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Unknown user_id: {user_id}")
    products = [Product.model_validate(product) for product in _load_json("products.json")]
    preferred_category = user["preferred_category"]
    ranked = sorted(products, key=lambda product: (product.category == preferred_category, product.article_id), reverse=True)[:k]
    recommendations = [
        Recommendation(**product.model_dump(), score=round(0.95 - index * 0.06, 2), reason=(f"Matches your interest in {preferred_category.lower()}" if product.category == preferred_category else "Popular in the RecomNova demo catalog"))
        for index, product in enumerate(ranked)
    ]
    return RecommendationResponse(user_id=user_id, mode=get_settings().mode, recommendations=recommendations)
