from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class TransactionType(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"
    TRANSFER = "transfer"

class TransactionCategory(str, Enum):
    SALARY = "salary"
    INVESTMENT = "investment"
    FOOD = "food"
    TRANSPORT = "transport"
    HOUSING = "housing"
    UTILITIES = "utilities"
    ENTERTAINMENT = "entertainment"
    HEALTHCARE = "healthcare"
    EDUCATION = "education"
    SHOPPING = "shopping"
    OTHER = "other"

class RecurrenceType(str, Enum):
    NONE = "none"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"

class RecurrenceInterval(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"

class TransactionBase(BaseModel):
    type: TransactionType
    category: TransactionCategory
    amount: float = Field(..., gt=0)
    description: str
    date: datetime
    recurrence: Optional[RecurrenceType] = RecurrenceType.NONE
    recurrence_end_date: Optional[datetime] = None
    metadata: Optional[Dict[str, Any]] = None

class TransactionCreate(TransactionBase):
    pass

class Transaction(TransactionBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class BudgetBase(BaseModel):
    category: TransactionCategory
    amount: float = Field(..., gt=0)
    start_date: datetime
    end_date: datetime
    rollover: Optional[bool] = False
    notifications: Optional[bool] = True
    alert_threshold: Optional[float] = 0.8

class BudgetCreate(BudgetBase):
    pass

class Budget(BudgetBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class SavingsGoalBase(BaseModel):
    name: str
    target_amount: float = Field(..., gt=0)
    current_amount: Optional[float] = 0
    start_date: datetime
    target_date: datetime
    category: Optional[str] = None
    priority: Optional[int] = None
    auto_save: Optional[bool] = False
    auto_save_amount: Optional[float] = None
    auto_save_frequency: Optional[RecurrenceType] = None
    notes: Optional[str] = None

class SavingsGoalCreate(SavingsGoalBase):
    pass

class SavingsGoal(SavingsGoalBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class SavingsContributionBase(BaseModel):
    amount: float = Field(..., gt=0)
    date: datetime
    notes: Optional[str] = None
    transaction_id: Optional[int] = None

class SavingsContributionCreate(SavingsContributionBase):
    goal_id: int

class SavingsContribution(SavingsContributionBase):
    id: int
    goal_id: int
    created_at: datetime

    class Config:
        orm_mode = True

class FinancialSnapshotBase(BaseModel):
    date: datetime
    total_assets: float
    total_liabilities: float
    net_worth: float
    savings_rate: float
    debt_to_income_ratio: float
    emergency_fund_ratio: float
    metrics: Optional[Dict[str, Any]] = None

class FinancialSnapshotCreate(FinancialSnapshotBase):
    pass

class FinancialSnapshot(FinancialSnapshotBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        orm_mode = True

class RecurringTransactionBase(BaseModel):
    description: str
    amount: float
    type: str
    category: str
    interval: RecurrenceInterval
    start_date: datetime
    end_date: Optional[datetime] = None
    is_active: bool = True

class RecurringTransactionCreate(RecurringTransactionBase):
    pass

class RecurringTransactionUpdate(BaseModel):
    description: Optional[str] = None
    amount: Optional[float] = None
    type: Optional[str] = None
    category: Optional[str] = None
    interval: Optional[RecurrenceInterval] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: Optional[bool] = None

class RecurringTransaction(RecurringTransactionBase):
    id: int
    user_id: int
    last_generated: datetime
    next_due: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

# Response models for aggregated data
class MonthlyTotal(BaseModel):
    month: datetime
    income: float
    expenses: float
    savings: float
    net: float

class CategoryTotal(BaseModel):
    category: TransactionCategory
    amount: float
    percentage: float
    transaction_count: int

class BudgetProgress(BaseModel):
    category: TransactionCategory
    budget_amount: float
    spent_amount: float
    remaining_amount: float
    percentage_used: float
    status: str  # "on_track", "warning", "exceeded"

class FinancialSummary(BaseModel):
    total_income: float
    total_expenses: float
    total_savings: float
    net_worth: float
    monthly_totals: List[MonthlyTotal]
    category_totals: List[CategoryTotal]
    budget_progress: List[BudgetProgress]
    savings_goals_progress: List[SavingsGoal]
