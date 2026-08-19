import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/common/Button';
import {
  ClipboardList,
  Bell,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Plus,
  MapPin,
  Calendar,
  Package,
  RefreshCw,
  TrendingUp,
  User,
  ArrowRight,
  Eye,
} from 'lucide-react';

// ─── Mock Data ───────────────────────────────────────────────────────────────
const REQUESTER_STATS = {
  totalSubmitted: 4,
  activeRequirements: 2,
  offersReceived: 5,
  fulfilled: 1,
  expired: 1,
};

const REQUIREMENTS = [
  {
    id: 'req-1',
    title: 'Food Support for 120 Students',
    category: 'Grains',
    items: [
      { name: 'Rice', target: 100, remaining: 60, unit: 'kg' },
      { name: 'Moong Dal', target: 50, remaining: 30, unit: 'kg' },
    ],
    status: 'active',
    urgency: 'high',
    submittedOn: '2026-08-01',
    expiresOn: '2026-09-15',
    location: 'Trimbak, Nashik',
    offersReceived: 3,
    beneficiaries: 120,
  },
  {
    id: 'req-2',
    title: 'Dal for Anganwadi Children',
    category: 'Pulses',
    items: [
      { name: 'Moong Dal', target: 20, remaining: 5, unit: 'kg' },
    ],
    status: 'partially_supported',
    urgency: 'medium',
    submittedOn: '2026-08-10',
    expiresOn: '2026-09-20',
    location: 'Dindori, Nashik',
    offersReceived: 2,
    beneficiaries: 45,
  },
  {
    id: 'req-3',
    title: 'Emergency Nutrition Kits — Under Review',
    category: 'Mixed',
    items: [
      { name: 'Chana', target: 30, remaining: 30, unit: 'kg' },
    ],
    status: 'under_review',
    urgency: 'critical',
    submittedOn: '2026-08-18',
    expiresOn: '2026-09-30',
    location: 'Igatpuri, Nashik',
    offersReceived: 0,
    beneficiaries: 60,
  },
  {
    id: 'req-4',
    title: 'Annual Grain Support — Fulfilled',
    category: 'Grains',
    items: [
      { name: 'Rice', target: 50, remaining: 0, unit: 'kg' },
    ],
    status: 'fulfilled',
    urgency: 'medium',
    submittedOn: '2026-06-15',
    expiresOn: '2026-07-30',
    location: 'Trimbak, Nashik',
    offersReceived: 2,
    beneficiaries: 80,
  },
];

