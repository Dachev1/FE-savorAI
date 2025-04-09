import React, { useState, useEffect, useCallback, memo, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FaCheck, FaTimes, FaInfoCircle, FaExclamationTriangle, FaStar } from 'react-icons/fa';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'favorite';

export interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  onClose: (id: string) => void;
  index?: number;
}

// Get toast container element
const getToastRoot = (): HTMLElement => {
  let container = document.getElementById('toast-root');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-root';
    document.body.appendChild(container);
  }
  return container;
};

/**
 * Individual Toast Component
 */
const Toast: React.FC<ToastProps> = memo(({ id, message, type, duration = 4000, onClose, index = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progressWidth, setProgressWidth] = useState(100);
  const [isHovered, setIsHovered] = useState(false);
  
  // Timer refs
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const remainingRef = useRef(duration);
  const startTimeRef = useRef(0);
  
  // Get style settings based on type
  const styles = useMemo(() => {
    switch(type) {
      case 'success':
        return {
          icon: <FaCheck className="h-5 w-5" />,
          iconColor: 'text-emerald-500',
          accentColor: 'from-emerald-500 to-green-400',
          bgColor: 'bg-emerald-50 dark:bg-emerald-950/80',
          borderColor: 'border-emerald-200 dark:border-emerald-700'
        };
      case 'error':
        return {
          icon: <FaTimes className="h-5 w-5" />,
          iconColor: 'text-rose-500',
          accentColor: 'from-rose-500 to-pink-500',
          bgColor: 'bg-rose-50 dark:bg-rose-950/80',
          borderColor: 'border-rose-200 dark:border-rose-700'
        };
      case 'warning':
        return {
          icon: <FaExclamationTriangle className="h-5 w-5" />,
          iconColor: 'text-amber-500',
          accentColor: 'from-amber-500 to-yellow-400',
          bgColor: 'bg-amber-50 dark:bg-amber-950/80',
          borderColor: 'border-amber-200 dark:border-amber-700'
        };
      case 'info':
        return {
          icon: <FaInfoCircle className="h-5 w-5" />,
          iconColor: 'text-sky-500',
          accentColor: 'from-sky-500 to-blue-500',
          bgColor: 'bg-sky-50 dark:bg-sky-950/80',
          borderColor: 'border-sky-200 dark:border-sky-700'
        };
      case 'favorite':
        return {
          icon: <FaStar className="h-5 w-5" />,
          iconColor: 'text-purple-500',
          accentColor: 'from-purple-600 to-violet-500',
          bgColor: 'bg-purple-50 dark:bg-purple-950/80',
          borderColor: 'border-purple-200 dark:border-purple-700'
        };
      default:
        return {
          icon: <FaInfoCircle className="h-5 w-5" />,
          iconColor: 'text-sky-500',
          accentColor: 'from-sky-500 to-blue-500',
          bgColor: 'bg-sky-50 dark:bg-sky-950/80',
          borderColor: 'border-sky-200 dark:border-sky-700'
        };
    }
  }, [type]);
  
  // Close toast with animation
  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300);
  }, [id, onClose]);
  
  // Start/restart timer
  const startTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(handleClose, remainingRef.current);
    
    // Update progress every 30ms (more efficient than 10ms)
    intervalRef.current = setInterval(() => {
      if (isHovered) return;
      
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, remainingRef.current - elapsed);
      const percent = (remaining / duration) * 100;
      
      setProgressWidth(percent);
      
      if (percent <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 30);
  }, [duration, handleClose, isHovered]);
  
  // Pause timer
  const pauseTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    const elapsed = Date.now() - startTimeRef.current;
    remainingRef.current = Math.max(0, remainingRef.current - elapsed);
  }, []);
  
  // Initialize toast
  useEffect(() => {
    const showDelay = Math.min(index * 80, 300);
    const showTimer = setTimeout(() => {
      setIsVisible(true);
      startTimer();
    }, showDelay);
    
    return () => {
      clearTimeout(showTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [index, startTimer]);
  
  // Handle hover state
  useEffect(() => {
    if (isHovered) {
      pauseTimer();
    } else if (startTimeRef.current > 0) {
      startTimer();
    }
  }, [isHovered, pauseTimer, startTimer]);
  
  return (
    <div
      className={`
        transform transition-all duration-300 ease-out
        ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}
        w-full bg-white dark:bg-gray-900 backdrop-blur-md
        rounded-lg overflow-hidden shadow-md ${styles.bgColor}
        ${isHovered ? 'translate-x-[-4px] scale-[1.02]' : ''}
        border ${styles.borderColor}
      `}
      role="alert"
      aria-live="assertive"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        maxWidth: '380px',
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}
    >
      <div className="flex items-start">
        <div className={`flex-shrink-0 flex items-center justify-center h-full px-4 py-4 ${styles.iconColor} bg-opacity-10 dark:bg-opacity-30 bg-${styles.iconColor.replace('text-', '')}`}>
          <div className={`rounded-full p-2 bg-${styles.iconColor.replace('text-', '')}/10 dark:bg-${styles.iconColor.replace('text-', '')}/30 ${type === 'favorite' ? 'animate-heartbeat' : isHovered ? 'animate-pulse' : ''}`}>
            {styles.icon}
          </div>
        </div>
        
        <div className="flex-1 py-4 pr-2">
          <p className="text-[14px] font-semibold text-gray-800 dark:text-white tracking-wide leading-snug line-clamp-3">{message}</p>
          
          <div className="h-1 w-full bg-gray-100 dark:bg-gray-800 mt-3 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${styles.accentColor} rounded-full`} 
              style={{ 
                width: `${progressWidth}%`, 
                transition: 'width 0.1s linear',
              }}
            />
          </div>
        </div>
        
        <button
          onClick={handleClose}
          className="p-2 mt-2 mr-2 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors duration-200
                    focus:outline-none focus:ring-2 focus:ring-blue-500/60 rounded-full"
          aria-label="Close notification"
        >
          <FaTimes className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
});

Toast.displayName = 'Toast';

/**
 * Toast Container Component
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

export const ToastContainer: React.FC<ToastContainerProps> = memo(({ toasts, onRemoveToast }) => {
  const container = getToastRoot();
  
  if (!container) return null;
  
  return createPortal(
    <div
      aria-live="polite"
      className="fixed top-0 right-0 flex flex-col items-end pt-20 pr-6 z-[500] max-w-sm w-full pointer-events-none"
    >
      <div className="space-y-3 w-full">
        {toasts.length > 0 && toasts.map((toast, index) => (
          <div 
            key={toast.id} 
            className="pointer-events-auto transform transition-all duration-300 animate-fade-in-up"
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            <Toast
              id={toast.id}
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={onRemoveToast}
              index={index}
            />
          </div>
        ))}
      </div>
    </div>,
    container
  );
});

ToastContainer.displayName = 'ToastContainer';

export default Toast; 