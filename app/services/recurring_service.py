from datetime import datetime, timedelta
from decimal import Decimal
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.recurring import RecurringTransaction
from app.models.category import Category
from app.models.account import Account
from app.schemas.recurring import RecurringTransactionCreate, RecurringTransactionUpdate


def _calculate_next_due(rt: RecurringTransaction, now: datetime) -> Optional[datetime]:
    """Calculate the next upcoming due date based on frequency and start date."""
    if not rt.is_active:
        return None
    if rt.end_date and rt.end_date < now:
        return None

    if rt.frequency == "monthly":
        day = rt.day_of_month or rt.start_date.day
        year = now.year
        month = now.month

        # Try this month
        try:
            target_date = datetime(year, month, min(day, 28), rt.start_date.hour, rt.start_date.minute)
        except ValueError:
            target_date = datetime(year, month, 28, rt.start_date.hour, rt.start_date.minute)

        if target_date < now:
            # Move to next month
            if month == 12:
                year += 1
                month = 1
            else:
                month += 1
            try:
                target_date = datetime(year, month, min(day, 28), rt.start_date.hour, rt.start_date.minute)
            except ValueError:
                target_date = datetime(year, month, 28, rt.start_date.hour, rt.start_date.minute)

        return target_date

    elif rt.frequency == "weekly":
        current = rt.start_date
        while current < now:
            current += timedelta(days=7)
        return current

    elif rt.frequency == "daily":
        current = rt.start_date
        while current < now:
            current += timedelta(days=1)
        return current

    elif rt.frequency == "yearly":
        year = now.year
        target_date = datetime(year, rt.start_date.month, min(rt.start_date.day, 28))
        if target_date < now:
            target_date = datetime(year + 1, rt.start_date.month, min(rt.start_date.day, 28))
        return target_date

    return rt.start_date


def _enrich_recurring(rt: RecurringTransaction, db: Session, now: datetime) -> Dict[str, Any]:
    acc_name = None
    if rt.account_id:
        acc = db.query(Account).filter(Account.id == rt.account_id).first()
        if acc:
            acc_name = acc.name

    cat_name = None
    cat_icon = "Receipt"
    cat_color = "#3B82F6"
    if rt.category_id:
        cat = db.query(Category).filter(Category.id == rt.category_id).first()
        if cat:
            cat_name = cat.name
            cat_icon = cat.icon
            cat_color = cat.color

    next_due = _calculate_next_due(rt, now)
    days_until = None
    if next_due:
        delta = next_due.date() - now.date()
        days_until = delta.days

    return {
        "id": rt.id,
        "user_id": rt.user_id,
        "title": rt.title,
        "amount": rt.amount,
        "transaction_type": rt.transaction_type,
        "account_id": rt.account_id,
        "category_id": rt.category_id,
        "frequency": rt.frequency,
        "start_date": rt.start_date,
        "end_date": rt.end_date,
        "day_of_month": rt.day_of_month,
        "is_active": rt.is_active,
        "notes": rt.notes,
        "account_name": acc_name,
        "category_name": cat_name,
        "category_icon": cat_icon,
        "category_color": cat_color,
        "next_due_date": next_due,
        "days_until_due": days_until,
        "created_at": rt.created_at,
    }


def list_recurring(db: Session, user_id: int) -> List[Dict[str, Any]]:
    now = datetime.now()
    items = (
        db.query(RecurringTransaction)
        .filter(RecurringTransaction.user_id == user_id)
        .order_by(RecurringTransaction.created_at.desc())
        .all()
    )
    return [_enrich_recurring(it, db, now) for it in items]


def get_upcoming_recurring(db: Session, user_id: int, days_ahead: int = 30) -> Dict[str, Any]:
    """Retrieve recurring items due within next `days_ahead` days, sorted by proximity."""
    now = datetime.now()
    items = (
        db.query(RecurringTransaction)
        .filter(RecurringTransaction.user_id == user_id, RecurringTransaction.is_active.is_(True))
        .all()
    )

    upcoming_list = []
    total_expenses = Decimal("0.00")
    total_income = Decimal("0.00")

    for rt in items:
        enriched = _enrich_recurring(rt, db, now)
        days = enriched["days_until_due"]
        if days is not None and 0 <= days <= days_ahead:
            upcoming_list.append(enriched)
            if rt.transaction_type == "expense":
                total_expenses += rt.amount
            elif rt.transaction_type == "income":
                total_income += rt.amount

    upcoming_list.sort(key=lambda x: x["days_until_due"] if x["days_until_due"] is not None else 999)

    return {
        "items": upcoming_list,
        "total_upcoming_expenses": total_expenses,
        "total_upcoming_income": total_income,
    }


def create_recurring(db: Session, rt_in: RecurringTransactionCreate, user_id: int) -> Dict[str, Any]:
    st_date = rt_in.start_date or datetime.now()
    dom = rt_in.day_of_month or st_date.day

    rt = RecurringTransaction(
        user_id=user_id,
        title=rt_in.title,
        amount=rt_in.amount,
        transaction_type=rt_in.transaction_type,
        account_id=rt_in.account_id,
        category_id=rt_in.category_id,
        frequency=rt_in.frequency,
        start_date=st_date,
        end_date=rt_in.end_date,
        day_of_month=dom,
        is_active=rt_in.is_active,
        notes=rt_in.notes,
    )
    db.add(rt)
    db.commit()
    db.refresh(rt)

    now = datetime.now()
    return _enrich_recurring(rt, db, now)


def update_recurring(db: Session, rt_id: int, rt_in: RecurringTransactionUpdate, user_id: int) -> Dict[str, Any]:
    rt = (
        db.query(RecurringTransaction)
        .filter(RecurringTransaction.id == rt_id, RecurringTransaction.user_id == user_id)
        .first()
    )
    if not rt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recurring transaction not found.")

    update_data = rt_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(rt, field, val)

    db.commit()
    db.refresh(rt)
    return _enrich_recurring(rt, db, datetime.now())


def delete_recurring(db: Session, rt_id: int, user_id: int) -> None:
    rt = (
        db.query(RecurringTransaction)
        .filter(RecurringTransaction.id == rt_id, RecurringTransaction.user_id == user_id)
        .first()
    )
    if not rt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recurring transaction not found.")
    db.delete(rt)
    db.commit()
