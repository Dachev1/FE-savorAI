import React, { useCallback } from 'react';
import { FaHeart } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Define routes constant if missing
const ROUTES = {
  HOME: '/',
  RECIPES: '/recipes',
  FAVORITES: '/favorites',
  PROFILE: '/profile'
};

const Navbar: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Helper to check if a route is active
  const isActive = useCallback((path: string) => {
    return location.pathname === path;
  }, [location.pathname]);

  const navItems = [
    {
      name: 'Home',
      path: ROUTES.HOME
    },
    {
      name: 'Recipes',
      path: ROUTES.RECIPES
    }
  ];

  return (
    <nav className="bg-white shadow-md dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <img className="h-8 w-auto" src="/logo.svg" alt="Logo" />
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive(item.path)
                      ? 'border-indigo-500 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated && (
              <Link 
                to="/favorites"
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg
                  ${isActive('/favorites') 
                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                <FaHeart className="text-red-500" />
                <span>Favorites</span>
              </Link>
            )}
            <div className="ml-3 relative">
              {isAuthenticated ? (
                <Link
                  to="/profile"
                  className="bg-gray-200 dark:bg-gray-700 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                >
                  <img
                    className="h-8 w-8 rounded-full"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt="User profile"
                  />
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 