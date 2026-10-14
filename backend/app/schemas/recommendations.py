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
    is_custom: bool = False
    description: str | None = None


class ProductCreate(BaseModel):
    article_id: str = Field(min_length=3, max_length=50)
    name: str = Field(min_length=2, max_length=100)
    category: str = Field(min_length=2, max_length=50)
    color: str = Field(min_length=2, max_length=50)
    price: float = Field(gt=0)
    image_url: str | None = None
    description: str | None = None


class ProductUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    color: str | None = None
    price: float | None = Field(default=None, gt=0)
    image_url: str | None = None
    description: str | None = None


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
