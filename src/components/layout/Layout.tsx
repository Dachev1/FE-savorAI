import React, { useEffect, ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

import { useDarkMode } from '../../context';
import Navbar from './Navbar';
import Footer from './Footer';
import { useConnectionQuality } from '../../hooks';

/**
 * Main layout component that wraps the entire application
 */
interface LayoutProps {
  children?: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isDarkMode } = useDarkMode();
  const { isLowBandwidth } = useConnectionQuality();

  useEffect(() => {
    AOS.init({
      duration: isLowBandwidth ? 400 : 800,
      easing: 'ease-out',
      once: isLowBandwidth,
      disable: window.innerWidth < 768 && isLowBandwidth,
    });
  }, [isLowBandwidth]);

  useEffect(() => {
    setTimeout(() => {
      AOS.refresh();
    }, 200);
  }, [isDarkMode]);

  return (
    <div 
      className={`flex flex-col min-h-screen transition-colors duration-500 ${
        isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-800'
      }`}
    >
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

      <header className="relative z-40">
        <Navbar />
      </header>
      
      <main className="flex-grow w-full overflow-x-hidden transition-colors duration-300">
        {children || <Outlet />}
      </main>

      <Footer />
    </div>
  );
};

export default Layout; 
