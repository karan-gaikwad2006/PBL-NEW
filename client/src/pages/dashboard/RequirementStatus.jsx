import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/common/Button';
import AuthContext from '../../context/AuthContext';
import { requirementService } from '../../services/api';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  MapPin,
  Calendar,
  XCircle,
  Loader2,
} from 'lucide-react';

// ─── Status Lifecycle Definition ─────────────────────────────────────────────
const LIFECYCLE_STAGES = [
  {
    id: 'under_review',
    label: 'Under Review',
    description: 'Your requirement has been submitted and is being reviewed by PoshanSetu moderators for completeness and accuracy.',
    icon: RefreshCw,
    color: 'text-blue-600',
    bg: 'bg-blue-500',
    bgLight: 'bg-blue-50',
    border: 'border-blue-200',
  },
  {
    id: 'active',
    label: 'Active',
    description: 'Your requirement is now publicly visible. Donors can view it and send support offers.',
    icon: CheckCircle2,
    color: 'text-emerald-600',
    bg: 'bg-emerald-500',
    bgLight: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  {
    id: 'partially_supported',
    label: 'Partially Supported',
    description: 'Some donors have offered support. The requirement is still open for additional contributions to cover the remaining quantity.',
    icon: RefreshCw,
    color: 'text-sky-600',
    bg: 'bg-sky-500',
    bgLight: 'bg-sky-50',
    border: 'border-sky-200',
  },
  {
    id: 'fulfilled',
    label: 'Fulfilled',
    description: 'All items have been covered and both parties have confirmed completion. Thank you!',
    icon: CheckCircle2,
    color: 'text-purple-600',
    bg: 'bg-purple-500',
    bgLight: 'bg-purple-50',
    border: 'border-purple-200',
  },
];

const EXPIRED_STAGE = {
  id: 'expired',
  label: 'Expired',
  description: 'This requirement passed its validity date without being fully fulfilled. You can resubmit a new requirement if the need persists.',
  icon: XCircle,
  color: 'text-slate-500',
  bg: 'bg-slate-400',
  bgLight: 'bg-slate-50',
  border: 'border-slate-200',
};

const REJECTED_STAGE = {
  id: 'rejected',
  label: 'Rejected',
  description: 'This requirement was not approved by the admin team. Please contact PoshanSetu for clarification.',
  icon: XCircle,
  color: 'text-red-600',
  bg: 'bg-red-500',
  bgLight: 'bg-red-50',
  border: 'border-red-200',
};

function getStagesForStatus(status) {
  if (status === 'expired') return [...LIFECYCLE_STAGES.slice(0, 2), EXPIRED_STAGE];
  if (status === 'rejected') return [LIFECYCLE_STAGES[0], REJECTED_STAGE];
  return LIFECYCLE_STAGES;
}

export default function RequirementStatus() {
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
          <span className="text-sm font-medium">Loading status…</span>
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

  const stages = getStagesForStatus(req.status);
  const currentStageIndex = stages.findIndex((s) => s.id === req.status);
  const location = [req.city, req.district].filter(Boolean).join(', ');

  return (
    <PageContainer>
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#64707A] mb-6">
          <Link to="/requester/dashboard" className="hover:text-[#304355]">My Requirements</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to={`/requester/requirements/${req.id}`} className="hover:text-[#304355] truncate max-w-xs">{req.title}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#1F2933] font-medium">Status</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#304355] mb-1 tracking-tight">Requirement Status</h1>
          <div className="flex items-center gap-1.5 text-sm text-[#64707A]">
            <MapPin className="w-4 h-4 shrink-0" />
            <span>{req.title}{location ? ` — ${location}` : ''}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
          {/* Lifecycle Timeline */}
          <div>
            <div className="bg-white rounded-2xl border border-[#304355]/10 shadow-sm p-6 mb-6">
              <h2 className="font-bold text-[#304355] mb-6 text-lg">Lifecycle Progress</h2>
              <div className="space-y-0">
                {stages.map((stage, i) => {
                  const Icon = stage.icon;
                  const isDone = i < currentStageIndex;
                  const isCurrent = i === currentStageIndex;
                  const isFuture = i > currentStageIndex;
                  const isLast = i === stages.length - 1;

                  return (
                    <div key={stage.id} className="flex gap-5">
                      {/* Connector column */}
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                          isDone
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : isCurrent
                            ? `${stage.bg} border-transparent text-white shadow-md`
                            : 'bg-white border-slate-200 text-slate-300'
                        }`}>
                          <Icon className={`w-5 h-5 ${isCurrent ? 'animate-pulse' : ''}`} />
                        </div>
                        {!isLast && (
                          <div className={`w-0.5 flex-1 mt-1 ${isDone ? 'bg-emerald-300' : 'bg-slate-200'}`} style={{ minHeight: 40 }} />
                        )}
                      </div>

                      {/* Content */}
                      <div className={`pb-8 flex-1 ${isLast ? 'pb-2' : ''}`}>
                        <div className={`rounded-xl p-4 border ${
                          isCurrent
                            ? `${stage.bgLight} ${stage.border} shadow-sm`
                            : isDone
                            ? 'bg-emerald-50 border-emerald-100'
                            : 'bg-slate-50 border-slate-100'
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <p className={`font-bold text-sm ${
                              isCurrent ? stage.color : isDone ? 'text-emerald-700' : 'text-slate-400'
                            }`}>
                              {stage.label}
                              {isCurrent && <span className="ml-2 text-xs font-semibold text-white bg-[#304355] px-2 py-0.5 rounded-full">Current</span>}
                              {isDone && <span className="ml-2 text-xs font-semibold text-emerald-600">✓ Completed</span>}
                            </p>
                          </div>
                          <p className={`text-xs leading-relaxed ${isCurrent ? 'text-[#64707A]' : isDone ? 'text-emerald-700/70' : 'text-slate-400'}`}>
                            {stage.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Expired alternate path note */}
              {req.status !== 'expired' && req.status !== 'rejected' && (
                <div className="mt-4 pt-4 border-t border-dashed border-slate-200">
                  <p className="text-xs text-[#64707A] flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-slate-400" />
                    <span>If the requirement is not fulfilled before expiry, it will move to <strong>Expired</strong> status.</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Key Dates */}
            <div className="bg-white rounded-2xl border border-[#304355]/10 shadow-sm p-5">
              <h3 className="font-bold text-[#304355] mb-4 text-sm uppercase tracking-wider">Key Dates</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#64707A]">Submitted</span>
                  <span className="font-semibold text-[#1F2933]">{new Date(req.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64707A]">Expires</span>
                  <span className={`font-semibold ${req.status === 'expired' ? 'text-slate-500' : 'text-orange-600'}`}>
                    {new Date(req.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Current status badge */}
            <div className="bg-[#304355]/5 border border-[#304355]/20 rounded-2xl p-4">
              <h3 className="font-bold text-sm text-[#304355] mb-2">Current Status</h3>
              <p className="text-xs text-[#64707A] leading-relaxed capitalize">
                <strong>{req.status?.replace(/_/g, ' ')}</strong>
              </p>
            </div>

            {/* Note about fulfillment */}
            <div className="bg-[#304355]/5 border border-[#304355]/20 rounded-2xl p-4">
              <h3 className="font-bold text-sm text-[#304355] mb-2">About Fulfillment</h3>
              <p className="text-xs text-[#64707A] leading-relaxed">
                A requirement is marked <strong>Fulfilled</strong> only after <strong>both</strong> the donor and the requester confirm completion. This ensures transparency and protects all parties.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(`/requester/requirements/${req.id}`)}
                icon={ArrowLeft}
              >
                Back to Management
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => navigate('/requester/dashboard')}
              >
                All My Requirements
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
