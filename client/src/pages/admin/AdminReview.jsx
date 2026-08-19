import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/common/Button';
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
} from 'lucide-react';

// ─── Mock Review Data ─────────────────────────────────────────────────────────
const REVIEW_ITEMS = {
  'req-3': {
    type: 'requirement',
    id: 'req-3',
    title: 'Emergency Nutrition Kits — Tribal Hamlet',
    institution: 'Grameen Seva Kendra, Surgana',
    institutionType: 'NGO',
    district: 'Nashik',
    taluka: 'Surgana',
    category: 'Mixed',
    urgency: 'critical',
    submittedOn: '2026-08-18',
    beneficiaries: 60,
    beneficiaryCategories: ['Tribal Families'],
    description: 'Remote tribal hamlet requires emergency nutrition kits following dry weather conditions affecting local food supply. We serve 60 families in Surgana taluka.',
    items: [
      { name: 'Chana', quantity: '30 kg' },
      { name: 'Rice', quantity: '50 kg' },
      { name: 'Oil', quantity: '10 L' },
    ],
    fraudSignals: [],
    requester: { name: 'Sham Patil', phone: '+91 9876543210', email: 'grameen.seva@example.com' },
    documents: [
      { name: 'Authorization Letter', type: 'PDF', status: 'uploaded' },
    ],
    reviewHistory: [],
    currentStatus: 'under_review',
  },
  'req-flagged-1': {
    type: 'requirement',
    id: 'req-flagged-1',
    title: 'Monthly Food Requirement — School',
    institution: 'Rajiv Gandhi Tribal Ashram, Dindori',
    institutionType: 'Residential School',
    district: 'Nashik',
    taluka: 'Dindori',
    category: 'Grains',
    urgency: 'high',
    submittedOn: '2026-08-17',
    beneficiaries: 200,
    beneficiaryCategories: ['Tribal School Children'],
    description: 'Ashram school requires monthly food supplies for 200 residential students. We are a government-aided residential school.',
    items: [
      { name: 'Rice', quantity: '200 kg' },
      { name: 'Wheat', quantity: '100 kg' },
    ],
    fraudSignals: [
      {
        type: 'similar_nearby',
        label: 'Similar requirement from nearby organization',
        detail: '"New Tribal Trust, Dindori" submitted a very similar requirement (grains, similar quantities) on the same date from Dindori.',
        severity: 'medium',
      },
      {
        type: 'high_quantity',
        label: 'High quantity relative to reported beneficiaries',
        detail: 'The quantity (300 kg total grains) is above average for 200 beneficiaries for a monthly cycle. This may be legitimate — please verify.',
        severity: 'low',
      },
    ],
    requester: { name: 'Dilip Sawant', phone: '+91 9765432100', email: 'rga.dindori@example.com' },
    documents: [
      { name: 'School Registration', type: 'PDF', status: 'uploaded' },
      { name: 'Beneficiary Count Letter', type: 'PDF', status: 'uploaded' },
    ],
    reviewHistory: [
      { action: 'Signals Detected', note: 'Pattern detection flagged 2 review signals.', by: 'System', at: '2026-08-17T08:00:00' },
    ],
    currentStatus: 'flagged_for_review',
  },
  'flag-1': {
    type: 'flag',
    id: 'flag-1',
    title: 'Possible duplicate requirement submissions from same location',
    institutions: ['Rajiv Gandhi Tribal Ashram, Dindori', 'New Tribal Trust, Dindori'],
    detail: 'Two requirements submitted on the same date from organizations at similar locations in Dindori with very similar quantities.',
    severity: 'medium',
    reviewHistory: [],
  },
  'flag-2': {
    type: 'flag',
    id: 'flag-2',
    title: 'Multiple institution accounts from same contact number',
    institutions: ['Kalyan Tribal Trust', 'New Tribal Ashram, Dindori'],
    detail: 'The same phone number appears in two institution profiles. This may be a legitimate shared contact or may indicate duplicate account creation.',
    severity: 'high',
    reviewHistory: [],
  },
};

