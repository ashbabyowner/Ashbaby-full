from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .database import Base

class TransactionType(str, enum.Enum):
    INCOME = "income"
    EXPENSE = "expense"
    TRANSFER = "transfer"

class TransactionCategory(str, enum.Enum):
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

class RecurrenceType(str, enum.Enum):
    NONE = "none"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"

class RecurrenceInterval(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    BIWEEKLY = "biweekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(Enum(TransactionType))
    category = Column(Enum(TransactionCategory))
    amount = Column(Float)
    description = Column(String)
    date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    recurrence = Column(Enum(RecurrenceType), default=RecurrenceType.NONE)
    recurrence_end_date = Column(DateTime, nullable=True)
    metadata = Column(JSON, nullable=True)
    recurring_source_id = Column(Integer, ForeignKey("recurring_transactions.id"), nullable=True)
    recurring_source = relationship("RecurringTransaction", back_populates="generated_transactions")

    user = relationship("User", back_populates="transactions")

class RecurringTransaction(Base):
    __tablename__ = "recurring_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    description = Column(String)
    amount = Column(Float)
    type = Column(String)  # income or expense
    category = Column(String)
    interval = Column(Enum(RecurrenceInterval))
    start_date = Column(DateTime)
    end_date = Column(DateTime, nullable=True)
    last_generated = Column(DateTime)
    next_due = Column(DateTime)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="recurring_transactions")
    generated_transactions = relationship("Transaction", back_populates="recurring_source")

class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    category = Column(Enum(TransactionCategory))
    amount = Column(Float)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    rollover = Column(Boolean, default=False)
    notifications = Column(Boolean, default=True)
    alert_threshold = Column(Float, default=0.8)  # Alert at 80% of budget

    user = relationship("User", back_populates="budgets")

class SavingsGoal(Base):
    __tablename__ = "savings_goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    target_amount = Column(Float)
    current_amount = Column(Float, default=0)
    start_date = Column(DateTime)
    target_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    category = Column(String)
    priority = Column(Integer)  # 1 = highest priority
    auto_save = Column(Boolean, default=False)
    auto_save_amount = Column(Float, nullable=True)
    auto_save_frequency = Column(Enum(RecurrenceType), nullable=True)
    notes = Column(String, nullable=True)

    user = relationship("User", back_populates="savings_goals")
    contributions = relationship("SavingsContribution", back_populates="goal")

class SavingsContribution(Base):
    __tablename__ = "savings_contributions"

    id = Column(Integer, primary_key=True, index=True)
    goal_id = Column(Integer, ForeignKey("savings_goals.id"))
    amount = Column(Float)
    date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(String, nullable=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=True)

    goal = relationship("SavingsGoal", back_populates="contributions")
    transaction = relationship("Transaction")

class FinancialSnapshot(Base):
    __tablename__ = "financial_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(DateTime)
    total_assets = Column(Float)
    total_liabilities = Column(Float)
    net_worth = Column(Float)
    savings_rate = Column(Float)
    debt_to_income_ratio = Column(Float)
    emergency_fund_ratio = Column(Float)  # Months of expenses covered
    created_at = Column(DateTime, default=datetime.utcnow)
    metrics = Column(JSON)  # Store additional financial metrics

    user = relationship("User", back_populates="financial_snapshots")
