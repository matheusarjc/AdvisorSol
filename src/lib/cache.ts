// Simple in-memory cache para otimizar chamadas de API
class SimpleCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttlMs: number = 5 * 60 * 1000) {
    // 5 min default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear() {
    this.cache.clear();
  }

  // Wrapper para funcções async com cache automático
  async withCache<T>(key: string, fn: () => Promise<T>, ttlMs?: number): Promise<T> {
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    const result = await fn();
    this.set(key, result, ttlMs);
    return result;
  }
}

// Persist singleton no escopo global para sobreviver a HMR e múltiplos chunks
// @ts-ignore
const globalAny = globalThis as any;
export const apiCache: SimpleCache = globalAny.__apiCache || new SimpleCache();
if (!globalAny.__apiCache) {
  globalAny.__apiCache = apiCache;
}
