"""Tests for caching module"""
import unittest
import time
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from cache import Cache

class TestCache(unittest.TestCase):
    def setUp(self):
        self.cache = Cache(default_ttl=1, max_size=100)
    
    def test_set_and_get(self):
        self.cache.set('key1', 'value1')
        self.assertEqual(self.cache.get('key1'), 'value1')
    
    def test_cache_miss(self):
        self.assertIsNone(self.cache.get('nonexistent'))
    
    def test_expiration(self):
        self.cache.set('expiring', 'value', ttl=0.1)
        self.assertEqual(self.cache.get('expiring'), 'value')
        time.sleep(0.2)
        self.assertIsNone(self.cache.get('expiring'))
    
    def test_delete(self):
        self.cache.set('todelete', 'value')
        self.cache.delete('todelete')
        self.assertIsNone(self.cache.get('todelete'))
    
    def test_clear(self):
        self.cache.set('k1', 'v1')
        self.cache.set('k2', 'v2')
        self.cache.clear()
        self.assertIsNone(self.cache.get('k1'))
        self.assertIsNone(self.cache.get('k2'))
    
    def test_invalidate_prefix(self):
        self.cache.set('user:1:data', 'value1')
        self.cache.set('user:2:data', 'value2')
        self.cache.set('other:data', 'value3')
        self.cache.invalidate_prefix('user:')
        self.assertIsNone(self.cache.get('user:1:data'))
        self.assertIsNone(self.cache.get('user:2:data'))
        self.assertEqual(self.cache.get('other:data'), 'value3')
    
    def test_stats(self):
        self.cache.set('k1', 'v1')
        self.cache.get('k1')
        self.cache.get('k1')
        self.cache.get('missing')
        stats = self.cache.get_stats()
        self.assertEqual(stats['hits'], 2)
        self.assertEqual(stats['misses'], 1)
        self.assertEqual(stats['size'], 1)
    
    def test_max_size_eviction(self):
        small_cache = Cache(default_ttl=60, max_size=3)
        small_cache.set('a', 1)
        small_cache.set('b', 2)
        small_cache.set('c', 3)
        small_cache.set('d', 4)
        stats = small_cache.get_stats()
        self.assertEqual(stats['evictions'], 1)
        self.assertEqual(small_cache.get('d'), 4)
    
    def test_different_types(self):
        self.cache.set('int', 42)
        self.cache.set('list', [1, 2, 3])
        self.cache.set('dict', {'key': 'value'})
        self.cache.set('none', None)
        
        self.assertEqual(self.cache.get('int'), 42)
        self.assertEqual(self.cache.get('list'), [1, 2, 3])
        self.assertEqual(self.cache.get('dict'), {'key': 'value'})
        self.assertIsNone(self.cache.get('none'))

if __name__ == '__main__':
    unittest.main()
