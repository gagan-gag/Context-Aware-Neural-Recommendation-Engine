"""
ML Features module for AVERO recommendation system.
Exposes feature extraction and embedding preparation utilities.
"""

from .user_features import UserFeatureExtractor, extract_user_features_job
from .item_features import ItemFeatureExtractor, extract_item_features_job
from .context_features import ContextFeatureExtractor, extract_context_features_job

from .feature_vocabulary import FeatureVocabulary
from .embedding_preparation import EmbeddingPreparator, prepare_for_embedding

from .schema import (
    FeatureType,
    FeatureDefinition,
    UserFeatureSchema,
    ItemFeatureSchema,
    ContextFeatureSchema,
    FeatureSchemaRegistry,
)

__all__ = [
    "UserFeatureExtractor",
    "extract_user_features_job",
    "ItemFeatureExtractor",
    "extract_item_features_job",
    "ContextFeatureExtractor",
    "extract_context_features_job",
    "FeatureVocabulary",
    "EmbeddingPreparator",
    "prepare_for_embedding",
    "FeatureType",
    "FeatureDefinition",
    "UserFeatureSchema",
    "ItemFeatureSchema",
    "ContextFeatureSchema",
    "FeatureSchemaRegistry",
]

__version__ = "0.1.0"
