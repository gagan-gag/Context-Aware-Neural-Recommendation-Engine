"""
Embedding preparation module for AVERO recommendation system.
Normalizes features and prepares data for embedding generation.
"""

import logging
from typing import Dict, List, Optional, Tuple

from pyspark.ml.feature import VectorAssembler
from pyspark.sql import DataFrame, SparkSession
from pyspark.sql.functions import col, lit, when, udf
from pyspark.sql.types import IntegerType

from ml.features.feature_vocabulary import FeatureVocabulary

logger = logging.getLogger(__name__)


class EmbeddingPreparator:
    """
    Prepares features for embedding generation.
    Normalizes continuous features and encodes categorical features.
    """

    def __init__(self, spark: SparkSession, vocabulary: Optional[FeatureVocabulary] = None):
        """
        Initialize embedding preparator.

        Args:
            spark: Active SparkSession
            vocabulary: FeatureVocabulary instance (created if not provided)
        """
        self.spark = spark
        self.vocabulary = vocabulary or FeatureVocabulary()
        logger.info("EmbeddingPreparator initialized")

    def normalize_continuous_features(
        self,
        df: DataFrame,
        entity_type: str,
        feature_names: List[str],
    ) -> DataFrame:
        """
        Normalize continuous features to [0, 1] range.

        Args:
            df: Input DataFrame
            entity_type: "user", "item", or "context"
            feature_names: List of continuous feature names to normalize

        Returns:
            DataFrame: With normalized features
        """
        logger.info(f"Normalizing {len(feature_names)} continuous features for {entity_type}")

        norm_params = self.vocabulary.get_normalization_params(entity_type)

        for feature_name in feature_names:
            if feature_name not in norm_params:
                logger.warning(f"Feature {feature_name} has no normalization params, skipping")
                continue

            min_val, max_val = norm_params[feature_name]
            range_val = max_val - min_val

            if range_val == 0:
                df = df.withColumn(f"{feature_name}_normalized", lit(0.5))
            else:
                df = df.withColumn(
                    f"{feature_name}_normalized",
                    when(col(feature_name).isNull(), 0.0)
                    .otherwise((col(feature_name) - lit(min_val)) / lit(range_val)),
                )

        return df

    def encode_categorical_features(
        self,
        df: DataFrame,
        entity_type: str,
        categorical_features: Dict[str, List[str]],
    ) -> DataFrame:
        """
        Encode categorical features to integer indices.

        Args:
            df: Input DataFrame
            entity_type: "user", "item", or "context"
            categorical_features: Dict mapping feature name to list of categories

        Returns:
            DataFrame: With encoded categorical features
        """
        logger.info(f"Encoding {len(categorical_features)} categorical features")

        for feature_name, categories in categorical_features.items():
            category_map = {cat: idx for idx, cat in enumerate(categories)}

            def encode_category(value):
                return category_map.get(value, 0)

            encode_udf = udf(encode_category, IntegerType())

            df = df.withColumn(f"{feature_name}_encoded", encode_udf(col(feature_name)))
            logger.info(f"Encoded {feature_name}: {category_map}")

        return df

    def create_feature_crosses(
        self,
        user_features: DataFrame,
        item_features: DataFrame,
        context_features: DataFrame,
        cross_pairs: List[Tuple[str, str]],
    ) -> DataFrame:
        """
        Create feature crosses (interactions) between user and item features.

        Args:
            user_features: User feature DataFrame
            item_features: Item feature DataFrame
            context_features: Context feature DataFrame
            cross_pairs: List of (user_feature, item_feature) pairs to cross

        Returns:
            DataFrame: With feature crosses
        """
        logger.info(f"Creating {len(cross_pairs)} feature crosses")

        combined = user_features.join(item_features.drop("customer_id"), on=["customer_id"], how="left").join(
            context_features.drop("customer_id"), on=["customer_id"], how="left"
        )

        for user_feat, item_feat in cross_pairs:
            cross_name = f"{user_feat}_x_{item_feat}"

            combined = combined.withColumn(
                cross_name,
                when((col(user_feat).isNotNull()) & (col(item_feat).isNotNull()), col(user_feat) * col(item_feat)).otherwise(0.0),
            )

            logger.info(f"Created cross: {cross_name}")

        return combined

    def prepare_embedding_input(
        self,
        entity_df: DataFrame,
        entity_type: str,
        features_to_embed: List[str],
    ) -> DataFrame:
        """
        Prepare embedding input: assemble features into vector format.

        Args:
            entity_df: Entity feature DataFrame
            entity_type: "user", "item", or "context"
            features_to_embed: List of features to include in embedding vector

        Returns:
            DataFrame: With embedded_input column containing feature vector
        """
        logger.info(f"Preparing embedding input for {entity_type} with {len(features_to_embed)} features")

        available_features = [f for f in features_to_embed if f in entity_df.columns]

        if not available_features:
            raise ValueError(f"No features found in DataFrame for {entity_type}")

        assembler = VectorAssembler(inputCols=available_features, outputCol="embedding_input")
        embedded_df = assembler.transform(entity_df)

        logger.info(f"Embedding input prepared: {len(available_features)} features -> vector")

        return embedded_df.select("*", "embedding_input")

    def create_embedding_manifest(self, entity_type: str, entity_df: DataFrame) -> Dict:
        """
        Create embedding manifest with metadata for feature store.

        Args:
            entity_type: "user", "item", or "context"
            entity_df: Prepared entity DataFrame

        Returns:
            Dict: Manifest with feature metadata
        """
        logger.info(f"Creating embedding manifest for {entity_type}")

        if entity_type == "user":
            embedding_config = self.vocabulary.get_user_embedding_config()
        elif entity_type == "item":
            embedding_config = self.vocabulary.get_item_embedding_config()
        elif entity_type == "context":
            embedding_config = self.vocabulary.get_context_embedding_config()
        else:
            raise ValueError(f"Unknown entity type: {entity_type}")

        manifest = {
            "entity_type": entity_type,
            "feature_count": len(embedding_config),
            "embedding_dims": embedding_config,
            "total_embedding_dim": sum(embedding_config.values()),
            "record_count": entity_df.count(),
            "categorical_vocabs": {},
        }

        if entity_type == "context":
            for feature_name in embedding_config.keys():
                try:
                    vocab = self.vocabulary.get_categorical_vocab(feature_name)
                    manifest["categorical_vocabs"][feature_name] = vocab
                except ValueError:
                    pass

        logger.info(f"Manifest created: {manifest['total_embedding_dim']}D embedding")

        return manifest

    def validate_embedding_ready(self, entity_df: DataFrame, entity_type: str) -> bool:
        """
        Validate that entity DataFrame is ready for embedding.

        Args:
            entity_df: Entity DataFrame to validate
            entity_type: "user", "item", or "context"

        Returns:
            bool: True if ready for embedding
        """
        logger.info(f"Validating {entity_type} DataFrame for embedding readiness")

        if entity_type == "user":
            config = self.vocabulary.get_user_embedding_config()
        elif entity_type == "item":
            config = self.vocabulary.get_item_embedding_config()
        elif entity_type == "context":
            config = self.vocabulary.get_context_embedding_config()
        else:
            raise ValueError(f"Unknown entity type: {entity_type}")

        available_cols = set(entity_df.columns)
        required_features = set(config.keys())

        normalized_features = {f + "_normalized" for f in required_features if f + "_normalized" in available_cols}

        if not normalized_features:
            logger.warning(f"No normalized features found for {entity_type}")
            return False

        logger.info(f"Validation passed: {len(normalized_features)} normalized features found")
        return True


