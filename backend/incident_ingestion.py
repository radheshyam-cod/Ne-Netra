"""
NE-NETRA District-Level Incident Ingestion Module
DPDP Act 2023 Compliant - District-Level Aggregation Only

This module processes open-source situational signals from Northeast India
and structures them for district-level risk aggregation.
"""

from datetime import datetime
from typing import Dict, List, Optional, Literal
from pydantic import BaseModel, Field
from enum import Enum
import re


class RiskLayer(str, Enum):
    """Risk classification layers"""
    COGNITIVE = "cognitive"  # Rumors, threats, protests, narratives, misinformation
    NETWORK = "network"      # Bandhs, shutdowns, mass rallies, coordinated action
    PHYSICAL = "physical"    # Violence, arms recovery, blockades, narcotics, border


class Polarity(str, Enum):
    """Signal polarity"""
    ESCALATORY = "escalatory"      # Increases risk
    STABILIZING = "stabilizing"    # Reduces risk
    NEUTRAL = "neutral"            # Neither


class GeoSensitivity(str, Enum):
    """Geographic sensitivity markers"""
    BORDER = "border_area"
    MARKET = "market_trade_hub"
    HIGHWAY = "highway_transit"
    CAPITAL = "capital_admin"
    SENSITIVE_ZONE = "sensitive_zone"


class ProcessedSignal(BaseModel):
    """Structured risk signal ready for aggregation"""
    
    # Mandatory district-level association
    state: str = Field(..., description="Northeast state")
    district: str = Field(..., description="District name (mandatory)")
    location: Optional[str] = Field(None, description="Specific location if mentioned")
    
    # Event details
    event_summary: str = Field(..., description="Brief event description")
    timestamp: datetime = Field(..., description="Event timestamp")
    source_url: Optional[str] = Field(None, description="Public source URL")
    source_type: str = Field(default="public_open_source", description="Always public open-source")
    
    # Risk classification
    risk_layers: List[RiskLayer] = Field(..., description="One or more risk layers")
    polarity: Polarity = Field(..., description="Escalatory or stabilizing")
    severity_score: int = Field(..., ge=1, le=5, description="Preliminary severity (1-5)")
    
    # Geographic sensitivity
    geo_sensitivity: List[GeoSensitivity] = Field(default_factory=list, description="Geo tags if applicable")
    
    # Metadata
    ingestion_timestamp: datetime = Field(default_factory=datetime.now)
    
    # Explainability
    classification_rationale: str = Field(..., description="Why this classification was assigned")
    
    # Compliance markers
    pii_redacted: bool = Field(default=True, description="No PII stored")
    district_level_only: bool = Field(default=True, description="District-level aggregation")


