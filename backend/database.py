"""
Database setup and models for NE-NETRA
Uses SQLite for prototype - easily upgradeable to PostgreSQL for production
"""
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# SQLite database - stored in backend directory
SQLALCHEMY_DATABASE_URL = "sqlite:///./ne_netra.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class Message(Base):
    """
    Stores ingested public/synthetic text data
    COMPLIANCE: District-level only, no individual tracking
    """
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    district = Column(String, index=True)
    text = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)
    source_type = Column(String)  # "synthetic", "public_forum", etc.
    geo_sensitivity = Column(String)  # "market", "highway", "sensitive_zone", "normal"
    
    # Analysis results
    sentiment_score = Column(Float, nullable=True)
    toxicity_score = Column(Float, nullable=True)
    processed = Column(Boolean, default=False)


class RiskScore(Base):
    """
    Stores computed risk scores for each district
    """
    __tablename__ = "risk_scores"
    
    id = Column(Integer, primary_key=True, index=True)
    district = Column(String, index=True)
    score = Column(Float)  # 0-100
    risk_level = Column(String)  # "low", "medium", "high", "critical"
    trend = Column(String)  # "rising", "stable", "falling"
    primary_trigger = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Explainability fields
    sentiment_component = Column(Float)
    toxicity_component = Column(Float)
    velocity_component = Column(Float)
    geo_sensitivity_component = Column(Float)
    
    # JSON storage for dynamic lists
    suggested_actions = Column(Text)  # JSON list
    hotspots = Column(Text)  # JSON list


class OfficerReview(Base):
    """
    Human-in-the-loop: Officer reviews and decisions
    COMPLIANCE: Final decision always human-led
    """
    __tablename__ = "officer_reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    district = Column(String, index=True)
    risk_score_id = Column(Integer)
    officer_name = Column(String)
    officer_rank = Column(String)
    reviewed = Column(Boolean, default=False)
    notes = Column(Text)
    action_taken = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)


class AuditLog(Base):
    """
    Complete audit trail for accountability
    """
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    district = Column(String, index=True)
    officer_name = Column(String)
    action = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)
    meta_info = Column(Text, nullable=True)  # JSON string for additional context


class RiskRule(Base):
    """
    Configurable risk weights (Admin controlled)
    """
    __tablename__ = "risk_rules"
    
    id = Column(Integer, primary_key=True, index=True)
    district = Column(String, unique=True, index=True)
    w_cognitive = Column(Float, default=1.0)
    w_network = Column(Float, default=1.0)
    w_physical = Column(Float, default=1.0)
    last_updated = Column(DateTime, default=datetime.utcnow)
    updated_by = Column(String)  # Admin username

# Create all tables
def init_db():
    Base.metadata.create_all(bind=engine)


# Dependency for getting DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
