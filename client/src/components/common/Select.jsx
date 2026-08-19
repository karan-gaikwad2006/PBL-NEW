import React, { useId } from 'react';

export default function Select({
  label,
  options = [],
  helperText,
  error,
  required = false,
  className = '',
  id: customId,
  children,
  placeholder = 'Select an option',
  ...props
}) {
  const generatedId = useId();
  const selectId = customId || generatedId;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-[#1F2933]">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={`block w-full rounded-lg border bg-white text-[#1F2933] text-sm transition focus:outline-none focus:ring-2 focus:ring-[#304355] focus:border-transparent px-3.5 py-2.5 ${
          error
            ? 'border-red-400 focus:ring-red-500'
            : 'border-slate-300 hover:border-slate-400'
        } ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.length > 0
          ? options.map((opt) => (
              <option key={opt.value ?? opt} value={opt.value ?? opt}>
                {opt.label ?? opt}
              </option>
            ))
          : children}
      </select>
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-[#64707A]">{helperText}</p>}
    </div>
  );
}
