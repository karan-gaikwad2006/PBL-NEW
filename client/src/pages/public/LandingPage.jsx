import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Navigation,
  HeartHandshake,
  ClipboardPlus,
  Handshake,
  ArrowRight,
  Database,
  Clock,
  ShieldCheck,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  MapPin,
  PackageOpen,
  Wheat,
  Scale,
  FileCheck,
  Globe2,
  Boxes,
  Zap,
  ExternalLink,
  ShieldAlert,
  BadgeCheck,
  Lock,
  Compass
} from 'lucide-react';
import MaharashtraDistrictMap from '../../components/domain/MaharashtraDistrictMap';
import maharashtraMapWatermark from '../../assets/maharashtra-map-watermark.png';

export default function LandingPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCommodity, setActiveCommodity] = useState('Tur / Moong Dal');
  const [matchQty, setMatchQty] = useState('50');
  const [matchRegion, setMatchRegion] = useState('Nashik Cluster');

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  const handleQuickSearch = (term) => {
    setSearchQuery(term);
    navigate(`/explore?search=${encodeURIComponent(term)}`);
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setSearchQuery('Nashik (Tribal Block - Trimbakeshwar)');
          navigate('/explore?district=Nashik');
        },
        () => {
          setSearchQuery('Nashik (Tribal Block - Trimbakeshwar)');
          navigate('/explore?district=Nashik');
        }
      );
    } else {
      setSearchQuery('Nashik (Tribal Block - Trimbakeshwar)');
      navigate('/explore?district=Nashik');
    }
  };

  const handleDirectMatchSubmit = (e) => {
    e?.preventDefault();
    navigate(
      `/food-match?item=${encodeURIComponent(activeCommodity)}&qty=${encodeURIComponent(matchQty)}&region=${encodeURIComponent(matchRegion)}`
    );
  };

  const getMatchSnippet = () => {
    const qty = parseInt(matchQty, 10) || 50;
    if (matchRegion.includes('Nashik')) {
      return {
        count: '1 immediate match found',
        institution: 'Tribal Residential Ashram Shala, Trimbakeshwar',
        need: `Pantry needs ${Math.max(60, qty)} kg of ${activeCommodity}`
      };
    } else if (matchRegion.includes('Nandurbar')) {
      return {
        count: '2 immediate matches found',
        institution: 'Akkalkuwa Anganwadi Cluster',
        need: `Pantry needs ${Math.max(100, qty * 2)} kg of ${activeCommodity}`
      };
    } else if (matchRegion.includes('Palghar')) {
      return {
        count: '1 immediate match found',
        institution: 'Mokhada Bal Bhavan Hostel',
        need: `Pantry needs ${Math.max(40, qty)} kg of ${activeCommodity}`
      };
    } else {
      return {
        count: '1 immediate match found',
        institution: 'Aheri Forest Division Residential Center',
        need: `Pantry needs ${Math.max(80, qty)} kg of ${activeCommodity}`
      };
    }
  };

  const matchSnippet = getMatchSnippet();

  return (
    <div className="bg-[#e9eddc] text-[#1F2933] font-sans selection:bg-[#d0e5fb] selection:text-[#081d2e] min-h-screen">
      {/* 1. HERO SECTION */}
      <section
        className="w-full min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-5rem)] py-12 lg:py-16 flex flex-col justify-center relative overflow-hidden bg-[#f3f7e6] border-b border-[#e2ddd4]"
      >
        {/* Subtle warm ambient glow */}
        <div className="absolute -top-32 right-10 w-[500px] h-[500px] rounded-full bg-[#d4e8c4]/40 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#e8f0dc]/50 blur-3xl pointer-events-none" />

        {/* Maharashtra map watermark — fixed to right side of the section */}
        <img
          src={maharashtraMapWatermark}
          alt=""
          aria-hidden="true"
          className="absolute pointer-events-none select-none object-contain"
          style={{
            width: '95%',
            right: '-20%',
            top: '48%',
            transform: 'translateY(-50%)',
            opacity: 0.5,
            zIndex: 1,
          }}
        />

        <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-10 relative z-10 flex flex-col justify-between my-auto gap-8 lg:gap-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Column: Copy & Search */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              {/* Live Badge */}
              <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-[#e8f4e8] text-[#2d6a2d] border border-[#b8ddb8] shadow-xs">
                <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-[11px] uppercase tracking-widest font-bold text-[#2d6a2d]">
                  Live Maharashtra Nutrition Coordination
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <h1 className="text-4xl lg:text-[3.25rem] font-extrabold text-[#1a2e1a] tracking-tight leading-[1.1]">
                  Make Every Food Donation<br />More Meaningful
                </h1>
                <p className="text-base md:text-lg text-[#4a5a4a] leading-relaxed max-w-lg">
                  See where nutrition support is needed, understand why, and help directly.
                </p>
              </div>

              {/* Search Card — dark forest green */}
              <div className="bg-[#1e3a2a] rounded-2xl p-4 md:p-5 shadow-xl border border-[#2d5540] flex flex-col gap-3">
                <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7aab8a] w-4.5 h-4.5" />
                    <input
                      id="hero-search-input"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search district, taluka, or PIN (e.g. Nashik, Nandurbar,)"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#152b1e] text-white placeholder:text-[#6a9078] focus:outline-none focus:bg-[#0f2016] focus:ring-2 focus:ring-[#5aa870]/50 border border-[#2d5540] text-sm font-medium transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleLocateMe}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#F5F3E6] hover:bg-[#E5E0CE] text-[#1C3326] font-bold text-xs transition-colors shrink-0 border border-[#E0DAA8]/40 hover:border-[#D4CDAA] cursor-pointer shadow-sm"
                  >
                    <Navigation className="w-3.5 h-3.5 text-[#7aab8a]" />
                    <span>Locate Near Me</span>
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#c17f24] hover:bg-[#d4902e] text-white font-bold text-xs transition-colors shrink-0 shadow-md cursor-pointer"
                  >
                    <span>Search</span>
                  </button>
                </form>

                {/* Quick Filter Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#2d5540]">
                  <span className="text-xs text-[#7aab8a] font-semibold">Priority Clusters:</span>
                  {['Nashik', 'Nandurbar', 'Palghar', 'Gadchiroli', 'Pune Rural'].map((cluster) => (
                    <button
                      key={cluster}
                      type="button"
                      onClick={() => handleQuickSearch(cluster)}
                      className="px-2.5 py-1 rounded-full bg-[#2d5540]/60 text-[#c8e6d0] hover:bg-[#c17f24] hover:text-white border border-[#3a6b52]/60 transition-all text-xs font-medium cursor-pointer"
                    >
                      {cluster}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Hero Image */}
            <div className="lg:col-span-5 relative mt-4 lg:mt-0">
              {/* Image Card — sits on top of the watermark */}
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] w-full border-1 border-white/80 bg-slate-100">
                <img
                  className="w-full h-full object-cover"
                  alt="Children receiving food support — Finding a solution for Malnutrition"
                  src="https://childhelpfoundation.in/blog/assets/images/posts/Fighting_Malnutrition.jpg"
                />
                {/* Bottom caption overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm px-4 py-3 border-t border-white/60">
                  <p className="text-[#1a2e1a] text-sm font-bold text-center">
                    Finding a solution for Malnutrition
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Trust / Impact Stat Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e2ddd4] flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="w-11 h-11 rounded-xl bg-[#f0f7e8] text-[#3a6b2a] flex items-center justify-center shrink-0 border border-[#c8e0b0]">
                <Wheat className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-[#1a2e1a]">1,420+ kg</span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    LIVE SYNC
                  </span>
                </div>
                <span className="text-xs text-[#6a7a6a]">Staples Matched This Month</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e2ddd4] flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="w-11 h-11 rounded-xl bg-[#edf7f0] text-emerald-700 flex items-center justify-center shrink-0 border border-[#b8dfc8]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-[#1a2e1a]">48 Verified</span>
                <span className="text-xs text-[#6a7a6a]">Ashram Shalas &amp; Anganwadis</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e2ddd4] flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="w-11 h-11 rounded-xl bg-[#edf2f8] text-[#2d5a8a] flex items-center justify-center shrink-0 border border-[#b8ccdf]">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-[#1a2e1a]">36 Districts</span>
                <span className="text-xs text-[#6a7a6a]">Monitored Weekly with ICDS Logs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THREE ACTION PATHS ("What Would You Like to Do?") */}
      <section className="w-full bg-slate-50/80 py-16 border-y border-slate-200/60" id="action-paths-section">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#192d3e] tracking-tight">
              How Would You Like to Use PoshanSetu?
            </h2>
            <p className="text-sm text-[#64707A] mt-2">
              Direct paths designed for donors, institutions, and community advocates.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* Card 1: I Want to Help */}
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 hover:shadow-md hover:-translate-y-1 transition-all flex flex-col justify-between">
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#d0e5fb] flex items-center justify-center text-[#192d3e] shrink-0">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#64707A]">
                    Community &amp; CSR Donors
                  </span>
                  <h3 className="text-lg font-bold text-[#192d3e]">Browse Active Needs</h3>
                </div>
                <p className="text-xs text-[#64707A] leading-relaxed">
                  Explore verified residential tribal schools, Anganwadis, and childcare institutions across Maharashtra seeking raw staples, pulses, and fortified oils.
                </p>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
                  <span className="text-xs font-bold text-[#192d3e]">Current Urgent Need:</span>
                  <span className="text-xs text-slate-700">320 kg Tur Dal &amp; 150 kg Jowar in Nandurbar Block</span>
                </div>
              </div>
              <div className="pt-6">
                <Link
                  to="/explore"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#192d3e] hover:bg-[#304355] text-white font-semibold text-xs transition-all shadow-xs"
                >
                  <span>Find Where to Help</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Card 2: Submit a Requirement */}
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 hover:shadow-md hover:-translate-y-1 transition-all flex flex-col justify-between">
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100">
                  <ClipboardPlus className="w-6 h-6" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#64707A]">
                    Institutional Coordinators
                  </span>
                  <h3 className="text-lg font-bold text-[#192d3e]">Submit Institutional Need</h3>
                </div>
                <p className="text-xs text-[#64707A] leading-relaxed">
                  For wardens, teachers, and certified grassroots coordinators to report verified food and grain shortfalls in residential kitchens with Zilla Parishad validation.
                </p>
                <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100/60 flex flex-col gap-1">
                  <span className="text-xs font-bold text-emerald-700">Fast-Track Verification:</span>
                  <span className="text-xs text-slate-700">Needs are verified within 24 hours via local Gram Panchayat and WCD logs.</span>
                </div>
              </div>
              <div className="pt-6">
                <Link
                  to="/submit-requirement"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#192d3e] font-semibold text-xs transition-colors border border-slate-200/60"
                >
                  <span>Submit Requirement</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Card 3: I Have Food (Direct Match Engine) */}
            <div className="bg-[#ffddb7]/30 rounded-2xl p-6 shadow-sm border border-[#ffddb7] hover:shadow-md hover:-translate-y-1 transition-all flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-[#3b270c] text-[#ffddb7] text-[11px] font-bold rounded-bl-xl">
                Direct Match Engine
              </div>
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#ffddb7] text-[#3b270c] flex items-center justify-center shrink-0">
                  <Handshake className="w-6 h-6" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5a4225]">
                    Instant Donor Logistics
                  </span>
                  <h3 className="text-lg font-bold text-[#192d3e]">I Have Food — Match Me</h3>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed">
                  Specify what commodity you can physically hand over to discover the nearest institutional shortfall.
                </p>

                {/* Micro-matching Interactive Tool */}
                <div className="bg-white rounded-xl p-3 flex flex-col gap-2.5 shadow-xs border border-amber-200/60">
                  <label className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                    Select Staple Type:
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {['Tur / Moong Dal', 'Kolam Rice', 'Jowar / Bajra', 'Fortified Oil'].map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setActiveCommodity(item)}
                        className={`px-2 py-1.5 rounded-lg text-left text-xs font-semibold transition-all cursor-pointer ${
                          activeCommodity === item
                            ? 'bg-[#192d3e] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div>
                      <label className="text-[11px] text-slate-500 font-bold block mb-1">Quantity (kg):</label>
                      <input
                        type="number"
                        min="10"
                        step="5"
                        value={matchQty}
                        onChange={(e) => setMatchQty(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-900 text-xs font-medium border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#192d3e]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 font-bold block mb-1">Region:</label>
                      <select
                        value={matchRegion}
                        onChange={(e) => setMatchRegion(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg bg-slate-50 text-slate-900 text-xs font-medium border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#192d3e]"
                      >
                        <option value="Nashik Cluster">Nashik Cluster</option>
                        <option value="Nandurbar Block">Nandurbar Block</option>
                        <option value="Palghar Corridor">Palghar Corridor</option>
                        <option value="Gadchiroli Sector">Gadchiroli Sector</option>
                      </select>
                    </div>
                  </div>

                  {/* Match Preview Snippet */}
                  <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/70 flex items-start gap-2">
                    <Zap className="text-amber-600 w-4 h-4 shrink-0 mt-0.5 animate-pulse" />
                    <span className="text-xs text-slate-800 font-medium leading-snug">
                      {matchSnippet.count}: <strong className="text-[#192d3e] font-bold">{matchSnippet.institution}</strong> ({matchSnippet.need}).
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-5">
                <button
                  type="button"
                  onClick={handleDirectMatchSubmit}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#3b270c] text-white hover:bg-[#543d20] font-semibold text-xs transition-all shadow-xs cursor-pointer"
                >
                  <span>Calculate Direct Match</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. "HOW POSHANSETU WORKS" (3-Step: Where → Why → How) */}
      <section id="how-it-works" className="w-full py-16 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64707A] mb-1">
              The Verification Pipeline
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#192d3e]">
              From Population Insight to Dignified Support
            </h2>
            <p className="text-sm text-[#64707A] mt-1">
              A zero-middleman protocol designed for civic transparency, supply chain audits, and local dignity.
            </p>
          </div>

          {/* 3-Step Horizontal Bento Progression */}
          <div className="relative">
            <div className="hidden md:block absolute top-10 left-[15%] right-[15%] h-[2px] bg-slate-200 z-0" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              {/* Step 1: WHERE */}
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 flex flex-col gap-4 relative overflow-hidden hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-[#192d3e] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                  1
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold uppercase text-[#192d3e]">Where: Geographic Deficit</span>
                  <h3 className="text-base font-bold text-[#192d3e]">Find Hyperlocal Gaps</h3>
                </div>
                <p className="text-xs text-[#64707A] leading-relaxed">
                  We map verified nutrition shortfalls using official district administrative data, Anganwadi rosters, and weekly Ashram Shala pantry logs. Zero guesswork.
                </p>
                <div className="pt-2">
                  <div className="inline-flex items-center gap-1.5 text-[#192d3e] text-xs font-bold">
                    <TrendingUp className="w-4 h-4 text-[#192d3e]" />
                    <span>ICDS &amp; NFHS-5 Geo-Triangulated</span>
                  </div>
                </div>
              </div>

              {/* Step 2: WHY */}
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 flex flex-col gap-4 relative overflow-hidden hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                  2
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold uppercase text-amber-600">Why: Ground Realities</span>
                  <h3 className="text-base font-bold text-[#192d3e]">Understand Seasonal Context</h3>
                </div>
                <p className="text-xs text-[#64707A] leading-relaxed">
                  Shortages stem from monsoon transport delays, seasonal crop rotation gaps, or unexpected enrollment surges—not lack of care. We display this context transparently.
                </p>
                <div className="pt-2">
                  <div className="inline-flex items-center gap-1.5 text-amber-600 text-xs font-bold">
                    <Activity className="w-4 h-4 text-amber-600" />
                    <span>Monsoon &amp; Transit Logistics Tracking</span>
                  </div>
                </div>
              </div>

              {/* Step 3: HOW */}
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 flex flex-col gap-4 relative overflow-hidden hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                  3
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold uppercase text-emerald-600">How: In-Kind Fulfillment</span>
                  <h3 className="text-base font-bold text-[#192d3e]">Direct Handshake Handover</h3>
                </div>
                <p className="text-xs text-[#64707A] leading-relaxed">
                  Supplies are coordinated and handed over directly in person or via verified local logistics. Both warden and donor verify the sealed physical delivery on receipt.
                </p>
                <div className="pt-2">
                  <div className="inline-flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Signed Offline Receiving Ledger</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Photographic Context Row: Grains & Ground Dignity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="relative rounded-2xl overflow-hidden shadow-xs aspect-[16/9] bg-slate-100 border border-slate-200/80">
              <img
                className="w-full h-full object-cover"
                alt="Standard Ration: Unpolished Pulses & Legumes"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBt7jsfRboRbiGwhdCheDNFUsmdDBxOBn5GVoUHF5PTiIBuW4XfzVplfYUWg8zQpJaRag_qRWO0vNpbBrNzUtNCYWgtnZ9Z_aQzA3nIg4IOHuSDURnOekUDc2fLcYajbwHElldeMN8QpLB07NT04FcQarv1S8UxCn4HLQHd0qmeix-dyMoVwTFnvmhcA0werSb_wKjDmD3FvXK5p3drFNjreYjEhY9mi1l2R9ps1Uw"
              />
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[#192d3e] text-xs font-bold border border-slate-200/60">
                Standard Ration: Unpolished Pulses &amp; Legumes
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden shadow-xs aspect-[16/9] bg-slate-100 border border-slate-200/80">
              <img
                className="w-full h-full object-cover"
                alt="Climate Resilient Nutrition: Jowar, Bajra & Ragi"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCV8CELvuqEPabOdQsqqxydVYWizh-Bu6Dyhhgffz-SFnIXslZBqyuh0iODzf4W6uKeaoribkIDpi3PYfCP-1Igfo9XEeVB07j93iBaDRIZFGUFEXitsf8sUtz8d6yuxYvL__LbEsMzZQsjTe7uOIJqNr9oYC8ZInXVqIavwsbOpzur2k4XsTiblWWnnyIIrbLYzOY9AxRB7z9a3VgSblfb2_OFwKmWVs_ZVWhY2zs"
              />
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[#192d3e] text-xs font-bold border border-slate-200/60">
                Climate Resilient Nutrition: Jowar, Bajra &amp; Ragi
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MAP & NUTRITION INSIGHTS PREVIEW */}
      <section className="w-full bg-slate-50/80 py-16 border-y border-slate-200/60" id="map-insights-section">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Two Differentiated Explanatory Cards */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#64707A]">
                  Civic Data Infrastructure
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#192d3e]">
                  Maharashtra Nutrition Intelligence
                </h2>
                <p className="text-sm text-[#64707A] leading-relaxed">
                  PoshanSetu bridges long-range demographic surveys with immediate, actionable pantry inventories.
                </p>
              </div>

              {/* Insight Card A: Official Health Indicators */}
              <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex flex-col gap-2 hover:-translate-y-0.5 transition-transform">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-[#ffddb7] text-[#3b270c] text-xs font-bold">
                    Population Baseline (NFHS-5)
                  </span>
                  <Globe2 className="text-amber-500 w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#192d3e]">Official District Health Indicators</h3>
                <p className="text-xs text-[#64707A] leading-relaxed">
                  Synthesizes government health survey benchmarks (child stunting, wasting, and maternal anemia) to identify systemic vulnerability zones across rural and tribal corridors.
                </p>
                <div className="flex items-center gap-4 pt-1 text-slate-600 text-xs font-semibold">
                  <span>• 34% Nandurbar Baseline Gap</span>
                  <span>• 28% Gadchiroli Priority</span>
                </div>
              </div>

              {/* Insight Card B: Current Real-Time Pantry Shortfalls */}
              <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex flex-col gap-2 hover:-translate-y-0.5 transition-transform">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                    Verified Kitchen Shortages
                  </span>
                  <Boxes className="text-emerald-600 w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#192d3e]">Current Real-Time Pantry Shortfalls</h3>
                <p className="text-xs text-[#64707A] leading-relaxed">
                  Updated weekly by residential wardens. Highlights immediate daily deficits in rice, dal, edible oil, and fortified micronutrient premixes before school kitchens run empty.
                </p>
                <div className="flex items-center gap-4 pt-1 text-emerald-700 text-xs font-bold">
                  <span>• 8 Urgent Requests Active Today</span>
                  <span>• 100% Wardens Verified</span>
                </div>
              </div>
            </div>

            {/* Right Column: Maharashtra Interactive Map Discovery Card */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-slate-200/80 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3 items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600" />
                    </span>
                    <span className="text-sm font-bold text-[#192d3e]">Interactive District Supply Map</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      ICDS Sync: Live
                    </span>
                    <span className="text-xs text-slate-500">2 hours ago</span>
                  </div>
                </div>

                {/* Map Component Canvas */}
                <div className="relative w-full h-[360px] md:h-[390px] rounded-2xl overflow-hidden bg-slate-50/60 p-2 border border-slate-200/70 flex items-center justify-center">
                  <MaharashtraDistrictMap
                    preview={false}
                    selectedDistrict="Nashik"
                    onDistrictSelect={(districtName) => navigate(`/explore?district=${encodeURIComponent(districtName)}`)}
                    mapMode="nutrition"
                  />
                </div>

                {/* Map Legend Bar */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-y-2 gap-x-4 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />
                    <span className="text-[11px] font-medium">Critical</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />
                    <span className="text-[11px] font-medium">High Risk</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FACC15]" />
                    <span className="text-[11px] font-medium">Moderate</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
                    <span className="text-[11px] font-medium">Baseline</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-slate-100 border border-dashed border-slate-300" />
                    <span className="text-[11px] font-medium">Onboarding</span>
                  </div>
                </div>

                {/* Discovery CTA Link */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-2 border-t border-slate-100 gap-2">
                  <div className="flex items-center gap-2">
                    <Compass className="text-[#192d3e] w-4 h-4 shrink-0" />
                    <span className="text-xs text-[#64707A]">
                      Browse live telemetry for all 36 Maharashtra administrative districts.
                    </span>
                  </div>
                  <Link
                    to="/explore"
                    className="inline-flex items-center gap-1 text-[#192d3e] hover:text-[#304355] font-bold text-xs transition-colors shrink-0"
                  >
                    <span>Open Interactive Maharashtra Map</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. DIRECT OFFLINE HANDOFF & REASSURANCE BANNER */}
      <section className="w-full bg-[#FAF8F6] py-10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="bg-slate-100 rounded-3xl p-6 md:p-8 shadow-xs border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4 max-w-3xl">
              <div className="w-12 h-12 rounded-2xl bg-white text-emerald-600 flex items-center justify-center shrink-0 shadow-xs border border-slate-200/60">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-white text-emerald-700 text-xs font-bold uppercase tracking-wider border border-emerald-100">
                    Direct Coordination
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Zero Financial Intermediaries</span>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-[#192d3e]">
                  100% of Your Food Reaches the Kitchen Doorstep
                </h3>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                  You will be connected directly with the institution's authorized warden or Gram Panchayat supervisor. PoshanSetu never accepts, holds, or processes monetary donations, payment gateways, or transportation fees.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 w-full md:w-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white shadow-xs text-slate-800 text-xs font-bold border border-slate-200/60">
                <CheckCircle2 className="text-emerald-600 w-4 h-4 shrink-0" />
                <span>Direct Offline Handover</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white shadow-xs text-slate-800 text-xs font-bold border border-slate-200/60">
                <CheckCircle2 className="text-emerald-600 w-4 h-4 shrink-0" />
                <span>Warden Receipt Sign-off</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TRANSPARENCY & DATA ETHICS (Visual Trust Anchor) */}
      <section className="w-full bg-[#192d3e] text-white py-16 relative overflow-hidden" id="transparency-section">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-12">
            <span className="px-3 py-1 rounded-full bg-[#304355] text-slate-200 text-xs font-semibold uppercase tracking-wider mb-3 border border-white/10">
              Public Welfare Trust
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Dignified, Transparent &amp; Verifiable
            </h2>
            <p className="text-sm text-slate-300 mt-2">
              Designed in accordance with civic open standards to guarantee complete neutrality and child nutrition dignity.
            </p>
          </div>

          {/* 3 Core Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Pillar 1 */}
            <div className="bg-[#304355]/60 rounded-2xl p-6 flex flex-col gap-4 shadow-md border border-white/10 backdrop-blur-sm hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-xl bg-[#ffddb7] text-[#3b270c] flex items-center justify-center shrink-0 shadow-sm">
                <Scale className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-base font-bold text-white">Non-Custodial Protocol</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  We never hold money, manage escrow, or divert resources. PoshanSetu functions purely as a transparent civic intelligence directory connecting institutional shortages with community support.
                </p>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="bg-[#304355]/60 rounded-2xl p-6 flex flex-col gap-4 shadow-md border border-white/10 backdrop-blur-sm hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-sm">
                <BadgeCheck className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-base font-bold text-white">Verified Wardens</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Every residential school, Anganwadi, and child shelter is audited against official Women &amp; Child Development (WCD) registries and authenticated by local Zilla Parishad officers prior to listing.
                </p>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="bg-[#304355]/60 rounded-2xl p-6 flex flex-col gap-4 shadow-md border border-white/10 backdrop-blur-sm hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-xl bg-[#d0e5fb] text-[#192d3e] flex items-center justify-center shrink-0 shadow-sm">
                <FileCheck className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-base font-bold text-white">Tamper-Proof Ledger</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Timestamped physical delivery sign-offs protect both donor and school from misappropriation. Physical supply logs are archived openly for community social audits.
                </p>
              </div>
            </div>
          </div>

          {/* Data Citation Banner */}
          <div className="p-4 rounded-2xl bg-[#304355]/40 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-300">
            <div className="flex items-center gap-2.5">
              <Sparkles className="text-[#ffddb7] w-5 h-5 shrink-0" />
              <span className="text-xs">
                Harmonized with <strong className="text-white">National Family Health Survey (NFHS-5)</strong> &amp; <strong className="text-white">ICDS Maharashtra Telemetry</strong>.
              </span>
            </div>
            <Link
              to="/insights"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-[#ffddb7] transition-colors shrink-0"
            >
              <span>Read Open Data Policy</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
