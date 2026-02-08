"""
Third-Party Data Ingestion - Twitter/X API

Auto-ingest signals from social media.
"""

import os
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import asyncio

try:
    import tweepy
    TWEEPY_AVAILABLE = True
except ImportError:
    TWEEPY_AVAILABLE = False


class TwitterIngestion:
    """Twitter/X data ingestion service"""
    
    def __init__(
        self,
        bearer_token: Optional[str] = None,
        districts: List[str] = None
    ):
        """Initialize Twitter API client"""
        self.bearer_token = bearer_token or os.getenv('TWITTER_BEARER_TOKEN')
        self.districts = districts or [
            "Imphal West", "Imphal East", "Churachandpur",
            "Thoubal", "Bishnupur", "Kakching", "Kangpokpi",
            "Senapati", "Ukhrul", "Tamenglong"
        ]
        
        if TWEEPY_AVAILABLE and self.bearer_token:
            try:
                self.client = tweepy.Client(bearer_token=self.bearer_token)
                self.enabled = True
            except Exception as e:
                print(f"Twitter client initialization failed: {e}")
                self.enabled = False
        else:
            self.client = None
            self.enabled = False
    
    def build_search_query(self) -> str:
        """Build search query for Manipur-related tweets"""
        # Keywords
        keywords = [
            "Manipur", "NorthEast India", "NorthEastIndia",
            "Imphal", "Churachandpur", "Kakching"
        ]
        
        # Hashtags
        hashtags = [
            "#Manipur", "#NorthEast", "#NorthEastIndia",
            "#Imphal", "#SaveManipur", "#ManipurCrisis"
        ]
        
        # Combine with OR
        query_parts = keywords + hashtags
        query = " OR ".join(query_parts)
        
        # Exclude retweets
        query += " -is:retweet"
        
        return query
    
    async def fetch_recent_tweets(
        self,
        max_results: int = 100,
        hours_ago: int = 24
    ) -> List[Dict]:
        """Fetch recent tweets about Manipur"""
        if not self.enabled:
            return []
        
        try:
            query = self.build_search_query()
            start_time = datetime.utcnow() - timedelta(hours=hours_ago)
            
            # Search tweets
            response = self.client.search_recent_tweets(
                query=query,
                max_results=max_results,
                start_time=start_time,
                tweet_fields=['created_at', 'author_id', 'public_metrics', 'geo'],
                expansions=['author_id', 'geo.place_id']
            )
            
            if not response.data:
                return []
            
            # Convert to signal format
            signals = []
            for tweet in response.data:
                signal = self._tweet_to_signal(tweet)
                if signal:
                    signals.append(signal)
            
            return signals
            
        except Exception as e:
            print(f"Twitter fetch failed: {e}")
            return []
    
    def _tweet_to_signal(self, tweet) -> Optional[Dict]:
        """Convert tweet to signal format"""
        try:
            # Extract location (if available)
            district = self._extract_district(tweet.text)
            if not district:
                district = "Unknown"
            
            # Calculate severity based on engagement
            metrics = tweet.public_metrics
            engagement = metrics.get('like_count', 0) + metrics.get('retweet_count', 0) * 2
            
            if engagement > 1000:
                severity = 4.5
            elif engagement > 500:
                severity = 4.0
            elif engagement > 100:
                severity = 3.5
            else:
                severity = 3.0
            
            signal = {
                'district': district,
                'timestamp': tweet.created_at.isoformat(),
                'event_summary': tweet.text[:500],  # Truncate
                'source_type': 'social_media',
                'source_id': f"twitter_{tweet.id}",
                'severity_score': severity,
                'metadata': {
                    'tweet_id': str(tweet.id),
                    'author_id': str(tweet.author_id),
                    'likes': metrics.get('like_count', 0),
                    'retweets': metrics.get('retweet_count', 0),
                    'replies': metrics.get('reply_count', 0),
                    'engagement_score': engagement
                }
            }
            
            return signal
            
        except Exception as e:
            print(f"Tweet conversion failed: {e}")
            return None
    
    def _extract_district(self, text: str) -> Optional[str]:
        """Extract district name from tweet text"""
        text_lower = text.lower()
        
        for district in self.districts:
            if district.lower() in text_lower:
                return district
        
        return None
    
    async def monitor_stream(self, callback):
        """Monitor Twitter stream (requires elevated API access)"""
        # This requires Twitter API v2 filtered stream
        # Placeholder for future implementation
        pass


