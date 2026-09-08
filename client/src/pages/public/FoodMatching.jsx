import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  MapPin,
  HeartHandshake,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  PackageCheck,
  Info,
  Sparkles,
  PackageOpen,
  Loader2,
  AlertCircle,
  Clock
} from 'lucide-react';
import Button from '../../components/common/Button';
import { requirementService } from '../../services/api';
import useAuth from '../../hooks/useAuth';

const URGENCY_CONFIG = {
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
    label: 'Standard Need',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
};

function mapRequirementToMatch(req) {
  const items = Array.isArray(req.items) ? req.items.filter(Boolean) : [];
  const primaryItem = items[0] || {};
  const urgencyKey = String(req.urgency || 'MEDIUM').toUpperCase();
  const urgencyMeta = URGENCY_CONFIG[urgencyKey] || URGENCY_CONFIG.MEDIUM;
  const remainingQty = primaryItem.quantityRemaining != null ? primaryItem.quantityRemaining : primaryItem.quantity_remaining || 0;
  const unit = primaryItem.unit || 'kg';

  return {
    id: req.id,
    title: req.institutionName || req.beneficiaryDescription || req.title || 'Local Institution',
    requiredItem: primaryItem.name || primaryItem.item_name || 'Food Support',
    category: primaryItem.category || 'Staple Food',
    remainingQty: `${remainingQty} ${unit}`,
    rawRemainingQty: Number(remainingQty),
    district: req.district || 'Maharashtra',
    city: req.city || req.district || '',
    beneficiaries: `${req.beneficiaryCount || req.beneficiary_count || 0} Beneficiaries`,
    urgency: urgencyKey,
    urgencyLabel: urgencyMeta.label,
    urgencyColor: urgencyMeta.color,
    verified: req.status === 'active',
    attributes: [
      primaryItem.category || 'High-nutritional value',
      `District: ${req.district || 'Maharashtra'}`,
      `Beneficiaries: ${req.beneficiaryCount || 0}`
    ],
    matchReason: 'Direct demand logged by verified local institution',
  };
}

