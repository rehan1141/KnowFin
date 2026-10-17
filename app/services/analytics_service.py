import calendar
from decimal import Decimal
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from app.models.expense import Expense
from app.models.category import Category
from app.models.budget import Budget
from app.models.recurring import RecurringTransaction
from app.services.account_service import list_user_accounts


def get_monthly_summary(db: Session, user_id: int, month: int, year: int) -> Dict[str, Any]:
    """Calculate total income, expenses, refunds, net spending, net savings, and daily averages."""
    # 1. Gross Expenses
    gross_spending = (
        db.query(func.coalesce(func.sum(Expense.amount), Decimal("0.00")))
        .filter(
            Expense.user_id == user_id,
            Expense.transaction_type == "expense",
            extract("month", Expense.expense_date) == month,
            extract("year", Expense.expense_date) == year,
        )
        .scalar()
        or Decimal("0.00")
    )

    # 2. Total Refunds
    total_refunds = (
        db.query(func.coalesce(func.sum(Expense.amount), Decimal("0.00")))
        .filter(
            Expense.user_id == user_id,
            Expense.transaction_type == "refund",
            extract("month", Expense.expense_date) == month,
            extract("year", Expense.expense_date) == year,
        )
        .scalar()
        or Decimal("0.00")
    )

    # Net spending = gross spending - refunds
    net_spending = max(Decimal("0.00"), gross_spending - total_refunds)

    # 3. Total Income (Refunds are NOT ordinary income!)
    total_income = (
        db.query(func.coalesce(func.sum(Expense.amount), Decimal("0.00")))
        .filter(
            Expense.user_id == user_id,
            Expense.transaction_type == "income",
            extract("month", Expense.expense_date) == month,
            extract("year", Expense.expense_date) == year,
        )
        .scalar()
        or Decimal("0.00")
    )

    # 4. Total Transaction Count
    total_tx_count = (
        db.query(func.count(Expense.id))
        .filter(
            Expense.user_id == user_id,
            extract("month", Expense.expense_date) == month,
            extract("year", Expense.expense_date) == year,
        )
        .scalar()
        or 0
    )

    # 5. Fixed vs Variable: recurring plans are templates, not proof of completed payments
    fixed_expenses = Decimal("0.00")
    variable_expenses = net_spending

    # 6. Net savings & Savings rate
    net_savings = total_income - net_spending
    savings_rate = 0.0
    if total_income > 0:
        savings_rate = round(float(net_savings / total_income * 100), 1)

    # 7. Average daily spending based on net spending
    _, days_in_month = calendar.monthrange(year, month)
    avg_daily = round(net_spending / Decimal(days_in_month), 2) if days_in_month > 0 else Decimal("0.00")

    # 8. Total available balance across all user accounts
    accounts_info = list_user_accounts(db, user_id)
    total_balance = accounts_info["total_balance"]
    is_balance_set = accounts_info["is_balance_set"]

    return {
        "month": month,
        "year": year,
        "total_income": total_income,
        "total_spent": gross_spending,
        "gross_spending": gross_spending,
        "total_refunds": total_refunds,
        "net_spending": net_spending,
        "net_savings": net_savings,
        "savings_rate": savings_rate,
        "total_transactions": total_tx_count,
        "fixed_expenses": fixed_expenses,
        "variable_expenses": variable_expenses,
        "average_daily_spending": avg_daily,
        "total_balance": total_balance,
        "is_balance_set": is_balance_set,
    }


def get_spending_by_category(db: Session, user_id: int, month: int, year: int) -> Dict[str, Any]:
    """Group spending by category with icons, colors, and percentages."""
    total_spent = (
        db.query(func.coalesce(func.sum(Expense.amount), Decimal("0.00")))
        .filter(
            Expense.user_id == user_id,
            Expense.transaction_type == "expense",
            extract("month", Expense.expense_date) == month,
            extract("year", Expense.expense_date) == year,
        )
        .scalar()
        or Decimal("0.00")
    )

    category_results = (
        db.query(
            Expense.category,
            Expense.category_id,
            func.sum(Expense.amount).label("cat_total"),
            func.count(Expense.id).label("tx_count"),
        )
        .filter(
            Expense.user_id == user_id,
            Expense.transaction_type == "expense",
            extract("month", Expense.expense_date) == month,
            extract("year", Expense.expense_date) == year,
        )
        .group_by(Expense.category, Expense.category_id)
        .order_by(func.sum(Expense.amount).desc())
        .all()
    )

    categories = []
    for cat_name, cat_id, cat_total, tx_count in category_results:
        pct = (float(cat_total) / float(total_spent) * 100) if total_spent > 0 else 0.0

        cat_icon = "Folder"
        cat_color = "#1F6B50"
        if cat_id:
            c_obj = db.query(Category).filter(Category.id == cat_id).first()
            if c_obj:
                cat_icon = c_obj.icon
                cat_color = c_obj.color

        categories.append({
            "category_id": cat_id,
            "category": cat_name,
            "icon": cat_icon,
            "color": cat_color,
            "total_spent": cat_total,
            "percentage": round(pct, 1),
            "transaction_count": tx_count,
        })

    return {
        "month": month,
        "year": year,
        "total_spent": total_spent,
        "categories": categories,
    }


