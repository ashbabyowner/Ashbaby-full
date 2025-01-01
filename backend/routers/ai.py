from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.ai_service import AIService
from ..core.auth import get_current_user
from ..schemas.ai import (
    ChatMessage,
    ChatResponse,
    CreativeRequest,
    CreativeResponse,
    DailyPlanResponse,
    InsightResponse
)

router = APIRouter(prefix="/ai", tags=["ai"])

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    message: ChatMessage,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get personalized AI response to user message."""
    service = AIService(db)
    response = await service.get_personalized_response(
        current_user.id,
        message.content,
        message.context
    )
    return response

@router.post("/creative", response_model=CreativeResponse)
async def generate_creative_content(
    request: CreativeRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate creative content based on user prompt."""
    service = AIService(db)
    response = await service.generate_creative_content(
        current_user.id,
        request.content_type,
        request.prompt
    )
    return response

@router.get("/daily-plan", response_model=DailyPlanResponse)
async def get_daily_plan(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get personalized daily plan."""
    service = AIService(db)
    plan = await service.get_daily_plan(current_user.id)
    return plan

@router.get("/insights", response_model=List[InsightResponse])
async def get_insights(
    message: Optional[str] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI-generated insights based on user interaction."""
    service = AIService(db)
    if message:
        response = await service.get_personalized_response(current_user.id, message)
        return response.get("insights", [])
    return []

@router.post("/analyze-mood")
async def analyze_mood(
    message: ChatMessage,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Analyze user's mood based on message content."""
    service = AIService(db)
    response = await service.get_personalized_response(
        current_user.id,
        message.content,
        {"analysis_type": "mood"}
    )
    return response

@router.post("/suggest-activities")
async def suggest_activities(
    message: ChatMessage,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get personalized activity suggestions."""
    service = AIService(db)
    response = await service.get_personalized_response(
        current_user.id,
        message.content,
        {"analysis_type": "activities"}
    )
    return response.get("suggestions", [])
