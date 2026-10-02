"""Model server for inference."""
import tensorflow as tf
import numpy as np
from typing import List, Dict
from datetime import datetime
from pathlib import Path


class ModelServer:
    """Serve trained model for inference."""
    
    def __init__(self, 
                 model: tf.keras.Model,
                 checkpoint_path: str,
                 model_version: str = "1.0",
                 candidate_embeddings: np.ndarray = None):
        """
        Args:
            model: IntegratedTwoTowerModel
            checkpoint_path: Path to model weights
            model_version: Model version string
            candidate_embeddings: Pre-computed item embeddings (num_items, 32)
        """
        self.model = model
        self.checkpoint_path = checkpoint_path
        self.model_version = model_version
        self.candidate_embeddings = candidate_embeddings
        self.model_loaded = False
        self.load_time = None
        
        # Load model
        self._load_model()
    
    def _load_model(self):
        """Load model weights from checkpoint."""
        try:
            if Path(self.checkpoint_path).exists():
                self.model.load_weights(self.checkpoint_path)
                self.model_loaded = True
                self.load_time = datetime.now().isoformat()
                print(f"✅ Model loaded from {self.checkpoint_path}")
            else:
                print(f"⚠️ Checkpoint not found: {self.checkpoint_path}")
                self.model_loaded = False
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            self.model_loaded = False
    
    def get_recommendations(self, user_id, user_features, context_features, k=5):
        """
        Get recommendations for single user.
        
        Args:
            user_id: User ID
            user_features: User embedding (52D)
            context_features: Context embedding (34D)
            k: Number of recommendations
        
        Returns:
            dict: Recommendations with scores
        """
        if not self.model_loaded:
            raise RuntimeError("Model not loaded")
        
        if self.candidate_embeddings is None:
            raise RuntimeError("Candidate embeddings not provided")
        
        # Prepare inputs
        user_feat = tf.constant([user_features], dtype=tf.float32)
        context_feat = tf.constant([context_features], dtype=tf.float32)
        
        # Create dummy item features (will be replaced by item embeddings)
        num_items = self.candidate_embeddings.shape[0]
        item_feat = tf.zeros((1, 44), dtype=tf.float32)
        
        # Forward pass
                # Forward pass (inference mode)
        outputs = self.model(
            user_feat, 
            item_feat, 
            context_feat,
            training=False
        )
        
        # Get query embedding
        query_emb = outputs["query_embedding"]  # (1, 32)
        
        # Compute similarities
        similarities = tf.linalg.matmul(
            query_emb,
            tf.constant(self.candidate_embeddings, dtype=tf.float32),
            transpose_b=True
        )  # (1, num_items)
        
        scores = similarities[0].numpy()  # (num_items,)
        
        # Get top-K
        top_k_indices = np.argsort(scores)[-k:][::-1]
        top_k_scores = scores[top_k_indices]
        
        # Normalize scores to [0, 1]
        min_score = np.min(top_k_scores)
        max_score = np.max(top_k_scores)
        if max_score > min_score:
            normalized_scores = (top_k_scores - min_score) / (max_score - min_score)
        else:
            normalized_scores = np.ones_like(top_k_scores)
        
        # Format recommendations
        recommendations = []
        for rank, (item_id, score) in enumerate(zip(top_k_indices, normalized_scores)):
            recommendations.append({
                "item_id": int(item_id),
                "score": float(score),
                "rank": rank + 1
            })
        
        return {
            "user_id": user_id,
            "recommendations": recommendations,
            "timestamp": datetime.now().isoformat(),
            "model_version": self.model_version
        }
    
    def get_batch_recommendations(self,
                                 requests: List[Dict],
                                 k: int = 10) -> Dict:
        """
        Get recommendations for multiple users.
        
        Args:
            requests: List of recommendation requests
            k: Number of recommendations per user
        
        Returns:
            dict: Batch results with timing
        """
        import time
        start_time = time.time()
        
        results = []
        for req in requests:
            result = self.get_recommendations(
                user_id=req["user_id"],
                user_features=np.array(req["user_features"]),
                context_features=np.array(req["context_features"]),
                k=k
            )
            results.append(result)
        
        elapsed_ms = (time.time() - start_time) * 1000
        
        return {
            "results": results,
            "total_time_ms": elapsed_ms
        }
    
    def get_health_status(self) -> Dict:
        """Get API health status."""
        return {
            "status": "healthy" if self.model_loaded else "unhealthy",
            "model_loaded": self.model_loaded,
            "model_version": self.model_version,
            "timestamp": datetime.now().isoformat()
        }
    
    def get_model_info(self) -> Dict:
        """Get model metadata."""
        return {
            "model_name": "IntegratedTwoTowerModel",
            "model_version": self.model_version,
            "checkpoint_path": self.checkpoint_path,
            "user_embedding_dim": 52,
            "item_embedding_dim": 44,
            "context_embedding_dim": 34,
            "query_embedding_dim": 32,
            "training_date": self.load_time,
            "evaluation_metrics": {
                "recall@10": 0.85,  # Placeholder
                "ndcg@10": 0.72,
                "hit@10": 0.92
            }
        }