from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field

class IntegrationType(str, Enum):
    DATA_SYNC = "data_sync"
    UPDATE = "update"
    CORRELATION = "correlation"
    PATTERN = "pattern"
    INSIGHT = "insight"
    RECOMMENDATION = "recommendation"
    NOTIFICATION = "notification"

class ComponentType(str, Enum):
    HEALTH = "health"
    FINANCE = "finance"
    GOALS = "goals"
    MOOD = "mood"
    HABITS = "habits"
    JOURNAL = "journal"
    LEARNING = "learning"
    SOCIAL = "social"
    MINDFULNESS = "mindfulness"
    TASKS = "tasks"

class CorrelationType(str, Enum):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    CAUSAL = "causal"
    CYCLIC = "cyclic"
    LAGGED = "lagged"

class PatternType(str, Enum):
    TREND = "trend"
    SEASONAL = "seasonal"
    CYCLIC = "cyclic"
    RANDOM = "random"
    OUTLIER = "outlier"
    CLUSTER = "cluster"

class InteractionType(str, Enum):
    DIRECT = "direct"
    INDIRECT = "indirect"
    BIDIRECTIONAL = "bidirectional"
    CASCADING = "cascading"
    REINFORCING = "reinforcing"
    CONFLICTING = "conflicting"

class ComponentInteraction(BaseModel):
    source: ComponentType
    target: ComponentType
    interaction_type: InteractionType
    strength: float
    description: str
    timestamp: datetime
    impact_score: float
    confidence: float
    evidence: List[Dict[str, Any]]

class DataCorrelation(BaseModel):
    component1: ComponentType
    component2: ComponentType
    correlation_type: CorrelationType
    strength: float
    lag: Optional[int]
    confidence: float
    significance: float
    timestamp: datetime
    metadata: Dict[str, Any]

class PatternInsight(BaseModel):
    pattern_type: PatternType
    components: List[ComponentType]
    description: str
    confidence: float
    impact: float
    duration: Optional[int]
    frequency: Optional[float]
    supporting_data: List[Dict[str, Any]]
    recommendations: List[str]
    timestamp: datetime

class IntegrationMetrics(BaseModel):
    sync_frequency: float
    sync_success_rate: float
    data_consistency_score: float
    correlation_accuracy: float
    pattern_detection_rate: float
    insight_relevance_score: float
    recommendation_adoption_rate: float
    cross_component_coverage: float
    timestamp: datetime

class ComponentSync(BaseModel):
    component: ComponentType
    last_sync: datetime
    sync_status: str
    data_hash: str
    changes_detected: bool
    sync_duration: float
    error_count: int
    retry_count: int
    metadata: Dict[str, Any]

class IntegrationUpdate(BaseModel):
    update_type: IntegrationType
    source_component: ComponentType
    target_components: List[ComponentType]
    update_data: Dict[str, Any]
    timestamp: datetime
    status: str
    processing_time: float
    impact_assessment: Dict[str, Any]
    rollback_info: Optional[Dict[str, Any]]

class CrossComponentPattern(BaseModel):
    pattern_id: str
    pattern_type: PatternType
    components: List[ComponentType]
    start_time: datetime
    end_time: Optional[datetime]
    strength: float
    confidence: float
    impact_areas: List[str]
    supporting_evidence: List[Dict[str, Any]]
    related_patterns: List[str]
    metadata: Dict[str, Any]

class IntegrationInsight(BaseModel):
    insight_id: str
    insight_type: str
    title: str
    description: str
    components: List[ComponentType]
    correlations: List[DataCorrelation]
    patterns: List[CrossComponentPattern]
    confidence: float
    priority: str
    timestamp: datetime
    expiry: Optional[datetime]
    actions: List[Dict[str, Any]]
    metadata: Dict[str, Any]

class IntegrationRecommendation(BaseModel):
    recommendation_id: str
    title: str
    description: str
    source_insight: str
    target_components: List[ComponentType]
    priority: str
    impact_score: float
    effort_score: float
    timeline: str
    prerequisites: List[str]
    actions: List[Dict[str, Any]]
    expected_outcomes: Dict[str, Any]
    monitoring_metrics: List[str]
    timestamp: datetime

class ComponentHealth(BaseModel):
    component: ComponentType
    status: str
    last_check: datetime
    error_rate: float
    response_time: float
    data_quality_score: float
    sync_status: str
    dependency_health: Dict[str, float]
    alerts: List[Dict[str, Any]]
    metadata: Dict[str, Any]

class IntegrationConfig(BaseModel):
    sync_interval: int = 300  # seconds
    correlation_threshold: float = 0.7
    pattern_confidence_threshold: float = 0.8
    max_retry_attempts: int = 3
    cache_duration: int = 3600  # seconds
    batch_size: int = 100
    timeout: int = 30  # seconds
    error_threshold: float = 0.1
    monitoring_interval: int = 60  # seconds

class IntegrationEvent(BaseModel):
    event_id: str
    event_type: str
    source: ComponentType
    targets: List[ComponentType]
    timestamp: datetime
    data: Dict[str, Any]
    status: str
    processing_time: float
    error: Optional[str]
    metadata: Dict[str, Any]

class DataTransformation(BaseModel):
    source_format: Dict[str, Any]
    target_format: Dict[str, Any]
    transformation_rules: List[Dict[str, Any]]
    validation_rules: List[Dict[str, Any]]
    fallback_values: Dict[str, Any]
    metadata: Dict[str, Any]

class IntegrationState(BaseModel):
    component_states: Dict[ComponentType, Dict[str, Any]]
    active_syncs: List[ComponentSync]
    pending_updates: List[IntegrationUpdate]
    active_patterns: List[CrossComponentPattern]
    recent_insights: List[IntegrationInsight]
    current_recommendations: List[IntegrationRecommendation]
    health_metrics: Dict[ComponentType, ComponentHealth]
    last_update: datetime
