from typing import Optional, Dict, Any, List
from pydantic import BaseModel
from datetime import datetime
from ..models.health import HealthMetricType

class SymptomBase(BaseModel):
    """Base schema for symptoms."""
    name: str
    severity: int
    frequency: str
    triggers: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None

class SymptomCreate(SymptomBase):
    """Schema for creating a symptom."""
    started_at: datetime

class SymptomResponse(SymptomBase):
    """Schema for symptom response."""
    id: int
    user_id: int
    started_at: datetime
    ended_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    analysis: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class MedicationBase(BaseModel):
    """Base schema for medications."""
    name: str
    dosage: str
    frequency: str
    prescriber: Optional[str] = None
    pharmacy: Optional[str] = None
    side_effects: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None

class MedicationCreate(MedicationBase):
    """Schema for creating a medication."""
    start_date: datetime
    end_date: Optional[datetime] = None

class MedicationResponse(MedicationBase):
    """Schema for medication response."""
    id: int
    user_id: int
    start_date: datetime
    end_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    interactions: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class HealthMetricBase(BaseModel):
    """Base schema for health metrics."""
    metric_type: HealthMetricType
    value: float
    unit: str
    metadata: Optional[Dict[str, Any]] = None

class HealthMetricCreate(HealthMetricBase):
    """Schema for creating a health metric."""
    timestamp: datetime
    portal_id: Optional[int] = None

class HealthMetricResponse(HealthMetricBase):
    """Schema for health metric response."""
    id: int
    user_id: int
    portal_id: Optional[int]
    timestamp: datetime
    created_at: datetime

    class Config:
        from_attributes = True

class HealthGoalBase(BaseModel):
    """Base schema for health goals."""
    goal_type: str
    target_value: float
    unit: str
    target_date: datetime
    notes: Optional[str] = None

class HealthGoalCreate(HealthGoalBase):
    """Schema for creating a health goal."""
    pass

class HealthGoalResponse(HealthGoalBase):
    """Schema for health goal response."""
    id: int
    user_id: int
    current_value: float
    start_date: datetime
    status: str
    progress: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class HealthInsightBase(BaseModel):
    """Base schema for health insights."""
    insight_type: str
    title: str
    description: str
    severity: str
    recommendations: Optional[Dict[str, Any]] = None
    data_sources: Optional[Dict[str, Any]] = None

class HealthInsightResponse(HealthInsightBase):
    """Schema for health insight response."""
    id: int
    user_id: int
    is_acknowledged: bool
    created_at: datetime
    acknowledged_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class HealthReportResponse(BaseModel):
    """Schema for health report response."""
    report: str
    insight_id: int

class HealthTrendResponse(BaseModel):
    """Schema for health trend response."""
    analysis: str
    insight_id: int

class SymptomAnalysisResponse(BaseModel):
    """Schema for symptom analysis response."""
    analysis: str
    insight_id: int

class MedicationInteractionResponse(BaseModel):
    """Schema for medication interaction response."""
    analysis: str
    insight_id: int
