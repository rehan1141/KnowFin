from sqlalchemy import Column, Integer, String, Numeric, Boolean, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class RecurringTransaction(Base):
    """
    SQLAlchemy ORM Model representing planned, recurring or fixed transactions.
    Examples: Rent, Phone, Netflix, Gym, Salary.
    """
    __tablename__ = "recurring_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    transaction_type = Column(String(20), nullable=False, default="expense")  # expense, income
    account_id = Column(Integer, ForeignKey("accounts.id", ondelete="SET NULL"), nullable=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)
    frequency = Column(String(20), nullable=False, default="monthly")  # daily, weekly, monthly, yearly
    start_date = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    end_date = Column(DateTime(timezone=True), nullable=True)
    day_of_month = Column(Integer, nullable=True)  # 1 to 31 for monthly bills
    is_active = Column(Boolean, nullable=False, default=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="recurring_transactions")
    account = relationship("Account", back_populates="recurring_transactions")
    category = relationship("Category", back_populates="recurring_transactions")

    def __repr__(self):
        return f"<RecurringTransaction id={self.id} title='{self.title}' amount={self.amount} freq='{self.frequency}'>"
