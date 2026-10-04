"""Tests for model versioning and registry."""
import pytest
from datetime import datetime

from ml.versioning.model_metadata import ModelMetadata
from ml.versioning.model_registry import ModelRegistry
from ml.versioning.version_comparison import VersionComparison, ComparisonResult
from ml.versioning.ab_testing import ABTestingFramework


class TestModelMetadata:
    """Test ModelMetadata class."""
    
    def test_create_metadata(self):
        """Test creating model metadata."""
        metadata = ModelMetadata(
            version="1.0",
            created_at=datetime.now().isoformat(),
            author="test_user",
            description="Test model",
            checkpoint_path="checkpoints/model_v1.0.h5",
            recall_at_10=0.75,
            ndcg=0.68
        )
        
        assert metadata.version == "1.0"
        assert metadata.recall_at_10 == 0.75
    
    def test_metadata_to_dict(self):
        """Test converting metadata to dict."""
        metadata = ModelMetadata(
            version="1.0",
            created_at="2024-01-01",
            author="test",
            description="Test",
            checkpoint_path="test.h5"
        )
        
        data = metadata.to_dict()
        assert data["version"] == "1.0"
        assert isinstance(data, dict)
    
    def test_metadata_from_dict(self):
        """Test creating metadata from dict."""
        data = {
            "version": "1.0",
            "created_at": "2024-01-01",
            "author": "test",
            "description": "Test",
            "checkpoint_path": "test.h5"
        }
        
        metadata = ModelMetadata.from_dict(data)
        assert metadata.version == "1.0"
    
    def test_is_better_than(self):
        """Test comparing metadata."""
        m1 = ModelMetadata(
            version="1.0", created_at="2024-01-01", author="test",
            description="Test", checkpoint_path="test.h5",
            recall_at_10=0.75
        )
        m2 = ModelMetadata(
            version="1.1", created_at="2024-01-02", author="test",
            description="Test", checkpoint_path="test.h5",
            recall_at_10=0.70
        )
        
        assert m1.is_better_than(m2)
        assert not m2.is_better_than(m1)
    
    def test_performance_score(self):
        """Test performance score calculation."""
        metadata = ModelMetadata(
            version="1.0", created_at="2024-01-01", author="test",
            description="Test", checkpoint_path="test.h5",
            recall_at_10=0.8, ndcg=0.6
        )
        
        score = metadata.get_performance_score()
        assert 0 <= score <= 1
        assert score == 0.7  # (0.8 + 0.6) / 2


class TestModelRegistry:
    """Test ModelRegistry class."""
    
    @pytest.fixture
    def registry(self, tmp_path):
        """Create temporary registry."""
        registry_path = str(tmp_path / "registry.json")
        return ModelRegistry(registry_path)
    
    def test_register_model(self, registry):
        """Test registering a model."""
        metadata = ModelMetadata(
            version="1.0", created_at="2024-01-01", author="test",
            description="Test", checkpoint_path="test.h5"
        )
        
        registry.register_model(metadata)
        assert "1.0" in registry.versions
    
    def test_get_model(self, registry):
        """Test retrieving a model."""
        metadata = ModelMetadata(
            version="1.0", created_at="2024-01-01", author="test",
            description="Test", checkpoint_path="test.h5"
        )
        
        registry.register_model(metadata)
        retrieved = registry.get_model("1.0")
        
        assert retrieved is not None
        assert retrieved.version == "1.0"
    
    def test_get_latest(self, registry):
        """Test getting latest model."""
        for i in range(3):
            metadata = ModelMetadata(
                version=f"1.{i}", created_at=f"2024-01-0{i+1}", 
                author="test", description="Test", checkpoint_path="test.h5"
            )
            registry.register_model(metadata)
        
        latest = registry.get_latest()
        assert latest is not None
        assert latest.version == "1.2"
    
    def test_set_current_version(self, registry):
        """Test setting current version."""
        metadata = ModelMetadata(
            version="1.0", created_at="2024-01-01", author="test",
            description="Test", checkpoint_path="test.h5"
        )
        
        registry.register_model(metadata)
        registry.set_current_version("1.0")
        
        assert registry.current_version == "1.0"
    
    def test_list_versions(self, registry):
        """Test listing versions."""
        for i in range(3):
            metadata = ModelMetadata(
                version=f"1.{i}", created_at="2024-01-01", 
                author="test", description="Test", checkpoint_path="test.h5"
            )
            registry.register_model(metadata)
        
        versions = registry.list_versions()
        assert len(versions) == 3
    
    def test_deprecate_version(self, registry):
        """Test deprecating a version."""
        metadata = ModelMetadata(
            version="1.0", created_at="2024-01-01", author="test",
            description="Test", checkpoint_path="test.h5"
        )
        
        registry.register_model(metadata)
        registry.deprecate_version("1.0")
        
        assert registry.get_model("1.0").status == "deprecated"


