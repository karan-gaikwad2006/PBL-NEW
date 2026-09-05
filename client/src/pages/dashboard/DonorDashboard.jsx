import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/common/Button';
import useAuth from '../../hooks/useAuth';
import { offerService } from '../../services/api';
import {
  Heart,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  MapPin,
  Package,
  Calendar,
  TrendingUp,
  Bell,
  User,
  RefreshCw,
  ArrowRight,
  CircleDot,
  Info,
} from 'lucide-react';

// ─── Mock Data ───────────────────────────────────────────────────────────────
// Mock data replaced by real API data

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusChip({ status }) {
  const map = {
    pending: { label: 'Action Needed', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300' },
    accepted: { label: 'Active', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    in_progress: { label: 'In Progress', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
    completed: { label: 'Completed', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  };
  const s = map[status] || map.active;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
      {s.label}
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, value, label, highlighted, highlightColor }) {
  return (
    <div className={`bg-white rounded-xl p-5 shadow-sm border ${highlighted ? `border-2 border-amber-300 relative overflow-hidden` : 'border-[#304355]/10'} hover:shadow-md transition-shadow`}>
      {highlighted && (
        <div className="absolute top-0 right-0 bg-amber-400 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase tracking-wide">
          Action Needed
        </div>
      )}
      <div className={`flex items-center justify-between mb-3 ${highlighted ? 'mt-4' : ''}`}>
        <Icon className={`w-6 h-6 ${highlightColor || 'text-[#304355]'}`} />
        <span className="text-3xl font-extrabold text-[#304355]">{value}</span>
      </div>
      <p className="text-xs font-semibold text-[#64707A] uppercase tracking-wider">{label}</p>
    </div>
  );
}

// ─── Support Card ─────────────────────────────────────────────────────────────
function SupportCard({ support }) {
  const navigate = useNavigate();

  const isPartial = support.isPartial;

  const pendingOffers = support.donorOffers.filter(o => o.status === 'pending');
  const actionRequired = pendingOffers.length > 0;

  return (
    <div className={`bg-white rounded-xl border p-5 shadow-sm transition-shadow hover:shadow-md ${actionRequired ? 'border-amber-300' : 'border-[#304355]/10'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {actionRequired ? (
              <StatusChip status="pending" />
            ) : support.hasActive ? (
              <StatusChip status="accepted" />
            ) : (
              <StatusChip status="completed" />
            )}

            {isPartial && (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 uppercase tracking-tight">
                Partial Fulfillment
              </span>
            )}
          </div>
          <h3 className="font-bold text-[#304355] text-base mb-1 truncate">{support.requirementTitle}</h3>
          <p className="text-sm text-[#64707A] mb-0.5">{support.institution}</p>
          <div className="flex items-center gap-1 text-xs text-[#64707A] mt-1">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>{support.location}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <Link
            to={`/requirements/${support.requirementId}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#304355] hover:underline mb-2"
          >
            View Requirement <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-3">
        <p className="text-[10px] font-bold text-[#64707A] uppercase tracking-wider">Requirement Items & Your Support</p>
        {support.items && support.items.map(itm => {
          const yourSupport = Number(itm.donorSupportedQuantity || 0);
          const required = Number(itm.quantityRequired || 0);
          const remaining = Number(itm.quantityRemaining || 0);
          const supportedByOthers = Math.max(0, required - remaining - yourSupport);
          return (
            <div key={itm.name} className="space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-semibold text-[#304355]">
                  {itm.name}
                </span>
                <span className="text-[#64707A]">{itm.unit}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px] text-[#64707A]">
                <span>Required: <strong className="text-[#304355]">{required}</strong></span>
                <span>Your support: <strong className="text-emerald-600">{yourSupport}</strong></span>
                <span>Remaining: <strong className="text-[#304355]">{remaining}</strong></span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden flex">
                {/* Someone else's support (or total supported minus yours) */}
                <div
                  className="bg-slate-400 h-full transition-all duration-500"
                  style={{ width: `${required ? Math.min(100, (supportedByOthers / required) * 100) : 0}%` }}
                />
                {/* Your support */}
                <div
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${required ? Math.min(100, (yourSupport / required) * 100) : 0}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {actionRequired && (
        <div className="mt-4 space-y-3">
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Pending Deliveries</p>
          {pendingOffers.map(offer => (
            <div key={offer.id} className="flex items-center justify-between bg-white border border-amber-200 rounded p-2">
              <div className="text-xs">
                <span className="font-bold text-[#304355]">{offer.quantity_offered} {offer.unit}</span> of {offer.item_name}
              </div>
              <Button
                size="sm"
                variant="danger"
                onClick={() => navigate(`/confirm-completion/${offer.id}`)}
                className="py-1 px-3 text-[11px]"
              >
                Confirm Delivery
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Show active but not pending offers (e.g. waiting for requester) */}
      {!actionRequired && support.hasActive && (
         <div className="mt-4 p-2 bg-blue-50 border border-blue-200 rounded flex items-start gap-2">
           <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
           <p className="text-xs text-blue-800">
             You have confirmed delivery. Waiting for the requester to confirm receipt.
           </p>
         </div>
      )}

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-[#64707A]">
          <Calendar className="w-3.5 h-3.5" />
          <span>Last offered on {new Date(support.lastOfferedOn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DonorDashboard() {
  const { user, firebaseUser } = useAuth();
  const [activeTab, setActiveTab] = useState('active');
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeSupports: 0,
    partiallySupported: 0,
    completedSupports: 0,
    pendingConfirmations: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [impact, setImpact] = useState(null);
  const [impactLoading, setImpactLoading] = useState(true);
  const [impactError, setImpactError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchOffers() {
      if (!firebaseUser) return;
      setLoading(true);
      try {
        const token = await firebaseUser.getIdToken();
        const res = await offerService.getMine(token, { filter: activeTab });
        if (!cancelled) setOffers(res.data);
      } catch (err) {
        console.error("Failed to fetch donor offers", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchOffers();
    return () => { cancelled = true; };
  }, [firebaseUser, activeTab]);

  useEffect(() => {
    let cancelled = false;
    async function fetchStats() {
      if (!firebaseUser) return;
      setStatsLoading(true);
      try {
        const token = await firebaseUser.getIdToken();
        const res = await offerService.getStats(token);
        if (!cancelled) setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch donor stats", err);
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    }
    fetchStats();
    return () => { cancelled = true; };
  }, [firebaseUser]);

  useEffect(() => {
    let cancelled = false;
    async function fetchImpact() {
      if (!firebaseUser) return;
      setImpactLoading(true);
      setImpactError(null);
      try {
        const token = await firebaseUser.getIdToken();
        const res = await offerService.getImpact(token);
        if (!cancelled) setImpact(res.data);
      } catch (err) {
        console.error("Failed to fetch donor impact", err);
        if (!cancelled) setImpactError(err.message || 'Unable to load impact data');
      } finally {
        if (!cancelled) setImpactLoading(false);
      }
    }
    fetchImpact();
    return () => { cancelled = true; };
  }, [firebaseUser]);

  const displayName = user?.full_name || 'Donor';
  const initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const pendingOffers = offers.filter(o => o.donorOffers.some(offer => offer.status === 'pending'));

  return (
    <PageContainer>
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-10">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#304355] mb-1 tracking-tight">
              Good afternoon, {displayName.split(' ')[0]}
            </h1>
            <p className="text-sm text-[#64707A]">Track your support and discover where you can help next.</p>
          </div>
          <Link
            to="/requirements"
            className="inline-flex items-center gap-2 bg-[#304355] text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-[#243342] transition-colors"
          >
            <Heart className="w-4 h-4" />
            Find More to Support
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard icon={Heart} value={stats.activeSupports} label="Active Supports" />
          <StatCard
            icon={AlertCircle}
            value={stats.pendingConfirmations}
            label="Pending Confirmations"
            highlighted
            highlightColor="text-amber-500"
          />
          <StatCard icon={RefreshCw} value={stats.partiallySupported} label="Partially Supported" highlightColor="text-sky-500" />
          <StatCard icon={CheckCircle2} value={stats.completedSupports} label="Completed Supports" highlightColor="text-emerald-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Pending Action Banner */}
            {activeTab === 'active' && pendingOffers.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-[#304355] mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  Pending Action
                </h2>
                <div className="space-y-4">
                  {pendingOffers.map((s) => (
                    <SupportCard key={s.id} support={s} />
                  ))}
                </div>
              </section>
            )}

            {/* Active Supports with Tabs */}
            <section>
              <div className="flex items-center gap-1 border-b border-slate-200 mb-4">
                {[
                  { id: 'active', label: 'Active Supports' },
                  { id: 'partial', label: 'Partially Supported' },
                  { id: 'complete', label: 'Completed' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-[#304355] text-[#304355]'
                        : 'border-transparent text-[#64707A] hover:text-[#304355]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {loading ? (
                   <div className="text-[#64707A] text-sm py-8 flex items-center gap-2">
                     <RefreshCw className="w-4 h-4 animate-spin" />
                     Loading supports...
                   </div>
                ) : offers.length === 0 ? (
                   <div className="bg-white rounded-xl border border-dashed border-slate-300 py-12 text-center">
                     <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                     <p className="text-[#64707A] text-sm">No {activeTab} support records found.</p>
                     <Link to="/requirements" className="text-[#304355] text-xs font-bold mt-2 inline-block hover:underline">
                       Find requirements to support
                     </Link>
                   </div>
                ) : (
                  offers.map((s) => (
                    <SupportCard key={s.id} support={s} />
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-xl border border-[#304355]/10 shadow-sm p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#304355] text-white flex items-center justify-center text-lg font-extrabold">
                  {initials}
                </div>
                <div>
                  <p className="font-bold text-[#1F2933]">{displayName}</p>
                  <p className="text-xs text-[#64707A]">Individual Donor</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-[#E8E8E2] rounded-lg py-2.5">
                  <p className="text-xl font-extrabold text-[#304355]">
                    {statsLoading ? '...' : (stats.activeSupports + stats.partiallySupported + stats.completedSupports)}
                  </p>
                  <p className="text-xs text-[#64707A]">Total Supports</p>
                </div>
                <div className="bg-[#E8E8E2] rounded-lg py-2.5">
                  <p className="text-xl font-extrabold text-[#304355]">
                    {statsLoading ? '...' : stats.completedSupports}
                  </p>
                  <p className="text-xs text-[#64707A]">Fulfilled</p>
                </div>
              </div>
              <Link to="/institution-profile" className="mt-4 block text-center text-xs font-semibold text-[#304355] hover:underline">
                View Full Profile
              </Link>
            </div>

            {/* Impact Highlights */}
            <div className="bg-[#304355] text-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5" />
                <h3 className="font-bold text-sm">Your Impact</h3>
              </div>
              <div className="space-y-3 text-sm">
                {impactLoading ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Total food donated</span>
                      <span className="font-bold animate-pulse bg-white/10 rounded px-3 py-0.5 min-w-[70px]">&nbsp;</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Beneficiaries reached</span>
                      <span className="font-bold animate-pulse bg-white/10 rounded px-3 py-0.5 min-w-[40px]">&nbsp;</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Districts supported</span>
                      <span className="font-bold animate-pulse bg-white/10 rounded px-3 py-0.5 min-w-[40px]">&nbsp;</span>
                    </div>
                  </div>
                ) : impactError ? (
                  <p className="text-xs text-amber-300/90 italic">Impact data temporarily unavailable.</p>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Total food donated</span>
                      <span className="font-bold">{impact?.totalFoodDonatedKg ?? 0} kg</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Beneficiaries reached</span>
                      <span className="font-bold">{impact?.beneficiariesReached ?? 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Districts supported</span>
                      <span className="font-bold">{impact?.districtsSupported ?? 0}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl border border-[#304355]/10 shadow-sm p-4">
              <h3 className="font-bold text-sm text-[#304355] mb-3">Quick Actions</h3>
              <div className="space-y-1">
                {[
                  { label: 'Explore Requirements', to: '/requirements' },
                  { label: 'Food Matching Tool', to: '/food-match' },
                  { label: 'Notifications', to: '/notifications' },
                ].map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium text-[#1F2933] hover:bg-[#E8E8E2] transition-colors group"
                  >
                    {link.label}
                    <ArrowRight className="w-3.5 h-3.5 text-[#64707A] group-hover:text-[#304355] transition-colors" />
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
