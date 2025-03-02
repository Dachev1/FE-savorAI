import React from 'react';

type SpinnerSize = 'small' | 'medium' | 'large';
type SpinnerVariant = 'primary' | 'light' | 'dark';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  className?: string;
  message?: string;
}

/**
 * Enhanced LoadingSpinner Component
 * 
 * A customizable loading spinner with Apple-inspired design and smooth animations.
 * Supports different sizes, color variants, and an optional loading message.
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  variant = 'primary',
  className = '',
  message,
}) => {
  // Size mapping for the spinner
  const sizeClasses = {
    small: 'w-5 h-5',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  // Color variants for the spinner
  const variantClasses = {
    primary: 'text-accent',
    light: 'text-white',
    dark: 'text-dark',
  };

  // Text size based on spinner size
  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        {/* Background circle */}
        <div 
          className={`
            ${sizeClasses[size]} 
            rounded-full 
            ${variant === 'primary' ? 'bg-accent/20' : variant === 'light' ? 'bg-white/20' : 'bg-gray-700/20'}
          `}
        ></div>
        
        {/* Spinner element */}
        <svg
          className={`
            absolute top-0 left-0
            ${sizeClasses[size]} 
            ${variantClasses[variant]} 
            animate-spin
          `}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          data-testid="loading-spinner"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        
        {/* Pulsing dot in the center */}
        <div 
          className={`
            absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
            ${size === 'small' ? 'w-1 h-1' : size === 'medium' ? 'w-1.5 h-1.5' : 'w-2 h-2'} 
            rounded-full 
            ${variantClasses[variant]} 
            animate-pulse
          `}
        ></div>
      </div>
      
      {/* Optional loading message */}
      {message && (
        <p className={`mt-3 ${textSizeClasses[size]} text-secondary dark:text-gray-400 animate-pulse`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner; 