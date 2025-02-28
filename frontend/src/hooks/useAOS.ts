import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

interface AOSOptions {
  duration?: number;
  easing?: string;
  once?: boolean;
  delay?: number;
}

export const useAOS = (options: AOSOptions = {}) => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      ...options
    });
  }, [options]);
}; 