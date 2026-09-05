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
  Activity,
  Loader2,
  AlertCircle,
  PackageOpen,
  RefreshCw,
  Navigation
} from 'lucide-react';
import MaharashtraDistrictMap from '../../components/domain/MaharashtraDistrictMap';
import { districtService, requirementService } from '../../services/api';
import { getDistrictFromCoords } from '../../utils/geoUtils';

const URGENCY_CONFIG = {
  CRITICAL: {
    label: 'Critical Urgency',
    color: 'bg-red-500/10 text-red-700 border-red-200',
  },
  HIGH: {
    label: 'High Urgency',
    color: 'bg-amber-500/10 text-amber-700 border-amber-200',
  },
  MEDIUM: {
    label: 'Medium Urgency',
    color: 'bg-blue-500/10 text-blue-700 border-blue-200',
  },
  LOW: {
    label: 'Standard Need',
    color: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
  },
};

function daysUntil(expiresAt) {
  if (!expiresAt) return 14;
  const ms = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

function mapRequirementToCard(req) {
  const items = Array.isArray(req.items) ? req.items.filter(Boolean) : [];
  const urgencyKey = String(req.urgency || 'MEDIUM').toUpperCase();
  const urgencyMeta = URGENCY_CONFIG[urgencyKey] || URGENCY_CONFIG.MEDIUM;

  return {
    id: req.id,
    title: req.title || 'Nutritional Food Support',
    items: items.map(item => ({
      name: item.name || item.item_name,
      quantityRequired: Number(item.quantityRequired || item.quantity_required || 0),
      quantityRemaining: Number(item.quantityRemaining || item.quantity_remaining || 0),
      unit: item.unit,
      fulfilledPercent: (Number(item.quantityRequired || item.quantity_required) > 0)
        ? Math.round(((Number(item.quantityRequired || item.quantity_required) - Number(item.quantityRemaining || item.quantity_remaining)) / Number(item.quantityRequired || item.quantity_required)) * 100)
        : 0
    })),
    district: req.district ? `${req.district} District` : 'Maharashtra District',
    rawDistrict: req.district || '',
    urgency: urgencyKey,
    urgencyLabel: urgencyMeta.label,
    urgencyColor: urgencyMeta.color,
    daysLeft: daysUntil(req.expiresAt),
    confidence: (req.status === 'active' || req.status === 'partially_supported') ? 'Verified Institution' : 'Pending Verification',
    institutionName: req.institutionName || req.beneficiaryDescription || 'Local Care Center',
    institutionType: req.institutionType || 'Ashram Shala',
    beneficiaries: req.beneficiaryCount || req.beneficiary_count || 0,
  };
}

export default function ExploreMap() {
  const navigate = useNavigate();
  const [selectedDistrict, setSelectedDistrict] = useState('Nashik');
  const [searchQuery, setSearchQuery] = useState('');
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState('');

  // Data states
  const [allRequirements, setAllRequirements] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [attentionFilter, setAttentionFilter] = useState('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState('ALL');
  const [institutionFilter, setInstitutionFilter] = useState('ALL');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    Promise.all([
      requirementService.getAll({ limit: 100 }),
      districtService.getAll()
    ])
      .then(([reqRes, distRes]) => {
        if (!isMounted) return;

        const reqRows = Array.isArray(reqRes.data) ? reqRes.data : (Array.isArray(reqRes) ? reqRes : []);
        setAllRequirements(reqRows.map(mapRequirementToCard));

        const distRows = Array.isArray(distRes.data) ? distRes.data : (Array.isArray(distRes) ? distRes : []);
        setDistrictsList(distRows);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('[ExploreMap] Error fetching data:', err);
        setError(err.message || 'Failed to load district requirements.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Update selectedDistrict when map or search is clicked
  const handleDistrictChange = (newDistrictName) => {
    if (!newDistrictName) return;
    setSelectedDistrict(newDistrictName);
    // Sync location filter if set to specific district
    if (locationFilter !== 'ALL') {
      setLocationFilter(newDistrictName);
    }
  };

  // Handle explicit Location filter change
  const handleLocationFilterChange = (value) => {
    setLocationFilter(value);
    if (value !== 'ALL') {
      setSelectedDistrict(value);
    }
  };

  // Derived effective district filter
  const effectiveDistrict = locationFilter !== 'ALL' ? locationFilter : selectedDistrict;

  // Filter logic
  const filteredRequirements = useMemo(() => {
    return allRequirements.filter((req) => {
      // 1. Location filter
      const reqDistLower = (req.rawDistrict || req.district || '').toLowerCase();
      const targetDistLower = (effectiveDistrict || '').toLowerCase();
      
      const matchesLocation =
        !effectiveDistrict ||
        effectiveDistrict === 'ALL' ||
        reqDistLower.includes(targetDistLower) ||
        targetDistLower.includes(reqDistLower);

      // 2. Urgency filter
      const matchesUrgency = urgencyFilter === 'ALL' || req.urgency === urgencyFilter;

      // 3. Attention Level filter
      let matchesAttention = true;
      if (attentionFilter === 'HIGH' || attentionFilter === 'CRITICAL') {
        matchesAttention = req.urgency === 'CRITICAL' || req.urgency === 'HIGH';
      } else if (attentionFilter === 'MEDIUM') {
        matchesAttention = req.urgency === 'MEDIUM';
      } else if (attentionFilter === 'LOW') {
        matchesAttention = req.urgency === 'LOW';
      }

      // 4. Institution Type filter
      let matchesInstitution = true;
      if (institutionFilter !== 'ALL') {
        const instTypeStr = `${req.institutionType} ${req.institutionName} ${req.title}`.toLowerCase();
        matchesInstitution = instTypeStr.includes(institutionFilter.toLowerCase());
      }

      return matchesLocation && matchesUrgency && matchesAttention && matchesInstitution;
    });
  }, [allRequirements, effectiveDistrict, urgencyFilter, attentionFilter, institutionFilter]);

  // District statistics
  const districtRequirementsCount = useMemo(() => {
    return allRequirements.filter((r) =>
      (r.rawDistrict || r.district || '').toLowerCase().includes((selectedDistrict || '').toLowerCase())
    ).length;
  }, [allRequirements, selectedDistrict]);

  // Derived attention status for panel
  const districtAttentionInfo = useMemo(() => {
    const hasCritical = allRequirements.some(
      (r) =>
        (r.rawDistrict || r.district || '').toLowerCase().includes((selectedDistrict || '').toLowerCase()) &&
        (r.urgency === 'CRITICAL' || r.urgency === 'HIGH')
    );
    if (hasCritical) {
      return {
        label: 'High Attention Required',
        desc: 'Elevated nutrition deficits and active critical requirements logged.',
        color: 'bg-[#FFDAD6]/60 border-[#FF8A80] text-[#93000A]',
        icon: AlertTriangle
      };
    }
    return {
      label: 'Moderate Attention',
      desc: 'Based on official population-level indicators and active needs.',
      color: 'bg-[#FFF9C4]/40 border-[#FBC02D]/40 text-[#D97706]',
      icon: AlertTriangle
    };
  }, [allRequirements, selectedDistrict]);

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

          // Fetch GeoJSON to determine district
          const response = await fetch('/data/maharashtra-districts.geojson');
          if (!response.ok) throw new Error('Failed to load district data.');
          const geoJson = await response.json();

          const district = getDistrictFromCoords(latitude, longitude, geoJson);

          if (district) {
            handleDistrictChange(district);
            setSearchQuery('');
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

  return (
    <div className="bg-[#E8E8E2] min-h-screen text-[#1F2933] font-sans pb-16">
      {/* Header Banner */}
      <section className="pt-10 pb-6 px-6 md:px-10 max-w-[1280px] mx-auto text-center space-y-4">
        <h1 className="text-3xl lg:text-4xl font-extrabold text-[#304355] tracking-tight">
          Explore Needs Across Maharashtra
        </h1>
        <p className="text-base text-[#64707A] max-w-2xl mx-auto">
          Understand district nutrition insights and discover current local requirements.
        </p>

        {/* Search Bar */}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const district = searchQuery.trim();
            if (district) handleDistrictChange(district);
          }}
          className="w-full max-w-2xl mx-auto pt-2 relative"
        >
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#64707A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search district, city or location (e.g., Nashik, Pune, Nandurbar)"
              className="w-full bg-white border border-[#304355]/20 rounded-full py-3.5 pl-12 pr-28 text-sm text-[#1F2933] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#304355]"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-[#304355] text-white px-5 py-2 rounded-full text-xs font-semibold hover:bg-[#243342] transition cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>
      </section>

      {/* Section 1: Map & Selection Panel Bento */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-10 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Visualization Area (Left 2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#304355]/10 shadow-sm overflow-hidden flex flex-col relative h-[560px]">
            <MaharashtraDistrictMap
              selectedDistrict={selectedDistrict}
              onDistrictSelect={handleDistrictChange}
            />
            
            {/* Geolocation Button */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
              <button
                onClick={handleUseLocation}
                disabled={locating}
                className="bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-full shadow-md border border-slate-200 text-sm font-bold text-[#304355] flex items-center gap-2 hover:bg-white transition-all hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {locating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Navigation className="w-4 h-4 group-hover:scale-110 transition-transform" />
                )}
                <span>{locating ? 'Detecting Location...' : 'Use current location'}</span>
              </button>

              {geoError && (
                <div className="bg-red-50/90 backdrop-blur-sm border border-red-200 px-3 py-1.5 rounded-lg shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-[11px] font-bold text-red-700 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {geoError}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Selection Panel (Right 1 col) */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-[#304355]/10 shadow-sm p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64707A]">
                  Selected District
                </span>
                <h2 className="text-3xl font-extrabold text-[#304355] mt-0.5">{selectedDistrict}</h2>
              </div>

              {/* Risk Alert Box */}
              <div className={`border rounded-xl p-4 flex gap-3 items-start ${districtAttentionInfo.color}`}>
                <districtAttentionInfo.icon className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold block">{districtAttentionInfo.label}</span>
                  <span className="opacity-90">{districtAttentionInfo.desc}</span>
                </div>
              </div>

              {/* Data Transparency Box */}
              <div className="border-t border-[#304355]/10 pt-4 space-y-2 text-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64707A] block">
                  Data Transparency
                </span>
                <div className="flex justify-between">
                  <span className="text-[#64707A]">Source:</span>
                  <span className="font-semibold text-[#1F2933]">NFHS-5 (2019-21)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64707A]">Last Synced:</span>
                  <span className="font-semibold text-[#1F2933]">Oct 2023</span>
                </div>
              </div>

              {/* Active Stats */}
              <div className="bg-[#FBF9FA] rounded-xl p-4 border border-[#304355]/10 flex justify-between items-center">
                <div>
                  <span className="text-2xl font-extrabold text-[#304355] block">
                    {districtRequirementsCount}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#64707A]">
                    Active Requirements in {selectedDistrict}
                  </span>
                </div>
                <Activity className="w-8 h-8 text-[#304355]/20" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => navigate(`/districts/${selectedDistrict.toLowerCase().replace(/\s+/g, '-')}`)}
                className="w-full bg-[#304355] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#243342] transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>View District Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/requirements')}
                className="w-full bg-white text-[#304355] border border-[#304355]/30 py-3 rounded-xl font-semibold text-sm hover:bg-slate-50 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                View Current Needs
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Current Active Requirements Catalog Preview */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-10 py-10 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-2xl font-extrabold text-[#304355]">
              Active Requirements in {effectiveDistrict && effectiveDistrict !== 'ALL' ? effectiveDistrict : 'Maharashtra'}
            </h3>
            <p className="text-sm text-[#64707A]">
              Showing verified needs from local institutions in {selectedDistrict} and surrounding areas.
            </p>
          </div>

          {/* Interactive Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Location Filter */}
            <div className="relative">
              <select
                value={locationFilter}
                onChange={(e) => handleLocationFilterChange(e.target.value)}
                className="appearance-none bg-white border border-[#304355]/20 pl-4 pr-8 py-2 rounded-full text-xs font-semibold text-[#1F2933] hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-[#304355] shadow-xs cursor-pointer"
              >
                <option value="ALL">Location: All Districts</option>
                <option value={selectedDistrict}>Location: {selectedDistrict}</option>
                {districtsList
                  .filter((d) => d.name !== selectedDistrict)
                  .map((d) => (
                    <option key={d.id || d.name} value={d.name}>
                      Location: {d.name}
                    </option>
                  ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#64707A] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Attention Level Filter */}
            <div className="relative">
              <select
                value={attentionFilter}
                onChange={(e) => setAttentionFilter(e.target.value)}
                className="appearance-none bg-white border border-[#304355]/20 pl-4 pr-8 py-2 rounded-full text-xs font-semibold text-[#1F2933] hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-[#304355] shadow-xs cursor-pointer"
              >
                <option value="ALL">Attention Level: All</option>
                <option value="CRITICAL">Critical Attention</option>
                <option value="HIGH">High Attention</option>
                <option value="MEDIUM">Moderate Attention</option>
                <option value="LOW">Standard</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#64707A] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Urgency Filter */}
            <div className="relative">
              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="appearance-none bg-white border border-[#304355]/20 pl-4 pr-8 py-2 rounded-full text-xs font-semibold text-[#1F2933] hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-[#304355] shadow-xs cursor-pointer"
              >
                <option value="ALL">Urgency: All</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High Urgency</option>
                <option value="MEDIUM">Medium Urgency</option>
                <option value="LOW">Standard Need</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#64707A] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Institution Type Filter */}
            <div className="relative">
              <select
                value={institutionFilter}
                onChange={(e) => setInstitutionFilter(e.target.value)}
                className="appearance-none bg-white border border-[#304355]/20 pl-4 pr-8 py-2 rounded-full text-xs font-semibold text-[#1F2933] hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-[#304355] shadow-xs cursor-pointer"
              >
                <option value="ALL">Institution Type: All</option>
                <option value="Ashram Shala">Ashram Shala</option>
                <option value="Care Center">Care Center / Shelter</option>
                <option value="Anganwadi">Anganwadi / Creche</option>
                <option value="Orphanage">Orphanage</option>
                <option value="NGO">NGO / Trust</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#64707A] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="bg-white border border-red-200 text-red-700 hover:bg-red-50 px-3 py-2 rounded-full text-xs font-semibold transition flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-[#304355]/10 p-12 text-center space-y-3 shadow-xs">
            <Loader2 className="w-8 h-8 animate-spin text-[#304355] mx-auto" />
            <p className="text-sm font-semibold text-[#304355]">Loading requirements for {selectedDistrict}…</p>
          </div>
        ) : error ? (
          /* Error State */
          <div className="bg-white rounded-2xl border border-red-200 p-12 text-center space-y-4 shadow-xs">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
            <h4 className="text-lg font-bold text-[#1F2933]">Unable to load district requirements</h4>
            <p className="text-xs text-[#64707A] max-w-sm mx-auto">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#304355] text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-[#243342] transition cursor-pointer"
            >
              Retry Loading
            </button>
          </div>
        ) : filteredRequirements.length > 0 ? (
          /* Bento Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequirements.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-2xl border border-[#304355]/10 p-6 flex flex-col justify-between relative overflow-hidden shadow-xs hover:shadow-md transition group"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${req.urgencyColor}`}>
                      {req.urgencyLabel}
                    </span>
                    <span className="text-xs text-[#64707A] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {req.daysLeft} days left
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xl font-bold text-[#304355] line-clamp-1">{req.title}</h4>
                    <p className="text-xs text-[#64707A] font-medium mt-0.5 line-clamp-1">{req.institutionName}</p>

                    <div className="mt-3 space-y-2 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                      {req.items.map((item, idx) => (
                        <div key={idx} className="bg-[#FBF9FA] border border-[#304355]/5 rounded-lg p-2.5 space-y-1.5">
                          <div className="flex justify-between items-baseline">
                            <span className="text-xs font-bold text-[#304355]">{item.name}</span>
                            <span className="text-[10px] font-bold text-[#64707A]">{item.quantityRemaining}{item.unit} left</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1">
                            <div
                              className="bg-[#304355] h-1 rounded-full"
                              style={{ width: `${item.fulfilledPercent}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 text-xs">
                    <div className="flex items-center gap-1.5 text-[#64707A]">
                      <MapPin className="w-4 h-4 text-[#304355] flex-shrink-0" />
                      <span>{req.district}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>{req.confidence}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/requirements/${req.id}`)}
                  className="mt-6 w-full bg-white border border-[#304355] text-[#304355] hover:bg-[#304355] hover:text-white py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer"
                >
                  Pledge Support
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-[#304355]/10 p-12 text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-[#304355] mx-auto">
              <PackageOpen className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-bold text-[#1F2933]">No matching requirements found</h4>
            <p className="text-xs text-[#64707A] max-w-md mx-auto">
              There are currently no active requirements in {effectiveDistrict && effectiveDistrict !== 'ALL' ? effectiveDistrict : 'this location'} matching your filter criteria.
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="bg-[#304355] text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-[#243342] transition inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>
        )}

        <div className="text-center pt-4">
          <button
            onClick={() => navigate('/requirements')}
            className="text-[#304355] font-semibold text-sm inline-flex items-center gap-1.5 hover:underline cursor-pointer"
          >
            <span>View Full Requirements Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

    </div>
  );
}
