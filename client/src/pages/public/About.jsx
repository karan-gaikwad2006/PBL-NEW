import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  BadgeCheck,
  Map,
  RefreshCcw,
  ClipboardCheck,
  BarChart,
  AlertTriangle,
  XCircle,
  MapPin,
  EyeOff,
  CheckCircle,
  Package,
  Compass,
  Handshake,
  Smile,
  CreditCard,
  Leaf,
  RefreshCw,
  Check,
  HeartHandshake,
  Building,
  Building2,
  TrendingUp,
  Shield,
  Info,
  Globe,
  ArrowRight
} from 'lucide-react';

// ── About PoshanSetu ────────────────────────────────────────────────────────
// Translated faithfully from Stitch design:
// "About PoshanSetu - Mission, Philosophy & Approach"
// ─────────────────────────────────────────────────────────────────────────────

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="bg-white rounded-lg shadow-sm p-4 cursor-pointer transition-colors hover:bg-slate-50 border border-black/5"
      onClick={() => setOpen((o) => !o)}
    >
      <div className="flex items-center justify-between">
        <h4 className="text-[20px] font-semibold leading-7 text-[#1F2933]">{question}</h4>
        <ChevronDown
          className={`w-5 h-5 text-[#64707A] transition-transform duration-200 select-none ${
            open ? 'rotate-180' : 'rotate-0'
          }`}
        />
      </div>
      {open && (
        <div className="pt-3 text-sm text-[#64707A] leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function About() {
  return (
    <div className="bg-[#E8E8E2] text-[#1F2933] font-[Manrope,sans-serif] min-h-screen">

      {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
      <div className="w-full py-12">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d8d8d0] text-[#42433f] text-xs font-medium tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-[#304355]" />
              Mission &amp; Approach
            </span>
            <span className="text-[#a0a4a8]">•</span>
            <span className="text-xs text-[#64707A]">PoshanSetu Maharashtra</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end mb-12">
            <div className="lg:col-span-8 space-y-3">
              <h1 className="text-4xl lg:text-5xl font-bold text-[#1F2933] tracking-tight leading-tight">
                Bridging the gap between surplus compassion and real nutritional need.
              </h1>
              <p className="text-lg text-[#64707A] max-w-3xl pt-1 leading-relaxed">
                PoshanSetu was built to transform food assistance from well-intentioned guesswork into informed, dignified, and direct community support across Maharashtra.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col justify-end">
              <div className="p-4 rounded-xl bg-white shadow-sm flex items-start gap-3 border border-black/5">
                <BadgeCheck className="w-6 h-6 text-[#304355] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-[#1F2933]">Zero Transaction Processing</p>
                  <p className="text-xs text-[#64707A] mt-1">100% of assistance flows directly in physical staples, local millets, or approved grains from citizens to grassroots partners.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Map, label: 'Coverage', headline: '36 Districts', sub: 'Tracked Contextually', body: 'Public health indicators benchmarked across every taluka and district.' },
              { icon: RefreshCcw, label: 'Non-Custodial', headline: '100% Direct', sub: 'Community Delivery', body: 'Zero intermediary wallets, zero commissions, zero handling markups.' },
              { icon: ClipboardCheck, label: 'Integrity', headline: 'Dual-Sign', sub: 'Receipt Verification', body: 'Both the contributor and institutional warden confirm verified arrival.' },
              { icon: BarChart, label: 'Evidence', headline: 'NFHS-5', sub: 'Data-Grounded', body: 'Informed by official population surveys, ICDS benchmarks, and health registries.' },
            ].map(({ icon: IconComponent, label, headline, sub, body }) => (
              <div key={label} className="p-6 bg-white rounded-xl shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow border border-black/5">
                <div className="flex items-center justify-between mb-4">
                  <IconComponent className="w-6 h-6 text-[#304355]" />
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#f0f0ea] text-[#64707A]">{label}</span>
                </div>
                <div>
                  <span className="text-3xl font-bold text-[#192d3e] block tracking-tight">{headline}</span>
                  <p className="text-sm font-semibold text-[#1F2933] mt-1">{sub}</p>
                  <p className="text-xs text-[#64707A] mt-1">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Why PoshanSetu Exists ────────────────────────────────────────────── */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-10 py-12 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs text-[#64707A] uppercase tracking-widest block mb-2 font-semibold">The Structural Challenge</span>
          <h2 className="text-3xl font-bold text-[#1F2933] tracking-tight">Why PoshanSetu Exists</h2>
          <p className="text-base text-[#64707A] mt-2">Food generosity in India is vast, but traditional channels frequently lack granular visibility, leading to oversaturation in certain pockets while remote community centers struggle for staples.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 flex flex-col justify-between relative overflow-hidden shadow-sm border border-black/5">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#ffdad6] text-[#93000a] text-xs font-medium w-fit">
                <AlertTriangle className="w-4 h-4" />
                The Traditional Dilemma
              </div>
              <h3 className="text-2xl font-semibold text-[#1F2933]">Fragmented Distribution &amp; Unmet Specifics</h3>
              <p className="text-base text-[#64707A] leading-relaxed">Societies, families, and businesses frequently mobilize dry rations, packaged biscuits, or prepared festive meals without knowing a community's daily operational nutritional deficit.</p>
              <div className="space-y-2 pt-1">
                {[
                  { icon: XCircle, title: 'Nutritional Mismatches', body: 'Urban drives accumulate surplus short-shelf-life confectionery while remote hostels urgently run short of protein foundations like Toor Dal, Chana, or edible oils.' },
                  { icon: MapPin, title: 'Geographic Blind Spots', body: 'Urban charities easily reach peri-urban shelters within easy driving radius, leaving tribal ashram shalas in Gadchiroli, Nandurbar, or Palghar completely overlooked.' },
                  { icon: EyeOff, title: 'Opaque Intermediaries', body: 'Donors lose clarity once funds are pooled, with substantial portions consumed by platform commissions, fundraising commissions, and administrative layers.' },
                ].map(({ icon: IconComponent, title, body }) => (
                  <div key={title} className="flex items-start gap-3 p-3 bg-[#f5f5f0] rounded-lg border border-black/5">
                    <IconComponent className="w-5 h-5 text-[#D32F2F] flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-sm font-semibold text-[#1F2933] block">{title}</strong>
                      <span className="text-xs text-[#64707A]">{body}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 pt-4 text-[#64707A] text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D32F2F]" />
              Result: High donor effort with variable community stability.
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md flex flex-col justify-between relative overflow-hidden border border-black/5">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#d8d8d0] text-[#1a1c19] text-xs font-medium w-fit">
                <CheckCircle className="w-4 h-4 text-[#388E3C]" />
                The PoshanSetu Model
              </div>
              <h3 className="text-2xl font-semibold text-[#192d3e]">Granular Verification &amp; Transparent Coordination</h3>
              <p className="text-base text-[#64707A] leading-relaxed">We operate as an open community bridge. We do not solicit donations into a bank account; instead, we surface precise, authenticated grocery needs mapped to regional food staples.</p>
              <div className="space-y-2 pt-1">
                {[
                  { icon: Package, title: 'Itemized, Real-Time Requisitions', body: 'Verified wardens upload explicit requirements (e.g., 80kg Jowar, 40kg Moong Dal, 20L Cold-Pressed Oil) with exact countdown timelines to avoid over-supply.' },
                  { icon: Compass, title: 'Context-Aware Prioritization', body: 'Needs are paired alongside public health indicators (anemia burdens, childhood stunting) so donors understand why whole grains or local iron-rich greens are vital.' },
                  { icon: Handshake, title: 'Direct Relationship Building', body: 'Donors coordinate directly with the institution, physically delivering or dispatching regional produce via local wholesale mandis.' },
                ].map(({ icon: IconComponent, title, body }) => (
                  <div key={title} className="flex items-start gap-3 p-3 bg-[#f5f5f0] rounded-lg border border-black/5">
                    <IconComponent className="w-5 h-5 text-[#388E3C] flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-sm font-semibold text-[#1F2933] block">{title}</strong>
                      <span className="text-xs text-[#64707A]">{body}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 pt-4 text-[#64707A] text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#388E3C]" />
              Result: Respectful, tailored nutrition where every kilogram counts.
            </div>
          </div>
        </div>
      </section>

      {/* ── Photo strip ─────────────────────────────────────────────────────── */}
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 pb-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCriL2YEqSGSyg0JyuTDLNfI_e7AD-lf_e5_N6P3chttTv2WO0mGcGroWsdpysJzlNJWgzFODPQh2ra8dojO5kXhA2M7-zZkzcjsNrx6Yiw4tnzaLvTQXfLD6C1gPcr_drfzxixz6Hg1_kAHcm8hrNBegZXMMeOP51CnHSURnzp7_JxJraa0UJ4fZhBdEd_Pyb1LKGavPj4V8cg0DFBRUrOKDKI-N-Dt_X6mWe4vVWwnbYHx_SZ1_Zi', caption: 'Granular Pantry Audits', alt: 'Organized pantry in a rural Maharashtra community boarding center' },
            { src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3WB20KVt7rZ-RB7Z0kliuKWo4YzznRxZ7ZDSrAiJckoqv7KYaBJsiuYwN_bqNWp02ZuILpiHn5yDfSG8id2fUlBNiwHsy5yBltvS6RmaZ_umESGeOgqglhAoaQ6jVQCCi11a8N6xwVuZXZJrXjGCD3YQ1OmdGy3lFma0gz6SYxapxQNna1ypkAa4F3prDs68Oz7ytpVozUGNlNBRxsltSygpRv7g4LlSuOvaptQ18jV0QuihaqmBr', caption: 'Grassroots Institutional Wardens', alt: 'Social worker and community elder reviewing nutritional register' },
            { src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCoeaVPyPffhHkThbLukzpWhJ3wq4hwxCfHH6Yq_TkJkURQcfizdx2pgGfI8N3JA1Tl137-wxjpKnoStMBEAfJ0mZ8nZmm2QA8kcLfJsfVqtEql1NlUirgLdjxjKk0FN8N9wHRko7FU75sAHkfvIWx5qtuE68EI7MFPTFncUK_AQXaDulKTFtYh0d1vhu6cLW7cFTlxhtHB5m4XoXA4HeCRf_NMxAvbLyTfMcf24PudyvBYjGNZ8EoZ', caption: 'Regionally Cultivated Staples', alt: 'Freshly harvested Indian grains in brass containers' },
          ].map(({ src, caption, alt }) => (
            <div key={caption} className="relative h-64 rounded-xl overflow-hidden shadow-sm border border-black/5">
              <img src={src} alt={alt} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#192d3e]/80 via-transparent to-transparent flex items-end p-4">
                <p className="text-xs text-white font-medium">{caption}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Core Guiding Principles ──────────────────────────────────────────── */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-10 py-12 w-full">
        <div className="mb-12">
          <span className="text-xs text-[#64707A] uppercase tracking-widest block mb-2 font-semibold">Operational Ethics</span>
          <h2 className="text-3xl font-bold text-[#1F2933] tracking-tight">Our Core Guiding Principles</h2>
          <p className="text-base text-[#64707A] max-w-2xl mt-2">Every line of code and every organizational connection we facilitate is governed by four strict commitments to human dignity and logistical honesty.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { icon: Smile, num: '01', title: 'Dignity in Assistance', body: 'We reject the spectacle of poverty. PoshanSetu forbids humiliating imagery, marketing theatrics, or portraying children and rural communities as helpless subjects. Every institution is an equal partner in community resilience, presented with professional respect and cultural honor.', tag: 'No exploitative photography or emotional coercion' },
            { icon: CreditCard, num: '02', title: 'Zero Financial Handling', body: 'PoshanSetu does not accept donations, hold escrow funds, or collect micro-transaction fees. Our infrastructure operates solely as an intelligence and coordination network. Support occurs directly between donors and verified institutions through transparent material supplies.', tag: 'Zero administrative friction and complete fiscal clarity' },
            { icon: Leaf, num: '03', title: 'Contextual Nutrition Intelligence', body: 'Nutritional challenges vary significantly across agro-ecological zones. We emphasize indigenous grains such as Nachni (Ragi) for calcium, Jowar for fiber, and regional pulses for bioavailable protein, aligning donations with traditional dietary habits and local cultivation patterns.', tag: 'Culturally familiar, locally sourced, bio-diverse staples' },
            { icon: RefreshCw, num: '04', title: 'Dual-Party Accountability', body: "Transparency requires bilateral confirmation. When a donor dispatches supplies, the listing transitions to In Transit. It is only marked permanently fulfilled when the recipient institution inspects the delivery and stamps its digital receipt, closing the integrity loop.", tag: 'Closed verification loops without ghost donations' },
          ].map(({ icon: IconComponent, num, title, body, tag }) => (
            <div key={num} className="p-6 bg-white rounded-xl shadow-sm flex flex-col justify-between border border-black/5">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-lg bg-[#f0f0ea] flex items-center justify-center text-[#192d3e] mb-3">
                  <IconComponent className="w-6 h-6" />
                </div>
                <span className="text-xs text-[#64707A] uppercase font-semibold">Principle {num}</span>
                <h3 className="text-xl font-semibold text-[#1F2933]">{title}</h3>
                <p className="text-base text-[#64707A] leading-relaxed">{body}</p>
              </div>
              <div className="mt-6 pt-3 flex items-center gap-2 text-[#64707A] text-xs border-t border-black/5">
                <Check className="w-4 h-4 text-[#192d3e] flex-shrink-0" />
                {tag}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Who PoshanSetu Serves ────────────────────────────────────────────── */}
      <section className="w-full py-12">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs text-[#64707A] uppercase tracking-widest block mb-2 font-semibold">Community Ecosystem</span>
              <h2 className="text-3xl font-bold text-[#1F2933] tracking-tight">Who PoshanSetu Serves</h2>
            </div>
            <p className="text-base text-[#64707A] max-w-md">Connecting verified local needs with purposeful civil action through structured interfaces.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm flex flex-col justify-between border border-black/5">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-full bg-[#d0e5fb] flex items-center justify-center text-[#081d2e]">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-[#64707A] block font-medium">For Individuals &amp; Groups</span>
                  <h3 className="text-xl font-semibold text-[#1F2933] mt-1">Conscious Donors &amp; Citizen Allies</h3>
                </div>
                <p className="text-sm text-[#64707A] leading-relaxed">Residential welfare associations, corporate employee groups, and individual citizens looking for genuine, direct avenues to provide wholesome food without management overheads.</p>
                <ul className="space-y-2 pt-1">
                  {['Filter requirements by district and proximity','Direct communication with institutional wardens','Documented delivery confirmations & acknowledgments'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-[#1F2933]">
                      <CheckCircle className="w-4 h-4 text-[#192d3e] flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-6 mt-4 border-t border-black/5">
                <Link to="/requirements" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#192d3e] hover:underline">
                  Explore Active Requirements <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm flex flex-col justify-between border border-black/5">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-full bg-[#d8d8d0] flex items-center justify-center text-[#42433f]">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-[#64707A] block font-medium">For Grassroots Institutions</span>
                  <h3 className="text-xl font-semibold text-[#1F2933] mt-1">Ashram Shalas &amp; Care Centers</h3>
                </div>
                <p className="text-sm text-[#64707A] leading-relaxed">Verified community boarding schools, destitute child shelters, and rural creches that operate on stringent monthly provisions and experience supply gaps between state allocations.</p>
                <ul className="space-y-2 pt-1">
                  {['Publish itemized ration requests in minutes','Zero listing fees, commissions, or lock-in periods','Automated quota tracking to avoid over-solicitation'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-[#1F2933]">
                      <CheckCircle className="w-4 h-4 text-[#192d3e] flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-6 mt-4 border-t border-black/5">
                <Link to="/submit-requirement" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#192d3e] hover:underline">
                  Submit Institution Need <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm flex flex-col justify-between border border-black/5">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-full bg-[#b5c9df] flex items-center justify-center text-[#081d2e]">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-[#64707A] block font-medium">For Observers &amp; Researchers</span>
                  <h3 className="text-xl font-semibold text-[#1F2933] mt-1">Public Health Analysts &amp; Citizens</h3>
                </div>
                <p className="text-sm text-[#64707A] leading-relaxed">Social workers, academic researchers, and investigative journalists seeking an open lens into real-time local nutrition pressure points across Maharashtra's 36 administrative districts.</p>
                <ul className="space-y-2 pt-1">
                  {['Interactive district nutrition heat maps','Correlation of NFHS indicators with local requests','Open methodology documentation and reference logs'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-[#1F2933]">
                      <CheckCircle className="w-4 h-4 text-[#192d3e] flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-6 mt-4 border-t border-black/5">
                <Link to="/explore" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#192d3e] hover:underline">
                  View Nutrition Insights <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Data Transparency Callout ────────────────────────────────────────── */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-10 py-12 w-full">
        <div className="bg-[#192d3e] text-white rounded-xl p-8 lg:p-12 shadow-lg relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-[#304355]/40 pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#304355] text-[#b5c9df] text-xs font-medium">
              <Shield className="w-4 h-4 text-[#b5c9df]" />
              Data Integrity &amp; Responsible Disclosure
            </div>
            <h3 className="text-3xl font-bold tracking-tight text-white">How PoshanSetu Uses Public Health Data</h3>
            <p className="text-base text-[#e4e2e3] leading-relaxed">PoshanSetu aggregates and displays population-level nutrition benchmarks derived from authoritative national assessments, including the National Family Health Survey (NFHS-5), the Comprehensive National Nutrition Survey (CNNS), and regional ICDS reports.</p>
            <div className="bg-[#304355]/70 rounded-lg p-4 text-[#b5c9df] space-y-2">
              <div className="flex items-center gap-2 text-white text-sm font-semibold">
                <Info className="w-5 h-5 text-[#d0e5fb]" />
                Official Analytical Clarification
              </div>
              <p className="text-sm leading-relaxed">District-level nutrition indicators describe macro health trends (e.g., stunting rates, childhood anemia percentages) and <strong className="text-white font-semibold">must never be interpreted as individual medical diagnoses</strong>. PoshanSetu leverages this open data exclusively to contextualize geographic food security, while immediate requirements are submitted and verified directly by individual institution administrators.</p>
            </div>
            <div className="pt-2 flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 text-xs text-[#e4e2e3]"><span className="w-2 h-2 rounded-full bg-[#388E3C]" />Regularly audited institution verification registries</div>
              <div className="flex items-center gap-2 text-xs text-[#e4e2e3]"><span className="w-2 h-2 rounded-full bg-[#4A90E2]" />Open and accessible population data sources</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ Section ─────────────────────────────────────────────────────── */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-10 pb-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-4 space-y-3">
            <span className="text-xs text-[#64707A] uppercase tracking-widest block font-semibold">Clear Answers</span>
            <h2 className="text-2xl font-semibold text-[#1F2933]">Frequently Asked Questions</h2>
            <p className="text-base text-[#64707A]">Common queries regarding how requirements are authenticated and how physical supplies are coordinated.</p>
          </div>
          <div className="lg:col-span-8 space-y-3">
            <FaqItem question="Can I make a monetary contribution through PoshanSetu?" answer="No. PoshanSetu is strictly non-custodial and will never process payments, maintain bank gateways, or charge fees. We believe physical provision of verified staples fosters deeper community bonds and avoids all middleman leakage." />
            <FaqItem question="How are institutional requirements verified before going live?" answer="Institutions must provide registration credentials (Trust Registration, Societies Act Certificate, or Government Tribal Welfare Board affiliation). Our regional volunteer coordinators verify the head administrator's contact and audit existing inventory status before requirements are listed." />
            <FaqItem question="What happens if I cannot physically deliver to a distant district?" answer="Many contributors partner with verified wholesale grain mandis located within the beneficiary's taluka. Donors pay the local merchant directly offline, and the merchant delivers fresh local produce straight to the ashram, which simultaneously supports local agricultural economies." />
          </div>
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────────────────────── */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-10 pb-12 w-full">
        <div className="bg-[#dcdcd6] rounded-2xl p-8 lg:p-12 text-center space-y-4 shadow-sm border border-black/5">
          <div className="max-w-2xl mx-auto space-y-3">
            <span className="text-xs text-[#64707A] uppercase tracking-wider block font-semibold">Join The Movement</span>
            <h2 className="text-3xl font-bold text-[#1F2933] tracking-tight">Ready to make informed food support happen?</h2>
            <p className="text-base text-[#64707A]">Find where wholesome grains are urgently needed today, or register your grassroots care institution for verified assistance.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
            <Link to="/explore" className="inline-flex items-center justify-center bg-[#304355] text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-[#192d3e] transition-all shadow-sm">
              <Globe className="w-4 h-4 mr-2" />Explore Needs Across Maharashtra
            </Link>
            <Link to="/submit-requirement" className="inline-flex items-center justify-center bg-white text-[#1F2933] text-sm font-semibold px-6 py-3 rounded-lg hover:bg-[#f0f0ea] transition-colors shadow-sm border border-black/5">
              <Building className="w-4 h-4 mr-2" />Submit an Institution Requirement
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