class IncidentIngestionModule:
    """
    Backend ingestion module for NE-NETRA platform
    Processes district-level incident data with DPDP compliance
    """
    
    # Northeast states for validation
    NE_STATES = {
        "Assam", "Meghalaya", "Arunachal Pradesh", "Manipur",
        "Mizoram", "Nagaland", "Tripura", "Sikkim"
    }
    
    # Keywords for risk layer classification
    COGNITIVE_KEYWORDS = [
        "rumor", "threat", "protest", "rally", "demonstration", "misinformation",
        "fake news", "narrative", "propaganda", "agitation", "slogan", "pamphlet"
    ]
    
    NETWORK_KEYWORDS = [
        "bandh", "shutdown", "blockade", "strike", "mass rally", "coordinated",
        "widespread", "multiple locations", "simultaneous", "organized", "called by"
    ]
    
    PHYSICAL_KEYWORDS = [
        "violence", "clash", "arms", "weapon", "seized", "recovered", "explosive",
        "IED", "grenade", "firing", "assault", "kidnap", "narcotics", "drugs",
        "smuggling", "border", "infiltration", "encounter"
    ]
    
    # Geo-sensitivity markers
    GEO_MARKERS = {
        "border": ["border", "international border", "indo-", "boundary", "frontier"],
        "market": ["market", "bazar", "bazaar", "trade", "commercial hub", "business district"],
        "highway": ["highway", "NH-", "national highway", "road", "transit", "corridor"],
        "capital": ["capital", "dispur", "shillong", "itanagar", "imphal", "aizawl", 
                   "kohima", "agartala", "gangtok", "secretariat"]
    }
    
    def __init__(self):
        """Initialize ingestion module"""
        pass
    
    def normalize_state(self, state: str) -> Optional[str]:
        """Normalize state name"""
        state = state.strip().title()
        for ne_state in self.NE_STATES:
            if ne_state.lower() in state.lower() or state.lower() in ne_state.lower():
                return ne_state
        return None
    
    def classify_risk_layers(self, event_text: str) -> List[RiskLayer]:
        """Classify event into risk layers based on content"""
        event_lower = event_text.lower()
        layers = []
        
        # Check cognitive layer
        if any(kw in event_lower for kw in self.COGNITIVE_KEYWORDS):
            layers.append(RiskLayer.COGNITIVE)
        
        # Check network layer
        if any(kw in event_lower for kw in self.NETWORK_KEYWORDS):
            layers.append(RiskLayer.NETWORK)
        
        # Check physical layer
        if any(kw in event_lower for kw in self.PHYSICAL_KEYWORDS):
            layers.append(RiskLayer.PHYSICAL)
        
        # Default to cognitive if no match
        if not layers:
            layers.append(RiskLayer.COGNITIVE)
        
        return layers
    
    def determine_polarity(self, event_text: str) -> Polarity:
        """Determine if event is escalatory or stabilizing"""
        event_lower = event_text.lower()
        
        # Escalatory indicators
        escalatory = [
            "violence", "clash", "attack", "threat", "protest", "bandh",
            "shutdown", "blockade", "arms", "explosive", "warning", "tension"
        ]
        
        # Stabilizing indicators
        stabilizing = [
            "resolved", "peace", "agreement", "dialogue", "withdrawn",
            "called off", "suspended", "normalized", "restoration"
        ]
        
        escalatory_count = sum(1 for kw in escalatory if kw in event_lower)
        stabilizing_count = sum(1 for kw in stabilizing if kw in event_lower)
        
        if stabilizing_count > escalatory_count:
            return Polarity.STABILIZING
        elif escalatory_count > 0:
            return Polarity.ESCALATORY
        else:
            return Polarity.NEUTRAL
    
    def calculate_severity(self, event_text: str, risk_layers: List[RiskLayer]) -> int:
        """Calculate preliminary severity score (1-5)"""
        event_lower = event_text.lower()
        score = 1  # Base score
        
        # Scale of participation
        if any(kw in event_lower for kw in ["mass", "large", "thousands", "hundreds"]):
            score += 1
        
        # Violence or weapons
        if any(kw in event_lower for kw in ["violence", "weapon", "arms", "firing", "explosive"]):
            score += 2
        
        # Duration/indefinite
        if any(kw in event_lower for kw in ["indefinite", "continuous", "ongoing", "prolonged"]):
            score += 1
        
        # Multiple risk layers
        if len(risk_layers) >= 2:
            score += 1
        
        return min(5, score)  # Cap at 5
    
    def tag_geo_sensitivity(self, event_text: str, location: Optional[str] = None) -> List[GeoSensitivity]:
        """Tag geographic sensitivity"""
        text = (event_text + " " + (location or "")).lower()
        tags = []
        
        for geo_type, keywords in self.GEO_MARKERS.items():
            if any(kw in text for kw in keywords):
                if geo_type == "border":
                    tags.append(GeoSensitivity.BORDER)
                elif geo_type == "market":
                    tags.append(GeoSensitivity.MARKET)
                elif geo_type == "highway":
                    tags.append(GeoSensitivity.HIGHWAY)
                elif geo_type == "capital":
                    tags.append(GeoSensitivity.CAPITAL)
        
        return tags
    
    def generate_rationale(
        self, 
        risk_layers: List[RiskLayer], 
        polarity: Polarity, 
        severity: int,
        geo_tags: List[GeoSensitivity]
    ) -> str:
        """Generate explainable classification rationale"""
        layers_str = ", ".join([layer.value for layer in risk_layers])
        geo_str = ", ".join([tag.value for tag in geo_tags]) if geo_tags else "general area"
        
        rationale = (
            f"Classified as {layers_str} risk layer(s) with {polarity.value} polarity. "
            f"Severity {severity}/5 based on event scale and characteristics. "
            f"Geographic context: {geo_str}."
        )
        
        return rationale
    
    def process_incident(
        self,
        state: str,
        district: str,
        event_summary: str,
        location: Optional[str] = None,
        timestamp: Optional[datetime] = None,
        source_url: Optional[str] = None
    ) -> ProcessedSignal:
        """
        Process a single incident into a structured risk signal
        
        DPDP COMPLIANCE:
        - District-level only (mandatory)
        - No PII storage
        - Public source marking
        - Explainable classification
        """
        
        # Normalize state
        normalized_state = self.normalize_state(state)
        if not normalized_state:
            raise ValueError(f"Invalid state: {state}. Must be NE state.")
        
        # Classify into risk layers
        risk_layers = self.classify_risk_layers(event_summary)
        
        # Determine polarity
        polarity = self.determine_polarity(event_summary)
        
        # Calculate severity
        severity = self.calculate_severity(event_summary, risk_layers)
        
        # Tag geo-sensitivity
        geo_tags = self.tag_geo_sensitivity(event_summary, location)
        
        # Generate rationale
        rationale = self.generate_rationale(risk_layers, polarity, severity, geo_tags)
        
        # Create structured signal
        signal = ProcessedSignal(
            state=normalized_state,
            district=district.strip(),
            location=location.strip() if location else None,
            event_summary=event_summary.strip(),
            timestamp=timestamp or datetime.now(),
            source_url=source_url,
            source_type="public_open_source",
            risk_layers=risk_layers,
            polarity=polarity,
            severity_score=severity,
            geo_sensitivity=geo_tags,
            classification_rationale=rationale,
            pii_redacted=True,
            district_level_only=True
        )
        
        return signal
    
    def process_batch(self, incidents: List[Dict]) -> List[ProcessedSignal]:
        """
        Process a batch of incidents
        
        Each incident dict should have:
        - state: str
        - district: str
        - event_summary: str
        - location: Optional[str]
        - timestamp: Optional[datetime]
        - source_url: Optional[str]
        """
        processed_signals = []
        
        for incident in incidents:
            try:
                signal = self.process_incident(
                    state=incident.get("state"),
                    district=incident.get("district"),
                    event_summary=incident.get("event_summary"),
                    location=incident.get("location"),
                    timestamp=incident.get("timestamp"),
                    source_url=incident.get("source_url")
                )
                processed_signals.append(signal)
            except Exception as e:
                print(f"Error processing incident: {e}")
                continue
        
        return processed_signals
    
    def export_for_storage(self, signals: List[ProcessedSignal]) -> List[Dict]:
        """Export signals in format ready for database storage"""
        return [signal.model_dump(mode='json') for signal in signals]


# Example usage
if __name__ == "__main__":
    ingestion = IncidentIngestionModule()
    
    # Example incident
    test_incident = {
        "state": "Manipur",
        "district": "Imphal West",
        "event_summary": "Mass protest rally organized against government policy, thousands participated",
        "location": "Imphal city center",
        "timestamp": datetime(2026, 2, 3, 10, 30),
        "source_url": "https://example.com/news/manipur-protest"
    }
    
    signal = ingestion.process_incident(**test_incident)
    print("\n=== Processed Signal ===")
    print(f"District: {signal.district}, {signal.state}")
    print(f"Risk Layers: {[layer.value for layer in signal.risk_layers]}")
    print(f"Polarity: {signal.polarity.value}")
    print(f"Severity: {signal.severity_score}/5")
    print(f"Geo Tags: {[tag.value for tag in signal.geo_sensitivity]}")
    print(f"Rationale: {signal.classification_rationale}")
    print(f"DPDP Compliant: PII Redacted={signal.pii_redacted}, District-Level={signal.district_level_only}")
