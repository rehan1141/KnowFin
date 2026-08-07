from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class Category(Base):
    """Category model representing user-defined or default categories."""
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="categories")
    budgets = relationship("Budget", back_populates="category", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="category_rel")

    __table_args__ = (
        UniqueConstraint("name", "user_id", name="uq_category_name_user"),
    )

    def __repr__(self):
        return f"<Category id={self.id} name='{self.name}' user_id={self.user_id}>"
