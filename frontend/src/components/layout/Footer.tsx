import React from 'react';
import { GitHubIcon, LinkedInIcon, InstagramIcon } from '../../../public/Icons';

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark text-light py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-between items-start">
        <FooterAbout />
        <FooterSocialLinks />
      </div>

      <div className="border-t border-secondary mt-8" />

      <div className="text-center mt-6 text-sm text-secondary">
        &copy; 2024 SavorAI. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;

// -------------------------------------------------------------------------
// Subcomponent: FooterAbout
// -------------------------------------------------------------------------
const FooterAbout: React.FC = () => (
  <div className="max-w-sm">
    <h3 className="text-lg font-bold mb-4 text-accent">About SavorAI</h3>
    <p className="text-sm text-secondary">
      SavorAI is your personalized AI-powered recipe assistant. Discover new
      recipes, manage your dietary preferences, and enjoy cooking like never before.
    </p>
  </div>
);

// -------------------------------------------------------------------------
// Subcomponent: FooterSocialLinks
// -------------------------------------------------------------------------
const FooterSocialLinks: React.FC = () => (
  <div className="flex space-x-4">
    <FooterIconLink
      href="https://github.com/Dachev1"
      label="GitHub"
      Icon={GitHubIcon}
    />
    <FooterIconLink
      href="https://www.linkedin.com/in/ivan-d-a64616270"
      label="LinkedIn"
      Icon={LinkedInIcon}
    />
    <FooterIconLink
      href="#"
      label="Instagram"
      Icon={InstagramIcon}
    />
  </div>
);

// -------------------------------------------------------------------------
// Reusable Icon Link Subcomponent
// -------------------------------------------------------------------------
type FooterIconLinkProps = {
  href: string;
  label: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
};

const FooterIconLink: React.FC<FooterIconLinkProps> = ({ href, label, Icon }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-light hover:text-accent hover:scale-110 transition-transform duration-200"
    aria-label={label}
  >
    <Icon className="w-6 h-6" />
  </a>
);
