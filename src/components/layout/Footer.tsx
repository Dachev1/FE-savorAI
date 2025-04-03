import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * Enhanced Footer Component
 */
const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
      
      // Reset subscribe status after 3 seconds
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  return (
    <footer className="bg-white dark:bg-gray-900 pt-16 pb-8 relative overflow-hidden">
      {/* Background shapes */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 dark:bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/5 dark:bg-accent/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Logo section */}
          <div className="md:col-span-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Link to="/" className="flex items-center gap-2 mb-6">
                <span className="bg-accent text-white p-2 rounded-lg shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1 .53 0L12.53 3.43l.33.237a.375.375 0 1 1-.442.604l-.33-.237-.237.33a.375.375 0 1 1-.604-.442l.237-.33-.33-.237a.375.375 0 1 1 .442-.604l.33.237.237-.33z" />
                  </svg>
                </span>
                <span className="text-accent font-bold text-2xl">SavorAI</span>
              </Link>
              <p className="text-secondary-light dark:text-gray-400 mb-6 leading-relaxed">
                Discover personalized recipes tailored to your preferences with the power of AI. Cook smarter, eat better, and enjoy more.
              </p>
              <div className="flex gap-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="text-gray-500 hover:text-accent dark:text-gray-400 dark:hover:text-accent transition-colors duration-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="bg-gray-100 dark:bg-gray-800 p-2.5 rounded-full hover:shadow-md transition-all duration-300">
                      {social.icon}
                    </div>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>
          
          {/* Explore links */}
          <div className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <FooterHeading>Explore</FooterHeading>
              <nav>
                <FooterLinks links={exploreLinks} />
              </nav>
            </motion.div>
          </div>
          
          {/* Resources links */}
          <div className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <FooterHeading>Resources</FooterHeading>
              <nav>
                <FooterLinks links={resourceLinks} />
              </nav>
            </motion.div>
          </div>
          
          {/* Newsletter */}
          <div className="md:col-span-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <FooterHeading>Stay Updated</FooterHeading>
              <p className="text-secondary-light dark:text-gray-400 mb-4">
                Join our newsletter for recipes, tips, and exclusive offers.
              </p>
              
              <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="w-full p-4 pr-12 rounded-xl border border-gray-200 dark:border-gray-700
                             bg-white dark:bg-gray-800 text-dark dark:text-light
                             focus:border-accent dark:focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none
                             transition-all duration-300"
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                </div>
                
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 px-6 bg-accent hover:bg-accent-dark text-white font-semibold rounded-xl
                           shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                >
                  {isSubscribed ? (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Subscribed!
                    </>
                  ) : (
                    'Subscribe Now'
                  )}
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
        
        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent my-8"></div>
        
        {/* Copyright and legal links */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-secondary-light dark:text-gray-400 text-sm text-center md:text-left">
            © {currentYear} <span className="font-medium text-dark dark:text-white">SavorAI</span>. All rights reserved.
          </p>
          
          <div className="flex flex-wrap gap-x-8 gap-y-2 justify-center">
            {legalLinks.map((link, index) => (
              <Link
                key={index}
                to={link.to}
                className="text-secondary-light hover:text-accent dark:text-gray-400 dark:hover:text-accent transition-colors duration-300 text-sm"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

// Helper Components
const FooterHeading: React.FC<{children: React.ReactNode}> = ({ children }) => (
  <h3 className="text-dark dark:text-white font-semibold mb-6 text-sm uppercase tracking-wider">
    {children}
  </h3>
);

const FooterLinks: React.FC<{links: Array<{to: string, label: string}>}> = ({ links }) => (
  <ul className="space-y-3">
    {links.map((link, index) => (
      <li key={index}>
        <motion.div whileHover={{ x: 6 }} transition={{ type: "spring", stiffness: 400 }}>
          <Link
            to={link.to}
            className="text-secondary-light hover:text-accent dark:text-gray-400 dark:hover:text-accent transition-colors duration-300 flex items-center gap-2 text-sm font-medium"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            {link.label}
          </Link>
        </motion.div>
      </li>
    ))}
  </ul>
);

// Data Arrays
const socialLinks = [
  {
    href: "#",
    label: "Facebook",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
      </svg>
    )
  },
  {
    href: "#",
    label: "Twitter",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
      </svg>
    )
  },
  {
    href: "#",
    label: "Instagram",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
      </svg>
    )
  },
  {
    href: "#",
    label: "Pinterest",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 0a12 12 0 0 0-4.373 23.178c-.011-.937-.19-2.354.042-3.36.218-.935 1.407-5.964 1.407-5.964s-.359-.72-.359-1.781c0-1.663.967-2.911 2.171-2.911 1.023 0 1.518.77 1.518 1.688 0 1.03-.655 2.569-.994 3.995-.283 1.195.599 2.169 1.777 2.169 2.133 0 3.772-2.25 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.562-5.418 5.208 0 1.031.397 2.137.893 2.739a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.261 7.929-7.261 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12Z" />
      </svg>
    )
  }
];

const exploreLinks = [
  { to: "/", label: "Home" },
  { to: "/recipes", label: "Recipes" },
  { to: "/meal-plan", label: "Meal Planning" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" }
];

const resourceLinks = [
  { to: "/blog", label: "Blog" },
  { to: "/faq", label: "FAQ" },
  { to: "/help", label: "Help Center" },
  { to: "/api", label: "API" },
  { to: "/careers", label: "Careers" }
];

const legalLinks = [
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms of Service" },
  { to: "/cookies", label: "Cookie Policy" },
  { to: "/accessibility", label: "Accessibility" }
];

export default Footer;
