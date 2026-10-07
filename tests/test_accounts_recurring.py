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
        json={"email": email, "password": password, "full_name": "Account Tester"}
    )
    login_resp = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password}
    )
    token = login_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_accounts_lifecycle_and_balance_calculation():
    headers = get_auth_headers()

    # 1. Accounts list (should have auto-seeded accounts)
    acc_list_resp = client.get("/api/v1/accounts/", headers=headers)
    assert acc_list_resp.status_code == 200
    acc_data = acc_list_resp.json()
    assert len(acc_data["accounts"]) >= 1

    # 2. Create custom Account
    create_acc_resp = client.post(
        "/api/v1/accounts/",
        json={"name": "Revolut Euro", "account_type": "bank", "currency": "EUR", "initial_balance": 1000.00},
        headers=headers
    )
    assert create_acc_resp.status_code == 201
    new_acc = create_acc_resp.json()
    assert new_acc["name"] == "Revolut Euro"
    assert float(new_acc["initial_balance"]) == 1000.00
    acc_id = new_acc["id"]

    # 3. Add Income transaction to this account (+500)
    income_resp = client.post(
        "/api/v1/expenses/",
        json={"title": "Client Payout", "amount": 500.00, "transaction_type": "income", "account_id": acc_id},
        headers=headers
    )
    assert income_resp.status_code == 201

    # 4. Add Expense transaction to this account (-150)
    exp_resp = client.post(
        "/api/v1/expenses/",
        json={"title": "Weekly Groceries", "amount": 150.00, "transaction_type": "expense", "account_id": acc_id},
        headers=headers
    )
    assert exp_resp.status_code == 201

    # 5. Check calculated current balance: 1000 + 500 - 150 = 1350
    single_acc = client.get(f"/api/v1/accounts/{acc_id}", headers=headers)
    assert single_acc.status_code == 200
    assert float(single_acc.json()["current_balance"]) == 1350.00
    assert float(single_acc.json()["total_income"]) == 500.00
    assert float(single_acc.json()["total_expenses"]) == 150.00


def test_recurring_transactions_lifecycle():
    headers = get_auth_headers()

    # 1. Create Recurring Rule
    rt_resp = client.post(
        "/api/v1/recurring/",
        json={
            "title": "Apartment Rent",
            "amount": 750.00,
            "transaction_type": "expense",
            "frequency": "monthly",
            "day_of_month": 1,
            "is_active": True,
        },
        headers=headers
    )
    assert rt_resp.status_code == 201
    rt_data = rt_resp.json()
    assert rt_data["title"] == "Apartment Rent"
    assert float(rt_data["amount"]) == 750.00
    rt_id = rt_data["id"]

    # 2. List Recurring Rules
    list_resp = client.get("/api/v1/recurring/", headers=headers)
    assert list_resp.status_code == 200
    assert len(list_resp.json()) >= 1

    # 3. Upcoming Schedule endpoint
    upcoming_resp = client.get("/api/v1/recurring/upcoming?days=30", headers=headers)
    assert upcoming_resp.status_code == 200
    upcoming_payload = upcoming_resp.json()
    assert "items" in upcoming_payload
    assert "total_upcoming_expenses" in upcoming_payload

    # 4. Delete Recurring Rule
    del_resp = client.delete(f"/api/v1/recurring/{rt_id}", headers=headers)
    assert del_resp.status_code == 204


def test_user_profile_update():
    headers = get_auth_headers()

    patch_resp = client.patch(
        "/api/v1/auth/me",
        json={"full_name": "Rehan Multani", "default_currency": "EUR"},
        headers=headers
    )
    assert patch_resp.status_code == 200
    updated_user = patch_resp.json()
    assert updated_user["full_name"] == "Rehan Multani"
    assert updated_user["default_currency"] == "EUR"
