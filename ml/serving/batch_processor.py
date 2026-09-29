"""Optimized batch processing for recommendations."""
import asyncio
import numpy as np
import tensorflow as tf
from typing import List, Dict, Tuple
from datetime import datetime
from collections import deque
import hashlib
import time


class BatchProcessor:
    """Batch request processor with caching and queuing."""
    
    def __init__(self, 
                 model_server,
                 batch_size: int = 32,
                 max_wait_ms: int = 100,
                 cache_enabled: bool = True):
        """
        Args:
            model_server: ModelServer instance
            batch_size: Max requests per batch
            max_wait_ms: Max wait time before processing
            cache_enabled: Enable response caching
        """
        self.model_server = model_server
        self.batch_size = batch_size
        self.max_wait_ms = max_wait_ms / 1000.0  # Convert to seconds
        self.cache_enabled = cache_enabled
        
        # Request queue
        self.queue: deque = deque()
        self.queue_lock = asyncio.Lock()
        
        # Cache: hash(request) -> response
        self.cache: Dict[str, Dict] = {}
        self.cache_stats = {
            "hits": 0,
            "misses": 0,
            "total": 0
        }
        
        # Latency tracking
        self.latencies: List[float] = []
        self.max_latencies = 1000
        
        # Processing state
        self.processing = False
        self.batch_task = None
    
    def _hash_request(self, request: Dict) -> str:
        """Create hash of request for caching."""
        key = f"{request['user_id']}_{','.join(map(str, request['user_features']))}" \
              f"_{','.join(map(str, request['context_features']))}"
        return hashlib.md5(key.encode()).hexdigest()
    
    async def add_request(self, request: Dict) -> None:
        """Add request to queue."""
        async with self.queue_lock:
            self.queue.append(request)
            
            # Start processing if queue is full or first request
            if len(self.queue) >= self.batch_size and not self.processing:
                asyncio.create_task(self.process_batch())
    
    async def process_batch(self) -> List[Dict]:
        """
        Process queued requests as batch.
        
        Returns:
            List of responses
        """
        if self.processing:
            return []
        
        self.processing = True
        start_time = time.time()
        
        try:
            # Wait for more requests or timeout
            await asyncio.sleep(min(self.max_wait_ms, 0.1))
            
            # Get all queued requests
            async with self.queue_lock:
                requests = list(self.queue)
                self.queue.clear()
            
            if not requests:
                return []
            
            # Check cache
            cached_responses = []
            uncached_requests = []
            
            for req in requests:
                req_hash = self._hash_request(req)
                
                if self.cache_enabled and req_hash in self.cache:
                    cached_responses.append(self.cache[req_hash])
                    self.cache_stats["hits"] += 1
                else:
                    uncached_requests.append((req, req_hash))
                    self.cache_stats["misses"] += 1
                
                self.cache_stats["total"] += 1
            
            # Process uncached requests in batch
            new_responses = []
            if uncached_requests:
                new_responses = self._process_uncached_batch(uncached_requests)
                
                # Add to cache
                for response, (req, req_hash) in zip(new_responses, uncached_requests):
                    if self.cache_enabled:
                        self.cache[req_hash] = response
            
            # Combine results
            all_responses = cached_responses + new_responses
            
            # Track latency
            latency = (time.time() - start_time) * 1000  # ms
            self.latencies.append(latency)
            if len(self.latencies) > self.max_latencies:
                self.latencies.pop(0)
            
            return all_responses
        
        finally:
            self.processing = False
    
    def _process_uncached_batch(self, requests: List[Tuple]) -> List[Dict]:
        """Process uncached requests together."""
        results = []
        
        for req, _ in requests:
            result = self.model_server.get_recommendations(
                user_id=req["user_id"],
                user_features=np.array(req["user_features"]),
                context_features=np.array(req["context_features"]),
                k=req.get("k", 10)
            )
            results.append(result)
        
        return results
    
    def get_cache_stats(self) -> Dict:
        """Get cache statistics."""
        total = self.cache_stats["total"]
        hits = self.cache_stats["hits"]
        miss_rate = (self.cache_stats["misses"] / total * 100) if total > 0 else 0.0
        hit_rate = (hits / total * 100) if total > 0 else 0.0
        
        return {
            "hits": hits,
            "misses": self.cache_stats["misses"],
            "total": total,
            "hit_rate": hit_rate,
            "miss_rate": miss_rate,
            "cache_size": len(self.cache)
        }
    
    def get_latency_stats(self) -> Dict:
        """Get latency percentiles."""
        if not self.latencies:
            return {"p50": 0, "p95": 0, "p99": 0, "mean": 0}
        
        sorted_latencies = sorted(self.latencies)
        n = len(sorted_latencies)
        
        return {
            "min": float(sorted_latencies[0]),
            "p50": float(sorted_latencies[int(n * 0.5)]),
            "p95": float(sorted_latencies[int(n * 0.95)]),
            "p99": float(sorted_latencies[int(n * 0.99)]),
            "max": float(sorted_latencies[-1]),
            "mean": float(np.mean(self.latencies))
        }
    
    def clear_cache(self) -> None:
        """Clear response cache."""
        self.cache.clear()
        self.cache_stats = {"hits": 0, "misses": 0, "total": 0}
    
    def clear_latencies(self) -> None:
        """Clear latency tracking."""
        self.latencies.clear()