"""
Feature schema definitions for AVERO recommendation system.
Defines feature types, embedding dimensions, and metadata.
"""

from enum import Enum
from typing import Dict, List, Optional


class FeatureType(Enum):
    """Feature type enumeration."""

    CONTINUOUS = "continuous"
    CATEGORICAL = "categorical"
    EMBEDDING = "embedding"
    SEQUENCE = "sequence"


class FeatureDefinition:
    """Definition of a single feature for embedding."""

    def __init__(
        self,
        name: str,
        feature_type: FeatureType,
        embedding_dim: int,
        vocab_size: Optional[int] = None,
        min_value: Optional[float] = None,
        max_value: Optional[float] = None,
        description: str = "",
        is_required: bool = True,
    ):
        self.name = name
        self.feature_type = feature_type
        self.embedding_dim = embedding_dim
        self.vocab_size = vocab_size
        self.min_value = min_value
        self.max_value = max_value
        self.description = description
        self.is_required = is_required

    def to_dict(self) -> Dict:
        """Convert to dictionary."""
        return {
            "name": self.name,
            "feature_type": self.feature_type.value,
            "embedding_dim": self.embedding_dim,
            "vocab_size": self.vocab_size,
            "min_value": self.min_value,
            "max_value": self.max_value,
            "description": self.description,
            "is_required": self.is_required,
        }


class UserFeatureSchema:
    """Schema for user features."""

    FEATURES = [
        FeatureDefinition(
            name="recency_days",
            feature_type=FeatureType.CONTINUOUS,
            embedding_dim=8,
            min_value=0.0,
            max_value=730.0,
            description="Days since last purchase",
        ),
        FeatureDefinition(
            name="frequency",
            feature_type=FeatureType.CONTINUOUS,
            embedding_dim=8,
            min_value=0.0,
            max_value=1000.0,
            description="Total purchase count",
        ),
        FeatureDefinition(
            name="monetary_value",
            feature_type=FeatureType.CONTINUOUS,
            embedding_dim=8,
            min_value=0.0,
            max_value=100000.0,
            description="Total spending",
        ),
        FeatureDefinition(
            name="avg_purchase_value",
            feature_type=FeatureType.CONTINUOUS,
            embedding_dim=8,
            min_value=0.0,
            max_value=1000.0,
            description="Average purchase value",
        ),
        FeatureDefinition(
            name="online_ratio",
            feature_type=FeatureType.CONTINUOUS,
            embedding_dim=4,
            min_value=0.0,
            max_value=1.0,
            description="Online purchase ratio",
        ),
        FeatureDefinition(
            name="customer_lifetime_days",
            feature_type=FeatureType.CONTINUOUS,
            embedding_dim=8,
            min_value=0.0,
            max_value=1095.0,
            description="Days from first to last purchase",
        ),
        FeatureDefinition(
            name="purchase_velocity",
            feature_type=FeatureType.CONTINUOUS,
            embedding_dim=8,
            min_value=0.0,
            max_value=100.0,
            description="Purchases per month",
        ),
    ]

    @classmethod
    def get_features(cls) -> List[FeatureDefinition]:
        return cls.FEATURES

    @classmethod
    def total_embedding_dim(cls) -> int:
        return sum(f.embedding_dim for f in cls.FEATURES)


class ItemFeatureSchema:
    """Schema for item features."""

    FEATURES = [
        FeatureDefinition(
            name="total_purchases",
            feature_type=FeatureType.CONTINUOUS,
            embedding_dim=8,
            min_value=0.0,
            max_value=10000.0,
            description="Total purchase count",
        ),
        FeatureDefinition(
            name="unique_customers",
            feature_type=FeatureType.CONTINUOUS,
            embedding_dim=8,
            min_value=0.0,
            max_value=5000.0,
            description="Unique customer count",
        ),
        FeatureDefinition(
            name="popularity_score",
            feature_type=FeatureType.CONTINUOUS,
            embedding_dim=4,
            min_value=0.0,
            max_value=100.0,
            description="Popularity percentile",
        ),
        FeatureDefinition(
            name="avg_price",
            feature_type=FeatureType.CONTINUOUS,
            embedding_dim=8,
            min_value=0.0,
            max_value=1000.0,
            description="Average price",
        ),
        FeatureDefinition(
            name="price_volatility",
            feature_type=FeatureType.CONTINUOUS,
            embedding_dim=4,
            min_value=0.0,
            max_value=5.0,
            description="Price coefficient of variation",
        ),
        FeatureDefinition(
            name="item_lifetime_days",
            feature_type=FeatureType.CONTINUOUS,
            embedding_dim=8,
            min_value=0.0,
            max_value=1095.0,
            description="Days from first to last sale",
        ),
        FeatureDefinition(
            name="hhi_index",
            feature_type=FeatureType.CONTINUOUS,
            embedding_dim=4,
            min_value=0.0,
            max_value=1.0,
            description="Herfindahl concentration index",
        ),
    ]

    @classmethod
    def get_features(cls) -> List[FeatureDefinition]:
        return cls.FEATURES

    @classmethod
    def total_embedding_dim(cls) -> int:
        return sum(f.embedding_dim for f in cls.FEATURES)


