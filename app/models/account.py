from sqlalchemy import Column, Integer, String, Numeric, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class Account(Base):
    """
    SQLAlchemy ORM Model representing financial accounts/wallets in PostgreSQL.
    Examples: Bank Account, Cash, Savings, Credit Card, Investment.
    """
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    account_type = Column(String(50), nullable=False, default="bank")  # bank, cash, savings, credit_card, investment
    currency = Column(String(3), nullable=False, default="EUR")
    initial_balance = Column(Numeric(12, 2), nullable=False, default=0.00)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    # Relationships
    user = relationship("User", back_populates="accounts")
    expenses = relationship("Expense", back_populates="account")
    recurring_transactions = relationship("RecurringTransaction", back_populates="account")

    def __repr__(self):
        return f"<Account id={self.id} name='{self.name}' type='{self.account_type}' initial_balance={self.initial_balance}>"
