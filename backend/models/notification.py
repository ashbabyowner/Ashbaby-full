from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum as PyEnum
from typing import Optional, Dict, Any
from ..database import Base

class NotificationType(str, PyEnum):
    TRANSACTION = "transaction"
    RECURRING_TRANSACTION = "recurring_transaction"
    BUDGET_ALERT = "budget_alert"
    SAVINGS_GOAL = "savings_goal"
    FINANCIAL_HEALTH = "financial_health"

class NotificationPriority(str, PyEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class NotificationStatus(str, PyEnum):
    UNREAD = "unread"
    READ = "read"
    ARCHIVED = "archived"

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(Enum(NotificationType))
    priority = Column(Enum(NotificationPriority))
    status = Column(Enum(NotificationStatus), default=NotificationStatus.UNREAD)
    title = Column(String)
    message = Column(String)
    data = Column(JSON, nullable=True)  # Additional context data
    created_at = Column(DateTime, default=datetime.utcnow)
    read_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="notifications")

class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    notification_type = Column(Enum(NotificationType))
    email_enabled = Column(Boolean, default=True)
    push_enabled = Column(Boolean, default=True)
    websocket_enabled = Column(Boolean, default=True)
    minimum_priority = Column(Enum(NotificationPriority), default=NotificationPriority.LOW)

    # Relationships
    user = relationship("User", back_populates="notification_preferences")
