from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
from ..models.portal import PortalType, PortalStatus

class PortalCredentials(BaseModel):
    """Schema for portal credentials."""
    public_token: Optional[str] = None
    api_key: Optional[str] = None
    api_secret: Optional[str] = None
    institution_id: Optional[str] = None
    oauth_token: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    additional_fields: Optional[Dict[str, Any]] = None

class PortalCreate(BaseModel):
    """Schema for creating a new portal connection."""
    portal_type: PortalType
    provider_name: str
    account_name: Optional[str] = None
    sync_frequency: Optional[int] = 60  # minutes
    credentials: PortalCredentials

class PortalUpdate(BaseModel):
    """Schema for updating portal settings."""
    account_name: Optional[str] = None
    sync_frequency: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None

class PortalResponse(BaseModel):
    """Schema for portal response."""
    id: int
    portal_type: PortalType
    provider_name: str
    account_name: Optional[str]
    status: PortalStatus
    last_sync: Optional[datetime]
    sync_frequency: int
    metadata: Optional[Dict[str, Any]]
    error_message: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class BalanceResponse(BaseModel):
    """Schema for balance response."""
    id: int
    portal_id: int
    balance_type: str
    amount: int
    currency: str
    timestamp: datetime
    metadata: Optional[Dict[str, Any]]

    class Config:
        from_attributes = True

class PortalSyncResponse(BaseModel):
    """Schema for portal sync response."""
    id: int
    portal_id: int
    sync_type: str
    start_time: datetime
    end_time: Optional[datetime]
    status: str
    records_processed: int
    error_message: Optional[str]

    class Config:
        from_attributes = True
