from sqlalchemy.orm import Session
from sqlalchemy import func, extract, and_
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from ..models.finance import Transaction, Budget, SavingsGoal, FinancialSnapshot
import plotly.graph_objects as go
import plotly.express as px
import plotly.subplots as sp
import pandas as pd
import numpy as np
from io import BytesIO
import base64

class VisualizationService:
    def __init__(self, db: Session):
        self.db = db

    def _fig_to_base64(self, fig) -> str:
        """Convert a plotly figure to base64 string."""
        buffer = BytesIO()
        fig.write_image(buffer, format="png")
        buffer.seek(0)
        return base64.b64encode(buffer.read()).decode()

    def spending_by_category(
        self,
        user_id: int,
        start_date: datetime,
        end_date: datetime,
        chart_type: str = "pie"
    ) -> Dict[str, Any]:
        """Generate spending by category visualization."""
        transactions = self.db.query(
            Transaction.category,
            func.sum(Transaction.amount).label('total')
        ).filter(
            Transaction.user_id == user_id,
            Transaction.type == 'expense',
            Transaction.date.between(start_date, end_date)
        ).group_by(Transaction.category).all()

        df = pd.DataFrame(transactions, columns=['category', 'total'])

        if chart_type == "pie":
            fig = px.pie(
                df,
                values='total',
                names='category',
                title='Spending by Category',
                hole=0.3
            )
        else:  # bar
            fig = px.bar(
                df,
                x='category',
                y='total',
                title='Spending by Category'
            )

        fig.update_layout(
            showlegend=True,
            plot_bgcolor='white',
            paper_bgcolor='white'
        )

        return {
            "type": chart_type,
            "data": df.to_dict('records'),
            "image": self._fig_to_base64(fig)
        }

    def income_vs_expenses(
        self,
        user_id: int,
        months: int = 12
    ) -> Dict[str, Any]:
        """Generate income vs expenses trend visualization."""
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=30 * months)

        transactions = self.db.query(
            extract('year', Transaction.date).label('year'),
            extract('month', Transaction.date).label('month'),
            Transaction.type,
            func.sum(Transaction.amount).label('total')
        ).filter(
            Transaction.user_id == user_id,
            Transaction.date.between(start_date, end_date)
        ).group_by(
            'year', 'month', Transaction.type
        ).all()

        df = pd.DataFrame(transactions, columns=['year', 'month', 'type', 'total'])
        df['date'] = pd.to_datetime(df[['year', 'month']].assign(day=1))

        # Pivot the data for plotting
        df_pivot = df.pivot(index='date', columns='type', values='total').fillna(0)
        df_pivot['net'] = df_pivot['income'] - df_pivot['expense']

        # Create the visualization
        fig = go.Figure()
        fig.add_trace(go.Bar(
            name='Income',
            x=df_pivot.index,
            y=df_pivot['income'],
            marker_color='green'
        ))
        fig.add_trace(go.Bar(
            name='Expenses',
            x=df_pivot.index,
            y=df_pivot['expense'],
            marker_color='red'
        ))
        fig.add_trace(go.Scatter(
            name='Net',
            x=df_pivot.index,
            y=df_pivot['net'],
            mode='lines+markers',
            line=dict(color='blue')
        ))

        fig.update_layout(
            title='Income vs Expenses Trend',
            barmode='group',
            xaxis_title='Month',
            yaxis_title='Amount ($)',
            plot_bgcolor='white',
            paper_bgcolor='white'
        )

        return {
            "type": "bar_line",
            "data": df_pivot.reset_index().to_dict('records'),
            "image": self._fig_to_base64(fig)
        }

    def budget_progress(
        self,
        user_id: int,
        month: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """Generate budget progress visualization."""
        if not month:
            month = datetime.utcnow().replace(day=1)

        next_month = (month + timedelta(days=32)).replace(day=1)

        # Get budgets and actual spending
        budgets = self.db.query(Budget).filter(
            Budget.user_id == user_id,
            Budget.start_date <= month,
            Budget.end_date >= next_month
        ).all()

        data = []
        for budget in budgets:
            spent = self.db.query(func.sum(Transaction.amount)).filter(
                Transaction.user_id == user_id,
                Transaction.category == budget.category,
                Transaction.type == 'expense',
                Transaction.date.between(month, next_month)
            ).scalar() or 0

            data.append({
                'category': budget.category,
                'budget': budget.amount,
                'spent': spent,
                'remaining': budget.amount - spent,
                'percentage': (spent / budget.amount * 100) if budget.amount > 0 else 0
            })

        df = pd.DataFrame(data)

        # Create stacked bar chart
        fig = go.Figure()
        fig.add_trace(go.Bar(
            name='Spent',
            x=df['category'],
            y=df['spent'],
            marker_color='red'
        ))
        fig.add_trace(go.Bar(
            name='Remaining',
            x=df['category'],
            y=df['remaining'],
            marker_color='green'
        ))

        fig.update_layout(
            title=f'Budget Progress - {month.strftime("%B %Y")}',
            barmode='stack',
            xaxis_title='Category',
            yaxis_title='Amount ($)',
            plot_bgcolor='white',
            paper_bgcolor='white'
        )

        return {
            "type": "stacked_bar",
            "data": df.to_dict('records'),
            "image": self._fig_to_base64(fig)
        }

    def savings_goals_progress(
        self,
        user_id: int
    ) -> Dict[str, Any]:
        """Generate savings goals progress visualization."""
        goals = self.db.query(SavingsGoal).filter(
            SavingsGoal.user_id == user_id
        ).all()

        data = []
        for goal in goals:
            progress = (goal.current_amount / goal.target_amount * 100) if goal.target_amount > 0 else 0
            data.append({
                'name': goal.name,
                'current': goal.current_amount,
                'target': goal.target_amount,
                'progress': progress
            })

        df = pd.DataFrame(data)

        # Create bullet chart
        fig = go.Figure()
        for idx, row in df.iterrows():
            fig.add_trace(go.Bar(
                name=row['name'],
                x=[row['current']],
                y=[idx],
                orientation='h',
                marker_color='blue',
                width=0.3,
                showlegend=False
            ))
            fig.add_trace(go.Bar(
                name=row['name'] + ' Target',
                x=[row['target']],
                y=[idx],
                orientation='h',
                marker_color='rgba(0,0,0,0.2)',
                width=0.3,
                showlegend=False
            ))

        fig.update_layout(
            title='Savings Goals Progress',
            xaxis_title='Amount ($)',
            yaxis=dict(
                ticktext=df['name'],
                tickvals=list(range(len(df))),
                showgrid=True
            ),
            plot_bgcolor='white',
            paper_bgcolor='white',
            height=100 + (len(df) * 50)  # Adjust height based on number of goals
        )

        return {
            "type": "bullet",
            "data": df.to_dict('records'),
            "image": self._fig_to_base64(fig)
        }

    def financial_health_dashboard(
        self,
        user_id: int
    ) -> Dict[str, Any]:
        """Generate comprehensive financial health dashboard."""
        # Get latest snapshot
        snapshot = self.db.query(FinancialSnapshot).filter(
            FinancialSnapshot.user_id == user_id
        ).order_by(FinancialSnapshot.date.desc()).first()

        # Calculate monthly averages
        last_6_months = datetime.utcnow() - timedelta(days=180)
        monthly_income = self.db.query(func.avg(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.type == 'income',
            Transaction.date >= last_6_months
        ).scalar() or 0

        monthly_expenses = self.db.query(func.avg(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.type == 'expense',
            Transaction.date >= last_6_months
        ).scalar() or 0

        # Create subplot figure
        fig = sp.make_subplots(
            rows=2, cols=2,
            subplot_titles=(
                'Net Worth Trend',
                'Monthly Cash Flow',
                'Debt-to-Income Ratio',
                'Emergency Fund'
            )
        )

        # Net Worth gauge
        fig.add_trace(
            go.Indicator(
                mode="number+delta",
                value=snapshot.net_worth if snapshot else 0,
                delta={'reference': snapshot.previous_net_worth if snapshot else 0},
                title={'text': "Net Worth"},
            ),
            row=1, col=1
        )

        # Monthly Cash Flow
        fig.add_trace(
            go.Bar(
                x=['Income', 'Expenses'],
                y=[monthly_income, monthly_expenses],
                marker_color=['green', 'red']
            ),
            row=1, col=2
        )

        # Debt-to-Income gauge
        fig.add_trace(
            go.Indicator(
                mode="gauge+number",
                value=snapshot.debt_to_income_ratio if snapshot else 0,
                gauge={
                    'axis': {'range': [0, 100]},
                    'steps': [
                        {'range': [0, 30], 'color': "green"},
                        {'range': [30, 50], 'color': "yellow"},
                        {'range': [50, 100], 'color': "red"}
                    ],
                    'threshold': {
                        'line': {'color': "red", 'width': 4},
                        'thickness': 0.75,
                        'value': 43
                    }
                },
                title={'text': "Debt-to-Income Ratio (%)"}
            ),
            row=2, col=1
        )

        # Emergency Fund gauge
        fig.add_trace(
            go.Indicator(
                mode="gauge+number",
                value=snapshot.emergency_fund_ratio if snapshot else 0,
                gauge={
                    'axis': {'range': [0, 6]},
                    'steps': [
                        {'range': [0, 3], 'color': "red"},
                        {'range': [3, 6], 'color': "green"}
                    ],
                    'threshold': {
                        'line': {'color': "green", 'width': 4},
                        'thickness': 0.75,
                        'value': 6
                    }
                },
                title={'text': "Emergency Fund (months)"}
            ),
            row=2, col=2
        )

        fig.update_layout(
            title='Financial Health Dashboard',
            showlegend=False,
            plot_bgcolor='white',
            paper_bgcolor='white',
            height=800
        )

        return {
            "type": "dashboard",
            "data": {
                "net_worth": snapshot.net_worth if snapshot else 0,
                "net_worth_change": (snapshot.net_worth - snapshot.previous_net_worth) if snapshot else 0,
                "monthly_income": monthly_income,
                "monthly_expenses": monthly_expenses,
                "debt_to_income": snapshot.debt_to_income_ratio if snapshot else 0,
                "emergency_fund": snapshot.emergency_fund_ratio if snapshot else 0
            },
            "image": self._fig_to_base64(fig)
        }
