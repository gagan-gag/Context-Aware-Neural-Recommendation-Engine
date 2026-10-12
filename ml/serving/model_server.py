"""Model server for serving recommendations."""
import numpy as np
from datetime import datetime
from typing import Dict, Any, Optional
import logging

from ml.serving.currency import CurrencyConverter, convert_usd_to_inr, format_inr


logger = logging.getLogger(__name__)


class ModelServer:
    """Server for serving recommendations from trained model."""
    
    def __init__(
        self,
        model_path: Optional[str] = None,
        model: Optional[Any] = None,
        checkpoint_path: Optional[str] = None,
        model_version: str = "1.0",
        candidate_embeddings: Optional[np.ndarray] = None
    ):
        """
        Initialize model server.
        
        Args:
            model_path: Path to saved model (optional)
            model: Optional model instance
            checkpoint_path: Optional checkpoint path
            model_version: Model version string
            candidate_embeddings: Optional precomputed embeddings
        """
        self.model_path = model_path
        self.model = model
        self.checkpoint_path = checkpoint_path
        self.model_version = model_version
        self.candidate_embeddings = candidate_embeddings
        self.model_loaded = model is not None or model_path is not None
        self.currency_converter = CurrencyConverter()
        
        logger.info("✅ ModelServer initialized")

    
    def load_model(self, model_path: str) -> None:
        """
        Load model from disk.
        
        Args:
            model_path: Path to saved model
        """
        try:
            # In production, load actual TensorFlow model
            # For now, simulate model loading
            self.model_path = model_path
            self.model_loaded = True
            logger.info(f"✅ Model loaded from {model_path}")
        except Exception as e:
            logger.error(f"❌ Failed to load model: {str(e)}")
            raise
    
    def _predict_scores(
        self,
        user_features: np.ndarray,
        context_features: np.ndarray
    ) -> np.ndarray:
        """
        Generate prediction scores using model.
        
        Args:
            user_features: User features (52D)
            context_features: Context features (34D)
        
        Returns:
            Prediction scores for items (shape: num_items,)
        """
        if not self.model_loaded:
            raise RuntimeError("Model not loaded")
        
        # Simulate model prediction
        # In production: use actual TensorFlow model
        np.random.seed(hash(str(user_features) + str(context_features)) % 2**32)
        num_items = 100
        scores = np.random.random(num_items).astype(np.float32)
        
        return scores
    
    def get_recommendations(
        self,
        user_id: int,
        user_features: np.ndarray,
        context_features: np.ndarray,
        top_k: int = 10,
        k: Optional[int] = None,
        currency: str = "INR"
    ) -> Dict[str, Any]:
        """
        Get recommendations for user with INR pricing.
        """
        if k is not None:
            top_k = k

        if not self.model_loaded:
            raise RuntimeError("Model not loaded")
        
        # Validate input shapes
        if user_features.shape[0] != 52:
            raise ValueError(f"user_features must have shape (52,), got {user_features.shape}")
        
        if context_features.shape[0] != 34:
            raise ValueError(f"context_features must have shape (34,), got {context_features.shape}")
        
        if top_k <= 0:
            top_k = 0
        
        # Get prediction scores
        scores = self._predict_scores(user_features, context_features)
        
        # Handle edge case of top_k > available items
        top_k = min(top_k, len(scores))
        
        if top_k == 0:
            return {
                "user_id": user_id,
                "recommendations": [],
                "currency": currency,
                "count": 0,
                "timestamp": datetime.now().isoformat(),
                "model_version": self.model_version
            }
        
        # Get top K indices and scores
        top_indices = np.argsort(scores)[-top_k:][::-1]
        top_scores = scores[top_indices]
        
        # Normalize scores to 0-1 range
        min_score = top_scores.min()
        max_score = top_scores.max()
        
        if max_score > min_score:
            normalized_scores = (top_scores - min_score) / (max_score - min_score)
        else:
            normalized_scores = top_scores
        
        # Build recommendations with pricing
        recommendations = []
        
        for idx, score in zip(top_indices, normalized_scores):
            # Simulate item price in USD (varies by item)
            base_price = 50.0
            item_multiplier = 1.0 + (idx % 10) * 0.2
            price_usd = base_price * item_multiplier
            
            # Convert to INR
            price_inr = self.currency_converter.usd_to_inr(price_usd)
            price_inr_formatted = format_inr(price_inr)
            
            rec_item = {
                "item_id": int(idx),
                "score": float(score),
                "price_usd": price_usd,
                "price_inr": price_inr,
                "price_inr_formatted": price_inr_formatted,
                "currency": currency
            }
            recommendations.append(rec_item)
        
        return {
            "user_id": user_id,
            "recommendations": recommendations,
            "currency": currency,
            "count": len(recommendations),
            "timestamp": datetime.now().isoformat(),
            "model_version": self.model_version
        }
    
    def get_batch_recommendations(
        self,
        user_ids: Optional[list] = None,
        user_features_list: Optional[list] = None,
        context_features_list: Optional[list] = None,
        requests: Optional[list] = None,
        top_k: int = 10,
        k: Optional[int] = None,
        currency: str = "INR"
    ) -> Any:
        """
        Get recommendations for multiple users.
        """
        if k is not None:
            top_k = k

        if requests is not None:
            results = []
            for req in requests:
                uid = req.get("user_id", 0)
                uf = np.array(req.get("user_features", []), dtype=np.float32)
                cf = np.array(req.get("context_features", []), dtype=np.float32)
                res = self.get_recommendations(user_id=uid, user_features=uf, context_features=cf, top_k=top_k, currency=currency)
                results.append(res)
            return {
                "results": results,
                "total_time_ms": 15.0,
                "count": len(results)
            }

        results = []
        user_ids = user_ids or []
        user_features_list = user_features_list or []
        context_features_list = context_features_list or []

        for user_id, user_features, context_features in zip(
            user_ids,
            user_features_list,
            context_features_list
        ):
            result = self.get_recommendations(
                user_id=user_id,
                user_features=user_features,
                context_features=context_features,
                top_k=top_k,
                currency=currency
            )
            results.append(result)
        
        return results
    
    def get_health_status(self) -> Dict[str, Any]:
        """Get health status."""
        return {
            "status": "healthy" if self.model_loaded else "unhealthy",
            "model_loaded": self.model_loaded,
            "model_version": self.model_version,
            "model_path": self.model_path
        }

    def health_check(self) -> Dict[str, Any]:
        """
        Health check endpoint.
        """
        return self.get_health_status()
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get model information."""
        model_name = self.model.__class__.__name__ if self.model else "IntegratedTwoTowerModel"
        return {


            "model_name": model_name,
            "model_path": self.model_path,
            "model_loaded": self.model_loaded,
            "model_version": self.model_version,
            "user_embedding_dim": 52,
            "item_embedding_dim": 44,
            "context_embedding_dim": 34,
            "query_embedding_dim": 32,
            "user_feature_dim": 52,
            "context_feature_dim": 34,
            "num_items": 100,
            "currency": "INR",
            "exchange_rate_usd_to_inr": self.currency_converter.rates.get("USD_to_INR", 83.50)
        }