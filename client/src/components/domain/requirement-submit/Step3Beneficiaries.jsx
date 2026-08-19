import React from 'react';
import Input from '../../common/Input';
import TextArea from '../../common/TextArea';
import Button from '../../common/Button';
import { ArrowRight, Users, ArrowLeft } from 'lucide-react';

export default function Step3Beneficiaries({ formData, updateData, onNext, onBack }) {
  const handleChange = (e) => {
    updateData({ [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!formData.beneficiary_count) return false;
    if (!formData.beneficiary_desc.trim()) return false;
    return true;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#304355] mb-2">Who will this support?</h1>
        <p className="text-[#64707A]">Provide details about the individuals or community members who will benefit from this nutrition requirement.</p>
      </div>

      <div className="bg-white p-6 md:p-10 rounded-xl shadow-sm border border-[#304355]/10">
        <div className="space-y-6">
          <Input
            label="Number of Beneficiaries"
            name="beneficiary_count"
            type="number"
            value={formData.beneficiary_count}
            onChange={handleChange}
            placeholder="e.g., 50"
            icon={Users}
            helperText="Estimate the total number of people who will receive support."
            required
          />

          <TextArea
            label="Beneficiary Description"
            name="beneficiary_desc"
            value={formData.beneficiary_desc}
            onChange={handleChange}
            placeholder="e.g., Primary school students in Grade 1-5, Tribal community families focusing on maternal health..."
            rows={3}
            helperText="Describe the specific demographic or group (e.g., age group, community type)."
            required
          />

          <div className="rounded-lg overflow-hidden border border-[#304355]/10 h-32 relative hidden md:block mt-6">
            <img 
              className="object-cover w-full h-full opacity-80 mix-blend-multiply" 
              alt="Community"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCn6k39ZeUbv490_F4zD-k_8eQgBfc116ioCQbXBhaRsn3lqpsoYYHwCpMnp16CAuumiLtGSnvTaMhktCTt64sXvwqbq5OIZu-Bx6CjB1TGhnurlqWblRPAWkdypaN0QiPxpVQuH9ET0maXefrWaBAVhhMOnKFxWGY5z734zaFqQJvix11Nwkb8y1pbZjWmOqUwtGUFnU4AZGHqefTaC8G9_mt0SKJUoVqMaBhiChpeZFZNgLDOysQI" 
            />
            <div className="absolute inset-0 bg-[#304355]/5"></div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100">
          <Button variant="ghost" onClick={onBack} icon={ArrowLeft} iconPosition="left">
            Back
          </Button>
          <Button
            onClick={onNext}
            disabled={!validate()}
            icon={ArrowRight}
            iconPosition="right"
          >
            Next Step
          </Button>
        </div>
      </div>
    </div>
  );
}
