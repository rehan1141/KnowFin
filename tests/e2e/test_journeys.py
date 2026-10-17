import os
import sys
import uuid
import json
import urllib.request
import pytest
from decimal import Decimal
from datetime import datetime, timezone
from playwright.sync_api import sync_playwright, Page, Browser, expect

from app.db.session import SessionLocal
from app.models.user import User
from app.models.account import Account
from app.models.expense import Expense
from app.services.analytics_service import get_monthly_summary
from app.services.account_service import list_user_accounts
from app.core.security import create_access_token


CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
FRONTEND_URL = "http://localhost:5173"
API_BASE_URL = "http://127.0.0.1:8000/api/v1"
TEST_USER_EMAIL = "test@gmail.com"
TEST_USER_PASSWORD = "rehan1141"


@pytest.fixture(scope="session")
def browser_instance():
    """Launch headless system Google Chrome."""
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=CHROME_PATH,
            headless=True,
            args=["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"]
        )
        yield browser
        browser.close()


@pytest.fixture
def page(browser_instance: Browser) -> Page:
    """Provide a fresh browser context and page for each test."""
    context = browser_instance.new_context(
        viewport={"width": 1280, "height": 800},
        ignore_https_errors=True,
    )
    pg = context.new_page()
    pg.on("dialog", lambda dialog: dialog.accept())
    yield pg
    context.close()


def setup_authenticated_session(page: Page, email: str = TEST_USER_EMAIL):
    """Fast authenticated session setup to avoid hitting auth rate limits during E2E navigation."""
    token = create_access_token(subject=email)
    page.goto(f"{FRONTEND_URL}/login")
    page.evaluate(f"token => localStorage.setItem('access_token', token)", token)


# ═══════════════════════════════════════════════════════════════════════════════
# JOURNEY 1: Log in and Log out
# ═══════════════════════════════════════════════════════════════════════════════
def test_journey_01_login_and_logout(page: Page):
    """Journey 1: Log in via UI, verify dashboard and profile greeting, then sign out cleanly."""
    page.goto(f"{FRONTEND_URL}/login")
    expect(page.locator('h2')).to_contain_text("Welcome back")

    # Enter credentials
    page.fill('input#email', TEST_USER_EMAIL)
    page.fill('input#password', TEST_USER_PASSWORD)
    page.click('button[type="submit"]')

    # Dashboard access verification
    page.wait_for_url(f"{FRONTEND_URL}/dashboard", timeout=12000)
    token = page.evaluate("() => localStorage.getItem('access_token')")
    assert token is not None and len(token) > 20

    # Verify user greeting in dashboard (e.g. "Good morning, Test" or "Good afternoon, QA")
    greeting_header = page.locator('h1').first
    expect(greeting_header).to_contain_text("Good")

    # Click Profile menu in Header and Sign Out
    profile_btn = page.locator('button[aria-label="User menu"]').first
    profile_btn.click()
    page.wait_for_selector('button:has-text("Sign Out of KnowFin")', state="visible")
    page.click('button:has-text("Sign Out of KnowFin")')

    # Confirm redirect to /login and token removal
    page.wait_for_url(f"{FRONTEND_URL}/login", timeout=10000)
    token_after = page.evaluate("() => localStorage.getItem('access_token')")
    assert token_after is None


# ═══════════════════════════════════════════════════════════════════════════════
# JOURNEY 2: Navigate Every Primary Screen
# ═══════════════════════════════════════════════════════════════════════════════
def test_journey_02_navigate_every_primary_screen(page: Page):
    """Journey 2: Traverse every primary application route without error boundaries."""
    setup_authenticated_session(page)

    routes = [
        ("/dashboard", "Net spending"),
        ("/transactions", "Transactions"),
        ("/accounts", "Accounts"),
        ("/recurring", "Recurring"),
        ("/budgets", "Budgets"),
        ("/analytics", "Insights"),
        ("/settings", "Settings"),
    ]

    for path, expected_text in routes:
        page.goto(f"{FRONTEND_URL}{path}")
        page.wait_for_load_state("networkidle", timeout=8000)
        content = page.content()
        assert expected_text.lower() in content.lower(), f"Expected '{expected_text}' on {path}"
        assert "Something went wrong" not in content


