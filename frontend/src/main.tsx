import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DarkModeProvider } from './context/DarkModeContext';
import ToastProvider from './context/ToastContext';
import Layout from './components/layout/Layout';
import App from './App';
import './styles/index.css';
import './styles/globals.css';
import 'aos/dist/aos.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <DarkModeProvider>
          <ToastProvider>
            <Layout>
              <App />
            </Layout>
          </ToastProvider>
        </DarkModeProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);
