from decimal import Decimal
from sqlalchemy.orm import Session
from app.models.account import Account
from app.models.category import Category

DEFAULT_EXPENSE_CATEGORIES = [
    {
        "name": "Food & Dining",
        "icon": "Utensils",
        "color": "#1F6B50",
        "subcategories": ["Restaurants", "Groceries", "Coffee", "Takeaway"]
    },
    {
        "name": "Transport",
        "icon": "Car",
        "color": "#2E7D5B",
        "subcategories": ["Public Transport", "Fuel", "Taxi", "Parking"]
    },
    {
        "name": "Housing",
        "icon": "House",
        "color": "#164A3A",
        "subcategories": ["Rent", "Maintenance", "Electricity", "Water"]
    },
    {
        "name": "Bills & Utilities",
        "icon": "Receipt",
        "color": "#4A5568",
        "subcategories": ["Internet", "Mobile Phone", "Gas", "Insurance"]
    },
    {
        "name": "Shopping",
        "icon": "ShoppingBag",
        "color": "#D97706",
        "subcategories": ["Clothing", "Electronics", "Home Goods"]
    },
    {
        "name": "Health",
        "icon": "HeartPulse",
        "color": "#E11D48",
        "subcategories": ["Pharmacy", "Doctor", "Fitness"]
    },
    {
        "name": "Entertainment",
        "icon": "Gamepad2",
        "color": "#8B5CF6",
        "subcategories": ["Movies", "Games", "Events", "Hobbies"]
    },
    {
        "name": "Subscriptions",
        "icon": "Tv",
        "color": "#3B82F6",
        "subcategories": ["Netflix", "Spotify", "Software", "Cloud Storage"]
    },
    {
        "name": "Travel",
        "icon": "Plane",
        "color": "#0D9488",
        "subcategories": ["Flights", "Hotels", "Transit"]
    },
    {
        "name": "Personal Care",
        "icon": "Sparkles",
        "color": "#EC4899",
        "subcategories": ["Haircut", "Cosmetics", "Wellness"]
    },
    {
        "name": "Education",
        "icon": "GraduationCap",
        "color": "#6366F1",
        "subcategories": ["Books", "Courses", "Tuition"]
    },
    {
        "name": "Other",
        "icon": "Folder",
        "color": "#6B7280",
        "subcategories": ["General", "Miscellaneous"]
    },
]

DEFAULT_INCOME_CATEGORIES = [
    {
        "name": "Salary",
        "icon": "Briefcase",
        "color": "#059669",
        "subcategories": ["Monthly Salary", "Bonus", "Overtime"]
    },
    {
        "name": "Freelance",
        "icon": "Laptop",
        "color": "#10B981",
        "subcategories": ["Client Work", "Consulting", "Projects"]
    },
    {
        "name": "Investments",
        "icon": "TrendingUp",
        "color": "#047857",
        "subcategories": ["Dividends", "Interest", "Capital Gains"]
    },
    {
        "name": "Scholarship",
        "icon": "GraduationCap",
        "color": "#065F46",
        "subcategories": ["Grant", "Stipend"]
    },
    {
        "name": "Gift",
        "icon": "Gift",
        "color": "#34D399",
        "subcategories": ["Family Gift", "Birthday"]
    },
    {
        "name": "Refund",
        "icon": "RotateCcw",
        "color": "#6EE7B7",
        "subcategories": ["Tax Refund", "Store Refund"]
    },
    {
        "name": "Other Income",
        "icon": "Coins",
        "color": "#10B981",
        "subcategories": ["Side Hustle", "Cash Back"]
    },
]


def seed_user_default_data(db: Session, user_id: int, currency: str = "EUR") -> None:
    """
    Seed default accounts and categories for a user if they don't already have them.
    Ensures a new user immediately has a working, realistic setup.
    """
    # 1. Accounts
    existing_accounts = db.query(Account).filter(Account.user_id == user_id).first()
    if not existing_accounts:
        bank_acc = Account(
            user_id=user_id,
            name="Main Bank",
            account_type="bank",
            currency=currency,
            initial_balance=None,
            is_active=True,
        )
        cash_acc = Account(
            user_id=user_id,
            name="Cash",
            account_type="cash",
            currency=currency,
            initial_balance=None,
            is_active=True,
        )
        savings_acc = Account(
            user_id=user_id,
            name="Savings",
            account_type="savings",
            currency=currency,
            initial_balance=None,
            is_active=True,
        )
        db.add_all([bank_acc, cash_acc, savings_acc])
        db.commit()

    # 2. Categories
    existing_categories = db.query(Category).filter(Category.user_id == user_id).first()
    if not existing_categories:
        # Seed Expense Categories
        for cat_info in DEFAULT_EXPENSE_CATEGORIES:
            parent = Category(
                user_id=user_id,
                name=cat_info["name"],
                category_type="expense",
                icon=cat_info["icon"],
                color=cat_info["color"],
                is_default=True,
            )
            db.add(parent)
            db.commit()
            db.refresh(parent)

            for sub_name in cat_info.get("subcategories", []):
                sub = Category(
                    user_id=user_id,
                    name=sub_name,
                    category_type="expense",
                    icon=cat_info["icon"],
                    color=cat_info["color"],
                    parent_id=parent.id,
                    is_default=True,
                )
                db.add(sub)
            db.commit()

        # Seed Income Categories
        for cat_info in DEFAULT_INCOME_CATEGORIES:
            parent = Category(
                user_id=user_id,
                name=cat_info["name"],
                category_type="income",
                icon=cat_info["icon"],
                color=cat_info["color"],
                is_default=True,
            )
            db.add(parent)
            db.commit()
            db.refresh(parent)

            for sub_name in cat_info.get("subcategories", []):
                sub = Category(
                    user_id=user_id,
                    name=sub_name,
                    category_type="income",
                    icon=cat_info["icon"],
                    color=cat_info["color"],
                    parent_id=parent.id,
                    is_default=True,
                )
                db.add(sub)
            db.commit()
