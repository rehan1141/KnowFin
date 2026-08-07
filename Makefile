.PHONY: dev test migrate seed docker-up docker-down lint

# Start local development server with auto-reload
dev:
	source .venv/bin/activate && uvicorn app.main:app --reload

# Run the full test suite
test:
	source .venv/bin/activate && pytest -v

# Apply all pending Alembic migrations
migrate:
	source .venv/bin/activate && alembic upgrade head

# Roll back the most recent migration
migrate-down:
	source .venv/bin/activate && alembic downgrade -1

# Autogenerate a new migration (usage: make migration MSG="describe change")
migration:
	source .venv/bin/activate && alembic revision --autogenerate -m "$(MSG)"

# Seed database with demo data
seed:
	source .venv/bin/activate && python scripts/seed.py

# Start all Docker services (API + PostgreSQL)
docker-up:
	docker compose up --build

# Stop all Docker services
docker-down:
	docker compose down

# Stop Docker services and remove database volume (full reset)
docker-clean:
	docker compose down -v
