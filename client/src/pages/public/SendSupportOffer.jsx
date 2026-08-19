import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/common/Button';
import { ArrowLeft, Send, ClipboardList, ShieldCheck, Info, User, HelpCircle } from 'lucide-react';

export default function SendSupportOffer() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data for the specific requirement
  const requirement = {
    title: 'Food Support Needed for 120 Students',
    requester: 'Trimbakeshwar Ashram Shala',
    description: 'Residential School for Tribal Students providing daily meals to 120+ individuals in Trimbak, Nashik.',
    items: [
      { name: 'Rice', target: 100, remaining: 60, unit: 'kg' },
      { name: 'Moong Dal', target: 50, remaining: 30, unit: 'kg' },
      { name: 'Chana', target: 25, remaining: 25, unit: 'kg' }
    ]
  };

  const [selectedItem, setSelectedItem] = useState(requirement.items[0].name);
  const [quantity, setQuantity] = useState('20');
  const [unit, setUnit] = useState('kg');
  const [message, setMessage] = useState('');

  const currentItem = requirement.items.find(i => i.name === selectedItem) || requirement.items[0];
  const remainingAfter = Math.max(0, currentItem.remaining - parseFloat(quantity || 0));

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/requirements/${id}/support-success`, {
      state: {
        offer: {
          item: selectedItem,
          quantity,
          unit,
          message
        }
      }
    });
  };

  return (
    <PageContainer>
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link
            to={`/requirements/${id}`}
            className="inline-flex items-center gap-2 text-[#64707A] hover:text-[#304355] transition-colors font-semibold text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Request Details
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Card */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#304355] mb-2 tracking-tight">
                Tell the requester how you'd like to help
              </h1>
              <p className="text-sm text-[#64707A]">
                Specify your support details. Your contact information will be securely shared with the requester.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="bg-white border border-[#304355]/10 rounded-2xl shadow-sm p-6 md:p-8 space-y-6"
            >
              {/* Item selection */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#1F2933]" htmlFor="item-select">
                  Item you want to provide *
                </label>
                <select
                  id="item-select"
                  value={selectedItem}
                  onChange={(e) => setSelectedItem(e.target.value)}
                  className="w-full bg-[#FBF9FA] border border-slate-300 rounded-lg px-4 py-3 text-sm text-[#1F2933] focus:outline-none focus:border-[#304355] focus:ring-1 focus:ring-[#304355] transition-colors"
                  required
                >
                  {requirement.items.map((item) => (
                    <option key={item.name} value={item.name}>
                      {item.name} ({item.remaining} {item.unit} remaining)
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity and Unit */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-[#1F2933]" htmlFor="quantity">
                    Approximate quantity *
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 20"
                    className="w-full bg-[#FBF9FA] border border-slate-300 rounded-lg px-4 py-3 text-sm text-[#1F2933] focus:outline-none focus:border-[#304355] focus:ring-1 focus:ring-[#304355] transition-colors"
                    required
                    min="1"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-[#1F2933]" htmlFor="unit">
                    Unit *
                  </label>
                  <select
                    id="unit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-[#FBF9FA] border border-slate-300 rounded-lg px-4 py-3 text-sm text-[#1F2933] focus:outline-none focus:border-[#304355] focus:ring-1 focus:ring-[#304355] transition-colors"
                    required
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="grams">Grams (g)</option>
                    <option value="packets">Packets</option>
                    <option value="liters">Liters (L)</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-[#1F2933]" htmlFor="message">
                    Optional message
                  </label>
                  <span className="text-xs text-[#64707A]">Max 500 chars</span>
                </div>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, 500))}
                  placeholder="Add any details about drop-off, timing, or condition of the items..."
                  rows={4}
                  className="w-full bg-[#FBF9FA] border border-slate-300 rounded-lg px-4 py-3 text-sm text-[#1F2933] focus:outline-none focus:border-[#304355] focus:ring-1 focus:ring-[#304355] transition-colors resize-none"
                />
              </div>

              <hr className="border-slate-100" />

              {/* Read Only Profile Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-[#304355]">Your Contact Details</h3>
                <p className="text-xs text-[#64707A]">
                  This information from your profile will be shared with the requester to coordinate logistics.
                </p>
                <div className="bg-[#FBF9FA] rounded-xl p-4 border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-[#304355] text-white flex items-center justify-center font-bold text-sm">
                      KS
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[#1F2933]">Karan S.</p>
                      <p className="text-xs text-[#64707A]">+91 98765 43210 • karan.s@example.com</p>
                    </div>
                  </div>
                  <button type="button" className="text-[#304355] font-semibold text-sm hover:underline self-start sm:self-center">
                    Edit Profile
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full sm:w-auto px-8 py-3"
                  icon={Send}
                >
                  Send Support Offer
                </Button>
              </div>
            </form>
          </div>

          {/* Right Column: Contextual Sidebar */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-24">
            <div className="bg-white border border-[#304355]/10 rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-[#FBF9FA] px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[#304355]" />
                <h2 className="font-bold text-base text-[#304355]">Original Requirement</h2>
              </div>
              <div className="p-6 space-y-6">
                {/* Requester snippet */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#304355]/10 flex items-center justify-center shrink-0 text-[#304355] mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#64707A] uppercase tracking-wider mb-0.5">Requested By</p>
                    <p className="font-semibold text-sm text-[#304355]">{requirement.requester}</p>
                    <p className="text-xs text-[#64707A] mt-1">{requirement.description}</p>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Target item */}
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-[#64707A] uppercase tracking-wider">Item Needed</p>
                  <p className="text-xl font-extrabold text-[#304355]">{currentItem.name}</p>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end text-xs">
                    <div>
                      <span className="font-bold text-sm text-orange-600">{currentItem.remaining} {currentItem.unit}</span>
                      <span className="text-[#64707A]"> remaining</span>
                    </div>
                    <span className="font-semibold text-[#64707A]">Target: {currentItem.target} {currentItem.unit}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-[#304355] h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${((currentItem.target - currentItem.remaining) / currentItem.target) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Impact Preview */}
                <div className="bg-[#304355]/5 border border-[#304355]/20 rounded-xl p-4 flex items-start gap-3">
                  <Info className="w-4 h-4 text-[#304355] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-xs text-[#304355] mb-1">Impact Preview</h4>
                    <p className="text-xs text-[#64707A] leading-relaxed">
                      Your offer of <strong className="text-[#1F2933]">{quantity || 0} {unit}</strong> will partially support this requirement, leaving {remainingAfter} {currentItem.unit} remaining for others to fulfill. Every bit helps!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust signal card */}
            <div className="bg-[#EBFDF5] border border-emerald-200 rounded-2xl p-5 flex items-center gap-4">
              <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
              <div>
                <p className="font-semibold text-sm text-[#1F2933]">Verified Requester</p>
                <p className="text-xs text-[#64707A]">This organization has been vetted by our community guidelines.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
