import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FaHeart } from 'react-icons/fa';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'favorite';

export interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

/**
 * Individual Toast Component
 * 
 * Displays a single toast notification with Apple-inspired design and animations.
 */
const Toast: React.FC<ToastProps> = ({ id, message, type, duration = 4000, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Icons for different toast types
  const icons = {
    success: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    error: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
    warning: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    info: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 7a1 1 0 100 2h.01a1 1 0 100-2H10z" clipRule="evenodd" />
      </svg>
    ),
    favorite: (
      <FaHeart className="h-6 w-6" />
    ),
  };
  
  // Color scheme for different toast types
  const colorScheme = {
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
    warning: 'bg-yellow-500 text-dark',
    info: 'bg-blue-600 text-white',
    favorite: 'bg-red-500 text-white',
  };
  
  // Animation timing
  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300); // Wait for exit animation
  }, [id, onClose]);
  
  // Show the toast with animation and set up auto-close timer
  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      handleClose();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, handleClose]);
  
  return (
    <div
      className={`
        transform transition-all duration-300 ease-apple-ease
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
        max-w-lg w-full bg-white dark:bg-gray-800 shadow-xl rounded-xl 
        overflow-hidden pointer-events-auto flex ring-1 ring-black ring-opacity-5
      `}
      role="alert"
      aria-live="assertive"
    >
      <div className={`flex-shrink-0 ${colorScheme[type]} p-4 flex items-center justify-center`}>
        {icons[type]}
      </div>
      
      <div className="flex-1 p-4">
        <p className="text-base font-medium text-gray-900 dark:text-gray-100">{message}</p>
      </div>
      
      <div className="flex border-l border-gray-200 dark:border-gray-700">
        <button
          onClick={handleClose}
          className="w-full border border-transparent rounded-none p-4 flex items-center justify-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <span className="sr-only">Close</span>
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

/**
 * Toast Container Component
 * 
 * Manages multiple toasts with elegant stacking and animations.
 */
interface ToastContainerProps {
  toasts: {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
  }[];
  onRemoveToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemoveToast }) => {
  return createPortal(
    <div
      aria-live="assertive"
      className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50"
    >
      <div className="w-full flex flex-col items-end space-y-4 pr-2 md:pr-4">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={onRemoveToast}
          />
        ))}
      </div>
    </div>,
    document.body
  );
};

export default Toast; 