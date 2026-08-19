import React from 'react';
import Card, { CardBody, CardFooter, CardHeader } from '../common/Card';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';
import { MapPin, Calendar, Users, ChevronRight } from 'lucide-react';

export default function DomainCardBase({
  title,
  subtitle,
  district,
  status,
  urgency,
  itemsCount,
  beneficiariesCount,
  expiryDate,
  actionText = 'View Details',
  onAction,
  className = '',
  children
}) {
  return (
    <Card hoverable className={`flex flex-col h-full ${className}`}>
      <CardHeader>
        <div className="flex-1 pr-2">
          {district && (
            <div className="flex items-center gap-1 text-xs font-semibold text-[#64707A] mb-1">
              <MapPin className="w-3.5 h-3.5 text-[#304355]" />
              <span>{district}</span>
            </div>
          )}
          <h3 className="text-base font-bold text-[#1F2933] line-clamp-1">{title}</h3>
        </div>
        {(urgency || status) && (
          <div className="shrink-0">
            <StatusBadge status={urgency || status} type={urgency ? 'urgency' : 'status'} />
          </div>
        )}
      </CardHeader>

      <CardBody className="flex-grow space-y-3 py-4">
        {subtitle && <p className="text-xs text-[#64707A] line-clamp-2 leading-relaxed">{subtitle}</p>}

        <div className="grid grid-cols-2 gap-2 pt-1 text-xs text-[#64707A]">
          {beneficiariesCount && (
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{beneficiariesCount} Beneficiaries</span>
            </div>
          )}
          {expiryDate && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Expires {expiryDate}</span>
            </div>
          )}
        </div>

        {children}
      </CardBody>

      {onAction && (
        <CardFooter className="pt-3 pb-3">
          <span className="text-xs text-slate-400 font-medium">Verified Need</span>
          <Button variant="outline" size="sm" onClick={onAction} icon={ChevronRight} iconPosition="right">
            {actionText}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
