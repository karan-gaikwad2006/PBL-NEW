import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/common/Button';
import AuthContext from '../../context/AuthContext';
import { requirementService, institutionService, adminFraudService } from '../../services/api';
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  EyeOff,
  Flag,
  MapPin,
  Calendar,
  User,
  Building2,
  ChevronRight,
  FileText,
  Clock,
  ShieldCheck,
  AlertCircle,
  MessageSquare,
  Eye,
  XCircle,
  Loader2,
  ExternalLink,
  Download,
  Check,
  X,
} from 'lucide-react';

const URGENCY_CONFIG = {
  critical: { label: 'Critical', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  high: { label: 'High', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  medium: { label: 'Medium', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  low: { label: 'Low', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
};

const STATUS_LABELS = {
  under_review: 'Under Review',
  active: 'Active',
  partially_supported: 'Partially Supported',
  fulfilled: 'Fulfilled',
  expired: 'Expired',
  rejected: 'Rejected',
  hidden: 'Hidden',
  verified: 'Verified',
  unverified: 'Unverified',
};

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function AdminReview() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { firebaseUser } = useContext(AuthContext);

  const isInstitutionReview = location.pathname.includes('/institution-review/');

  const [item, setItem] = useState(null);
  const [fraudSignals, setFraudSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [actionTaken, setActionTaken] = useState(null); // 'approved' | 'rejected'
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    if (!firebaseUser || !id) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const token = await firebaseUser.getIdToken();
        const entityType = isInstitutionReview ? 'institution' : 'requirement';
        const [entityRes, signalsRes] = await Promise.allSettled([
          isInstitutionReview
            ? institutionService.adminGetById(token, id)
            : requirementService.adminGetById(token, id),
          adminFraudService.getEntityFraudSignals(token, entityType, id),
        ]);

        if (!cancelled && entityRes.status === 'fulfilled') {
          setItem(entityRes.value.data);
        } else if (!cancelled && entityRes.status === 'rejected') {
          setError(entityRes.reason.message || (isInstitutionReview ? 'Failed to load institution' : 'Failed to load requirement'));
        }

        if (!cancelled && signalsRes.status === 'fulfilled') {
          setFraudSignals(signalsRes.value.data || []);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || (isInstitutionReview ? 'Failed to load institution' : 'Failed to load requirement'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [firebaseUser, id, isInstitutionReview]);

  const handleResolveSignal = async (signalId, status) => {
    if (!firebaseUser) return;
    try {
      const token = await firebaseUser.getIdToken();
      await adminFraudService.resolveFraudSignal(token, signalId, status);
      setFraudSignals((prev) =>
        prev.map((s) => (s.id === signalId ? { ...s, status } : s))
      );
    } catch (err) {
      console.error('[AdminReview] Failed to update signal:', err.message);
    }
  };

  const handleAction = async (action) => {
    if (submitting) return;
    setSubmitting(true);
    setActionError(null);
    try {
      const token = await firebaseUser.getIdToken();
      if (isInstitutionReview) {
        const verificationStatus = action === 'approved' ? 'verified' : 'rejected';
        await institutionService.adminVerify(token, id, verificationStatus, reviewNote);
      } else {
        if (action === 'approved') {
          await requirementService.adminApprove(token, id);
        } else if (action === 'rejected') {
          await requirementService.adminReject(token, id);
        }
      }
      setActionTaken(action);
    } catch (err) {
      setActionError(err.message || 'Action failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-32 gap-3 text-[#64707A]">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-sm font-medium">
            {isInstitutionReview ? 'Loading institution for verification…' : 'Loading requirement for review…'}
          </span>
        </div>
      </PageContainer>
    );
  }

  if (error || !item) {
    return (
      <PageContainer>
        <div className="max-w-lg mx-auto px-6 py-20 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="font-semibold text-red-700 mb-4">{error || (isInstitutionReview ? 'Institution not found' : 'Requirement not found')}</p>
          <Button variant="outline" onClick={() => navigate('/admin/dashboard')} icon={ArrowLeft}>
            Back to Admin Dashboard
          </Button>
        </div>
      </PageContainer>
    );
  }

  if (actionTaken) {
    const messages = isInstitutionReview ? {
      approved: {
        title: 'Institution Verified',
        body: 'The institution has been marked as verified. A notification has been sent to their account.',
        color: 'text-emerald-600',
        icon: CheckCircle2,
      },
      rejected: {
        title: 'Verification Rejected',
        body: 'The institution verification request was rejected. The institution has been notified.',
        color: 'text-red-600',
        icon: XCircle,
      },
    } : {
      approved: {
        title: 'Requirement Approved',
        body: 'The requirement is now Active and visible to donors on Explore Needs.',
        color: 'text-emerald-600',
        icon: CheckCircle2,
      },
      rejected: {
        title: 'Requirement Rejected',
        body: 'The requirement has been rejected. The requester can resubmit with corrections.',
        color: 'text-red-600',
        icon: XCircle,
      },
    };
    const msg = messages[actionTaken];
    const Icon = msg.icon;
    return (
      <PageContainer>
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <Icon className={`w-16 h-16 ${msg.color} mx-auto mb-4`} />
          <h1 className={`text-2xl font-extrabold ${msg.color} mb-2`}>{msg.title}</h1>
          <p className="text-sm text-[#64707A] mb-6">{msg.body}</p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => navigate('/admin/dashboard')} icon={ArrowLeft}>
              Back to Admin Dashboard
            </Button>
            <Button variant="secondary" onClick={() => { setActionTaken(null); setReviewNote(''); }}>
              Review Another Item
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  const currentStatus = isInstitutionReview ? item.verificationStatus : item.status;
  const alreadyActioned = isInstitutionReview
    ? ['verified', 'rejected'].includes(currentStatus)
    : !['under_review'].includes(currentStatus);

  return (
    <PageContainer>
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#64707A] mb-6">
          <Link to="/admin/dashboard" className="hover:text-[#304355]">Admin Dashboard</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#1F2933] font-medium">
            {isInstitutionReview ? 'Institution Verification Review' : 'Requirement Review'}
          </span>
        </nav>

        {/* Admin Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#304355] text-white text-xs font-bold px-3 py-1.5 rounded-full mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              {isInstitutionReview ? 'Institution Verification Mode' : 'Admin Review Mode'}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#304355] tracking-tight">
              {item.name || item.title}
            </h1>
          </div>
          <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/admin/dashboard')}>
            Back to Dashboard
          </Button>
        </div>

        {/* Already actioned warning */}
        {alreadyActioned && (
          <div className="bg-amber-50 border-l-4 border-amber-400 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-amber-800 mb-1">
                This {isInstitutionReview ? 'institution' : 'requirement'} is already <span className="capitalize">{STATUS_LABELS[currentStatus] || currentStatus}</span>
              </p>
              <p className="text-xs text-amber-700">No further action is required. You may still review the details below.</p>
            </div>
          </div>
        )}

        {/* Critical Disclaimer */}
        {!alreadyActioned && (
          <div className="bg-amber-50 border-l-4 border-amber-400 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-amber-800 mb-1">Human Review Required</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                {isInstitutionReview
                  ? 'Verify submitted government documents and registration certificates before granting verified status. Verification grants higher trust signals to requesters.'
                  : 'Review the requirement details carefully. Approval makes this requirement publicly visible to donors. Rejection prevents it from appearing publicly. This is a human decision — verify the information before acting.'}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
          {/* Main Column */}
          <div className="space-y-6">
            {/* Institution / Requirement Details Card */}
            {isInstitutionReview ? (
              <div className="bg-white rounded-2xl border border-[#304355]/10 shadow-sm p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-[#304355] border border-slate-200 capitalize">
                    Type: {item.type?.replace('_', ' ')}
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                    item.verificationStatus === 'verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    item.verificationStatus === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  } capitalize`}>
                    Status: {STATUS_LABELS[item.verificationStatus] || item.verificationStatus}
                  </span>
                </div>
                <h2 className="font-bold text-[#304355] text-lg mb-1">{item.name}</h2>
                <p className="text-sm text-[#64707A] leading-relaxed mb-4">{item.description || 'No description provided.'}</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-[#64707A] mb-4">
                  <div>
                    <p className="font-semibold uppercase tracking-wider mb-0.5">Registration Number</p>
                    <p className="text-[#1F2933] font-mono">{item.registrationNumber || '—'}</p>
                  </div>
                  <div>
                    <p className="font-semibold uppercase tracking-wider mb-0.5">District</p>
                    <p className="text-[#1F2933]">{item.district || '—'}</p>
                  </div>
                  <div>
                    <p className="font-semibold uppercase tracking-wider mb-0.5">City / Taluka</p>
                    <p className="text-[#1F2933]">{item.city || '—'}</p>
                  </div>
                  <div>
                    <p className="font-semibold uppercase tracking-wider mb-0.5">Contact Person</p>
                    <p className="text-[#1F2933]">{item.contactName || item.userContactName || '—'}</p>
                  </div>
                  <div>
                    <p className="font-semibold uppercase tracking-wider mb-0.5">Contact Phone</p>
                    <p className="text-[#1F2933]">{item.contactPhone || item.userContactPhone || '—'}</p>
                  </div>
                  <div>
                    <p className="font-semibold uppercase tracking-wider mb-0.5">Contact Email</p>
                    <p className="text-[#1F2933]">{item.contactEmail || item.userEmail || '—'}</p>
                  </div>
                </div>

                {item.address && (
                  <div className="text-xs text-[#64707A]">
                    <p className="font-semibold uppercase tracking-wider mb-0.5">Address</p>
                    <p className="text-[#1F2933]">{item.address}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#304355]/10 shadow-sm p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.urgency && (
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${URGENCY_CONFIG[item.urgency]?.bg} ${URGENCY_CONFIG[item.urgency]?.text} ${URGENCY_CONFIG[item.urgency]?.border}`}>
                      {URGENCY_CONFIG[item.urgency]?.label} Urgency
                    </span>
                  )}
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E8E8E2] text-[#304355] border border-slate-200 capitalize">
                    Status: {STATUS_LABELS[item.status] || item.status}
                  </span>
                </div>
                <h2 className="font-bold text-[#304355] text-lg mb-1">{item.title}</h2>
                <p className="text-sm text-[#64707A] leading-relaxed mb-4">{item.description}</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-[#64707A] mb-4">
                  <div>
                    <p className="font-semibold uppercase tracking-wider mb-0.5">District</p>
                    <p className="text-[#1F2933]">{item.district}</p>
                  </div>
                  <div>
                    <p className="font-semibold uppercase tracking-wider mb-0.5">City / Taluka</p>
                    <p className="text-[#1F2933]">{item.city || '—'}</p>
                  </div>
                  <div>
                    <p className="font-semibold uppercase tracking-wider mb-0.5">Beneficiaries</p>
                    <p className="text-[#1F2933]">{item.beneficiaryCount}</p>
                  </div>
                  <div>
                    <p className="font-semibold uppercase tracking-wider mb-0.5">Submitted</p>
                    <p className="text-[#1F2933]">{new Date(item.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="font-semibold uppercase tracking-wider mb-0.5">Expires</p>
                    <p className="text-[#1F2933]">{new Date(item.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <p className="text-xs font-semibold text-[#64707A] uppercase tracking-wider mb-2">Requested Items</p>
                  <div className="flex flex-wrap gap-2">
                    {item.items?.map((itm) => (
                      <span key={itm.id || itm.name} className="text-xs bg-[#E8E8E2] text-[#304355] px-2.5 py-1 rounded-full font-medium">
                        {itm.name} — {itm.quantityRequired} {itm.unit}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Requester Info for Requirement */}
            {!isInstitutionReview && (
              <div className="bg-white rounded-2xl border border-[#304355]/10 shadow-sm p-6">
                <h3 className="font-bold text-[#304355] mb-4 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Requester Information
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs text-[#64707A]">
                  <div>
                    <p className="font-semibold uppercase tracking-wider mb-0.5">Name</p>
                    <p className="text-[#1F2933]">{item.requesterName || '—'}</p>
                  </div>
                  <div>
                    <p className="font-semibold uppercase tracking-wider mb-0.5">Email</p>
                    <p className="text-[#1F2933]">{item.requesterEmail || '—'}</p>
                  </div>
                  {item.contactName && (
                    <div>
                      <p className="font-semibold uppercase tracking-wider mb-0.5">Contact Name</p>
                      <p className="text-[#1F2933]">{item.contactName}</p>
                    </div>
                  )}
                  {item.contactPhone && (
                    <div>
                      <p className="font-semibold uppercase tracking-wider mb-0.5">Contact Phone</p>
                      <p className="text-[#1F2933]">{item.contactPhone}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Documents Section */}
            <div className="bg-white rounded-2xl border border-[#304355]/10 shadow-sm p-6">
              <h3 className="font-bold text-[#304355] mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Submitted Verification Documents ({item.documents?.length || 0})
              </h3>
              {item.documents && item.documents.length > 0 ? (
                <div className="space-y-3">
                  {item.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-[#304355] shrink-0" />
                        <div>
                          <p className="font-semibold text-sm text-[#1F2933] capitalize">
                            {doc.documentType?.replace('_', ' ')}
                          </p>
                          <p className="text-xs text-[#64707A]">
                            {doc.originalFileName || 'Document'} · {formatBytes(doc.fileSize)} · {new Date(doc.uploadedAt || doc.createdAt).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                      </div>
                      {doc.fileUrl && (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#304355] text-white hover:bg-[#304355]/90 transition-colors shrink-0"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          View File
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-[#64707A] italic py-2">
                  No documents have been uploaded yet.
                </div>
              )}
            </div>

            {/* Fraud / Review Signals on this entity */}
            {fraudSignals.length > 0 && (
              <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-6">
                <h3 className="font-bold text-[#304355] mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Review Signals on This {isInstitutionReview ? 'Institution' : 'Requirement'} ({fraudSignals.length})
                </h3>
                <div className="space-y-3">
                  {fraudSignals.map((sig) => (
                    <div
                      key={sig.id}
                      className="p-3.5 rounded-xl border border-amber-100 bg-amber-50/60 flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-xs text-[#1F2933] capitalize">
                            {sig.signalType?.replace(/_/g, ' ')}
                          </span>
                          <span
                            className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              sig.severity === 'high' || sig.severity === 'critical'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {sig.severity}
                          </span>
                          <span className="text-[10px] text-[#64707A] capitalize">Status: {sig.status}</span>
                        </div>
                        <p className="text-xs text-[#64707A]">{sig.description}</p>
                      </div>

                      {sig.status === 'pending' && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleResolveSignal(sig.id, 'resolved')}
                            title="Mark Resolved"
                            className="p-1 rounded bg-emerald-100 text-emerald-800 hover:bg-emerald-200 text-xs font-semibold px-2 py-1 flex items-center gap-1 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" /> Resolve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleResolveSignal(sig.id, 'dismissed')}
                            title="Dismiss Signal"
                            className="p-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300 text-xs font-semibold px-2 py-1 flex items-center gap-1 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" /> Dismiss
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Review Actions */}
            <div className="bg-white rounded-2xl border border-[#304355]/10 shadow-sm p-6">
              <h3 className="font-bold text-[#304355] mb-3">Moderator Notes</h3>
              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Add review notes (recorded in the audit history)..."
                rows={4}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm text-[#1F2933] bg-[#FBF9FA] resize-none focus:outline-none focus:border-[#304355] focus:ring-1 focus:ring-[#304355] transition-colors mb-4"
              />

              {actionError && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4 text-sm text-red-700">
                  {actionError}
                </div>
              )}

              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-bold text-[#64707A] uppercase tracking-wider mb-3">Admin Actions</p>
                {alreadyActioned ? (
                  <p className="text-sm text-[#64707A] italic">No actions available — {isInstitutionReview ? 'institution' : 'requirement'} is already {STATUS_LABELS[currentStatus] || currentStatus}.</p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="emerald"
                      icon={CheckCircle2}
                      onClick={() => handleAction('approved')}
                      disabled={submitting}
                    >
                      {submitting ? 'Processing…' : (isInstitutionReview ? 'Approve Verification' : 'Approve (→ Active)')}
                    </Button>
                    <Button
                      variant="danger"
                      icon={XCircle}
                      onClick={() => handleAction('rejected')}
                      disabled={submitting}
                    >
                      {submitting ? 'Processing…' : (isInstitutionReview ? 'Reject Verification' : 'Reject')}
                    </Button>
                  </div>
                )}
                <p className="text-xs text-[#64707A] mt-3">
                  {isInstitutionReview
                    ? '⚠ Approving verification certifies the institution and marks their profile verified. Rejecting marks their verification status rejected.'
                    : '⚠ Approval transitions the requirement from Under Review to Active and makes it publicly visible. Rejection prevents public visibility.'}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Review Checklist */}
            <div className="bg-white rounded-2xl border border-[#304355]/10 shadow-sm p-5">
              <h3 className="font-bold text-[#304355] mb-3 text-sm">
                {isInstitutionReview ? 'Institution Verification Checklist' : 'Review Checklist'}
              </h3>
              <div className="space-y-2 text-xs">
                {(isInstitutionReview ? [
                  'Valid registration number provided?',
                  'Supporting government documents readable & authentic?',
                  'Address and contact details verified?',
                  'Organization name matches registration document?',
                  'No suspicious duplicate accounts detected?',
                ] : [
                  'Is the institution/requester registered?',
                  'Are the submitted details complete and plausible?',
                  'Is the beneficiary count reasonable?',
                  'Are quantities proportionate to beneficiary count?',
                  'No duplicate active requirement from same organization?',
                ]).map((checkItem, i) => (
                  <label key={i} className="flex items-start gap-2 cursor-pointer hover:bg-slate-50 -mx-1 px-1 py-1 rounded-lg transition-colors">
                    <input type="checkbox" className="mt-0.5 accent-[#304355]" />
                    <span className="text-[#64707A]">{checkItem}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Quick Nav */}
            <div className="bg-white rounded-2xl border border-[#304355]/10 shadow-sm p-4">
              <h3 className="font-bold text-sm text-[#304355] mb-3">Navigation</h3>
              <div className="space-y-1">
                <Link to="/admin/dashboard" className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium text-[#1F2933] hover:bg-[#E8E8E2] transition-colors">
                  Admin Dashboard <ChevronRight className="w-4 h-4 text-[#64707A]" />
                </Link>
                <Link to="/requirements" className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium text-[#1F2933] hover:bg-[#E8E8E2] transition-colors">
                  Requirements Catalog <ChevronRight className="w-4 h-4 text-[#64707A]" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

