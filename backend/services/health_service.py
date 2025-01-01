from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException
import openai
from fhirclient import client
from fhirclient.models import patient, observation, condition, medication
import fitbit
import strava
from ..models.health import (
    HealthRecord, HealthMetric, Symptom, Medication,
    HealthInsight, HealthGoal, HealthMetricType
)
from ..core.config import settings
from ..services.push_notification import PushNotificationService
import logging

logger = logging.getLogger(__name__)

class HealthService:
    def __init__(self, db: Session):
        self.db = db
        self.openai = openai
        self.openai.api_key = settings.OPENAI_API_KEY
        self.push_notification = PushNotificationService(db)

    async def analyze_symptoms(self, user_id: int, symptoms: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze symptoms using AI and provide insights."""
        try:
            # Get user's health history
            health_records = self.db.query(HealthRecord).filter(
                HealthRecord.user_id == user_id
            ).all()
            
            # Get current medications
            medications = self.db.query(Medication).filter(
                Medication.user_id == user_id,
                Medication.end_date.is_(None)
            ).all()

            # Prepare context for AI
            context = {
                "symptoms": symptoms,
                "health_history": [
                    {
                        "type": record.record_type,
                        "description": record.description,
                        "date": record.record_date.isoformat()
                    }
                    for record in health_records
                ],
                "current_medications": [
                    {
                        "name": med.name,
                        "dosage": med.dosage,
                        "frequency": med.frequency
                    }
                    for med in medications
                ]
            }

            # Get AI analysis
            response = await self.openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a medical analysis assistant. Analyze the symptoms and provide insights based on the patient's health history and medications."},
                    {"role": "user", "content": str(context)}
                ],
                temperature=0.3
            )

            analysis = response.choices[0].message.content

            # Create health insight
            insight = HealthInsight(
                user_id=user_id,
                insight_type="symptom_analysis",
                title="Symptom Analysis",
                description=analysis,
                severity="info",
                data_sources=context
            )
            self.db.add(insight)
            self.db.commit()

            # Send notification
            await self.push_notification.send_push_notification(
                user_id,
                "New Health Insight Available",
                "AI has analyzed your recent symptoms",
                {"type": "health_insight", "insight_id": insight.id}
            )

            return {
                "analysis": analysis,
                "insight_id": insight.id
            }
        except Exception as e:
            logger.error(f"Error analyzing symptoms: {str(e)}")
            raise HTTPException(status_code=500, detail="Error analyzing symptoms")

    async def check_medication_interactions(self, user_id: int) -> Dict[str, Any]:
        """Check for potential medication interactions using AI."""
        try:
            medications = self.db.query(Medication).filter(
                Medication.user_id == user_id,
                Medication.end_date.is_(None)
            ).all()

            if not medications:
                return {"message": "No current medications found"}

            # Prepare medication list for AI
            med_list = [
                {
                    "name": med.name,
                    "dosage": med.dosage,
                    "frequency": med.frequency
                }
                for med in medications
            ]

            # Get AI analysis
            response = await self.openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a medication interaction checker. Analyze the list of medications and identify potential interactions or concerns."},
                    {"role": "user", "content": str(med_list)}
                ],
                temperature=0.3
            )

            analysis = response.choices[0].message.content

            # Create health insight
            insight = HealthInsight(
                user_id=user_id,
                insight_type="medication_interaction",
                title="Medication Interaction Analysis",
                description=analysis,
                severity="warning" if "interaction" in analysis.lower() else "info",
                data_sources={"medications": med_list}
            )
            self.db.add(insight)
            self.db.commit()

            if "interaction" in analysis.lower():
                await self.push_notification.send_push_notification(
                    user_id,
                    "Medication Interaction Alert",
                    "Potential medication interactions detected",
                    {"type": "health_insight", "insight_id": insight.id}
                )

            return {
                "analysis": analysis,
                "insight_id": insight.id
            }
        except Exception as e:
            logger.error(f"Error checking medication interactions: {str(e)}")
            raise HTTPException(status_code=500, detail="Error checking medication interactions")

    async def generate_health_report(self, user_id: int) -> Dict[str, Any]:
        """Generate comprehensive health report using AI."""
        try:
            # Gather all health data
            health_records = self.db.query(HealthRecord).filter(
                HealthRecord.user_id == user_id
            ).all()
            
            metrics = self.db.query(HealthMetric).filter(
                HealthMetric.user_id == user_id,
                HealthMetric.timestamp >= datetime.utcnow() - timedelta(days=30)
            ).all()
            
            symptoms = self.db.query(Symptom).filter(
                Symptom.user_id == user_id,
                Symptom.ended_at.is_(None)
            ).all()
            
            medications = self.db.query(Medication).filter(
                Medication.user_id == user_id,
                Medication.end_date.is_(None)
            ).all()

            goals = self.db.query(HealthGoal).filter(
                HealthGoal.user_id == user_id,
                HealthGoal.status == "in_progress"
            ).all()

            # Prepare data for AI
            context = {
                "health_records": [
                    {
                        "type": record.record_type,
                        "description": record.description,
                        "date": record.record_date.isoformat()
                    }
                    for record in health_records
                ],
                "metrics": [
                    {
                        "type": metric.metric_type.value,
                        "value": metric.value,
                        "unit": metric.unit,
                        "timestamp": metric.timestamp.isoformat()
                    }
                    for metric in metrics
                ],
                "symptoms": [
                    {
                        "name": symptom.name,
                        "severity": symptom.severity,
                        "started_at": symptom.started_at.isoformat()
                    }
                    for symptom in symptoms
                ],
                "medications": [
                    {
                        "name": med.name,
                        "dosage": med.dosage,
                        "frequency": med.frequency
                    }
                    for med in medications
                ],
                "goals": [
                    {
                        "type": goal.goal_type,
                        "progress": goal.progress,
                        "target": goal.target_value
                    }
                    for goal in goals
                ]
            }

            # Get AI analysis
            response = await self.openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a health report generator. Analyze the patient's health data and provide a comprehensive report with insights and recommendations."},
                    {"role": "user", "content": str(context)}
                ],
                temperature=0.3
            )

            report = response.choices[0].message.content

            # Create health insight
            insight = HealthInsight(
                user_id=user_id,
                insight_type="health_report",
                title="Monthly Health Report",
                description=report,
                severity="info",
                data_sources=context
            )
            self.db.add(insight)
            self.db.commit()

            await self.push_notification.send_push_notification(
                user_id,
                "Monthly Health Report Available",
                "Your AI-generated health report is ready",
                {"type": "health_insight", "insight_id": insight.id}
            )

            return {
                "report": report,
                "insight_id": insight.id
            }
        except Exception as e:
            logger.error(f"Error generating health report: {str(e)}")
            raise HTTPException(status_code=500, detail="Error generating health report")

    async def predict_health_trends(self, user_id: int) -> Dict[str, Any]:
        """Predict health trends using AI analysis of historical data."""
        try:
            # Get historical metrics
            metrics = self.db.query(HealthMetric).filter(
                HealthMetric.user_id == user_id,
                HealthMetric.timestamp >= datetime.utcnow() - timedelta(days=90)
            ).all()

            if not metrics:
                return {"message": "Insufficient data for trend analysis"}

            # Prepare data for AI
            metric_data = {}
            for metric in metrics:
                if metric.metric_type.value not in metric_data:
                    metric_data[metric.metric_type.value] = []
                metric_data[metric.metric_type.value].append({
                    "value": metric.value,
                    "timestamp": metric.timestamp.isoformat()
                })

            # Get AI analysis
            response = await self.openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a health trend analyzer. Analyze the historical health metrics and predict future trends."},
                    {"role": "user", "content": str(metric_data)}
                ],
                temperature=0.3
            )

            analysis = response.choices[0].message.content

            # Create health insight
            insight = HealthInsight(
                user_id=user_id,
                insight_type="trend_prediction",
                title="Health Trend Prediction",
                description=analysis,
                severity="info",
                data_sources={"metrics": metric_data}
            )
            self.db.add(insight)
            self.db.commit()

            return {
                "analysis": analysis,
                "insight_id": insight.id
            }
        except Exception as e:
            logger.error(f"Error predicting health trends: {str(e)}")
            raise HTTPException(status_code=500, detail="Error predicting health trends")