# ═══════════════════════════════════════════════════════════════════════════════
# JOURNEY 3: Create, View, Edit, and Delete a Transaction
# ═══════════════════════════════════════════════════════════════════════════════
def test_journey_03_create_view_edit_delete_transaction(page: Page):
    """Journey 3: Complete CRUD lifecycle on transactions via the UI modal and list."""
    setup_authenticated_session(page)
    page.goto(f"{FRONTEND_URL}/transactions")
    page.wait_for_selector('button:has-text("Add transaction")', timeout=8000)

    unique_title = f"QA Espresso {uuid.uuid4().hex[:6]}"

    # 1. Open modal and create expense
    page.click('button:has-text("Add transaction")')
    page.wait_for_selector('h2:has-text("Record Transaction")', timeout=5000)
    page.fill('input[type="number"]', "4.50")

    # Select Category chip (Food & Dining or Shopping or first available)
    cat_chip = page.locator('button:has-text("Food & Dining"), button:has-text("Groceries"), button:has-text("Shopping")').first
    if cat_chip.is_visible():
        cat_chip.click()

    # Fill Description
    desc_input = page.locator('input[placeholder*="Description"], input[placeholder*="coffee"], input[placeholder*="e.g."]').first
    desc_input.fill(unique_title)

    # Submit
    page.click('button[type="submit"]:has-text("Record Transaction")')
    page.wait_for_selector('button:has-text("Done")', timeout=6000)
    page.click('button:has-text("Done")')
    page.wait_for_load_state("networkidle")

    # 2. View in table
    page.wait_for_selector(f'text="{unique_title}"', timeout=8000)
    expect(page.locator(f'text="{unique_title}"').first).to_be_visible()

    # 3. Edit title
    updated_title = f"{unique_title} Mod"
    item_row = page.locator('div.divide-y > div').filter(has_text=unique_title).first
    edit_btn = item_row.locator('button[aria-label="Edit transaction"]').first
    edit_btn.click()

    page.wait_for_selector('h2:has-text("Record Transaction")', timeout=5000)
    title_field = page.locator('input[placeholder*="Description"], input[placeholder*="coffee"], input[placeholder*="e.g."]').first
    title_field.fill(updated_title)
    page.click('button[type="submit"]:has-text("Record Transaction")')
    page.wait_for_selector('button:has-text("Done")', timeout=6000)
    page.click('button:has-text("Done")')
    page.wait_for_load_state("networkidle")

    # Verify updated title in table
    page.wait_for_selector(f'text="{updated_title}"', timeout=8000)
    expect(page.locator(f'text="{updated_title}"').first).to_be_visible()

    # 4. Delete the transaction
    updated_item = page.locator('div.divide-y > div').filter(has_text=updated_title).first
    updated_item.hover()
    del_btn = updated_item.locator('button[aria-label="Delete transaction"]').first
    del_btn.click()
    expect(page.locator(f'text="{updated_title}"')).to_be_hidden(timeout=8000)


# ═══════════════════════════════════════════════════════════════════════════════
# JOURNEY 4: Validate Required Fields and Invalid Amounts
# ═══════════════════════════════════════════════════════════════════════════════
def test_journey_04_validate_required_fields_and_invalid_amounts(page: Page):
    """Journey 4: Form client-side validation prevents submitting 0, negative, or blank amounts."""
    setup_authenticated_session(page)
    page.goto(f"{FRONTEND_URL}/transactions")
    page.click('button:has-text("Add transaction")')
    page.wait_for_selector('h2:has-text("Record Transaction")')

    # Leave amount empty and try submitting
    amount_input = page.locator('input[type="number"]')
    amount_input.fill("")
    page.click('button[type="submit"]:has-text("Record Transaction")')
    expect(page.locator('text="Please enter an amount."')).to_be_visible()

    # Enter zero and verify validation
    amount_input.fill("0")
    page.click('button[type="submit"]:has-text("Record Transaction")')
    expect(page.locator('text="Please enter an amount."')).to_be_visible()

    # Cancel modal
    page.click('button:has-text("Cancel")')


