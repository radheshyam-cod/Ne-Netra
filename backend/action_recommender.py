"""
Action Recommender - ML-Based Suggestions

Recommends optimal actions based on historical success rates
"""

from typing import List, Dict
import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.preprocessing import LabelEncoder
import json

class ActionRecommender:
    """ML-based action recommendation system"""
    
    def __init__(self, db_connection):
        self.db = db_connection
        self.model = DecisionTreeClassifier(max_depth=5, random_state=42)
        self.label_encoder = LabelEncoder()
        self.is_trained = False
    
    def train_model(self):
        """Train model on historical action success rates"""
        # Get historical actions with outcomes
        historical_data = self.db.query("""
            SELECT 
                a.district,
                a.action_type,
                a.resource_count,
                rs_before.score as risk_before,
                rs_after.score as risk_after,
                CASE 
                    WHEN rs_after.score < rs_before.score THEN 1
                    ELSE 0
                END as was_successful
            FROM actions a
            JOIN risk_scores rs_before ON rs_before.district = a.district 
                AND rs_before.date = a.created_at::date
            JOIN risk_scores rs_after ON rs_after.district = a.district 
                AND rs_after.date = a.created_at::date + INTERVAL '7 days'
            WHERE a.status = 'completed'
        """)
        
        if len(historical_data) < 10:
            print("Insufficient training data")
            return False
        
        # Prepare features
        X = []
        y = []
        
        for row in historical_data:
            features = [
                self._encode_district(row['district']),
                self._encode_action_type(row['action_type']),
                row['resource_count'],
                row['risk_before']
            ]
            X.append(features)
            y.append(row['was_successful'])
        
        # Train
        self.model.fit(X, y)
        self.is_trained = True
        
        print(f"Model trained on {len(X)} examples")
        return True
    
    def recommend_actions(self, district: str, current_risk: float) -> List[Dict]:
        """Recommend top 3 actions for a district"""
        if not self.is_trained:
            self.train_model()
        
        # Possible action types
        action_types = [
            'deploy_patrol', 'increase_surveillance', 'community_engagement',
            'deploy_officers', 'setup_checkpoints', 'intel_gathering'
        ]
        
        recommendations = []
        
        for action_type in action_types:
            # Predict success for different resource levels
            best_resources = None
            best_prob = 0
            
            for resources in [5, 10, 15, 20, 25]:
                features = [[
                    self._encode_district(district),
                    self._encode_action_type(action_type),
                    resources,
                    current_risk
                ]]
                
                # Predict probability of success
                proba = self.model.predict_proba(features)[0][1]
                
                if proba > best_prob:
                    best_prob = proba
                    best_resources = resources
            
            # Calculate estimated impact
            estimated_impact = self._estimate_impact(action_type, best_resources, current_risk)
            
            # Calculate priority score
            priority = best_prob * estimated_impact
            
            recommendations.append({
                'action_type': action_type,
                'recommended_resources': best_resources,
                'success_probability': round(best_prob * 100, 1),
                'estimated_impact': round(estimated_impact, 1),
                'priority_score': round(priority, 2),
                'description': self._get_action_description(action_type, best_resources)
            })
        
        # Sort by priority and return top 3
        recommendations.sort(key=lambda x: x['priority_score'], reverse=True)
        return recommendations[:3]
    
    def _encode_district(self, district: str) -> int:
        """Encode district to integer"""
        districts = [
            'Imphal West', 'Imphal East', 'Churachandpur',
            'Thoubal', 'Bishnupur', 'Kakching'
        ]
        return districts.index(district) if district in districts else 0
    
    def _encode_action_type(self, action_type: str) -> int:
        """Encode action type to integer"""
        types = [
            'deploy_patrol', 'increase_surveillance', 'community_engagement',
            'deploy_officers', 'setup_checkpoints', 'intel_gathering'
        ]
        return types.index(action_type) if action_type in types else 0
    
    def _estimate_impact(self, action_type: str, resources: int, current_risk: float) -> float:
        """Estimate risk reduction impact"""
        # Base impact by action type
        base_impact = {
            'deploy_patrol': 0.15,
            'increase_surveillance': 0.10,
            'community_engagement': 0.12,
            'deploy_officers': 0.18,
            'setup_checkpoints': 0.14,
            'intel_gathering': 0.08
        }
        
        # Scale by resources and current risk
        impact = base_impact.get(action_type, 0.10) * (resources / 10) * (current_risk / 100)
        
        return min(impact * current_risk, current_risk * 0.3)  # Max 30% reduction
    
    def _get_action_description(self, action_type: str, resources: int) -> str:
        """Get human-readable description"""
        descriptions = {
            'deploy_patrol': f'Deploy {resources} officers for mobile patrol',
            'increase_surveillance': f'Increase surveillance with {resources} units',
            'community_engagement': f'Conduct {resources} community meetings',
            'deploy_officers': f'Deploy {resources} additional officers',
            'setup_checkpoints': f'Setup {resources} security checkpoints',
            'intel_gathering': f'Assign {resources} agents for intelligence gathering'
        }
        return descriptions.get(action_type, f'{action_type} with {resources} resources')
