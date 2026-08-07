import time
import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.logging import setup_logging
from app.core.limiter import limiter
from app.core.exceptions import (
    http_exception_handler,
    validation_exception_handler,
    unhandled_exception_handler,
)
from app.api.v1.auth import router as auth_router
from app.api.v1.expenses import router as expenses_router
from app.api.v1.categories_budgets import categories_router, budgets_router
from app.api.v1.analytics import router as analytics_router

# Initialise structured JSON logging before anything else
setup_logging()

logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Production-quality personal expense tracker REST API.",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── Rate Limiting ─────────────────────────────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── Global Exception Handlers ─────────────────────────────────────────────────
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)


# ── Request Logging Middleware ────────────────────────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log every HTTP request with method, path, status code, and duration."""
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = round((time.perf_counter() - start) * 1000, 2)
    logger.info(
        "HTTP request",
        extra={
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "duration_ms": duration_ms,
        },
    )
    return response


# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(expenses_router, prefix=settings.API_V1_STR)
app.include_router(categories_router, prefix=settings.API_V1_STR)
app.include_router(budgets_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)


# ── Health Check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health Check"])
def health_check():
    """Health check endpoint used by Docker, load balancers, and monitoring systems."""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "project": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
    }
