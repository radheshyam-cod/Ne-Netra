"""
Main Application with Phase 3 & 4 Integration

Integrates AI/ML services and auth/caching features.
"""

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

# Phase 3: AI/ML
from .ai_routes import router as ai_router

# Phase 4: Auth & Security
from .auth_middleware import get_auth_router, get_protected_router
from .auth import JWTService, AuthService
from .rbac import RBACService
from .cache import CacheService

# Initialize services
cache_service = None
jwt_service = None
auth_service = None
rbac_service = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    global cache_service, jwt_service, auth_service, rbac_service
    
    # Startup
    print("Initializing services...")
    
    # Cache
    cache_service = CacheService(
        redis_url=os.getenv('REDIS_URL', 'redis://localhost:6379')
    )
    
    # JWT
    jwt_service = JWTService(
        secret_key=os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production'),
        access_token_expire_minutes=30,
        refresh_token_expire_days=7
    )
    
    # Database connection (placeholder - use your actual DB)
    # db = connect_to_database()
    
    # RBAC
    # rbac_service = RBACService(db)
    
    # Auth
    # auth_service = AuthService(db, jwt_service, rbac_service)
    
    print("Services initialized!")
    
    yield
    
    # Shutdown
    print("Shutting down services...")
    if cache_service and cache_service.enabled:
        cache_service.redis.close()
    print("Services stopped")


# Create app
app = FastAPI(
    title="NE-NETRA API",
    description="Northeast Networked Early Threat Recognition & Alert System",
    version="2.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
# Phase 3: AI/ML
app.include_router(ai_router)

# Phase 4: Auth
app.include_router(get_auth_router())
app.include_router(get_protected_router())

# Existing routes
# app.include_router(risk_router)
# app.include_router(signal_router)
# app.include_router(action_router)


@app.get("/")
async def root():
    """API root"""
    return {
        "name": "NE-NETRA API",
        "version": "2.0.0",
        "features": {
            "phase_1": "UX Foundation (9 features)",
            "phase_2": "Core Features (18 features)",
            "phase_3": "AI & Analytics (4 features)",
            "phase_4": "Security & Performance (6 features)"
        },
        "total_features": 37,
        "status": "operational"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "cache": cache_service.enabled if cache_service else False,
        "auth": jwt_service is not None,
        "ai": True  # AI services loaded
    }


# Dependency injection helpers
def get_cache() -> CacheService:
    return cache_service


def get_jwt() -> JWTService:
    return jwt_service


def get_auth() -> AuthService:
    return auth_service


def get_rbac() -> RBACService:
    return rbac_service


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
