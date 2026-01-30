"""
NE-NETRA Backend API
FastAPI server for early warning intelligence platform

COMPLIANCE:
- District-level only (no individual tracking)
- Public/synthetic data only
- Decision support (no automated enforcement)
- DPDP Act 2023 aligned
"""
from fastapi import FastAPI, Depends, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Dict
from datetime import datetime
import json

from database import get_db, init_db, Message, RiskScore, OfficerReview, AuditLog, RiskRule
from models import (
    MessageIngest, RiskScoreResponse, OfficerReviewInput,
    AuditLogEntry, AnalysisRequest, AnalysisResponse
)
from intelligence import RiskIntelligence
from governance import PIIRedaction, audit_logger

# Initialize FastAPI app
app = FastAPI(
    title="NE-NETRA API",
    description="Early Warning & Accountability Platform - District Level Intelligence",
    version="1.0.0"
)

# ... imports ...
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from governance import audit_logger
import hashlib

class AuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # 1. Capture request metadata
        # Hash the URL path + method for basic immutability
        request_sig = f"{request.method}:{request.url.path}"
        sig_hash = hashlib.sha256(request_sig.encode()).hexdigest()
        
        # 2. Process request
        response = await call_next(request)
        
        # 3. Log (Non-blocking usually, here sync for pilot)
        # Only log state-changing ops or significant reads
        if request.method in ["POST", "PUT", "DELETE"] or "risk-score" in request.url.path:
            audit_logger.log_event(
                action="API_ACCESS",
                actor="SystemRouter",
                details={
                    "method": request.method,
                    "path": request.url.path,
                    "status": response.status_code,
                    "sig_hash": sig_hash
                }
            )
            
        return response

app.add_middleware(AuditMiddleware)

