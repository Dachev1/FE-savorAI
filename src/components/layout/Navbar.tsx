import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import { DarkModeToggle } from '../common';
import { FaHeart, FaHome, FaBook, FaUser, FaEnvelope, FaSignOutAlt, FaBars } from 'react-icons/fa';

// Memoized Navbar component for better performance
const Navbar: React.FC = memo(() => {
  // Debug log for component lifecycle
  console.log('Navbar rendering, isAuth:', useAuth().isAuthenticated);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRecipesDropdownOpen, setIsRecipesDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  
  // Prevent rendering during logout - with auto-reset mechanism
  const [isLogoutInProgress, setIsLogoutInProgress] = useState(() => {
    // Only use the flag from session storage during initial render
    return sessionStorage.getItem('logout_in_progress') === 'true';
  });
  
  const { user, isAuthenticated, logout, isAdmin, refreshUserData } = useAuth();
  
  const location = useLocation();
  const { pathname } = location;
  
  // Keep track of previous auth state to detect changes
  const prevAuthState = useRef(isAuthenticated);
  
  // Refs for dropdowns
  const recipesDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const navbarRef = useRef<HTMLElement>(null);
  
  // Track username for UI updates
  const [currentUsername, setCurrentUsername] = useState<string | undefined>(user?.username);
  
  // Auto-reset logout progress when auth state changes (e.g., after login)
  useEffect(() => {
    if (prevAuthState.current !== isAuthenticated) {
      // Reset logout in progress when auth state changes
      setIsLogoutInProgress(false);
      sessionStorage.removeItem('logout_in_progress');
      document.documentElement.removeAttribute('data-logout-in-progress');
      
      // Update previous auth state
      prevAuthState.current = isAuthenticated;
    }
  }, [isAuthenticated]);
  
  // Update local state when username changes in context
  useEffect(() => {
    if (user?.username !== currentUsername) {
      setCurrentUsername(user?.username);
    }
  }, [user, currentUsername]);
  
  // Listen for storage events for cross-tab sync
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userData' || e.key === 'user' || e.key === 'user_session' || e.key === '__user_updated') {
        refreshUserData();
      }
      
      // Also check for logout_in_progress changes
      if (e.key === 'logout_in_progress') {
        setIsLogoutInProgress(e.newValue === 'true');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshUserData]);
  
  // Listen for user-updated events with debouncing
  useEffect(() => {
    let refreshTimeout: number;
    
    const handleUserUpdated = () => {
      clearTimeout(refreshTimeout);
      refreshTimeout = setTimeout(() => {
        refreshUserData();
      }, 300);
    };
    
    window.addEventListener('user-updated', handleUserUpdated);
    return () => {
      window.removeEventListener('user-updated', handleUserUpdated);
      clearTimeout(refreshTimeout);
    };
  }, [refreshUserData]);

  // Listen for auth-state-changed events with debouncing
  useEffect(() => {
    let authTimeout: number;
    
    const handleAuthStateChange = (e: any) => {
      clearTimeout(authTimeout);
      
      // If this is a logout event, update our local state
      if (e.detail?.action === 'logout') {
        setIsLogoutInProgress(true);
      } else if (e.detail?.action === 'login' || e.detail?.action === 'auth-restored') {
        // Reset logout flag for login events
        setIsLogoutInProgress(false);
      } else {
        authTimeout = setTimeout(() => {
          refreshUserData();
        }, 300);
      }
    };
    
    window.addEventListener('auth-state-changed', handleAuthStateChange);
    return () => {
      window.removeEventListener('auth-state-changed', handleAuthStateChange);
      clearTimeout(authTimeout);
    };
  }, [refreshUserData]);
  
  // Handle outside clicks for dropdowns
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

  // Close dropdowns on route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsRecipesDropdownOpen(false);
    setIsUserDropdownOpen(false);
  }, [pathname]);

  // Handle logout preparation
  useEffect(() => {
    const handlePrepareForLogout = () => {
      // Set local state to prevent re-renders during logout
      setIsLogoutInProgress(true);
      
      // Close all menus and dropdowns
      setIsMenuOpen(false);
      setIsRecipesDropdownOpen(false);
      setIsUserDropdownOpen(false);
    };
    
    window.addEventListener('prepare-for-logout', handlePrepareForLogout);
    return () => {
      window.removeEventListener('prepare-for-logout', handlePrepareForLogout);
    };
  }, []);

  // Memoized handlers
  const toggleMenu = useCallback(() => setIsMenuOpen(prev => !prev), []);
  const toggleRecipesDropdown = useCallback(() => setIsRecipesDropdownOpen(prev => !prev), []);
  const toggleUserDropdown = useCallback(() => setIsUserDropdownOpen(prev => !prev), []);
  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    setIsRecipesDropdownOpen(false);
    setIsUserDropdownOpen(false);
  }, []);
  
  const handleLogout = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default link behavior
    e.stopPropagation(); // Stop event bubbling
    
    // Close menu and set flags first to prevent React update issues
    closeMenu();
    setIsLogoutInProgress(true);
    
    // Set the logout flag in session storage
    sessionStorage.setItem('logout_in_progress', 'true');
    
    // Small delay to allow React to process UI updates
    setTimeout(() => {
      logout();
    }, 50);
  }, [logout, closeMenu]);
  
  // Path matching helpers
  const isActive = useCallback((path: string) => pathname === path, [pathname]);
  const isRecipeRouteActive = useCallback(() => {
    const recipeRoutes = ['/recipe/generator', '/recipe/create', '/recipe/my-recipes', '/recipes'];
    return recipeRoutes.some(route => pathname.startsWith(route));
  }, [pathname]);

  // CSS class helpers
  const navLinkClass = useCallback((active: boolean) => 
    `flex items-center px-3 py-2 rounded-lg transition-all duration-300 ${
      active 
        ? 'bg-gradient-to-r from-blue-500/20 to-blue-400/10 text-blue-600 font-medium dark:from-blue-500/30 dark:to-blue-400/20 dark:text-blue-300' 
        : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:scale-105'
    }`, []);
  
  // Modern dropdown style with improved animation and visual design
  const dropdownItemClass = useCallback((active: boolean) => 
    `flex items-center gap-2 px-4 py-2.5 text-sm transition-all duration-200 ${
      active 
        ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 dark:from-blue-900/40 dark:to-blue-800/30 dark:text-blue-300 font-medium' 
        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:translate-x-1'
    }`, []);
  
  // If logout is in progress, return a static but branded navbar
  if (isLogoutInProgress) {
    return (
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-md dark:bg-gray-800/95 dark:text-white border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent">
            SavorAI
          </span>
          <DarkModeToggle />
        </div>
      </nav>
    );
  }
  
  // Displayed username - use the most up-to-date value
  const displayedUsername = user?.username || currentUsername;
  
  return (
    <nav 
      ref={navbarRef}
      className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-md dark:bg-gray-800/95 dark:text-white border-b border-gray-200 dark:border-gray-700"
    >
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent hover:scale-105 transition-transform">
          SavorAI
        </Link>
        
        {/* Mobile buttons */}
        <div className="flex items-center gap-2 md:hidden">
          <DarkModeToggle />
          <button 
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors" 
            onClick={toggleMenu} 
            aria-label="Toggle menu"
          >
            <FaBars className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        
        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-3">
          <NavLink to="/" className={({isActive}) => navLinkClass(isActive)} key="nav-home">
            <FaHome className="mr-1.5" />
            Home
          </NavLink>
          
          {/* Contact link - visible to all users */}
          <NavLink to="/contact" className={({isActive}) => navLinkClass(isActive)} key="nav-contact">
            <FaEnvelope className="mr-1.5" />
            Contact
          </NavLink>
          
          {/* About link - only visible for non-authenticated users */}
          {!isAuthenticated && (
            <NavLink to="/about" className={({isActive}) => navLinkClass(isActive)} key="nav-about">
              <FaUser className="mr-1.5" />
              About
            </NavLink>
          )}
          
          {isAuthenticated && (
            <div className="relative" ref={recipesDropdownRef} key="nav-recipes">
              <button
                onClick={toggleRecipesDropdown}
                className={`${navLinkClass(isRecipeRouteActive())} group`}
                aria-expanded={isRecipesDropdownOpen}
                aria-haspopup="true"
              >
                <FaBook className="mr-1.5" />
                <span>Recipes</span>
                <span className={`ml-1 transition-transform duration-300 ${isRecipesDropdownOpen ? 'rotate-180' : 'rotate-0'} text-xs opacity-70`}>▼</span>
                <span className={`absolute bottom-0 left-0 h-0.5 bg-blue-500 transition-all duration-300 ${isRecipeRouteActive() ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </button>
              
              {isRecipesDropdownOpen && (
                <div className="absolute z-50 mt-1 w-52 bg-white dark:bg-gray-800 rounded-lg shadow-xl py-2 border border-gray-200 dark:border-gray-700 overflow-hidden animate-slideDown">
                  <Link to="/recipe/generator" className={dropdownItemClass(isActive('/recipe/generator'))} key="recipe-generator">
                    Generate Recipe
                  </Link>
                  <Link to="/recipe/create" className={dropdownItemClass(isActive('/recipe/create'))} key="recipe-create">
                    Create Recipe
                  </Link>
                  <Link to="/recipe/my-recipes" className={dropdownItemClass(isActive('/recipe/my-recipes'))} key="recipe-my-recipes">
                    My Recipes
                  </Link>
                </div>
              )}
            </div>
          )}
          
          {/* Favorites link - only for authenticated users */}
          {isAuthenticated && (
            <NavLink 
              to="/favorites" 
              className={({isActive}) => navLinkClass(isActive)}
              key="nav-favorites"
            >
              <FaHeart className="mr-1.5 text-red-500" />
              Favorites
            </NavLink>
          )}
          
          {isAuthenticated ? (
            <div className="relative" ref={userDropdownRef} key="nav-user">
              <button
                onClick={toggleUserDropdown}
                className={`${navLinkClass(pathname.startsWith('/profile'))} group flex items-center`}
                aria-expanded={isUserDropdownOpen}
                aria-haspopup="true"
              >
                <Avatar username={displayedUsername} className="w-6 h-6 mr-2" />
                <span>{displayedUsername}</span>
                <span className={`ml-1 transition-transform duration-300 ${isUserDropdownOpen ? 'rotate-180' : 'rotate-0'} text-xs opacity-70`}>▼</span>
                <span className={`absolute bottom-0 left-0 h-0.5 bg-blue-500 transition-all duration-300 ${pathname.startsWith('/profile') ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </button>
              
              {isUserDropdownOpen && (
                <div className="absolute right-0 z-50 mt-1 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl py-2 border border-gray-200 dark:border-gray-700 overflow-hidden animate-slideDown">
                  {/* User info header */}
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 mb-1">
                    <p className="font-medium text-sm">{displayedUsername}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                  </div>
                  
                  <Link to="/profile" className={dropdownItemClass(isActive('/profile'))} key="user-profile">
                    <FaUser className="text-blue-500" />
                    Profile
                  </Link>
                  
                  <Link to="/messages" className={dropdownItemClass(isActive('/messages'))} key="user-messages">
                    <FaEnvelope className="text-blue-500" />
                    Messages
                  </Link>
                  
                  {isAdmin && (
                    <Link to="/admin" className={dropdownItemClass(isActive('/admin'))} key="user-admin">
                      <FaUser className="text-red-500" />
                      Admin Panel
                    </Link>
                  )}
                  
                  <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1"></div>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:translate-x-1"
                    key="user-logout"
                  >
                    <FaSignOutAlt className="text-red-500" />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <NavLink to="/signin" className={({isActive}) => navLinkClass(isActive)} key="nav-signin">
                Sign In
              </NavLink>
              <NavLink 
                to="/signup" 
                className={({isActive}) => `${navLinkClass(isActive)} bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white px-4 py-2 rounded-lg hover:scale-105 transition-all`}
                key="nav-signup"
              >
                Sign Up
              </NavLink>
            </>
          )}
          
          <DarkModeToggle />
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={closeMenu}></div>
            <div className="fixed right-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-800 shadow-xl p-4 overflow-y-auto transform transition-transform duration-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Menu</h3>
                <button 
                  onClick={closeMenu}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="flex flex-col gap-2">
                <Link 
                  to="/" 
                  className={`px-4 py-2 rounded-lg ${isActive('/') ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  onClick={closeMenu}
                >
                  <FaHome className="inline mr-2" />
                  Home
                </Link>
                
                {/* Contact link - visible to all users in mobile menu */}
                <Link 
                  to="/contact" 
                  className={`px-4 py-2 rounded-lg ${isActive('/contact') ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  onClick={closeMenu}
                >
                  <FaEnvelope className="inline mr-2" />
                  Contact
                </Link>
                
                {/* About link - only visible for non-authenticated users in mobile menu */}
                {!isAuthenticated && (
                  <Link 
                    to="/about" 
                    className={`px-4 py-2 rounded-lg ${isActive('/about') ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    onClick={closeMenu}
                  >
                    <FaUser className="inline mr-2" />
                    About
                  </Link>
                )}
                
                {isAuthenticated && (
                  <>
                    <div className="px-4 py-2">
                      <button 
                        onClick={() => setIsRecipesDropdownOpen(!isRecipesDropdownOpen)}
                        className="flex items-center justify-between w-full"
                      >
                        <span className="flex items-center">
                          <FaBook className="inline mr-2" />
                          Recipes
                        </span>
                        <span className={`transition-transform duration-300 ${isRecipesDropdownOpen ? 'rotate-180' : 'rotate-0'} text-xs opacity-70`}>▼</span>
                      </button>
                      
                      {isRecipesDropdownOpen && (
                        <div className="mt-2 ml-4 border-l-2 border-gray-200 dark:border-gray-700 pl-4 flex flex-col gap-2">
                          <Link 
                            to="/recipe/generator" 
                            className="py-2 hover:text-blue-600 dark:hover:text-blue-300"
                            onClick={closeMenu}
                          >
                            Generate Recipe
                          </Link>
                          <Link 
                            to="/recipe/create" 
                            className="py-2 hover:text-blue-600 dark:hover:text-blue-300"
                            onClick={closeMenu}
                          >
                            Create Recipe
                          </Link>
                          <Link 
                            to="/recipe/my-recipes" 
                            className="py-2 hover:text-blue-600 dark:hover:text-blue-300"
                            onClick={closeMenu}
                          >
                            My Recipes
                          </Link>
                        </div>
                      )}
                    </div>
                    
                    {isAuthenticated && (
                      <Link 
                        to="/favorites" 
                        className={`px-4 py-2 rounded-lg ${isActive('/favorites') ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        onClick={closeMenu}
                      >
                        <FaHeart className="inline mr-2 text-red-500" />
                        Favorites
                      </Link>
                    )}
                    
                    <Link 
                      to="/profile" 
                      className={`px-4 py-2 rounded-lg ${isActive('/profile') ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                      onClick={closeMenu}
                    >
                      <FaUser className="inline mr-2" />
                      Profile
                    </Link>
                    
                    {isAdmin && (
                      <Link 
                        to="/admin" 
                        className={`px-4 py-2 rounded-lg ${isActive('/admin') ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        onClick={closeMenu}
                      >
                        <FaUser className="inline mr-2 text-red-500" />
                        Admin Panel
                      </Link>
                    )}
                    
                    <button 
                      onClick={handleLogout}
                      className="text-left px-4 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <FaSignOutAlt className="inline mr-2" />
                      Log Out
                    </button>
                  </>
                )}
                
                {!isAuthenticated && (
                  <>
                    <Link 
                      to="/signin" 
                      className={`px-4 py-2 rounded-lg ${isActive('/signin') ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                      onClick={closeMenu}
                    >
                      Sign In
                    </Link>
                    <Link 
                      to="/signup" 
                      className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                      onClick={closeMenu}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
                
                <div className="mt-4 flex justify-center">
                  <DarkModeToggle />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
});

// Add animation styles for the dropdown
const animationStyles = `
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-slideDown {
  animation: slideDown 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  transform-origin: top center;
  backface-visibility: hidden;
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease-out forwards;
}

/* Apply a subtle hover effect to dropdown items */
.absolute.z-50 a, .absolute.z-50 button {
  position: relative;
  transition: all 0.2s ease;
}

.absolute.z-50 a:before, .absolute.z-50 button:before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 0;
  background: currentColor;
  opacity: 0.08;
  transition: width 0.2s ease;
}

.absolute.z-50 a:hover:before, .absolute.z-50 button:hover:before {
  width: 4px;
}
`;

// Add styles to head if not already present
if (typeof document !== 'undefined') {
  const existingStyle = document.getElementById('navbar-animations');
  if (!existingStyle) {
    const style = document.createElement('style');
    style.id = 'navbar-animations';
    style.textContent = animationStyles;
    document.head.appendChild(style);
  }
}

export default Navbar; 