from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, JSON, Float, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from ..database import Base

class HealthPortalType(enum.Enum):
    EHR = "electronic_health_record"
    WEARABLE = "wearable_device"
    FITNESS = "fitness_tracker"
    NUTRITION = "nutrition_tracker"
    MENTAL_HEALTH = "mental_health"
    SLEEP = "sleep_tracker"
    MEDICATION = "medication_manager"
    LAB_RESULTS = "lab_results"
    INSURANCE = "health_insurance"
    TELEHEALTH = "telehealth"

class HealthMetricType(enum.Enum):
    HEART_RATE = "heart_rate"
    BLOOD_PRESSURE = "blood_pressure"
    BLOOD_GLUCOSE = "blood_glucose"
    WEIGHT = "weight"
    STEPS = "steps"
    SLEEP = "sleep"
    CALORIES = "calories"
    EXERCISE = "exercise"
    MOOD = "mood"
    SYMPTOMS = "symptoms"
    MEDICATION = "medication"
    LAB_VALUE = "lab_value"

class HealthRecord(Base):
    """Model for storing health records."""
    __tablename__ = "health_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    portal_id = Column(Integer, ForeignKey("portals.id"))
    record_type = Column(String)  # e.g., condition, medication, procedure
    record_date = Column(DateTime)
    provider = Column(String)
    description = Column(String)
    status = Column(String)
    metadata = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="health_records")
    portal = relationship("Portal", back_populates="health_records")

class HealthMetric(Base):
    """Model for storing health metrics."""
    __tablename__ = "health_metrics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    portal_id = Column(Integer, ForeignKey("portals.id"))
    metric_type = Column(SQLEnum(HealthMetricType))
    value = Column(Float)
    unit = Column(String)
    timestamp = Column(DateTime)
    metadata = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="health_metrics")
    portal = relationship("Portal", back_populates="health_metrics")

class Symptom(Base):
    """Model for tracking symptoms."""
    __tablename__ = "symptoms"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    severity = Column(Integer)  # 1-10 scale
    started_at = Column(DateTime)
    ended_at = Column(DateTime, nullable=True)
    frequency = Column(String)  # e.g., continuous, intermittent
    triggers = Column(JSON)
    notes = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="symptoms")

class Medication(Base):
    """Model for tracking medications."""
    __tablename__ = "medications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    dosage = Column(String)
    frequency = Column(String)
    start_date = Column(DateTime)
    end_date = Column(DateTime, nullable=True)
    prescriber = Column(String)
    pharmacy = Column(String)
    side_effects = Column(JSON)
    notes = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="medications")

class HealthInsight(Base):
    """Model for storing AI-generated health insights."""
    __tablename__ = "health_insights"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    insight_type = Column(String)  # e.g., symptom_analysis, medication_interaction
    title = Column(String)
    description = Column(String)
    severity = Column(String)  # info, warning, alert
    recommendations = Column(JSON)
    data_sources = Column(JSON)
    is_acknowledged = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    acknowledged_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="health_insights")

class HealthGoal(Base):
    """Model for tracking health goals."""
    __tablename__ = "health_goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    goal_type = Column(String)  # e.g., weight, steps, sleep
    target_value = Column(Float)
    current_value = Column(Float)
    unit = Column(String)
    start_date = Column(DateTime)
    target_date = Column(DateTime)
    status = Column(String)  # in_progress, completed, abandoned
    progress = Column(Float)
    notes = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="health_goals")