const URGENCY_CONFIG = {
  critical: { label: 'Critical', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  high: { label: 'High', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  medium: { label: 'Medium', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  low: { label: 'Low', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
};

const FRAUD_SEVERITY = {
  high: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-500' },
  medium: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
  low: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-400' },
};

export default function AdminReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reviewNote, setReviewNote] = useState('');
  const [actionTaken, setActionTaken] = useState(null); // 'approved' | 'flagged' | 'hidden'

  const item = REVIEW_ITEMS[id] || REVIEW_ITEMS['req-flagged-1'];

  const handleAction = (action) => {
    setActionTaken(action);
  };

  if (actionTaken) {
    const messages = {
      approved: { title: 'Requirement Approved', body: 'The requirement is now Active and visible to donors.', color: 'text-emerald-600', icon: CheckCircle2 },
      flagged: { title: 'Marked for Further Review', body: 'The requirement has been flagged. It remains under review until further action.', color: 'text-amber-600', icon: Flag },
      hidden: { title: 'Requirement Hidden', body: 'The requirement has been hidden from public view. The requester has been notified.', color: 'text-slate-600', icon: EyeOff },
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
            <Button variant="secondary" onClick={() => setActionTaken(null)}>
              Review Another Item
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#64707A] mb-6">
          <Link to="/admin/dashboard" className="hover:text-[#304355]">Admin Dashboard</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#1F2933] font-medium">Review</span>
        </nav>

        {/* Admin Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#304355] text-white text-xs font-bold px-3 py-1.5 rounded-full mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Review Mode
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#304355] tracking-tight">{item.title}</h1>
          </div>
          <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/admin/dashboard')}>
            Back to Dashboard
          </Button>
        </div>

        {/* Critical Disclaimer */}
        <div className="bg-amber-50 border-l-4 border-amber-400 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm text-amber-800 mb-1">Review Signals — Not Confirmed Fraud</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              Any signals shown below are <strong>review indicators only</strong>. They do not confirm fraudulent intent. A human moderator must investigate, contact the institution if needed, and make a reasoned decision before taking action. Do not accuse or reject based on signals alone.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
          {/* Main Column */}
          <div className="space-y-6">
            {/* Requirement / Flag Details */}
            {item.type === 'requirement' && (
              <>
                <div className="bg-white rounded-2xl border border-[#304355]/10 shadow-sm p-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.urgency && (
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${URGENCY_CONFIG[item.urgency]?.bg} ${URGENCY_CONFIG[item.urgency]?.text} ${URGENCY_CONFIG[item.urgency]?.border}`}>
                        {URGENCY_CONFIG[item.urgency]?.label} Urgency
                      </span>
                    )}
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E8E8E2] text-[#304355] border border-slate-200">
                      {item.category}
                    </span>
                  </div>
                  <h2 className="font-bold text-[#304355] text-lg mb-1">{item.title}</h2>
                  <p className="text-sm text-[#64707A] leading-relaxed mb-4">{item.description}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-[#64707A] mb-4">
                    <div><p className="font-semibold uppercase tracking-wider mb-0.5">Institution</p><p className="text-[#1F2933]">{item.institution}</p></div>
                    <div><p className="font-semibold uppercase tracking-wider mb-0.5">District</p><p className="text-[#1F2933]">{item.district}</p></div>
                    <div><p className="font-semibold uppercase tracking-wider mb-0.5">Beneficiaries</p><p className="text-[#1F2933]">{item.beneficiaries}</p></div>
                    <div><p className="font-semibold uppercase tracking-wider mb-0.5">Submitted</p><p className="text-[#1F2933]">{new Date(item.submittedOn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p></div>
                    <div><p className="font-semibold uppercase tracking-wider mb-0.5">Contact</p><p className="text-[#1F2933]">{item.requester.name}</p></div>
                    <div><p className="font-semibold uppercase tracking-wider mb-0.5">Phone</p><p className="text-[#1F2933]">{item.requester.phone}</p></div>
                  </div>

                  {/* Items */}
                  <div>
                    <p className="text-xs font-semibold text-[#64707A] uppercase tracking-wider mb-2">Requested Items</p>
                    <div className="flex flex-wrap gap-2">
                      {item.items.map((itm) => (
                        <span key={itm.name} className="text-xs bg-[#E8E8E2] text-[#304355] px-2.5 py-1 rounded-full font-medium">
                          {itm.name} — {itm.quantity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="bg-white rounded-2xl border border-[#304355]/10 shadow-sm p-6">
                  <h3 className="font-bold text-[#304355] mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Supporting Documents
                  </h3>
                  {item.documents.length === 0 ? (
                    <p className="text-sm text-[#64707A]">No documents submitted.</p>
                  ) : (
                    <div className="space-y-3">
                      {item.documents.map((doc) => (
                        <div key={doc.name} className="flex items-center justify-between px-4 py-3 bg-[#E8E8E2] rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${doc.type === 'PDF' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                              {doc.type}
                            </div>
                            <span className="text-sm font-medium text-[#1F2933]">{doc.name}</span>
                          </div>
                          <button className="p-1.5 rounded-lg hover:bg-white text-[#304355] transition-colors" title="Preview">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Flag details for non-requirement flags */}
            {item.type === 'flag' && (
              <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-6">
                <h2 className="font-bold text-[#304355] text-lg mb-2">{item.title}</h2>
                <p className="text-sm text-[#64707A] leading-relaxed mb-4">{item.detail}</p>
                <div>
                  <p className="text-xs font-semibold text-[#64707A] uppercase tracking-wider mb-2">Involved Organizations</p>
                  <div className="flex flex-wrap gap-2">
                    {item.institutions.map((inst) => (
                      <span key={inst} className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full font-medium">{inst}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Fraud Signals */}
            {item.type === 'requirement' && item.fraudSignals.length > 0 && (
              <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-6">
                <h3 className="font-bold text-[#304355] mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Review Signals ({item.fraudSignals.length})
                </h3>
                <div className="space-y-3">
                  {item.fraudSignals.map((signal, i) => {
                    const sev = FRAUD_SEVERITY[signal.severity] || FRAUD_SEVERITY.medium;
                    return (
                      <div key={i} className={`rounded-xl border p-4 ${sev.bg} ${sev.border}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${sev.dot}`} />
                          <p className={`font-semibold text-sm ${sev.text}`}>{signal.label}</p>
                          <span className="ml-auto text-xs font-semibold text-[#64707A] capitalize">{signal.severity} severity</span>
                        </div>
                        <p className={`text-xs leading-relaxed ${sev.text} opacity-80`}>{signal.detail}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Review History */}
            {item.reviewHistory && item.reviewHistory.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#304355]/10 shadow-sm p-6">
                <h3 className="font-bold text-[#304355] mb-4">Review History</h3>
                {item.reviewHistory.map((entry, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
                    <Clock className="w-4 h-4 text-[#64707A] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-xs text-[#1F2933]">{entry.action}</p>
                      <p className="text-xs text-[#64707A]">{entry.note}</p>
                      <p className="text-xs text-[#64707A] mt-0.5">by {entry.by} · {new Date(entry.at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Review Note + Actions */}
            <div className="bg-white rounded-2xl border border-[#304355]/10 shadow-sm p-6">
              <h3 className="font-bold text-[#304355] mb-3">Moderator Notes</h3>
              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Add internal review notes (visible to other moderators only)..."
                rows={4}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm text-[#1F2933] bg-[#FBF9FA] resize-none focus:outline-none focus:border-[#304355] focus:ring-1 focus:ring-[#304355] transition-colors mb-4"
              />

              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-bold text-[#64707A] uppercase tracking-wider mb-3">Admin Actions</p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="emerald"
                    icon={CheckCircle2}
                    onClick={() => handleAction('approved')}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    icon={Flag}
                    onClick={() => handleAction('flagged')}
                    className="border-amber-400 text-amber-700 hover:bg-amber-50"
                  >
                    Flag for Further Review
                  </Button>
                  <Button
                    variant="danger"
                    icon={EyeOff}
                    onClick={() => handleAction('hidden')}
                  >
                    Hide / Reject
                  </Button>
                </div>
                <p className="text-xs text-[#64707A] mt-3">
                  ⚠ Actions are irreversible in this demo. In production, actions will be logged and notifiable.
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Review Checklist */}
            <div className="bg-white rounded-2xl border border-[#304355]/10 shadow-sm p-5">
              <h3 className="font-bold text-[#304355] mb-3 text-sm">Review Checklist</h3>
              <div className="space-y-2 text-xs">
                {[
                  'Is the institution registered?',
                  'Are the submitted documents valid and legible?',
                  'Is the beneficiary count plausible?',
                  'Are quantities reasonable for the beneficiary count?',
                  'No similar active requirement from same organization?',
                  'Review signals investigated (if any)?',
                ].map((item, i) => (
                  <label key={i} className="flex items-start gap-2 cursor-pointer hover:bg-slate-50 -mx-1 px-1 py-1 rounded-lg transition-colors">
                    <input type="checkbox" className="mt-0.5 accent-[#304355]" />
                    <span className="text-[#64707A]">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Signal Legend */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <h3 className="font-bold text-sm text-amber-800 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Signal Severity Key
              </h3>
              <div className="space-y-2 text-xs">
                {[
                  { label: 'High — Warrants priority investigation', color: 'bg-red-500' },
                  { label: 'Medium — Review carefully before approval', color: 'bg-amber-500' },
                  { label: 'Low — Note and proceed with review', color: 'bg-blue-400' },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.color}`} />
                    <span className="text-amber-800">{s.label}</span>
                  </div>
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
