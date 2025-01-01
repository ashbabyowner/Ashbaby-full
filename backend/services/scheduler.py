from fastapi import FastAPI
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy.orm import Session
from datetime import datetime
import logging
from ..database import SessionLocal
from .recurring_transactions import RecurringTransactionService
from .email_service import EmailService
from ..models.notification import NotificationPreference, NotificationType
from ..websocket_manager import manager

logger = logging.getLogger(__name__)

class SchedulerService:
    def __init__(self, app: FastAPI):
        self.app = app
        self.scheduler = AsyncIOScheduler()
        self.setup_jobs()

    def setup_jobs(self):
        """Set up all scheduled jobs."""
        # Process recurring transactions every hour
        self.scheduler.add_job(
            self.process_recurring_transactions,
            CronTrigger(minute=0),  # Run at the start of every hour
            id='process_recurring_transactions',
            name='Process recurring transactions',
            replace_existing=True
        )

        # Send weekly summaries on Monday at 8 AM
        self.scheduler.add_job(
            self.send_weekly_summaries,
            CronTrigger(day_of_week='mon', hour=8),
            id='send_weekly_summaries',
            name='Send weekly summaries',
            replace_existing=True
        )

        # Send monthly reports on the 1st of each month at 9 AM
        self.scheduler.add_job(
            self.send_monthly_reports,
            CronTrigger(day=1, hour=9),
            id='send_monthly_reports',
            name='Send monthly reports',
            replace_existing=True
        )

    async def process_recurring_transactions(self):
        """Process all due recurring transactions."""
        try:
            logger.info(f"Starting recurring transactions processing at {datetime.utcnow()}")
            db = SessionLocal()
            try:
                recurring_service = RecurringTransactionService(db)
                recurring_service.process_due_transactions()
                
                # Notify connected clients about the update
                await manager.broadcast_to_authenticated(
                    {"type": "RECURRING_TRANSACTIONS_PROCESSED"}
                )
                
                logger.info("Successfully processed recurring transactions")
            finally:
                db.close()
        except Exception as e:
            logger.error(f"Error processing recurring transactions: {str(e)}")
            # You might want to add error notification here

    async def send_weekly_summaries(self):
        """Send weekly summary emails to subscribed users."""
        try:
            logger.info(f"Starting weekly summary email distribution at {datetime.utcnow()}")
            db = SessionLocal()
            try:
                # Get users with email notifications enabled for weekly summaries
                preferences = db.query(NotificationPreference).filter(
                    NotificationPreference.notification_type == NotificationType.WEEKLY_SUMMARY,
                    NotificationPreference.email_enabled == True
                ).all()

                email_service = EmailService()
                for pref in preferences:
                    try:
                        user = db.query(User).filter(User.id == pref.user_id).first()
                        if user and user.email:
                            await email_service.send_weekly_summary(user.email, user.id, db)
                    except Exception as e:
                        logger.error(f"Error sending weekly summary to user {pref.user_id}: {str(e)}")

                logger.info("Successfully sent weekly summaries")
            finally:
                db.close()
        except Exception as e:
            logger.error(f"Error processing weekly summaries: {str(e)}")

    async def send_monthly_reports(self):
        """Send monthly report emails to subscribed users."""
        try:
            logger.info(f"Starting monthly report email distribution at {datetime.utcnow()}")
            db = SessionLocal()
            try:
                # Get users with email notifications enabled for monthly reports
                preferences = db.query(NotificationPreference).filter(
                    NotificationPreference.notification_type == NotificationType.MONTHLY_REPORT,
                    NotificationPreference.email_enabled == True
                ).all()

                email_service = EmailService()
                for pref in preferences:
                    try:
                        user = db.query(User).filter(User.id == pref.user_id).first()
                        if user and user.email:
                            await email_service.send_monthly_report(user.email, user.id, db)
                    except Exception as e:
                        logger.error(f"Error sending monthly report to user {pref.user_id}: {str(e)}")

                logger.info("Successfully sent monthly reports")
            finally:
                db.close()
        except Exception as e:
            logger.error(f"Error processing monthly reports: {str(e)}")

    def start(self):
        """Start the scheduler."""
        self.scheduler.start()
        logger.info("Scheduler started")
