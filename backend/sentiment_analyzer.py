"""
Sentiment Analysis for Signals

Analyzes sentiment and emotion in event descriptions.
"""

from typing import Dict, List
import re

try:
    from transformers import pipeline
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False


class SentimentAnalyzer:
    def __init__(self):
        """Initialize sentiment analyzer"""
        self.analyzer = None
        
        if TRANSFORMERS_AVAILABLE:
            try:
                # Use lightweight model for sentiment
                self.analyzer = pipeline(
                    "sentiment-analysis",
                    model="distilbert-base-uncased-finetuned-sst-2-english"
                )
            except Exception as e:
                print(f"Failed to load transformer model: {e}")
                self.analyzer = None
    
    def analyze_text(self, text: str) -> Dict:
        """
        Analyze sentiment of text
        
        Returns:
            {
                'label': 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL',
                'score': float (0-1),
                'emotion': 'anger' | 'fear' | 'hope' | 'neutral',
                'polarity': float (-1 to +1)
            }
        """
        if self.analyzer:
            try:
                result = self.analyzer(text[:512])[0]  # Truncate to model limit
                emotion = self._detect_emotion(text)
                polarity = result['score'] if result['label'] == 'POSITIVE' else -result['score']
                
                return {
                    'label': result['label'],
                    'score': float(result['score']),
                    'emotion': emotion,
                    'polarity': float(polarity)
                }
            except Exception as e:
                print(f"Sentiment analysis failed: {e}")
                return self._fallback_sentiment(text)
        else:
            return self._fallback_sentiment(text)
    
    def analyze_batch(self, texts: List[str]) -> List[Dict]:
        """Analyze multiple texts"""
        return [self.analyze_text(text) for text in texts]
    
    def _detect_emotion(self, text: str) -> str:
        """Simple keyword-based emotion detection"""
        text_lower = text.lower()
        
        # Emotion keywords
        anger_keywords = ['angry', 'furious', 'outrage', 'violent', 'attack', 'clash']
        fear_keywords = ['afraid', 'scared', 'terror', 'threat', 'danger', 'panic']
        hope_keywords = ['hope', 'peace', 'resolve', 'calm', 'cooperation', 'agreement']
        
        anger_score = sum(1 for kw in anger_keywords if kw in text_lower)
        fear_score = sum(1 for kw in fear_keywords if kw in text_lower)
        hope_score = sum(1 for kw in hope_keywords if kw in text_lower)
        
        if anger_score > fear_score and anger_score > hope_score:
            return 'anger'
        elif fear_score > anger_score and fear_score > hope_score:
            return 'fear'
        elif hope_score > 0:
            return 'hope'
        else:
            return 'neutral'
    
    def _fallback_sentiment(self, text: str) -> Dict:
        """Rule-based fallback when transformers unavailable"""
        text_lower = text.lower()
        
        # Negative keywords
        negative_words = [
            'violence', 'attack', 'clash', 'protest', 'tension', 'conflict',
            'threat', 'danger', 'crisis', 'riot', 'bombing', 'shooting'
        ]
        
        # Positive keywords
        positive_words = [
            'peace', 'calm', 'resolve', 'agreement', 'cooperation', 'dialogue',
            'improvement', 'stability', 'development', 'progress'
        ]
        
        negative_count = sum(1 for word in negative_words if word in text_lower)
        positive_count = sum(1 for word in positive_words if word in text_lower)
        
        if negative_count > positive_count:
            polarity = -0.7
            label = 'NEGATIVE'
            score = 0.7
        elif positive_count > negative_count:
            polarity = 0.6
            label = 'POSITIVE'
            score = 0.6
        else:
            polarity = 0.0
            label = 'NEUTRAL'
            score = 0.5
        
        emotion = self._detect_emotion(text)
        
        return {
            'label': label,
            'score': score,
            'emotion': emotion,
            'polarity': polarity
        }
    
    def aggregate_sentiments(self, sentiments: List[Dict]) -> Dict:
        """
        Aggregate multiple sentiment analyses
        
        Returns overall sentiment for a collection of signals
        """
        if not sentiments:
            return {
                'overall_polarity': 0.0,
                'negative_percentage': 0.0,
                'positive_percentage': 0.0,
                'dominant_emotion': 'neutral'
            }
        
        polarities = [s['polarity'] for s in sentiments]
        labels = [s['label'] for s in sentiments]
        emotions = [s['emotion'] for s in sentiments]
        
        # Count emotions
        emotion_counts = {}
        for emotion in emotions:
            emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
        
        dominant_emotion = max(emotion_counts.items(), key=lambda x: x[1])[0]
        
        return {
            'overall_polarity': sum(polarities) / len(polarities),
            'negative_percentage': (labels.count('NEGATIVE') / len(labels)) * 100,
            'positive_percentage': (labels.count('POSITIVE') / len(labels)) * 100,
            'dominant_emotion': dominant_emotion,
            'sample_size': len(sentiments)
        }
