import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/common/Button';
import AuthContext from '../../context/AuthContext';
import { requirementService } from '../../services/api';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  User,
  Package,
  Edit3,
  Clock,
  RefreshCw,
  Eye,
  MessageSquare,
  ShieldCheck,
  Trash2,
  Loader2,
} from 'lucide-react';

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
  critical: { label: 'Critical', color: 'text-red-600 bg-red-50 border border-red-200' },
  high: { label: 'High', color: 'text-orange-600 bg-orange-50 border border-orange-200' },
  medium: { label: 'Medium', color: 'text-amber-600 bg-amber-50 border border-amber-200' },
  low: { label: 'Low', color: 'text-blue-600 bg-blue-50 border border-blue-200' },
};

function StatusChip({ status }) {
  const s = STATUS_CONFIG[status] || STATUS_CONFIG.under_review;
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
      {s.label}
    </span>
  );
}

function ItemProgress({ item }) {
  const done = item.quantityRequired - item.quantityRemaining;
  const pct = item.quantityRequired > 0 ? Math.round((done / item.quantityRequired) * 100) : 0;
  return (
    <div className="bg-[#E8E8E2] rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-sm text-[#1F2933]">{item.name}</span>
        <span className="text-xs text-[#64707A]">{done} / {item.quantityRequired} {item.unit}</span>
      </div>
      <div className="w-full bg-slate-300 rounded-full h-2 mb-1.5">
        <div
          className={`h-2 rounded-full transition-all ${item.quantityRemaining === 0 ? 'bg-purple-500' : pct > 50 ? 'bg-[#304355]' : 'bg-orange-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-emerald-600 font-semibold">{done} {item.unit} covered</span>
        <span className={`font-semibold ${item.quantityRemaining > 0 ? 'text-orange-600' : 'text-purple-600'}`}>
          {item.quantityRemaining > 0 ? `${item.quantityRemaining} ${item.unit} still needed` : 'Fulfilled'}
        </span>
      </div>
    </div>
  );
}

export default function RequirementManagement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { firebaseUser } = useContext(AuthContext);
  const [req, setReq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!firebaseUser || !id) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const token = await firebaseUser.getIdToken();
        const res = await requirementService.getMyById(token, id);
        if (!cancelled) setReq(res.data);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load requirement');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [firebaseUser, id]);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-32 gap-3 text-[#64707A]">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-sm font-medium">Loading requirement…</span>
        </div>
      </PageContainer>
    );
  }

  if (error || !req) {
    return (
      <PageContainer>
        <div className="max-w-lg mx-auto px-6 py-20 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="font-semibold text-red-700 mb-4">{error || 'Requirement not found'}</p>
          <Button variant="outline" onClick={() => navigate('/requester/dashboard')} icon={ArrowLeft}>
            Back to Dashboard
          </Button>
        </div>
      </PageContainer>
    );
  }

  const totalTarget = req.items.reduce((a, i) => a + i.quantityRequired, 0);
  const totalRemaining = req.items.reduce((a, i) => a + i.quantityRemaining, 0);
  const overallPct = totalTarget > 0 ? Math.round(((totalTarget - totalRemaining) / totalTarget) * 100) : 0;
  const location = [req.city, req.district].filter(Boolean).join(', ');

  return (
    <PageContainer>
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#64707A] mb-6">
          <Link to="/requester/dashboard" className="hover:text-[#304355] transition-colors">My Requirements</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#1F2933] font-medium truncate max-w-xs">{req.title}</span>
        </nav>

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <StatusChip status={req.status} />
              <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${URGENCY_CONFIG[req.urgency]?.color}`}>
                {URGENCY_CONFIG[req.urgency]?.label} Urgency
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#304355] mb-1 tracking-tight">{req.title}</h1>
            <div className="flex items-center gap-1.5 text-sm text-[#64707A]">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>{location}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to={`/requester/requirements/${req.id}/status`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#304355] border border-[#304355] px-3 py-2 rounded-lg hover:bg-[#304355]/5 transition-colors"
            >
              <Eye className="w-4 h-4" />
              View Status
            </Link>
          </div>
        </div>

        {/* Under Review Notice */}
        {req.status === 'under_review' && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-blue-800 mb-0.5">Awaiting Admin Review</p>
              <p className="text-xs text-blue-700">
                This requirement is currently being reviewed by PoshanSetu moderators. Once approved, it will become publicly visible to donors.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Description Card */}
            <div className="bg-white rounded-2xl border border-[#304355]/10 shadow-sm p-6">
              <h2 className="font-bold text-[#304355] mb-3">About this Requirement</h2>
              <p className="text-sm text-[#64707A] leading-relaxed mb-4">{req.description}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-[#64707A]">
                <div>
                  <p className="font-semibold uppercase tracking-wider mb-0.5">Submitted</p>
                  <p className="text-[#1F2933] font-medium">{new Date(req.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <div>
                  <p className="font-semibold uppercase tracking-wider mb-0.5">Expires</p>
                  <p className="text-[#1F2933] font-medium">{new Date(req.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <div>
                  <p className="font-semibold uppercase tracking-wider mb-0.5">Beneficiaries</p>
                  <p className="text-[#1F2933] font-medium">{req.beneficiaryCount}</p>
                </div>
              </div>
              {req.beneficiaryDescription && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-[#64707A] uppercase tracking-wider mb-2">Beneficiary Details</p>
                  <p className="text-xs text-[#64707A]">{req.beneficiaryDescription}</p>
                </div>
              )}
            </div>

            {/* Items Progress */}
            <div className="bg-white rounded-2xl border border-[#304355]/10 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#304355]">Items Progress</h2>
                <span className="text-sm font-semibold text-[#304355]">{overallPct}% overall</span>
              </div>
              {req.items.length === 0 ? (
                <p className="text-sm text-[#64707A]">No items listed.</p>
              ) : (
                <div className="space-y-3">
                  {req.items.map((item) => (
                    <ItemProgress key={item.id || item.name} item={item} />
                  ))}
                </div>
              )}
            </div>

            {/* Donor Support Note — placeholder until Phase 10 */}
            <div className="bg-white rounded-2xl border border-[#304355]/10 shadow-sm p-6">
              <h2 className="font-bold text-[#304355] mb-2">Donor Offers</h2>
              <p className="text-sm text-[#64707A]">
                Donor support functionality will be available in the next phase. Once active, donors can view and offer support for this requirement.
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Summary Numbers */}
            <div className="bg-white rounded-2xl border border-[#304355]/10 shadow-sm p-5">
              <h3 className="font-bold text-[#304355] mb-4 text-sm uppercase tracking-wider">Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#64707A]">Total needed</span>
                  <span className="font-bold text-[#1F2933]">{totalTarget} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64707A]">Covered</span>
                  <span className="font-bold text-emerald-600">{totalTarget - totalRemaining} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64707A]">Still needed</span>
                  <span className={`font-bold ${totalRemaining > 0 ? 'text-orange-600' : 'text-purple-600'}`}>
                    {totalRemaining > 0 ? `${totalRemaining} units` : 'Fulfilled!'}
                  </span>
                </div>
              </div>
            </div>

            {/* Expiry Warning */}
            {(req.status === 'active' || req.status === 'partially_supported') && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-[#1F2933] mb-0.5">Expiry Reminder</p>
                  <p className="text-xs text-[#64707A]">
                    Expires on <strong>{new Date(req.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* Quick Links */}
            <div className="bg-white rounded-2xl border border-[#304355]/10 shadow-sm p-4">
              <h3 className="font-bold text-sm text-[#304355] mb-3">Actions</h3>
              <div className="space-y-2">
                <Link
                  to={`/requester/requirements/${req.id}/status`}
                  className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium text-[#1F2933] hover:bg-[#E8E8E2] transition-colors"
                >
                  View Lifecycle Status
                  <ChevronRight className="w-4 h-4 text-[#64707A]" />
                </Link>
                {req.status === 'active' && (
                  <Link
                    to={`/requirements/${req.id}`}
                    className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium text-[#1F2933] hover:bg-[#E8E8E2] transition-colors"
                  >
                    View Public Page
                    <ChevronRight className="w-4 h-4 text-[#64707A]" />
                  </Link>
                )}
                <Link
                  to="/requester/dashboard"
                  className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium text-[#1F2933] hover:bg-[#E8E8E2] transition-colors"
                >
                  Back to Dashboard
                  <ChevronRight className="w-4 h-4 text-[#64707A]" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