class ContextFeatureSchema:
    """Schema for context features."""

    CATEGORICAL_FEATURES = {
        "season": ["Winter", "Spring", "Summer", "Fall"],
        "customer_tier": ["New", "Bronze", "Silver", "Gold"],
    }

    FEATURES = [
        FeatureDefinition(
            name="hour_of_day",
            feature_type=FeatureType.CONTINUOUS,
            embedding_dim=4,
            min_value=0.0,
            max_value=23.0,
            description="Hour of purchase (0-23)",
        ),
        FeatureDefinition(
            name="is_weekend",
            feature_type=FeatureType.CONTINUOUS,
            embedding_dim=2,
            min_value=0.0,
            max_value=1.0,
            description="Weekend indicator",
        ),
        FeatureDefinition(
            name="quarter",
            feature_type=FeatureType.CONTINUOUS,
            embedding_dim=2,
            min_value=1.0,
            max_value=4.0,
            description="Quarter of year",
        ),
        FeatureDefinition(
            name="is_holiday_season",
            feature_type=FeatureType.CONTINUOUS,
            embedding_dim=2,
            min_value=0.0,
            max_value=1.0,
            description="Holiday season (Nov-Dec)",
        ),
        FeatureDefinition(
            name="season",
            feature_type=FeatureType.CATEGORICAL,
            embedding_dim=4,
            vocab_size=4,
            description="Season of purchase",
        ),
        FeatureDefinition(
            name="days_since_last_purchase",
            feature_type=FeatureType.CONTINUOUS,
            embedding_dim=8,
            min_value=0.0,
            max_value=730.0,
            description="Days since last purchase",
        ),
        FeatureDefinition(
            name="in_streak",
            feature_type=FeatureType.CONTINUOUS,
            embedding_dim=2,
            min_value=0.0,
            max_value=1.0,
            description="In purchase streak",
        ),
        FeatureDefinition(
            name="price_alignment_score",
            feature_type=FeatureType.CONTINUOUS,
            embedding_dim=4,
            min_value=0.0,
            max_value=10.0,
            description="Price vs user average",
        ),
        FeatureDefinition(
            name="customer_tier",
            feature_type=FeatureType.CATEGORICAL,
            embedding_dim=4,
            vocab_size=4,
            description="Customer spending tier",
        ),
        FeatureDefinition(
            name="basket_size",
            feature_type=FeatureType.CONTINUOUS,
            embedding_dim=4,
            min_value=0.0,
            max_value=100.0,
            description="Items in basket",
        ),
        FeatureDefinition(
            name="product_diversity_score",
            feature_type=FeatureType.CONTINUOUS,
            embedding_dim=4,
            min_value=0.0,
            max_value=1.0,
            description="Product diversity ratio",
        ),
    ]

    @classmethod
    def get_features(cls) -> List[FeatureDefinition]:
        return cls.FEATURES

    @classmethod
    def get_categorical_features(cls) -> Dict[str, List[str]]:
        return cls.CATEGORICAL_FEATURES

    @classmethod
    def total_embedding_dim(cls) -> int:
        return sum(f.embedding_dim for f in cls.FEATURES)


class FeatureSchemaRegistry:
    """Registry of all feature schemas."""

    SCHEMAS = {
        "user": UserFeatureSchema,
        "item": ItemFeatureSchema,
        "context": ContextFeatureSchema,
    }

    @classmethod
    def get_schema(cls, entity_type: str) -> type:
        """Get schema for entity type."""
        if entity_type not in cls.SCHEMAS:
            raise ValueError(f"Unknown entity type: {entity_type}")
        return cls.SCHEMAS[entity_type]

    @classmethod
    def get_total_embedding_dim(cls) -> Dict[str, int]:
        """Get total embedding dimensions for all entities."""
        return {
            "user": UserFeatureSchema.total_embedding_dim(),
            "item": ItemFeatureSchema.total_embedding_dim(),
            "context": ContextFeatureSchema.total_embedding_dim(),
        }

    @classmethod
    def get_all_feature_names(cls, entity_type: str) -> List[str]:
        """Get all feature names for entity type."""
        schema = cls.get_schema(entity_type)
        return [f.name for f in schema.get_features()]


if __name__ == "__main__":
    print("User Features:")
    print(f"  Total dimension: {UserFeatureSchema.total_embedding_dim()}")
    print(f"  Features: {FeatureSchemaRegistry.get_all_feature_names('user')}")

    print("\nItem Features:")
    print(f"  Total dimension: {ItemFeatureSchema.total_embedding_dim()}")

    print("\nContext Features:")
    print(f"  Total dimension: {ContextFeatureSchema.total_embedding_dim()}")
    print(f"  Categorical: {ContextFeatureSchema.get_categorical_features()}")

    print("\nTotal Embedding Dimensions:")
    print(FeatureSchemaRegistry.get_total_embedding_dim())
