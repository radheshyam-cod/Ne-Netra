"""
Redis Caching Layer

Multi-layer caching strategy for performance optimization.
"""

import redis
import json
from typing import Optional, Any, Callable
from datetime import timedelta
from functools import wraps


class CacheService:
    """Redis caching service"""
    
    # Cache TTL configurations
    TTL_CONFIG = {
        'risk_score': 900,  # 15 minutes
        'district_meta': 86400,  # 1 day
        'historical_trends': 604800,  # 1 week
        'signals_list': 300,  # 5 minutes
        'user_permissions': 1800,  # 30 minutes
    }
    
    def __init__(self, redis_url: str = 'redis://localhost:6379'):
        """Initialize Redis connection"""
        try:
            self.redis = redis.from_url(redis_url, decode_responses=True)
            self.redis.ping()
            self.enabled = True
        except Exception as e:
            print(f"Redis connection failed: {e}. Caching disabled.")
            self.redis = None
            self.enabled = False
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if not self.enabled:
            return None
        
        try:
            value = self.redis.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            print(f"Cache get error: {e}")
            return None
    
    def set(
        self,
        key: str,
        value: Any,
        ttl: Optional[int] = None,
        cache_type: Optional[str] = None
    ) -> bool:
        """Set value in cache"""
        if not self.enabled:
            return False
        
        try:
            # Use cache_type TTL if provided
            if cache_type and cache_type in self.TTL_CONFIG:
                ttl = self.TTL_CONFIG[cache_type]
            
            serialized = json.dumps(value)
            
            if ttl:
                self.redis.setex(key, ttl, serialized)
            else:
                self.redis.set(key, serialized)
            
            return True
        except Exception as e:
            print(f"Cache set error: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """Delete key from cache"""
        if not self.enabled:
            return False
        
        try:
            self.redis.delete(key)
            return True
        except Exception as e:
            print(f"Cache delete error: {e}")
            return False
    
    def delete_pattern(self, pattern: str) -> int:
        """Delete all keys matching pattern"""
        if not self.enabled:
            return 0
        
        try:
            keys = self.redis.keys(pattern)
            if keys:
                return self.redis.delete(*keys)
            return 0
        except Exception as e:
            print(f"Cache delete pattern error: {e}")
            return 0
    
    def clear_all(self) -> bool:
        """Clear entire cache (use carefully!)"""
        if not self.enabled:
            return False
        
        try:
            self.redis.flushdb()
            return True
        except:
            return False
    
    # Helper methods for common cache keys
    
    def get_risk_score(self, district: str) -> Optional[dict]:
        """Get cached risk score"""
        return self.get(f"risk:{district}")
    
    def set_risk_score(self, district: str, data: dict) -> bool:
        """Cache risk score"""
        success = self.set(f"risk:{district}", data, cache_type='risk_score')
        if success:
            print(f"Cached risk score for {district}")
        return success
    
    def invalidate_risk_score(self, district: str) -> bool:
        """Invalidate risk score cache"""
        return self.delete(f"risk:{district}")
    
    def get_user_permissions(self, user_id: str) -> Optional[dict]:
        """Get cached user permissions"""
        return self.get(f"permissions:{user_id}")
    
    def set_user_permissions(self, user_id: str, permissions: dict) -> bool:
        """Cache user permissions"""
        return self.set(f"permissions:{user_id}", permissions, cache_type='user_permissions')
    
    def invalidate_user_permissions(self, user_id: str) -> bool:
        """Invalidate user permissions cache"""
        return self.delete(f"permissions:{user_id}")


# Decorator for automatic caching
def cached(cache_type: str, key_builder: Callable = None):
    """
    Decorator for automatic function caching
    
    Example:
        @cached('risk_score', lambda district: f"risk:{district}")
        def get_risk_score(district):
            return db.query(...)
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Build cache key
            if key_builder:
                cache_key = key_builder(*args, **kwargs)
            else:
                # Default: function name + args
                cache_key = f"{func.__name__}:{':'.join(map(str, args))}"
            
            # Try to get from cache
            cache = CacheService()
            cached_value = cache.get(cache_key)
            
            if cached_value is not None:
                return cached_value
            
            # Execute function
            result = func(*args, **kwargs)
            
            # Cache result
            cache.set(cache_key, result, cache_type=cache_type)
            
            return result
        
        return wrapper
    return decorator


# Example usage:
"""
from cache import cached, CacheService

# Initialize cache
cache = CacheService()

# Manual caching
def get_risk_score(district):
    # Try cache first
    cached = cache.get_risk_score(district)
    if cached:
        return cached
    
    # Query database
    score = db.query_risk_score(district)
    
    # Cache for next time
    cache.set_risk_score(district, score)
    
    return score

# Or use decorator
@cached('risk_score', lambda district: f"risk:{district}")
def get_risk_score_cached(district):
    return db.query_risk_score(district)

# Invalidate on updates
def update_risk_score(district, new_score):
    db.update(district, new_score)
    cache.invalidate_risk_score(district)
"""
