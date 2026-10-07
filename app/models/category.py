from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import relationship, backref
from app.db.base_class import Base


class Category(Base):
    """
    Category model representing financial categories and subcategories.
    Supports both expense and income categories.
    """
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    category_type = Column(String(20), nullable=False, default="expense")  # "expense" | "income"
    icon = Column(String(50), nullable=False, default="Folder")  # Lucide icon identifier
    color = Column(String(30), nullable=False, default="#1F6B50")  # Color hex code
    parent_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)
    is_default = Column(Boolean, nullable=False, default=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="categories")
    budgets = relationship("Budget", back_populates="category", cascade="all, delete-orphan")
    expenses = relationship("Expense", foreign_keys="[Expense.category_id]", back_populates="category_rel")
    subcategory_expenses = relationship("Expense", foreign_keys="[Expense.subcategory_id]", back_populates="subcategory_rel")
    recurring_transactions = relationship("RecurringTransaction", back_populates="category")

    # Parent / Subcategories relationship
    subcategories = relationship(
        "Category",
        backref=backref("parent", remote_side=[id]),
        cascade="all, delete-orphan",
        single_parent=True
    )

    __table_args__ = (
        UniqueConstraint("name", "user_id", "parent_id", name="uq_category_name_user_parent"),
    )

    def __repr__(self):
        return f"<Category id={self.id} name='{self.name}' type='{self.category_type}' user_id={self.user_id}>"
