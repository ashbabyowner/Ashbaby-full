from typing import Optional, Dict, Any, List
from datetime import datetime
import json
import firebase_admin
from firebase_admin import credentials, messaging
from sqlalchemy.orm import Session
from ..models.notification import NotificationPreference, NotificationType
from ..models.user_device import UserDevice
from ..core.config import settings
import logging

logger = logging.getLogger(__name__)

class PushNotificationService:
    def __init__(self, db: Session):
        self.db = db
        self._initialize_firebase()

    def _initialize_firebase(self):
        """Initialize Firebase Admin SDK if not already initialized."""
        try:
            if not firebase_admin._apps:
                cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
                firebase_admin.initialize_app(cred)
        except Exception as e:
            logger.error(f"Error initializing Firebase: {str(e)}")
            raise

    async def register_device(self, user_id: int, device_token: str, device_info: Dict[str, Any]):
        """Register a new device for push notifications."""
        try:
            # Check if device already exists
            device = self.db.query(UserDevice).filter(
                UserDevice.user_id == user_id,
                UserDevice.device_token == device_token
            ).first()

            if device:
                # Update existing device
                device.last_active = datetime.utcnow()
                device.device_info = device_info
            else:
                # Create new device
                device = UserDevice(
                    user_id=user_id,
                    device_token=device_token,
                    device_info=device_info,
                    is_active=True
                )
                self.db.add(device)

            self.db.commit()
            return device
        except Exception as e:
            logger.error(f"Error registering device: {str(e)}")
            self.db.rollback()
            raise

    async def unregister_device(self, user_id: int, device_token: str):
        """Unregister a device from push notifications."""
        try:
            device = self.db.query(UserDevice).filter(
                UserDevice.user_id == user_id,
                UserDevice.device_token == device_token
            ).first()

            if device:
                device.is_active = False
                device.last_active = datetime.utcnow()
                self.db.commit()
        except Exception as e:
            logger.error(f"Error unregistering device: {str(e)}")
            self.db.rollback()
            raise

    async def send_push_notification(
        self,
        user_id: int,
        title: str,
        body: str,
        data: Optional[Dict[str, Any]] = None,
        notification_type: NotificationType = NotificationType.GENERAL,
        priority: str = "normal"
    ):
        """Send push notification to all user's registered devices."""
        try:
            # Check user's notification preferences
            pref = self.db.query(NotificationPreference).filter(
                NotificationPreference.user_id == user_id,
                NotificationPreference.notification_type == notification_type
            ).first()

            if not pref or not pref.push_enabled:
                return

            # Get user's active devices
            devices = self.db.query(UserDevice).filter(
                UserDevice.user_id == user_id,
                UserDevice.is_active == True
            ).all()

            if not devices:
                return

            # Prepare notification message
            message = messaging.MulticastMessage(
                notification=messaging.Notification(
                    title=title,
                    body=body
                ),
                data=data or {},
                tokens=[device.device_token for device in devices],
                android=messaging.AndroidConfig(
                    priority=priority,
                    notification=messaging.AndroidNotification(
                        icon='notification_icon',
                        color='#4CAF50',
                        channel_id='finance_alerts'
                    )
                ),
                apns=messaging.APNSConfig(
                    payload=messaging.APNSPayload(
                        aps=messaging.Aps(
                            sound='default',
                            badge=1
                        )
                    )
                )
            )

            # Send notification
            response = messaging.send_multicast(message)
            
            # Handle failed tokens
            if response.failure_count > 0:
                failed_tokens = []
                for idx, result in enumerate(response.responses):
                    if not result.success:
                        failed_tokens.append(devices[idx].device_token)
                        # Deactivate failed tokens
                        devices[idx].is_active = False
                        devices[idx].error_message = result.exception.cause
                self.db.commit()

            return response
        except Exception as e:
            logger.error(f"Error sending push notification: {str(e)}")
            raise

    async def send_transaction_alert(self, user_id: int, transaction_data: Dict[str, Any]):
        """Send push notification for new transaction."""
        amount = f"${transaction_data['amount']:.2f}"
        merchant = transaction_data.get('merchant_name', 'Unknown merchant')
        
        title = f"New Transaction: {amount}"
        body = f"Payment to {merchant}"
        data = {
            "type": "transaction",
            "transaction_id": str(transaction_data['id']),
            "amount": str(transaction_data['amount']),
            "merchant": merchant
        }

        await self.send_push_notification(
            user_id,
            title,
            body,
            data,
            NotificationType.TRANSACTION,
            "high"
        )

    async def send_budget_alert(self, user_id: int, budget_data: Dict[str, Any]):
        """Send push notification for budget threshold."""
        category = budget_data['category']
        percentage = budget_data['percentage']
        
        title = f"Budget Alert: {category}"
        body = f"You've used {percentage}% of your {category} budget"
        data = {
            "type": "budget",
            "category": category,
            "percentage": str(percentage)
        }

        await self.send_push_notification(
            user_id,
            title,
            body,
            data,
            NotificationType.BUDGET_ALERT,
            "high"
        )

    async def send_bill_reminder(self, user_id: int, bill_data: Dict[str, Any]):
        """Send push notification for upcoming bill."""
        amount = f"${bill_data['amount']:.2f}"
        due_date = bill_data['due_date'].strftime("%B %d")
        payee = bill_data.get('payee', 'Unknown payee')
        
        title = f"Upcoming Bill: {amount}"
        body = f"{payee} payment due on {due_date}"
        data = {
            "type": "bill",
            "bill_id": str(bill_data['id']),
            "amount": str(bill_data['amount']),
            "due_date": bill_data['due_date'].isoformat()
        }

        await self.send_push_notification(
            user_id,
            title,
            body,
            data,
            NotificationType.BILL_REMINDER,
            "normal"
        )

    async def send_savings_milestone(self, user_id: int, goal_data: Dict[str, Any]):
        """Send push notification for savings goal milestone."""
        goal_name = goal_data['name']
        percentage = goal_data['percentage']
        
        title = f"Savings Goal: {goal_name}"
        body = f"Congratulations! You've reached {percentage}% of your goal"
        data = {
            "type": "savings",
            "goal_id": str(goal_data['id']),
            "percentage": str(percentage)
        }

        await self.send_push_notification(
            user_id,
            title,
            body,
            data,
            NotificationType.SAVINGS_MILESTONE,
            "normal"
        )

    async def send_investment_alert(self, user_id: int, investment_data: Dict[str, Any]):
        """Send push notification for investment alerts."""
        symbol = investment_data['symbol']
        change = investment_data['change']
        direction = "up" if change > 0 else "down"
        
        title = f"Investment Alert: {symbol}"
        body = f"{symbol} has moved {direction} by {abs(change)}%"
        data = {
            "type": "investment",
            "symbol": symbol,
            "change": str(change)
        }

        await self.send_push_notification(
            user_id,
            title,
            body,
            data,
            NotificationType.INVESTMENT_ALERT,
            "high"
        )

    async def send_security_alert(self, user_id: int, alert_data: Dict[str, Any]):
        """Send push notification for security alerts."""
        alert_type = alert_data['type']
        location = alert_data.get('location', 'Unknown location')
        
        title = "Security Alert"
        body = f"New {alert_type} detected from {location}"
        data = {
            "type": "security",
            "alert_type": alert_type,
            "location": location
        }

        await self.send_push_notification(
            user_id,
            title,
            body,
            data,
            NotificationType.SECURITY_ALERT,
            "high"
        )
