"""
Predictive Risk Analytics - 7-Day Forecasting

Uses ML to predict future risk scores based on historical patterns.
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Tuple
import pickle
import os

try:
    from sklearn.ensemble import RandomForestRegressor
    from sklearn.preprocessing import StandardScaler
except ImportError:
    RandomForestRegressor = None
    StandardScaler = None


class RiskPredictor:
    def __init__(self, model_path: str = 'models/risk_predictor.pkl'):
        """Initialize predictor with optional pre-trained model"""
        self.model = None
        self.scaler = None
        self.model_path = model_path
        
        if os.path.exists(model_path):
            self.load_model()
        elif RandomForestRegressor:
            self.model = RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                random_state=42
            )
            self.scaler = StandardScaler()
    
    def extract_features(self, data: pd.DataFrame) -> np.ndarray:
        """
        Extract features from historical data
        
        Features:
        - Day of week (0-6)
        - Month (1-12)
        - Recent trend (3-day slope)
        - Seasonal factor (0-1)
        - Signal count
        - Average severity
        """
        features = []
        
        for idx, row in data.iterrows():
            date = pd.to_datetime(row['date'])
            
            # Temporal features
            day_of_week = date.dayofweek
            month = date.month
            day_of_year = date.dayofyear
            
            # Seasonal factor (0-1, peaks at major festivals)
            seasonal = np.sin(2 * np.pi * day_of_year / 365)
            
            # Recent trend (if enough history)
            if idx >= 3:
                recent_scores = data.iloc[idx-3:idx]['risk_score'].values
                trend = np.polyfit(range(3), recent_scores, 1)[0]  # Slope
            else:
                trend = 0
            
            # Signal metrics
            signal_count = row.get('signal_count', 0)
            avg_severity = row.get('avg_severity', 0)
            
            features.append([
                day_of_week,
                month,
                seasonal,
                trend,
                signal_count,
                avg_severity
            ])
        
        return np.array(features)
    
    def train(self, historical_data: pd.DataFrame):
        """
        Train model on historical data
        
        Args:
            historical_data: DataFrame with columns:
                - date
                - risk_score
                - signal_count
                - avg_severity
        """
        if not self.model:
            raise ValueError("scikit-learn not installed")
        
        X = self.extract_features(historical_data)
        y = historical_data['risk_score'].values
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train model
        self.model.fit(X_scaled, y)
        
        # Save model
        self.save_model()
        
        print(f"Model trained on {len(historical_data)} data points")
    
    def predict_7_days(
        self,
        district: str,
        recent_data: pd.DataFrame
    ) -> Dict:
        """
        Predict next 7 days of risk scores
        
        Returns:
            {
                'predictions': List[{'date': str, 'score': float, 'confidence_low': float, 'confidence_high': float}],
                'trend': 'rising' | 'falling' | 'stable',
                'peak_day': int,
                'average': float
            }
        """
        if not self.model:
            return self._fallback_prediction(recent_data)
        
        predictions = []
        last_date = pd.to_datetime(recent_data.iloc[-1]['date'])
        
        for day in range(1, 8):
            future_date = last_date + timedelta(days=day)
            
            # Build feature vector for future date
            features = self._build_future_features(
                future_date,
                recent_data,
                predictions
            )
            
            # Scale and predict
            features_scaled = self.scaler.transform([features])
            score = self.model.predict(features_scaled)[0]
            
            # Estimate confidence interval (simple approach)
            confidence_low = max(0, score - 10)
            confidence_high = min(100, score + 10)
            
            predictions.append({
                'date': future_date.strftime('%Y-%m-%d'),
                'score': float(score),
                'confidence_low': float(confidence_low),
                'confidence_high': float(confidence_high)
            })
        
        # Analyze trend
        scores = [p['score'] for p in predictions]
        trend = self._analyze_trend(scores)
        peak_day = scores.index(max(scores)) + 1
        average = np.mean(scores)
        
        return {
            'predictions': predictions,
            'trend': trend,
            'peak_day': peak_day,
            'average': float(average)
        }
    
    def _build_future_features(
        self,
        date: datetime,
        recent_data: pd.DataFrame,
        predictions: List[Dict]
    ) -> List[float]:
        """Build feature vector for future date"""
        day_of_week = date.dayofweek
        month = date.month
        day_of_year = date.timetuple().tm_yday
        seasonal = np.sin(2 * np.pi * day_of_year / 365)
        
        # Trend from recent actual + predicted data
        if len(predictions) >= 3:
            recent_scores = [p['score'] for p in predictions[-3:]]
        else:
            recent_scores = list(recent_data.tail(3)['risk_score'].values)
            recent_scores.extend([p['score'] for p in predictions])
            recent_scores = recent_scores[-3:]
        
        trend = np.polyfit(range(len(recent_scores)), recent_scores, 1)[0] if recent_scores else 0
        
        # Signal count and severity (use recent average)
        signal_count = recent_data.tail(7)['signal_count'].mean()
        avg_severity = recent_data.tail(7)['avg_severity'].mean()
        
        return [day_of_week, month, seasonal, trend, signal_count, avg_severity]
    
    def _analyze_trend(self, scores: List[float]) -> str:
        """Analyze if trend is rising, falling, or stable"""
        slope = np.polyfit(range(len(scores)), scores, 1)[0]
        
        if slope > 2:
            return 'rising'
        elif slope < -2:
            return 'falling'
        else:
            return 'stable'
    
    def _fallback_prediction(self, recent_data: pd.DataFrame) -> Dict:
        """Simple fallback when ML unavailable"""
        last_score = recent_data.iloc[-1]['risk_score']
        recent_avg = recent_data.tail(7)['risk_score'].mean()
        
        predictions = []
        for day in range(1, 8):
            # Simple average with slight regression to mean
            score = 0.7 * last_score + 0.3 * recent_avg
            predictions.append({
                'date': (datetime.now() + timedelta(days=day)).strftime('%Y-%m-%d'),
                'score': float(score),
                'confidence_low': float(score - 15),
                'confidence_high': float(score + 15)
            })
        
        return {
            'predictions': predictions,
            'trend': 'stable',
            'peak_day': 1,
            'average': float(last_score)
        }
    
    def save_model(self):
        """Save trained model to disk"""
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        with open(self.model_path, 'wb') as f:
            pickle.dump({'model': self.model, 'scaler': self.scaler}, f)
    
    def load_model(self):
        """Load trained model from disk"""
        with open(self.model_path, 'rb') as f:
            data = pickle.load(f)
            self.model = data['model']
            self.scaler = data['scaler']
