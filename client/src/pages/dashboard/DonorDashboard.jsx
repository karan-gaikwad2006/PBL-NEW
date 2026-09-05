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
function SupportCard({ support, showAction = false }) {
  const navigate = useNavigate();
  return (
    <div className={`bg-white rounded-xl border p-5 shadow-sm transition-shadow hover:shadow-md ${support.actionRequired ? 'border-amber-300' : 'border-[#304355]/10'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <StatusChip status={support.status} />
          </div>
          <h3 className="font-bold text-[#304355] text-base mb-1 truncate">{support.requirementTitle}</h3>
          <p className="text-sm text-[#64707A] mb-0.5">{support.institution}</p>
          <div className="flex items-center gap-1 text-xs text-[#64707A] mt-1">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>{support.location}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-[#64707A] uppercase tracking-wider font-semibold mb-1">Offered</p>
          <p className="font-bold text-[#1F2933] text-base">{support.quantityOffered}</p>
          <p className="text-xs text-[#64707A]">{support.item}</p>
        </div>
      </div>

      {support.message && (
        <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">{support.message}</p>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-[#64707A]">
          <Calendar className="w-3.5 h-3.5" />
          <span>Offered on {new Date(support.offeredOn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
        <div className="flex items-center gap-2">
          {showAction && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => navigate(`/confirm-completion/${support.id}`)}
            >
              Confirm Completion
            </Button>
          )}
          <Link
            to={`/donor/supports/${support.id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#304355] hover:underline"
          >
            View Details <ChevronRight className="w-3.5 h-3.5" />
          </Link>
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

  useEffect(() => {
    let cancelled = false;
    async function fetchOffers() {
      if (!firebaseUser) return;
      try {
        const token = await firebaseUser.getIdToken();
        const res = await offerService.getMine(token);
        if (!cancelled) setOffers(res.data);
      } catch (err) {
        console.error("Failed to fetch donor offers", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchOffers();
    return () => { cancelled = true; };
  }, [firebaseUser]);

  const displayName = user?.full_name || 'Donor';
  const initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const pendingOffers = offers.filter(o => o.actionRequired);
  const activeOffers = offers.filter(o => o.status === 'accepted' || o.status === 'in_progress');
  const completedOffers = offers.filter(o => o.status === 'completed');

  const DONOR_STATS = {
    activeSupports: activeOffers.length,
    pendingConfirmations: pendingOffers.length,
    partiallySupported: 0, // Placeholder
    completedSupports: completedOffers.length,
  };

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
          <StatCard icon={Heart} value={DONOR_STATS.activeSupports} label="Active Supports" />
          <StatCard
            icon={AlertCircle}
            value={DONOR_STATS.pendingConfirmations}
            label="Pending Confirmations"
            highlighted
            highlightColor="text-amber-500"
          />
          <StatCard icon={RefreshCw} value={DONOR_STATS.partiallySupported} label="Partially Supported" highlightColor="text-sky-500" />
          <StatCard icon={CheckCircle2} value={DONOR_STATS.completedSupports} label="Completed Supports" highlightColor="text-emerald-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Pending Action Banner */}
            {pendingOffers.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-[#304355] mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  Pending Action
                </h2>
                <div className="space-y-4">
                  {pendingOffers.map((s) => (
                    <SupportCard key={s.id} support={s} showAction />
                  ))}
                </div>
              </section>
            )}

            {/* Active Supports with Tabs */}
            <section>
              <div className="flex items-center gap-1 border-b border-slate-200 mb-4">
                {[
                  { id: 'active', label: 'Active Supports' },
                  { id: 'completed', label: 'Completed' },
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

              {activeTab === 'active' && (
                <div className="space-y-4">
                  {loading ? (
                     <div className="text-[#64707A] text-sm">Loading offers...</div>
                  ) : activeOffers.length === 0 && pendingOffers.length === 0 ? (
                     <div className="text-[#64707A] text-sm">No active support offers found.</div>
                  ) : (
                    activeOffers.map((s) => (
                      <SupportCard key={s.id} support={s} />
                    ))
                  )}
                </div>
              )}

              {activeTab === 'completed' && (
                <div className="space-y-4">
                  {completedOffers.length === 0 ? (
                     <div className="text-[#64707A] text-sm">No completed supports yet.</div>
                  ) : (
                    completedOffers.map((s) => (
                      <div key={s.id} className="bg-white rounded-xl border border-[#304355]/10 p-5 shadow-sm flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <StatusChip status="completed" />
                          </div>
                          <h3 className="font-bold text-[#304355] text-sm mb-0.5">{s.requirementTitle}</h3>
                          <p className="text-xs text-[#64707A]">{s.institution} — {s.location}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-[#1F2933] text-base">{s.quantityOffered}</p>
                          <p className="text-xs text-[#64707A]">{s.item}</p>
                          <p className="text-xs text-[#64707A] mt-1">
                            {new Date(s.offeredOn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
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
                  <p className="text-xl font-extrabold text-[#304355]">{offers.length}</p>
                  <p className="text-xs text-[#64707A]">Total Supports</p>
                </div>
                <div className="bg-[#E8E8E2] rounded-lg py-2.5">
                  <p className="text-xl font-extrabold text-[#304355]">{DONOR_STATS.completedSupports}</p>
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
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Total food donated</span>
                  <span className="font-bold">~200 kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Beneficiaries reached</span>
                  <span className="font-bold">~350</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Districts supported</span>
                  <span className="font-bold">Nashik</span>
                </div>
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
