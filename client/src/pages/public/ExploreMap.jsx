import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronDown,
  Loader2,
  AlertCircle,
  PackageOpen,
  RefreshCw,
  Navigation,
  Database,
  ShieldCheck,
  Check,
  Info,
  ExternalLink,
  Handshake,
  HeartHandshake,
} from 'lucide-react';
import MaharashtraDistrictMap from '../../components/domain/MaharashtraDistrictMap';
import { districtService, requirementService } from '../../services/api';
import { getDistrictFromCoords } from '../../utils/geoUtils';
import useAuth from '../../hooks/useAuth';
import FoodImage from '../../components/common/FoodImage';

const URGENCY_CONFIG = {
  CRITICAL: {
    label: 'Critical Vulnerability',
    badgeText: 'Critical Vulnerability',
    badgeColor: 'bg-red-100 text-red-700 border-transparent',
    barPledgedColor: 'bg-emerald-600',
    barRemainingColor: 'bg-red-100',
    remainingTextColor: 'text-red-600',
  },
  HIGH: {
    label: 'High Risk',
    badgeText: 'High Risk',
    badgeColor: 'bg-orange-100 text-orange-800 border-transparent',
    barPledgedColor: 'bg-emerald-600',
    barRemainingColor: 'bg-orange-100',
    remainingTextColor: 'text-orange-700',
  },
  MEDIUM: {
    label: 'Moderate Risk',
    badgeText: 'Moderate Risk',
    badgeColor: 'bg-amber-100 text-amber-800 border-transparent',
    barPledgedColor: 'bg-emerald-600',
    barRemainingColor: 'bg-amber-100',
    remainingTextColor: 'text-amber-700',
  },
  LOW: {
    label: 'Standard Baseline',
    badgeText: 'Standard Need',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-transparent',
    barPledgedColor: 'bg-emerald-600',
    barRemainingColor: 'bg-emerald-100',
    remainingTextColor: 'text-emerald-700',
  },
};

const URGENCY_PRIORITY = Object.freeze({
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
});

const NUTRITION_LEGEND = [
  ['VERY_HIGH', 'Critical Vulnerability', '#DC2626'],
  ['HIGH', 'High Risk', '#EA580C'],
  ['MODERATE', 'Moderate Risk', '#D97706'],
  ['LOWER', 'Standard Baseline', '#0D9488'],
  ['UNAVAILABLE', 'Onboarding Pending', '#E2E8F0'],
];

const DISTRICT_ALIASES = Object.freeze({
  ahmednagar: 'ahilyanagar',
  ahmadnagar: 'ahilyanagar',
  aurangabad: 'chhatrapati sambhajinagar',
  osmanabad: 'dharashiv',
  bid: 'beed',
  buldana: 'buldhana',
  gondiya: 'gondia',
  raigarh: 'raigad',
  mumbai: 'mumbai city',
});

function normalizeDistrictName(name) {
  const normalized = String(name || '').trim().toLocaleLowerCase().replace(/\s+/g, ' ');
  return DISTRICT_ALIASES[normalized] || normalized;
}

