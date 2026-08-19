import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/common/Button';
import { CheckCircle2, ArrowRight, ShieldAlert, BarChart3, LayoutDashboard, Search } from 'lucide-react';

export default function SupportOfferSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const offer = location.state?.offer || {
    item: 'Moong Dal',
    quantity: '20',
    unit: 'kg'
  };

  return (
    <PageContainer>
      <div className="max-w-[700px] mx-auto px-6 md:px-10 py-12 text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Success Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full text-emerald-600">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        {/* Heading & Subtext */}
        <div className="space-y-3">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#304355] tracking-tight">
            Your support offer has been sent.
          </h1>
          <p className="text-base text-[#64707A]">
            The requester will review your offer and get in touch.
          </p>
        </div>

        {/* Offer Summary Card */}
        <div className="bg-white border border-[#304355]/10 rounded-xl p-4 text-left max-w-md mx-auto flex items-center justify-between">
          <div>
            <span className="text-xs text-[#64707A] block">Offered Item</span>
            <span className="font-bold text-sm text-[#1F2933]">{offer.item}</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-[#64707A] block">Quantity Offered</span>
            <span className="font-bold text-sm text-[#304355]">{offer.quantity} {offer.unit}</span>
          </div>
        </div>

        {/* Next Steps Card */}
        <div className="bg-white border border-[#304355]/10 rounded-2xl p-6 text-left max-w-xl mx-auto shadow-sm">
          <h2 className="text-lg font-bold text-[#304355] mb-6">Next Steps</h2>
          
          <div className="relative border-l-2 border-slate-200 ml-3 space-y-6">
            <div className="pl-6 relative">
              <span className="absolute -left-3.5 top-0 w-7 h-7 rounded-full bg-white border-2 border-[#304355] text-[#304355] flex items-center justify-center font-bold text-xs">
                1
              </span>
              <p className="text-sm font-semibold text-[#1F2933]">Requester reviews your offer.</p>
              <p className="text-xs text-[#64707A] mt-0.5">They will review your contact details and reach out.</p>
            </div>
            
            <div className="pl-6 relative">
              <span className="absolute -left-3.5 top-0 w-7 h-7 rounded-full bg-white border-2 border-[#304355] text-[#304355] flex items-center justify-center font-bold text-xs">
                2
              </span>
              <p className="text-sm font-semibold text-[#1F2933]">You coordinate the donation outside PoshanSetu.</p>
              <p className="text-xs text-[#64707A] mt-0.5">Arrange delivery times and locations directly with the requester.</p>
            </div>

            <div className="pl-6 relative">
              <span className="absolute -left-3.5 top-0 w-7 h-7 rounded-full bg-white border-2 border-[#304355] text-[#304355] flex items-center justify-center font-bold text-xs">
                3
              </span>
              <p className="text-sm font-semibold text-[#1F2933]">After completion, both sides confirm on the platform.</p>
              <p className="text-xs text-[#64707A] mt-0.5">Dual-confirmation updates the official tracking progress.</p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 p-4 rounded-xl text-left max-w-xl mx-auto">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-[#1F2933] font-bold">
            No payment or donation is processed through PoshanSetu. Coordination happens entirely outside of the platform.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Button
            variant="primary"
            onClick={() => navigate(`/confirm-completion/${id || 'req-1'}`)}
            icon={BarChart3}
          >
            Track Progress
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            icon={LayoutDashboard}
          >
            Go to My Dashboard
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate('/explore')}
            icon={Search}
          >
            Explore More Needs
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
