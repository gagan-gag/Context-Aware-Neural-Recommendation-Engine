import json
from pathlib import Path
from functools import lru_cache

from fastapi import HTTPException, status

from backend.app.core.config import get_settings
from backend.app.schemas.recommendations import (
    Product,
    ProductCreate,
    ProductUpdate,
    Recommendation,
    RecommendationResponse,
)


@lru_cache
def _load_json(filename: str) -> list[dict]:
    path = get_settings().demo_data_dir / filename
    if not path.exists():
        raise RuntimeError(f"Demo data file is missing: {path}")
    return json.loads(path.read_text(encoding="utf-8"))


def _get_custom_products_path() -> Path:
    return get_settings().demo_data_dir / "custom_products.json"


def get_custom_products() -> list[dict]:
    path = _get_custom_products_path()
    if not path.exists():
        return []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        return data if isinstance(data, list) else []
    except Exception:
        return []


def _save_custom_products(products: list[dict]) -> None:
    path = _get_custom_products_path()
    path.write_text(json.dumps(products, indent=2, ensure_ascii=False), encoding="utf-8")


def get_all_products() -> list[Product]:
    base_products = [Product.model_validate(p) for p in _load_json("products.json")]
    custom_raw = get_custom_products()
    custom_products = [
        Product.model_validate({**p, "is_custom": True})
        for p in custom_raw
    ]
    return base_products + custom_products


def add_custom_product(payload: ProductCreate) -> Product:
    existing_all = get_all_products()
    if any(p.article_id == payload.article_id for p in existing_all):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product with article ID {payload.article_id} already exists."
        )

    price_inr = round(payload.price * 83.5, 2)
    new_item = {
        "article_id": payload.article_id,
        "name": payload.name,
        "product_name": payload.name,
        "category": payload.category,
        "color": payload.color,
        "price": payload.price,
        "price_usd": payload.price,
        "price_inr": price_inr,
        "price_inr_formatted": f"₹{int(price_inr):,}",
        "image_url": payload.image_url,
        "product_id": payload.article_id,
        "rating": 4.8,
        "is_custom": True,
        "description": payload.description or f"Handcrafted {payload.category.lower()} by AVERO design team.",
        "brand": "AVERO Atelier",
        "reason": "Newly indexed in AVERO catalog; candidate for next model retraining cycle",
    }

    current = get_custom_products()
    current.append(new_item)
    _save_custom_products(current)
    return Product.model_validate(new_item)


def update_custom_product(article_id: str, payload: ProductUpdate) -> Product:
    current = get_custom_products()
    index = next((i for i, p in enumerate(current) if p.get("article_id") == article_id), None)
    if index is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Custom product with article ID {article_id} not found."
        )

    item = current[index]
    if payload.name is not None:
        item["name"] = payload.name
        item["product_name"] = payload.name
    if payload.category is not None:
        item["category"] = payload.category
    if payload.color is not None:
        item["color"] = payload.color
    if payload.price is not None:
        item["price"] = payload.price
        item["price_usd"] = payload.price
        price_inr = round(payload.price * 83.5, 2)
        item["price_inr"] = price_inr
        item["price_inr_formatted"] = f"₹{int(price_inr):,}"
    if payload.image_url is not None:
        item["image_url"] = payload.image_url
    if payload.description is not None:
        item["description"] = payload.description

    current[index] = item
    _save_custom_products(current)
    return Product.model_validate(item)


def delete_custom_product(article_id: str) -> dict:
    current = get_custom_products()
    index = next((i for i, p in enumerate(current) if p.get("article_id") == article_id), None)
    if index is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Custom product with article ID {article_id} not found."
        )
    removed = current.pop(index)
    _save_custom_products(current)
    return {"status": "deleted", "article_id": article_id, "name": removed.get("name")}


def get_recommendations(user_id: str, k: int) -> RecommendationResponse:
    users = {user["user_id"]: user for user in _load_json("users.json")}
    user = users.get(user_id)
    if user is None:
        if user_id in ("test", "demo", "default", "guest", "avero-guest-session", "avero-guest-001"):
            user = list(users.values())[0] if users else {"user_id": user_id, "name": "Guest", "preferred_category": "Dresses"}
        else:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Unknown user_id: {user_id}")

    products = get_all_products()
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
            reason=(
                f"Matches your interest in {preferred_category.lower()}"
                if product.category == preferred_category
                else ("Custom AVERO product added to catalog" if product.is_custom else "Popular in the AVERO catalog")
            )
        )
        for index, product in enumerate(ranked)
    ]
    return RecommendationResponse(user_id=user_id, mode=get_settings().mode, recommendations=recommendations)


def get_categories() -> list[str]:
    products = get_all_products()
    categories = sorted({p.category for p in products if p.category})
    return categories


def get_trending(k: int = 12) -> RecommendationResponse:
    products = get_all_products()
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
            reason="Trending globally across AVERO catalog"
        )
        for index, product in enumerate(ranked)
    ]
    return RecommendationResponse(user_id="trending", mode=get_settings().mode, recommendations=recommendations)
