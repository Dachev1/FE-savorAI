import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="mb-8">
        <h1 className="text-9xl font-bold text-primary-500">404</h1>
        <div className="h-1 w-24 bg-primary-500 mx-auto my-4"></div>
      </div>
      
      <h2 className="text-3xl md:text-4xl font-bold mb-4">Page Not Found</h2>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md">
        The page you are looking for might have been removed, had its name changed, 
        or is temporarily unavailable.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/"
          className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg 
          transition-colors duration-300 text-center"
        >
          Go to Homepage
        </Link>
        <Link
          to="/contact"
          className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600
          text-gray-800 dark:text-white rounded-lg transition-colors duration-300 text-center"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
};

export default NotFound; 