class TestVersionComparison:
    """Test VersionComparison class."""
    
    def test_compare_models(self):
        """Test comparing two models."""
        m1 = ModelMetadata(
            version="1.0", created_at="2024-01-01", author="test",
            description="Test", checkpoint_path="test.h5",
            recall_at_10=0.75
        )
        m2 = ModelMetadata(
            version="1.1", created_at="2024-01-02", author="test",
            description="Test", checkpoint_path="test.h5",
            recall_at_10=0.70
        )
        
        result = VersionComparison.compare(m1, m2)
        
        assert result.winner == "1.0"
        assert result.improvement > 0
    
    def test_rank_models(self):
        """Test ranking multiple models."""
        models = {
            "1.0": ModelMetadata(
                version="1.0", created_at="2024-01-01", author="test",
                description="Test", checkpoint_path="test.h5",
                recall_at_10=0.75
            ),
            "1.1": ModelMetadata(
                version="1.1", created_at="2024-01-02", author="test",
                description="Test", checkpoint_path="test.h5",
                recall_at_10=0.80
            ),
            "1.2": ModelMetadata(
                version="1.2", created_at="2024-01-03", author="test",
                description="Test", checkpoint_path="test.h5",
                recall_at_10=0.72
            )
        }
        
        ranked = VersionComparison.rank_models(models)
        
        assert ranked[0][0] == "1.1"  # Best first
        assert ranked[1][0] == "1.0"
        assert ranked[2][0] == "1.2"


class TestABTesting:
    """Test ABTestingFramework class."""
    
    def test_create_test(self):
        """Test creating A/B test."""
        framework = ABTestingFramework()
        
        config = framework.create_test(
            "test_1",
            "1.0",
            "1.1",
            split=0.5,
            description="Test A/B"
        )
        
        assert config.version_a == "1.0"
        assert config.version_b == "1.1"
        assert config.split == 0.5
    
    def test_route_request(self):
        """Test routing single request."""
        framework = ABTestingFramework()
        framework.create_test("test_1", "1.0", "1.1", split=0.5)
        
        version = framework.route_request("test_1")
        assert version in ["1.0", "1.1"]
    
    def test_route_requests(self):
        """Test routing multiple requests."""
        framework = ABTestingFramework()
        framework.create_test("test_1", "1.0", "1.1", split=0.5)
        
        results = framework.route_requests("test_1", 100)
        
        assert results["1.0"] + results["1.1"] == 100
    
    def test_end_test(self):
        """Test ending A/B test."""
        framework = ABTestingFramework()
        framework.create_test("test_1", "1.0", "1.1")
        
        result = framework.end_test(
            "test_1",
            version_a_success_rate=0.80,
            version_b_success_rate=0.75,
            requests=1000
        )
        
        assert result.winner == "1.0"
        assert "test_1" not in framework.active_tests
        assert "test_1" in framework.test_results