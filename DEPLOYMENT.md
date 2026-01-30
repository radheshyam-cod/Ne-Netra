# NE-NETRA Deployment Guide

This guide covers deploying NE-NETRA for a controlled 6-week pilot in 2 districts.

## Prerequisites

### Infrastructure
- Government cloud instance (NIC/MeitY recommended)
- Ubuntu 20.04 LTS or similar
- 4GB RAM minimum
- 20GB storage
- SSL certificate for HTTPS

### Software
- Python 3.9+
- Node.js 18+
- PostgreSQL 14+
- Nginx (for reverse proxy)
- PM2 or systemd (for process management)

## Production Setup

### 1. Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python
sudo apt install python3.9 python3-pip python3-venv -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install Nginx
sudo apt install nginx -y
```

### 2. Database Setup

```bash
# Create database
sudo -u postgres psql
CREATE DATABASE ne_netra;
CREATE USER ne_netra_user WITH PASSWORD 'SECURE_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE ne_netra TO ne_netra_user;
\q
```

Update `backend/database.py`:
```python
# Replace SQLite URL with PostgreSQL
SQLALCHEMY_DATABASE_URL = "postgresql://ne_netra_user:SECURE_PASSWORD_HERE@localhost/ne_netra"

# Remove SQLite-specific connect_args
engine = create_engine(SQLALCHEMY_DATABASE_URL)
```

### 3. Backend Deployment

```bash
# Clone repository
git clone <repository-url>
cd ne-netra

# Create virtual environment
cd backend
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install psycopg2-binary  # For PostgreSQL

# Initialize database
python -c "from database import init_db; init_db()"

# Test backend
python main.py
# Should start on port 8000
```

### 4. Frontend Build

```bash
# In project root
npm install

# Build for production
npm run build
# Creates /dist directory
```

### 5. Nginx Configuration

Create `/etc/nginx/sites-available/ne-netra`:

```nginx
server {
    listen 80;
    server_name your-domain.gov.in;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.gov.in;

    # SSL Configuration
    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Frontend (React build)
    location / {
        root /var/www/ne-netra/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/ne-netra /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. Process Management (systemd)

Create `/etc/systemd/system/ne-netra-backend.service`:

```ini
[Unit]
Description=NE-NETRA Backend API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/ne-netra/backend
Environment="PATH=/opt/ne-netra/backend/venv/bin"
ExecStart=/opt/ne-netra/backend/venv/bin/python main.py
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable ne-netra-backend
sudo systemctl start ne-netra-backend
sudo systemctl status ne-netra-backend
```

## Security Hardening

### 1. API Security

Update `backend/main.py`:

```python
# Add authentication middleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

@app.post("/review")
def submit_review(
    review: OfficerReviewInput,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    # Verify JWT token
    verify_token(credentials.credentials)
    # ... rest of endpoint
```

### 2. CORS Configuration

```python
# Restrict CORS to specific domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-domain.gov.in"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

### 3. Rate Limiting

```bash
pip install slowapi
```

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/analyze")
@limiter.limit("5/minute")
def analyze_district(request: Request, ...):
    # Endpoint logic
```

### 4. Environment Variables

Create `.env` file:
```
DATABASE_URL=postgresql://user:pass@localhost/ne_netra
SECRET_KEY=your-secret-key-here
API_KEY=your-api-key-here
```

Use python-dotenv:
```python
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
```

## Data Integration

### Public Data Sources (with consent)

Example: Twitter/X public API integration

```python
# backend/data_sources/twitter_public.py

def fetch_public_tweets(district_hashtag: str, since_date: str):
    """
    Fetch public tweets with consent/legal approval
    Only public data, no private accounts
    """
    # Use Twitter API v2 with proper authentication
    # Filter by district-specific hashtags/keywords
    # Apply rate limiting
    # Return aggregated data only
    pass
```

## Monitoring & Logging

### 1. Application Logging

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/ne-netra/app.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)
```

### 2. Metrics Collection

```bash
pip install prometheus-fastapi-instrumentator
```

```python
from prometheus_fastapi_instrumentator import Instrumentator

app = FastAPI()
Instrumentator().instrument(app).expose(app)
```

## Backup & Recovery

### Database Backup

```bash
# Cron job for daily backups
0 2 * * * pg_dump ne_netra > /backups/ne_netra_$(date +\%Y\%m\%d).sql
```

### Application Backup

```bash
# Backup configuration and code
tar -czf ne-netra-backup-$(date +%Y%m%d).tar.gz /opt/ne-netra
```

## Pilot Onboarding Checklist

### Week 1: Infrastructure
- [ ] Provision server on government cloud
- [ ] Set up PostgreSQL database
- [ ] Configure SSL certificates
- [ ] Deploy backend and frontend
- [ ] Test end-to-end flow

### Week 2: Data Integration
- [ ] Obtain legal approval for data sources
- [ ] Configure data ingestion pipeline
- [ ] Test AI analysis on pilot data
- [ ] Verify DPDP compliance

### Week 3: Officer Training
- [ ] Conduct training session for DM/SP offices
- [ ] Provide user manual
- [ ] Set up support channel
- [ ] Test review workflow

### Week 4-6: Operation & Evaluation
- [ ] Daily monitoring
- [ ] Collect officer feedback
- [ ] Measure metrics (false positives, time-to-review)
- [ ] Refine AI thresholds
- [ ] Document lessons learned

## Troubleshooting

### Backend not starting
```bash
# Check logs
journalctl -u ne-netra-backend -n 50

# Test database connection
python -c "from database import engine; engine.connect()"
```

### Frontend not loading
```bash
# Check Nginx logs
tail -f /var/log/nginx/error.log

# Verify build
ls -la /var/www/ne-netra/dist
```

### Database connection issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -U ne_netra_user -d ne_netra -h localhost
```

## Rollback Plan

If issues occur during pilot:

1. **Stop ingestion**: Pause data pipeline
2. **Backup current state**: Export database
3. **Revert to previous version**: Restore from backup
4. **Investigate issue**: Review logs and error reports
5. **Fix and redeploy**: Apply fixes and test thoroughly

## Contact & Support

- **Technical Lead**: [Contact Details]
- **Governance Officer**: [Contact Details]
- **NIC Support**: [Contact Details]
