import uuid
from decimal import Decimal
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def create_user_headers() -> dict:
    email = f"finance_tester_{uuid.uuid4().hex[:8]}@example.com"
    password = "password123"
    client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "full_name": "Financial Invariants Tester"}
    )
    login_resp = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password}
    )
    token = login_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_expenses_decrease_balance_and_income_increases_balance():
    headers = create_user_headers()

    # Create an account with 100.00 initial balance
    acc_resp = client.post(
        "/api/v1/accounts/",
        json={"name": "Checking", "account_type": "bank", "currency": "EUR", "initial_balance": 100.00},
        headers=headers,
    )
    assert acc_resp.status_code == 201
    acc_id = acc_resp.json()["id"]

    # 1. Expense of 30.00
    exp_resp = client.post(
        "/api/v1/expenses/",
        json={"title": "Groceries", "amount": 30.00, "transaction_type": "expense", "category": "Food", "account_id": acc_id},
        headers=headers,
    )
    assert exp_resp.status_code == 201

    # Balance should now be 70.00
    acc_check = client.get(f"/api/v1/accounts/{acc_id}", headers=headers)
    assert acc_check.status_code == 200
    assert float(acc_check.json()["current_balance"]) == 70.00

    # 2. Income of 50.00
    inc_resp = client.post(
        "/api/v1/expenses/",
        json={"title": "Freelance", "amount": 50.00, "transaction_type": "income", "category": "Salary", "account_id": acc_id},
        headers=headers,
    )
    assert inc_resp.status_code == 201

    # Balance should now be 120.00
    acc_check_2 = client.get(f"/api/v1/accounts/{acc_id}", headers=headers)
    assert acc_check_2.status_code == 200
    assert float(acc_check_2.json()["current_balance"]) == 120.00


def test_atomic_transfers_preserve_total_money_and_do_not_inflate_income_or_spending():
    headers = create_user_headers()

    acc1 = client.post(
        "/api/v1/accounts/",
        json={"name": "Main Checking", "account_type": "bank", "currency": "EUR", "initial_balance": 500.00},
        headers=headers,
    ).json()

    acc2 = client.post(
        "/api/v1/accounts/",
        json={"name": "Vault Savings", "account_type": "savings", "currency": "EUR", "initial_balance": 200.00},
        headers=headers,
    ).json()

    # Total initial money across these accounts = 700.00
    # Execute atomic transfer of 150.00 from acc1 to acc2
    transfer_resp = client.post(
        "/api/v1/transfers/",
        json={
            "from_account_id": acc1["id"],
            "to_account_id": acc2["id"],
            "amount": 150.00,
            "description": "Savings allocation",
            "date": "2026-10-15T10:00:00",
        },
        headers=headers,
    )
    assert transfer_resp.status_code == 201

    # Check updated balances
    acc1_after = client.get(f"/api/v1/accounts/{acc1['id']}", headers=headers).json()
    acc2_after = client.get(f"/api/v1/accounts/{acc2['id']}", headers=headers).json()

    assert float(acc1_after["current_balance"]) == 350.00
    assert float(acc2_after["current_balance"]) == 350.00
    assert float(acc1_after["current_balance"]) + float(acc2_after["current_balance"]) == 700.00

    # Verify monthly analytics are NOT inflated by the internal transfer
    summary_resp = client.get("/api/v1/analytics/summary?month=10&year=2026", headers=headers)
    assert summary_resp.status_code == 200
    summary = summary_resp.json()
    assert float(summary["total_income"]) == 0.00
    assert float(summary["total_spent"]) == 0.00


def test_failed_transfers_leave_neither_side_recorded():
    headers = create_user_headers()

    acc1 = client.post(
        "/api/v1/accounts/",
        json={"name": "Source Account", "account_type": "bank", "currency": "EUR", "initial_balance": 250.00},
        headers=headers,
    ).json()

    # Attempt transfer to a non-existent account ID (999999)
    bad_transfer = client.post(
        "/api/v1/transfers/",
        json={
            "from_account_id": acc1["id"],
            "to_account_id": 999999,
            "amount": 50.00,
            "description": "Should fail",
        },
        headers=headers,
    )
    assert bad_transfer.status_code in (400, 404, 422)

    # Source balance must remain 250.00
    acc1_after = client.get(f"/api/v1/accounts/{acc1['id']}", headers=headers).json()
    assert float(acc1_after["current_balance"]) == 250.00


def test_user_cannot_assign_transaction_to_another_users_account_or_category():
    headers_user_a = create_user_headers()
    headers_user_b = create_user_headers()

    # User A creates an account
    acc_a = client.post(
        "/api/v1/accounts/",
        json={"name": "User A Bank", "account_type": "bank", "currency": "EUR", "initial_balance": 500.00},
        headers=headers_user_a,
    ).json()

    # User B tries to record an expense targeting User A's account
    rogue_expense = client.post(
        "/api/v1/expenses/",
        json={"title": "Theft", "amount": 100.00, "transaction_type": "expense", "category": "General", "account_id": acc_a["id"]},
        headers=headers_user_b,
    )
    # Must be forbidden / not found
    assert rogue_expense.status_code in (400, 403, 404)

    # User A's balance must be unchanged at 500.00
    acc_a_check = client.get(f"/api/v1/accounts/{acc_a['id']}", headers=headers_user_a).json()
    assert float(acc_a_check["current_balance"]) == 500.00


