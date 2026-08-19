import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/common/Button';
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
} from 'lucide-react';

// ─── Mock Data ───────────────────────────────────────────────────────────────
const REQUIREMENTS = {
  'req-1': {
    id: 'req-1',
    title: 'Food Support for 120 Students',
    description: 'Residential school for tribal students in Trimbak, Nashik. We serve 120+ students daily. Urgent need for basic grains and pulses to maintain the mid-day meal program.',
    category: 'Grains & Pulses',
    urgency: 'high',
    status: 'active',
    location: 'Trimbak, Nashik',
    district: 'Nashik',
    taluka: 'Trimbak',
    beneficiaries: 120,
    beneficiaryCategories: ['School Children', 'Tribal Students'],
    submittedOn: '2026-08-01',
    expiresOn: '2026-09-15',
    items: [
      { name: 'Rice', target: 100, remaining: 60, unit: 'kg' },
      { name: 'Moong Dal', target: 50, remaining: 30, unit: 'kg' },
      { name: 'Chana', target: 25, remaining: 25, unit: 'kg' },
    ],
    offers: [
      { id: 'off-1', donor: 'Karan S.', item: 'Rice', quantity: '20 kg', status: 'accepted', offeredOn: '2026-08-15', message: 'Will deliver on weekend.' },
      { id: 'off-2', donor: 'Priya M.', item: 'Moong Dal', quantity: '15 kg', status: 'accepted', offeredOn: '2026-08-16', message: 'Can courier via local transport.' },
      { id: 'off-3', donor: 'Suresh R.', item: 'Rice', quantity: '20 kg', status: 'pending', offeredOn: '2026-08-18', message: 'Please confirm the address.' },
    ],
  },
  'req-2': {
    id: 'req-2',
    title: 'Dal for Anganwadi Children',
    description: 'Anganwadi centre serving underfive children and pregnant mothers in Dindori block.',
    category: 'Pulses',
    urgency: 'medium',
    status: 'partially_supported',
    location: 'Dindori, Nashik',
    district: 'Nashik',
    taluka: 'Dindori',
    beneficiaries: 45,
    beneficiaryCategories: ['Children under 5', 'Pregnant Women'],
    submittedOn: '2026-08-10',
    expiresOn: '2026-09-20',
    items: [
      { name: 'Moong Dal', target: 20, remaining: 5, unit: 'kg' },
    ],
    offers: [
      { id: 'off-4', donor: 'Ravi K.', item: 'Moong Dal', quantity: '10 kg', status: 'accepted', offeredOn: '2026-08-17', message: '' },
      { id: 'off-5', donor: 'Anjali T.', item: 'Moong Dal', quantity: '5 kg', status: 'accepted', offeredOn: '2026-08-18', message: 'Can drop off anytime.' },
    ],
  },
};

