# KnowFin — Expense Tracker Backend

A production-quality RESTful Expense Tracker backend built with **Python**, **FastAPI**, **SQLAlchemy ORM**, and **PostgreSQL**.

---

## 🛠 Tech Stack

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [SQLAlchemy 2.0](https://www.sqlalchemy.org/)
- **Settings & Validation**: [Pydantic v2](https://docs.pydantic.dev/) & `pydantic-settings`
- **Server**: [Uvicorn](https://www.uvicorn.org/)

---

## 📂 Project Architecture

```text
KnowFin/
├── app/
│   ├── api/v1/       # HTTP route handlers & endpoints
│   ├── core/         # Configuration & security settings
│   ├── db/           # Database engine & session management
│   ├── models/       # SQLAlchemy database entities
│   ├── schemas/      # Pydantic validation schemas
│   ├── services/     # Pure business logic layer
│   └── main.py       # FastAPI application entrypoint
├── tests/            # Automated test suites
├── .env.example      # Environment variables template
├── requirements.txt  # Project dependencies
└── README.md
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
- Python 3.9+ installed
- PostgreSQL installed and running locally

### 2. Clone & Setup Virtual Environment

```bash
# Navigate to project directory
cd KnowFin

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Upgrade pip and install dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

### 3. Environment Variables

Copy `.env.example` to create your local `.env` file:

```bash
cp .env.example .env
```

### 4. Run Development Server

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

- **Interactive API Docs (Swagger)**: `http://127.0.0.1:8000/docs`
- **Alternative Docs (ReDoc)**: `http://127.0.0.1:8000/redoc`
- **Health Check**: `http://127.0.0.1:8000/health`
