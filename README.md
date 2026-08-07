# KnowFin Expense Tracker

A production-quality, full-stack personal finance and expense tracking web application. Designed with a high-performance **FastAPI** backend and a modern **React + Vite + TypeScript** frontend styled with a Cherry Blossom glassmorphism aesthetic.

---

## 🌟 Key Features & Architecture

### Backend (FastAPI + PostgreSQL)
- **JWT Authentication**: OAuth2 Bearer token authentication with password hashing (`bcrypt`).
- **ORM & Migrations**: SQLAlchemy ORM models with version-controlled **Alembic** database migrations.
- **Aggregated Analytics**: Custom SQL queries for monthly spending summaries, category distribution, and budget health alerts.
- **Production Guardrails**:
  - `slowapi` rate limiting on auth endpoints.
  - Global JSON error handler middleware.
  - CORS middleware configured for cross-origin security.
  - Structured JSON logging.

### Frontend (React + Vite + TypeScript)
- **Visual Analytics**: Interactive Bar Charts and Donut/Pie Charts powered by `Recharts`.
- **Multi-Currency Support**: Instant toggle between **₹ INR**, **$ USD**, and **€ EUR** using `Intl.NumberFormat`.
- **Cherry Blossom Design System**: Radial mesh gradients, glassmorphism backdrop blur cards, micro-animations, and responsive sidebar navigation.
- **Form Validation**: `react-hook-form` paired with `zod` schema verification.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend** | Python 3.9+, FastAPI, SQLAlchemy, Alembic, PostgreSQL, PyTest |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Recharts, Axios, Lucide Icons |
| **Tooling** | Docker, Git |

---

## 🚀 Local Development Setup

### 1. Backend Setup

```bash
# Clone repository
git clone https://github.com/rehan1141/KnowFin.git
cd KnowFin

# Create & activate Python virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install backend dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start FastAPI development server
uvicorn app.main:app --reload --port 8000
```
> Backend API will be live at `http://localhost:8000`.  
> Interactive Swagger API docs are available at `http://localhost:8000/docs`.

### 2. Frontend Setup

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
> Frontend Web App will be live at `http://localhost:5173`.

---

## 🧪 Testing

Run backend unit & integration tests via `pytest`:

```bash
source .venv/bin/activate
pytest
```

---

## 📜 License

MIT License. Designed for portfolio presentation and internship applications.
