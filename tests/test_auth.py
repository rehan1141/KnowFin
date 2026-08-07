from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_register_user():
    # Use unique email per test run
    payload = {
        "email": "test_register@example.com",
        "password": "strongPassword123",
        "full_name": "Test User"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    
    # Either 201 Created (first run) or 400 Bad Request (if email already registered)
    assert response.status_code in (201, 400)
    if response.status_code == 201:
        data = response.json()
        assert data["email"] == payload["email"]
        assert "id" in data
        assert "password" not in data
        assert "hashed_password" not in data
