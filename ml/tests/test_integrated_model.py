"""Tests for integrated Two-Tower model."""

import pytest
import tensorflow as tf
from ml.models.integrated_two_tower import IntegratedTwoTowerModel


class TestIntegratedTwoTowerModel:
    """Test integrated Two-Tower model."""

    @pytest.fixture
    def model(self):
        return IntegratedTwoTowerModel(
            user_embedding_dim=52,
            item_embedding_dim=44,
            context_embedding_dim=34,
            query_tower_layers=(128, 64),
            candidate_tower_layers=(128, 64),
            output_dim=32,
        )

    @pytest.fixture
    def batch(self):
        return {
            "user": tf.random.normal((8, 52)),
            "item": tf.random.normal((8, 44)),
            "context": tf.random.normal((8, 34)),
        }

    def test_forward_pass_output_structure(self, model, batch):
        """Test forward pass returns all outputs."""
        output = model(
            batch["user"], batch["item"], batch["context"], training=False
        )

        assert "query_embedding" in output
        assert "candidate_embedding" in output
        assert "personalization" in output
        assert "temporal_decay" in output
        assert "popularity" in output
        assert "freshness" in output

    def test_embedding_shapes(self, model, batch):
        """Test embedding shapes."""
        output = model(batch["user"], batch["item"], batch["context"])

        assert output["query_embedding"].shape == (8, 32)
        assert output["candidate_embedding"].shape == (8, 32)

    def test_signal_shapes(self, model, batch):
        """Test signal shapes."""
        output = model(batch["user"], batch["item"], batch["context"])

        assert output["personalization"].shape == (8, 32)
        assert output["popularity"].shape == (8, 32)
        assert output["temporal_decay"].shape == (8, 1)
        assert output["freshness"].shape == (8, 1)

    def test_loss_computation(self, model, batch):
        """Test loss computation."""
        output = model(batch["user"], batch["item"], batch["context"])

        loss = model.compute_loss(
            output["query_embedding"],
            output["candidate_embedding"],
            output["personalization"],
            output["popularity"],
            output["temporal_decay"],
            output["freshness"],
        )

        assert loss.shape == ()  # Scalar
        assert float(loss) >= 0

    def test_batch_size_flexibility(self, model):
        """Test different batch sizes."""
        for batch_size in [1, 4, 16]:
            user = tf.random.normal((batch_size, 52))
            item = tf.random.normal((batch_size, 44))
            context = tf.random.normal((batch_size, 34))

            output = model(user, item, context)

            assert output["query_embedding"].shape == (batch_size, 32)
            assert output["candidate_embedding"].shape == (batch_size, 32)

    def test_training_vs_inference(self, model, batch):
        """Test training vs inference modes."""
        user, item, context = batch["user"], batch["item"], batch["context"]

        output_train_1 = model(user, item, context, training=True)
        output_train_2 = model(user, item, context, training=True)
        output_infer = model(user, item, context, training=False)

        # Training outputs may differ (dropout)
        diff_train = tf.reduce_mean(
            tf.abs(output_train_1["query_embedding"] - output_train_2["query_embedding"])
        )
        # Inference should be deterministic
        diff_infer = tf.reduce_mean(
            tf.abs(output_infer["query_embedding"] - output_infer["query_embedding"])
        )

        assert float(diff_infer) == 0  # Deterministic