import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  HeartHandshake,
  ClipboardPlus,
  Utensils,
  MapPin,
  ArrowRight,
  Database,
  Clock,
  ShieldCheck,
  TrendingUp,
  Activity
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [foodItem, setFoodItem] = useState('');
  const [foodQty, setFoodQty] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/explore');
    }
  };

  const handleFoodMatchSubmit = (e) => {
    e.preventDefault();
    navigate(`/food-match?item=${encodeURIComponent(foodItem)}&qty=${encodeURIComponent(foodQty)}`);
  };

  return (
    <div className="bg-[#E8E8E2] text-[#1F2933] font-sans">
      {/* 1. Hero Section */}
      <section className="relative py-16 lg:py-24 px-6 md:px-10 overflow-hidden">
        <div className="max-w-[1280px] mx-auto relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Hero Content */}
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-[#304355] tracking-tight leading-[1.15]">
              Make Every Food Donation More Meaningful.
            </h1>
            <p className="text-base md:text-lg text-[#64707A] max-w-xl leading-relaxed">
              Help people understand where nutrition support is needed, why attention is needed, and how they can help.
            </p>

            {/* Inline Search Card */}
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white p-2 rounded-lg border border-[#304355]/10 shadow-sm flex flex-col md:flex-row gap-2 items-center max-w-lg w-full"
            >
              <div className="flex items-center w-full bg-transparent px-3 py-2 border-b md:border-b-0 md:border-r border-[#304355]/10">
                <Search className="w-5 h-5 text-[#64707A] mr-2 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search districts or PIN..."
                  className="w-full bg-transparent border-none focus:outline-none text-[#1F2933] text-sm placeholder-[#64707A]"
                />
              </div>
              <button
                type="submit"
                className="w-full md:w-auto bg-[#304355] text-white px-8 py-3 rounded-md text-sm font-semibold hover:bg-[#243342] transition-colors whitespace-nowrap"
              >
                Search
              </button>
            </form>
          </div>

          {/* Right Hero Image */}
          <div className="relative h-[360px] lg:h-[460px] rounded-2xl overflow-hidden border border-[#304355]/10 shadow-md">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfsVnqnrwpFodcjNIdpht-hnriOZPn2YaRSx78Y8Sc_jgWQwCI_F9oKuVf9deAij6ANgzAheycf-74TuidvncH0XOAK3sLhux2HrbG1vhwhH7nH9sUo-sLLTowO9hYdXUw4ZDaKxTR4tLPfykXfUWRGfopPDdlN3uzdkY63bGrldRlIma6hy5yIbszViLMALYLqKDB9IdwLrVvaGptPK6bMDxKhVnpJkpDqa_YORtL9KiG9nGfvRgA"
              alt="Community food distribution in Maharashtra"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 2. Primary Action Paths Section */}
      <section className="py-12 px-6 md:px-10">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Path 1: I Want to Help */}
            <div className="bg-white p-8 rounded-xl border border-[#304355]/10 shadow-sm hover:shadow-md transition group flex flex-col h-full">
              <div className="w-14 h-14 bg-[#304355]/10 rounded-full flex items-center justify-center mb-6 text-[#304355] group-hover:bg-[#304355] group-hover:text-white transition-colors">
                <HeartHandshake className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#304355] mb-3">I Want to Help</h3>
              <p className="text-sm text-[#64707A] mb-8 flex-grow leading-relaxed">
                Explore locations and discover where your support can make a difference.
              </p>
              <Link
                to="/explore"
                className="bg-transparent border-2 border-[#304355] text-[#304355] hover:bg-[#304355] hover:text-white font-semibold text-sm px-6 py-2 rounded-md transition-colors self-start inline-block"
              >
                Explore Needs
              </Link>
            </div>

            {/* Path 2: I Need to Submit a Requirement */}
            <div className="bg-white p-8 rounded-xl border border-[#304355]/10 shadow-sm hover:shadow-md transition group flex flex-col h-full">
              <div className="w-14 h-14 bg-[#304355]/10 rounded-full flex items-center justify-center mb-6 text-[#304355] group-hover:bg-[#304355] group-hover:text-white transition-colors">
                <ClipboardPlus className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#304355] mb-3">I Need to Submit a Requirement</h3>
              <p className="text-sm text-[#64707A] mb-8 flex-grow leading-relaxed">
                Submit current food or nutrition-related requirements for your institution or community.
              </p>
              <Link
                to="/submit-requirement"
                className="bg-transparent border-2 border-[#304355] text-[#304355] hover:bg-[#304355] hover:text-white font-semibold text-sm px-6 py-2 rounded-md transition-colors self-start inline-block"
              >
                Submit Requirement
              </Link>
            </div>

            {/* Path 3: I Have Food. Where Should I Donate It? */}
            <div className="bg-white p-8 rounded-xl border border-[#304355]/10 shadow-sm hover:shadow-md transition group flex flex-col h-full lg:col-span-1 md:col-span-2">
              <div className="w-14 h-14 bg-[#304355]/10 rounded-full flex items-center justify-center mb-6 text-[#304355] group-hover:bg-[#304355] group-hover:text-white transition-colors">
                <Utensils className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#304355] mb-2">I Have Food. Where Should I Donate It?</h3>
              <p className="text-sm text-[#64707A] mb-4">What do you have to offer?</p>
              
              <form onSubmit={handleFoodMatchSubmit} className="flex flex-col gap-3 flex-grow mb-6">
                <select
                  value={foodItem}
                  onChange={(e) => setFoodItem(e.target.value)}
                  className="w-full bg-[#FBF9FA] p-3 rounded-md border border-[#304355]/20 text-[#1F2933] text-sm focus:outline-none focus:ring-1 focus:ring-[#304355]"
                >
                  <option value="">Select Item (e.g., Dal, Rice, Grains)</option>
                  <option value="Rice">Rice</option>
                  <option value="Dal / Lentils">Dal / Lentils</option>
                  <option value="Fresh Produce">Fresh Produce</option>
                </select>
                <input
                  type="text"
                  value={foodQty}
                  onChange={(e) => setFoodQty(e.target.value)}
                  placeholder="Quantity (e.g., 50 kg)"
                  className="w-full bg-[#FBF9FA] p-3 rounded-md border border-[#304355]/20 text-[#1F2933] text-sm focus:outline-none focus:ring-1 focus:ring-[#304355]"
                />
                <button
                  type="submit"
                  className="bg-[#304355] text-white font-semibold text-sm px-6 py-2.5 rounded-md hover:bg-[#243342] transition-colors w-full inline-block text-center mt-2 shadow-xs"
                >
                  Find Matching Needs
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 3-Step Journey (How PoshanSetu Works) */}
      <section id="how-it-works" className="py-16 px-6 md:px-10 bg-white/60 border-y border-[#304355]/10">
        <div className="max-w-[1280px] mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-[#304355] mb-12">How PoshanSetu Works</h2>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting horizontal line (desktop) */}
            <div className="hidden md:block absolute top-1/3 left-[15%] right-[15%] h-0.5 bg-[#304355]/20 z-0"></div>

            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center bg-white p-6 rounded-xl border border-[#304355]/10 shadow-xs">
              <div className="w-16 h-16 bg-[#304355] text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 border-4 border-white shadow-sm">
                1
              </div>
              <h3 className="text-xl font-bold text-[#304355] mb-2">Where</h3>
              <p className="text-sm text-[#64707A] leading-relaxed">
                Identify districts and local areas with the highest nutritional gaps.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center bg-white p-6 rounded-xl border border-[#304355]/10 shadow-xs">
              <div className="w-16 h-16 bg-[#304355] text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 border-4 border-white shadow-sm">
                2
              </div>
              <h3 className="text-xl font-bold text-[#304355] mb-2">Why</h3>
              <p className="text-sm text-[#64707A] leading-relaxed">
                Understand the underlying data and specific needs of the community.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center bg-white p-6 rounded-xl border border-[#304355]/10 shadow-xs">
              <div className="w-16 h-16 bg-[#304355] text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 border-4 border-white shadow-sm">
                3
              </div>
              <h3 className="text-xl font-bold text-[#304355] mb-2">How</h3>
              <p className="text-sm text-[#64707A] leading-relaxed">
                Connect directly with verified local requests to provide support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Preview Section (Map & Insights) */}
      <section className="py-20 px-6 md:px-10">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            {/* Left Description Column */}
            <div className="lg:w-1/2 space-y-6">
              <h2 className="text-3xl font-extrabold text-[#304355] tracking-tight">
                Discover Needs in Maharashtra
              </h2>
              <p className="text-base text-[#64707A] leading-relaxed">
                Explore verified nutritional requirements across the state, backed by official data.
              </p>

              {/* Card 1: Official District Insights */}
              <div className="bg-white p-6 rounded-xl border-l-4 border-[#304355] shadow-xs border border-[#304355]/10">
                <h4 className="text-base font-bold text-[#304355] mb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-500" />
                  Official District-Level Insights
                </h4>
                <p className="text-sm text-[#64707A] leading-relaxed">
                  Macro-level data showing areas with systemic nutritional gaps based on government health surveys.
                </p>
              </div>

              {/* Card 2: Current Local Requirements */}
              <div className="bg-white p-6 rounded-xl border-l-4 border-emerald-600 shadow-xs border border-[#304355]/10">
                <h4 className="text-base font-bold text-[#304355] mb-2 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  Current Local Requirements
                </h4>
                <p className="text-sm text-[#64707A] leading-relaxed">
                  Specific, immediate needs posted by registered NGOs, schools, and care centers ready for donations.
                </p>
              </div>

              <Link
                to="/explore"
                className="text-[#304355] font-semibold text-sm inline-flex items-center hover:underline pt-2"
              >
                View Full Map <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            {/* Right Interactive Map Preview */}
            <div className="lg:w-1/2 w-full h-[380px] bg-white rounded-2xl border border-[#304355]/10 shadow-sm flex items-center justify-center relative overflow-hidden">
              <div className="z-10 text-center space-y-2 p-6">
                <div className="w-16 h-16 rounded-full bg-[#304355]/10 text-[#304355] flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-[#304355]">Interactive Maharashtra Map</h4>
                <p className="text-xs text-[#64707A] max-w-sm mx-auto">
                  Click any district to view official nutrition indicators alongside active local food requests.
                </p>
                <Link to="/explore" className="inline-block pt-2">
                  <button className="bg-[#304355] text-white text-xs font-semibold px-4 py-2 rounded-md hover:bg-[#243342] transition">
                    Explore Interactive Map
                  </button>
                </Link>
              </div>

              {/* Simulated interactive map markers */}
              <div
                className="absolute top-[32%] left-[38%] w-4 h-4 bg-red-600 rounded-full animate-pulse shadow-md cursor-pointer"
                title="Nandurbar - High Need Area"
              />
              <div
                className="absolute top-[52%] left-[58%] w-4 h-4 bg-amber-500 rounded-full animate-pulse shadow-md cursor-pointer"
                title="Nashik - Medium Need Area"
              />
              <div
                className="absolute top-[68%] left-[72%] w-4 h-4 bg-emerald-600 rounded-full animate-pulse shadow-md cursor-pointer"
                title="Gadchiroli - Active Need Area"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. Trust & Transparency Section */}
      <section id="transparency" className="bg-[#304355] text-white py-16 px-6 md:px-10">
        <div className="max-w-[1280px] mx-auto text-center">
          <h2 className="text-3xl font-extrabold mb-12 text-white">Committed to Transparency</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto text-emerald-300">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Data Sources</h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
                Insights are derived from official government datasets, including NFHS and local health surveys, to ensure accuracy.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto text-emerald-300">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Reporting Periods</h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
                Local requirements are verified and updated regularly. District insights reflect the latest available public data cycles.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto text-emerald-300">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Direct Connections</h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
                PoshanSetu acts solely as a bridge. We do not process monetary donations or handle funds directly.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
