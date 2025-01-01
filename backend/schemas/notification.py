from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any
from ..models.notification import NotificationType, NotificationPriority, NotificationStatus

class NotificationBase(BaseModel):
    type: NotificationType
    priority: NotificationPriority
    title: str
    message: str
    data: Optional[Dict[str, Any]] = None
    expires_at: Optional[datetime] = None

class NotificationCreate(NotificationBase):
    user_id: int

class NotificationUpdate(BaseModel):
    status: NotificationStatus
    read_at: Optional[datetime] = None

class Notification(NotificationBase):
    id: int
    user_id: int
    status: NotificationStatus
    created_at: datetime
    read_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class NotificationPreferenceBase(BaseModel):
    notification_type: NotificationType
    email_enabled: bool = True
    push_enabled: bool = True
    websocket_enabled: bool = True
    minimum_priority: NotificationPriority = NotificationPriority.LOW

class NotificationPreferenceCreate(NotificationPreferenceBase):
    pass

class NotificationPreferenceUpdate(BaseModel):
    email_enabled: Optional[bool] = None
    push_enabled: Optional[bool] = None
    websocket_enabled: Optional[bool] = None
    minimum_priority: Optional[NotificationPriority] = None

class NotificationPreference(NotificationPreferenceBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True
