# NE-NETRA Incident Ingestion Module

## Overview

DPDP Act 2023 compliant backend module for ingesting and processing district-level incident data from Northeast India.

## Features

✓ **Automated Risk Classification** - 3-layer model (Cognitive, Network, Physical)  
✓ **Severity Scoring** - 1-5 scale based on event characteristics  
✓ **Polarity Detection** - Escalatory vs Stabilizing  
✓ **Geo-Sensitivity Tagging** - Border, Market, Highway, Capital markers  
✓ **Explainable Outputs** - Classification rationale for each signal  
✓ **DPDP Compliance** - No PII, district-level only, public source marking  
✓ **Batch Processing** - CSV ingestion with audit trail

## DPDP Act 2023 Compliance

- ✅ **District-Level Only**: All signals aggregated at district level
- ✅ **No PII Storage**: No personal identifiers stored
- ✅ **Public Source Marking**: All data marked as "public_open_source"
- ✅ **Explainable**: Classification rationale generated for every signal
- ✅ **Auditable**: Complete processing trail saved to JSON

## Usage

### 1. Single Incident Processing

```python
from incident_ingestion import IncidentIngestionModule

ingestion = IncidentIngestionModule()

signal = ingestion.process_incident(
    state="Manipur",
    district="Imphal West",
    event_summary="Mass protest rally with thousands participating",
    location="Imphal city center",
    timestamp=datetime(2026, 2, 3, 10, 30),
    source_url="https://example.com/news"
)

print(f"Risk Layers: {[layer.value for layer in signal.risk_layers]}")
print(f"Severity: {signal.severity_score}/5")
print(f"Rationale: {signal.classification_rationale}")
```

### 2. CSV Batch Processing

```bash
# Process CSV file and ingest to backend
python csv_batch_ingestion.py sample_incidents.csv

# With custom backend URL
python csv_batch_ingestion.py mydata.csv http://localhost:8000
```

**CSV Format:**
```csv
state,district,event_summary,location,timestamp,source_url
Manipur,Imphal West,Mass protest rally organized...,Imphal city,2026-02-03 10:30:00,
Assam,Kamrup Metropolitan,Arms cache recovered...,Guwahati,2026-02-02 14:00:00,
```

Required columns: `state`, `district`, `event_summary`  
Optional columns: `location`, `timestamp`, `source_url`

## Risk Classification System

### Risk Layers

**Cognitive** - Language-based signals  
- Rumors, misinformation, fake news
- Threats, warnings, narratives
- Protests, agitation, slogans

**Network** - Coordination signals  
- Bandhs, shutdowns, strikes
- Mass rallies, widespread mobilization
- Coordinated/simultaneous actions

**Physical** - Material incidents  
- Violence, clashes, assaults
- Arms/weapons/explosives
- Narcotics, smuggling
- Border/infiltration activity

### Severity Scoring (1-5)

**Factors:**
- Scale of participation (mass, thousands)
- Violence or weapons present
- Duration (indefinite, prolonged)
- Multiple risk layers involved
- Geographic sensitivity

**Scores:**
- 1-2: Low-level incident
- 3: Medium severity
- 4: High severity
- 5: Critical incident

### Geo-Sensitivity Tags

- `border_area` - International border proximity
- `market_trade_hub` - Commercial centers
- `highway_transit` - Major transportation corridors
- `capital_admin` - State capitals, administrative centers

## Output Format

Each processed signal includes:

```json
{
  "state": "Manipur",
  "district": "Imphal West",
  "location": "Imphal city center",
  "event_summary": "Mass protest rally...",
  "timestamp": "2026-02-03T10:30:00",
  "source_url": null,
  "source_type": "public_open_source",
  "risk_layers": ["cognitive", "network"],
  "polarity": "escalatory",
  "severity_score": 4,
  "geo_sensitivity": ["capital_admin"],
  "classification_rationale": "Classified as cognitive, network risk layer(s)...",
  "pii_redacted": true,
  "district_level_only": true,
  "ingestion_timestamp": "2026-02-03T14:53:09"
}
```

## Sample Dataset

Included: `sample_incidents.csv` with 10 diverse incidents:
- Covers all 8 NE states
- Mix of risk layers (cognitive, network, physical)
- Various severity levels (1-5)
- Different geo-sensitivity contexts

## Batch Processing Output

Generates:
1. **Console Summary** - Risk classification breakdown, severity distribution
2. **Audit JSON** - `processed_signals_YYYYMMDD_HHMMSS.json` with all signals
3. **Backend Ingestion** - Sends signals to `/ingest` endpoint
4. **Success Report** - Ingestion success rate and error count

## Integration with NE-NETRA Backend

Compatible with existing `/ingest` endpoint:
- Auto-converts to backend payload format
- Handles batch ingestion with error handling
- Preserves district-level association
- Maintains DPDP compliance markers

## Files

- `incident_ingestion.py` - Core ingestion module
- `csv_batch_ingestion.py` - Batch processor
- `sample_incidents.csv` - Sample dataset
- `INGESTION_README.md` - This file

## Constraints & Safety

**DO NOT:**
- Store individual identifiers
- Infer intent of specific persons
- Track movement across locations
- Create individual profiles

**DO:**
- Aggregate at district level
- Mark all as public open-source
- Generate explainable rationale
- Preserve audit trail

## Example Workflow

```bash
# 1. Prepare your CSV with incident data
# state,district,event_summary,location,timestamp,source_url

# 2. Run batch ingestion
python csv_batch_ingestion.py your_data.csv

#3. Review console output for summary
# [1/4] Loading incidents from CSV...
# [2/4] Processing 50 incidents...
# [3/4] Risk Classification Summary...
# [4/4] Sending signals to backend...

# 4. Check generated audit file
# processed_signals_20260203_145309.json

# 5. Verify in dashboard
# District risk scores will update based on new signals
```

## Testing

Run example ingestion:
```bash
python csv_batch_ingestion.py sample_incidents.csv
```

Expected output:
- 10 incidents processed
- Mix of cognitive/network/physical classifications
- Severity range 2-4
- Various geo-sensitivity tags
- 100% success rate (if backend running)

---

**DPDP Act 2023 Aligned | District-Level Only | No Individual Surveillance**