def get_budget_status(db: Session, user_id: int, month: int, year: int) -> Dict[str, Any]:
    """Compare set budget limits against actual spending per category."""
    rows = (
        db.query(
            Budget.id.label("budget_id"),
            Budget.monthly_limit,
            Category.id.label("category_id"),
            Category.name.label("category_name"),
            Category.icon.label("category_icon"),
            Category.color.label("category_color"),
            func.coalesce(func.sum(Expense.amount), Decimal("0.00")).label("total_spent"),
        )
        .join(Category, Budget.category_id == Category.id)
        .outerjoin(
            Expense,
            (Expense.category_id == Category.id)
            & (Expense.user_id == user_id)
            & (Expense.transaction_type == "expense")
            & (extract("month", Expense.expense_date) == month)
            & (extract("year", Expense.expense_date) == year),
        )
        .filter(Budget.user_id == user_id, Budget.month == month, Budget.year == year)
        .group_by(Budget.id, Budget.monthly_limit, Category.id, Category.name, Category.icon, Category.color)
        .all()
    )

    budget_items = []
    total_budgeted = Decimal("0.00")
    total_spent_budgeted = Decimal("0.00")

    for row in rows:
        total_budgeted += row.monthly_limit
        total_spent_budgeted += row.total_spent
        remaining = row.monthly_limit - row.total_spent
        pct = (float(row.total_spent) / float(row.monthly_limit) * 100) if row.monthly_limit > 0 else 0.0

        if row.total_spent > row.monthly_limit:
            status_str = "exceeded"
        elif pct >= 80:
            status_str = "warning"
        else:
            status_str = "on_track"

        budget_items.append({
            "budget_id": row.budget_id,
            "category_id": row.category_id,
            "category_name": row.category_name,
            "category_icon": row.category_icon or "Folder",
            "category_color": row.category_color or "#1F6B50",
            "monthly_limit": row.monthly_limit,
            "total_spent": row.total_spent,
            "remaining": remaining,
            "percentage": round(pct, 1),
            "is_exceeded": row.total_spent > row.monthly_limit,
            "status": status_str,
        })

    return {
        "month": month,
        "year": year,
        "total_budgeted": total_budgeted,
        "total_spent_budgeted": total_spent_budgeted,
        "budgets": budget_items,
    }


def get_cash_flow_timeline(db: Session, user_id: int, month: int, year: int) -> Dict[str, Any]:
    """Retrieve daily cash flow points for charting."""
    txs = (
        db.query(
            func.date(Expense.expense_date).label("tx_date"),
            Expense.transaction_type,
            func.sum(Expense.amount).label("day_total"),
        )
        .filter(
            Expense.user_id == user_id,
            extract("month", Expense.expense_date) == month,
            extract("year", Expense.expense_date) == year,
        )
        .group_by(func.date(Expense.expense_date), Expense.transaction_type)
        .order_by(func.date(Expense.expense_date).asc())
        .all()
    )

    daily_map = {}
    for tx_date, tx_type, day_total in txs:
        d_str = str(tx_date)
        if d_str not in daily_map:
            daily_map[d_str] = {"income": Decimal("0.00"), "expense": Decimal("0.00")}
        if tx_type == "income":
            daily_map[d_str]["income"] += day_total
        elif tx_type == "expense":
            daily_map[d_str]["expense"] += day_total

    points = []
    for d_str, val in sorted(daily_map.items()):
        points.append({
            "date": d_str,
            "income": val["income"],
            "expense": val["expense"],
            "net": val["income"] - val["expense"],
        })

    return {
        "month": month,
        "year": year,
        "points": points,
    }
