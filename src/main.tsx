import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DarkModeProvider } from './context/DarkModeContext';
import ToastProvider from './context/ToastContext';
import App from './App';
import './index.css';
import 'aos/dist/aos.css';

// Initialize root with proper type checking
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find root element');

const root = createRoot(rootElement);

// Render the app with proper provider order
root.render(
  <StrictMode>
    <Router>
      <ToastProvider>
        <DarkModeProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </DarkModeProvider>
      </ToastProvider>
    </Router>
  </StrictMode>
);
