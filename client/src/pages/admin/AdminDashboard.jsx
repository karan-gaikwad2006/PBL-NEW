import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { requirementService, institutionService, adminFraudService, adminStatsService } from '../../services/api';
import PageContainer from '../../components/layout/PageContainer';
import MaharashtraDistrictMap from '../../components/domain/MaharashtraDistrictMap';
import {
  ShieldCheck,
  AlertTriangle,
  ClipboardList,
  Building2,
  ChevronRight,
  CheckCircle2,
  Clock,
  Eye,
  TrendingUp,
  Users,
  MapPin,
  Calendar,
  AlertCircle,
  Check,
  X,
  Activity,
  ArrowRight,
} from 'lucide-react';

// ─── Urgency Config & Helpers ────────────────────────────────────────────────
const URGENCY_CONFIG = Object.freeze({
  critical: { label: 'Critical', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
  high: { label: 'High', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  medium: { label: 'Medium', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-400' },
  low: { label: 'Standard', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
});

const URGENCY_PRIORITY = Object.freeze({
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
});

const DISTRICT_ALIASES = Object.freeze({
  ahmednagar: 'ahilyanagar',
  ahmadnagar: 'ahilyanagar',
  aurangabad: 'chhatrapati sambhajinagar',
  osmanabad: 'dharashiv',
  bid: 'beed',
  buldana: 'buldhana',
  gondiya: 'gondia',
  raigarh: 'raigad',
  mumbai: 'mumbai city',
});

function normalizeDistrictName(name) {
  const normalized = String(name || '').trim().toLocaleLowerCase().replace(/\s+/g, ' ');
  return DISTRICT_ALIASES[normalized] || normalized;
}

function daysUntil(expiresAt) {
  if (!expiresAt) return 14;
  const ms = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

function isWithinDays(dateVal, daysLimit) {
  if (!dateVal) return true;
  const ts = new Date(dateVal).getTime();
  if (Number.isNaN(ts)) return true;
  return (Date.now() - ts) <= daysLimit * 24 * 60 * 60 * 1000;
}

function calculateDaysAgo(timestampMs) {
  if (timestampMs === null || timestampMs === undefined) return null;
  return Math.max(0, Math.floor((Date.now() - timestampMs) / (1000 * 60 * 60 * 24)));
}

function getUrgencyBadge(urgencyKey) {
  const normalized = String(urgencyKey || 'medium').toLowerCase();
  return URGENCY_CONFIG[normalized] || URGENCY_CONFIG.medium;
}

function StatCard({ icon: Icon, value, label, color = 'text-slate-700', unit = '' }) {
  return (
    <div className="bg-white rounded-xl p-3 sm:p-3.5 shadow-xs border border-slate-200/90 hover:border-slate-300 transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between gap-1.5 mb-1.5">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">{label}</span>
        <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
          <Icon className={`w-3.5 h-3.5 ${color}`} />
        </div>
      </div>
      <div>
        <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {value}{unit}
        </span>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { firebaseUser } = useContext(AuthContext);

  // Existing core state — preserved exactly
  const [pendingRequirements, setPendingRequirements] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [institutionQueue, setInstitutionQueue] = useState([]);
  const [instLoading, setInstLoading] = useState(true);
  const [fraudSignals, setFraudSignals] = useState([]);
  const [fraudLoading, setFraudLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // New state for Maharashtra Map telemetry
  const [activeRequirements, setActiveRequirements] = useState([]);
  const [activeReqsLoading, setActiveReqsLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState('Nashik');
  const [timeRange, setTimeRange] = useState('ALL'); // '7d' | '30d' | 'ALL'

  // Filter state for Institution Verification Queue
  const [instFilter, setInstFilter] = useState('all'); // 'all' | 'pending' | 'verified' | 'rejected'

  useEffect(() => {
    if (!firebaseUser) return;
    let cancelled = false;

    async function load() {
      setPendingLoading(true);
      setInstLoading(true);
      setFraudLoading(true);
      setStatsLoading(true);
      setActiveReqsLoading(true);

      try {
        const token = await firebaseUser.getIdToken();
        const [reqRes, instRes, fraudRes, statsRes, activeReqsRes] = await Promise.allSettled([
          requirementService.adminGetAll(token, { status: 'under_review', limit: 20 }),
          institutionService.adminGetAll(token, { limit: 20 }),
          adminFraudService.getFraudSignals(token, { status: 'pending', limit: 20 }),
          adminStatsService.getDashboardStats(token),
          requirementService.getAll({ limit: 100 }),
        ]);

        if (!cancelled && reqRes.status === 'fulfilled') {
          setPendingRequirements(reqRes.value.data || []);
        }
        if (!cancelled && instRes.status === 'fulfilled') {
          setInstitutionQueue(instRes.value.data || []);
        }
        if (!cancelled && fraudRes.status === 'fulfilled') {
          setFraudSignals(fraudRes.value.data || []);
        }
        if (!cancelled && statsRes.status === 'fulfilled') {
          setStats(statsRes.value.data || null);
        }
        if (!cancelled && activeReqsRes.status === 'fulfilled') {
          const reqs = Array.isArray(activeReqsRes.value?.data)
            ? activeReqsRes.value.data
            : Array.isArray(activeReqsRes.value)
            ? activeReqsRes.value
            : Array.isArray(activeReqsRes.value?.requirements)
            ? activeReqsRes.value.requirements
            : [];
          setActiveRequirements(reqs);
        }
      } catch (err) {
        console.error('[AdminDashboard] Failed to load dashboard data:', err.message);
      } finally {
        if (!cancelled) {
          setPendingLoading(false);
          setInstLoading(false);
          setFraudLoading(false);
          setStatsLoading(false);
          setActiveReqsLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [firebaseUser]);

  const handleResolveSignal = async (signalId, status) => {
    if (!firebaseUser) return;
    try {
      const token = await firebaseUser.getIdToken();
      await adminFraudService.resolveFraudSignal(token, signalId, status);
      setFraudSignals((prev) => prev.filter((s) => s.id !== signalId));
    } catch (err) {
      console.error('[AdminDashboard] Failed to resolve fraud signal:', err.message);
    }
  };

  // ─── Time-range filtered requirements for map telemetry ──────────────────
  const filteredActiveRequirements = useMemo(() => {
    if (timeRange === 'ALL') return activeRequirements;
    const daysLimit = timeRange === '7d' ? 7 : 30;

    return activeRequirements.filter((req) => {
      const dateVal = req.submittedAt || req.createdAt || req.created_at;
      return isWithinDays(dateVal, daysLimit);
    });
  }, [activeRequirements, timeRange]);

  // ─── Compute urgencyByDistrict matching ExploreMap logic ─────────────────
  const urgencyByDistrict = useMemo(() => {
    return filteredActiveRequirements.reduce((districtUrgencies, requirement) => {
      const items = Array.isArray(requirement.items) ? requirement.items : [];
      const remainingItems = items.filter(
        (item) => Number(item?.quantityRemaining || item?.quantity_remaining || 0) > 0
      );
      const hasRemaining = remainingItems.length > 0;
      const isExpired = daysUntil(requirement.expires_at || requirement.expiresAt) === 0;
      const isRelevant = hasRemaining && !isExpired;

      if (!isRelevant) return districtUrgencies;

      const district = normalizeDistrictName(requirement.district);
      const urgency = String(requirement.urgency || '').toUpperCase();
      if (!district || !URGENCY_PRIORITY[urgency]) return districtUrgencies;

      const currentPriority = URGENCY_PRIORITY[districtUrgencies[district]] || 0;
      if (URGENCY_PRIORITY[urgency] > currentPriority) {
        districtUrgencies[district] = urgency;
      }
      return districtUrgencies;
    }, {});
  }, [filteredActiveRequirements]);

  // ─── Compute "Districts needing attention" ranked list ─────────────────────
  const districtsNeedingAttention = useMemo(() => {
    const districtMap = new Map();

    for (const req of filteredActiveRequirements) {
      const norm = normalizeDistrictName(req.district);
      if (!norm) continue;

      const rawName = req.district || norm;
      if (!districtMap.has(norm)) {
        districtMap.set(norm, {
          name: rawName,
          normalizedName: norm,
          openRequests: 0,
          totalQuantityRemaining: 0,
          urgencyRank: 1,
          urgencyKey: 'low',
        });
      }

      const entry = districtMap.get(norm);
      entry.openRequests += 1;

      const items = Array.isArray(req.items) ? req.items : [];
      for (const item of items) {
        entry.totalQuantityRemaining += Number(
          item?.quantityRemaining || item?.quantity_remaining || 0
        );
      }

      const urgencyStr = String(req.urgency || 'medium').toUpperCase();
      const rank = URGENCY_PRIORITY[urgencyStr] || 1;
      if (rank > entry.urgencyRank) {
        entry.urgencyRank = rank;
        entry.urgencyKey = urgencyStr.toLowerCase();
      }
    }

    const list = Array.from(districtMap.values());
    list.sort((a, b) => {
      if (b.urgencyRank !== a.urgencyRank) {
        return b.urgencyRank - a.urgencyRank;
      }
      return b.openRequests - a.openRequests;
    });

    return list;
  }, [filteredActiveRequirements]);

  // ─── Selected District summary calculation ────────────────────────────────
  const selectedDistrictSummary = useMemo(() => {
    const norm = normalizeDistrictName(selectedDistrict);
    const reqs = filteredActiveRequirements.filter(
      (r) => normalizeDistrictName(r.district) === norm
    );

    let criticalCount = 0;
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;
    let totalRemaining = 0;
    let oldestSubmittedMs = null;

    for (const r of reqs) {
      const urg = String(r.urgency || '').toUpperCase();
      if (urg === 'CRITICAL') criticalCount++;
      else if (urg === 'HIGH') highCount++;
      else if (urg === 'LOW') lowCount++;
      else mediumCount++;

      const items = Array.isArray(r.items) ? r.items : [];
      for (const item of items) {
        totalRemaining += Number(item?.quantityRemaining || item?.quantity_remaining || 0);
      }

      const dateVal = r.submittedAt || r.createdAt || r.created_at;
      if (dateVal) {
        const ms = new Date(dateVal).getTime();
        if (!Number.isNaN(ms)) {
          if (oldestSubmittedMs === null || ms < oldestSubmittedMs) {
            oldestSubmittedMs = ms;
          }
        }
      }
    }

    const oldestDays = calculateDaysAgo(oldestSubmittedMs);

    const verifiedInstitutionsCount = institutionQueue.filter((inst) => {
      const instNorm = normalizeDistrictName(inst.district);
      const isVerified = (inst.verificationStatus || inst.verification_status) === 'verified';
      return instNorm === norm && isVerified;
    }).length;

    const matchedNeeding = districtsNeedingAttention.find((d) => d.normalizedName === norm);

    return {
      name: matchedNeeding?.name || selectedDistrict,
      openRequestsCount: reqs.length,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      totalRemaining: Math.round(totalRemaining),
      oldestDays,
      verifiedInstitutionsCount,
      urgencyKey: matchedNeeding?.urgencyKey || (urgencyByDistrict[norm]?.toLowerCase() ?? 'low'),
    };
  }, [selectedDistrict, filteredActiveRequirements, districtsNeedingAttention, institutionQueue, urgencyByDistrict]);

  // ─── Filtered Institution Queue ───────────────────────────────────────────
  const filteredInstitutions = useMemo(() => {
    if (instFilter === 'all') return institutionQueue;
    return institutionQueue.filter((inst) => {
      const status = String(inst.verificationStatus || inst.verification_status || '').toLowerCase();
      if (instFilter === 'pending') {
        return status === 'pending' || status === 'under_review' || !status;
      }
      return status === instFilter;
    });
  }, [institutionQueue, instFilter]);

  // ─── Recent activity derivation (preserved exact logic) ───────────────────
  const recentActivity = [
    ...fraudSignals.slice(0, 3).map((item) => ({
      id: `fraud-${item.id}`,
      action: 'Review signal',
      target: item.entityName || item.signalType?.replace(/_/g, ' ') || 'Flagged item',
      dot: 'bg-amber-500',
    })),
    ...pendingRequirements.slice(0, 3).map((req) => ({
      id: `req-${req.id}`,
      action: 'Awaiting review',
      target: req.title,
      dot: 'bg-blue-400',
    })),
    ...institutionQueue.slice(0, 3).map((inst) => ({
      id: `inst-${inst.id}`,
      action: 'Verification queue',
      target: inst.name,
      dot: inst.verificationStatus === 'rejected' ? 'bg-red-500' : 'bg-emerald-500',
    })),
  ].slice(0, 6);

  // Time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const adminDisplayName = firebaseUser?.displayName || 'Admin';

  return (
    <PageContainer maxWidth="max-w-[1280px]" className="!py-6 sm:!py-8">
      <div className="space-y-6">

        {/* ── 1. HEADER ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#0F1E2E] text-white text-xs font-semibold px-2.5 py-1 rounded-full mb-2 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              Administrative Telemetry
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {getGreeting()}, {adminDisplayName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {statsLoading ? (institutionQueue.length || '…') : (stats?.verificationQueue ?? institutionQueue.length)} institutions awaiting verification • {statsLoading ? (fraudSignals.length || '…') : (stats?.flaggedSignals ?? fraudSignals.length)} signals need review
            </p>
          </div>

          {/* FUTURE FEATURE: Search, Filter, and Export Audit controls will be rendered here once audit service is ready */}
        </div>

        {/* ── 2. STATS (8 compact cards with reduced horizontal & vertical spacing) ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
          <StatCard
            icon={ClipboardList}
            value={statsLoading ? '…' : (stats?.totalRequirements ?? 0)}
            label="Total Requirements"
          />
          <StatCard
            icon={Clock}
            value={statsLoading ? '…' : (stats?.pendingReview ?? pendingRequirements.length)}
            label="Pending Review"
            color="text-amber-500"
          />
          <StatCard
            icon={Building2}
            value={statsLoading ? '…' : (stats?.verificationQueue ?? institutionQueue.length)}
            label="Verification Queue"
            color="text-blue-500"
          />
          <StatCard
            icon={AlertTriangle}
            value={statsLoading ? '…' : (stats?.flaggedSignals ?? fraudSignals.length)}
            label="Flagged Signals"
            color="text-red-500"
          />
          <StatCard
            icon={CheckCircle2}
            value={statsLoading ? '…' : (stats?.activeRequirements ?? 0)}
            label="Active Requirements"
            color="text-emerald-500"
          />
          <StatCard
            icon={Users}
            value={statsLoading ? '…' : (stats?.totalDonors ?? 0)}
            label="Total Donors"
          />
          <StatCard
            icon={Users}
            value={statsLoading ? '…' : (stats?.totalRequesters ?? 0)}
            label="Requesters"
          />
          <StatCard
            icon={TrendingUp}
            value={statsLoading ? '…' : (stats?.fulfillmentRate ?? 0)}
            label="Fulfillment Rate"
            unit={statsLoading ? '' : '%'}
            color="text-purple-500"
          />
        </div>

        {/* FUTURE SECTION: Platform Trend chart will be rendered here once daily aggregation telemetry is ready */}

        {/* ── 3. REQUEST SEVERITY BY DISTRICT (MAP SECTION) ── */}
        <section className="space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <MapPin className="w-5 h-5 text-slate-700" />
                Request Severity by District
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Live geographic telemetry of open food requirements and urgency clusters
              </p>
            </div>

            {/* Time-range filter */}
            <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 shrink-0">
              {[
                { id: '7d', label: 'Last 7 days' },
                { id: '30d', label: 'Last 30 days' },
                { id: 'ALL', label: 'All open' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTimeRange(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    timeRange === tab.id
                      ? 'bg-[#0F1E2E] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Side-by-side matching height workspace with reduced horizontal gap */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 items-stretch">
            {/* Left 7 cols: Maharashtra Vector Map */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                      Maharashtra District Urgency Grid
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Select any district to inspect open requirements and telemetry
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/60">
                    Selected: {selectedDistrict}
                  </span>
                </div>

                {/* Map Canvas with Component */}
                <div className="relative w-full h-[390px] sm:h-[410px] rounded-xl overflow-hidden border border-slate-100 bg-slate-50/60">
                  {activeReqsLoading ? (
                    <div className="flex h-full w-full items-center justify-center gap-2 text-xs text-slate-500">
                      <span className="w-4 h-4 border-2 border-[#0F1E2E] border-t-transparent rounded-full animate-spin" />
                      Loading geographic telemetry…
                    </div>
                  ) : (
                    <MaharashtraDistrictMap
                      selectedDistrict={selectedDistrict}
                      onDistrictSelect={(districtName) => setSelectedDistrict(districtName)}
                      urgencyByDistrict={urgencyByDistrict}
                      mapMode="institution"
                    />
                  )}
                </div>
              </div>

              {/* Map Legend Bar */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-y-2 gap-x-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />
                  <span className="font-medium text-slate-900">Critical</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />
                  <span className="font-medium text-slate-900">High</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FACC15]" />
                  <span className="font-medium text-slate-900">Medium</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
                  <span className="font-medium text-slate-900">Standard</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-slate-300" />
                  <span className="font-medium text-slate-500">No Open Needs</span>
                </div>
              </div>
            </div>

            {/* Right 5 cols: Selected District Telemetry & Districts Needing Attention */}
            <div className="lg:col-span-5 flex flex-col gap-3 sm:gap-3.5">
              {/* Selected District Summary Card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      {selectedDistrictSummary.name} District
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedDistrictSummary.openRequestsCount} active request(s) logged
                    </p>
                  </div>
                  {(() => {
                    const badge = getUrgencyBadge(selectedDistrictSummary.urgencyKey);
                    return (
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                        {badge.label}
                      </span>
                    );
                  })()}
                </div>

                {/* Breakdown Grid */}
                <div className="grid grid-cols-2 gap-2.5 my-3">
                  <div className="bg-[#FAF8F6] rounded-xl p-3 border border-slate-200/60">
                    <span className="text-xs text-slate-500 block">Total Remaining</span>
                    <span className="text-lg font-extrabold text-slate-900">
                      {selectedDistrictSummary.totalRemaining.toLocaleString()}{' '}
                      <span className="text-xs font-semibold text-slate-500">kg / units</span>
                    </span>
                  </div>

                  <div className="bg-[#FAF8F6] rounded-xl p-3 border border-slate-200/60">
                    <span className="text-xs text-slate-500 block">Oldest Unfulfilled</span>
                    <span className="text-lg font-extrabold text-slate-900">
                      {selectedDistrictSummary.oldestDays !== null ? `${selectedDistrictSummary.oldestDays} days` : 'None'}
                    </span>
                  </div>
                </div>

                {/* Urgency breakdown chips */}
                <div className="flex items-center gap-2 flex-wrap py-2 border-y border-slate-100 text-xs">
                  <span className="text-slate-500 font-semibold">Severity:</span>
                  <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-700 font-semibold">
                    {selectedDistrictSummary.criticalCount} Critical
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 font-semibold">
                    {selectedDistrictSummary.highCount} High
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-semibold">
                    {selectedDistrictSummary.mediumCount} Medium
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold">
                    {selectedDistrictSummary.lowCount} Standard
                  </span>
                </div>

                {/* Verified institutions stat & Action button */}
                <div className="mt-3.5 flex items-center justify-between gap-3 flex-wrap">
                  <div className="text-xs text-slate-500">
                    <span className="font-bold text-slate-900">{selectedDistrictSummary.verifiedInstitutionsCount}</span> verified institutions (in loaded queue)
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/explore?district=${encodeURIComponent(selectedDistrict)}`)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0F1E2E] hover:bg-[#1A2E44] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                  >
                    View requests
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Districts Needing Attention ranked list */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                      Districts Needing Attention
                    </h3>
                    <span className="text-xs font-medium text-slate-500">
                      {districtsNeedingAttention.length} districts with open needs
                    </span>
                  </div>

                  {activeReqsLoading ? (
                    <div className="flex items-center gap-2 text-xs text-slate-500 py-6">
                      <span className="w-3.5 h-3.5 border-2 border-[#0F1E2E] border-t-transparent rounded-full animate-spin" />
                      Loading ranked districts…
                    </div>
                  ) : districtsNeedingAttention.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                      <p className="text-xs font-semibold text-slate-500">No open requirements in selected time window</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                      {districtsNeedingAttention.map((dist) => {
                        const isSelected = normalizeDistrictName(dist.name) === normalizeDistrictName(selectedDistrict);
                        const badge = getUrgencyBadge(dist.urgencyKey);
                        return (
                          <div
                            key={dist.normalizedName}
                            onClick={() => setSelectedDistrict(dist.name)}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              isSelected
                                ? 'bg-[#FAF8F6] border-slate-300 shadow-xs ring-1 ring-slate-400/20'
                                : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-900 truncate">{dist.name}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}>
                                  {badge.label}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {dist.openRequests} open request{dist.openRequests === 1 ? '' : 's'}
                              </p>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-xs font-extrabold text-slate-900">
                                {Math.round(dist.totalQuantityRemaining).toLocaleString()} kg
                              </span>
                              <span className="text-xs text-slate-500 block">needed</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-500 pt-3 border-t border-slate-100 mt-3">
                  Click any district row or vector boundary to center telemetry.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. TWO-COLUMN ROW: INSTITUTION QUEUE & REVIEW SIGNALS (Reduced horizontal gap) ── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4 items-stretch">
          {/* Left: Institution Verification Queue */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-slate-700" />
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Institution Verification Queue
                  </h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/60">
                    {instLoading ? '…' : filteredInstitutions.length}
                  </span>
                </div>

                {/* Filter chips */}
                <div className="flex items-center gap-1 bg-slate-100/90 p-0.5 rounded-xl border border-slate-200/60 shrink-0">
                  {['all', 'pending', 'verified', 'rejected'].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setInstFilter(chip)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-semibold capitalize transition-all cursor-pointer ${
                        instFilter === chip
                          ? 'bg-[#0F1E2E] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {instLoading ? (
                <div className="flex items-center gap-2 text-xs text-slate-500 py-8">
                  <span className="w-4 h-4 border-2 border-[#0F1E2E] border-t-transparent rounded-full animate-spin" />
                  Loading institution queue…
                </div>
              ) : filteredInstitutions.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl">
                  <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-slate-500">
                    {instFilter === 'all' ? 'No institutions in queue' : `No institutions matching "${instFilter}"`}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredInstitutions.map((inst) => (
                    <div key={inst.id} className="py-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <p className="font-bold text-sm text-slate-900 truncate">{inst.name}</p>
                          {inst.verificationStatus === 'verified' && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 capitalize">
                          {inst.type?.replace(/_/g, ' ')} {inst.district ? `· ${inst.district}` : ''}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                              inst.verificationStatus === 'verified'
                                ? 'bg-emerald-50 text-emerald-700'
                                : inst.verificationStatus === 'rejected'
                                ? 'bg-red-50 text-red-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {inst.verificationStatus?.replace(/_/g, ' ') || 'pending'}
                          </span>
                          <span>{inst.documents?.length || 0} doc(s)</span>
                        </div>
                      </div>

                      <Link
                        to={`/admin/institution-review/${inst.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F1E2E] hover:text-[#1A2E44] hover:underline shrink-0 mt-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Review
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500 pt-3 border-t border-slate-100 mt-3">
              Institutional credentials verified against Maharashtra registrar and tribal department records.
            </p>
          </div>

          {/* Right: Review Signals */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">Review Signals</h3>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80">
                  {fraudLoading ? '…' : fraudSignals.length} Pending
                </span>
              </div>

              {/* Review Signals Notice */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 mb-3.5 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-900 leading-relaxed">
                  <strong>These are review signals only — not confirmed fraud.</strong> They indicate patterns that require human review. Do not take action based on signals alone. A supervisor must investigate and decide.
                </p>
              </div>

              {fraudLoading ? (
                <div className="flex items-center gap-2 text-xs text-slate-500 py-8">
                  <span className="w-4 h-4 border-2 border-[#0F1E2E] border-t-transparent rounded-full animate-spin" />
                  Loading review signals…
                </div>
              ) : fraudSignals.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl">
                  <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-slate-500">No active review signals pending</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {fraudSignals.map((item) => {
                    const isHighRisk = item.severity === 'critical' || item.severity === 'high';
                    return (
                      <div
                        key={item.id}
                        className={`rounded-xl border p-3.5 transition-all bg-white shadow-xs ${
                          isHighRisk ? 'border-red-200/80 hover:border-red-300' : 'border-amber-200/80 hover:border-amber-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <AlertTriangle
                              className={`w-4 h-4 shrink-0 mt-0.5 ${
                                isHighRisk ? 'text-red-500' : 'text-amber-500'
                              }`}
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="font-bold text-xs sm:text-sm text-slate-900 capitalize truncate">
                                  {item.signalType?.replace(/_/g, ' ')}
                                </p>
                                <span
                                  className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                                    isHighRisk ? 'bg-red-50 text-red-700 border border-red-200/60' : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                                  }`}
                                >
                                  {item.severity}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 leading-relaxed mb-1.5">{item.description}</p>
                              {item.entityName && (
                                <p className="text-xs text-slate-800 font-semibold">
                                  Target: {item.entityName} {item.district ? `(${item.district})` : ''}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Resolve and Dismiss Buttons */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleResolveSignal(item.id, 'resolved')}
                              title="Mark Resolved"
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 text-slate-500 transition-colors cursor-pointer"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleResolveSignal(item.id, 'dismissed')}
                              title="Dismiss Signal"
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 hover:text-slate-700 text-slate-500 transition-colors cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Signal routing target links */}
                        {item.entityType === 'requirement' && (
                          <Link
                            to={`/admin/review/${item.entityId}`}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F1E2E] hover:text-[#1A2E44] hover:underline mt-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Review Target Requirement
                          </Link>
                        )}
                        {item.entityType === 'institution' && (
                          <Link
                            to={`/admin/institution-review/${item.entityId}`}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F1E2E] hover:text-[#1A2E44] hover:underline mt-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Review Target Institution
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500 pt-3 border-t border-slate-100 mt-3">
              Automated anomaly heuristics flag duplicate listings and frequency surges for admin audit.
            </p>
          </div>
        </section>

        {/* ── 5. REQUIREMENTS AWAITING REVIEW (Full-Width List) ── */}
        <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 sm:p-6 space-y-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-slate-700" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Requirements Awaiting Review ({pendingLoading ? '…' : pendingRequirements.length})
              </h2>
            </div>
            <span className="text-xs text-slate-500">
              Under-review status queue
            </span>
          </div>

          {pendingLoading ? (
            <div className="flex items-center gap-2 text-xs text-slate-500 py-8">
              <span className="w-4 h-4 border-2 border-[#0F1E2E] border-t-transparent rounded-full animate-spin" />
              Loading pending requirements…
            </div>
          ) : pendingRequirements.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs sm:text-sm font-semibold text-slate-500">
                No requirements pending review
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {pendingRequirements.map((req) => {
                const urgency = URGENCY_CONFIG[req.urgency] || URGENCY_CONFIG.medium;
                const submittedDateStr = req.submittedAt
                  ? new Date(req.submittedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Recent';

                return (
                  <div
                    key={req.id}
                    className="p-3.5 sm:p-4 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${urgency.bg} ${urgency.text} ${urgency.border}`}
                        >
                          {urgency.label}
                        </span>
                        <h3 className="font-bold text-sm sm:text-base text-slate-900 truncate">
                          {req.title}
                        </h3>
                      </div>

                      <p className="text-xs text-slate-500">
                        Requester: <span className="font-semibold text-slate-900">{req.requesterName}</span>
                      </p>

                      <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-600" />
                          {req.district}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-600" />
                          {req.beneficiaryCount} beneficiaries
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-600" />
                          {submittedDateStr}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <Link
                        to={`/admin/review/${req.id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0F1E2E] hover:bg-[#1A2E44] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Review Requirement
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── 6. QUEUE SNAPSHOT (Small Card) ── */}
        <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-700" />
              Queue Snapshot
            </h3>
            <span className="text-xs text-slate-500">Recent items across review channels</span>
          </div>

          {pendingLoading && instLoading && fraudLoading ? (
            <div className="flex items-center gap-2 text-xs text-slate-500 py-3">
              <span className="w-3.5 h-3.5 border-2 border-[#0F1E2E] border-t-transparent rounded-full animate-spin" />
              Loading snapshot activity…
            </div>
          ) : recentActivity.length === 0 ? (
            <p className="text-xs text-slate-500">No pending queue items right now.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="bg-[#FAF8F6] rounded-xl p-3 border border-slate-200/60 flex items-start gap-2.5 text-xs"
                >
                  <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${activity.dot}`} />
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-900 block truncate">{activity.action}</span>
                    <span className="text-slate-500 truncate block">{activity.target}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── 7. FOOTER NOTE (Static Text) ── */}
        <footer className="pt-2 pb-6 border-t border-slate-200/80 text-xs text-slate-500 space-y-1.5">
          <p>
            Official district nutrition indicators are sourced from NFHS-5 (National Family Health Survey 2019-21) and state ICDS reporting.
          </p>
          <p>
            PoshanSetu operates exclusively for transparent, offline food requirement coordination across Maharashtra; no monetary transactions, transport logistics, or unsupported medical diagnoses are handled on this platform.
          </p>
        </footer>

      </div>
    </PageContainer>
  );
}
