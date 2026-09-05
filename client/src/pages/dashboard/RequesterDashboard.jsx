import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/common/Button';
import AuthContext from '../../context/AuthContext';
import { requirementService } from '../../services/api';
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
  Loader2,
} from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  active: { label: 'Active', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  under_review: { label: 'Under Review', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  partially_supported: { label: 'Partially Supported', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  fulfilled: { label: 'Fulfilled', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  expired: { label: 'Expired', bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200' },
  rejected: { label: 'Rejected', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  hidden: { label: 'Hidden', bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200' },
};

const URGENCY_CONFIG = {
  critical: { label: 'Critical', color: 'text-red-600', dot: 'bg-red-500' },
  high: { label: 'High', color: 'text-orange-600', dot: 'bg-orange-500' },
  medium: { label: 'Medium', color: 'text-amber-600', dot: 'bg-amber-400' },
  low: { label: 'Low', color: 'text-blue-600', dot: 'bg-blue-400' },
};

function computeStats(reqs) {
  return {
    totalSubmitted: reqs.length,
    activeRequirements: reqs.filter((r) => r.status === 'active' || r.status === 'partially_supported').length,
    partialCount: reqs.filter((r) => r.status === 'partially_supported').length,
    fulfilled: reqs.filter((r) => r.status === 'fulfilled').length,
    expired: reqs.filter((r) => r.status === 'expired').length,
  };
}

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
  const totalItems = req.items.reduce((a, i) => a + i.quantityRequired, 0);
  const remainingItems = req.items.reduce((a, i) => a + i.quantityRemaining, 0);
  const pct = totalItems > 0 ? Math.round(((totalItems - remainingItems) / totalItems) * 100) : 0;
  const location = [req.city, req.district].filter(Boolean).join(', ');

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
        <span>{location}</span>
        {req.beneficiaryCount && (
          <>
            <span className="mx-1">•</span>
            <span>{req.beneficiaryCount} beneficiaries</span>
          </>
        )}
      </div>

      {/* Progress */}
      {req.status !== 'under_review' && totalItems > 0 && (
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
          {req.expiresAt && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Expires {new Date(req.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
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
  const { firebaseUser, user } = useContext(AuthContext);
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!firebaseUser) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const token = await firebaseUser.getIdToken();
        const res = await requirementService.getMine(token);
        if (!cancelled) setRequirements(res.data || []);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load requirements');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [firebaseUser]);

  const filteredReqs = filter === 'all'
    ? requirements
    : filter === 'active'
    ? requirements.filter((r) => r.status === 'active' || r.status === 'partially_supported')
    : requirements.filter((r) => r.status === filter);

  const stats = computeStats(requirements);

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
          <StatCard icon={ClipboardList} value={stats.totalSubmitted} label="Total Submitted" />
          <StatCard icon={CheckCircle2} value={stats.activeRequirements} label="Active" color="text-emerald-500" />
          <StatCard icon={RefreshCw} value={stats.partialCount} label="Partial" color="text-blue-500" />
          <StatCard icon={TrendingUp} value={stats.fulfilled} label="Fulfilled" color="text-purple-500" />
          <StatCard icon={Clock} value={stats.expired} label="Expired" color="text-slate-400" />
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
            {loading ? (
              <div className="flex items-center justify-center py-16 gap-3 text-[#64707A]">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm font-medium">Loading your requirements…</span>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <p className="font-semibold text-red-700 text-sm">{error}</p>
              </div>
            ) : filteredReqs.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center">
                <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="font-semibold text-[#64707A] mb-1">
                  {filter === 'all' ? 'No requirements yet' : 'No requirements with this status'}
                </p>
                {filter === 'all' && (
                  <Link to="/submit-need" className="text-sm font-semibold text-[#304355] hover:underline">
                    Submit your first requirement →
                  </Link>
                )}
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
            {/* Info Panel */}
            <div className="bg-white rounded-xl border border-[#304355]/10 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#304355]/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#304355]" />
                </div>
                <div>
                  <p className="font-bold text-sm text-[#1F2933]">{user?.full_name || 'My Account'}</p>
                  <p className="text-xs text-[#64707A] capitalize">{user?.role || 'Requester'}</p>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700 leading-relaxed">
                  <strong>Status note:</strong> New requirements start as <em>Under Review</em>. An admin must approve them before they appear publicly for donors.
                </p>
              </div>
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