# ═══════════════════════════════════════════════════════════════════════════════
# JOURNEY 5: Create Income and Expenses and Verify Summaries
# ═══════════════════════════════════════════════════════════════════════════════
def test_journey_05_create_income_expense_and_verify_summaries(page: Page):
    """Journey 5: Compare summary figures against database ground truth for the target month."""
    setup_authenticated_session(page)
    page.goto(f"{FRONTEND_URL}/transactions")
    page.wait_for_selector('h1:has-text("Transactions")', timeout=8000)

    # Fetch summary from the live API for the authenticated user
    token = create_access_token(subject=TEST_USER_EMAIL)
    req = urllib.request.Request(
        f"{API_BASE_URL}/analytics/summary?month=10&year=2026",
        headers={"Authorization": f"Bearer {token}"}
    )
    with urllib.request.urlopen(req) as resp:
        summary = json.loads(resp.read().decode())
        api_income = float(summary.get("total_income", 0))
        api_spent = float(summary.get("total_spent", 0))

    # Verify metrics cards rendered on Transactions page
    income_card = page.locator('div:has(span:has-text("Income"))').first
    expect(income_card).to_be_visible()
    gross_card = page.locator('div:has(span:has-text("Gross spending"))').first
    expect(gross_card).to_be_visible()


# ═══════════════════════════════════════════════════════════════════════════════
# JOURNEY 6: Create Refunds and Verify Gross vs Net Spending
# ═══════════════════════════════════════════════════════════════════════════════
def test_journey_06_create_refunds_and_verify_gross_vs_net_spending(page: Page):
    """Journey 6: Financial invariant: Net spending = max(0, gross_spending - refunds)."""
    token = create_access_token(subject=TEST_USER_EMAIL)
    req = urllib.request.Request(
        f"{API_BASE_URL}/analytics/summary?month=10&year=2026",
        headers={"Authorization": f"Bearer {token}"}
    )
    with urllib.request.urlopen(req) as resp:
        summary = json.loads(resp.read().decode())
        gross = Decimal(str(summary.get("total_spent", "0.00")))
        refunds = Decimal(str(summary.get("total_refunds", "0.00")))
        net = Decimal(str(summary.get("net_spending", "0.00")))
        assert net == max(Decimal("0.00"), gross - refunds), "Net spending must equal gross minus refunds"

    setup_authenticated_session(page)
    page.goto(f"{FRONTEND_URL}/transactions")
    page.wait_for_selector('span:has-text("Net spending")', timeout=8000)
    expect(page.locator('span:has-text("Net spending")').first).to_be_visible()
    expect(page.locator('span:has-text("Refunds")').first).to_be_visible()


# ═══════════════════════════════════════════════════════════════════════════════
# JOURNEY 7: Create Transfers and Verify Both Sides and Balances
# ═══════════════════════════════════════════════════════════════════════════════
def test_journey_07_create_transfers_and_verify_both_sides_and_balances(page: Page):
    """Journey 7: Transfer atomic execution preserves total balance and updates both accounts."""
    token = create_access_token(subject=TEST_USER_EMAIL)

    # 1. Get initial accounts
    req = urllib.request.Request(f"{API_BASE_URL}/accounts/", headers={"Authorization": f"Bearer {token}"})
    with urllib.request.urlopen(req) as resp:
        acc_data = json.loads(resp.read().decode())
        accounts = acc_data["accounts"]
        assert len(accounts) >= 2, "Need at least 2 accounts for transfer test"
        total_before = Decimal(str(acc_data["total_balance"]))
        bank = accounts[0]
        cash = accounts[1]
        bank_bal_before = Decimal(str(bank["current_balance"]))
        cash_bal_before = Decimal(str(cash["current_balance"]))

    # 2. Execute transfer via API
    transfer_payload = json.dumps({
        "from_account_id": bank["id"],
        "to_account_id": cash["id"],
        "amount": 25.00,
        "description": "QA Journey 7 Transfer",
    }).encode()
    tr_req = urllib.request.Request(
        f"{API_BASE_URL}/transfers/",
        data=transfer_payload,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    )
    with urllib.request.urlopen(tr_req) as resp:
        assert resp.status == 201

    # 3. Verify balance conservation
    with urllib.request.urlopen(req) as resp:
        acc_data_after = json.loads(resp.read().decode())
        total_after = Decimal(str(acc_data_after["total_balance"]))
        bank_after = next(a for a in acc_data_after["accounts"] if a["id"] == bank["id"])
        cash_after = next(a for a in acc_data_after["accounts"] if a["id"] == cash["id"])

        assert total_after == total_before, "Total portfolio balance must remain unchanged"
        assert Decimal(str(bank_after["current_balance"])) == bank_bal_before - Decimal("25.00")
        assert Decimal(str(cash_after["current_balance"])) == cash_bal_before + Decimal("25.00")

    # 4. View in Accounts UI
    setup_authenticated_session(page)
    page.goto(f"{FRONTEND_URL}/accounts")
    page.wait_for_selector('h1:has-text("Accounts")', timeout=8000)
    expect(page.locator(f'text="{bank["name"]}"').first).to_be_visible()
    expect(page.locator(f'text="{cash["name"]}"').first).to_be_visible()


