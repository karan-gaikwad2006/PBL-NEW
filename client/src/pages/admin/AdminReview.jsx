import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/common/Button';
import AuthContext from '../../context/AuthContext';
import { requirementService, institutionService, adminFraudService, userService } from '../../services/api';
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  User,
  Building2,
  ChevronRight,
  FileText,
  ShieldCheck,
  AlertCircle,
  XCircle,
  Loader2,
  ExternalLink,
  Check,
  X,
  MapPin,
  CalendarDays,
  UsersRound,
  PackageCheck,
  Eye,
  LockKeyhole,
  Clock3,
  ClipboardCheck,
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
  const [identityDocuments, setIdentityDocuments] = useState([]);
  const [identityReviewError, setIdentityReviewError] = useState('');
  const [updatingDocumentId, setUpdatingDocumentId] = useState(null);
  const [signalError, setSignalError] = useState('');

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
          const userId = isInstitutionReview
            ? entityRes.value.data.created_by_user_id
            : entityRes.value.data.requesterUserId;
          if (userId) {
            try {
              const documentResponse = await userService.adminGetDocuments(token, userId);
              if (!cancelled) setIdentityDocuments(documentResponse.data || []);
            } catch (documentError) {
              if (!cancelled) setIdentityReviewError(documentError.message || 'Unable to load identity documents.');
            }
          }
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
    setSignalError('');
    try {
      const token = await firebaseUser.getIdToken();
      await adminFraudService.resolveFraudSignal(token, signalId, status);
      setFraudSignals((prev) =>
        prev.map((s) => (s.id === signalId ? { ...s, status } : s))
      );
    } catch (err) {
      console.error('[AdminReview] Failed to update signal:', err.message);
      setSignalError(err.message || 'Unable to update the review signal. Please try again.');
    }
  };

  const handleIdentityReview = async (documentId, status) => {
    if (!firebaseUser || !item) return;
    const userId = isInstitutionReview ? item.created_by_user_id : item.requesterUserId;
    if (!userId) return;
    setIdentityReviewError('');
    setUpdatingDocumentId(documentId);
    try {
      const token = await firebaseUser.getIdToken();
      const response = await userService.adminReviewDocument(token, userId, documentId, status);
      setIdentityDocuments((previous) => previous.map((document) =>
        document.id === documentId ? { ...document, reviewStatus: response.data.review_status || status } : document
      ));
    } catch (reviewError) {
      setIdentityReviewError(reviewError.message || 'Unable to save document review.');
    } finally {
      setUpdatingDocumentId(null);
    }
  };

  const openIdentityDocument = async (documentId) => {
    const documentWindow = window.open('about:blank', '_blank');
    if (!documentWindow) {
      setIdentityReviewError('Allow pop-ups to open this private document.');
      return;
    }
    documentWindow.opener = null;
    try {
      const token = await firebaseUser.getIdToken();
      const response = await userService.getDocumentAccess(token, documentId);
      documentWindow.location.replace(response.data.accessUrl);
    } catch (accessError) {
      documentWindow.close();
      setIdentityReviewError(accessError.message || 'Unable to open identity document.');
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
  const reviewedDocuments = identityDocuments.filter((document) => document.reviewStatus === 'verified').length;
  const requestedItems = Array.isArray(item.items) ? item.items : [];
  const approvalBlocked = !isInstitutionReview && !alreadyActioned && reviewedDocuments === 0;

  return (
    <PageContainer>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-[#64707A] mb-5">
          <Link to="/admin/dashboard" className="hover:text-[#192D3E] transition-colors">Admin Dashboard</Link>
          <ChevronRight aria-hidden="true" className="w-4 h-4" />
          <span className="text-[#1F2933] font-medium">
            {isInstitutionReview ? 'Institution Verification Review' : 'Requirement Review'}
          </span>
        </nav>

        {/* Admin Header */}
        <div className="relative overflow-hidden rounded-3xl bg-[#192D3E] text-white shadow-[0_12px_32px_rgba(25,45,62,0.12)] mb-6 sm:mb-8">
          <div aria-hidden="true" className="absolute -right-16 -top-24 h-64 w-64 rounded-full border-[36px] border-white/[0.04]" />
          <div aria-hidden="true" className="absolute -right-2 -bottom-32 h-64 w-64 rounded-full bg-emerald-400/[0.08] blur-2xl" />
          <div className="relative flex flex-col gap-6 p-5 sm:p-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-emerald-100 mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                {isInstitutionReview ? 'Institution verification' : 'Requirement review'}
                <span className="h-1 w-1 rounded-full bg-emerald-300" />
                Admin workspace
              </div>
              <h1 className="max-w-3xl text-2xl sm:text-3xl lg:text-[34px] leading-tight font-extrabold tracking-tight text-white">
                {item.name || item.title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70">
                {isInstitutionReview
                  ? 'Review the organization profile and its verification documents before deciding.'
                  : 'Review the request details and identity documents before making this need visible to donors.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#identity-documents"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#192D3E]"
              >
                <LockKeyhole aria-hidden="true" className="h-4 w-4 text-emerald-300" />
                Review documents
              </a>
              <span className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold ${
                alreadyActioned
                  ? 'border-white/15 bg-white/10 text-white'
                  : 'border-amber-300/30 bg-amber-300/10 text-amber-100'
              }`}>
                <Clock3 aria-hidden="true" className="w-4 h-4" />
                {STATUS_LABELS[currentStatus] || currentStatus}
              </span>
              <Button
                variant="outline"
                icon={ArrowLeft}
                onClick={() => navigate('/admin/dashboard')}
                className="!border-white/30 !text-white !bg-transparent !shadow-none hover:!bg-white/10 focus:!ring-white"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
          {!isInstitutionReview && (
            <div className="relative grid grid-cols-2 border-t border-white/10 sm:grid-cols-4">
              <div className="px-5 py-4 sm:px-7">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">Location</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-white">
                  <MapPin aria-hidden="true" className="h-3.5 w-3.5 text-emerald-300 shrink-0" />
                  <span className="truncate">{[item.city, item.district].filter(Boolean).join(', ') || 'Not provided'}</span>
                </p>
              </div>
              <div className="border-l border-white/10 px-5 py-4 sm:px-7">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">Beneficiaries</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-white">
                  <UsersRound aria-hidden="true" className="h-3.5 w-3.5 text-emerald-300 shrink-0" />
                  {item.beneficiaryCount ?? '—'}
                </p>
              </div>
              <div className="border-t border-white/10 px-5 py-4 sm:border-t-0 sm:border-l sm:px-7">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">Submitted</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-white">
                  <CalendarDays aria-hidden="true" className="h-3.5 w-3.5 text-emerald-300 shrink-0" />
                  {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                </p>
              </div>
              <div className="border-l border-t border-white/10 px-5 py-4 sm:border-t-0 sm:px-7">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">Identity documents</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-white">
                  <LockKeyhole aria-hidden="true" className="h-3.5 w-3.5 text-emerald-300 shrink-0" />
                  {reviewedDocuments}/{identityDocuments.length} verified
                </p>
              </div>
            </div>
          )}
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
          <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl p-4 sm:p-5 mb-6 flex items-start gap-3">
            <ClipboardCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-emerald-950 mb-1">Human review before approval</p>
              <p className="text-xs text-emerald-900/80 leading-relaxed">
                {isInstitutionReview
                  ? 'Review submitted identity and registration documents. Approval marks the institution as verified.'
                  : 'Check the submitted details and requester identity document. Approval makes this requirement publicly visible to donors; reject it if it needs correction.'}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-5 lg:gap-7 items-start">
          {/* Main Column */}
          <div className="space-y-5 min-w-0">
            {/* Institution / Requirement Details Card */}
            {isInstitutionReview ? (
              <div className="bg-white rounded-2xl border border-[#E8E6E8] shadow-[0_2px_10px_rgba(25,45,62,0.04)] p-5 sm:p-6">
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
                <h2 className="font-bold text-[#192D3E] text-lg mb-1">{item.name}</h2>
                <p className="text-sm text-[#64707A] leading-relaxed mb-4">{item.description || 'No description provided.'}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 text-xs text-[#64707A] mb-4">
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
              <div className="bg-white rounded-2xl border border-[#E8E6E8] shadow-[0_2px_10px_rgba(25,45,62,0.04)] p-5 sm:p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.urgency && (
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${URGENCY_CONFIG[item.urgency]?.bg} ${URGENCY_CONFIG[item.urgency]?.text} ${URGENCY_CONFIG[item.urgency]?.border}`}>
                      {URGENCY_CONFIG[item.urgency]?.label} Urgency
                    </span>
                  )}
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FAF8F6] text-[#304355] border border-slate-200 capitalize">
                    Status: {STATUS_LABELS[item.status] || item.status}
                  </span>
                </div>
                <h2 className="font-bold text-[#192D3E] text-xl tracking-tight mb-2">{item.title}</h2>
                <p className="text-sm text-[#64707A] leading-relaxed mb-5">{item.description || 'No description provided.'}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-xs mb-5">
                  {[
                    { label: 'District', value: item.district || '—', icon: MapPin },
                    { label: 'Taluka / City', value: item.city || '—', icon: Building2 },
                    { label: 'Beneficiaries', value: item.beneficiaryCount ?? '—', icon: UsersRound },
                    { label: 'Expires', value: item.expiresAt ? new Date(item.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—', icon: CalendarDays },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="rounded-xl border border-[#F0EDEF] bg-[#FAF8F9] p-3">
                      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#64707A] mb-1.5">
                        <Icon aria-hidden="true" className="w-3.5 h-3.5 text-[#10B981]" />
                        {label}
                      </p>
                      <p className="font-semibold text-[#1F2933]">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Items */}
                <div>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <h3 className="text-xs font-bold text-[#192D3E] uppercase tracking-wider">Requested food items</h3>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#64707A]">
                      <PackageCheck aria-hidden="true" className="w-3.5 h-3.5 text-emerald-700" />
                      {requestedItems.length} requested
                    </span>
                  </div>
                  {requestedItems.length ? (
                    <div className="overflow-hidden rounded-xl border border-[#E8E6E8]">
                      <div className="hidden sm:grid grid-cols-[minmax(0,1fr)_auto] gap-4 bg-[#FAF8F9] px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#64707A]">
                        <span>Food item</span><span>Quantity</span>
                      </div>
                      <div className="divide-y divide-[#F0EDEF]">
                        {requestedItems.map((itm) => (
                          <div key={itm.id || itm.name} className="flex items-center justify-between gap-3 px-4 py-3">
                            <span className="text-sm font-semibold text-[#1F2933]">{itm.name}</span>
                            <span className="shrink-0 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">
                              {itm.quantityRequired} {itm.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="rounded-xl border border-dashed border-[#D7DADD] bg-[#FAF8F9] p-4 text-sm text-[#64707A]">No item quantities were included with this requirement.</p>
                  )}
                </div>
              </div>
            )}

            {/* Requester Info for Requirement */}
            {!isInstitutionReview && (
              <div className="bg-white rounded-2xl border border-[#E8E6E8] shadow-[0_2px_10px_rgba(25,45,62,0.04)] p-5 sm:p-6">
                <h3 className="font-bold text-[#192D3E] mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#10B981]" />
                  Requester information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 text-xs text-[#64707A]">
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
            <div id="identity-documents" className="scroll-mt-6 bg-white rounded-2xl border border-[#E8E6E8] shadow-[0_2px_10px_rgba(25,45,62,0.04)] p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-bold text-[#192D3E] flex items-center gap-2">
                    <LockKeyhole aria-hidden="true" className="w-4 h-4 text-[#10B981]" />
                    Private identity documents
                  </h3>
                  <p className="text-xs text-[#64707A] mt-1">Private files open through a time-limited link. Review the document before marking it.</p>
                </div>
                <span className="rounded-full bg-[#F4F2F3] px-2.5 py-1 text-xs font-bold text-[#304355]">
                  {identityDocuments.length} {identityDocuments.length === 1 ? 'document' : 'documents'}
                </span>
              </div>
              {identityReviewError && <p role="alert" className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{identityReviewError}</p>}
              {identityDocuments.length ? (
                <div className="space-y-3">
                  {identityDocuments.map((document) => {
                    const verified = document.reviewStatus === 'verified';
                    const rejected = document.reviewStatus === 'rejected';
                    return (
                      <div key={document.id} className="rounded-2xl border border-[#E8E6E8] bg-[#FAF8F9] p-4 sm:p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#192D3E] text-emerald-300">
                              <FileText aria-hidden="true" className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-bold text-sm text-[#192D3E]">{document.documentType?.toUpperCase() || 'IDENTITY DOCUMENT'}</p>
                                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold capitalize ${
                                  verified ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                    : rejected ? 'border-red-200 bg-red-50 text-red-700'
                                      : 'border-amber-200 bg-amber-50 text-amber-800'
                                }`}>
                                  {verified ? <Check aria-hidden="true" className="h-3 w-3" /> : null}
                                  {document.reviewStatus || 'pending review'}
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-[#64707A] break-all">{document.fileName || 'Uploaded identity file'}</p>
                              <p className="mt-1 text-[11px] text-[#64707A]">
                                Uploaded {document.createdAt ? new Date(document.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'date unavailable'}
                                {document.fileSize ? ` · ${formatBytes(document.fileSize)}` : ''}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => openIdentityDocument(document.id)}
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#192D3E] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#263F53] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                          >
                            <Eye aria-hidden="true" className="h-4 w-4 text-emerald-300" />
                            Open private file
                          </button>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2 border-t border-[#E8E6E8] pt-4">
                          {verified ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                              <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
                              Identity document verified
                            </span>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleIdentityReview(document.id, 'verified')}
                                disabled={updatingDocumentId === document.id}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {updatingDocumentId === document.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                                Mark verified
                              </button>
                              {!rejected && (
                                <button
                                  type="button"
                                  onClick={() => handleIdentityReview(document.id, 'rejected')}
                                  disabled={updatingDocumentId === document.id}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <X className="h-3.5 w-3.5" />
                                  Reject document
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : identityReviewError ? (
                <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-5 text-center">
                  <AlertCircle aria-hidden="true" className="mx-auto h-6 w-6 text-red-700" />
                  <p className="mt-2 text-sm font-bold text-red-900">Identity documents could not be loaded</p>
                  <p className="mt-1 text-xs text-red-800">{identityReviewError}</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50/70 px-4 py-5 text-center">
                  <AlertCircle aria-hidden="true" className="mx-auto h-6 w-6 text-amber-700" />
                  <p className="mt-2 text-sm font-bold text-amber-950">No private identity document uploaded</p>
                  <p className="mt-1 text-xs text-amber-900/80">Check the submission details and follow the review policy before deciding.</p>
                </div>
              )}
            </div>

            {/* Existing institution registration documents */}
            <div className="bg-white rounded-2xl border border-[#E8E6E8] shadow-[0_2px_10px_rgba(25,45,62,0.04)] p-5 sm:p-6">
              <h3 className="font-bold text-[#192D3E] mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#10B981]" />
                Submitted verification documents ({item.documents?.length || 0})
              </h3>
              {item.documents && item.documents.length > 0 ? (
                <div className="space-y-3">
                  {item.documents.map((doc) => (
                    <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-[#FAF8F9] border border-[#E8E6E8] rounded-xl">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="w-6 h-6 text-[#304355] shrink-0" />
                        <div>
                          <p className="font-semibold text-sm text-[#1F2933] capitalize">
                            {doc.documentType?.replace('_', ' ')}
                          </p>
                          <p className="text-xs text-[#64707A] break-words">
                            {doc.originalFileName || 'Document'} · {formatBytes(doc.fileSize)} · {new Date(doc.uploadedAt || doc.createdAt).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                      </div>
                      {doc.fileUrl && (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-[#192D3E] text-white hover:bg-[#263F53] transition-colors shrink-0"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          View File
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-[#64707A] rounded-xl border border-dashed border-[#D7DADD] bg-[#FAF8F9] p-4">
                  No registration documents have been uploaded.
                </div>
              )}
            </div>

            {/* Fraud / Review Signals on this entity */}
            {(fraudSignals.length > 0 || signalError) && (
              <div className="bg-white rounded-2xl border border-amber-200 shadow-[0_2px_10px_rgba(25,45,62,0.04)] p-5 sm:p-6">
                <h3 className="font-bold text-[#192D3E] mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Review signals ({fraudSignals.length})
                </h3>
                {signalError && <p role="alert" className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{signalError}</p>}
                <div className="space-y-3">
                  {fraudSignals.map((sig) => (
                    <div
                      key={sig.id}
                      className="p-3.5 rounded-xl border border-amber-100 bg-amber-50/60 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"
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

          </div>

          {/* Sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-6">
            <div className="bg-white rounded-2xl border border-[#E8E6E8] shadow-[0_2px_10px_rgba(25,45,62,0.04)] p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#192D3E] text-emerald-300">
                  <ClipboardCheck aria-hidden="true" className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#192D3E]">Review decision</h3>
                  <p className="text-xs text-[#64707A]">Record your assessment</p>
                </div>
              </div>
              {isInstitutionReview ? (
                <>
                  <label htmlFor="admin-review-note" className="block text-xs font-bold text-[#304355] mb-2">Moderator notes</label>
                  <textarea
                    id="admin-review-note"
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    placeholder="Add notes for the audit history..."
                    rows={4}
                    className="w-full border border-[#D7DADD] rounded-xl px-3.5 py-3 text-sm text-[#1F2933] bg-[#FAF8F9] resize-y focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-colors"
                  />
                </>
              ) : (
                <div className={`rounded-xl border p-3 text-xs leading-relaxed ${
                  approvalBlocked ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-emerald-200 bg-emerald-50 text-emerald-900'
                }`}>
                  {approvalBlocked
                    ? 'Verify at least one requester identity document before approving. Review it in the documents section.'
                    : 'Requester identity is verified. You can proceed after reviewing the request details.'}
                </div>
              )}
              <p className="mt-2 text-[11px] leading-relaxed text-[#64707A]">
                {isInstitutionReview
                  ? 'Approval marks the institution verified. Rejection marks its verification request rejected.'
                  : 'Approval publishes the requirement for donors. Rejection keeps it from public listings.'}
              </p>

              {actionError && (
                <div role="alert" className="bg-red-50 border border-red-200 rounded-xl px-3.5 py-3 mt-4 text-sm text-red-700">
                  {actionError}
                </div>
              )}

              <div className="mt-4 space-y-2.5">
                {alreadyActioned ? (
                  <p className="rounded-xl bg-[#F4F2F3] p-3 text-sm text-[#64707A]">
                    Decision complete — this {isInstitutionReview ? 'institution' : 'requirement'} is {STATUS_LABELS[currentStatus] || currentStatus}.
                  </p>
                ) : (
                  <>
                    <Button
                      variant="emerald"
                      icon={CheckCircle2}
                      onClick={() => handleAction('approved')}
                      disabled={submitting || approvalBlocked}
                      className="w-full justify-center"
                    >
                      {submitting ? 'Processing…' : (isInstitutionReview ? 'Approve verification' : 'Approve requirement')}
                    </Button>
                    <Button
                      variant="danger"
                      icon={XCircle}
                      onClick={() => handleAction('rejected')}
                      disabled={submitting}
                      className="w-full justify-center"
                    >
                      {submitting ? 'Processing…' : (isInstitutionReview ? 'Reject verification' : 'Reject requirement')}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Review Checklist */}
            <div className="bg-white rounded-2xl border border-[#E8E6E8] shadow-[0_2px_10px_rgba(25,45,62,0.04)] p-5">
              <h3 className="font-bold text-[#192D3E] mb-3 text-sm">
                {isInstitutionReview ? 'Institution verification checklist' : 'Review checklist'}
              </h3>
              <div className="space-y-2 text-xs">
                {(isInstitutionReview ? [
                  'Valid registration number provided?',
                  'Supporting government documents readable & authentic?',
                  'Address and contact details verified?',
                  'Organization name matches registration document?',
                  'No suspicious duplicate accounts detected?',
                ] : [
                  'Is the requester identity documented?',
                  'Are the submitted details complete and plausible?',
                  'Is the beneficiary count reasonable?',
                  'Are quantities proportionate to beneficiary count?',
                  'No duplicate active requirement from the same person?',
                ]).map((checkItem, i) => (
                  <label key={i} className="flex items-start gap-2 cursor-pointer hover:bg-[#FAF8F9] -mx-1 px-1.5 py-1.5 rounded-lg transition-colors">
                    <input type="checkbox" className="mt-0.5 accent-emerald-700" />
                    <span className="text-[#64707A]">{checkItem}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Quick Nav */}
            <div className="bg-white rounded-2xl border border-[#E8E6E8] shadow-[0_2px_10px_rgba(25,45,62,0.04)] p-4">
              <h3 className="font-bold text-sm text-[#192D3E] mb-3">Quick links</h3>
              <div className="space-y-1">
                <Link to="/admin/dashboard" className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium text-[#1F2933] hover:bg-[#FAF8F9] transition-colors">
                  Admin dashboard <ChevronRight className="w-4 h-4 text-[#64707A]" />
                </Link>
                <a href="#identity-documents" className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium text-[#1F2933] hover:bg-[#FAF8F9] transition-colors">
                  Identity documents <ChevronRight className="w-4 h-4 text-[#64707A]" />
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </PageContainer>
  );
}
