import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/common/Button';
import AuthContext from '../../context/AuthContext';
import { notificationService } from '../../services/api';
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
  Loader2,
} from 'lucide-react';

const NOTIFICATION_ICONS = {
  requirement_submitted: { icon: Clock, bg: 'bg-blue-100', color: 'text-blue-600', category: 'Requirements' },
  requirement_approved: { icon: CheckCircle2, bg: 'bg-[#304355]/10', color: 'text-[#304355]', category: 'Requirements' },
  requirement_rejected: { icon: AlertCircle, bg: 'bg-red-100', color: 'text-red-600', category: 'Requirements' },
  offer_received: { icon: Package, bg: 'bg-[#304355]/10', color: 'text-[#304355]', category: 'Offers' },
  donor_confirmed: { icon: Clock, bg: 'bg-amber-100', color: 'text-amber-600', category: 'Supports' },
  requester_confirmed: { icon: CheckCircle2, bg: 'bg-[#304355]/10', color: 'text-[#304355]', category: 'Supports' },
  requirement_fulfilled: { icon: CheckCircle2, bg: 'bg-emerald-100', color: 'text-emerald-600', category: 'Requirements' },
};

function getRelativeTime(timestamp) {
  if (!timestamp) return '';
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}

function getActionTarget(n) {
  if (n.relatedEntityType === 'requirement') {
    return `/requester/requirements/${n.relatedEntityId}`;
  }
  if (n.relatedEntityType === 'offer') {
    return `/confirm-completion/${n.relatedEntityId}`;
  }
  return '/notifications';
}

const CATEGORIES = ['All', 'Offers', 'Supports', 'Requirements'];

function NotificationItem({ notification, onMarkRead }) {
  const iconConfig = NOTIFICATION_ICONS[notification.type] || { icon: Bell, bg: 'bg-slate-100', color: 'text-slate-500', category: 'Requirements' };
  const Icon = iconConfig.icon;
  const actionTo = getActionTarget(notification);

  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-xl transition-colors ${
        !notification.isRead
          ? 'bg-white border border-[#304355]/15 shadow-sm'
          : 'bg-[#E8E8E2]/50 border border-transparent'
      }`}
    >
      {/* Unread dot & Icon */}
      <div className="flex flex-col items-center gap-2 shrink-0 mt-1">
        <div className={`w-8 h-8 rounded-full ${iconConfig.bg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${iconConfig.color}`} />
        </div>
        {!notification.isRead && (
          <div className="w-2 h-2 rounded-full bg-[#304355]" />
        )}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-0.5">
          <p className={`font-semibold text-sm ${notification.isRead ? 'text-[#64707A]' : 'text-[#1F2933]'}`}>
            {notification.title}
          </p>
          <span className="text-xs text-[#64707A] shrink-0">{getRelativeTime(notification.createdAt)}</span>
        </div>
        <p className={`text-xs leading-relaxed mb-2.5 ${notification.isRead ? 'text-[#64707A]' : 'text-[#1F2933]/80'}`}>
          {notification.message}
        </p>
        <div className="flex items-center gap-3">
          {actionTo && (
            <Link
              to={actionTo}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#304355] hover:underline"
            >
              View Details
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
          {!notification.isRead && (
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
  const { firebaseUser } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    if (!firebaseUser) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const token = await firebaseUser.getIdToken();
        const res = await notificationService.getAll(token);
        if (!cancelled) setNotifications(res.data || []);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load notifications');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [firebaseUser]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = activeCategory === 'All'
    ? notifications
    : notifications.filter((n) => {
        const cat = NOTIFICATION_ICONS[n.type]?.category || 'Requirements';
        return cat === activeCategory;
      });

  const markAsRead = async (id) => {
    if (!firebaseUser) return;
    try {
      const token = await firebaseUser.getIdToken();
      await notificationService.markRead(token, id);
      setNotifications((prev) =>
        prev.map((n) => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const markAllRead = async () => {
    if (!firebaseUser) return;
    try {
      const token = await firebaseUser.getIdToken();
      await notificationService.markAllRead(token);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
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
              ? notifications.filter((n) => !n.isRead).length
              : notifications.filter((n) => (NOTIFICATION_ICONS[n.type]?.category || 'Requirements') === cat && !n.isRead).length;
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
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-[#64707A]">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm font-medium">Loading notifications…</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-md mx-auto">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="font-semibold text-red-700 text-sm">{error}</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-16">
            <BellOff className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-bold text-[#304355] mb-2">No notifications here</h3>
            <p className="text-sm text-[#64707A]">You're all caught up in this category.</p>
          </div>
        ) : (
          <div className="max-w-3xl space-y-3">
            {/* Unread group */}
            {filteredNotifications.some((n) => !n.isRead) && (
              <div>
                <p className="text-xs font-bold text-[#64707A] uppercase tracking-wider mb-3">Unread</p>
                <div className="space-y-2">
                  {filteredNotifications
                    .filter((n) => !n.isRead)
                    .map((n) => (
                      <NotificationItem key={n.id} notification={n} onMarkRead={markAsRead} />
                    ))}
                </div>
              </div>
            )}

            {/* Read group */}
            {filteredNotifications.some((n) => n.isRead) && (
              <div className={filteredNotifications.some((n) => !n.isRead) ? 'mt-6' : ''}>
                <p className="text-xs font-bold text-[#64707A] uppercase tracking-wider mb-3">Earlier</p>
                <div className="space-y-2">
                  {filteredNotifications
                    .filter((n) => n.isRead)
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

