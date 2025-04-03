import React from 'react';

interface AvatarProps {
  username?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * Text-only Avatar component that displays username initial
 */
const Avatar: React.FC<AvatarProps> = ({
  username = 'User',
  size = 'md',
  className = '',
}) => {
  // Define sizes
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl',
  };

  const sizeClass = sizeClasses[size];
  
  // Get first letter of username
  const initial = username.charAt(0).toUpperCase();
  
  return (
    <div className={`${sizeClass} flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold ${className}`}>
      {initial}
    </div>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default React.memo(Avatar); 