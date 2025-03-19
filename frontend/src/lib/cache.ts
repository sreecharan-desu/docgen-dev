interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export class Cache {
  private static EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

  static set<T>(key: string, data: T): void {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(cacheItem));
  }

  static get<T>(key: string): T | null {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const cacheItem: CacheItem<T> = JSON.parse(item);
    const isExpired = Date.now() - cacheItem.timestamp > this.EXPIRATION_TIME;

    if (isExpired) {
      localStorage.removeItem(key);
      return null;
    }

    return cacheItem.data;
  }

  static remove(key: string): void {
    localStorage.removeItem(key);
  }
}
