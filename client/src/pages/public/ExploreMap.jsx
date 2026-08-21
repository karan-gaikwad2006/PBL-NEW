import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronDown,
  Activity,
  Calendar,
  Database
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import MaharashtraDistrictMap from '../../components/domain/MaharashtraDistrictMap';

export default function ExploreMap() {
  const navigate = useNavigate();
  const [selectedDistrict, setSelectedDistrict] = useState('Nashik');
  const [searchQuery, setSearchQuery] = useState('');

  const sampleRequirements = [
    {
      id: 'req-1',
      title: 'Moong Dal',
      amount: '50',
      unit: 'kg needed',
      district: 'Nashik District',
      urgency: 'HIGH',
      urgencyLabel: 'High Urgency',
      urgencyColor: 'bg-amber-500/10 text-amber-700 border-amber-200',
      daysLeft: 12,
      confidence: 'High Confidence Source',
    },
    {
      id: 'req-2',
      title: 'Fortified Rice',
      amount: '120',
      unit: 'kg needed',
      district: 'Pune District',
      urgency: 'CRITICAL',
      urgencyLabel: 'Critical',
      urgencyColor: 'bg-red-500/10 text-red-700 border-red-200',
      daysLeft: 8,
      confidence: 'High Confidence Source',
    },
    {
      id: 'req-3',
      title: 'Jaggery',
      amount: '30',
      unit: 'kg needed',
      district: 'Nashik District',
      urgency: 'POSITIVE',
      urgencyLabel: 'Standard Need',
      urgencyColor: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
      daysLeft: 21,
      confidence: 'High Confidence Source',
    },
  ];

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
            if (district) setSelectedDistrict(district);
          }}
          className="w-full max-w-2xl mx-auto pt-2 relative"
        >
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#64707A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search district, city or location"
              className="w-full bg-white border border-[#304355]/20 rounded-full py-3.5 pl-12 pr-28 text-sm text-[#1F2933] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#304355]"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-[#304355] text-white px-5 py-2 rounded-full text-xs font-semibold hover:bg-[#243342] transition"
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
              onDistrictSelect={setSelectedDistrict}
            />
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
              <div className="bg-[#FFF9C4]/40 border border-[#FBC02D]/40 rounded-xl p-4 flex gap-3 items-start">
                <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-[#1F2933] block">Moderate Attention</span>
                  <span className="text-[#64707A]">Based on official population-level indicators.</span>
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
                  <span className="text-2xl font-extrabold text-[#304355] block">12</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#64707A]">
                    Active Programs
                  </span>
                </div>
                <Activity className="w-8 h-8 text-[#304355]/20" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => navigate(`/districts/${selectedDistrict.toLowerCase()}`)}
                className="w-full bg-[#304355] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#243342] transition shadow-xs flex items-center justify-center gap-2"
              >
                <span>View District Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/requirements')}
                className="w-full bg-white text-[#304355] border border-[#304355]/30 py-3 rounded-xl font-semibold text-sm hover:bg-slate-50 transition flex items-center justify-center gap-2"
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
            <h3 className="text-2xl font-extrabold text-[#304355]">Active Requirements in this Area</h3>
            <p className="text-sm text-[#64707A]">Showing verified needs from local institutions in Nashik and surrounding areas.</p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {['Location', 'Attention Level', 'Urgency', 'Institution Type'].map((filter) => (
              <button
                key={filter}
                className="bg-white border border-[#304355]/20 px-4 py-2 rounded-full text-xs font-semibold text-[#1F2933] hover:bg-slate-50 transition flex items-center gap-1 shadow-xs"
              >
                <span>{filter}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#64707A]" />
              </button>
            ))}
          </div>
        </div>

        {/* Bento Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleRequirements.map((req) => (
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
                  <h4 className="text-xl font-bold text-[#304355]">{req.title}</h4>

                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-3xl font-extrabold text-[#304355]">{req.amount}</span>
                    <span className="text-xs text-[#64707A]">{req.unit}</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 text-xs">
                  <div className="flex items-center gap-1.5 text-[#64707A]">
                    <MapPin className="w-4 h-4 text-[#304355]" />
                    <span>{req.district}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{req.confidence}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/requirements')}
                className="mt-6 w-full bg-white border border-[#304355] text-[#304355] hover:bg-[#304355] hover:text-white py-2.5 rounded-xl font-semibold text-xs transition"
              >
                Pledge Support
              </button>
            </div>
          ))}
        </div>

        <div className="text-center pt-4">
          <button
            onClick={() => navigate('/requirements')}
            className="text-[#304355] font-semibold text-sm inline-flex items-center gap-1.5 hover:underline"
          >
            <span>Load More Requirements</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </section>

    </div>
  );
}
