import React, { useState, useCallback, memo, useMemo, useRef, useLayoutEffect, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, LoadingOverlay } from '../../components/common';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';
import api from '../../api/apiService';

interface FormState {
  identifier: string;
  password: string;
}

// Animation constants
const SHAKE_ANIMATION_DURATION = 500;
const MOUNT_ANIMATION_DURATION = 800; // Increased for gentler feel
const CONTENT_DELAY = 150; // Delay content for staggered effect
const ERROR_ANIMATION_DURATION = 600;

const SignIn = memo(() => {
  // Mount animation state
  const [isMounted, setIsMounted] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [elementsVisible, setElementsVisible] = useState(false);
  
  // Form state
  const [formState, setFormState] = useState<FormState>({ 
    identifier: '', 
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [shakeForm, setShakeForm] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showErrors, setShowErrors] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Refs
  const identifierInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  
  // Hooks
  const { signin, logout } = useAuth();
  const toastContext = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Helper function for showing toasts
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration?: number) => {
    if (toastContext) {
      toastContext.showToast(message, type, duration);
    }
  }, [toastContext]);
  
  // Username change detection
  const queryParams = new URLSearchParams(location.search);
  const usernameChanged = sessionStorage.getItem('username_changed') === 'true';
  const newUsername = sessionStorage.getItem('new_username') || '';
  
  // Username change success message
  const [usernameChangeSuccess, setUsernameChangeSuccess] = useState<string | null>(
    sessionStorage.getItem('username_change_success')
  );
  
  const [transitionMessage, setTransitionMessage] = useState<string>('');
  
  // Control the mounting animations with strict timing
  useLayoutEffect(() => {
    // Prevent initial animation jitter
    if (pageRef.current) {
      pageRef.current.style.opacity = '0';
      pageRef.current.style.transform = 'translateY(15px) scale(0.98)';
    }
    
    // Sequential animation phases
    const mountTimer = setTimeout(() => {
      setIsMounted(true);
      
      // Phase 2: Show the card container
      setTimeout(() => {
        setContentVisible(true);
        
        // Phase 3: Animate in the inner content elements
        setTimeout(() => {
          setElementsVisible(true);
        }, 100);
      }, CONTENT_DELAY);
    }, 50);
    
    return () => {
      clearTimeout(mountTimer);
    };
  }, []);

  // Check for username change on mount
  useEffect(() => {
    if (usernameChanged && newUsername) {
      // Set transition message first so it appears immediately
      setTransitionMessage('Preparing login form with your new username...');
      
      // Show toast notification about username change with slight delay
      setTimeout(() => {
        showToast(`Username changed successfully to "${newUsername}". Please log in with your new username.`, 'success', 8000);
        setTransitionMessage(''); // Clear transition message after toast
      }, 500);
      
      // Pre-fill the identifier field with the new username
      setFormState(prev => ({ ...prev, identifier: newUsername }));
      
      // Add a visible success message in the UI
      setServerError(null); // Clear any existing errors
      setValidationErrors({}); // Clear any validation errors
      
      const successMessage = `Your username has been changed to "${newUsername}". Please log in with your new credentials.`;
      setUsernameChangeSuccess(successMessage);
      
      // Store success message in session storage to persist across page refreshes
      sessionStorage.setItem('username_change_success', successMessage);
      
      // Clear the session storage flags
      sessionStorage.removeItem('username_changed');
      sessionStorage.removeItem('new_username');
    }
  }, [usernameChanged, newUsername, showToast]);

  // Clear success message on unmount
  useEffect(() => {
    return () => {
      sessionStorage.removeItem('username_change_success');
    };
  }, []);

  // Basic form validation
  const isFormValid = useMemo(() => 
    Boolean(formState.identifier.trim()) && 
    Boolean(formState.password.trim()),
  [formState.identifier, formState.password]);

  // Display validation errors below form fields
  const renderFieldError = (field: string) => {
    if (validationErrors[field]) {
      return (
        <p className="text-red-500 text-sm mt-1 font-medium">
          {validationErrors[field]}
        </p>
      );
    }
    return null;
  };

  // Apply shake animation to form when there are errors
  const applyShakeAnimation = () => {
    setShakeForm(true);
    setTimeout(() => setShakeForm(false), 820);
  };

  // Consolidated error handler for different error types
  const handleLoginError = useCallback((error: any) => {
    // Clear password for security
    setFormState(prev => ({ ...prev, password: '' }));
    
    // Extract error message and determine error type
    const errorMessage = error.response?.data?.message || error.message || '';
    const isBannedUser = errorMessage.includes('banned');
    
    // Display appropriate error message
    showToast(
      isBannedUser 
        ? 'Your account has been banned. Please contact support for assistance.' 
        : errorMessage || 'Invalid credentials. Please check your username and password.',
      'error', 
      6000
    );
    
    // Shake form and focus on identifier input
    applyShakeAnimation();
    setTimeout(() => identifierInputRef.current?.focus(), 100);
  }, [showToast, applyShakeAnimation]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // Form submission 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    
    // Clear previous errors
    setValidationErrors({});
    setServerError(null);
    
    // Validation
    let hasErrors = false;
    const errors: Record<string, string> = {};
    
    if (!formState.identifier.trim()) {
      errors.identifier = 'Username or email is required';
      hasErrors = true;
    }
    
    if (!formState.password) {
      errors.password = 'Password is required';
      hasErrors = true;
    }
    
    if (hasErrors) {
      setValidationErrors(errors);
      
      // Show a proper error toast
      const errorMessages = Object.values(errors).join('. ');
      showToast(errorMessages, 'error', 5000);
      
      // Visual feedback for error
      applyShakeAnimation();
      
      return; // Stop here and don't submit
    }
    
    // Check if the user is banned before attempting to sign in
    try {
      setIsSubmitting(true);
      setLoading(true);
      
      // First check if the user is banned
      const checkBanResponse = await api.get(`/api/v1/auth/check-status?identifier=${encodeURIComponent(formState.identifier)}`);
      
      if (checkBanResponse.data?.banned) {
        // User is banned, show the banned message and prevent sign-in
        setServerError('Your account has been banned by an administrator. Please contact support for assistance.');
        showToast('Account banned: Access restricted', 'error', 10000);
        sessionStorage.setItem('account_banned', 'true');
        
        // Clear password for security
        setFormState(prev => ({ ...prev, password: '' }));
        
        // Visual feedback for error
        applyShakeAnimation();
        
        setIsSubmitting(false);
        setLoading(false);
        return;
      }
      
      // If not banned, proceed with sign-in
      setLoading(true);
      
      // Call auth context signin method
      const result = await signin(
        formState.identifier,
        formState.password,
        true,  // remember user
        '/'    // redirect to home page after login
      );
      
      if (!result.success) {
        // Clear password field for security
        setFormState(prev => ({ ...prev, password: '' }));
        
        // For errors, show toast and provide visual feedback
        const errorMessage = result.error || 'Authentication failed';
        setServerError(errorMessage);
        
        // Dedicated handling for banned users
        const isBanned = errorMessage.toLowerCase().includes('banned') || 
                         errorMessage.toLowerCase().includes('suspended');
        
        if (isBanned) {
          // Create a more prominent ban notification that persists
          setServerError(`
            Your account has been banned by an administrator. 
            If you believe this is an error, please contact support with your account details.
            All access to your account is restricted until this issue is resolved.
          `);
          
          // Show toast with important styling
          showToast('Account banned: Access restricted', 'error', 10000);
          
          // Add banned session flag for UX consistency
          sessionStorage.setItem('account_banned', 'true');
        } else {
          showToast(errorMessage, 'error', 5000);
        }
        
        // Visual feedback for error
        applyShakeAnimation();
      }
    } catch (error) {
      // Handle unexpected errors
      console.error('Login error:', error);
      setServerError('An unexpected error occurred. Please try again.');
      showToast('An unexpected error occurred. Please try again.', 'error', 5000);
      
      // Clear password for security
      setFormState(prev => ({ ...prev, password: '' }));
      
      // Visual feedback for error
      applyShakeAnimation();
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  // Prevent rendering if authenticated
  if (isAuthenticated) return null;

  // Check if user is banned - either from server error or session storage
  const isUserBanned = 
    (serverError && serverError.toLowerCase().includes('banned')) || 
    sessionStorage.getItem('account_banned') === 'true';

  // Add to useEffect cleanup function
  useEffect(() => {
    return () => {
      // Clear banned status when component unmounts
      sessionStorage.removeItem('account_banned');
      sessionStorage.removeItem('username_change_success');
    };
  }, []);

  return (
    <>
      {/* Loading overlay */}
      <LoadingOverlay 
        isVisible={!!transitionMessage || loading} 
        message={transitionMessage || 'Signing in...'}
      />
      
      <div 
        ref={pageRef}
        className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8"
        style={{
          opacity: isMounted ? 1 : 0,
          transform: isMounted ? 'translateY(0) scale(1)' : 'translateY(15px) scale(0.98)',
          willChange: 'opacity, transform',
          transitionProperty: 'opacity, transform',
          transitionDuration: `${MOUNT_ANIMATION_DURATION}ms`,
          transitionTimingFunction: 'cubic-bezier(0.19, 1, 0.22, 1)' // Expo-like easing for smoothness
        }}
      >
        {contentVisible && (
          <div 
            className="max-w-md w-full space-y-8"
            style={{
              opacity: contentVisible ? 1 : 0,
              transform: contentVisible ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.98)',
              transition: `all ${MOUNT_ANIMATION_DURATION * 0.8}ms cubic-bezier(0.19, 1, 0.22, 1)`,
              willChange: 'opacity, transform'
            }}
          >
            {isUserBanned ? (
              <Card className="p-6 shadow-lg relative">
                <div 
                  className="p-4 bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 rounded-lg border-l-4 border-red-600 dark:border-red-500 shadow-lg"
                >
                  <div className="flex items-start">
                    <svg className="h-10 w-10 mr-3 mt-0.5 flex-shrink-0 text-red-600 dark:text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h1 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-2">
                        Account Banned
                      </h1>
                      <p className="text-base mb-4">
                        Your account has been banned by an administrator. 
                        All access to your account is restricted until this issue is resolved.
                      </p>
                      <div className="mb-6">
                        <h3 className="font-semibold mb-1">What should I do?</h3>
                        <p className="text-sm mb-4">
                          If you believe this is an error, please contact our support team with your account details.
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Link 
                          to="/contact" 
                          className="flex items-center justify-center py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow transition-colors duration-200"
                          onClick={() => {
                            // Clear banned flag when navigating to contact page
                            sessionStorage.removeItem('account_banned');
                          }}
                        >
                          Contact Support
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className={`p-6 shadow-lg relative ${shakeForm ? 'animate-shake' : ''}`}>
                {/* Username change success message */}
                {usernameChangeSuccess && (
                  <div 
                    className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg border-l-4 border-green-500 dark:border-green-700 shadow-sm"
                    style={{
                      animation: 'fadeIn 0.5s ease-out forwards'
                    }}
                  >
                    <div className="flex items-start">
                      <svg className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <p>{usernameChangeSuccess}</p>
                    </div>
                  </div>
                )}
                
                {/* Only show server error if not a ban message */}
                {serverError && !serverError.toLowerCase().includes('banned') && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md text-sm mb-4">
                    {serverError}
                  </div>
                )}
                
                <div 
                  className="text-center"
                  style={{
                    opacity: elementsVisible ? 1 : 0,
                    transform: elementsVisible ? 'translateY(0)' : 'translateY(8px)',
                    transition: `all ${MOUNT_ANIMATION_DURATION * 0.7}ms cubic-bezier(0.19, 1, 0.22, 1) 100ms`,
                    willChange: 'opacity, transform'
                  }}
                >
                  <h2 className="mt-6 text-center text-2xl font-extrabold text-gray-900 dark:text-white">
                    Sign in to your account
                  </h2>
                  <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    Welcome back! Please enter your details.
                  </p>
                </div>
                
                <div className="mt-8">
                  <form 
                    ref={formRef}
                    onSubmit={handleSubmit} 
                    className="space-y-5" 
                    noValidate
                    style={{
                      opacity: elementsVisible ? 1 : 0,
                      transform: elementsVisible ? 'translateY(0)' : 'translateY(8px)',
                      transition: `all ${MOUNT_ANIMATION_DURATION * 0.7}ms cubic-bezier(0.19, 1, 0.22, 1) 200ms`,
                      willChange: 'opacity, transform'
                    }}
                  >
                    
                    <div>
                      <label htmlFor="identifier" className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Username or Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400" aria-hidden="true">
                          <FiMail className="h-5 w-5" />
                        </div>
                        <input
                          ref={identifierInputRef}
                          type="text"
                          name="identifier"
                          id="identifier"
                          value={formState.identifier}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2.5 pl-10 rounded-xl border transition-all border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-200 bg-white dark:bg-gray-800 focus:ring-2 ${validationErrors.identifier ? 'border-red-500' : ''}`}
                          placeholder="username or email@example.com"
                          required
                          autoComplete="username"
                          autoFocus
                        />
                      </div>
                      {renderFieldError('identifier')}
                    </div>
                    
                    <div>
                      <label htmlFor="password" className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400" aria-hidden="true">
                          <FiLock className="h-5 w-5" />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          id="password"
                          value={formState.password}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2.5 pl-10 pr-10 rounded-xl border transition-all border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-200 bg-white dark:bg-gray-800 focus:ring-2 ${validationErrors.password ? 'border-red-500' : ''}`}
                          placeholder="••••••••"
                          required
                          autoComplete="current-password"
                        />
                        <button 
                          type="button" 
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-600"
                          onClick={togglePasswordVisibility}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                        </button>
                      </div>
                      {renderFieldError('password')}
                    </div>
                    
                    <div 
                      className="flex justify-end"
                      style={{
                        opacity: elementsVisible ? 1 : 0,
                        transform: elementsVisible ? 'translateY(0)' : 'translateY(8px)',
                        transition: `all ${MOUNT_ANIMATION_DURATION * 0.7}ms cubic-bezier(0.19, 1, 0.22, 1) 250ms`,
                        willChange: 'opacity, transform'
                      }}
                    >
                      <Link 
                        to="/forgot-password"
                        className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md px-1"
                      >
                        Forgot your password?
                      </Link>
                    </div>
                    
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm 
                          hover:shadow-md transition-all flex justify-center items-center 
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                          ${loading ? 'opacity-70 cursor-not-allowed' : 'transform hover:-translate-y-0.5'}`}
                        aria-busy={loading}
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Signing in...
                          </>
                        ) : 'Sign In'}
                      </button>
                    </div>
                    
                    <div 
                      className="text-center mt-4"
                      style={{
                        opacity: elementsVisible ? 1 : 0,
                        transform: elementsVisible ? 'translateY(0)' : 'translateY(8px)',
                        transition: `all ${MOUNT_ANIMATION_DURATION * 0.7}ms cubic-bezier(0.19, 1, 0.22, 1) 300ms`,
                        willChange: 'opacity, transform'
                      }}
                    >
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Don't have an account?{' '}
                        <Link 
                          to="/signup" 
                          className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md px-1"
                        >
                          Sign up
                        </Link>
                      </p>
                    </div>
                  </form>
                </div>
                
                {/* Add style for the error animation */}
                <style>{`
                  @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                  }
                  
                  @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                  }
                  
                  @keyframes pulseAlert {
                    0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                  }
                  
                  .animate-shake {
                    animation: shake ${ERROR_ANIMATION_DURATION / 1000}s cubic-bezier(.36,.07,.19,.97) both;
                  }
                  
                  .error-highlight input {
                    border-color: #ef4444;
                    box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.25);
                  }
                `}</style>
              </Card>
            )}
          </div>
        )}
      </div>
    </>
  );
});

// Add display name for debugging
SignIn.displayName = 'SignIn';

export default SignIn;
