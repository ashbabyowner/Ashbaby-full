from typing import Dict, List
from fastapi import WebSocket
import json
from datetime import datetime

class ConnectionManager:
    def __init__(self):
        # Store active connections by user_id
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            message["timestamp"] = datetime.utcnow().isoformat()
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except:
                    # Handle disconnected clients
                    await self.disconnect(connection, user_id)

    async def broadcast(self, message: dict):
        message["timestamp"] = datetime.utcnow().isoformat()
        for connections in self.active_connections.values():
            for connection in connections:
                try:
                    await connection.send_json(message)
                except:
                    continue

manager = ConnectionManager()
