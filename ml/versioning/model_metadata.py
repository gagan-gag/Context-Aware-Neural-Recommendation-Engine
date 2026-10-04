"""Model metadata and versioning."""
from datetime import datetime
from typing import Dict, Any, Optional
from dataclasses import dataclass, asdict
import json


@dataclass
class ModelMetadata:
    """Metadata for a model version."""
    
    version: str  # e.g., "1.0", "1.1", "2.0"
    created_at: str
    author: str
    description: str
    checkpoint_path: str
    
    # Performance metrics
    recall_at_10: Optional[float] = None
    ndcg: Optional[float] = None
    mrr: Optional[float] = None
    hit_rate: Optional[float] = None
    
    # Architecture info
    user_embedding_dim: int = 52
    item_embedding_dim: int = 44
    context_embedding_dim: int = 34
    output_dim: int = 32
    
    # Training info
    training_epochs: Optional[int] = None
    training_loss: Optional[float] = None
    validation_loss: Optional[float] = None
    
    # Additional metadata
    tags: list = None
    notes: str = ""
    status: str = "active"  # active, deprecated, archived
    
    def __post_init__(self):
        """Initialize defaults."""
        if self.tags is None:
            self.tags = []
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return asdict(self)
    
    def to_json(self) -> str:
        """Convert to JSON string."""
        return json.dumps(self.to_dict(), indent=2)
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ModelMetadata":
        """Create from dictionary."""
        return cls(**data)
    
    @classmethod
    def from_json(cls, json_str: str) -> "ModelMetadata":
        """Create from JSON string."""
        data = json.loads(json_str)
        return cls.from_dict(data)
    
    def is_better_than(self, other: "ModelMetadata") -> bool:
        """Compare if this version is better than another."""
        if self.recall_at_10 is None or other.recall_at_10 is None:
            return False
        return self.recall_at_10 > other.recall_at_10
    
    def get_performance_score(self) -> float:
        """Calculate overall performance score (0-1)."""
        metrics = []
        
        if self.recall_at_10 is not None:
            metrics.append(self.recall_at_10)
        if self.ndcg is not None:
            metrics.append(self.ndcg)
        if self.mrr is not None:
            metrics.append(self.mrr)
        if self.hit_rate is not None:
            metrics.append(self.hit_rate)
        
        if not metrics:
            return 0.0
        
        return sum(metrics) / len(metrics)
    
    def __str__(self) -> str:
        """String representation."""
        return (
            f"ModelMetadata(version={self.version}, "
            f"created_at={self.created_at}, "
            f"recall@10={self.recall_at_10}, "
            f"status={self.status})"
        )