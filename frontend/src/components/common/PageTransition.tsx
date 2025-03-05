import React, { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

type TransitionType = 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale';

interface PageTransitionProps {
  children: ReactNode;
  type?: TransitionType;
  duration?: number;
  delay?: number;
  className?: string;
}

/**
 * PageTransition Component
 * 
 * Adds smooth, Apple-inspired transitions when navigating between pages.
 * Can be customized with different transition types, durations, and delays.
 */
const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  type = 'fade',
  duration = 300,
  delay = 0,
  className = '',
}) => {
  const location = useLocation();
  const [transitionStage, setTransitionStage] = useState('fadeIn');
  
  // Only trigger transitions on route change, not on every re-render
  useEffect(() => {
    // When location path changes, trigger the exit animation
    setTransitionStage('fadeOut');
    
    // After the exit animation, update children and trigger enter animation
    const timeout = setTimeout(() => {
      setTransitionStage('fadeIn');
    }, duration);
    
    return () => clearTimeout(timeout);
    
    // Only depend on location.pathname, not children
  }, [location.pathname, duration]);
  
  // Generate the transition styles based on type
  const getTransitionStyles = (stage: string) => {
    const baseStyle = {
      transition: `all ${duration}ms ease-in-out ${delay}ms`,
    };
    
    const fadeStyles = {
      fadeIn: { opacity: 1 },
      fadeOut: { opacity: 0 },
    };
    
    const slideUpStyles = {
      fadeIn: { opacity: 1, transform: 'translateY(0)' },
      fadeOut: { opacity: 0, transform: 'translateY(20px)' },
    };
    
    const slideDownStyles = {
      fadeIn: { opacity: 1, transform: 'translateY(0)' },
      fadeOut: { opacity: 0, transform: 'translateY(-20px)' },
    };
    
    const slideLeftStyles = {
      fadeIn: { opacity: 1, transform: 'translateX(0)' },
      fadeOut: { opacity: 0, transform: 'translateX(20px)' },
    };
    
    const slideRightStyles = {
      fadeIn: { opacity: 1, transform: 'translateX(0)' },
      fadeOut: { opacity: 0, transform: 'translateX(-20px)' },
    };
    
    const scaleStyles = {
      fadeIn: { opacity: 1, transform: 'scale(1)' },
      fadeOut: { opacity: 0, transform: 'scale(0.95)' },
    };
    
    const typeStyles = {
      fade: fadeStyles,
      'slide-up': slideUpStyles,
      'slide-down': slideDownStyles,
      'slide-left': slideLeftStyles,
      'slide-right': slideRightStyles,
      scale: scaleStyles,
    };
    
    return {
      ...baseStyle,
      ...(typeStyles[type] && typeStyles[type][stage as keyof typeof fadeStyles]),
    };
  };
  
  return (
    <div
      className={className}
      style={getTransitionStyles(transitionStage)}
    >
      {children}
    </div>
  );
};

export default PageTransition; 