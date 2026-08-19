import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ChevronRight,
  Calendar,
  Clock,
  Database,
  TrendingUp,
  AlertTriangle,
  Users,
  HeartHandshake,
  Info,
  Utensils,
  ChevronDown,
  ChevronUp,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Truck,
  Sparkles
} from 'lucide-react';
import Badge from '../../components/common/Badge';

export default function DistrictInsights() {
  const navigate = useNavigate();
  const { districtId } = useParams();
  const districtName = districtId ? districtId.charAt(0).toUpperCase() + districtId.slice(1) : 'Nashik';
  const [showPulsesDetails, setShowPulsesDetails] = useState(false);

  return (
    <div className="bg-[#E8E8E2] min-h-screen text-[#1F2933] font-sans pb-16">
      <main className="max-w-[1280px] mx-auto px-6 md:px-10 py-8 space-y-10">
        {/* Breadcrumb & Header */}
        <header className="space-y-4">
          <nav className="flex items-center gap-2 text-xs font-semibold text-[#64707A]">
            <Link to="/explore" className="hover:text-[#304355] transition">Explore Needs</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/explore" className="hover:text-[#304355] transition">Maharashtra</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#1F2933]">{districtName}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-[#304355] tracking-tight">
                {districtName} District
              </h1>
              <p className="text-xs md:text-sm text-[#64707A] mt-2 flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-[#304355]" /> Reporting period: 2019-21
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-[#304355]" /> Last Sync: Oct 2023
                </span>
                <span className="flex items-center gap-1">
                  <Database className="w-4 h-4 text-[#304355]" /> Source: NFHS-5
                </span>
              </p>
            </div>
          </div>
        </header>

        {/* Section 1 (WHERE) & Section 2 (WHY) Bento Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Section 1 (WHERE): Overall Assessment */}
          <div className="bg-white rounded-2xl p-6 border border-[#304355]/10 shadow-xs flex flex-col justify-between space-y-6 col-span-1">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[#304355] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#304355]" /> Overall Assessment
              </h2>

              <div className="bg-[#FFF9C4]/40 border border-[#FBC02D]/40 p-4 rounded-xl flex justify-between items-center">
                <span className="text-sm font-semibold text-[#1F2933]">Status</span>
                <span className="bg-[#FBC02D] text-[#1F2933] font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-xs">
                  <AlertTriangle className="w-3.5 h-3.5" /> Moderate Attention
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#304355]/10">
              <div className="bg-[#FBF9FA] p-4 rounded-xl border border-[#304355]/5 space-y-1">
                <Users className="w-5 h-5 text-[#304355]" />
                <span className="text-2xl font-extrabold text-[#304355] block">~45k</span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64707A]">
                  Children Under 5
                </span>
              </div>

              <div className="bg-[#FBF9FA] p-4 rounded-xl border border-[#304355]/5 space-y-1">
                <HeartHandshake className="w-5 h-5 text-[#304355]" />
                <span className="text-2xl font-extrabold text-[#304355] block">12</span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64707A]">
                  Active Interventions
                </span>
              </div>
            </div>
          </div>

          {/* Section 2 (WHY): Why does this location need attention? */}
          <div className="bg-white rounded-2xl p-6 border border-[#304355]/10 shadow-xs col-span-1 lg:col-span-2 flex flex-col justify-between space-y-6 relative overflow-hidden">
            <h2 className="text-lg font-bold text-[#304355] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#304355]" /> Why does this location need attention?
            </h2>

            {/* 3 Nutrition Indicator Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Stunting */}
              <div className="bg-red-50/60 border border-red-200 rounded-xl p-5 space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-[#1F2933]">Stunting</span>
                  <TrendingUp className="w-4 h-4 text-red-600" />
                </div>
                <span className="text-3xl font-extrabold text-red-600 block">38.4%</span>
                <span className="bg-red-600 text-white font-bold text-[10px] px-2 py-0.5 rounded inline-block uppercase">
                  Critical
                </span>
              </div>

              {/* Wasting */}
              <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-5 space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-[#1F2933]">Wasting</span>
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                </div>
                <span className="text-3xl font-extrabold text-amber-600 block">21.2%</span>
                <span className="bg-amber-600 text-white font-bold text-[10px] px-2 py-0.5 rounded inline-block uppercase">
                  High
                </span>
              </div>

              {/* Underweight */}
              <div className="bg-yellow-50/60 border border-yellow-200 rounded-xl p-5 space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-[#1F2933]">Underweight</span>
                  <TrendingUp className="w-4 h-4 text-yellow-600" />
                </div>
                <span className="text-3xl font-extrabold text-yellow-700 block">32.6%</span>
                <span className="bg-yellow-500 text-[#1F2933] font-bold text-[10px] px-2 py-0.5 rounded inline-block uppercase">
                  Elevated
                </span>
              </div>
            </div>

            {/* Medical Disclaimer */}
            <div className="pt-4 border-t border-[#304355]/10 flex items-start gap-2 text-xs text-[#64707A] italic">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <p>
                Medical Disclaimer: The data presented is based on government surveys (NFHS-5) and represents statistical estimates. It should not be used for individual medical diagnosis.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3 (HOW): How can you help? */}
        <section className="space-y-6">
          <h2 className="text-2xl font-extrabold text-[#304355] border-b border-[#304355]/10 pb-4">
            How can you help?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Cereals */}
            <div className="bg-white rounded-2xl p-6 border border-[#304355]/10 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#304355]/10 flex items-center justify-center text-[#304355]">
                <Utensils className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#1F2933]">Cereals</h3>
              <p className="text-sm text-[#64707A] leading-relaxed">
                Provide energy-dense staples like Rice and Jowar to support basic caloric needs.
              </p>
            </div>

            {/* Pulses (Interactive Expandable) */}
            <div className="bg-white rounded-2xl border border-[#304355]/10 shadow-xs flex flex-col overflow-hidden">
              <div className="p-6 pb-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#304355]/10 flex items-center justify-center text-[#304355]">
                  <Utensils className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#1F2933]">Pulses</h3>
                <p className="text-sm text-[#64707A] leading-relaxed">
                  Essential for protein intake. Moong Dal and Chana are highly recommended.
                </p>
              </div>

              <div
                onClick={() => setShowPulsesDetails(!showPulsesDetails)}
                className="bg-[#FBF9FA] px-6 py-3 border-t border-[#304355]/10 cursor-pointer flex justify-between items-center hover:bg-slate-100 transition"
              >
                <span className="text-xs font-semibold text-[#304355]">
                  Nutrition Contribution: Moong Dal
                </span>
                {showPulsesDetails ? (
                  <ChevronUp className="w-4 h-4 text-[#304355]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#304355]" />
                )}
              </div>

              {showPulsesDetails && (
                <div className="bg-[#FBF9FA] px-6 pb-4 pt-2 border-t border-[#304355]/5 flex gap-2 flex-wrap">
                  <span className="bg-white border border-[#304355]/10 px-3 py-1 rounded-full text-xs font-semibold text-[#1F2933]">
                    Protein
                  </span>
                  <span className="bg-white border border-[#304355]/10 px-3 py-1 rounded-full text-xs font-semibold text-[#1F2933]">
                    Iron
                  </span>
                  <span className="bg-white border border-[#304355]/10 px-3 py-1 rounded-full text-xs font-semibold text-[#1F2933]">
                    Fiber
                  </span>
                </div>
              )}
            </div>

            {/* Diverse Support */}
            <div className="bg-white rounded-2xl p-6 border border-[#304355]/10 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#304355]/10 flex items-center justify-center text-[#304355]">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#1F2933]">Diverse Support</h3>
              <p className="text-sm text-[#64707A] leading-relaxed">
                Contribute towards varied dietary needs, including fortified oils and specific local requirements.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4 (CURRENT NEEDS): Active Local Requirements */}
        <section className="space-y-6">
          <div className="flex justify-between items-end border-b border-[#304355]/10 pb-4">
            <h2 className="text-2xl font-extrabold text-[#304355] flex items-center gap-2">
              <Truck className="w-6 h-6 text-[#304355]" /> Active Local Requirements
            </h2>
            <Link to="/requirements" className="text-xs font-semibold text-[#304355] hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card A */}
            <div className="bg-white rounded-2xl border border-[#304355]/10 p-6 shadow-xs flex flex-col justify-between space-y-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-[#1F2933]">Ashram Shala</h3>
                  <p className="text-xs text-[#64707A] flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#304355]" /> Trimbakeshwar
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="bg-amber-50 text-amber-700 font-bold text-xs px-2.5 py-1 rounded-md border border-amber-200">
                    High Urgency
                  </span>
                  <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified
                  </span>
                </div>
              </div>

              {/* Progress Box */}
              <div className="bg-[#FBF9FA] rounded-xl p-4 border border-[#304355]/10 space-y-2">
                <div className="flex justify-between text-xs font-bold text-[#1F2933]">
                  <span>Rice</span>
                  <span>120kg Needed</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                  <div className="bg-[#304355] h-2.5 rounded-full" style={{ width: '33%' }} />
                </div>
                <div className="flex justify-between text-[11px] text-[#64707A]">
                  <span>40kg Fulfilled</span>
                  <span className="font-semibold text-[#304355]">80kg Remaining</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/requirements')}
                className="w-full bg-[#304355] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#243342] transition shadow-xs"
              >
                Contribute Rice
              </button>
            </div>

            {/* Card B */}
            <div className="bg-white rounded-2xl border border-[#304355]/10 p-6 shadow-xs flex flex-col justify-between space-y-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-[#1F2933]">Community Center</h3>
                  <p className="text-xs text-[#64707A] flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#304355]" /> Nashik East
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="bg-red-50 text-red-700 font-bold text-xs px-2.5 py-1 rounded-md border border-red-200">
                    Critical Urgency
                  </span>
                  <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified
                  </span>
                </div>
              </div>

              {/* Progress Box */}
              <div className="bg-[#FBF9FA] rounded-xl p-4 border border-[#304355]/10 space-y-2">
                <div className="flex justify-between text-xs font-bold text-[#1F2933]">
                  <span>Moong Dal</span>
                  <span>50kg Needed</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                  <div className="bg-red-600 h-2.5 rounded-full" style={{ width: '0%' }} />
                </div>
                <div className="flex justify-between text-[11px] text-[#64707A]">
                  <span>0kg Fulfilled</span>
                  <span className="font-semibold text-[#304355]">50kg Remaining</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/requirements')}
                className="w-full bg-[#304355] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#243342] transition shadow-xs"
              >
                Contribute Moong Dal
              </button>
            </div>
          </div>
        </section>

        {/* Data Transparency Section */}
        <section className="bg-[#304355]/5 rounded-2xl p-6 border border-[#304355]/10 flex flex-col md:flex-row gap-6 items-start">
          <div className="p-3 bg-[#304355]/10 rounded-full text-[#304355] shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div className="space-y-3">
            <h3 className="text-base font-bold text-[#1F2933]">Understanding the Data</h3>
            <p className="text-xs text-[#64707A] leading-relaxed">
              PoshanSetu aggregates data from two distinct layers to provide a comprehensive view of nutritional needs:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-[#1F2933] block">Official Data Layers</span>
                <span className="text-[#64707A]">
                  Macro-level statistics derived from government surveys (NFHS-5). These inform the 'Overall Assessment' and structural needs.
                </span>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-[#1F2933] block">Submitted Requirements</span>
                <span className="text-[#64707A]">
                  Micro-level, real-time requests submitted by local NGOs and community centers. These form the 'Active Local Requirements'.
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
