import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/common/Button';
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
} from 'lucide-react';

// ─── Mock Data ───────────────────────────────────────────────────────────────
const SUPPORT_DETAILS = {
  'sup-1': {
    id: 'sup-1',
    requirementId: 'req-1',
    requirementTitle: 'Food Support for 120 Students',
    institution: 'Trimbakeshwar Ashram Shala',
    location: 'Trimbak, Nashik',
    district: 'Nashik',
    beneficiaries: 120,
    item: 'Rice',
    originalNeed: '50 kg',
    yourOffer: '20 kg',
    remaining: '30 kg',
    status: 'pending_confirmation',
    offeredOn: '2026-08-15',
    requesterContact: 'Sanjay Bhosale',
    requesterPhone: '+91 98201 xxxxx',
    donorMessage: 'I can deliver the rice bags to the school directly. Please share the address.',
    timeline: [
      { date: '2026-08-15', label: 'Offer Submitted', description: 'You submitted a support offer for 20 kg of Rice.', done: true },
      { date: '2026-08-16', label: 'Offer Accepted', description: 'Trimbakeshwar Ashram Shala accepted your offer.', done: true },
      { date: null, label: 'Coordination', description: 'Coordinate delivery or handoff with the requester.', done: false, active: true },
      { date: null, label: 'Completion Confirmation', description: 'Both parties confirm receipt and fulfillment.', done: false },
    ],
    confirmationStatus: {
      donor: false,
      requester: false,
    },
  },
  'sup-2': {
    id: 'sup-2',
    requirementId: 'req-2',
    requirementTitle: 'Dal for Anganwadi Children',
    institution: 'Dindori Anganwadi Centre 7',
    location: 'Dindori, Nashik',
    district: 'Nashik',
    beneficiaries: 45,
    item: 'Moong Dal',
    originalNeed: '20 kg',
    yourOffer: '15 kg',
    remaining: '5 kg',
    status: 'active',
    offeredOn: '2026-08-17',
    requesterContact: 'Lata Shinde',
    requesterPhone: '+91 94220 xxxxx',
    donorMessage: 'Happy to help. Will deliver on weekend.',
    timeline: [
      { date: '2026-08-17', label: 'Offer Submitted', description: 'You submitted a support offer for 15 kg of Moong Dal.', done: true },
      { date: '2026-08-18', label: 'Offer Accepted', description: 'Dindori Anganwadi Centre 7 accepted your offer.', done: true },
      { date: null, label: 'Coordination', description: 'Coordinate delivery or handoff with the requester.', done: false, active: true },
      { date: null, label: 'Completion Confirmation', description: 'Both parties confirm receipt and fulfillment.', done: false },
    ],
    confirmationStatus: { donor: false, requester: false },
  },
};

