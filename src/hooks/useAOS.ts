import { useEffect } from 'react';
import AOS, { AosOptions } from 'aos';
import 'aos/dist/aos.css';

interface AOSOptions extends AosOptions {}

export const useAOS = (options: AOSOptions = {}) => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease',
      once: true,
      ...options
    });
  }, [options]);
}; 