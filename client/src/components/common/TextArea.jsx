import React, { useId } from 'react';

export default function TextArea({
  label,
  helperText,
  error,
  required = false,
  rows = 4,
  className = '',
  id: customId,
  ...props
}) {
  const generatedId = useId();
  const textareaId = customId || generatedId;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-[#1F2933]">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        className={`block w-full rounded-lg border bg-white text-[#1F2933] placeholder-slate-400 text-sm transition focus:outline-none focus:ring-2 focus:ring-[#304355] focus:border-transparent px-3.5 py-2.5 ${
          error
            ? 'border-red-400 focus:ring-red-500'
            : 'border-slate-300 hover:border-slate-400'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-[#64707A]">{helperText}</p>}
    </div>
  );
}
