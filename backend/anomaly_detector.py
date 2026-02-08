"""
Anomaly Detection with Explainability

Detects unusual patterns using IsolationForest + SHAP explanations
"""

from typing import List, Dict
import numpy as np
from sklearn.ensemble import IsolationForest
import shap
import pandas as pd

class AnomalyDetector:
    """Detect anomalies with explainable AI"""
    
    def __init__(self, db_connection):
        self.db = db_connection
        self.model = IsolationForest(contamination=0.1, random_state=42)
        self.explainer = None
        self.is_trained = False
    
    def train(self):
        """Train anomaly detection model"""
        # Get historical risk patterns
        data = self.db.query("""
            SELECT 
                district,
                score as risk_score,
                EXTRACT(DOW FROM date) as day_of_week,
                EXTRACT(HOUR FROM NOW()) as hour_of_day,
                (SELECT COUNT(*) FROM signals s WHERE s.district = rs.district 
                 AND DATE(s.timestamp) = rs.date) as signal_count,
                (SELECT AVG(severity_score) FROM signals s WHERE s.district = rs.district 
                 AND DATE(s.timestamp) = rs.date) as avg_severity
            FROM risk_scores rs
            WHERE date >= CURRENT_DATE - INTERVAL '90 days'
        """)
        
        if len(data) < 50:
            print("Insufficient data for anomaly detection")
            return False
        
        # Prepare features
        df = pd.DataFrame(data)
        X = df[['risk_score', 'day_of_week', 'hour_of_day', 'signal_count', 'avg_severity']].fillna(0)
        
        # Train
        self.model.fit(X)
        
        # Create SHAP explainer
        self.explainer = shap.Explainer(self.model.predict, X)
        
        self.is_trained = True
        print(f"Anomaly detector trained on {len(X)} samples")
        return True
    
    def detect_anomalies(self, district: str) -> List[Dict]:
        """Detect current anomalies for a district"""
        if not self.is_trained:
            self.train()
        
        # Get recent data
        recent_data = self.db.query("""
            SELECT 
                date,
                score as risk_score,
                EXTRACT(DOW FROM date) as day_of_week,
                EXTRACT(HOUR FROM NOW()) as hour_of_day,
                (SELECT COUNT(*) FROM signals s WHERE s.district = %s 
                 AND DATE(s.timestamp) = rs.date) as signal_count,
                (SELECT AVG(severity_score) FROM signals s WHERE s.district = %s 
                 AND DATE(s.timestamp) = rs.date) as avg_severity
            FROM risk_scores rs
            WHERE district = %s AND date >= CURRENT_DATE - INTERVAL '7 days'
            ORDER BY date DESC
        """, (district, district, district))
        
        if not recent_data:
            return []
        
        anomalies = []
        
        for row in recent_data:
            # Prepare features
            X = pd.DataFrame([{
                'risk_score': row['risk_score'],
                'day_of_week': row['day_of_week'],
                'hour_of_day': row['hour_of_day'],
                'signal_count': row['signal_count'] or 0,
                'avg_severity': row['avg_severity'] or 0
            }])
            
            # Predict
            prediction = self.model.predict(X)[0]
            anomaly_score = self.model.score_samples(X)[0]
            
            if prediction == -1:  # Anomaly detected
                # Get explanation
                explanation = self._explain_anomaly(X)
                
                anomalies.append({
                    'date': row['date'].isoformat(),
                    'district': district,
                    'anomaly_score': round(float(anomaly_score), 3),
                    'risk_score': row['risk_score'],
                    'signal_count': row['signal_count'],
                    'explanation': explanation,
                    'is_false_positive': self._check_false_positive(row),
                    'root_cause': self._identify_root_cause(explanation)
                })
        
        return anomalies
    
    def _explain_anomaly(self, X: pd.DataFrame) -> Dict:
        """Generate SHAP explanation for anomaly"""
        if not self.explainer:
            return {'error': 'Explainer not initialized'}
        
        try:
            # Calculate SHAP values
            shap_values = self.explainer(X)
            
            # Get feature contributions
            feature_names = X.columns.tolist()
            contributions = {}
            
            for i, feature in enumerate(feature_names):
                contributions[feature] = {
                    'value': float(X[feature].iloc[0]),
                    'impact': float(shap_values.values[0][i]),
                    'importance': abs(float(shap_values.values[0][i]))
                }
            
            # Sort by importance
            sorted_features = sorted(
                contributions.items(),
                key=lambda x: x[1]['importance'],
                reverse=True
            )
            
            return {
                'top_factors': [
                    {
                        'feature': name,
                        'value': data['value'],
                        'impact': round(data['impact'], 3)
                    }
                    for name, data in sorted_features[:3]
                ],
                'summary': self._generate_explanation_text(sorted_features)
            }
            
        except Exception as e:
            print(f"SHAP explanation failed: {e}")
            return {'error': str(e)}
    
    def _generate_explanation_text(self, sorted_features: List) -> str:
        """Generate human-readable explanation"""
        if not sorted_features:
            return "Unable to generate explanation"
        
        top_feature = sorted_features[0]
        feature_name = top_feature[0]
        impact = top_feature[1]['impact']
        
        explanations = {
            'risk_score': 'Unusually high/low risk score for this time period',
            'signal_count': 'Abnormal number of signals detected',
            'avg_severity': 'Severity scores deviate from normal pattern',
            'day_of_week': 'Unusual pattern for this day of the week',
            'hour_of_day': 'Unexpected activity at this hour'
        }
        
        base_text = explanations.get(feature_name, f'Unusual {feature_name}')
        
        if impact > 0:
            return f"{base_text} (contributing to anomaly)"
        else:
            return f"{base_text} (mitigating factor)"
    
    def _identify_root_cause(self, explanation: Dict) -> str:
        """Identify root cause category"""
        if 'top_factors' not in explanation:
            return 'unknown'
        
        top_factor = explanation['top_factors'][0]['feature']
        
        if top_factor in ['signal_count', 'avg_severity']:
            return 'sudden_activity_spike'
        elif top_factor == 'risk_score':
            return 'risk_score_outlier'
        elif top_factor in ['day_of_week', 'hour_of_day']:
            return 'temporal_anomaly'
        else:
            return 'unknown'
    
    def _check_false_positive(self, data: Dict) -> bool:
        """Check if anomaly is likely false positive"""
        # Simple heuristics
        if data.get('signal_count', 0) < 2:
            return True  # Very low signal count = likely noise
        
        if data.get('risk_score', 0) < 30:
            return True  # Low risk = not critical
        
        return False
