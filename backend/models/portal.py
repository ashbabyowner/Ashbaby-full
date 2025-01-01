from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from ..database import Base

class PortalType(enum.Enum):
    BANK = "bank"
    INVESTMENT = "investment"
    CREDIT_CARD = "credit_card"
    LOAN = "loan"
    CRYPTO = "crypto"
    RETIREMENT = "retirement"
    INSURANCE = "insurance"
    TAX = "tax"
    PAYROLL = "payroll"
    EXPENSE_TRACKING = "expense_tracking"
    BUDGETING = "budgeting"
    PROPERTY = "property"
    BUSINESS = "business"
    CUSTOM = "custom"

class PortalStatus(enum.Enum):
    CONNECTED = "connected"
    DISCONNECTED = "disconnected"
    ERROR = "error"
    PENDING = "pending"
    EXPIRED = "expired"

class Portal(Base):
    """Model for external service portals that users can connect to."""
    __tablename__ = "portals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    portal_type = Column(SQLEnum(PortalType))
    provider_name = Column(String)
    account_name = Column(String)
    account_number = Column(String)  # Encrypted
    access_token = Column(String)    # Encrypted
    refresh_token = Column(String)   # Encrypted
    token_expiry = Column(DateTime)
    status = Column(SQLEnum(PortalStatus), default=PortalStatus.PENDING)
    last_sync = Column(DateTime)
    sync_frequency = Column(Integer)  # in minutes
    metadata = Column(JSON)
    error_message = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="portals")
    transactions = relationship("Transaction", back_populates="portal")
    balances = relationship("Balance", back_populates="portal")

class Balance(Base):
    """Model for account balances from connected portals."""
    __tablename__ = "balances"

    id = Column(Integer, primary_key=True, index=True)
    portal_id = Column(Integer, ForeignKey("portals.id"))
    balance_type = Column(String)  # e.g., available, current, pending
    amount = Column(Integer)  # Stored in cents
    currency = Column(String, default="USD")
    timestamp = Column(DateTime, default=datetime.utcnow)
    metadata = Column(JSON)

    # Relationships
    portal = relationship("Portal", back_populates="balances")

class PortalCredential(Base):
    """Model for storing portal credentials securely."""
    __tablename__ = "portal_credentials"

    id = Column(Integer, primary_key=True, index=True)
    portal_id = Column(Integer, ForeignKey("portals.id"))
    credential_type = Column(String)  # e.g., api_key, oauth_token, password
    credential_value = Column(String)  # Encrypted
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)

class PortalSync(Base):
    """Model for tracking portal sync history."""
    __tablename__ = "portal_syncs"

    id = Column(Integer, primary_key=True, index=True)
    portal_id = Column(Integer, ForeignKey("portals.id"))
    sync_type = Column(String)  # e.g., full, incremental
    start_time = Column(DateTime)
    end_time = Column(DateTime, nullable=True)
    status = Column(String)  # success, error, in_progress
    records_processed = Column(Integer, default=0)
    error_message = Column(String, nullable=True)
    metadata = Column(JSON)
