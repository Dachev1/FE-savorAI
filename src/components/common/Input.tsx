import React, { InputHTMLAttributes, forwardRef, useState } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  fullWidth?: boolean;
  variant?: 'default' | 'filled' | 'outlined';
  className?: string;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
  helperClassName?: string;
}

/**
 * Enhanced Input Component
 * 
 * An Apple-inspired input field with support for labels, icons, error messages,
 * and different style variants. Includes subtle animations and focus effects.
 */
const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const {
    label,
    error,
    helperText,
    startIcon,
    endIcon,
    fullWidth = false,
    variant = 'default',
    className = '',
    containerClassName = '',
    labelClassName = '',
    inputClassName = '',
    errorClassName = '',
    helperClassName = '',
    id,
    onFocus,
    onBlur,
    ...rest
  } = props;

  const [isFocused, setIsFocused] = useState(false);

  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  // Shared base classes
  const baseInputClasses = [
    'w-full px-4 py-2.5 rounded-xl',
    'transition-all duration-300 ease-apple-ease',
    'focus:outline-none',
    'disabled:opacity-60 disabled:cursor-not-allowed',
    'placeholder:text-gray-400 dark:placeholder:text-gray-500',
    startIcon ? 'pl-10' : '',
    endIcon ? 'pr-10' : '',
    inputClassName
  ].filter(Boolean).join(' ');

  // Container classes
  const containerClasses = [
    'flex flex-col',
    fullWidth ? 'w-full' : '',
    containerClassName
  ].filter(Boolean).join(' ');

  // Variant-specific classes
  const variantClasses = {
    default: `border ${error ? 'border-error' : isFocused ? 'border-accent' : 'border-gray-200 dark:border-gray-700'} 
              bg-white dark:bg-gray-800 text-dark dark:text-light
              focus:border-accent dark:focus:border-accent focus:ring-2 focus:ring-accent/20 dark:focus:ring-accent/20`,
    
    filled: `border-b-2 rounded-t-xl rounded-b-none px-4 pt-4 pb-2 
            ${error ? 'border-error' : isFocused ? 'border-accent' : 'border-gray-200 dark:border-gray-700'}
            bg-gray-50 dark:bg-gray-900 text-dark dark:text-light 
            focus:border-accent dark:focus:border-accent`,
            
    outlined: `border-2 ${error ? 'border-error' : isFocused ? 'border-accent' : 'border-gray-300 dark:border-gray-600'} 
              bg-transparent text-dark dark:text-light
              focus:border-accent dark:focus:border-accent focus:ring-1 focus:ring-accent/10 dark:focus:ring-accent/10`
  }[variant];

  // Combined input classes
  const inputClasses = `${baseInputClasses} ${variantClasses} ${className}`;

  // Label classes
  const labelClasses = [
    'block mb-1.5 text-sm font-medium',
    error ? 'text-error' : 'text-secondary-dark dark:text-gray-300',
    labelClassName
  ].filter(Boolean).join(' ');

  // Error message classes
  const errorClasses = [
    'text-sm text-error mt-1',
    errorClassName
  ].filter(Boolean).join(' ');

  // Helper text classes
  const helperClasses = [
    'text-sm text-secondary mt-1',
    helperClassName
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {label && (
        <label htmlFor={inputId} className={labelClasses}>
          {label}
        </label>
      )}
      
      <div className="relative">
        {startIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 dark:text-gray-500">
            {startIcon}
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={inputClasses}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />
        
        {endIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 dark:text-gray-500">
            {endIcon}
          </div>
        )}
      </div>
      
      {error && (
        <p id={`${inputId}-error`} className={errorClasses} role="alert">
          {error}
        </p>
      )}
      
      {!error && helperText && (
        <p id={`${inputId}-helper`} className={helperClasses}>
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input; 