import React from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  icon,
  href,
  to,
  type = 'button',
  className = '',
  onClick,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-primary-955 text-white hover:bg-primary-955 focus:ring-primary-955',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-primary-500',
    success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500',
    danger: 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500',
    warning: 'bg-warning-500 text-white hover:bg-warning-600 focus:ring-warning-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-primary-500',
  };
  
  const sizes = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  };
  
  const widthClasses = fullWidth ? 'w-full' : '';
  const disabledClasses = disabled || isLoading ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${widthClasses} ${disabledClasses} ${className}`;
  
  const content = (
    <>
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {icon && !isLoading && <span className="mr-2">{icon}</span>}
      {children}
    </>
  );
  
  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }
  
  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {content}
      </a>
    );
  }
  
  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {content}
    </button>
  );
};

export default Button;