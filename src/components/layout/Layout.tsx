import React, { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useDarkMode } from '../../context/DarkModeContext';
import AOS from 'aos';
import 'aos/dist/aos.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      mirror: false,
    });
  }, []);

  return (
    <div className={`min-h-screen flex flex-col w-full overflow-x-hidden ${isDarkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* Background gradients */}
      <div 
        className="fixed inset-0 transition-opacity duration-700 pointer-events-none opacity-20 dark:opacity-10" 
        aria-hidden="true"
      >
        <div 
          className={`absolute top-0 -left-1/4 w-1/2 h-1/2 rounded-full blur-3xl bg-blue-200/50 dark:bg-blue-900/30 transition-transform duration-700 ease-in-out ${isDarkMode ? 'scale-100' : 'scale-110'}`}
        />
        <div 
          className={`absolute bottom-0 -right-1/4 w-1/2 h-1/2 rounded-full blur-3xl bg-amber-200/50 dark:bg-amber-700/30 transition-transform duration-700 ease-in-out ${isDarkMode ? 'scale-110' : 'scale-100'}`}
        />
      </div>

      {/* Main content */}
      <header className="sticky top-0 z-50">
        <Navbar />
      </header>
      
      <main className="flex-grow w-full overflow-x-hidden">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default Layout; 
