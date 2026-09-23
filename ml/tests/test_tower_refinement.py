"""Tests for refined query and candidate towers."""

import pytest
import tensorflow as tf
from ml.models.query_tower import QueryTowerRefined
from ml.models.candidate_tower import CandidateTowerRefined


class TestQueryTowerRefined:
    """Test refined query tower."""

    @pytest.fixture
    def tower(self):
        return QueryTowerRefined(
            user_embedding_dim=52,
            context_embedding_dim=34,
            hidden_layers=(128, 64),
            output_dim=32,
        )

    @pytest.fixture
    def batch(self):
        return {
            "user": tf.random.normal((8, 52)),
            "context": tf.random.normal((8, 34)),
        }

    def test_output_structure(self, tower, batch):
        """Test output contains all required signals."""
        output = tower(batch["user"], batch["context"], training=False)

        assert "embedding" in output
        assert "personalization" in output
        assert "temporal_decay" in output

    def test_embedding_shape(self, tower, batch):
        """Test embedding shape."""
        output = tower(batch["user"], batch["context"])
        assert output["embedding"].shape == (8, 32)

    def test_personalization_shape(self, tower, batch):
        """Test personalization signal shape."""
        output = tower(batch["user"], batch["context"])
        assert output["personalization"].shape == (8, 32)

    def test_temporal_decay_range(self, tower, batch):
        """Test temporal decay is in [0, 1]."""
        output = tower(batch["user"], batch["context"])
        decay = output["temporal_decay"]

        assert tf.reduce_min(decay) >= 0
        assert tf.reduce_max(decay) <= 1


class TestCandidateTowerRefined:
    """Test refined candidate tower."""

    @pytest.fixture
    def tower(self):
        return CandidateTowerRefined(
            item_embedding_dim=44,
            context_embedding_dim=34,
            hidden_layers=(128, 64),
            output_dim=32,
        )

    @pytest.fixture
    def batch(self):
        return {
            "item": tf.random.normal((8, 44)),
            "context": tf.random.normal((8, 34)),
        }

    def test_output_structure(self, tower, batch):
        """Test output contains all required signals."""
        output = tower(batch["item"], batch["context"], training=False)

        assert "embedding" in output
        assert "popularity" in output
        assert "freshness" in output

    def test_embedding_shape(self, tower, batch):
        """Test embedding shape."""
        output = tower(batch["item"], batch["context"])
        assert output["embedding"].shape == (8, 32)

    def test_popularity_shape(self, tower, batch):
        """Test popularity signal shape."""
        output = tower(batch["item"], batch["context"])
        assert output["popularity"].shape == (8, 32)

    def test_freshness_range(self, tower, batch):
        """Test freshness is in [0, 1]."""
        output = tower(batch["item"], batch["context"])
        freshness = output["freshness"]

        assert tf.reduce_min(freshness) >= 0
        assert tf.reduce_max(freshness) <= 1
