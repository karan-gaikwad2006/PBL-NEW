import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  HeartHandshake,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Car,
  PackageCheck,
  Info,
  Sparkles,
  PackageOpen
} from 'lucide-react';
import Button from '../../components/common/Button';

export default function FoodMatching() {
  const navigate = useNavigate();

  // Form State
  const [foodItem, setFoodItem] = useState('Moong Dal');
  const [quantity, setQuantity] = useState(20);
  const [unit, setUnit] = useState('kg');
  const [location, setLocation] = useState('Nashik City');
  const [distance, setDistance] = useState('25 km');
  const [activeSort, setActiveSort] = useState('best'); // 'best' | 'nearest' | 'urgent' | 'expiring'

  // Quick suggestions pills
  const quickItems = ['Rice', 'Moong Dal', 'Chana', 'Jowar', 'Bajra', 'Ragi'];

  // Local Mock Matching Requirements Dataset
  const mockDataset = [
    {
      id: 'req-1',
      title: 'Trimbakeshwar Ashram Shala',
      requiredItem: 'Moong Dal',
      category: 'Pulses',
      remainingQty: '30 kg',
      distanceKm: 12,
      beneficiaries: '150 Children',
      urgency: 'CRITICAL',
      urgencyLabel: 'High Urgency',
      urgencyColor: 'bg-red-50 text-red-700 border-red-200',
      verified: true,
      attributes: ['Protein-dense pulse staple', 'Dietary fiber', 'Essential minerals'],
      matchReason: 'Direct category & item match for requested pulses',
    },
    {
      id: 'req-2',
      title: 'Nashik Community Center',
      requiredItem: 'Rice',
      category: 'Grains',
      remainingQty: '80 kg',
      distanceKm: 5,
      beneficiaries: '90 Families',
      urgency: 'MEDIUM',
      urgencyLabel: 'Medium Urgency',
      urgencyColor: 'bg-[#FFF9C4]/60 text-amber-800 border-amber-200',
      verified: true,
      attributes: ['Energy-dense cereal staple', 'Carbohydrates'],
      matchReason: 'Compatible food group staple for community meals',
    },
    {
      id: 'req-3',
      title: 'Rural School Palghar',
      requiredItem: 'Moong Dal',
      category: 'Pulses',
      remainingQty: '15 kg',
      distanceKm: 45,
      beneficiaries: '110 Students',
      urgency: 'CRITICAL',
      urgencyLabel: 'Critical Urgency',
      urgencyColor: 'bg-red-50 text-red-700 border-red-200',
      verified: true,
      attributes: ['Protein-dense pulse staple', 'Dietary fiber'],
      matchReason: 'High priority pulse requirement',
    },
  ];

  // Filtering & Sorting Logic
  const matchingResults = useMemo(() => {
    if (!foodItem.trim() || Number(quantity) <= 0) return [];

    let results = mockDataset.filter((req) => {
      const q = foodItem.toLowerCase();
      return (
        req.requiredItem.toLowerCase().includes(q) ||
        req.category.toLowerCase().includes(q) ||
        q.includes('dal') ||
        q.includes('pulse')
      );
    });

    if (activeSort === 'nearest') {
      results = [...results].sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (activeSort === 'urgent') {
      results = [...results].sort((a) => (a.urgency === 'CRITICAL' ? -1 : 1));
    }

    return results;
  }, [foodItem, quantity, activeSort]);

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
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                        foodItem.toLowerCase() === item.toLowerCase()
                          ? 'bg-[#304355] text-white shadow-xs'
                          : 'bg-slate-100 text-[#1F2933] hover:bg-slate-200'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity & Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#1F2933]">
                    How much do you have?
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-[#FBF9FA] border border-[#304355]/20 rounded-xl px-3.5 py-2.5 text-sm text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#304355]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#1F2933]">Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-[#FBF9FA] border border-[#304355]/20 rounded-xl px-3.5 py-2.5 text-sm text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#304355]"
                  >
                    <option value="kg">kg</option>
                    <option value="Quintal">Quintal</option>
                    <option value="Tons">Tons</option>
                    <option value="Liters">Liters</option>
                  </select>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#1F2933]">Where are you located?</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64707A]" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-[#FBF9FA] border border-[#304355]/20 rounded-xl py-2.5 pl-10 pr-4 text-sm text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#304355]"
                  />
                </div>
              </div>

              {/* Travel Distance */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#1F2933]">
                  How far are you willing to travel?
                </label>
                <select
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  className="w-full bg-[#FBF9FA] border border-[#304355]/20 rounded-xl px-3.5 py-2.5 text-sm text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#304355]"
                >
                  <option value="5 km">5 km</option>
                  <option value="10 km">10 km</option>
                  <option value="25 km">25 km</option>
                  <option value="No Preference">No Preference</option>
                </select>
              </div>

              <Button
                variant="primary"
                type="submit"
                className="w-full py-3.5 text-sm font-bold shadow-xs flex items-center justify-center gap-2"
                icon={Search}
              >
                Find Matching Needs
              </Button>
            </form>
          </section>

          {/* Right Column: Results Section (lg:col-span-7) */}
          <section className="lg:col-span-7 space-y-6">
            {/* Header Bar & Sorting Tabs */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#304355]/10 pb-4">
              <h2 className="text-xl font-bold text-[#304355]">Matching Current Requirements</h2>

              <div className="flex gap-4 text-xs font-semibold">
                <button
                  onClick={() => setActiveSort('best')}
                  className={`pb-1 border-b-2 transition ${
                    activeSort === 'best'
                      ? 'border-[#304355] text-[#304355] font-bold'
                      : 'border-transparent text-[#64707A] hover:text-[#304355]'
                  }`}
                >
                  Best Match
                </button>
                <button
                  onClick={() => setActiveSort('nearest')}
                  className={`pb-1 border-b-2 transition ${
                    activeSort === 'nearest'
                      ? 'border-[#304355] text-[#304355] font-bold'
                      : 'border-transparent text-[#64707A] hover:text-[#304355]'
                  }`}
                >
                  Nearest
                </button>
                <button
                  onClick={() => setActiveSort('urgent')}
                  className={`pb-1 border-b-2 transition ${
                    activeSort === 'urgent'
                      ? 'border-[#304355] text-[#304355] font-bold'
                      : 'border-transparent text-[#64707A] hover:text-[#304355]'
                  }`}
                >
                  Most Urgent
                </button>
              </div>
            </div>

            {/* Matching Results List */}
            {matchingResults.length > 0 ? (
              <div className="space-y-6">
                {matchingResults.map((result, idx) => (
                  <article
                    key={result.id}
                    className={`bg-white rounded-2xl p-6 border border-[#304355]/10 shadow-xs relative overflow-hidden space-y-5 ${
                      idx === 0 ? 'ring-2 ring-[#304355]/20' : ''
                    }`}
                  >
                    {idx === 0 && <div className="absolute top-0 left-0 w-1.5 h-full bg-[#D32F2F]" />}

                    {/* Top Row: Title & Badges */}
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold border ${result.urgencyColor} mb-2`}>
                          <AlertTriangle className="w-3.5 h-3.5" /> {result.urgencyLabel}
                        </span>
                        <h3 className="text-xl font-extrabold text-[#304355]">{result.title}</h3>
                      </div>
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" /> High Confidence
                      </span>
                    </div>

                    {/* Quick Metric Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div className="bg-[#FBF9FA] p-3 rounded-xl border border-[#304355]/10 space-y-0.5">
                        <span className="text-[#64707A] block">Required Item</span>
                        <span className="font-bold text-[#1F2933]">{result.requiredItem}</span>
                      </div>
                      <div className="bg-[#FBF9FA] p-3 rounded-xl border border-[#304355]/10 space-y-0.5">
                        <span className="text-[#64707A] block">Remaining Need</span>
                        <span className="font-bold text-[#1F2933]">{result.remainingQty}</span>
                      </div>
                      <div className="bg-[#FBF9FA] p-3 rounded-xl border border-[#304355]/10 space-y-0.5">
                        <span className="text-[#64707A] block">Distance</span>
                        <span className="font-bold text-[#1F2933] flex items-center gap-1">
                          <Car className="w-3.5 h-3.5 text-[#64707A]" /> {result.distanceKm} km
                        </span>
                      </div>
                      <div className="bg-[#FBF9FA] p-3 rounded-xl border border-[#304355]/10 space-y-0.5">
                        <span className="text-[#64707A] block">Beneficiaries</span>
                        <span className="font-bold text-[#1F2933]">{result.beneficiaries}</span>
                      </div>
                    </div>

                    {/* Nutritional Attributes & Match Reason Box (Data Integrity Rule) */}
                    <div className="bg-[#304355]/5 rounded-xl p-4 border border-[#304355]/10 space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 text-[#304355] font-bold">
                        <Sparkles className="w-4 h-4" /> Match Attributes & Context
                      </div>
                      <p className="text-[#64707A] leading-relaxed">
                        <strong className="text-[#1F2933]">{result.category}:</strong> {result.attributes.join(' • ')}.
                      </p>
                      <p className="text-xs text-[#304355] font-medium flex items-center gap-1">
                        <Info className="w-3.5 h-3.5 shrink-0" /> {result.matchReason}
                      </p>
                    </div>

                    {/* Action */}
                    <div className="flex justify-end pt-1">
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/requirements/${result.id}`)}
                        icon={ArrowRight}
                        iconPosition="right"
                      >
                        View Requirement
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              /* Empty / No Match State */
              <div className="bg-white rounded-2xl border border-[#304355]/10 p-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-[#304355] mx-auto">
                  <PackageOpen className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-[#1F2933]">No matching requirements found</h3>
                <p className="text-xs text-[#64707A] max-w-sm mx-auto">
                  We couldn't find active requests matching "{foodItem}". Try searching for standard staples like Rice, Pulses, or Grains.
                </p>
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setFoodItem('Moong Dal');
                      setQuantity(20);
                    }}
                  >
                    Reset Search to Moong Dal
                  </Button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
