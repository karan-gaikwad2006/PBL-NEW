import React from 'react';
import { Link } from 'react-router-dom';
import {
  BadgeCheck,
  Handshake,
  ArrowRight,
  GraduationCap,
  HeartHandshake,
  Building2,
  Truck,
  RefreshCw,
  Package,
  BarChart,
  Gavel,
  ClipboardCheck,
  CreditCard,
  Shield,
  CheckCircle
} from 'lucide-react';

// ── How It Works ─────────────────────────────────────────────────────────────
// Translated faithfully from Stitch design:
// "How It Works - The PoshanSetu Step-by-Step Guide"
// ─────────────────────────────────────────────────────────────────────────────

export default function HowItWorks() {
  return (
    <div className="bg-[#E8E8E2] text-[#1F2933] font-[Manrope,sans-serif] min-h-screen">

      {/* ── Top Intro Section ───────────────────────────────────────────────── */}
      <section className="w-full py-12">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d0e5fb] text-[#081d2e] text-xs font-medium">
              <BadgeCheck className="w-4 h-4" />
              <span>A Transparent Guide to PoshanSetu</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-[#192d3e] tracking-tight">
              How PoshanSetu Works: From Discovery to Direct Delivery
            </h1>
            <p className="text-lg text-[#64707A] leading-relaxed">
              Explore how we bridge real nutritional needs across Maharashtra with direct donor support through
              transparent data, community validation, and dual confirmation.
            </p>
          </div>
          {/* Quick anchor strip */}
          <div className="mt-6 pt-4 flex flex-wrap gap-3">
            {[
              { href: '#core-journey', label: '1. The 3-Step Journey (Where \u2192 Why \u2192 How)' },
              { href: '#pathways', label: '2. Donor & Requester Pathways' },
              { href: '#dual-confirmation', label: '3. Dual Confirmation Engine' },
              { href: '#trust-policies', label: '4. Trust, Safety & Disclaimers' },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="px-4 py-2 rounded-lg bg-white text-[#192d3e] hover:bg-[#304355] hover:text-white text-sm font-semibold transition-all shadow-sm border border-black/5"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Non-monetary Banner ──────────────────────────────────────────────── */}
      <div className="w-full bg-[#304355] text-white py-3">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Handshake className="w-5 h-5 text-[#ffddb7] flex-shrink-0" />
            <span className="text-sm font-semibold">Direct Support Architecture:</span>
            <span className="text-xs text-[#e4e2e3] hidden md:inline">
              PoshanSetu never accepts, holds, or processes financial funds. All contributions are direct in-kind physical supplies.
            </span>
          </div>
          <span className="text-xs text-[#d0e5fb] uppercase tracking-wider font-semibold">100% In-Kind • 0% Platform Fees</span>
        </div>
      </div>

      {/* ── Section 1: WHERE → WHY → HOW ─────────────────────────────────────── */}
      <section className="w-full py-12" id="core-journey">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#64707A] font-semibold">Methodological Flow</span>
              <h2 className="text-3xl font-bold text-[#192d3e] mt-1">The Core Framework: Where, Why, and How</h2>
            </div>
            <p className="text-sm text-[#64707A] max-w-md">
              Actionable philanthropy demands deep ground truth. PoshanSetu breaks nutritional intervention into three transparent stages.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stage 1 */}
            <div className="bg-white rounded-xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border border-black/5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-[#d8d8d0] text-[#42433f] text-xs font-medium">Stage 01</span>
                  <span className="text-2xl font-bold text-[#b5c9df]">01</span>
                </div>
                <div>
                  <span className="text-xs uppercase text-[#64707A] tracking-wider font-semibold">Spatial Focus</span>
                  <h3 className="text-xl font-semibold text-[#192d3e] mt-0.5">WHERE: Discover Regional Gaps</h3>
                </div>
                <p className="text-sm text-[#64707A]">
                  Review hyper-local geographical distributions across Maharashtra. Districts, talukas, and rural
                  clusters are mapped alongside active nutritional demand signals and verified institutional requests.
                </p>
                <div className="bg-[#f5f5f0] rounded-lg p-3 space-y-2 border border-black/5">
                  <div className="flex justify-between items-center text-[#1F2933]">
                    <span className="text-xs font-medium">Nandurbar Taluka Alert</span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#ffdad6] text-[#93000a]">Critical Needs</span>
                  </div>
                  <div className="h-2 w-full bg-[#d8d8d0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#D32F2F] rounded-full" style={{ width: '78%' }} />
                  </div>
                  <div className="flex justify-between text-[11px] text-[#64707A]">
                    <span>Verified Facilities: 18</span>
                    <span>Demand Gap: 78%</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 mt-3 border-t border-black/5">
                <Link to="/explore" className="inline-flex items-center gap-1 text-sm font-semibold text-[#192d3e] hover:text-[#304355]">
                  Explore live state map <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Stage 2 */}
            <div className="bg-white rounded-xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border border-black/5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-[#d8d8d0] text-[#42433f] text-xs font-medium">Stage 02</span>
                  <span className="text-2xl font-bold text-[#b5c9df]">02</span>
                </div>
                <div>
                  <span className="text-xs uppercase text-[#64707A] tracking-wider font-semibold">Diagnostic Truth</span>
                  <h3 className="text-xl font-semibold text-[#192d3e] mt-0.5">WHY: Understand Ground Realities</h3>
                </div>
                <p className="text-sm text-[#64707A]">
                  Contextualize every request. Distinguish seasonal shortfalls from chronic protein deficiencies.
                  Access public health indicators (NFHS-5 metrics on stunting &amp; wasting) cross-checked with
                  specific community demographics.
                </p>
                <div className="bg-[#f5f5f0] rounded-lg p-3 space-y-2 border border-black/5">
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-[#192d3e]" />
                    <span className="text-xs font-semibold text-[#192d3e]">Ashram Shala Model Case</span>
                  </div>
                  <p className="text-xs text-[#64707A]">
                    120 tribal resident students. Rice available via state rations, but critical deficiency
                    in vegetable proteins and micronutrients.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-3 border-t border-black/5">
                <Link to="/explore" className="inline-flex items-center gap-1 text-sm font-semibold text-[#192d3e] hover:text-[#304355]">
                  View nutritional methodology <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Stage 3 */}
            <div className="bg-white rounded-xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border border-black/5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-[#d8d8d0] text-[#42433f] text-xs font-medium">Stage 03</span>
                  <span className="text-2xl font-bold text-[#b5c9df]">03</span>
                </div>
                <div>
                  <span className="text-xs uppercase text-[#64707A] tracking-wider font-semibold">Direct Matching</span>
                  <h3 className="text-xl font-semibold text-[#192d3e] mt-0.5">HOW: Pledge Physical Nutrition</h3>
                </div>
                <p className="text-sm text-[#64707A]">
                  Zero ambiguity. Donors commit to exact non-perishable staples: pulses, millets, fortified oil,
                  or groundnuts. Transparent coordination unlocks direct logistics directly with institutional
                  administrators.
                </p>
                <div className="bg-[#f5f5f0] rounded-lg p-3 space-y-1.5 text-xs font-medium border border-black/5">
                  <div className="flex justify-between items-center">
                    <span className="text-[#64707A]">50 kg Moong Dal</span>
                    <span className="text-[#388E3C] font-semibold">Matched (30 kg)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#64707A]">60 kg Jowar / Bajra</span>
                    <span className="text-[#F57C00] font-semibold">Open Requirement</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 mt-3 border-t border-black/5">
                <Link to="/requirements" className="inline-flex items-center gap-1 text-sm font-semibold text-[#192d3e] hover:text-[#304355]">
                  Select items to pledge <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 2: Donor & Institution Pathways ──────────────────────────── */}
      <section className="w-full py-12" id="pathways">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#64707A] font-semibold">Action Paths</span>
            <h2 className="text-3xl font-bold text-[#192d3e]">Two Sides of the Same Transparent Bridge</h2>
            <p className="text-base text-[#64707A]">
              Whether you represent an institution needing essentials or a supporter with resources, the step-by-step
              pathway ensures safety, accountability, and zero guesswork.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Donor Pathway */}
            <div className="bg-white rounded-xl p-6 shadow-sm flex flex-col justify-between border border-black/5">
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 bg-[#f5f5f0] p-3 rounded-lg border border-black/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#192d3e] flex items-center justify-center text-white">
                      <HeartHandshake className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-[#192d3e]">Donor Pathway</h3>
                      <span className="text-xs text-[#64707A]">Individual, Group or CSR Contributor</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded bg-[#d8d8d0] text-[#1a1c19] text-xs font-medium">4 Steps</span>
                </div>
                <ol className="space-y-4 relative before:absolute before:top-3 before:bottom-3 before:left-3.5 before:w-0.5 before:bg-[#d8d8d0]">
                  {[
                    {
                      n: '1',
                      title: 'Discover or Match Essentials',
                      body: 'Browse the Maharashtra Needs Directory by District or use the "I Have Food" matcher to input what you have available (e.g. 100 kg Rice) and immediately see compatible orphanages, hostels, or daycare facilities.',
                    },
                    {
                      n: '2',
                      title: 'Pledge Support Specifics',
                      body: 'Commit to full or fractional requirements. Select item count, indicate preferred dispatch/delivery timeline, and optionally add delivery notes (e.g., direct shipping via vendor or self-drop).',
                    },
                    {
                      n: '3',
                      title: 'Direct Offline Handshake',
                      body: 'Once the institution acknowledges your pledge, unmask verified administrative phone numbers, gate pass instructions, and exact postal receiving addresses to coordinate logistics.',
                    },
                    {
                      n: '4',
                      title: 'Confirm Handover',
                      body: 'Provide dispatch proof or mark "Dispatched/Delivered" on the portal. This initiates the receiver\'s dual-verification queue.',
                    },
                  ].map(({ n, title, body }) => (
                    <li key={n} className="relative flex items-start gap-4 pl-1">
                      <div className="w-6 h-6 rounded-full bg-[#192d3e] text-white flex items-center justify-center text-xs font-semibold flex-shrink-0 z-10">
                        {n}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-[17px] font-semibold text-[#192d3e]">{title}</h4>
                        <p className="text-sm text-[#64707A]">{body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="pt-6 mt-4 bg-[#f5f5f0] p-4 rounded-lg border border-black/5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#192d3e]">Ready to make an in-kind pledge?</span>
                  <Link to="/explore" className="px-4 py-2 bg-[#304355] text-white text-sm font-semibold rounded-lg hover:bg-[#192d3e] transition-colors">
                    I Want to Help
                  </Link>
                </div>
              </div>
            </div>

            {/* Institution Pathway */}
            <div className="bg-white rounded-xl p-6 shadow-sm flex flex-col justify-between border border-black/5">
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 bg-[#f5f5f0] p-3 rounded-lg border border-black/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#304355] flex items-center justify-center text-white">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-[#192d3e]">Institution Pathway</h3>
                      <span className="text-xs text-[#64707A]">Ashram Shalas, Anganwadis &amp; Shelters</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded bg-[#d8d8d0] text-[#1a1c19] text-xs font-medium">4 Steps</span>
                </div>
                <ol className="space-y-4 relative before:absolute before:top-3 before:bottom-3 before:left-3.5 before:w-0.5 before:bg-[#d8d8d0]">
                  {[
                    {
                      n: '1',
                      title: 'Submit Detailed Nutrition Needs',
                      body: 'Registered coordinators record essential commodities (Pulses, Millets, Cooking Oil, Nuts), beneficiary headcounts, age groups, and delivery acceptance windows.',
                    },
                    {
                      n: '2',
                      title: 'Automated & Community Validation',
                      body: 'Our platform executes sanity checks against government registration credentials, past consumption rates, and duplicate entries before publishing.',
                    },
                    {
                      n: '3',
                      title: 'Accept Donor Pledges',
                      body: 'Receive direct notifications when items are pledged. Review donor profile and estimated delivery date to authorize direct warehouse/kitchen entry.',
                    },
                    {
                      n: '4',
                      title: 'Confirm Physical Receipt',
                      body: 'Weigh and acknowledge supplies at physical intake. Mark verified quantity to immediately retire requirements from open listings.',
                    },
                  ].map(({ n, title, body }) => (
                    <li key={n} className="relative flex items-start gap-4 pl-1">
                      <div className="w-6 h-6 rounded-full bg-[#304355] text-white flex items-center justify-center text-xs font-semibold flex-shrink-0 z-10">
                        {n}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-[17px] font-semibold text-[#192d3e]">{title}</h4>
                        <p className="text-sm text-[#64707A]">{body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="pt-6 mt-4 bg-[#f5f5f0] p-4 rounded-lg border border-black/5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#192d3e]">Are you an authorized coordinator?</span>
                  <Link to="/submit-requirement" className="px-4 py-2 bg-white text-[#192d3e] border border-[#304355]/20 text-sm font-semibold rounded-lg hover:bg-[#304355] hover:text-white transition-colors shadow-sm">
                    Submit Requirement
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 3: Dual Confirmation Engine ─────────────────────────────── */}
      <section className="w-full py-12" id="dual-confirmation">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#64707A] font-semibold">Trust Architecture</span>
            <h2 className="text-3xl font-bold text-[#192d3e]">The Dual Confirmation Engine</h2>
            <p className="text-base text-[#64707A]">
              Why PoshanSetu data stays clean: No requirement is ever considered fulfilled on unilateral assertions.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm space-y-6 border border-black/5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Action 1 */}
              <div className="p-4 rounded-lg bg-[#f5f5f0] space-y-2 border border-black/5">
                <div className="flex items-center gap-2 text-[#192d3e]">
                  <Truck className="w-5 h-5 text-[#192d3e]" />
                  <span className="text-sm font-semibold">Action 1: Dispatch Recorded</span>
                </div>
                <p className="text-sm text-[#64707A]">Donor marks "Supplies Handed Over / Dispatched". Uploads optional dispatch note or consignment tracking ID.</p>
                <div className="pt-1">
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FFB300]/15 text-[#1F2933]">Status: Pending Verification</span>
                </div>
              </div>
              {/* Center */}
              <div className="flex flex-col items-center justify-center p-3 text-center">
                <div className="w-10 h-10 rounded-full bg-[#192d3e] text-white flex items-center justify-center mb-2 shadow-sm">
                  <RefreshCw className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-semibold text-[#192d3e]">Handshake Verification</span>
                <span className="text-xs text-[#64707A] mt-1">SMS &amp; Dashboard prompt delivered to institution head</span>
              </div>
              {/* Action 2 */}
              <div className="p-4 rounded-lg bg-[#f5f5f0] space-y-2 border border-black/5">
                <div className="flex items-center gap-2 text-[#192d3e]">
                  <Package className="w-5 h-5 text-[#192d3e]" />
                  <span className="text-sm font-semibold">Action 2: Physical Check</span>
                </div>
                <p className="text-sm text-[#64707A]">Institution confirms item quantity and quality upon unloading. Accepts and closes the ledger entry.</p>
                <div className="pt-1">
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#388E3C]/15 text-[#388E3C]">Status: Verified &amp; Closed</span>
                </div>
              </div>
            </div>

            {/* System logic */}
            <div className="bg-[#192d3e]/5 rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4 border border-black/5">
              {[
                { icon: BadgeCheck, title: 'Eliminates Phantom Pledges', body: 'Prevents slots from being artificially blocked. Unacknowledged pledges expire automatically within 72 hours.' },
                { icon: BarChart, title: 'Accurate Live Inventory', body: 'Public dashboard displays real-time balances so multiple donors never unknowingly double-ship the same staples.' },
                { icon: Gavel, title: 'Zero Financial Intermediary', body: 'We never hold money, so there are no escrow delays, bank charges, or commission leakages.' },
              ].map(({ icon: IconComponent, title, body }) => (
                <div key={title} className="space-y-1">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-[#192d3e]">
                    <IconComponent className="w-4 h-4 text-[#192d3e]" />
                    <span>{title}</span>
                  </div>
                  <p className="text-sm text-[#64707A]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 4: Safety, Trust & Disclaimers ───────────────────────────── */}
      <section className="w-full py-12" id="trust-policies">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#64707A] font-semibold">Transparency Standards</span>
            <h2 className="text-3xl font-bold text-[#192d3e]">Safety, Verification &amp; Data Ethics</h2>
            <p className="text-base text-[#64707A]">
              How we evaluate signals, protect beneficiaries, and responsibly present regional public health metrics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white rounded-xl p-6 shadow-sm space-y-4 border border-black/5">
              <div className="w-10 h-10 rounded-lg bg-[#d8d8d0] flex items-center justify-center text-[#192d3e]">
                <ClipboardCheck className="w-5 h-5 text-[#192d3e]" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#192d3e]">Requirement Verification</h3>
                <p className="text-sm text-[#64707A] mt-1">Every request carries a transparent verification tier:</p>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#388E3C]/15 text-[#388E3C] mt-0.5">High</span>
                  <span className="text-[#64707A]">On-ground partner verified or official NGO Darpan registration confirmed.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FFB300]/15 text-[#1F2933] mt-0.5">Medium</span>
                  <span className="text-[#64707A]">Phone verified with administrator; cross-referenced with past dispatch records.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#efedef] text-[#43474c] mt-0.5">Review</span>
                  <span className="text-[#64707A]">Newly posted requirement currently undergoing baseline verification.</span>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-xl p-6 shadow-sm space-y-4 border border-black/5">
              <div className="w-10 h-10 rounded-lg bg-[#d8d8d0] flex items-center justify-center text-[#192d3e]">
                <CreditCard className="w-5 h-5 text-[#192d3e]" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#192d3e]">Non-Transactional Guarantee</h3>
                <p className="text-sm text-[#64707A] mt-1">Strict rules against cash transfer:</p>
              </div>
              <ul className="space-y-3 text-sm text-[#64707A]">
                {[
                  'No bank account collection or payment gateway plugins on our website.',
                  'Donors order items directly via local grain suppliers or logistics channels.',
                  'Zero administrative deductions or cuts from institutional supplies.',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#192d3e] flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-xl p-6 shadow-sm space-y-4 border border-black/5">
              <div className="w-10 h-10 rounded-lg bg-[#d8d8d0] flex items-center justify-center text-[#192d3e]">
                <Shield className="w-5 h-5 text-[#192d3e]" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#192d3e]">Nutritional Disclaimer</h3>
                <p className="text-sm text-[#64707A] mt-1">Public survey data vs. clinical advice:</p>
              </div>
              <p className="text-sm text-[#64707A] leading-relaxed">
                District-level indicators (NFHS-5, Poshan Tracker aggregate metrics) provide population-level
                contextual insights and are not individual medical diagnoses. PoshanSetu facilitates food staple
                sufficiency; for therapeutic feeding or severe acute malnutrition medical protocols, refer to
                Primary Health Centers (PHCs).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────────────────── */}
      <section className="w-full py-12">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-md flex flex-col md:flex-row items-center justify-between gap-6 border border-black/5">
            <div className="space-y-2 max-w-xl">
              <span className="text-xs uppercase tracking-widest text-[#64707A] font-semibold">Get Started</span>
              <h2 className="text-3xl font-bold text-[#192d3e]">Ready to Bring Nutrition Where It Counts?</h2>
              <p className="text-base text-[#64707A]">
                Join verified institutions, citizen donors, and community coordinators building direct resilience
                across Maharashtra.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <Link to="/explore" className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#304355] text-white text-sm font-semibold text-center hover:bg-[#192d3e] transition-all shadow-sm">
                Find Where to Help
              </Link>
              <Link to="/submit-requirement" className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#f0f0ea] text-[#192d3e] text-sm font-semibold text-center hover:bg-[#d8d8d0] transition-all border border-black/5">
                Submit an Institution Need
              </Link>
            </div>
          </div>
          <div className="mt-4 text-center">
            <Link to="/explore" className="inline-flex items-center gap-1 text-xs text-[#64707A] hover:text-[#192d3e] transition-colors">
              <span>Or explore the live Maharashtra interactive map directly</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
