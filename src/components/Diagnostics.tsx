import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';

/**
 * Diagnostics component for troubleshooting app issues
 * This is separated from main.tsx to keep the entry file cleaner
 */
const DiagnosticsComponent: React.FC = () => {
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

export default DiagnosticsComponent; 