"""Negative sampling strategies for Two-Tower model training."""

import tensorflow as tf
from typing import Tuple, Dict


class NegativeSamplingStrategy:
    """Base class for negative sampling strategies."""

    def sample(
        self,
        batch_size: int,
        num_candidates: int,
        positive_indices: tf.Tensor,
    ) -> tf.Tensor:
        """
        Sample negative candidates.

        Args:
            batch_size: Batch size
            num_candidates: Total number of candidates
            positive_indices: Indices of positive candidates (batch_size,)

        Returns:
            Negative indices (batch_size, num_negatives)
        """
        raise NotImplementedError


class InBatchNegativeSampling(NegativeSamplingStrategy):
    """Use other batch items as negatives (most efficient)."""

    def __init__(self, num_negatives: int = 32):
        """
        Initialize in-batch negative sampling.

        Args:
            num_negatives: Number of negatives per query
        """
        self.num_negatives = num_negatives

    def sample(
        self,
        batch_size: int,
        num_candidates: int,
        positive_indices: tf.Tensor,
    ) -> tf.Tensor:
        """
        Sample in-batch negatives.

        In-batch negatives use other items in the batch that don't match
        the query's positive candidate.
        """
        negatives = []

        for i in range(batch_size):
            # All indices except the positive for this query
            all_indices = tf.range(batch_size)
            mask = tf.not_equal(all_indices, positive_indices[i])
            available = tf.boolean_mask(all_indices, mask)

            # Sample up to num_negatives
            num_to_sample = tf.minimum(self.num_negatives, tf.size(available))
            sampled = tf.random.shuffle(available)[:num_to_sample]

            # Pad if necessary
            if tf.size(sampled) < self.num_negatives:
                padding = self.num_negatives - tf.size(sampled)
                sampled = tf.concat(
                    [sampled, tf.zeros(padding, dtype=tf.int32)], axis=0
                )

            negatives.append(sampled)

        return tf.stack(negatives)


class HardNegativeSampling(NegativeSamplingStrategy):
    """Hard negatives: high-scoring but incorrect candidates."""

    def __init__(self, num_negatives: int = 32, top_k: int = 100):
        """
        Initialize hard negative sampling.

        Args:
            num_negatives: Number of hard negatives per query
            top_k: Sample from top K candidates (high similarity, wrong label)
        """
        self.num_negatives = num_negatives
        self.top_k = top_k

    def sample(
        self,
        batch_size: int,
        num_candidates: int,
        positive_indices: tf.Tensor,
        similarities: tf.Tensor,
    ) -> Tuple[tf.Tensor, tf.Tensor]:
        """
        Sample hard negatives: high-scoring but incorrect.

        Args:
            batch_size: Batch size
            num_candidates: Total candidates
            positive_indices: True candidate for each query
            similarities: Similarity scores (batch_size, num_candidates)

        Returns:
            (negative_indices, hard_scores)
        """
        hard_negatives = []
        hard_scores = []

        for i in range(batch_size):
            # Get top-k indices by similarity
            scores = similarities[i, :]
            num_scores = tf.shape(scores)[0]
            actual_k = tf.minimum(self.top_k, num_scores)
            _, top_k_indices = tf.nn.top_k(scores, k=actual_k)

            # Filter out the positive
            mask = tf.not_equal(top_k_indices, positive_indices[i])
            hard_pool = tf.boolean_mask(top_k_indices, mask)

            # Sample from hard pool
            num_to_sample = tf.minimum(self.num_negatives, tf.size(hard_pool))
            sampled_idx = tf.random.shuffle(hard_pool)[:num_to_sample]
            sampled_scores = tf.gather(scores, sampled_idx)

            # Pad if necessary
            if tf.size(sampled_idx) < self.num_negatives:
                padding = self.num_negatives - tf.size(sampled_idx)
                sampled_idx = tf.concat(
                    [sampled_idx, tf.zeros(padding, dtype=tf.int32)], axis=0
                )
                sampled_scores = tf.concat(
                    [sampled_scores, tf.zeros(padding, dtype=tf.float32)], axis=0
                )

            hard_negatives.append(sampled_idx)
            hard_scores.append(sampled_scores)

        return tf.stack(hard_negatives), tf.stack(hard_scores)


