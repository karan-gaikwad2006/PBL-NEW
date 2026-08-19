import React from 'react';

export function Card({ children, className = '', hoverable = false, ...props }) {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200/80 shadow-xs ${
        hoverable ? 'hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`px-6 py-4 border-b border-slate-100 flex items-center justify-between ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '', ...props }) {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={`px-6 py-4 bg-slate-50/50 border-t border-slate-100 rounded-b-xl flex items-center justify-between ${className}`} {...props}>
      {children}
    </div>
  );
}

export default Card;
