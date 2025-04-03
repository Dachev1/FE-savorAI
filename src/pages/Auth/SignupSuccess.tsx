import React, { useEffect, useState, useLayoutEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/common';
import { FiMail, FiExternalLink } from 'react-icons/fi';
import { HiOutlineMailOpen } from 'react-icons/hi';
import { SiGmail } from 'react-icons/si';
import { FaYahoo, FaMicrosoft, FaApple, FaLock } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import api from '../../api/apiService';

interface SignupData {
  email: string;
  username: string;
}

// Animation constants
const MOUNT_ANIMATION_DURATION = 600; // ms
const CONTENT_DELAY = 150; // Delay for content

const PROVIDERS = [
  { id: 'gmail', url: 'https://mail.google.com/mail/u/0/', icon: <SiGmail className="mr-2 h-5 w-5" />, label: 'Gmail', color: 'bg-red-600 hover:bg-red-700' },
  { id: 'outlook', url: 'https://outlook.live.com/mail', icon: <FaMicrosoft className="mr-2 h-5 w-5" />, label: 'Outlook', color: 'bg-blue-600 hover:bg-blue-700' },
  { id: 'yahoo', url: 'https://login.yahoo.com', icon: <FaYahoo className="mr-2 h-5 w-5" />, label: 'Yahoo', color: 'bg-purple-600 hover:bg-purple-700' },
  { id: 'apple', url: 'https://www.icloud.com/mail', icon: <FaApple className="mr-2 h-5 w-5" />, label: 'Apple Mail', color: 'bg-gray-800 hover:bg-gray-900' },
  { id: 'proton', url: 'https://mail.proton.me', icon: <FaLock className="mr-2 h-5 w-5" />, label: 'ProtonMail', color: 'bg-purple-800 hover:bg-purple-900' },
  { id: 'abv', url: 'https://www.abv.bg', icon: <MdEmail className="mr-2 h-5 w-5" />, label: 'ABV', color: 'bg-blue-500 hover:bg-blue-600' }
];

const SignupSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state as { email?: string; username?: string } | null;
  const { isAuthenticated } = useAuth();
  const toastContext = useToast();
  
  // Helper function for showing toasts
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration?: number) => {
    if (toastContext) {
      toastContext.showToast(message, type, duration);
    }
  }, [toastContext]);
  
  // Mount animation state
  const [isMounted, setIsMounted] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);
  
  const [userData, setUserData] = useState<SignupData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResending, setIsResending] = useState(false);
  
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
        
        // Phase 3: Animate in the inner content elements - not needed in this case
      }, CONTENT_DELAY);
    }, 50);
    
    return () => {
      clearTimeout(mountTimer);
    };
  }, []);
  
  useEffect(() => {
    // Redirect authenticated users
    if (isAuthenticated) {
      showToast('Already signed up and logged in', 'info');
      navigate('/recipe/generator', { replace: true });
      return;
    }
    
    const validateAccess = async () => {
      setIsLoading(true);
      
      try {
        // If we have location state with email (coming directly from signup form)
        if (locationState?.email && locationState?.username) {
          setUserData({
            email: locationState.email,
            username: locationState.username
          });
          setIsLoading(false);
          return;
        }
        
        // No location state, check backend for recent signups
        const email = new URLSearchParams(location.search).get('email');
        
        if (email) {
          try {
            // Call backend verification check endpoint to see if this email recently registered
            const response = await api.get(`/api/v1/verification/status?email=${encodeURIComponent(email)}`);
            const data = response.data;
            
            if (data && (data.verificationPending || data.verified === false)) {
              setUserData({
                email: email,
                username: data.username || email.split('@')[0]
              });
              setIsLoading(false);
              return;
            }
          } catch (err) {
            console.error('Verification check failed:', err);
            redirectToSignup('Email verification check failed');
          }
        } else {
          redirectToSignup('Direct access not allowed');
        }
      } catch (error) {
        console.error('Access validation error:', error);
        redirectToSignup('Verification check failed');
      }
    };
    
    validateAccess();
    
    // Prevent back button from staying on this page
    const handlePopState = () => navigate('/signin', { replace: true });
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isAuthenticated, navigate, showToast, locationState, location.search]);
  
  // Helper function to redirect with specific message
  const redirectToSignup = (reason: string) => {
    showToast(`${reason}. Please complete the signup form.`, 'error');
    navigate('/signup', { replace: true });
  };
  
  // Handle resending the verification email
  const handleResendEmail = async () => {
    if (!userData?.email || isResending) return;
    
    setIsResending(true);
    try {
      await api.post('/api/v1/verification/resend', { email: userData.email });
      showToast('Verification email resent. Please check your inbox.', 'success');
    } catch (error) {
      showToast('Failed to resend verification email. Please try again later.', 'error');
    } finally {
      setIsResending(false);
    }
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Don't render anything until we have user data
  if (!userData) return null;

  // Determine email provider
  const getEmailProvider = (email: string) => {
    const domain = email.split('@')[1]?.toLowerCase() || '';
    const domainMap = {
      gmail: ['gmail', 'google'],
      yahoo: ['yahoo'],
      abv: ['abv.bg'],
      outlook: ['outlook', 'hotmail', 'live', 'msn'],
      apple: ['icloud', 'me.com', 'mac.com'],
      proton: ['proton', 'protonmail']
    };
    
    return Object.entries(domainMap).find(([_, domains]) => 
      domains.some(d => domain.includes(d)))?.[0] || null;
  };

  const emailProvider = getEmailProvider(userData.email);
  
  return (
    <div 
      ref={pageRef}
      className="w-full min-h-[80vh] flex items-center justify-center px-4 py-12"
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
          style={{
            opacity: contentVisible ? 1 : 0,
            transform: contentVisible ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.98)',
            transition: `all ${MOUNT_ANIMATION_DURATION * 0.8}ms cubic-bezier(0.19, 1, 0.22, 1)`,
            willChange: 'opacity, transform'
          }}
          className="w-full max-w-lg"
        >
          <Card variant="glass" className="w-full">
            <div className="text-center">
              <div 
                className="mx-auto w-20 h-20 flex items-center justify-center bg-green-100 dark:bg-green-900/30 rounded-full mb-6"
                style={{
                  opacity: contentVisible ? 1 : 0,
                  transform: contentVisible ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.95)',
                  transition: `all ${MOUNT_ANIMATION_DURATION * 0.7}ms cubic-bezier(0.19, 1, 0.22, 1) 100ms`,
                }}
              >
                <HiOutlineMailOpen className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              
              <h1 
                className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2"
                style={{
                  opacity: contentVisible ? 1 : 0,
                  transform: contentVisible ? 'translateY(0)' : 'translateY(8px)',
                  transition: `all ${MOUNT_ANIMATION_DURATION * 0.7}ms cubic-bezier(0.19, 1, 0.22, 1) 150ms`,
                }}
              >
                Sign Up Successful!
              </h1>
              
              <p 
                className="text-lg text-gray-600 dark:text-gray-300 mb-2"
                style={{
                  opacity: contentVisible ? 1 : 0,
                  transform: contentVisible ? 'translateY(0)' : 'translateY(8px)',
                  transition: `all ${MOUNT_ANIMATION_DURATION * 0.7}ms cubic-bezier(0.19, 1, 0.22, 1) 200ms`,
                }}
              >
                Thanks for joining, {userData.username}!
              </p>
              
              <div 
                className="mt-6 mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800"
                style={{
                  opacity: contentVisible ? 1 : 0,
                  transform: contentVisible ? 'translateY(0)' : 'translateY(8px)',
                  transition: `all ${MOUNT_ANIMATION_DURATION * 0.7}ms cubic-bezier(0.19, 1, 0.22, 1) 250ms`,
                }}
              >
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
              
              <p 
                className="text-sm text-gray-600 dark:text-gray-400 mb-6"
                style={{
                  opacity: contentVisible ? 1 : 0,
                  transform: contentVisible ? 'translateY(0)' : 'translateY(8px)',
                  transition: `all ${MOUNT_ANIMATION_DURATION * 0.7}ms cubic-bezier(0.19, 1, 0.22, 1) 300ms`,
                }}
              >
                After verification, you'll be able to access all features of SavorAI.
              </p>
              
              <div 
                className="mt-8"
                style={{
                  opacity: contentVisible ? 1 : 0,
                  transform: contentVisible ? 'translateY(0)' : 'translateY(8px)',
                  transition: `all ${MOUNT_ANIMATION_DURATION * 0.7}ms cubic-bezier(0.19, 1, 0.22, 1) 350ms`,
                }}
              >
                <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Open your email provider to verify your account:
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {PROVIDERS.map(provider => (
                    <a
                      key={provider.id}
                      href={provider.url}
                      className={`flex items-center justify-center px-4 py-3 rounded-lg transition-colors ${
                        emailProvider === provider.id
                          ? `${provider.color} text-white`
                          : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {provider.icon} {provider.label}
                    </a>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Didn't receive the email?{' '}
                    <button 
                      onClick={handleResendEmail}
                      disabled={isResending}
                      className={`font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus:outline-none ${isResending ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isResending ? (
                        <>
                          <span className="inline-block animate-spin mr-1">↻</span>
                          Sending...
                        </>
                      ) : 'Resend Email'}
                    </button>
                  </p>
                  
                  <div className="mt-4">
                    <Link
                      to="/signin"
                      className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
                      Go to sign in page <FiExternalLink className="inline ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SignupSuccess; 