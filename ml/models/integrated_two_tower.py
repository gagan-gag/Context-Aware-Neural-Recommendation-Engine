"""Integrated Two-Tower model combining base + specialized towers."""

import tensorflow as tf
from tensorflow import keras
from typing import Dict, Tuple
from ml.models.two_tower import TwoTowerModel, TwoTowerLoss
from ml.models.query_tower import QueryTowerRefined
from ml.models.candidate_tower import CandidateTowerRefined


class IntegratedTwoTowerModel(keras.Model):
    """End-to-end Two-Tower with specialized query and candidate towers."""

    def __init__(
        self,
        user_embedding_dim: int = 52,
        item_embedding_dim: int = 44,
        context_embedding_dim: int = 34,
        query_tower_layers: Tuple[int, ...] = (128, 64),
        candidate_tower_layers: Tuple[int, ...] = (128, 64),
        output_dim: int = 32,
        dropout_rate: float = 0.2,
        name: str = "integrated_two_tower",
    ):
        """
        Initialize integrated Two-Tower model.

        Args:
            user_embedding_dim: User features (52D)
            item_embedding_dim: Item features (44D)
            context_embedding_dim: Context features (34D)
            query_tower_layers: Hidden layer sizes
            candidate_tower_layers: Hidden layer sizes
            output_dim: Final embedding dimension (32D)
            dropout_rate: Dropout rate
            name: Model name
        """
        super().__init__(name=name)

        # Refined towers with specialized heads
        self.query_tower = QueryTowerRefined(
            user_embedding_dim=user_embedding_dim,
            context_embedding_dim=context_embedding_dim,
            hidden_layers=query_tower_layers,
            output_dim=output_dim,
            dropout_rate=dropout_rate,
        )

        self.candidate_tower = CandidateTowerRefined(
            item_embedding_dim=item_embedding_dim,
            context_embedding_dim=context_embedding_dim,
            hidden_layers=candidate_tower_layers,
            output_dim=output_dim,
            dropout_rate=dropout_rate,
        )

        # Contrastive loss
        self.loss_fn = TwoTowerLoss(temperature=0.1)

    def call(
        self,
        user_features: tf.Tensor,
        item_features: tf.Tensor,
        context_features: tf.Tensor,
        training: bool = False,
    ) -> Dict:
        """
        Forward pass through integrated model.

        Args:
            user_features: User embeddings (batch_size, 52D)
            item_features: Item embeddings (batch_size, 44D)
            context_features: Context embeddings (batch_size, 34D)
            training: Training mode

        Returns:
            Dictionary with query and candidate outputs + signals
        """
        # Query tower
        query_output = self.query_tower(
            user_features, context_features, training=training
        )
        query_embedding = query_output["embedding"]
        personalization = query_output["personalization"]
        temporal_decay = query_output["temporal_decay"]

        # Candidate tower
        candidate_output = self.candidate_tower(
            item_features, context_features, training=training
        )
        candidate_embedding = candidate_output["embedding"]
        popularity = candidate_output["popularity"]
        freshness = candidate_output["freshness"]

        return {
            # Main embeddings
            "query_embedding": query_embedding,
            "candidate_embedding": candidate_embedding,
            # Query signals
            "personalization": personalization,
            "temporal_decay": temporal_decay,
            # Candidate signals
            "popularity": popularity,
            "freshness": freshness,
        }

    def compute_loss(
        self,
        query_embedding: tf.Tensor,
        candidate_embedding: tf.Tensor,
        personalization: tf.Tensor,
        popularity: tf.Tensor,
        temporal_decay: tf.Tensor,
        freshness: tf.Tensor,
    ) -> tf.Tensor:
        """
        Compute combined loss with signals.

        Args:
            query_embedding: Query embeddings (batch_size, 32D)
            candidate_embedding: Candidate embeddings (batch_size, 32D)
            personalization: User preference signals (batch_size, 32D)
            popularity: Item popularity signals (batch_size, 32D)
            temporal_decay: Recency weight (batch_size, 1)
            freshness: Item freshness (batch_size, 1)

        Returns:
            Combined loss scalar
        """
        # Base contrastive loss
        base_loss = self.loss_fn(query_embedding, candidate_embedding)

        # Personalization loss: encourage alignment with preferences
        personalization_loss = -tf.reduce_mean(
            tf.reduce_sum(query_embedding * personalization, axis=-1)
        )

        # Popularity loss: encourage candidate popularity
        popularity_score = tf.reduce_mean(popularity)
        popularity_loss = -tf.reduce_mean(
            tf.reduce_sum(candidate_embedding * popularity, axis=-1)
        )

        # Combined loss
        total_loss = (
            base_loss
            + 0.1 * personalization_loss
            + 0.1 * popularity_loss
        )

        return total_loss

    def get_config(self) -> Dict:
        """Return model config."""
        return {
            "query_tower": self.query_tower.get_config(),
            "candidate_tower": self.candidate_tower.get_config(),
        }