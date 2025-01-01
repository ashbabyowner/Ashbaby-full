from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from ..database import get_db
from ..models.finance import Transaction, Budget, SavingsGoal, SavingsContribution, FinancialSnapshot
from ..schemas.finance import (
    TransactionCreate, Transaction as TransactionSchema,
    BudgetCreate, Budget as BudgetSchema,
    SavingsGoalCreate, SavingsGoal as SavingsGoalSchema,
    SavingsContributionCreate, SavingsContribution as SavingsContributionSchema,
    FinancialSnapshotCreate, FinancialSnapshot as FinancialSnapshotSchema,
    MonthlyTotal, CategoryTotal, BudgetProgress, FinancialSummary
)
from ..auth import get_current_user
from sqlalchemy import func, extract
from ..websocket_manager import manager
from fastapi.responses import StreamingResponse
from ..report_generator import ReportGenerator
from ..services.recurring_transactions import RecurringTransactionService
from ..schemas.recurring_transactions import (
    RecurringTransactionCreate, RecurringTransaction, RecurringTransactionUpdate
)

router = APIRouter()

# Transaction endpoints
@router.post("/transactions/", response_model=TransactionSchema)
async def create_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    db_transaction = Transaction(**transaction.dict(), user_id=current_user.id)
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    
    # Notify via WebSocket
    await manager.send_personal_message(
        {
            "type": "transaction_created",
            "data": TransactionSchema.from_orm(db_transaction).dict()
        },
        str(current_user.id)
    )
    
    return db_transaction

@router.get("/transactions/", response_model=List[TransactionSchema])
def get_transactions(
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    category: Optional[str] = None,
    type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)
    if category:
        query = query.filter(Transaction.category == category)
    if type:
        query = query.filter(Transaction.type == type)
    
    return query.order_by(Transaction.date.desc()).offset(skip).limit(limit).all()

@router.get("/transactions/{transaction_id}", response_model=TransactionSchema)
def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction

