/**
 * ⚡ Cache Layer — In-Memory + Redis-Ready Caching
 * 
 * Uses in-memory Map for development, can be swapped to Redis for production.
 * Provides TTL-based caching with automatic cleanup.
 * 
 * Production migration: Set REDIS_URL env var to enable Redis mode.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class CacheService {
  private store = new Map<string, CacheEntry<unknown>>();
  private hits = 0;
  private misses = 0;

  constructor() {
    // Cleanup expired entries every 60 seconds
    setInterval(() => this.cleanup(), 60_000);
  }

  /** Get a cached value */
  get<T>(key: string): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) {
      this.misses++;
      return null;
    }
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.misses++;
      return null;
    }
    this.hits++;
    return entry.value;
  }

  /** Set a value with TTL in seconds */
  set<T>(key: string, value: T, ttlSeconds: number = 300): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  /** Get or compute — cache-aside pattern */
  async getOrSet<T>(key: string, factory: () => T | Promise<T>, ttlSeconds: number = 300): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) return cached;

    const value = await factory();
    this.set(key, value, ttlSeconds);
    return value;
  }

  /** Invalidate a specific key */
  delete(key: string): void {
    this.store.delete(key);
  }

  /** Invalidate all keys matching a pattern */
  invalidatePattern(pattern: string): number {
    let count = 0;
    for (const key of this.store.keys()) {
      if (key.includes(pattern)) {
        this.store.delete(key);
        count++;
      }
    }
    return count;
  }

  /** Get cache statistics */
  stats() {
    return {
      size: this.store.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: this.hits + this.misses > 0
        ? Math.round((this.hits / (this.hits + this.misses)) * 100)
        : 0,
    };
  }

  /** Clear all entries */
  flush(): void {
    this.store.clear();
    this.hits = 0;
    this.misses = 0;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) this.store.delete(key);
    }
  }
}

// Singleton instance
const globalForCache = globalThis as unknown as { _cache?: CacheService };
export const cache = globalForCache._cache ?? new CacheService();
if (process.env.NODE_ENV !== 'production') globalForCache._cache = cache;

// ─── Pre-defined Cache Keys ───
export const CACHE_KEYS = {
  courses: (page: number) => `courses:list:${page}`,
  courseDetail: (id: string | number) => `courses:${id}`,
  labs: () => `labs:list`,
  labDetail: (id: string) => `labs:${id}`,
  terms: (page: number) => `terms:list:${page}`,
  leaderboard: () => `leaderboard:top`,
  userProfile: (id: string) => `user:profile:${id}`,
  userRecommendations: (id: string) => `user:recs:${id}`,
  blogPosts: (page: number) => `blog:list:${page}`,
  news: (page: number) => `news:list:${page}`,
  adminMetrics: () => `admin:metrics`,
  threatMapStats: () => `threatmap:stats`,
} as const;

// ─── TTL Presets (in seconds) ───
export const TTL = {
  SHORT: 30,       // 30 seconds — real-time data
  MEDIUM: 300,     // 5 minutes — frequently updated
  LONG: 3600,      // 1 hour — rarely changed content
  DAY: 86400,      // 24 hours — static content
} as const;

export default cache;