def test_changing_reporting_period_does_not_alter_current_balance():
    headers = create_user_headers()

    acc = client.post(
        "/api/v1/accounts/",
        json={"name": "Checking", "account_type": "bank", "currency": "EUR", "initial_balance": 400.00},
        headers=headers,
    ).json()

    # Add expense in October 2026
    client.post(
        "/api/v1/expenses/",
        json={"title": "Oct Bill", "amount": 50.00, "transaction_type": "expense", "category": "Bills", "account_id": acc["id"], "expense_date": "2026-10-05T12:00:00"},
        headers=headers,
    )

    # Current balance is 350.00
    acc_current = client.get(f"/api/v1/accounts/{acc['id']}", headers=headers).json()
    assert float(acc_current["current_balance"]) == 350.00

    # Query analytics for month 10 vs month 9 vs month 11
    sum_oct = client.get("/api/v1/analytics/summary?month=10&year=2026", headers=headers).json()
    sum_sep = client.get("/api/v1/analytics/summary?month=9&year=2026", headers=headers).json()
    sum_nov = client.get("/api/v1/analytics/summary?month=11&year=2026", headers=headers).json()

    # In all period queries, total_balance must remain constant at 350.00
    assert float(sum_oct["total_balance"]) == float(sum_sep["total_balance"]) == float(sum_nov["total_balance"]) == 350.00


def test_refunds_distinguishable_from_income_and_net_spending_calculated_properly():
    headers = create_user_headers()

    acc = client.post(
        "/api/v1/accounts/",
        json={"name": "Main", "account_type": "bank", "currency": "EUR", "initial_balance": 300.00},
        headers=headers,
    ).json()

    # 1. Gross expense of 100.00 in Oct 2026
    client.post(
        "/api/v1/expenses/",
        json={"title": "Coat", "amount": 100.00, "transaction_type": "expense", "category": "Shopping", "account_id": acc["id"], "expense_date": "2026-10-10T12:00:00"},
        headers=headers,
    )

    # 2. Refund of 25.00 in Oct 2026
    client.post(
        "/api/v1/expenses/",
        json={"title": "Coat Refund", "amount": 25.00, "transaction_type": "refund", "category": "Shopping", "account_id": acc["id"], "expense_date": "2026-10-12T12:00:00"},
        headers=headers,
    )

    # Summary check
    summary = client.get("/api/v1/analytics/summary?month=10&year=2026", headers=headers).json()

    # Gross spending should be 100.00
    # Total refunds should be 25.00
    # Net spending should be 75.00
    # Total income should be 0.00 (refund is NOT ordinary income)
    assert float(summary.get("total_income", 0)) == 0.00
    assert float(summary.get("gross_spending", summary.get("total_spent", 0))) == 100.00
    assert float(summary.get("total_refunds", 0)) == 25.00
    assert float(summary.get("net_spending", 0)) == 75.00

    # Account balance: 300 - 100 + 25 = 225.00
    acc_check = client.get(f"/api/v1/accounts/{acc['id']}", headers=headers).json()
    assert float(acc_check["current_balance"]) == 225.00


def test_recurring_plans_do_not_inflate_monthly_spending():
    headers = create_user_headers()

    # Add active recurring plan of 60.00/month
    rec_resp = client.post(
        "/api/v1/recurring/",
        json={
            "title": "Gym Membership",
            "amount": 60.00,
            "transaction_type": "expense",
            "frequency": "monthly",
            "day_of_month": 1,
            "is_active": True,
        },
        headers=headers,
    )
    assert rec_resp.status_code == 201

    # But no actual transaction has been logged yet!
    summary = client.get("/api/v1/analytics/summary?month=10&year=2026", headers=headers).json()
    assert float(summary["total_spent"]) == 0.00
    assert float(summary.get("net_spending", 0)) == 0.00


def test_unset_opening_balance_distinguishable_from_zero():
    headers = create_user_headers()

    # 1. Unset opening balance
    acc_unset = client.post(
        "/api/v1/accounts/",
        json={"name": "Unset Account", "account_type": "bank", "currency": "EUR"},
        headers=headers,
    ).json()
    assert acc_unset["initial_balance"] is None
    assert acc_unset["current_balance"] is None
    assert acc_unset["is_balance_set"] is False

    # 2. Explicit zero opening balance
    acc_zero = client.post(
        "/api/v1/accounts/",
        json={"name": "Zero Account", "account_type": "bank", "currency": "EUR", "initial_balance": 0.00},
        headers=headers,
    ).json()
    assert float(acc_zero["initial_balance"]) == 0.00
    assert float(acc_zero["current_balance"]) == 0.00
    assert acc_zero["is_balance_set"] is True
