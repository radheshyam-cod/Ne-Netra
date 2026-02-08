# NE-NETRA Risk Aggregation & Scoring Engine

## Overview

Complete DPDP-compliant risk aggregation system that transforms ingested district-level signals into actionable risk scores with full explainability.

## Architecture

**Pipeline Flow:**
```
Ingested Signals → Temporal Filtering → Weighted Aggregation → 3-Layer Scoring 
→ Composite Score (Sigmoid) → Trend Detection → Explainability → Output
```

## Key Features

✓ **Temporal Windows** - 24h / 72h / 7-day rolling windows  
✓ **Smart Weighting** - Severity × Recency × Geo-Sensitivity  
✓ **3-Layer Model** - Cognitive, Network, Physical independent scores  
✓ **Composite Scoring** - 0-100 scale with sigmoid activation  
✓ **Trend Detection** - Rising ↑ / Stable → / Falling ↓  
✓ **Explainability** - Top 3 contributing signals + rationale  
✓ **Threshold Flagging** - 30/60/75/90 administrative levels  
✓ **Decision Support** - No surveillance, district-level only

## Weighting Formula

```python
Signal Weight = (Severity/5) × Recency_Decay × Geo_Multiplier × Polarity_Factor

Where:
- Severity: 1-5 from ingestion module
- Recency_Decay: e^(-0.5 * hours_ago/24) [exponential decay]
- Geo_Multiplier: 1.0-1.6 based on sensitivity (border=1.5, capital=1.4)  
- Polarity_Factor: 1.0 (escalatory), -0.5 (stabilizing), 0.3 (neutral)
```

## 3-Layer Risk Model

Each layer scored independently (0-10):

**Cognitive Layer** - Language-based signals
- Rumors, misinformation, narratives
- Protests, agitation, threats
- Weight: 1.0

**Network Layer** - Coordination signals
- Bandhs, shutdowns, strikes
- Mass mobilization, coordinated actions
- Weight: 1.0

**Physical Layer** - Material incidents
- Violence, arms, explosives
- Narcotics, border activity
- Weight: 1.0

## Composite Score Calculation

```python
# Step 1: Weighted sum of layers
weighted_sum = Σ(layer_score × layer_weight)

# Step 2: Normalize to 0-100
normalized = (weighted_sum / 30) × 100

# Step 3: Apply sigmoid for smooth scaling
composite_score = 100 / (1 + e^(-0.1 * (normalized - 50)))
```

**Result:** Smooth 0-100 scale with realistic distribution

## Risk Thresholds

| Score Range | Level | Action Required |
|-------------|-------|-----------------|
| 0-29 | **BASELINE** | Standard monitoring |
| 30-59 | **MONITORING** | Enhanced situational awareness |
| 60-74 | **PREVENTIVE_READINESS** | Proactive measures, officer briefing |
| 75-89 | **SENIOR_REVIEW** | Senior administrative review required |
| 90-100 | **CRITICAL** | Immediate coordinated response |

## Trend Detection

Compares recent (last 24h) vs older (24-72h) signal severity:

- **Rising ↑** - Recent avg > Older avg + 0.5
- **Stable →** - Within ±0.5 range
- **Falling ↓** - Recent avg < Older avg - 0.5

## Usage

### Single District Risk Scoring

```python
from risk_aggregation import RiskAggregationEngine
from incident_ingestion import ProcessedSignal

engine = RiskAggregationEngine()

# Compute risk score for district
risk_score = engine.compute_district_risk(
    district="Imphal West",
    state="Manipur",
    signals=list_of_processed_signals,
    window_hours=24  # or 72, 168 (7 days)
)

# Access results
print(f"Score: {risk_score.composite_score}/100")
print(f"Risk Level: {risk_score.get_risk_level()}")
print(f"Trend: {risk_score.trend}")
print(f"Primary Trigger: {risk_score.primary_trigger}")
print(f"Top Signals: {risk_score.top_signals}")
```

### Batch Processing Multiple Districts

```python
# Group signals by district
district_signals = {
    "Imphal West": [signal1, signal2, ...],
    "Dibrugarh": [signal3, signal4, ...],
    # ...
}

# Compute all at once
results = engine.batch_compute_districts(
    district_signals,
    window_hours=24
)

# Access individual results
for district, score in results.items():
    print(f"{district}: {score.composite_score}/100")
```

