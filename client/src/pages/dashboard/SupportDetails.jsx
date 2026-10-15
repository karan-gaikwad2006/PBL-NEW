import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/common/Button';
import AuthContext from '../../context/AuthContext';
import { offerService } from '../../services/api';
import TrustBadge from '../../components/trust/TrustBadge';
import OfficialChannelNotice from '../../components/trust/OfficialChannelNotice';
import ReportButton from '../../components/trust/ReportButton';
import Modal from '../../components/common/Modal';
import {
  ArrowLeft,
  MapPin,
  CheckCircle2,
  User,
  MessageSquare,
  ChevronRight,
  AlertCircle,
  Loader2,
} from 'lucide-react';

function StatusChip({ status }) {
  const map = {
    pending: { label: 'Pending Response', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300' },
    accepted: { label: 'Active', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    in_progress: { label: 'In Progress', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
    completed: { label: 'Completed', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    handed_off: { label: 'Handed off', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
    disputed: { label: 'Disputed', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
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
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [now, setNow] = useState(() => Date.now());

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

  useEffect(() => {
    const intervalId = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(intervalId);
  }, []);

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

  const handleHandoff = async () => {
    if (!firebaseUser || !supportId) return;
    setSubmitting(true);
    setError(null);
    try {
      const token = await firebaseUser.getIdToken();
      await offerService.markHandoff(token, supportId);
      const response = await offerService.getById(token, supportId);
      setSupport(response.data);
    } catch (err) {
      setError(err.message || 'Unable to record this handoff');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDispute = async (event) => {
    event.preventDefault();
    if (!firebaseUser || !disputeReason.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const token = await firebaseUser.getIdToken();
      await offerService.dispute(token, supportId, disputeReason.trim());
      const response = await offerService.getById(token, supportId);
      setSupport(response.data);
      setDisputeOpen(false);
      setDisputeReason('');
    } catch (err) {
      setError(err.message || 'Unable to submit this dispute');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVouch = async () => {
    if (!firebaseUser || !support?.institutionId) return;
    setSubmitting(true);
    setError(null);
    try {
      const token = await firebaseUser.getIdToken();
      await offerService.vouch(token, support.institutionId);
      const response = await offerService.getById(token, supportId);
      setSupport(response.data);
    } catch (err) {
      setError(err.message || 'Unable to vouch for this institution');
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
  const handoffDeadline = support.handoffAt
    ? new Date(support.handoffAt).getTime() + (support.confirmationWindowHours || 72) * 60 * 60 * 1000
    : null;
  const deadlineRemaining = handoffDeadline ? Math.max(0, handoffDeadline - now) : null;
  const countdown = deadlineRemaining === null
    ? null
    : `${Math.floor(deadlineRemaining / 3600000)}h ${Math.floor((deadlineRemaining % 3600000) / 60000)}m`;
  const reminderDue = support.handoffAt &&
    now - new Date(support.handoffAt).getTime() >= (support.reminderAfterHours || 24) * 60 * 60 * 1000 &&
    !donorConfirmed;

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
            <OfficialChannelNotice />
            {/* Summary Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#304355]/10 p-6">
              <h2 className="text-xl font-bold text-[#304355] mb-1">{support.requirementTitle}</h2>
              <div className="flex items-center gap-1.5 text-sm text-[#64707A] mb-5">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>{support.location || 'Maharashtra'}</span>
              </div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <ReportButton requirementId={support.requirementId} />
              </div>
              {handoffDeadline && (
                <div className={`mb-4 rounded-xl border p-4 text-sm ${deadlineRemaining > 0 ? 'border-sky-200 bg-sky-50 text-sky-900' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                  {deadlineRemaining > 0
                    ? `Confirmation window closes in ${countdown}.`
                    : 'The confirmation window has closed.'}
                </div>
              )}
              {reminderDue && (
                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
                  Please confirm the handoff or report an issue.
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
                <div className="bg-[#FAF8F6] rounded-xl p-4 text-center">
                  <p className="text-xs text-[#64707A] uppercase tracking-wider font-semibold mb-1">Item Offered</p>
                  <p className="text-lg font-extrabold text-[#304355]">{support.item}</p>
                </div>
                <div className="bg-[#FAF8F6] rounded-xl p-4 text-center">
                  <p className="text-xs text-[#64707A] uppercase tracking-wider font-semibold mb-1">Quantity</p>
                  <p className="text-lg font-extrabold text-[#304355]">{support.quantityOffered} {support.unit}</p>
                </div>
                <div className="bg-[#FAF8F6] rounded-xl p-4 text-center col-span-2 md:col-span-1">
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
                <div className="bg-[#FAF8F6] rounded-xl px-4 py-3 text-sm text-[#1F2933] italic">
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

              {support.status === 'handed_off' && !donorConfirmed ? (
                <Button
                  variant="emerald"
                  icon={submitting ? Loader2 : CheckCircle2}
                  disabled={submitting}
                  onClick={handleConfirmDelivery}
                  className="w-full sm:w-auto"
                >
                  {submitting ? 'Confirming…' : 'Confirm I Have Delivered the Items'}
                </Button>
              ) : donorConfirmed ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-sm text-emerald-800 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Your delivery confirmation has been recorded.
                </div>
              ) : null}
              {['pending', 'accepted', 'in_progress'].includes(support.status) && (
                <div className="mt-4">
                  <p className="mb-2 text-xs text-[#64707A]">Only mark this after the offline handoff has actually taken place.</p>
                  <Button variant="outline" disabled={submitting} onClick={handleHandoff}>
                    {submitting ? 'Saving…' : 'Mark handoff completed'}
                  </Button>
                </div>
              )}
              {support.status === 'handed_off' && deadlineRemaining > 0 && (
                <button type="button" onClick={() => setDisputeOpen(true)} className="mt-4 text-sm font-semibold text-red-700 underline">
                  Didn’t receive it
                </button>
              )}
              {support.status === 'completed' && support.institutionId && !support.donorVouched && (
                <Button variant="outline" disabled={submitting} onClick={handleVouch} className="mt-4">
                  Vouch for this institution
                </Button>
              )}
              {support.status === 'completed' && support.donorVouched && (
                <p className="mt-4 text-sm font-semibold text-emerald-700">You vouched for this institution.</p>
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
                  <TrustBadge tiers={support.institutionTrustTiers} />
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
      <Modal
        isOpen={disputeOpen}
        onClose={() => setDisputeOpen(false)}
        title="Report a handoff issue"
        subtitle="Tell us what happened. The offer remains in the support history."
      >
        <form onSubmit={handleDispute} className="space-y-4">
          <label className="block text-sm font-semibold text-[#304355]">
            What happened?
            <textarea
              value={disputeReason}
              onChange={(event) => setDisputeReason(event.target.value.slice(0, 300))}
              maxLength={300}
              required
              rows={4}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
            />
          </label>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDisputeOpen(false)}>Cancel</Button>
            <Button type="submit" variant="danger" disabled={submitting || !disputeReason.trim()}>
              {submitting ? 'Submitting…' : 'Submit dispute'}
            </Button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
}
