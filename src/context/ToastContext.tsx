import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { ToastContainer, ToastType } from '../components/common/Toast';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, type: ToastType, duration?: number) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

/**
 * ToastProvider Component
 * 
 * Provides a context for managing toast notifications across the application.
 * Includes methods for showing and hiding toast messages.
 */
interface ToastProviderProps {
  children: ReactNode;
}

// Default durations for different toast types
const DEFAULT_DURATION = 5000;
const ERROR_DURATION = 8000;

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isReady, setIsReady] = useState(false);
  
  // Check if document is available (for SSR safety)
  useEffect(() => {
    setIsReady(true);
  }, []);
  
  // Add a new toast
  const showToast = useCallback((message: string, type: ToastType, duration?: number) => {
    if (!message) {
      console.warn('Attempted to show toast with empty message');
      return '';
    }
    
    // Generate a unique ID that includes timestamp to avoid collisions
    const timestamp = new Date().getTime();
    const randomStr = Math.random().toString(36).substring(2, 5);
    const id = `toast-${timestamp}-${randomStr}`;
    
    console.log(`Creating toast: ${id}, message: ${message}, type: ${type}`);
    
    // Set appropriate duration based on type if not explicitly provided
    const finalDuration = duration || (type === 'error' ? ERROR_DURATION : DEFAULT_DURATION);
    
    // Add new toast to the list - use function form to ensure we're working with latest state
    setToasts(prevToasts => {
      const newToasts = [{ id, message, type, duration: finalDuration }, ...prevToasts];
      console.log(`Toast state updated. Current toasts: ${newToasts.length}`);
      return newToasts;
    });
    
    // Auto-remove toast after duration + animation time
    setTimeout(() => {
      console.log(`Auto-removing toast: ${id}`);
      hideToast(id);
    }, finalDuration + 500);
    
    return id;
  }, []);
  
  // Remove a toast by ID
  const hideToast = useCallback((id: string) => {
    console.log(`Hiding toast: ${id}`);
    setToasts(prevToasts => {
      const remaining = prevToasts.filter(toast => toast.id !== id);
      console.log(`After hiding, ${remaining.length} toasts remain`);
      return remaining;
    });
  }, []);
  
  const value = { showToast, hideToast };
  
  return (
    <ToastContext.Provider value={value}>
      {children}
      {isReady && <ToastContainer toasts={toasts} onRemoveToast={hideToast} />}
    </ToastContext.Provider>
  );
};

/**
 * useToast Hook
 * 
 * Custom hook to access the toast context for showing notifications.
 * Usage: const { showToast } = useToast();
 */
export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
};

export default ToastProvider; 