import React from 'react';
import Input from '../../common/Input';
import Select from '../../common/Select';
import Button from '../../common/Button';
import { ArrowRight, User, Building, School, Briefcase, Heart } from 'lucide-react';

export default function Step1Requester({ formData, updateData, onNext }) {
  const handleChange = (e) => {
    updateData({ [e.target.name]: e.target.value });
  };

  const handleTypeChange = (type) => {
    updateData({ requester_type: type });
  };

  const validate = () => {
    if (!formData.name.trim()) return false;
    if (formData.requester_type !== 'individual' && !formData.institution_name.trim()) return false;
    if (formData.requester_type !== 'individual' && !formData.institution_type) return false;
    return true;
  };

  const types = [
    { id: 'individual', label: 'Individual / Normal User', icon: User },
    { id: 'ashram_shala', label: 'Ashram Shala', icon: Building },
    { id: 'school', label: 'School', icon: School },
    { id: 'ngo', label: 'NGO', icon: Heart },
    { id: 'other', label: 'Other Institution', icon: Briefcase },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#304355] mb-2">Tell us who is requesting support</h1>
      </div>

      <div className="space-y-8 bg-white p-6 md:p-10 rounded-xl shadow-sm border border-[#304355]/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {types.map((type, index) => {
            const Icon = type.icon;
            const isSelected = formData.requester_type === type.id;
            return (
              <div
                key={type.id}
                onClick={() => handleTypeChange(type.id)}
                className={`relative cursor-pointer group h-full p-4 rounded-lg border transition-all flex flex-col items-center justify-center text-center gap-2 shadow-sm ${
                  type.id === 'other' ? 'md:col-span-2' : ''
                } ${
                  isSelected
                    ? 'border-[#304355] ring-1 ring-[#304355] bg-[#304355]/5'
                    : 'border-[#304355]/10 bg-white hover:bg-[#F5F3F4]'
                }`}
              >
                <Icon
                  className={`w-8 h-8 ${isSelected ? 'text-[#304355]' : 'text-[#304355]/60'}`}
                />
                <span className={`text-sm font-semibold ${isSelected ? 'text-[#1F2933]' : 'text-[#64707A]'}`}>
                  {type.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          <Input
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />
          
          {formData.requester_type !== 'individual' && (
            <>
              <Input
                label="Institution Name"
                name="institution_name"
                value={formData.institution_name}
                onChange={handleChange}
                placeholder="Enter institution name"
                required
              />
              <Select
                label="Institution Type"
                name="institution_type"
                value={formData.institution_type}
                onChange={handleChange}
                required
              >
                <option value="">Select type</option>
                <option value="type1">Type 1</option>
                <option value="type2">Type 2</option>
                <option value="type3">Type 3</option>
              </Select>
            </>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button
            onClick={onNext}
            disabled={!validate()}
            icon={ArrowRight}
            iconPosition="right"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
