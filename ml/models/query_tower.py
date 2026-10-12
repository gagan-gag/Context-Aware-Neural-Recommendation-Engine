"""Query Tower with personalization and temporal signals."""

import tensorflow as tf
from tensorflow import keras


class QueryTowerRefined(keras.Model):
    """Query tower: User + Context → personalized query embeddings."""

    def __init__(
        self,
        user_embedding_dim: int = 52,
        context_embedding_dim: int = 34,
        hidden_layers: tuple = (128, 64),
        output_dim: int = 32,
        dropout_rate: float = 0.2,
        name: str = "query_tower_refined",
    ):
        super().__init__(name=name)

        input_dim = user_embedding_dim + context_embedding_dim

        self.dense_layers = []
        for units in hidden_layers:
            self.dense_layers.append(keras.layers.Dense(units, activation="relu"))
            self.dense_layers.append(keras.layers.BatchNormalization())
            self.dense_layers.append(keras.layers.Dropout(dropout_rate))

        self.output_embedding = keras.layers.Dense(output_dim)
        self.output_norm = keras.layers.LayerNormalization()

        self.personalization_head = keras.Sequential(
            [
                keras.layers.Dense(32, activation="relu"),
                keras.layers.Dropout(dropout_rate),
                keras.layers.Dense(output_dim),
            ],
            name="personalization_head",
        )

        self.temporal_head = keras.Sequential(
            [
                keras.layers.Dense(16, activation="relu"),
                keras.layers.Dense(1, activation="sigmoid"),
            ],
            name="temporal_head",
        )

        self._input_dim = input_dim

    def call(
        self,
        user_features: tf.Tensor,
        context_features: tf.Tensor,
        training: bool = False,
    ) -> dict:
        """Forward pass with personalization and temporal signals."""
        x = tf.concat([user_features, context_features], axis=-1)

        for layer in self.dense_layers:
            x = layer(x, training=training)

        query_embedding = self.output_embedding(x)
        query_embedding = self.output_norm(query_embedding)

        personalization = self.personalization_head(x, training=training)
        temporal_decay = self.temporal_head(x, training=training)

        return {
            "embedding": query_embedding,
            "personalization": personalization,
            "temporal_decay": temporal_decay,
        }
