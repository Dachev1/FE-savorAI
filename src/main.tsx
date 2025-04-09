import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, ThemeProvider, ToastProvider } from './context';
import App from './App';
import ErrorBoundary from './components/common/ErrorBoundary';
import { auth, safeGuard, diagnostics } from './utils';

// Import CSS files
import './index.css';
import 'aos/dist/aos.css';

// Check for banned status
const checkBannedStatus = (): boolean => {
  if (auth.isUserBanned()) {
    auth.clearAuth();
    if (typeof window !== 'undefined') {
      window.alert('Your account has been banned. You have been logged out.');
      window.location.href = '/signin';
    }
    return true;
  }
  return false;
};

// Initialize application
const initApp = (): void => {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('Failed to find root element');

  if (diagnostics.initDiagnostics(rootElement)) {
    return;
  }

  const root = createRoot(rootElement);

  if (!checkBannedStatus()) {
    root.render(
      <ErrorBoundary>
        <BrowserRouter>
          <ToastProvider>
            <ThemeProvider>
              <AuthProvider>
                <App />
              </AuthProvider>
            </ThemeProvider>
          </ToastProvider>
        </BrowserRouter>
      </ErrorBoundary>
    );
  }

  document.documentElement.classList.add('js-loaded');
  document.documentElement.classList.remove('loading');
};

// Start the application
initApp();

// Initialize SafeGuard
document.addEventListener('DOMContentLoaded', () => {
  safeGuard.init();
});
