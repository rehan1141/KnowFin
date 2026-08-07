import uuid
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_auth_full_flow():
    unique_email = f"user_{uuid.uuid4().hex[:8]}@example.com"
    password = "secretPassword123"

    # 1. Register
    reg_response = client.post(
        "/api/v1/auth/register",
        json={"email": unique_email, "password": password, "full_name": "Test User"}
    )
    assert reg_response.status_code == 201
    user_data = reg_response.json()
    assert user_data["email"] == unique_email
    assert "password" not in user_data

    # 2. Login invalid credentials
    bad_login = client.post(
        "/api/v1/auth/login",
        data={"username": unique_email, "password": "wrongpassword"}
    )
    assert bad_login.status_code == 401

    # 3. Login valid credentials
    login_response = client.post(
        "/api/v1/auth/login",
        data={"username": unique_email, "password": password}
    )
    assert login_response.status_code == 200
    token_data = login_response.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"

    # 4. Access /me endpoint with token
    headers = {"Authorization": f"Bearer {token_data['access_token']}"}
    me_response = client.get("/api/v1/auth/me", headers=headers)
    assert me_response.status_code == 200
    me_data = me_response.json()
    assert me_data["email"] == unique_email
