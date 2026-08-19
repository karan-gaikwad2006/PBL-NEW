import React from 'react';
import Badge from './Badge';
import { AlertTriangle, AlertCircle, Clock, CheckCircle2, ShieldAlert, HelpCircle } from 'lucide-react';

export default function StatusBadge({ status, type = 'status', className = '' }) {
  if (!status) return null;

  const normalized = String(status).toUpperCase();

  // Requirement Urgency Badges
  if (type === 'urgency' || ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(normalized)) {
    switch (normalized) {
      case 'CRITICAL':
        return <Badge variant="red" icon={AlertTriangle} className={className}>Critical Urgency</Badge>;
      case 'HIGH':
        return <Badge variant="amber" icon={AlertCircle} className={className}>High Urgency</Badge>;
      case 'MEDIUM':
        return <Badge variant="blue" className={className}>Medium Urgency</Badge>;
      case 'LOW':
        return <Badge variant="default" className={className}>Low Urgency</Badge>;
      default:
        return <Badge variant="default" className={className}>{status}</Badge>;
    }
  }

  // Requirement & Support Lifecycle Status Badges
  switch (normalized) {
    case 'ACTIVE':
      return <Badge variant="emerald" icon={CheckCircle2} className={className}>Active Need</Badge>;
    case 'UNDER_REVIEW':
      return <Badge variant="blue" icon={Clock} className={className}>Under Review</Badge>;
    case 'PARTIALLY_SUPPORTED':
      return <Badge variant="amber" icon={Clock} className={className}>Partially Supported</Badge>;
    case 'FULFILLED':
      return <Badge variant="emerald" icon={CheckCircle2} className={className}>Fulfilled</Badge>;
    case 'EXPIRED':
      return <Badge variant="default" icon={Clock} className={className}>Expired</Badge>;
    case 'REQUIRES_ATTENTION':
      return <Badge variant="red" icon={ShieldAlert} className={className}>Requires Attention</Badge>;
    case 'OFFER_SENT':
      return <Badge variant="blue" icon={Clock} className={className}>Offer Sent</Badge>;
    case 'PENDING_CONFIRMATION':
      return <Badge variant="amber" icon={Clock} className={className}>Pending Confirmation</Badge>;
    case 'COMPLETED':
      return <Badge variant="emerald" icon={CheckCircle2} className={className}>Completed</Badge>;
    default:
      return <Badge variant="default" icon={HelpCircle} className={className}>{status}</Badge>;
  }
}
