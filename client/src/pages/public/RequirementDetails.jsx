import React, { useEffect, useState } from 'react';
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
  Check,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import Button from '../../components/common/Button';
import { requirementService } from '../../services/api';

function formatExpiry(expiresAt) {
  if (!expiresAt) return '—';
  const date = new Date(expiresAt);
  const daysLeft = Math.max(0, Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  return `${date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })} (${daysLeft} days left)`;
}

function urgencyLabel(urgency) {
  const key = String(urgency || '').toLowerCase();
  if (key === 'critical') return 'Critical Urgency';
  if (key === 'high') return 'High Urgency';
  if (key === 'low') return 'Low Urgency';
  return 'Medium Urgency';
}

export default function RequirementDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [copied, setCopied] = useState(false);
  const [requirement, setRequirement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await requirementService.getById(id);
        if (!cancelled) setRequirement(response.data);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load requirement');
          setRequirement(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleHelpClick = () => {
    navigate(`/requirements/${id}/support`);
  };

  const items = Array.isArray(requirement?.items) ? requirement.items.filter(Boolean) : [];
  const totalRequired = items.reduce((sum, item) => sum + Number(item.quantityRequired || 0), 0);
  const totalRemaining = items.reduce((sum, item) => sum + Number(item.quantityRemaining || 0), 0);
  const totalSupported = Math.max(0, totalRequired - totalRemaining);

  if (loading) {
    return (
      <div className="bg-[#E8E8E2] min-h-screen flex items-center justify-center text-[#64707A]">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#304355] mx-auto" />
          <p className="text-sm">Loading requirement…</p>
        </div>
      </div>
    );
  }

  if (error || !requirement) {
    return (
      <div className="bg-[#E8E8E2] min-h-screen flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl border border-red-200 p-10 max-w-md text-center space-y-4">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
          <h1 className="text-xl font-bold text-[#304355]">Requirement not available</h1>
          <p className="text-sm text-[#64707A]">{error || 'This requirement was not found or is not publicly visible.'}</p>
          <Button variant="primary" onClick={() => navigate('/requirements')}>
            Back to Catalog
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#E8E8E2] min-h-screen text-[#1F2933] font-sans pb-16">
      <main className="max-w-[1280px] mx-auto px-6 md:px-10 py-8 space-y-10">
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
                {requirement.title}
              </h1>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />{' '}
                  {requirement.status === 'active' ? 'Active' : requirement.status}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700" /> {urgencyLabel(requirement.urgency)}
                </span>
              </div>

              <div className="flex items-center gap-6 text-xs text-[#64707A] pt-1">
                <span className="inline-flex items-center gap-1 font-medium">
                  <MapPin className="w-4 h-4 text-[#304355]" />{' '}
                  {[requirement.city, requirement.district, 'Maharashtra'].filter(Boolean).join(', ')}
                </span>
                <span className="inline-flex items-center gap-1 font-medium">
                  <Calendar className="w-4 h-4 text-[#304355]" /> Valid until: {formatExpiry(requirement.expiresAt)}
                </span>
              </div>
            </div>
            <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/requirements')}>
              Back to Catalog
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <section className="bg-white rounded-2xl p-6 md:p-8 shadow-xs border border-[#304355]/10 space-y-6">
              <h2 className="text-xl font-bold text-[#304355] flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-[#304355]" /> What is needed?
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {items.length === 0 ? (
                  <p className="text-sm text-[#64707A]">No items listed for this requirement.</p>
                ) : (
                  items.map((item) => {
                    const required = Number(item.quantityRequired || 0);
                    const remaining = Number(item.quantityRemaining || 0);
                    const supportedPct =
                      required > 0 ? Math.round(((required - remaining) / required) * 100) : 0;
                    return (
                      <div
                        key={item.id || item.name}
                        className="border border-slate-200/80 rounded-xl p-4 bg-[#FBF9FA] space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-sm text-[#1F2933]">{item.name}</h3>
                            <p className="text-xs text-[#64707A]">
                              {required}
                              {item.unit} required
                            </p>
                          </div>
                          <span className="bg-[#304355]/10 text-[#304355] px-2.5 py-1 rounded-md text-xs font-bold">
                            {remaining}
                            {item.unit} remaining
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-[#304355] h-2 rounded-full"
                            style={{ width: `${supportedPct}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-[#64707A]">
                          <span>{supportedPct}% supported</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

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
                  <h3 className="text-xl font-bold text-[#1F2933]">
                    Food support for {requirement.beneficiaryCount} beneficiaries
                  </h3>
                  <p className="text-sm text-[#64707A]">
                    {requirement.beneficiaryDescription || 'Local food requirement'}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs">
                    <div className="flex items-center gap-1.5 text-[#1F2933]">
                      <MapPin className="w-4 h-4 text-[#64707A]" />{' '}
                      {[requirement.city, requirement.district].filter(Boolean).join(', ')}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl p-6 md:p-8 shadow-xs border border-[#304355]/10 space-y-4">
              <h2 className="text-xl font-bold text-[#304355] flex items-center gap-2">
                <Info className="w-6 h-6 text-[#304355]" /> Why is this required?
              </h2>
              <p className="text-sm text-[#1F2933] leading-relaxed">
                {requirement.description || 'No additional description provided.'}
              </p>
            </section>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-24 bg-white rounded-2xl p-6 shadow-sm border border-[#304355]/10 space-y-6">
              <div className="space-y-4 border-b border-[#304355]/10 pb-6">
                <h3 className="text-lg font-bold text-[#304355]">Support Summary</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#64707A] flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-[#304355]" /> Beneficiaries
                    </span>
                    <span className="font-bold text-[#1F2933]">{requirement.beneficiaryCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#64707A] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Supported
                    </span>
                    <span className="font-bold text-[#304355]">{totalSupported}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#64707A] flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-red-600" /> Remaining
                    </span>
                    <span className="font-bold text-red-600">{totalRemaining}</span>
                  </div>
                </div>
              </div>

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
