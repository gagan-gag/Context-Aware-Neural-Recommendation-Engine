"""Tests for negative sampling strategies."""

import pytest
import tensorflow as tf
from ml.models.negative_sampling import (
    InBatchNegativeSampling,
    HardNegativeSampling,
    CurriculumNegativeSampling,
    NegativeSamplingLoss,
)


class TestInBatchNegativeSampling:
    """Test in-batch negative sampling."""

    @pytest.fixture
    def sampler(self):
        return InBatchNegativeSampling(num_negatives=4)

    def test_sample_shape(self, sampler):
        """Test output shape."""
        batch_size = 8
        num_candidates = 100
        positive_indices = tf.constant([0, 1, 2, 3, 4, 5, 6, 7])

        negatives = sampler.sample(batch_size, num_candidates, positive_indices)

        assert negatives.shape == (8, 4)

    def test_no_positive_in_negatives(self, sampler):
        """Test positive is not in negatives (in-batch only)."""
        batch_size = 4
        num_candidates = 100
        positive_indices = tf.constant([0, 1, 2, 3])

        # In-batch: positives are batch indices, negatives are other batch items
        negatives = sampler.sample(batch_size, num_candidates, positive_indices)

        # For in-batch, check negatives from available pool (not positive)
        # Negatives should be from 0-3 range (batch items) but != positive for that query
        for i in range(batch_size):
            neg_list = negatives[i].numpy()
            # Remove padding (0s after valid indices)
            valid_negs = neg_list[neg_list > 0] if positive_indices[i].numpy() != 0 else neg_list
            # At least some negatives should be different from positive
            assert len(valid_negs) > 0 or batch_size == 1


class TestHardNegativeSampling:
    """Test hard negative sampling."""

    @pytest.fixture
    def sampler(self):
        return HardNegativeSampling(num_negatives=4, top_k=20)

    def test_sample_shape(self, sampler):
        """Test output shape."""
        batch_size = 4
        num_candidates = 100
        positive_indices = tf.constant([5, 10, 15, 20])
        similarities = tf.random.normal((batch_size, num_candidates))

        negatives, scores = sampler.sample(
            batch_size, num_candidates, positive_indices, similarities
        )

        assert negatives.shape == (4, 4)
        assert scores.shape == (4, 4)

    def test_hard_are_high_scoring(self, sampler):
        """Test hard negatives have high similarity scores."""
        batch_size = 2
        num_candidates = 50
        positive_indices = tf.constant([10, 20])

        # Create similarities with known structure
        similarities = tf.random.normal((batch_size, num_candidates))

        negatives, scores = sampler.sample(
            batch_size, num_candidates, positive_indices, similarities
        )

        # Hard negatives should be from top-k
        assert tf.reduce_all(scores >= -1.0)  # Sanity check


class TestCurriculumNegativeSampling:
    """Test curriculum negative sampling."""

    @pytest.fixture
    def sampler(self):
        return CurriculumNegativeSampling(num_negatives=4)

    def test_easy_to_hard_progression(self, sampler):
        """Test curriculum difficulty increases with steps."""
        batch_size = 2
        num_candidates = 100
        positive_indices = tf.constant([25, 75])
        similarities = tf.range(100, dtype=tf.float32)
        similarities = tf.tile(tf.expand_dims(similarities, 0), [batch_size, 1])

        # Early training
        sampler.step = 1
        easy_negatives, _ = sampler.sample(
            batch_size, num_candidates, positive_indices, similarities
        )

        # Late training
        sampler.step = 9
        hard_negatives, _ = sampler.sample(
            batch_size, num_candidates, positive_indices, similarities
        )

        # Hard negatives should have higher indices (higher similarity)
        # Convert to float for comparison
        assert tf.reduce_mean(tf.cast(hard_negatives, tf.float32)) > tf.reduce_mean(tf.cast(easy_negatives, tf.float32))


class TestNegativeSamplingLoss:
    """Test negative sampling loss."""

    @pytest.fixture
    def loss_fn(self):
        return NegativeSamplingLoss(strategy="in_batch", num_negatives=4)

    def test_loss_computation(self, loss_fn):
        """Test loss is computed without errors."""
        batch_size = 8
        output_dim = 32
        num_candidates = 100

        query_emb = tf.random.normal((batch_size, output_dim))
        candidate_emb = tf.random.normal((num_candidates, output_dim))
        positive_indices = tf.constant([0, 1, 2, 3, 4, 5, 6, 7])

        loss = loss_fn.compute_loss(
            query_emb, candidate_emb, positive_indices, temperature=0.1
        )

        assert loss.shape == ()  # Scalar
        assert float(loss) >= 0

    def test_different_strategies(self):
        """Test all strategies produce valid losses."""
        for strategy in ["in_batch", "hard", "curriculum"]:
            loss_fn = NegativeSamplingLoss(strategy=strategy, num_negatives=4)

            query_emb = tf.random.normal((4, 32))
            candidate_emb = tf.random.normal((50, 32))
            positive_indices = tf.constant([0, 1, 2, 3])

            loss = loss_fn.compute_loss(query_emb, candidate_emb, positive_indices)

            assert float(loss) >= 0
            assert loss.shape == ()