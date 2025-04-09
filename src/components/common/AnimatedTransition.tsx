import React, { useState, useEffect, useRef, ReactNode } from 'react';

// Animation types supported by the component
type AnimationType = 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale' | 'zoom' | 'none';

// Animation timing functions
type TimingFunction = 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear' | 'spring';

interface AnimatedTransitionProps {
  children: ReactNode;
  show: boolean;
  type?: AnimationType;
  duration?: number;
  delay?: number;
  timingFunction?: TimingFunction;
  className?: string;
  onExited?: () => void;
  disabled?: boolean;
}

const AnimatedTransition: React.FC<AnimatedTransitionProps> = ({
  children,
  show,
  type = 'fade',
  duration = 300,
  delay = 0,
  timingFunction = 'ease',
  className = '',
  onExited,
  disabled = false,
}) => {
  const [shouldRender, setShouldRender] = useState(show);
  const [animationClass, setAnimationClass] = useState(show ? 'enter' : 'exit');
  const timeoutRef = useRef<number | null>(null);

  // Clear any existing timeouts
  const clearTimeouts = () => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Simple animation timing functions
  const timingFunctionMap: Record<TimingFunction, string> = {
    'ease': 'ease',
    'ease-in': 'cubic-bezier(0.42, 0, 1, 1)',
    'ease-out': 'cubic-bezier(0, 0, 0.58, 1)',
    'ease-in-out': 'cubic-bezier(0.42, 0, 0.58, 1)',
    'linear': 'linear',
    'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  };

  useEffect(() => {
    // Handle immediate rendering for disabled animations
    if (disabled || type === 'none') {
      setShouldRender(show);
      setAnimationClass(show ? 'enter' : 'exit');
      return;
    }

    if (show) {
      // Show the component
      setShouldRender(true);
      
      // Force a browser reflow before changing animation class
      setTimeout(() => {
        setAnimationClass('enter');
      }, 10);
    } else {
      // Start exit animation
      setAnimationClass('exit');
      
      // Remove component after animation completes
      clearTimeouts();
      timeoutRef.current = window.setTimeout(() => {
        setShouldRender(false);
        if (onExited) onExited();
      }, duration + delay + 50); // Extra buffer to ensure animation completes
    }

    return clearTimeouts;
  }, [show, duration, delay, onExited, disabled, type]);

  if (!shouldRender && !show) {
    return null;
  }

  // Get animation styles based on state
  const getStyles = (): React.CSSProperties => {
    if (disabled || type === 'none') {
      return { opacity: show ? 1 : 0 };
    }

    // Create appropriate transforms based on animation type
    let transform = '';
    if (animationClass === 'exit') {
      switch (type) {
        case 'slide-up': transform = 'translateY(20px)'; break;
        case 'slide-down': transform = 'translateY(-20px)'; break;
        case 'slide-left': transform = 'translateX(20px)'; break;
        case 'slide-right': transform = 'translateX(-20px)'; break;
        case 'scale': transform = 'scale(0.95)'; break;
        case 'zoom': transform = 'scale(1.05)'; break;
      }
    }

    return {
      opacity: animationClass === 'enter' ? 1 : 0,
      transform: animationClass === 'enter' ? 'translateY(0) translateX(0) scale(1)' : transform,
      transition: `all ${duration}ms ${timingFunctionMap[timingFunction]} ${delay}ms`,
      willChange: 'opacity, transform',
    };
  };

  return (
    <div
      className={className}
      style={getStyles()}
    >
      {children}
    </div>
  );
};

export default AnimatedTransition; 