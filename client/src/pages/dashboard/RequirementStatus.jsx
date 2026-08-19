import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/common/Button';
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

// ─── Mock requirement data keyed by id ───────────────────────────────────────
const REQUIREMENTS = {
  'req-1': {
    id: 'req-1',
    title: 'Food Support for 120 Students',
    location: 'Trimbak, Nashik',
    status: 'active',
    submittedOn: '2026-08-01',
    expiresOn: '2026-09-15',
    history: [
      { status: 'under_review', date: '2026-08-01', note: 'Requirement submitted and sent for moderation.' },
      { status: 'active', date: '2026-08-03', note: 'Approved by moderator. Now visible to donors.' },
    ],
  },
  'req-2': {
    id: 'req-2',
    title: 'Dal for Anganwadi Children',
    location: 'Dindori, Nashik',
    status: 'partially_supported',
    submittedOn: '2026-08-10',
    expiresOn: '2026-09-20',
    history: [
      { status: 'under_review', date: '2026-08-10', note: 'Requirement submitted.' },
      { status: 'active', date: '2026-08-11', note: 'Approved and published.' },
      { status: 'partially_supported', date: '2026-08-17', note: '15 kg of 20 kg covered by donor offers.' },
    ],
  },
};

function getStagesForStatus(status) {
  if (status === 'expired') {
    return [...LIFECYCLE_STAGES.slice(0, 1), EXPIRED_STAGE];
  }
  return LIFECYCLE_STAGES;
}

function getCurrentIndex(status) {
  if (status === 'expired') return -1; // special case
  return LIFECYCLE_STAGES.findIndex((s) => s.id === status);
}

export default function RequirementStatus() {
  const { id } = useParams();
  const navigate = useNavigate();

  const req = REQUIREMENTS[id] || REQUIREMENTS['req-1'];
  const stages = req.status === 'expired'
    ? [...LIFECYCLE_STAGES.slice(0, 2), EXPIRED_STAGE]
    : LIFECYCLE_STAGES;
  const currentStageIndex = stages.findIndex((s) => s.id === req.status);

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
            <span>{req.title} — {req.location}</span>
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

              {/* Expired alternate path */}
              {req.status !== 'expired' && (
                <div className="mt-4 pt-4 border-t border-dashed border-slate-200">
                  <p className="text-xs text-[#64707A] flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-slate-400" />
                    <span>If the requirement is not fulfilled before expiry, it will move to <strong>Expired</strong> status.</span>
                  </p>
                </div>
              )}
            </div>

            {/* History Log */}
            <div className="bg-white rounded-2xl border border-[#304355]/10 shadow-sm p-6">
              <h2 className="font-bold text-[#304355] mb-4">Status History</h2>
              <div className="space-y-3">
                {req.history.slice().reverse().map((entry, i) => {
                  const stage = LIFECYCLE_STAGES.find((s) => s.id === entry.status) || EXPIRED_STAGE;
                  const Icon = stage.icon;
                  return (
                    <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${stage.bgLight} ${stage.border}`}>
                      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${stage.color}`} />
                      <div>
                        <p className={`font-semibold text-xs ${stage.color}`}>{stage.label}</p>
                        <p className="text-xs text-[#64707A]">{entry.note}</p>
                        <p className="text-xs text-[#64707A] mt-0.5">
                          {new Date(entry.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
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
                  <span className="font-semibold text-[#1F2933]">{new Date(req.submittedOn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64707A]">Expires</span>
                  <span className={`font-semibold ${req.status === 'expired' ? 'text-slate-500' : 'text-orange-600'}`}>
                    {new Date(req.expiresOn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
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