const STATUS_CONFIG = {
  active: { label: 'Active', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  under_review: { label: 'Under Review', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  partially_supported: { label: 'Partially Supported', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  fulfilled: { label: 'Fulfilled', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  expired: { label: 'Expired', bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200' },
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
  const pct = Math.round(((item.target - item.remaining) / item.target) * 100);
  return (
    <div className="bg-[#E8E8E2] rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-sm text-[#1F2933]">{item.name}</span>
        <span className="text-xs text-[#64707A]">{item.target - item.remaining} / {item.target} {item.unit}</span>
      </div>
      <div className="w-full bg-slate-300 rounded-full h-2 mb-1.5">
        <div
          className={`h-2 rounded-full transition-all ${item.remaining === 0 ? 'bg-purple-500' : pct > 50 ? 'bg-[#304355]' : 'bg-orange-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-emerald-600 font-semibold">{item.target - item.remaining} {item.unit} covered</span>
        <span className={`font-semibold ${item.remaining > 0 ? 'text-orange-600' : 'text-purple-600'}`}>
          {item.remaining > 0 ? `${item.remaining} ${item.unit} still needed` : 'Fulfilled'}
        </span>
      </div>
    </div>
  );
}

export default function RequirementManagement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeOfferTab, setActiveOfferTab] = useState('all');

  const req = REQUIREMENTS[id] || REQUIREMENTS['req-1'];

  const filteredOffers = activeOfferTab === 'all'
    ? req.offers
    : req.offers.filter((o) => o.status === activeOfferTab);

  const totalTarget = req.items.reduce((a, i) => a + i.target, 0);
  const totalRemaining = req.items.reduce((a, i) => a + i.remaining, 0);
  const overallPct = Math.round(((totalTarget - totalRemaining) / totalTarget) * 100);

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
              <span>{req.location}</span>
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
            <Button variant="secondary" icon={Edit3} size="sm">
              Edit Requirement
            </Button>
          </div>
        </div>

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
                  <p className="text-[#1F2933] font-medium">{new Date(req.submittedOn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <div>
                  <p className="font-semibold uppercase tracking-wider mb-0.5">Expires</p>
                  <p className="text-[#1F2933] font-medium">{new Date(req.expiresOn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <div>
                  <p className="font-semibold uppercase tracking-wider mb-0.5">Beneficiaries</p>
                  <p className="text-[#1F2933] font-medium">{req.beneficiaries}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs font-semibold text-[#64707A] uppercase tracking-wider mb-2">Categories</p>
                <div className="flex flex-wrap gap-2">
                  {req.beneficiaryCategories.map((c) => (
                    <span key={c} className="text-xs bg-[#E8E8E2] text-[#304355] px-2.5 py-1 rounded-full font-medium">{c}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Items Progress */}
            <div className="bg-white rounded-2xl border border-[#304355]/10 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#304355]">Items Progress</h2>
                <span className="text-sm font-semibold text-[#304355]">{overallPct}% overall</span>
              </div>
              <div className="space-y-3">
                {req.items.map((item) => (
                  <ItemProgress key={item.name} item={item} />
                ))}
              </div>
            </div>

            {/* Donor Offers */}
            <div className="bg-white rounded-2xl border border-[#304355]/10 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#304355]">Donor Offers ({req.offers.length})</h2>
              </div>
              {/* Offer Filter Tabs */}
              <div className="flex gap-1 border-b border-slate-200 mb-4">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'pending', label: 'Pending' },
                  { id: 'accepted', label: 'Accepted' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveOfferTab(tab.id)}
                    className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
                      activeOfferTab === tab.id
                        ? 'border-[#304355] text-[#304355]'
                        : 'border-transparent text-[#64707A] hover:text-[#304355]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              {filteredOffers.length === 0 ? (
                <p className="text-sm text-[#64707A] py-4 text-center">No offers in this category.</p>
              ) : (
                <div className="space-y-3">
                  {filteredOffers.map((offer) => (
                    <div key={offer.id} className={`flex items-start justify-between gap-4 p-4 rounded-xl border ${offer.status === 'pending' ? 'border-amber-200 bg-amber-50/30' : 'border-slate-100 bg-slate-50/30'}`}>
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#304355]/10 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-[#304355]" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-[#1F2933]">{offer.donor}</p>
                          <p className="text-xs text-[#64707A]">{offer.quantity} of {offer.item}</p>
                          {offer.message && (
                            <p className="text-xs text-[#64707A] mt-1 italic">"{offer.message}"</p>
                          )}
                          <p className="text-xs text-[#64707A] mt-0.5">
                            {new Date(offer.offeredOn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${offer.status === 'accepted' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                          {offer.status === 'accepted' ? 'Accepted' : 'Pending'}
                        </span>
                        {offer.status === 'pending' && (
                          <Button size="sm" variant="outline">Accept</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Summary Numbers */}
            <div className="bg-white rounded-2xl border border-[#304355]/10 shadow-sm p-5">
              <h3 className="font-bold text-[#304355] mb-4 text-sm uppercase tracking-wider">Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#64707A]">Total need</span>
                  <span className="font-bold text-[#1F2933]">{totalTarget} kg (across items)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64707A]">Covered</span>
                  <span className="font-bold text-emerald-600">{totalTarget - totalRemaining} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64707A]">Still needed</span>
                  <span className={`font-bold ${totalRemaining > 0 ? 'text-orange-600' : 'text-purple-600'}`}>
                    {totalRemaining > 0 ? `${totalRemaining} kg` : 'Fulfilled!'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64707A]">Offers received</span>
                  <span className="font-bold text-[#1F2933]">{req.offers.length}</span>
                </div>
              </div>
            </div>

            {/* Expiry Warning */}
            {req.status === 'active' && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-[#1F2933] mb-0.5">Expiry Reminder</p>
                  <p className="text-xs text-[#64707A]">
                    This requirement expires on <strong>{new Date(req.expiresOn).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>. Contact donors if coordination is still needed.
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
                <Link
                  to={`/requirements/${req.id}`}
                  className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium text-[#1F2933] hover:bg-[#E8E8E2] transition-colors"
                >
                  View Public Page
                  <ChevronRight className="w-4 h-4 text-[#64707A]" />
                </Link>
                <Link
                  to="/requester/dashboard"
                  className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium text-[#1F2933] hover:bg-[#E8E8E2] transition-colors"
                >
                  Back to Dashboard
                  <ChevronRight className="w-4 h-4 text-[#64707A]" />
                </Link>
              </div>
            </div>

            {/* Danger Zone */}
            {req.status !== 'fulfilled' && (
              <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-4">
                <h3 className="font-bold text-sm text-red-600 mb-2">Manage Requirement</h3>
                <p className="text-xs text-[#64707A] mb-3">Removing a requirement is irreversible and will notify existing donors.</p>
                <Button variant="danger" size="sm" icon={Trash2} className="w-full">
                  Remove Requirement
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
