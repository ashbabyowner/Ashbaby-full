from typing import Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime

class DeviceRegistration(BaseModel):
    """Schema for registering a device."""
    device_token: str
    device_info: Dict[str, Any]

class DeviceResponse(BaseModel):
    """Schema for device response."""
    id: int
    device_token: str
    device_info: Dict[str, Any]
    is_active: bool
    last_active: datetime
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PushNotificationTest(BaseModel):
    """Schema for testing push notifications."""
    message: str
