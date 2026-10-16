#!/usr/bin/env python3
"""
scripts/generate_bulk_transactions.py

Safe, realistic bulk transaction generator for KnowFin.
Generates ~250 realistic transactions (expenses, income, refunds, atomic transfers)
spanning the previous 12 months for an explicitly designated test user.

Safety guarantees:
- Rejects production databases or ambiguous connections.
- Requires explicit user specification (--user-id or --email).
- Seeds only using existing user accounts and categories.
- Embeds a traceable seed marker tag in notes for safe cleanup and idempotency.
- Supports --dry-run (preview without committing) and --clean (removes only seeded records).
"""

import sys
import os
import argparse
import random
from decimal import Decimal
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Tuple

# Ensure project root is in sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.db.session import SessionLocal
from app.models.user import User
from app.models.account import Account
from app.models.category import Category
from app.models.expense import Expense
from app.services.transfer_service import execute_atomic_transfer
from app.schemas.transfer import TransferCreate


DEFAULT_SEED_MARKER = "[SEED:bulk_v1]"


def verify_database_safety():
    """Verify that the target database is a safe local development/test instance."""
    db_url = settings.DATABASE_URL.lower()
    env = settings.ENVIRONMENT.lower()

    if "production" in env or "prod" in env:
        print(f"[ERROR] Database safety check failed: ENVIRONMENT is set to '{settings.ENVIRONMENT}'. Aborting.")
        sys.exit(1)

    is_local = (
        "localhost" in db_url
        or "127.0.0.1" in db_url
        or "knowfin_dev" in db_url
        or "knowfin_db" in db_url
        or "knowfin_test_db" in db_url
    )
    if not is_local:
        print(f"[ERROR] Database safety check failed: DATABASE_URL does not look like a local development database. Aborting.")
        sys.exit(1)


def parse_args():
    parser = argparse.ArgumentParser(
        description="Generate realistic bulk financial transactions for a designated KnowFin test user."
    )
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--user-id", type=int, help="Target user ID (e.g. 149)")
    group.add_argument("--email", type=str, help="Target user email (e.g. test@gmail.com)")

    parser.add_argument("--count", type=int, default=250, help="Approximate number of transactions to generate (default: 250)")
    parser.add_argument("--months", type=int, default=12, help="Span in months into the past (default: 12)")
    parser.add_argument("--seed-marker", type=str, default=DEFAULT_SEED_MARKER, help="Marker tag embedded in notes")
    parser.add_argument("--dry-run", action="store_true", help="Preview generated records without writing to the database")
    parser.add_argument("--clean", action="store_true", help="Delete previously seeded records with this marker and exit")
    parser.add_argument("--force", action="store_true", help="Overwrite/append even if seeded records already exist")

    return parser.parse_args()


def get_target_user(db, user_id: Optional[int], email: Optional[str]) -> User:
    query = db.query(User)
    if user_id is not None:
        user = query.filter(User.id == user_id).first()
    else:
        user = query.filter(User.email == email.strip().lower()).first()

    if not user:
        print(f"[ERROR] Designated user not found in database (user_id={user_id}, email={email}).")
        sys.exit(1)
    return user


def cleanup_seeded_records(db, user_id: int, seed_marker: str, dry_run: bool) -> int:
    """Safely delete only transactions tagged with the specific seed marker for this user."""
    query = db.query(Expense).filter(
        Expense.user_id == user_id,
        Expense.notes.like(f"%{seed_marker}%")
    )
    count = query.count()
    if dry_run:
        print(f"[DRY-RUN] Would delete {count} previously seeded records matching marker '{seed_marker}' for user {user_id}.")
        return count

    if count > 0:
        query.delete(synchronize_session=False)
        db.commit()
        print(f"[CLEANUP] Deleted {count} previously seeded records matching marker '{seed_marker}' for user {user_id}.")
    else:
        print(f"[CLEANUP] No records found with marker '{seed_marker}' for user {user_id}.")
    return count


