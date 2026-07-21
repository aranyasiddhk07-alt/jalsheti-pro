import { type InputHTMLAttributes, forwardRef, type ReactNode } from 'react';
import clsx from 'clsx';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  error?: string;
  hint?: string;
  leftAdornment?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftAdornment, className, id, ...props }, ref) => {
    const inputId = id || `input-${props.name || Math.random().toString(36).slice(2, 9)}`;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-label font-primary text-secondary-700 mb-1">
            {label}
          </label>
        )}
        <div className={clsx('flex items-center border rounded-lg overflow-hidden', error ? 'border-danger-500' : 'border-secondary-300', 'focus-within:border-primary-600')}>
          {leftAdornment && <span className="bg-secondary-100 text-secondary-700 px-4 py-3 text-body font-primary whitespace-nowrap">{leftAdornment}</span>}
          <input
            ref={ref}
            id={inputId}
            className={clsx('flex-1 px-4 py-3 text-body outline-none font-primary bg-white', className)}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-danger-600 text-label mt-1" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-secondary-500 text-label mt-1">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
