import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ContactSuccess: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Replace current history entry to prevent going back to this page
    window.history.replaceState(null, '', '/');
    
    // Check if this page was accessed directly without form submission
    const referrer = document.referrer;
    if (!referrer.includes('/contact')) {
      navigate('/', { replace: true });
    }
    
    // Add event listener for popstate (back/forward button)
    const handlePopState = () => {
      navigate('/', { replace: true });
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  return (
    <div className="bg-gradient-to-br from-light via-softGray to-accent dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 min-h-screen flex items-center justify-center py-20 px-4">
      <motion.div 
        className="max-w-xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 sm:p-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <svg className="w-12 h-12 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </motion.div>
        
        <h2 className="text-4xl sm:text-5xl font-extrabold text-dark dark:text-white mb-6">
          Message Sent!
        </h2>
        
        <p className="text-lg text-dark/70 dark:text-gray-300 mb-10 max-w-md mx-auto">
          Thank you for reaching out. We've received your message and will get back to you as soon as possible.
        </p>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link 
            to="/"
            className="inline-block px-8 py-3 bg-accent text-white font-bold rounded-full shadow-lg hover:bg-dark hover:shadow-xl transition-all duration-300"
          >
            Return to Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ContactSuccess; 