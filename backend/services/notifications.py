from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import asyncio
from fastapi import HTTPException
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from services.ai_insights import AIInsightsService
from services.personalization import PersonalizationService
from utils.ai_utils import AIAnalytics, AICorrelation

class NotificationService:
    def __init__(
        self,
        ai_insights_service: AIInsightsService,
        personalization_service: PersonalizationService,
        ai_analytics: AIAnalytics,
        ai_correlation: AICorrelation
    ):
        self.ai_insights_service = ai_insights_service
        self.personalization_service = personalization_service
        self.ai_analytics = ai_analytics
        self.ai_correlation = ai_correlation
        self.scheduler = AsyncIOScheduler()
        self.notification_queue: Dict[str, List[Dict[str, Any]]] = {}
        self.initialize_scheduler()

    def initialize_scheduler(self):
        """Initialize the notification scheduler."""
        try:
            # Schedule daily insights
            self.scheduler.add_job(
                self._generate_daily_insights,
                CronTrigger(hour=8),  # 8 AM daily
                id='daily_insights'
            )

            # Schedule weekly summaries
            self.scheduler.add_job(
                self._generate_weekly_summary,
                CronTrigger(day_of_week='mon', hour=9),  # 9 AM Mondays
                id='weekly_summary'
            )

            # Schedule real-time notifications check
            self.scheduler.add_job(
                self._check_realtime_notifications,
                'interval',
                minutes=15,
                id='realtime_check'
            )

            # Start the scheduler
            self.scheduler.start()

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error initializing scheduler: {str(e)}"
            )

    async def get_pending_notifications(
        self,
        user_id: str
    ) -> List[Dict[str, Any]]:
        """Get pending notifications for a user."""
        try:
            # Get user preferences
            user_profile = await self.personalization_service.get_user_profile(
                user_id
            )
            
            # Get notifications from queue
            notifications = self.notification_queue.get(user_id, [])
            
            # Filter based on preferences
            filtered_notifications = self._filter_notifications(
                notifications,
                user_profile.communication_preferences
            )
            
            # Clear processed notifications
            self.notification_queue[user_id] = []
            
            return filtered_notifications

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error getting notifications: {str(e)}"
            )

    async def send_notification(
        self,
        user_id: str,
        notification: Dict[str, Any]
    ) -> bool:
        """Send a notification to a user."""
        try:
            # Validate notification
            validated_notification = self._validate_notification(notification)
            
            # Add to queue
            if user_id not in self.notification_queue:
                self.notification_queue[user_id] = []
            
            self.notification_queue[user_id].append({
                **validated_notification,
                'timestamp': datetime.now(),
                'status': 'pending'
            })
            
            # TODO: Implement push notification or email delivery
            
            return True

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error sending notification: {str(e)}"
            )

    async def update_notification_preferences(
        self,
        user_id: str,
        preferences: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Update notification preferences for a user."""
        try:
            # Validate preferences
            validated_prefs = self._validate_preferences(preferences)
            
            # Update user profile
            await self.personalization_service.update_user_preferences(
                user_id,
                {'notification_preferences': validated_prefs}
            )
            
            return validated_prefs

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error updating preferences: {str(e)}"
            )

    async def _generate_daily_insights(self):
        """Generate and send daily insights to users."""
        try:
            # Get all active users
            users = await self._get_active_users()
            
            for user_id in users:
                # Get user profile
                profile = await self.personalization_service.get_user_profile(
                    user_id
                )
                
                if not profile.communication_preferences.get('daily_insights'):
                    continue
                
                # Generate insights
                insights = await self.ai_insights_service.get_holistic_insights(
                    user_id
                )
                
                # Create notification
                notification = {
                    'type': 'daily_insights',
                    'title': 'Your Daily Insights',
                    'content': self._format_insights(insights),
                    'priority': 'normal',
                    'category': 'insights'
                }
                
                # Send notification
                await self.send_notification(user_id, notification)

        except Exception as e:
            print(f"Error generating daily insights: {str(e)}")

    async def _generate_weekly_summary(self):
        """Generate and send weekly summaries to users."""
        try:
            # Get all active users
            users = await self._get_active_users()
            
            for user_id in users:
                # Get user profile
                profile = await self.personalization_service.get_user_profile(
                    user_id
                )
                
                if not profile.communication_preferences.get('weekly_summary'):
                    continue
                
                # Generate summary
                summary = await self._generate_user_summary(user_id)
                
                # Create notification
                notification = {
                    'type': 'weekly_summary',
                    'title': 'Your Weekly Progress Summary',
                    'content': summary,
                    'priority': 'high',
                    'category': 'summary'
                }
                
                # Send notification
                await self.send_notification(user_id, notification)

        except Exception as e:
            print(f"Error generating weekly summaries: {str(e)}")

    async def _check_realtime_notifications(self):
        """Check and send real-time notifications."""
        try:
            # Get all active users
            users = await self._get_active_users()
            
            for user_id in users:
                # Get user profile
                profile = await self.personalization_service.get_user_profile(
                    user_id
                )
                
                if not profile.communication_preferences.get('realtime_alerts'):
                    continue
                
                # Check for important events
                events = await self._check_important_events(user_id)
                
                for event in events:
                    notification = {
                        'type': 'realtime_alert',
                        'title': event['title'],
                        'content': event['description'],
                        'priority': 'high',
                        'category': event['category']
                    }
                    
                    await self.send_notification(user_id, notification)

        except Exception as e:
            print(f"Error checking realtime notifications: {str(e)}")

    def _filter_notifications(
        self,
        notifications: List[Dict[str, Any]],
        preferences: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Filter notifications based on user preferences."""
        filtered = []
        
        for notif in notifications:
            # Check if notification type is enabled
            if not preferences.get(f"{notif['type']}_enabled", True):
                continue
            
            # Check priority threshold
            if notif['priority'] == 'low' and not preferences.get('low_priority', True):
                continue
            
            # Check category preferences
            if not preferences.get(f"category_{notif['category']}", True):
                continue
            
            filtered.append(notif)
        
        return filtered

    def _validate_notification(
        self,
        notification: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Validate notification data."""
        required_fields = ['type', 'title', 'content']
        for field in required_fields:
            if field not in notification:
                raise ValueError(f"Missing required field: {field}")
        
        # Set default values
        validated = {
            **notification,
            'priority': notification.get('priority', 'normal'),
            'category': notification.get('category', 'general'),
            'actions': notification.get('actions', []),
            'expiry': notification.get('expiry', None)
        }
        
        return validated

    def _validate_preferences(
        self,
        preferences: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Validate notification preferences."""
        validated = {}
        
        # Validate notification types
        for notif_type in ['daily_insights', 'weekly_summary', 'realtime_alerts']:
            if notif_type in preferences:
                validated[notif_type] = bool(preferences[notif_type])
        
        # Validate priority levels
        for priority in ['low', 'normal', 'high']:
            key = f'{priority}_priority'
            if key in preferences:
                validated[key] = bool(preferences[key])
        
        # Validate categories
        if 'categories' in preferences:
            validated['categories'] = {
                cat: bool(enabled)
                for cat, enabled in preferences['categories'].items()
            }
        
        return validated

    async def _get_active_users(self) -> List[str]:
        """Get list of active users."""
        # TODO: Implement active users retrieval
        pass

    async def _generate_user_summary(
        self,
        user_id: str
    ) -> Dict[str, Any]:
        """Generate weekly summary for a user."""
        # TODO: Implement summary generation
        pass

    async def _check_important_events(
        self,
        user_id: str
    ) -> List[Dict[str, Any]]:
        """Check for important events that need immediate notification."""
        # TODO: Implement important events check
        pass

    def _format_insights(
        self,
        insights: List[Dict[str, Any]]
    ) -> str:
        """Format insights into readable content."""
        formatted = []
        
        for insight in insights:
            formatted.append(f"• {insight['title']}")
            formatted.append(f"  {insight['description']}")
            
            if insight.get('recommendations'):
                formatted.append("\n  Recommendations:")
                for rec in insight['recommendations']:
                    formatted.append(f"  - {rec}")
            
            formatted.append("")
        
        return "\n".join(formatted)
