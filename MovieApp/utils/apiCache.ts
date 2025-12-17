// API Caching System for Performance Optimization
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './logger';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of items in cache
}

class ApiCache {
  private cache = new Map<string, CacheItem<any>>();
  private config: CacheConfig;

  constructor(config: CacheConfig = { ttl: 5 * 60 * 1000, maxSize: 100 }) {
    this.config = config;
    this.loadFromStorage();
  }

  // Set cache item
  async set<T>(key: string, data: T, customTTL?: number): Promise<void> {
    try {
      const now = Date.now();
      const ttl = customTTL || this.config.ttl;
      
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: now,
        expiry: now + ttl,
      };

      // Remove oldest items if cache is full
      if (this.cache.size >= this.config.maxSize) {
        const oldestKey = this.cache.keys().next().value;
        this.cache.delete(oldestKey);
      }

      this.cache.set(key, cacheItem);
      await this.saveToStorage();
      
      logger.debug('Cache set', { key, ttl });
    } catch (error) {
      logger.error('Failed to set cache', error);
    }
  }

  // Get cache item
  get<T>(key: string): T | null {
    try {
      const item = this.cache.get(key);
      
      if (!item) {
        return null;
      }

      // Check if expired
      if (Date.now() > item.expiry) {
        this.cache.delete(key);
        logger.debug('Cache expired', { key });
        return null;
      }

      logger.debug('Cache hit', { key });
      return item.data as T;
    } catch (error) {
      logger.error('Failed to get cache', error);
      return null;
    }
  }

  // Check if key exists and is valid
  has(key: string): boolean {
    const item = this.cache.get(key);
    return item ? Date.now() <= item.expiry : false;
  }

  // Clear specific key
  async delete(key: string): Promise<void> {
    try {
      this.cache.delete(key);
      await this.saveToStorage();
      logger.debug('Cache deleted', { key });
    } catch (error) {
      logger.error('Failed to delete cache', error);
    }
  }

  // Clear all cache
  async clear(): Promise<void> {
    try {
      this.cache.clear();
      await AsyncStorage.removeItem('api_cache');
      logger.debug('Cache cleared');
    } catch (error) {
      logger.error('Failed to clear cache', error);
    }
  }

  // Get cache stats
  getStats() {
    const now = Date.now();
    const validItems = Array.from(this.cache.values()).filter(
      item => now <= item.expiry
    ).length;
    
    return {
      totalItems: this.cache.size,
      validItems,
      expiredItems: this.cache.size - validItems,
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  // Clean expired items
  async cleanExpired(): Promise<void> {
    try {
      const now = Date.now();
      const expiredKeys: string[] = [];

      for (const [key, item] of this.cache.entries()) {
        if (now > item.expiry) {
          expiredKeys.push(key);
        }
      }

      expiredKeys.forEach(key => this.cache.delete(key));
      
      if (expiredKeys.length > 0) {
        await this.saveToStorage();
        logger.debug('Cleaned expired cache items', { count: expiredKeys.length });
      }
    } catch (error) {
      logger.error('Failed to clean expired cache', error);
    }
  }

  // Save cache to storage
  private async saveToStorage(): Promise<void> {
    try {
      const cacheData = Array.from(this.cache.entries());
      await AsyncStorage.setItem('api_cache', JSON.stringify(cacheData));
    } catch (error) {
      logger.error('Failed to save cache to storage', error);
    }
  }

  // Load cache from storage
  private async loadFromStorage(): Promise<void> {
    try {
      const cacheData = await AsyncStorage.getItem('api_cache');
      if (cacheData) {
        const parsed = JSON.parse(cacheData);
        this.cache = new Map(parsed);
        logger.debug('Cache loaded from storage', { items: this.cache.size });
      }
    } catch (error) {
      logger.error('Failed to load cache from storage', error);
    }
  }

  // Estimate memory usage
  private estimateMemoryUsage(): number {
    let totalSize = 0;
    for (const [key, item] of this.cache.entries()) {
      totalSize += key.length * 2; // String length * 2 bytes per char
      totalSize += JSON.stringify(item).length * 2;
    }
    return totalSize;
  }
}

// Create singleton instance
export const apiCache = new ApiCache();

// Cache keys constants
export const CACHE_KEYS = {
  HOME_DATA: 'home_data',
  FEATURED_MOVIES: 'featured_movies',
  TRENDING_MOVIES: 'trending_movies',
  HERO_SLIDES: 'hero_slides',
  ALL_MOVIES: 'all_movies',
  TAGS: 'tags',
  REGIONS: 'regions',
  PERSONS: 'persons',
  WATCH_PROGRESS: 'watch_progress',
  SAVED_MOVIES: 'saved_movies',
} as const;

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  SHORT: 2 * 60 * 1000, // 2 minutes
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 15 * 60 * 1000, // 15 minutes
  VERY_LONG: 60 * 60 * 1000, // 1 hour
} as const;




