"""
ML Features module for AVERO recommendation system.
Exposes feature extraction and engineering utilities.
"""

from .user_features import UserFeatureExtractor, extract_user_features_job

__all__ = [
    "UserFeatureExtractor",
    "extract_user_features_job",
]

__version__ = "0.1.0"
