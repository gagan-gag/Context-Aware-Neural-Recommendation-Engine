"""Model registry for version management."""
from typing import Dict, List, Optional
from pathlib import Path
import json
from datetime import datetime

from .model_metadata import ModelMetadata


class ModelRegistry:
    """Registry for managing model versions."""
    
    def __init__(self, registry_path: str = "ml/versioning/registry.json"):
        """
        Initialize registry.
        
        Args:
            registry_path: Path to registry JSON file
        """
        self.registry_path = Path(registry_path)
        self.versions: Dict[str, ModelMetadata] = {}
        self.current_version: Optional[str] = None
        
        # Create registry directory if needed
        self.registry_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Load existing registry
        self._load()
    
    def register_model(self, metadata: ModelMetadata) -> None:
        """
        Register a new model version.
        
        Args:
            metadata: ModelMetadata for the version
        """
        if metadata.version in self.versions:
            raise ValueError(f"Version {metadata.version} already exists")
        
        self.versions[metadata.version] = metadata
        self._save()
        print(f"✅ Registered model version: {metadata.version}")
    
    def get_model(self, version: str) -> Optional[ModelMetadata]:
        """
        Get model metadata by version.
        
        Args:
            version: Version string (e.g., "1.0")
        
        Returns:
            ModelMetadata or None
        """
        return self.versions.get(version)
    
    def get_latest(self) -> Optional[ModelMetadata]:
        """Get latest model version."""
        if not self.versions:
            return None
        
        # Sort by creation date
        sorted_versions = sorted(
            self.versions.values(),
            key=lambda m: m.created_at,
            reverse=True
        )
        return sorted_versions[0]
    
    def get_best_performing(self) -> Optional[ModelMetadata]:
        """Get best performing model by recall@10."""
        if not self.versions:
            return None
        
        candidates = [
            m for m in self.versions.values()
            if m.recall_at_10 is not None
        ]
        
        if not candidates:
            return None
        
        return max(candidates, key=lambda m: m.recall_at_10)
    
    def set_current_version(self, version: str) -> None:
        """
        Set current/active version.
        
        Args:
            version: Version to set as current
        """
        if version not in self.versions:
            raise ValueError(f"Version {version} not found")
        
        self.current_version = version
        self._save()
        print(f"✅ Set current version to: {version}")
    
    def get_current_version(self) -> Optional[ModelMetadata]:
        """Get current/active model version."""
        if self.current_version is None:
            return None
        return self.versions.get(self.current_version)
    
    def list_versions(self) -> List[str]:
        """List all registered versions."""
        return sorted(self.versions.keys())
    
    def deprecate_version(self, version: str) -> None:
        """
        Mark version as deprecated.
        
        Args:
            version: Version to deprecate
        """
        if version not in self.versions:
            raise ValueError(f"Version {version} not found")
        
        self.versions[version].status = "deprecated"
        self._save()
        print(f"✅ Deprecated version: {version}")
    
    def archive_version(self, version: str) -> None:
        """
        Mark version as archived.
        
        Args:
            version: Version to archive
        """
        if version not in self.versions:
            raise ValueError(f"Version {version} not found")
        
        self.versions[version].status = "archived"
        self._save()
        print(f"✅ Archived version: {version}")
    
    def get_active_versions(self) -> List[ModelMetadata]:
        """Get all active model versions."""
        return [
            m for m in self.versions.values()
            if m.status == "active"
        ]
    
    def _load(self) -> None:
        """Load registry from disk."""
        if not self.registry_path.exists():
            return
        
        with open(self.registry_path, 'r') as f:
            data = json.load(f)
        
        self.versions = {
            v: ModelMetadata.from_dict(m)
            for v, m in data.get("versions", {}).items()
        }
        self.current_version = data.get("current_version")
    
    def _save(self) -> None:
        """Save registry to disk."""
        data = {
            "versions": {
                v: m.to_dict()
                for v, m in self.versions.items()
            },
            "current_version": self.current_version,
            "last_updated": datetime.now().isoformat()
        }
        
        with open(self.registry_path, 'w') as f:
            json.dump(data, f, indent=2)
    
    def __str__(self) -> str:
        """String representation."""
        return (
            f"ModelRegistry(versions={len(self.versions)}, "
            f"current={self.current_version})"
        )