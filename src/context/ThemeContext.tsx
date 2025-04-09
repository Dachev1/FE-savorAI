import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface ThemeContextType {
  theme: 'light' | 'dark';
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Theme provider component that handles both theme state and dark mode
 * This consolidates the functionality of both DarkModeContext and ThemeContext
 */
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize theme from localStorage or system preference
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Try to get from localStorage first
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    
    // Fallback to dark mode setting
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      return savedDarkMode === 'true' ? 'dark' : 'light';
    }
    
    // Use system preference as final fallback
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  });

  // Compute isDarkMode based on theme
  const isDarkMode = theme === 'dark';

  // Apply theme classes to document
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Apply/remove dark class for Tailwind
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Apply theme classes for custom styling
    root.classList.remove('light-theme', 'dark-theme');
    root.classList.add(`${theme}-theme`);
    
    // Save to localStorage for persistence
    localStorage.setItem('theme', theme);
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [theme, isDarkMode]);

  // Toggle theme between light and dark
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to use the theme context
 * @returns The theme context value
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Legacy hook for backward compatibility
 * @deprecated Use useTheme instead
 */
export const useDarkMode = (): Pick<ThemeContextType, 'isDarkMode' | 'toggleTheme'> => {
  const { isDarkMode, toggleTheme } = useTheme();
  return { isDarkMode, toggleTheme };
}; 