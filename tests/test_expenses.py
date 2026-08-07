import uuid
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def get_auth_headers(email: str = None) -> dict:
    if email is None:
        email = f"user_{uuid.uuid4().hex[:8]}@example.com"
    password = "password123"

    # Register & Login
    client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "full_name": "Expense Tester"}
    )
    login_resp = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password}
    )
    token = login_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_expense_crud_lifecycle():
    headers = get_auth_headers()

    # 1. Create Expense
    create_resp = client.post(
        "/api/v1/expenses/",
        json={"title": "Starbucks Coffee", "amount": 5.50, "category": "Food"},
        headers=headers
    )
    assert create_resp.status_code == 201
    expense = create_resp.json()
    assert expense["title"] == "Starbucks Coffee"
    assert float(expense["amount"]) == 5.50
    expense_id = expense["id"]

    # 2. Get All Expenses
    list_resp = client.get("/api/v1/expenses/", headers=headers)
    assert list_resp.status_code == 200
    assert len(list_resp.json()) >= 1

    # 3. Get Expense by ID
    get_resp = client.get(f"/api/v1/expenses/{expense_id}", headers=headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["title"] == "Starbucks Coffee"

    # 4. Update Expense
    update_resp = client.put(
        f"/api/v1/expenses/{expense_id}",
        json={"title": "Starbucks Reserve Coffee", "amount": 7.50},
        headers=headers
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["title"] == "Starbucks Reserve Coffee"
    assert float(update_resp.json()["amount"]) == 7.50

    # 5. Delete Expense
    del_resp = client.delete(f"/api/v1/expenses/{expense_id}", headers=headers)
    assert del_resp.status_code == 204

    # 6. Verify Expense is gone
    get_gone = client.get(f"/api/v1/expenses/{expense_id}", headers=headers)
    assert get_gone.status_code == 404


def test_expense_user_isolation():
    """Ensure User B cannot view or delete User A's expense."""
    headers_user_a = get_auth_headers()
    headers_user_b = get_auth_headers()

    # User A creates an expense
    create_resp = client.post(
        "/api/v1/expenses/",
        json={"title": "User A Private Expense", "amount": 100.00},
        headers=headers_user_a
    )
    expense_id = create_resp.json()["id"]

    # User B tries to read User A's expense -> 404 Not Found
    resp_b_get = client.get(f"/api/v1/expenses/{expense_id}", headers=headers_user_b)
    assert resp_b_get.status_code == 404

    # User B tries to delete User A's expense -> 404 Not Found
    resp_b_del = client.delete(f"/api/v1/expenses/{expense_id}", headers=headers_user_b)
    assert resp_b_del.status_code == 404
