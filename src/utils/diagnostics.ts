import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import DiagnosticsComponent from '../components/Diagnostics';
import { createRoot } from 'react-dom/client';

/**
 * Initialize the diagnostic mode if needed
 * Only available in development mode, does nothing in production
 * @param rootElement The DOM element to mount diagnostics to
 * @returns Boolean indicating if diagnostics were initialized
 */
export function initDiagnostics(rootElement: HTMLElement | null): boolean {
  // Diagnostics flag from URL or localStorage
  const hasDiagnosticsFlag = 
    window.location.search.includes('diagnostics=true') ||
    localStorage.getItem('enable_diagnostics') === 'true';
  
  // Only initialize in development mode
  if (import.meta.env.DEV && hasDiagnosticsFlag && rootElement) {
    console.log('Initializing diagnostics mode');
    
    const root = createRoot(rootElement);
    root.render(
      React.createElement(
        React.StrictMode,
        null,
        React.createElement(
          BrowserRouter,
          null,
          React.createElement(DiagnosticsComponent, null)
        )
      )
    );
    
    return true;
  }
  
  return false;
}

/**
 * Set diagnostic mode
 * @param enable Whether to enable diagnostics mode
 */
export function setDiagnosticsMode(enable: boolean): void {
  if (enable) {
    localStorage.setItem('enable_diagnostics', 'true');
  } else {
    localStorage.removeItem('enable_diagnostics');
  }
  
  // Reload with query parameter
  window.location.href = enable
    ? `${window.location.pathname}?diagnostics=true`
    : window.location.pathname;
}

/**
 * Toggle diagnostic mode
 * Only available in development mode, does nothing in production
 */
export function toggleDiagnosticsMode(): void {
  if (!import.meta.env.DEV) return;
  
  const isEnabled = localStorage.getItem('enable_diagnostics') === 'true';
  setDiagnosticsMode(!isEnabled);
}

export default {
  initDiagnostics,
  setDiagnosticsMode,
  toggleDiagnosticsMode
}; 