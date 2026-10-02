import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { offerService } from '../../services/api';
import {
  Heart,
  Clock,
  CheckCircle2,
  ArrowRight,
  Search,
  SlidersHorizontal,
  ShieldCheck,
  Scale,
  Truck,
  ClipboardCheck,
  Check,
  FileText,
  Download,
  AlertCircle,
  MapPin,
  Calendar,
  Building2,
} from 'lucide-react';

// ─── Smooth Spline Calculation ────────────────────────────────────────────────
function getSmoothPath(points) {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

const TREND_POINTS = Object.freeze([
  { x: 26, y: 96, month: 'Nov' },
  { x: 54, y: 106, month: 'Dec' },
  { x: 82, y: 84, month: 'Jan' },
  { x: 110, y: 96, month: 'Feb' },
  { x: 138, y: 76, month: 'Mar' },
  { x: 166, y: 88, month: 'Apr' },
  { x: 194, y: 66, month: 'May' },
  { x: 222, y: 80, month: 'Jun' },
  { x: 250, y: 60, month: 'Jul' },
  { x: 278, y: 76, month: 'Aug' },
  { x: 306, y: 32, month: 'Sep' }, // Peak point
  { x: 334, y: 72, month: 'Oct' },
]);

// ─── Smooth Donation Trends Chart (Uniform 1/3 Card) ──────────────────────────
function SmoothDonationTrendsChart() {
  const [selectedCause, setSelectedCause] = useState('All Causes');

  const smoothCurve = useMemo(() => getSmoothPath(TREND_POINTS), []);
  const areaPath = useMemo(
    () => `${smoothCurve} L ${TREND_POINTS[TREND_POINTS.length - 1].x} 125 L ${TREND_POINTS[0].x} 125 Z`,
    [smoothCurve]
  );

  return (
    <div className="bg-white rounded-2xl border border-[#E8E6E8] p-5 shadow-[0_2px_10px_rgba(25,45,62,0.04)] h-full min-h-[310px] flex flex-col justify-between">
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h2 className="text-[16px] font-bold text-[#1F2933] tracking-tight">Donation Trends</h2>
            <p className="text-[10.5px] text-[#64707A] leading-tight mt-0.5">
              Outflows over 12 cycles (Nov 2025 - Oct 2026)
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0 bg-[#F4F2F3] p-0.5 rounded-lg">
            {['All', 'Food', 'Funds'].map((cause) => (
              <button
                key={cause}
                onClick={() => setSelectedCause(cause)}
                className={`text-[9.5px] px-2 py-0.5 rounded-md font-medium transition-all ${
                  selectedCause === cause
                    ? 'bg-white text-[#192D3E] shadow-xs font-semibold'
                    : 'text-[#64707A] hover:text-[#192D3E]'
                }`}
              >
                {cause}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="relative mt-2 h-[145px] w-full select-none">
          {/* Tooltip Card for Sep 2026 */}
          <div className="absolute top-0 right-2 sm:right-6 bg-[#1D2E3B] text-white rounded-xl px-2.5 py-1.5 shadow-lg border border-slate-700/60 z-20 pointer-events-none min-w-[140px]">
            <div className="flex items-center justify-between text-[8px] text-slate-300 font-medium">
              <span>Sep 2026</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            </div>
            <div className="text-[14px] font-bold text-white tracking-tight leading-none my-0.5">
              1,450 kg
            </div>
            <div className="text-[7.5px] text-slate-300 leading-tight truncate">
              Ashram Shala & Nutrition
            </div>
          </div>

          <svg viewBox="0 0 355 140" className="w-full h-full overflow-visible" preserveAspectRatio="none">
            <defs>
              <linearGradient id="uniformTrendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1B7A4E" stopOpacity="0.22" />
                <stop offset="60%" stopColor="#1B7A4E" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#1B7A4E" stopOpacity="0.00" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[
              { y: 20, label: '3k' },
              { y: 52, label: '2k' },
              { y: 84, label: '1k' },
              { y: 116, label: '0' },
            ].map((grid) => (
              <g key={grid.label}>
                <line
                  x1="22"
                  x2="345"
                  y1={grid.y}
                  y2={grid.y}
                  stroke="#EFECEE"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x="14"
                  y={grid.y + 3}
                  textAnchor="end"
                  fill="#94A3B8"
                  fontSize="8"
                  fontFamily="sans-serif"
                >
                  {grid.label}
                </text>
              </g>
            ))}

            {/* Benchmark Yield Baseline */}
            <path
              d="M 26 86 Q 160 80, 334 82"
              fill="none"
              stroke="#94A3B8"
              strokeDasharray="3 3"
              strokeWidth="1.2"
              strokeOpacity="0.75"
            />

            {/* Smooth Fill */}
            <path d={areaPath} fill="url(#uniformTrendGrad)" />

            {/* Smooth Emerald Curve */}
            <path
              d={smoothCurve}
              fill="none"
              stroke="#1B7A4E"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Vertical Guide for Sep */}
            <line
              x1="306"
              x2="306"
              y1="34"
              y2="116"
              stroke="#1B7A4E"
              strokeDasharray="2 3"
              strokeWidth="1"
              opacity="0.4"
            />

            {/* Sep Peak Point */}
            <circle cx="306" cy="32" r="5.5" fill="none" stroke="#1B7A4E" strokeWidth="1.5" opacity="0.3" />
            <circle cx="306" cy="32" r="3.5" fill="#FFFFFF" stroke="#1B7A4E" strokeWidth="2" />

            {/* Month labels */}
            {TREND_POINTS.map((p, idx) => (
              <g key={p.month}>
                <text
                  x={p.x}
                  y="133"
                  textAnchor="middle"
                  fill={idx === 10 ? '#192D3E' : '#64707A'}
                  fontSize={idx === 10 ? '8.5' : '7.5'}
                  fontWeight={idx === 10 ? '700' : '500'}
                  fontFamily="sans-serif"
                >
                  {p.month}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Footer / Legend */}
      <div className="pt-2 border-t border-[#F0EDEF] flex items-center justify-between gap-1 text-[9.5px] text-[#64707A]">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-medium text-[#43474C]">
            <span className="w-2.5 h-[2px] rounded-full bg-[#1B7A4E] inline-block" />
            Deployments
          </span>
          <span className="flex items-center gap-1 text-[#64707A]">
            <span className="w-2.5 border-t border-dashed border-[#94A3B8] inline-block" />
            Baseline
          </span>
        </div>

        <span className="flex items-center gap-0.5 text-[#388E3C] font-semibold shrink-0">
          <ShieldCheck className="w-3 h-3" />
          DBT Verified
        </span>
      </div>
    </div>
  );
}

// ─── Audited Dispatch Metric Card (Uniform 1/3 Card) ──────────────────────────
function AuditedDispatchMetricCard({ totalSupports, completionRate }) {
  return (
    <div className="bg-[#192D3E] text-white rounded-2xl p-5 shadow-sm h-full min-h-[310px] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[10px] font-bold tracking-wider uppercase text-[#D0E5FB]">
            Audited Dispatch Metric
          </span>
          <span className="inline-flex items-center gap-1 text-[9.5px] font-semibold px-2 py-0.5 rounded-md bg-white/10 text-white/90">
            <Clock className="w-3 h-3 text-[#A7F3D0]" />
            Q1 2026
          </span>
        </div>

        <div className="flex items-center gap-4 my-2">
          {/* Circular Gauge */}
          <div className="relative w-[76px] h-[76px] rounded-full shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#2B4052"
                strokeWidth="3.2"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#10B981"
                strokeWidth="3.2"
                strokeDasharray={`${Math.max(10, completionRate)}, 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[16px] font-bold text-white tracking-tight">{completionRate}%</span>
            </div>
          </div>

          <div>
            <h3 className="text-[15px] font-bold text-white leading-tight">Fulfillment Rate</h3>
            <p className="text-[11px] text-white/70 mt-1">
              {totalSupports || 8} pledges fulfilled on schedule
            </p>
          </div>
        </div>

        <p className="text-[11px] leading-relaxed text-white/80 mt-3">
          All scheduled staple pledges for Q1 2026 have reached verified ashram kitchens with zero intermediary food loss or diversion.
        </p>
      </div>

      <Link
        to="/requirements"
        className="mt-3 pt-2.5 border-t border-white/10 inline-flex items-center justify-between text-[11px] font-semibold text-[#8FD4A6] hover:text-white transition-colors"
      >
        <span>View fulfillment audit logs</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

// ─── Pledge Fulfillment Status Card (Uniform 1/3 Card) ────────────────────────
function PledgeFulfillmentStatusCard({ totalSupports, stats }) {
  const completed = Number(stats.completedSupports || 4);
  const inTransit = Number(stats.activeSupports || 2);
  const partial = Number(stats.partiallySupported || 2);
  const total = totalSupports || completed + inTransit + partial;

  return (
    <div className="bg-white rounded-2xl border border-[#E8E6E8] p-5 shadow-[0_2px_10px_rgba(25,45,62,0.04)] h-full min-h-[310px] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <h2 className="text-[16px] font-bold text-[#1F2933]">Pledge Fulfillment Status</h2>
          <span className="text-[10.5px] font-semibold text-[#64707A]">{total} Total Supports</span>
        </div>

        <div className="flex items-center gap-4 py-1">
          {/* Donut Chart */}
          <div
            className="relative w-[96px] h-[96px] rounded-full shrink-0 shadow-xs"
            style={{
              background: `conic-gradient(
                #16A34A 0% 50%,
                #3B82F6 50% 75%,
                #F57C00 75% 100%
              )`,
            }}
          >
            <div className="absolute inset-[16px] rounded-full bg-white flex flex-col items-center justify-center">
              <span className="text-[18px] font-bold text-[#1F2933] leading-none">{total}</span>
              <span className="text-[8px] font-bold uppercase tracking-wider text-[#64707A] mt-0.5">
                Pledges
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] mt-1 shrink-0" />
              <div>
                <p className="text-[11px] font-semibold text-[#1F2933] leading-none">Completed</p>
                <p className="text-[9.5px] text-[#64707A] mt-0.5">
                  {completed} handoffs ({Math.round((completed / total) * 100)}%)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-[#3B82F6] mt-1 shrink-0" />
              <div>
                <p className="text-[11px] font-semibold text-[#1F2933] leading-none">Active In-Transit</p>
                <p className="text-[9.5px] text-[#64707A] mt-0.5">
                  {inTransit} batches ({Math.round((inTransit / total) * 100)}%)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F57C00] mt-1 shrink-0" />
              <div>
                <p className="text-[11px] font-semibold text-[#1F2933] leading-none">Partially Supported</p>
                <p className="text-[9.5px] text-[#64707A] mt-0.5">
                  {partial} campaigns ({Math.round((partial / total) * 100)}%)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-[10px] text-[#64707A] pt-2 border-t border-[#F0EDEF]">
        Audited against Ashram Shala intake manifests.
      </div>
    </div>
  );
}

// ─── Support By Category Card (Uniform 1/3 Card) ──────────────────────────────
function SupportByCategoryCard({ totalWeightKg }) {
  const categories = [
    { name: 'Grains & Rice (Kolam & Indrayani)', weight: '150 kg', percent: 53, color: '#1E293B' },
    { name: 'Pulses & Lentils (Toor & Moong Dal)', weight: '70 kg', percent: 25, color: '#2B4257' },
    { name: 'Millets (Jowar, Bajra & Ragi)', weight: '40 kg', percent: 14, color: '#388E3C' },
    { name: 'Fortified Edible Oil', weight: '20 L', percent: 7, color: '#F57C00' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#E8E6E8] p-5 shadow-[0_2px_10px_rgba(25,45,62,0.04)] h-full min-h-[320px] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <h2 className="text-[16px] font-bold text-[#1F2933]">Support by Category</h2>
          <span className="text-[11px] font-semibold text-[#64707A]">{totalWeightKg || 280} kg total</span>
        </div>

        <div className="space-y-2.5 my-1">
          {categories.map((c) => (
            <div key={c.name}>
              <div className="flex justify-between items-center text-[10px] mb-1">
                <span className="font-semibold text-[#304355] truncate">{c.name}</span>
                <span className="font-bold text-[#1F2933] shrink-0 ml-1.5">
                  {c.weight} <span className="font-normal text-[#64707A]">({c.percent}%)</span>
                </span>
              </div>
              <div className="w-full bg-[#EAE8EA] rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${c.percent}%`, backgroundColor: c.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 rounded-xl bg-[#F5F3F4] px-3 py-2 flex items-center justify-between gap-2 text-[10.5px]">
        <span className="text-[#64707A] font-medium">Nutritional Equivalence</span>
        <span className="font-bold text-[#1F2933]">~4,200 Meals</span>
      </div>
    </div>
  );
}

// ─── Districts Supported Map Card (Uniform 1/3 Card) ──────────────────────────
function DistrictsSupportedMap() {
  return (
    <div className="bg-white rounded-2xl border border-[#E8E6E8] p-5 shadow-[0_2px_10px_rgba(25,45,62,0.04)] h-full min-h-[320px] flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h2 className="text-[16px] font-bold text-[#1F2933] tracking-tight">
              Districts You've Supported
            </h2>
            <p className="text-[10.5px] text-[#64707A] mt-0.5">
              Direct regional clusters receiving your drops
            </p>
          </div>

          <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded-md bg-[#F4F2F3] text-[#304355] border border-[#E4E2E3] shrink-0">
            2 Hubs
          </span>
        </div>

        {/* Map Canvas */}
        <div className="relative rounded-xl bg-[#F8F6F7] border border-[#EBE8EA] p-1 overflow-hidden flex items-center justify-center h-[135px]">
          <svg viewBox="0 0 350 145" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <defs>
              <filter id="uniformMapPinShadow" x="-10%" y="-10%" width="130%" height="130%">
                <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#000000" floodOpacity="0.2" />
              </filter>
            </defs>

            {/* Base Maharashtra Outline */}
            <path
              d="M 35 70 
                 C 50 45, 80 32, 120 26 
                 C 165 22, 215 28, 260 40 
                 C 300 50, 330 68, 325 98 
                 C 320 120, 275 130, 235 125 
                 C 195 122, 145 132, 105 126 
                 C 70 122, 35 98, 35 70 Z"
              fill="#EAE5E8"
              stroke="#DDD7DA"
              strokeWidth="1.2"
            />

            {/* Nandurbar Cluster Polygon */}
            <path
              d="M 95 35 C 112 32, 140 30, 155 38 C 158 52, 144 62, 125 65 C 106 63, 91 54, 95 35 Z"
              fill="#2D3B48"
              stroke="#1D2A36"
              strokeWidth="0.8"
            />

            {/* Nashik Cluster Polygon */}
            <path
              d="M 82 70 C 102 66, 134 68, 144 78 C 140 96, 118 105, 96 102 C 76 98, 70 84, 82 70 Z"
              fill="#1E2A36"
              stroke="#121C26"
              strokeWidth="0.8"
            />

            {/* Logistics Route */}
            <path d="M 112 86 L 125 50" fill="none" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="3 3" />

            {/* Nandurbar Tag */}
            <g filter="url(#uniformMapPinShadow)">
              <circle cx="125" cy="48" r="3" fill="#FFFFFF" stroke="#1D2E3B" strokeWidth="1.5" />
              <rect x="132" y="26" width="98" height="19" rx="5" fill="#192D3E" />
              <circle cx="140" cy="35.5" r="2" fill="#10B981" />
              <text x="147" y="38.5" fill="#FFFFFF" fontSize="8.5" fontWeight="700" fontFamily="sans-serif">
                Nandurbar (120 kg)
              </text>
            </g>

            {/* Nashik Tag */}
            <g filter="url(#uniformMapPinShadow)">
              <circle cx="110" cy="88" r="3" fill="#FFFFFF" stroke="#1D2E3B" strokeWidth="1.5" />
              <rect x="122" y="65" width="86" height="19" rx="5" fill="#192D3E" />
              <circle cx="130" cy="74.5" r="2" fill="#3B82F6" />
              <text x="137" y="77.5" fill="#FFFFFF" fontSize="8.5" fontWeight="700" fontFamily="sans-serif">
                Nashik (160 kg)
              </text>
            </g>

            <text x="270" y="112" textAnchor="middle" fill="#B5AFB3" fontSize="8" fontWeight="500" letterSpacing="0.05em">
              Agro-logistics Corridor
            </text>
          </svg>
        </div>
      </div>

      {/* Cluster summary boxes */}
      <div className="grid grid-cols-2 gap-2 mt-2">
        <div className="bg-[#F4F2F3] rounded-xl p-2 border border-[#E9E6E8]">
          <span className="text-[8.5px] font-bold uppercase tracking-wider text-[#64707A] block">
            Nashik Cluster
          </span>
          <span className="text-[11px] font-bold text-[#1F2933] mt-0.5 block leading-tight">
            160 kg • 2 Ashrams
          </span>
        </div>

        <div className="bg-[#F4F2F3] rounded-xl p-2 border border-[#E9E6E8]">
          <span className="text-[8.5px] font-bold uppercase tracking-wider text-[#64707A] block">
            Nandurbar Cluster
          </span>
          <span className="text-[11px] font-bold text-[#1F2933] mt-0.5 block leading-tight">
            120 kg • 1 Hostel
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Supported Institutions & Activity Card (Uniform 1/3 Card) ────────────────
function SupportedInstitutionsAndActivityCard({ dynamicInstitutions }) {
  const [tab, setTab] = useState('institutions');

  const defaultInstitutions = [
    { code: 'TR', isDark: true, name: 'Trimbakeshwar Ashram Shala', location: 'Nashik • 90 kg total' },
    { code: 'NT', isDark: false, name: 'Nandurbar Tribal Residential', location: 'Dhadgaon • 120 kg total' },
    { code: 'SV', isDark: false, name: 'Swami Vivekananda Ashram', location: 'Igatpuri • 50 kg total' },
    { code: 'KG', isDark: false, name: 'Kasturba Gandhi Balika', location: 'Peint • 40 kg total' },
  ];

  const institutions = (dynamicInstitutions && dynamicInstitutions.length > 0)
    ? dynamicInstitutions.slice(0, 4).map((inst, i) => ({
        code: (inst.institution || 'IN').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
        isDark: i === 0,
        name: inst.institution,
        location: `${inst.location} • Active`,
      }))
    : defaultInstitutions;

  const events = [
    {
      dot: 'bg-[#F57C00]',
      title: 'Warden Anand Rao signed physical receipt',
      desc: '40 kg Moong Dal • Action Needed',
    },
    {
      dot: 'bg-[#3B82F6]',
      title: 'Carrier Nashik Agro Logistics picked up',
      desc: '50 kg Kolam Rice • Scheduled handoff',
    },
    {
      dot: 'bg-[#16A34A]',
      title: 'Kasturba Balika Vidyalaya confirmed consumption',
      desc: '40 kg Jowar & Ragi • Audit Verified',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#E8E6E8] p-5 shadow-[0_2px_10px_rgba(25,45,62,0.04)] h-full min-h-[320px] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1 bg-[#F4F2F3] p-0.5 rounded-lg">
            <button
              onClick={() => setTab('institutions')}
              className={`text-[10px] px-2.5 py-1 rounded-md font-semibold transition-all ${
                tab === 'institutions'
                  ? 'bg-white text-[#192D3E] shadow-xs'
                  : 'text-[#64707A] hover:text-[#192D3E]'
              }`}
            >
              Institutions ({institutions.length})
            </button>
            <button
              onClick={() => setTab('activity')}
              className={`text-[10px] px-2.5 py-1 rounded-md font-semibold transition-all ${
                tab === 'activity'
                  ? 'bg-white text-[#192D3E] shadow-xs'
                  : 'text-[#64707A] hover:text-[#192D3E]'
              }`}
            >
              Recent Activity
            </button>
          </div>

          <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded-md bg-[#E8F5E9] text-[#2E7D32]">
            Verified
          </span>
        </div>

        {tab === 'institutions' ? (
          <div className="divide-y divide-[#F0EDEF]">
            {institutions.map((inst, i) => (
              <div key={i} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-[9.5px] font-bold shrink-0 ${
                      inst.isDark ? 'bg-[#192D3E] text-white' : 'bg-[#EAE8EA] text-[#304355]'
                    }`}
                  >
                    {inst.code}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-[#1F2933] truncate">{inst.name}</p>
                    <p className="text-[9.5px] text-[#64707A] truncate">{inst.location}</p>
                  </div>
                </div>

                <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
              </div>
            ))}
          </div>
        ) : (
          <div className="relative pl-3 space-y-2.5 before:absolute before:left-[4px] before:top-2 before:bottom-2 before:w-[1px] before:bg-[#EAE8EA]">
            {events.map((ev, i) => (
              <div key={i} className="relative">
                <span className={`absolute -left-[11px] top-1.5 w-2 h-2 rounded-full ring-2 ring-white ${ev.dot}`} />
                <p className="text-[10.5px] font-semibold text-[#1F2933] leading-snug">{ev.title}</p>
                <p className="text-[9.5px] text-[#64707A] mt-0.5">{ev.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-[#F0EDEF] flex items-center justify-between text-[9.5px] text-[#64707A]">
        <span>Ashram Shala network verified</span>
        <Clock className="w-3 h-3 text-[#64707A]" />
      </div>
    </div>
  );
}

// ─── Dynamic Live Support Card Component (Preserving Full Business Logic) ─────
function DynamicSupportCard({ support, onConfirmDelivery }) {
  const isPartial = support.isPartial;
  const pendingOffers = support.donorOffers?.filter((o) => o.status === 'pending') || [];
  const actionRequired = pendingOffers.length > 0;
  const inTransit = support.hasActive && !actionRequired;

  const items = Array.isArray(support.items) ? support.items : [];

  return (
    <div className="bg-[#FAF8F9] rounded-xl border border-[#EBE7E9] p-4 sm:p-5 hover:border-[#D6D2D4] transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {actionRequired ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFF4E8] text-[#C96A00] border border-[#FFD8AE]">
                <AlertCircle className="w-3 h-3 text-[#F57C00]" />
                Action Needed
              </span>
            ) : inTransit ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#E8F0FE] text-[#1E40AF] border border-[#BFDBFE]">
                <Truck className="w-3 h-3" />
                In Transit
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]">
                <Check className="w-3 h-3" />
                Completed
              </span>
            )}

            {isPartial && (
              <span className="inline-flex items-center text-[9.5px] font-bold px-2 py-0.5 rounded bg-[#EAF2FF] text-[#315F9A] border border-[#C9DDF8]">
                Partial Fulfillment
              </span>
            )}

            <h3 className="text-[15px] font-bold text-[#1F2933]">
              {support.requirementTitle || 'Ashram Shala Nutrition Support'}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#555E68]">
            {support.institution && (
              <span className="inline-flex items-center gap-1 font-medium text-[#1F2933]">
                <Building2 className="w-3.5 h-3.5 text-[#64707A]" />
                {support.institution}
              </span>
            )}
            {support.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#64707A]" />
                {support.location}
              </span>
            )}
            {support.lastOfferedOn && (
              <span className="inline-flex items-center gap-1 text-[#64707A]">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(support.lastOfferedOn).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            )}
          </div>

          {/* Dynamic Item Progress Bars */}
          {items.length > 0 && (
            <div className="space-y-2 pt-1 max-w-2xl">
              {items.map((itm, idx) => {
                const yourSupport = Number(itm.donorSupportedQuantity || 0);
                const required = Number(itm.quantityRequired || 0);
                const remaining = Number(itm.quantityRemaining || 0);
                const percent = required ? Math.min(100, Math.round((yourSupport / required) * 100)) : 100;

                return (
                  <div key={idx} className="bg-white/70 p-2 rounded-lg border border-[#EAE6E8]">
                    <div className="flex justify-between items-center text-[10.5px] mb-1">
                      <span className="font-semibold text-[#1F2933]">
                        {itm.name} ({required} {itm.unit} requirement)
                      </span>
                      <span className="font-bold text-[#16A34A]">Your Support: {yourSupport} {itm.unit}</span>
                    </div>

                    <div className="flex items-center justify-between text-[9.5px] text-[#64707A] mb-1">
                      <span>Remaining needed: {remaining} {itm.unit}</span>
                      <span>{percent}% allocated</span>
                    </div>

                    <div className="w-full bg-[#EAE8EA] rounded-full h-1.5 overflow-hidden flex">
                      <div className="bg-[#10B981] h-full transition-all duration-500" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Buttons with Real Navigation */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2 shrink-0">
          <Link
            to={`/requirements/${support.requirementId}`}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-[#D8DDE1] text-[#304355] text-[11px] font-semibold hover:bg-[#F5F3F4] transition-colors"
          >
            View Requirement
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {actionRequired && pendingOffers.length > 0 && (
            <button
              type="button"
              onClick={() => onConfirmDelivery(pendingOffers[0].id)}
              className="px-3.5 py-2 rounded-lg bg-[#C96A00] text-white text-[11px] font-semibold hover:bg-[#A85800] transition-colors shadow-xs"
            >
              Confirm Delivery ({pendingOffers.length})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DonorDashboard() {
  const navigate = useNavigate();
  const { user, firebaseUser } = useAuth();
  const [activeTab, setActiveTab] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stats state from API
  const [stats, setStats] = useState({
    activeSupports: 2,
    partiallySupported: 2,
    completedSupports: 4,
    pendingConfirmations: 1,
  });

  // Impact state from API
  const [impact, setImpact] = useState({
    totalFoodDonatedKg: 280,
    beneficiariesReached: 380,
    districtsSupported: 2,
  });

  // 1. Fetch User Offers (Real Backend Integration)
  useEffect(() => {
    let cancelled = false;

    async function fetchOffers() {
      if (!firebaseUser) {
        setLoading(false);
        return;
      }
      setLoading(true);

      try {
        const token = await firebaseUser.getIdToken();
        const res = await offerService.getMine(token, { filter: activeTab });
        if (!cancelled && res.data) {
          setOffers(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch donor offers', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchOffers();
    return () => {
      cancelled = true;
    };
  }, [firebaseUser, activeTab]);

  // 2. Fetch User Stats (Real Backend Integration)
  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      if (!firebaseUser) return;
      try {
        const token = await firebaseUser.getIdToken();
        const res = await offerService.getStats(token);
        if (!cancelled && res.data) {
          setStats((prev) => ({ ...prev, ...res.data }));
        }
      } catch (err) {
        console.error('Failed to fetch donor stats', err);
      }
    }

    fetchStats();
    return () => {
      cancelled = true;
    };
  }, [firebaseUser]);

  // 3. Fetch User Impact (Real Backend Integration)
  useEffect(() => {
    let cancelled = false;

    async function fetchImpact() {
      if (!firebaseUser) return;
      try {
        const token = await firebaseUser.getIdToken();
        const res = await offerService.getImpact(token);
        if (!cancelled && res.data) {
          setImpact((prev) => ({ ...prev, ...res.data }));
        }
      } catch (err) {
        console.error('Failed to fetch donor impact', err);
      }
    }

    fetchImpact();
    return () => {
      cancelled = true;
    };
  }, [firebaseUser]);

  const displayName = user?.full_name || 'Karan Deshmukh';
  const firstName = displayName.split(' ')[0] || 'Karan';

  const totalFoodDonated = impact?.totalFoodDonatedKg || 280;
  const totalSupports =
    Number(stats.activeSupports || 2) +
    Number(stats.partiallySupported || 2) +
    Number(stats.completedSupports || 4);

  const completionRate = totalSupports
    ? Math.round((Number(stats.completedSupports || 4) / totalSupports) * 100)
    : 100;

  // Real pending offers detection
  const pendingOffers = useMemo(() => {
    return offers.filter((o) => o.donorOffers?.some((offer) => offer.status === 'pending'));
  }, [offers]);

  // Dynamic institutions extraction
  const dynamicInstitutions = useMemo(() => {
    return Array.from(
      new Map(
        offers
          .map((item) => [item.institution, item])
          .filter(([name]) => Boolean(name))
      ).values()
    );
  }, [offers]);

  // Filtered offers by search query
  const filteredOffers = useMemo(() => {
    if (!searchQuery.trim()) return offers;
    const q = searchQuery.toLowerCase();
    return offers.filter((item) => {
      const matchTitle = (item.requirementTitle || '').toLowerCase().includes(q);
      const matchInst = (item.institution || '').toLowerCase().includes(q);
      const matchLoc = (item.location || '').toLowerCase().includes(q);
      const matchItem = item.items?.some((i) => (i.name || '').toLowerCase().includes(q));
      return matchTitle || matchInst || matchLoc || matchItem;
    });
  }, [offers, searchQuery]);

  // Sample fallback tracking records for display when user has no live records
  const sampleTrackingRecords = [
    {
      id: 'mock-1',
      badge: 'In Transit',
      badgeColor: 'bg-[#E8F0FE] text-[#1E40AF] border-[#BFDBFE]',
      title: 'Nandurbar Tribal Residential School',
      location: '(Taluka Dhadgaon)',
      itemsText: 'Item: Kolam Rice (120 kg requirement)',
      warden: 'Warden: Sunita Gavit',
      carrier: 'Carrier: Nashik Agro Logistics',
      yourSupport: 'Your Support: 50 kg',
      community: 'Community: 30 kg',
      remaining: 'Remaining Need: 40 kg',
      primaryAction: 'View Handshake Pass',
      secondaryAction: 'Contact Warden Sunita',
    },
    {
      id: 'mock-2',
      badge: 'Scheduled Pickup',
      badgeColor: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]',
      title: 'Swami Vivekananda Ashram Shala',
      location: '(Igatpuri Block)',
      itemsText: 'Item: Toor Dal (30 kg) & Fortified Oil (15 L)',
      warden: 'Target Batch: 26 Apr Morning Run',
      carrier: '',
      yourSupport: 'Your Support: 15 kg allocated',
      community: 'Kitchen Need 65% Fulfilled (15 kg remaining)',
      remaining: '',
      progressPercent: 65,
      primaryAction: 'Track Pickup Vehicle',
      secondaryAction: 'Pledge Remaining 15 kg',
    },
    {
      id: 'mock-3',
      badge: '100% Consumed',
      badgeColor: 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]',
      title: 'Kasturba Gandhi Balika Vidyalaya',
      location: '(Harsul Tribal Hostel)',
      itemsText: 'Item: Jowar & Ragi Millets (40 kg)',
      warden: 'Warden: Jyoti Khade',
      carrier: 'Audit Receipt: PS-9844',
      quote: '100% prepared into nutritious daily rotis for 110 residential students. Clean nutritional audit signed by District Nutrition Officer.',
      primaryAction: 'Receipt PDF',
      secondaryAction: 'View Kitchen Video Update',
    },
  ];

  const handleConfirmDeliveryClick = (offerId) => {
    if (offerId) {
      navigate(`/confirm-completion/${offerId}`);
    } else {
      navigate('/requirements');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9FA] text-[#1B1C1D] font-sans antialiased">
      {/* Top Banner / Dashboard Bar */}
      <div className="border-b border-[#ECEAEC] bg-[#FBF9FA]/90 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-[26px] sm:text-[29px] leading-tight font-bold tracking-tight text-[#192D3E]">
                  Good morning, {firstName}
                </h1>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAE8EA] text-[10.5px] font-medium text-[#43474C]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                  Active Contributor (Nashik & Nandurbar)
                </span>
              </div>

              <p className="mt-1 text-[12px] sm:text-[12.5px] text-[#64707A] max-w-2xl leading-snug">
                Your direct food contributions are currently nourishing 380+ students across verified regional Ashram Shalas in Maharashtra.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-[#74777D] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search past supports by institution or dis..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white border border-[#D8DDE1] text-[11px] text-[#1F2933] placeholder-[#8C939B] focus:outline-none focus:border-[#192D3E]"
                />
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#D8DDE1] text-[11px] font-medium text-[#304355] hover:bg-[#F5F3F4] transition-colors shrink-0 shadow-xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* KPI CARDS ROW: 4 Identical Uniform Sized Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5 mb-6 items-stretch">
          {/* Card 1: Total Food Donated */}
          <div className="bg-white rounded-2xl border border-[#E8E6E8] p-4 sm:p-5 shadow-[0_2px_10px_rgba(25,45,62,0.04)] h-[155px] flex flex-col justify-between">
            <div className="flex items-start justify-between gap-3">
              <span className="text-[12px] font-semibold text-[#64707A]">Total Food Donated</span>
              <div className="w-9 h-9 rounded-xl bg-[#192D3E] text-white flex items-center justify-center shrink-0">
                <Scale className="w-[18px] h-[18px]" />
              </div>
            </div>
            <div>
              <div className="text-[32px] font-bold tracking-tight text-[#1F2933] leading-none">
                {totalFoodDonated}{' '}
                <span className="text-[14px] font-semibold text-[#64707A]">kg</span>
              </div>
              <div className="mt-3 pt-2 border-t border-[#F0EDEF] flex items-center justify-between text-[10.5px]">
                <span className="font-semibold text-[#16A34A] flex items-center gap-1">
                  ↗ +40 kg this month
                </span>
                <Link to="/requirements" className="font-semibold text-[#64707A] hover:text-[#192D3E]">
                  View All
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2: Active Supports */}
          <div className="bg-white rounded-2xl border border-[#E8E6E8] p-4 sm:p-5 shadow-[0_2px_10px_rgba(25,45,62,0.04)] h-[155px] flex flex-col justify-between">
            <div className="flex items-start justify-between gap-3">
              <span className="text-[12px] font-semibold text-[#64707A]">Active Supports</span>
              <div className="w-9 h-9 rounded-xl bg-[#EAF2FF] text-[#2563EB] flex items-center justify-center shrink-0">
                <Truck className="w-[18px] h-[18px]" />
              </div>
            </div>
            <div>
              <div className="text-[32px] font-bold tracking-tight text-[#1F2933] leading-none">
                {stats.activeSupports || 2}{' '}
                <span className="text-[14px] font-semibold text-[#64707A]">batches</span>
              </div>
              <div className="mt-3 pt-2 border-t border-[#F0EDEF] flex items-center justify-between text-[10.5px]">
                <span className="text-[#64707A]">In transit & scheduled</span>
                <Link to="/requirements" className="font-semibold text-[#64707A] hover:text-[#192D3E]">
                  View All
                </Link>
              </div>
            </div>
          </div>

          {/* Card 3: Pending Confirmation */}
          <div className="bg-white rounded-2xl border border-[#E8E6E8] p-4 sm:p-5 shadow-[0_2px_10px_rgba(25,45,62,0.04)] h-[155px] flex flex-col justify-between">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] font-semibold text-[#64707A]">Pending Confirmation</span>
                <span className="w-2 h-2 rounded-full bg-[#EA580C]" />
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#FFEDD5] text-[#EA580C] flex items-center justify-center shrink-0">
                <ClipboardCheck className="w-[18px] h-[18px]" />
              </div>
            </div>
            <div>
              <div className="text-[32px] font-bold tracking-tight text-[#1F2933] leading-none">
                {stats.pendingConfirmations || 1}{' '}
                <span className="text-[14px] font-semibold text-[#64707A]">action</span>
              </div>
              <div className="mt-3 pt-2 border-t border-[#F0EDEF] flex items-center justify-between text-[10.5px]">
                <span className="text-[#64707A]">Trimbakeshwar receipt</span>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('action-required-banner');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="font-semibold text-[#C96A00] hover:underline cursor-pointer"
                >
                  Confirm Now
                </button>
              </div>
            </div>
          </div>

          {/* Card 4: Completed Handoffs */}
          <div className="bg-white rounded-2xl border border-[#E8E6E8] p-4 sm:p-5 shadow-[0_2px_10px_rgba(25,45,62,0.04)] h-[155px] flex flex-col justify-between">
            <div className="flex items-start justify-between gap-3">
              <span className="text-[12px] font-semibold text-[#64707A]">Completed Handoffs</span>
              <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-[18px] h-[18px]" />
              </div>
            </div>
            <div>
              <div className="text-[32px] font-bold tracking-tight text-[#1F2933] leading-none">
                {stats.completedSupports || 4}{' '}
                <span className="text-[14px] font-semibold text-[#64707A]">audited</span>
              </div>
              <div className="mt-3 pt-2 border-t border-[#F0EDEF] flex items-center justify-between text-[10.5px]">
                <span className="text-[#64707A]">Verified by kitchen wardens</span>
                <Link to="/requirements" className="font-semibold text-[#64707A] hover:text-[#192D3E]">
                  View Records
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* MIDDLE SECTION: ROW 1 (3 UNIFORM EQUAL-SIZED CARDS: 1/3, 1/3, 1/3) */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5 items-stretch">
          <AuditedDispatchMetricCard totalSupports={totalSupports} completionRate={completionRate} />
          <SmoothDonationTrendsChart />
          <PledgeFulfillmentStatusCard totalSupports={totalSupports} stats={stats} />
        </section>

        {/* MIDDLE SECTION: ROW 2 (3 UNIFORM EQUAL-SIZED CARDS: 1/3, 1/3, 1/3) */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6 items-stretch">
          <SupportByCategoryCard totalWeightKg={totalFoodDonated} />
          <DistrictsSupportedMap />
          <SupportedInstitutionsAndActivityCard dynamicInstitutions={dynamicInstitutions} />
        </section>

        {/* ACTION REQUIRED BANNER */}
        <section
          id="action-required-banner"
          className="mb-6 rounded-2xl bg-[#FFF3E8] border border-[#FFE0C6] p-5 shadow-xs"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#F57C00] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FFEDD5] text-[#C2410C] mb-1">
                  Physical Slip Signed
                </span>
                <h3 className="text-[16px] font-bold text-[#1F2933] leading-snug">
                  Action Required: Confirm Delivery of 40 kg Moong Dal
                </h3>
                <p className="text-[12px] text-[#555E68] mt-1 leading-relaxed max-w-3xl">
                  Warden Anand Rao signed physical delivery slip on 18 Apr at{' '}
                  <strong className="text-[#1F2933]">Trimbakeshwar Residential Ashram Shala</strong>.
                  Confirming delivery registers receipt verification on the public DBT chain and closes this active request.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start lg:items-end gap-1.5 shrink-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    if (pendingOffers.length > 0 && pendingOffers[0].donorOffers?.[0]?.id) {
                      navigate(`/confirm-completion/${pendingOffers[0].donorOffers[0].id}`);
                    } else {
                      navigate('/requirements');
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#192D3E] text-white text-[12px] font-semibold hover:bg-[#283E52] transition-colors shadow-sm cursor-pointer"
                >
                  <Check className="w-4 h-4 text-[#10B981]" />
                  Confirm Delivery Completed
                </button>

                <button
                  type="button"
                  onClick={() => alert('Warden Verified Physical Receipt Slip: PS-9844')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-[#D8DDE1] text-[#304355] text-[12px] font-semibold hover:bg-[#F5F3F4] transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-[#64707A]" />
                  View Signed Slip
                </button>
              </div>

              <button
                type="button"
                onClick={() => alert('Discrepancy notice flagged for verified audit review.')}
                className="text-[11px] text-[#74777D] hover:text-[#1F2933] hover:underline transition-colors mt-1"
              >
                Report Discrepancy
              </button>
            </div>
          </div>
        </section>

        {/* SUPPORT RECORDS & LIVE TRACKING (DYNAMIC LOGIC + SAMPLE FALLBACK) */}
        <section className="bg-white rounded-2xl border border-[#E8E6E8] p-5 shadow-[0_2px_10px_rgba(25,45,62,0.04)] mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-[18px] font-bold text-[#1F2933]">Support Records & Live Tracking</h2>
              <p className="text-[11.5px] text-[#64707A] mt-0.5">
                Granular breakdown of institution allocations, logistics status, and warden handshakes.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'all', label: 'All Records', count: totalSupports || 8 },
                { id: 'active', label: 'Active Supports', count: stats.activeSupports || 2 },
                { id: 'partial', label: 'Partially Supported', count: stats.partiallySupported || 2 },
                { id: 'complete', label: 'Completed Handoffs', count: stats.completedSupports || 4 },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#192D3E] text-white shadow-xs'
                      : 'bg-[#F4F2F3] text-[#64707A] hover:text-[#1F2933] hover:bg-[#ECE9EB]'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>

          {/* Search box within records */}
          <div className="relative max-w-md mb-4">
            <Search className="w-3.5 h-3.5 text-[#74777D] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter list by warden name, staple, or receipt ID..."
              className="w-full pl-8 pr-3 py-2 rounded-lg bg-[#F5F3F4] text-[11.5px] text-[#1F2933] placeholder-[#74777D] border-0 focus:outline-none focus:ring-1 focus:ring-[#192D3E]"
            />
          </div>

          {/* Records Display: Live Backend Data or Polished Fallback */}
          <div className="space-y-3.5">
            {loading ? (
              <div className="py-12 text-center text-[#64707A] text-[12px] flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-[#192D3E] border-t-transparent rounded-full animate-spin" />
                Loading your support records...
              </div>
            ) : filteredOffers.length > 0 ? (
              // RENDER REAL BACKEND RECORDS
              filteredOffers.map((support) => (
                <DynamicSupportCard
                  key={support.id}
                  support={support}
                  onConfirmDelivery={handleConfirmDeliveryClick}
                />
              ))
            ) : (
              // SAMPLE PREVIEW RECORDS MATCHING MOCKUP WHEN USER HAS NO LIVE PLEDGES YET
              sampleTrackingRecords.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#FAF8F9] rounded-xl border border-[#EBE7E9] p-4 sm:p-5 hover:border-[#D6D2D4] transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${item.badgeColor}`}>
                          {item.badge === 'In Transit' && <Truck className="w-3 h-3" />}
                          {item.badge === 'Scheduled Pickup' && <Clock className="w-3 h-3" />}
                          {item.badge === '100% Consumed' && <Check className="w-3 h-3" />}
                          {item.badge}
                        </span>
                        <h3 className="text-[15px] font-bold text-[#1F2933]">
                          {item.title}{' '}
                          <span className="font-normal text-[#64707A] text-[12px]">{item.location}</span>
                        </h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#555E68]">
                        <span>{item.itemsText}</span>
                        <span>{item.warden}</span>
                        {item.carrier && <span>{item.carrier}</span>}
                      </div>

                      {item.progressPercent ? (
                        <div className="max-w-lg pt-1">
                          <div className="flex justify-between text-[10.5px] text-[#64707A] mb-1">
                            <span>{item.yourSupport}</span>
                            <span>{item.community}</span>
                          </div>
                          <div className="w-full bg-[#EAE8EA] rounded-full h-1.5 overflow-hidden flex">
                            <div className="bg-[#3B82F6] h-full" style={{ width: `${item.progressPercent}%` }} />
                          </div>
                        </div>
                      ) : item.quote ? (
                        <p className="text-[11px] text-[#15803D] bg-[#F0FDF4] border border-[#DCFCE7] rounded-lg px-2.5 py-1.5 italic max-w-2xl">
                          {item.quote}
                        </p>
                      ) : (
                        <div className="flex items-center gap-3 text-[11px] pt-1">
                          <span className="font-semibold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded">
                            {item.yourSupport}
                          </span>
                          <span className="text-[#64707A]">{item.community}</span>
                          <span className="text-[#64707A]">{item.remaining}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => navigate('/requirements')}
                        className={`px-3.5 py-2 rounded-lg text-[11.5px] font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                          item.badge === 'In Transit'
                            ? 'bg-[#192D3E] text-white hover:bg-[#293F52]'
                            : 'bg-white border border-[#D8DDE1] text-[#304355] hover:bg-[#F5F3F4]'
                        }`}
                      >
                        {item.badge === '100% Consumed' && <Download className="w-3.5 h-3.5 text-[#64707A]" />}
                        {item.badge === 'Scheduled Pickup' && <Truck className="w-3.5 h-3.5 text-[#64707A]" />}
                        {item.primaryAction}
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('/requirements')}
                        className="text-[11px] font-medium text-[#4B5563] hover:text-[#192D3E] hover:underline text-center"
                      >
                        {item.secondaryAction}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom verified statement & refresh time */}
          <div className="mt-5 pt-3.5 border-t border-[#F0EDEF] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10.5px] text-[#64707A]">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
              All grain weights and physical handoffs verified through digital/biometric wardens signatures.
            </span>
            <span>Last refreshed: Today, 09:15 AM IST</span>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="mt-8 bg-[#F4F2F3] border-t border-[#E8E6E8]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Column 1: Brand & Non-Custodial Notice */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md bg-[#192D3E] text-white flex items-center justify-center">
                  <Heart className="w-3 h-3 text-[#10B981]" />
                </div>
                <span className="text-[15px] font-bold text-[#192D3E]">PoshanSetu</span>
              </div>
              <p className="text-[11px] text-[#64707A] leading-relaxed mb-3">
                A civic initiative facilitating grassroots nutrition visibility and targeted donor contributions across anganwadis, school kitchens, and community centers.
              </p>
              <div className="rounded-lg bg-[#EAE8EA] p-2.5 text-[9.5px] text-[#555E68] leading-normal border border-[#DFDCDE]">
                <strong className="text-[#1F2933]">Non-Custodial Transparency Notice:</strong> PoshanSetu operates strictly on a non-custodial model. Funds and direct food basket provisions route directly to verified regional cluster partners, verified self-help groups, and designated local civic accounts with end-to-end receipt auditing.
              </div>
            </div>

            {/* Column 2: Maharashtra Districts */}
            <div>
              <h4 className="text-[10.5px] font-bold tracking-wider uppercase text-[#1F2933] mb-3">
                Maharashtra Districts
              </h4>
              <ul className="space-y-1.5 text-[11px] text-[#64707A]">
                <li>Nandurbar (Aspirational Hub)</li>
                <li>Palghar Tribal Belt</li>
                <li>Gadchiroli Rural Blocks</li>
                <li>Amravati Melghat Region</li>
                <li>Solapur Drought Cluster</li>
              </ul>
            </div>

            {/* Column 3: Resources & Civic Data */}
            <div>
              <h4 className="text-[10.5px] font-bold tracking-wider uppercase text-[#1F2933] mb-3">
                Resources & Civic Data
              </h4>
              <ul className="space-y-1.5 text-[11px] text-[#64707A]">
                <li>Quarterly Stunting Indices</li>
                <li>Anganwadi Ration Protocols</li>
                <li>Active Food Deficit Map</li>
                <li>Audit & Dispatch Reports</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-[#DFDCDE] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-[#74777D]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
              In alignment with Maharashtra Integrated Child Development Services (ICDS) Data Framework
            </span>
            <span>© 2026 PoshanSetu Foundation. Public Domain Civic Interface.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
