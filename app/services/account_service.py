from decimal import Decimal
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status

from app.models.account import Account
from app.models.expense import Expense
from app.schemas.account import AccountCreate, AccountUpdate


def get_account_balance(db: Session, account_id: int, user_id: int) -> Dict[str, Decimal]:
    """Calculate the current balance, total income, and total expenses for an account."""
    income = (
        db.query(func.coalesce(func.sum(Expense.amount), Decimal("0.00")))
        .filter(
            Expense.user_id == user_id,
            Expense.account_id == account_id,
            Expense.transaction_type == "income",
        )
        .scalar()
        or Decimal("0.00")
    )

    expenses = (
        db.query(func.coalesce(func.sum(Expense.amount), Decimal("0.00")))
        .filter(
            Expense.user_id == user_id,
            Expense.account_id == account_id,
            Expense.transaction_type == "expense",
        )
        .scalar()
        or Decimal("0.00")
    )

    return {
        "income": income,
        "expenses": expenses,
    }


def list_user_accounts(db: Session, user_id: int) -> Dict[str, Any]:
    """Retrieve all accounts with computed real-time balances for user."""
    accounts = (
        db.query(Account)
        .filter(Account.user_id == user_id)
        .order_by(Account.created_at.asc())
        .all()
    )

    result_accounts = []
    total_balance = Decimal("0.00")

    for acc in accounts:
        stats = get_account_balance(db, acc.id, user_id)
        current_bal = acc.initial_balance + stats["income"] - stats["expenses"]
        if acc.is_active:
            total_balance += current_bal

        result_accounts.append({
            "id": acc.id,
            "user_id": acc.user_id,
            "name": acc.name,
            "account_type": acc.account_type,
            "currency": acc.currency,
            "initial_balance": acc.initial_balance,
            "current_balance": current_bal,
            "total_income": stats["income"],
            "total_expenses": stats["expenses"],
            "is_active": acc.is_active,
            "created_at": acc.created_at,
            "updated_at": acc.updated_at,
        })

    return {
        "accounts": result_accounts,
        "total_balance": total_balance,
    }


def get_account_by_id(db: Session, account_id: int, user_id: int) -> Account:
    acc = db.query(Account).filter(Account.id == account_id, Account.user_id == user_id).first()
    if not acc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found.")
    return acc


def create_account(db: Session, account_in: AccountCreate, user_id: int) -> Dict[str, Any]:
    acc = Account(
        user_id=user_id,
        name=account_in.name,
        account_type=account_in.account_type,
        currency=account_in.currency,
        initial_balance=account_in.initial_balance,
        is_active=True,
    )
    db.add(acc)
    db.commit()
    db.refresh(acc)

    return {
        "id": acc.id,
        "user_id": acc.user_id,
        "name": acc.name,
        "account_type": acc.account_type,
        "currency": acc.currency,
        "initial_balance": acc.initial_balance,
        "current_balance": acc.initial_balance,
        "total_income": Decimal("0.00"),
        "total_expenses": Decimal("0.00"),
        "is_active": acc.is_active,
        "created_at": acc.created_at,
        "updated_at": acc.updated_at,
    }


def update_account(db: Session, account_id: int, account_in: AccountUpdate, user_id: int) -> Dict[str, Any]:
    acc = get_account_by_id(db, account_id, user_id)
    update_data = account_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(acc, field, val)
    db.commit()
    db.refresh(acc)

    stats = get_account_balance(db, acc.id, user_id)
    current_bal = acc.initial_balance + stats["income"] - stats["expenses"]

    return {
        "id": acc.id,
        "user_id": acc.user_id,
        "name": acc.name,
        "account_type": acc.account_type,
        "currency": acc.currency,
        "initial_balance": acc.initial_balance,
        "current_balance": current_bal,
        "total_income": stats["income"],
        "total_expenses": stats["expenses"],
        "is_active": acc.is_active,
        "created_at": acc.created_at,
        "updated_at": acc.updated_at,
    }


def delete_account(db: Session, account_id: int, user_id: int) -> None:
    acc = get_account_by_id(db, account_id, user_id)
    db.delete(acc)
    db.commit()
