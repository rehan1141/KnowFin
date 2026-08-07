from sqlalchemy import Column, Integer, Numeric, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class Budget(Base):
    """Budget model representing monthly limit per category."""
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    monthly_limit = Column(Numeric(10, 2), nullable=False)
    month = Column(Integer, nullable=False)  # 1-12
    year = Column(Integer, nullable=False)   # e.g., 2026
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    category = relationship("Category", back_populates="budgets")
    user = relationship("User", back_populates="budgets")

    __table_args__ = (
        UniqueConstraint("category_id", "month", "year", "user_id", name="uq_budget_category_month_year_user"),
    )

    def __repr__(self):
        return f"<Budget id={self.id} category_id={self.category_id} limit={self.monthly_limit} month={self.month}/{self.year}>"
