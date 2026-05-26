"""
Caching Module for YoCoin
Simple in-memory cache with TTL support
"""
import time
import threading
import logging
from functools import wraps

logger = logging.getLogger(__name__)

class Cache:
    """Thread-safe in-memory cache with TTL"""
    
    def __init__(self, default_ttl=300, max_size=1000):
        self._cache = {}
        self._lock = threading.Lock()
        self.default_ttl = default_ttl
        self.max_size = max_size
        self._stats = {'hits': 0, 'misses': 0, 'evictions': 0}
    
    def get(self, key):
        """Get value from cache, returns None if expired or missing"""
        with self._lock:
            if key not in self._cache:
                self._stats['misses'] += 1
                return None
            
            entry = self._cache[key]
            if time.time() > entry['expires_at']:
                del self._cache[key]
                self._stats['misses'] += 1
                return None
            
            self._stats['hits'] += 1
            return entry['value']
    
    def set(self, key, value, ttl=None):
        """Set value in cache with optional TTL"""
        if ttl is None:
            ttl = self.default_ttl
        
        with self._lock:
            if len(self._cache) >= self.max_size and key not in self._cache:
                self._evict_oldest()
            
            self._cache[key] = {
                'value': value,
                'expires_at': time.time() + ttl,
                'created_at': time.time()
            }
    
    def delete(self, key):
        """Delete a specific key from cache"""
        with self._lock:
            if key in self._cache:
                del self._cache[key]
    
    def clear(self):
        """Clear all cached values"""
        with self._lock:
            self._cache.clear()
    
    def invalidate_prefix(self, prefix):
        """Invalidate all keys starting with prefix"""
        with self._lock:
            keys_to_delete = [k for k in self._cache if k.startswith(prefix)]
            for k in keys_to_delete:
                del self._cache[k]
    
    def get_stats(self):
        """Get cache hit/miss statistics"""
        total = self._stats['hits'] + self._stats['misses']
        hit_rate = (self._stats['hits'] / total * 100) if total > 0 else 0
        return {
            **self._stats,
            'size': len(self._cache),
            'hit_rate': round(hit_rate, 1)
        }
    
    def _evict_oldest(self):
        """Remove the oldest entry"""
        if not self._cache:
            return
        oldest_key = min(self._cache, key=lambda k: self._cache[k]['created_at'])
        del self._cache[oldest_key]
        self._stats['evictions'] += 1


class QueryCache:
    """Cache for database query results"""
    
    def __init__(self, mysql, cache=None):
        self.mysql = mysql
        self.cache = cache or Cache(default_ttl=300)
    
    def cached_query(self, query, params=None, ttl=None, key_prefix='query'):
        """
        Execute query with caching.
        Returns cached result if available, otherwise executes and caches.
        """
        import hashlib
        param_str = str(params or '')
        cache_key = f'{key_prefix}:{hashlib.md5((query + param_str).encode()).hexdigest()}'
        
        cached = self.cache.get(cache_key)
        if cached is not None:
            return cached
        
        cursor = None
        try:
            cursor = self.mysql.connection.cursor()
            cursor.execute(query, params or ())
            result = cursor.fetchall()
            
            self.cache.set(cache_key, result, ttl)
            return result
        except Exception as e:
            logger.error(f'Cached query error: {e}')
            return []
        finally:
            if cursor:
                try:
                    cursor.close()
                except Exception:
                    pass
    
    def invalidate_user_cache(self, user_id):
        """Invalidate all cached data for a user"""
        self.cache.invalidate_prefix(f'user:{user_id}')
        self.cache.invalidate_prefix(f'query')
    
    def invalidate_all(self):
        """Clear all cached queries"""
        self.cache.clear()


def cache_result(cache_instance, key_prefix='result', ttl=300):
    """
    Decorator to cache function results.
    Usage:
        @cache_result(my_cache, key_prefix='dashboard', ttl=60)
        def get_dashboard_data(user_id):
            ...
    """
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            key_parts = [key_prefix]
            key_parts.extend(str(a) for a in args)
            key_parts.extend(f'{k}={v}' for k, v in sorted(kwargs.items()))
            cache_key = ':'.join(key_parts)
            
            cached = cache_instance.get(cache_key)
            if cached is not None:
                return cached
            
            result = f(*args, **kwargs)
            cache_instance.set(cache_key, result, ttl)
            return result
        return wrapper
    return decorator


global_cache = Cache(default_ttl=300, max_size=2000)
