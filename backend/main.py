from fastapi import FastAPI, WebSocket, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import models
import schemas
from database import SessionLocal, engine
from routers import users, chat, goals, wellness, community, finance, websocket, notification
import os
from dotenv import load_dotenv
from .services.scheduler import SchedulerService
from services.system_orchestrator import SystemOrchestrator
from services.omniscient_ai import OmniscientAI
from services.ultimate_ai import UltimateAI
from services.enhanced_education_therapy_ai import EnhancedEducationTherapyAI
from services.life_guide_ai import LifeGuideAI
from services.creative_ai import CreativeAIService
from datetime import datetime

load_dotenv()

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Ultimate AI System",
    description="Comprehensive AI System with Advanced Capabilities",
    version="1.0.0"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting middleware for free tier
@app.middleware("http")
async def add_rate_limit_headers(request: Request, call_next):
    # Basic rate limiting for free tier
    response = await call_next(request)
    response.headers["X-RateLimit-Limit"] = "100"
    response.headers["X-RateLimit-Remaining"] = "99"  # Implement proper counting if needed
    return response

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Initialize system orchestrator
system = SystemOrchestrator()

# Include routers
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(goals.router, prefix="/api/goals", tags=["goals"])
app.include_router(wellness.router, prefix="/api/wellness", tags=["wellness"])
app.include_router(community.router, prefix="/api/community", tags=["community"])
app.include_router(finance.router, prefix="/api/finance", tags=["finance"])
app.include_router(notification.router, prefix="/api/notifications", tags=["notifications"])
app.include_router(websocket.router, tags=["websocket"])

@app.on_event("startup")
async def startup_event():
    """Initialize all systems on startup."""
    try:
        await system.initialize_ai_systems()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to initialize AI systems: {str(e)}"
        )

@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Ultimate AI System API",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for Render."""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/process")
async def process_request(
    request_type: str,
    context: dict,
    preferences: Optional[dict] = None
):
    """Process any type of request through the AI system."""
    return await system.ai_manager.process_request(
        request_type,
        context,
        preferences
    )

@app.post("/learn")
async def learn_from_data(
    data_type: str,
    data: dict,
    parameters: Optional[dict] = None
):
    """Learn from provided data using appropriate AI services."""
    return await system.ai_manager.process_request(
        'learning',
        {
            'data_type': data_type,
            'data': data,
            'parameters': parameters or {}
        }
    )

@app.post("/generate")
async def generate_content(
    content_type: str,
    parameters: dict,
    constraints: Optional[dict] = None
):
    """Generate content using appropriate AI services."""
    return await system.ai_manager.process_request(
        'generation',
        {
            'content_type': content_type,
            'parameters': parameters,
            'constraints': constraints or {}
        }
    )

@app.post("/analyze")
async def analyze_data(
    data_type: str,
    data: dict,
    analysis_parameters: Optional[dict] = None
):
    """Analyze data using appropriate AI services."""
    return await system.ai_manager.process_request(
        'analysis',
        {
            'data_type': data_type,
            'data': data,
            'parameters': analysis_parameters or {}
        }
    )

# WebSocket connection for real-time chat
@app.websocket("/ws/chat/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            # Process the message and generate AI response
            response = f"AI response to: {data}"
            await websocket.send_text(response)
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await websocket.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
