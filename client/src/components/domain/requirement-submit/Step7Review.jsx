import React from 'react';
import Button from '../../common/Button';
import { User, MapPin, Users, Package, Info, Edit2, AlertCircle, Loader2 } from 'lucide-react';

export default function Step7Review({ formData, onNext, onBack, setStep, isSubmitting, error }) {
  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'critical':
        return <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold border border-red-200">Critical Priority</span>;
      case 'high':
        return <span className="inline-flex items-center px-2 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold border border-orange-200">High Priority</span>;
      case 'medium':
        return <span className="inline-flex items-center px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold border border-amber-200">Medium Priority</span>;
      case 'low':
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200">Low Priority</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#304355] mb-2">Review and Submit</h1>
        <p className="text-[#64707A]">Please review your requirement details carefully before final submission.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        <div className="col-span-1 md:col-span-12 bg-blue-50/50 border border-blue-100 rounded-lg p-4 flex items-start gap-3 shadow-sm">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-blue-800 mb-1">Automated Review Process</h3>
            <p className="text-xs text-blue-600/80">Automated checks will review this requirement for duplicates, location consistency, quantity sanity, and other risk signals before it is published.</p>
          </div>
        </div>

        <div className="col-span-1 md:col-span-6 bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
            <h3 className="text-lg font-semibold text-[#304355] flex items-center">
              <User className="w-5 h-5 mr-2 text-[#304355]/80" /> Requester
            </h3>
            <button onClick={() => setStep(1)} className="text-[#304355] hover:text-[#43586d] text-sm font-semibold flex items-center transition-colors">
              Edit <Edit2 className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
          <div className="space-y-2 text-sm text-[#64707A]">
            <div className="flex justify-between"><span>Name:</span> <span className="font-medium text-[#1F2933]">{formData.name}</span></div>
            {formData.requester_type !== 'individual' && (
              <div className="flex justify-between"><span>Organization:</span> <span className="font-medium text-[#1F2933]">{formData.institution_name}</span></div>
            )}
            <div className="flex justify-between"><span>Type:</span> <span className="font-medium text-[#1F2933]">{formData.requester_type}</span></div>
          </div>
        </div>

        <div className="col-span-1 md:col-span-6 bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
            <h3 className="text-lg font-semibold text-[#304355] flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-[#304355]/80" /> Location
            </h3>
            <button onClick={() => setStep(2)} className="text-[#304355] hover:text-[#43586d] text-sm font-semibold flex items-center transition-colors">
              Edit <Edit2 className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
          <div className="space-y-2 text-sm text-[#64707A]">
            <div className="flex justify-between"><span>State:</span> <span className="font-medium text-[#1F2933]">{formData.state}</span></div>
            <div className="flex justify-between"><span>District:</span> <span className="font-medium text-[#1F2933]">{formData.district}</span></div>
            <div className="flex justify-between"><span>City/Village:</span> <span className="font-medium text-[#1F2933]">{formData.city}</span></div>
          </div>
        </div>

        <div className="col-span-1 md:col-span-4 bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
            <h3 className="text-lg font-semibold text-[#304355] flex items-center">
              <Users className="w-5 h-5 mr-2 text-[#304355]/80" /> Impact
            </h3>
            <button onClick={() => setStep(3)} className="text-[#304355] hover:text-[#43586d] text-sm font-semibold flex items-center transition-colors">
              Edit <Edit2 className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
          <div className="space-y-2 text-sm text-[#64707A]">
            <div className="flex justify-between items-center"><span>Beneficiaries:</span> <span className="font-medium text-[#1F2933] text-lg">{formData.beneficiary_count}</span></div>
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100">
              <span>Urgency:</span>
              {getUrgencyBadge(formData.urgency)}
            </div>
          </div>
        </div>

        <div className="col-span-1 md:col-span-8 bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
            <h3 className="text-lg font-semibold text-[#304355] flex items-center">
              <Package className="w-5 h-5 mr-2 text-[#304355]/80" /> Items Required
            </h3>
            <button onClick={() => setStep(4)} className="text-[#304355] hover:text-[#43586d] text-sm font-semibold flex items-center transition-colors">
              Edit <Edit2 className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {formData.items.map((item, index) => (
              <div key={index} className="bg-slate-50 p-3 rounded border border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-white flex items-center justify-center text-[#304355] font-semibold border border-slate-200 shadow-sm text-xs">
                    {item.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-[#1F2933]">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-[#304355]">{item.quantity} {item.unit}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3 animate-in fade-in duration-300">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-200">
        <Button variant="ghost" onClick={onBack} disabled={isSubmitting}>
          Back
        </Button>
        <Button
          onClick={onNext}
          variant="primary"
          className="px-8 shadow-sm min-w-[180px]"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
            </>
          ) : (
            'Submit Requirement'
          )}
        </Button>
      </div>
    </div>
  );
}