const RECENT_OFFERS = [
  {
    id: 'off-1',
    requirementId: 'req-1',
    requirementTitle: 'Food Support for 120 Students',
    donor: 'Karan S.',
    item: 'Rice',
    quantity: '20 kg',
    offeredOn: '2026-08-15',
    status: 'pending',
  },
  {
    id: 'off-2',
    requirementId: 'req-1',
    requirementTitle: 'Food Support for 120 Students',
    donor: 'Priya M.',
    item: 'Moong Dal',
    quantity: '15 kg',
    offeredOn: '2026-08-16',
    status: 'accepted',
  },
  {
    id: 'off-3',
    requirementId: 'req-2',
    requirementTitle: 'Dal for Anganwadi Children',
    donor: 'Ravi K.',
    item: 'Moong Dal',
    quantity: '10 kg',
    offeredOn: '2026-08-17',
    status: 'accepted',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  active: { label: 'Active', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  under_review: { label: 'Under Review', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  partially_supported: { label: 'Partially Supported', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  fulfilled: { label: 'Fulfilled', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  expired: { label: 'Expired', bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200' },
};

const URGENCY_CONFIG = {
  critical: { label: 'Critical', color: 'text-red-600', dot: 'bg-red-500' },
  high: { label: 'High', color: 'text-orange-600', dot: 'bg-orange-500' },
  medium: { label: 'Medium', color: 'text-amber-600', dot: 'bg-amber-400' },
  low: { label: 'Low', color: 'text-blue-600', dot: 'bg-blue-400' },
};

function StatusChip({ status }) {
  const s = STATUS_CONFIG[status] || STATUS_CONFIG.under_review;
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
      {s.label}
    </span>
  );
}

function StatCard({ icon: Icon, value, label, color = 'text-[#304355]' }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-[#304355]/10 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <Icon className={`w-5 h-5 ${color}`} />
        <span className="text-3xl font-extrabold text-[#304355]">{value}</span>
      </div>
      <p className="text-xs font-semibold text-[#64707A] uppercase tracking-wider">{label}</p>
    </div>
  );
}

function RequirementCard({ req }) {
  const totalItems = req.items.reduce((a, i) => a + i.target, 0);
  const remainingItems = req.items.reduce((a, i) => a + i.remaining, 0);
  const pct = Math.round(((totalItems - remainingItems) / totalItems) * 100);

  return (
    <div className="bg-white rounded-xl border border-[#304355]/10 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-wrap items-start gap-2 mb-2">
        <StatusChip status={req.status} />
        <span className={`inline-flex items-center gap-1 text-xs font-semibold ${URGENCY_CONFIG[req.urgency]?.color}`}>
          <span className={`w-2 h-2 rounded-full ${URGENCY_CONFIG[req.urgency]?.dot}`} />
          {URGENCY_CONFIG[req.urgency]?.label}
        </span>
      </div>
      <h3 className="font-bold text-[#304355] text-base mb-1">{req.title}</h3>
      <div className="flex items-center gap-1.5 text-xs text-[#64707A] mb-4">
        <MapPin className="w-3.5 h-3.5 shrink-0" />
        <span>{req.location}</span>
        <span className="mx-1">•</span>
        <span>{req.beneficiaries} beneficiaries</span>
      </div>

      {/* Progress */}
      {req.status !== 'under_review' && (
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[#64707A]">Progress</span>
            <span className="font-semibold text-[#304355]">{pct}% fulfilled</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${req.status === 'fulfilled' ? 'bg-purple-500' : 'bg-[#304355]'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-[#64707A]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Expires {new Date(req.expiresOn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
          </div>
          {req.offersReceived > 0 && (
            <div className="flex items-center gap-1 text-emerald-600 font-semibold">
              <Bell className="w-3.5 h-3.5" />
              <span>{req.offersReceived} offer{req.offersReceived > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/requester/requirements/${req.id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#304355] hover:underline"
          >
            Manage <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RequesterDashboard() {
  const [filter, setFilter] = useState('all');

  const filteredReqs = filter === 'all'
    ? REQUIREMENTS
    : REQUIREMENTS.filter((r) => r.status === filter);

  return (
    <PageContainer>
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-10">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#304355] mb-1 tracking-tight">My Requirements</h1>
            <p className="text-sm text-[#64707A]">Manage your submitted requirements and respond to donor offers.</p>
          </div>
          <Link
            to="/submit-need"
            className="inline-flex items-center gap-2 bg-[#304355] text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-[#243342] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Submit New Requirement
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
          <StatCard icon={ClipboardList} value={REQUESTER_STATS.totalSubmitted} label="Total Submitted" />
          <StatCard icon={CheckCircle2} value={REQUESTER_STATS.activeRequirements} label="Active" color="text-emerald-500" />
          <StatCard icon={Bell} value={REQUESTER_STATS.offersReceived} label="Offers Received" color="text-blue-500" />
          <StatCard icon={RefreshCw} value={REQUESTER_STATS.fulfilled} label="Fulfilled" color="text-purple-500" />
          <StatCard icon={Clock} value={REQUESTER_STATS.expired} label="Expired" color="text-slate-400" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-px">
              {[
                { id: 'all', label: 'All' },
                { id: 'active', label: 'Active' },
                { id: 'under_review', label: 'Under Review' },
                { id: 'partially_supported', label: 'Partial' },
                { id: 'fulfilled', label: 'Fulfilled' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors shrink-0 ${
                    filter === tab.id
                      ? 'border-[#304355] text-[#304355]'
                      : 'border-transparent text-[#64707A] hover:text-[#304355]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Requirements List */}
            {filteredReqs.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center">
                <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="font-semibold text-[#64707A]">No requirements with this status</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReqs.map((req) => (
                  <RequirementCard key={req.id} req={req} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Recent Offers */}
            <div className="bg-white rounded-xl border border-[#304355]/10 shadow-sm p-5">
              <h3 className="font-bold text-[#304355] mb-4 flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Recent Offers Received
              </h3>
              {RECENT_OFFERS.length === 0 ? (
                <p className="text-sm text-[#64707A]">No offers yet.</p>
              ) : (
                <div className="space-y-3">
                  {RECENT_OFFERS.map((offer) => (
                    <div key={offer.id} className="flex items-start justify-between gap-3 py-2.5 border-b border-slate-100 last:border-0">
                      <div>
                        <p className="font-semibold text-sm text-[#1F2933]">{offer.donor}</p>
                        <p className="text-xs text-[#64707A]">{offer.quantity} of {offer.item}</p>
                        <p className="text-xs text-[#64707A] truncate max-w-[160px]">{offer.requirementTitle}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                        offer.status === 'accepted'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {offer.status === 'accepted' ? 'Accepted' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Institution Profile */}
            <div className="bg-white rounded-xl border border-[#304355]/10 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#304355]/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#304355]" />
                </div>
                <div>
                  <p className="font-bold text-sm text-[#1F2933]">Trimbakeshwar Ashram Shala</p>
                  <p className="text-xs text-[#64707A]">Residential Tribal School</p>
                </div>
              </div>
              <Link to="/institution-profile" className="text-xs font-semibold text-[#304355] hover:underline inline-flex items-center gap-1">
                View & Edit Profile <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-[#304355]/10 shadow-sm p-4">
              <h3 className="font-bold text-sm text-[#304355] mb-3">Quick Actions</h3>
              <div className="space-y-1">
                {[
                  { label: 'Submit New Requirement', to: '/submit-need' },
                  { label: 'View Notifications', to: '/notifications' },
                  { label: 'Institution Profile', to: '/institution-profile' },
                ].map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium text-[#1F2933] hover:bg-[#E8E8E2] transition-colors group"
                  >
                    {link.label}
                    <ArrowRight className="w-3.5 h-3.5 text-[#64707A] group-hover:text-[#304355]" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
