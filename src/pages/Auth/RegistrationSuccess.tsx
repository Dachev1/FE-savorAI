// src/pages/SignInSignUp/RegistrationSuccess.tsx
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card, PageTransition } from '../../components/common';
import { FiMail, FiArrowRight } from 'react-icons/fi';
import { HiOutlineMailOpen } from 'react-icons/hi';

interface RegistrationData {
  email: string;
  username: string;
}

const RegistrationSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state as { email?: string; username?: string } | null;
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  
  // Use state to store user data
  const [userData, setUserData] = useState<RegistrationData | null>(null);
  
  // On component mount, try to get data from location state or sessionStorage
  useEffect(() => {
    console.log('RegistrationSuccess: Checking data and auth status');
    
    // Redirect authenticated users immediately
    if (isAuthenticated) {
      console.log('User is authenticated, redirecting to recipe generator');
      showToast('Already registered and logged in', 'info');
      const redirectTimer = setTimeout(() => {
        navigate('/recipe/generator', { replace: true });
      }, 0);
      
      // Cleanup function to prevent memory leaks
      return () => clearTimeout(redirectTimer);
    }
    
    // First check if data is in location state
    if (locationState?.email && locationState?.username) {
      console.log('Found registration data in location state');
      const data = {
        email: locationState.email,
        username: locationState.username
      };
      setUserData(data);
      
      // Store in sessionStorage for persistence
      sessionStorage.setItem('registrationData', JSON.stringify(data));
    } else {
      // Try to get from sessionStorage if not in location state
      const storedData = sessionStorage.getItem('registrationData');
      if (storedData) {
        console.log('Found registration data in sessionStorage');
        setUserData(JSON.parse(storedData));
      } else {
        // Only redirect if we have no data from either source
        console.log('No registration data found, redirecting to register');
        showToast('Registration information not found', 'error');
        navigate('/signup', { replace: true });
      }
    }
  }, [isAuthenticated, navigate, showToast, locationState]);
  
  // Clear registration data on unmount
  useEffect(() => {
    return () => {
      // Keep registration data in sessionStorage to allow return to this page
    };
  }, []);
  
  if (!userData) {
    return null; // Or a loading state
  }
  
  return (
    <PageTransition type="fade" duration={300}>
      <div className="w-full min-h-[80vh] flex items-center justify-center px-4 py-12">
        <Card variant="glass" className="w-full max-w-lg">
          <div className="text-center">
            <div className="mx-auto w-20 h-20 flex items-center justify-center bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
              <HiOutlineMailOpen className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Registration Successful!
            </h1>
            
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
              Thanks for joining, {userData.username}!
            </p>
            
            <div className="mt-6 mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex items-start">
                <FiMail className="h-6 w-6 text-blue-500 dark:text-blue-400 mt-1 mr-3 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-200">
                    <strong>Please verify your email address.</strong>
                  </p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    We've sent a verification link to <strong>{userData.email}</strong>. Please check your inbox and spam folder.
                  </p>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              After verification, you'll be able to access all features of SavorAI.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/signin"
                className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Go to Login <FiArrowRight className="ml-2" />
              </Link>
              
              <Link
                to="/"
                className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium rounded-lg transition-colors"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </PageTransition>
  );
};

export default RegistrationSuccess;
