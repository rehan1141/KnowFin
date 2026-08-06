from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# 1. Persistent Database Engine (Connection Pool)
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # Automatically checks if connection is alive before using it
)

# 2. Session Factory for creating request-scoped sessions
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


# 3. Dependency helper for FastAPI endpoints (Opens session, closes it after request)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
