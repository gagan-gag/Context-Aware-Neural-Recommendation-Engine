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
        user = list(users.values())[0] if users else {"user_id": user_id, "name": "Shopper", "preferred_category": "Dresses"}
    products = [Product.model_validate(product) for product in _load_json("products.json")]
    preferred_category = user["preferred_category"]
    ranked = sorted(products, key=lambda product: (product.category == preferred_category, product.article_id), reverse=True)[:k]
    recommendations = [
        Recommendation(
            **product.model_dump(exclude={"product_id", "product_name", "price_usd", "price_inr", "price_inr_formatted", "rating"}),
            product_id=product.product_id or product.article_id,
            product_name=product.product_name or product.name,
            price_usd=product.price_usd if product.price_usd is not None else round(product.price, 2),
            price_inr=product.price_inr if product.price_inr is not None else round(product.price * 83.5, 2),
            price_inr_formatted=product.price_inr_formatted or f"₹{int(product.price * 83.5):,}",
            rating=product.rating or round(4.5 + (index % 5) * 0.1, 1),
            score=round(0.95 - index * 0.04, 2),
            reason=(f"Matches your interest in {preferred_category.lower()}" if product.category == preferred_category else "Popular in the AVERO demo catalog")
        )
        for index, product in enumerate(ranked)
    ]
    return RecommendationResponse(user_id=user_id, mode=get_settings().mode, recommendations=recommendations)


def get_categories() -> list[str]:
    products = _load_json("products.json")
    categories = sorted({p["category"] for p in products if "category" in p})
    return categories


def get_trending(k: int = 12) -> RecommendationResponse:
    products = [Product.model_validate(p) for p in _load_json("products.json")]
    # Sort by popularity / price
    ranked = sorted(products, key=lambda p: p.price, reverse=True)[:k]
    recommendations = [
        Recommendation(
            **product.model_dump(exclude={"product_id", "product_name", "price_usd", "price_inr", "price_inr_formatted", "rating"}),
            product_id=product.product_id or product.article_id,
            product_name=product.product_name or product.name,
            price_usd=product.price_usd if product.price_usd is not None else round(product.price, 2),
            price_inr=product.price_inr if product.price_inr is not None else round(product.price * 83.5, 2),
            price_inr_formatted=product.price_inr_formatted or f"₹{int(product.price * 83.5):,}",
            rating=product.rating or round(4.6 + (index % 4) * 0.1, 1),
            score=round(0.98 - index * 0.03, 2),
            reason="Trending globally across H&M catalog"
        )
        for index, product in enumerate(ranked)
    ]
    return RecommendationResponse(user_id="trending", mode=get_settings().mode, recommendations=recommendations)


