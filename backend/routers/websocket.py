from fastapi import APIRouter, WebSocket, Depends, HTTPException
from typing import Optional
from ..auth import get_current_user
from ..websocket_manager import manager
from ..database import get_db
from sqlalchemy.orm import Session

router = APIRouter()

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    user_id: str,
    db: Session = Depends(get_db)
):
    # Verify user_id matches the token
    try:
        user = await get_current_user(websocket.headers.get("authorization"), db)
        if str(user.id) != user_id:
            await websocket.close(code=4003)
            return
    except:
        await websocket.close(code=4001)
        return

    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_json()
            # Handle different types of messages
            if data.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
            else:
                # Process other message types
                await manager.send_personal_message(
                    {
                        "type": "echo",
                        "data": data
                    },
                    user_id
                )
    except:
        manager.disconnect(websocket, user_id)
