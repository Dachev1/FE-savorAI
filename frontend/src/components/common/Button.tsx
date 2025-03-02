import React, { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';
import { Link } from 'react-router-dom';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';
type ButtonSize = 'sm' | 'md' | 'lg';

interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  className?: string;
  children?: ReactNode;
}

interface ButtonAsButtonProps extends BaseButtonProps, ButtonHTMLAttributes<HTMLButtonElement> {
  as?: 'button';
  href?: never;
  to?: never;
}

interface ButtonAsLinkProps extends BaseButtonProps {
  as: 'link';
  href: string;
  to?: never;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

interface ButtonAsRouterLinkProps extends BaseButtonProps {
  as: 'routerLink';
  to: string;
  href?: never;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps | ButtonAsRouterLinkProps;

/**
 * Enhanced Button Component
 * 
 * A highly customizable button with Apple-inspired design, animations,
 * and variants. Supports rendering as a button, link, or router link.
 */
const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>((props, ref) => {
  const {
    variant = 'primary',
    size = 'md',
    isLoading = false,
    icon,
    iconPosition = 'right',
    fullWidth = false,
    className = '',
    children,
    ...rest
  } = props;

  // Base classes that apply to all button variants
  const baseClasses = [
    'inline-flex items-center justify-center gap-2 font-medium rounded-xl',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'transition-all duration-300 ease-apple-ease',
    'disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none',
    fullWidth ? 'w-full' : '',
    className
  ].filter(Boolean).join(' ');

  // Size-specific classes
  const sizeClasses = {
    sm: 'text-sm px-3 py-2',
    md: 'text-base px-4 py-2.5',
    lg: 'text-lg px-6 py-3',
  }[size];

  // Variant-specific classes
  const variantClasses = {
    primary: 'bg-accent hover:bg-accent-hover active:bg-accent-dark text-white shadow-soft hover:shadow-medium active:scale-[0.98] focus:ring-accent',
    secondary: 'bg-softGray hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-dark dark:text-light shadow-soft hover:shadow-medium active:scale-[0.98] focus:ring-gray-400',
    outline: 'bg-transparent border border-gray-200 dark:border-gray-700 text-dark dark:text-light hover:bg-softGray dark:hover:bg-gray-800 focus:ring-gray-400',
    text: 'bg-transparent text-accent hover:text-accent-hover dark:text-accent dark:hover:text-accent-hover hover:bg-accent/5 focus:ring-accent/40 focus:ring-offset-1',
  }[variant];

  // Combined classes
  const buttonClasses = `${baseClasses} ${sizeClasses} ${variantClasses}`;

  // Loading spinner
  const renderLoadingSpinner = () => (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  // Render children with icon positioning logic
  const renderContent = () => (
    <>
      {isLoading && renderLoadingSpinner()}
      {!isLoading && icon && iconPosition === 'left' && <span>{icon}</span>}
      <span>{children}</span>
      {!isLoading && icon && iconPosition === 'right' && <span>{icon}</span>}
    </>
  );

  // Render as button (default)
  if (props.as !== 'link' && props.as !== 'routerLink') {
    return (
      <button
        ref={ref as React.ForwardedRef<HTMLButtonElement>}
        className={buttonClasses}
        disabled={isLoading || (rest as ButtonAsButtonProps).disabled}
        {...(rest as ButtonAsButtonProps)}
      >
        {renderContent()}
      </button>
    );
  }

  // Render as external link
  if (props.as === 'link') {
    const { href, ...linkRest } = props as ButtonAsLinkProps;
    return (
      <a
        ref={ref as React.ForwardedRef<HTMLAnchorElement>}
        href={href}
        className={buttonClasses}
        {...linkRest}
      >
        {renderContent()}
      </a>
    );
  }

  // Render as React Router Link
  if (props.as === 'routerLink') {
    const { to, ...linkRest } = props as ButtonAsRouterLinkProps;
    return (
      <Link
        ref={ref as React.ForwardedRef<HTMLAnchorElement>}
        to={to}
        className={buttonClasses}
        {...linkRest}
      >
        {renderContent()}
      </Link>
    );
  }

  return null;
});

Button.displayName = 'Button';

export default Button; 