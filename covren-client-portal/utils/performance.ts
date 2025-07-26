// Sovereign Command Center Performance Utilities
// Covren Firm LLC - Production Grade Performance Optimization

import type { PerformanceMetrics } from '../types';

// Performance monitoring
class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    loadTime: 0,
    renderTime: 0,
    apiResponseTime: 0,
    memoryUsage: 0,
    networkRequests: 0,
  };

  private observers: ((metrics: PerformanceMetrics) => void)[] = [];

  startLoadTimer() {
    const startTime = performance.now();
    return () => {
      this.metrics.loadTime = performance.now() - startTime;
      this.notifyObservers();
    };
  }

  startRenderTimer() {
    const startTime = performance.now();
    return () => {
      this.metrics.renderTime = performance.now() - startTime;
      this.notifyObservers();
    };
  }

  startApiTimer() {
    const startTime = performance.now();
    return () => {
      this.metrics.apiResponseTime = performance.now() - startTime;
      this.metrics.networkRequests++;
      this.notifyObservers();
    };
  }

  updateMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    this.notifyObservers();
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  subscribe(callback: (metrics: PerformanceMetrics) => void) {
    this.observers.push(callback);
    return () => {
      const index = this.observers.indexOf(callback);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  private notifyObservers() {
    this.observers.forEach(callback => callback(this.getMetrics()));
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Debouncing utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

// Throttling utility
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Memoization utility
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  resolver?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = resolver ? resolver(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// Lazy loading utility
export function createLazyLoader<T>(
  loader: () => Promise<T>,
  cacheKey?: string
) {
  let cached: T | null = null;
  let loading: Promise<T> | null = null;

  return async (): Promise<T> => {
    if (cached) return cached;
    if (loading) return loading;

    loading = loader().then(result => {
      cached = result;
      loading = null;
      return result;
    });

    return loading;
  };
}

// Intersection Observer for lazy loading
export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
) {
  if (typeof IntersectionObserver === 'undefined') {
    // Fallback for older browsers
    return {
      observe: () => {},
      unobserve: () => {},
      disconnect: () => {},
    };
  }

  return new IntersectionObserver(callback, {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  });
}

// Virtual scrolling utilities
export interface VirtualScrollConfig {
  itemHeight: number;
  containerHeight: number;
  totalItems: number;
  overscan?: number;
}

export interface VirtualScrollResult {
  startIndex: number;
  endIndex: number;
  offsetY: number;
  visibleItems: number[];
}

export function calculateVirtualScroll(
  scrollTop: number,
  config: VirtualScrollConfig
): VirtualScrollResult {
  const { itemHeight, containerHeight, totalItems, overscan = 5 } = config;
  
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const endIndex = Math.min(totalItems - 1, startIndex + visibleCount + overscan * 2);
  
  const offsetY = startIndex * itemHeight;
  const visibleItems = Array.from(
    { length: endIndex - startIndex + 1 },
    (_, i) => startIndex + i
  );

  return {
    startIndex,
    endIndex,
    offsetY,
    visibleItems,
  };
}

// Image optimization
export function createImageOptimizer(options: {
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  maxWidth?: number;
  maxHeight?: number;
} = {}) {
  const { quality = 0.8, format = 'webp', maxWidth, maxHeight } = options;

  return function optimizeImage(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;

        // Resize if needed
        if (maxWidth && width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (maxHeight && height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to optimize image'));
              }
            },
            `image/${format}`,
            quality
          );
        } else {
          reject(new Error('Failed to get canvas context'));
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };
}

// Bundle size optimization
export function createCodeSplitter<T>(
  importFn: () => Promise<T>,
  fallback?: T
) {
  let component: T | null = null;
  let loading: Promise<T> | null = null;

  return {
    load: async (): Promise<T> => {
      if (component) return component;
      if (loading) return loading;

      loading = importFn().then(result => {
        component = result;
        loading = null;
        return result;
      });

      return loading;
    },
    get: (): T | null => component,
    isLoading: (): boolean => loading !== null,
  };
}

// Memory management
export function createMemoryManager() {
  const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  return {
    set: (key: string, data: any, ttl: number = 300000) => {
      cache.set(key, {
        data,
        timestamp: Date.now(),
        ttl,
      });
    },

    get: (key: string) => {
      const item = cache.get(key);
      if (!item) return null;

      if (Date.now() - item.timestamp > item.ttl) {
        cache.delete(key);
        return null;
      }

      return item.data;
    },

    clear: () => cache.clear(),

    cleanup: () => {
      const now = Date.now();
      for (const [key, item] of cache.entries()) {
        if (now - item.timestamp > item.ttl) {
          cache.delete(key);
        }
      }
    },
  };
}

// Network request optimization
export function createRequestOptimizer() {
  const pendingRequests = new Map<string, Promise<any>>();

  return {
    deduplicate: <T>(key: string, request: () => Promise<T>): Promise<T> => {
      if (pendingRequests.has(key)) {
        return pendingRequests.get(key)!;
      }

      const promise = request().finally(() => {
        pendingRequests.delete(key);
      });

      pendingRequests.set(key, promise);
      return promise;
    },

    cancel: (key: string) => {
      pendingRequests.delete(key);
    },

    cancelAll: () => {
      pendingRequests.clear();
    },
  };
}

// Performance monitoring hooks
export function usePerformanceMonitoring() {
  const startTimer = performanceMonitor.startLoadTimer();
  const startRenderTimer = performanceMonitor.startRenderTimer();

  return {
    startLoadTimer: startTimer,
    startRenderTimer: startRenderTimer,
    startApiTimer: performanceMonitor.startApiTimer(),
    updateMemoryUsage: performanceMonitor.updateMemoryUsage.bind(performanceMonitor),
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor),
    subscribe: performanceMonitor.subscribe.bind(performanceMonitor),
  };
}

// Export utilities
export {
  PerformanceMonitor,
  performanceMonitor as default,
}; 