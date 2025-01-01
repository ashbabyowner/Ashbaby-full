import os
from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import EmailStr
from jinja2 import Environment, select_autoescape, PackageLoader
from pathlib import Path
import aiofiles
from ..models.notification import NotificationPreference, NotificationType
from .report_generator import ReportGenerator
from .visualization import VisualizationService

class EmailService:
    def __init__(self):
        self.config = ConnectionConfig(
            MAIL_USERNAME=os.getenv("SMTP_USERNAME"),
            MAIL_PASSWORD=os.getenv("SMTP_PASSWORD"),
            MAIL_FROM=os.getenv("EMAIL_FROM"),
            MAIL_PORT=int(os.getenv("SMTP_PORT", "587")),
            MAIL_SERVER=os.getenv("SMTP_SERVER"),
            MAIL_FROM_NAME="AI Support App",
            MAIL_STARTTLS=True,
            MAIL_SSL_TLS=False,
            USE_CREDENTIALS=True,
            TEMPLATE_FOLDER=Path(__file__).parent.parent / "templates" / "email"
        )
        
        self.fast_mail = FastMail(self.config)
        self.env = Environment(
            loader=PackageLoader("app", "templates/email"),
            autoescape=select_autoescape(['html', 'xml'])
        )

    async def send_report(
        self,
        email: EmailStr,
        report_type: str,
        data: Dict[str, Any],
        attachments: Optional[List[Dict[str, Any]]] = None
    ) -> None:
        """Send a report email with optional attachments."""
        template = self.env.get_template(f"{report_type}.html")
        html_content = template.render(**data)

        message = MessageSchema(
            subject=f"Your {report_type.replace('_', ' ').title()} Report",
            recipients=[email],
            body=html_content,
            subtype="html"
        )

        if attachments:
            message.attachments = attachments

        await self.fast_mail.send_message(message)

    async def send_weekly_summary(
        self,
        email: EmailStr,
        user_id: int,
        db_session
    ) -> None:
        """Send weekly financial summary email."""
        # Generate visualizations
        viz_service = VisualizationService(db_session)
        report_gen = ReportGenerator(db_session, user_id)

        # Get data for the report
        spending_data = viz_service.spending_by_category(
            user_id,
            datetime.utcnow().replace(day=1),
            datetime.utcnow()
        )
        
        income_expenses = viz_service.income_vs_expenses(user_id, months=1)
        budget_progress = viz_service.budget_progress(user_id)
        savings_progress = viz_service.savings_goals_progress(user_id)
        
        # Prepare email data
        data = {
            "spending_chart": spending_data["image"],
            "income_expenses_chart": income_expenses["image"],
            "budget_chart": budget_progress["image"],
            "savings_chart": savings_progress["image"],
            "summary": {
                "total_income": income_expenses["data"][-1]["income"],
                "total_expenses": income_expenses["data"][-1]["expense"],
                "net_savings": income_expenses["data"][-1]["net"],
                "top_spending_category": max(
                    spending_data["data"],
                    key=lambda x: x["total"]
                )["category"]
            }
        }

        # Generate PDF report
        pdf_report = report_gen.generate_pdf_report(
            datetime.utcnow().replace(day=1),
            datetime.utcnow(),
            include_sections=['transactions', 'budgets', 'savings', 'health']
        )

        # Send email with attachment
        await self.send_report(
            email,
            "weekly_summary",
            data,
            attachments=[{
                "file": pdf_report,
                "filename": f"financial_summary_{datetime.utcnow().strftime('%Y%m%d')}.pdf",
                "content_type": "application/pdf"
            }]
        )

    async def send_monthly_report(
        self,
        email: EmailStr,
        user_id: int,
        db_session
    ) -> None:
        """Send monthly financial report email."""
        report_gen = ReportGenerator(db_session, user_id)
        viz_service = VisualizationService(db_session)

        # Generate comprehensive dashboard
        dashboard = viz_service.financial_health_dashboard(user_id)

        # Get monthly data
        start_date = datetime.utcnow().replace(day=1)
        end_date = datetime.utcnow()

        data = {
            "dashboard_image": dashboard["image"],
            "metrics": dashboard["data"],
            "month": start_date.strftime("%B %Y"),
            "summary": report_gen.generate_financial_health_report()
        }

        # Generate detailed PDF report
        pdf_report = report_gen.generate_pdf_report(
            start_date,
            end_date,
            include_sections=['transactions', 'budgets', 'savings', 'health']
        )

        # Send email with attachment
        await self.send_report(
            email,
            "monthly_report",
            data,
            attachments=[{
                "file": pdf_report,
                "filename": f"monthly_report_{start_date.strftime('%Y%m')}.pdf",
                "content_type": "application/pdf"
            }]
        )

    async def send_budget_alert(
        self,
        email: EmailStr,
        category: str,
        spent: float,
        budget: float,
        user_id: int,
        db_session
    ) -> None:
        """Send budget alert email."""
        viz_service = VisualizationService(db_session)
        
        # Get category spending visualization
        spending_data = viz_service.spending_by_category(
            user_id,
            datetime.utcnow().replace(day=1),
            datetime.utcnow()
        )

        data = {
            "category": category,
            "spent": spent,
            "budget": budget,
            "percentage": (spent / budget) * 100,
            "spending_chart": spending_data["image"]
        }

        await self.send_report(email, "budget_alert", data)

    async def send_savings_milestone(
        self,
        email: EmailStr,
        goal_name: str,
        current_amount: float,
        target_amount: float,
        user_id: int,
        db_session
    ) -> None:
        """Send savings milestone email."""
        viz_service = VisualizationService(db_session)
        
        # Get savings goals visualization
        savings_data = viz_service.savings_goals_progress(user_id)

        data = {
            "goal_name": goal_name,
            "current_amount": current_amount,
            "target_amount": target_amount,
            "percentage": (current_amount / target_amount) * 100,
            "savings_chart": savings_data["image"]
        }

        await self.send_report(email, "savings_milestone", data)

    async def send_financial_health_alert(
        self,
        email: EmailStr,
        metric: str,
        value: float,
        threshold: float,
        message: str,
        user_id: int,
        db_session
    ) -> None:
        """Send financial health alert email."""
        viz_service = VisualizationService(db_session)
        
        # Get financial health dashboard
        dashboard = viz_service.financial_health_dashboard(user_id)

        data = {
            "metric": metric,
            "value": value,
            "threshold": threshold,
            "message": message,
            "dashboard_image": dashboard["image"]
        }

        await self.send_report(email, "financial_health_alert", data)
