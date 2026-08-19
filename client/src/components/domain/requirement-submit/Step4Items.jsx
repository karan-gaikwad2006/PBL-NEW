import React from 'react';
import Button from '../../common/Button';
import { ArrowRight, Plus, X } from 'lucide-react';

export default function Step4Items({ formData, updateData, onNext, onBack }) {
  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    updateData({ items: newItems });
  };

  const addItem = () => {
    updateData({ items: [...formData.items, { name: '', quantity: '', unit: 'kg' }] });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    updateData({ items: newItems });
  };

  const handleQuickAdd = (suggestion) => {
    // If the last item is completely empty, replace it, else add new
    const lastItem = formData.items[formData.items.length - 1];
    if (lastItem && !lastItem.name && !lastItem.quantity) {
      handleItemChange(formData.items.length - 1, 'name', suggestion);
    } else {
      updateData({ items: [...formData.items, { name: suggestion, quantity: '', unit: 'kg' }] });
    }
  };

  const validate = () => {
    if (formData.items.length === 0) return false;
    return formData.items.every(item => item.name.trim() !== '' && item.quantity !== '');
  };

  const suggestions = ['Rice', 'Moong Dal', 'Chana', 'Jowar', 'Bajra', 'Ragi'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#304355] mb-2">What is required?</h1>
      </div>

      <div className="bg-white p-6 md:p-10 rounded-xl shadow-sm border border-[#304355]/10">
        
        <div className="mb-8">
          <label className="block text-sm font-semibold text-[#64707A] mb-3">Quick Add Suggestions</label>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleQuickAdd(suggestion)}
                className="px-4 py-2 rounded-full bg-[#F5F3F4] hover:bg-[#304355] hover:text-white border border-[#304355]/10 text-sm text-[#1F2933] transition-colors duration-200"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {formData.items.map((item, index) => (
            <div key={index} className="bg-[#FBF9FA] rounded-lg p-4 border border-[#304355]/10 relative group">
              {formData.items.length > 1 && (
                <button 
                  type="button"
                  onClick={() => removeItem(index)}
                  className="absolute top-2 right-2 p-1 text-[#64707A] hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start pt-2">
                <div className="md:col-span-6">
                  <label className="block text-xs font-semibold text-[#64707A] mb-1">Item Name</label>
                  <input 
                    type="text" 
                    value={item.name}
                    onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                    className="w-full bg-white border border-[#c3c7cc] rounded-md px-3 py-2 text-sm text-[#1F2933] focus:border-[#304355] focus:ring-1 focus:ring-[#304355] outline-none transition-all"
                    placeholder="e.g. Rice, Dal"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-[#64707A] mb-1">Quantity</label>
                  <input 
                    type="number" 
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    className="w-full bg-white border border-[#c3c7cc] rounded-md px-3 py-2 text-sm text-[#1F2933] focus:border-[#304355] focus:ring-1 focus:ring-[#304355] outline-none transition-all"
                    placeholder="0"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-[#64707A] mb-1">Unit</label>
                  <select 
                    value={item.unit}
                    onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                    className="w-full bg-white border border-[#c3c7cc] rounded-md px-3 py-2 text-sm text-[#1F2933] focus:border-[#304355] focus:ring-1 focus:ring-[#304355] outline-none transition-all"
                  >
                    <option value="kg">kg</option>
                    <option value="grams">grams</option>
                    <option value="packets">packets</option>
                    <option value="liters">liters</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button 
          type="button"
          onClick={addItem}
          className="flex items-center justify-center gap-2 text-[#304355] font-semibold text-sm hover:bg-[#304355]/5 px-4 py-3 rounded-md transition-colors w-full border border-dashed border-[#304355]/50"
        >
          <Plus className="w-5 h-5" />
          Add Another Item
        </button>

        <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100">
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
          <Button
            onClick={onNext}
            disabled={!validate()}
            icon={ArrowRight}
            iconPosition="right"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