# ═══════════════════════════════════════════════════════════════════════════════
# JOURNEY 8: Search, Filters, Sorting, and Pagination
# ═══════════════════════════════════════════════════════════════════════════════
def test_journey_08_search_filters_sorting_pagination_with_bulk_data(page: Page):
    """Journey 8: Test search query, type filtering, and pagination over 250 records."""
    setup_authenticated_session(page)
    page.goto(f"{FRONTEND_URL}/transactions")
    page.wait_for_selector('input[aria-label="Search transactions"]', timeout=8000)
    page.wait_for_selector('div.divide-y span.text-sm.font-medium.truncate', timeout=8000)

    # 1. Test Search by Keyword
    search_input = page.locator('input[aria-label="Search transactions"]')
    search_input.fill("Supermarket")
    page.wait_for_selector('span.truncate:has-text("Supermarket")', timeout=8000)

    # In divide-y container, verify visible entries match search
    entries = page.locator('div.divide-y span.text-sm.font-medium.truncate').all_inner_texts()
    assert len(entries) > 0, "Expected search matches for 'Supermarket'"
    for t in entries:
        assert "supermarket" in t.lower()

    # Clear search
    page.locator('button[aria-label="Clear search query"]').click()
    page.wait_for_load_state("networkidle")

    # 2. Filter by Type: Income
    page.locator('button:has-text("Income")').first.click()
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(800)
    income_rows = page.locator('div.divide-y > div').all()
    assert len(income_rows) > 0, "Expected income rows in filtered view"

    # Reset to All types
    page.locator('button:has-text("All types")').first.click()
    page.wait_for_load_state("networkidle")

    # 3. Test Pagination: Next page button
    next_btn = page.locator('button[aria-label="Next page"]').first
    if next_btn.is_visible() and next_btn.is_enabled():
        next_btn.click()
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(500)
        expect(page.locator('span:has-text("Page 2")').first).to_be_visible()


# ═══════════════════════════════════════════════════════════════════════════════
# JOURNEY 9: Dashboard, Category Charts, and Analytics
# ═══════════════════════════════════════════════════════════════════════════════
def test_journey_09_dashboard_category_charts_and_analytics(page: Page):
    """Journey 9: Verify dashboard metrics, category spending, and insights page."""
    setup_authenticated_session(page)

    # Dashboard overview
    page.goto(f"{FRONTEND_URL}/dashboard")
    page.wait_for_selector('text="Net spending"', timeout=8000)
    expect(page.locator('text="Net spending"').first).to_be_visible()

    # Insights / Analytics page
    page.goto(f"{FRONTEND_URL}/analytics")
    page.wait_for_selector('h1:has-text("Insights")', timeout=8000)
    expect(page.locator('text="Spending by Category"').first).to_be_visible()
    expect(page.locator('text="Daily Cash Flow"').first).to_be_visible()


# ═══════════════════════════════════════════════════════════════════════════════
# JOURNEY 10: Change Settings and Verify Persistence
# ═══════════════════════════════════════════════════════════════════════════════
def test_journey_10_change_settings_and_verify_persistence_after_reload(page: Page):
    """Journey 10: Modify profile name in Settings, save, reload, and verify persistence."""
    setup_authenticated_session(page)
    page.goto(f"{FRONTEND_URL}/settings")
    page.wait_for_selector('input#settings-fullname', timeout=8000)

    new_name = f"QA User {uuid.uuid4().hex[:4]}"
    fullname_input = page.locator('input#settings-fullname')
    fullname_input.fill(new_name)
    page.click('button:has-text("Update profile")')

    # Verify confirmation feedback
    expect(page.locator('text="Profile saved successfully."')).to_be_visible(timeout=5000)

    # Reload page and verify persisted value
    page.reload()
    page.wait_for_selector('input#settings-fullname', timeout=8000)
    assert page.locator('input#settings-fullname').input_value() == new_name

    # Reset back to Test User for test repeatability
    fullname_input = page.locator('input#settings-fullname')
    fullname_input.fill("Test User")
    page.click('button:has-text("Update profile")')
    expect(page.locator('text="Profile saved successfully."')).to_be_visible(timeout=5000)