class CurriculumNegativeSampling(NegativeSamplingStrategy):
    """Curriculum learning: easy → hard negatives over time."""

    def __init__(self, num_negatives: int = 32, step: int = 1):
        """
        Initialize curriculum negative sampling.

        Args:
            num_negatives: Number of negatives per query
            step: Curriculum step (increases difficulty over training)
        """
        self.num_negatives = num_negatives
        self.step = step

    def sample(
        self,
        batch_size: int,
        num_candidates: int,
        positive_indices: tf.Tensor,
        similarities: tf.Tensor,
    ) -> tf.Tensor:
        """
        Sample negatives with curriculum difficulty.

        Early training: easy negatives (low similarity)
        Late training: hard negatives (high similarity)
        """
        # Difficulty = step (increases with training progress)
        # Lower step = easier negatives (lower similarity scores)
        # Higher step = harder negatives (higher similarity scores)

        negatives = []

        for i in range(batch_size):
            scores = similarities[i, :]

            # Sort by similarity
            sorted_indices = tf.argsort(scores)

            # Filter out positive
            mask = tf.not_equal(sorted_indices, positive_indices[i])
            available = tf.boolean_mask(sorted_indices, mask)

            # Curriculum: sample from different ranges based on step
            if self.step < 3:
                # Early: easy negatives (lowest scores)
                pool = available[: len(available) // 4]
            elif self.step < 6:
                # Mid: medium negatives
                pool = available[len(available) // 4 : 3 * len(available) // 4]
            else:
                # Late: hard negatives (highest scores)
                pool = available[3 * len(available) // 4 :]

            # Sample from pool
            num_to_sample = tf.minimum(self.num_negatives, tf.size(pool))
            sampled = tf.random.shuffle(pool)[:num_to_sample]

            # Pad if necessary
            if tf.size(sampled) < self.num_negatives:
                padding = self.num_negatives - tf.size(sampled)
                sampled = tf.concat(
                    [sampled, tf.zeros(padding, dtype=tf.int32)], axis=0
                )

            negatives.append(sampled)

        negatives_stack = tf.stack(negatives)
        # Return negatives and dummy scores (all zeros for curriculum)
        dummy_scores = tf.zeros_like(negatives_stack, dtype=tf.float32)
        return negatives_stack, dummy_scores


class NegativeSamplingLoss:
    """Loss function incorporating negative sampling."""

    def __init__(self, strategy: str = "in_batch", num_negatives: int = 32):
        """
        Initialize negative sampling loss.

        Args:
            strategy: "in_batch", "hard", or "curriculum"
            num_negatives: Number of negatives per query
        """
        self.strategy = strategy
        self.num_negatives = num_negatives

        if strategy == "in_batch":
            self.sampler = InBatchNegativeSampling(num_negatives)
        elif strategy == "hard":
            self.sampler = HardNegativeSampling(num_negatives)
        elif strategy == "curriculum":
            self.sampler = CurriculumNegativeSampling(num_negatives)
        else:
            raise ValueError(f"Unknown strategy: {strategy}")

    def compute_loss(
        self,
        query_embeddings: tf.Tensor,
        candidate_embeddings: tf.Tensor,
        positive_indices: tf.Tensor,
        temperature: float = 0.1,
    ) -> tf.Tensor:
        """
        Compute contrastive loss with negatives.
        ...
        """
        batch_size = tf.shape(query_embeddings)[0]

        # Compute all similarities
        similarities = tf.linalg.matmul(
            query_embeddings, candidate_embeddings, transpose_b=True
        )
        similarities = similarities / temperature

        # Sample negatives (pass similarities for hard/curriculum)
        if self.strategy == "in_batch":
            negative_indices = self.sampler.sample(
                batch_size,
                tf.shape(candidate_embeddings)[0],
                positive_indices,
            )
        else:
            negative_indices, _ = self.sampler.sample(
                batch_size,
                tf.shape(candidate_embeddings)[0],
                positive_indices,
                similarities,
            )

        # Create labels: positive at index 0, negatives at indices 1+
        labels = tf.zeros(batch_size, dtype=tf.int32)

        # Gather positive and negative scores
        positive_scores = tf.gather_nd(
            similarities,
            tf.stack([tf.range(batch_size), positive_indices], axis=1),
        )
        negative_scores = tf.gather_nd(
            similarities,
            tf.stack(
                [
                    tf.repeat(tf.range(batch_size), self.num_negatives),
                    tf.reshape(negative_indices, [-1]),
                ],
                axis=1,
            ),
        )

        # Reshape negative scores
        negative_scores = tf.reshape(
            negative_scores, (batch_size, self.num_negatives)
        )

        # Concatenate positive and negatives: (batch_size, 1 + num_negatives)
        all_scores = tf.concat([tf.expand_dims(positive_scores, 1), negative_scores], axis=1)

        # Cross-entropy loss
        loss = tf.nn.sparse_softmax_cross_entropy_with_logits(
            labels=labels, logits=all_scores
        )

        return tf.reduce_mean(loss)