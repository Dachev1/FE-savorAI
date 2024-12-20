import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Navbar: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen((prev) => !prev);
    };

    useEffect(() => {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
        });
    }, []);

    return (
        <nav className="bg-white shadow-md fixed top-0 w-full z-50">
            <div
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4"
                data-aos="fade-down"
                data-aos-delay="100"
            >
                {/* Logo */}
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

                {/* Desktop Navigation */}
                <ul
                    className="hidden md:flex space-x-8 text-secondary text-lg font-medium"
                    data-aos="fade-down"
                    data-aos-delay="400"
                >
                    {['Features', 'About', 'Contact'].map((link) => (
                        <li key={link} className="group relative">
                            <Link
                                to={`/${link.toLowerCase()}`}
                                className="relative z-10 hover:text-accent transition-colors duration-200"
                            >
                                {link}
                            </Link>
                            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-accent transition-all duration-300 group-hover:w-full"></span>
                        </li>
                    ))}
                </ul>

                {/* Desktop Buttons */}
                <div
                    className="hidden md:flex space-x-4"
                    data-aos="fade-left"
                    data-aos-delay="500"
                >
                    <Link
                        to="/signin"
                        className="px-4 py-2 text-dark border border-gray-300 rounded-full hover:text-accent hover:border-accent transition-all duration-300"
                    >
                        Sign In
                    </Link>
                    <Link
                        to="/signup"
                        className="px-5 py-2 bg-accent text-white font-semibold rounded-full shadow-lg hover:bg-dark hover:scale-105 transition-transform duration-300"
                    >
                        Sign Up
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <div className="flex md:hidden">
                    <button
                        onClick={toggleMenu}
                        className="text-dark hover:text-accent focus:outline-none transition-transform duration-300 transform hover:scale-110"
                        aria-label="Toggle navigation"
                    >
                        <svg
                            className="h-6 w-6"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 6h16M4 12h16m-7 6h7"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div
                    className="bg-white shadow-md md:hidden"
                    data-aos="fade-down"
                    data-aos-delay="700"
                >
                    <ul className="flex flex-col items-center space-y-4 text-secondary text-lg font-medium px-6 py-4">
                        {['Features', 'About', 'Contact'].map((link) => (
                            <li key={link}>
                                <Link
                                    to={`/${link.toLowerCase()}`}
                                    className="hover:text-accent transition-colors duration-300"
                                    onClick={toggleMenu}
                                >
                                    {link}
                                </Link>
                            </li>
                        ))}
                        <li>
                            <Link
                                to="/signin"
                                className="block w-full text-center px-4 py-2 text-dark border border-gray-300 rounded-full hover:text-accent hover:border-accent transition-all duration-300"
                                onClick={toggleMenu}
                            >
                                Sign In
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/signup"
                                className="block w-full text-center px-5 py-2 bg-accent text-white font-semibold rounded-full shadow-lg hover:bg-dark hover:scale-105 transition-transform duration-300"
                                onClick={toggleMenu}
                            >
                                Sign Up
                            </Link>
                        </li>
                    </ul>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
