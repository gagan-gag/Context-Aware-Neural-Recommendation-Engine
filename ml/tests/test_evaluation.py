"""Tests for evaluation metrics."""
import pytest
import tensorflow as tf
import numpy as np
from ml.evaluation.metrics import (
    RecallAtK, NDCGAtK, MRR, HitRate, EvaluationMetrics
)


class TestRecallAtK:
    """Test Recall@K metric."""
    
    def test_perfect_recall(self):
        """Perfect recall: all relevant in top-K."""
        y_true = tf.constant([1, 0, 0, 0], dtype=tf.int32)
        y_pred = tf.constant([10.0, 1.0, 2.0, 3.0])
        
        recall = RecallAtK(k=1)
        result = recall.compute(y_true, y_pred)
        
        assert result == 1.0

    def test_no_recall(self):
        """No recall: relevant item not in top-K."""
        y_true = tf.constant([0, 1, 0, 0], dtype=tf.int32)
        y_pred = tf.constant([10.0, 1.0, 2.0, 3.0])
        
        recall = RecallAtK(k=1)
        result = recall.compute(y_true, y_pred)
        
        assert result == 0.0

    def test_partial_recall(self):
        """Partial recall: 1 of 2 relevant in top-K."""
        y_true = tf.constant([1, 1, 0, 0], dtype=tf.int32)
        y_pred = tf.constant([10.0, 1.0, 2.0, 3.0])
        
        recall = RecallAtK(k=2)
        result = recall.compute(y_true, y_pred)
        
        assert result == 0.5


class TestNDCGAtK:
    """Test NDCG@K metric."""
    
    def test_perfect_ndcg(self):
        """Perfect ranking should give NDCG = 1.0."""
        y_true = tf.constant([1, 1, 0, 0], dtype=tf.int32)
        y_pred = tf.constant([10.0, 9.0, 1.0, 2.0])
        
        ndcg = NDCGAtK(k=2)
        result = ndcg.compute(y_true, y_pred)
        
        assert result == pytest.approx(1.0, abs=0.01)

    def test_worst_ndcg(self):
        """Worst ranking should give NDCG < 1.0."""
        y_true = tf.constant([1, 1, 0, 0], dtype=tf.int32)
        y_pred = tf.constant([1.0, 2.0, 10.0, 9.0])
        
        ndcg = NDCGAtK(k=2)
        result = ndcg.compute(y_true, y_pred)
        
        assert 0 <= result < 1.0


class TestMRR:
    """Test Mean Reciprocal Rank."""
    
    def test_first_position_mrr(self):
        """Relevant at rank 1: MRR = 1.0."""
        y_true = tf.constant([1, 0, 0], dtype=tf.int32)
        y_pred = tf.constant([10.0, 1.0, 2.0])
        
        mrr = MRR()
        result = mrr.compute(y_true, y_pred)
        
        assert result == 1.0

    def test_second_position_mrr(self):
        """Relevant at rank 2: MRR = 0.5."""
        y_true = tf.constant([0, 1, 0], dtype=tf.int32)
        y_pred = tf.constant([10.0, 9.0, 1.0])
        
        mrr = MRR()
        result = mrr.compute(y_true, y_pred)
        
        assert result == 0.5


class TestHitRate:
    """Test Hit Rate@K."""
    
    def test_hit(self):
        """Relevant in top-K: hit = 1."""
        y_true = tf.constant([1, 0, 0], dtype=tf.int32)
        y_pred = tf.constant([10.0, 1.0, 2.0])
        
        hit = HitRate(k=1)
        result = hit.compute(y_true, y_pred)
        
        assert result == 1.0

    def test_no_hit(self):
        """Not relevant in top-K: hit = 0."""
        y_true = tf.constant([0, 1, 0], dtype=tf.int32)
        y_pred = tf.constant([10.0, 1.0, 2.0])
        
        hit = HitRate(k=1)
        result = hit.compute(y_true, y_pred)
        
        assert result == 0.0


class TestEvaluationMetrics:
    """Test unified metrics container."""
    
    def test_compute_all(self):
        """Test computing all metrics together."""
        y_true = tf.constant([1, 1, 0, 0], dtype=tf.int32)
        y_pred = tf.constant([10.0, 9.0, 2.0, 1.0])
        
        metrics = EvaluationMetrics(k_values=[1, 3])
        results = metrics.compute_all(y_true, y_pred)
        
        # Check keys exist
        assert "recall@1" in results
        assert "recall@3" in results
        assert "ndcg@1" in results
        assert "ndcg@3" in results
        assert "mrr" in results
        assert "hit@1" in results
        assert "hit@3" in results
        
        # Check values in valid range
        for k, v in results.items():
            assert 0 <= v <= 1.0