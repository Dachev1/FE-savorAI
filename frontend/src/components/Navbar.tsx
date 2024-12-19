import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
    return (
        <nav className="bg-white shadow-md fixed top-0 w-full z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
                {/* Logo */}
                <h1 className="text-3xl font-extrabold text-dark hover:text-accent transition-all">
                    <Link to="/">SavorAI</Link>
                </h1>

                {/* Navigation Links */}
                <ul className="hidden md:flex space-x-8 text-secondary text-lg font-medium">
                    <li>
                        <Link
                            to="/features"
                            className="relative hover:text-accent transition-colors duration-200 before:absolute before:bottom-0 before:left-0 before:w-0 before:h-[2px] before:bg-accent before:transition-all before:duration-300 hover:before:w-full"
                        >
                            Features
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/about"
                            className="relative hover:text-accent transition-colors duration-200 before:absolute before:bottom-0 before:left-0 before:w-0 before:h-[2px] before:bg-accent before:transition-all before:duration-300 hover:before:w-full"
                        >
                            About
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/contact"
                            className="relative hover:text-accent transition-colors duration-200 before:absolute before:bottom-0 before:left-0 before:w-0 before:h-[2px] before:bg-accent before:transition-all before:duration-300 hover:before:w-full"
                        >
                            Contact
                        </Link>
                    </li>
                </ul>

                {/* Buttons */}
                <div className="space-x-4">
                    {/* Sign In Button */}
                    <Link
                        to="/signin"
                        className="px-4 py-2 text-dark border border-softGray rounded-full hover:text-accent hover:border-accent transition-all duration-300"
                    >
                        Sign In
                    </Link>

                    {/* Sign Up Button */}
                    <Link
                        to="/signup"
                        className="px-5 py-2 bg-accent text-white font-semibold rounded-full shadow-lg hover:bg-dark hover:scale-110 focus:ring-4 focus:ring-accent focus:ring-opacity-50 transition-all duration-300"
                    >
                        Sign Up
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