# CORS configuration (allow frontend access)
app.add_middleware(
    CORSMiddleware,
# ...
    allow_origins=["*"],  # In production, restrict to specific domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI intelligence engine
ai_engine = RiskIntelligence()

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    init_db()
    print("✓ Database initialized")
    print("✓ Governance modules active (PII Redaction, Immutable Logs)")
    print("✓ NE-NETRA API ready")


@app.get("/")
def root():
    """API health check"""
    return {
        "status": "operational",
        "service": "NE-NETRA Early Warning Platform",
        "compliance": "DPDP Act 2023 Aligned",
        "scope": "District-level only, no individual tracking",
        "mode": "Pilot Prototype"
    }


@app.post("/ingest")
def ingest_data(message: MessageIngest, db: Session = Depends(get_db)):
    """
    Ingest public/synthetic text data
    
    COMPLIANCE:
    - Public or consented data only
    - District-level aggregation
    - No individual tracking
    - PII Redaction enforced
    """
    # 1. PII Redaction (Middleware logic)
    sanitized_text = PIIRedaction.redact(message.text)
    
    # Create message record
    db_message = Message(
        district=message.district,
        text=sanitized_text,
        source_type=message.source_type,
        geo_sensitivity=message.geo_sensitivity,
        timestamp=message.timestamp or datetime.utcnow()
    )
    
    # Analyze message immediately
    sentiment = ai_engine.analyze_sentiment(sanitized_text)
    toxicity = ai_engine.analyze_toxicity(sanitized_text)
    
    db_message.sentiment_score = sentiment
    db_message.toxicity_score = toxicity
    db_message.processed = True
    
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    
    # Log ingestion (Immutable + DB)
    action_desc = f"Data ingested: {message.source_type}"
    
    # DB Log (for UI)
    db_audit = AuditLog(
        district=message.district,
        officer_name="System",
        action=action_desc,
        meta_info=json.dumps({"message_id": db_message.id})
    )
    db.add(db_audit)
    db.commit()
    
    # Immutable Log (Legal)
    audit_logger.log_event(
        action=action_desc,
        actor="System",
        details={
            "district": message.district,
            "message_id": db_message.id,
            "source_type": message.source_type
        }
    )
    
    return {
        "status": "success",
        "message_id": db_message.id,
        "district": message.district,
        "analyzed": True,
        "sentiment": round(sentiment, 3),
        "toxicity": round(toxicity, 3),
        "pii_redacted": sanitized_text != message.text
    }


@app.post("/analyze", response_model=AnalysisResponse)
def analyze_district(request: AnalysisRequest, db: Session = Depends(get_db)):
    """
    Analyze all messages for a district and compute risk score
    
    Returns: Explainable composite risk score
    """
    # Fetch all messages for district
    messages = db.query(Message).filter(
        Message.district == request.district
    ).all()
    
    if not messages:
        messages = []
    
    # Convert to dict format for analysis
    message_dicts = [
        {
            'text': m.text,
            'timestamp': m.timestamp,
            'geo_sensitivity': m.geo_sensitivity
        }
        for m in messages
    ]
    
    # Get configuration weights (from DB)
    risk_rule = db.query(RiskRule).filter(RiskRule.district == request.district).first()
    if risk_rule:
        weights = {
            'w1': risk_rule.w_cognitive,
            'w2': risk_rule.w_network,
            'w3': risk_rule.w_physical
        }
    else:
        weights = {'w1': 1.0, 'w2': 1.0, 'w3': 1.0}

    # Calculate composite risk score
    analysis = ai_engine.calculate_composite_risk_score(
        messages=message_dicts,
        district=request.district,
        weights=weights
    )
    
    # Store risk score
    risk_score = RiskScore(
        district=request.district,
        score=analysis['score'],
        risk_level=analysis['risk_level'],
        trend=analysis['trend'],
        primary_trigger=analysis['primary_trigger'],
        sentiment_component=analysis['components']['sentiment'],  # Legacy avg
        toxicity_component=analysis['components']['toxicity'],    # Legacy avg
        velocity_component=analysis['components']['velocity'],
        geo_sensitivity_component=analysis['components']['geo_sensitivity'],
        suggested_actions=json.dumps(analysis['suggested_actions']),
        hotspots=json.dumps(analysis['hotspots'])
    )
    
    db.add(risk_score)
    db.commit()
    db.refresh(risk_score)
    
    # Log analysis
    action_desc = f"Risk analysis completed - Score: {analysis['score']} ({analysis['risk_level']})"
    
    # DB
    db_audit = AuditLog(
        district=request.district,
        officer_name="System",
        action=action_desc,
        meta_info=json.dumps({"risk_score_id": risk_score.id})
    )
    db.add(db_audit)
    db.commit()
    
    # Immutable
    audit_logger.log_event(
        action="RISK_ANALYSIS",
        actor="System",
        details={
            "district": request.district,
            "score": analysis['score'],
            "risk_level": analysis['risk_level'],
            "weights_used": weights
        }
    )
    
    return AnalysisResponse(
        district=request.district,
        messages_analyzed=len(messages),
        risk_score=analysis['score'],
        risk_level=analysis['risk_level'],
        primary_trigger=analysis['primary_trigger'],
        timestamp=datetime.utcnow()
    )


@app.get("/risk-score/{district}", response_model=RiskScoreResponse)
def get_risk_score(district: str, db: Session = Depends(get_db)):
    """
    Get latest risk score for a district
    
    Returns: Current risk assessment with full explainability
    """
    # Get latest risk score
    risk_score = db.query(RiskScore).filter(
        RiskScore.district == district
    ).order_by(RiskScore.timestamp.desc()).first()
    
    if not risk_score:
        return RiskScoreResponse(
            district=district,
            score=0.0,
            risk_level="low",
            trend="stable",
            primary_trigger="No data",
            timestamp=datetime.utcnow(),
            components={'sentiment':0,'toxicity':0,'velocity':0,'geo_sensitivity':0},
            layer_scores={'cognitive':0,'network':0,'physical':0},
            contributing_factors=[],
            suggested_actions=[],
            hotspots=[]
        )
    
    # Proxy mapping for layer scores (components are 0-1, display as 0-10)
    layer_scores = {
        'cognitive': round(min(risk_score.toxicity_component, 1.0) * 10, 2), 
        'network': round(min(risk_score.velocity_component, 1.0) * 10, 2),
        'physical': round(min(risk_score.geo_sensitivity_component, 1.0) * 10, 2)
    }

    components = {
        'sentiment': risk_score.sentiment_component,
        'toxicity': risk_score.toxicity_component,
        'velocity': risk_score.velocity_component,
        'geo_sensitivity': risk_score.geo_sensitivity_component
    }
    
    contributing_factors = []
    if risk_score.toxicity_component > 0.4:
         contributing_factors.append({'label': 'High Cognitive Risk', 'severity': 'high', 'value': f'{risk_score.toxicity_component*100:.0f}%'})
    
    return RiskScoreResponse(
        district=risk_score.district,
        score=risk_score.score,
        risk_level=risk_score.risk_level,
        trend=risk_score.trend,
        primary_trigger=risk_score.primary_trigger,
        timestamp=risk_score.timestamp,
        components=components,
        layer_scores=layer_scores,
        contributing_factors=contributing_factors,
        suggested_actions=json.loads(risk_score.suggested_actions) if risk_score.suggested_actions else [],
        hotspots=json.loads(risk_score.hotspots) if risk_score.hotspots else []
    )


@app.get("/risk-history/{district}")
def get_risk_history(district: str, limit: int = 24, db: Session = Depends(get_db)):
    """
    Get historical risk scores for trend analysis
    """
    history = db.query(RiskScore).filter(
        RiskScore.district == district
    ).order_by(RiskScore.timestamp.desc()).limit(limit).all()
    
    # Return in chronological order (oldest to newest) for charts
    return [
        {
            "timestamp": h.timestamp,
            "score": h.score,
            "risk_level": h.risk_level
        }
        for h in reversed(history)
    ]


@app.post("/review")
def submit_review(review: OfficerReviewInput, db: Session = Depends(get_db)):
    """
    Submit officer review (Human-in-the-Loop)
    
    COMPLIANCE:
    - Final decision always human-led
    - Full audit trail maintained
    """
    # Create review record
    db_review = OfficerReview(
        district=review.district,
        risk_score_id=review.risk_score_id,
        officer_name=review.officer_name,
        officer_rank=review.officer_rank,
        reviewed=review.reviewed,
        notes=review.notes,
        action_taken=review.action_taken
    )
    
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    
    # Auto-adjust weights (Federated Learning Simulation)
    if not review.reviewed or "false positive" in review.notes.lower():
         # Lower weights slightly
         risk_rule = db.query(RiskRule).filter(RiskRule.district == review.district).first()
         if not risk_rule:
             risk_rule = RiskRule(district=review.district)
             db.add(risk_rule)
         
         # Decay factor
         risk_rule.w_cognitive = max(0.1, risk_rule.w_cognitive * 0.95)
         risk_rule.w_network = max(0.1, risk_rule.w_network * 0.95)
         risk_rule.updated_by = "FederatedAutoTuner"
         risk_rule.last_updated = datetime.utcnow()
         db.commit()
         
         audit_logger.log_event("WEIGHT_ADJUSTMENT", "FederatedModel", {
             "district": review.district, 
             "reason": "Officer Feedback - False Positive",
             "new_weights": {
                 "w1": risk_rule.w_cognitive,
                 "w2": risk_rule.w_network,
                 "w3": risk_rule.w_physical
             }
         })

    # Log audit
    action_text = f"Review submitted by {review.officer_rank} {review.officer_name}"
    if review.action_taken:
        action_text += f" - Action: {review.action_taken}"
    
    # DB
    db_audit = AuditLog(
        district=review.district,
        officer_name=f"{review.officer_rank} {review.officer_name}",
        action=action_text,
        meta_info=json.dumps({
            "review_id": db_review.id, 
            "risk_score_id": review.risk_score_id
        })
    )
    db.add(db_audit)
    db.commit()
    
    # Immutable
    audit_logger.log_event(
        action=action_text,
        actor=f"{review.officer_rank} {review.officer_name}",
        details={"review_id": db_review.id, "notes": review.notes}
    )
    
    return {
        "status": "success",
        "review_id": db_review.id,
        "message": "Officer review recorded successfully"
    }


@app.post("/log-sync")
def log_sync_event(district: str = Body(..., embed=True), count: int = Body(..., embed=True), db: Session = Depends(get_db)):
    """
    Log offline sync completed
    """
    action_text = f"Offline Sync Completed: {count} items synced"
    
    # DB Log
    db_audit = AuditLog(
        district=district,
        officer_name="System",
        action=action_text,
        meta_info=json.dumps({"sync_count": count})
    )
    db.add(db_audit)
    db.commit()
    
    # Immutable
    audit_logger.log_event(
        action="OFFLINE_SYNC",
        actor="System",
        details={"district": district, "count": count}
    )
    return {"status": "logged"}


@app.post("/admin/weights/update")
def update_weights(district: str, w1: float, w2: float, w3: float, db: Session = Depends(get_db)):
    """
    Admin Endpoint: Manually update risk weights
    """
    risk_rule = db.query(RiskRule).filter(RiskRule.district == district).first()
    if not risk_rule:
        risk_rule = RiskRule(district=district)
        db.add(risk_rule)
    
    risk_rule.w_cognitive = w1
    risk_rule.w_network = w2
    risk_rule.w_physical = w3
    risk_rule.last_updated = datetime.utcnow()
    risk_rule.updated_by = "Admin"
    
    db.commit()
    
    audit_logger.log_event("MANUAL_WEIGHT_OVERRIDE", "Admin", {
        "district": district,
        "weights": {'w1': w1, 'w2': w2, 'w3': w3}
    })
    
    return {"status": "updated", "weights": {'w1': w1, 'w2': w2, 'w3': w3}}


@app.get("/weights/{district}")
def get_weights(district: str, db: Session = Depends(get_db)):
    """
    Get current weights for UI display
    """
    risk_rule = db.query(RiskRule).filter(RiskRule.district == district).first()
    if risk_rule:
        return {
            "w_cognitive": risk_rule.w_cognitive,
            "w_network": risk_rule.w_network,
            "w_physical": risk_rule.w_physical,
            "last_updated": risk_rule.last_updated
        }
    return {
        "w_cognitive": 1.0,
        "w_network": 1.0,
        "w_physical": 1.0,
        "last_updated": None
    }


@app.get("/audit-log/{district}", response_model=List[AuditLogEntry])
def get_audit_log(district: str, limit: int = 10, db: Session = Depends(get_db)):
    """
    Get audit log for a district
    """
    logs = db.query(AuditLog).filter(
        AuditLog.district == district
    ).order_by(AuditLog.timestamp.desc()).limit(limit).all()
    
    return logs


@app.get("/districts")
def get_districts(db: Session = Depends(get_db)):
    """
    Get list of districts with data
    """
    districts = db.query(Message.district).distinct().all()
    district_list = [d[0] for d in districts]
    
    return {
        "districts": district_list,
        "count": len(district_list)
    }


@app.get("/stats/{district}")
def get_district_stats(district: str, db: Session = Depends(get_db)):
    """
    Get statistics for a district
    """
    message_count = db.query(Message).filter(Message.district == district).count()
    
    latest_risk = db.query(RiskScore).filter(
        RiskScore.district == district
    ).order_by(RiskScore.timestamp.desc()).first()
    
    review_count = db.query(OfficerReview).filter(
        OfficerReview.district == district
    ).count()
    
    return {
        "district": district,
        "total_messages": message_count,
        "current_risk_score": latest_risk.score if latest_risk else None,
        "current_risk_level": latest_risk.risk_level if latest_risk else None,
        "reviews_submitted": review_count
    }


if __name__ == "__main__":
    import uvicorn
    # Enable reload for development
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
