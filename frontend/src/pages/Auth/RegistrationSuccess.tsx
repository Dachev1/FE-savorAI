// src/pages/SignInSignUp/RegistrationSuccess.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button, Card, PageTransition } from '../../components/common';
import { FiCheckCircle, FiHome, FiLogIn } from 'react-icons/fi';

const RegistrationSuccess: React.FC = () => {
  const location = useLocation() as { state: { username?: string; email?: string; fullName?: string } };
  
  // Use fullName if available, then username, then extract name from email, or default to "there"
  const getName = () => {
    if (location.state?.fullName) return location.state.fullName;
    if (location.state?.username) return location.state.username;
    if (location.state?.email) {
      const emailName = location.state.email.split('@')[0];
      // Capitalize and remove numbers, special chars for more natural greeting
      return emailName
        .replace(/[0-9_\-.]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
        .trim() || 'there';
    }
    return 'there';
  };

  const displayName = getName();

  return (
    <PageTransition type="scale" duration={400}>
      <div className="w-full min-h-[80vh] flex items-center justify-center px-4 py-12">
        {/* Colorful floating shapes */}
        <div className="absolute overflow-hidden w-full h-full max-w-6xl mx-auto pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-green-200 dark:bg-green-900/30 rounded-full mix-blend-multiply dark:mix-blend-soft-light blur-xl opacity-70 dark:opacity-30 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-blue-200 dark:bg-blue-900/30 rounded-full mix-blend-multiply dark:mix-blend-soft-light blur-xl opacity-70 dark:opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-amber-200 dark:bg-amber-900/30 rounded-full mix-blend-multiply dark:mix-blend-soft-light blur-xl opacity-70 dark:opacity-30 animate-blob animation-delay-4000"></div>
        </div>
        
        <Card 
          variant="glass" 
          className="w-full max-w-md z-10 overflow-hidden"
          padding="none"
        >
          <div className="relative p-8 sm:p-10">
            {/* Success gradient */}
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500"></div>
            
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-green-100 dark:bg-green-900/30 animate-bounce-in">
                <FiCheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-700 dark:from-green-400 dark:to-emerald-300 mb-4">
                Registration Successful!
              </h1>
              
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                Welcome, <span className="font-semibold">{displayName}</span>! Your account has been created successfully.
              </p>
              
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                You can now sign in to access all features and start creating amazing recipes.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <Button
                  as="routerLink"
                  to="/login"
                  variant="primary"
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-500 dark:to-emerald-500 hover:from-green-700 hover:to-emerald-700 flex items-center justify-center"
                >
                  <FiLogIn className="mr-2" />
                  Sign In Now
                </Button>
                
                <Button
                  as="routerLink"
                  to="/"
                  variant="secondary"
                  size="lg"
                  className="flex items-center justify-center"
                >
                  <FiHome className="mr-2" />
                  Go to Home
                </Button>
              </div>
              
              <div className="w-full mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Thank you for joining our community of recipe enthusiasts. We're excited to have you on board!
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </PageTransition>
  );
};

export default RegistrationSuccess;
