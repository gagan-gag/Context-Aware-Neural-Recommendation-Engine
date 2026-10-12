"""Tests for Two-Tower model."""

import pytest
import tensorflow as tf
from ml.models.two_tower import TwoTowerModel, TwoTowerLoss


class TestTwoTowerModel:
    """Test Two-Tower model architecture."""

    @pytest.fixture
    def model(self):
        return TwoTowerModel(
            user_embedding_dim=52,
            item_embedding_dim=44,
            context_embedding_dim=34,
            query_tower_layers=(128, 64),
            candidate_tower_layers=(128, 64),
            output_dim=32,
            dropout_rate=0.2,
        )

    @pytest.fixture
    def batch(self):
        return {
            "user": tf.random.normal((8, 52)),
            "item": tf.random.normal((8, 44)),
            "context": tf.random.normal((8, 34)),
        }

    def test_model_initialization(self, model):
        assert model.user_embedding_dim == 52
        assert model.item_embedding_dim == 44
        assert model.context_embedding_dim == 34
        assert model.output_dim == 32

    def test_forward_pass_shape(self, model, batch):
        query_emb, candidate_emb = model(
            batch["user"], batch["item"], batch["context"], training=False
        )

        assert query_emb.shape == (8, 32)
        assert candidate_emb.shape == (8, 32)

    def test_forward_pass_batch_sizes(self, model):
        for batch_size in [1, 4, 16, 32]:
            user = tf.random.normal((batch_size, 52))
            item = tf.random.normal((batch_size, 44))
            context = tf.random.normal((batch_size, 34))

            query_emb, candidate_emb = model(user, item, context)

            assert query_emb.shape == (batch_size, 32)
            assert candidate_emb.shape == (batch_size, 32)

    def test_embedding_normalization(self, model, batch):
        query_emb, _ = model(batch["user"], batch["item"], batch["context"])

        mean = tf.reduce_mean(query_emb)
        std = tf.math.reduce_std(query_emb)

        assert float(mean) < 0.5
        assert 0.5 < float(std) < 1.5

    def test_training_vs_inference(self, model, batch):
        user, item, context = batch["user"], batch["item"], batch["context"]

        query_train_1, _ = model(user, item, context, training=True)
        query_train_2, _ = model(user, item, context, training=True)
        query_infer, _ = model(user, item, context, training=False)

        diff_train = tf.reduce_mean(tf.abs(query_train_1 - query_train_2))
        diff_infer = tf.reduce_mean(tf.abs(query_infer - query_infer))

        assert float(diff_train) > 0
        assert float(diff_infer) == 0

    def test_query_tower_layers(self, model):
        assert len(model.query_tower.layers) > 0
        assert model.query_tower.layers[-1].name.startswith("layer_normalization")

    def test_candidate_tower_layers(self, model):
        assert len(model.candidate_tower.layers) > 0
        assert model.candidate_tower.layers[-1].name.startswith("layer_normalization")

    def test_model_config(self, model):
        config = model.get_config()
        assert config["user_embedding_dim"] == 52
        assert config["item_embedding_dim"] == 44
        assert config["output_dim"] == 32


class TestTwoTowerLoss:
    @pytest.fixture
    def loss_fn(self):
        return TwoTowerLoss(temperature=0.1)

    def test_loss_computation(self, loss_fn):
        query_emb = tf.random.normal((8, 32))
        candidate_emb = tf.random.normal((8, 32))

        loss = loss_fn(query_emb, candidate_emb)

        assert loss.shape == ()
        assert float(loss) >= 0

    def test_loss_positive_pairs(self, loss_fn):
        emb = tf.random.normal((4, 32))

        loss_match = loss_fn(emb, emb)

        random_emb = tf.random.normal((4, 32))
        loss_mismatch = loss_fn(emb, random_emb)

        assert float(loss_match) < float(loss_mismatch)

    def test_loss_temperature_effect(self):
        query_emb = tf.random.normal((4, 32))
        candidate_emb = tf.random.normal((4, 32))

        loss_cold = TwoTowerLoss(temperature=0.01)(query_emb, candidate_emb)
        loss_hot = TwoTowerLoss(temperature=1.0)(query_emb, candidate_emb)

        assert float(loss_cold) != float(loss_hot)

    def test_loss_batch_size_invariance(self, loss_fn):
        for batch_size in [1, 8, 16]:
            query = tf.random.normal((batch_size, 32))
            candidate = tf.random.normal((batch_size, 32))

            loss = loss_fn(query, candidate)

            assert loss.shape == ()
            assert float(loss) >= 0
