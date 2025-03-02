import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="container mx-auto px-4 text-center">
      <h1 className="text-3xl font-bold mb-6">404 - Page Not Found</h1>
      <p className="mb-4">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="text-blue-500 hover:text-blue-700">
        Return to Home
      </Link>
    </div>
  );
};

export default NotFound; 