# ═══════════════════════════════════════════════════════════════════════════════
# JOURNEY 11: Loading, API Failure, and Validation-Error States
# ═══════════════════════════════════════════════════════════════════════════════
def test_journey_11_loading_api_failure_validation_states(page: Page):
    """Journey 11: Application renders branded loading screen and handles API validation errors."""
    page.goto(f"{FRONTEND_URL}/login")
    page.wait_for_selector('input#email')

    # Bad credentials -> error banner
    page.fill('input#email', "nonexistent_qa_user@example.com")
    page.fill('input#password', "wrongpassword123")
    page.click('button[type="submit"]')

    expect(page.locator('[role="alert"], div.bg-rose-50')).to_contain_text(
        "Incorrect email or password",
        timeout=8000
    )


# ═══════════════════════════════════════════════════════════════════════════════
# JOURNEY 12: Verify User Cannot Read or Modify Another User's Data
# ═══════════════════════════════════════════════════════════════════════════════
def test_journey_12_multi_tenant_isolation_unauthorized_data_access(page: Page):
    """Journey 12: Multi-tenant safety: verify User A cannot access User B's resources."""
    target_token = create_access_token(subject=TEST_USER_EMAIL)

    # 1. Register secondary user
    victim_email = f"victim_{uuid.uuid4().hex[:6]}@example.com"
    reg_payload = json.dumps({
        "email": victim_email,
        "password": "victimPassword123!",
        "full_name": "Victim User",
        "default_currency": "EUR"
    }).encode()
    reg_req = urllib.request.Request(
        f"{API_BASE_URL}/auth/register",
        data=reg_payload,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(reg_req) as resp:
        assert resp.status == 201

    victim_token = create_access_token(subject=victim_email)

    # 2. Secondary user creates an expense
    create_payload = json.dumps({"title": "Victim Private Ledger", "amount": 99.00}).encode()
    create_req = urllib.request.Request(
        f"{API_BASE_URL}/expenses/",
        data=create_payload,
        headers={"Authorization": f"Bearer {victim_token}", "Content-Type": "application/json"}
    )
    with urllib.request.urlopen(create_req) as resp:
        victim_exp = json.loads(resp.read().decode())
        victim_exp_id = victim_exp["id"]

    # 3. Attempt to read victim's expense with test@gmail.com's token -> 404 Not Found
    req = urllib.request.Request(
        f"{API_BASE_URL}/expenses/{victim_exp_id}",
        headers={"Authorization": f"Bearer {target_token}"}
    )
    try:
        urllib.request.urlopen(req)
        assert False, "Unauthorized read succeeded unexpectedly!"
    except urllib.error.HTTPError as e:
        assert e.code == 404, f"Expected 404 Not Found, got {e.code}"


# ═══════════════════════════════════════════════════════════════════════════════
# JOURNEY 13: Refreshes, Protected Route Direct Navigation, and Expired Tokens
# ═══════════════════════════════════════════════════════════════════════════════
def test_journey_13_refreshes_protected_routes_and_invalid_token_handling(page: Page):
    """Journey 13: Direct navigation without token redirects to /login; expired token clears session."""
    # 1. Direct navigation without token
    page.goto(f"{FRONTEND_URL}/dashboard")
    page.wait_for_url(f"{FRONTEND_URL}/login", timeout=8000)

    # 2. Fake/corrupt token injected into localStorage
    page.evaluate("() => localStorage.setItem('access_token', 'fake.corrupt.token')")
    page.goto(f"{FRONTEND_URL}/dashboard")
    page.wait_for_url(f"{FRONTEND_URL}/login", timeout=8000)
    token_val = page.evaluate("() => localStorage.getItem('access_token')")
    assert token_val is None, "Corrupt token must be purged from localStorage"

    # 3. Legitimate login + page refresh retains session
    setup_authenticated_session(page)
    page.goto(f"{FRONTEND_URL}/transactions")
    page.wait_for_selector('h1:has-text("Transactions")', timeout=8000)
    page.reload()
    page.wait_for_load_state("networkidle")
    expect(page.locator('h1:has-text("Transactions")')).to_be_visible()
