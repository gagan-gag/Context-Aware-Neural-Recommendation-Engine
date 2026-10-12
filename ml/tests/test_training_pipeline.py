"""Tests for training pipeline."""

import pytest
import tensorflow as tf
from ml.training.training_pipeline import TrainingConfig, TrainingPipeline
from ml.models.integrated_two_tower import IntegratedTwoTowerModel
from ml.models.negative_sampling import NegativeSamplingLoss


class TestTrainingConfig:
    """Test training configuration."""

    def test_demo_mode_config(self):
        """Test DEMO mode configuration."""
        config = TrainingConfig(mode="DEMO")
        assert config.num_samples == 1000
        assert config.epochs == 1
        assert config.eval_freq == 1

    def test_small_mode_config(self):
        """Test SMALL mode configuration."""
        config = TrainingConfig(mode="SMALL")
        assert config.num_samples == 10000
        assert config.epochs == 3
        assert config.eval_freq == 10

    def test_full_mode_config(self):
        """Test FULL mode configuration."""
        config = TrainingConfig(mode="FULL")
        assert config.num_samples == 1000000
        assert config.epochs == 5
        assert config.eval_freq == 100

    def test_config_to_dict(self):
        """Test config serialization."""
        config = TrainingConfig(mode="DEMO", batch_size=64)
        config_dict = config.to_dict()

        assert config_dict["mode"] == "DEMO"
        assert config_dict["batch_size"] == 64
        assert config_dict["epochs"] == 1


class TestTrainingPipeline:
    """Test training pipeline."""

    @pytest.fixture
    def setup(self):
        """Setup training pipeline."""
        config = TrainingConfig(mode="DEMO", batch_size=4)
        model = IntegratedTwoTowerModel(
            user_embedding_dim=52,
            item_embedding_dim=44,
            context_embedding_dim=34,
            output_dim=32,
        )
        loss_fn = NegativeSamplingLoss(strategy="in_batch", num_negatives=2)
        pipeline = TrainingPipeline(model, loss_fn, config)

        return pipeline, config

    def test_train_step(self, setup):
        """Test single training step."""
        pipeline, _ = setup

        # Create dummy batch
        user_feat = tf.random.normal((4, 52))
        item_feat = tf.random.normal((4, 44))
        context_feat = tf.random.normal((4, 34))
        pos_idx = tf.constant([0, 1, 2, 3])
        cand_emb = tf.random.normal((10, 32))

        loss = pipeline.train_step(
            user_feat, item_feat, context_feat, pos_idx, cand_emb
        )

        assert float(loss) >= 0
        assert loss.shape == ()  # Scalar

    def test_eval_step(self, setup):
        """Test evaluation step."""
        pipeline, _ = setup

        user_feat = tf.random.normal((4, 52))
        item_feat = tf.random.normal((4, 44))
        context_feat = tf.random.normal((4, 34))
        pos_idx = tf.constant([0, 1, 2, 3])
        cand_emb = tf.random.normal((10, 32))

        loss = pipeline.eval_step(
            user_feat, item_feat, context_feat, pos_idx, cand_emb
        )

        assert float(loss) >= 0

    def test_history_tracking(self, setup):
        """Test history is tracked."""
        pipeline, _ = setup

        assert "loss" in pipeline.history
        assert "val_loss" in pipeline.history
        assert "learning_rate" in pipeline.history

    def test_checkpoint_save(self, setup, tmp_path):
        """Test checkpoint saving."""
        pipeline, _ = setup
        pipeline.config.checkpoint_dir = tmp_path

        # Build model first by calling it
        user_feat = tf.random.normal((1, 52))
        item_feat = tf.random.normal((1, 44))
        context_feat = tf.random.normal((1, 34))
        _ = pipeline.model(user_feat, item_feat, context_feat, training=False)

        pipeline.save_checkpoint(epoch=0, is_best=True)

        checkpoint_path = tmp_path / "best_model_epoch_0.weights.h5"
        assert checkpoint_path.exists()

    def test_history_save(self, setup, tmp_path):
        """Test history saving."""
        pipeline, _ = setup
        pipeline.config.checkpoint_dir = tmp_path
        pipeline.history["loss"] = [0.5, 0.4, 0.3]
        pipeline.history["val_loss"] = [0.6, 0.5, 0.4]

        pipeline.save_history()

        history_path = tmp_path / "training_history.json"
        assert history_path.exists()