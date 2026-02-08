"""
Webhook System

Send notifications to external systems when events occur.
"""

import os
import hmac
import hashlib
from typing import List, Dict, Optional, Callable
from datetime import datetime
from enum import Enum
import asyncio


class WebhookEvent(str, Enum):
    """Webhook event types"""
    CRITICAL_RISK = "critical_risk"
    HIGH_RISK = "high_risk"
    NEW_SIGNAL = "new_signal"
    THRESHOLD_CROSSED = "threshold_crossed"
    RISK_INCREASED = "risk_increased"
    RISK_DECREASED = "risk_decreased"


class WebhookService:
    """Webhook delivery service"""
    
    def __init__(self, db_connection):
        self.db = db_connection
        self._ensure_tables()
    
    def _ensure_tables(self):
        """Create webhook tables"""
        self.db.execute("""
            CREATE TABLE IF NOT EXISTS webhooks (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                url TEXT NOT NULL,
                events JSONB NOT NULL,  -- Array of event types
                secret VARCHAR(255),
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT NOW()
            );
            
            CREATE TABLE IF NOT EXISTS webhook_deliveries (
                id SERIAL PRIMARY KEY,
                webhook_id INTEGER REFERENCES webhooks(id),
                event VARCHAR(100) NOT NULL,
                payload JSONB NOT NULL,
                status_code INTEGER,
                success BOOLEAN,
                error_message TEXT,
                delivered_at TIMESTAMP DEFAULT NOW()
            );
            
            CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook_time 
                ON webhook_deliveries(webhook_id, delivered_at DESC);
        """)
    
    async def trigger_event(
        self,
        event: WebhookEvent,
        payload: Dict
    ) -> int:
        """Trigger webhook event"""
        # Get all webhooks subscribed to this event
        webhooks = self.db.query("""
            SELECT id, url, secret
            FROM webhooks
            WHERE   is_active = true 
                AND events @> %s::jsonb
        """, ([event.value],))
        
        if not webhooks:
            return 0
        
        # Deliver to all webhooks
        tasks = []
        for webhook in webhooks:
            task = self._deliver_webhook(
                webhook_id=webhook['id'],
                url=webhook['url'],
                secret=webhook['secret'],
                event=event,
                payload=payload
            )
            tasks.append(task)
        
        # Execute all deliveries concurrently
        await asyncio.gather(*tasks)
        
        return len(webhooks)
    
    async def _deliver_webhook(
        self,
        webhook_id: int,
        url: str,
        secret: Optional[str],
        event: WebhookEvent,
        payload: Dict
    ):
        """Deliver webhook to endpoint"""
        try:
            import aiohttp
            
            # Build payload
            full_payload = {
                'event': event.value,
                'timestamp': datetime.utcnow().isoformat(),
                'data': payload
            }
            
            # Generate signature
            headers = {'Content-Type': 'application/json'}
            if secret:
                signature = self._generate_signature(full_payload, secret)
                headers['X-Webhook-Signature'] = signature
            
            # Send request
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    url,
                    json=full_payload,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    status_code = response.status
                    success = 200 <= status_code < 300
                    error_message = None if success else await response.text()
            
            # Log delivery
            self._log_delivery(
                webhook_id=webhook_id,
                event=event,
                payload=full_payload,
                status_code=status_code,
                success=success,
                error_message=error_message
            )
            
        except Exception as e:
            # Log failed delivery
            self._log_delivery(
                webhook_id=webhook_id,
                event=event,
                payload=full_payload,
                status_code=None,
                success=False,
                error_message=str(e)
            )
    
    def _generate_signature(self, payload: Dict, secret: str) -> str:
        """Generate HMAC signature for payload"""
        import json
        
        payload_bytes = json.dumps(payload, sort_keys=True).encode('utf-8')
        signature = hmac.new(
            secret.encode('utf-8'),
            payload_bytes,
            hashlib.sha256
        ).hexdigest()
        
        return f"sha256={signature}"
    
    def _log_delivery(
        self,
        webhook_id: int,
        event: WebhookEvent,
        payload: Dict,
        status_code: Optional[int],
        success: bool,
        error_message: Optional[str]
    ):
        """Log webhook delivery"""
        try:
            self.db.execute("""
                INSERT INTO webhook_deliveries 
                    (webhook_id, event, payload, status_code, success, error_message)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                webhook_id,
                event.value,
                payload,
                status_code,
                success,
                error_message
            ))
        except Exception as e:
            print(f"Failed to log webhook delivery: {e}")
    
    def register_webhook(
        self,
        name: str,
        url: str,
        events: List[WebhookEvent],
        secret: Optional[str] = None
    ) -> int:
        """Register new webhook"""
        result = self.db.query_one("""
            INSERT INTO webhooks (name, url, events, secret)
            VALUES (%s, %s, %s, %s)
            RETURNING id
        """, (name, url, [e.value for e in events], secret))
        
        return result['id']
    
    def get_webhook_stats(self, webhook_id: int) -> Dict:
        """Get webhook delivery statistics"""
        stats = self.db.query_one("""
            SELECT 
                COUNT(*) as total_deliveries,
                SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful,
                SUM(CASE WHEN NOT success THEN 1 ELSE 0 END) as failed,
                MAX(delivered_at) as last_delivery
            FROM webhook_deliveries
            WHERE webhook_id = %s
        """, (webhook_id,))
        
        return stats


class SlackIntegration:
    """Slack-specific webhook integration"""
    
    def __init__(self, webhook_url: str):
        self.webhook_url = webhook_url
    
    async def send_alert(
        self,
        district: str,
        risk_score: float,
        risk_level: str,
        message: str
    ):
        """Send alert to Slack channel"""
        import aiohttp
        
        # Build Slack message
        color = self._get_color(risk_level)
        payload = {
            "attachments": [{
                "color": color,
                "title": f"🚨 Risk Alert: {district}",
                "fields": [
                    {
                        "title": "Risk Score",
                        "value": f"{risk_score}/100",
                        "short": True
                    },
                    {
                        "title": "Risk Level",
                        "value": risk_level.upper(),
                        "short": True
                    },
                    {
                        "title": "Message",
                        "value": message,
                        "short": False
                    }
                ],
                "footer": "NE-NETRA Alert System",
                "ts": int(datetime.utcnow().timestamp())
            }]
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(self.webhook_url, json=payload) as response:
                    return response.status == 200
        except Exception as e:
            print(f"Slack alert failed: {e}")
            return False
    
    def _get_color(self, risk_level: str) -> str:
        """Get color for risk level"""
        colors = {
            'critical': '#dc2626',  # Red
            'high': '#f59e0b',  # Orange
            'medium': '#eab308',  # Yellow
            'low': '#22c55e'  # Green
        }
        return colors.get(risk_level, '#6b7280')
