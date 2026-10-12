from pydantic import BaseModel, Field


class Product(BaseModel):
    article_id: str
    name: str
    category: str
    color: str
    price: float = Field(ge=0)
    image_url: str | None = None
    product_id: str | None = None
    product_name: str | None = None
    price_usd: float | None = None
    price_inr: float | None = None
    price_inr_formatted: str | None = None
    rating: float | None = 4.8


class Recommendation(Product):
    score: float = Field(ge=0, le=1)
    reason: str


class RecommendationResponse(BaseModel):
    user_id: str
    mode: str
    recommendations: list[Recommendation]


class HealthResponse(BaseModel):
    status: str = "healthy"
    mode: str
    service: str

