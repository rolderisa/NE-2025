import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  name,
  type = 'text',
  error,
  icon,
  className = '',
  fullWidth = true,
  placeholder,
  required = false,
  disabled = false,
  ...props
}, ref) => {
  
  const widthClasses = fullWidth ? 'w-full' : '';
  const errorClasses = error ? 'border-error-300 text-error-900 placeholder-error-300 focus:ring-error-500 focus:border-error-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500';
  
  return (
    <div className={`${widthClasses} ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative rounded-md shadow-sm">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">{icon}</span>
          </div>
        )}
        
        <input
          type={type}
          name={name}
          id={name}
          ref={ref}
          className={`block ${widthClasses} rounded-md ${errorClasses} ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2 sm:text-sm border ${disabled ? 'bg-gray-100 text-gray-500' : 'bg-white'}`}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          {...props}
        />
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-error-600" id={`${name}-error`}>
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;