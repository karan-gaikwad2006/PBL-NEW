import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { requirementService, offerService } from '../../services/api';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/common/Button';
import { ArrowLeft, Send, ClipboardList, ShieldCheck, Info, User, HelpCircle } from 'lucide-react';

export default function SendSupportOffer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { firebaseUser, user } = useContext(AuthContext);
  const [requirement, setRequirement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New multi-item state: Map of itemName -> { selected: boolean, quantity: string }
  const [itemSelections, setItemSelections] = useState({});
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await requirementService.getById(id);
        if (!cancelled) {
          setRequirement(res.data);
          // Initialize selections with all items unselected
          const initial = {};
          res.data.items?.forEach(item => {
            initial[item.name] = { selected: false, quantity: '' };
          });
          setItemSelections(initial);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load requirement');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  const handleToggleItem = (itemName) => {
    setItemSelections(prev => ({
      ...prev,
      [itemName]: {
        ...prev[itemName],
        selected: !prev[itemName].selected,
        // Reset quantity if unselected
        quantity: !prev[itemName].selected ? '' : prev[itemName].quantity
      }
    }));
  };

  const handleQuantityChange = (itemName, val) => {
    setItemSelections(prev => ({
      ...prev,
      [itemName]: { ...prev[itemName], quantity: val }
    }));
  };

  const selectedItemsList = requirement?.items?.filter(item => itemSelections[item.name]?.selected) || [];
  const totalSelected = selectedItemsList.length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firebaseUser) return;

    if (totalSelected === 0) {
      setSubmitError('Please select at least one item to provide.');
      return;
    }

    // Validate quantities
    const itemsToSubmit = [];
    for (const item of selectedItemsList) {
      const selection = itemSelections[item.name];
      const qty = parseFloat(selection.quantity);
      if (isNaN(qty) || qty <= 0) {
        setSubmitError(`Please enter a valid quantity for ${item.name}.`);
        return;
      }
      if (qty > item.quantityRemaining) {
        setSubmitError(`Quantity for ${item.name} cannot exceed remaining ${item.quantityRemaining} ${item.unit}.`);
        return;
      }
      itemsToSubmit.push({
        name: item.name,
        quantity: qty,
        unit: item.unit
      });
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const token = await firebaseUser.getIdToken();
      const offerData = {
        requirementId: id,
        items: itemsToSubmit,
        message
      };
      const response = await offerService.create(token, offerData);
      const createdOffers = Array.isArray(response.data) ? response.data : [response.data];
      navigate(`/requirements/${id}/support-success`, {
        state: {
          items: itemsToSubmit,
          message,
          offerId: createdOffers[0]?.id,
        }
      });
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit offer');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-32 text-[#64707A]">Loading requirement...</div>
      </PageContainer>
    );
  }

  if (error || !requirement) {
    return (
      <PageContainer>
        <div className="text-center py-32 text-red-600 font-bold">{error || 'Requirement not found'}</div>
      </PageContainer>
    );
  }

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
              className="bg-white border border-[#304355]/10 rounded-2xl shadow-sm p-6 md:p-8 space-y-8"
            >
              {/* Multi-Item Selection */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-[#1F2933]">
                    Select items you want to provide *
                  </label>
                  <span className="text-xs text-[#64707A]">{totalSelected} items selected</span>
                </div>
                
                <div className="space-y-3">
                  {requirement.items.map((item) => {
                    const isSelected = itemSelections[item.name]?.selected;
                    const quantityValue = itemSelections[item.name]?.quantity || '';
                    
                    return (
                      <div 
                        key={item.name}
                        className={`border rounded-xl p-4 transition-all ${
                          isSelected 
                            ? 'border-[#304355] bg-[#304355]/5 shadow-sm' 
                            : 'border-slate-200 hover:border-slate-300 bg-[#FBF9FA]'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex items-center h-5 mt-1">
                            <input
                              type="checkbox"
                              checked={!!isSelected}
                              onChange={() => handleToggleItem(item.name)}
                              className="w-5 h-5 rounded border-slate-300 text-[#304355] focus:ring-[#304355] cursor-pointer"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <p className="font-bold text-[#1F2933] text-sm">{item.name}</p>
                                <p className="text-xs text-[#64707A] mt-0.5">
                                  {item.quantityRemaining} {item.unit} remaining
                                </p>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700 uppercase tracking-tight">
                                {item.unit}
                              </span>
                            </div>

                            {isSelected && (
                              <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                <label className="text-[10px] font-bold text-[#304355] uppercase tracking-wider mb-1.5 block">
                                  Quantity to provide
                                </label>
                                <div className="flex items-center gap-3">
                                  <input
                                    type="number"
                                    value={quantityValue}
                                    onChange={(e) => handleQuantityChange(item.name, e.target.value)}
                                    placeholder={`e.g. ${Math.min(20, item.quantityRemaining)}`}
                                    className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-[#1F2933] focus:outline-none focus:border-[#304355] transition-colors"
                                    min="0.1"
                                    step="any"
                                    max={item.quantityRemaining}
                                    required
                                  />
                                  <span className="text-sm font-semibold text-[#64707A]">{item.unit}</span>
                                </div>
                                {parseFloat(quantityValue) > item.quantityRemaining && (
                                  <p className="text-[10px] text-red-600 font-bold mt-1">
                                    Cannot exceed remaining quantity
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
                      <p className="font-semibold text-sm text-[#1F2933]">{user?.full_name}</p>
                      <p className="text-xs text-[#64707A]">{user?.email}</p>
                    </div>
                  </div>
                  <button type="button" className="text-[#304355] font-semibold text-sm hover:underline self-start sm:self-center">
                    Edit Profile
                  </button>
                </div>
              </div>

              {submitError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
                  {submitError}
                </div>
              )}
              {/* Submit CTA */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full sm:w-auto px-8 py-3"
                  icon={Send}
                  disabled={submitting}
                >
                  {submitting ? 'Sending...' : 'Send Support Offer'}
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
                    <p className="font-semibold text-sm text-[#304355]">{requirement.institution || requirement.title}</p>
                    <p className="text-xs text-[#64707A] mt-1 line-clamp-3">{requirement.description}</p>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Target items summary */}
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[#64707A] uppercase tracking-wider">Support Summary</p>
                  {selectedItemsList.length === 0 ? (
                    <p className="text-xs text-[#64707A] italic">No items selected yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedItemsList.map(item => {
                        const selection = itemSelections[item.name];
                        const qty = parseFloat(selection.quantity || 0);
                        const progress = ((item.quantityRequired - item.quantityRemaining + qty) / item.quantityRequired) * 100;
                        
                        return (
                          <div key={item.name} className="space-y-1.5">
                            <div className="flex justify-between items-end text-xs">
                              <span className="font-bold text-[#304355]">{item.name}</span>
                              <div className="text-right">
                                <span className="font-bold text-[#304355]">{qty}</span>
                                <span className="text-[#64707A]"> / {item.quantityRemaining} {item.unit}</span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="bg-[#304355] h-1.5 rounded-full transition-all duration-500" 
                                style={{ width: `${Math.min(100, progress)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Impact Preview */}
                <div className="bg-[#304355]/5 border border-[#304355]/20 rounded-xl p-4 flex items-start gap-3">
                  <Info className="w-4 h-4 text-[#304355] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-xs text-[#304355] mb-1">Impact Preview</h4>
                    <p className="text-xs text-[#64707A] leading-relaxed">
                      {totalSelected === 0 
                        ? "Select items to see how your contribution helps."
                        : `Your offer of ${totalSelected} item${totalSelected > 1 ? 's' : ''} will directly support this requirement. Thank you for your generosity!`}
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
