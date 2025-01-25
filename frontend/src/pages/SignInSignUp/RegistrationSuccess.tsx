// src/pages/SignInSignUp/RegistrationSuccess.tsx
import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

const RegistrationSuccess: React.FC = () => {
  /**
   * If you pass the username via navigate('/registration-success', { state: { username } }),
   * you can retrieve it here. If no user was passed, you can default to "User".
   */
  const location = useLocation() as { state: { username?: string } };
  const username = location.state?.username || 'User';

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-accent to-light px-6">
      <BackgroundEffects />
      <div
        className="bg-white shadow-lg rounded-3xl p-8 w-full max-w-md hover:shadow-xl transition-all"
        data-aos="fade-up"
      >
        <h2 className="text-3xl font-bold text-dark text-center mb-6">
          Registration Successful!
        </h2>
        <p className="text-lg text-dark/80 text-center mb-8 leading-relaxed">
          {username} successfully registered!
        </p>
        <div className="text-center">
          <Link
            to="/signin"
            className="px-8 py-3 bg-accent text-white font-semibold rounded-full shadow-lg hover:bg-dark transition-transform duration-300 hover:scale-105"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSuccess;

/** ------------------------------------------------------------------
 * Subcomponent: BackgroundEffects
 * Decorative background circles, consistent with your site’s theme
 * ----------------------------------------------------------------- */
const BackgroundEffects: React.FC = () => (
  <div className="absolute inset-0 -z-10">
    <div
      className="absolute top-10 left-16 w-72 h-72 bg-accent opacity-25 rounded-full blur-3xl animate-pulse"
      data-aos="zoom-in"
    />
    <div
      className="absolute bottom-16 right-12 w-80 h-80 bg-dark opacity-10 rounded-full blur-3xl animate-pulse"
      data-aos="zoom-in"
      data-aos-delay="200"
    />
  </div>
);
