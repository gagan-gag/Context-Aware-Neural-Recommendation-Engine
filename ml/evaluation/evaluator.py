"""Model evaluator using trained checkpoints."""
import tensorflow as tf
import json
from pathlib import Path
from typing import Dict
from .metrics import EvaluationMetrics
import numpy as np


class ModelEvaluator:
    """Evaluate trained model on test dataset."""
    
    def __init__(self, 
                 model: tf.keras.Model,
                 checkpoint_path: str = None,
                 k_values: list = None):
        """
        Args:
            model: Trained IntegratedTwoTowerModel
            checkpoint_path: Path to model weights
            k_values: K values for metrics (default [1, 3, 5, 10])
        """
        self.model = model
        self.checkpoint_path = checkpoint_path
        self.metrics = EvaluationMetrics(k_values=k_values)
        
        # Load checkpoint if provided
        if checkpoint_path and Path(checkpoint_path).exists():
            self.model.load_weights(checkpoint_path)
    
    def evaluate_batch(self,
                      user_features: tf.Tensor,
                      item_features: tf.Tensor,
                      context_features: tf.Tensor,
                      positive_indices: tf.Tensor,
                      candidate_embeddings: tf.Tensor) -> Dict[str, float]:
        """
        Evaluate on a single batch.
        
        Args:
            user_features: (batch_size, 52)
            item_features: (batch_size, 44)
            context_features: (batch_size, 34)
            positive_indices: (batch_size,)
            candidate_embeddings: (num_candidates, 32)
        
        Returns:
            dict: Batch metrics
        """
        
        # Forward pass (no gradients)
        with tf.no_grad():
            outputs = self.model(
                [user_features, item_features, context_features],
                training=False
            )
        
        # Query embedding
        query_emb = outputs["query_embedding"]  # (batch_size, 32)
        
        # Compute similarities with all candidates
        similarities = tf.linalg.matmul(
            query_emb, 
            candidate_embeddings, 
            transpose_b=True
        )  # (batch_size, num_candidates)
        
        # Create binary labels
        batch_size = tf.shape(query_emb)[0]
        num_candidates = tf.shape(candidate_embeddings)[0]
        
        # One-hot labels at positive indices
        y_true = tf.one_hot(positive_indices, depth=num_candidates)
        
        # Compute metrics for each sample in batch
        all_metrics = {}
        for i in range(batch_size):
            batch_metrics = self.metrics.compute_all(
                y_true[i],
                similarities[i]
            )
            
            # Aggregate
            for metric_name, value in batch_metrics.items():
                if metric_name not in all_metrics:
                    all_metrics[metric_name] = []
                all_metrics[metric_name].append(value)
        
        # Average across batch
        avg_metrics = {k: np.mean(v) for k, v in all_metrics.items()}
        return avg_metrics
    
    def evaluate_full(self, 
                     test_dataset,
                     num_batches: int = None) -> Dict[str, float]:
        """
        Evaluate on full test dataset.
        
        Args:
            test_dataset: TensorFlow dataset
            num_batches: Optional limit on batches
        
        Returns:
            dict: Aggregated metrics
        """
        
        all_results = {}
        batch_count = 0
        
        for batch_data in test_dataset:
            if num_batches and batch_count >= num_batches:
                break
            
            user_feat, item_feat, context_feat, pos_idx, cand_emb = batch_data
            
            batch_metrics = self.evaluate_batch(
                user_feat, item_feat, context_feat, pos_idx, cand_emb
            )
            
            # Aggregate
            for metric_name, value in batch_metrics.items():
                if metric_name not in all_results:
                    all_results[metric_name] = []
                all_results[metric_name].append(value)
            
            batch_count += 1
        
        # Final averages
        final_metrics = {k: np.mean(v) for k, v in all_results.items()}
        return final_metrics
    
    def save_results(self, results: Dict, output_path: str = "evaluation_results.json"):
        """
        Save evaluation results to JSON.
        
        Args:
            results: Metrics dictionary
            output_path: Output file path
        """
        # Convert numpy types to Python types
        clean_results = {
            k: float(v) if isinstance(v, (np.floating, tf.Tensor)) else v
            for k, v in results.items()
        }
        
        with open(output_path, "w") as f:
            json.dump(clean_results, f, indent=2)
        
        print(f"✅ Results saved to {output_path}")
    
    def print_results(self, results: Dict):
        """
        Pretty-print evaluation results.
        
        Args:
            results: Metrics dictionary
        """
        print("\n" + "="*60)
        print("📊 MODEL EVALUATION RESULTS")
        print("="*60)
        
        # Group by metric type
        recall_metrics = {k: v for k, v in results.items() if k.startswith("recall")}
        ndcg_metrics = {k: v for k, v in results.items() if k.startswith("ndcg")}
        hit_metrics = {k: v for k, v in results.items() if k.startswith("hit")}
        other_metrics = {k: v for k, v in results.items() 
                        if not any(k.startswith(x) for x in ["recall", "ndcg", "hit"])}
        
        # Print grouped
        if recall_metrics:
            print("\n🎯 Recall Metrics:")
            for k, v in sorted(recall_metrics.items()):
                print(f"   {k:15s} : {v:.4f}")
        
        if ndcg_metrics:
            print("\n📈 NDCG Metrics:")
            for k, v in sorted(ndcg_metrics.items()):
                print(f"   {k:15s} : {v:.4f}")
        
        if hit_metrics:
            print("\n✅ Hit Rate Metrics:")
            for k, v in sorted(hit_metrics.items()):
                print(f"   {k:15s} : {v:.4f}")
        
        if other_metrics:
            print("\n📊 Other Metrics:")
            for k, v in sorted(other_metrics.items()):
                print(f"   {k:15s} : {v:.4f}")
        
        print("\n" + "="*60 + "\n")