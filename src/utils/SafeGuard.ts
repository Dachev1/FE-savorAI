/**
 * SafeGuard - React DOM manipulation protection
 * 
 * Provides a safety layer to prevent DOM manipulation errors during logout
 * and other sensitive operations that could cause React rendering issues.
 */

class SafeGuard {
  // Original DOM methods stored for later restoration
  private originalMethods = {
    removeChild: Node.prototype.removeChild,
    insertBefore: Node.prototype.insertBefore,
    appendChild: Node.prototype.appendChild,
    replaceChild: Node.prototype.replaceChild,
    pushState: window.history.pushState,
    replaceState: window.history.replaceState
  };

  // Flag to track logout state
  private logoutInProgress = false;

  // Event handler references
  private boundHandlers = {
    blockNavigation: null as ((e: Event) => void) | null,
    authStateChanged: null as ((e: Event) => void) | null,
    prepareForLogout: null as ((e: Event) => void) | null,
    cleanup: null as ((e: Event) => void) | null
  };

  /**
   * Initialize SafeGuard protections
   */
  public init(): void {
    this.protectDOMMethods();
    this.protectReactRouter();
    this.setupEventListeners();

    // If logout was in progress but page was reloaded, cleanup
    if (sessionStorage.getItem('logout_in_progress') === 'true') {
      sessionStorage.removeItem('logout_in_progress');
      document.documentElement.removeAttribute('data-logout-in-progress');
    }
  }

  /**
   * Protect React Router from navigating during logout
   */
  private protectReactRouter(): void {
    const self = this;
    
    window.history.pushState = function(...args) {
      if (self.logoutInProgress || sessionStorage.getItem('logout_in_progress') === 'true') {
        console.log('Navigation blocked during logout');
        return null;
      }
      // @ts-ignore - Arguments are correct
      return self.originalMethods.pushState.apply(this, args);
    };
    
    window.history.replaceState = function(...args) {
      if (self.logoutInProgress || sessionStorage.getItem('logout_in_progress') === 'true') {
        console.log('History replace blocked during logout');
        return null;
      }
      // @ts-ignore - Arguments are correct
      return self.originalMethods.replaceState.apply(this, args);
    };
  }

  /**
   * Create safe versions of DOM methods to prevent errors
   */
  private protectDOMMethods(): void {
    const self = this;
    
    Node.prototype.removeChild = function<T extends Node>(this: Node, child: T): T {
      try {
        if (!this.contains(child)) return child;
        return self.originalMethods.removeChild.call(this, child) as T;
      } catch (e) {
        return child;
      }
    };

    Node.prototype.insertBefore = function<T extends Node>(
      this: Node, 
      newNode: T, 
      referenceNode: Node | null
    ): T {
      try {
        if (!referenceNode || !this.contains(referenceNode)) {
          return this.appendChild(newNode) as T;
        }
        return self.originalMethods.insertBefore.call(
          this, newNode, referenceNode
        ) as T;
      } catch (e) {
        return this.appendChild(newNode) as T;
      }
    };

    Node.prototype.appendChild = function<T extends Node>(this: Node, child: T): T {
      try {
        return self.originalMethods.appendChild.call(this, child) as T;
      } catch (e) {
        return child;
      }
    };

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
        return self.originalMethods.replaceChild.call(this, newChild, oldChild);
      } catch (e) {
        return oldChild;
      }
    } as typeof Node.prototype.replaceChild;
  }

  /**
   * Set up event listeners for the logout process
   */
  private setupEventListeners(): void {
    this.boundHandlers.prepareForLogout = this.handleLogoutStart.bind(this);
    this.boundHandlers.authStateChanged = this.handleAuthStateChange.bind(this);
    this.boundHandlers.cleanup = this.handleCleanup.bind(this);
    this.boundHandlers.blockNavigation = this.blockNavigation.bind(this);

    window.addEventListener('prepare-for-logout', this.boundHandlers.prepareForLogout);
    window.addEventListener('auth-state-changed', this.boundHandlers.authStateChanged);
    window.addEventListener('cleanup-components', this.boundHandlers.cleanup);
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
  }

  /**
   * Handle the start of the logout process
   */
  private handleLogoutStart(): void {
    this.logoutInProgress = true;
    sessionStorage.setItem('logout_in_progress', 'true');
    document.documentElement.setAttribute('data-logout-in-progress', 'true');
    
    window.addEventListener('click', this.boundHandlers.blockNavigation as EventListener, true);
  }

  /**
   * Block all navigation attempts during logout
   */
  private blockNavigation(e: Event): boolean | void {
    if (!this.logoutInProgress && !sessionStorage.getItem('logout_in_progress')) {
      return;
    }
    
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
    return;
  }

  /**
   * Handle auth state changes
   */
  private handleAuthStateChange(e: any): void {
    if (e?.detail?.action === 'logout') {
      this.logoutInProgress = false;
      sessionStorage.removeItem('logout_in_progress');
      document.documentElement.removeAttribute('data-logout-in-progress');
      
      if (this.boundHandlers.blockNavigation) {
        window.removeEventListener('click', this.boundHandlers.blockNavigation as EventListener, true);
      }
    }
  }

  /**
   * Handle cleanup event
   */
  private handleCleanup(): void {
    this.logoutInProgress = false;
  }

  /**
   * Handle page unload during logout
   */
  private handleBeforeUnload(): void {
    if (this.logoutInProgress || sessionStorage.getItem('logout_in_progress') === 'true') {
      sessionStorage.removeItem('logout_in_progress');
    }
  }
}

// Create singleton instance
const safeGuard = new SafeGuard();

// Export singleton
export default safeGuard; 