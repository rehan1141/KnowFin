from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, Field


class SubcategoryResponse(BaseModel):
    id: int
    name: str
    category_type: str
    icon: str
    color: str
    parent_id: Optional[int] = None
    user_id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    category_type: str = Field("expense", pattern="^(expense|income)$")
    icon: str = Field("Folder", max_length=50)
    color: str = Field("#1F6B50", max_length=30)
    parent_id: Optional[int] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    category_type: Optional[str] = Field(None, pattern="^(expense|income)$")
    icon: Optional[str] = Field(None, max_length=50)
    color: Optional[str] = Field(None, max_length=30)
    parent_id: Optional[int] = None


class CategoryResponse(CategoryBase):
    id: int
    user_id: int
    is_default: bool
    created_at: datetime
    subcategories: List[SubcategoryResponse] = []
    transaction_count: Optional[int] = 0

    model_config = {"from_attributes": True}


class BudgetBase(BaseModel):
    category_id: int
    monthly_limit: Decimal = Field(..., gt=0, decimal_places=2)
    month: int = Field(..., ge=1, le=12)
    year: int = Field(..., ge=2000, le=2100)


class BudgetCreate(BudgetBase):
    pass


class BudgetResponse(BudgetBase):
    id: int
    user_id: int
    created_at: datetime
    category_name: Optional[str] = None
    category_icon: Optional[str] = None
    category_color: Optional[str] = None

    model_config = {"from_attributes": True}
