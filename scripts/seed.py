"""
Seed Script: Populates KnowFin database with realistic demo data.

Usage:
    python scripts/seed.py

This creates:
  - 1 demo user
  - 3 expense categories
  - 3 monthly budgets
  - 15 sample expenses across multiple months
"""
import sys
import os

# Allow script to be run from project root
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, timedelta
from decimal import Decimal

from app.db.session import SessionLocal
from app.models.user import User
from app.models.category import Category
from app.models.budget import Budget
from app.models.expense import Expense
from app.core.config import settings
import bcrypt


DEMO_EMAIL = "demo@knowfin.com"
DEMO_PASSWORD = "demo1234"

CATEGORIES = ["Food & Dining", "Transport", "Entertainment"]

BUDGETS = [
    {"category": "Food & Dining", "monthly_limit": Decimal("500.00"), "month": 8, "year": 2026},
    {"category": "Transport",     "monthly_limit": Decimal("200.00"), "month": 8, "year": 2026},
    {"category": "Entertainment", "monthly_limit": Decimal("150.00"), "month": 8, "year": 2026},
]

EXPENSES = [
    # August 2026 - Food & Dining
    {"title": "Supermarket Run",    "amount": "85.50",  "category": "Food & Dining", "days_ago": 2},
    {"title": "Restaurant Dinner",  "amount": "62.00",  "category": "Food & Dining", "days_ago": 4},
    {"title": "Coffee Shop",        "amount": "12.75",  "category": "Food & Dining", "days_ago": 6},
    {"title": "Pizza Night",        "amount": "34.99",  "category": "Food & Dining", "days_ago": 8},
    {"title": "Grocery Store",      "amount": "120.00", "category": "Food & Dining", "days_ago": 10},
    # August 2026 - Transport
    {"title": "Uber Ride",          "amount": "18.40",  "category": "Transport",     "days_ago": 1},
    {"title": "Monthly Bus Pass",   "amount": "60.00",  "category": "Transport",     "days_ago": 3},
    {"title": "Fuel",               "amount": "55.00",  "category": "Transport",     "days_ago": 7},
    # August 2026 - Entertainment
    {"title": "Netflix Subscription","amount": "15.99", "category": "Entertainment", "days_ago": 5},
    {"title": "Cinema Tickets",     "amount": "28.00",  "category": "Entertainment", "days_ago": 9},
    {"title": "Spotify Premium",    "amount": "9.99",   "category": "Entertainment", "days_ago": 12},
    # July 2026 - cross-month history
    {"title": "Groceries July",     "amount": "95.00",  "category": "Food & Dining", "days_ago": 32},
    {"title": "Bus Pass July",      "amount": "60.00",  "category": "Transport",     "days_ago": 33},
    {"title": "Steam Games",        "amount": "49.99",  "category": "Entertainment", "days_ago": 35},
    {"title": "Takeout July",       "amount": "22.50",  "category": "Food & Dining", "days_ago": 38},
]


def seed():
    db = SessionLocal()
    try:
        # Check if demo user already exists
        existing_user = db.query(User).filter(User.email == DEMO_EMAIL).first()
        if existing_user:
            print(f"[!] Demo user '{DEMO_EMAIL}' already exists. Skipping seed.")
            return

        # Create demo user
        hashed_pw = bcrypt.hashpw(DEMO_PASSWORD.encode(), bcrypt.gensalt()).decode()
        user = User(email=DEMO_EMAIL, hashed_password=hashed_pw, full_name="Demo User")
        db.add(user)
        db.flush()
        print(f"[+] Created user: {DEMO_EMAIL} / {DEMO_PASSWORD}")

        # Create categories
        cat_map = {}
        for cat_name in CATEGORIES:
            cat = Category(name=cat_name, user_id=user.id)
            db.add(cat)
            db.flush()
            cat_map[cat_name] = cat
            print(f"    [+] Category: {cat_name}")

        # Create budgets
        for b in BUDGETS:
            cat = cat_map[b["category"]]
            budget = Budget(
                category_id=cat.id,
                user_id=user.id,
                monthly_limit=b["monthly_limit"],
                month=b["month"],
                year=b["year"],
            )
            db.add(budget)
        print(f"[+] Created {len(BUDGETS)} budgets")

        # Create expenses
        for e in EXPENSES:
            cat = cat_map[e["category"]]
            expense = Expense(
                title=e["title"],
                amount=Decimal(e["amount"]),
                category=e["category"],
                category_id=cat.id,
                user_id=user.id,
                expense_date=datetime.utcnow() - timedelta(days=e["days_ago"]),
            )
            db.add(expense)
        print(f"[+] Created {len(EXPENSES)} expenses")

        db.commit()
        print("\n✓ Seed complete!")
        print(f"\n  Login at POST /api/v1/auth/login")
        print(f"  Email:    {DEMO_EMAIL}")
        print(f"  Password: {DEMO_PASSWORD}")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
