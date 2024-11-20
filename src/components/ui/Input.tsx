import React, { ChangeEvent } from 'react';
import { cn, createSafeEventHandler } from '@/lib/utils';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  onChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, onChange, ...props }, ref) => {
    const handleChange = createSafeEventHandler((event: ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(event.target.value, event);
      }
    });

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
            {label}
          </label>
        )}
        <div className="relative rounded-md shadow-sm">
          <input
            type={type}
            className={cn(
              "block w-full rounded-md sm:text-sm transition-colors",
              "bg-background-light dark:bg-background-dark",
              "text-text-light dark:text-text-dark",
              "placeholder:text-gray-400 dark:placeholder:text-gray-500",
              "disabled:cursor-not-allowed disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400",
              error
                ? "border-red-300 dark:border-red-700 text-red-900 dark:text-red-300 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500 dark:focus:ring-red-400"
                : "border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary dark:focus:border-primary-light dark:focus:ring-primary-light",
              className
            )}
            ref={ref}
            onChange={handleChange}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? "error-message" : helperText ? "helper-text" : undefined}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400" id="error-message" role="alert">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400" id="helper-text">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
