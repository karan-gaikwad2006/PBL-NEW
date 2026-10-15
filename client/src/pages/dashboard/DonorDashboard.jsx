import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { offerService, userService } from '../../services/api';
import TrustBadge from '../../components/trust/TrustBadge';
import {
  Heart,
  Clock,
  CheckCircle2,
  ArrowRight,
  Search,
  SlidersHorizontal,
  Scale,
  Truck,
  ClipboardCheck,
  Check,
  MapPin,
  Calendar,
  Building2,
  FileText,
  UserRound,
} from 'lucide-react';

function SmoothDonationTrendsChart({ stats }) {
  const statusCounts = [
    { label: 'Active supports', count: Number(stats.activeSupports || 0), color: 'bg-blue-500' },
    { label: 'Pending confirmation', count: Number(stats.pendingConfirmations || 0), color: 'bg-orange-500' },
    { label: 'Completed supports', count: Number(stats.completedSupports || 0), color: 'bg-green-600' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#E8E6E8] p-5 shadow-[0_2px_10px_rgba(25,45,62,0.04)] h-full min-h-[310px]">
      <h2 className="text-[16px] font-bold text-[#1F2933]">Support Status</h2>
      <p className="text-[10.5px] text-[#64707A] mt-0.5">Current counts from your support records.</p>
      <div className="mt-5 space-y-4">
        {statusCounts.map((entry) => (
          <div key={entry.label}>
            <div className="flex justify-between text-xs text-[#304355]">
              <span>{entry.label}</span><strong>{entry.count}</strong>
            </div>
            <div className="mt-1 h-2 rounded-full bg-[#EAE8EA]">
              <div
                className={`${entry.color} h-full rounded-full`}
                style={{ width: `${Math.min(100, entry.count ? (entry.count / Math.max(1, statusCounts.reduce((sum, item) => sum + item.count, 0))) * 100 : 0)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Audited Dispatch Metric Card (Uniform 1/3 Card) ──────────────────────────
function AuditedDispatchMetricCard({ totalSupports, completionRate }) {
  return (
    <div className="bg-[#192D3E] text-white rounded-2xl p-5 shadow-sm h-full min-h-[310px] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[10px] font-bold tracking-wider uppercase text-[#D0E5FB]">
            Support Completion
          </span>
          <span className="inline-flex items-center gap-1 text-[9.5px] font-semibold px-2 py-0.5 rounded-md bg-white/10 text-white/90">
            <Clock className="w-3 h-3 text-[#A7F3D0]" />
            Live
          </span>
        </div>

        <div className="flex items-center gap-4 my-2">
          {/* Circular Gauge */}
          <div className="relative w-[76px] h-[76px] rounded-full shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#2B4052"
                strokeWidth="3.2"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#10B981"
                strokeWidth="3.2"
                strokeDasharray={`${completionRate}, 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[16px] font-bold text-white tracking-tight">{completionRate}%</span>
            </div>
          </div>

          <div>
            <h3 className="text-[15px] font-bold text-white leading-tight">Fulfillment Rate</h3>
            <p className="text-[11px] text-white/70 mt-1">
              {totalSupports} support records
            </p>
          </div>
        </div>

        <p className="text-[11px] leading-relaxed text-white/80 mt-3">
          This rate reflects the completed support records currently associated with your account.
        </p>
      </div>

      <Link
        to="/requirements"
        className="mt-3 pt-2.5 border-t border-white/10 inline-flex items-center justify-between text-[11px] font-semibold text-[#8FD4A6] hover:text-white transition-colors"
      >
        <span>View your support records</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

// ─── Pledge Fulfillment Status Card (Uniform 1/3 Card) ────────────────────────
function PledgeFulfillmentStatusCard({ totalSupports, stats }) {
  const completed = Number(stats.completedSupports || 0);
  const inTransit = Number(stats.activeSupports || 0);
  const partial = Number(stats.partiallySupported || 0);
  const total = totalSupports;
  const percentage = (count) => total ? Math.round((count / total) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-[#E8E6E8] p-5 shadow-[0_2px_10px_rgba(25,45,62,0.04)] h-full min-h-[310px] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <h2 className="text-[16px] font-bold text-[#1F2933]">Pledge Fulfillment Status</h2>
          <span className="text-[10.5px] font-semibold text-[#64707A]">{total} Total Supports</span>
        </div>

        <div className="flex items-center gap-4 py-1">
          {/* Donut Chart */}
          <div
            className="relative w-[96px] h-[96px] rounded-full shrink-0 shadow-xs"
            style={{
              background: `conic-gradient(
                #16A34A 0% ${percentage(completed)}%,
                #3B82F6 ${percentage(completed)}% ${percentage(completed + inTransit)}%,
                #F57C00 ${percentage(completed + inTransit)}% 100%
              )`,
            }}
          >
            <div className="absolute inset-[16px] rounded-full bg-white flex flex-col items-center justify-center">
              <span className="text-[18px] font-bold text-[#1F2933] leading-none">{total}</span>
              <span className="text-[8px] font-bold uppercase tracking-wider text-[#64707A] mt-0.5">
                Pledges
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] mt-1 shrink-0" />
              <div>
                <p className="text-[11px] font-semibold text-[#1F2933] leading-none">Completed</p>
                <p className="text-[9.5px] text-[#64707A] mt-0.5">
                  {completed} handoffs ({percentage(completed)}%)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-[#3B82F6] mt-1 shrink-0" />
              <div>
                <p className="text-[11px] font-semibold text-[#1F2933] leading-none">Active In-Transit</p>
                <p className="text-[9.5px] text-[#64707A] mt-0.5">
                  {inTransit} batches ({percentage(inTransit)}%)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F57C00] mt-1 shrink-0" />
              <div>
                <p className="text-[11px] font-semibold text-[#1F2933] leading-none">Partially Supported</p>
                <p className="text-[9.5px] text-[#64707A] mt-0.5">
                  {partial} campaigns ({percentage(partial)}%)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-[10px] text-[#64707A] pt-2 border-t border-[#F0EDEF]">
        Counts are based on your current support records.
      </div>
    </div>
  );
}

// ─── Support By Category Card (Uniform 1/3 Card) ──────────────────────────────
function SupportByCategoryCard({ offers, totalWeightKg }) {
  const categories = offers.flatMap((offer) => offer.items || []);

  return (
    <div className="bg-white rounded-2xl border border-[#E8E6E8] p-5 shadow-[0_2px_10px_rgba(25,45,62,0.04)] h-full min-h-[320px] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <h2 className="text-[16px] font-bold text-[#1F2933]">Support by Category</h2>
          <span className="text-[11px] font-semibold text-[#64707A]">{totalWeightKg} kg total</span>
        </div>

        <div className="space-y-2.5 my-1">
          {categories.length ? [...new Set(categories.map((item) => item.name))].map((name) => (
            <p key={name} className="text-[11px] text-[#304355]">{name}</p>
          )) : <p className="text-xs text-[#64707A]">No supported items to summarize yet.</p>}
        </div>
      </div>

      <div className="mt-3 rounded-xl bg-[#F5F3F4] px-3 py-2 flex items-center justify-between gap-2 text-[10.5px]">
        <span className="text-[#64707A] font-medium">Supported item types</span>
        <span className="font-bold text-[#1F2933]">{new Set(categories.map((item) => item.name)).size}</span>
      </div>
    </div>
  );
}

function DistrictsSupportedMap({ offers }) {
  const locations = [...new Set(offers.map((offer) => offer.location).filter(Boolean))];

  return (
    <div className="bg-white rounded-2xl border border-[#E8E6E8] p-5 shadow-[0_2px_10px_rgba(25,45,62,0.04)] h-full min-h-[320px]">
      <h2 className="text-[16px] font-bold text-[#1F2933] tracking-tight">Supported Locations</h2>
      <p className="text-[10.5px] text-[#64707A] mt-0.5">Locations listed on your support records.</p>
      <div className="mt-4 divide-y divide-[#F0EDEF]">
        {locations.length ? locations.map((location) => (
          <p key={location} className="py-2 text-[11px] text-[#304355]">{location}</p>
        )) : <p className="py-2 text-[11px] text-[#64707A]">No supported locations yet.</p>}
      </div>
      <p className="mt-3 text-[10px] text-[#64707A]">{locations.length} listed locations</p>
    </div>
  );
}

// ─── Supported Institutions & Activity Card (Uniform 1/3 Card) ────────────────
function SupportedInstitutionsAndActivityCard({ dynamicInstitutions, offers }) {
  const [tab, setTab] = useState('institutions');
  const institutions = dynamicInstitutions.slice(0, 4).map((inst) => ({
    code: (inst.institution || 'IN').split(' ').map((word) => word[0]).join('').slice(0, 2).toUpperCase(),
    name: inst.institution,
    location: inst.location,
  }));
  const events = offers.slice(0, 4);

  return (
    <div className="bg-white rounded-2xl border border-[#E8E6E8] p-5 shadow-[0_2px_10px_rgba(25,45,62,0.04)] h-full min-h-[320px] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1 bg-[#F4F2F3] p-0.5 rounded-lg">
            <button
              onClick={() => setTab('institutions')}
              className={`text-[10px] px-2.5 py-1 rounded-md font-semibold transition-all ${
                tab === 'institutions'
                  ? 'bg-white text-[#192D3E] shadow-xs'
                  : 'text-[#64707A] hover:text-[#192D3E]'
              }`}
            >
              Institutions ({institutions.length})
            </button>
            <button
              onClick={() => setTab('activity')}
              className={`text-[10px] px-2.5 py-1 rounded-md font-semibold transition-all ${
                tab === 'activity'
                  ? 'bg-white text-[#192D3E] shadow-xs'
                  : 'text-[#64707A] hover:text-[#192D3E]'
              }`}
            >
              Recent Activity
            </button>
          </div>

          <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded-md bg-[#F4F2F3] text-[#64707A]">
            Your records
          </span>
        </div>

        {tab === 'institutions' ? (
          <div className="divide-y divide-[#F0EDEF]">
            {institutions.map((inst) => (
              <div key={inst.name} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#EAE8EA] text-[#304355] flex items-center justify-center text-[9.5px] font-bold shrink-0">
                    {inst.code}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-[#1F2933] truncate">{inst.name}</p>
                    <p className="text-[9.5px] text-[#64707A] truncate">{inst.location}</p>
                  </div>
                </div>

              </div>
            ))}
            {!institutions.length && <p className="py-3 text-[11px] text-[#64707A]">No institutions in your support records yet.</p>}
          </div>
        ) : (
          <div className="relative pl-3 space-y-2.5 before:absolute before:left-[4px] before:top-2 before:bottom-2 before:w-[1px] before:bg-[#EAE8EA]">
            {events.map((ev) => (
              <div key={ev.id} className="relative">
                <span className="absolute -left-[11px] top-1.5 w-2 h-2 rounded-full ring-2 ring-white bg-[#64707A]" />
                <p className="text-[10.5px] font-semibold text-[#1F2933] leading-snug">{ev.requirementTitle || 'Support record'}</p>
                <p className="text-[9.5px] text-[#64707A] mt-0.5">{ev.status || 'Status unavailable'}</p>
              </div>
            ))}
            {!events.length && <p className="text-[11px] text-[#64707A]">No recent support activity yet.</p>}
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-[#F0EDEF] flex items-center justify-between text-[9.5px] text-[#64707A]">
        <span>Data from your support records</span>
        <Clock className="w-3 h-3 text-[#64707A]" />
      </div>
    </div>
  );
}

// ─── Dynamic Live Support Card Component (Preserving Full Business Logic) ─────
function DynamicSupportCard({ support }) {
  const isPartial = support.isPartial;
  const donorOffers = support.donorOffers || [];
  const pendingOffers = donorOffers.filter((offer) => offer.status === 'pending');
  const awaitingResponse = pendingOffers.length > 0;
  const disputed = donorOffers.some((offer) => offer.status === 'disputed');
  const handedOff = donorOffers.some((offer) => offer.status === 'handed_off');
  const active = donorOffers.some((offer) => ['accepted', 'in_progress'].includes(offer.status));
  const supportDetailsPath = (pendingOffers[0] || donorOffers[0])?.id
    ? `/donor/supports/${(pendingOffers[0] || donorOffers[0]).id}`
    : null;

  const items = Array.isArray(support.items) ? support.items : [];

  return (
    <div className="bg-[#FAF8F9] rounded-xl border border-[#EBE7E9] p-4 sm:p-5 hover:border-[#D6D2D4] transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {disputed ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200">
                Disputed
              </span>
            ) : awaitingResponse ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFF4E8] text-[#C96A00] border border-[#FFD8AE]">
                <Clock className="w-3 h-3 text-[#F57C00]" />
                Pending response
              </span>
            ) : handedOff ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200">
                <Truck className="w-3 h-3" />
                Handed off
              </span>
            ) : active || support.hasActive ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#E8F0FE] text-[#1E40AF] border border-[#BFDBFE]">
                <Truck className="w-3 h-3" />
                Active
              </span>
            ) : support.hasCompleted ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]">
                <Check className="w-3 h-3" />
                Completed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                Closed
              </span>
            )}

            {isPartial && (
              <span className="inline-flex items-center text-[9.5px] font-bold px-2 py-0.5 rounded bg-[#EAF2FF] text-[#315F9A] border border-[#C9DDF8]">
                Partial Fulfillment
              </span>
            )}

            <h3 className="text-[15px] font-bold text-[#1F2933]">
              {support.requirementTitle || 'Support request'}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#555E68]">
            {support.institution && (
              <span className="inline-flex items-center gap-1 font-medium text-[#1F2933]">
                <Building2 className="w-3.5 h-3.5 text-[#64707A]" />
                {support.institution}
              </span>
            )}
            {support.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#64707A]" />
                {support.location}
              </span>
            )}
            {support.lastOfferedOn && (
              <span className="inline-flex items-center gap-1 text-[#64707A]">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(support.lastOfferedOn).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            )}
          </div>

          {/* Dynamic Item Progress Bars */}
          {items.length > 0 && (
            <div className="space-y-2 pt-1 max-w-2xl">
              {items.map((itm, idx) => {
                const yourSupport = Number(itm.donorSupportedQuantity || 0);
                const required = Number(itm.quantityRequired || 0);
                const remaining = Number(itm.quantityRemaining || 0);
                const percent = required ? Math.min(100, Math.round((yourSupport / required) * 100)) : 100;

                return (
                  <div key={idx} className="bg-white/70 p-2 rounded-lg border border-[#EAE6E8]">
                    <div className="flex justify-between items-center text-[10.5px] mb-1">
                      <span className="font-semibold text-[#1F2933]">
                        {itm.name} ({required} {itm.unit} requirement)
                      </span>
                      <span className="font-bold text-[#16A34A]">Your Support: {yourSupport} {itm.unit}</span>
                    </div>

                    <div className="flex items-center justify-between text-[9.5px] text-[#64707A] mb-1">
                      <span>Remaining needed: {remaining} {itm.unit}</span>
                      <span>{percent}% allocated</span>
                    </div>

                    <div className="w-full bg-[#EAE8EA] rounded-full h-1.5 overflow-hidden flex">
                      <div className="bg-[#10B981] h-full transition-all duration-500" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Buttons with Real Navigation */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2 shrink-0">
          <Link
            to={`/requirements/${support.requirementId}`}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-[#D8DDE1] text-[#304355] text-[11px] font-semibold hover:bg-[#F5F3F4] transition-colors"
          >
            View Requirement
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {supportDetailsPath && (
            <Link
              to={supportDetailsPath}
              className="px-3.5 py-2 rounded-lg bg-[#C96A00] text-white text-[11px] font-semibold hover:bg-[#A85800] transition-colors shadow-xs"
            >
              Open offer details
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DonorDashboard() {
  const navigate = useNavigate();
  const { user, firebaseUser } = useAuth();
  const [activeTab, setActiveTab] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stats state from API
  const [stats, setStats] = useState({
    activeSupports: 0,
    partiallySupported: 0,
    completedSupports: 0,
    totalSupports: 0,
    pendingConfirmations: 0,
  });

  // Impact state from API
  const [impact, setImpact] = useState({
    totalFoodDonatedKg: 0,
    beneficiariesReached: 0,
    districtsSupported: 0,
  });
  const [profile, setProfile] = useState(null);

  // 1. Fetch User Offers (Real Backend Integration)
  useEffect(() => {
    let cancelled = false;

    async function fetchOffers() {
      if (!firebaseUser) {
        setLoading(false);
        return;
      }
      setLoading(true);

      try {
        const token = await firebaseUser.getIdToken();
        const res = await offerService.getMine(token, { filter: activeTab });
        if (!cancelled && res.data) {
          setOffers(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch donor offers', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchOffers();
    return () => {
      cancelled = true;
    };
  }, [firebaseUser, activeTab]);

  // 2. Fetch User Stats (Real Backend Integration)
  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      if (!firebaseUser) return;
      try {
        const token = await firebaseUser.getIdToken();
        const res = await offerService.getStats(token);
        if (!cancelled && res.data) {
          setStats((prev) => ({ ...prev, ...res.data }));
        }
      } catch (err) {
        console.error('Failed to fetch donor stats', err);
      }
    }

    fetchStats();
    return () => {
      cancelled = true;
    };
  }, [firebaseUser]);

  // 3. Fetch User Impact (Real Backend Integration)
  useEffect(() => {
    let cancelled = false;

    async function fetchImpact() {
      if (!firebaseUser) return;
      try {
        const token = await firebaseUser.getIdToken();
        const res = await offerService.getImpact(token);
        if (!cancelled && res.data) {
          setImpact((prev) => ({ ...prev, ...res.data }));
        }
      } catch (err) {
        console.error('Failed to fetch donor impact', err);
      }
    }

    fetchImpact();
    return () => {
      cancelled = true;
    };
  }, [firebaseUser]);

  useEffect(() => {
    let cancelled = false;
    async function fetchProfile() {
      if (!firebaseUser) return;
      try {
        const token = await firebaseUser.getIdToken();
        const response = await userService.getProfile(token);
        if (!cancelled) setProfile(response.data);
      } catch (err) {
        console.error('Failed to fetch donor profile', err);
      }
    }
    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, [firebaseUser]);

  const displayName = user?.full_name || profile?.full_name || 'Donor';
  const firstName = displayName.split(' ')[0] || 'Donor';
  const totalFoodDonated = Number(impact?.totalFoodDonatedKg ?? 0);
  const totalSupports = Number(stats.totalSupports || 0);

  const completionRate = totalSupports
    ? Math.round((Number(stats.completedSupports || 0) / totalSupports) * 100)
    : 0;

  // Real pending offers detection
  const pendingOffers = useMemo(() => {
    return offers.filter((o) => o.donorOffers?.some((offer) => offer.status === 'pending'));
  }, [offers]);

  // Dynamic institutions extraction
  const dynamicInstitutions = useMemo(() => {
    return Array.from(
      new Map(
        offers
          .map((item) => [item.institution, item])
          .filter(([name]) => Boolean(name))
      ).values()
    );
  }, [offers]);

  // Filtered offers by search query
  const filteredOffers = useMemo(() => {
    if (!searchQuery.trim()) return offers;
    const q = searchQuery.toLowerCase();
    return offers.filter((item) => {
      const matchTitle = (item.requirementTitle || '').toLowerCase().includes(q);
      const matchInst = (item.institution || '').toLowerCase().includes(q);
      const matchLoc = (item.location || '').toLowerCase().includes(q);
      const matchItem = item.items?.some((i) => (i.name || '').toLowerCase().includes(q));
      return matchTitle || matchInst || matchLoc || matchItem;
    });
  }, [offers, searchQuery]);

  const handleConfirmDeliveryClick = (offerId) => {
    if (offerId) {
      navigate(`/donor/supports/${offerId}`);
    } else {
      navigate('/requirements');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9FA] text-[#1B1C1D] font-sans antialiased">
      {/* Top Banner / Dashboard Bar */}
      <div className="border-b border-[#ECEAEC] bg-[#FBF9FA]/90 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-[26px] sm:text-[29px] leading-tight font-bold tracking-tight text-[#192D3E]">
                  Good morning, {firstName}
                </h1>

                <TrustBadge tiers={profile?.trust?.tiers} />
              </div>

              <p className="mt-1 text-[12px] sm:text-[12.5px] text-[#64707A] max-w-2xl leading-snug">
                Review your support activity, trust status, and account documents.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Link
                to="/profile"
                className="group inline-flex shrink-0 items-center gap-2.5 rounded-xl border border-[#304355]/15 bg-white px-3 py-2 text-left shadow-xs transition hover:-translate-y-0.5 hover:border-[#304355]/35 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#304355]"
              >
                <span className="rounded-lg bg-[#304355]/5 p-2 text-[#304355] transition group-hover:bg-[#304355]/10">
                  <UserRound className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-[11px] font-bold text-[#304355]">My profile</span>
                  <span className="block text-[10px] text-[#64707A]">Documents & account</span>
                </span>
                <FileText className="h-3.5 w-3.5 text-[#64707A]" />
              </Link>
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-[#74777D] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search past supports by institution or dis..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white border border-[#D8DDE1] text-[11px] text-[#1F2933] placeholder-[#8C939B] focus:outline-none focus:border-[#192D3E]"
                />
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#D8DDE1] text-[11px] font-medium text-[#304355] hover:bg-[#F5F3F4] transition-colors shrink-0 shadow-xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* KPI CARDS ROW: 4 Identical Uniform Sized Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5 mb-6 items-stretch">
          {/* Card 1: Total Food Donated */}
          <div className="bg-white rounded-2xl border border-[#E8E6E8] p-4 sm:p-5 shadow-[0_2px_10px_rgba(25,45,62,0.04)] h-[155px] flex flex-col justify-between">
            <div className="flex items-start justify-between gap-3">
              <span className="text-[12px] font-semibold text-[#64707A]">Total Food Donated</span>
              <div className="w-9 h-9 rounded-xl bg-[#192D3E] text-white flex items-center justify-center shrink-0">
                <Scale className="w-[18px] h-[18px]" />
              </div>
            </div>
            <div>
              <div className="text-[32px] font-bold tracking-tight text-[#1F2933] leading-none">
                {totalFoodDonated}{' '}
                <span className="text-[14px] font-semibold text-[#64707A]">kg</span>
              </div>
              <div className="mt-3 pt-2 border-t border-[#F0EDEF] flex items-center justify-between text-[10.5px]">
                <span className="text-[#64707A]">Recorded food support</span>
                <Link to="/requirements" className="font-semibold text-[#64707A] hover:text-[#192D3E]">
                  View All
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2: Active Supports */}
          <div className="bg-white rounded-2xl border border-[#E8E6E8] p-4 sm:p-5 shadow-[0_2px_10px_rgba(25,45,62,0.04)] h-[155px] flex flex-col justify-between">
            <div className="flex items-start justify-between gap-3">
              <span className="text-[12px] font-semibold text-[#64707A]">Active Supports</span>
              <div className="w-9 h-9 rounded-xl bg-[#EAF2FF] text-[#2563EB] flex items-center justify-center shrink-0">
                <Truck className="w-[18px] h-[18px]" />
              </div>
            </div>
            <div>
              <div className="text-[32px] font-bold tracking-tight text-[#1F2933] leading-none">
                {stats.activeSupports || 0}{' '}
                <span className="text-[14px] font-semibold text-[#64707A]">records</span>
              </div>
              <div className="mt-3 pt-2 border-t border-[#F0EDEF] flex items-center justify-between text-[10.5px]">
                <span className="text-[#64707A]">Active support records</span>
                <Link to="/requirements" className="font-semibold text-[#64707A] hover:text-[#192D3E]">
                  View All
                </Link>
              </div>
            </div>
          </div>

          {/* Card 3: Pending Confirmation */}
          <div className="bg-white rounded-2xl border border-[#E8E6E8] p-4 sm:p-5 shadow-[0_2px_10px_rgba(25,45,62,0.04)] h-[155px] flex flex-col justify-between">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] font-semibold text-[#64707A]">Pending Confirmation</span>
                <span className="w-2 h-2 rounded-full bg-[#EA580C]" />
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#FFEDD5] text-[#EA580C] flex items-center justify-center shrink-0">
                <ClipboardCheck className="w-[18px] h-[18px]" />
              </div>
            </div>
            <div>
              <div className="text-[32px] font-bold tracking-tight text-[#1F2933] leading-none">
                {stats.pendingConfirmations || 0}{' '}
                <span className="text-[14px] font-semibold text-[#64707A]">action</span>
              </div>
              <div className="mt-3 pt-2 border-t border-[#F0EDEF] flex items-center justify-between text-[10.5px]">
                <span className="text-[#64707A]">Offers requiring attention</span>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('support-records');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="font-semibold text-[#C96A00] hover:underline cursor-pointer"
                >
                  Confirm Now
                </button>
              </div>
            </div>
          </div>

          {/* Card 4: Completed Handoffs */}
          <div className="bg-white rounded-2xl border border-[#E8E6E8] p-4 sm:p-5 shadow-[0_2px_10px_rgba(25,45,62,0.04)] h-[155px] flex flex-col justify-between">
            <div className="flex items-start justify-between gap-3">
              <span className="text-[12px] font-semibold text-[#64707A]">Completed Handoffs</span>
              <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-[18px] h-[18px]" />
              </div>
            </div>
            <div>
              <div className="text-[32px] font-bold tracking-tight text-[#1F2933] leading-none">
                {stats.completedSupports || 0}{' '}
                <span className="text-[14px] font-semibold text-[#64707A]">records</span>
              </div>
              <div className="mt-3 pt-2 border-t border-[#F0EDEF] flex items-center justify-between text-[10.5px]">
                <span className="text-[#64707A]">Confirmed support records</span>
                <Link to="/requirements" className="font-semibold text-[#64707A] hover:text-[#192D3E]">
                  View Records
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* MIDDLE SECTION: ROW 1 (3 UNIFORM EQUAL-SIZED CARDS: 1/3, 1/3, 1/3) */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5 items-stretch">
          <AuditedDispatchMetricCard totalSupports={totalSupports} completionRate={completionRate} />
          <SmoothDonationTrendsChart stats={stats} />
          <PledgeFulfillmentStatusCard totalSupports={totalSupports} stats={stats} />
        </section>

        {/* MIDDLE SECTION: ROW 2 (3 UNIFORM EQUAL-SIZED CARDS: 1/3, 1/3, 1/3) */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6 items-stretch">
          <SupportByCategoryCard offers={offers} totalWeightKg={totalFoodDonated} />
          <DistrictsSupportedMap offers={offers} />
          <SupportedInstitutionsAndActivityCard dynamicInstitutions={dynamicInstitutions} offers={offers} />
        </section>

        {pendingOffers.length > 0 && (
          <section className="mb-6 rounded-2xl bg-[#FFF3E8] border border-[#FFE0C6] p-5 shadow-xs">
            <h2 className="text-[16px] font-bold text-[#1F2933]">Pending support offers</h2>
            <div className="mt-3 space-y-2">
              {pendingOffers.flatMap((requirement) => (requirement.donorOffers || [])
                .filter((offer) => offer.status === 'pending')
                .map((offer) => (
                  <div key={offer.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white p-3">
                    <span className="text-sm font-medium text-[#304355]">{requirement.requirementTitle || 'Support request'}</span>
                    <button
                      type="button"
                      onClick={() => handleConfirmDeliveryClick(offer.id)}
                      className="rounded-lg bg-[#192D3E] px-3 py-2 text-xs font-semibold text-white hover:bg-[#283E52]"
                    >
                      Open offer details
                    </button>
                  </div>
                )))}
            </div>
          </section>
        )}

        {/* SUPPORT RECORDS */}
        <section id="support-records" className="bg-white rounded-2xl border border-[#E8E6E8] p-5 shadow-[0_2px_10px_rgba(25,45,62,0.04)] mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-[18px] font-bold text-[#1F2933]">Support Records & Live Tracking</h2>
              <p className="text-[11.5px] text-[#64707A] mt-0.5">
                Support activity associated with your account.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'all', label: 'All Records', count: totalSupports },
                { id: 'active', label: 'Active Supports', count: stats.activeSupports || 0 },
                { id: 'partial', label: 'Partially Supported', count: stats.partiallySupported || 0 },
                { id: 'complete', label: 'Completed Handoffs', count: stats.completedSupports || 0 },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#192D3E] text-white shadow-xs'
                      : 'bg-[#F4F2F3] text-[#64707A] hover:text-[#1F2933] hover:bg-[#ECE9EB]'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>

          {/* Search box within records */}
          <div className="relative max-w-md mb-4">
            <Search className="w-3.5 h-3.5 text-[#74777D] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by requirement, institution, location, or item..."
              className="w-full pl-8 pr-3 py-2 rounded-lg bg-[#F5F3F4] text-[11.5px] text-[#1F2933] placeholder-[#74777D] border-0 focus:outline-none focus:ring-1 focus:ring-[#192D3E]"
            />
          </div>

          {/* Records Display: Live Backend Data or Polished Fallback */}
          <div className="space-y-3.5">
            {loading ? (
              <div className="py-12 text-center text-[#64707A] text-[12px] flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-[#192D3E] border-t-transparent rounded-full animate-spin" />
                Loading your support records...
              </div>
            ) : filteredOffers.length > 0 ? (
              // RENDER REAL BACKEND RECORDS
              filteredOffers.map((support) => (
                <DynamicSupportCard
                  key={support.id}
                  support={support}
                />
              ))
            ) : (
              <p className="py-8 text-center text-sm text-[#64707A]">
                {searchQuery ? 'No support records match your search.' : 'No support records in this category yet.'}
              </p>
            )}
          </div>

          {/* Bottom verified statement & refresh time */}
          <div className="mt-5 pt-3.5 border-t border-[#F0EDEF] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10.5px] text-[#64707A]">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#64707A]" />
              Support information is shown as recorded; confirm details directly with the requester.
            </span>
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 rounded-lg border border-[#304355]/15 bg-white px-3 py-2 font-semibold text-[#304355] transition hover:border-[#304355]/30 hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#304355]"
            >
              <UserRound className="h-4 w-4" />
              Manage profile & documents
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="mt-8 bg-[#F4F2F3] border-t border-[#E8E6E8]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md bg-[#192D3E] text-white flex items-center justify-center">
                  <Heart className="w-3 h-3 text-[#10B981]" />
                </div>
                <span className="text-[15px] font-bold text-[#192D3E]">PoshanSetu</span>
              </div>
              <p className="text-[11px] text-[#64707A] leading-relaxed mb-3">
                PoshanSetu connects donors with current local food requirements and keeps support activity visible.
              </p>
            </div>

            <div>
              <h4 className="text-[10.5px] font-bold tracking-wider uppercase text-[#1F2933] mb-3">Explore</h4>
              <Link to="/requirements" className="block text-[11px] text-[#64707A] hover:underline">Browse requirements</Link>
            </div>

            <div>
              <h4 className="text-[10.5px] font-bold tracking-wider uppercase text-[#1F2933] mb-3">Account</h4>
              <Link to="/profile" className="inline-flex items-center gap-2 rounded-lg border border-[#D8DDE1] bg-white px-3 py-2 text-[11px] font-semibold text-[#304355] transition hover:border-[#304355]/30 hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#304355]">
                <FileText className="h-3.5 w-3.5" />
                Profile & documents
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-[#DFDCDE] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-[#74777D]">
            <span>PoshanSetu</span>
            <span>Support details are subject to requester and admin review.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
