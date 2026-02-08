"""
Pattern Recognition System

Detects seasonal patterns, spillover effects, and trigger sequences.
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Tuple
from collections import defaultdict


class PatternDetector:
    def __init__(self):
        self.patterns_cache = {}
    
    def detect_all_patterns(
        self,
        district: str,
        historical_data: pd.DataFrame,
        adjacent_districts: List[str] = None
    ) -> List[Dict]:
        """
        Detect all pattern types
        
        Returns list of patterns found:
        [
            {
                'type': 'seasonal' | 'spillover' | 'trigger_sequence',
                'description': str,
                'confidence': float,
                'historical_matches': int,
                'example': str
            }
        ]
        """
        patterns = []
        
        # Seasonal patterns
        patterns.extend(self._detect_seasonal_patterns(district, historical_data))
        
        # Spillover patterns (if adjacent districts data available)
        if adjacent_districts:
            # Would need data for adjacent districts
            pass
        
        # Trigger sequence patterns
        patterns.extend(self._detect_trigger_sequences(district, historical_data))
        
        return patterns
    
    def _detect_seasonal_patterns(
        self,
        district: str,
        data: pd.DataFrame
    ) -> List[Dict]:
        """Detect recurring seasonal/temporal patterns"""
        patterns = []
        
        if len(data) < 90:  # Need at least 3 months
            return patterns
        
        data = data.copy()
        data['date'] = pd.to_datetime(data['date'])
        data['month'] = data['date'].dt.month
        data['day_of_week'] = data['date'].dt.dayofweek
        
        # Monthly pattern analysis
        monthly_avg = data.groupby('month')['risk_score'].agg(['mean', 'std', 'count'])
        
        for month, row in monthly_avg.iterrows():
            if row['count'] >= 3 and row['mean'] > data['risk_score'].mean() + row['std']:
                month_name = datetime(2000, month, 1).strftime('%B')
                patterns.append({
                    'type': 'seasonal',
                    'description': f"{district} consistently shows elevated risk in {month_name} (avg: {row['mean']:.1f})",
                    'confidence': min(0.9, 0.5 + (row['count'] * 0.1)),
                    'historical_matches': int(row['count']),
                    'example': f"{month_name} average: {row['mean']:.1f} vs overall: {data['risk_score'].mean():.1f}"
                })
        
        # Day of week patterns
        dow_avg = data.groupby('day_of_week')['risk_score'].agg(['mean', 'count'])
        dow_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        
        for dow, row in dow_avg.iterrows():
            if row['count'] >= 5 and row['mean'] > data['risk_score'].mean() + 5:
                patterns.append({
                    'type': 'seasonal',
                    'description': f"{dow_names[dow]} shows higher risk ({row['mean']:.1f} avg)",
                    'confidence': 0.7,
                    'historical_matches': int(row['count']),
                    'example': f"Weekend vs weekday pattern"
                })
        
        # Festival/Event detection (based on risk spikes)
        data['rolling_avg'] = data['risk_score'].rolling(7).mean()
        data['spike'] = data['risk_score'] > (data['rolling_avg'] + 15)
        
        spike_dates = data[data['spike']]['date'].tolist()
        if len(spike_dates) >= 3:
            patterns.append({
                'type': 'seasonal',
                'description': f"Recurring risk spikes detected around specific dates (possibly festivals/events)",
                'confidence': 0.75,
                'historical_matches': len(spike_dates),
                'example': f"Last spike: {spike_dates[-1].strftime('%Y-%m-%d')}"
            })
        
        return patterns
    
    def _detect_trigger_sequences(
        self,
        district: str,
        data: pd.DataFrame
    ) -> List[Dict]:
        """Detect signal → incident lag patterns"""
        patterns = []
        
        if 'signal_count' not in data.columns or 'incident_count' not in data.columns:
            return patterns
        
        # Analyze lag between signal spikes and incident spikes
        data = data.copy()
        data['signal_spike'] = data['signal_count'] > data['signal_count'].rolling(7).mean() + 5
        data['incident_spike'] = data['incident_count'] > data['incident_count'].rolling(7).mean() + 2
        
        # Find typical lag
        lags_found = []
        for i in range(len(data) - 7):
            if data.iloc[i]['signal_spike']:
                # Check next 7 days for incident spike
                for lag in range(1, 8):
                    if i + lag < len(data) and data.iloc[i + lag]['incident_spike']:
                        lags_found.append(lag)
                        break
        
        if len(lags_found) >= 3:
            avg_lag = np.mean(lags_found)
            patterns.append({
                'type': 'trigger_sequence',
                'description': f"Signal spikes typically precede physical incidents by {avg_lag:.0f} days",
                'confidence': 0.8,
                'historical_matches': len(lags_found),
                'example': f"Early warning window: ~{avg_lag:.0f} days"
            })
        
        return patterns
    
    def detect_spillover_correlation(
        self,
        district1: str,
        district2: str,
        data1: pd.DataFrame,
        data2: pd.DataFrame
    ) -> Dict:
        """
        Detect if risk in district1 correlates with risk in district2
        
        Returns correlation analysis
        """
        # Merge on date
        merged = pd.merge(
            data1[['date', 'risk_score']],
            data2[['date', 'risk_score']],
            on='date',
            suffixes=('_1', '_2')
        )
        
        if len(merged) < 30:
            return None
        
        # Correlation
        correlation = merged['risk_score_1'].corr(merged['risk_score_2'])
        
        # Lagged correlation (check if district1 leads district2)
        max_lag_corr = 0
        best_lag = 0
        
        for lag in range(1, 8):
            if len(merged) > lag:
                lagged = merged['risk_score_1'].shift(lag).corr(merged['risk_score_2'])
                if abs(lagged) > abs(max_lag_corr):
                    max_lag_corr = lagged
                    best_lag = lag
        
        result = {
            'correlation': float(correlation),
            'lagged_correlation': float(max_lag_corr),
            'optimal_lag_days': best_lag,
            'description': ''
        }
        
        if abs(max_lag_corr) > 0.6 and best_lag > 0:
            result['description'] = f"When {district1} risk rises, {district2} typically follows within {best_lag} days (correlation: {max_lag_corr:.2f})"
        elif abs(correlation) > 0.6:
            result['description'] = f"{district1} and {district2} show strong simultaneous correlation ({correlation:.2f})"
        else:
            result['description'] = "No strong spillover pattern detected"
        
        return result
