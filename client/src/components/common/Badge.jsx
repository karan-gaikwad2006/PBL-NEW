import React from 'react';

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  icon: Icon
}) {
  const baseStyles = "inline-flex items-center gap-1 font-medium rounded-full tracking-tight shrink-0";

  const variants = {
    default: "bg-slate-100 text-slate-700 border border-slate-200",
    primary: "bg-[#304355] text-white",
    navy: "bg-[#304355]/10 text-[#304355] border border-[#304355]/20",
    emerald: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    amber: "bg-amber-50 text-amber-800 border border-amber-200",
    red: "bg-red-50 text-red-700 border border-red-200",
    blue: "bg-blue-50 text-blue-700 border border-blue-200",
    outline: "bg-transparent text-slate-600 border border-slate-300"
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs font-semibold"
  };

  return (
    <span className={`${baseStyles} ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`}>
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      {children}
    </span>
  );
}
