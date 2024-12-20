import { GitHubIcon, LinkedInIcon, InstagramIcon } from '../../public/Icons';

const Footer: React.FC = () => {
    return (
        <footer className="bg-dark text-light py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Footer Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* About Section */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 text-accent">About SavorAI</h3>
                        <p className="text-sm text-secondary">
                            SavorAI is your personalized AI-powered recipe assistant. Discover new recipes,
                            manage your dietary preferences, and enjoy cooking like never before.
                        </p>
                    </div>

                    {/* Navigation Links */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 text-accent">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="/features" className="hover:text-accent transition-all duration-200">
                                    Features
                                </a>
                            </li>
                            <li>
                                <a href="/about" className="hover:text-accent transition-all duration-200">
                                    About
                                </a>
                            </li>
                            <li>
                                <a href="/contact" className="hover:text-accent transition-all duration-200">
                                    Contact
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Social Media Links */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 text-accent">Follow Us</h3>
                        <div className="flex space-x-4">
                            <a
                                href="https://github.com/Dachev1"
                                target='_blank'
                                className="text-light hover:text-accent hover:scale-110 transition-transform duration-200"
                                aria-label="GitHub"
                            >
                                <GitHubIcon className="w-6 h-6" />
                            </a>
                            <a
                                href="https://www.linkedin.com/in/ivan-d-a64616270"
                                target='_blank'
                                className="text-light hover:text-accent hover:scale-110 transition-transform duration-200"
                                aria-label="LinkedIn"
                            >
                                <LinkedInIcon className="w-6 h-6" />
                            </a>
                            <a
                                href="#"
                                target='_blank'
                                className="text-light hover:text-accent hover:scale-110 transition-transform duration-200"
                                aria-label="Instagram"
                            >
                                <InstagramIcon className="w-6 h-6" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-secondary mt-8"></div>

                {/* Copyright */}
                <div className="text-center mt-6 text-sm text-secondary">
                    &copy; 2024 SavorAI. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
