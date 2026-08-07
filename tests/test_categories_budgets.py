import uuid
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def get_auth_headers(email: str = None) -> dict:
    if email is None:
        email = f"user_{uuid.uuid4().hex[:8]}@example.com"
    password = "password123"

    client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "full_name": "Category Tester"}
    )
    login_resp = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password}
    )
    token = login_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_category_and_budget_lifecycle():
    headers = get_auth_headers()

    # 1. Create Category
    cat_resp = client.post(
        "/api/v1/categories/",
        json={"name": "Groceries"},
        headers=headers
    )
    assert cat_resp.status_code == 201
    cat_data = cat_resp.json()
    assert cat_data["name"] == "Groceries"
    category_id = cat_data["id"]

    # 2. Duplicate Category -> 400 Bad Request
    dup_resp = client.post(
        "/api/v1/categories/",
        json={"name": "Groceries"},
        headers=headers
    )
    assert dup_resp.status_code == 400

    # 3. List Categories
    list_cat = client.get("/api/v1/categories/", headers=headers)
    assert list_cat.status_code == 200
    assert len(list_cat.json()) >= 1

    # 4. Set Budget
    budget_resp = client.post(
        "/api/v1/budgets/",
        json={
            "category_id": category_id,
            "monthly_limit": 500.00,
            "month": 8,
            "year": 2026,
        },
        headers=headers
    )
    assert budget_resp.status_code == 201
    budget_data = budget_resp.json()
    assert float(budget_data["monthly_limit"]) == 500.00
    assert budget_data["category_id"] == category_id

    # 5. List Budgets
    list_budgets = client.get("/api/v1/budgets/", headers=headers)
    assert list_budgets.status_code == 200
    assert len(list_budgets.json()) >= 1

    # 6. Delete Category
    del_cat = client.delete(f"/api/v1/categories/{category_id}", headers=headers)
    assert del_cat.status_code == 204
