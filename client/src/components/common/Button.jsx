import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  type = 'button',
  className = '',
  onClick,
  icon: Icon,
  iconPosition = 'left',
  ...props
}) {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed select-none";

  const variants = {
    primary: "bg-[#304355] text-white hover:bg-[#243342] active:bg-[#1a2530] focus:ring-[#304355] shadow-sm",
    secondary: "bg-[#E8E8E2] text-[#1F2933] hover:bg-[#dcdcd4] active:bg-[#d0d0c6] focus:ring-[#304355]",
    outline: "border border-[#304355] text-[#304355] bg-transparent hover:bg-[#304355]/5 active:bg-[#304355]/10 focus:ring-[#304355]",
    ghost: "text-[#304355] bg-transparent hover:bg-slate-100 active:bg-slate-200 focus:ring-[#304355]",
    danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-600 shadow-sm",
    emerald: "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 focus:ring-emerald-600 shadow-sm"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5"
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </button>
  );
}
