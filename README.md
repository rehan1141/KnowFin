# KnowFin

KnowFin is a full-stack personal finance tracker built to answer a straightforward question: where did all my money actually go before my bank account starts looking suspicious?

It pairs a FastAPI backend with a React and Vite frontend to track accounts, log expenses and income, manage category budgets, and visualize spending trends without sending your financial records to a subscription-based mobile app.

- **Live Frontend**: [https://know-fin.vercel.app](https://know-fin.vercel.app/)
- **Live Backend API**: [https://knowfin-api.onrender.com](https://knowfin-api.onrender.com/)
- **API Documentation**: [https://knowfin-api.onrender.com/docs](https://knowfin-api.onrender.com/docs)

> **Note on Free-Tier Hosting**: The backend is hosted on Render's free tier. If the service has been idle, the first request may take 30 to 50 seconds while the container spins up from cold sleep. Once awake, requests respond normally.
>
> **Project Status**: This repository is a completed student learning project. It is currently shelved in a stable, verified state and is not under active feature development.

---

## What it does

### Core Features

- **Multi-Account Balance Tracking**: Create and manage bank accounts, cash wallets, credit cards, and investment accounts. Supports setting an opening balance or leaving it unset, computing running balances directly from initial balances and transaction history.
- **Transaction Ledger**: Record expenses, income, and refunds with categories, subcategories, account assignments, and notes. Includes date range filtering, search, and pagination.
- **Double-Entry Transfers**: Transfer funds between accounts using an atomic transfer endpoint that updates both account balances without artificially inflating monthly spending or income totals.
- **Monthly Budgets**: Set spending limits per category for each month. The dashboard monitors burn rates, warns when approaching or exceeding limits, and calculates remaining allowances.
- **Analytics & Trends**:
  - Monthly summary: gross spending, total refunds, net spending, income, net savings, and savings rate.
  - 6-month historical comparison chart comparing income against gross spending.
  - Spending by category breakdown with a visual distribution chart.
  - Daily cash-flow history showing net trajectory across the month.
- **Recurring Commitments**: Track recurring bills and subscriptions (weekly, monthly, yearly) with an upcoming commitments calculator for near-term planning.
- **Live Currency Conversion**: Switch display currency between EUR, USD, and INR. Transactions and account records are canonically stored in EUR; the reporting layer queries live reference rates from public providers with in-memory caching and offline fallback.
- **Authentication & Security**: Email/password registration and login with JWT access tokens, bcrypt password hashing, and rate-limiting on sensitive endpoints.

### What it does not do

- **No automated bank sync**: There is no Plaid, Teller, or Open Banking integration. All transactions are logged manually.
- **No background cron execution**: Recurring rules track and project upcoming bills, but they do not automatically insert transactions into the ledger on due dates.
- **Single-currency storage**: All database records store amounts in EUR. Currency switching converts amounts client-side for display and converts user inputs back to EUR for persistence.

---

## Tech Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 8
- **Routing**: React Router v7
- **Styling**: Tailwind CSS v4 with custom warm stone design tokens
- **Charts**: Recharts
- **Forms & Validation**: React Hook Form with Zod schemas
- **HTTP Client**: Axios with request and response interceptors
- **Icons**: Lucide React
- **Linter**: Oxlint

### Backend
- **Framework**: FastAPI
- **ASGI Server**: Uvicorn
- **Language**: Python 3.9+
- **ORM**: SQLAlchemy 2.0
- **Migrations**: Alembic
- **Validation**: Pydantic v2 and Pydantic-Settings
- **Security**: PyJWT, Bcrypt
- **Rate Limiting**: SlowAPI
- **HTTP Client**: HTTPX (for exchange rate queries)
- **Database Drivers**: `psycopg2-binary` and `psycopg` v3

### Database & Infrastructure
- **Production Database**: Neon Serverless PostgreSQL
- **Local Database**: PostgreSQL 15 (local service or Docker)
- **Hosting**: Vercel (Frontend SPA), Render (Backend REST API)

---

## Project Structure

```text
KnowFin/
├── app/
│   ├── api/v1/                  # API routers (auth, accounts, expenses, analytics, etc.)
│   ├── core/                    # App settings, logging, rate limiting, exception handlers
│   ├── db/                      # SQLAlchemy engine, base model, and session factory
│   ├── models/                  # Database models (User, Account, Expense, Category, Budget, Recurring)
│   ├── schemas/                 # Pydantic request and response schemas
│   ├── services/                # Business logic (analytics, account balances, exchange rates)
│   └── main.py                  # FastAPI application entry point, CORS, and middleware
├── alembic/                     # Database migrations
│   ├── versions/                # Migration revision scripts
│   └── env.py                   # Alembic environment runner
├── frontend/
│   ├── src/
│   │   ├── components/          # Modals and reusable UI elements (transactions, accounts, header)
│   │   ├── contexts/            # React contexts (AuthContext, CurrencyContext)
│   │   ├── layouts/             # Dashboard shell layout and navigation
│   │   ├── pages/               # Route pages (Dashboard, Expenses, Accounts, Budgets, Analytics, Settings)
│   │   ├── services/            # Axios API wrappers
│   │   ├── types/               # TypeScript interfaces and shared types
│   │   └── utils/               # Currency formatters and category icons
│   ├── package.json             # Frontend dependencies and npm scripts
│   └── vite.config.ts           # Vite configuration
├── scripts/
│   ├── seed.py                  # Populates a local database with demo categories, budgets, and expenses
│   └── generate_bulk_transactions.py # Benchmark script for transaction volumes
├── tests/                       # Backend test suite (auth, expenses, accounts, invariants, analytics)
├── docker-compose.yml           # Local multi-container PostgreSQL and API setup
├── Dockerfile                   # Production container definition for FastAPI
├── Makefile                     # Shortcut commands for dev, test, migration, and seed tasks
└── requirements.txt             # Backend Python dependencies
```

---

## Running Locally

### Prerequisites
- **Python**: 3.9 or higher
- **Node.js**: 18 or higher (with npm)
- **PostgreSQL**: Local PostgreSQL server (port 5432) or Docker

---

### Step 1: Clone the repository

```bash
git clone https://github.com/rehan1141/KnowFin.git
cd KnowFin
```

---

### Step 2: Database Setup

Make sure a PostgreSQL database named `knowfin_db` exists.

If using Docker:
```bash
docker compose up -d db
```

Or using local PostgreSQL:
```bash
createdb knowfin_db
```

---

### Step 3: Backend Setup

1. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

2. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create the backend configuration file `.env` in the project root:
   ```env
   PROJECT_NAME="KnowFin Expense Tracker"
   ENVIRONMENT="development"
   API_V1_STR="/api/v1"
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/knowfin_db"
   SECRET_KEY="replace_with_a_secure_random_string_for_local_testing"
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

4. Run the database migrations:
   ```bash
   alembic upgrade head
   ```

5. (Optional) Seed demo categories, budgets, and expenses:
   ```bash
   python scripts/seed.py
   ```
   *Demo login created by the seed script: `demo@knowfin.com` / `demo1234`.*

6. Start the backend development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   The backend API will be live at `http://localhost:8000`. Interactive docs are available at `http://localhost:8000/docs`.

---

### Step 4: Frontend Setup

1. Open a new terminal and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. (Optional) Configure environment variables:
   By default, the frontend falls back to `http://localhost:8000/api/v1`. If you want to specify it explicitly, create `frontend/.env`:
   ```env
   VITE_API_BASE_URL="http://localhost:8000/api/v1"
   ```

4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will be live at `http://localhost:5173`.

---

## Environment Variables

### Backend (`.env` in root)

| Variable | Required | Description | Example / Default |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/knowfin_db` |
| `SECRET_KEY` | Yes | Secret key used to sign JWT tokens | `openssl rand -hex 32` |
| `ENVIRONMENT` | No | Application environment tag | `development` (or `production`) |
| `PROJECT_NAME` | No | API display name | `KnowFin Expense Tracker` |
| `API_V1_STR` | No | API route prefix | `/api/v1` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | JWT token lifespan in minutes | `30` |

### Frontend (`frontend/.env`)

| Variable | Required | Description | Example / Default |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | No | Full base URL to the backend API v1 prefix | `http://localhost:8000/api/v1` |

> **Security Reminder**: Variables prefixed with `VITE_` are bundled into client-side JavaScript and are publicly readable in the browser. Never put database credentials, private keys, or API secrets in frontend environment files.

---

## API Overview

All primary endpoints are grouped under `/api/v1` (with health check at `/health`):

| Path | Methods | Description |
| :--- | :--- | :--- |
| `/api/v1/auth/register` | `POST` | Register a new user account |
| `/api/v1/auth/login` | `POST` | Authenticate with credentials and receive a JWT access token |
| `/api/v1/auth/me` | `GET`, `PATCH` | Read or update the current authenticated user's profile |
| `/api/v1/accounts/` | `GET`, `POST` | List all accounts with current balances or create a new account |
| `/api/v1/accounts/{id}` | `GET`, `PUT`, `DELETE` | Read, update (e.g. opening balance), or remove an account |
| `/api/v1/expenses/` | `GET`, `POST` | List paginated transactions (with date/category filters) or create one |
| `/api/v1/expenses/{id}` | `GET`, `PUT`, `DELETE` | Read, update, or delete a specific transaction |
| `/api/v1/transfers/` | `POST` | Execute an atomic double-entry transfer between two accounts |
| `/api/v1/categories/` | `GET`, `POST` | List available categories or create a custom one |
| `/api/v1/budgets/` | `GET`, `POST`, `DELETE` | Manage monthly spending limits by category |
| `/api/v1/analytics/summary` | `GET` | Monthly overview (income, gross spending, refunds, net savings) |
| `/api/v1/analytics/by-category` | `GET` | Category spending distribution for a specific month/year |
| `/api/v1/analytics/budget-status`| `GET` | Real-time budget consumption vs limits |
| `/api/v1/analytics/cash-flow` | `GET` | Daily cash flow points across a month |
| `/api/v1/recurring/` | `GET`, `POST`, `PUT`, `DELETE` | Manage recurring transaction templates |
| `/api/v1/recurring/upcoming` | `GET` | Calculate projected recurring expenses for the next 30 days |
| `/api/v1/exchange-rates/latest` | `GET` | Fetch EUR reference exchange rates with caching status |
| `/health` | `GET` | Service status health check |

Interactive API documentation is generated automatically by FastAPI at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## Testing and Verification

### Backend Tests
The backend test suite is powered by PyTest. It verifies user authentication, account isolation, double-entry transfers, financial invariants (e.g., refunds reducing gross spending, transfers not inflating expense totals), analytics calculations, and live exchange rate caching.

To run the backend test suite:
```bash
source .venv/bin/activate
pytest
```
*Current test suite status: 48 passed.*

### Frontend Production Build & Linting
To verify TypeScript compilation, JSX bundling, and lint rules:
```bash
cd frontend

# Run Oxlint
npm run lint

# Run TypeScript check and production bundle
npm run build
```
*Current build status: 0 errors.*

---

## Deployment Summary

KnowFin is deployed across three services:

1. **Frontend**: Deployed on [Vercel](https://vercel.com/) as a static Single Page Application connected to the `main` branch.
   - Production URL: `https://know-fin.vercel.app`
   - Configured with `VITE_API_BASE_URL=https://knowfin-api.onrender.com/api/v1`.
2. **Backend**: Deployed on [Render](https://render.com/) as a Web Service running Uvicorn behind a production reverse proxy.
   - Production URL: `https://knowfin-api.onrender.com`
   - Configured with CORS allowed origin `https://know-fin.vercel.app`.
3. **Database**: Hosted on [Neon](https://neon.tech/) as a serverless PostgreSQL instance running migrations via Alembic.

---

## Known Limitations

- **Manual Data Entry**: There is no direct integration with financial institutions or open banking APIs. You have to log transactions yourself.
- **Reporting-Only Currency Conversion**: Multi-currency capabilities convert EUR figures at presentation time using public exchange rates. Individual transactions cannot be pegged to historical original foreign currencies (e.g., logging a purchase made in JPY while traveling).
- **No Background Scheduler**: Recurring bills calculate schedules and upcoming due dates, but do not post transactions automatically without user intervention.
- **Render Free-Tier Spin-Down**: Because the backend is hosted on a free Render tier, the web service automatically spins down after 15 minutes of inactivity. The first wake-up request will experience a noticeable latency pause.

---

## License & Author

Built by Rehan Multani as an exploratory full-stack engineering and finance tracking project.

This repository does not currently include a formal open-source license. All rights are reserved by the author. You are welcome to review the code and run it locally for learning and personal evaluation.
