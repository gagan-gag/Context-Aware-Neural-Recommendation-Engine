"""Two-Tower Neural Network for Context-Aware Recommendations."""

import tensorflow as tf
from tensorflow import keras
from typing import Dict, Tuple


class TwoTowerModel(keras.Model):
    """Two-Tower recommendation model: Query (user) + Candidate (item) towers."""

    def __init__(
        self,
        user_embedding_dim: int = 52,
        item_embedding_dim: int = 44,
        context_embedding_dim: int = 34,
        query_tower_layers: Tuple[int, ...] = (128, 64, 32),
        candidate_tower_layers: Tuple[int, ...] = (128, 64, 32),
        output_dim: int = 32,
        dropout_rate: float = 0.2,
        name: str = "two_tower_model",
    ):
        super().__init__(name=name)

        self.user_embedding_dim = user_embedding_dim
        self.item_embedding_dim = item_embedding_dim
        self.context_embedding_dim = context_embedding_dim
        self.output_dim = output_dim
        self.dropout_rate = dropout_rate

        self.query_input_dim = user_embedding_dim + context_embedding_dim
        self.query_tower = self._build_tower(
            self.query_input_dim, query_tower_layers, output_dim, name="query_tower"
        )

        self.candidate_input_dim = item_embedding_dim + context_embedding_dim
        self.candidate_tower = self._build_tower(
            self.candidate_input_dim,
            candidate_tower_layers,
            output_dim,
            name="candidate_tower",
        )

    def _build_tower(
        self,
        input_dim: int,
        hidden_layers: Tuple[int, ...],
        output_dim: int,
        name: str,
    ) -> keras.Sequential:
        """Build a tower (sequential neural network)."""
        layers = [keras.Input(shape=(input_dim,))]

        for units in hidden_layers:
            layers.append(keras.layers.Dense(units, activation="relu"))
            layers.append(keras.layers.BatchNormalization())
            layers.append(keras.layers.Dropout(self.dropout_rate))

        layers.append(keras.layers.Dense(output_dim))
        layers.append(keras.layers.LayerNormalization())

        return keras.Sequential(layers, name=name)

    def call(
        self,
        user_features: tf.Tensor,
        item_features: tf.Tensor,
        context_features: tf.Tensor,
        training: bool = False,
    ) -> Tuple[tf.Tensor, tf.Tensor]:
        query_input = tf.concat([user_features, context_features], axis=-1)
        query_embedding = self.query_tower(query_input, training=training)

        candidate_input = tf.concat([item_features, context_features], axis=-1)
        candidate_embedding = self.candidate_tower(candidate_input, training=training)

        return query_embedding, candidate_embedding

    def get_config(self) -> Dict:
        return {
            "user_embedding_dim": self.user_embedding_dim,
            "item_embedding_dim": self.item_embedding_dim,
            "context_embedding_dim": self.context_embedding_dim,
            "output_dim": self.output_dim,
            "dropout_rate": self.dropout_rate,
        }


class TwoTowerLoss(keras.losses.Loss):
    """Contrastive loss for Two-Tower model."""

    def __init__(self, temperature: float = 0.1, name: str = "two_tower_loss"):
        super().__init__(name=name)
        self.temperature = temperature

    def call(
        self, query_embedding: tf.Tensor, candidate_embedding: tf.Tensor
    ) -> tf.Tensor:
        similarity = tf.linalg.matmul(
            query_embedding, candidate_embedding, transpose_b=True
        )
        similarity = similarity / self.temperature

        batch_size = tf.shape(query_embedding)[0]
        labels = tf.range(batch_size)

        loss = keras.losses.sparse_categorical_crossentropy(
            labels, similarity, from_logits=True
        )

        return tf.reduce_mean(loss)
