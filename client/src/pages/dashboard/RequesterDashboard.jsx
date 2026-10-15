import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import AuthContext from '../../context/AuthContext';
import { requirementService, userService } from '../../services/api';
import TrustBadge from '../../components/trust/TrustBadge';
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Plus,
  MapPin,
  Calendar,
  RefreshCw,
  TrendingUp,
  User,
  UserRound,
  FileText,
  Bell,
  Building2,
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
    <span className={`inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
      {s.label}
    </span>
  );
}

function StatCard({ icon: Icon, value, label, color = 'text-[#304355]' }) {
  return (
    <div className="flex h-[108px] flex-col justify-between rounded-2xl border border-[#E8E6E8] bg-white p-4 shadow-[0_2px_10px_rgba(25,45,62,0.04)] transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-semibold text-[#64707A]">{label}</span>
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#F4F5F6] ${color}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <span className="text-[27px] font-bold leading-none tracking-tight text-[#1F2933]">{value}</span>
    </div>
  );
}

export function RequirementCard({ req }) {
  const totalItems = req.items.reduce((a, i) => a + i.quantityRequired, 0);
  const remainingItems = req.items.reduce((a, i) => a + i.quantityRemaining, 0);
  const pct = totalItems > 0 ? Math.round(((totalItems - remainingItems) / totalItems) * 100) : 0;
  const location = [req.city, req.district].filter(Boolean).join(', ');

  return (
    <article className="overflow-hidden rounded-2xl border border-[#E8E6E8] bg-white shadow-[0_2px_10px_rgba(25,45,62,0.04)] transition-shadow hover:shadow-md">
      <div className="p-4 sm:p-5">
        <div className="mb-2.5 flex flex-wrap items-center gap-2">
          <StatusChip status={req.status} />
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-semibold ${URGENCY_CONFIG[req.urgency]?.color}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${URGENCY_CONFIG[req.urgency]?.dot}`} />
            {URGENCY_CONFIG[req.urgency]?.label} urgency
          </span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h3 className="text-lg font-bold leading-snug tracking-tight text-[#192D3E]">{req.title}</h3>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#64707A]">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {location}
              </span>
              {req.beneficiaryCount && (
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 shrink-0" />
                  {req.beneficiaryCount} beneficiaries
                </span>
              )}
              {req.expiresAt && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  Expires {new Date(req.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
              )}
            </div>
          </div>
          <Link
            to={`/requester/requirements/${req.id}`}
            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#192D3E] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#263F54] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#192D3E] focus-visible:ring-offset-2"
          >
            Manage requirement
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {req.items.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {req.items.map((item) => (
              <span key={item.id || item.name} className="rounded-lg border border-[#E8E6E8] bg-[#FAF9F8] px-3 py-1.5 text-xs font-medium text-[#465360]">
                {item.name} <span className="text-[#7A838C]">· {item.quantityRemaining} {item.unit} needed</span>
              </span>
            ))}
          </div>
        )}

        {req.status !== 'under_review' && totalItems > 0 && (
          <div className="mt-4 border-t border-[#F0EDEF] pt-3">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-medium text-[#64707A]">Overall progress</span>
              <span className="font-bold text-[#304355]">{pct}% fulfilled</span>
            </div>
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-[#EAE8EA]"
              role="progressbar"
              aria-label="Requirement fulfillment progress"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={`h-full rounded-full transition-all ${req.status === 'fulfilled' ? 'bg-purple-500' : 'bg-emerald-500'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RequesterDashboard() {
  const { firebaseUser, user } = useContext(AuthContext);
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [profile, setProfile] = useState(user);

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
    async function loadProfile() {
      try {
        const token = await firebaseUser.getIdToken();
        const response = await userService.getProfile(token);
        if (!cancelled) setProfile(response.data);
      } catch (profileError) {
        if (!cancelled) setError(profileError.message || 'Failed to load account trust details');
      }
    }
    loadProfile();
    return () => { cancelled = true; };
  }, [firebaseUser]);

  const filteredReqs = filter === 'all'
    ? requirements
    : filter === 'active'
    ? requirements.filter((r) => r.status === 'active' || r.status === 'partially_supported')
    : requirements.filter((r) => r.status === filter);

  const stats = computeStats(requirements);
  const isInstitution = profile?.role === 'institution';

  return (
    <PageContainer className="!max-w-none !px-0 !py-0">
      <div className="mx-auto max-w-[1280px] px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        <header className="mb-5 rounded-2xl border border-[#E8E6E8] bg-white p-4 shadow-[0_2px_10px_rgba(25,45,62,0.04)] sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="mb-1.5 flex flex-wrap items-center gap-2.5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#192D3E] text-white">
                  <ClipboardList className="h-4 w-4" />
                </span>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#64707A]">
                  Requester workspace
                </p>
                <TrustBadge tiers={profile?.trust?.tiers} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#192D3E]">
                {isInstitution ? 'Ashram Shala Dashboard' : 'My Requirements'}
              </h1>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[#64707A]">
                {isInstitution
                  ? 'Manage your institution’s food requirements and respond to donor offers.'
                  : 'Manage your submitted requirements and respond to donor offers.'}
              </p>
              <p className="mt-1 max-w-2xl text-xs text-[#64707A]">
                New requirements start as Under Review and appear to donors after admin approval.
              </p>
              {profile?.full_name && (
                <p className="mt-1 text-xs text-[#64707A]">
                  Signed in as <span className="font-semibold text-[#465360]">{profile.full_name}</span>
                  {profile.role && ` · ${profile.role}`}
                </p>
              )}
              {profile?.postingLimits && (
                <p className="mt-2 inline-flex rounded-lg bg-[#F5F7F8] px-3 py-1.5 text-xs text-[#64707A]">
                  Requirement posting limit: {profile.postingLimits.remaining} of {profile.postingLimits.daily} remaining in the current 24-hour window.
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2 lg:max-w-[520px] lg:justify-end">
              <Link
                to="/submit-need"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#192D3E] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#263F54] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#192D3E] focus-visible:ring-offset-2"
              >
                <Plus className="h-3.5 w-3.5" />
                Submit new requirement
              </Link>
              <Link
                to="/profile"
                className="group inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#D8DDE1] bg-white px-3 py-2 text-xs font-semibold text-[#304355] transition hover:border-[#304355]/35 hover:bg-[#F8F9FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#304355] focus-visible:ring-offset-2"
              >
                <UserRound className="h-3.5 w-3.5" />
                My profile & documents
                <FileText className="h-3 w-3 text-[#64707A]" />
              </Link>
              <Link
                to="/notifications"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#D8DDE1] bg-white px-3 py-2 text-xs font-semibold text-[#304355] transition hover:border-[#304355]/35 hover:bg-[#F8F9FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#304355] focus-visible:ring-offset-2"
              >
                <Bell className="h-3.5 w-3.5" />
                Notifications
              </Link>
              {isInstitution && (
                <Link
                  to="/institution-profile"
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#D8DDE1] bg-white px-3 py-2 text-xs font-semibold text-[#304355] transition hover:border-[#304355]/35 hover:bg-[#F8F9FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#304355] focus-visible:ring-offset-2"
                >
                  <Building2 className="h-3.5 w-3.5" />
                  Institution profile
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Stats */}
        <section aria-label="Requirement summary" className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard icon={ClipboardList} value={stats.totalSubmitted} label="Total Submitted" />
          <StatCard icon={CheckCircle2} value={stats.activeRequirements} label="Active" color="text-emerald-500" />
          <StatCard icon={RefreshCw} value={stats.partialCount} label="Partial" color="text-blue-500" />
          <StatCard icon={TrendingUp} value={stats.fulfilled} label="Fulfilled" color="text-purple-500" />
          <StatCard icon={Clock} value={stats.expired} label="Expired" color="text-slate-400" />
        </section>

        <section className="min-w-0 space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-[#192D3E]">Your requirements</h2>
                <p className="mt-1 text-xs text-[#64707A]">
                  Track progress, review status, and manage each request.
                </p>
              </div>
              <span className="rounded-full bg-[#F1F3F4] px-3 py-1 text-xs font-semibold text-[#53616E]">
                {filteredReqs.length} shown
              </span>
            </div>
            {/* Filter Tabs */}
            <div role="group" aria-label="Filter requirements" className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
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
                  aria-pressed={filter === tab.id}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    filter === tab.id
                      ? 'bg-[#192D3E] text-white shadow-sm'
                      : 'border border-[#E2E5E7] bg-white text-[#64707A] hover:border-[#C8CED3] hover:text-[#304355]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Requirements List */}
            {loading ? (
              <div className="flex items-center justify-center gap-3 rounded-2xl border border-[#E8E6E8] bg-white py-16 text-[#64707A]">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm font-medium">Loading your requirements…</span>
              </div>
            ) : error ? (
              <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                <AlertCircle className="mx-auto mb-2 h-8 w-8 text-red-400" />
                <p className="font-semibold text-red-700 text-sm">{error}</p>
              </div>
            ) : filteredReqs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#CCD2D7] bg-white p-10 text-center">
                <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F2F4F5]">
                  <ClipboardList className="h-6 w-6 text-[#89939C]" />
                </span>
                <p className="mb-1 font-semibold text-[#304355]">
                  {filter === 'all' ? 'No requirements yet' : 'No requirements with this status'}
                </p>
                <p className="mb-4 text-sm text-[#64707A]">
                  {filter === 'all' ? 'Submit a requirement to start receiving relevant food support.' : 'Try another status filter to find your requirements.'}
                </p>
                {filter === 'all' && (
                  <Link to="/submit-need" className="inline-flex items-center gap-2 rounded-xl bg-[#192D3E] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#263F54]">
                    <Plus className="h-4 w-4" />
                    Submit your first requirement
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReqs.map((req) => (
                  <RequirementCard key={req.id} req={req} />
                ))}
              </div>
            )}
        </section>
      </div>
    </PageContainer>
  );
}
