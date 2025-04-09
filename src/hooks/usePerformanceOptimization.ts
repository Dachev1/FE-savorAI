import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

/**
 * Custom hook for debouncing values
 * Useful for search inputs, form validation, etc.
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for throttling functions
 * Useful for scroll/resize events, drag operations, etc.
 */
export function useThrottle<T extends (...args: any[]) => any>(
  func: T,
  delay: number = 200
): (...args: Parameters<T>) => void {
  const lastCall = useRef<number>(0);
  const timeout = useRef<number | null>(null);
  const lastArgs = useRef<Parameters<T> | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCall.current;

      lastArgs.current = args;

      if (timeSinceLastCall >= delay) {
        lastCall.current = now;
        func(...args);
      } else {
        if (timeout.current) {
          clearTimeout(timeout.current);
        }

        timeout.current = window.setTimeout(() => {
          lastCall.current = Date.now();
          if (lastArgs.current) {
            func(...lastArgs.current);
          }
          timeout.current = null;
        }, delay - timeSinceLastCall);
      }
    },
    [func, delay]
  );
}

/**
 * Custom hook for measuring render performance
 * Useful for detecting slow components and optimizing them
 */
export function useRenderPerformance(
  componentName: string,
  thresholdMs: number = 5
): void {
  const renderStart = useRef<number>(0);

  useEffect(() => {
    const isDevelopment = import.meta.env.DEV;
    if (isDevelopment) {
      renderStart.current = performance.now();

      return () => {
        const renderEnd = performance.now();
        const renderTime = renderEnd - renderStart.current;
        
        if (renderTime > thresholdMs) {
          console.warn(`[Performance] ${componentName} took ${renderTime.toFixed(2)}ms to render`);
        }
      };
    }
  });
}

/**
 * Custom hook for lazy loading and memoizing expensive resources
 * Useful for preventing recalculation of complex data or loading large datasets
 */
export function useLazyMemo<T>(
  factory: () => T,
  deps: React.DependencyList = [],
  options: { lazy?: boolean } = {}
): T {
  const { lazy = false } = options;
  const valueRef = useRef<{ value: T | null; initialized: boolean }>({
    value: null,
    initialized: false,
  });

  return useMemo(() => {
    if (!valueRef.current.initialized || !lazy) {
      valueRef.current.value = factory();
      valueRef.current.initialized = true;
    }
    return valueRef.current.value as T;
  }, deps);
}

/**
 * Custom hook for optimizing resource loading based on network connection
 * Useful for adjusting image quality, animation complexity, etc.
 */
export function useConnectionQuality() {
  const [connectionQuality, setConnectionQuality] = useState<'slow' | 'medium' | 'fast'>('medium');
  const [isLowBandwidth, setIsLowBandwidth] = useState(false);
  const [saveData, setSaveData] = useState(false);

  useEffect(() => {
    // Handle network information if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      const updateConnectionQuality = () => {
        if (!connection) return;
        
        // Get connection type
        const effectiveType = connection.effectiveType || '4g';
        
        // Determine quality based on connection type
        let quality: 'slow' | 'medium' | 'fast' = 'medium';
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
          quality = 'slow';
        } else if (effectiveType === '3g') {
          quality = 'medium';
        } else if (effectiveType === '4g') {
          quality = 'fast';
        }
        
        setConnectionQuality(quality);
        
        // Check if save-data is enabled
        const saveDataEnabled = connection.saveData === true;
        setSaveData(saveDataEnabled);
        
        // Check if connection is considered low bandwidth
        const isLow = quality === 'slow' || saveDataEnabled;
        setIsLowBandwidth(isLow);
      };
      
      // Initial update
      updateConnectionQuality();
      
      // Listen for changes
      if (connection.addEventListener) {
        connection.addEventListener('change', updateConnectionQuality);
        return () => {
          connection.removeEventListener('change', updateConnectionQuality);
        };
      }
    }
  }, []);
  
  return {
    connectionQuality,
    isLowBandwidth,
    saveData
  };
}

/**
 * Main hook that provides a suite of performance optimization utilities
 */
export function usePerformanceOptimization() {
  const connection = useConnectionQuality();
  
  // Memory for caching expensive computations
  const cache = useRef<Map<string, any>>(new Map());
  
  // Method to cache expensive computations
  const memoize = useCallback(<T>(key: string, computation: () => T, ttl?: number): T => {
    const cached = cache.current.get(key);
    
    if (cached && (!ttl || Date.now() - cached.timestamp < ttl)) {
      return cached.value;
    }
    
    const value = computation();
    cache.current.set(key, { value, timestamp: Date.now() });
    return value;
  }, []);
  
  // Method to clear the cache
  const clearCache = useCallback((key?: string) => {
    if (key) {
      cache.current.delete(key);
    } else {
      cache.current.clear();
    }
  }, []);
  
  return {
    connection,
    memoize,
    clearCache,
    debounce: useDebounce,
    throttle: useThrottle,
  };
} 