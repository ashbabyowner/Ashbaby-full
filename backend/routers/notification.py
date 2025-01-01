from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..auth import get_current_user
from ..services.notification import NotificationService
from ..schemas.notification import (
    Notification, NotificationCreate, NotificationUpdate,
    NotificationPreference, NotificationPreferenceCreate, NotificationPreferenceUpdate,
    NotificationStatus
)

router = APIRouter()

@router.get("/notifications", response_model=List[Notification])
async def get_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[NotificationStatus] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get user's notifications with optional filtering."""
    notification_service = NotificationService(db)
    return notification_service.get_user_notifications(
        current_user.id,
        skip=skip,
        limit=limit,
        status=status
    )

@router.get("/notifications/{notification_id}", response_model=Notification)
async def get_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get a specific notification."""
    notification_service = NotificationService(db)
    notification = notification_service.get_notification(notification_id, current_user.id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification

@router.put("/notifications/{notification_id}", response_model=Notification)
async def update_notification(
    notification_id: int,
    updates: NotificationUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update a notification's status."""
    notification_service = NotificationService(db)
    return notification_service.update_notification(notification_id, current_user.id, updates)

@router.delete("/notifications/{notification_id}")
async def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Delete a notification."""
    notification_service = NotificationService(db)
    notification_service.delete_notification(notification_id, current_user.id)
    return {"status": "success"}

@router.post("/notifications/mark-all-read")
async def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Mark all notifications as read."""
    notification_service = NotificationService(db)
    notification_service.mark_all_read(current_user.id)
    return {"status": "success"}

@router.get("/notifications/preferences", response_model=List[NotificationPreference])
async def get_notification_preferences(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get user's notification preferences."""
    notification_service = NotificationService(db)
    return notification_service.get_user_preferences(current_user.id)

@router.post("/notifications/preferences", response_model=NotificationPreference)
async def set_notification_preference(
    preference: NotificationPreferenceCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Set a notification preference."""
    notification_service = NotificationService(db)
    return notification_service.set_user_preference(current_user.id, preference)

@router.put("/notifications/preferences/{preference_id}", response_model=NotificationPreference)
async def update_notification_preference(
    preference_id: int,
    updates: NotificationPreferenceUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update a notification preference."""
    notification_service = NotificationService(db)
    return notification_service.update_preference(preference_id, current_user.id, updates)

@router.delete("/notifications/preferences/{preference_id}")
async def delete_notification_preference(
    preference_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Delete a notification preference."""
    notification_service = NotificationService(db)
    notification_service.delete_preference(preference_id, current_user.id)
    return {"status": "success"}
