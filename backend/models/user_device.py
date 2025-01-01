from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class UserDevice(Base):
    """Model for storing user device information for push notifications."""
    __tablename__ = "user_devices"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    device_token = Column(String, unique=True, index=True)
    device_info = Column(JSON)  # Store device type, OS version, app version, etc.
    is_active = Column(Boolean, default=True)
    last_active = Column(DateTime, default=datetime.utcnow)
    error_message = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="devices")
