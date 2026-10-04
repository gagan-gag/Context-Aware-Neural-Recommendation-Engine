"""A/B testing framework for model versions."""
from typing import Dict, Optional
from dataclasses import dataclass
import random

from .model_metadata import ModelMetadata


@dataclass
class ABTestConfig:
    """Configuration for A/B test."""
    
    version_a: str
    version_b: str
    split: float  # 0.0-1.0, % of traffic to A
    description: str = ""
    start_date: Optional[str] = None
    end_date: Optional[str] = None


@dataclass
class ABTestResult:
    """Result of A/B test."""
    
    version_a: str
    version_b: str
    requests: int
    version_a_requests: int
    version_b_requests: int
    version_a_success_rate: float
    version_b_success_rate: float
    winner: Optional[str]


class ABTestingFramework:
    """A/B testing framework for model versions."""
    
    def __init__(self):
        """Initialize A/B testing framework."""
        self.active_tests: Dict[str, ABTestConfig] = {}
        self.test_results: Dict[str, ABTestResult] = {}
    
    def create_test(
        self,
        test_id: str,
        version_a: str,
        version_b: str,
        split: float = 0.5,
        description: str = ""
    ) -> ABTestConfig:
        """
        Create new A/B test.
        
        Args:
            test_id: Unique test identifier
            version_a: First model version (control)
            version_b: Second model version (variant)
            split: % of traffic to version_a (0.0-1.0)
            description: Test description
        
        Returns:
            ABTestConfig
        """
        if test_id in self.active_tests:
            raise ValueError(f"Test {test_id} already exists")
        
        if not (0 <= split <= 1):
            raise ValueError("split must be between 0 and 1")
        
        config = ABTestConfig(
            version_a=version_a,
            version_b=version_b,
            split=split,
            description=description
        )
        
        self.active_tests[test_id] = config
        print(f"✅ Created A/B test: {test_id}")
        return config
    
    def route_request(self, test_id: str) -> str:
        """
        Route request to version based on A/B test.
        
        Args:
            test_id: Test identifier
        
        Returns:
            Version to use
        """
        if test_id not in self.active_tests:
            raise ValueError(f"Test {test_id} not found")
        
        config = self.active_tests[test_id]
        
        # Random routing based on split
        if random.random() < config.split:
            return config.version_a
        else:
            return config.version_b
    
    def route_requests(self, test_id: str, count: int) -> Dict[str, int]:
        """
        Route multiple requests.
        
        Args:
            test_id: Test identifier
            count: Number of requests to route
        
        Returns:
            Dict of {version: request_count}
        """
        results = {
            self.active_tests[test_id].version_a: 0,
            self.active_tests[test_id].version_b: 0
        }
        
        for _ in range(count):
            version = self.route_request(test_id)
            results[version] += 1
        
        return results
    
    def end_test(
        self,
        test_id: str,
        version_a_success_rate: float,
        version_b_success_rate: float,
        requests: int
    ) -> ABTestResult:
        """
        End A/B test and record result.
        
        Args:
            test_id: Test identifier
            version_a_success_rate: Success rate for version A
            version_b_success_rate: Success rate for version B
            requests: Total requests in test
        
        Returns:
            ABTestResult
        """
        if test_id not in self.active_tests:
            raise ValueError(f"Test {test_id} not found")
        
        config = self.active_tests[test_id]
        
        # Determine winner
        winner = None
        if version_a_success_rate > version_b_success_rate:
            winner = config.version_a
        elif version_b_success_rate > version_a_success_rate:
            winner = config.version_b
        
        # Calculate request counts
        version_a_requests = int(requests * config.split)
        version_b_requests = requests - version_a_requests
        
        result = ABTestResult(
            version_a=config.version_a,
            version_b=config.version_b,
            requests=requests,
            version_a_requests=version_a_requests,
            version_b_requests=version_b_requests,
            version_a_success_rate=version_a_success_rate,
            version_b_success_rate=version_b_success_rate,
            winner=winner
        )
        
        self.test_results[test_id] = result
        del self.active_tests[test_id]
        
        print(f"✅ Ended A/B test: {test_id}")
        if winner:
            print(f"   Winner: {winner}")
        
        return result
    
    def get_test_result(self, test_id: str) -> Optional[ABTestResult]:
        """Get result of completed A/B test."""
        return self.test_results.get(test_id)