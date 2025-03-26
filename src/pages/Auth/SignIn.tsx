import React, { useState, useCallback, memo, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, PageTransition } from '../../components/common';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';

interface FormState {
  identifier: string;
  password: string;
}

// Animation duration constants
const SHAKE_ANIMATION_DURATION = 500;

const SignIn = memo(() => {
  // Form state
  const [formState, setFormState] = useState<FormState>({ 
    identifier: '', 
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [shakeForm, setShakeForm] = useState(false);
  
  // Refs
  const identifierInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
  // Hooks
  const { login } = useAuth();
  const { showToast } = useToast();
  const isAuthenticated = false; // This would normally come from auth context

  // Basic form validation
  const isFormValid = useMemo(() => 
    Boolean(formState.identifier.trim()) && 
    Boolean(formState.password.trim()),
  [formState.identifier, formState.password]);

  // Apply shake animation to form with auto cleanup
  const applyShakeAnimation = useCallback(() => {
    setShakeForm(true);
    const timer = setTimeout(() => setShakeForm(false), SHAKE_ANIMATION_DURATION);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Basic validation
    if (!isFormValid) {
      showToast('Please fill in all required fields', 'error');
      applyShakeAnimation();
      return;
    }
    
    setLoading(true);
    
    try {
      // Clone the form data to avoid mutation issues
      const loginData = { ...formState, rememberMe: false };
      await login(loginData);
      // Navigation happens in the auth context after successful login
    } catch (err: any) {
      console.error('Sign in error:', err);
      
      // Clear password for security
      setFormState(prev => ({ ...prev, password: '' }));
      
      // Always show "Bad credentials" for any auth error
      showToast('Bad credentials', 'error', 6000);
      
      // Shake form and focus on identifier input
      applyShakeAnimation();
      
      // Safety timeout to ensure state updates complete before focusing
      setTimeout(() => {
        if (identifierInputRef.current) {
          identifierInputRef.current.focus();
        }
      }, 100);
    } finally {
      setLoading(false);
    }
  }, [formState, login, isFormValid, showToast, applyShakeAnimation]);

  // Prevent rendering if authenticated
  if (isAuthenticated) return null;

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card className={`p-6 shadow-lg animate-fadeIn ${shakeForm ? 'animate-shake' : ''}`}>
            <div className="text-center">
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
                      className="w-full px-4 py-2.5 pl-10 rounded-xl border transition-all border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-200 bg-white dark:bg-gray-800 focus:ring-2"
                      placeholder="username or email@example.com"
                      required
                      autoComplete="username"
                      autoFocus
                    />
                  </div>
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
                      className="w-full px-4 py-2.5 pl-10 pr-10 rounded-xl border transition-all border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-200 bg-white dark:bg-gray-800 focus:ring-2"
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
                </div>
                
                <div className="flex justify-end">
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
                
                <div className="text-center mt-4">
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
          </Card>
        </div>
      </div>
    </PageTransition>
  );
});

// Add display name for debugging
SignIn.displayName = 'SignIn';

export default SignIn;
