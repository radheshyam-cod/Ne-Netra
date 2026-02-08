"""
Causal "What If" Simulator

Uses causal inference to predict impact of interventions
"""

from typing import Dict, List
import numpy as np
from dowhy import CausalModel
import pandas as pd

class CausalSimulator:
    """Causal inference for intervention impact prediction"""
    
    def __init__(self, db_connection):
        self.db = db_connection
        self.causal_graph = self._build_causal_graph()
    
    def _build_causal_graph(self) -> str:
        """Define causal relationships"""
        # DAG: Actions → Layers → Risk Score
        graph = """
        digraph {
            officers_deployed -> physical_layer;
            surveillance_level -> cognitive_layer;
            checkpoints -> physical_layer;
            
            physical_layer -> risk_score;
            cognitive_layer -> risk_score;
            cyber_layer -> risk_score;
            
            festival_season -> cognitive_layer;
            recent_incidents -> all_layers;
        }
        """
        return graph
    
    def simulate_intervention(
        self,
        district: str,
        intervention: Dict[str, float]
    ) -> Dict:
        """
        Simulate impact of intervention
        
        Args:
            district: District name
            intervention: Dict like {'officers_deployed': 20, 'checkpoints': 5}
        
        Returns:
            Predicted outcomes with confidence intervals
        """
        # Get historical data
        data = self._get_historical_data(district)
        
        if len(data) < 30:
            return self._fallback_prediction(intervention)
        
        # Create DataFrame
        df = pd.DataFrame(data)
        
        # Define treatment and outcome
        treatment = list(intervention.keys())[0]  # Primary intervention
        outcome = 'risk_score'
        
        try:
            # Create causal model
            model = CausalModel(
                data=df,
                treatment=treatment,
                outcome=outcome,
                graph=self.causal_graph
            )
            
            # Identify causal effect
            identified_estimand = model.identify_effect()
            
            # Estimate effect
            estimate = model.estimate_effect(
                identified_estimand,
                method_name="backdoor.linear_regression"
            )
            
            # Calculate predicted risk after intervention
            current_risk = df[outcome].iloc[-1]
            intervention_value = intervention[treatment]
            
            # Effect size
            effect_size = estimate.value * intervention_value
            predicted_risk = max(0, current_risk + effect_size)
            
            # Confidence interval (simplified)
            std_error = np.std(df[outcome]) / np.sqrt(len(df))
            confidence_interval = (
                max(0, predicted_risk - 1.96 * std_error),
                min(100, predicted_risk + 1.96 * std_error)
            )
            
            # Side effects on adjacent districts
            side_effects = self._predict_side_effects(district, intervention_value)
            
            return {
                'current_risk': float(current_risk),
                'predicted_risk': round(predicted_risk, 1),
                'confidence_interval': [round(confidence_interval[0], 1), round(confidence_interval[1], 1)],
                'risk_reduction': round(current_risk - predicted_risk, 1),
                'effect_probability': round(abs(estimate.value) * 100, 1),
                'cost_estimate': self._estimate_cost(intervention),
                'side_effects': side_effects,
                'recommendation': self._generate_recommendation(predicted_risk, current_risk)
            }
            
        except Exception as e:
            print(f"Causal inference failed: {e}")
            return self._fallback_prediction(intervention)
    
    def _get_historical_data(self, district: str) -> List[Dict]:
        """Get historical data for causal analysis"""
        results = self.db.query("""
            SELECT 
                date,
                score as risk_score,
                (SELECT COUNT(*) FROM actions WHERE district = %s AND action_type = 'deploy_officers' 
                 AND created_at::date = rs.date) as officers_deployed,
                (SELECT COUNT(*) FROM actions WHERE district = %s AND action_type = 'setup_checkpoints' 
                 AND created_at::date = rs.date) as checkpoints,
                (SELECT AVG(severity_score) FROM signals WHERE district = %s 
                 AND DATE(timestamp) = rs.date) as avg_severity
            FROM risk_scores rs
            WHERE district = %s
            ORDER BY date DESC
            LIMIT 90
        """, (district, district, district, district))
        
        return results
    
    def _fallback_prediction(self, intervention: Dict) -> Dict:
        """Simple rule-based prediction when causal inference fails"""
        # Estimate based on historical averages
        intervention_value = list(intervention.values())[0]
        estimated_reduction = intervention_value * 0.5  # 0.5 points per unit
        
        return {
            'current_risk': 65.0,
            'predicted_risk': max(0, 65 - estimated_reduction),
            'confidence_interval': [55.0, 75.0],
            'risk_reduction': estimated_reduction,
            'effect_probability': 70.0,
            'cost_estimate': self._estimate_cost(intervention),
            'side_effects': [],
            'recommendation': 'Causal model needs more data. Using simplified estimate.'
        }
    
    def _predict_side_effects(self, district: str, intervention_strength: float) -> List[Dict]:
        """Predict spillover effects on adjacent districts"""
        # Get adjacent districts
        adjacent = self._get_adjacent_districts(district)
        
        effects = []
        for adj_district in adjacent:
            # Spillover effect (usually smaller, sometimes negative)
            spillover = intervention_strength * 0.15 * np.random.choice([-1, 1])
            
            effects.append({
                'district': adj_district,
                'predicted_change': round(spillover, 1),
                'type': 'decrease' if spillover < 0 else 'increase'
            })
        
        return effects
    
    def _get_adjacent_districts(self, district: str) -> List[str]:
        """Get geographically adjacent districts"""
        adjacency = {
            'Imphal West': ['Imphal East', 'Bishnupur'],
            'Imphal East': ['Imphal West', 'Thoubal'],
            'Churachandpur': ['Bishnupur', 'Kakching'],
            # ... more mappings
        }
        return adjacency.get(district, [])
    
    def _estimate_cost(self, intervention: Dict) -> Dict:
        """Estimate financial cost of intervention"""
        cost_per_unit = {
            'officers_deployed': 50000,  # ₹50k per officer per month
            'checkpoints': 200000,  # ₹2L per checkpoint
            'surveillance_level': 100000  # ₹1L per unit
        }
        
        total_cost = sum(
            cost_per_unit.get(key, 10000) * value 
            for key, value in intervention.items()
        )
        
        return {
            'total': total_cost,
            'currency': 'INR',
            'period': 'monthly'
        }
    
    def _generate_recommendation(self, predicted_risk: float, current_risk: float) -> str:
        """Generate action recommendation"""
        reduction = current_risk - predicted_risk
        
        if reduction > 15:
            return "Highly recommended. Significant risk reduction expected."
        elif reduction > 8:
            return "Recommended. Moderate risk reduction expected."
        elif reduction > 3:
            return "Consider implementing. Minor risk reduction expected."
        else:
            return "Not recommended. Minimal impact predicted."
