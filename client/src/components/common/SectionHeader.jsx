import React from 'react';

export default function SectionHeader({
  title,
  subtitle,
  badge: BadgeComponent,
  action,
  centered = false,
  className = ''
}) {
  return (
    <div className={`flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 ${centered ? 'text-center md:text-center items-center md:items-center' : ''} ${className}`}>
      <div className="space-y-1.5 max-w-2xl">
        {BadgeComponent && <div className="mb-2">{BadgeComponent}</div>}
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#1F2933] tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm md:text-base text-[#64707A] leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
