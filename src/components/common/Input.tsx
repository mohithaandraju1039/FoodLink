import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-content-main uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative rounded-xl shadow-sm">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-content-muted">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full rounded-xl border bg-surface-card text-content-main text-sm px-3.5 py-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${
            icon ? 'pl-10' : ''
          } ${
            error
              ? 'border-rose-500 focus:ring-rose-500'
              : 'border-surface-border hover:border-slate-300 dark:hover:border-slate-600'
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-content-muted">{helperText}</p>}
    </div>
  );
};
