import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DarkModeToggle from '../common/DarkModeToggle';
import { FaPlus } from 'react-icons/fa';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();

  // Update scroll state on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-md'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and brand */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">SavorAI</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <NavLink to="/" active={location.pathname === '/'}>
                Home
              </NavLink>
              
              <NavLink 
                to="/recipe/generator" 
                active={location.pathname === '/recipe/generator'}
              >
                Recipe Generator
              </NavLink>
              
              {/* Create Recipe Button - Desktop (visible to everyone) */}
              <Link
                to="/recipe/create"
                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors flex items-center"
              >
                <FaPlus className="mr-2" /> Create Recipe
              </Link>
              
              {isAuthenticated ? (
                <>
                  <NavLink 
                    to="/recipes" 
                    active={location.pathname === '/recipes'}
                  >
                    My Recipes
                  </NavLink>
                  
                  <button
                    onClick={logout}
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink 
                    to="/login" 
                    active={location.pathname === '/login'}
                  >
                    Login
                  </NavLink>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
                  >
                    Register
                  </Link>
                </>
              )}
              
              <DarkModeToggle />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <DarkModeToggle />
            
            <button
              onClick={toggleMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 ml-3 rounded-md text-gray-600 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">{isOpen ? 'Close menu' : 'Open menu'}</span>
              <svg
                className={`${isOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${isOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`${isOpen ? 'block' : 'hidden'} md:hidden`}
        id="mobile-menu"
      >
        <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-900 shadow-lg rounded-b-lg">
          <MobileNavLink to="/" active={location.pathname === '/'} onClick={() => setIsOpen(false)}>
            Home
          </MobileNavLink>
          
          <MobileNavLink 
            to="/recipe/generator" 
            active={location.pathname === '/recipe/generator'}
            onClick={() => setIsOpen(false)}
          >
            Recipe Generator
          </MobileNavLink>
          
          {/* Create Recipe Button - Mobile (visible to everyone) */}
          <Link
            to="/recipe/create"
            className="block w-full px-3 py-2 my-1 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 flex items-center justify-center"
            onClick={() => setIsOpen(false)}
          >
            <FaPlus className="mr-2" /> Create Recipe
          </Link>
          
          {isAuthenticated ? (
            <>
              <MobileNavLink 
                to="/recipes" 
                active={location.pathname === '/recipes'}
                onClick={() => setIsOpen(false)}
              >
                My Recipes
              </MobileNavLink>
              
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <MobileNavLink 
                to="/login" 
                active={location.pathname === '/login'}
                onClick={() => setIsOpen(false)}
              >
                Login
              </MobileNavLink>
              
              <MobileNavLink 
                to="/register" 
                active={location.pathname === '/register'}
                onClick={() => setIsOpen(false)}
              >
                Register
              </MobileNavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

interface NavLinkProps {
  to: string;
  active: boolean;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, active, children }) => (
  <Link
    to={to}
    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      active
        ? 'text-blue-600 dark:text-blue-400'
        : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
    }`}
  >
    {children}
  </Link>
);

interface MobileNavLinkProps extends NavLinkProps {
  onClick: () => void;
}

const MobileNavLink: React.FC<MobileNavLinkProps> = ({ to, active, onClick, children }) => (
  <Link
    to={to}
    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
      active
        ? 'text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-gray-800'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
    }`}
    onClick={onClick}
  >
    {children}
  </Link>
);

export default Navbar;
