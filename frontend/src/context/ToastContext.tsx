import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
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

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Add a new toast
  const showToast = useCallback((message: string, type: ToastType, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    // For error messages, use a longer duration by default if not specified
    const finalDuration = type === 'error' && duration === 4000 ? 6000 : duration;
    
    setToasts((prevToasts) => [...prevToasts, { id, message, type, duration: finalDuration }]);
    
    // Auto-remove toast after duration + animation time
    setTimeout(() => {
      hideToast(id);
    }, finalDuration + 500);
    
    return id;
  }, []);
  
  // Remove a toast by ID
  const hideToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);
  
  const value = {
    showToast,
    hideToast,
  };
  
  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemoveToast={hideToast} />
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