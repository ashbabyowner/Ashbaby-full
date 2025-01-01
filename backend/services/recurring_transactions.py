from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from typing import List, Optional
from ..models.finance import RecurringTransaction, Transaction, RecurrenceInterval
from ..schemas.finance import RecurringTransactionCreate, RecurringTransactionUpdate
from fastapi import HTTPException
from .notification import NotificationService

class RecurringTransactionService:
    def __init__(self, db: Session):
        self.db = db
        self.notification_service = NotificationService(db)

    def create_recurring_transaction(self, user_id: int, transaction: RecurringTransactionCreate) -> RecurringTransaction:
        """Create a new recurring transaction."""
        next_due = self._calculate_next_due(transaction.start_date, transaction.interval)
        
        db_transaction = RecurringTransaction(
            **transaction.dict(),
            user_id=user_id,
            last_generated=transaction.start_date,
            next_due=next_due
        )
        
        self.db.add(db_transaction)
        self.db.commit()
        self.db.refresh(db_transaction)
        
        # Generate the first transaction
        self._generate_transaction(db_transaction)
        
        return db_transaction

    def update_recurring_transaction(
        self,
        transaction_id: int,
        user_id: int,
        updates: RecurringTransactionUpdate
    ) -> RecurringTransaction:
        """Update an existing recurring transaction."""
        transaction = self.get_recurring_transaction(transaction_id, user_id)
        
        update_data = updates.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(transaction, field, value)
            
        if 'start_date' in update_data or 'interval' in update_data:
            transaction.next_due = self._calculate_next_due(
                transaction.start_date,
                transaction.interval
            )
        
        self.db.commit()
        self.db.refresh(transaction)
        return transaction

    def delete_recurring_transaction(self, transaction_id: int, user_id: int) -> None:
        """Delete a recurring transaction."""
        transaction = self.get_recurring_transaction(transaction_id, user_id)
        self.db.delete(transaction)
        self.db.commit()

    def get_recurring_transaction(self, transaction_id: int, user_id: int) -> RecurringTransaction:
        """Get a specific recurring transaction."""
        transaction = self.db.query(RecurringTransaction).filter(
            RecurringTransaction.id == transaction_id,
            RecurringTransaction.user_id == user_id
        ).first()
        
        if not transaction:
            raise HTTPException(status_code=404, detail="Recurring transaction not found")
        return transaction

    def get_user_recurring_transactions(self, user_id: int) -> List[RecurringTransaction]:
        """Get all recurring transactions for a user."""
        return self.db.query(RecurringTransaction).filter(
            RecurringTransaction.user_id == user_id,
            RecurringTransaction.is_active == True
        ).all()

    def process_due_transactions(self) -> None:
        """Process all due recurring transactions."""
        now = datetime.utcnow()
        due_transactions = self.db.query(RecurringTransaction).filter(
            RecurringTransaction.is_active == True,
            RecurringTransaction.next_due <= now,
            (RecurringTransaction.end_date.is_(None) | (RecurringTransaction.end_date >= now))
        ).all()

        for transaction in due_transactions:
            self._generate_transaction(transaction)
            
            # Update next_due date
            transaction.last_generated = now
            transaction.next_due = self._calculate_next_due(now, transaction.interval)
            
            # Check if we've reached the end date
            if transaction.end_date and transaction.next_due > transaction.end_date:
                transaction.is_active = False
        
        self.db.commit()

    async def _generate_transaction(self, recurring_transaction: RecurringTransaction) -> Transaction:
        """Generate a new transaction from a recurring transaction."""
        transaction = Transaction(
            user_id=recurring_transaction.user_id,
            type=recurring_transaction.type,
            category=recurring_transaction.category,
            amount=recurring_transaction.amount,
            description=recurring_transaction.description,
            date=datetime.utcnow(),
            recurring_source_id=recurring_transaction.id
        )
        
        self.db.add(transaction)
        self.db.commit()

        # Send notification
        await self.notification_service.create_recurring_transaction_notification(
            user_id=recurring_transaction.user_id,
            transaction_type=recurring_transaction.type,
            amount=recurring_transaction.amount,
            description=recurring_transaction.description
        )

        return transaction

    def _calculate_next_due(self, from_date: datetime, interval: RecurrenceInterval) -> datetime:
        """Calculate the next due date based on the interval."""
        if interval == RecurrenceInterval.DAILY:
            return from_date + timedelta(days=1)
        elif interval == RecurrenceInterval.WEEKLY:
            return from_date + timedelta(weeks=1)
        elif interval == RecurrenceInterval.BIWEEKLY:
            return from_date + timedelta(weeks=2)
        elif interval == RecurrenceInterval.MONTHLY:
            # Add one month, handling edge cases
            next_month = from_date.replace(day=1) + timedelta(days=32)
            return next_month.replace(day=min(from_date.day, self._days_in_month(next_month)))
        elif interval == RecurrenceInterval.QUARTERLY:
            # Add three months
            next_quarter = from_date
            for _ in range(3):
                next_month = next_quarter.replace(day=1) + timedelta(days=32)
                next_quarter = next_month.replace(day=min(from_date.day, self._days_in_month(next_month)))
            return next_quarter
        elif interval == RecurrenceInterval.YEARLY:
            # Add one year, handling leap years
            next_year = from_date.replace(year=from_date.year + 1)
            if from_date.month == 2 and from_date.day == 29:
                return next_year.replace(day=28)
            return next_year
        else:
            raise ValueError(f"Invalid interval: {interval}")

    def _days_in_month(self, date: datetime) -> int:
        """Get the number of days in a month."""
        if date.month == 12:
            next_month = date.replace(year=date.year + 1, month=1, day=1)
        else:
            next_month = date.replace(month=date.month + 1, day=1)
        return (next_month - timedelta(days=1)).day
