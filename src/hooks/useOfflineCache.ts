import { useState, useEffect } from 'react';

interface CachedDetection {
  id: string;
  timestamp: number;
  result: any;
  imagePreview?: string;
}

const CACHE_KEY = 'offline_detections';
const MAX_CACHE = 20;

export const useOfflineCache = () => {
  const [cachedResults, setCachedResults] = useState<CachedDetection[]>([]);

  useEffect(() => {
    loadCache();
  }, []);

  const loadCache = () => {
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      if (stored) setCachedResults(JSON.parse(stored));
    } catch {}
  };

  const cacheResult = (result: any, imagePreview?: string) => {
    const entry: CachedDetection = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      result,
      imagePreview: imagePreview?.substring(0, 500), // Store small preview
    };

    const updated = [entry, ...cachedResults].slice(0, MAX_CACHE);
    setCachedResults(updated);
    localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
  };

  const clearCache = () => {
    setCachedResults([]);
    localStorage.removeItem(CACHE_KEY);
  };

  const removeFromCache = (id: string) => {
    const updated = cachedResults.filter(r => r.id !== id);
    setCachedResults(updated);
    localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
  };

  return { cachedResults, cacheResult, clearCache, removeFromCache, isOffline: !navigator.onLine };
};