## Output Format

```json
{
  "district": "Imphal West",
  "state": "Manipur",
  "score": 13.67,
  "risk_level": "low",
  "trend": "stable",
  "primary_trigger": "physical",
  "secondary_triggers": [],
  "layer_scores": {
    "cognitive": 1.53,
    "network": 0.00,
    "physical": 7.94
  },
  "top_contributing_signals": [
    {
      "event_summary": "Arms cache recovered near border area",
      "severity": 3,
      "timestamp": "2026-02-03T12:58:29",
      "source_type": "public_open_source",
      "layers": ["physical"],
      "location": "Imphal West"
    }
  ],
  "threshold": {
    "label": "BASELINE",
    "range": "0-29",
    "crossed": false
  },
  "time_window": "24h",
  "signal_count": 3,
  "timestamp": "2026-02-03T14:58:29",
  "governance_disclaimer": "Derived from public open-source indicators. Decision support only."
}
```

## Explainability Features

### Top Contributing Signals
- Automatically selects top 3 weighted signals
- Shows event summary (sanitized, no PII)
- Includes severity, timestamp, layers
- NO social media handles or personal identifiers

### "Why This District is Flagged"
Generated rationale includes:
- Primary trigger layer
- Secondary contributing layers
- Threshold crossed (if any)
- Signal count in window
- Trend direction

Example:
> "Primary trigger: Physical layer (7.94/10). Contributing signals include arms recovery and border activity. Score 13.67 remains in BASELINE range (0-29). Trend: stable based on 24h comparison."

## Safety Constraints

**DO:**
- Aggregate at district level only
- Use weighted scoring for nuance
- Provide full explainability
- Mark as "decision support only"
- Include governance disclaimers

**DO NOT:**
- Expose individual identifiers
- Claim predictive accuracy
- Present as surveillance output
- Skip explainability step
- Hide weighting methodology

## Integration with NE-NETRA Backend

```python
# In main.py or intelligence.py
from risk_aggregation import RiskAggregationEngine
from database import get_signals_for_district

engine = RiskAggregationEngine()

@app.post("/analyze")
def analyze_district(request: AnalysisRequest):
    # Get signals from database
    signals = get_signals_for_district(request.district)
    
    # Compute risk score
    risk_score = engine.compute_district_risk(
        district=request.district,
        state=request.state,
        signals=signals,
        window_hours=24
    )
    
    return risk_score.to_dict()
```

## Performance Considerations

- **Time Windows**: Larger windows (7d) process more signals but provide stability
- **Recency Decay**: Recent signals weighted higher (exponential decay)
- **Batch Processing**: Use `batch_compute_districts()` for efficiency
- **Caching**: Consider caching computations for frequently accessed districts

## Example Test Run

```bash
$ python3 risk_aggregation.py

=== District Risk Score ===
District Imphal West, Manipur
Composite Score: 13.67/100
Risk Level: LOW
Trend: stable
Primary Trigger: physical
Layer Scores:
  cognitive: 1.53/10
  network: 0.00/10
  physical: 7.94/10
Threshold: BASELINE (0-29)
Signals in Window: 3

Top Contributors:
  1. Arms cache recovered near border area... (Severity: 3)
  2. Mass protest rally with thousands... (Severity: 2)
  3. Peace dialogue meeting... (Severity: 1)

Governance: Derived from public open-source indicators. Decision support only.
```

## Time Window Recommendations

**24-hour** - Real-time tactical awareness
- Best for: Active situation monitoring
- Use case: Officer briefings, immediate response

**72-hour** - Short-term trend analysis
- Best for: Pattern identification, escalation detection
- Use case: Weekly planning, resource allocation

**7-day** - Strategic overview
- Best for: Long-term trends, baseline assessment
- Use case: Monthly reports, policy planning

## Files

- `risk_aggregation.py` - Core aggregation engine (560 lines)
- `AGGREGATION_README.md` - This documentation
- Test output included in module

## Next Steps

1. **Integration**: Connect to database and `/analyze` endpoint
2. **Caching**: Add Redis caching for computed scores
3. **Historical**: Implement trend history storage
4. **Alerting**: Add threshold-crossing notifications
5. **Visualization**: Enhance frontend charts with this data

---

**DPDP Act 2023 Compliant | Decision Support Only | District-Level Aggregation**
