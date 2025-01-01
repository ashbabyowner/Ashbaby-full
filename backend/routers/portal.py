from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.portal import Portal, PortalType, PortalStatus
from ..services.portal_integration import PortalIntegrationService
from ..core.auth import get_current_user
from ..schemas.portal import (
    PortalCreate,
    PortalResponse,
    PortalUpdate,
    PortalCredentials,
    PortalSyncResponse
)

router = APIRouter(prefix="/portals", tags=["portals"])

@router.post("/link-token/{portal_type}", response_model=dict)
async def create_link_token(
    portal_type: PortalType,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a link token for connecting a new portal."""
    service = PortalIntegrationService(db)
    link_token = await service.create_link_token(current_user.id, portal_type)
    return {"link_token": link_token}

@router.post("", response_model=PortalResponse)
async def connect_portal(
    portal: PortalCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Connect a new portal using provided credentials."""
    service = PortalIntegrationService(db)
    new_portal = await service.connect_portal(
        current_user.id,
        portal.portal_type,
        portal.provider_name,
        portal.credentials.dict()
    )
    return new_portal

@router.get("", response_model=List[PortalResponse])
async def get_portals(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all connected portals for the current user."""
    portals = db.query(Portal).filter(Portal.user_id == current_user.id).all()
    return portals

@router.get("/{portal_id}", response_model=PortalResponse)
async def get_portal(
    portal_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get details of a specific portal."""
    portal = db.query(Portal).filter(
        Portal.id == portal_id,
        Portal.user_id == current_user.id
    ).first()
    if not portal:
        raise HTTPException(status_code=404, detail="Portal not found")
    return portal

@router.post("/{portal_id}/sync", response_model=PortalSyncResponse)
async def sync_portal(
    portal_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Manually trigger a sync for a portal."""
    portal = db.query(Portal).filter(
        Portal.id == portal_id,
        Portal.user_id == current_user.id
    ).first()
    if not portal:
        raise HTTPException(status_code=404, detail="Portal not found")

    service = PortalIntegrationService(db)
    sync_result = await service.sync_portal(portal_id)
    return sync_result

@router.delete("/{portal_id}")
async def disconnect_portal(
    portal_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Disconnect a portal and remove credentials."""
    portal = db.query(Portal).filter(
        Portal.id == portal_id,
        Portal.user_id == current_user.id
    ).first()
    if not portal:
        raise HTTPException(status_code=404, detail="Portal not found")

    service = PortalIntegrationService(db)
    await service.disconnect_portal(portal_id)
    return {"message": "Portal disconnected successfully"}
