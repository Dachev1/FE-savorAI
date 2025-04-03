import { StrictMode } from 'react';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DarkModeProvider } from './context/DarkModeContext';
import { ToastProvider } from './context/ToastContext';
import App from './App';
import { FaHeart } from 'react-icons/fa';
// Import CSS conditionally with error handling
try {
  import('./index.css');
  import('aos/dist/aos.css');
} catch (e) {
  console.warn('Failed to load CSS files:', e);
}

// Create a diagnostics component to troubleshoot rendering issues
const DiagnosticsComponent = () => {
  console.log('DiagnosticsComponent rendering');
  
  const clearAllStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    console.log('All storage cleared');
    window.location.reload();
  };
  
  const environmentInfo = {
    apiUrl: import.meta.env.VITE_API_URL || 'Not set',
    mode: import.meta.env.MODE,
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD
  };
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">SavorAI Diagnostics</h1>
      
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-2">Environment Info</h2>
        <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-auto text-sm">
          {JSON.stringify(environmentInfo, null, 2)}
        </pre>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-2">Browser Storage</h2>
        <h3 className="font-medium mt-2">Local Storage</h3>
        <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-auto text-sm mb-4">
          {JSON.stringify(Object.entries(localStorage).reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
          }, {} as Record<string, string>), null, 2)}
        </pre>
        
        <h3 className="font-medium mt-2">Session Storage</h3>
        <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-auto text-sm">
          {JSON.stringify(Object.entries(sessionStorage).reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
          }, {} as Record<string, string>), null, 2)}
        </pre>
      </div>
      
      <div className="flex gap-4">
        <button 
          onClick={clearAllStorage}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Clear All Storage & Reload
        </button>
        
        <button 
          onClick={() => window.location.href = '/'}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go to Home Page
        </button>
        
        <button 
          onClick={() => window.location.href = '/signin'}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Go to Sign In Page
        </button>
      </div>
    </div>
  );
};

// Use this flag to switch between normal app and diagnostics
const useDiagnostics = false;

// Add a simple check for banned users on application startup
import auth from './utils/auth';

// Check for banned status on app init
const checkBannedStatus = () => {
  if (auth.isUserBanned()) {
    console.warn('Banned user detected, clearing auth state');
    auth.clearAuth();
    // If window is available (browser environment), show alert
    if (typeof window !== 'undefined') {
      window.alert('Your account has been banned. You have been logged out.');
      // Redirect to login page
      window.location.href = '/signin';
    }
    return true;
  }
  return false;
};

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find root element');

const root = createRoot(rootElement);

// Simple error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{ 
          padding: '20px', 
          margin: '20px auto', 
          maxWidth: '600px', 
          backgroundColor: '#fff8f8', 
          border: '1px solid #ffcdd2',
          borderRadius: '8px'
        }}>
          <h2 style={{ color: '#d32f2f' }}>Something went wrong</h2>
          <details>
            <summary>Error details</summary>
            <pre style={{ 
              whiteSpace: 'pre-wrap', 
              backgroundColor: '#f5f5f5', 
              padding: '10px', 
              borderRadius: '4px' 
            }}>
              {this.state.error?.toString()}
            </pre>
          </details>
          <div style={{ marginTop: '20px' }}>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '8px 16px',
                backgroundColor: '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

if (useDiagnostics) {
  // Render diagnostics only (no auth or other providers)
  root.render(
    <StrictMode>
      <BrowserRouter>
        <DiagnosticsComponent />
      </BrowserRouter>
    </StrictMode>
  );
} else {
  // Run the check before rendering the app
  if (!checkBannedStatus()) {
    // Only render if not banned
    root.render(
      <StrictMode>
        <ErrorBoundary>
          <BrowserRouter>
            <ToastProvider>
              <DarkModeProvider>
                <AuthProvider>
                  <App />
                </AuthProvider>
              </DarkModeProvider>
            </ToastProvider>
          </BrowserRouter>
        </ErrorBoundary>
      </StrictMode>
    );
  }
}

// Near the end of your main.tsx file, after mounting the React app
document.documentElement.classList.add('js-loaded');
document.documentElement.classList.remove('loading');

