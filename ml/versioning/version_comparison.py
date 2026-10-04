"""Model version comparison utilities."""
from typing import Dict, Optional, Tuple
from dataclasses import dataclass

from .model_metadata import ModelMetadata


@dataclass
class ComparisonResult:
    """Result of comparing two model versions."""
    
    version1: str
    version2: str
    winner: Optional[str]  # None if tie, version string if winner
    metrics: Dict[str, Dict[str, Optional[float]]]
    improvement: Optional[float]  # % improvement of winner over loser
    
    def __str__(self) -> str:
        """String representation."""
        if self.winner:
            return (
                f"Winner: {self.winner} "
                f"(+{self.improvement:.2f}% improvement)"
            )
        return "Tie"


class VersionComparison:
    """Compare model versions."""
    
    @staticmethod
    def compare(
        model1: ModelMetadata,
        model2: ModelMetadata,
        metric: str = "recall_at_10"
    ) -> ComparisonResult:
        """
        Compare two model versions.
        
        Args:
            model1: First model
            model2: Second model
            metric: Metric to compare on
        
        Returns:
            ComparisonResult with comparison details
        """
        # Get metric values
        val1 = getattr(model1, metric, None)
        val2 = getattr(model2, metric, None)
        
        # Determine winner
        winner = None
        improvement = None
        
        if val1 is not None and val2 is not None:
            if val1 > val2:
                winner = model1.version
                improvement = ((val1 - val2) / val2) * 100
            elif val2 > val1:
                winner = model2.version
                improvement = ((val2 - val1) / val1) * 100
        
        # Build metrics dict
        metrics = {
            metric: {
                model1.version: val1,
                model2.version: val2
            }
        }
        
        return ComparisonResult(
            version1=model1.version,
            version2=model2.version,
            winner=winner,
            metrics=metrics,
            improvement=improvement
        )
    
    @staticmethod
    def compare_multiple(
        models: Dict[str, ModelMetadata],
        metric: str = "recall_at_10"
    ) -> Dict[str, float]:
        """
        Compare multiple models on a metric.
        
        Args:
            models: Dict of {version: ModelMetadata}
            metric: Metric to compare on
        
        Returns:
            Dict of {version: metric_value}
        """
        results = {}
        
        for version, model in models.items():
            val = getattr(model, metric, None)
            results[version] = val
        
        return results
    
    @staticmethod
    def rank_models(
        models: Dict[str, ModelMetadata],
        metric: str = "recall_at_10"
    ) -> list:
        """
        Rank models by a metric.
        
        Args:
            models: Dict of {version: ModelMetadata}
            metric: Metric to rank by
        
        Returns:
            List of (version, value) tuples sorted by value (descending)
        """
        values = VersionComparison.compare_multiple(models, metric)
        
        # Filter out None values
        valid = {v: val for v, val in values.items() if val is not None}
        
        # Sort descending
        return sorted(valid.items(), key=lambda x: x[1], reverse=True)