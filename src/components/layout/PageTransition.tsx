import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatedTransition } from '../common';

interface PageTransitionProps {
  children: React.ReactNode;
  defaultAnimation?: 'fade' | 'slide-up' | 'slide-left' | 'none';
  duration?: number;
  className?: string;
  reduceMotion?: boolean;
}

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  defaultAnimation = 'fade',
  duration = 300,
  className = '',
  reduceMotion = false,
}) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('enter');
  const [key, setKey] = useState(location.pathname);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(reduceMotion);
  
  // Track path changes more reliably
  const lastPathRef = useRef(location.pathname);
  const transitionTimeoutRef = useRef<number | null>(null);

  // Detect motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches || reduceMotion);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches || reduceMotion);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [reduceMotion]);

  // Simplified transition logic
  useEffect(() => {
    if (location.pathname === lastPathRef.current) {
      return;
    }
    
    // Clear any pending timeouts
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    
    // Start exit transition
    setTransitionStage('exit');
    lastPathRef.current = location.pathname;
    
    // Set a timeout to ensure the exit completes if animation fails
    transitionTimeoutRef.current = window.setTimeout(() => {
      handleExitComplete();
    }, duration + 100); // Add buffer time
    
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [location, duration]);

  // Handle exit animation completion
  const handleExitComplete = () => {
    // Clear timeout if it exists
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
    
    // Update display location after exit completes
    setDisplayLocation(location);
    setKey(location.pathname);
    setTransitionStage('enter');
    
    // Scroll to top on new page - use auto to avoid smooth scroll jank
    window.scrollTo({ top: 0, behavior: 'auto' });
  };
  
  // Get animation type based on motion preferences
  const getAnimationType = () => {
    if (prefersReducedMotion) return 'none';
    return defaultAnimation;
  };

  // Always render the component but control visibility with animation
  return (
    <AnimatedTransition
      show={transitionStage === 'enter'} 
      type={getAnimationType()}
      duration={prefersReducedMotion ? 50 : duration}
      className={className}
      onExited={handleExitComplete}
      disabled={prefersReducedMotion}
    >
      <div key={key} className="page-content">
        {children}
      </div>
    </AnimatedTransition>
  );
};

export default PageTransition; 