# KnowFin — Personal Expense Tracker API

![Python](https://img.shields.io/badge/Python-3.9-3776AB?style=flat&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat&logo=postgresql&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-D71F00?style=flat)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat&logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat)

A production-quality REST API for personal finance management, built with Python, FastAPI, and PostgreSQL. Demonstrates modern backend engineering practices including JWT authentication, SQL aggregation-based analytics, database migrations, structured logging, rate limiting, and Docker containerization.

---

## Features

| Feature | Details |
|---|---|
| **Authentication** | JWT Bearer token login & registration with bcrypt password hashing |
| **Expense Management** | Full CRUD with user-level data isolation |
| **Pagination & Filtering** | Page-based pagination, date/category filters, sort by any field |
| **Categories & Budgets** | User-defined expense categories with monthly budget limits |
| **Analytics Dashboard** | Monthly totals, spending by category (%), budget vs. actual tracking |
| **Structured Logging** | JSON-formatted logs with timestamps and request paths |
| **Rate Limiting** | `slowapi`-powered IP-level rate limits (100 req/min global, 5/min on login) |
| **Error Handling** | Consistent `{"error": {"code", "message", "type"}}` response envelope |
| **Database Migrations** | Alembic-managed, version-controlled schema migrations |
| **Docker** | Multi-stage Dockerfile + Docker Compose with health checks |

---

## Tech Stack

- **Runtime:** Python 3.9
- **Framework:** FastAPI
- **Database:** PostgreSQL 15
- **ORM:** SQLAlchemy 2.0
- **Migrations:** Alembic
- **Auth:** JWT (PyJWT) + bcrypt
- **Rate Limiting:** slowapi
- **Testing:** pytest + httpx (TestClient)
- **Container:** Docker + Docker Compose

---

## Project Structure

```
KnowFin/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── auth.py             # Registration & Login endpoints
│   │       ├── expenses.py         # Expense CRUD endpoints
│   │       ├── categories_budgets.py # Category & Budget endpoints
│   │       └── analytics.py        # Analytics endpoints
│   ├── core/
│   │   ├── config.py               # Environment-based settings
│   │   ├── exceptions.py           # Global exception handlers
│   │   ├── limiter.py              # Rate limiter configuration
│   │   └── logging.py              # Structured JSON logger
│   ├── db/
│   │   ├── base_class.py           # SQLAlchemy declarative base
│   │   └── session.py              # DB session management
│   ├── models/                     # SQLAlchemy ORM models
│   ├── schemas/                    # Pydantic request/response schemas
│   ├── services/                   # Business logic layer
│   └── main.py                     # FastAPI application entrypoint
├── alembic/                        # Database migrations
├── tests/                          # API integration tests
├── scripts/
│   └── seed.py                     # Demo data seeder
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── Makefile
└── requirements.txt
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Create user account | None |
| `POST` | `/api/v1/auth/login` | Login, receive JWT | None |
| `GET` | `/api/v1/auth/me` | Get current user profile | Required |

### Expenses
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/v1/expenses/` | Create expense | Required |
| `GET` | `/api/v1/expenses/` | List expenses (paginated, filterable) | Required |
| `GET` | `/api/v1/expenses/{id}` | Get single expense | Required |
| `PUT` | `/api/v1/expenses/{id}` | Update expense | Required |
| `DELETE` | `/api/v1/expenses/{id}` | Delete expense | Required |

**Query Params (GET /expenses/):** `page`, `page_size`, `category`, `start_date`, `end_date`, `sort_by`, `sort_order`

### Categories & Budgets
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/v1/categories/` | Create category | Required |
| `GET` | `/api/v1/categories/` | List user categories | Required |
| `POST` | `/api/v1/budgets/` | Set monthly budget | Required |
| `GET` | `/api/v1/budgets/` | List budgets | Required |

### Analytics
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/v1/analytics/summary` | Monthly total spend & count | Required |
| `GET` | `/api/v1/analytics/by-category` | Spend breakdown by category (%) | Required |
| `GET` | `/api/v1/analytics/budget-status` | Budget vs actual spending | Required |

### System
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | API health check |
| `GET` | `/docs` | Swagger UI |
| `GET` | `/redoc` | ReDoc UI |

---

## Getting Started

### Option A: Local Setup

**1. Clone the repository**
```bash
git clone https://github.com/yourusername/KnowFin.git
cd KnowFin
```

**2. Create virtual environment and install dependencies**
```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

**3. Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials and secret key
```

**4. Run database migrations**
```bash
alembic upgrade head
```

**5. Seed demo data (optional)**
```bash
python scripts/seed.py
```

**6. Start the API server**
```bash
uvicorn app.main:app --reload
```

Visit: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Option B: Docker Compose (Recommended)

```bash
cp .env.example .env
docker compose up --build
```

This starts:
- PostgreSQL 15 database with persistent volume
- FastAPI server (auto-runs Alembic migrations on boot)
- Health check polling until database is ready

Visit: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Running Tests

```bash
# Local
pytest

# Or with make
make test
```

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | Full PostgreSQL DSN | `postgresql://user:pass@localhost:5432/knowfin` |
| `SECRET_KEY` | JWT signing key (min 32 chars) | `a_very_long_and_secure_secret_key_here` |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT expiry | `30` |
| `ENVIRONMENT` | Runtime environment | `development` / `production` |

See [`.env.example`](.env.example) for a complete template.

---

## License

MIT
