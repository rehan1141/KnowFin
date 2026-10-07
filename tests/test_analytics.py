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

    # Create Expense 1 in Aug 2026
    client.post(
        "/api/v1/expenses/",
        json={"title": "Lunch", "amount": 20.00, "category": "Food", "expense_date": "2026-08-10T12:00:00"},
        headers=headers
    )
    # Create Expense 2 in Aug 2026
    client.post(
        "/api/v1/expenses/",
        json={"title": "Dinner", "amount": 30.00, "category": "Food", "expense_date": "2026-08-15T18:00:00"},
        headers=headers
    )
    # Create Income 1 in Aug 2026
    client.post(
        "/api/v1/expenses/",
        json={"title": "Salary", "amount": 200.00, "category": "Salary", "transaction_type": "income", "expense_date": "2026-08-01T09:00:00"},
        headers=headers
    )

    # 1. Summary Endpoint
    resp_sum = client.get("/api/v1/analytics/summary?month=8&year=2026", headers=headers)
    assert resp_sum.status_code == 200
    sum_data = resp_sum.json()
    assert float(sum_data["total_spent"]) == 50.00
    assert float(sum_data["total_income"]) == 200.00
    assert float(sum_data["net_savings"]) == 150.00
    assert sum_data["total_transactions"] == 3

    # 2. By Category Endpoint
    resp_cat = client.get("/api/v1/analytics/by-category?month=8&year=2026", headers=headers)
    assert resp_cat.status_code == 200
    cat_payload = resp_cat.json()
    assert len(cat_payload["categories"]) >= 1
    food_cat = next((c for c in cat_payload["categories"] if c["category"] == "Food"), None)
    assert food_cat is not None
    assert float(food_cat["total_spent"]) == 50.00

    # 3. Budget Status Endpoint
    resp_bud = client.get("/api/v1/analytics/budget-status?month=8&year=2026", headers=headers)
    assert resp_bud.status_code == 200

    # 4. Cash Flow Endpoint
    resp_flow = client.get("/api/v1/analytics/cash-flow?month=8&year=2026", headers=headers)
    assert resp_flow.status_code == 200
    assert len(resp_flow.json()["points"]) >= 1
