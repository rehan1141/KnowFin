from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.transfer import TransferCreate, TransferResponse
from app.services.transfer_service import execute_atomic_transfer

router = APIRouter(prefix="/transfers", tags=["Transfers"])


@router.post("/", response_model=TransferResponse, status_code=status.HTTP_201_CREATED)
def create_transfer(
    transfer_in: TransferCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Execute an atomic transfer between two accounts owned by the current user.
    Guarantees that both sides succeed or neither is recorded.
    """
    return execute_atomic_transfer(db=db, transfer_in=transfer_in, user_id=current_user.id)
