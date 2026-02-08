"""
AI/ML API Endpoints

FastAPI routes for AI-powered features.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime
import pandas as pd

from .ai_narrative import AIRiskNarrative
from .ml_predictor import RiskPredictor
from .pattern_detector import PatternDetector
from .sentiment_analyzer import SentimentAnalyzer

router = APIRouter(prefix="/api/ai", tags=["AI/ML"])

# Initialize services (singleton pattern)
narrative_service = AIRiskNarrative()
predictor service = RiskPredictor()
pattern_service = PatternDetector()
sentiment_service = SentimentAnalyzer()


# Request/Response Models
class NarrativeRequest(BaseModel):
    district: str
    risk_score: float
    risk_level: str
    signals: List[Dict]
    layer_scores: Dict[str, float]


class NarrativeResponse(BaseModel):
    summary: str
    key_factors: List[str]
    recommendations: List[str]
    confidence: float


class PredictionRequest(BaseModel):
    district: str
    historical_data: List[Dict]  # List of {date, risk_score, signal_count, avg_severity}


class PredictionResponse(BaseModel):
    predictions: List[Dict]
    trend: str
    peak_day: int
    average: float


class PatternRequest(BaseModel):
    district: str
    historical_data: List[Dict]
    adjacent_districts: Optional[List[str]] = None


class SentimentRequest(BaseModel):
    text: str


class SentimentBatchRequest(BaseModel):
    texts: List[str]


@router.post("/narrative", response_model=NarrativeResponse)
async def generate_risk_narrative(request: NarrativeRequest):
    """
    Generate AI-powered narrative explaining risk score
    
    Example:
    POST /api/ai/narrative
    {
        "district": "Imphal West",
        "risk_score": 65,
        "risk_level": "high",
        "signals": [...],
        "layer_scores": {"cognitive": 6.5, "network": 7.2, "physical": 5.8}
    }
    """
    try:
        result = await narrative_service.generate_narrative(
            district=request.district,
            risk_score=request.risk_score,
            risk_level=request.risk_level,
            signals=request.signals,
            layer_scores=request.layer_scores
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/predict", response_model=PredictionResponse)
async def predict_7_days(request: PredictionRequest):
    """
    Predict next 7 days of risk scores
    
    Example:
    POST /api/ai/predict
    {
        "district": "Imphal West",
        "historical_data": [
            {"date": "2026-01-01", "risk_score": 45, "signal_count": 12, "avg_severity": 2.5},
            ...
        ]
    }
    """
    try:
        # Convert to DataFrame
        df = pd.DataFrame(request.historical_data)
        df['date'] = pd.to_datetime(df['date'])
        
        result = predictor_service.predict_7_days(
            district=request.district,
            recent_data=df
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/patterns")
async def detect_patterns(request: PatternRequest):
    """
    Detect patterns in historical data
    
    Returns list of detected patterns
    """
    try:
        df = pd.DataFrame(request.historical_data)
        df['date'] = pd.to_datetime(df['date'])
        
        patterns = pattern_service.detect_all_patterns(
            district=request.district,
            historical_data=df,
            adjacent_districts=request.adjacent_districts
        )
        return {"patterns": patterns}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sentiment")
async def analyze_sentiment(request: SentimentRequest):
    """
    Analyze sentiment of a single text
    
    Example:
    POST /api/ai/sentiment
    {
        "text": "Violent clash between groups in Imphal"
    }
    """
    try:
        result = sentiment_service.analyze_text(request.text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sentiment/batch")
async def analyze_sentiment_batch(request: SentimentBatchRequest):
    """
    Analyze sentiment of multiple texts
    
    Returns both individual and aggregate results
    """
    try:
        results = sentiment_service.analyze_batch(request.texts)
        aggregate = sentiment_service.aggregate_sentiments(results)
        
        return {
            "individual": results,
            "aggregate": aggregate
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/briefing/{district}")
async def get_morning_briefing(district: str, db: Session = Depends(get_db)):
    """
    Get situational morning briefing for a district
    """
    try:
        from .database import RiskScore, Message
        from .main import get_district_stats # We might need to move this helper
        
        # Get latest risk score
        risk_score = db.query(RiskScore).filter(
            RiskScore.district == district
        ).order_by(RiskScore.timestamp.desc()).first()
        
        if not risk_score:
            raise HTTPException(status_code=404, detail="No risk data found for this district")
            
        # Get latest signals
        messages = db.query(Message).filter(Message.district == district).order_by(Message.timestamp.desc()).limit(10).all()
        signals = [{"event_summary": m.text, "severity": m.toxicity_score * 5} for m in messages]
        
        # Get stats
        from .main import get_district_stats
        stats = get_district_stats(district, db)
        
        result = await narrative_service.generate_morning_briefing(
            district=district,
            risk_score=risk_score.score,
            risk_level=risk_score.risk_level,
            signals=signals,
            stats=stats
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """Check if AI services are operational"""
    return {
        "narrative": narrative_service.model is not None,
        "briefing": narrative_service.model is not None,
        "predictor": predictor_service.model is not None,
        "sentiment": sentiment_service.analyzer is not None,
        "status": "operational"
    }
