import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DarkModeToggle } from '../common';
import { FaHome, FaUtensils, FaInfoCircle, FaSignInAlt, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import { FiHome, FiInfo, FiZap, FiBook, FiLogIn, FiUserPlus } from 'react-icons/fi';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRecipesDropdownOpen, setIsRecipesDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const recipesDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (recipesDropdownRef.current && !recipesDropdownRef.current.contains(e.target as Node)) {
        setIsRecipesDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdowns when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsRecipesDropdownOpen(false);
    setIsUserDropdownOpen(false);
  }, [location.pathname]);

  const toggleMenu = useCallback(() => setIsMenuOpen(prev => !prev), []);
  const toggleRecipesDropdown = useCallback(() => setIsRecipesDropdownOpen(prev => !prev), []);
  const toggleUserDropdown = useCallback(() => setIsUserDropdownOpen(prev => !prev), []);
  
  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    setIsRecipesDropdownOpen(false);
    setIsUserDropdownOpen(false);
  }, []);
  
  const handleLogout = useCallback(() => {
    logout();
    closeMenu();
  }, [logout, closeMenu]);
  
  const isActive = useCallback((path: string) => location.pathname === path, [location.pathname]);
  const isRecipeRouteActive = useCallback(() => {
    const recipeRoutes = ['/recipe/generator', '/recipe/create', '/recipes'];
    return recipeRoutes.some(route => location.pathname.startsWith(route));
  }, [location.pathname]);

  // Common classes 
  const navLinkClass = (active: boolean) => 
    `flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-blue-50 text-blue-600 font-medium dark:bg-blue-900/30 dark:text-blue-300' 
        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
    }`;
  
  const dropdownItemClass = (active: boolean) => 
    `flex items-center gap-2 px-4 py-2 text-sm transition-colors duration-200 ${
      active ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
    }`;
  
  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm shadow-sm dark:bg-gray-800/90 dark:text-white border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent">
          SavorAI
        </Link>
        
        {/* Mobile buttons */}
        <div className="flex items-center gap-2 md:hidden">
          <DarkModeToggle />
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" onClick={toggleMenu} aria-label="Toggle menu">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
        
        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-2">
          {/* Home Link - Only for unauthenticated users */}
          {!isAuthenticated && (
            <Link to="/" className={navLinkClass(isActive('/'))}>
              <FaHome className="mr-1.5" /> Home
            </Link>
          )}
          
          {/* Recipes Dropdown - Only for authenticated users */}
          {isAuthenticated && (
            <div className="relative" ref={recipesDropdownRef}>
              <button
                onClick={toggleRecipesDropdown}
                className={`${navLinkClass(isRecipeRouteActive())}`}
              >
                <FaUtensils className="mr-1.5" /> Recipes
                <svg className={`ml-1.5 h-4 w-4 transition-transform duration-200 ${isRecipesDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isRecipesDropdownOpen && (
                <div className="absolute z-50 mt-1 w-52 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 border border-gray-200 dark:border-gray-700 overflow-hidden animate-fadeIn">
                  <Link to="/recipe/generator" className={dropdownItemClass(isActive('/recipe/generator'))}>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M19.5 12c0-4.14-3.36-7.5-7.5-7.5S4.5 7.86 4.5 12s3.36 7.5 7.5 7.5v-1.5m9-6h-4.5m0 0v-4.5m0 4.5h-4.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Generate Recipe
                  </Link>
                  <Link to="/recipe/create" className={dropdownItemClass(isActive('/recipe/create'))}>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M12 4.5v15m7.5-7.5h-15" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Create Recipe
                  </Link>
                  <Link to="/recipes" className={dropdownItemClass(isActive('/recipes'))}>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    My Collection
                  </Link>
                </div>
              )}
            </div>
          )}

          <Link to="/about" className={navLinkClass(isActive('/about'))}>
            <FaInfoCircle className="mr-1.5" /> About
          </Link>
          
          <div className="ml-1">
            <DarkModeToggle />
          </div>
          
          {isAuthenticated ? (
            <div className="relative" ref={userDropdownRef}>
              <button 
                onClick={toggleUserDropdown}
                className="flex items-center p-1.5 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <FaUserCircle className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                <svg className={`ml-1 h-4 w-4 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isUserDropdownOpen && (
                <div className="absolute right-0 z-50 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 border border-gray-200 dark:border-gray-700 overflow-hidden animate-fadeIn">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-sm font-medium">{user?.username}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                  </div>
                  
                  {isAdmin && (
                    <Link to="/admin" className={dropdownItemClass(isActive('/admin'))}>
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      Admin Panel
                    </Link>
                  )}
                  
                  <Link to="/profile" className={dropdownItemClass(isActive('/profile'))}>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    My Profile
                  </Link>
                  
                  <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <FaSignOutAlt className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link 
              to="/signin"
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-lg transition-all duration-300 shadow-sm"
            >
              <FaSignInAlt className="mr-1.5" /> Sign In
            </Link>
          )}
        </div>
        
        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-md py-3 px-4 z-50 border-b border-gray-200 dark:border-gray-700 animate-slideDown">
            {/* Home link - only show for unauthenticated users */}
            {!isAuthenticated && (
              <Link to="/" className="flex items-center px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50" onClick={closeMenu}>
                <FaHome className="mr-2" /> Home
              </Link>
            )}
            
            {/* Only show recipes section when authenticated */}
            {isAuthenticated && (
              <>
                <div className="mt-2 mb-1 px-3 py-1.5 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
                  Recipes
                </div>
                <div className="rounded-lg bg-gray-50/50 dark:bg-gray-700/30 p-1.5 mb-2">
                  <Link to="/recipe/generator" className="flex items-center px-3 py-2 rounded-md hover:bg-white dark:hover:bg-gray-700/70" onClick={closeMenu}>
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M19.5 12c0-4.14-3.36-7.5-7.5-7.5S4.5 7.86 4.5 12s3.36 7.5 7.5 7.5v-1.5m9-6h-4.5m0 0v-4.5m0 4.5h-4.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Generate Recipe
                  </Link>
                  <Link to="/recipe/create" className="flex items-center px-3 py-2 rounded-md hover:bg-white dark:hover:bg-gray-700/70" onClick={closeMenu}>
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M12 4.5v15m7.5-7.5h-15" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Create Recipe
                  </Link>
                  <Link to="/recipes" className="flex items-center px-3 py-2 rounded-md hover:bg-white dark:hover:bg-gray-700/70" onClick={closeMenu}>
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    My Collection
                  </Link>
                </div>
              </>
            )}
            
            <Link to="/about" className="flex items-center px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50" onClick={closeMenu}>
              <FaInfoCircle className="mr-2" /> About
            </Link>
            
            {isAuthenticated && (
              <>
                <div className="h-px bg-gray-200 dark:bg-gray-700 my-2"></div>
                
                {isAdmin && (
                  <Link to="/admin" className="flex items-center px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50" onClick={closeMenu}>
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    Admin Panel
                  </Link>
                )}
                
                <Link to="/profile" className="flex items-center px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50" onClick={closeMenu}>
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  My Profile
                </Link>
              </>
            )}
            
            <div className="h-px bg-gray-200 dark:bg-gray-700 my-2"></div>
            
            {isAuthenticated ? (
              <button onClick={handleLogout} className="flex items-center w-full justify-center gap-2 px-3 py-2.5 mt-1 rounded-lg bg-red-100 text-red-600 font-medium dark:bg-red-900/20 dark:text-red-400">
                <FaSignOutAlt /> Logout
              </button>
            ) : (
              <Link to="/signin" className="flex items-center w-full justify-center gap-2 px-3 py-2.5 mt-1 rounded-lg bg-blue-100 text-blue-600 font-medium dark:bg-blue-900/20 dark:text-blue-400" onClick={closeMenu}>
                <FaSignInAlt /> Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

// Add custom animation for dropdown
const animationStyles = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease-out forwards;
}

.animate-slideDown {
  animation: slideDown 0.3s ease-out forwards;
}
`;

// Inject animation styles once
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = animationStyles;
  document.head.appendChild(style);
}

export default memo(Navbar); 