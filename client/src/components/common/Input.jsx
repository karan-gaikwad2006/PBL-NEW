import React, { useId } from 'react';

export default function Input({
  label,
  helperText,
  error,
  icon: Icon,
  required = false,
  className = '',
  id: customId,
  type = 'text',
  ...props
}) {
  const generatedId = useId();
  const inputId = customId || generatedId;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-[#1F2933]">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative rounded-lg shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          className={`block w-full rounded-lg border bg-white text-[#1F2933] placeholder-slate-400 text-sm transition focus:outline-none focus:ring-2 focus:ring-[#304355] focus:border-transparent ${
            Icon ? 'pl-9' : 'pl-3.5'
          } pr-3.5 py-2.5 ${
            error
              ? 'border-red-400 focus:ring-red-500'
              : 'border-slate-300 hover:border-slate-400'
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-[#64707A]">{helperText}</p>}
    </div>
  );
}
