"""
Pydantic models for request/response validation
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class MessageIngest(BaseModel):
    """Input model for ingesting public/synthetic data"""
    district: str = Field(..., description="District name")
    text: str = Field(..., description="Public text content")
    source_type: str = Field(default="synthetic", description="Data source type")
    geo_sensitivity: str = Field(
        default="normal",
        description="Location sensitivity: market, highway, sensitive_zone, normal"
    )
    timestamp: Optional[datetime] = None


class RiskScoreResponse(BaseModel):
    """Response model for risk score"""
    district: str
    score: float
    risk_level: str
    trend: str
    primary_trigger: str
    timestamp: datetime
    
    # Explainability
    components: dict
    layer_scores: dict
    contributing_factors: List[dict]
    suggested_actions: List[dict]
    hotspots: List[dict]
    
    class Config:
        from_attributes = True


class OfficerReviewInput(BaseModel):
    """Input model for officer review"""
    district: str
    risk_score_id: int
    officer_name: str
    officer_rank: str
    reviewed: bool
    notes: str
    action_taken: Optional[str] = None


class AuditLogEntry(BaseModel):
    """Audit log entry"""
    id: int
    district: str
    officer_name: str
    action: str
    timestamp: datetime
    
    class Config:
        from_attributes = True


class AnalysisRequest(BaseModel):
    """Request to analyze data for a district"""
    district: str


class AnalysisResponse(BaseModel):
    """Analysis results"""
    district: str
    messages_analyzed: int
    risk_score: float
    risk_level: str
    primary_trigger: str
    timestamp: datetime


class RiskHistoryPoint(BaseModel):
    """Simplified risk point for trend charts"""
    timestamp: datetime
    score: float
    risk_level: str

