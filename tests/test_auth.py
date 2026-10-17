import uuid
from datetime import timedelta
from fastapi.testclient import TestClient

from app.main import app
from app.core.security import create_access_token, verify_password
from app.db.session import SessionLocal
from app.models.user import User

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_successful_registration():
    """1. Successful registration creates user in DB and returns safe response without password."""
    unique_email = f"Reg_{uuid.uuid4().hex[:8]}@Example.com"
    password = "CorrectHorse123!"

    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": unique_email,
            "password": password,
            "full_name": "Test Real User",
            "default_currency": "EUR",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == unique_email.strip().lower()
    assert data["full_name"] == "Test Real User"
    assert data["default_currency"] == "EUR"
    assert data["is_active"] is True
    assert "password" not in data
    assert "hashed_password" not in data


def test_duplicate_email_rejection():
    """2. Duplicate registrations are rejected case-insensitively."""
    base_email = f"duplicate_{uuid.uuid4().hex[:8]}@example.com"
    password = "securePassword123!"

    # First registration
    resp1 = client.post(
        "/api/v1/auth/register",
        json={"email": base_email.lower(), "password": password, "full_name": "User One"},
    )
    assert resp1.status_code == 201

    # Exact duplicate registration
    resp2 = client.post(
        "/api/v1/auth/register",
        json={"email": base_email.lower(), "password": password, "full_name": "User Duplicate"},
    )
    assert resp2.status_code == 400
    assert "already exists" in resp2.json()["error"]["message"]

    # Case-insensitive duplicate registration (UPPERCASE)
    resp3 = client.post(
        "/api/v1/auth/register",
        json={"email": base_email.upper(), "password": password, "full_name": "User Uppercase"},
    )
    assert resp3.status_code == 400
    assert "already exists" in resp3.json()["error"]["message"]


def test_successful_login_with_correct_password():
    """3. Successful login returns signed Bearer token and verifies case-insensitively."""
    raw_email = f"Case_{uuid.uuid4().hex[:8]}@Example.Com"
    password = "superSecretPassword123!"

    # Register
    reg_resp = client.post(
        "/api/v1/auth/register",
        json={"email": raw_email, "password": password, "full_name": "Case User"},
    )
    assert reg_resp.status_code == 201

    # Login with exact email
    login_resp = client.post(
        "/api/v1/auth/login",
        data={"username": raw_email, "password": password},
    )
    assert login_resp.status_code == 200
    token_data = login_resp.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"

    # Login with lowercase email
    login_resp_lower = client.post(
        "/api/v1/auth/login",
        data={"username": raw_email.lower(), "password": password},
    )
    assert login_resp_lower.status_code == 200

    # Login with uppercase email
    login_resp_upper = client.post(
        "/api/v1/auth/login",
        data={"username": raw_email.upper(), "password": password},
    )
    assert login_resp_upper.status_code == 200


def test_login_failure_unknown_email():
    """4. Unknown email returns generic 401 authentication error."""
    non_existent_email = f"unknown_{uuid.uuid4().hex[:8]}@example.com"
    response = client.post(
        "/api/v1/auth/login",
        data={"username": non_existent_email, "password": "randomPassword999!"},
    )
    assert response.status_code == 401
    assert response.json()["error"]["message"] == "Incorrect email or password"


def test_login_failure_incorrect_password():
    """5. Incorrect password returns the exact same generic 401 authentication error as unknown email."""
    email = f"realuser_{uuid.uuid4().hex[:8]}@example.com"
    real_password = "realCorrectPassword123!"
    wrong_password = "completelyWrongPassword456!"

    # Register user
    reg = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": real_password, "full_name": "Pass Test"},
    )
    assert reg.status_code == 201

    # Login with wrong password
    response = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": wrong_password},
    )
    assert response.status_code == 401
    assert response.json()["error"]["message"] == "Incorrect email or password"


def test_protected_api_rejection_without_credentials():
    """6. Protected endpoints reject requests without credentials with 401."""
    # /auth/me
    resp_me = client.get("/api/v1/auth/me")
    assert resp_me.status_code == 401

    # /expenses/
    resp_expenses = client.get("/api/v1/expenses/")
    assert resp_expenses.status_code == 401

    # /accounts/
    resp_accounts = client.get("/api/v1/accounts/")
    assert resp_accounts.status_code == 401


def test_protected_api_rejection_invalid_or_expired_token():
    """7. Protected endpoints reject invalid and expired tokens with 401."""
    # Malformed token
    bad_headers = {"Authorization": "Bearer not-a-valid-jwt-token"}
    resp_bad = client.get("/api/v1/auth/me", headers=bad_headers)
    assert resp_bad.status_code == 401
    assert resp_bad.json()["error"]["message"] == "Could not validate credentials"

    # Expired token
    expired_token = create_access_token(
        subject="expired_user@example.com",
        expires_delta=timedelta(seconds=-60),
    )
    expired_headers = {"Authorization": f"Bearer {expired_token}"}
    resp_expired = client.get("/api/v1/auth/me", headers=expired_headers)
    assert resp_expired.status_code == 401
    assert resp_expired.json()["error"]["message"] == "Could not validate credentials"


