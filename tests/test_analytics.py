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


def test_october_2026_income_and_expense_scenario():
    """
    Test exact user scenario:
    Account €1,000 + Income €2,100 + Expenses €50 + €31 in October 2026
    → Balance €3,019, Income €2,100, Expenses €81, Net €2,019, Savings rate 96.1%
    """
    headers = get_auth_headers()

    # 1. Create Account with initial balance 1000.00
    acct_resp = client.post(
        "/api/v1/accounts/",
        json={"name": "Main Wallet", "account_type": "bank", "currency": "EUR", "initial_balance": 1000.00},
        headers=headers,
    )
    assert acct_resp.status_code == 201
    acct_id = acct_resp.json()["id"]

    # 2. Add Income: Salary €2,100
    inc_resp = client.post(
        "/api/v1/expenses/",
        json={
            "title": "Salary",
            "amount": 2100.00,
            "transaction_type": "income",
            "account_id": acct_id,
            "category": "Salary",
            "expense_date": "2026-10-05T12:00:00",
        },
        headers=headers,
    )
    assert inc_resp.status_code == 201
    assert float(inc_resp.json()["amount"]) == 2100.00

    # 3. Add Expense: Groceries €50
    exp1_resp = client.post(
        "/api/v1/expenses/",
        json={
            "title": "Groceries",
            "amount": 50.00,
            "transaction_type": "expense",
            "account_id": acct_id,
            "category": "Food & Dining",
            "expense_date": "2026-10-06T12:00:00",
        },
        headers=headers,
    )
    assert exp1_resp.status_code == 201
    assert float(exp1_resp.json()["amount"]) == 50.00

    # 4. Add Expense: Transport €31
    exp2_resp = client.post(
        "/api/v1/expenses/",
        json={
            "title": "Transport",
            "amount": 31.00,
            "transaction_type": "expense",
            "account_id": acct_id,
            "category": "Transport",
            "expense_date": "2026-10-07T12:00:00",
        },
        headers=headers,
    )
    assert exp2_resp.status_code == 201
    assert float(exp2_resp.json()["amount"]) == 31.00

    # 5. Check Analytics Summary for October 2026
    resp_sum = client.get("/api/v1/analytics/summary?month=10&year=2026", headers=headers)
    assert resp_sum.status_code == 200
    sum_data = resp_sum.json()
    assert float(sum_data["total_income"]) == 2100.00
    assert float(sum_data["total_spent"]) == 81.00
    assert float(sum_data["net_savings"]) == 2019.00
    assert sum_data["savings_rate"] == 96.1
    assert sum_data["total_transactions"] == 3

    # 6. Check Accounts: Main Wallet balance == 1000 + 2100 - 81 == 3019.00
    resp_accts = client.get("/api/v1/accounts/", headers=headers)
    assert resp_accts.status_code == 200
    accts_data = resp_accts.json()
    wallet = next(a for a in accts_data["accounts"] if a["id"] == acct_id)
    assert float(wallet["current_balance"]) == 3019.00
    assert float(wallet["total_income"]) == 2100.00
    assert float(wallet["total_expenses"]) == 81.00

    # 7. Check Expenses List totals: ensure both total_income and total_expenses are reported
    tx_list = client.get("/api/v1/expenses/?page_size=10", headers=headers)
    assert tx_list.status_code == 200
    list_data = tx_list.json()
    assert float(list_data["total_income"]) == 2100.00
    assert float(list_data["total_expenses"]) == 81.00

    # 8. Filter by transaction_type=expense: list items should be 2, but totals still reflect user activity
    tx_expenses_tab = client.get("/api/v1/expenses/?transaction_type=expense&page_size=10", headers=headers)
    assert tx_expenses_tab.status_code == 200
    exp_tab_data = tx_expenses_tab.json()
    assert len(exp_tab_data["items"]) == 2
    assert float(exp_tab_data["total_expenses"]) == 81.00
    assert float(exp_tab_data["total_income"]) == 2100.00


def test_transfers_do_not_affect_monthly_analytics():
    """Transfers between accounts should update account balances but NOT inflate monthly income or spending."""
    headers = get_auth_headers()

    # Create 2 accounts
    a1 = client.post(
        "/api/v1/accounts/",
        json={"name": "Bank A", "account_type": "bank", "currency": "EUR", "initial_balance": 500.00},
        headers=headers,
    ).json()
    a2 = client.post(
        "/api/v1/accounts/",
        json={"name": "Savings B", "account_type": "savings", "currency": "EUR", "initial_balance": 200.00},
        headers=headers,
    ).json()

    # Record Transfer out from Bank A
    client.post(
        "/api/v1/expenses/",
        json={
            "title": f"Transfer to {a2['name']}",
            "amount": 100.00,
            "transaction_type": "transfer",
            "account_id": a1["id"],
            "expense_date": "2026-10-10T12:00:00",
        },
        headers=headers,
    )

    # Record Transfer in to Savings B
    client.post(
        "/api/v1/expenses/",
        json={
            "title": f"Transfer from {a1['name']}",
            "amount": 100.00,
            "transaction_type": "transfer",
            "account_id": a2["id"],
            "expense_date": "2026-10-10T12:00:00",
        },
        headers=headers,
    )

    # Check Analytics: income and spent should be 0.00
    summary = client.get("/api/v1/analytics/summary?month=10&year=2026", headers=headers).json()
    assert float(summary["total_income"]) == 0.00
    assert float(summary["total_spent"]) == 0.00

    # Check Accounts: Bank A should have 400.00, Savings B should have 300.00
    accts = client.get("/api/v1/accounts/", headers=headers).json()["accounts"]
    bank_a = next(a for a in accts if a["id"] == a1["id"])
    savings_b = next(a for a in accts if a["id"] == a2["id"])
    assert float(bank_a["current_balance"]) == 400.00
    assert float(savings_b["current_balance"]) == 300.00
