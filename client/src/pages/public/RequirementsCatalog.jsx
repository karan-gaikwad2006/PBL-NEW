import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Clock,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  PackageOpen,
  Handshake,
  PhoneCall,
  Star,
  Info,
  Egg,
  Utensils,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import Button from '../../components/common/Button';
import { requirementService } from '../../services/api';

const URGENCY_STYLES = {
  CRITICAL: {
    label: 'Critical Urgency',
    color: 'bg-red-50 text-red-700 border-red-200',
  },
  HIGH: {
    label: 'High Urgency',
    color: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  MEDIUM: {
    label: 'Medium Urgency',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  LOW: {
    label: 'Low Urgency',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
  },
};

function daysUntil(expiresAt) {
  if (!expiresAt) return null;
  const ms = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

function mapRequirementCard(req) {
  const items = Array.isArray(req.items) ? req.items.filter(Boolean) : [];
  const totalQty = items.reduce((sum, item) => sum + Number(item.quantityRequired || 0), 0);
  const remainingQty = items.reduce((sum, item) => sum + Number(item.quantityRemaining || 0), 0);
  const fulfilledPercent =
    totalQty > 0 ? Math.round(((totalQty - remainingQty) / totalQty) * 100) : 0;
  const primaryItem = items[0];
  const urgencyKey = String(req.urgency || 'medium').toUpperCase();
  const urgencyMeta = URGENCY_STYLES[urgencyKey] || URGENCY_STYLES.MEDIUM;
  const unit = primaryItem?.unit || 'kg';

  return {
    id: req.id,
    title: req.title,
    requester: req.beneficiaryDescription || 'Local requester',
    category: primaryItem?.category || primaryItem?.name || 'Food',
    district: req.district,
    urgency: urgencyKey,
    urgencyLabel: urgencyMeta.label,
    urgencyColor: urgencyMeta.color,
    daysLeft: daysUntil(req.expiresAt),
    totalQty: `${totalQty} ${unit}`,
    remainingQty: `${remainingQty} ${unit}`,
    fulfilledPercent,
    beneficiaries: req.beneficiaryCount,
    verified: req.status === 'active',
  };
}

export default function RequirementsCatalog() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState('catalog');
  const [selectedMethod, setSelectedMethod] = useState('platform');

  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await requirementService.getAll({ limit: 100 });
        const rows = Array.isArray(response.data) ? response.data : [];
        if (!cancelled) setRequirements(rows.map(mapRequirementCard));
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load requirements');
          setRequirements([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const districtOptions = useMemo(() => {
    const names = [...new Set(requirements.map((req) => req.district).filter(Boolean))];
    return names.sort((a, b) => a.localeCompare(b));
  }, [requirements]);

  const filteredRequirements = useMemo(() => {
    return requirements.filter((req) => {
      const matchesSearch =
        searchQuery === '' ||
        req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.requester.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.district.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDistrict =
        districtFilter === 'ALL' || req.district.toUpperCase() === districtFilter;
      const matchesCategory =
        categoryFilter === 'ALL' ||
        String(req.category || '').toUpperCase().includes(categoryFilter);
      const matchesUrgency = urgencyFilter === 'ALL' || req.urgency === urgencyFilter;

      return matchesSearch && matchesDistrict && matchesCategory && matchesUrgency;
    });
  }, [requirements, searchQuery, districtFilter, categoryFilter, urgencyFilter]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setDistrictFilter('ALL');
    setCategoryFilter('ALL');
    setUrgencyFilter('ALL');
  };

  return (
    <div className="bg-[#E8E8E2] min-h-screen text-[#1F2933] font-sans pb-16">
      <main className="max-w-[1280px] mx-auto px-6 md:px-10 py-8 space-y-8">
        <header className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-[#304355] tracking-tight">
                Requirements Catalog
              </h1>
              <p className="text-sm text-[#64707A] mt-1">
                Discover active local food requirements submitted by verified institutions in Maharashtra.
              </p>
            </div>

            <div className="flex bg-white rounded-xl p-1 border border-[#304355]/15 shrink-0 self-start md:self-auto">
              <button
                onClick={() => setActiveTab('catalog')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                  activeTab === 'catalog' ? 'bg-[#304355] text-white shadow-xs' : 'text-[#64707A] hover:text-[#304355]'
                }`}
              >
                Browse Requirements
              </button>
              <button
                onClick={() => setActiveTab('respond')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                  activeTab === 'respond' ? 'bg-[#304355] text-white shadow-xs' : 'text-[#64707A] hover:text-[#304355]'
                }`}
              >
                Response Method Guide
              </button>
            </div>
          </div>
        </header>

        {activeTab === 'catalog' ? (
          <>
            <div className="bg-white rounded-2xl p-6 border border-[#304355]/10 shadow-xs space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64707A]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search keyword or institution..."
                    className="w-full bg-[#FBF9FA] border border-[#304355]/20 rounded-xl py-2.5 pl-10 pr-3 text-xs text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#304355]"
                  />
                </div>

                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  className="w-full bg-[#FBF9FA] border border-[#304355]/20 rounded-xl px-3 py-2.5 text-xs text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#304355]"
                >
                  <option value="ALL">All Districts</option>
                  {districtOptions.map((name) => (
                    <option key={name} value={name.toUpperCase()}>
                      {name}
                    </option>
                  ))}
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full bg-[#FBF9FA] border border-[#304355]/20 rounded-xl px-3 py-2.5 text-xs text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#304355]"
                >
                  <option value="ALL">All Food Categories</option>
                  <option value="PULSES">Pulses & Dal</option>
                  <option value="GRAINS">Grains & Cereals</option>
                  <option value="FORTIFIED FOODS">Fortified Foods</option>
                  <option value="PRODUCE">Fresh Produce</option>
                </select>

                <select
                  value={urgencyFilter}
                  onChange={(e) => setUrgencyFilter(e.target.value)}
                  className="w-full bg-[#FBF9FA] border border-[#304355]/20 rounded-xl px-3 py-2.5 text-xs text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#304355]"
                >
                  <option value="ALL">All Urgencies</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High Urgency</option>
                  <option value="MEDIUM">Medium Urgency</option>
                  <option value="LOW">Low Urgency</option>
                </select>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-[#304355]/10 text-xs text-[#64707A]">
                <span>
                  Showing <strong>{filteredRequirements.length}</strong> requirements matching your criteria
                </span>
                {(searchQuery || districtFilter !== 'ALL' || categoryFilter !== 'ALL' || urgencyFilter !== 'ALL') && (
                  <button
                    onClick={handleClearFilters}
                    className="text-[#304355] font-bold hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Clear Filters
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="bg-white rounded-2xl border border-[#304355]/10 p-12 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#304355] mx-auto" />
                <p className="text-sm text-[#64707A]">Loading requirements…</p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-2xl border border-red-200 p-12 text-center space-y-4">
                <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
                <h3 className="text-lg font-bold text-[#1F2933]">Could not load requirements</h3>
                <p className="text-xs text-[#64707A] max-w-sm mx-auto">{error}</p>
              </div>
            ) : filteredRequirements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRequirements.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white rounded-2xl border border-[#304355]/10 p-6 flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md transition group"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${req.urgencyColor}`}>
                          {req.urgencyLabel}
                        </span>
                        <span className="text-xs text-[#64707A] flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />{' '}
                          {req.daysLeft == null ? '—' : `${req.daysLeft} days left`}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-[#304355] line-clamp-1">{req.title}</h3>
                        <p className="text-xs text-[#64707A] font-medium">{req.requester}</p>
                      </div>

                      <div className="space-y-1 bg-[#FBF9FA] p-3 rounded-xl border border-[#304355]/10">
                        <div className="flex justify-between text-xs font-bold text-[#1F2933]">
                          <span>{req.category}</span>
                          <span>{req.remainingQty} remaining</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-[#304355] h-2 rounded-full"
                            style={{ width: `${req.fulfilledPercent}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] text-[#64707A]">
                          <span>{req.fulfilledPercent}% fulfilled</span>
                          <span>Total: {req.totalQty}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-[#64707A] pt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#304355]" /> {req.district}
                        </span>
                        {req.verified && (
                          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/requirements/${req.id}`)}
                      className="w-full bg-[#304355] text-white py-2.5 rounded-xl font-semibold text-xs hover:bg-[#243342] transition shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#304355]/10 p-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-[#304355] mx-auto">
                  <PackageOpen className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-[#1F2933]">No requirements found</h3>
                <p className="text-xs text-[#64707A] max-w-sm mx-auto">
                  No active requirements matched your filter selections. Try clearing your filters to see all available requests.
                </p>
                <Button variant="primary" size="sm" onClick={handleClearFilters} icon={RefreshCw}>
                  Reset All Filters
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <aside className="lg:col-span-4 order-2 lg:order-1">
              <div className="bg-white border border-[#304355]/15 rounded-2xl p-6 shadow-xs sticky top-[100px] space-y-6">
                <div className="flex items-center gap-2 border-b border-[#304355]/10 pb-4">
                  <Info className="w-5 h-5 text-[#304355]" />
                  <h2 className="text-base font-bold text-[#1F2933]">Requirement Summary</h2>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#64707A] block mb-1">
                      Requester
                    </span>
                    <p className="font-bold text-sm text-[#1F2933]">Ashram Shala Nashik</p>
                  </div>

                  <div className="border-t border-[#304355]/10 pt-4 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#64707A] block mb-1">
                      Core Needs
                    </span>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Utensils className="w-4 h-4 text-[#304355] shrink-0 mt-0.5" />
                        <span className="text-sm font-medium text-[#1F2933]">60kg Rice (Fortified)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Egg className="w-4 h-4 text-[#304355] shrink-0 mt-0.5" />
                        <span className="text-sm font-medium text-[#1F2933]">200 Eggs Weekly</span>
                      </li>
                    </ul>
                  </div>

                  <div className="border-t border-[#304355]/10 pt-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#64707A] block mb-1">
                      Impact
                    </span>
                    <p className="text-xs text-[#1F2933] leading-relaxed">
                      Supporting nutrition for 120 students over the next month.
                    </p>
                  </div>
                </div>
              </div>
            </aside>

            <section className="lg:col-span-8 order-1 lg:order-2 space-y-8">
              <div>
                <span className="text-xs font-bold text-[#64707A] uppercase tracking-wider block mb-1">
                  Step 2 of 3
                </span>
                <h1 className="text-3xl font-extrabold text-[#304355] tracking-tight mb-2">
                  Choose How to Respond
                </h1>
                <p className="text-sm text-[#64707A] leading-relaxed">
                  Select the method you prefer to fulfill this requirement. We recommend using our platform for safe coordination.
                </p>
              </div>

              <div className="space-y-4">
                <label onClick={() => setSelectedMethod('platform')} className="relative block cursor-pointer">
                  <div
                    className={`bg-white border-2 rounded-2xl p-6 md:p-8 shadow-xs transition-all ${
                      selectedMethod === 'platform'
                        ? 'border-[#304355] bg-[#304355]/5 shadow-md'
                        : 'border-[#304355]/20 hover:border-[#304355]/40'
                    }`}
                  >
                    <div className="absolute top-0 right-0 -mt-3 mr-6 bg-emerald-600 text-white font-bold text-[11px] px-3 py-1 rounded-full shadow-xs flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-white" />
                      <span>Recommended</span>
                    </div>

                    <div className="flex items-start gap-4">
                      <input
                        type="radio"
                        name="resp_method"
                        checked={selectedMethod === 'platform'}
                        onChange={() => setSelectedMethod('platform')}
                        className="mt-1.5 accent-[#304355]"
                      />
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2">
                          <Handshake className="w-6 h-6 text-[#304355]" />
                          <h3 className="text-lg font-bold text-[#304355]">Respond Through PoshanSetu</h3>
                        </div>
                        <p className="text-sm text-[#1F2933]">
                          Facilitate the donation entirely through our platform. We will manage the logistics coordination and provide tracking until delivery.
                        </p>
                      </div>
                    </div>
                  </div>
                </label>

                <label onClick={() => setSelectedMethod('direct')} className="relative block cursor-pointer">
                  <div
                    className={`bg-white border-2 rounded-2xl p-6 md:p-8 shadow-xs transition-all ${
                      selectedMethod === 'direct'
                        ? 'border-[#304355] bg-[#304355]/5 shadow-md'
                        : 'border-[#304355]/20 hover:border-[#304355]/40 opacity-85'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="radio"
                        name="resp_method"
                        checked={selectedMethod === 'direct'}
                        onChange={() => setSelectedMethod('direct')}
                        className="mt-1.5 accent-[#304355]"
                      />
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2">
                          <PhoneCall className="w-6 h-6 text-[#1F2933]" />
                          <h3 className="text-lg font-bold text-[#1F2933]">Contact Directly</h3>
                        </div>
                        <p className="text-sm text-[#1F2933]">
                          Request the direct contact details of the requester to arrange the donation yourself.
                        </p>
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              <div className="pt-6 border-t border-[#304355]/10 flex justify-end gap-4">
                <Button variant="outline" onClick={() => setActiveTab('catalog')}>
                  Back to Catalog
                </Button>
                <Button variant="primary" onClick={() => navigate('/login')} icon={ArrowRight} iconPosition="right">
                  Continue to Details
                </Button>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
