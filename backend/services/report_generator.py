import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from io import BytesIO
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List, Dict, Any, Optional
from ..models.finance import Transaction, Budget, SavingsGoal, FinancialSnapshot
from ..schemas.finance import TransactionCategory
import jinja2
import pdfkit
import json

class ReportGenerator:
    def __init__(self, db: Session, user_id: int):
        self.db = db
        self.user_id = user_id
        self.env = jinja2.Environment(
            loader=jinja2.FileSystemLoader('templates/reports')
        )

    def generate_transaction_excel(
        self,
        start_date: datetime,
        end_date: datetime
    ) -> BytesIO:
        """Generate an Excel report of transactions."""
        transactions = self.db.query(Transaction).filter(
            Transaction.user_id == self.user_id,
            Transaction.date.between(start_date, end_date)
        ).all()

        # Convert to DataFrame
        df = pd.DataFrame([{
            'Date': t.date,
            'Type': t.type,
            'Category': t.category,
            'Amount': t.amount,
            'Description': t.description
        } for t in transactions])

        # Add summary statistics
        summary = pd.DataFrame([{
            'Total Income': df[df['Type'] == 'income']['Amount'].sum(),
            'Total Expenses': df[df['Type'] == 'expense']['Amount'].sum(),
            'Net': df[df['Type'] == 'income']['Amount'].sum() - df[df['Type'] == 'expense']['Amount'].sum()
        }])

        # Create Excel writer
        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Transactions', index=False)
            summary.to_excel(writer, sheet_name='Summary', index=False)

        output.seek(0)
        return output

    def generate_budget_report(self) -> dict:
        """Generate a budget analysis report."""
        current_month = datetime.now().replace(day=1)
        next_month = (current_month + timedelta(days=32)).replace(day=1)

        budgets = self.db.query(Budget).filter(
            Budget.user_id == self.user_id,
            Budget.start_date <= current_month,
            Budget.end_date >= next_month
        ).all()

        report_data = []
        for budget in budgets:
            spent = self.db.query(func.sum(Transaction.amount)).filter(
                Transaction.user_id == self.user_id,
                Transaction.category == budget.category,
                Transaction.type == 'expense',
                Transaction.date.between(current_month, next_month)
            ).scalar() or 0

            report_data.append({
                'category': budget.category,
                'budget_amount': budget.amount,
                'spent_amount': spent,
                'remaining': budget.amount - spent,
                'percentage_used': (spent / budget.amount * 100) if budget.amount > 0 else 0
            })

        return {
            'month': current_month.strftime('%B %Y'),
            'budgets': report_data,
            'total_budget': sum(b['budget_amount'] for b in report_data),
            'total_spent': sum(b['spent_amount'] for b in report_data)
        }

    def generate_savings_report(self) -> dict:
        """Generate a savings goals progress report."""
        goals = self.db.query(SavingsGoal).filter(
            SavingsGoal.user_id == self.user_id
        ).all()

        report_data = []
        for goal in goals:
            progress = (goal.current_amount / goal.target_amount * 100) if goal.target_amount > 0 else 0
            remaining_days = (goal.target_date - datetime.now()).days
            monthly_needed = ((goal.target_amount - goal.current_amount) / remaining_days * 30) if remaining_days > 0 else 0

            report_data.append({
                'name': goal.name,
                'target': goal.target_amount,
                'current': goal.current_amount,
                'progress': progress,
                'remaining_days': remaining_days,
                'monthly_needed': monthly_needed
            })

        return {
            'goals': report_data,
            'total_saved': sum(g['current'] for g in report_data),
            'total_target': sum(g['target'] for g in report_data)
        }

    def generate_financial_health_report(self) -> dict:
        """Generate a comprehensive financial health report."""
        # Get latest snapshot
        snapshot = self.db.query(FinancialSnapshot).filter(
            FinancialSnapshot.user_id == self.user_id
        ).order_by(FinancialSnapshot.date.desc()).first()

        # Calculate monthly averages
        last_6_months = datetime.now() - timedelta(days=180)
        monthly_income = self.db.query(func.avg(Transaction.amount)).filter(
            Transaction.user_id == self.user_id,
            Transaction.type == 'income',
            Transaction.date >= last_6_months
        ).scalar() or 0

        monthly_expenses = self.db.query(func.avg(Transaction.amount)).filter(
            Transaction.user_id == self.user_id,
            Transaction.type == 'expense',
            Transaction.date >= last_6_months
        ).scalar() or 0

        return {
            'net_worth': snapshot.net_worth if snapshot else 0,
            'debt_to_income': snapshot.debt_to_income_ratio if snapshot else 0,
            'emergency_fund_months': snapshot.emergency_fund_ratio if snapshot else 0,
            'monthly_income': monthly_income,
            'monthly_expenses': monthly_expenses,
            'savings_rate': ((monthly_income - monthly_expenses) / monthly_income * 100) if monthly_income > 0 else 0
        }

    def generate_pdf_report(
        self,
        start_date: datetime,
        end_date: datetime,
        include_sections: List[str] = ['transactions', 'budgets', 'savings', 'health']
    ) -> BytesIO:
        """Generate a comprehensive PDF report."""
        data = {
            'generated_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'period': f"{start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}"
        }

        if 'transactions' in include_sections:
            transactions = self.db.query(Transaction).filter(
                Transaction.user_id == self.user_id,
                Transaction.date.between(start_date, end_date)
            ).all()
            data['transactions'] = [{
                'date': t.date.strftime('%Y-%m-%d'),
                'type': t.type,
                'category': t.category,
                'amount': t.amount,
                'description': t.description
            } for t in transactions]

        if 'budgets' in include_sections:
            data['budget_report'] = self.generate_budget_report()

        if 'savings' in include_sections:
            data['savings_report'] = self.generate_savings_report()

        if 'health' in include_sections:
            data['health_report'] = self.generate_financial_health_report()

        # Generate charts
        if 'transactions' in include_sections:
            self._generate_transaction_charts(data['transactions'])

        # Render template
        template = self.env.get_template('financial_report.html')
        html = template.render(data=data)

        # Convert to PDF
        pdf_options = {
            'page-size': 'A4',
            'margin-top': '0.75in',
            'margin-right': '0.75in',
            'margin-bottom': '0.75in',
            'margin-left': '0.75in',
        }
        pdf = pdfkit.from_string(html, False, options=pdf_options)
        
        output = BytesIO(pdf)
        output.seek(0)
        return output

    def _generate_transaction_charts(self, transactions: List[Dict[str, Any]]) -> None:
        """Generate charts for transaction analysis."""
        df = pd.DataFrame(transactions)
        
        # Income vs Expenses by Month
        monthly = df.groupby([pd.to_datetime(df['date']).dt.to_period('M'), 'type'])['amount'].sum().unstack()
        fig = go.Figure(data=[
            go.Bar(name='Income', x=monthly.index.astype(str), y=monthly['income']),
            go.Bar(name='Expenses', x=monthly.index.astype(str), y=monthly['expense'])
        ])
        fig.update_layout(title='Monthly Income vs Expenses')
        fig.write_image('temp/monthly_comparison.png')

        # Expense Categories Pie Chart
        expenses = df[df['type'] == 'expense']
        fig = px.pie(expenses, values='amount', names='category', title='Expense Distribution')
        fig.write_image('temp/expense_distribution.png')
