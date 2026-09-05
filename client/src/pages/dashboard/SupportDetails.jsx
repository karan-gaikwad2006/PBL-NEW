import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/common/Button';
import AuthContext from '../../context/AuthContext';
import { offerService } from '../../services/api';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Package,
  CheckCircle2,
  Clock,
  RefreshCw,
  User,
  MessageSquare,
  ChevronRight,
  AlertCircle,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

function StatusChip({ status }) {
  const map = {
    pending: { label: 'Pending Response', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300' },
    accepted: { label: 'Active', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    in_progress: { label: 'In Progress', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
    completed: { label: 'Completed', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  };
  const s = map[status] || map.accepted;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
      {s.label}
    </span>
  );
}

export default function SupportDetails() {
  const { supportId } = useParams();
  const navigate = useNavigate();
  const { firebaseUser } = useContext(AuthContext);

  const [support, setSupport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!firebaseUser || !supportId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const token = await firebaseUser.getIdToken();
        const res = await offerService.getById(token, supportId);
        if (!cancelled) setSupport(res.data);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load support offer details');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [firebaseUser, supportId]);

  const handleConfirmDelivery = async () => {
    if (!firebaseUser || !supportId) return;
    setSubmitting(true);
    setError(null);
    try {
      const token = await firebaseUser.getIdToken();
      const res = await offerService.confirmDonor(token, supportId);
      setSupport(res.data);
    } catch (err) {
      setError(err.message || 'Failed to confirm delivery');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-32 gap-3 text-[#64707A]">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-sm font-medium">Loading support details…</span>
        </div>
      </PageContainer>
    );
  }

  if (error && !support) {
    return (
      <PageContainer>
        <div className="max-w-lg mx-auto px-6 py-20 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="font-semibold text-red-700 mb-4">{error}</p>
          <Button variant="outline" onClick={() => navigate('/donor/dashboard')} icon={ArrowLeft}>
            Back to Dashboard
          </Button>
        </div>
      </PageContainer>
    );
  }

  const donorConfirmed = support.confirmedByDonor;
  const requesterConfirmed = support.confirmedByRequester;

  return (
    <PageContainer>
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#64707A] mb-6">
          <Link to="/donor/dashboard" className="hover:text-[#304355] transition-colors">My Dashboard</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/donor/dashboard" className="hover:text-[#304355] transition-colors">Active Supports</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#1F2933] font-medium truncate max-w-xs">{support.requirementTitle}</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-[#304355] mb-2 tracking-tight">Support Details</h1>
            <StatusChip status={support.status} />
          </div>
          <Link
            to="/donor/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#64707A] hover:text-[#304355] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#304355]/10 p-6">
              <h2 className="text-xl font-bold text-[#304355] mb-1">{support.requirementTitle}</h2>
              <div className="flex items-center gap-1.5 text-sm text-[#64707A] mb-5">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>{support.location || 'Maharashtra'}</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
                <div className="bg-[#E8E8E2] rounded-xl p-4 text-center">
                  <p className="text-xs text-[#64707A] uppercase tracking-wider font-semibold mb-1">Item Offered</p>
                  <p className="text-lg font-extrabold text-[#304355]">{support.item}</p>
                </div>
                <div className="bg-[#E8E8E2] rounded-xl p-4 text-center">
                  <p className="text-xs text-[#64707A] uppercase tracking-wider font-semibold mb-1">Quantity</p>
                  <p className="text-lg font-extrabold text-[#304355]">{support.quantityOffered} {support.unit}</p>
                </div>
                <div className="bg-[#E8E8E2] rounded-xl p-4 text-center col-span-2 md:col-span-1">
                  <p className="text-xs text-[#64707A] uppercase tracking-wider font-semibold mb-1">Status</p>
                  <p className="text-lg font-extrabold text-[#304355] capitalize">{support.status}</p>
                </div>
              </div>
            </div>

            {/* Message */}
            {support.donorMessage && (
              <div className="bg-white rounded-2xl shadow-sm border border-[#304355]/10 p-6">
                <h3 className="font-bold text-[#304355] mb-3 text-base flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Your Message to Requester
                </h3>
                <div className="bg-[#E8E8E2] rounded-xl px-4 py-3 text-sm text-[#1F2933] italic">
                  "{support.donorMessage}"
                </div>
              </div>
            )}

            {/* Completion Confirmation */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#304355]/10 p-6">
              <h3 className="font-bold text-[#304355] mb-2 text-base">Dual-Confirmation Status</h3>
              <p className="text-sm text-[#64707A] mb-4 leading-relaxed">
                Once you have delivered the items and the requester has confirmed receipt, both confirmations are recorded to complete this support offer.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${donorConfirmed ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'}`}>
                  <CheckCircle2 className={`w-5 h-5 ${donorConfirmed ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <div>
                    <p className="font-semibold text-sm text-[#1F2933]">Your Confirmation</p>
                    <p className="text-xs text-[#64707A]">{donorConfirmed ? `Confirmed on ${new Date(support.donorConfirmedAt).toLocaleDateString('en-IN')}` : 'Pending'}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${requesterConfirmed ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'}`}>
                  <CheckCircle2 className={`w-5 h-5 ${requesterConfirmed ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <div>
                    <p className="font-semibold text-sm text-[#1F2933]">Requester's Confirmation</p>
                    <p className="text-xs text-[#64707A]">{requesterConfirmed ? `Confirmed on ${new Date(support.requesterConfirmedAt).toLocaleDateString('en-IN')}` : 'Pending'}</p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-700 text-xs font-semibold">
                  {error}
                </div>
              )}

              {!donorConfirmed ? (
                <Button
                  variant="emerald"
                  icon={submitting ? Loader2 : CheckCircle2}
                  disabled={submitting}
                  onClick={handleConfirmDelivery}
                  className="w-full sm:w-auto"
                >
                  {submitting ? 'Confirming…' : 'Confirm I Have Delivered the Items'}
                </Button>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-sm text-emerald-800 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Your delivery confirmation has been recorded.
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-5">
            {/* Requester Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#304355]/10 p-5">
              <h3 className="font-bold text-[#304355] mb-4 text-sm uppercase tracking-wider">Requester Details</h3>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-[#304355]/10 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-[#304355]" />
                </div>
                <div>
                  <p className="font-bold text-sm text-[#1F2933]">{support.requesterName}</p>
                  <p className="text-xs text-[#64707A]">Requester Institution / Individual</p>
                </div>
              </div>
              <Link
                to={`/requirements/${support.requirementId}`}
                className="text-xs font-semibold text-[#304355] hover:underline inline-flex items-center gap-1"
              >
                View Requirement Details <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Navigation */}
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => navigate('/donor/dashboard')}
              icon={ArrowLeft}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

