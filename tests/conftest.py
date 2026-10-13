import os
import pytest
from sqlalchemy import create_engine
from fastapi.testclient import TestClient

# 1. Force the database URL to the isolated test database BEFORE importing app modules
TEST_DB_URL = os.environ.get(
    "TEST_DATABASE_URL", "postgresql://localhost:5432/knowfin_test_db"
)
os.environ["DATABASE_URL"] = TEST_DB_URL
os.environ["TESTING"] = "true"

from app.db.base_class import Base
import app.models  # Ensure all models are registered on Base.metadata
from app.main import app

@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """
    Session-level fixture that ensures the isolated test database schema
    is fully initialized before any test runs.
    """
    test_engine = create_engine(TEST_DB_URL, pool_pre_ping=True)
    Base.metadata.create_all(bind=test_engine)
    yield
    test_engine.dispose()

@pytest.fixture
def client():
    """Provide a TestClient instance bound to the app configured with test DB."""
    return TestClient(app)
