// src/pages/Auth/SignUp.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../api/axiosConfig.tsx';
import { useToast } from '../../context/ToastContext';
import { Button, Card, PageTransition } from '../../components/common';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

/** ------------------------------------------------------------------
 *  Helper: validateForm
 * ----------------------------------------------------------------- */
function validateForm(
  username: string,
  email: string,
  password: string,
  confirmPassword: string
): boolean {
  if (!username.trim()) {
    return false;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return false;
  }

  if (password.length < 8) {
    return false;
  }

  if (password !== confirmPassword) {
    return false;
  }

  return true;
}

/** ------------------------------------------------------------------
 *  Main Component: SignUp
 * ----------------------------------------------------------------- */
const SignUp: React.FC = () => {
  // Basic form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Safe value update functions with error handling
  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setFullName(e.target.value);
    } catch (error) {
      console.error('Error updating full name:', error);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setEmail(e.target.value);
    } catch (error) {
      console.error('Error updating email:', error);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setPassword(e.target.value);
    } catch (error) {
      console.error('Error updating password:', error);
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setConfirmPassword(e.target.value);
    } catch (error) {
      console.error('Error updating confirm password:', error);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Form validation
  const validateForm = () => {
    if (!fullName || !email || !password || !confirmPassword) {
      showToast('Please fill in all fields', 'error');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Please enter a valid email address', 'error');
      return false;
    }

    if (password.length < 8) {
      showToast('Password must be at least 8 characters long', 'error');
      return false;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return false;
    }

    return true;
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const response = await axios.post('/v1/auth/register', {
        fullName,
        email,
        password
      });
      
      if (response.data.success) {
        showToast('Account created successfully! Please sign in.', 'success');
        navigate('/login');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      
      if (err.response?.data?.message) {
        showToast(err.response.data.message, 'error');
      } else if (err.response?.status === 409) {
        showToast('This email is already registered', 'error');
      } else {
        showToast('Failed to create account. Please try again later.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition type="slide-up" duration={400}>
      <div className="w-full min-h-[80vh] flex items-center justify-center px-4 py-12">
        {/* Colorful floating shapes */}
        <div className="absolute overflow-hidden w-full h-full max-w-6xl mx-auto pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-purple-200 dark:bg-purple-900/30 rounded-full mix-blend-multiply dark:mix-blend-soft-light blur-xl opacity-70 dark:opacity-30 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-amber-200 dark:bg-amber-900/30 rounded-full mix-blend-multiply dark:mix-blend-soft-light blur-xl opacity-70 dark:opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-blue-200 dark:bg-blue-900/30 rounded-full mix-blend-multiply dark:mix-blend-soft-light blur-xl opacity-70 dark:opacity-30 animate-blob animation-delay-4000"></div>
        </div>
        
        <Card 
          variant="glass" 
          className="w-full max-w-lg z-10 overflow-hidden"
          padding="none"
        >
          <div className="relative p-8 sm:p-10">
            {/* Background gradient */}
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500"></div>
            
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-400 dark:to-indigo-300">
                Create Your Account
              </h1>
              
              <p className="mt-3 text-gray-600 dark:text-gray-300">
                Join us to unlock all features and start generating recipes
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <FiUser className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      value={fullName}
                      onChange={handleFullNameChange}
                      className="w-full px-4 py-2.5 pl-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <FiMail className="h-5 w-5" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      className="w-full px-4 py-2.5 pl-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <FiLock className="h-5 w-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2.5 pl-10 pr-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <button 
                      type="button" 
                      onClick={togglePasswordVisibility}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
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
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <FiLock className="h-5 w-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    className="w-full px-4 py-2.5 pl-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">Passwords do not match</p>
                )}
              </div>
              
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all flex justify-center items-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
              
              <div className="relative flex items-center justify-center mt-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative bg-white dark:bg-gray-800 px-4 text-sm text-gray-500 dark:text-gray-400">
                  or continue with
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="flex justify-center items-center py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      className="fill-[#4285F4]"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      className="fill-[#34A853]"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      className="fill-[#FBBC05]"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      className="fill-[#EA4335]"
                    />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  className="flex justify-center items-center py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      className="fill-[#1877F2]"
                      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                    />
                  </svg>
                  Facebook
                </button>
              </div>
            </form>
            
            <div className="mt-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </PageTransition>
  );
};

export default SignUp;
