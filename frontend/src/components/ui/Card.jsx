import React from 'react';

const Card = ({
  children,
  className = '',
  title,
  subtitle,
  icon,
  footer,
  fullWidth = false,
  hover = false,
  padding = 'default',
  ...props
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    default: 'p-6',
    lg: 'p-8',
  };
  
  const hoverClasses = hover ? 'hover:shadow-md transition-shadow duration-200' : '';
  const widthClasses = fullWidth ? 'w-full' : '';
  
  return (
    <div
      className={`bg-white rounded-lg shadow-card ${hoverClasses} ${widthClasses} ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {(title || icon) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && (
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
          {icon && <div className="text-gray-400">{icon}</div>}
        </div>
      )}
      
      <div>{children}</div>
      
      {footer && (
        <>
          <div className="divider"></div>
          <div className="mt-4">{footer}</div>
        </>
      )}
    </div>
  );
};

export default Card;