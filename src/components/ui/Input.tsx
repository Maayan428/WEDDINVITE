'use client';

import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export default function Input({
  label,
  error,
  helperText,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.replace(/\s+/g, '-').toLowerCase();

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'rounded-xl border px-3 py-2 text-sm text-start transition-all duration-200 outline-none',
          'border-gray-200 bg-white placeholder:text-gray-400',
          'focus:border-teal-400 focus:ring-2 focus:ring-teal-100',
          error && 'border-red-400 focus:border-red-400 focus:ring-red-100',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      {!error && helperText && <p className="text-xs text-gray-500">{helperText}</p>}
    </div>
  );
}
