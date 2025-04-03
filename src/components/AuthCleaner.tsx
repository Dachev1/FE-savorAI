import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Component that runs checks for authentication issues and banned users
 * Doesn't render anything visible
 */
const AuthCleaner: React.FC = () => {
  const location = useLocation();

  // Always use the same number of hooks on every render
  useEffect(() => {
    // Function to clear banned flag when not on sign-in page
    const clearBannedFlag = () => {
      if (location.pathname !== '/signin' && sessionStorage.getItem('account_banned') === 'true') {
        sessionStorage.removeItem('account_banned');
      }
    };
    
    // Call the function
    clearBannedFlag();
    
    // No cleanup needed
    return () => {};
  }, [location.pathname]);

  return null; // This component doesn't render anything visible
};

export default AuthCleaner; 