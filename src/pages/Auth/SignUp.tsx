// src/pages/Auth/SignUp.tsx
import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, PageTransition } from '../../components/common';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';

// Animation duration constants
const SHAKE_ANIMATION_DURATION = 500;

/** ------------------------------------------------------------------
 *  Main Component: SignUp
 * ----------------------------------------------------------------- */
const SignUp: React.FC = () => {
  // Form state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shakeForm, setShakeForm] = useState(false);
  
  // Refs for form elements
  const usernameInputRef = useRef<HTMLInputElement>(null);
  
  const { register, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  
  // Form validity check
  const isFormValid = useMemo(() => {
    return Boolean(username.trim()) && 
           Boolean(email.trim()) && 
           Boolean(password) && 
           Boolean(confirmPassword) &&
           password === confirmPassword;
  }, [username, email, password, confirmPassword]);
  
  // Apply shake animation to form with auto cleanup
  const applyShakeAnimation = useCallback(() => {
    setShakeForm(true);
    const timer = setTimeout(() => setShakeForm(false), SHAKE_ANIMATION_DURATION);
    return () => clearTimeout(timer);
  }, []);
  
  // Handler functions
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);
  
  const handleUsernameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  }, []);
  
  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  }, []);
  
  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }, []);
  
  const handleConfirmPasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  }, []);
  
  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate form
    if (!isFormValid) {
      const errorMessage = !password || !confirmPassword ? 
        "Please fill in all required fields" : 
        password !== confirmPassword ? 
          "Passwords don't match" : 
          "Please check your information";
      
      showToast(errorMessage, 'error');
      applyShakeAnimation();
      return;
    }
    
    setLoading(true);
    
    try {
      await register({ username, email, password });
      // Navigation happens in the auth context after successful registration
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Use consistent "Bad credentials" error message
      showToast('Bad credentials', 'error', 6000);
      
      // Clear sensitive fields
      setPassword('');
      setConfirmPassword('');
      
      // Shake form and focus back on username field
      applyShakeAnimation();
      setTimeout(() => {
        if (usernameInputRef.current) {
          usernameInputRef.current.focus();
        }
      }, 100);
    } finally {
      setLoading(false);
    }
  }, [username, email, password, confirmPassword, isFormValid, register, showToast, applyShakeAnimation]);
  
  // Prevent rendering if authenticated
  if (isAuthenticated) return null;
  
  return (
    <PageTransition type="slide-up" duration={400}>
      <div className="w-full min-h-[80vh] flex items-center justify-center px-4 py-12">
        {/* Colorful floating shapes for visual interest */}
        <div className="absolute overflow-hidden w-full h-full max-w-6xl mx-auto pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-blue-200 dark:bg-blue-900/30 rounded-full mix-blend-multiply dark:mix-blend-soft-light blur-xl opacity-70 dark:opacity-30 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-amber-200 dark:bg-amber-900/30 rounded-full mix-blend-multiply dark:mix-blend-soft-light blur-xl opacity-70 dark:opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-purple-200 dark:bg-purple-900/30 rounded-full mix-blend-multiply dark:mix-blend-soft-light blur-xl opacity-70 dark:opacity-30 animate-blob animation-delay-4000"></div>
        </div>
        
        <Card 
          variant="glass" 
          className={`w-full max-w-md z-10 overflow-hidden ${shakeForm ? 'animate-shake' : ''}`}
          padding="none"
        >
          <div className="relative p-8 sm:p-10">
            {/* Decorative gradient at top of card */}
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500"></div>
            
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-400 dark:to-indigo-300">
                Create Account
              </h1>
              <p className="mt-3 text-gray-600 dark:text-gray-300">
                Join SavorAI to discover amazing recipes
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label htmlFor="username" className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <FiUser className="h-5 w-5" />
                  </div>
                  <input
                    id="username"
                    ref={usernameInputRef}
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                    className="w-full px-4 py-2.5 pl-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    placeholder="Your username"
                    required
                    autoFocus
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <FiMail className="h-5 w-5" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    className="w-full px-4 py-2.5 pl-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    placeholder="your@email.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>
              
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
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2.5 pl-10 pr-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <button 
                      type="button" 
                      onClick={togglePasswordVisibility}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? 
                        <FiEyeOff className="h-5 w-5" /> : 
                        <FiEye className="h-5 w-5" />
                      }
                    </button>
                  </div>
                </div>
              </div>
              
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
                    onChange={handleConfirmPasswordChange}
                    className="w-full px-4 py-2.5 pl-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all flex justify-center items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    'Sign Up'
                  )}
                </button>
              </div>
              
              <div className="text-center mt-6">
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
    </PageTransition>
  );
};

export default SignUp;
