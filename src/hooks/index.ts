// Export all hooks from a single file for convenience and performance

export { useImageOptimization } from './useImageOptimization';
export { 
  usePerformanceOptimization,
  useDebounce,
  useThrottle, 
  useRenderPerformance,
  useLazyMemo,
  useConnectionQuality
} from './usePerformanceOptimization';

// Re-export all hooks from the context folder for convenience
export { useAuth } from '../context/AuthContext';
export { useDarkMode } from '../context/ThemeContext';
export { useToast } from '../context/ToastContext';

// Add other hook exports here as needed
export { useAOS } from './useAOS'; 