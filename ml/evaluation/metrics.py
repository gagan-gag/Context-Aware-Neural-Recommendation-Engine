"""Evaluation metrics for recommendation systems."""
import tensorflow as tf
import numpy as np
from typing import Dict


class RecallAtK:
    """Recall@K: Proportion of relevant items in top-K predictions."""
    
    def __init__(self, k: int = 10):
        self.k = k
    
    def compute(self, 
                y_true: tf.Tensor,
                y_pred: tf.Tensor) -> float:
        """
        Args:
            y_true: Binary labels (batch_size,) [0 or 1]
            y_pred: Prediction scores (batch_size,)
        
        Returns:
            recall@k: Float in [0, 1]
        """
        # Get top-K indices
        _, top_k_indices = tf.nn.top_k(
            y_pred, 
            k=tf.minimum(self.k, tf.shape(y_pred)[0])
        )
        
        # Check which top-K are relevant
        top_k_relevant = tf.gather(y_true, top_k_indices)
        
        # Count relevant items in top-K
        num_relevant_in_k = tf.reduce_sum(
            tf.cast(top_k_relevant, tf.float32)
        )
        
        # Total relevant items
        num_relevant = tf.reduce_sum(
            tf.cast(y_true, tf.float32)
        )
        
        # Avoid division by zero
        recall = tf.cond(
            num_relevant > 0,
            lambda: num_relevant_in_k / num_relevant,
            lambda: tf.constant(0.0)
        )
        
        return float(recall.numpy())


class NDCGAtK:
    """NDCG@K: Normalized Discounted Cumulative Gain."""
    
    def __init__(self, k: int = 10):
        self.k = k
    
    def compute(self,
                y_true: tf.Tensor,
                y_pred: tf.Tensor) -> float:
        """
        Compute NDCG@K.
        
        Args:
            y_true: Binary labels (batch_size,)
            y_pred: Prediction scores (batch_size,)
        
        Returns:
            ndcg@k: Float in [0, 1]
        """
        k = tf.minimum(self.k, tf.shape(y_pred)[0])
        
        # Get top-K predictions
        _, top_k_indices = tf.nn.top_k(y_pred, k=k)
        top_k_true = tf.gather(y_true, top_k_indices)
        
        # Compute DCG: sum(rel_i / log2(i+2)) for i in range(k)
        gains = tf.cast(top_k_true, tf.float32)
        discounts = 1.0 / tf.math.log(
            tf.range(2, k + 2, dtype=tf.float32)
        )
        dcg = tf.reduce_sum(gains * discounts)
        
        # Compute IDCG (ideal ranking)
        sorted_true = tf.sort(y_true, direction='DESCENDING')
        ideal_gains = tf.cast(sorted_true[:k], tf.float32)
        ideal_discounts = 1.0 / tf.math.log(
            tf.range(2, k + 2, dtype=tf.float32)
        )
        idcg = tf.reduce_sum(ideal_gains * ideal_discounts)
        
        # NDCG = DCG / IDCG
        ndcg = tf.cond(
            idcg > 0,
            lambda: dcg / idcg,
            lambda: tf.constant(0.0)
        )
        
        return float(ndcg.numpy())


class MRR:
    """Mean Reciprocal Rank: Average 1/rank of first relevant item."""
    
    def compute(self,
                y_true: tf.Tensor,
                y_pred: tf.Tensor) -> float:
        """
        Compute MRR.
        
        Args:
            y_true: Binary labels (batch_size,)
            y_pred: Prediction scores (batch_size,)
        
        Returns:
            mrr: Float in [0, 1]
        """
        # Get ranking order (argsort descending)
        ranked_indices = tf.argsort(y_pred, direction='DESCENDING')
        ranked_true = tf.gather(y_true, ranked_indices)
        
        # Find first relevant (value = 1)
        relevant_mask = tf.cast(ranked_true, tf.bool)
        first_relevant_indices = tf.where(relevant_mask)
        
        # If no relevant item, MRR = 0
        if tf.size(first_relevant_indices) == 0:
            return 0.0
        
        # Rank = index + 1
        first_rank = tf.cast(
            first_relevant_indices[0][0], 
            tf.float32
        ) + 1.0
        mrr = 1.0 / first_rank
        
        return float(mrr.numpy())


class HitRate:
    """Hit Rate@K: Proportion of queries with ≥1 relevant in top-K."""
    
    def __init__(self, k: int = 10):
        self.k = k
    
    def compute(self,
                y_true: tf.Tensor,
                y_pred: tf.Tensor) -> float:
        """
        Compute Hit Rate@K.
        
        Args:
            y_true: Binary labels (batch_size,)
            y_pred: Prediction scores (batch_size,)
        
        Returns:
            hit@k: Float (0.0 or 1.0)
        """
        k = tf.minimum(self.k, tf.shape(y_pred)[0])
        
        # Get top-K
        _, top_k_indices = tf.nn.top_k(y_pred, k=k)
        top_k_true = tf.gather(y_true, top_k_indices)
        
        # Hit = at least one relevant in top-K
        hit = tf.reduce_max(top_k_true) > 0
        
        return float(hit.numpy())


class EvaluationMetrics:
    """Unified evaluation metrics container."""
    
    def __init__(self, k_values: list = None):
        """
        Args:
            k_values: List of K values (default [1, 3, 5, 10])
        """
        self.k_values = k_values or [1, 3, 5, 10]
    
    def compute_all(self,
                    y_true: tf.Tensor,
                    y_pred: tf.Tensor) -> Dict[str, float]:
        """
        Compute all metrics.
        
        Args:
            y_true: Binary labels (batch_size,)
            y_pred: Prediction scores (batch_size,)
        
        Returns:
            dict: All metrics {metric_name: value}
        """
        results = {}
        
        # Recall@K
        for k in self.k_values:
            recall_k = RecallAtK(k=k)
            results[f"recall@{k}"] = recall_k.compute(y_true, y_pred)
        
        # NDCG@K
        for k in self.k_values:
            ndcg_k = NDCGAtK(k=k)
            results[f"ndcg@{k}"] = ndcg_k.compute(y_true, y_pred)
        
        # MRR
        mrr = MRR()
        results["mrr"] = mrr.compute(y_true, y_pred)
        
        # Hit Rate@K
        for k in self.k_values:
            hit_k = HitRate(k=k)
            results[f"hit@{k}"] = hit_k.compute(y_true, y_pred)
        
        return results