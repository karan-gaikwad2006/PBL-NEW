import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/common/Button';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  MessageSquare,
  Package,
  ChevronRight,
  BellOff,
  Check,
} from 'lucide-react';

// ─── Mock Notifications ───────────────────────────────────────────────────────
const INITIAL_NOTIFICATIONS = [
  {
    id: 'n-1',
    type: 'offer_received',
    title: 'New Offer Received',
    body: 'Karan S. has offered 20 kg of Rice for "Food Support for 120 Students". Review and respond.',
    timestamp: '2026-08-19T10:30:00',
    read: false,
    actionLabel: 'View Offer',
    actionTo: '/requester/requirements/req-1',
    category: 'Offers',
  },
  {
    id: 'n-2',
    type: 'offer_accepted',
    title: 'Offer Accepted',
    body: 'Trimbakeshwar Ashram Shala accepted your offer of 15 kg Moong Dal. Please coordinate delivery.',
    timestamp: '2026-08-18T14:00:00',
    read: false,
    actionLabel: 'View Support Details',
    actionTo: '/donor/supports/sup-2',
    category: 'Supports',
  },
  {
    id: 'n-3',
    type: 'document_reviewed',
    title: 'Document Reviewed',
    body: 'Your "School Registration Certificate" has been reviewed and accepted by the PoshanSetu team.',
    timestamp: '2026-08-17T09:15:00',
    read: false,
    actionLabel: 'View Profile',
    actionTo: '/institution-profile',
    category: 'Verification',
  },
  {
    id: 'n-4',
    type: 'document_rejected',
    title: 'Document Needs Resubmission',
    body: '"Beneficiary Count Certificate" was not accepted — the document is not legible. Please upload a clear copy.',
    timestamp: '2026-08-16T11:00:00',
    read: false,
    actionLabel: 'Upload New Document',
    actionTo: '/institution-profile',
    category: 'Verification',
  },
  {
    id: 'n-5',
    type: 'confirmation_needed',
    title: 'Completion Confirmation Needed',
    body: 'Your support for "Food Support for 120 Students" is awaiting your completion confirmation. Have you delivered the items?',
    timestamp: '2026-08-15T16:45:00',
    read: true,
    actionLabel: 'Confirm Completion',
    actionTo: '/confirm-completion/sup-1',
    category: 'Supports',
    urgent: true,
  },
  {
    id: 'n-6',
    type: 'requirement_approved',
    title: 'Requirement Approved',
    body: '"Dal for Anganwadi Children" has been reviewed and is now active. Donors can now view and respond to your requirement.',
    timestamp: '2026-08-11T08:00:00',
    read: true,
    actionLabel: 'View Requirement',
    actionTo: '/requester/requirements/req-2',
    category: 'Requirements',
  },
  {
    id: 'n-7',
    type: 'support_completed',
    title: 'Support Marked as Fulfilled',
    body: 'A support for "Emergency Grain Support" has been confirmed as completed by both parties. Thank you for your contribution!',
    timestamp: '2026-08-10T17:30:00',
    read: true,
    actionLabel: 'View History',
    actionTo: '/donor/dashboard',
    category: 'Supports',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const NOTIFICATION_ICONS = {
  offer_received: { icon: Package, bg: 'bg-blue-100', color: 'text-blue-600' },
  offer_accepted: { icon: CheckCircle2, bg: 'bg-emerald-100', color: 'text-emerald-600' },
  document_reviewed: { icon: ShieldCheck, bg: 'bg-emerald-100', color: 'text-emerald-600' },
  document_rejected: { icon: AlertCircle, bg: 'bg-red-100', color: 'text-red-600' },
  confirmation_needed: { icon: Clock, bg: 'bg-amber-100', color: 'text-amber-600' },
  requirement_approved: { icon: CheckCircle2, bg: 'bg-purple-100', color: 'text-purple-600' },
  support_completed: { icon: CheckCircle2, bg: 'bg-emerald-100', color: 'text-emerald-600' },
};

function getRelativeTime(timestamp) {
  const now = new Date('2026-08-19T23:00:00');
  const then = new Date(timestamp);
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}

const CATEGORIES = ['All', 'Offers', 'Supports', 'Verification', 'Requirements'];

function NotificationItem({ notification, onMarkRead }) {
  const iconConfig = NOTIFICATION_ICONS[notification.type] || { icon: Bell, bg: 'bg-slate-100', color: 'text-slate-500' };
  const Icon = iconConfig.icon;

  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-xl transition-colors ${
        !notification.read
          ? 'bg-white border border-[#304355]/15 shadow-sm'
          : 'bg-[#E8E8E2]/50 border border-transparent'
      } ${notification.urgent ? 'border-l-4 border-l-amber-400' : ''}`}
    >
      {/* Unread dot */}
      <div className="flex flex-col items-center gap-2 shrink-0 mt-1">
        <div className={`w-8 h-8 rounded-full ${iconConfig.bg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${iconConfig.color}`} />
        </div>
        {!notification.read && (
          <div className="w-2 h-2 rounded-full bg-[#304355]" />
        )}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-0.5">
          <p className={`font-semibold text-sm ${notification.read ? 'text-[#64707A]' : 'text-[#1F2933]'}`}>
            {notification.title}
            {notification.urgent && (
              <span className="ml-2 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                Urgent
              </span>
            )}
          </p>
          <span className="text-xs text-[#64707A] shrink-0">{getRelativeTime(notification.timestamp)}</span>
        </div>
        <p className={`text-xs leading-relaxed mb-2.5 ${notification.read ? 'text-[#64707A]' : 'text-[#1F2933]/80'}`}>
          {notification.body}
        </p>
        <div className="flex items-center gap-3">
          <Link
            to={notification.actionTo}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#304355] hover:underline"
          >
            {notification.actionLabel}
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
          {!notification.read && (
            <button
              onClick={() => onMarkRead(notification.id)}
              className="text-xs text-[#64707A] hover:text-[#304355] transition-colors flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              Mark as read
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activeCategory, setActiveCategory] = useState('All');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = activeCategory === 'All'
    ? notifications
    : notifications.filter((n) => n.category === activeCategory);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <PageContainer>
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#304355] mb-1 tracking-tight flex items-center gap-3">
              Notifications
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#304355] text-white text-xs font-bold">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-sm text-[#64707A]">Stay updated on your requirements, offers, and verifications.</p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" icon={Check} onClick={markAllRead}>
              Mark All as Read
            </Button>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1 border-b border-slate-200 mb-6 overflow-x-auto pb-px">
          {CATEGORIES.map((cat) => {
            const count = cat === 'All'
              ? notifications.filter((n) => !n.read).length
              : notifications.filter((n) => n.category === cat && !n.read).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors shrink-0 inline-flex items-center gap-1.5 ${
                  activeCategory === cat
                    ? 'border-[#304355] text-[#304355]'
                    : 'border-transparent text-[#64707A] hover:text-[#304355]'
                }`}
              >
                {cat}
                {count > 0 && (
                  <span className="text-[10px] font-bold bg-[#304355] text-white rounded-full w-4 h-4 flex items-center justify-center">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Notification List */}
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16">
            <BellOff className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-bold text-[#304355] mb-2">No notifications here</h3>
            <p className="text-sm text-[#64707A]">You're all caught up in this category.</p>
          </div>
        ) : (
          <div className="max-w-3xl space-y-3">
            {/* Unread group */}
            {filteredNotifications.some((n) => !n.read) && (
              <div>
                <p className="text-xs font-bold text-[#64707A] uppercase tracking-wider mb-3">Unread</p>
                <div className="space-y-2">
                  {filteredNotifications
                    .filter((n) => !n.read)
                    .map((n) => (
                      <NotificationItem key={n.id} notification={n} onMarkRead={markAsRead} />
                    ))}
                </div>
              </div>
            )}

            {/* Read group */}
            {filteredNotifications.some((n) => n.read) && (
              <div className={filteredNotifications.some((n) => !n.read) ? 'mt-6' : ''}>
                <p className="text-xs font-bold text-[#64707A] uppercase tracking-wider mb-3">Earlier</p>
                <div className="space-y-2">
                  {filteredNotifications
                    .filter((n) => n.read)
                    .map((n) => (
                      <NotificationItem key={n.id} notification={n} onMarkRead={markAsRead} />
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
