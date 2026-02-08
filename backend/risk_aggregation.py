"""
NE-NETRA Risk Aggregation and Scoring Engine
Computes district-level risk scores from ingested signals

DPDP Act 2023 Compliant - Decision Support Only
"""

from datetime import datetime, timedelta
from typing import List, Dict, Tuple, Optional
from collections import defaultdict
import math
from incident_ingestion import ProcessedSignal, RiskLayer, Polarity, GeoSensitivity


class RiskThreshold:
    """Risk threshold definitions"""
    MONITORING = 30          # Yellow - Enhanced monitoring
    PREVENTIVE = 60         # Orange - Preventive readiness
    SENIOR_REVIEW = 75      # Red - Senior administrative review
    CRITICAL = 90           # Critical - Immediate action
    
    @staticmethod
    def get_label(score: float) -> str:
        """Get threshold label for score"""
        if score >= RiskThreshold.CRITICAL:
            return "CRITICAL"
        elif score >= RiskThreshold.SENIOR_REVIEW:
            return "SENIOR_REVIEW"
        elif score >= RiskThreshold.PREVENTIVE:
            return "PREVENTIVE_READINESS"
        elif score >= RiskThreshold.MONITORING:
            return "MONITORING"
        else:
            return "BASELINE"
    
    @staticmethod
    def get_range(label: str) -> str:
        """Get score range for threshold"""
        ranges = {
            "BASELINE": "0-29",
            "MONITORING": "30-59",
            "PREVENTIVE_READINESS": "60-74",
            "SENIOR_REVIEW": "75-89",
            "CRITICAL": "90-100"
        }
        return ranges.get(label, "Unknown")


class DistrictRiskScore:
    """Computed district risk score with explainability"""
    
    def __init__(
        self,
        district: str,
        state: str,
        composite_score: float,
        layer_scores: Dict[str, float],
        primary_trigger: str,
        secondary_triggers: List[str],
        trend: str,
        top_signals: List[Dict],
        threshold_info: Dict,
        time_window: str,
        signal_count: int,
        timestamp: datetime
    ):
        self.district = district
        self.state = state
        self.composite_score = composite_score
        self.layer_scores = layer_scores
        self.primary_trigger = primary_trigger
        self.secondary_triggers = secondary_triggers
        self.trend = trend
        self.top_signals = top_signals
        self.threshold_info = threshold_info
        self.time_window = time_window
        self.signal_count = signal_count
        self.timestamp = timestamp
    
    def to_dict(self) -> Dict:
        """Export as dictionary"""
        return {
            "district": self.district,
            "state": self.state,
            "score": round(self.composite_score, 2),
            "risk_level": self.get_risk_level(),
            "trend": self.trend,
            "primary_trigger": self.primary_trigger,
            "layer_scores": {k: round(v, 2) for k, v in self.layer_scores.items()},
            "top_contributing_signals": self.top_signals,
            "threshold": self.threshold_info,
            "time_window": self.time_window,
            "signal_count": self.signal_count,
            "timestamp": self.timestamp.isoformat(),
            "governance_disclaimer": "Derived from public open-source indicators. Decision support only."
        }
    
    def get_risk_level(self) -> str:
        """Get risk level category"""
        if self.composite_score >= 75:
            return "critical"
        elif self.composite_score >= 60:
            return "high"
        elif self.composite_score >= 30:
            return "medium"
        else:
            return "low"


