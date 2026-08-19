import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/common/Button';
import {
  ShieldCheck,
  AlertTriangle,
  ClipboardList,
  Building2,
  ChevronRight,
  CheckCircle2,
  Clock,
  Eye,
  Flag,
  EyeOff,
  TrendingUp,
  Users,
  MapPin,
  Calendar,
  AlertCircle,
} from 'lucide-react';

// ─── Mock Admin Data ──────────────────────────────────────────────────────────
const ADMIN_STATS = {
  totalRequirements: 47,
  pendingReview: 5,
  verificationQueue: 3,
  flaggedItems: 2,
  activeRequirements: 28,
  totalDonors: 120,
  totalRequesters: 34,
  fulfillmentRate: 68,
};

const PENDING_REQUIREMENTS = [
  {
    id: 'req-3',
    title: 'Emergency Nutrition Kits — Tribal Hamlet',
    institution: 'Grameen Seva Kendra, Surgana',
    district: 'Nashik',
    category: 'Mixed',
    urgency: 'critical',
    submittedOn: '2026-08-18',
    beneficiaries: 60,
    fraudSignals: [],
  },
  {
    id: 'req-flagged-1',
    title: 'Monthly Food Requirement — School',
    institution: 'Rajiv Gandhi Tribal Ashram, Dindori',
    district: 'Nashik',
    category: 'Grains',
    urgency: 'high',
    submittedOn: '2026-08-17',
    beneficiaries: 200,
    fraudSignals: ['similar_nearby', 'high_quantity'],
  },
  {
    id: 'req-flagged-2',
    title: 'Ration Support Request — Monthly',
    institution: 'New Tribal Trust, Dindori',
    district: 'Nashik',
    category: 'Grains',
    urgency: 'medium',
    submittedOn: '2026-08-17',
    beneficiaries: 180,
    fraudSignals: ['similar_nearby', 'possible_duplicate'],
  },
];

const VERIFICATION_QUEUE = [
  { id: 'inst-1', name: 'ZP School Igatpuri', type: 'Government School', submittedOn: '2026-08-17', docsSubmitted: 2, docsRequired: 3 },
  { id: 'inst-2', name: 'Kalyan Tribal Trust', type: 'NGO', submittedOn: '2026-08-16', docsSubmitted: 3, docsRequired: 3 },
  { id: 'inst-3', name: 'New Tribal Ashram, Dindori', type: 'Residential School', submittedOn: '2026-08-15', docsSubmitted: 1, docsRequired: 3, hasFraudSignal: true },
];

const FLAGGED_ITEMS = [
  {
    id: 'flag-1',
    type: 'requirement',
    title: 'Possible duplicate requirement submissions from same location',
    institutions: ['Rajiv Gandhi Tribal Ashram, Dindori', 'New Tribal Trust, Dindori'],
    detail: 'Two requirements submitted on the same date from organizations at similar locations in Dindori with very similar quantities.',
    severity: 'medium',
  },
  {
    id: 'flag-2',
    type: 'institution',
    title: 'Multiple institution accounts from same contact number',
    institutions: ['Kalyan Tribal Trust', 'New Tribal Ashram, Dindori'],
    detail: 'The same phone number (+91 XXXXX XXXX) appears in two institution profiles.',
    severity: 'high',
  },
];

