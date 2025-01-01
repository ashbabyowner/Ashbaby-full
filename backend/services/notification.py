from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import HTTPException
from ..models.notification import (
    Notification, NotificationPreference,
    NotificationType, NotificationPriority, NotificationStatus
)
from ..schemas.notification import NotificationCreate, NotificationUpdate, NotificationPreferenceCreate
from ..websocket_manager import manager
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

logger = logging.getLogger(__name__)

class NotificationService:
    def __init__(self, db: Session):
        self.db = db

    async def create_notification(
        self,
        notification: NotificationCreate,
        check_preferences: bool = True
    ) -> Notification:
        """Create a new notification and send it through appropriate channels."""
        if check_preferences:
            # Check user preferences
            preference = self.get_user_preference(
                notification.user_id,
                notification.type
            )
            if not preference or notification.priority.value < preference.minimum_priority.value:
                return None

        # Create notification record
        db_notification = Notification(**notification.dict())
        self.db.add(db_notification)
        self.db.commit()
        self.db.refresh(db_notification)

        # Send through appropriate channels based on preferences
        if preference:
            await self._send_notification(db_notification, preference)

        return db_notification

    async def _send_notification(
        self,
        notification: Notification,
        preference: NotificationPreference
    ) -> None:
        """Send notification through configured channels."""
        tasks = []

        # WebSocket notification
        if preference.websocket_enabled:
            await self._send_websocket_notification(notification)

        # Email notification
        if preference.email_enabled:
            await self._send_email_notification(notification)

        # Push notification (if implemented)
        if preference.push_enabled:
            await self._send_push_notification(notification)

    async def _send_websocket_notification(self, notification: Notification) -> None:
        """Send notification via WebSocket."""
        message = {
            "type": "NOTIFICATION",
            "data": {
                "id": notification.id,
                "type": notification.type,
                "priority": notification.priority,
                "title": notification.title,
                "message": notification.message,
                "data": notification.data,
                "created_at": notification.created_at.isoformat()
            }
        }
        await manager.send_personal_message(message, notification.user_id)

    async def _send_email_notification(self, notification: Notification) -> None:
        """Send notification via email."""
        try:
            # Get user email from database
            user = self.db.query(User).filter(User.id == notification.user_id).first()
            if not user or not user.email:
                return

            # Create email message
            msg = MIMEMultipart()
            msg['From'] = os.getenv("EMAIL_FROM")
            msg['To'] = user.email
            msg['Subject'] = notification.title

            # Create HTML body
            html = f"""
            <html>
                <body>
                    <h2>{notification.title}</h2>
                    <p>{notification.message}</p>
                    <hr>
                    <p><small>This is an automated notification from AI Support App</small></p>
                </body>
            </html>
            """
            msg.attach(MIMEText(html, 'html'))

            # Send email
            with smtplib.SMTP(os.getenv("SMTP_SERVER"), int(os.getenv("SMTP_PORT"))) as server:
                server.starttls()
                server.login(os.getenv("SMTP_USERNAME"), os.getenv("SMTP_PASSWORD"))
                server.send_message(msg)

        except Exception as e:
            logger.error(f"Failed to send email notification: {str(e)}")

    async def _send_push_notification(self, notification: Notification) -> None:
        """Send push notification (placeholder for future implementation)."""
        # Implement push notification service integration here
        pass

    def get_user_notifications(
        self,
        user_id: int,
        skip: int = 0,
        limit: int = 50,
        status: Optional[NotificationStatus] = None
    ) -> List[Notification]:
        """Get user's notifications with optional filtering."""
        query = self.db.query(Notification).filter(Notification.user_id == user_id)
        
        if status:
            query = query.filter(Notification.status == status)
        
        return query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()

    def update_notification(
        self,
        notification_id: int,
        user_id: int,
        updates: NotificationUpdate
    ) -> Notification:
        """Update a notification's status."""
        notification = self.db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()
        
        if not notification:
            raise HTTPException(status_code=404, detail="Notification not found")
        
        for field, value in updates.dict(exclude_unset=True).items():
            setattr(notification, field, value)
        
        self.db.commit()
        self.db.refresh(notification)
        return notification

    def get_user_preference(
        self,
        user_id: int,
        notification_type: NotificationType
    ) -> Optional[NotificationPreference]:
        """Get user's preference for a specific notification type."""
        return self.db.query(NotificationPreference).filter(
            NotificationPreference.user_id == user_id,
            NotificationPreference.notification_type == notification_type
        ).first()

    def set_user_preference(
        self,
        user_id: int,
        preference: NotificationPreferenceCreate
    ) -> NotificationPreference:
        """Set user's preference for a notification type."""
        existing = self.get_user_preference(user_id, preference.notification_type)
        
        if existing:
            # Update existing preference
            for field, value in preference.dict().items():
                setattr(existing, field, value)
            db_preference = existing
        else:
            # Create new preference
            db_preference = NotificationPreference(**preference.dict(), user_id=user_id)
            self.db.add(db_preference)
        
        self.db.commit()
        self.db.refresh(db_preference)
        return db_preference

    def delete_notification(self, notification_id: int, user_id: int) -> None:
        """Delete a notification."""
        notification = self.db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()
        
        if not notification:
            raise HTTPException(status_code=404, detail="Notification not found")
        
        self.db.delete(notification)
        self.db.commit()

    async def create_budget_alert(
        self,
        user_id: int,
        category: str,
        spent: float,
        budget: float,
        threshold: float
    ) -> None:
        """Create a budget alert notification."""
        percentage = (spent / budget) * 100
        priority = NotificationPriority.HIGH if percentage >= 90 else NotificationPriority.MEDIUM
        
        await self.create_notification(NotificationCreate(
            user_id=user_id,
            type=NotificationType.BUDGET_ALERT,
            priority=priority,
            title=f"Budget Alert: {category}",
            message=f"You've spent {percentage:.1f}% of your {category} budget (${spent:.2f} of ${budget:.2f})",
            data={
                "category": category,
                "spent": spent,
                "budget": budget,
                "percentage": percentage
            }
        ))

    async def create_savings_goal_milestone(
        self,
        user_id: int,
        goal_name: str,
        current_amount: float,
        target_amount: float
    ) -> None:
        """Create a savings goal milestone notification."""
        percentage = (current_amount / target_amount) * 100
        
        if percentage in [25, 50, 75, 100]:
            await self.create_notification(NotificationCreate(
                user_id=user_id,
                type=NotificationType.SAVINGS_GOAL,
                priority=NotificationPriority.MEDIUM,
                title=f"Savings Goal Milestone: {goal_name}",
                message=f"Congratulations! You've reached {percentage}% of your savings goal for {goal_name}!",
                data={
                    "goal_name": goal_name,
                    "current_amount": current_amount,
                    "target_amount": target_amount,
                    "percentage": percentage
                }
            ))

    async def create_recurring_transaction_notification(
        self,
        user_id: int,
        transaction_type: str,
        amount: float,
        description: str
    ) -> None:
        """Create a notification for a recurring transaction."""
        await self.create_notification(NotificationCreate(
            user_id=user_id,
            type=NotificationType.RECURRING_TRANSACTION,
            priority=NotificationPriority.LOW,
            title="Recurring Transaction Processed",
            message=f"A {transaction_type} of ${amount:.2f} for {description} has been processed",
            data={
                "type": transaction_type,
                "amount": amount,
                "description": description
            }
        ))

    async def create_financial_health_alert(
        self,
        user_id: int,
        metric: str,
        value: float,
        threshold: float,
        message: str
    ) -> None:
        """Create a financial health alert notification."""
        await self.create_notification(NotificationCreate(
            user_id=user_id,
            type=NotificationType.FINANCIAL_HEALTH,
            priority=NotificationPriority.HIGH,
            title=f"Financial Health Alert: {metric}",
            message=message,
            data={
                "metric": metric,
                "value": value,
                "threshold": threshold
            }
        ))
