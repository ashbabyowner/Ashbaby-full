from typing import Dict, Any, List, Optional
from datetime import datetime
import openai
from sqlalchemy.orm import Session
from ..models.user import User
from ..models.health import HealthMetric, HealthGoal
from ..models.finance import Transaction, Budget
from ..models.portal import Portal
from ..core.config import settings
import logging

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self, db: Session):
        self.db = db
        self.openai = openai
        self.openai.api_key = settings.OPENAI_API_KEY

    async def get_personalized_response(
        self,
        user_id: int,
        message: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Get personalized AI response based on user context."""
        try:
            # Get user profile and context
            user = self.db.query(User).filter(User.id == user_id).first()
            user_context = self._gather_user_context(user)
            
            if context:
                user_context.update(context)

            # Prepare system message
            system_message = self._create_system_message(user_context)

            # Get AI response
            response = await self.openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": message}
                ],
                temperature=0.7,
                max_tokens=2000
            )

            # Extract and process response
            ai_response = response.choices[0].message.content
            
            # Generate additional insights and recommendations
            insights = await self._generate_insights(user_id, message, ai_response)
            
            return {
                "response": ai_response,
                "insights": insights,
                "suggestions": await self._generate_suggestions(user_id, message)
            }
        except Exception as e:
            logger.error(f"Error getting AI response: {str(e)}")
            raise

    def _gather_user_context(self, user: User) -> Dict[str, Any]:
        """Gather comprehensive user context for AI personalization."""
        try:
            # Get health metrics
            health_metrics = self.db.query(HealthMetric).filter(
                HealthMetric.user_id == user.id
            ).order_by(HealthMetric.timestamp.desc()).limit(10).all()

            # Get financial data
            transactions = self.db.query(Transaction).filter(
                Transaction.user_id == user.id
            ).order_by(Transaction.date.desc()).limit(10).all()

            # Get goals
            goals = self.db.query(HealthGoal).filter(
                HealthGoal.user_id == user.id,
                HealthGoal.status == "in_progress"
            ).all()

            # Get connected portals
            portals = self.db.query(Portal).filter(
                Portal.user_id == user.id
            ).all()

            return {
                "user_profile": {
                    "age": user.age,
                    "gender": user.gender,
                    "preferences": user.preferences,
                    "needs": user.specific_needs,
                    "goals": [goal.goal_type for goal in goals]
                },
                "health_context": {
                    "metrics": [
                        {
                            "type": metric.metric_type.value,
                            "value": metric.value,
                            "unit": metric.unit
                        }
                        for metric in health_metrics
                    ],
                    "conditions": user.health_conditions
                },
                "financial_context": {
                    "recent_transactions": [
                        {
                            "category": tx.category,
                            "amount": tx.amount
                        }
                        for tx in transactions
                    ],
                    "financial_goals": user.financial_goals
                },
                "connected_services": [
                    portal.portal_type.value for portal in portals
                ]
            }
        except Exception as e:
            logger.error(f"Error gathering user context: {str(e)}")
            return {}

    def _create_system_message(self, context: Dict[str, Any]) -> str:
        """Create personalized system message based on user context."""
        return f"""You are an advanced AI assistant specialized in providing personalized support and guidance.
User Context:
- Age: {context.get('user_profile', {}).get('age')}
- Gender: {context.get('user_profile', {}).get('gender')}
- Specific Needs: {context.get('user_profile', {}).get('needs')}
- Goals: {context.get('user_profile', {}).get('goals')}

Your role is to:
1. Provide age-appropriate, empathetic responses
2. Consider the user's specific needs and goals
3. Offer actionable advice and suggestions
4. Maintain a supportive and encouraging tone
5. Respect privacy and maintain confidentiality
6. Provide evidence-based information when relevant
7. Encourage healthy habits and positive behaviors
8. Help with goal setting and progress tracking
9. Offer crisis resources when appropriate
10. Adapt communication style to user's preferences

Remember to:
- Be sensitive to the user's emotional state
- Avoid medical diagnoses or professional advice
- Encourage professional help when needed
- Use inclusive and respectful language
- Provide specific, actionable steps
- Acknowledge and validate feelings
- Maintain appropriate boundaries"""

    async def _generate_insights(
        self,
        user_id: int,
        message: str,
        response: str
    ) -> List[Dict[str, Any]]:
        """Generate additional insights based on user interaction."""
        try:
            # Get AI analysis of the interaction
            analysis = await self.openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "Analyze this interaction and provide insights about the user's needs, goals, and potential areas for support."},
                    {"role": "user", "content": f"Message: {message}\nResponse: {response}"}
                ],
                temperature=0.5
            )

            insights = []
            analysis_text = analysis.choices[0].message.content

            # Generate structured insights
            categories = ["emotional", "behavioral", "goals", "support_needs"]
            for category in categories:
                insight = await self.openai.chat.completions.create(
                    model="gpt-4",
                    messages=[
                        {"role": "system", "content": f"Extract {category} insights from this analysis."},
                        {"role": "user", "content": analysis_text}
                    ],
                    temperature=0.3
                )
                
                insights.append({
                    "category": category,
                    "content": insight.choices[0].message.content
                })

            return insights
        except Exception as e:
            logger.error(f"Error generating insights: {str(e)}")
            return []

    async def _generate_suggestions(self, user_id: int, message: str) -> List[Dict[str, Any]]:
        """Generate personalized suggestions based on user message."""
        try:
            # Get AI suggestions
            suggestions = await self.openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "Generate specific, actionable suggestions based on the user's message."},
                    {"role": "user", "content": message}
                ],
                temperature=0.5
            )

            # Parse and structure suggestions
            suggestion_text = suggestions.choices[0].message.content
            structured_suggestions = []

            # Get specific suggestions by category
            categories = ["immediate_actions", "long_term_goals", "resources", "activities"]
            for category in categories:
                category_suggestions = await self.openai.chat.completions.create(
                    model="gpt-4",
                    messages=[
                        {"role": "system", "content": f"Extract {category} suggestions from this text."},
                        {"role": "user", "content": suggestion_text}
                    ],
                    temperature=0.3
                )
                
                structured_suggestions.append({
                    "category": category,
                    "suggestions": category_suggestions.choices[0].message.content.split("\n")
                })

            return structured_suggestions
        except Exception as e:
            logger.error(f"Error generating suggestions: {str(e)}")
            return []

    async def generate_creative_content(
        self,
        user_id: int,
        content_type: str,
        prompt: str
    ) -> Dict[str, Any]:
        """Generate creative content based on user prompt."""
        try:
            # Get AI-generated creative content
            response = await self.openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": f"Generate creative {content_type} content based on the user's prompt."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.8
            )

            return {
                "content_type": content_type,
                "content": response.choices[0].message.content,
                "prompt": prompt
            }
        except Exception as e:
            logger.error(f"Error generating creative content: {str(e)}")
            raise

    async def get_daily_plan(self, user_id: int) -> Dict[str, Any]:
        """Generate personalized daily plan."""
        try:
            user_context = self._gather_user_context(
                self.db.query(User).filter(User.id == user_id).first()
            )

            response = await self.openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "Generate a personalized daily plan based on the user's context, goals, and needs."},
                    {"role": "user", "content": str(user_context)}
                ],
                temperature=0.5
            )

            return {
                "plan": response.choices[0].message.content,
                "context": user_context
            }
        except Exception as e:
            logger.error(f"Error generating daily plan: {str(e)}")
            raise
