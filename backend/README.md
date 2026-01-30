# NE-NETRA Backend

FastAPI-based backend for the NE-NETRA Early Warning Platform.

## Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Start server
python main.py
```

Server will run on: http://localhost:8000

API documentation: http://localhost:8000/docs

## Database

The backend uses SQLite for the prototype. The database file `ne_netra.db` is created automatically on first run.

### Tables
- **messages**: Ingested public/synthetic text data
- **risk_scores**: Computed risk assessments
- **officer_reviews**: Human-in-the-loop reviews
- **audit_logs**: Complete audit trail

### Reset Database

To reset the database:
```bash
rm ne_netra.db
python main.py  # Will recreate tables
```

## Loading Demo Data

```bash
# Load all demo scenarios
python load_demo_data.py

# Load specific scenario
python load_demo_data.py baseline    # Low risk
python load_demo_data.py tension     # Medium risk
python load_demo_data.py realistic   # High risk with escalation pattern
python load_demo_data.py escalation  # High risk
```

## API Endpoints

### Ingestion
- `POST /ingest` - Ingest a message

### Analysis
- `POST /analyze` - Analyze district and compute risk score
- `GET /risk-score/{district}` - Get latest risk score

### Review
- `POST /review` - Submit officer review
- `GET /audit-log/{district}` - Get audit log

### Utilities
- `GET /districts` - List districts with data
- `GET /stats/{district}` - Get district statistics

## AI Intelligence

The `intelligence.py` module contains all AI logic:

- **Sentiment Analysis**: Keyword-based positive/negative detection
- **Toxicity Scoring**: Weighted inflammatory language detection
- **Velocity Calculation**: Message frequency analysis
- **Geo-Sensitivity**: Location-based risk weighting
- **Composite Risk Score**: Transparent weighted formula

All methods are interpretable and explainable.

## Configuration

For production deployment:
- Replace SQLite with PostgreSQL
- Add authentication/authorization
- Enable HTTPS
- Configure CORS for specific origins
- Set up logging and monitoring
- Implement rate limiting
