"""Real-time data stream handling."""
import asyncio
import json
from typing import Dict, Callable, List
from datetime import datetime
from collections import deque
import numpy as np


class StreamEvent:
    """Represents a streaming event."""
    
    def __init__(self, 
                 event_type: str,
                 user_id: int,
                 item_id: int = None,
                 timestamp: str = None,
                 data: Dict = None):
        """
        Args:
            event_type: 'view', 'click', 'purchase'
            user_id: User identifier
            item_id: Item identifier (optional)
            timestamp: Event timestamp
            data: Additional event data
        """
        self.event_type = event_type
        self.user_id = user_id
        self.item_id = item_id
        self.timestamp = timestamp or datetime.now().isoformat()
        self.data = data or {}
    
    def to_dict(self) -> Dict:
        """Convert to dictionary."""
        return {
            "event_type": self.event_type,
            "user_id": self.user_id,
            "item_id": self.item_id,
            "timestamp": self.timestamp,
            "data": self.data
        }


class StreamProcessor:
    """Process real-time events and generate predictions."""
    
    def __init__(self,
                 cached_server,
                 batch_processor,
                 window_size: int = 100,
                 handlers: Dict[str, Callable] = None):
        """
        Args:
            cached_server: CachedModelServer instance
            batch_processor: BatchProcessor instance
            window_size: Number of events to buffer
            handlers: Event type handlers
        """
        self.cached_server = cached_server
        self.batch_processor = batch_processor
        self.window_size = window_size
        
        # Event buffer
        self.event_buffer: deque = deque(maxlen=window_size)
        self.buffer_lock = asyncio.Lock()
        
        # Event handlers
        self.handlers = handlers or {}
        
        # Statistics
        self.stats = {
            "events_processed": 0,
            "predictions_made": 0,
            "errors": 0
        }
    
    async def handle_event(self, event: StreamEvent) -> Dict:
        """
        Process a single event.
        
        Args:
            event: StreamEvent to process
        
        Returns:
            Prediction result
        """
        try:
            async with self.buffer_lock:
                self.event_buffer.append(event)
            
            self.stats["events_processed"] += 1
            
            # Call event-specific handler
            if event.event_type in self.handlers:
                result = await self.handlers[event.event_type](event)
                self.stats["predictions_made"] += 1
                return result
            else:
                return {"status": "no_handler", "event_type": event.event_type}
        
        except Exception as e:
            self.stats["errors"] += 1
            print(f"❌ Error processing event: {e}")
            return {"status": "error", "error": str(e)}
    
    async def handle_view_event(self, event: StreamEvent) -> Dict:
        """Handle item view event."""
        try:
            # Get recommendations for user
            result = self.cached_server.get_recommendations(
                user_id=event.user_id,
                k=5
            )
            
            return {
                "event_type": "view",
                "user_id": event.user_id,
                "item_viewed": event.item_id,
                "recommendations": result["recommendations"],
                "timestamp": event.timestamp
            }
        except Exception as e:
            return {"status": "error", "error": str(e)}
    
    async def handle_click_event(self, event: StreamEvent) -> Dict:
        """Handle item click event."""
        try:
            result = self.cached_server.get_recommendations(
                user_id=event.user_id,
                k=10
            )
            
            return {
                "event_type": "click",
                "user_id": event.user_id,
                "item_clicked": event.item_id,
                "recommendations": result["recommendations"],
                "click_position": event.data.get("position"),
                "timestamp": event.timestamp
            }
        except Exception as e:
            return {"status": "error", "error": str(e)}
    
    async def handle_purchase_event(self, event: StreamEvent) -> Dict:
        """Handle purchase event."""
        try:
            # Get next recommendations after purchase
            result = self.cached_server.get_recommendations(
                user_id=event.user_id,
                k=10
            )
            
            return {
                "event_type": "purchase",
                "user_id": event.user_id,
                "item_purchased": event.item_id,
                "purchase_value": event.data.get("value"),
                "next_recommendations": result["recommendations"],
                "timestamp": event.timestamp
            }
        except Exception as e:
            return {"status": "error", "error": str(e)}
    
    def register_handler(self, event_type: str, handler: Callable) -> None:
        """Register event handler."""
        self.handlers[event_type] = handler
    
    def get_buffer(self) -> List[Dict]:
        """Get current event buffer."""
        return [event.to_dict() for event in self.event_buffer]
    
    def get_stats(self) -> Dict:
        """Get processor statistics."""
        return {
            "events_processed": self.stats["events_processed"],
            "predictions_made": self.stats["predictions_made"],
            "errors": self.stats["errors"],
            "buffer_size": len(self.event_buffer),
            "buffer_capacity": self.window_size
        }
    
    def clear_buffer(self) -> None:
        """Clear event buffer."""
        self.event_buffer.clear()