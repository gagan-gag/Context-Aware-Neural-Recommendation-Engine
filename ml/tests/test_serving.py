"""Tests for model serving."""
import pytest
import numpy as np
import tensorflow as tf
from fastapi.testclient import TestClient

from ml.serving.model_server import ModelServer
from ml.serving.app import app
from ml.models.integrated_two_tower import IntegratedTwoTowerModel


class TestModelServer:
    """Test model server."""
    
    @pytest.fixture
    def model_server(self):
        """Setup model server."""
        model = IntegratedTwoTowerModel(
            user_embedding_dim=52,
            item_embedding_dim=44,
            context_embedding_dim=34,
            output_dim=32
        )
        
        # Mock embeddings
        candidate_embeddings = np.random.randn(1000, 32).astype(np.float32)
        
        server = ModelServer(
            model=model,
            checkpoint_path="fake_checkpoint.h5",
            model_version="1.0",
            candidate_embeddings=candidate_embeddings
        )
        
        return server
    
    def test_health_status(self, model_server):
        """Test health check."""
        health = model_server.get_health_status()
        
        assert "status" in health
        assert "model_loaded" in health
        assert health["model_version"] == "1.0"
    
    def test_model_info(self, model_server):
        """Test model info."""
        info = model_server.get_model_info()
        
        assert info["model_name"] == "IntegratedTwoTowerModel"
        assert info["user_embedding_dim"] == 52
        assert info["item_embedding_dim"] == 44
        assert info["context_embedding_dim"] == 34
        assert info["query_embedding_dim"] == 32
    
    def test_recommendations_shape(self, model_server):
        """Test recommendation output shape."""
        model_server.model_loaded = True  # Mock loaded
        
        user_features = np.random.randn(52).astype(np.float32)
        context_features = np.random.randn(34).astype(np.float32)
        
        result = model_server.get_recommendations(
            user_id=1,
            user_features=user_features,
            context_features=context_features,
            k=10
        )
        
        assert result["user_id"] == 1
        assert len(result["recommendations"]) == 10
        assert "timestamp" in result
        assert "model_version" in result
    
    def test_recommendations_scores_normalized(self, model_server):
        """Test that recommendation scores are normalized."""
        model_server.model_loaded = True
        
        user_features = np.random.randn(52).astype(np.float32)
        context_features = np.random.randn(34).astype(np.float32)
        
        result = model_server.get_recommendations(
            user_id=1,
            user_features=user_features,
            context_features=context_features,
            k=10
        )
        
        # Check scores are in [0, 1]
        for rec in result["recommendations"]:
            assert 0 <= rec["score"] <= 1
    
    def test_batch_recommendations(self, model_server):
        """Test batch recommendations."""
        model_server.model_loaded = True
        
        requests = [
            {
                "user_id": i,
                "user_features": np.random.randn(52).tolist(),
                "context_features": np.random.randn(34).tolist()
            }
            for i in range(5)
        ]
        
        result = model_server.get_batch_recommendations(
            requests=requests,
            k=10
        )
        
        assert len(result["results"]) == 5
        assert "total_time_ms" in result


class TestFastAPIApp:
    """Test FastAPI application."""
    
    @pytest.fixture
    def client(self):
        """Setup test client."""
        return TestClient(app)
    
    def test_health_endpoint(self, client):
        """Test /health endpoint."""
        response = client.get("/health")
        
        assert response.status_code in [200, 503]  # 503 if model not loaded
    
    def test_model_info_endpoint(self, client):
        """Test /model-info endpoint."""
        response = client.get("/model-info")
        
        assert response.status_code in [200, 503]
    
    def test_root_endpoint(self, client):
        """Test root endpoint."""
        response = client.get("/")
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "docs" in data