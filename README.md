# NE-NETRA: Early Warning & Accountability Platform

### North-East India District-Level Intelligence Dashboard

![DPDP Act 2023](https://img.shields.io/badge/DPDP_Act_2023-Compliant-green)
![License](https://img.shields.io/badge/License-Prototype-blue)

---

## 🎯 Executive Summary

NE-NETRA is an **AI-assisted, human-in-the-loop early warning system** designed for district-level administrators (District Magistrates, Superintendents of Police) in North-East India. It detects early signals of misinformation-driven escalation and provides **decision support only** - never automated enforcement.


### Key Principles

- ✅ **District/block-level aggregation only** (no individual tracking)
- ✅ **Public/synthetic data only** (no surveillance, no private messages)
- ✅ **Decision support only** (final decisions always human-led)
- ✅ **Full transparency** (explainable AI, complete audit trail)
- ✅ **DPDP Act 2023 compliant** (privacy-first design)

---

## 📊 Problem Statement

**Context**: North-East India faces periodic escalation events driven by:

- Rapid spread of misinformation on social media
- Coordinated mobilization in sensitive geographic zones
- Language/dialect-specific content that evades national moderation

**Gap**: Current systems lack:

- Early warning capability at district level
- Explainable risk scoring
- Human-in-the-loop accountability
- Privacy-compliant design

**Solution**: NE-NETRA provides a **6-week pilot-ready prototype** demonstrating:

1. Interpretable composite risk scoring (0-100)
2. Dynamic geographic hotspot identification (Backend-driven)
3. Context-aware suggested actions (Decision support)
4. Officer review panel with full audit trail

---

## 🏗️ System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Risk Score   │  │  Geo-Risk    │  │  Suggested   │     │
│  │  Dashboard   │  │   Hotspots   │  │   Actions    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                           │                                 │
│                     REST API (HTTPS)                        │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                   BACKEND (FastAPI)                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         AI INTELLIGENCE ENGINE                       │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │  │
│  │  │Sentiment │ │Toxicity  │ │Velocity  │ │ Geo-   │  │  │
│  │  │Analysis  │ │Scoring   │ │Calc      │ │Weights │  │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────┘  │  │
│  │         │           │           │           │         │  │
│  │         └───────────┴───────────┴───────────┘         │  │
│  │                      │                                │  │
│  │           COMPOSITE RISK SCORE (0-100)               │  │
│  │              (Explainable Formula)                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              DATA LAYER (SQLite)                     │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │  │
│  │  │Messages  │ │Risk Score│ │Officer   │ │ Audit  │  │  │
│  │  │(District)│ │(History) │ │Reviews   │ │  Log   │  │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧠 AI Intelligence Logic: 3-Layer Risk Model

NE-NETRA uses a **hierarchical 3-layer risk model** optimized for district-level early warning.

```text
Composite Risk Score (CRS) = Sigmoid( w1*C_t + w2*N_t + w3*P_t )
```


### Layer 1: Cognitive Layer (C_t) - "What is being said?"
- **Signals**: Toxicity (Inflammatory language), Sentiment Intensity, Code-Switching (Language mixing).
- **Goal**: Detect intent and emotional charge.


### Layer 2: Network Layer (N_t) - "How is it spreading?"
- **Signals**: Message Velocity (Msgs/hr), Virality (Share keywords), Cluster Density.
- **Goal**: Detect coordinated mobilization and artificial amplification.


### Layer 3: Physical Layer (P_t) - "Where is it happening?"
- **Signals**: Geo-sensitivity of district, Historical volatility baseline.
- **Goal**: Contextualize digital signals with physical reality.


### Activation: Sigmoid Scaling
- The linear combination is passed through a **Sigmoid function** to provide a normalized 0-100 probability score, differentiating between "noise" (low score) and "signal" (high score) effectively.


### Explainability
Every score is decomposed into its 3 layers for the end-user (see "Risk Score Breakdown" in UI).


### Trend Detection
- **Rising**: Message volume increased by 30%+ in last **6 hours**
- **Stable**: No significant change
- **Falling**: Message volume decreased by 30%+ in last **6 hours**

---

## 🔍 Architectural Honesty: What This Prototype Does and Does Not Claim

| Feature | Claim | Reality (Pilot Prototype) |
| :--- | :--- | :--- |
| **Connectivity** | "Offline Support" | **Limited**. Uses IndexedDB to queue requests. Syncs on reconnection. No sophisticated conflict resolution. |
| **AI Intelligence** | "Risk Scoring" | **Heuristic**. Uses keyword-weighted logic + simple sigmoid normalization. No deep learning (Transformers/LLMs) used in core scoring loop to ensure explainability. |
| **Language** | "Indic Support" | **Basic**. Detects script type (Devanagari/Bengali). Does NOT perform full semantic translation or context-aware NLP in this phase. |
| **Data** | "Federated Learning" | **Simulated**. Admin can adjust weights per district, which simulates the effect of federated updates. No actual on-device training or parameter aggregation occurs on client devices. |
| **Security** | "Immutable Audit" | **Hash-Chained Log**. Uses SHA-256 linking of JSON entries in a file. Defensible for audit, but not a distributed blockchain. |

---

## 🔒 Governance & DPDP Compliance

### Data Protection Safeguards

| Requirement | Implementation |
| :--- | :--- |
| **No Individual Tracking** | District-level aggregation only. No names, phone numbers, or personal identifiers stored. |
| **Public Data Only** | System designed for public forums, synthetic data. No private messages or surveillance. |
| **Consent Required** | In production, only consented or publicly available data sources. |
| **Right to Deletion** | SQLite database allows easy data purging per district. |
| **Purpose Limitation** | Data used ONLY for early warning, not for predictive policing or profiling. |
| **Transparency** | Full explainability: WHY a score is high, WHAT contributed, WHEN it was calculated. |
| **Human Oversight** | Officer review required. No automated actions. |
| **Audit Trail** | Complete log of all reviews, decisions, and system actions. |

### Compliance Labels (Visible in UI)
- ✅ **"Decision Support Only - No Automated Enforcement"**
- ✅ **"DPDP Act 2023 Aligned"**
- ✅ **"Public / Synthetic Data Only"**

### NOT Implemented (By Design)
- ❌ Face recognition
- ❌ Individual profiling
- ❌ Predictive policing
- ❌ Automated enforcement
- ❌ Private message monitoring
- ❌ Cross-border data sharing without consent

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.9+**
- **Node.js 18+**
- **npm or yarn**

### 1. Clone Repository

```bash
git clone <repository-url>
cd ne-netra
```

### 2. Start Backend (Terminal 1)

```bash
cd backend

# Install dependencies
pip3 install -r requirements.txt

# Seed database with demo data (first time only)
python3 seed_db.py

# Start FastAPI server
python3 main.py
```

Backend will run at: <http://localhost:8000>

API docs available at: <http://localhost:8000/docs>

### 3. Start Frontend (Terminal 2)

```bash
# In project root
npm install

# Start development server
npm run dev
```

Frontend will run at: <http://localhost:5173>

### 4. Access Dashboard

1. Open browser: <http://localhost:5173>
2. Select a district from dropdown (try **East Khasi Hills** for high-risk example)
3. Explore features:
   - **Dashboard** - Overview with risk score and map
   - **Risk Analysis** - Detailed breakdown with export options
   - **Suggested Actions** - AI-generated recommendations
   - **Officer Review** - Human verification workflow
   - **Audit Log** - Transparency and accountability trail

### 5. Test Key Features

**Ingest New Intelligence:**
1. Go to "Ingest Intelligence" page
2. Enter sample text (e.g., "Protest rally planned at market")
3. Select source type and sensitivity
4. Click "Ingest & Analyze"

**Submit Officer Review:**
1. Navigate to "Officer Review"
2. Fill in your rank and name
3. Check "Reviewed by Authorized Officer"
4. Add review notes
5. Submit - your review appears in Audit Log

**Export Reports:**
1. Go to "Risk Analysis" page
2. Click "Export PDF" for full report
3. Click "Export CSV" for trend data
4. Check your downloads folder

---

## 📁 Project Structure

```text
ne-netra/
├── backend/                    # Python FastAPI backend
│   ├── main.py                # API server with all endpoints
│   ├── database.py            # SQLAlchemy models & DB setup
│   ├── models.py              # Pydantic request/response models
│   ├── intelligence.py        # AI logic (sentiment, toxicity, risk scoring)
│   ├── seed_db.py             # Database seeding with demo data
│   ├── sample_data.py         # Synthetic data generator
│   ├── requirements.txt       # Python dependencies
│   └── ne_netra.db            # SQLite database (created on first run)
│
├── src/
│   ├── app/
│   │   ├── App.tsx            # Main application router
│   │   ├── pages/             # Page components
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── RiskAnalysisPage.tsx
│   │   │   ├── ActionsPage.tsx
│   │   │   ├── ReviewPage.tsx
│   │   │   ├── AuditPage.tsx
│   │   │   └── IngestPage.tsx
│   │   ├── components/        # Reusable React components
│   │   │   ├── dashboard-header.tsx
│   │   │   ├── risk-score-card.tsx
│   │   │   ├── risk-explanation-panel.tsx
│   │   │   ├── risk-map.tsx
│   │   │   ├── charts/
│   │   │   │   └── RiskTrendChart.tsx
│   │   │   └── ui/            # UI primitives
│   │   ├── services/
│   │   │   └── api.ts         # API integration layer
│   │   └── utils/
│   │       └── export.ts      # PDF/CSV export utilities
│   └── styles/
│       └── index.css          # Global styles & design tokens
│
├── package.json               # Node.js dependencies
└── README.md                  # This file
```

---

## 🔍 API Endpoints

### Base URL: `http://localhost:8000`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/` | Health check |
| **POST** | `/ingest` | Ingest public/synthetic text data |
| **POST** | `/analyze` | Run AI analysis for a district |
| **GET** | `/risk-score/{district}` | Get latest risk score |
| **GET** | `/risk-history/{district}` | Get 24-hour risk trend data |
| **POST** | `/review` | Submit officer review |
| **GET** | `/audit-log/{district}` | Get audit trail |
| **GET** | `/districts` | List all districts |
| **GET** | `/stats/{district}` | Get district statistics |

### Example: Get Risk Score

```bash
curl http://localhost:8000/risk-score/East%20Khasi%20Hills
```

Response:

```json
{
  "district": "East Khasi Hills",
  "score": 60,
  "risk_level": "high",
  "trend": "rising",
  "primary_trigger": "Physical Risk (Geo-Volatility)",
  "last_updated": "2 hours ago",
  "components": {
    "toxicity": 18.5,
    "velocity": 15.2,
    "geo_sensitivity": 20.0,
    "temporal_acceleration": 8.3
  },
  "layer_scores": {
    "cognitive": 3.7,
    "network": 10.0,
    "physical": 19.1
  },
  "contributing_factors": [
    {
      "label": "High Border Sensitivity",
      "severity": "critical",
      "value": "Score: 20/25"
    },
    {
      "label": "Elevated Network Velocity",
      "severity": "high",
      "value": "15.2 msgs/hr"
    }
  ],
  "suggested_actions": [
    {
      "priority": "high",
      "action": "Consider increasing patrol in hotspot areas",
      "rationale": "High risk score with rising trend"
    }
  ],
  "hotspots": [
    {
      "location": "Market",
      "severity": "high",
      "incidents": 8,
      "type": "market"
    }
  ]
}
```

### Example: Get Risk History

```bash
curl http://localhost:8000/risk-history/East%20Khasi%20Hills
```

Response: Array of historical risk scores for trend analysis and CSV export.

---

## 🧪 Testing Scenarios

### Scenario 1: Low Risk District
- **District**: Aizawl
- **Expected Score**: 10-25 (Low)
- **What to Test**: 
  - Minimal suggested actions (baseline monitoring only)
  - Clean number formatting
  - Loading states when switching
- **Key Feature**: Switch to this district to see "low priority" recommendations

### Scenario 2: Medium Risk District

- **District**: Dimapur
- **Expected Score**: 30-50 (Medium)
- **What to Test**:
  - Moderate suggested actions
  - Yellow/amber severity indicators
  - Officer review workflow
- **Key Feature**: Good example for testing human-in-the-loop review

### Scenario 3: High Risk District

- **District**: East Khasi Hills
- **Expected Score**: 60+ (High/Critical)
- **What to Test**:
  - Multiple specific action items
  - Layer scaling (should show proper 0-10 range)
  - Export PDF/CSV functionality
  - Hotspot visualization
- **Key Feature**: Best district for demonstrating full feature set

![High Risk District Example](file:///Users/radheshyambhati/.gemini/antigravity/brain/0aeb5580-2549-4009-ade4-50c0bc51411c/.system_generated/click_feedback/click_feedback_1769792265307.png)

### Scenario 4: Testing Exports

- **District**: Any high-risk district
- **What to Test**:
  1. Navigate to Risk Analysis page
  2. Click "Export PDF" - should download professional report
  3. Click "Export CSV" - should download trend data
  4. Navigate to Audit Log page
  5. Submit officer review first, then click "Export CSV"
- **Expected**: Well-formatted PDF reports and CSV files with proper timestamps

---

## 📋 Pilot Deployment Roadmap (6 Weeks)

### Week 1-2: Infrastructure Setup

- [ ] Deploy backend on government cloud (NIC/MeitY)
- [ ] Set up secure database (PostgreSQL)
- [ ] Configure SSL/TLS
- [ ] Onboard 2 pilot districts (e.g., Kamrup Metro, Dibrugarh)

### Week 3-4: Data Integration

- [ ] Integrate public data sources (with consent/legal approval)
- [ ] Set up data ingestion pipeline
- [ ] Test risk scoring on real data
- [ ] Train district officers on dashboard

### Week 5: Human-in-the-Loop Training

- [ ] Conduct officer training sessions
- [ ] Establish review protocols
- [ ] Test full workflow: Ingest → Analyze → Review → Action

### Week 6: Evaluation & Iteration

- [ ] Collect feedback from DM/SP offices
- [ ] Measure: false positive rate, officer engagement, time-to-review
- [ ] Refine AI thresholds based on ground truth
- [ ] Document lessons learned

---

## 🎨 UI/UX Design Specification

### Design System

- **Theme**: Dark, authoritative, calm
- **Font**: Inter (Google Fonts)
- **Colors**:
  - Background: `#0f1419` (dark charcoal)
  - Text: `#e8eaed` (high contrast white)
  - Severity: Green (#10b981), Amber (#f59e0b), Red (#ef4444), Critical (#dc2626)
- **Layout**: Desktop-first (1440px), responsive
- **Accessibility**: WCAG AA compliant contrast ratios

### Dashboard Layout

```text
┌─────────────────────────────────────────────────────────────┐
│  HEADER: NE-NETRA | District Selector | Live Time           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐  ┌──────────────────────────────────┐ │
│  │ RISK SCORE CARD  │  │     GEO-RISK MAP                 │ │
│  │   67/100 (High)  │  │  ┌────────────────────────────┐  │ │
│  │   Rising ↑       │  │  │  [District Map Placeholder] │  │ │
│  └──────────────────┘  │  └────────────────────────────┘  │ │
│                        │                                   │ │
│  ┌──────────────────┐  │  ACTIVE HOTSPOTS:                │ │
│  │ RISK EXPLANATION │  │  • Central Market (High)         │ │
│  │                  │  │  • Highway Junction (Medium)     │ │
│  │ Primary Trigger: │  └──────────────────────────────────┘ │
│  │ "High toxicity   │                                       │
│  │  detected..."    │                                       │
│  │                  │                                       │
│  │ Factors:         │                                       │
│  │ • Inflammatory..│                                       │
│  │ • Velocity...    │                                       │
│  └──────────────────┘                                       │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────┐  ┌───────────────────┐   │
│  │ SUGGESTED ACTIONS            │  │ OFFICER REVIEW    │   │
│  │ [Decision Support Label]     │  │                   │   │
│  │                              │  │ ☑ Reviewed by     │   │
│  │ • Increase patrol...         │  │   Officer         │   │
│  │ • Monitor social media...    │  │                   │   │
│  │ • Brief SHOs...              │  │ Notes: [______]   │   │
│  └──────────────────────────────┘  │                   │   │
│                                     │ [Submit Review]   │   │
│                                     │                   │   │
│                                     │ AUDIT LOG:        │   │
│                                     │ • SP Sharma 14:23 │   │
│                                     └───────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  FOOTER: Compliance Badges | DPDP Act 2023 | v1.0           │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚠️ Limitations & Disclaimers

### What This Prototype IS
✅ Proof-of-concept for 6-week controlled pilot  
✅ Demonstration of explainable AI + human-in-the-loop  
✅ District-level early warning capability  
✅ DPDP-compliant architecture  


### What This Prototype IS NOT
❌ Production-ready system (requires hardening)  
❌ Real-time monitoring (demo uses batch analysis)  
❌ Predictive policing tool  
❌ Surveillance system  
❌ Replacement for human judgment  


### Known Limitations
- **Synthetic data**: All demo data is fabricated for testing
- **Keyword-based AI**: Simple interpretable logic (not deep learning)
- **No encryption**: Prototype uses HTTP (production requires HTTPS)
- **Single-user**: No authentication/authorization implemented
- **SQLite**: Not for production scale (use PostgreSQL)
- **Client-side exports**: PDF generation happens in browser (may have size limits)


### Recent Fixes (v2.0)
- ✅ **Fixed**: Number formatting shows clean values (15 instead of 15.123...)
- ✅ **Fixed**: Layer scaling bug (now properly bounded to 0-10 range)
- ✅ **Added**: Professional PDF/CSV export functionality
- ✅ **Enhanced**: Loading states for smooth UX
- ✅ **Improved**: Comprehensive user documentation

---

## 🤝 Stakeholder Roles

### District Magistrate (DM)
- Reviews composite risk score
- Makes final decisions on suggested actions
- Maintains accountability via audit log

### Superintendent of Police (SP)
- Reviews risk assessment
- Deploys ground resources based on decision support
- Provides feedback for system refinement

### System Administrator
- Manages data ingestion
- Monitors system health
- Ensures compliance with data protection policies

### IndiaAI / NIC
- Oversees governance framework
- Ensures DPDP compliance
- Provides infrastructure support

---

## 📚 Documentation

### User Guides
- **[Complete User Guide](file:///Users/radheshyambhati/.gemini/antigravity/brain/0aeb5580-2549-4009-ade4-50c0bc51411c/user_guide.md)** - How to use Risk Analysis, Suggested Actions, Officer Review, and Audit Log
- **[UX Improvements Walkthrough](file:///Users/radheshyambhati/.gemini/antigravity/brain/0aeb5580-2549-4009-ade4-50c0bc51411c/walkthrough.md)** - Recent enhancements and fixes
- **[Improvement Suggestions](file:///Users/radheshyambhati/.gemini/antigravity/brain/0aeb5580-2549-4009-ade4-50c0bc51411c/improvement_suggestions.md)** - Planned features and enhancements

### Technical Documentation
- **ARCHITECTURE.md** - System design and technical details
- **QUICKSTART.md** - Quick setup guide
- **API Documentation** - Available at `http://localhost:8000/docs` when backend is running

## 📞 Support & Contact

For questions about this prototype:
- **Technical Issues**: Check `/backend/main.py` for API logs
- **Data Issues**: Review `/backend/seed_db.py` for data structure
- **UI Issues**: Inspect browser console for frontend errors
- **Feature Questions**: See user guide for detailed workflows

---

## 📄 License

This is a **prototype for evaluation purposes**. Not for commercial use.

---

## 🙏 Acknowledgments

This system is designed in accordance with:

- **Digital Personal Data Protection Act, 2023** (India)
- **IndiaAI Mission** governance framework
- **MHA/MeitY** guidelines for law enforcement technology

**Demonstration Note**: All data in this prototype is synthetic and for demonstration purposes only. No real individuals, events, or locations (except district names) are referenced.

---

**Built for**: District Magistrates & Superintendents of Police, North-East India  
**Purpose**: Early warning & accountability for misinformation-driven escalation  
**Philosophy**: AI-assisted, human-led, privacy-first

---

## 🎬 Quick Demo

**Video Walkthrough**: See all features in action  
![Feature Demo](file:///Users/radheshyambhati/.gemini/antigravity/brain/0aeb5580-2549-4009-ade4-50c0bc51411c/user_guide_screenshots_1769792845240.webp)

---

*Last Updated: January 30, 2026*  
*Version: 2.0 - UX Enhanced Edition*