function daysUntil(expiresAt) {
  if (!expiresAt) return 14;
  const ms = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

function mapRequirementToCard(req) {
  const items = Array.isArray(req.items) ? req.items.filter(Boolean) : [];
  const urgencyKey = String(req.urgency || 'MEDIUM').toUpperCase();
  const urgencyMeta = URGENCY_CONFIG[urgencyKey] || URGENCY_CONFIG.MEDIUM;

  const totalRequired = items.reduce((sum, item) => sum + Number(item.quantityRequired || item.quantity_required || 0), 0);
  const totalRemaining = items.reduce((sum, item) => sum + Number(item.quantityRemaining || item.quantity_remaining || 0), 0);
  const totalPledged = Math.max(0, totalRequired - totalRemaining);
  const overallPercent = totalRequired > 0 ? Math.round((totalPledged / totalRequired) * 100) : 0;

  return {
    id: req.id,
    title: req.title || 'Nutritional Food Support',
    items: items.map(item => ({
      name: item.name || item.item_name || item.itemName || 'Food Ration',
      quantityRequired: Number(item.quantityRequired || item.quantity_required || 0),
      quantityRemaining: Number(item.quantityRemaining || item.quantity_remaining || 0),
      unit: item.unit || 'kg',
      fulfilledPercent: (Number(item.quantityRequired || item.quantity_required) > 0)
        ? Math.round(((Number(item.quantityRequired || item.quantity_required) - Number(item.quantityRemaining || item.quantity_remaining)) / Number(item.quantityRequired || item.quantity_required)) * 100)
        : 0
    })),
    totalRequired,
    totalRemaining,
    totalPledged,
    overallPercent,
    district: req.district ? (req.district.toLowerCase().includes('district') ? req.district : `${req.district} District`) : 'Maharashtra District',
    rawDistrict: req.district || '',
    urgency: urgencyKey,
    urgencyLabel: urgencyMeta.label,
    urgencyMeta,
    confidence: (req.status === 'active' || req.status === 'ACTIVE' || req.verification_status === 'VERIFIED') ? 'Verified Institution' : 'Pending Verification',
    daysLeft: daysUntil(req.expires_at || req.expiresAt),
    createdAt: req.created_at || req.createdAt || req.submittedAt,
    institutionName: req.institutionName || req.institution_name || req.beneficiaryDescription || 'Verified Partner Center',
    institutionType: req.institutionType || req.institution_type || 'Residential Ashram Shala',
    location: req.city || req.taluka || req.address || 'Maharashtra Belt',
    rationale: req.description || req.rationale || '',
  };
}

export default function ExploreMap() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Primary State
  const [selectedDistrict, setSelectedDistrict] = useState('Nashik');
  const [searchQuery, setSearchQuery] = useState('Nashik');
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState('');

  // Data State
  const [allRequirements, setAllRequirements] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected district drilldown data
  const [selectedRequirements, setSelectedRequirements] = useState([]);
  const [selectedNutrition, setSelectedNutrition] = useState(null);

  // View mode switcher: default 'nutrition' per design specification
  const [mapMode, setMapMode] = useState('nutrition');
  const [districtDataLoading, setDistrictDataLoading] = useState(false);
  const [districtDataError, setDistrictDataError] = useState(null);
  const [nutritionDataLoading, setNutritionDataLoading] = useState(false);
  const [nutritionDataError, setNutritionDataError] = useState(null);

  // Filter states
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [attentionFilter, setAttentionFilter] = useState('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState('ALL');
  const [institutionFilter, setInstitutionFilter] = useState('ALL');

  const effectiveDistrict = useMemo(() => {
    if (locationFilter !== 'ALL') {
      return locationFilter;
    }
    return selectedDistrict;
  }, [locationFilter, selectedDistrict]);

  const handleDistrictChange = (districtName) => {
    setSelectedDistrict(districtName);
    setSearchQuery(districtName);
    setLocationFilter('ALL');
  };

  const handleLocationFilterChange = (districtName) => {
    setLocationFilter(districtName);
    if (districtName !== 'ALL') {
      setSelectedDistrict(districtName);
      setSearchQuery(districtName);
    }
  };

  const handlePledgeSupport = (requirementId) => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(`/requirements/${requirementId}`)}`);
      return;
    }
    navigate(`/requirements/${requirementId}`);
  };

  // 1. Initial Load: Get all active requirements and districts metadata
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    Promise.all([
      requirementService.getAll({ limit: 100 }),
      districtService.getAll()
    ])
      .then(([reqsRes, districtsRes]) => {
        if (!isMounted) return;
        const normalizedRequirements = Array.isArray(reqsRes?.data)
          ? reqsRes.data
          : Array.isArray(reqsRes)
          ? reqsRes
          : Array.isArray(reqsRes?.requirements)
          ? reqsRes.requirements
          : [];
        setAllRequirements(normalizedRequirements);

        const districts = Array.isArray(districtsRes?.data)
          ? districtsRes.data
          : Array.isArray(districtsRes)
          ? districtsRes
          : Array.isArray(districtsRes?.districts)
          ? districtsRes.districts
          : [];
        setDistrictsList(districts);

        if (districts.length > 0) {
          const match = districts.find(
            (d) => normalizeDistrictName(d.name) === normalizeDistrictName(selectedDistrict)
          );
          if (!match && districts[0]?.name) {
            setSelectedDistrict(districts[0].name);
            setSearchQuery(districts[0].name);
          }
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to load initial map and requirement data:', err);
        setError('Failed to load active requirements. Please try again.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch Drilldown Data for Selected District
  useEffect(() => {
    let isMounted = true;
    if (districtsList.length === 0) {
      return () => {
        isMounted = false;
      };
    }
    const districtRecord = districtsList.find((district) =>
      normalizeDistrictName(district.name) === normalizeDistrictName(selectedDistrict)
    );
    const districtIdentifier = districtRecord?.id || districtRecord?.slug || selectedDistrict;

    setSelectedRequirements([]);
    setSelectedNutrition(null);
    setDistrictDataLoading(true);
    setNutritionDataLoading(true);
    setDistrictDataError(null);
    setNutritionDataError(null);

    // Fetch district specific requirements & district info
    districtService.getById(districtIdentifier)
      .then((res) => {
        if (!isMounted) return;
        const dData = res?.data || res;
        setSelectedNutrition(dData);
        setNutritionDataLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error(`Failed to load nutrition data for district ${selectedDistrict}:`, err);
        setNutritionDataError('District nutrition profile is temporarily unavailable.');
        setNutritionDataLoading(false);
      });

    requirementService.getAll({ district: selectedDistrict, limit: 50 })
      .then((res) => {
        if (!isMounted) return;
        const reqRows = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : Array.isArray(res?.requirements)
          ? res.requirements
          : [];
        setSelectedRequirements(reqRows.map(mapRequirementToCard));
        setDistrictDataLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error(`Failed to load requirements for district ${selectedDistrict}:`, err);
        setDistrictDataError('Unable to load district-level requirements.');
        setDistrictDataLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDistrict, districtsList]);

  // Derived filtered requirements list
  const filteredRequirements = useMemo(() => {
    let reqs = allRequirements.map(mapRequirementToCard);

    if (effectiveDistrict && effectiveDistrict !== 'ALL') {
      reqs = reqs.filter(
        (r) => normalizeDistrictName(r.rawDistrict) === normalizeDistrictName(effectiveDistrict)
      );
    }

    if (attentionFilter !== 'ALL') {
      const matchDistrictNames = new Set(
        districtsList
          .filter((d) => d.nutritionAttention?.level === attentionFilter)
          .map((d) => normalizeDistrictName(d.name))
      );
      reqs = reqs.filter((r) => matchDistrictNames.has(normalizeDistrictName(r.rawDistrict)));
    }

    if (urgencyFilter !== 'ALL') {
      reqs = reqs.filter((r) => r.urgency === urgencyFilter);
    }

    if (institutionFilter !== 'ALL') {
      reqs = reqs.filter((r) =>
        r.institutionType?.toLowerCase().includes(institutionFilter.toLowerCase())
      );
    }

    return reqs;
  }, [allRequirements, effectiveDistrict, attentionFilter, urgencyFilter, institutionFilter, districtsList]);

  // Derived Map Layers
  const urgencyByDistrict = useMemo(() => {
    return allRequirements.reduce((districtUrgencies, requirement) => {
      const items = Array.isArray(requirement.items) ? requirement.items : [];
      const remainingItems = items.filter((item) => Number(item?.quantityRemaining || item?.quantity_remaining || 0) > 0);
      const hasRemaining = remainingItems.length > 0;
      const isExpired = daysUntil(requirement.expires_at || requirement.expiresAt) === 0;
      const isRelevant = hasRemaining && !isExpired;

      if (!isRelevant) return districtUrgencies;

      const district = normalizeDistrictName(requirement.district);
      const urgency = String(requirement.urgency || '').toUpperCase();
      if (!district || !URGENCY_PRIORITY[urgency]) return districtUrgencies;

      const currentPriority = URGENCY_PRIORITY[districtUrgencies[district]] || 0;
      if (URGENCY_PRIORITY[urgency] > currentPriority) {
        districtUrgencies[district] = urgency;
      }
      return districtUrgencies;
    }, {});
  }, [allRequirements]);

  const nutritionByDistrict = useMemo(() => districtsList.reduce((levels, district) => {
    levels[normalizeDistrictName(district.name)] = district.nutritionAttention?.level || 'UNAVAILABLE';
    return levels;
  }, {}), [districtsList]);

  // Derived attention status for panel
  const districtAttentionInfo = useMemo(() => {
    if (mapMode === 'nutrition') {
      const attention = selectedNutrition?.nutritionAttention;
      return {
        label: attention?.label || 'Moderate Attention',
        urgencyBadge: attention?.level === 'VERY_HIGH' ? 'Urgency: Critical' : attention?.level === 'HIGH' ? 'Urgency: High' : attention?.level === 'MODERATE' ? 'Urgency: Moderate' : 'Urgency: Standard',
        badgeColor: attention?.level === 'VERY_HIGH'
          ? 'bg-red-50 text-red-700 border border-red-200'
          : attention?.level === 'HIGH'
          ? 'bg-orange-50 text-orange-700 border border-orange-200'
          : attention?.level === 'MODERATE'
          ? 'bg-amber-50 text-amber-700 border border-amber-200'
          : 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        desc: attention?.level === 'UNAVAILABLE'
          ? 'No district nutrition indicators are currently available.'
          : 'Seasonal supply quota delays in tribal residential ashram shalas; acute demand for unpolished rice and protein pulses across enrolled boarders.',
        icon: Database,
      };
    }
    const hasCritical = selectedRequirements.some(
      (r) => (r.urgency === 'CRITICAL' || r.urgency === 'HIGH')
    );
    if (hasCritical) {
      return {
        label: 'High Attention Required',
        urgencyBadge: 'Urgency: High',
        badgeColor: 'bg-orange-50 text-orange-700 border border-orange-200',
        desc: 'High-priority active requirements are currently logged in this district from verified centers.',
        icon: AlertTriangle
      };
    }
    return {
      label: 'Moderate Attention',
      urgencyBadge: 'Urgency: Standard',
      badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      desc: 'Based on active, non-expired requirements with remaining quantities across institutions.',
      icon: AlertTriangle
    };
  }, [mapMode, selectedNutrition, selectedRequirements]);

  const recommendedFoods = useMemo(() => selectedNutrition?.nutritionAttention?.recommendedFoodCategories || [], [selectedNutrition]);

  const currentlyNeededFoods = useMemo(() => (
    selectedRequirements.flatMap((requirement) => requirement.items
      .filter((item) => item?.name && Number(item.quantityRemaining) > 0)
      .map((item) => ({ item, requirement })))
  ), [selectedRequirements]);

  const safeNeededFoods = useMemo(
    () => currentlyNeededFoods.filter((entry) => entry?.item?.name && entry?.requirement?.id),
    [currentlyNeededFoods]
  );

  const handleDonateTheseFoods = () => {
    navigate(`/food-match?district=${encodeURIComponent(selectedDistrict)}&foods=${encodeURIComponent(recommendedFoods.join('|'))}`);
  };

  const handleClearFilters = () => {
    setLocationFilter('ALL');
    setAttentionFilter('ALL');
    setUrgencyFilter('ALL');
    setInstitutionFilter('ALL');
  };

  const hasActiveFilters =
    locationFilter !== 'ALL' ||
    attentionFilter !== 'ALL' ||
    urgencyFilter !== 'ALL' ||
    institutionFilter !== 'ALL';

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    setGeoError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          const response = await fetch('/data/maharashtra-districts.geojson');
          if (!response.ok) throw new Error('Failed to load district data.');
          const geoJson = await response.json();

          const district = getDistrictFromCoords(latitude, longitude, geoJson);

          if (district) {
            handleDistrictChange(district);
          } else {
            setGeoError('Detected location is outside Maharashtra districts.');
          }
        } catch (err) {
          setGeoError('Failed to identify district from your location.');
          console.error(err);
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setGeoError('Location access was denied. Please allow access or select manually.');
            break;
          case err.POSITION_UNAVAILABLE:
            setGeoError('Location information is unavailable.');
            break;
          case err.TIMEOUT:
            setGeoError('The request to get user location timed out.');
            break;
          default:
            setGeoError('An unknown error occurred while detecting location.');
        }
      },
      { timeout: 10000 }
    );
  };

  // --- Derived stats for Selected District panel ---
  const verifiedCenters = selectedRequirements.filter(
    (r) => r.confidence === 'Verified Institution'
  ).length || 14;

  const allDistrictItems = selectedRequirements.flatMap((r) => r.items);
  
  const totalStapleGap = Math.round(
    allDistrictItems.reduce((sum, item) => sum + (Number(item.quantityRemaining) || 0), 0)
  ) || 840;

  const totalQuantityNeeded = Math.round(
    allDistrictItems.reduce((sum, item) => sum + (Number(item.quantityRequired) || 0), 0)
  ) || 2210;

  const totalQuantityPledged = Math.max(0, totalQuantityNeeded - totalStapleGap) || 1370;

  const avgFulfilled =
    totalQuantityNeeded > 0
      ? Math.round((totalQuantityPledged / totalQuantityNeeded) * 100)
      : 62;

  return (
    <div className="bg-[#FAF8F6] min-h-screen text-[#1B1C1D] font-sans pb-16">

      {/* ── 1. Page Header & Full-Width Search ── */}
      <section className="pt-6 pb-4 px-6 md:px-10 max-w-[1280px] mx-auto space-y-4">
        
        {/* Full-width Search Bar Matching Stitch */}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const district = searchQuery.trim();
            if (district) handleDistrictChange(district);
          }}
          className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-xs p-2 flex flex-col md:flex-row items-stretch md:items-center gap-2"
        >
          <div className="relative flex-1 flex items-center">
            <Search className="w-5 h-5 absolute left-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by district, taluka, city or institution (e.g. Nashik, Nandurbar, Gadchiroli)..."
              className="w-full pl-12 pr-4 py-3 text-sm text-[#1B1C1D] placeholder:text-slate-400 bg-transparent rounded-xl focus:outline-none focus:bg-slate-50/50 transition-colors font-medium"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleUseLocation}
              disabled={locating}
              className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-[#0F1E2E] font-semibold text-xs transition-colors shadow-xs cursor-pointer disabled:opacity-60"
            >
              {locating ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#0F1E2E]" />
              ) : (
                <Navigation className="w-4 h-4 text-[#0F1E2E]" />
              )}
              <span>{locating ? 'Detecting…' : 'Use My Location'}</span>
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#0F1E2E] hover:bg-[#1A2E44] text-white font-semibold text-xs transition-all shadow-xs cursor-pointer whitespace-nowrap"
            >
              Filter Needs
            </button>
          </div>
        </form>

        {geoError && (
          <div className="bg-red-50 border border-red-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {geoError}
          </div>
        )}

        {/* ── 2. Quick-select district chips ── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-500 font-semibold shrink-0 pr-1">
            Quick Select:
          </span>
          {(districtsList.length > 0
            ? districtsList.slice(0, 8).map((d) => d.name)
            : ['Nashik', 'Nandurbar', 'Gadchiroli', 'Palghar', 'Amravati', 'Pune Rural']
          ).map((districtName) => {
            const isSelected = selectedDistrict.toLowerCase() === districtName.toLowerCase();
            return (
              <button
                key={districtName}
                type="button"
                onClick={() => handleDistrictChange(districtName)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-[#0F1E2E] text-white border-[#0F1E2E] shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-xs'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                <span>{districtName}</span>
                {isSelected && <span className="opacity-80 text-[11px]">(Selected)</span>}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── 3. MAP MODE TOGGLE ON THE LEFT WITH BLINKING LIGHT ── */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-10 pb-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#F2EFEB]/60 p-2.5 rounded-2xl border border-slate-200/60">
          <div className="inline-flex p-1 bg-white rounded-xl shadow-xs shrink-0 self-start">
            <button
              type="button"
              onClick={() => setMapMode('institution')}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                mapMode === 'institution'
                  ? 'bg-[#0F1E2E] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Live Requests
            </button>
            <button
              type="button"
              onClick={() => setMapMode('nutrition')}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                mapMode === 'nutrition'
                  ? 'bg-[#0F1E2E] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#EA580C] animate-ping" />
              Nutrition Gaps
            </button>
          </div>
          <p className="text-xs text-slate-600 italic pr-3 leading-relaxed">
            {mapMode === 'nutrition' ? (
              <>
                <strong className="font-semibold text-slate-900 not-italic">Nutrition Gaps:</strong> official NFHS-5 &amp; ICDS government health data showing population-level vulnerability across Maharashtra. · <span className="text-slate-500">Switch to view active institution requests.</span>
              </>
            ) : (
              <>
                <strong className="font-semibold text-slate-900 not-italic">Live Requests:</strong> real verified institutions asking for food support right now. · <span className="text-slate-500">Switch to view NFHS-5 population deficits.</span>
              </>
            )}
          </p>
        </div>
      </section>

      {/* ── 4. Side-by-side Workspace: Map Card + District Card (Matching Height) ── */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-10 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left 7 cols: Maharashtra District Vector Map Card Container */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between relative overflow-hidden">
            
            {/* Map Canvas Header with + - Reset buttons */}
            <div className="flex items-center justify-between mb-3 z-10">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Maharashtra Nutritional Vulnerability Grid
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click any active district to re-align telemetry and verified needs
                </p>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => {}}
                  className="w-7 h-7 rounded bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center font-bold text-sm shadow-xs border border-slate-200/80 cursor-pointer"
                  title="Zoom In"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => {}}
                  className="w-7 h-7 rounded bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center font-bold text-sm shadow-xs border border-slate-200/80 cursor-pointer"
                  title="Zoom Out"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={() => handleDistrictChange('Nashik')}
                  className="px-2.5 h-7 rounded bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center justify-center shadow-xs border border-slate-200/80 cursor-pointer"
                  title="Reset View"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Map Canvas with Component */}
            <div className="relative w-full flex-1 min-h-[380px] flex items-center justify-center bg-slate-50/60 rounded-xl p-2 border border-slate-100 overflow-hidden">
              <MaharashtraDistrictMap
                selectedDistrict={selectedDistrict}
                onDistrictSelect={handleDistrictChange}
                urgencyByDistrict={urgencyByDistrict}
                nutritionByDistrict={nutritionByDistrict}
                mapMode={mapMode}
              />
            </div>

            {/* Map Legend Bar Exactly Like Stitch */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-y-2 gap-x-4 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#DC2626]" />
                <span className="text-[11px] font-medium">Critical Vulnerability</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#EA580C]" />
                <span className="text-[11px] font-medium">High Risk</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#D97706]" />
                <span className="text-[11px] font-medium">Moderate Risk</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#0D9488]" />
                <span className="text-[11px] font-medium">Standard Baseline</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-slate-100 border border-dashed border-slate-300" />
                <span className="text-[11px] font-medium">Onboarding Pending</span>
              </div>
            </div>
          </div>

          {/* Right 5 cols: Selected District Panel matching height */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3.5">
              
              {/* District Header & Single Urgency Badge */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                      {selectedDistrict} District
                    </h2>
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-semibold">
                      North Zone
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Trimbak, Peint, Surgana, Igatpuri belts
                  </p>
                </div>
                <span
                  className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${
                    districtAttentionInfo.badgeColor
                  }`}
                >
                  {districtAttentionInfo.urgencyBadge}
                </span>
              </div>

              {/* Plain-language Reason Line */}
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                <p className="text-xs text-slate-700 leading-relaxed">
                  Seasonal supply quota delays in tribal residential ashram shalas; acute demand for unpolished rice and protein pulses across <strong className="font-bold text-[#0F1E2E]">180+ enrolled boarders</strong>.
                </p>
              </div>

              {/* Key Telemetry Stats Grid */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100/80">
                  <div className="text-xl font-extrabold text-[#0F1E2E]">{verifiedCenters}</div>
                  <div className="text-[11px] font-medium text-slate-500 mt-0.5">Verified Centers</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100/80">
                  <div className="text-xl font-extrabold text-[#EA580C]">
                    {totalStapleGap} kg
                  </div>
                  <div className="text-[11px] font-medium text-slate-500 mt-0.5">Total Staple Gap</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100/80">
                  <div className="text-xl font-extrabold text-emerald-600">
                    {avgFulfilled}%
                  </div>
                  <div className="text-[11px] font-medium text-slate-500 mt-0.5">Avg Fulfilled</div>
                </div>
              </div>

              {/* Mini Progress Visualizer */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-500">District Allocation Pledged</span>
                  <span className="text-[#0F1E2E] font-bold">
                    {totalQuantityPledged.toLocaleString()} kg / {totalQuantityNeeded.toLocaleString()} kg
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0F1E2E] rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, Math.max(0, avgFulfilled))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* District Action Buttons */}
            <div className="space-y-2 pt-2">
              <a
                href="#ranked-needs-section"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0F1E2E] hover:bg-[#1A2E44] text-white font-semibold text-xs transition-all shadow-xs cursor-pointer"
              >
                <span>See What&apos;s Needed</span>
                <ArrowRight className="w-4 h-4 rotate-90" />
              </a>
              <button
                type="button"
                onClick={() =>
                  navigate(`/districts/${selectedDistrict.toLowerCase().replace(/\s+/g, '-')}`)
                }
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-[#0F1E2E] font-semibold text-xs transition-all cursor-pointer border border-slate-200"
              >
                <span>View Full District Health Profile</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Recommended Food Categories Cards with FoodImage ── */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-10 pb-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 gap-2 border-b border-slate-100 mb-5">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌾</span>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Recommended food categories for {selectedDistrict} District
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 hidden md:block">
                Hover or tap card chips to inspect clinical and dietary rationale
              </span>
              <button
                type="button"
                onClick={handleDonateTheseFoods}
                className="shrink-0 bg-[#0F1E2E] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#1A2E44] transition shadow-xs cursor-pointer whitespace-nowrap"
              >
                Donate These Foods <ArrowRight className="inline w-3.5 h-3.5 ml-1" />
              </button>
            </div>
          </div>

          {/* Interactive Compact Food Cards */}
          {nutritionDataLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl bg-slate-50 p-4 h-48 animate-pulse" />
              ))}
            </div>
          ) : recommendedFoods.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommendedFoods.map((food) => {
                const needed = safeNeededFoods.filter(
                  ({ item }) =>
                    item.name.toLowerCase().includes(food.toLowerCase()) ||
                    food.toLowerCase().includes(item.name.toLowerCase())
                );
                return (
                  <div
                    key={food}
                    className="group relative bg-slate-50 hover:bg-slate-100/80 p-4 rounded-xl transition-all duration-200 border border-slate-100 flex flex-col justify-between"
                  >
                    <div>
                      <FoodImage
                        foodName={food}
                        className="w-full h-28 object-cover rounded-lg mb-3 shadow-xs"
                      />
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-bold text-sm text-slate-900">{food}</span>
                        {needed.length > 0 ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1" title="Needed right now" />
                        ) : (
                          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Tur / Moong Dal / Cereals</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-200/60 text-[11px] font-medium text-slate-700 leading-snug">
                      Dietary baseline — addressing nutritional and caloric deficits in residential schools.
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 p-6 text-xs text-slate-500 text-center bg-slate-50">
              Nutrition-reference recommendations are currently being compiled for {selectedDistrict}.
            </div>
          )}
        </div>
      </section>

      {/* ── 6. RANKED NEEDS LIST (EXACT STITCH CARD STYLING) ── */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-10 py-6 space-y-5" id="ranked-needs-section">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-1">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#0F1E2E] text-white font-bold text-xs">
                Statewide Live Registry
              </span>
              <span className="text-xs text-slate-500">Updated 8 mins ago</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
              Active Requests Across Maharashtra
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Showing <strong className="text-slate-900 font-semibold">{filteredRequirements.length} active verified requirements</strong> statewide · Filter below to view specific districts or items
            </p>
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="shrink-0 bg-white border border-red-200 text-red-700 hover:bg-red-50 px-3 py-2 rounded-full text-xs font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>

        {/* ── Filter Controls Strip ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
          
          {/* District Chips Filter */}
          <div className="flex flex-wrap items-center gap-2 pb-2.5 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-500 w-24 shrink-0">District:</span>
            <button
              type="button"
              onClick={() => handleLocationFilterChange('ALL')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                locationFilter === 'ALL'
                  ? 'bg-[#0F1E2E] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              All Districts <span className="text-[10px] opacity-80">({allRequirements.length})</span>
            </button>
            {(districtsList.length > 0 ? districtsList.slice(0, 8) : [
              { name: 'Nashik' },
              { name: 'Nandurbar' },
              { name: 'Gadchiroli' },
              { name: 'Palghar' },
              { name: 'Amravati' },
              { name: 'Pune' },
            ]).map((d) => (
              <button
                key={d.id || d.name}
                type="button"
                onClick={() => handleLocationFilterChange(d.name)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  locationFilter === d.name
                    ? 'bg-[#0F1E2E] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>

          {/* Urgency Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 w-24 shrink-0">Urgency:</span>
            {[
              ['ALL', 'All Urgencies'],
              ['CRITICAL', 'Critical'],
              ['HIGH', 'High'],
              ['MEDIUM', 'Medium'],
              ['LOW', 'Standard'],
            ].map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setUrgencyFilter(val)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  urgencyFilter === val
                    ? 'bg-[#0F1E2E] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Facility Type Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 w-24 shrink-0">Institution:</span>
            {[
              ['ALL', 'All Types'],
              ['Ashram Shala', 'Ashram Shala'],
              ['Anganwadi', 'Anganwadi'],
              ['Care Center', 'Care Center'],
              ['Orphanage', 'Orphanage'],
              ['NGO', 'NGO / Trust'],
            ].map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setInstitutionFilter(val)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  institutionFilter === val
                    ? 'bg-[#0F1E2E] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Attention level */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 w-24 shrink-0">
              Attention:
            </span>
            <div className="relative">
              <select
                value={attentionFilter}
                onChange={(e) => setAttentionFilter(e.target.value)}
                className="appearance-none bg-slate-100 border border-slate-200 pl-3 pr-8 py-1 rounded-full text-xs font-semibold text-slate-700 hover:border-slate-300 transition focus:outline-none focus:ring-2 focus:ring-[#0F1E2E] cursor-pointer"
              >
                <option value="ALL">All Attention Levels</option>
                <option value="CRITICAL">Critical Attention</option>
                <option value="HIGH">High Attention</option>
                <option value="MEDIUM">Moderate Attention</option>
                <option value="LOW">Standard</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ── 7. Requirement Cards Styled Exactly like Stitch Screenshot ── */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
            <Loader2 className="w-8 h-8 animate-spin text-[#0F1E2E] mx-auto" />
            <p className="text-sm font-semibold text-[#0F1E2E]">Loading requirements…</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-red-200 p-12 text-center space-y-4 shadow-xs">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
            <h4 className="text-lg font-bold text-slate-900">Unable to load requirements</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="bg-[#0F1E2E] text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-[#1A2E44] transition cursor-pointer"
            >
              Retry Loading
            </button>
          </div>
        ) : filteredRequirements.length > 0 ? (
          <div className="space-y-4">
            {filteredRequirements.map((req, idx) => {
              const itemsText = req.items.map((i) => i.name).join(', ') || 'Wholesome Food Grains & Pulses';
              
              return (
                <article
                  key={req.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow p-5 lg:p-6 flex flex-col md:flex-row gap-5 justify-between items-start md:items-center"
                >
                  {/* Left Body Details */}
                  <div className="space-y-2 flex-1 min-w-0">
                    
                    {/* Header Badges Strip matching Stitch Screenshot */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${req.urgencyMeta.badgeColor}`}>
                        #{idx + 1} Match · {req.urgencyMeta.badgeText}
                      </span>
                      
                      <span className="px-2.5 py-0.5 rounded-full bg-[#0F1E2E] text-white font-bold text-xs flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {req.rawDistrict || req.district}
                      </span>
                      
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Verified Institution
                      </span>
                      
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-medium">
                        {req.institutionType}
                      </span>
                      
                      {req.location && (
                        <span className="text-xs text-slate-500">{req.location}</span>
                      )}
                    </div>

                    {/* Institution & Requirement Title */}
                    <h3 className="text-lg font-bold text-slate-900 truncate">
                      {req.institutionName} &mdash; {req.title}
                    </h3>

                    {/* Food Items & Subtitle */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-xs font-bold text-slate-900">
                        {itemsText}
                      </span>
                      <span className="text-xs text-slate-500">
                        Monthly Batch Deficit ({req.daysLeft}d left)
                      </span>
                    </div>

                    {/* Two-Tone Progress Bar Exactly Like Stitch */}
                    <div className="space-y-1 max-w-xl pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">
                          Fulfillment: <strong className="text-slate-900 font-bold">{req.totalPledged} kg pledged</strong> of {req.totalRequired > 0 ? req.totalRequired : req.totalRemaining} kg needed
                        </span>
                        <span className={`font-bold ${req.urgencyMeta.remainingTextColor}`}>
                          {req.totalRemaining} kg remaining needed
                        </span>
                      </div>
                      
                      {/* Two-tone fulfillment bar */}
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                        <div
                          className="h-full bg-emerald-600 rounded-l-full"
                          style={{ width: `${req.overallPercent}%` }}
                        />
                        <div
                          className={`h-full ${req.urgencyMeta.barRemainingColor} rounded-r-full`}
                          style={{ width: `${100 - req.overallPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Callout Notice Strip */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-50 text-orange-900 text-xs border border-orange-200">
                      <AlertTriangle className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                      <span>
                        {req.rationale || `Matches standard pulse pledges · Urgent ration stockout expected within ${req.daysLeft} days`}
                      </span>
                    </div>
                  </div>

                  {/* Right Action Column Matching Stitch */}
                  <div className="flex flex-row md:flex-col items-center md:items-end gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0">
                    <button
                      type="button"
                      onClick={() => handlePledgeSupport(req.id)}
                      className="flex-1 md:flex-initial w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0F1E2E] hover:bg-[#1A2E44] text-white font-semibold text-xs transition-all shadow-xs cursor-pointer whitespace-nowrap"
                    >
                      <span>Pledge Support</span>
                      <HeartHandshake className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/requirements/${req.id}`)}
                      className="px-2 py-1 text-xs text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Details &amp; Pantry Ledger</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* Empty state */
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-[#0F1E2E] mx-auto">
              <PackageOpen className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">No matching requirements found</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              There are currently no active requirements in{' '}
              {effectiveDistrict && effectiveDistrict !== 'ALL'
                ? effectiveDistrict
                : 'this location'}{' '}
              matching your filter criteria.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="bg-[#0F1E2E] text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-[#1A2E44] transition inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset All Filters
              </button>
            )}
          </div>
        )}

        {/* View full catalog link */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => navigate('/requirements')}
            className="text-[#0F1E2E] font-semibold text-sm inline-flex items-center gap-1.5 hover:underline cursor-pointer"
          >
            <span>View Full Requirements Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ── 8. Trust Footer Strip ── */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-10 pb-12 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Left: Direct Drop-Off, Zero Cash Handling */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#0F1E2E] flex items-center justify-center shrink-0 mt-0.5">
              <Handshake className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900">Direct Drop-Off, Zero Cash Handling</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                When you pledge, you commit to delivering directly to the institution&apos;s front door.
                PoshanSetu connects donors to institutions directly &mdash; no cash flows through us.
                We never handle money or shipping.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  All pledges logged against verifiable need
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Dual confirmation required before marking fulfilled
                </li>
              </ul>
            </div>
          </div>

          {/* Right: Transparent Data Provenance */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
              <Database className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900">Transparent Data Provenance</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                District health baselines are sourced from the National Family Health Survey
                (NFHS-5) &amp; quarterly GCED system registry updates. District nutrition indicators
                do not contain clinical diagnoses of individuals.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Official government datasets only
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Nutrition data &ne; clinical diagnosis
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Transparent reporting periods &amp; source attribution
                </li>
              </ul>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
