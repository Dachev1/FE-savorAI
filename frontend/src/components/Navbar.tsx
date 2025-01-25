import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { NAV_ITEMS } from '../constants/navigationData';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Initialize AOS
  useEffect(() => {
    AOS.init({ duration: 800, easing: 'ease-in-out', once: true });
  }, []);

  // Handlers
  const handleToggleMenu = () => setIsMenuOpen((prev) => !prev);
  const handleToggleUserMenu = () => setIsUserMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);
  const closeUserMenu = () => setIsUserMenuOpen(false);

  return (
    <nav className="bg-white shadow-md fixed top-0 w-full z-50">
      {/* Top Navbar (Desktop) */}
      <div
        className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4"
        data-aos="fade-down"
        data-aos-delay="100"
      >
        <LogoSection />

        <DesktopNavigation
          navItems={NAV_ITEMS}
          isUserMenuOpen={isUserMenuOpen}
          toggleUserMenu={handleToggleUserMenu}
          closeUserMenu={closeUserMenu}
        />

        <button
          onClick={handleToggleMenu}
          className="md:hidden text-dark hover:text-accent focus:outline-none
                     transition-transform duration-300 transform hover:scale-110"
          aria-label="Toggle navigation"
        >
          <HamburgerIcon />
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMenuOpen && (
        <MobileNavigation
          navItems={NAV_ITEMS}
          closeMenu={closeMenu}
          isUserMenuOpen={isUserMenuOpen}
          toggleUserMenu={handleToggleUserMenu}
          closeUserMenu={closeUserMenu}
        />
      )}
    </nav>
  );
};

export default Navbar;

//
// --------------- Subcomponents --------------- 
//

// 1. Logo Section
const LogoSection: React.FC = () => (
  <div className="flex items-center space-x-3">
    <img
      src="/logo.svg"
      alt="SavorAI Logo"
      className="h-10 w-10 transform hover:rotate-6 hover:scale-110 transition-transform duration-300"
      data-aos="zoom-in"
      data-aos-delay="200"
    />
    <h1
      className="text-2xl sm:text-3xl font-extrabold text-dark hover:text-accent transition-colors duration-300"
      data-aos="fade-left"
      data-aos-delay="300"
    >
      <Link to="/">SavorAI</Link>
    </h1>
  </div>
);

// 2. Desktop Navigation (visible on md+ screens)
type DesktopNavProps = {
  navItems: typeof NAV_ITEMS;
  isUserMenuOpen: boolean;
  toggleUserMenu: () => void;
  closeUserMenu: () => void;
};

