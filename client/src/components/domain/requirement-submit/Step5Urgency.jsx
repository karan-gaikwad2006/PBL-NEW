import React from 'react';
import Button from '../../common/Button';
import { ArrowRight, AlertTriangle, AlertCircle, Clock, Info, Calendar } from 'lucide-react';

export default function Step5Urgency({ formData, updateData, onNext, onBack }) {
  const handleUrgencyChange = (urgency) => {
    updateData({ urgency });
  };

  const validate = () => {
    if (!formData.urgency) return false;
    return true;
  };

  const urgencies = [
    {
      id: 'critical',
      label: 'Critical',
      desc: 'Immediate action required. Needs attention within 24-48 hours.',
      icon: AlertTriangle,
      colorClass: 'text-red-600',
      bgClass: 'bg-red-50',
      borderClass: 'border-red-600'
    },
    {
      id: 'high',
      label: 'High',
      desc: 'Important but not life-threatening. Needed within a few days.',
      icon: AlertCircle,
      colorClass: 'text-orange-500',
      bgClass: 'bg-orange-50',
      borderClass: 'border-orange-500'
    },
    {
      id: 'medium',
      label: 'Medium',
      desc: 'Standard request. Needed within 1-2 weeks.',
      icon: Clock,
      colorClass: 'text-amber-500',
      bgClass: 'bg-amber-50',
      borderClass: 'border-amber-500'
    },
    {
      id: 'low',
      label: 'Low',
      desc: 'Ongoing need. Flexible timeline, usually within a month.',
      icon: Clock,
      colorClass: 'text-blue-500',
      bgClass: 'bg-blue-50',
      borderClass: 'border-blue-500'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#304355] mb-2">When is it needed?</h1>
        <p className="text-[#64707A]">Help us prioritize by setting the urgency. We will automatically suggest an expiration date to keep listings fresh.</p>
      </div>

      <div className="bg-white p-6 md:p-10 rounded-xl shadow-sm border border-[#304355]/10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {urgencies.map((u) => {
            const Icon = u.icon;
            const isSelected = formData.urgency === u.id;
            
            return (
              <label 
                key={u.id}
                className={`relative flex flex-col p-6 rounded-lg border shadow-sm cursor-pointer transition-all group ${
                  isSelected ? `${u.borderClass} shadow-md` : 'border-slate-200 hover:shadow-md'
                }`}
              >
                <input 
                  type="radio" 
                  name="urgency" 
                  value={u.id} 
                  checked={isSelected}
                  onChange={() => handleUrgencyChange(u.id)}
                  className="sr-only peer" 
                />
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${u.bgClass} ${u.colorClass}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-[#304355] mb-1">{u.label}</h3>
                <p className="text-sm text-[#64707A]">{u.desc}</p>
              </label>
            )
          })}
        </div>

        <div className="w-full bg-[#304355]/5 rounded-lg p-6 border border-[#304355]/10 flex flex-col md:flex-row items-start md:items-center gap-4 mb-8">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#304355] flex-shrink-0 shadow-sm">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="flex-grow">
            <h4 className="text-sm font-semibold text-[#304355] mb-1">Suggested Validity</h4>
            <p className="text-sm text-[#64707A] mb-2">
              Based on {formData.urgency.charAt(0).toUpperCase() + formData.urgency.slice(1)} urgency, we suggest a validity until <strong className="text-[#304355] font-semibold">Oct 24, 2026</strong>.
            </p>
            <p className="text-xs text-[#64707A] flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              This requirement will automatically expire on this date unless updated.
            </p>
          </div>
          <button type="button" className="whitespace-nowrap px-4 py-2 bg-white border border-[#c3c7cc] rounded text-[#304355] text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm mt-2 md:mt-0">
            Change Date
          </button>
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-slate-100">
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
          <Button
            onClick={onNext}
            disabled={!validate()}
            icon={ArrowRight}
            iconPosition="right"
          >
            Continue to Details
          </Button>
        </div>
      </div>
    </div>
  );
}
