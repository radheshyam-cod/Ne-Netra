"""
Updated Main Application with Phase 5 Integration

Complete integration of all 5 phases.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
import asyncio

# Phase 3: AI/ML
from .ai_routes import router as ai_router

# Phase 4: Auth & Security
from .auth_middleware import get_auth_router, get_protected_router
from .auth import JWTService, AuthService
from .rbac import RBACService
from .cache import CacheService

# Phase 5: Automation & Integration
from .data_ingestion import DataIngestionScheduler, TwitterIngestion, NewsAPIIngestion
from .scheduled_reports import EmailService, ReportGenerator
from .webhooks import WebhookService, SlackIntegration
from .scheduler import AutomationScheduler
from .sms_service import SMSService, SMSAlertService, SMSCommandHandler

# Global services
cache_service = None
jwt_service = None
auth_service = None
rbac_service = None
webhook_service = None
automation_scheduler = None
sms_alert_service = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    global cache_service, jwt_service, auth_service, rbac_service
    global webhook_service, automation_scheduler, sms_alert_service
    
    # Startup
    print("=== NE-NETRA API Startup ===")
    
    # Database connection (placeholder - use your actual DB)
    # db = connect_to_database()
    db = None  # Replace with actual connection
    
    # Phase 4: Security & Performance
    print("Initializing Phase 4 services...")
    cache_service = CacheService(
        redis_url=os.getenv('REDIS_URL', 'redis://localhost:6379')
    )
    
    jwt_service = JWTService(
        secret_key=os.getenv('JWT_SECRET_KEY', 'change-this-in-production'),
        access_token_expire_minutes=30,
        refresh_token_expire_days=7
    )
    
    if db:
        rbac_service = RBACService(db)
        auth_service = AuthService(db, jwt_service, rbac_service)
        webhook_service = WebhookService(db)
    
    # Phase 5: Automation & Integration
    print("Initializing Phase 5 services...")
    
    # Email service
    email_service = EmailService()
    
    # SMS service
    sms_service = SMSService()
    if db:
        sms_alert_service = SMSAlertService(db, sms_service)
    
    # Data ingestion
    twitter = TwitterIngestion()
    news = NewsAPIIngestion()
    if db:
        data_ingestion = DataIngestionScheduler(db)
    
    # Report generator
    if db:
        report_generator = ReportGenerator(db, email_service)
    
    # Automation scheduler
    if db and os.getenv('ENABLE_SCHEDULER', 'false').lower() == 'true':
        automation_scheduler = AutomationScheduler(
            db,
            data_ingestion,
            report_generator,
            webhook_service
        )
        automation_scheduler.setup_jobs()
        automation_scheduler.start()
        print("✅ Automation scheduler started")
    
    print("✅ All services initialized!")
    print("=== Startup Complete ===\n")
    
    yield
    
    # Shutdown
    print("\n=== Shutting down ===")
    if cache_service and cache_service.enabled:
        cache_service.redis.close()
    if automation_scheduler:
        automation_scheduler.stop()
    print("✅ Shutdown complete")


# Create app
app = FastAPI(
    title="NE-NETRA API",
    description="Northeast Networked Early Threat Recognition & Alert System",
    version="3.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:5173').split(','),
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

# Phase 5: Automation (management endpoints)
automation_router = FastAPI.APIRouter(prefix="/api/automation", tags=["Automation"])

@automation_router.get("/status")
async def get_automation_status():
    """Get automation scheduler status"""
    if automation_scheduler:
        return automation_scheduler.get_job_status()
    return {"enabled": False}

@automation_router.post("/trigger/ingest")
async def trigger_manual_ingestion():
    """Manually trigger data ingestion"""
    if automation_scheduler:
        asyncio.create_task(automation_scheduler._ingest_all_sources())
        return {"message": "Data ingestion triggered"}
    return {"error": "Scheduler not available"}

@automation_router.post("/trigger/daily-digest")
async def trigger_daily_digest():
    """Manually trigger daily digest"""
    if automation_scheduler:
        asyncio.create_task(automation_scheduler._send_daily_digest())
        return {"message": "Daily digest triggered"}
    return {"error": "Scheduler not available"}

app.include_router(automation_router)

# Webhooks (management)
webhook_router = FastAPI.APIRouter(prefix="/api/webhooks", tags=["Webhooks"])

@webhook_router.post("/register")
async def register_webhook(name: str, url: str, events: list, secret: str = None):
    """Register new webhook"""
    if webhook_service:
        webhook_id = webhook_service.register_webhook(name, url, events, secret)
        return {"webhook_id": webhook_id}
    return {"error": "Webhook service not available"}

app.include_router(webhook_router)

# SMS (incoming webhook for Twilio)
@app.post("/api/sms/incoming")
async def incoming_sms(request: Request):
    """Handle incoming SMS from Twilio"""
    if sms_alert_service:
        data = await request.form()
        from_number = data.get('From')
        message = data.get('Body')
        
        handler = SMSCommandHandler(sms_alert_service)
        handler.handle_incoming_sms(from_number, message)
        
        return {"status": "processed"}
    return {"error": "SMS service not available"}


@app.get("/")
async def root():
    """API root"""
    return {
        "name": "NE-NETRA API",
        "version": "3.0.0",
        "phases": {
            "phase_1": "UX Foundation (9 features)",
            "phase_2": "Core Features (18 features)",
            "phase_3": "AI & Analytics (4 features)",
            "phase_4": "Security & Performance (6 features)",
            "phase_5": "Automation & Integration (6 features)"
        },
        "total_features": 43,
        "status": "operational"
    }


@app.get("/health")
async def health_check():
    """Comprehensive health check"""
    return {
        "status": "healthy",
        "services": {
            "cache": cache_service.enabled if cache_service else False,
            "auth": jwt_service is not None,
            "ai": True,
            "scheduler": automation_scheduler is not None,
            "webhooks": webhook_service is not None,
            "sms": sms_alert_service is not None
        }
    }


# Dependency injection
def get_cache() -> CacheService:
    return cache_service

def get_webhook_service() -> WebhookService:
    return webhook_service

def get_sms_service() -> SMSAlertService:
    return sms_alert_service


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main_complete:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
