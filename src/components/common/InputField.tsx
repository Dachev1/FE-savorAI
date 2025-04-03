import React, { useState, memo } from 'react';
import { FiAlertCircle, FiCheckCircle, FiEye, FiEyeOff, FiInfo } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

// Input field props interface
interface InputFieldProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  placeholder?: string;
  error?: string | null;
  success?: boolean;
  disabled?: boolean;
  showPasswordToggle?: boolean;
  hint?: string;
  allowEmpty?: boolean; // New prop to control if empty values are allowed
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

// Input field component with enhanced handling for empty values
const InputField: React.FC<InputFieldProps> = memo(({ 
  id, 
  label, 
  type, 
  value, 
  onChange, 
  icon, 
  placeholder, 
  error, 
  success = false,
  disabled = false,
  showPasswordToggle = false,
  hint,
  allowEmpty = true,
  onBlur
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputType = showPasswordToggle && showPassword ? 'text' : type;

  // Handle focus state
  const handleFocus = () => setIsFocused(true);
  
  // Handle blur with validation
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    // Call parent onBlur if provided
    if (onBlur) {
      onBlur(e);
    }
  };

  return (
    <div className="mb-5">
      <label 
        htmlFor={id} 
        className={`inline-block text-sm font-medium mb-2 transition-colors duration-200
          ${isFocused ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}
      >
        {label}
      </label>
      <div className={`relative transition-all duration-300 ${isFocused ? 'transform -translate-y-1' : ''}`}>
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`block w-full text-base rounded-xl shadow-sm transition-all duration-200 
            ${isFocused ? 'ring-2 ring-blue-200 dark:ring-blue-900' : ''}
            ${disabled ? 'bg-gray-50 cursor-not-allowed text-gray-500' : 'bg-white dark:bg-gray-800/80'} 
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-300/30 dark:border-red-800' 
              : success 
                ? 'border-green-300 focus:border-green-500 focus:ring-green-300/30 dark:border-green-800'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-300/30 dark:border-gray-700'
            }
            ${icon ? 'pl-11' : 'pl-4'}
            py-3 dark:text-gray-200
            backdrop-blur-sm
            ${isFocused ? 'shadow-lg' : 'shadow-sm'}`}
        />
        {icon && (
          <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${isFocused ? 'text-blue-500' : 'text-gray-400'}`}>
            {icon}
          </div>
        )}
        {success && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2"
          >
            <FiCheckCircle className="w-5 h-5 text-green-500" />
          </motion.div>
        )}
        {error && !disabled && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2"
          >
            <FiAlertCircle className="w-5 h-5 text-red-500" />
          </motion.div>
        )}
        {showPasswordToggle && !error && !success && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors duration-200"
          >
            {showPassword ? <FiEyeOff className="w-5 h-5 text-gray-500" /> : <FiEye className="w-5 h-5 text-gray-500" />}
          </button>
        )}
      </div>
      <AnimatePresence>
        {error && !disabled && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center"
          >
            <FiAlertCircle className="mr-1.5 flex-shrink-0" /> <span>{error}</span>
          </motion.p>
        )}
      </AnimatePresence>
      {hint && !error && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
          <FiInfo className="mr-1.5 flex-shrink-0 text-blue-500" /> {hint}
        </p>
      )}
    </div>
  );
});

InputField.displayName = 'InputField';

export default InputField; 