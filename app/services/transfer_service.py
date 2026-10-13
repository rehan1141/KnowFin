from datetime import datetime
from decimal import Decimal
from typing import Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.account import Account
from app.models.expense import Expense
from app.schemas.transfer import TransferCreate


def execute_atomic_transfer(db: Session, transfer_in: TransferCreate, user_id: int) -> Dict[str, Any]:
    """
    Executes a transfer between two accounts owned by user_id.
    Guarantees atomicity: both debit and credit entries succeed or neither does.
    """
    if transfer_in.from_account_id == transfer_in.to_account_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Source and destination accounts must be different."
        )

    # 1. Verify ownership of source account
    from_acc = db.query(Account).filter(
        Account.id == transfer_in.from_account_id,
        Account.user_id == user_id
    ).first()
    if not from_acc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Source account not found or access denied."
        )

    # 2. Verify ownership of destination account
    to_acc = db.query(Account).filter(
        Account.id == transfer_in.to_account_id,
        Account.user_id == user_id
    ).first()
    if not to_acc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Destination account not found or access denied."
        )

    tx_date = transfer_in.date or datetime.now()
    desc = transfer_in.description.strip() if transfer_in.description else None

    out_title = f"Transfer to {to_acc.name}" if not desc else f"Transfer to {to_acc.name}: {desc}"
    in_title = f"Transfer from {from_acc.name}" if not desc else f"Transfer from {from_acc.name}: {desc}"

    try:
        # Outgoing leg (debit from source)
        out_tx = Expense(
            title=out_title,
            amount=transfer_in.amount,
            transaction_type="transfer",
            category="Transfer",
            account_id=from_acc.id,
            expense_date=tx_date,
            notes=f"[TRANSFER_OUT:{to_acc.id}] {desc or ''}".strip(),
            user_id=user_id,
        )
        db.add(out_tx)
        db.flush()

        # Incoming leg (credit to destination)
        in_tx = Expense(
            title=in_title,
            amount=transfer_in.amount,
            transaction_type="transfer",
            category="Transfer",
            account_id=to_acc.id,
            expense_date=tx_date,
            notes=f"[TRANSFER_IN:{from_acc.id}] {desc or ''}".strip(),
            user_id=user_id,
        )
        db.add(in_tx)
        db.commit()
        db.refresh(out_tx)
        db.refresh(in_tx)

        return {
            "transfer_out_id": out_tx.id,
            "transfer_in_id": in_tx.id,
            "from_account_id": from_acc.id,
            "to_account_id": to_acc.id,
            "amount": transfer_in.amount,
            "description": desc,
            "date": tx_date,
        }
    except Exception as e:
        db.rollback()
        raise e