class RiskAggregationEngine:
    """
    Aggregates ingested signals into district-level risk scores
    with temporal windows, weighting, and explainability
    """
    
    # Weighting factors
    RECENCY_DECAY = 0.5  # Exponential decay rate for recency weighting
    GEO_SENSITIVITY_MULTIPLIERS = {
        GeoSensitivity.BORDER: 1.5,
        GeoSensitivity.MARKET: 1.2,
        GeoSensitivity.HIGHWAY: 1.3,
        GeoSensitivity.CAPITAL: 1.4,
        GeoSensitivity.SENSITIVE_ZONE: 1.6
    }
    
    # Layer weights for composite score
    LAYER_WEIGHTS = {
        RiskLayer.COGNITIVE: 1.0,
        RiskLayer.NETWORK: 1.0,
        RiskLayer.PHYSICAL: 1.0
    }
    
    def __init__(self):
        """Initialize aggregation engine"""
        pass
    
    def filter_by_time_window(
        self, 
        signals: List[ProcessedSignal],
        window_hours: int = 24,
        reference_time: Optional[datetime] = None
    ) -> List[ProcessedSignal]:
        """Filter signals within time window"""
        if reference_time is None:
            reference_time = datetime.now()
        
        cutoff_time = reference_time - timedelta(hours=window_hours)
        
        return [
            signal for signal in signals
            if signal.timestamp >= cutoff_time
        ]
    
    def calculate_recency_weight(
        self,
        signal_time: datetime,
        reference_time: Optional[datetime] = None
    ) -> float:
        """
        Calculate recency weight using exponential decay
        More recent signals get higher weight
        """
        if reference_time is None:
            reference_time = datetime.now()
        
        hours_ago = (reference_time - signal_time).total_seconds() / 3600
        
        # Exponential decay: weight = e^(-decay_rate * hours)
        weight = math.exp(-self.RECENCY_DECAY * hours_ago / 24)  # Normalize by day
        
        return max(0.1, weight)  # Minimum weight 0.1
    
    def calculate_geo_weight(
        self,
        geo_tags: List[GeoSensitivity]
    ) -> float:
        """Calculate geo-sensitivity multiplier"""
        if not geo_tags:
            return 1.0
        
        # Use maximum multiplier if multiple tags
        multipliers = [
            self.GEO_SENSITIVITY_MULTIPLIERS.get(tag, 1.0)
            for tag in geo_tags
        ]
        
        return max(multipliers) if multipliers else 1.0
    
    def calculate_signal_weight(
        self,
        signal: ProcessedSignal,
        reference_time: Optional[datetime] = None
    ) -> float:
        """
        Calculate composite weight for signal based on:
        - Severity (1-5)
        - Recency (exponential decay)
        - Geo-sensitivity multiplier
        """
        # Base weight from severity (normalized to 0-1)
        severity_weight = signal.severity_score / 5.0
        
        # Recency weight
        recency_weight = self.calculate_recency_weight(signal.timestamp, reference_time)
        
        # Geo-sensitivity multiplier
        geo_multiplier = self.calculate_geo_weight(signal.geo_sensitivity)
        
        # Polarity adjustment (stabilizing signals reduce weight)
        polarity_factor = 1.0
        if signal.polarity == Polarity.STABILIZING:
            polarity_factor = -0.5  # Negative contribution
        elif signal.polarity == Polarity.NEUTRAL:
            polarity_factor = 0.3
        
        # Composite weight
        weight = severity_weight * recency_weight * geo_multiplier * polarity_factor
        
        return weight
    
    def aggregate_layer_scores(
        self,
        signals: List[ProcessedSignal],
        reference_time: Optional[datetime] = None
    ) -> Dict[str, float]:
        """
        Aggregate signals into 3-layer scores
        Returns scores for cognitive, network, physical layers
        """
        layer_contributions = {
            RiskLayer.COGNITIVE: 0.0,
            RiskLayer.NETWORK: 0.0,
            RiskLayer.PHYSICAL: 0.0
        }
        
        layer_counts = {
            RiskLayer.COGNITIVE: 0,
            RiskLayer.NETWORK: 0,
            RiskLayer.PHYSICAL: 0
        }
        
        for signal in signals:
            weight = self.calculate_signal_weight(signal, reference_time)
            
            for layer in signal.risk_layers:
                layer_contributions[layer] += weight
                layer_counts[layer] += 1
        
        # Normalize layer scores (0-10 scale per layer)
        layer_scores = {}
        for layer in RiskLayer:
            if layer_counts[layer] > 0:
                # Average weighted contribution, scaled to 0-10
                raw_score = layer_contributions[layer] / max(1, layer_counts[layer]) * 10
                layer_scores[layer.value] = min(10.0, raw_score)
            else:
                layer_scores[layer.value] = 0.0
        
        return layer_scores
    
    def compute_composite_score(
        self,
        layer_scores: Dict[str, float]
    ) -> float:
        """
        Compute composite risk score (0-100) using weighted sum + sigmoid
        """
        # Weighted sum of layers
        weighted_sum = sum(
            layer_scores.get(layer.value, 0) * self.LAYER_WEIGHTS[layer]
            for layer in RiskLayer
        )
        
        # Normalize to 30 (3 layers * 10 max each)
        max_possible = sum(self.LAYER_WEIGHTS.values()) * 10
        normalized = (weighted_sum / max_possible) * 100
        
        # Apply sigmoid for smooth scaling
        # sigmoid(x) = 1 / (1 + e^(-k(x-midpoint)))
        # Adjust to 0-100 range
        k = 0.1  # Steepness
        midpoint = 50  # Inflection point
        
        sigmoid_score = 100 / (1 + math.exp(-k * (normalized - midpoint)))
        
        return min(100.0, max(0.0, sigmoid_score))
    
    def identify_primary_trigger(
        self,
        layer_scores: Dict[str, float]
    ) -> Tuple[str, List[str]]:
        """
        Identify primary and secondary trigger layers
        Returns (primary_layer, [secondary_layers])
        """
        sorted_layers = sorted(
            layer_scores.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        primary = sorted_layers[0][0] if sorted_layers else "unknown"
        
        # Secondary triggers have score >= 50% of primary
        primary_score = sorted_layers[0][1] if sorted_layers else 0
        threshold = primary_score * 0.5
        
        secondary = [
            layer for layer, score in sorted_layers[1:]
            if score >= threshold
        ]
        
        return primary, secondary
    
    def detect_trend(
        self,
        signals: List[ProcessedSignal],
        reference_time: Optional[datetime] = None
    ) -> str:
        """
        Detect trend direction by comparing recent vs older signals
        Returns: 'rising', 'stable', or 'falling'
        """
        if not signals:
            return "stable"
        
        if reference_time is None:
            reference_time = datetime.now()
        
        # Split into recent (last 24h) and older (24-72h)
        cutoff_recent = reference_time - timedelta(hours=24)
        cutoff_older = reference_time - timedelta(hours=72)
        
        recent_signals = [s for s in signals if s.timestamp >= cutoff_recent]
        older_signals = [s for s in signals if cutoff_older <= s.timestamp < cutoff_recent]
        
        if not recent_signals:
            return "stable"
        
        # Calculate average severity for each period
        recent_severity = sum(s.severity_score for s in recent_signals) / len(recent_signals)
        older_severity = sum(s.severity_score for s in older_signals) / len(older_signals) if older_signals else recent_severity
        
        # Compare
        diff = recent_severity - older_severity
        
        if diff > 0.5:
            return "rising"
        elif diff < -0.5:
            return "falling"
        else:
            return "stable"
    
    def select_top_signals(
        self,
        signals: List[ProcessedSignal],
        count: int = 3
    ) -> List[Dict]:
        """
        Select top contributing signals for explanability
        Returns sanitized signal summaries (no PII, no handles)
        """
        # Sort by composite weight
        weighted_signals = [
            (signal, self.calculate_signal_weight(signal))
            for signal in signals
        ]
        
        weighted_signals.sort(key=lambda x: x[1], reverse=True)
        
        top_signals = []
        for signal, weight in weighted_signals[:count]:
            top_signals.append({
                "event_summary": signal.event_summary,
                "severity": signal.severity_score,
                "timestamp": signal.timestamp.isoformat(),
                "source_type": signal.source_type,
                "layers": [layer.value for layer in signal.risk_layers],
                "location": signal.location or signal.district
            })
        
        return top_signals
    
    def compute_district_risk(
        self,
        district: str,
        state: str,
        signals: List[ProcessedSignal],
        window_hours: int = 24,
        reference_time: Optional[datetime] = None
    ) -> DistrictRiskScore:
        """
        Compute district-level risk score from signals
        
        Main aggregation pipeline:
        1. Filter by time window
        2. Aggregate layer scores with weighting
        3. Compute composite score
        4. Identify triggers
        5. Detect trend
        6. Generate explainability
        """
        if reference_time is None:
            reference_time = datetime.now()
        
        # Filter signals by time window
        windowed_signals = self.filter_by_time_window(signals, window_hours, reference_time)
        
        if not windowed_signals:
            # No signals in window - baseline score
            return DistrictRiskScore(
                district=district,
                state=state,
                composite_score=0.0,
                layer_scores={"cognitive": 0.0, "network": 0.0, "physical": 0.0},
                primary_trigger="none",
                secondary_triggers=[],
                trend="stable",
                top_signals=[],
                threshold_info={
                    "label": "BASELINE",
                    "range": "0-29",
                    "crossed": False
                },
                time_window=f"{window_hours}h",
                signal_count=0,
                timestamp=reference_time
            )
        
        # Aggregate layer scores
        layer_scores = self.aggregate_layer_scores(windowed_signals, reference_time)
        
        # Compute composite score
        composite_score = self.compute_composite_score(layer_scores)
        
        # Identify triggers
        primary_trigger, secondary_triggers = self.identify_primary_trigger(layer_scores)
        
        # Detect trend
        trend = self.detect_trend(signals, reference_time)  # Use all signals for trend
        
        # Select top contributing signals
        top_signals = self.select_top_signals(windowed_signals)
        
        # Threshold info
        threshold_label = RiskThreshold.get_label(composite_score)
        threshold_info = {
            "label": threshold_label,
            "range": RiskThreshold.get_range(threshold_label),
            "crossed": composite_score >= RiskThreshold.MONITORING
        }
        
        return DistrictRiskScore(
            district=district,
            state=state,
            composite_score=composite_score,
            layer_scores=layer_scores,
            primary_trigger=primary_trigger,
            secondary_triggers=secondary_triggers,
            trend=trend,
            top_signals=top_signals,
            threshold_info=threshold_info,
            time_window=f"{window_hours}h",
            signal_count=len(windowed_signals),
            timestamp=reference_time
        )
    
    def batch_compute_districts(
        self,
        district_signals: Dict[str, List[ProcessedSignal]],
        window_hours: int = 24
    ) -> Dict[str, DistrictRiskScore]:
        """
        Compute risk scores for multiple districts
        
        Args:
            district_signals: Dict mapping district names to their signals
            window_hours: Time window for aggregation
        
        Returns:
            Dict mapping district names to their risk scores
        """
        results = {}
        
        for district, signals in district_signals.items():
            if not signals:
                continue
            
            # Get state from first signal
            state = signals[0].state if signals else "Unknown"
            
            risk_score = self.compute_district_risk(
                district=district,
                state=state,
                signals=signals,
                window_hours=window_hours
            )
            
            results[district] = risk_score
        
        return results


# Example usage and testing
if __name__ == "__main__":
    from datetime import datetime
    from incident_ingestion import IncidentIngestionModule
    
    # Create sample signals
    ingestion = IncidentIngestionModule()
    
    signals = []
    
    # Add some test signals for Imphal West
    test_incidents = [
        {
            "state": "Manipur",
            "district": "Imphal West",
            "event_summary": "Mass protest rally with thousands participating",
            "timestamp": datetime.now() - timedelta(hours=2)
        },
        {
            "state": "Manipur",
            "district": "Imphal West",
            "event_summary": "Arms cache recovered near border area",
            "timestamp": datetime.now() - timedelta(hours=6)
        },
        {
            "state": "Manipur",
            "district": "Imphal West",
            "event_summary": "Peace dialogue meeting held tension de-escalates",
            "timestamp": datetime.now() - timedelta(hours=12)
        }
    ]
    
    for incident in test_incidents:
        signal = ingestion.process_incident(**incident)
        signals.append(signal)
    
    # Compute risk score
    engine = RiskAggregationEngine()
    risk_score = engine.compute_district_risk(
        district="Imphal West",
        state="Manipur",
        signals=signals,
        window_hours=24
    )
    
    print("\n=== District Risk Score ===")
    print(f"District: {risk_score.district}, {risk_score.state}")
    print(f"Composite Score: {risk_score.composite_score:.2f}/100")
    print(f"Risk Level: {risk_score.get_risk_level().upper()}")
    print(f"Trend: {risk_score.trend}")
    print(f"Primary Trigger: {risk_score.primary_trigger}")
    print(f"Layer Scores:")
    for layer, score in risk_score.layer_scores.items():
        print(f"  {layer}: {score:.2f}/10")
    print(f"Threshold: {risk_score.threshold_info['label']} ({risk_score.threshold_info['range']})")
    print(f"Signals in Window: {risk_score.signal_count}")
    print(f"\nTop Contributing Signals:")
    for i, sig in enumerate(risk_score.top_signals, 1):
        print(f"  {i}. {sig['event_summary'][:60]}... (Severity: {sig['severity']})")
    print(f"\nGovernance: {risk_score.to_dict()['governance_disclaimer']}")