function StatusChip({ status }) {
  const map = {
    active: { label: 'Coordination in Progress', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    pending_confirmation: { label: 'Action Needed', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300' },
    partially_fulfilled: { label: 'Partially Supported', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
    completed: { label: 'Completed', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  };
  const s = map[status] || map.active;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
      {s.label}
    </span>
  );
}

function TimelineStep({ step, isLast }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 ${
          step.done
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : step.active
            ? 'bg-white border-[#304355] text-[#304355]'
            : 'bg-white border-slate-300 text-slate-400'
        }`}>
          {step.done ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : step.active ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Clock className="w-4 h-4" />
          )}
        </div>
        {!isLast && (
          <div className={`w-0.5 flex-1 mt-1 ${step.done ? 'bg-emerald-400' : 'bg-slate-200'}`} style={{ minHeight: 36 }} />
        )}
      </div>
      <div className={`pb-6 ${isLast ? '' : ''}`}>
        <p className={`font-semibold text-sm ${step.done ? 'text-emerald-700' : step.active ? 'text-[#304355]' : 'text-[#64707A]'}`}>
          {step.label}
          {step.date && <span className="ml-2 font-normal text-xs text-[#64707A]">— {new Date(step.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
        </p>
        <p className="text-xs text-[#64707A] mt-0.5 leading-relaxed">{step.description}</p>
      </div>
    </div>
  );
}

export default function SupportDetails() {
  const { supportId } = useParams();
  const navigate = useNavigate();
  const [donorConfirmed, setDonorConfirmed] = useState(false);

  // Fall back to sup-1 for demo if id is not in mock data
  const support = SUPPORT_DETAILS[supportId] || SUPPORT_DETAILS['sup-1'];

  const progressPct = Math.round(
    (parseFloat(support.yourOffer) / parseFloat(support.originalNeed)) * 100
  );

  return (
    <PageContainer>
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#64707A] mb-6">
          <Link to="/donor/dashboard" className="hover:text-[#304355] transition-colors">My Dashboard</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/donor/dashboard" className="hover:text-[#304355] transition-colors">Active Supports</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#1F2933] font-medium">Support Details</span>
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
                <span>{support.location}</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {[
                  { label: 'Original Need', value: support.originalNeed, color: 'text-[#1F2933]' },
                  { label: 'Your Offer', value: support.yourOffer, color: 'text-[#304355]' },
                  { label: 'Remaining', value: support.remaining, color: 'text-orange-600' },
                  { label: 'Beneficiaries', value: support.beneficiaries, color: 'text-[#1F2933]' },
                ].map((s) => (
                  <div key={s.label} className="bg-[#E8E8E2] rounded-xl p-4 text-center">
                    <p className="text-xs text-[#64707A] uppercase tracking-wider font-semibold mb-1">{s.label}</p>
                    <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-[#64707A]">
                  <span>Your contribution</span>
                  <span className="font-semibold">{progressPct}% of this item</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-[#304355] h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(progressPct, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#304355]/10 p-6">
              <h3 className="font-bold text-[#304355] mb-5 text-base">Support Timeline</h3>
              {support.timeline.map((step, i) => (
                <TimelineStep key={i} step={step} isLast={i === support.timeline.length - 1} />
              ))}
            </div>

            {/* Message */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#304355]/10 p-6">
              <h3 className="font-bold text-[#304355] mb-3 text-base flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Your Message to Requester
              </h3>
              <div className="bg-[#E8E8E2] rounded-xl px-4 py-3 text-sm text-[#1F2933] italic">
                "{support.donorMessage}"
              </div>
            </div>

            {/* Completion Confirmation */}
            {(support.status === 'active' || support.status === 'pending_confirmation') && (
              <div className="bg-white rounded-2xl shadow-sm border border-[#304355]/10 p-6">
                <h3 className="font-bold text-[#304355] mb-2 text-base">Confirm Completion</h3>
                <p className="text-sm text-[#64707A] mb-4 leading-relaxed">
                  Once you have delivered the items and the requester has confirmed receipt, both parties need to confirm completion. This is required before the support is marked as fulfilled.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${donorConfirmed ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'}`}>
                    <CheckCircle2 className={`w-5 h-5 ${donorConfirmed ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <div>
                      <p className="font-semibold text-sm text-[#1F2933]">Your Confirmation</p>
                      <p className="text-xs text-[#64707A]">{donorConfirmed ? 'Confirmed' : 'Pending'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-slate-50 border-slate-200">
                    <CheckCircle2 className="w-5 h-5 text-slate-300" />
                    <div>
                      <p className="font-semibold text-sm text-[#1F2933]">Requester's Confirmation</p>
                      <p className="text-xs text-[#64707A]">Pending</p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Completion is only finalized when <strong>both</strong> you and the requester confirm. This protects all parties.
                  </p>
                </div>
                {!donorConfirmed ? (
                  <Button
                    variant="emerald"
                    icon={CheckCircle2}
                    onClick={() => setDonorConfirmed(true)}
                    className="w-full sm:w-auto"
                  >
                    Confirm I Have Delivered the Items
                  </Button>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-sm text-emerald-800 font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Your confirmation has been recorded. Waiting for the requester to confirm.
                  </div>
                )}
              </div>
            )}
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
                  <p className="font-bold text-sm text-[#1F2933]">{support.institution}</p>
                  <p className="text-xs text-[#64707A]">Contact: {support.requesterContact}</p>
                  <p className="text-xs text-[#64707A] mt-0.5">📞 {support.requesterPhone}</p>
                </div>
              </div>
              <Link
                to={`/requirements/${support.requirementId}`}
                className="text-xs font-semibold text-[#304355] hover:underline inline-flex items-center gap-1"
              >
                View Requirement Details <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Offer Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#304355]/10 p-5">
              <h3 className="font-bold text-[#304355] mb-4 text-sm uppercase tracking-wider">Your Offer</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#64707A]">Item</span>
                  <span className="font-semibold text-[#1F2933]">{support.item}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64707A]">Quantity</span>
                  <span className="font-semibold text-[#1F2933]">{support.yourOffer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64707A]">Submitted</span>
                  <span className="font-semibold text-[#1F2933]">
                    {new Date(support.offeredOn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Trust */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-[#1F2933] mb-0.5">Verified Requester</p>
                <p className="text-xs text-[#64707A]">This organization has been reviewed by PoshanSetu. Contact details are shared securely.</p>
              </div>
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
