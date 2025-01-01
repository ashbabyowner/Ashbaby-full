from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.health_service import HealthService
from ..core.auth import get_current_user
from ..models.health import (
    HealthRecord, HealthMetric, Symptom, Medication,
    HealthInsight, HealthGoal, HealthMetricType
)
from ..schemas.health import (
    SymptomCreate, SymptomResponse,
    MedicationCreate, MedicationResponse,
    HealthMetricCreate, HealthMetricResponse,
    HealthGoalCreate, HealthGoalResponse,
    HealthInsightResponse
)

router = APIRouter(prefix="/health", tags=["health"])

# Symptom endpoints
@router.post("/symptoms", response_model=SymptomResponse)
async def create_symptom(
    symptom: SymptomCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new symptom record and get AI analysis."""
    service = HealthService(db)
    
    # Create symptom record
    new_symptom = Symptom(**symptom.dict(), user_id=current_user.id)
    db.add(new_symptom)
    db.commit()
    db.refresh(new_symptom)

    # Get AI analysis
    analysis = await service.analyze_symptoms(
        current_user.id,
        [{"name": symptom.name, "severity": symptom.severity}]
    )

    return {**new_symptom.__dict__, "analysis": analysis}

@router.get("/symptoms", response_model=List[SymptomResponse])
async def get_symptoms(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all symptoms for the current user."""
    symptoms = db.query(Symptom).filter(
        Symptom.user_id == current_user.id
    ).all()
    return symptoms

# Medication endpoints
@router.post("/medications", response_model=MedicationResponse)
async def create_medication(
    medication: MedicationCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new medication record and check for interactions."""
    service = HealthService(db)
    
    # Create medication record
    new_medication = Medication(**medication.dict(), user_id=current_user.id)
    db.add(new_medication)
    db.commit()
    db.refresh(new_medication)

    # Check for interactions
    interactions = await service.check_medication_interactions(current_user.id)

    return {**new_medication.__dict__, "interactions": interactions}

@router.get("/medications", response_model=List[MedicationResponse])
async def get_medications(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all medications for the current user."""
    medications = db.query(Medication).filter(
        Medication.user_id == current_user.id
    ).all()
    return medications

# Health metrics endpoints
@router.post("/metrics", response_model=HealthMetricResponse)
async def create_health_metric(
    metric: HealthMetricCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Record a new health metric."""
    new_metric = HealthMetric(**metric.dict(), user_id=current_user.id)
    db.add(new_metric)
    db.commit()
    db.refresh(new_metric)
    return new_metric

@router.get("/metrics", response_model=List[HealthMetricResponse])
async def get_health_metrics(
    metric_type: Optional[HealthMetricType] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get health metrics for the current user."""
    query = db.query(HealthMetric).filter(HealthMetric.user_id == current_user.id)
    if metric_type:
        query = query.filter(HealthMetric.metric_type == metric_type)
    return query.all()

# Health goals endpoints
@router.post("/goals", response_model=HealthGoalResponse)
async def create_health_goal(
    goal: HealthGoalCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new health goal."""
    new_goal = HealthGoal(**goal.dict(), user_id=current_user.id)
    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)
    return new_goal

@router.get("/goals", response_model=List[HealthGoalResponse])
async def get_health_goals(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all health goals for the current user."""
    goals = db.query(HealthGoal).filter(
        HealthGoal.user_id == current_user.id
    ).all()
    return goals

# Health insights endpoints
@router.get("/insights", response_model=List[HealthInsightResponse])
async def get_health_insights(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI-generated health insights for the current user."""
    insights = db.query(HealthInsight).filter(
        HealthInsight.user_id == current_user.id
    ).all()
    return insights

@router.post("/insights/acknowledge/{insight_id}")
async def acknowledge_insight(
    insight_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a health insight as acknowledged."""
    insight = db.query(HealthInsight).filter(
        HealthInsight.id == insight_id,
        HealthInsight.user_id == current_user.id
    ).first()
    
    if not insight:
        raise HTTPException(status_code=404, detail="Insight not found")
    
    insight.is_acknowledged = True
    insight.acknowledged_at = datetime.utcnow()
    db.commit()
    return {"message": "Insight acknowledged"}

# Health analysis endpoints
@router.get("/analysis/report")
async def generate_health_report(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a comprehensive health report using AI."""
    service = HealthService(db)
    return await service.generate_health_report(current_user.id)

@router.get("/analysis/trends")
async def analyze_health_trends(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Analyze and predict health trends using AI."""
    service = HealthService(db)
    return await service.predict_health_trends(current_user.id)
