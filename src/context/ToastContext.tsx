import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ToastContainer, ToastType } from '../components/common/Toast';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type: ToastType, duration?: number) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  // Array of active toasts
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Use a ref to track toast timestamps to prevent duplicates during rapid refreshes
  const toastTimestamps = useRef<Record<string, number>>({});
  // Minimum time between identical toasts in milliseconds
  const TOAST_THROTTLE_TIME = 2000;
  
  // Show toast with duplicate prevention
  const showToast = useCallback((
    message: string, 
    type: ToastType = 'info', 
    duration = 5000,
  ) => {
    // Skip empty messages
    if (!message?.trim()) return;
    
    // Create a unique key for this toast
    const toastKey = `${type}:${message}`;
    
    // Check if this exact message is already showing
    if (toasts.some(toast => `${toast.type}:${toast.message}` === toastKey)) {
      return;
    }
    
    // Check timestamp cache to prevent rapid duplicate toasts
    const now = Date.now();
    const lastShown = toastTimestamps.current[toastKey] || 0;
    
    // If we've shown this toast recently, skip it
    if (now - lastShown < TOAST_THROTTLE_TIME) {
      return;
    }
    
    // Update the timestamp for this toast
    toastTimestamps.current[toastKey] = now;
    
    // Create a new toast
    const newToast: Toast = {
      id: uuidv4(),
      message,
      type,
      duration
    };
    
    // Add toast to the array
    setToasts(prev => [newToast, ...prev]);
  }, [toasts]);
  
  // Remove toast by ID
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);
  
  // Clean up old timestamps periodically to prevent memory leaks
  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = Date.now();
      const updatedTimestamps = { ...toastTimestamps.current };
      
      // Remove timestamps older than 1 minute
      Object.keys(updatedTimestamps).forEach(key => {
        if (now - updatedTimestamps[key] > 60000) {
          delete updatedTimestamps[key];
        }
      });
      
      toastTimestamps.current = updatedTimestamps;
    }, 60000); // Clean up every minute
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Listen for network errors
  useEffect(() => {
    const handleNetworkError = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      showToast(`Network error: ${detail.message || 'Connection failed'}`, 'error');
    };
    
    // Listen for server errors
    const handleServerError = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      showToast(`Server error (${detail.status}). Please try again later.`, 'error');
    };
    
    // Attach event listeners
    window.addEventListener('network-error', handleNetworkError);
    window.addEventListener('server-error', handleServerError);
    
    // Clean up
    return () => {
      window.removeEventListener('network-error', handleNetworkError);
      window.removeEventListener('server-error', handleServerError);
    };
  }, []);
  
  // Listen for toast message events
  useEffect(() => {
    const handleToastMessage = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (detail && detail.message) {
        showToast(detail.message, detail.type || 'info', detail.duration);
      }
    };
    
    window.addEventListener('toast-message', handleToastMessage);
    
    return () => {
      window.removeEventListener('toast-message', handleToastMessage);
    };
  }, [showToast]);
  
  return (
    <ToastContext.Provider value={{ toasts, showToast, hideToast: removeToast }}>
      {children}
      <ToastContainer 
        toasts={toasts}
        onRemoveToast={removeToast}
      />
    </ToastContext.Provider>
  );
};

export default ToastContext; 