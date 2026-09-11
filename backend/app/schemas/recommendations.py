from pydantic import BaseModel, Field


class Product(BaseModel):
    article_id: str
    name: str
    category: str
    color: str
    price: float = Field(ge=0)
    image_url: str | None = None


class Recommendation(Product):
    score: float = Field(ge=0, le=1)
    reason: str


class RecommendationResponse(BaseModel):
    user_id: str
    mode: str
    recommendations: list[Recommendation]


class HealthResponse(BaseModel):
    status: str
    mode: str
    service: str
