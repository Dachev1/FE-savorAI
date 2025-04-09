import React, { useEffect, useState, memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { FaGithub, FaLinkedinIn, FaEnvelope } from 'react-icons/fa';
import { ResponsiveImage } from '../../components/common';

const About: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: false,
      mirror: true,
      disable: window.innerWidth < 768 // Disable on mobile for better performance
    });
    
    setIsVisible(true);
    
    // Reset AOS animations when component mounts
    AOS.refresh();
    
    // Clean up AOS on unmount
    return () => {
      document.querySelectorAll('[data-aos]').forEach(el => {
        el.removeAttribute('data-aos-animate');
      });
    };
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
      <BackgroundEffects />
      <div className="container mx-auto px-4 py-12 relative z-10">
        <HeroSection isVisible={isVisible} />
        <AboutSection imageLoaded={imageLoaded} onImageLoad={handleImageLoad} />
      </div>
    </div>
  );
};

export default memo(About);

/** ------------------------------------------------------------------
 *  Subcomponent: BackgroundEffects
 *  Handles decorative background elements.
 * ----------------------------------------------------------------- */
const BackgroundEffects: React.FC = memo(() => (
  <>
    <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 dark:bg-blue-900/30 rounded-full mix-blend-multiply dark:mix-blend-soft-light blur-xl opacity-70 dark:opacity-30 animate-blob"></div>
    <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 dark:bg-purple-900/30 rounded-full mix-blend-multiply dark:mix-blend-soft-light blur-xl opacity-70 dark:opacity-30 animate-blob animation-delay-2000"></div>
    <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-amber-200 dark:bg-amber-900/30 rounded-full mix-blend-multiply dark:mix-blend-soft-light blur-xl opacity-70 dark:opacity-30 animate-blob animation-delay-4000"></div>
  </>
));

BackgroundEffects.displayName = 'BackgroundEffects';

/** ------------------------------------------------------------------
 *  Subcomponent: HeroSection
 *  Renders the hero text at the top.
 * ----------------------------------------------------------------- */
interface HeroSectionProps {
  isVisible: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = memo(({ isVisible }) => (
  <section className={`text-center mb-16 transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-400 dark:to-indigo-300">
      Meet the Creator
    </h1>
    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
      From humble beginnings to revolutionizing kitchens, here's the story behind SavorAI.
    </p>
    <div className="w-24 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto mt-8"></div>
  </section>
));

HeroSection.displayName = 'HeroSection';

/** ------------------------------------------------------------------
 *  Subcomponent: AboutSection
 *  Renders the about content (photo & text).
 * ----------------------------------------------------------------- */
interface AboutSectionProps {
  imageLoaded: boolean;
  onImageLoad: () => void;
}

const AboutSection: React.FC<AboutSectionProps> = memo(({ imageLoaded, onImageLoad }) => (
  <div className="flex flex-col gap-16 mb-16">
    {/* Main About Section */}
    <section className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center gap-8 lg:gap-16">
      {/* Image */}
      <div className="md:w-2/5" data-aos="fade-right">
        <div className="relative">
          <div className="absolute -z-10 inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl transform -rotate-3"></div>
          <div className={`rounded-3xl shadow-xl w-full aspect-[3/4] relative z-10 overflow-hidden ${!imageLoaded ? 'bg-gray-200 dark:bg-gray-700 animate-pulse' : ''}`}>
            <ResponsiveImage
              src="/assets/me-photo.jpg"
              alt="Ivan Dachev, creator of SavorAI"
              className="w-full h-full"
              aspectRatio="3/4"
              loadingStrategy="eager"
              onLoad={onImageLoad}
              placeholderColor="#f5f5f7"
            />
          </div>
          <div
            className="absolute -top-6 -right-6 w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg z-20"
            data-aos="zoom-in"
            data-aos-delay="300"
          >
            <span className="text-2xl" aria-hidden="true">✨</span>
          </div>
          <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-amber-400 dark:bg-amber-600 rounded-full z-20" data-aos="zoom-in" data-aos-delay="400" aria-hidden="true"></div>
        </div>
      </div>

      {/* Text Content */}
      <div className="md:w-3/5 space-y-6" data-aos="fade-left">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">A Passion for Culinary Innovation</h2>
        <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
          Hi! I'm Ivan Dachev, the creator of SavorAI. My passion for cooking,
          paired with my love for technology, led me to create this tool to empower
          everyone in the kitchen.
        </p>
        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
          Whether you're an experienced chef or just starting out, SavorAI
          simplifies your journey while bringing creativity and joy into every meal.
        </p>
        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
          Together, we can transform the way we cook and connect through food. Welcome
          to a smarter, more delicious future!
        </p>
        
        <div className="pt-6 flex flex-wrap gap-4 items-center">
          <SocialButton icon={<FaEnvelope />} href="mailto:dacheww13@gmail.com" label="Email" color="bg-red-500 hover:bg-red-600" />
          <SocialButton icon={<FaGithub />} href="https://github.com/Dachev1" label="GitHub" color="bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600" />
          <SocialButton icon={<FaLinkedinIn />} href="https://www.linkedin.com/in/dachev" label="LinkedIn" color="bg-blue-700 hover:bg-blue-800" />
        </div>
      </div>
    </section>
    
    {/* Vision Section */}
    <section className="max-w-5xl mx-auto px-6 text-center" data-aos="fade-up">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">My Vision</h2>
      <div className="w-24 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto mb-6"></div>
      <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto italic">
        "I believe technology should enhance our creativity, not replace it. SavorAI is designed to be a companion in your kitchen adventures, helping you discover new possibilities while honoring the heart and soul of cooking."
      </p>
    </section>
  </div>
));

AboutSection.displayName = 'AboutSection';

// Social Media Button Component
interface SocialButtonProps {
  icon: React.ReactNode;
  href: string;
  label: string;
  color: string;
}

const SocialButton: React.FC<SocialButtonProps> = memo(({ icon, href, label, color }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    className={`flex items-center gap-2 px-4 py-2 ${color} text-white rounded-lg shadow-sm hover:shadow transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
    aria-label={`${label === 'Email' ? 'Email' : `Follow on ${label}`}`}
  >
    {icon}
    <span>{label}</span>
  </a>
));

SocialButton.displayName = 'SocialButton';
