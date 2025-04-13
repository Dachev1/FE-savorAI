import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DarkModeToggle } from '../common';
import { FaHeart, FaBook, FaUser, FaEnvelope, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// Memoized Navbar component for better performance
const Navbar: React.FC = memo(() => {
  // Debug log was removed to keep console clean
  
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
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  
  // Track username for UI updates
  const [currentUsername, setCurrentUsername] = useState<string | undefined>(user?.username);

  // Scroll state for navbar styling
  const [hasScrolled, setHasScrolled] = useState(false);
  
  // Track scroll position for dynamic styling
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
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

  // Handle escape key for dropdowns
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsRecipesDropdownOpen(false);
        setIsUserDropdownOpen(false);
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns on route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsRecipesDropdownOpen(false);
    setIsUserDropdownOpen(false);
  }, [pathname]);

  // Handle mobile menu animation
  useEffect(() => {
    if (mobileMenuRef.current) {
      if (isMenuOpen) {
        document.body.style.overflow = 'hidden';
        // Animate in
        setTimeout(() => {
          if (mobileMenuRef.current) {
            mobileMenuRef.current.style.transform = 'translateX(0)';
          }
        }, 10);
      } else {
        document.body.style.overflow = '';
      }
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

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
  const toggleRecipesDropdown = useCallback(() => {
    setIsRecipesDropdownOpen(prev => !prev);
    setIsUserDropdownOpen(false);
  }, []);
  const toggleUserDropdown = useCallback(() => {
    setIsUserDropdownOpen(prev => !prev);
    setIsRecipesDropdownOpen(false);
  }, []);
  const closeMenu = useCallback(() => {
    // Animate out first for mobile menu
    if (mobileMenuRef.current) {
      mobileMenuRef.current.style.transform = 'translateX(100%)';
      // Wait for animation to complete
      setTimeout(() => {
        setIsMenuOpen(false);
        setIsRecipesDropdownOpen(false);
        setIsUserDropdownOpen(false);
      }, 300);
    } else {
      setIsMenuOpen(false);
      setIsRecipesDropdownOpen(false);
      setIsUserDropdownOpen(false);
    }
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

  // CSS class helpers - enhanced with better transitions and effects
  const navLinkClass = useCallback((active: boolean) => 
    `flex items-center px-3 py-2.5 rounded-lg transition-all duration-300 relative overflow-hidden ${
      active 
        ? 'bg-gradient-to-r from-blue-500/15 to-indigo-400/10 text-blue-600 font-medium dark:from-blue-500/25 dark:to-indigo-400/15 dark:text-blue-300 shadow-sm' 
        : 'hover:bg-gray-100/80 dark:hover:bg-gray-700/40 hover:scale-105 hover:shadow-sm'
    }`, []);
  
  // Modern dropdown style with improved animation and visual design
  const dropdownItemClass = useCallback((active: boolean) => 
    `flex items-center gap-2 px-4 py-2.5 text-sm transition-all duration-300 ${
      active 
        ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 dark:from-blue-900/40 dark:to-blue-800/30 dark:text-blue-300 font-medium' 
        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:translate-x-1 hover:text-blue-500 dark:hover:text-blue-300'
    }`, []);
  
  // If logout is in progress, return a static but branded navbar
  if (isLogoutInProgress) {
    return (
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm dark:bg-gray-900/95 dark:text-white border-b border-gray-100 dark:border-gray-800 transition-all duration-300">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent transition-all duration-300">
            SavorAI
          </div>
          <DarkModeToggle />
        </div>
      </nav>
    );
  }
  
  // Displayed username - use the most up-to-date value
  const displayedUsername = user?.username || currentUsername;
  
  return (
    <motion.nav 
      ref={navbarRef}
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`sticky top-0 z-50 backdrop-blur-md transition-all duration-300 ${
        hasScrolled 
          ? 'bg-white/97 dark:bg-gray-900/97 shadow-md' 
          : 'bg-white/95 dark:bg-gray-900/95 shadow-sm'
      } dark:text-white border-b border-gray-100 dark:border-gray-800`}
    >
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="animate-float"
        >
          <Link 
            to="/" 
            className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent transition-all duration-300 hover:from-indigo-500 hover:to-blue-600 dark:hover:from-indigo-300 dark:hover:to-blue-400"
          >
            SavorAI
          </Link>
        </motion.div>
        
        {/* Mobile buttons */}
        <div className="flex items-center gap-3 md:hidden">
          <DarkModeToggle className="mr-1" />
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500" 
            onClick={toggleMenu} 
            aria-label="Toggle menu"
          >
            <FaBars className="text-gray-600 dark:text-gray-300" />
          </motion.button>
        </div>
        
        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-4">
          {/* Contact link - visible to all users */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <NavLink to="/contact" className={({isActive}) => navLinkClass(isActive)} key="nav-contact">
              <FaEnvelope className="mr-1.5 text-blue-500 dark:text-blue-400" />
              <span>Contact</span>
              <span className="absolute inset-0 bg-current opacity-0 hover:opacity-5 transition-opacity duration-300 rounded-lg"></span>
            </NavLink>
          </motion.div>
          
          {/* About link - only visible for non-authenticated users */}
          {!isAuthenticated && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <NavLink to="/about" className={({isActive}) => navLinkClass(isActive)} key="nav-about">
                <FaUser className="mr-1.5 text-blue-500 dark:text-blue-400" />
                <span>About</span>
                <span className="absolute inset-0 bg-current opacity-0 hover:opacity-5 transition-opacity duration-300 rounded-lg"></span>
              </NavLink>
            </motion.div>
          )}
          
          {isAuthenticated && (
            <div className="relative" ref={recipesDropdownRef} key="nav-recipes">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleRecipesDropdown}
                className={`${navLinkClass(isRecipeRouteActive())} group`}
                aria-expanded={isRecipesDropdownOpen}
                aria-haspopup="true"
              >
                <FaBook className="mr-1.5 text-blue-500 dark:text-blue-400" />
                <span>Recipes</span>
                <motion.span 
                  animate={{ rotate: isRecipesDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="ml-1 text-xs opacity-70"
                >▼</motion.span>
                <span className={`absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300 ${isRecipeRouteActive() ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></span>
                <span className="absolute inset-0 bg-current opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-lg"></span>
              </motion.button>
              
              <AnimatePresence>
                {isRecipesDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute z-50 mt-2 w-52 bg-white dark:bg-gray-800 rounded-lg shadow-xl py-2 border border-gray-100 dark:border-gray-700 overflow-hidden"
                  >
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      variants={{
                        hidden: { opacity: 0 },
                        visible: {
                          opacity: 1,
                          transition: {
                            staggerChildren: 0.05
                          }
                        }
                      }}
                    >
                      <motion.div variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}>
                        <Link to="/recipe/generator" className={dropdownItemClass(isActive('/recipe/generator'))} key="recipe-generator">
                          <span className="text-blue-500 dark:text-blue-400 text-lg mr-1">•</span>
                          Generate Recipe
                        </Link>
                      </motion.div>
                      <motion.div variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}>
                        <Link to="/recipe/create" className={dropdownItemClass(isActive('/recipe/create'))} key="recipe-create">
                          <span className="text-blue-500 dark:text-blue-400 text-lg mr-1">•</span>
                          Create Recipe
                        </Link>
                      </motion.div>
                      <motion.div variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}>
                        <Link to="/recipe/my-recipes" className={dropdownItemClass(isActive('/recipe/my-recipes'))} key="recipe-my-recipes">
                          <span className="text-blue-500 dark:text-blue-400 text-lg mr-1">•</span>
                          My Recipes
                        </Link>
                      </motion.div>
                      <motion.div variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}>
                        <Link to="/recipes/feed" className={dropdownItemClass(isActive('/recipes/feed'))} key="recipe-feed">
                          <span className="text-blue-500 dark:text-blue-400 text-lg mr-1">•</span>
                          Recipe Feed
                        </Link>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          
          {/* Favorites link - only for authenticated users */}
          {isAuthenticated && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <NavLink 
                to="/favorites" 
                className={({isActive}) => navLinkClass(isActive)}
                key="nav-favorites"
              >
                <FaHeart className="mr-1.5 text-red-500" />
                <span>Favorites</span>
                <span className="absolute inset-0 bg-current opacity-0 hover:opacity-5 transition-opacity duration-300 rounded-lg"></span>
              </NavLink>
            </motion.div>
          )}
          
          {isAuthenticated ? (
            <div className="relative" ref={userDropdownRef} key="nav-user">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleUserDropdown}
                className={`${navLinkClass(pathname.startsWith('/profile'))} group flex items-center focus-ring`}
                aria-expanded={isUserDropdownOpen}
                aria-haspopup="true"
              >
                <motion.div 
                  whileHover={{ scale: 1.15 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold flex items-center justify-center mr-2 shadow-sm overflow-hidden transform transition-transform duration-300"
                >
                  {displayedUsername ? displayedUsername.charAt(0).toUpperCase() : 'U'}
                  <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                </motion.div>
                <span>{displayedUsername}</span>
                <motion.span 
                  animate={{ rotate: isUserDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="ml-1 text-xs opacity-70"
                >▼</motion.span>
                <span className={`absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300 ${pathname.startsWith('/profile') ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></span>
                <span className="absolute inset-0 bg-current opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-lg"></span>
              </motion.button>
              
              <AnimatePresence>
                {isUserDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute right-0 z-50 mt-2 w-56 bg-white/95 dark:bg-gray-800/95 rounded-lg shadow-xl py-2 border border-gray-100 dark:border-gray-700 overflow-hidden glass-effect"
                  >
                    {/* User info header with subtle animation */}
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 mb-1 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850"
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <motion.div 
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold flex items-center justify-center shadow-sm"
                        >
                          {displayedUsername ? displayedUsername.charAt(0).toUpperCase() : 'U'}
                        </motion.div>
                        <div>
                          <p className="font-medium text-sm">{displayedUsername}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                        </div>
                      </div>
                    </motion.div>
                    
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      variants={{
                        hidden: { opacity: 0 },
                        visible: {
                          opacity: 1,
                          transition: {
                            staggerChildren: 0.05
                          }
                        }
                      }}
                    >
                      <motion.div variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}>
                        <Link to="/profile" className={dropdownItemClass(isActive('/profile'))} key="user-profile">
                          <FaUser className="text-blue-500" />
                          <span>Profile</span>
                        </Link>
                      </motion.div>
                      
                      <motion.div variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}>
                        <Link to="/messages" className={dropdownItemClass(isActive('/messages'))} key="user-messages">
                          <FaEnvelope className="text-blue-500" />
                          <span>Messages</span>
                        </Link>
                      </motion.div>
                      
                      {isAdmin && (
                        <motion.div variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}>
                          <Link to="/admin" className={dropdownItemClass(isActive('/admin'))} key="user-admin">
                            <FaUser className="text-red-500" />
                            <span>Admin Panel</span>
                          </Link>
                        </motion.div>
                      )}
                      
                      <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
                        <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1"></div>
                      </motion.div>
                      
                      <motion.div variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}>
                        <motion.button 
                          whileHover={{ x: 4, backgroundColor: "rgba(254, 226, 226, 0.3)" }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleLogout}
                          className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 transition-all duration-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                          key="user-logout"
                        >
                          <FaSignOutAlt className="text-red-500" />
                          <span>Log Out</span>
                        </motion.button>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <NavLink 
                  to="/signin" 
                  className={({isActive}) => `${navLinkClass(isActive)} px-4 relative overflow-hidden`}
                  key="nav-signin"
                >
                  <span>Sign In</span>
                  <span className="absolute inset-0 bg-current opacity-0 hover:opacity-5 transition-opacity duration-300 rounded-lg"></span>
                </NavLink>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05, y: -2 }} 
                whileTap={{ scale: 0.95 }}
                className="shadow-sm hover:shadow-md transition-all duration-300"
              >
                <NavLink 
                  to="/signup" 
                  className="flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white transform relative overflow-hidden gradient-hover pulse-on-hover"
                  key="nav-signup"
                >
                  <span className="relative z-10">Sign Up</span>
                  <span className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-300"></span>
                </NavLink>
              </motion.div>
            </>
          )}
          
          <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
            <DarkModeToggle className="ml-1 transition-all duration-200" />
          </motion.div>
        </div>
        
        {/* Mobile menu with improved animations */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
                onClick={closeMenu}
              />
              <motion.div 
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                ref={mobileMenuRef}
                className="fixed right-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-800 shadow-xl p-5 overflow-y-auto z-50 md:hidden"
              >
                <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-100 dark:border-gray-700">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent hover:from-indigo-500 hover:to-blue-600 transition-all duration-300" onClick={closeMenu}>
                      SavorAI
                    </Link>
                  </motion.div>
                  <motion.button 
                    whileHover={{ rotate: 90, scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={closeMenu}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                    aria-label="Close menu"
                  >
                    <FaTimes className="text-gray-500 dark:text-gray-400" />
                  </motion.button>
                </div>
                
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.07,
                        delayChildren: 0.1
                      }
                    }
                  }}
                  className="flex flex-col gap-2"
                >
                  {/* Contact link - visible to all users in mobile menu */}
                  <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
                    <Link 
                      to="/contact" 
                      className={`px-4 py-3 rounded-lg flex items-center transform transition-all duration-200 active:scale-97 ${isActive('/contact') ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 dark:from-blue-900/30 dark:to-blue-800/20 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                      onClick={closeMenu}
                    >
                      <FaEnvelope className="mr-3 text-blue-500" />
                      Contact
                    </Link>
                  </motion.div>
                  
                  {/* About link - only visible for non-authenticated users in mobile menu */}
                  {!isAuthenticated && (
                    <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
                      <Link 
                        to="/about" 
                        className={`px-4 py-3 rounded-lg flex items-center transform transition-all duration-200 active:scale-97 ${isActive('/about') ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 dark:from-blue-900/30 dark:to-blue-800/20 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        onClick={closeMenu}
                      >
                        <FaUser className="mr-3 text-blue-500" />
                        About
                      </Link>
                    </motion.div>
                  )}
                  
                  {isAuthenticated && (
                    <>
                      <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
                        <div className="px-4 py-2">
                          <button 
                            onClick={() => setIsRecipesDropdownOpen(!isRecipesDropdownOpen)}
                            className="flex items-center justify-between w-full py-2 transform transition-all duration-200 active:scale-97"
                          >
                            <span className="flex items-center">
                              <FaBook className="mr-3 text-blue-500" />
                              Recipes
                            </span>
                            <motion.span 
                              animate={{ rotate: isRecipesDropdownOpen ? 180 : 0 }}
                              transition={{ duration: 0.3 }}
                              className="text-xs opacity-70"
                            >▼</motion.span>
                          </button>
                          
                          <AnimatePresence>
                            {isRecipesDropdownOpen && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="mt-2 ml-4 border-l-2 border-blue-200 dark:border-blue-700 pl-4 flex flex-col gap-2 overflow-hidden"
                              >
                                <motion.div variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} transition={{ delay: 0.1 }}>
                                  <Link 
                                    to="/recipe/generator" 
                                    className="py-2 hover:text-blue-600 dark:hover:text-blue-300 transition-all duration-200 hover:translate-x-1"
                                    onClick={closeMenu}
                                  >
                                    Generate Recipe
                                  </Link>
                                </motion.div>
                                <motion.div variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} transition={{ delay: 0.2 }}>
                                  <Link 
                                    to="/recipe/create" 
                                    className="py-2 hover:text-blue-600 dark:hover:text-blue-300 transition-all duration-200 hover:translate-x-1"
                                    onClick={closeMenu}
                                  >
                                    Create Recipe
                                  </Link>
                                </motion.div>
                                <motion.div variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} transition={{ delay: 0.3 }}>
                                  <Link 
                                    to="/recipe/my-recipes" 
                                    className="py-2 hover:text-blue-600 dark:hover:text-blue-300 transition-all duration-200 hover:translate-x-1"
                                    onClick={closeMenu}
                                  >
                                    My Recipes
                                  </Link>
                                </motion.div>
                                <motion.div variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} transition={{ delay: 0.4 }}>
                                  <Link 
                                    to="/recipes/feed" 
                                    className="py-2 hover:text-blue-600 dark:hover:text-blue-300 transition-all duration-200 hover:translate-x-1"
                                    onClick={closeMenu}
                                  >
                                    Recipe Feed
                                  </Link>
                                </motion.div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                      
                      {isAuthenticated && (
                        <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
                          <Link 
                            to="/favorites" 
                            className={`px-4 py-3 rounded-lg flex items-center transform transition-all duration-200 active:scale-97 ${isActive('/favorites') ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 dark:from-blue-900/30 dark:to-blue-800/20 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            onClick={closeMenu}
                          >
                            <FaHeart className="mr-3 text-red-500" />
                            Favorites
                          </Link>
                        </motion.div>
                      )}
                      
                      <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
                        <Link 
                          to="/profile" 
                          className={`px-4 py-3 rounded-lg flex items-center transform transition-all duration-200 active:scale-97 ${isActive('/profile') ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 dark:from-blue-900/30 dark:to-blue-800/20 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                          onClick={closeMenu}
                        >
                          <FaUser className="mr-3 text-blue-500" />
                          Profile
                        </Link>
                      </motion.div>
                      
                      {isAdmin && (
                        <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
                          <Link 
                            to="/admin" 
                            className={`px-4 py-3 rounded-lg flex items-center transform transition-all duration-200 active:scale-97 ${isActive('/admin') ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 dark:from-blue-900/30 dark:to-blue-800/20 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            onClick={closeMenu}
                          >
                            <FaUser className="mr-3 text-red-500" />
                            Admin Panel
                          </Link>
                        </motion.div>
                      )}
                      
                      <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
                        <motion.button 
                          whileHover={{ x: 5, backgroundColor: "rgba(254, 202, 202, 0.2)" }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleLogout}
                          className="text-left w-full px-4 py-3 rounded-lg flex items-center text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transform transition-all duration-200"
                        >
                          <FaSignOutAlt className="mr-3 text-red-500" />
                          Log Out
                        </motion.button>
                      </motion.div>
                    </>
                  )}
                  
                  {!isAuthenticated && (
                    <>
                      <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
                        <Link 
                          to="/signin" 
                          className={`px-4 py-3 rounded-lg flex items-center transform transition-all duration-200 active:scale-97 ${isActive('/signin') ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 dark:from-blue-900/30 dark:to-blue-800/20 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                          onClick={closeMenu}
                        >
                          Sign In
                        </Link>
                      </motion.div>

                      <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
                        <Link 
                          to="/signup" 
                          className="px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white mt-2 transform transition-all duration-200 active:scale-97 hover:shadow-md flex items-center"
                          onClick={closeMenu}
                        >
                          Sign Up
                        </Link>
                      </motion.div>
                    </>
                  )}
                  
                  <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-center">
                      <motion.div whileHover={{ scale: 1.2, rotate: 15 }} whileTap={{ scale: 0.8 }}>
                        <DarkModeToggle className="transform transition-all duration-200" />
                      </motion.div>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
});

// Enhanced animation styles for modern UI/UX
const animationStyles = `
/* Dropdown animations */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.98);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
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

@keyframes floatUp {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
  100% {
    transform: translateY(0);
  }
}

.animate-slideDown {
  animation: slideDown 0.3s cubic-bezier(0.2, 0.9, 0.3, 1.0) forwards;
  transform-origin: top center;
  backface-visibility: hidden;
  will-change: transform, opacity;
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease-out forwards;
}

.animate-float {
  animation: floatUp 2s ease-in-out infinite;
}

/* Modern hover effects for buttons */
@keyframes buttonPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(59, 130, 246, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
  }
}

.pulse-on-hover:hover {
  animation: buttonPulse 1.5s infinite;
}

/* Glassmorphism effects */
.glass-effect {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.dark .glass-effect {
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

/* Apply a subtle hover effect to dropdown items */
.absolute.z-50 a, .absolute.z-50 button {
  position: relative;
  transition: all 0.3s ease;
  will-change: transform;
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
  transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.absolute.z-50 a:hover:before, .absolute.z-50 button:hover:before {
  width: 4px;
}

/* Advanced scale effects for active elements */
.active\\:scale-95:active {
  transform: scale(0.95);
}

.active\\:scale-97:active {
  transform: scale(0.97);
}

/* Page transition effects */
.page-enter {
  opacity: 0;
  transform: translateY(5px);
}

.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 300ms, transform 300ms;
}

.page-exit {
  opacity: 1;
}

.page-exit-active {
  opacity: 0;
  transform: translateY(-5px);
  transition: opacity 200ms, transform 200ms;
}

/* Gradient hover effects */
.gradient-hover {
  background-size: 200% 200%;
  transition: background-position 0.5s ease;
}

.gradient-hover:hover {
  background-position: right center;
}

/* Micro-interactions */
.menu-item {
  transform-origin: left;
  transition: transform 0.3s ease;
}

.menu-item:hover {
  transform: translateX(5px);
}

/* Focus ring for accessibility */
.focus-ring:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
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