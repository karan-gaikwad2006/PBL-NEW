import React from 'react';

export default function PageContainer({ children, className = '', maxWidth = 'max-w-7xl' }) {
  return (
    <div className={`w-full ${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 ${className}`}>
      {children}
    </div>
  );
}
