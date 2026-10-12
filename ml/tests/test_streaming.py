"""Tests for real-time streaming."""
import pytest
import asyncio
from ml.serving.stream_handler import StreamEvent, StreamProcessor
from ml.models.integrated_two_tower import IntegratedTwoTowerModel
from ml.serving.cached_model_server import CachedModelServer
from ml.serving.batch_processor import BatchProcessor
from ml.serving.redis_feature_store import RedisFeatureStore
import numpy as np
from unittest.mock import MagicMock, AsyncMock


class TestStreamEvent:
    """Test stream event."""
    
    def test_create_event(self):
        """Test event creation."""
        event = StreamEvent(
            event_type="view",
            user_id=123,
            item_id=456
        )
        
        assert event.event_type == "view"
        assert event.user_id == 123
        assert event.item_id == 456
        assert event.timestamp is not None
    
    def test_event_to_dict(self):
        """Test event serialization."""
        event = StreamEvent(
            event_type="click",
            user_id=123,
            item_id=456,
            data={"position": 1}
        )
        
        event_dict = event.to_dict()
        
        assert event_dict["event_type"] == "click"
        assert event_dict["user_id"] == 123
        assert event_dict["data"]["position"] == 1


class TestStreamProcessor:
    """Test stream processor."""
    
    @pytest.fixture
    def processor(self):
        """Setup processor."""
        mock_server = MagicMock()
        mock_batch = MagicMock()
        
        processor = StreamProcessor(
            cached_server=mock_server,
            batch_processor=mock_batch,
            window_size=10
        )
        
        return processor
    
    @pytest.mark.asyncio
    async def test_handle_event(self, processor):
        """Test event handling."""
        event = StreamEvent(
            event_type="view",
            user_id=123,
            item_id=456
        )
        
        # Should not crash
        result = await processor.handle_event(event)
        assert isinstance(result, dict)
    
    @pytest.mark.asyncio
    async def test_event_buffer(self, processor):
        """Test event buffer."""
        event1 = StreamEvent("view", 1, 100)
        event2 = StreamEvent("click", 2, 101)
        
        await processor.handle_event(event1)
        await processor.handle_event(event2)
        
        buffer = processor.get_buffer()
        assert len(buffer) == 2
    
    def test_stats(self, processor):
        """Test statistics."""
        stats = processor.get_stats()
        
        assert "events_processed" in stats
        assert "predictions_made" in stats
        assert "errors" in stats
        assert "buffer_size" in stats
    
    def test_register_handler(self, processor):
        """Test handler registration."""
        async def custom_handler(event):
            return {"custom": True}
        
        processor.register_handler("custom", custom_handler)
        
        assert "custom" in processor.handlers
    
    def test_clear_buffer(self, processor):
        """Test buffer clearing."""
        processor.event_buffer.append(StreamEvent("view", 1, 100))
        assert len(processor.event_buffer) == 1
        
        processor.clear_buffer()
        assert len(processor.event_buffer) == 0