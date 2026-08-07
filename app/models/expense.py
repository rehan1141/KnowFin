from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class Expense(Base):
    """
    SQLAlchemy ORM Model representing the 'expenses' table in PostgreSQL.
    """
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)  # Exact monetary precision (e.g., 99.99)
    category = Column(String(50), nullable=False, default="Uncategorized", index=True)
    expense_date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Foreign Key linking to users.id
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # ORM Relationship back to User
    owner = relationship("User", back_populates="expenses")

    def __repr__(self):
        return f"<Expense id={self.id} title='{self.title}' amount={self.amount} user_id={self.user_id}>"
