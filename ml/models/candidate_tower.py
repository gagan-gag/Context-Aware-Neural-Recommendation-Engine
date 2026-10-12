"""Candidate Tower with popularity and freshness signals."""

import tensorflow as tf
from tensorflow import keras


class CandidateTowerRefined(keras.Model):
    """Candidate tower: Item + Context → discoverable candidate embeddings."""

    def __init__(
        self,
        item_embedding_dim: int = 44,
        context_embedding_dim: int = 34,
        hidden_layers: tuple = (128, 64),
        output_dim: int = 32,
        dropout_rate: float = 0.2,
        name: str = "candidate_tower_refined",
    ):
        super().__init__(name=name)

        input_dim = item_embedding_dim + context_embedding_dim

        self.dense_layers = []
        for units in hidden_layers:
            self.dense_layers.append(keras.layers.Dense(units, activation="relu"))
            self.dense_layers.append(keras.layers.BatchNormalization())
            self.dense_layers.append(keras.layers.Dropout(dropout_rate))

        self.output_embedding = keras.layers.Dense(output_dim)
        self.output_norm = keras.layers.LayerNormalization()

        self.popularity_head = keras.Sequential(
            [
                keras.layers.Dense(32, activation="relu"),
                keras.layers.Dropout(dropout_rate),
                keras.layers.Dense(output_dim),
            ],
            name="popularity_head",
        )

        self.freshness_head = keras.Sequential(
            [
                keras.layers.Dense(16, activation="relu"),
                keras.layers.Dense(1, activation="sigmoid"),
            ],
            name="freshness_head",
        )

        self._input_dim = input_dim

    def call(
        self,
        item_features: tf.Tensor,
        context_features: tf.Tensor,
        training: bool = False,
    ) -> dict:
        """Forward pass with popularity and freshness signals."""
        x = tf.concat([item_features, context_features], axis=-1)

        for layer in self.dense_layers:
            x = layer(x, training=training)

        candidate_embedding = self.output_embedding(x)
        candidate_embedding = self.output_norm(candidate_embedding)

        popularity = self.popularity_head(x, training=training)
        freshness = self.freshness_head(x, training=training)

        return {
            "embedding": candidate_embedding,
            "popularity": popularity,
            "freshness": freshness,
        }
