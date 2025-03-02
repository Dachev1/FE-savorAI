import React, { ReactNode, forwardRef } from 'react';
import { Link } from 'react-router-dom';

type CardVariant = 'default' | 'glass' | 'outlined' | 'elevated';

interface BaseCardProps {
  variant?: CardVariant;
  className?: string;
  children: ReactNode;
  hoverEffect?: boolean;
  padding?: 'none' | 'small' | 'medium' | 'large';
}

interface CardAsBaseProps extends BaseCardProps {
  as?: 'div';
  to?: never;
  href?: never;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

interface CardAsLinkProps extends BaseCardProps {
  as: 'link';
  href: string;
  to?: never;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

interface CardAsRouterLinkProps extends BaseCardProps {
  as: 'routerLink';
  to: string;
  href?: never;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

type CardProps = CardAsBaseProps | CardAsLinkProps | CardAsRouterLinkProps;

/**
 * Enhanced Card Component
 * 
 * A versatile card component with Apple-inspired design and subtle animations.
 * Supports rendering as a div, link, or router link, with various style variants.
 */
const Card = forwardRef<HTMLDivElement | HTMLAnchorElement, CardProps>((props, ref) => {
  const {
    variant = 'default',
    className = '',
    children,
    hoverEffect = true,
    padding = 'medium',
    ...rest
  } = props;

  const paddingClasses = {
    none: '',
    small: 'p-3',
    medium: 'p-6',
    large: 'p-8'
  }[padding];

  // Base classes that apply to all card variants
  const baseClasses = [
    'rounded-2xl',
    'transition-all duration-300 ease-apple-ease',
    hoverEffect ? 'hover:transform hover:-translate-y-1' : '',
    paddingClasses,
    className
  ].filter(Boolean).join(' ');

  // Variant-specific classes
  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 shadow-soft hover:shadow-medium border border-gray-100 dark:border-gray-700',
    glass: 'bg-white/80 dark:bg-gray-800/70 backdrop-blur-md border border-white/20 dark:border-gray-700/30 shadow-soft hover:shadow-medium',
    outlined: 'bg-transparent border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50',
    elevated: 'bg-white dark:bg-gray-800 shadow-medium hover:shadow-strong',
  }[variant];

  // Combined classes
  const cardClasses = `${baseClasses} ${variantClasses}`;

  // Render as div (default)
  if (props.as !== 'link' && props.as !== 'routerLink') {
    return (
      <div
        ref={ref as React.ForwardedRef<HTMLDivElement>}
        className={cardClasses}
        {...(rest as CardAsBaseProps)}
      >
        {children}
      </div>
    );
  }

  // Render as external link
  if (props.as === 'link') {
    const { href, ...linkRest } = props as CardAsLinkProps;
    return (
      <a
        ref={ref as React.ForwardedRef<HTMLAnchorElement>}
        href={href}
        className={cardClasses}
        {...linkRest}
      >
        {children}
      </a>
    );
  }

  // Render as React Router Link
  if (props.as === 'routerLink') {
    const { to, ...linkRest } = props as CardAsRouterLinkProps;
    return (
      <Link
        ref={ref as React.ForwardedRef<HTMLAnchorElement>}
        to={to}
        className={cardClasses}
        {...linkRest}
      >
        {children}
      </Link>
    );
  }

  return null;
});

Card.displayName = 'Card';

export default Card; 