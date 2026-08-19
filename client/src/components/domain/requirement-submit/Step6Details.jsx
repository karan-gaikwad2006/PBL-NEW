import React from 'react';
import TextArea from '../../common/TextArea';
import Button from '../../common/Button';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export default function Step6Details({ formData, updateData, onNext, onBack }) {
  const handleChange = (e) => {
    updateData({ [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!formData.description.trim()) return false;
    return true;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#304355] mb-2">Additional Details</h1>
        <p className="text-[#64707A]">Please provide any extra context or specific notes that will help donors understand your requirement better.</p>
      </div>

      <div className="bg-white p-6 md:p-10 rounded-xl shadow-sm border border-[#304355]/10">
        <div className="space-y-8">
          
          <div className="space-y-2">
            <TextArea
              label={
                <span className="flex items-center gap-1">
                  Requirement Story <span className="text-red-600">*</span>
                </span>
              }
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell us the story behind this need..."
              rows={6}
              helperText="Describe the situation, the impact this requirement will have, and why this support is crucial for your community."
              required
            />
          </div>

          <div className="space-y-2">
            <TextArea
              label="Additional Notes (Optional)"
              name="additional_notes"
              value={formData.additional_notes}
              onChange={handleChange}
              placeholder="E.g., Delivery times are restricted to morning hours..."
              rows={4}
              helperText="Any logistical details, specific delivery instructions, or other relevant information."
            />
          </div>

        </div>

        <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100">
          <Button variant="ghost" onClick={onBack} icon={ArrowLeft} iconPosition="left">
            Back to Beneficiary Info
          </Button>
          <Button
            onClick={onNext}
            disabled={!validate()}
            icon={ArrowRight}
            iconPosition="right"
          >
            Continue to Review
          </Button>
        </div>
      </div>
    </div>
  );
}