def generate_transactions_data(
    user: User,
    accounts: List[Account],
    categories: List[Category],
    target_count: int,
    months: int,
    seed_marker: str,
) -> Tuple[List[Dict], List[Dict]]:
    """
    Generate realistic, varied transactions across the designated timespan.
    Returns (standalone_transactions, transfer_pairs).
    """
    random.seed(42)  # Deterministic seed for repeatable test data

    # Separate accounts
    bank_acc = next((a for a in accounts if a.account_type == "bank"), accounts[0])
    cash_acc = next((a for a in accounts if a.account_type == "cash"), accounts[min(1, len(accounts) - 1)])
    savings_acc = next((a for a in accounts if a.account_type == "savings"), accounts[-1])

    # Category mappings
    expense_cats = [c for c in categories if c.category_type == "expense" and c.parent_id is None]
    income_cats = [c for c in categories if c.category_type == "income" and c.parent_id is None]
    subcats_by_parent: Dict[int, List[Category]] = {}
    for c in categories:
        if c.parent_id is not None:
            subcats_by_parent.setdefault(c.parent_id, []).append(c)

    now = datetime.now(timezone.utc)
    start_date = now - timedelta(days=months * 30)

    standalone: List[Dict] = []
    transfers: List[Dict] = []

    # ── 1. Monthly Recurring Salary & Incomes ────────────────────────────
    # Monthly salary on ~28th of each month
    current = start_date
    while current <= now:
        salary_day = min(28, 25 + (current.month % 4))
        try:
            salary_date = current.replace(day=salary_day, hour=9, minute=0, second=0)
        except ValueError:
            salary_date = current.replace(day=25, hour=9, minute=0, second=0)

        if salary_date <= now:
            salary_cat = next((c for c in income_cats if "Salary" in c.name), income_cats[0] if income_cats else None)
            salary_sub = subcats_by_parent.get(salary_cat.id, [None])[0] if salary_cat else None
            amount = Decimal(str(random.randint(2350, 2650))) + Decimal("0.00")
            standalone.append({
                "title": "Monthly Salary Deposit",
                "amount": amount,
                "transaction_type": "income",
                "category": salary_cat.name if salary_cat else "Salary",
                "category_id": salary_cat.id if salary_cat else None,
                "subcategory_id": salary_sub.id if salary_sub else None,
                "account_id": bank_acc.id,
                "expense_date": salary_date,
                "notes": f"{seed_marker} Payroll direct deposit",
            })

            # Semi-regular freelance income (roughly every 40-50 days)
            if random.random() > 0.35:
                freelance_cat = next((c for c in income_cats if "Freelance" in c.name), income_cats[0] if income_cats else None)
                freelance_sub = subcats_by_parent.get(freelance_cat.id, [None])[0] if freelance_cat else None
                fl_amount = Decimal(str(random.choice([150, 280, 350, 420, 560, 650]))) + Decimal(".50")
                fl_date = salary_date + timedelta(days=random.randint(5, 18))
                if fl_date <= now:
                    standalone.append({
                        "title": random.choice(["UI Design Consultation", "Frontend Client Retainer", "Website Optimization", "Code Review Stipend"]),
                        "amount": fl_amount,
                        "transaction_type": "income",
                        "category": freelance_cat.name if freelance_cat else "Freelance",
                        "category_id": freelance_cat.id if freelance_cat else None,
                        "subcategory_id": freelance_sub.id if freelance_sub else None,
                        "account_id": bank_acc.id,
                        "expense_date": fl_date,
                        "notes": f"{seed_marker} Invoice payment received",
                    })

            # Fixed Monthly Rent on the 1st
            rent_cat = next((c for c in expense_cats if "Housing" in c.name), expense_cats[0] if expense_cats else None)
            rent_sub = subcats_by_parent.get(rent_cat.id, [None])[0] if rent_cat else None
            rent_date = current.replace(day=1, hour=10, minute=0, second=0)
            if start_date <= rent_date <= now:
                standalone.append({
                    "title": "Apartment Rent",
                    "amount": Decimal("720.00"),
                    "transaction_type": "expense",
                    "category": rent_cat.name if rent_cat else "Housing",
                    "category_id": rent_cat.id if rent_cat else None,
                    "subcategory_id": rent_sub.id if rent_sub else None,
                    "account_id": bank_acc.id,
                    "expense_date": rent_date,
                    "notes": f"{seed_marker} Standing order rent",
                })

            # Fixed Monthly Internet & Phone (~15th)
            bills_cat = next((c for c in expense_cats if "Bills" in c.name), expense_cats[0] if expense_cats else None)
            bills_sub = subcats_by_parent.get(bills_cat.id, [None])[0] if bills_cat else None
            bills_date = current.replace(day=15, hour=8, minute=30, second=0)
            if start_date <= bills_date <= now:
                standalone.append({
                    "title": "Fiber Internet & Mobile Bundle",
                    "amount": Decimal("59.99"),
                    "transaction_type": "expense",
                    "category": bills_cat.name if bills_cat else "Bills & Utilities",
                    "category_id": bills_cat.id if bills_cat else None,
                    "subcategory_id": bills_sub.id if bills_sub else None,
                    "account_id": bank_acc.id,
                    "expense_date": bills_date,
                    "notes": f"{seed_marker} Monthly utility bill",
                })

            # Monthly Subscriptions (Netflix, Spotify)
            sub_cat = next((c for c in expense_cats if "Subscriptions" in c.name), expense_cats[0] if expense_cats else None)
            if sub_cat and start_date <= salary_date <= now:
                standalone.append({
                    "title": "Spotify Premium Family",
                    "amount": Decimal("14.99"),
                    "transaction_type": "expense",
                    "category": sub_cat.name,
                    "category_id": sub_cat.id,
                    "subcategory_id": None,
                    "account_id": bank_acc.id,
                    "expense_date": current.replace(day=10, hour=12, minute=0, second=0),
                    "notes": f"{seed_marker} Streaming music subscription",
                })
                standalone.append({
                    "title": "Netflix Standard HD",
                    "amount": Decimal("12.99"),
                    "transaction_type": "expense",
                    "category": sub_cat.name,
                    "category_id": sub_cat.id,
                    "subcategory_id": None,
                    "account_id": bank_acc.id,
                    "expense_date": current.replace(day=22, hour=14, minute=0, second=0),
                    "notes": f"{seed_marker} Video streaming",
                })

            # Monthly Transfer to Savings Vault (~29th)
            if savings_acc and bank_acc and savings_acc.id != bank_acc.id:
                sav_date = salary_date + timedelta(days=1)
                if sav_date <= now:
                    transfers.append({
                        "from_account_id": bank_acc.id,
                        "to_account_id": savings_acc.id,
                        "amount": Decimal(str(random.choice([200, 250, 300, 350, 400]))),
                        "date": sav_date,
                        "description": f"{seed_marker} Monthly emergency savings allocation",
                    })

            # ATM Cash Withdrawal (Bank -> Cash)
            if cash_acc and bank_acc and cash_acc.id != bank_acc.id:
                atm_date = salary_date + timedelta(days=random.randint(3, 8))
                if atm_date <= now:
                    transfers.append({
                        "from_account_id": bank_acc.id,
                        "to_account_id": cash_acc.id,
                        "amount": Decimal(str(random.choice([50, 80, 100, 120]))),
                        "date": atm_date,
                        "description": f"{seed_marker} ATM cash withdrawal",
                    })

        # Advance to next month
        year = current.year + (current.month // 12)
        month = (current.month % 12) + 1
        current = current.replace(year=year, month=month, day=1)

    # ── 2. Varied Day-to-Day Expenses (Groceries, Dining, Transit, Shopping) ──
    # Catalogue of realistic synthetic expense templates
    daily_templates = [
        # Food & Dining
        ("Food & Dining", "Groceries", "Organic Supermarket", [24.50, 38.20, 52.80, 76.40, 94.10, 112.50], [bank_acc, cash_acc]),
        ("Food & Dining", "Groceries", "Neighborhood Bakery & Market", [6.50, 12.80, 15.40, 22.00], [cash_acc, bank_acc]),
        ("Food & Dining", "Restaurants", "Artisan Pizzeria Dinner", [28.00, 34.50, 42.00, 56.50], [bank_acc]),
        ("Food & Dining", "Coffee", "Specialty Espresso Bar", [3.80, 4.20, 5.50, 8.40], [bank_acc, cash_acc]),
        ("Food & Dining", "Takeaway", "Sushi Bento Box", [14.50, 18.20, 22.90], [bank_acc]),
        # Transport
        ("Transport", "Public Transport", "Metro Card Monthly Recharge", [35.00, 45.00, 50.00], [bank_acc]),
        ("Transport", "Taxi", "City Taxi Fare", [12.40, 16.80, 24.50, 31.00], [bank_acc]),
        ("Transport", "Fuel", "Gas Station Fuel", [45.00, 58.50, 65.20], [bank_acc]),
        # Shopping
        ("Shopping", "Clothing", "Weekend Apparel Store", [29.99, 45.00, 68.50, 89.90], [bank_acc]),
        ("Shopping", "Home Goods", "Home Essentials & Kitchenware", [18.20, 32.50, 47.00], [bank_acc]),
        ("Shopping", "Electronics", "Tech Accessories & Cables", [15.99, 24.50, 39.99], [bank_acc]),
        # Entertainment
        ("Entertainment", "Movies", "Cinema Tickets & Popcorn", [16.00, 22.50, 28.00], [bank_acc, cash_acc]),
        ("Entertainment", "Games", "Steam Video Game Purchase", [19.99, 29.99, 49.99], [bank_acc]),
        ("Entertainment", "Events", "Concert Hall Admission", [35.00, 50.00, 65.00], [bank_acc]),
        # Health & Personal Care
        ("Health", "Pharmacy", "Pharmacy Prescription & Vitamins", [11.50, 18.20, 27.80, 34.50], [bank_acc, cash_acc]),
        ("Personal Care", "Haircut", "Hair Salon Appointment", [25.00, 35.00, 45.00], [cash_acc, bank_acc]),
        # Education & Other
        ("Education", "Books", "Technical Books & Stationery", [18.90, 28.50, 42.00], [bank_acc]),
        ("Other", "General", "Post Office Shipping", [5.40, 8.20, 14.50], [cash_acc, bank_acc]),
    ]

    total_days = (now - start_date).days
    # Each transfer pair creates 2 records in the database, so we account for that
    needed_standalone = max(10, target_count - (len(transfers) * 2) - len(standalone) - 12)

    for i in range(needed_standalone):
        day_offset = random.randint(0, total_days)
        tx_date = start_date + timedelta(days=day_offset, hours=random.randint(8, 22), minutes=random.randint(0, 59))
        if tx_date > now:
            tx_date = now - timedelta(hours=random.randint(1, 12))

        cat_name, subcat_name, title, amount_choices, allowed_accs = random.choice(daily_templates)
        parent_cat = next((c for c in expense_cats if c.name == cat_name), expense_cats[0] if expense_cats else None)
        sub_list = subcats_by_parent.get(parent_cat.id, []) if parent_cat else []
        sub_cat = next((s for s in sub_list if s.name == subcat_name), sub_list[0] if sub_list else None)

        acc = random.choice(allowed_accs) if allowed_accs else bank_acc
        amt = Decimal(str(random.choice(amount_choices)))

        standalone.append({
            "title": title,
            "amount": amt,
            "transaction_type": "expense",
            "category": parent_cat.name if parent_cat else cat_name,
            "category_id": parent_cat.id if parent_cat else None,
            "subcategory_id": sub_cat.id if sub_cat else None,
            "account_id": acc.id,
            "expense_date": tx_date,
            "notes": f"{seed_marker} Point of sale purchase",
        })

    # ── 3. Realistic Store & Order Refunds ──────────────────────────────
    refund_templates = [
        ("Shopping", "Clothing", "Retail Store Apparel Return", [29.99, 45.00, 54.50]),
        ("Shopping", "Electronics", "Online Order Hardware Return", [19.99, 39.99, 74.00]),
        ("Food & Dining", "Restaurants", "Meal Delivery Missing Item Refund", [8.50, 12.00, 16.50]),
        ("Transport", "Taxi", "Ride Cancellation Fee Refund", [6.50, 10.00, 14.20]),
        ("Entertainment", "Events", "Cancelled Event Ticket Refund", [35.00, 50.00]),
    ]

    for j in range(12):
        day_offset = random.randint(10, total_days)
        ref_date = start_date + timedelta(days=day_offset, hours=random.randint(10, 18))
        if ref_date > now:
            ref_date = now - timedelta(days=random.randint(1, 5))

        cat_name, subcat_name, title, amount_choices = random.choice(refund_templates)
        parent_cat = next((c for c in expense_cats if c.name == cat_name), expense_cats[0] if expense_cats else None)
        sub_list = subcats_by_parent.get(parent_cat.id, []) if parent_cat else []
        sub_cat = next((s for s in sub_list if s.name == subcat_name), sub_list[0] if sub_list else None)
        amt = Decimal(str(random.choice(amount_choices)))

        standalone.append({
            "title": title,
            "amount": amt,
            "transaction_type": "refund",
            "category": parent_cat.name if parent_cat else cat_name,
            "category_id": parent_cat.id if parent_cat else None,
            "subcategory_id": sub_cat.id if sub_cat else None,
            "account_id": bank_acc.id,
            "expense_date": ref_date,
            "notes": f"{seed_marker} Customer service merchant refund",
        })

    # Sort standalone chronologically
    standalone.sort(key=lambda x: x["expense_date"])
    transfers.sort(key=lambda x: x["date"])

    return standalone, transfers


def main():
    verify_database_safety()
    args = parse_args()

    db = SessionLocal()
    try:
        user = get_target_user(db, args.user_id, args.email)
        print(f"[INFO] Target user confirmed: ID={user.id}, Email='{user.email}', Name='{user.full_name}'")

        if args.clean:
            cleanup_seeded_records(db, user.id, args.seed_marker, args.dry_run)
            return

        # Check existing seeded records
        existing_count = db.query(Expense).filter(
            Expense.user_id == user.id,
            Expense.notes.like(f"%{args.seed_marker}%")
        ).count()

        if existing_count > 0 and not args.force and not args.dry_run:
            print(f"[WARN] User {user.id} already has {existing_count} transactions with marker '{args.seed_marker}'.")
            print("       To prevent duplicate seeding, run with --force to append or --clean first.")
            return

        # Fetch user's existing accounts and categories
        accounts = db.query(Account).filter(Account.user_id == user.id, Account.is_active == True).all()
        if not accounts:
            print(f"[ERROR] Target user has no active accounts in the database. Cannot seed transactions.")
            sys.exit(1)

        categories = db.query(Category).filter(Category.user_id == user.id).all()
        if not categories:
            print(f"[ERROR] Target user has no categories in the database. Cannot seed transactions.")
            sys.exit(1)

        print(f"[INFO] Generating realistic dataset for user {user.id} over the last {args.months} months...")
        standalone_txs, transfer_pairs = generate_transactions_data(
            user=user,
            accounts=accounts,
            categories=categories,
            target_count=args.count,
            months=args.months,
            seed_marker=args.seed_marker,
        )

        total_records = len(standalone_txs) + (len(transfer_pairs) * 2)

        # Compute summary metrics
        counts_by_type = {"expense": 0, "income": 0, "refund": 0, "transfer": len(transfer_pairs) * 2}
        totals_by_type = {"expense": Decimal("0.00"), "income": Decimal("0.00"), "refund": Decimal("0.00"), "transfer": Decimal("0.00")}

        for tx in standalone_txs:
            ttype = tx["transaction_type"]
            counts_by_type[ttype] += 1
            totals_by_type[ttype] += tx["amount"]

        for tr in transfer_pairs:
            totals_by_type["transfer"] += tr["amount"] * 2

        all_dates = [tx["expense_date"] for tx in standalone_txs] + [tr["date"] for tr in transfer_pairs]
        earliest_date = min(all_dates).strftime("%Y-%m-%d") if all_dates else "N/A"
        latest_date = max(all_dates).strftime("%Y-%m-%d") if all_dates else "N/A"

        print("\n" + "=" * 65)
        print("          KNOWFIN REALISTIC BULK DATA SUMMARY")
        print("=" * 65)
        print(f"Target User ID     : {user.id} ({user.email})")
        print(f"Seed Marker        : {args.seed_marker}")
        print(f"Date Range         : {earliest_date} to {latest_date}")
        print(f"Total Transactions : {total_records} (Standalone: {len(standalone_txs)}, Transfer legs: {len(transfer_pairs)*2})")
        print("-" * 65)
        print(f"Expenses           : {counts_by_type['expense']:3d} records | Total: €{totals_by_type['expense']:,.2f}")
        print(f"Income             : {counts_by_type['income']:3d} records | Total: €{totals_by_type['income']:,.2f}")
        print(f"Refunds            : {counts_by_type['refund']:3d} records | Total: €{totals_by_type['refund']:,.2f}")
        print(f"Transfers          : {counts_by_type['transfer']:3d} legs    | Total Volume: €{totals_by_type['transfer']:,.2f}")
        print("=" * 65)

        if args.dry_run:
            print("\n[DRY-RUN] Preview mode complete. 0 records were written to the database.\n")
            return

        # Execute inserts
        print("\n[PERSISTING] Writing transactions to database...")
        # 1. Insert standalone expenses, incomes, and refunds
        created_expenses = []
        for item in standalone_txs:
            exp = Expense(
                title=item["title"],
                amount=item["amount"],
                transaction_type=item["transaction_type"],
                category=item["category"],
                category_id=item["category_id"],
                subcategory_id=item["subcategory_id"],
                account_id=item["account_id"],
                expense_date=item["expense_date"],
                notes=item["notes"],
                user_id=user.id,
            )
            created_expenses.append(exp)

        db.add_all(created_expenses)
        db.commit()

        # 2. Execute atomic transfers via standard transfer service
        for tr in transfer_pairs:
            transfer_in = TransferCreate(
                from_account_id=tr["from_account_id"],
                to_account_id=tr["to_account_id"],
                amount=tr["amount"],
                date=tr["date"],
                description=tr["description"],
            )
            execute_atomic_transfer(db=db, transfer_in=transfer_in, user_id=user.id)

        print(f"[SUCCESS] Successfully created {total_records} realistic transactions for user {user.id} ({user.email}).")

        # Display final updated account balances
        from app.services.account_service import list_user_accounts
        acc_summary = list_user_accounts(db, user.id)
        print("\nUpdated Account Balances:")
        for acc in acc_summary["accounts"]:
            bal_str = f"€{acc['current_balance']:>10.2f}" if acc['current_balance'] is not None else "Balance Unset"
            print(f"  • {acc['name']:<18} : {bal_str} (Income: €{acc['total_income']:.2f}, Expenses: €{acc['total_expenses']:.2f})")
        total_bal_str = f"€{acc_summary['total_balance']:.2f}" if acc_summary['total_balance'] is not None else "Balance Unset"
        print(f"  Total Portfolio Balance: {total_bal_str}\n")

    finally:
        db.close()


if __name__ == "__main__":
    main()