@router.put("/transactions/{transaction_id}", response_model=TransactionSchema)
async def update_transaction(
    transaction_id: int,
    transaction_update: TransactionCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    db_transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    for key, value in transaction_update.dict().items():
        setattr(db_transaction, key, value)
    
    db.commit()
    db.refresh(db_transaction)
    
    # Notify via WebSocket
    await manager.send_personal_message(
        {
            "type": "transaction_updated",
            "data": TransactionSchema.from_orm(db_transaction).dict()
        },
        str(current_user.id)
    )
    
    return db_transaction

@router.delete("/transactions/{transaction_id}")
async def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    db.delete(transaction)
    db.commit()
    
    # Notify via WebSocket
    await manager.send_personal_message(
        {
            "type": "transaction_deleted",
            "data": {"id": transaction_id}
        },
        str(current_user.id)
    )
    
    return {"message": "Transaction deleted"}

# Budget endpoints
@router.post("/budgets/", response_model=BudgetSchema)
async def create_budget(
    budget: BudgetCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    db_budget = Budget(**budget.dict(), user_id=current_user.id)
    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)
    
    # Notify via WebSocket
    await manager.send_personal_message(
        {
            "type": "budget_created",
            "data": BudgetSchema.from_orm(db_budget).dict()
        },
        str(current_user.id)
    )
    
    return db_budget

@router.get("/budgets/", response_model=List[BudgetSchema])
def get_budgets(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return db.query(Budget).filter(Budget.user_id == current_user.id).all()

@router.get("/budgets/progress", response_model=List[BudgetProgress])
def get_budget_progress(
    month: Optional[int] = None,
    year: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if not month:
        month = datetime.now().month
    if not year:
        year = datetime.now().year

    budgets = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.start_date <= datetime(year, month, 1),
        Budget.end_date >= datetime(year, month + 1, 1) - timedelta(days=1)
    ).all()

    progress = []
    for budget in budgets:
        spent = db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == current_user.id,
            Transaction.category == budget.category,
            Transaction.type == "expense",
            extract('month', Transaction.date) == month,
            extract('year', Transaction.date) == year
        ).scalar() or 0

        remaining = budget.amount - spent
        percentage = (spent / budget.amount) * 100 if budget.amount > 0 else 0
        
        status = "on_track"
        if percentage >= 100:
            status = "exceeded"
        elif percentage >= budget.alert_threshold * 100:
            status = "warning"

        progress.append(BudgetProgress(
            category=budget.category,
            budget_amount=budget.amount,
            spent_amount=spent,
            remaining_amount=remaining,
            percentage_used=percentage,
            status=status
        ))

    return progress

# Savings Goals endpoints
@router.post("/savings-goals/", response_model=SavingsGoalSchema)
async def create_savings_goal(
    goal: SavingsGoalCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    db_goal = SavingsGoal(**goal.dict(), user_id=current_user.id)
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    
    # Notify via WebSocket
    await manager.send_personal_message(
        {
            "type": "savings_goal_created",
            "data": SavingsGoalSchema.from_orm(db_goal).dict()
        },
        str(current_user.id)
    )
    
    return db_goal

@router.get("/savings-goals/", response_model=List[SavingsGoalSchema])
def get_savings_goals(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return db.query(SavingsGoal).filter(SavingsGoal.user_id == current_user.id).all()

@router.post("/savings-goals/{goal_id}/contributions/", response_model=SavingsContributionSchema)
async def add_contribution(
    goal_id: int,
    contribution: SavingsContributionCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    goal = db.query(SavingsGoal).filter(
        SavingsGoal.id == goal_id,
        SavingsGoal.user_id == current_user.id
    ).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Savings goal not found")

    db_contribution = SavingsContribution(**contribution.dict(), goal_id=goal_id)
    db.add(db_contribution)
    
    # Update goal progress
    goal.current_amount += contribution.amount
    
    db.commit()
    db.refresh(db_contribution)
    
    # Notify via WebSocket
    await manager.send_personal_message(
        {
            "type": "contribution_added",
            "data": {
                "contribution": SavingsContributionSchema.from_orm(db_contribution).dict(),
                "goal": SavingsGoalSchema.from_orm(goal).dict()
            }
        },
        str(current_user.id)
    )
    
    return db_contribution

# Recurring Transactions
@router.post("/recurring-transactions", response_model=schemas.RecurringTransaction)
async def create_recurring_transaction(
    transaction: schemas.RecurringTransactionCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    recurring_service = RecurringTransactionService(db)
    return recurring_service.create_recurring_transaction(current_user.id, transaction)

@router.get("/recurring-transactions", response_model=List[schemas.RecurringTransaction])
async def get_recurring_transactions(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    recurring_service = RecurringTransactionService(db)
    return recurring_service.get_user_recurring_transactions(current_user.id)

@router.get("/recurring-transactions/{transaction_id}", response_model=schemas.RecurringTransaction)
async def get_recurring_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    recurring_service = RecurringTransactionService(db)
    return recurring_service.get_recurring_transaction(transaction_id, current_user.id)

@router.put("/recurring-transactions/{transaction_id}", response_model=schemas.RecurringTransaction)
async def update_recurring_transaction(
    transaction_id: int,
    updates: schemas.RecurringTransactionUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    recurring_service = RecurringTransactionService(db)
    return recurring_service.update_recurring_transaction(transaction_id, current_user.id, updates)

@router.delete("/recurring-transactions/{transaction_id}")
async def delete_recurring_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    recurring_service = RecurringTransactionService(db)
    recurring_service.delete_recurring_transaction(transaction_id, current_user.id)
    return {"status": "success"}

# Background task to process recurring transactions
@router.post("/recurring-transactions/process")
async def process_recurring_transactions(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Process all due recurring transactions. This endpoint should be called by a scheduled task."""
    recurring_service = RecurringTransactionService(db)
    recurring_service.process_due_transactions()
    return {"status": "success"}

# Financial Summary endpoints
@router.get("/summary", response_model=FinancialSummary)
def get_financial_summary(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if not start_date:
        start_date = datetime.now() - timedelta(days=365)
    if not end_date:
        end_date = datetime.now()

    # Calculate totals
    income = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == "income",
        Transaction.date.between(start_date, end_date)
    ).scalar() or 0

    expenses = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == "expense",
        Transaction.date.between(start_date, end_date)
    ).scalar() or 0

    # Get latest financial snapshot
    snapshot = db.query(FinancialSnapshot).filter(
        FinancialSnapshot.user_id == current_user.id
    ).order_by(FinancialSnapshot.date.desc()).first()

    # Calculate monthly totals
    monthly_totals = []
    current_date = start_date
    while current_date <= end_date:
        month_start = datetime(current_date.year, current_date.month, 1)
        month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)

        month_income = db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == current_user.id,
            Transaction.type == "income",
            Transaction.date.between(month_start, month_end)
        ).scalar() or 0

        month_expenses = db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == current_user.id,
            Transaction.type == "expense",
            Transaction.date.between(month_start, month_end)
        ).scalar() or 0

        monthly_totals.append(MonthlyTotal(
            month=month_start,
            income=month_income,
            expenses=month_expenses,
            savings=month_income - month_expenses,
            net=month_income - month_expenses
        ))

        current_date = (month_start + timedelta(days=32)).replace(day=1)

    # Get category totals
    category_totals = []
    total_amount = expenses  # Use expenses for percentage calculation
    categories = db.query(
        Transaction.category,
        func.sum(Transaction.amount).label('amount'),
        func.count(Transaction.id).label('count')
    ).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == "expense",
        Transaction.date.between(start_date, end_date)
    ).group_by(Transaction.category).all()

    for category in categories:
        category_totals.append(CategoryTotal(
            category=category.category,
            amount=category.amount,
            percentage=(category.amount / total_amount * 100) if total_amount > 0 else 0,
            transaction_count=category.count
        ))

    # Get budget progress
    budget_progress = get_budget_progress(
        month=datetime.now().month,
        year=datetime.now().year,
        db=db,
        current_user=current_user
    )

    # Get savings goals progress
    savings_goals = get_savings_goals(db=db, current_user=current_user)

    return FinancialSummary(
        total_income=income,
        total_expenses=expenses,
        total_savings=income - expenses,
        net_worth=snapshot.net_worth if snapshot else 0,
        monthly_totals=monthly_totals,
        category_totals=category_totals,
        budget_progress=budget_progress,
        savings_goals_progress=savings_goals
    )

# Visualization endpoints
@router.get("/visualizations/spending-by-category")
async def get_spending_by_category(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    chart_type: str = "pie",
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get spending by category visualization."""
    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=30)
    if not end_date:
        end_date = datetime.utcnow()

    visualization_service = VisualizationService(db)
    return visualization_service.spending_by_category(
        current_user.id,
        start_date,
        end_date,
        chart_type
    )

@router.get("/visualizations/income-vs-expenses")
async def get_income_vs_expenses(
    months: int = Query(12, ge=1, le=60),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get income vs expenses trend visualization."""
    visualization_service = VisualizationService(db)
    return visualization_service.income_vs_expenses(current_user.id, months)

@router.get("/visualizations/budget-progress")
async def get_budget_progress(
    month: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get budget progress visualization."""
    visualization_service = VisualizationService(db)
    return visualization_service.budget_progress(current_user.id, month)

@router.get("/visualizations/savings-goals")
async def get_savings_goals_progress(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get savings goals progress visualization."""
    visualization_service = VisualizationService(db)
    return visualization_service.savings_goals_progress(current_user.id)

@router.get("/visualizations/financial-health")
async def get_financial_health_dashboard(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get comprehensive financial health dashboard."""
    visualization_service = VisualizationService(db)
    return visualization_service.financial_health_dashboard(current_user.id)

# Export endpoints
@router.get("/export/transactions")
async def export_transactions(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    format: str = "excel",
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if not start_date:
        start_date = datetime.now() - timedelta(days=30)
    if not end_date:
        end_date = datetime.now()

    report_generator = ReportGenerator(db, current_user.id)
    
    if format == "excel":
        output = report_generator.generate_transaction_excel(start_date, end_date)
        headers = {
            'Content-Disposition': f'attachment; filename="transactions_{start_date.strftime("%Y%m%d")}_{end_date.strftime("%Y%m%d")}.xlsx"'
        }
        return StreamingResponse(output, headers=headers, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    else:
        raise HTTPException(status_code=400, detail="Unsupported format")

@router.get("/export/budget-report")
async def export_budget_report(
    format: str = "pdf",
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    report_generator = ReportGenerator(db, current_user.id)
    
    if format == "pdf":
        start_date = datetime.now().replace(day=1)
        end_date = (start_date + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        output = report_generator.generate_pdf_report(
            start_date,
            end_date,
            include_sections=['budgets']
        )
        headers = {
            'Content-Disposition': f'attachment; filename="budget_report_{start_date.strftime("%Y%m")}.pdf"'
        }
        return StreamingResponse(output, headers=headers, media_type='application/pdf')
    elif format == "json":
        return report_generator.generate_budget_report()
    else:
        raise HTTPException(status_code=400, detail="Unsupported format")

@router.get("/export/savings-report")
async def export_savings_report(
    format: str = "pdf",
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    report_generator = ReportGenerator(db, current_user.id)
    
    if format == "pdf":
        start_date = datetime.now() - timedelta(days=180)
        end_date = datetime.now()
        output = report_generator.generate_pdf_report(
            start_date,
            end_date,
            include_sections=['savings']
        )
        headers = {
            'Content-Disposition': f'attachment; filename="savings_report_{end_date.strftime("%Y%m%d")}.pdf"'
        }
        return StreamingResponse(output, headers=headers, media_type='application/pdf')
    elif format == "json":
        return report_generator.generate_savings_report()
    else:
        raise HTTPException(status_code=400, detail="Unsupported format")

@router.get("/export/financial-health")
async def export_financial_health(
    format: str = "pdf",
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    report_generator = ReportGenerator(db, current_user.id)
    
    if format == "pdf":
        start_date = datetime.now() - timedelta(days=365)
        end_date = datetime.now()
        output = report_generator.generate_pdf_report(
            start_date,
            end_date,
            include_sections=['health']
        )
        headers = {
            'Content-Disposition': f'attachment; filename="financial_health_{end_date.strftime("%Y%m%d")}.pdf"'
        }
        return StreamingResponse(output, headers=headers, media_type='application/pdf')
    elif format == "json":
        return report_generator.generate_financial_health_report()
    else:
        raise HTTPException(status_code=400, detail="Unsupported format")

@router.get("/export/complete-report")
async def export_complete_report(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if not start_date:
        start_date = datetime.now() - timedelta(days=30)
    if not end_date:
        end_date = datetime.now()

    report_generator = ReportGenerator(db, current_user.id)
    output = report_generator.generate_pdf_report(
        start_date,
        end_date,
        include_sections=['transactions', 'budgets', 'savings', 'health']
    )
    
    headers = {
        'Content-Disposition': f'attachment; filename="financial_report_{start_date.strftime("%Y%m%d")}_{end_date.strftime("%Y%m%d")}.pdf"'
    }
    return StreamingResponse(output, headers=headers, media_type='application/pdf')
