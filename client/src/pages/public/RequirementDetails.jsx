import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ChevronRight,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShoppingBag,
  School,
  Info,
  Users,
  Heart,
  Share2,
  ShieldCheck,
  Check
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

export default function RequirementDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleHelpClick = () => {
    navigate(`/requirements/${id}/support`);
  };

  return (
    <div className="bg-[#E8E8E2] min-h-screen text-[#1F2933] font-sans pb-16">
      <main className="max-w-[1280px] mx-auto px-6 md:px-10 py-8 space-y-10">
        {/* Breadcrumb & Header */}
        <div className="space-y-4">
          <nav className="flex items-center gap-2 text-xs font-semibold text-[#64707A]">
            <Link to="/" className="hover:text-[#304355] transition">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/explore" className="hover:text-[#304355] transition">Explore</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/requirements" className="text-[#304355] font-bold">Requirements</Link>
          </nav>

          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div className="space-y-3">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#304355] tracking-tight">
                Food Support Needed for 120 Students
              </h1>

              {/* Status Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" /> Active
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> High Confidence
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700" /> High Urgency
                </span>
              </div>

              {/* Location & Expiry Metadata */}
              <div className="flex items-center gap-6 text-xs text-[#64707A] pt-1">
                <span className="inline-flex items-center gap-1 font-medium">
                  <MapPin className="w-4 h-4 text-[#304355]" /> Nashik, Maharashtra
                </span>
                <span className="inline-flex items-center gap-1 font-medium">
                  <Calendar className="w-4 h-4 text-[#304355]" /> Valid until: 15 Oct 2024 (12 days left)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid: Content (8 cols) + Sticky Sidebar (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Left Content */}
          <div className="lg:col-span-8 space-y-8">
            {/* Section 1: What is needed? */}
            <section className="bg-white rounded-2xl p-6 md:p-8 shadow-xs border border-[#304355]/10 space-y-6">
              <h2 className="text-xl font-bold text-[#304355] flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-[#304355]" /> What is needed?
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Item Card 1: Rice */}
                <div className="border border-slate-200/80 rounded-xl p-4 bg-[#FBF9FA] space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-sm text-[#1F2933]">Rice</h3>
                      <p className="text-xs text-[#64707A]">100kg required</p>
                    </div>
                    <span className="bg-[#304355]/10 text-[#304355] px-2.5 py-1 rounded-md text-xs font-bold">
                      60kg remaining
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-[#304355] h-2 rounded-full" style={{ width: '40%' }} />
                  </div>
                  <div className="flex justify-between text-xs text-[#64707A]">
                    <span>40% supported</span>
                  </div>
                </div>

                {/* Item Card 2: Moong Dal */}
                <div className="border border-slate-200/80 rounded-xl p-4 bg-[#FBF9FA] space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-sm text-[#1F2933]">Moong Dal</h3>
                      <p className="text-xs text-[#64707A]">50kg required</p>
                    </div>
                    <span className="bg-[#304355]/10 text-[#304355] px-2.5 py-1 rounded-md text-xs font-bold">
                      30kg remaining
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-[#304355] h-2 rounded-full" style={{ width: '40%' }} />
                  </div>
                  <div className="flex justify-between text-xs text-[#64707A]">
                    <span>40% supported</span>
                  </div>
                </div>

                {/* Item Card 3: Chana */}
                <div className="border border-slate-200/80 rounded-xl p-4 bg-[#FBF9FA] space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-sm text-[#1F2933]">Chana</h3>
                      <p className="text-xs text-[#64707A]">25kg required</p>
                    </div>
                    <span className="bg-red-50 text-red-700 px-2.5 py-1 rounded-md text-xs font-bold border border-red-200">
                      25kg remaining
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-[#304355] h-2 rounded-full" style={{ width: '0%' }} />
                  </div>
                  <div className="flex justify-between text-xs text-[#64707A]">
                    <span>0% supported</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Who is requesting? */}
            <section className="bg-white rounded-2xl p-6 md:p-8 shadow-xs border border-[#304355]/10 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#304355]/5 rounded-bl-full pointer-events-none" />
              <h2 className="text-xl font-bold text-[#304355] flex items-center gap-2">
                <School className="w-6 h-6 text-[#304355]" /> Who is requesting?
              </h2>

              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 text-[#304355]">
                  <School className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-[#1F2933]">Trimbakeshwar Ashram Shala</h3>
                  <p className="text-sm text-[#64707A]">Residential School for Tribal Students</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs">
                    <div className="flex items-center gap-1.5 text-[#1F2933]">
                      <MapPin className="w-4 h-4 text-[#64707A]" /> Trimbak Block, Nashik
                    </div>
                    <div className="flex items-center gap-1.5 text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md w-fit font-semibold border border-blue-200">
                      <ShieldCheck className="w-4 h-4 text-blue-600" /> Verified by District Administration
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Why is this required? */}
            <section className="bg-white rounded-2xl p-6 md:p-8 shadow-xs border border-[#304355]/10 space-y-4">
              <h2 className="text-xl font-bold text-[#304355] flex items-center gap-2">
                <Info className="w-6 h-6 text-[#304355]" /> Why is this required?
              </h2>
              <p className="text-sm text-[#1F2933] leading-relaxed">
                We are seeing a temporary gap in our monthly grain supply. This support will ensure 120 students have consistent access to nutritious meals for the next 30 days.
              </p>
            </section>
          </div>

          {/* Right Sidebar / Sticky Action */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 bg-white rounded-2xl p-6 shadow-sm border border-[#304355]/10 space-y-6">
              {/* Support History Summary */}
              <div className="space-y-4 border-b border-[#304355]/10 pb-6">
                <h3 className="text-lg font-bold text-[#304355]">Support Summary</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#64707A] flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-[#304355]" /> Donors
                    </span>
                    <span className="font-bold text-[#1F2933]">4</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#64707A] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Supported
                    </span>
                    <span className="font-bold text-[#304355]">115kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#64707A] flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-red-600" /> Remaining
                    </span>
                    <span className="font-bold text-red-600">115kg</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  variant="primary"
                  className="w-full py-3"
                  onClick={handleHelpClick}
                  icon={Heart}
                >
                  I Want to Help
                </Button>
                <Button
                  variant="outline"
                  className="w-full py-3"
                  onClick={handleShare}
                  icon={copied ? Check : Share2}
                >
                  {copied ? 'Link Copied!' : 'Share Requirement'}
                </Button>
              </div>

              {/* Platform Notice */}
              <div className="bg-[#FBF9FA] rounded-xl p-3.5 border border-[#304355]/10 flex items-start gap-2 text-xs text-[#64707A]">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#304355]" />
                <p className="leading-tight">
                  PoshanSetu does not process payments or donations. Any donation is coordinated outside the platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
