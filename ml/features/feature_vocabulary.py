"""
Feature vocabulary definitions for AVERO recommendation system.
Defines embedding vocabularies and lookups for all feature types.
"""

import logging
from typing import Dict, List, Tuple

from ml.features.schema import (
    ContextFeatureSchema,
    FeatureDefinition,
    FeatureSchemaRegistry,
    ItemFeatureSchema,
    UserFeatureSchema,
)

logger = logging.getLogger(__name__)


class FeatureVocabulary:
    """
    Manages feature vocabularies and embedding dimensions.
    Maps categorical features to indices for embedding lookups.
    """

    def __init__(self):
        """Initialize feature vocabulary."""
        self.user_features = self._build_user_vocabulary()
        self.item_features = self._build_item_vocabulary()
        self.context_features = self._build_context_vocabulary()
        logger.info("FeatureVocabulary initialized")

    @staticmethod
    def _build_user_vocabulary() -> Dict[str, Dict]:
        """Build user feature vocabulary."""
        features = {}

        for feature_def in UserFeatureSchema.get_features():
            features[feature_def.name] = {
                "type": feature_def.feature_type.value,
                "embedding_dim": feature_def.embedding_dim,
                "min_value": feature_def.min_value,
                "max_value": feature_def.max_value,
                "description": feature_def.description,
            }

        logger.info(f"Built user vocabulary with {len(features)} features")
        return features

    @staticmethod
    def _build_item_vocabulary() -> Dict[str, Dict]:
        """Build item feature vocabulary."""
        features = {}

        for feature_def in ItemFeatureSchema.get_features():
            features[feature_def.name] = {
                "type": feature_def.feature_type.value,
                "embedding_dim": feature_def.embedding_dim,
                "min_value": feature_def.min_value,
                "max_value": feature_def.max_value,
                "description": feature_def.description,
            }

        logger.info(f"Built item vocabulary with {len(features)} features")
        return features

    @staticmethod
    def _build_context_vocabulary() -> Dict[str, Dict]:
        """Build context feature vocabulary."""
        features = {}
        categorical_features = ContextFeatureSchema.get_categorical_features()

        for feature_def in ContextFeatureSchema.get_features():
            features[feature_def.name] = {
                "type": feature_def.feature_type.value,
                "embedding_dim": feature_def.embedding_dim,
                "min_value": feature_def.min_value,
                "max_value": feature_def.max_value,
                "vocab_size": feature_def.vocab_size,
                "description": feature_def.description,
            }

            if feature_def.name in categorical_features:
                features[feature_def.name]["categories"] = categorical_features[feature_def.name]
                features[feature_def.name]["vocab"] = {
                    cat: idx for idx, cat in enumerate(categorical_features[feature_def.name])
                }

        logger.info(f"Built context vocabulary with {len(features)} features")
        return features

    def get_user_embedding_config(self) -> Dict[str, int]:
        """Get user feature embedding dimensions."""
        return {name: config["embedding_dim"] for name, config in self.user_features.items()}

    def get_item_embedding_config(self) -> Dict[str, int]:
        """Get item feature embedding dimensions."""
        return {name: config["embedding_dim"] for name, config in self.item_features.items()}

    def get_context_embedding_config(self) -> Dict[str, int]:
        """Get context feature embedding dimensions."""
        return {name: config["embedding_dim"] for name, config in self.context_features.items()}

    def get_categorical_vocab(self, feature_name: str) -> Dict[str, int]:
        """Get categorical vocabulary for feature."""
        if feature_name not in self.context_features:
            raise ValueError(f"Feature {feature_name} not found")

        feature_config = self.context_features[feature_name]
        if "vocab" not in feature_config:
            raise ValueError(f"Feature {feature_name} is not categorical")

        return feature_config["vocab"]

    def get_normalization_params(self, entity_type: str) -> Dict[str, Tuple[float, float]]:
        """
        Get min-max normalization parameters for continuous features.

        Returns:
            Dict mapping feature name to (min, max) tuple
        """
        if entity_type == "user":
            vocab = self.user_features
        elif entity_type == "item":
            vocab = self.item_features
        elif entity_type == "context":
            vocab = self.context_features
        else:
            raise ValueError(f"Unknown entity type: {entity_type}")

        params = {}
        for name, config in vocab.items():
            if config["type"] == "continuous" and config["min_value"] is not None:
                params[name] = (config["min_value"], config["max_value"])

        return params

    def get_total_embedding_dim(self) -> Dict[str, int]:
        """Get total embedding dimensions for each entity type."""
        return {
            "user": sum(config["embedding_dim"] for config in self.user_features.values()),
            "item": sum(config["embedding_dim"] for config in self.item_features.values()),
            "context": sum(config["embedding_dim"] for config in self.context_features.values()),
        }

    def validate_features(self, entity_type: str, feature_names: List[str]) -> bool:
        """
        Validate that all required features are present.

        Args:
            entity_type: "user", "item", or "context"
            feature_names: List of feature names to validate

        Returns:
            bool: True if all required features present
        """
        if entity_type == "user":
            vocab = self.user_features
        elif entity_type == "item":
            vocab = self.item_features
        elif entity_type == "context":
            vocab = self.context_features
        else:
            raise ValueError(f"Unknown entity type: {entity_type}")

        required = set(vocab.keys())
        provided = set(feature_names)

        if not required.issubset(provided):
            missing = required - provided
            logger.warning(f"Missing features for {entity_type}: {missing}")
            return False

        return True

    def get_feature_description(self, entity_type: str, feature_name: str) -> str:
        """Get description of a feature."""
        if entity_type == "user":
            vocab = self.user_features
        elif entity_type == "item":
            vocab = self.item_features
        elif entity_type == "context":
            vocab = self.context_features
        else:
            raise ValueError(f"Unknown entity type: {entity_type}")

        if feature_name not in vocab:
            raise ValueError(f"Feature {feature_name} not found in {entity_type} vocabulary")

        return vocab[feature_name]["description"]


if __name__ == "__main__":
    vocab = FeatureVocabulary()

    print("User Embedding Configuration:")
    user_config = vocab.get_user_embedding_config()
    print(f"  Features: {len(user_config)}")
    print(f"  Total dim: {sum(user_config.values())}")

    print("\nItem Embedding Configuration:")
    item_config = vocab.get_item_embedding_config()
    print(f"  Features: {len(item_config)}")
    print(f"  Total dim: {sum(item_config.values())}")

    print("\nContext Embedding Configuration:")
    context_config = vocab.get_context_embedding_config()
    print(f"  Features: {len(context_config)}")
    print(f"  Total dim: {sum(context_config.values())}")

    print("\nTotal Embedding Dimensions:")
    total_dims = vocab.get_total_embedding_dim()
    for entity_type, dim in total_dims.items():
        print(f"  {entity_type}: {dim}")

    print("\nCategorical Vocabularies:")
    customer_tier_vocab = vocab.get_categorical_vocab("customer_tier")
    print(f"  customer_tier: {customer_tier_vocab}")
    season_vocab = vocab.get_categorical_vocab("season")
    print(f"  season: {season_vocab}")