const DesktopNavigation: React.FC<DesktopNavProps> = ({
  navItems,
  isUserMenuOpen,
  toggleUserMenu,
  closeUserMenu,
}) => (
  <>
    <ul
      className="hidden md:flex space-x-8 text-secondary text-lg font-medium"
      data-aos="fade-down"
      data-aos-delay="400"
    >
      {/* Recipes Dropdown */}
      <li className="group relative">
        <span className="relative z-10 hover:text-accent transition-colors duration-200 cursor-pointer">
          Recipes
        </span>
        <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-accent transition-all duration-300 group-hover:w-full" />
        <ul
          className="absolute left-0 mt-2 w-56 bg-white shadow-xl rounded-lg
                     opacity-0 transform scale-95 translate-y-2 invisible
                     group-hover:opacity-100 group-hover:translate-y-0
                     group-hover:scale-100 group-hover:visible
                     transition-all duration-300"
        >
          {navItems.recipes.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className="block px-4 py-3 text-dark hover:bg-gray-100 hover:text-accent rounded-lg transition-all duration-200"
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </li>

      {/* Single Links (About, Contact, etc.) */}
      {navItems.singleLinks.map((item) => (
        <li key={item.name}>
          <Link
            to={item.path}
            className="relative z-10 hover:text-accent transition-colors duration-200"
          >
            {item.name}
          </Link>
        </li>
      ))}
    </ul>

    {/* Right Side: Sign In, Sign Up, User Menu */}
    <div
      className="hidden md:flex items-center space-x-4"
      data-aos="fade-left"
      data-aos-delay="500"
    >
      <Link
        to="/signin"
        className="px-4 py-2 text-dark border border-gray-300 rounded-full
                   hover:text-accent hover:border-accent
                   transition-all duration-300"
      >
        Sign In
      </Link>
      <Link
        to="/signup"
        className="px-5 py-2 bg-accent text-white font-semibold rounded-full shadow-lg
                   hover:bg-dark hover:scale-105 transition-transform duration-300"
      >
        Sign Up
      </Link>

      {/* Avatar & Dropdown */}
      <div className="relative">
        <button
          onClick={toggleUserMenu}
          className="focus:outline-none"
          aria-label="User Menu"
        >
          <img
            src="/assets/default-avatar.png"
            alt="User Avatar"
            className="h-10 w-10 rounded-full object-cover object-center
                       cursor-pointer hover:scale-105 transition-transform duration-300"
          />
        </button>

        {isUserMenuOpen && (
          <ul
            className="absolute right-0 mt-2 w-48 bg-white shadow-xl rounded-lg
                       py-2 transition-all duration-300 z-50"
          >
            {navItems.userLinks.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className="block px-4 py-2 text-dark hover:bg-gray-100
                             hover:text-accent rounded-lg transition-all duration-200"
                  onClick={closeUserMenu}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  </>
);

// 3. Mobile Navigation (visible when isMenuOpen = true on small screens)
type MobileNavProps = {
  navItems: typeof NAV_ITEMS;
  closeMenu: () => void;
  isUserMenuOpen: boolean;
  toggleUserMenu: () => void;
  closeUserMenu: () => void;
};

const MobileNavigation: React.FC<MobileNavProps> = ({
  navItems,
  closeMenu,
  isUserMenuOpen,
  toggleUserMenu,
  closeUserMenu,
}) => (
  <div className="bg-white shadow-md md:hidden">
    <ul className="flex flex-col items-center space-y-4 text-secondary text-lg font-medium px-6 py-4">
      {/* Recipes Links */}
      {navItems.recipes.map((item) => (
        <li key={item.name}>
          <Link
            to={item.path}
            className="hover:text-accent transition-colors duration-300"
            onClick={closeMenu}
          >
            {item.name}
          </Link>
        </li>
      ))}

      {/* Single Links */}
      {navItems.singleLinks.map((item) => (
        <li key={item.name}>
          <Link
            to={item.path}
            className="hover:text-accent transition-colors duration-300"
            onClick={closeMenu}
          >
            {item.name}
          </Link>
        </li>
      ))}

      {/* Sign In / Sign Up */}
      <li>
        <Link
          to="/signin"
          className="block w-full text-center px-4 py-2 text-dark border border-gray-300
                     rounded-full hover:text-accent hover:border-accent
                     transition-all duration-300"
          onClick={closeMenu}
        >
          Sign In
        </Link>
      </li>
      <li>
        <Link
          to="/signup"
          className="block w-full text-center px-5 py-2 bg-accent text-white font-semibold
                     rounded-full shadow-lg hover:bg-dark hover:scale-105
                     transition-transform duration-300"
          onClick={closeMenu}
        >
          Sign Up
        </Link>
      </li>

      {/* Mobile User Avatar Menu */}
      <li className="relative">
        <button
          onClick={toggleUserMenu}
          className="focus:outline-none"
          aria-label="User Menu Mobile"
        >
          <img
            src="/assets/default-avatar.png"
            alt="User Avatar"
            className="h-10 w-10 rounded-full object-cover object-center
                       cursor-pointer hover:scale-105 transition-transform duration-300"
          />
        </button>
        {isUserMenuOpen && (
          <ul
            className="absolute right-0 mt-2 w-48 bg-white shadow-xl rounded-lg
                       py-2 transition-all duration-300 z-50"
          >
            {navItems.userLinks.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className="block px-4 py-2 text-dark hover:bg-gray-100
                             hover:text-accent rounded-lg transition-all duration-200"
                  onClick={() => {
                    closeMenu();
                    closeUserMenu();
                  }}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </li>
    </ul>
  </div>
);

// 4. Simple Hamburger Icon as an SVG
const HamburgerIcon = () => (
  <svg
    className="h-6 w-6"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
  </svg>
);
