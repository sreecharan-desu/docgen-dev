/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Cache } from "@/lib/cache";

interface UseApiWithCacheOptions {
  cacheKey: string;
  fetchFn: () => Promise<any>;
  enabled?: boolean;
}

export function useApiWithCache<T>({
  cacheKey,
  fetchFn,
  enabled = true,
}: UseApiWithCacheOptions) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!enabled) return;

      // Try to get data from cache first
      const cachedData = Cache.get<T>(cacheKey);
      if (cachedData) {
        setData(cachedData);
        return;
      }

      setIsLoading(true);
      try {
        const result = await fetchFn();
        setData(result);
        Cache.set(cacheKey, result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("An error occurred"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [cacheKey, fetchFn, enabled]);

  const refetch = async () => {
    Cache.remove(cacheKey);
    setIsLoading(true);
    try {
      const result = await fetchFn();
      setData(result);
      Cache.set(cacheKey, result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occurred"));
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, refetch };
}
