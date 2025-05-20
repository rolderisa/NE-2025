import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({
  label,
  name,
  options = [],
  placeholder = 'Select an option',
  error,
  className = '',
  fullWidth = true,
  required = false,
  disabled = false,
  valueKey = 'value',
  labelKey = 'label',
  ...props
}, ref) => {
  
  const widthClasses = fullWidth ? 'w-full' : '';
  const errorClasses = error ? 'border-error-300 text-error-900 focus:ring-error-500 focus:border-error-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500';
  
  return (
    <div className={`${widthClasses} ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          name={name}
          id={name}
          ref={ref}
          className={`block ${widthClasses} rounded-md ${errorClasses} py-2 pl-3 pr-10 appearance-none ${disabled ? 'bg-gray-100 text-gray-500' : 'bg-white'} sm:text-sm border`}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          
          {options.map((option, index) => (
            <option key={index} value={option[valueKey]}>
              {option[labelKey]}
            </option>
          ))}
        </select>
        
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-error-600" id={`${name}-error`}>
          {error}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;