"""
WebSocket Server for Real-Time Updates

Handles live connections and broadcasts district updates
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import List, Dict, Set
import asyncio
import json
from datetime import datetime

app = FastAPI()

# Connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        # Track subscriptions: {district: set(websockets)}
        self.district_subscriptions: Dict[str, Set[WebSocket]] = {}
        # Track all subscriptions
        self.alert_subscriptions: Set[WebSocket] = set()
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"Client connected. Total: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        
        # Remove from district subscriptions
        for district,subscribers in self.district_subscriptions.items():
            if websocket in subscribers:
                subscribers.remove(websocket)
        
        # Remove from alert subscriptions
        if websocket in self.alert_subscriptions:
            self.alert_subscriptions.remove(websocket)
        
        print(f"Client disconnected. Total: {len(self.active_connections)}")
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)
    
    async def broadcast(self, message: str):
        """Broadcast to all connected clients"""
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                pass
    
    async def broadcast_to_district(self, district: str, message: Dict):
        """Broadcast to clients subscribed to a specific district"""
        if district not in self.district_subscriptions:
            return
        
        message_str = json.dumps(message)
        for websocket in self.district_subscriptions[district]:
            try:
                await websocket.send_text(message_str)
            except:
                pass
    
    async def broadcast_alert(self, alert: Dict):
        """Broadcast alert to all subscribers"""
        message = json.dumps({
            'type': 'risk:alert',
            'data': alert
        })
        
        for websocket in self.alert_subscriptions:
            try:
                await websocket.send_text(message)
            except:
                pass
    
    def subscribe_district(self, district: str, websocket: WebSocket):
        """Subscribe to district updates"""
        if district not in self.district_subscriptions:
            self.district_subscriptions[district] = set()
        self.district_subscriptions[district].add(websocket)
    
    def subscribe_alerts(self, websocket: WebSocket):
        """Subscribe to risk alerts"""
        self.alert_subscriptions.add(websocket)


manager = ConnectionManager()


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Main WebSocket endpoint"""
    await manager.connect(websocket)
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            
            try:
                message = json.loads(data)
                message_type = message.get('type')
                
                # Handle subscription requests
                if message_type == 'subscribe:district':
                    district = message.get('district')
                    if district:
                        manager.subscribe_district(district, websocket)
                        await websocket.send_text(json.dumps({
                            'type': 'subscribed',
                            'district': district
                        }))
                
                elif message_type == 'subscribe:alerts':
                    manager.subscribe_alerts(websocket)
                    await websocket.send_text(json.dumps({
                        'type': 'subscribed',
                        'channel': 'alerts'
                    }))
                
                # Echo other messages (for testing)
                else:
                    await websocket.send_text(f"Echo: {data}")
                    
            except json.JSONDecodeError:
                await websocket.send_text("Invalid JSON")
    
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# API endpoint to trigger broadcasts (for internal use)
@app.post("/api/ws/broadcast/district/{district}")
async def broadcast_district_update(district: str, update: Dict):
    """Endpoint for backend to broadcast district updates"""
    await manager.broadcast_to_district(district, {
        'type': f'district:{district}',
        'data': update,
        'timestamp': datetime.utcnow().isoformat()
    })
    
    return {"status": "broadcasted", "subscribers": len(manager.district_subscriptions.get(district, []))}


@app.post("/api/ws/broadcast/alert")
async def broadcast_risk_alert(alert: Dict):
    """Endpoint for backend to broadcast risk alerts"""
    await manager.broadcast_alert({
        **alert,
        'timestamp': datetime.utcnow().isoformat()
    })
    
    return {"status": "broadcasted", "subscribers": len(manager.alert_subscriptions)}


# Background task to send periodic updates (example)
async def periodic_updates():
    """Send heartbeat every 30 seconds"""
    while True:
        await asyncio.sleep(30)
        await manager.broadcast(json.dumps({
            'type': 'heartbeat',
            'timestamp': datetime.utcnow().isoformat()
        }))


@app.on_event("startup")
async def startup_event():
    """Start background tasks"""
    asyncio.create_task(periodic_updates())


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