const RECENT_ACTIVITY = [
  { action: 'Approved', target: 'Dal for Anganwadi Children', by: 'Admin (Meena)', at: '2026-08-18T14:00:00' },
  { action: 'Document Reviewed', target: 'Trimbakeshwar Ashram Shala — Registration Certificate', by: 'Admin (Meena)', at: '2026-08-17T09:15:00' },
  { action: 'Document Rejected', target: 'Trimbakeshwar Ashram Shala — Beneficiary Certificate', by: 'Admin (Rahul)', at: '2026-08-16T11:00:00' },
  { action: 'Requirement Flagged', target: 'Monthly Food Requirement — School', by: 'System (Pattern Detection)', at: '2026-08-17T08:00:00' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const URGENCY_CONFIG = {
  critical: { label: 'Critical', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
  high: { label: 'High', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  medium: { label: 'Medium', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-400' },
  low: { label: 'Low', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-400' },
};

const FRAUD_SIGNAL_LABELS = {
  similar_nearby: 'Similar requirement from nearby organization',
  high_quantity: 'Unusually high quantity relative to beneficiaries',
  possible_duplicate: 'May be duplicate of another requirement',
  same_contact: 'Multiple accounts with same contact number',
};

function StatCard({ icon: Icon, value, label, color = 'text-[#304355]', unit = '' }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-[#304355]/10 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <Icon className={`w-5 h-5 ${color}`} />
        <span className="text-3xl font-extrabold text-[#304355]">{value}{unit}</span>
      </div>
      <p className="text-xs font-semibold text-[#64707A] uppercase tracking-wider">{label}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-[#304355] text-white text-xs font-bold px-3 py-1.5 rounded-full mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin View
          </div>
          <h1 className="text-3xl font-extrabold text-[#304355] mb-1 tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-[#64707A]">Monitor requirements, institution verifications, and review signals.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={ClipboardList} value={ADMIN_STATS.totalRequirements} label="Total Requirements" />
          <StatCard icon={Clock} value={ADMIN_STATS.pendingReview} label="Pending Review" color="text-amber-500" />
          <StatCard icon={Building2} value={ADMIN_STATS.verificationQueue} label="Verification Queue" color="text-blue-500" />
          <StatCard icon={AlertTriangle} value={ADMIN_STATS.flaggedItems} label="Flagged Items" color="text-red-500" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard icon={CheckCircle2} value={ADMIN_STATS.activeRequirements} label="Active Requirements" color="text-emerald-500" />
          <StatCard icon={Users} value={ADMIN_STATS.totalDonors} label="Total Donors" />
          <StatCard icon={Users} value={ADMIN_STATS.totalRequesters} label="Requesters" />
          <StatCard icon={TrendingUp} value={ADMIN_STATS.fulfillmentRate} label="Fulfillment Rate" unit="%" color="text-purple-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Fraud Signals */}
            {FLAGGED_ITEMS.length > 0 && (
              <section>
                <h2 className="font-bold text-[#304355] text-lg mb-1 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Review Signals
                </h2>
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mb-4 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 leading-relaxed">
                    <strong>These are review signals only — not confirmed fraud.</strong> They indicate patterns that require human review. Do not take action based on signals alone. A supervisor must investigate and decide.
                  </p>
                </div>
                <div className="space-y-4">
                  {FLAGGED_ITEMS.map((item) => (
                    <div key={item.id} className={`bg-white rounded-xl border shadow-sm p-5 ${item.severity === 'high' ? 'border-red-200' : 'border-amber-200'}`}>
                      <div className="flex items-start gap-3 mb-3">
                        <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${item.severity === 'high' ? 'text-red-500' : 'text-amber-500'}`} />
                        <div>
                          <p className="font-bold text-sm text-[#1F2933] mb-0.5">{item.title}</p>
                          <p className="text-xs text-[#64707A] leading-relaxed">{item.detail}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {item.institutions.map((inst) => (
                          <span key={inst} className="text-xs bg-[#E8E8E2] text-[#304355] px-2.5 py-1 rounded-full font-medium">{inst}</span>
                        ))}
                      </div>
                      <Link
                        to={`/admin/review/${item.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#304355] hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Review This Signal
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Pending Requirements */}
            <section>
              <h2 className="font-bold text-[#304355] text-lg mb-4 flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                Requirements Awaiting Review ({PENDING_REQUIREMENTS.length})
              </h2>
              <div className="space-y-3">
                {PENDING_REQUIREMENTS.map((req) => {
                  const urgency = URGENCY_CONFIG[req.urgency];
                  return (
                    <div key={req.id} className={`bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow ${req.fraudSignals.length > 0 ? 'border-amber-200' : 'border-[#304355]/10'}`}>
                      <div className="flex flex-wrap items-start gap-2 mb-2">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${urgency.bg} ${urgency.text} ${urgency.border}`}>
                          {urgency.label}
                        </span>
                        {req.fraudSignals.length > 0 && (
                          <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {req.fraudSignals.length} Review Signal{req.fraudSignals.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-[#304355] text-sm mb-0.5">{req.title}</h3>
                      <p className="text-xs text-[#64707A] mb-1">{req.institution}</p>
                      <div className="flex items-center gap-3 text-xs text-[#64707A] mb-3">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{req.district}</span>
                        <span>{req.beneficiaries} beneficiaries</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(req.submittedOn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      </div>
                      {req.fraudSignals.length > 0 && (
                        <div className="mb-3 space-y-1">
                          {req.fraudSignals.map((signal) => (
                            <p key={signal} className="text-xs text-amber-700 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                              {FRAUD_SIGNAL_LABELS[signal]}
                            </p>
                          ))}
                        </div>
                      )}
                      <Link
                        to={`/admin/review/${req.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#304355] hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Review Requirement
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Verification Queue */}
            <div className="bg-white rounded-2xl border border-[#304355]/10 shadow-sm p-5">
              <h3 className="font-bold text-[#304355] mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Institution Verification Queue
              </h3>
              {VERIFICATION_QUEUE.map((inst) => (
                <div key={inst.id} className={`flex items-start justify-between gap-3 py-3 border-b border-slate-100 last:border-0 ${inst.hasFraudSignal ? 'bg-amber-50/50 -mx-1 px-1 rounded-lg' : ''}`}>
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="font-semibold text-sm text-[#1F2933]">{inst.name}</p>
                      {inst.hasFraudSignal && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                    </div>
                    <p className="text-xs text-[#64707A]">{inst.type}</p>
                    <p className="text-xs text-[#64707A] mt-0.5">
                      {inst.docsSubmitted}/{inst.docsRequired} docs · {new Date(inst.submittedOn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <Link
                    to={`/admin/institution-review/${inst.id}`}
                    className="text-xs font-semibold text-[#304355] hover:underline shrink-0"
                  >
                    Review
                  </Link>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-[#304355]/10 shadow-sm p-5">
              <h3 className="font-bold text-[#304355] mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {RECENT_ACTIVITY.map((activity, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${
                      activity.action.includes('Approved') ? 'bg-emerald-500'
                      : activity.action.includes('Flagged') ? 'bg-amber-500'
                      : activity.action.includes('Rejected') ? 'bg-red-500'
                      : 'bg-blue-400'
                    }`} />
                    <div>
                      <span className="font-semibold text-[#1F2933]">{activity.action}: </span>
                      <span className="text-[#64707A]">{activity.target}</span>
                      <p className="text-[#64707A] mt-0.5">by {activity.by}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
