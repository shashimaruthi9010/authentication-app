from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import engine, Base
from app.routes import auth as auth_router

# Load settings
settings = get_settings()

# Create all database tables on startup
Base.metadata.create_all(bind=engine)

# ─── FastAPI App ──────────────────────────────────────────────────────────────

app = FastAPI(
    title="Authentication API",
    description="A secure FastAPI authentication backend with JWT and bcrypt.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS Middleware ──────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ─────────────────────────────────────────────────────────────────

app.include_router(auth_router.router, prefix="/api/v1")


# ─── Health Check ─────────────────────────────────────────────────────────────

@app.get("/health", tags=["Health"])
def health_check():
    """Simple health check endpoint to verify the API is running."""
    return {"status": "ok", "message": "Authentication API is running."}
