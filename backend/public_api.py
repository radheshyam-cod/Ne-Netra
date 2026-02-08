"""
Open Data API - Public Access

Rate-limited API for researchers and media
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import APIKeyHeader
from slowapi import Limiter
from slowapi.util import get_remote_address
from typing import Optional, List
import hashlib
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/v1/public")

# Rate limiting
limiter = Limiter(key_func=get_remote_address)

# API Key management
API_KEY_HEADER = APIKeyHeader(name="X-API-Key", auto_error=False)

class PublicDataAPI:
    """Public API for anonymized data"""
    
    def __init__(self, db_connection):
        self.db = db_connection
    
    def verify_api_key(self, api_key: str) -> Optional[Dict]:
        """Verify API key and return user info"""
        if not api_key:
            return None
        
        # Hash the API key
        key_hash = hashlib.sha256(api_key.encode()).hexdigest()
        
        user = self.db.query_one("""
            SELECT user_id, tier, requests_today, daily_limit
            FROM api_keys
            WHERE key_hash = %s AND is_active = true
        """, (key_hash,))
        
        if not user:
            return None
        
        # Check rate limit
        if user['requests_today'] >= user['daily_limit']:
            return None
        
        # Increment counter
        self.db.execute("""
            UPDATE api_keys 
            SET requests_today = requests_today + 1,
                last_used = NOW()
            WHERE key_hash = %s
        """, (key_hash,))
        
        return user
    
    @router.get("/districts")
    @limiter.limit("100/hour")
    async def get_districts(request: Request):
        """Get list of all districts (no auth required)"""
        districts = self.db.query("""
            SELECT DISTINCT district FROM risk_scores ORDER BY district
        """)
        
        return {
            "districts": [d['district'] for d in districts],
            "count": len(districts)
        }
    
    @router.get("/risk/{district}")
    @limiter.limit("100/hour")
    async def get_district_risk(
        district: str,
        request: Request,
        api_key: str = Depends(API_KEY_HEADER)
    ):
        """Get current risk score for a district"""
        user = self.verify_api_key(api_key) if api_key else None
        
        # Free tier: only current data
        # Paid tier: historical data
        
        if user and user['tier'] == 'premium':
            days = 90
        else:
            days = 1
        
        data = self.db.query("""
            SELECT
                date,
                score as risk_score,
                risk_level,
                -- Anonymized: no signal details
                (SELECT COUNT(*) FROM signals s 
                 WHERE s.district = rs.district AND DATE(s.timestamp) = rs.date) as signal_count
            FROM risk_scores rs
            WHERE district = %s 
            AND date >= CURRENT_DATE - INTERVAL '%s days'
            ORDER BY date DESC
        """, (district, days))
        
        if not data:
            raise HTTPException(status_code=404, detail="District not found")
        
        return {
            "district": district,
            "data": data,
            "tier": user['tier'] if user else 'free'
        }
    
    @router.get("/trends")
    @limiter.limit("50/hour")
    async def get_regional_trends(
        request: Request,
        api_key: str = Depends(API_KEY_HEADER)
    ):
        """Get regional risk trends (anonymized)"""
        user = self.verify_api_key(api_key)
        
        if not user:
            raise HTTPException(status_code=401, detail="API key required")
        
        # Aggregated trends (no individual signals)
        trends = self.db.query("""
            SELECT 
                date,
                AVG(score) as avg_risk,
                MAX(score) as max_risk,
                COUNT(DISTINCT district) as district_count
            FROM risk_scores
            WHERE date >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY date
            ORDER BY date DESC
        """)
        
        return {
            "period": "30 days",
            "trends": trends
        }
    
    @router.post("/register")
    async def register_api_key(request: Request, email: str, organization: str):
        """Register for API access"""
        # Generate API key
        import secrets
        api_key = secrets.token_urlsafe(32)
        key_hash = hashlib.sha256(api_key.encode()).hexdigest()
        
        # Save to database
        self.db.execute("""
            INSERT INTO api_keys (
                key_hash, email, organization, tier, daily_limit, is_active
            ) VALUES (%s, %s, %s, 'free', 100, true)
        """, (key_hash, email, organization))
        
        # Send email with API key
        # TODO: send_email(email, api_key)
        
        return {
            "api_key": api_key,
            "tier": "free",
            "daily_limit": 100,
            "message": "Save this API key securely. It won't be shown again."
        }


# Data sanitization
class DataSanitizer:
    """Remove PII from data before public release"""
    
    @staticmethod
    def sanitize_signal(signal: Dict) -> Dict:
        """Remove sensitive information from signal"""
        # Remove: exact location, user IDs, phone numbers, emails
        sanitized = {
            'district': signal['district'],
            'severity': signal['severity_score'],
            'source_type': signal['source_type'],
            'timestamp': signal['timestamp'].isoformat(),
            # Description redacted or summarized
            'category': signal.get('category', 'general')
        }
        
        return sanitized
    
    @staticmethod
    def detect_pii(text: str) -> bool:
        """Detect if text contains PII"""
        import re
        
        # Simple PII detection (phone, email, Aadhaar)
        patterns = [
            r'\b\d{10}\b',  # Phone number
            r'\b[\w\.-]+@[\w\.-]+\.\w+\b',  # Email
            r'\b\d{4}\s\d{4}\s\d{4}\b'  # Aadhaar
        ]
        
        for pattern in patterns:
            if re.search(pattern, text):
                return True
        
        return False