export default function FoodMatching() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handlePledgeSupport = (requirementId) => {
    const destination = `/requirements/${requirementId}`;
    if (!isAuthenticated) {
      navigate('/login-required', {
        state: { from: destination, context: 'pledge support for a requirement' },
      });
      return;
    }
    navigate(destination);
  };
  const [searchParams] = useSearchParams();

  const initialItem = searchParams.get('item') || 'Moong Dal';
  const initialQty = searchParams.get('qty') || '20';

  // Form State
  const [foodItem, setFoodItem] = useState(initialItem);
  const [quantity, setQuantity] = useState(initialQty);
  const [unit, setUnit] = useState('kg');
  const [location, setLocation] = useState('All Maharashtra');
  const [activeSort, setActiveSort] = useState('best'); // 'best' | 'urgent'

  // Data states
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Quick suggestions pills
  const quickItems = ['Rice', 'Moong Dal', 'Chana', 'Jowar', 'Bajra', 'Ragi', 'Wheat'];

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    requirementService.getAll({ limit: 100 })
      .then((res) => {
        if (!isMounted) return;
        const rows = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
        setRequirements(rows.map(mapRequirementToMatch));
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('[FoodMatching] Error fetching requirements:', err);
        setError(err.message || 'Failed to load active requirements');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Filtering & Sorting Logic
  const matchingResults = useMemo(() => {
    if (!foodItem.trim()) return requirements;

    const query = foodItem.toLowerCase().trim();

    let results = requirements.filter((req) => {
      const itemMatch = req.requiredItem.toLowerCase().includes(query);
      const catMatch = req.category.toLowerCase().includes(query);
      const titleMatch = req.title.toLowerCase().includes(query);

      // Generalized pulse/grain matching
      const pulseQuery = query.includes('dal') || query.includes('pulse') || query.includes('chana');
      const pulseMatch = pulseQuery && (req.category.toLowerCase().includes('pulse') || req.requiredItem.toLowerCase().includes('dal'));

      const grainQuery = query.includes('rice') || query.includes('grain') || query.includes('wheat') || query.includes('jowar');
      const grainMatch = grainQuery && (req.category.toLowerCase().includes('grain') || req.requiredItem.toLowerCase().includes('rice'));

      return itemMatch || catMatch || titleMatch || pulseMatch || grainMatch;
    });

    if (activeSort === 'urgent') {
      results = [...results].sort((a) => (a.urgency === 'CRITICAL' ? -1 : (a.urgency === 'HIGH' ? 0 : 1)));
    }

    return results;
  }, [requirements, foodItem, activeSort]);

  return (
    <div className="bg-[#E8E8E2] min-h-screen text-[#1F2933] font-sans pb-16">
      <main className="max-w-[1280px] mx-auto px-6 md:px-10 py-10 space-y-8">
        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-[#304355] tracking-tight">
            I Have Food. Where Can It Help?
          </h1>
          <p className="text-sm md:text-base text-[#64707A] max-w-2xl">
            Tell us what you have, and explore active requirements that may need it.
          </p>
        </header>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Input Form (Sticky Bento Card lg:col-span-5) */}
          <section className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#304355]/10 shadow-xs space-y-6 sticky top-24">
            <h2 className="text-xl font-bold text-[#304355] flex items-center gap-2 border-b border-[#304355]/10 pb-4">
              <HeartHandshake className="w-6 h-6 text-[#304355]" /> How I Can Help
            </h2>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
              {/* Item Search */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#1F2933]">
                  What food or item do you have?
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64707A]" />
                  <input
                    type="text"
                    value={foodItem}
                    onChange={(e) => setFoodItem(e.target.value)}
                    placeholder="e.g., Dal, Rice, Vegetables..."
                    className="w-full bg-[#FBF9FA] border border-[#304355]/20 rounded-xl py-3 pl-10 pr-4 text-sm text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#304355]"
                  />
                </div>

                {/* Quick Item Pills */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {quickItems.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setFoodItem(item)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                        foodItem.toLowerCase() === item.toLowerCase()
                          ? 'bg-[#304355] text-white shadow-xs'
                          : 'bg-[#FBF9FA] text-[#64707A] border border-[#304355]/15 hover:bg-[#304355]/10 hover:text-[#304355]'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity & Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#1F2933]">Available Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="1"
                    placeholder="e.g., 20"
                    className="w-full bg-[#FBF9FA] border border-[#304355]/20 rounded-xl p-3 text-sm text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#304355]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#1F2933]">Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-[#FBF9FA] border border-[#304355]/20 rounded-xl p-3 text-sm text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#304355]"
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="liters">Liters (L)</option>
                    <option value="packets">Packets</option>
                    <option value="boxes">Boxes</option>
                  </select>
                </div>
              </div>

              {/* Data Transparency Box */}
              <div className="bg-[#304355]/5 rounded-xl p-4 border border-[#304355]/10 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-[#304355]">
                  <ShieldCheck className="w-4 h-4 text-[#304355]" /> Deterministic Match Engine
                </div>
                <p className="text-[#64707A] leading-relaxed">
                  PoshanSetu matches food offers directly against active, verified institutional requisitions in Maharashtra.
                </p>
              </div>
            </form>
          </section>

          {/* Right Column: Matched Results (lg:col-span-7) */}
          <section className="lg:col-span-7 space-y-6">
            {/* Sorting & Filter Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-4 rounded-2xl border border-[#304355]/10 shadow-xs">
              <div>
                <h3 className="text-base font-bold text-[#304355]">Matching Requirements</h3>
                <p className="text-xs text-[#64707A]">
                  Showing active requirements matching "{foodItem || 'all items'}"
                </p>
              </div>

              <div className="flex bg-[#FBF9FA] p-1 rounded-xl border border-[#304355]/15 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveSort('best')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    activeSort === 'best'
                      ? 'bg-[#304355] text-white shadow-xs'
                      : 'text-[#64707A] hover:text-[#304355]'
                  }`}
                >
                  Best Match
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSort('urgent')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    activeSort === 'urgent'
                      ? 'bg-[#304355] text-white shadow-xs'
                      : 'text-[#64707A] hover:text-[#304355]'
                  }`}
                >
                  Most Urgent
                </button>
              </div>
            </div>

            {/* Results Grid / List */}
            {loading ? (
              <div className="bg-white rounded-2xl border border-[#304355]/10 p-12 text-center space-y-3 shadow-xs">
                <Loader2 className="w-8 h-8 animate-spin text-[#304355] mx-auto" />
                <p className="text-sm font-semibold text-[#304355]">Searching active requisitions in database…</p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-2xl border border-red-200 p-12 text-center space-y-4 shadow-xs">
                <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
                <h4 className="text-lg font-bold text-[#1F2933]">Could not fetch requirements</h4>
                <p className="text-xs text-[#64707A] max-w-sm mx-auto">{error}</p>
              </div>
            ) : matchingResults.length > 0 ? (
              <div className="space-y-4">
                {matchingResults.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white rounded-2xl p-6 border border-[#304355]/10 shadow-xs hover:shadow-md transition space-y-4 group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${req.urgencyColor}`}>
                            {req.urgencyLabel}
                          </span>
                          {req.verified && (
                            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Active Verified
                            </span>
                          )}
                        </div>
                        <h4 className="text-xl font-extrabold text-[#304355] mt-1">{req.title}</h4>
                        <p className="text-xs text-[#64707A] flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#304355]" /> {req.district} • {req.beneficiaries}
                        </p>
                      </div>

                      <div className="bg-[#FBF9FA] px-4 py-2.5 rounded-xl border border-[#304355]/10 text-right sm:text-right">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#64707A] block">
                          Needs {req.requiredItem}
                        </span>
                        <span className="text-xl font-extrabold text-[#304355]">{req.remainingQty}</span>
                      </div>
                    </div>

                    {/* Match Reason Banner */}
                    <div className="bg-[#304355]/5 p-3 rounded-xl text-xs text-[#1F2933] flex items-start gap-2 border border-[#304355]/10">
                      <Sparkles className="w-4 h-4 text-[#304355] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#304355] block">Why this is a match:</span>
                        <span>{req.matchReason}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => handlePledgeSupport(req.id)}
                        className="bg-[#304355] text-white px-6 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#243342] transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Pledge Support for this Requirement</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#304355]/10 p-12 text-center space-y-4 shadow-xs">
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-[#304355] mx-auto">
                  <PackageOpen className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-bold text-[#1F2933]">No matching requirements found</h4>
                <p className="text-xs text-[#64707A] max-w-md mx-auto">
                  There are currently no active requirements matching "{foodItem}". Try searching for another staple such as Rice, Dal, Wheat, or Jowar.
                </p>
                <Button variant="primary" size="sm" onClick={() => setFoodItem('')}>
                  View All Requirements
                </Button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
