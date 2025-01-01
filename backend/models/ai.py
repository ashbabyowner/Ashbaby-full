from typing import List, Optional
from enum import Enum
from pydantic import BaseModel
from datetime import datetime

class InsightType(str, Enum):
    TREND = "trend"
    RECOMMENDATION = "recommendation"
    WARNING = "warning"
    ACHIEVEMENT = "achievement"
    CORRELATION = "correlation"

class AIInsight(BaseModel):
    type: InsightType
    title: str
    description: str
    recommendations: List[str]
    related_areas: List[str]
    confidence: float
    timestamp: str

class Recommendation(BaseModel):
    area: str
    title: str
    description: str
    action_items: List[str]
    priority: int
    impact_score: float
    effort_score: float
    timeframe: str
    prerequisites: Optional[List[str]] = None

class AnalysisRequest(BaseModel):
    data_points: List[float]
    areas: List[str]
    timeframe: Optional[str] = None
    context: Optional[dict] = None

class AnalysisResponse(BaseModel):
    insights: List[AIInsight]
    patterns: List[dict]
    anomalies: List[dict]

class AIMessage(BaseModel):
    role: str
    content: str
    timestamp: datetime

class AIConversation(BaseModel):
    user_id: str
    messages: List[AIMessage]
    context: dict
    created_at: datetime
    updated_at: datetime

class AIPreferences(BaseModel):
    user_id: str
    preferred_areas: List[str]
    insight_frequency: str
    notification_preferences: dict
    privacy_settings: dict
    created_at: datetime
    updated_at: datetime

class AIFeedback(BaseModel):
    user_id: str
    insight_id: str
    rating: int
    comment: Optional[str] = None
    created_at: datetime

class AIModel(BaseModel):
    name: str
    version: str
    description: str
    capabilities: List[str]
    parameters: dict
    performance_metrics: dict
    last_updated: datetime

class AIServiceConfig(BaseModel):
    openai_model: str = "gpt-4"
    max_tokens: int = 2000
    temperature: float = 0.7
    insight_generation_interval: int = 24  # hours
    confidence_threshold: float = 0.7
    max_recommendations_per_insight: int = 5
    analysis_batch_size: int = 100
    cache_duration: int = 3600  # seconds

class CrossComponentCorrelation(BaseModel):
    source_component: str
    target_component: str
    correlation_type: str
    correlation_strength: float
    impact_description: str
    recommendations: List[str]
    confidence: float
    timestamp: datetime

class AIPersonalization(BaseModel):
    user_id: str
    learning_style: str
    communication_preferences: dict
    goal_orientation: str
    risk_tolerance: float
    adaptability_score: float
    created_at: datetime
    updated_at: datetime

class AIMetrics(BaseModel):
    insight_accuracy: float
    recommendation_adoption_rate: float
    user_satisfaction_score: float
    response_time: float
    personalization_effectiveness: float
    cross_component_correlation_accuracy: float
    timestamp: datetime
