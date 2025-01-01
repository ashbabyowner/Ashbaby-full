from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.push_notification import PushNotificationService
from ..core.auth import get_current_user
from ..schemas.push_notification import (
    DeviceRegistration,
    DeviceResponse,
    PushNotificationTest
)
from ..models.user_device import UserDevice

router = APIRouter(prefix="/push-notifications", tags=["push-notifications"])

@router.post("/register-device", response_model=DeviceResponse)
async def register_device(
    device: DeviceRegistration,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Register a device for push notifications."""
    service = PushNotificationService(db)
    registered_device = await service.register_device(
        current_user.id,
        device.device_token,
        device.device_info
    )
    return registered_device

@router.post("/unregister-device")
async def unregister_device(
    device_token: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Unregister a device from push notifications."""
    service = PushNotificationService(db)
    await service.unregister_device(current_user.id, device_token)
    return {"message": "Device unregistered successfully"}

@router.get("/devices", response_model=List[DeviceResponse])
async def get_devices(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all registered devices for the current user."""
    devices = db.query(UserDevice).filter(
        UserDevice.user_id == current_user.id,
        UserDevice.is_active == True
    ).all()
    return devices

@router.post("/test")
async def test_notification(
    test: PushNotificationTest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a test push notification."""
    service = PushNotificationService(db)
    response = await service.send_push_notification(
        current_user.id,
        "Test Notification",
        test.message,
        {"type": "test"}
    )
    return {"message": "Test notification sent successfully", "response": response}
