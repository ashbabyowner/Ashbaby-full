from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from datetime import datetime

class ChatMessage(BaseModel):
    """Schema for chat messages."""
    content: str
    context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    """Schema for chat responses."""
    response: str
    insights: List[Dict[str, Any]]
    suggestions: List[Dict[str, Any]]

class CreativeRequest(BaseModel):
    """Schema for creative content requests."""
    content_type: str  # image, video, music, text
    prompt: str
    style: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None

class CreativeResponse(BaseModel):
    """Schema for creative content responses."""
    content_type: str
    content: str
    prompt: str

class DailyPlanResponse(BaseModel):
    """Schema for daily plan responses."""
    plan: str
    context: Dict[str, Any]

class InsightResponse(BaseModel):
    """Schema for AI insights."""
    category: str
    content: str

class MoodAnalysis(BaseModel):
    """Schema for mood analysis."""
    mood: str
    confidence: float
    factors: List[str]
    suggestions: List[str]

class ActivitySuggestion(BaseModel):
    """Schema for activity suggestions."""
    category: str
    activities: List[str]
    reasoning: str

class PersonalizedAdvice(BaseModel):
    """Schema for personalized advice."""
    topic: str
    advice: str
    context_factors: List[str]
    action_items: List[str]

class ProgressInsight(BaseModel):
    """Schema for progress insights."""
    area: str
    current_status: str
    improvements: List[str]
    challenges: List[str]
    recommendations: List[str]

class GoalRecommendation(BaseModel):
    """Schema for goal recommendations."""
    goal_type: str
    description: str
    timeline: str
    milestones: List[str]
    success_metrics: List[str]

class SkillDevelopmentPlan(BaseModel):
    """Schema for skill development plans."""
    skill: str
    current_level: str
    target_level: str
    learning_path: List[str]
    resources: List[str]
    estimated_timeline: str

class WellnessReport(BaseModel):
    """Schema for wellness reports."""
    timestamp: datetime
    physical_health: Dict[str, Any]
    mental_health: Dict[str, Any]
    social_health: Dict[str, Any]
    recommendations: List[str]

class LearningPathway(BaseModel):
    """Schema for learning pathways."""
    topic: str
    difficulty_level: str
    prerequisites: List[str]
    modules: List[Dict[str, Any]]
    estimated_duration: str
    learning_objectives: List[str]

class SupportPlan(BaseModel):
    """Schema for support plans."""
    focus_area: str
    current_challenges: List[str]
    coping_strategies: List[str]
    support_resources: List[str]
    emergency_contacts: List[str]

class LifeSkillAssessment(BaseModel):
    """Schema for life skill assessments."""
    skill_category: str
    strengths: List[str]
    areas_for_improvement: List[str]
    development_plan: List[str]
    progress_metrics: Dict[str, Any]

class PersonalityInsight(BaseModel):
    """Schema for personality insights."""
    traits: Dict[str, float]
    strengths: List[str]
    growth_areas: List[str]
    compatibility_factors: List[str]
    career_suggestions: List[str]

class RelationshipAdvice(BaseModel):
    """Schema for relationship advice."""
    relationship_type: str
    current_dynamics: str
    challenges: List[str]
    improvement_strategies: List[str]
    communication_tips: List[str]

class FinancialGuidance(BaseModel):
    """Schema for financial guidance."""
    income_analysis: Dict[str, Any]
    spending_patterns: Dict[str, Any]
    saving_recommendations: List[str]
    investment_suggestions: List[str]
    budget_adjustments: List[str]

class ParentingSupport(BaseModel):
    """Schema for parenting support."""
    child_age_group: str
    development_stage: str
    current_challenges: List[str]
    parenting_strategies: List[str]
    resources: List[str]

class CreativeProject(BaseModel):
    """Schema for creative projects."""
    project_type: str
    inspiration_sources: List[str]
    execution_steps: List[str]
    required_resources: List[str]
    timeline: Dict[str, Any]

class MindfulnessExercise(BaseModel):
    """Schema for mindfulness exercises."""
    exercise_type: str
    duration: str
    instructions: List[str]
    benefits: List[str]
    adaptations: Dict[str, List[str]]

class StressManagement(BaseModel):
    """Schema for stress management."""
    stress_level: int
    triggers: List[str]
    coping_techniques: List[str]
    preventive_measures: List[str]
    relaxation_exercises: List[str]

class TimeManagement(BaseModel):
    """Schema for time management."""
    current_schedule: Dict[str, Any]
    productivity_analysis: Dict[str, Any]
    optimization_suggestions: List[str]
    priority_matrix: Dict[str, List[str]]
    routine_improvements: List[str]
