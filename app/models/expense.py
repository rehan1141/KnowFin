from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class Expense(Base):
    """
    SQLAlchemy ORM Model representing transactions in PostgreSQL.
    Supports expenses, income, and transfers, linked to accounts and categories.
    """
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    transaction_type = Column(String(20), nullable=False, default="expense", index=True)  # expense, income, transfer
    category = Column(String(50), nullable=False, default="Uncategorized", index=True)
    expense_date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    notes = Column(Text, nullable=True)

    # Foreign Keys
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)
    subcategory_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id", ondelete="SET NULL"), nullable=True, index=True)

    # ORM Relationships
    owner = relationship("User", back_populates="expenses")
    category_rel = relationship("Category", foreign_keys=[category_id], back_populates="expenses")
    subcategory_rel = relationship("Category", foreign_keys=[subcategory_id], back_populates="subcategory_expenses")
    account = relationship("Account", back_populates="expenses")

    def __repr__(self):
        return f"<Expense id={self.id} title='{self.title}' amount={self.amount} type='{self.transaction_type}' user_id={self.user_id}>"
