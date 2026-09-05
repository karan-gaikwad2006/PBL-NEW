import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { requirementService, institutionService, adminFraudService } from '../../services/api';
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
  FileText,
  Check,
  X,
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
  const { firebaseUser } = useContext(AuthContext);
  const [pendingRequirements, setPendingRequirements] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [institutionQueue, setInstitutionQueue] = useState([]);
  const [instLoading, setInstLoading] = useState(true);
  const [fraudSignals, setFraudSignals] = useState([]);
  const [fraudLoading, setFraudLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) return;
    let cancelled = false;
    async function load() {
      setPendingLoading(true);
      setInstLoading(true);
      setFraudLoading(true);
      try {
        const token = await firebaseUser.getIdToken();
        const [reqRes, instRes, fraudRes] = await Promise.allSettled([
          requirementService.adminGetAll(token, { status: 'under_review', limit: 20 }),
          institutionService.adminGetAll(token, { limit: 20 }),
          adminFraudService.getFraudSignals(token, { status: 'pending', limit: 20 }),
        ]);

        if (!cancelled && reqRes.status === 'fulfilled') {
          setPendingRequirements(reqRes.value.data || []);
        }
        if (!cancelled && instRes.status === 'fulfilled') {
          setInstitutionQueue(instRes.value.data || []);
        }
        if (!cancelled && fraudRes.status === 'fulfilled') {
          setFraudSignals(fraudRes.value.data || []);
        }
      } catch (err) {
        console.error('[AdminDashboard] Failed to load dashboard data:', err.message);
      } finally {
        if (!cancelled) {
          setPendingLoading(false);
          setInstLoading(false);
          setFraudLoading(false);
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, [firebaseUser]);

  const handleResolveSignal = async (signalId, status) => {
    if (!firebaseUser) return;
    try {
      const token = await firebaseUser.getIdToken();
      await adminFraudService.resolveFraudSignal(token, signalId, status);
      setFraudSignals((prev) => prev.filter((s) => s.id !== signalId));
    } catch (err) {
      console.error('[AdminDashboard] Failed to resolve fraud signal:', err.message);
    }
  };

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
          <StatCard icon={AlertTriangle} value={fraudSignals.length} label="Flagged Signals" color="text-red-500" />
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
            <section>
              <h2 className="font-bold text-[#304355] text-lg mb-1 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Review Signals
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  {fraudLoading ? '…' : fraudSignals.length} Pending
                </span>
              </h2>
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mb-4 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>These are review signals only — not confirmed fraud.</strong> They indicate patterns that require human review. Do not take action based on signals alone. A supervisor must investigate and decide.
                </p>
              </div>

              {fraudLoading ? (
                <div className="flex items-center gap-2 text-sm text-[#64707A] py-4">
                  <span className="w-4 h-4 border-2 border-[#304355] border-t-transparent rounded-full animate-spin" />
                  Loading review signals…
                </div>
              ) : fraudSignals.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-slate-300 p-6 text-center">
                  <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-[#64707A]">No active review signals pending</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {fraudSignals.map((item) => (
                    <div
                      key={item.id}
                      className={`bg-white rounded-xl border shadow-sm p-5 ${
                        item.severity === 'critical' || item.severity === 'high' ? 'border-red-200' : 'border-amber-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-start gap-2.5">
                          <AlertTriangle
                            className={`w-5 h-5 shrink-0 mt-0.5 ${
                              item.severity === 'critical' || item.severity === 'high' ? 'text-red-500' : 'text-amber-500'
                            }`}
                          />
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="font-bold text-sm text-[#1F2933] capitalize">
                                {item.signalType?.replace(/_/g, ' ')}
                              </p>
                              <span
                                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                  item.severity === 'critical' || item.severity === 'high'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-amber-100 text-amber-700'
                                }`}
                              >
                                {item.severity}
                              </span>
                            </div>
                            <p className="text-xs text-[#64707A] leading-relaxed mb-2">{item.description}</p>
                            {item.entityName && (
                              <p className="text-xs text-[#304355] font-medium">
                                Target: {item.entityName} {item.district ? `(${item.district})` : ''}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleResolveSignal(item.id, 'resolved')}
                            title="Mark Resolved"
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 text-[#64707A] transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleResolveSignal(item.id, 'dismissed')}
                            title="Dismiss Signal"
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-[#64707A] transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {item.entityType === 'requirement' && (
                        <Link
                          to={`/admin/review/${item.entityId}`}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#304355] hover:underline mt-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Review Target Requirement
                        </Link>
                      )}
                      {item.entityType === 'institution' && (
                        <Link
                          to={`/admin/institution-review/${item.entityId}`}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#304355] hover:underline mt-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Review Target Institution
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Pending Requirements — real DB data */}
            <section>
              <h2 className="font-bold text-[#304355] text-lg mb-4 flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                Requirements Awaiting Review ({pendingLoading ? '…' : pendingRequirements.length})
              </h2>
              {pendingLoading ? (
                <div className="flex items-center gap-2 text-sm text-[#64707A] py-6">
                  <span className="w-4 h-4 border-2 border-[#304355] border-t-transparent rounded-full animate-spin" />
                  Loading pending requirements…
                </div>
              ) : pendingRequirements.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="font-semibold text-[#64707A] text-sm">No requirements pending review</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequirements.map((req) => {
                    const urgency = URGENCY_CONFIG[req.urgency] || URGENCY_CONFIG.medium;
                    return (
                      <div key={req.id} className="bg-white rounded-xl border border-[#304355]/10 shadow-sm p-5 hover:shadow-md transition-shadow">
                        <div className="flex flex-wrap items-start gap-2 mb-2">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${urgency.bg} ${urgency.text} ${urgency.border}`}>
                            {urgency.label}
                          </span>
                        </div>
                        <h3 className="font-bold text-[#304355] text-sm mb-0.5">{req.title}</h3>
                        <p className="text-xs text-[#64707A] mb-1">{req.requesterName}</p>
                        <div className="flex items-center gap-3 text-xs text-[#64707A] mb-3">
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{req.district}</span>
                          <span>{req.beneficiaryCount} beneficiaries</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(req.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                        </div>
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
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Verification Queue */}
            <div className="bg-white rounded-2xl border border-[#304355]/10 shadow-sm p-5">
              <h3 className="font-bold text-[#304355] mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Institution Verification Queue
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-[#304355]">
                  {instLoading ? '…' : institutionQueue.length}
                </span>
              </h3>
              {instLoading ? (
                <div className="flex items-center gap-2 text-xs text-[#64707A] py-3">
                  <span className="w-3.5 h-3.5 border-2 border-[#304355] border-t-transparent rounded-full animate-spin" />
                  Loading institutions…
                </div>
              ) : institutionQueue.length === 0 ? (
                <div className="text-center py-4">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                  <p className="text-xs text-[#64707A]">No institutions in queue</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {institutionQueue.map((inst) => (
                    <div key={inst.id} className="flex items-start justify-between gap-3 py-3">
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <p className="font-semibold text-sm text-[#1F2933]">{inst.name}</p>
                          {inst.verificationStatus === 'verified' && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          )}
                        </div>
                        <p className="text-xs text-[#64707A] capitalize">{inst.type?.replace('_', ' ')} {inst.district ? `· ${inst.district}` : ''}</p>
                        <div className="flex items-center gap-2 text-xs text-[#64707A] mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            inst.verificationStatus === 'verified' ? 'bg-emerald-50 text-emerald-700' :
                            inst.verificationStatus === 'rejected' ? 'bg-red-50 text-red-700' :
                            'bg-amber-50 text-amber-700'
                          }`}>
                            {inst.verificationStatus?.replace('_', ' ')}
                          </span>
                          <span>{inst.documents?.length || 0} doc(s)</span>
                        </div>
                      </div>
                      <Link
                        to={`/admin/institution-review/${inst.id}`}
                        className="text-xs font-semibold text-[#304355] hover:underline shrink-0 mt-1"
                      >
                        Review
                      </Link>
                    </div>
                  ))}
                </div>
              )}
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
