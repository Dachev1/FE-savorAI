// src/pages/Auth/SignUp.tsx
import React, { useState, useCallback, useMemo, useRef, useEffect, useLayoutEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiXCircle } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';

// Animation constants
const SHAKE_ANIMATION_DURATION = 500;
const MOUNT_ANIMATION_DURATION = 600; // Increased for gentler feel
const CONTENT_DELAY = 150; // Delay content for staggered effect

// Interface for registration error
interface RegistrationError {
  type: 'email' | 'username' | 'password';
  message: string;
  email: string;
  timestamp: number;
}

// Form Input component to reduce rerenders
const FormInput = React.forwardRef<HTMLInputElement, {
  id: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hasError?: boolean;
  placeholder: string;
  icon: React.ElementType;
  errorMessage?: string;
  autoFocus?: boolean;
  autoComplete?: string;
}>(({ 
  id, 
  type, 
  value, 
  onChange, 
  hasError, 
  placeholder, 
  icon: Icon, 
  errorMessage, 
  autoFocus,
  autoComplete 
}, ref) => (
  <div>
    <label htmlFor={id} className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
      {id.charAt(0).toUpperCase() + id.slice(1)}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
        <Icon className="h-5 w-5" />
      </div>
      <input
        id={id}
        ref={ref}
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2.5 pl-10 rounded-xl border ${
          hasError
            ? 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-200' 
            : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-200'
        } bg-white dark:bg-gray-800 focus:ring-2 transition-all`}
        placeholder={placeholder}
        required
        autoFocus={autoFocus}
        autoComplete={autoComplete}
      />
      {hasError && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <FiAlertCircle className="h-5 w-5 text-red-500" />
        </div>
      )}
    </div>
    {hasError && errorMessage && (
      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
        {errorMessage}
      </p>
    )}
  </div>
));

FormInput.displayName = 'FormInput';

// Error banner component
const ErrorBanner = React.memo(({ error, onDismiss }: { 
  error: RegistrationError, 
  onDismiss: () => void 
}) => (
  <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-500 dark:border-red-700 shadow-md">
    <div className="flex items-start">
      <FiAlertCircle className="h-6 w-6 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
      <div className="flex-1">
        <div className="flex justify-between">
          <h3 className="text-md font-bold text-red-800 dark:text-red-300">
            Registration Blocked
          </h3>
          <button 
            onClick={onDismiss}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Dismiss"
          >
            <FiXCircle />
          </button>
        </div>
        <p className="text-sm font-medium text-red-800 dark:text-red-300 mt-1">
          {`This ${error.type} is already ${error.type === 'email' ? 'registered' : 'taken'}`}
        </p>
        <p className="mt-1 text-sm text-red-700 dark:text-red-400">
          {error.message}
        </p>
        
        {/* Type-specific guidance */}
        {error.type === 'username' ? (
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Please choose a different username to continue.
          </p>
        ) : (
          <div className="mt-2 text-sm">
            <p className="text-gray-700 dark:text-gray-300">Options:</p>
            <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-700 dark:text-gray-300">
              <li><Link to="/signin" className="text-blue-600 hover:underline">Sign in</Link> with this email if it's yours</li>
              <li>Use a different email address</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  </div>
));

ErrorBanner.displayName = 'ErrorBanner';

// Background animation component
const AnimatedBackground = React.memo(() => (
  <div className="absolute overflow-hidden w-full h-full max-w-6xl mx-auto pointer-events-none" aria-hidden="true">
    <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-blue-200 dark:bg-blue-900/30 rounded-full mix-blend-multiply dark:mix-blend-soft-light blur-xl opacity-70 dark:opacity-30 animate-blob"></div>
    <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-amber-200 dark:bg-amber-900/30 rounded-full mix-blend-multiply dark:mix-blend-soft-light blur-xl opacity-70 dark:opacity-30 animate-blob animation-delay-2000"></div>
    <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-purple-200 dark:bg-purple-900/30 rounded-full mix-blend-multiply dark:mix-blend-soft-light blur-xl opacity-70 dark:opacity-30 animate-blob animation-delay-4000"></div>
  </div>
));

AnimatedBackground.displayName = 'AnimatedBackground';

/** ------------------------------------------------------------------
 *  Main Component: SignUp
 * ----------------------------------------------------------------- */
const SignUp = () => {
  // Mount animation state
  const [isMounted, setIsMounted] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [elementsVisible, setElementsVisible] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shakeForm, setShakeForm] = useState(false);
  const [registrationError, setRegistrationError] = useState<RegistrationError | null>(null);
  
  // Refs for form elements
  const usernameInputRef = useRef<HTMLInputElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  
  const { signup, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
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
  
  // Check session storage for registration errors on component mount
  useEffect(() => {
    // Only process errors after component is mounted to avoid animation conflicts
    if (!isMounted) return;
    
    const storedError = sessionStorage.getItem('registrationError');
    if (!storedError) return;
    
    try {
      const errorData = JSON.parse(storedError) as RegistrationError;
      if (Date.now() - errorData.timestamp < 60 * 60 * 1000) {
        setRegistrationError(errorData);
        if (errorData.type === 'email') setFormData(prev => ({ ...prev, email: errorData.email }));
      } else {
        sessionStorage.removeItem('registrationError');
      }
    } catch (e) {
      sessionStorage.removeItem('registrationError');
    }
  }, [isMounted]);
  
  // Form validity check
  const isFormValid = useMemo(() => {
    const { username, email, password, confirmPassword } = formData;
    return Boolean(username.trim()) && 
           Boolean(email.trim()) && 
           Boolean(password) && 
           Boolean(confirmPassword) &&
           password === confirmPassword;
  }, [formData]);
  
  // Apply shake animation to form with auto cleanup
  const applyShakeAnimation = useCallback(() => {
    setShakeForm(true);
    setTimeout(() => setShakeForm(false), SHAKE_ANIMATION_DURATION);
  }, []);
  
  // Handler functions
  const handleInput = useCallback((field: keyof typeof formData, errorType?: 'username' | 'email' | 'password') => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
      
      if (registrationError?.type === errorType) {
        handleDismissError();
      }
    }, [registrationError]);
  
  // Helper functions to keep the main logic clean
  const getFormValidationError = useCallback((data: typeof formData) => {
    const { username, email, password, confirmPassword } = data;
    if (!username.trim()) {
      return "Please enter a username";
    } else if (!email.trim()) {
      return "Please enter your email";
    } else if (!password) {
      return "Please enter a password";
    } else if (!confirmPassword) {
      return "Please confirm your password";
    } else if (password !== confirmPassword) {
      return "Passwords don't match";
    }
    return "Please check your information";
  }, []);
  
  const isDuplicateUserError = useCallback((error: any) => {
    // Status or type check
    if (error.response?.status === 409 || error.type === 'username' || error.type === 'email') {
      return true;
    }
    
    // Check message for duplicate indicators
    const patterns = ['username already', 'email already', 'already taken', 'duplicate user', 
                      'already registered', 'email already registered'];
    
    // Check error message
    if (error.message) {
      const message = error.message.toLowerCase();
      if (patterns.some(pattern => message.includes(pattern))) {
        return true;
      }
    }
    
    // Check response data message
    if (error.response?.data?.message) {
      const message = error.response.data.message.toLowerCase();
      if (patterns.some(pattern => message.includes(pattern))) {
        return true;
      }
    }
    
    // Check raw string response
    if (error.response?.data && typeof error.response.data === 'string') {
      const message = error.response.data.toLowerCase();
      if (patterns.some(pattern => message.includes(pattern))) {
        return true;
      }
    }
    
    return false;
  }, []);
  
  // Update processRegistrationError to handle all error cases with minimal code
  const processRegistrationError = useCallback((error: any) => {
    // Default values
    let errorType: 'username' | 'email' | 'password' = 'username';
    let errorMessage = '';
    
    // Extract error information
    if (typeof error === 'object') {
      // Use provided type if available
      if (error.type === 'username' || error.type === 'email' || error.type === 'password') {
        errorType = error.type;
        errorMessage = error.message || '';
      } else {
        // Extract message from various sources
        errorMessage = error.message || 
                      error.response?.data?.message || 
                      (typeof error.response?.data === 'string' ? error.response.data : '') ||
                      'Registration failed';
        
        // Determine type from message content
        const message = errorMessage.toLowerCase();
        if (message.includes('email')) {
          errorType = 'email';
          if (!error.message) {
            errorMessage = `Email "${formData.email}" is already registered. Please sign in or use a different email.`;
          }
        } else if (message.includes('password')) {
          errorType = 'password';
        } else {
          errorType = 'username';
          if (!error.message) {
            errorMessage = `Username "${formData.username}" is already taken. Please choose another.`;
          }
        }
      }
    }
    
    // Create error object
    const registrationErr: RegistrationError = {
      type: errorType,
      message: errorMessage,
      email: formData.email,
      timestamp: Date.now()
    };
    
    // Update state and store in session
    setRegistrationError(registrationErr);
    try {
      sessionStorage.setItem('registrationError', JSON.stringify(registrationErr));
    } catch (e) {
      // Silent fail for storage errors
    }
  }, [formData.username, formData.email]);
  
  const focusErrorField = useCallback((errorType?: string) => {
    setTimeout(() => {
      if (errorType === 'email') {
        document.getElementById('email')?.focus();
      } else if (errorType === 'password') {
        document.getElementById('password')?.focus();
      } else {
        usernameInputRef.current?.focus();
      }
    }, 100);
  }, []);
  
  const handleDismissError = useCallback(() => {
    setRegistrationError(null);
    sessionStorage.removeItem('registrationError');
  }, []);
  
  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleDismissError();
    
    // Basic form validation
    if (!isFormValid) {
      const errorMessage = getFormValidationError(formData);
      showToast(errorMessage, 'error');
      applyShakeAnimation();
      return;
    }
    
    setLoading(true);
    
    try {
      const { username, email, password } = formData;
      
      // Log signup attempt in development mode
      if (import.meta.env.DEV) {
        console.info('Attempting signup for:', { username, email });
      }
      
      const result = await signup({ username, email, password });
      
      // Only handle errors here - successful signup navigation is handled in AuthContext
      if (!result.success) {
        if (import.meta.env.DEV) {
          console.warn('Signup failed:', result);
        }
        
        applyShakeAnimation();
        
        if (!result.error) {
          showToast('Registration failed. Please try again.', 'error');
          return;
        }
        
        const errorMsg = result.error.toLowerCase();
        
        // Handle different error types
        if (errorMsg.includes('username already taken') || 
            errorMsg.includes('already taken: ' + username) ||
            errorMsg.includes('duplicate user: username already taken')) {
          processRegistrationError({ 
            type: 'username', 
            message: `Username "${username}" is already taken. Please try another.` 
          });
          focusErrorField('username');
        } else if (errorMsg.includes('email')) {
          processRegistrationError({ 
            type: 'email', 
            message: `Email "${email}" is already registered. Please sign in or use a different email.` 
          });
          focusErrorField('email');
        } else if (errorMsg.includes('password')) {
          showToast(result.error, 'error');
          setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
          setTimeout(() => document.getElementById('password')?.focus(), 100);
        } else {
          showToast(result.error, 'error');
          setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
        }
      }
    } catch (error: any) {
      // Clear sensitive data on error
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      
      // Handle duplicate user errors
      if (isDuplicateUserError(error)) {
        processRegistrationError(error);
        applyShakeAnimation();
        focusErrorField(error.type);
      } else {
        showToast(error.friendlyMessage || 'Registration failed. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [formData, isFormValid, signup, showToast, applyShakeAnimation, handleDismissError, processRegistrationError, focusErrorField, isDuplicateUserError]);
  
  // Prevent rendering if authenticated
  if (isAuthenticated) return null;
  
  // Destructure form data for easier use in JSX
  const { username, email, password, confirmPassword } = formData;
  const hasError = !!registrationError;
  
  return (
    <div 
      ref={pageRef}
      className={`w-full min-h-[80vh] flex items-center justify-center px-4 py-12`}
      style={{
        opacity: isMounted ? 1 : 0,
        transform: isMounted ? 'translateY(0) scale(1)' : 'translateY(15px) scale(0.98)',
        willChange: 'opacity, transform',
        transitionProperty: 'opacity, transform',
        transitionDuration: `${MOUNT_ANIMATION_DURATION}ms`,
        transitionTimingFunction: 'cubic-bezier(0.19, 1, 0.22, 1)' // Expo-like easing for smoothness
      }}
    >
      {/* Colorful floating shapes for visual interest */}
      <AnimatedBackground />
      
      {contentVisible && (
        <div 
          style={{
            opacity: contentVisible ? 1 : 0,
            transform: contentVisible ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.98)',
            transition: `all ${MOUNT_ANIMATION_DURATION * 0.8}ms cubic-bezier(0.19, 1, 0.22, 1)`,
            willChange: 'opacity, transform'
          }}
          className="w-full max-w-md"
        >
          <Card 
            variant="glass" 
            className={`will-change-transform z-10 overflow-hidden ${shakeForm ? 'animate-shake' : ''}`}
            padding="none"
          >
            <div 
              className="relative p-8 sm:p-10"
            >
              {/* Decorative gradient at top of card */}
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500"></div>
              
              <div 
                className="text-center mb-8"
                style={{
                  opacity: elementsVisible ? 1 : 0,
                  transform: elementsVisible ? 'translateY(0)' : 'translateY(8px)',
                  transition: `all ${MOUNT_ANIMATION_DURATION * 0.7}ms cubic-bezier(0.19, 1, 0.22, 1) 100ms`,
                  willChange: 'opacity, transform'
                }}
              >
                <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-400 dark:to-indigo-300">
                  Create Account
                </h1>
                <p className="mt-3 text-gray-600 dark:text-gray-300">
                  Join SavorAI to discover amazing recipes
                </p>
              </div>
              
              {/* Enhanced Registration error banner */}
              {registrationError && <ErrorBanner error={registrationError} onDismiss={handleDismissError} />}
              
              <form 
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
                {/* Username Field */}
                <FormInput
                  id="username"
                  ref={usernameInputRef}
                  type="text"
                  value={username}
                  onChange={handleInput('username', 'username')}
                  hasError={registrationError?.type === 'username'}
                  placeholder="Your username"
                  icon={FiUser}
                  errorMessage="This username is already taken. Please try another."
                  autoFocus
                />
                
                {/* Email Field */}
                <FormInput
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleInput('email', 'email')}
                  hasError={registrationError?.type === 'email'}
                  placeholder="your@email.com"
                  icon={FiMail}
                  errorMessage="This email is already registered. Try signing in instead."
                  autoComplete="email"
                />
                
                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <FiLock className="h-5 w-5" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={handleInput('password', 'password')}
                      className={`w-full px-4 py-2.5 pl-10 pr-10 rounded-xl border ${
                        registrationError?.type === 'password' 
                          ? 'border-red-500 focus:ring-red-200' 
                          : 'border-gray-200 dark:border-gray-700 focus:ring-blue-200'
                      } bg-white dark:bg-gray-800 focus:border-blue-500 focus:ring-2 transition-all`}
                      placeholder="••••••••"
                      required
                      autoComplete="new-password"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(prev => !prev)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  <ul className="mt-1 text-xs text-gray-500 dark:text-gray-400 space-y-0.5 list-disc pl-4">
                    <li>At least 8 characters</li>
                    <li>Include uppercase letter (A-Z)</li>
                    <li>Include lowercase letter (a-z)</li>
                    <li>Include number (0-9)</li>
                    <li>Include special character (!@#$%^&*)</li>
                  </ul>
                </div>
                
                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <FiLock className="h-5 w-5" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={handleInput('confirmPassword')}
                      className="w-full px-4 py-2.5 pl-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      placeholder="••••••••"
                      required
                      autoComplete="new-password"
                    />
                  </div>
                </div>
                
                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || hasError}
                    className={`w-full py-3 px-4 font-medium rounded-xl shadow-sm hover:shadow-md transition-all flex justify-center items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      loading || hasError 
                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Account...
                      </>
                    ) : hasError ? (
                      'Please fix the errors above'
                    ) : (
                      'Sign Up'
                    )}
                  </button>
                </div>
                
                {/* Sign In Link */}
                <div 
                  className="text-center mt-6"
                  style={{
                    opacity: elementsVisible ? 1 : 0,
                    transform: elementsVisible ? 'translateY(0)' : 'translateY(8px)',
                    transition: `all ${MOUNT_ANIMATION_DURATION * 0.7}ms cubic-bezier(0.19, 1, 0.22, 1) 300ms`,
                    willChange: 'opacity, transform'
                  }}
                >
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Already have an account?{' '}
                    <Link to="/signin" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                      Sign in
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// Export a memoized version
export default React.memo(SignUp);