def prepare_for_embedding(
    spark: SparkSession,
    user_df: DataFrame,
    item_df: DataFrame,
    context_df: Optional[DataFrame] = None,
) -> Dict[str, DataFrame]:
    """
    Prepare all entities for embedding generation.

    Args:
        spark: SparkSession
        user_df: User feature DataFrame
        item_df: Item feature DataFrame
        context_df: Optional context feature DataFrame

    Returns:
        Dict: Prepared DataFrames for each entity type
    """
    preparator = EmbeddingPreparator(spark)

    logger.info("Preparing user features for embedding")
    user_normalized = preparator.normalize_continuous_features(
        user_df,
        "user",
        [
            "recency_days",
            "frequency",
            "monetary_value",
            "avg_purchase_value",
            "customer_lifetime_days",
            "purchase_velocity",
        ],
    )

    logger.info("Preparing item features for embedding")
    item_normalized = preparator.normalize_continuous_features(
        item_df,
        "item",
        ["total_purchases", "unique_customers", "avg_price", "item_lifetime_days", "hhi_index"],
    )

    context_normalized = None
    if context_df is not None:
        logger.info("Preparing context features for embedding")
        context_normalized = preparator.normalize_continuous_features(
            context_df,
            "context",
            ["hour_of_day", "days_since_last_purchase", "price_alignment_score", "basket_size", "product_diversity_score"],
        )

        context_normalized = preparator.encode_categorical_features(
            context_normalized,
            "context",
            {"season": ["Winter", "Spring", "Summer", "Fall"], "customer_tier": ["New", "Bronze", "Silver", "Gold"]},
        )

    return {
        "user": user_normalized,
        "item": item_normalized,
        "context": context_normalized,
    }


if __name__ == "__main__":
    spark = (
        SparkSession.builder.appName("EmbeddingPreparation")
        .master("local[1]")
        .config("spark.driver.host", "127.0.0.1")
        .config("spark.driver.bindAddress", "127.0.0.1")
        .getOrCreate()
    )

    preparator = EmbeddingPreparator(spark)
    print("EmbeddingPreparator initialized and ready")

    spark.stop()