def test_user_data_isolation():
    """8. User A cannot access or modify User B's transactions, accounts, or financial data."""
    # Create User A
    email_a = f"usera_{uuid.uuid4().hex[:8]}@example.com"
    pwd_a = "userApass123!"
    client.post("/api/v1/auth/register", json={"email": email_a, "password": pwd_a})
    token_a = client.post("/api/v1/auth/login", data={"username": email_a, "password": pwd_a}).json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # Create User B
    email_b = f"userb_{uuid.uuid4().hex[:8]}@example.com"
    pwd_b = "userBpass123!"
    client.post("/api/v1/auth/register", json={"email": email_b, "password": pwd_b})
    token_b = client.post("/api/v1/auth/login", data={"username": email_b, "password": pwd_b}).json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # User A creates an account and an expense
    account_a_resp = client.post(
        "/api/v1/accounts/",
        json={"name": "User A Secret Vault", "type": "SAVINGS", "currency": "EUR"},
        headers=headers_a,
    )
    assert account_a_resp.status_code == 201
    account_a_id = account_a_resp.json()["id"]

    expense_a_resp = client.post(
        "/api/v1/expenses/",
        json={"title": "User A Private Purchase", "amount": 250.00, "account_id": account_a_id},
        headers=headers_a,
    )
    assert expense_a_resp.status_code == 201
    expense_a_id = expense_a_resp.json()["id"]

    # User B attempts to access User A's expense by ID -> 404
    assert client.get(f"/api/v1/expenses/{expense_a_id}", headers=headers_b).status_code == 404

    # User B attempts to modify User A's expense -> 404
    assert client.put(
        f"/api/v1/expenses/{expense_a_id}",
        json={"title": "Hacked", "amount": 1.00},
        headers=headers_b,
    ).status_code == 404

    # User B attempts to delete User A's expense -> 404
    assert client.delete(f"/api/v1/expenses/{expense_a_id}", headers=headers_b).status_code == 404

    # User B attempts to access User A's account by ID -> 404
    assert client.get(f"/api/v1/accounts/{account_a_id}", headers=headers_b).status_code == 404

    # User B attempts to modify User A's account -> 404
    assert client.put(
        f"/api/v1/accounts/{account_a_id}",
        json={"name": "Compromised Account"},
        headers=headers_b,
    ).status_code == 404

    # User B's expense list does not include User A's expense
    b_expenses = client.get("/api/v1/expenses/", headers=headers_b).json()["items"]
    assert not any(e["id"] == expense_a_id for e in b_expenses)


def test_password_hashes_stored_not_plaintext():
    """9. Password hashes, not plaintext passwords, are stored in PostgreSQL and omitted from responses."""
    email = f"hashcheck_{uuid.uuid4().hex[:8]}@example.com"
    plain_password = "mySecretPlaintextPassword!99"

    reg_resp = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": plain_password, "full_name": "Hash Check"},
    )
    assert reg_resp.status_code == 201
    user_payload = reg_resp.json()

    # Plaintext password and hashed_password must never be returned in API response
    assert "password" not in user_payload
    assert "hashed_password" not in user_payload

    # Inspect directly in the database
    db = SessionLocal()
    try:
        db_user = db.query(User).filter(User.email == email.lower()).first()
        assert db_user is not None
        # Plaintext password must NOT be in the database
        assert db_user.hashed_password != plain_password
        # Must be a valid bcrypt hash starting with $2b$
        assert db_user.hashed_password.startswith("$2b$")
        # Stored hash must verify against the plain text password
        assert verify_password(plain_password, db_user.hashed_password) is True
        # Stored hash must NOT verify against a different password
        assert verify_password("wrongpassword", db_user.hashed_password) is False
    finally:
        db.close()


def test_cors_production_and_development_origins():
    """Verify CORS headers for production and local development origins."""
    production_origin = "https://know-fin.vercel.app"
    localhost_origin = "http://localhost:5173"
    unauthorized_origin = "https://unauthorized-domain.com"

    # 1. Preflight OPTIONS request from production frontend origin
    prod_preflight = client.options(
        "/api/v1/auth/login",
        headers={
            "Origin": production_origin,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )
    assert prod_preflight.status_code == 200
    assert prod_preflight.headers.get("access-control-allow-origin") == production_origin
    assert prod_preflight.headers.get("access-control-allow-origin") != "*"
    assert prod_preflight.headers.get("access-control-allow-credentials") == "true"

    # 2. Actual POST request with production Origin
    prod_post = client.post(
        "/api/v1/auth/login",
        json={"email": "nonexistent@example.com", "password": "WrongPassword123!"},
        headers={"Origin": production_origin},
    )
    assert prod_post.headers.get("access-control-allow-origin") == production_origin
    assert prod_post.headers.get("access-control-allow-credentials") == "true"

    # 3. Preserved local development origin
    local_preflight = client.options(
        "/api/v1/auth/login",
        headers={
            "Origin": localhost_origin,
            "Access-Control-Request-Method": "POST",
        },
    )
    assert local_preflight.status_code == 200
    assert local_preflight.headers.get("access-control-allow-origin") == localhost_origin

    # 4. Unauthorized origin is rejected (no Access-Control-Allow-Origin header)
    unauth_resp = client.options(
        "/api/v1/auth/login",
        headers={
            "Origin": unauthorized_origin,
            "Access-Control-Request-Method": "POST",
        },
    )
    assert "access-control-allow-origin" not in unauth_resp.headers