class NewsAPIIngestion:
    """News API data ingestion service"""
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize News API client"""
        self.api_key = api_key or os.getenv('NEWS_API_KEY')
        self.base_url = "https://newsapi.org/v2"
        self.enabled = self.api_key is not None
    
    async def fetch_news(
        self,
        query: str = "Manipur OR North East India",
        days_ago: int = 1,
        max_results: int = 50
    ) -> List[Dict]:
        """Fetch news articles"""
        if not self.enabled:
            return []
        
        try:
            import aiohttp
            
            from_date = (datetime.utcnow() - timedelta(days=days_ago)).strftime('%Y-%m-%d')
            
            url = f"{self.base_url}/everything"
            params = {
                'q': query,
                'from': from_date,
                'language': 'en',
                'sortBy': 'publishedAt',
                'pageSize': max_results,
                'apiKey': self.api_key
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        articles = data.get('articles', [])
                        
                        # Convert to signals
                        signals = [self._article_to_signal(article) for article in articles]
                        return [s for s in signals if s]
                    else:
                        print(f"News API error: {response.status}")
                        return []
                        
        except Exception as e:
            print(f"News fetch failed: {e}")
            return []
    
    def _article_to_signal(self, article: Dict) -> Optional[Dict]:
        """Convert news article to signal"""
        try:
            # Determine severity from title/description
            text = f"{article.get('title', '')} {article.get('description', '')}".lower()
            
            severity_keywords = {
                5.0: ['killed', 'dead', 'death', 'bombing', 'explosion'],
                4.5: ['violence', 'clash', 'attack', 'shooting'],
                4.0: ['protest', 'tension', 'conflict', 'riot'],
                3.5: ['alert', 'warning', 'concern'],
                3.0: ['situation', 'incident', 'event']
            }
            
            severity = 2.5  # Default
            for sev, keywords in severity_keywords.items():
                if any(kw in text for kw in keywords):
                    severity = sev
                    break
            
            signal = {
                'district': 'Manipur',  # General for news
                'timestamp': article.get('publishedAt'),
                'event_summary': article.get('title', '') + ". " + article.get('description', ''),
                'source_type': 'media',
                'source_id': f"news_{article.get('url', '').split('/')[-1][:20]}",
                'severity_score': severity,
                'metadata': {
                    'url': article.get('url'),
                    'source_name': article.get('source', {}).get('name'),
                    'author': article.get('author'),
                    'image_url': article.get('urlToImage')
                }
            }
            
            return signal
            
        except Exception as e:
            print(f"Article conversion failed: {e}")
            return None


class DataIngestionScheduler:
    """Scheduler for automated data ingestion"""
    
    def __init__(self, db_connection):
        self.db = db_connection
        self.twitter = TwitterIngestion()
        self.news = NewsAPIIngestion()
    
    async def ingest_all_sources(self) -> Dict[str, int]:
        """Ingest from all sources"""
        results = {
            'twitter': 0,
            'news': 0,
            'total': 0
        }
        
        # Twitter
        if self.twitter.enabled:
            tweets = await self.twitter.fetch_recent_tweets(hours_ago=4)
            for signal in tweets:
                if self._insert_signal(signal):
                    results['twitter'] += 1
        
        # News
        if self.news.enabled:
            articles = await self.news.fetch_news(days_ago=1)
            for signal in articles:
                if self._insert_signal(signal):
                    results['news'] += 1
        
        results['total'] = results['twitter'] + results['news']
        
        print(f"Ingestion complete: {results}")
        return results
    
    def _insert_signal(self, signal: Dict) -> bool:
        """Insert signal into database"""
        try:
            # Check for duplicates
            existing = self.db.query_one("""
                SELECT id FROM signals WHERE source_id = %s
            """, (signal['source_id'],))
            
            if existing:
                return False  # Already exists
            
            # Insert
            self.db.execute("""
                INSERT INTO signals 
                    (district, timestamp, event_summary, source_type, source_id, severity_score, metadata)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                signal['district'],
                signal['timestamp'],
                signal['event_summary'],
                signal['source_type'],
                signal['source_id'],
                signal['severity_score'],
                signal.get('metadata', {})
            ))
            
            return True
            
        except Exception as e:
            print(f"Signal insertion failed: {e}")
            return False
