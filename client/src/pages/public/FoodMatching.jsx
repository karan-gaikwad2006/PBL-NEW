import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  MapPin,
  HeartHandshake,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  PackageOpen,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Button from '../../components/common/Button';
import { districtService, matchingService } from '../../services/api';
import useAuth from '../../hooks/useAuth';
import FoodImage from '../../components/common/FoodImage';
import { normalizeFoodName } from '../../utils/foodImageMap';

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

function mapRequirementToMatch(match) {
  const req = match.requirement || match;
  const items = Array.isArray(req.items) ? req.items.filter(Boolean) : [];
  const primaryItem = items[0] || {};
  const urgencyKey = String(req.urgency || 'MEDIUM').toUpperCase();
  const urgencyMeta = URGENCY_CONFIG[urgencyKey] || URGENCY_CONFIG.MEDIUM;
  const remainingQty = primaryItem.quantityRemaining != null ? primaryItem.quantityRemaining : primaryItem.quantity_remaining || 0;
  const unit = primaryItem.unit || 'kg';
  const matchedFoods = [...new Map((match.matchedItems || []).map((item) => [item.requirementItem?.id || item.requirementItem?.name, item.requirementItem])).values()];

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
    matchScore: match.matchScore,
    scoreBreakdown: match.scoreBreakdown,
    matchedItems: match.matchedItems,
    requirementItems: items,
    matchedFoods,
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

  const selectedDistrict = searchParams.get('district') || '';
  const initialFoods = useMemo(() => (searchParams.get('foods') || '').split('|').map((food) => food.trim()).filter(Boolean), [searchParams]);

  // Form State
  const [recommendedFoods, setRecommendedFoods] = useState(initialFoods);
  const [selectedFoods, setSelectedFoods] = useState(() => (
    initialFoods.reduce((selection, food) => ({ ...selection, [normalizeFoodName(food)]: { name: food, quantity: '', unit: 'kg' } }), {})
  ));
  const [otherFood, setOtherFood] = useState('');
  const [districtLoading, setDistrictLoading] = useState(Boolean(selectedDistrict));
  const [districtError, setDistrictError] = useState('');
  const [activeSort, setActiveSort] = useState('best'); // 'best' | 'urgent'

  // Data states
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (!selectedDistrict) return () => { isMounted = false; };
    setDistrictLoading(true);
    districtService.getAll()
      .then((res) => {
        if (!isMounted) return;
        const districts = Array.isArray(res.data) ? res.data : [];
        const district = districts.find((item) => normalizeFoodName(item.name) === normalizeFoodName(selectedDistrict));
        const foods = district?.nutritionAttention?.recommendedFoodCategories || [];
        setRecommendedFoods(foods);
        const initialSelection = initialFoods.reduce((selection, food) => ({ ...selection, [normalizeFoodName(food)]: { name: food, quantity: '', unit: 'kg' } }), {});
        setSelectedFoods(initialSelection);
      })
      .catch((err) => { if (isMounted) setDistrictError(err.message || 'Could not load district recommendations.'); })
      .finally(() => { if (isMounted) setDistrictLoading(false); });

    return () => {
      isMounted = false;
    };
  }, [selectedDistrict, initialFoods]);

  const availableFoods = useMemo(() => [...new Map([...recommendedFoods, ...(otherFood.trim() ? [otherFood.trim()] : [])].map((food) => [normalizeFoodName(food), food])).values()], [recommendedFoods, otherFood]);

  const toggleFood = (food) => {
    const key = normalizeFoodName(food);
    setSelectedFoods((current) => {
      if (current[key]) {
        const next = { ...current };
        delete next[key];
        return next;
      }
      return { ...current, [key]: { name: food, quantity: '', unit: 'kg' } };
    });
  };

  const updateSelectedFood = (food, field, value) => {
    const key = normalizeFoodName(food);
    setSelectedFoods((current) => ({ ...current, [key]: { ...current[key], [field]: value } }));
  };

  const handleFindMatches = async (event) => {
    event.preventDefault();
    const foods = Object.values(selectedFoods);
    if (foods.length === 0 || foods.some((food) => !Number.isFinite(Number(food.quantity)) || Number(food.quantity) <= 0)) {
      setError('Select at least one food and enter a quantity greater than zero for each selected food.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await matchingService.find({ foodItems: foods.map((food) => ({ item: food.name, quantity: Number(food.quantity), unit: food.unit })), maxResults: 100 });
      const rows = Array.isArray(response.data) ? response.data : [];
      const districtRows = selectedDistrict
        ? rows.filter((match) => normalizeFoodName(match.requirement?.district) === normalizeFoodName(selectedDistrict))
        : rows;
      setRequirements(districtRows.map(mapRequirementToMatch));
    } catch (err) {
      setError(err.message || 'Failed to find matching requirements');
      setRequirements([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtering & Sorting Logic
  const matchingResults = useMemo(() => {
    let results = [...requirements];

    if (activeSort === 'urgent') {
      results.sort((first, second) => {
        const urgencyOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        return (urgencyOrder[first.urgency] ?? 4) - (urgencyOrder[second.urgency] ?? 4);
      });
    }

    return results;
  }, [requirements, activeSort]);

  return (
    <div className="bg-[#E8E8E2] min-h-screen text-[#1F2933] font-sans pb-16">
      <main className="max-w-[1280px] mx-auto px-6 md:px-10 py-10 space-y-8">
        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-[#304355] tracking-tight">
            {selectedDistrict ? `Donate Food in ${selectedDistrict}` : 'I Have Food. Where Can It Help?'}
          </h1>
          <p className="text-sm md:text-base text-[#64707A] max-w-2xl">
            Choose the foods you can provide, then find real active requirements that may need them.
          </p>
        </header>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Input Form (Sticky Bento Card lg:col-span-5) */}
          <section className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#304355]/10 shadow-xs space-y-6 sticky top-24">
            <h2 className="text-xl font-bold text-[#304355] flex items-center gap-2 border-b border-[#304355]/10 pb-4">
              <HeartHandshake className="w-6 h-6 text-[#304355]" /> How I Can Help
            </h2>

            <form onSubmit={handleFindMatches} className="space-y-5">
              {selectedDistrict && districtLoading ? <p className="text-sm text-[#64707A]">Loading district recommendations…</p> : null}
              {districtError ? <p className="text-sm text-red-700">{districtError}</p> : null}
              {Object.values(selectedFoods).length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-[#1F2933]">Selected foods and quantities</p>
                  {Object.values(selectedFoods).map((food) => (
                    <div key={food.name} className="grid grid-cols-[1fr_5rem_6rem] items-center gap-2">
                      <span className="text-xs font-semibold text-[#304355]">{food.name}</span>
                      <input type="number" min="1" value={food.quantity} onChange={(event) => updateSelectedFood(food.name, 'quantity', event.target.value)} placeholder="Qty" aria-label={`${food.name} quantity`} className="w-full bg-[#FBF9FA] border border-[#304355]/20 rounded-lg p-2 text-xs" />
                      <select value={food.unit} onChange={(event) => updateSelectedFood(food.name, 'unit', event.target.value)} aria-label={`${food.name} unit`} className="w-full bg-[#FBF9FA] border border-[#304355]/20 rounded-lg p-2 text-xs">
                        <option value="kg">kg</option>
                        <option value="grams">grams</option>
                        <option value="packets">packets</option>
                        <option value="liters">liters</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}

              {/* Recommended food cards */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#1F2933]">Recommended foods for this district</label>
                <div className="grid grid-cols-2 gap-3">
                  {availableFoods.map((food) => {
                    const selected = Boolean(selectedFoods[normalizeFoodName(food)]);
                    return <button key={food} type="button" onClick={() => toggleFood(food)} aria-pressed={selected} className={`text-left overflow-hidden rounded-xl border-2 transition focus:outline-none focus:ring-2 focus:ring-[#304355] ${selected ? 'border-[#304355] bg-[#EEF1EE]' : 'border-[#304355]/10 bg-[#FBF9FA] hover:border-[#304355]/40'}`}><FoodImage foodName={food} className="w-full h-20" /><span className="flex items-center gap-2 p-2 text-xs font-bold text-[#304355]"><span className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] ${selected ? 'border-[#304355] bg-[#304355] text-white' : 'border-[#64707A]'}`}>{selected ? '✓' : ''}</span>{food}</span></button>;
                  })}
                </div>
              </div>

              <div className="space-y-2"><label className="block text-xs font-bold text-[#1F2933]">Have something else?</label><div className="relative"><Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64707A]" /><input type="text" value={otherFood} onChange={(event) => setOtherFood(event.target.value)} placeholder="Search another food item" className="w-full bg-[#FBF9FA] border border-[#304355]/20 rounded-xl py-3 pl-10 pr-4 text-sm text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#304355]" /></div></div>

              {/* Data Transparency Box */}
              <div className="bg-[#304355]/5 rounded-xl p-4 border border-[#304355]/10 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-[#304355]">
                  <ShieldCheck className="w-4 h-4 text-[#304355]" /> Deterministic Match Engine
                </div>
                <p className="text-[#64707A] leading-relaxed">
                  PoshanSetu matches food offers directly against active, verified institutional requisitions in Maharashtra.
                </p>
              </div>
              <button type="submit" disabled={loading || Object.values(selectedFoods).length === 0} className="w-full bg-[#304355] text-white py-3 rounded-xl text-sm font-bold hover:bg-[#243342] transition disabled:opacity-50 disabled:cursor-not-allowed">{loading ? 'Finding matches…' : 'Find Where My Food Can Help'}</button>
            </form>
          </section>

          {/* Right Column: Matched Results (lg:col-span-7) */}
          <section className="lg:col-span-7 space-y-6">
            {/* Sorting & Filter Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-4 rounded-2xl border border-[#304355]/10 shadow-xs">
              <div>
                <h3 className="text-base font-bold text-[#304355]">Matching Requirements</h3>
                  <p className="text-xs text-[#64707A]">
                    {selectedDistrict ? `Showing active requirements in ${selectedDistrict}` : 'Showing active requirements matching your selected foods'}
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
                          Matched food{req.matchedFoods.length > 1 ? 's' : ''}
                        </span>
                        <span className="text-sm font-extrabold text-[#304355]">{req.matchedFoods.length ? req.matchedFoods.map((item) => `${item.name} (${item.quantityRemaining} ${item.unit})`).join(', ') : `${req.requiredItem} (${req.remainingQty})`}</span>
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
                  There are currently no active requirements for this food selection. Try another recommended food or use “Have something else?”.
                </p>
                <Button variant="primary" size="sm" onClick={() => setRequirements([])}>
                  Change Food Selection
                </Button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
