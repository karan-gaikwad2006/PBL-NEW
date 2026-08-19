import React from 'react';
import { PackageOpen } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  icon: Icon = PackageOpen,
  title = 'No records found',
  description = 'There are no items to display at this time.',
  actionText,
  onAction,
  actionIcon,
  children,
  className = ''
}) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 p-12 text-center flex flex-col items-center justify-center ${className}`}>
      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-[#304355] mb-4 shadow-inner">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-[#1F2933]">{title}</h3>
      <p className="text-sm text-[#64707A] max-w-md mt-1.5 leading-relaxed">{description}</p>
      
      {actionText && onAction && (
        <div className="mt-6">
          <Button variant="primary" onClick={onAction} icon={actionIcon}>
            {actionText}
          </Button>
        </div>
      )}

      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