// Logout SafeGuard - React DOM manipulation protection
document.addEventListener('DOMContentLoaded', () => {
  // Flag to track logout state
  let logoutInProgress = false;

  // Create a specialized safety layer for React DOM operations
  const SafeGuard = {
    // Store original DOM methods for later restoration
    originalMethods: {
      removeChild: Node.prototype.removeChild,
      insertBefore: Node.prototype.insertBefore,
      appendChild: Node.prototype.appendChild,
      replaceChild: Node.prototype.replaceChild,
      pushState: window.history.pushState,
      replaceState: window.history.replaceState
    },

    // Event handler references
    boundHandlers: {
      blockNavigation: null as ((e: Event) => void) | null,
      authStateChanged: null as ((e: Event) => void) | null,
      prepareForLogout: null as ((e: Event) => void) | null,
      cleanup: null as ((e: Event) => void) | null
    },

    // Initialize protection mechanisms
    init() {
      // Override DOM methods with safe versions
      this.protectDOMMethods();
      
      // Override React Router navigation methods
      this.protectReactRouter();
      
      // Set up event listeners for logout flow
      this.setupEventListeners();

      // If logout was in progress but page was reloaded, cleanup
      if (sessionStorage.getItem('logout_in_progress') === 'true') {
        sessionStorage.removeItem('logout_in_progress');
        document.documentElement.removeAttribute('data-logout-in-progress');
      }
    },

    // Protect React Router from navigating during logout
    protectReactRouter() {
      // Block history pushState/replaceState during logout
      window.history.pushState = function(...args) {
        // Check if logout is in progress
        if (logoutInProgress || sessionStorage.getItem('logout_in_progress') === 'true') {
          console.log('Navigation blocked during logout');
          return null;
        }
        
        // @ts-ignore - Arguments are correct
        return SafeGuard.originalMethods.pushState.apply(this, args);
      };
      
      window.history.replaceState = function(...args) {
        // Check if logout is in progress
        if (logoutInProgress || sessionStorage.getItem('logout_in_progress') === 'true') {
          console.log('History replace blocked during logout');
          return null;
        }
        
        // @ts-ignore - Arguments are correct
        return SafeGuard.originalMethods.replaceState.apply(this, args);
      };
    },

    // Create safe versions of DOM methods to prevent errors
    protectDOMMethods() {
      // Safe removeChild that doesn't throw when child is missing
      Node.prototype.removeChild = function<T extends Node>(this: Node, child: T): T {
        try {
          if (!this.contains(child)) {
            return child;
          }
          return SafeGuard.originalMethods.removeChild.call(this, child) as T;
        } catch (e) {
          return child;
        }
      };

      // Safe insertBefore that handles missing reference nodes
      Node.prototype.insertBefore = function<T extends Node>(
        this: Node, 
        newNode: T, 
        referenceNode: Node | null
      ): T {
        try {
          if (!referenceNode || !this.contains(referenceNode)) {
            return this.appendChild(newNode) as T;
          }
          return SafeGuard.originalMethods.insertBefore.call(
            this, 
            newNode, 
            referenceNode
          ) as T;
        } catch (e) {
          return this.appendChild(newNode) as T;
        }
      };

      // Safe appendChild
      Node.prototype.appendChild = function<T extends Node>(this: Node, child: T): T {
        try {
          return SafeGuard.originalMethods.appendChild.call(this, child) as T;
        } catch (e) {
          return child;
        }
      };

      // Safe replaceChild
      Node.prototype.replaceChild = function<T extends Node>(
        this: Node, 
        newChild: Node, 
        oldChild: Node
      ): Node {
        try {
          if (!this.contains(oldChild)) {
            this.appendChild(newChild);
            return oldChild;
          }
          return SafeGuard.originalMethods.replaceChild.call(this, newChild, oldChild);
        } catch (e) {
          return oldChild;
        }
      } as typeof Node.prototype.replaceChild;
    },

    // Set up event listeners for the logout process
    setupEventListeners() {
      // Bind all event handlers with proper 'this' context
      this.boundHandlers.prepareForLogout = this.handleLogoutStart.bind(this);
      this.boundHandlers.authStateChanged = this.handleAuthStateChange.bind(this);
      this.boundHandlers.cleanup = this.handleCleanup.bind(this);
      this.boundHandlers.blockNavigation = this.blockNavigation.bind(this);

      // Listen for the logout preparation event
      window.addEventListener('prepare-for-logout', this.boundHandlers.prepareForLogout);
      
      // Listen for auth state changes
      window.addEventListener('auth-state-changed', this.boundHandlers.authStateChanged);
      
      // Listen for the cleanup event
      window.addEventListener('cleanup-components', this.boundHandlers.cleanup);
      
      // Handle page unload during logout
      window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    },

    // Handle the start of the logout process
    handleLogoutStart() {
      logoutInProgress = true;
      sessionStorage.setItem('logout_in_progress', 'true');
      document.documentElement.setAttribute('data-logout-in-progress', 'true');
      
      // Block any navigation attempts during logout
      window.addEventListener('click', this.boundHandlers.blockNavigation as EventListener, true);
      
      // Protect all NavLink and Link components from React
      this.detachReactRouterLinks();
    },

    // Block all navigation attempts during logout
    blockNavigation(e: Event) {
      // Skip if not during logout
      if (!logoutInProgress && !sessionStorage.getItem('logout_in_progress')) {
        return;
      }
      
      // Find the closest link
      let element = e.target as HTMLElement;
      while (element && element !== document.body) {
        if (element.tagName === 'A' || 
            element.getAttribute('role') === 'link' || 
            element.classList.contains('nav-link')) {
          e.preventDefault();
          e.stopPropagation();
          console.log('Navigation attempt blocked during logout');
          return false;
        }
        element = element.parentElement as HTMLElement;
      }
    },

    // Detach React Router links to prevent navigation and DOM manipulation
    detachReactRouterLinks() {
      // Find all router links and navigation elements
      const navElements = document.querySelectorAll('a[href], [role="link"], .nav-link');
      
      navElements.forEach(link => {
        if (link instanceof HTMLElement) {
          try {
            // Mark as protected
            link.dataset.protectedDuringLogout = 'true';
            
            // Make a non-interactive clone
            const clone = link.cloneNode(true) as HTMLElement;
            
            // Block all interactions
            clone.style.pointerEvents = 'none';
            clone.addEventListener('click', e => {
              e.preventDefault();
              e.stopPropagation();
              return false;
            }, true);
            
            // Replace in DOM if parent exists
            if (link.parentNode) {
              try {
                link.parentNode.replaceChild(clone, link);
              } catch (e) {
                // Ignore if parent is no longer available
              }
            }
          } catch (e) {
            // Silently continue if element can't be detached
          }
        }
      });
    },

    // Handle auth state changes
    handleAuthStateChange(e: any) {
      if (e.detail?.action === 'logout') {
        setTimeout(() => {
          try {
            // Force reload if needed
            if (document.documentElement.getAttribute('data-logout-in-progress') === 'true') {
              this.forceCleanReload();
              return;
            }
            
            // Normal cleanup
            logoutInProgress = false;
            sessionStorage.removeItem('logout_in_progress');
            document.documentElement.removeAttribute('data-logout-in-progress');
            
            // Restore normal navigation
            this.restoreNavigation();
          } catch (error) {
            this.forceCleanReload();
          }
        }, 300);
      } else if (e.detail?.action === 'login') {
        // Ensure navigation is restored after login
        this.restoreNavigation();
        
        // Reset logout flags
        logoutInProgress = false;
        sessionStorage.removeItem('logout_in_progress');
        document.documentElement.removeAttribute('data-logout-in-progress');
      }
    },

    // Restore normal navigation behavior
    restoreNavigation() {
      // Remove any click blockers
      if (this.boundHandlers.blockNavigation) {
        window.removeEventListener('click', this.boundHandlers.blockNavigation as EventListener, true);
      }
      
      // Clear any protected attributes from links
      document.querySelectorAll('[data-protected-during-logout="true"]').forEach(el => {
        if (el instanceof HTMLElement) {
          delete el.dataset.protectedDuringLogout;
        }
      });
    },

    // Clean up after logout
    handleCleanup() {
      logoutInProgress = false;
      sessionStorage.removeItem('logout_in_progress');
      document.documentElement.removeAttribute('data-logout-in-progress');
      
      // Remove the navigation blocker if it exists
      if (this.boundHandlers.blockNavigation) {
        window.removeEventListener('click', this.boundHandlers.blockNavigation as EventListener, true);
      }

      // Note: We intentionally keep the DOM method protections active
      // to guard against any future React errors, not just during logout
    },

    // Handle unload during logout
    handleBeforeUnload() {
      if (logoutInProgress || sessionStorage.getItem('logout_in_progress') === 'true') {
        // Prevent React cleanup on unload by freezing DOM operations
        this.freezeDOMMethods();
      }
    },

    // Freeze DOM methods to prevent any changes during unload
    freezeDOMMethods() {
      // Return immediately for all methods to prevent any DOM modifications
      Node.prototype.removeChild = function(this: Node) { return arguments[0]; };
      Node.prototype.insertBefore = function(this: Node) { return arguments[0]; };
      Node.prototype.appendChild = function(this: Node) { return arguments[0]; };
      Node.prototype.replaceChild = function(this: Node) { return arguments[0]; };
    },

    // Force a clean reload of the page
    forceCleanReload() {
      sessionStorage.removeItem('logout_in_progress');
      sessionStorage.removeItem('dom_errors_during_logout');
      window.location.reload();
    }
  };

  // Initialize the SafeGuard
  SafeGuard.init();
});
