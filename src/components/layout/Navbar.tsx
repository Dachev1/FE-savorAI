import React, { memo, useState, useEffect, useCallback } from 'react';
import AOS from 'aos';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Memoize the Navbar component to prevent unnecessary re-renders
const Navbar: React.FC = () => {
  // Local state for mobile menu and user menu toggling.
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();

  // Initialize AOS (Animate on Scroll) on mount.
  useEffect(() => {
    AOS.init({ duration: 800, easing: 'ease-in-out', once: true });
    
    // Clean up function
    return () => {
      // AOS doesn't have a built-in cleanup, but we can ensure we don't leave any side effects
    };
  }, []);

  // Handler functions using useCallback to prevent unnecessary re-renders.
  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);
  
  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);
  
  const handleLogout = useCallback(() => {
    logout();
    closeMenu();
  }, [logout, closeMenu]);
  
  // Check if the link is active
  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );
  
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          {/* Logo placeholder */}
          <div className="text-xl font-bold">SavorAI</div>
        </div>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden focus:outline-none" 
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          Menu
        </button>
        
        {/* Desktop navigation */}
        <div className="hidden md:flex items-center space-x-4">
          <a 
            href="/" 
            className={`px-3 py-2 rounded ${isActive('/') ? 'bg-gray-100 font-medium' : ''}`}
          >
            Home
          </a>
          <a 
            href="/recipes" 
            className={`px-3 py-2 rounded ${isActive('/recipes') ? 'bg-gray-100 font-medium' : ''}`}
          >
            Recipes
          </a>
          <a 
            href="/about" 
            className={`px-3 py-2 rounded ${isActive('/about') ? 'bg-gray-100 font-medium' : ''}`}
          >
            About
          </a>
          
          {isAuthenticated ? (
            <button 
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
            >
              Logout
            </button>
          ) : (
            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700">
              Login
            </button>
          )}
        </div>
        
        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-md py-2 px-4">
            <a 
              href="/" 
              className={`block px-3 py-2 ${isActive('/') ? 'bg-gray-100 font-medium' : ''}`}
              onClick={closeMenu}
            >
              Home
            </a>
            <a 
              href="/recipes" 
              className={`block px-3 py-2 ${isActive('/recipes') ? 'bg-gray-100 font-medium' : ''}`}
              onClick={closeMenu}
            >
              Recipes
            </a>
            <a 
              href="/about" 
              className={`block px-3 py-2 ${isActive('/about') ? 'bg-gray-100 font-medium' : ''}`}
              onClick={closeMenu}
            >
              About
            </a>
            
            {isAuthenticated ? (
              <button onClick={handleLogout} className="block w-full text-left px-3 py-2">
                Logout
              </button>
            ) : (
              <button className="block w-full text-left px-3 py-2">
                Login
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(Navbar); 