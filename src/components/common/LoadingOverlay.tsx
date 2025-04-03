import React from 'react';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  opacity?: number;
}

/**
 * Full-screen loading overlay with customizable message
 * Used for smooth transitions between pages during operations like auth state changes
 */
const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isVisible, 
  message = 'Please wait...', 
  opacity = 0.85 
}) => {
  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 flex flex-col items-center justify-center z-50 transition-all duration-300"
      style={{ 
        backgroundColor: `rgba(255, 255, 255, ${opacity})`,
        backdropFilter: 'blur(4px)'
      }}
    >
      <div className="flex flex-col items-center p-8 rounded-lg">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" 
          role="status"
        />
        <p className="mt-4 text-lg font-medium text-gray-700">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay; 