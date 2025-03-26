import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
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

/**
 * Individual Toast Component
 */
const Toast: React.FC<ToastProps> = memo(({ id, message, type, duration = 4000, onClose, index = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progressWidth, setProgressWidth] = useState(100);
  const [isHovered, setIsHovered] = useState(false);
  
  // Get style settings based on type - combined for better performance
  const styles = useMemo(() => {
    switch(type) {
      case 'success':
        return {
          icon: <FaCheck className="h-5 w-5" />,
          iconColor: 'text-green-400',
          accentColor: 'from-green-500 to-green-400',
          bgGlow: 'shadow-success',
          ringColor: 'ring-green-500/20',
          dotColor: 'bg-green-400'
        };
      case 'error':
        return {
          icon: <FaTimes className="h-5 w-5" />,
          iconColor: 'text-red-400',
          accentColor: 'from-red-500 to-red-400',
          bgGlow: 'shadow-error',
          ringColor: 'ring-red-500/20',
          dotColor: 'bg-red-400'
        };
      case 'warning':
        return {
          icon: <FaExclamationTriangle className="h-5 w-5" />,
          iconColor: 'text-amber-400',
          accentColor: 'from-amber-500 to-amber-400',
          bgGlow: 'shadow-warning',
          ringColor: 'ring-amber-500/20',
          dotColor: 'bg-amber-400'
        };
      case 'info':
        return {
          icon: <FaInfoCircle className="h-5 w-5" />,
          iconColor: 'text-blue-400',
          accentColor: 'from-blue-500 to-blue-400',
          bgGlow: 'shadow-info',
          ringColor: 'ring-blue-500/20',
          dotColor: 'bg-blue-400'
        };
      case 'favorite':
        return {
          icon: <FaStar className="h-5 w-5" />,
          iconColor: 'text-purple-400',
          accentColor: 'from-purple-500 to-purple-400',
          bgGlow: 'shadow-favorite',
          ringColor: 'ring-purple-500/20',
          dotColor: 'bg-purple-400'
        };
      default:
        return {
          icon: <FaInfoCircle className="h-5 w-5" />,
          iconColor: 'text-blue-400',
          accentColor: 'from-blue-500 to-blue-400',
          bgGlow: 'shadow-info',
          ringColor: 'ring-blue-500/20',
          dotColor: 'bg-blue-400'
        };
    }
  }, [type]);
  
  // Close toast with animation
  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 400);
  }, [id, onClose]);
  
  // Handle automatic timeout with RAF for smooth progress bar
  useEffect(() => {
    // Small delay before showing for staggered effect when multiple toasts appear
    const showDelay = Math.min(index * 150, 600); // Cap delay for many toasts
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, showDelay);
    
    // Progress bar animation
    const startTime = Date.now() + showDelay;
    const endTime = startTime + duration;
    
    let animationFrame: number;
    
    const updateProgress = () => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      const percent = (remaining / duration) * 100;
      
      setProgressWidth(percent);
      
      if (percent > 0) {
        animationFrame = requestAnimationFrame(updateProgress);
      } else if (percent <= 0) {
        handleClose();
      }
    };
    
    animationFrame = requestAnimationFrame(updateProgress);
    const timer = setTimeout(handleClose, duration + showDelay);
    
    // Cleanup function
    return () => {
      clearTimeout(timer);
      clearTimeout(showTimer);
      cancelAnimationFrame(animationFrame);
    };
  }, [duration, handleClose, index, id]);
  
  // Dynamic styles based on hover state
  const boxShadowStyle = isHovered 
    ? '0 15px 30px rgba(0, 0, 0, 0.25), 0 0 20px rgba(0, 0, 0, 0.15)' 
    : '0 10px 25px rgba(0, 0, 0, 0.2), 0 0 15px rgba(0, 0, 0, 0.1)';
    
  const accentWidth = isHovered ? '3px' : '2px';
  
  // Toast class computation
  const toastClasses = `
    transform transition-all duration-400 ease-out
    ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}
    w-full bg-gray-800/90 shadow-2xl ${styles.bgGlow}
    backdrop-blur-md backdrop-saturate-150
    rounded-lg flex items-center justify-between overflow-hidden
    border-t border-l border-gray-700/30 border-r-0 border-b-0
    relative ring-1 ring-gray-700/50 ${styles.ringColor}
    ${isHovered ? 'translate-x-[-5px]' : ''}
  `;
  
  // Icon container classes
  const iconContainerClasses = `flex-shrink-0 ${styles.iconColor} p-2.5 rounded-full 
    bg-gray-700/60 backdrop-blur-md border border-gray-600/40 mr-4
    shadow-inner transform transition-transform duration-300
    ${isHovered ? 'scale-110 rotate-[-5deg]' : 'scale-100 rotate-0'}`;
    
  return (
    <div
      className={toastClasses}
      style={{
        boxShadow: boxShadowStyle,
        maxWidth: '380px',
        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }}
      role="alert"
      aria-atomic="true"
      aria-live="assertive"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Accent gradient on left with animated thickness on hover */}
      <div 
        className={`absolute left-0 top-0 bottom-0 bg-gradient-to-b ${styles.accentColor} transition-all duration-300 ease-out`}
        style={{ width: accentWidth }}
      ></div>
      
      {/* Progress bar at bottom with gradient and blur */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gray-700/50 overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${styles.accentColor}`} 
          style={{ 
            width: `${progressWidth}%`, 
            transition: 'width linear',
            filter: 'blur(0.5px)'
          }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressWidth}
        ></div>
      </div>
      
      <div className="flex items-center py-4 px-6 flex-grow">
        <div className={iconContainerClasses}>
          {styles.icon}
        </div>
        <p className="text-[13px] font-medium text-white/90 tracking-wide leading-tight line-clamp-3">{message}</p>
      </div>
      
      <div className="pr-3 pl-1 h-full">
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-white transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-blue-500/60
                    p-2 hover:bg-gray-700/70 rounded-full
                    transform hover:scale-110 active:scale-95 hover:rotate-90"
          aria-label="Close notification"
        >
          <FaTimes className="h-3 w-3" />
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

// Create a direct DOM element for toasts
let toastRoot: HTMLElement | null = null;

// Create or get the toast container in the DOM
const getToastRoot = () => {
  if (typeof document === 'undefined') return null;
  
  if (toastRoot) return toastRoot;
  
  toastRoot = document.getElementById('toast-root');
  
  if (!toastRoot) {
    toastRoot = document.createElement('div');
    toastRoot.id = 'toast-root';
    
    // Add the animation keyframes for effects
    const style = document.createElement('style');
    style.textContent = `
      @keyframes ping-slow {
        0% { transform: scale(0.95); opacity: 1; }
        50% { transform: scale(1.2); opacity: 0.5; }
        100% { transform: scale(0.95); opacity: 1; }
      }
      .animate-ping-slow {
        animation: ping-slow 3s infinite cubic-bezier(0.4, 0, 0.6, 1);
      }
      .shadow-success {
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2), 0 0 15px rgba(74, 222, 128, 0.1);
      }
      .shadow-error {
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2), 0 0 15px rgba(248, 113, 113, 0.1);
      }
      .shadow-warning {
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2), 0 0 15px rgba(251, 191, 36, 0.1);
      }
      .shadow-info {
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2), 0 0 15px rgba(96, 165, 250, 0.1);
      }
      .shadow-favorite {
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2), 0 0 15px rgba(192, 132, 252, 0.1);
      }
      .line-clamp-3 {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(toastRoot);
  }
  
  return toastRoot;
};

export const ToastContainer: React.FC<ToastContainerProps> = memo(({ toasts, onRemoveToast }) => {
  const container = getToastRoot();
  
  if (!container) return null;
  
  return createPortal(
    <div
      aria-live="polite"
      className="fixed bottom-0 right-0 flex flex-col items-end pb-8 pr-8 z-[500] max-w-sm w-full pointer-events-none"
    >
      <div className="space-y-3 w-full">
        {toasts.length > 0 ? (
          toasts.map((toast, index) => (
            <div key={toast.id} className="pointer-events-auto transform transition-all duration-300 hover:translate-y-[-2px]">
              <Toast
                id={toast.id}
                message={toast.message}
                type={toast.type}
                duration={toast.duration}
                onClose={onRemoveToast}
                index={index}
              />
            </div>
          ))
        ) : null}
      </div>
    </div>,
    container
  );
});

ToastContainer.displayName = 'ToastContainer';

export default Toast; 