import uuid
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def get_auth_headers() -> dict:
    email = f"user_{uuid.uuid4().hex[:8]}@example.com"
    password = "password123"

    client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "full_name": "Analytics Tester"}
    )
    login_resp = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password}
    )
    token = login_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_analytics_endpoints():
    headers = get_auth_headers()

    # Create Expense 1
    client.post(
        "/api/v1/expenses/",
        json={"title": "Lunch", "amount": 20.00, "category": "Food"},
        headers=headers
    )
    # Create Expense 2
    client.post(
        "/api/v1/expenses/",
        json={"title": "Dinner", "amount": 30.00, "category": "Food"},
        headers=headers
    )

    # 1. Summary Endpoint
    resp_sum = client.get("/api/v1/analytics/summary?month=8&year=2026", headers=headers)
    assert resp_sum.status_code == 200
    assert float(resp_sum.json()["total_spent"]) == 50.00
    assert resp_sum.json()["total_transactions"] == 2

    # 2. By Category Endpoint
    resp_cat = client.get("/api/v1/analytics/by-category?month=8&year=2026", headers=headers)
    assert resp_cat.status_code == 200
    cat_payload = resp_cat.json()
    assert len(cat_payload["categories"]) == 1
    assert cat_payload["categories"][0]["category"] == "Food"
    assert cat_payload["categories"][0]["percentage"] == 100.0

    # 3. Budget Status Endpoint
    resp_bud = client.get("/api/v1/analytics/budget-status?month=8&year=2026", headers=headers)
    assert resp_bud.status_code == 200
