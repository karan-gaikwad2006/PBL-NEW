import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/common/Button';
import AuthContext from '../../context/AuthContext';
import { offerService } from '../../services/api';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MapPin, 
  Calendar, 
  User, 
  Utensils,
  BarChart3, 
  History, 
  Info,
  Check,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function ConfirmSupportCompletion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { firebaseUser, user } = useContext(AuthContext);

  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [notReceived, setNotReceived] = useState(false);

  useEffect(() => {
    if (!firebaseUser || !id) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const token = await firebaseUser.getIdToken();
        const res = await offerService.getById(token, id);
        if (!cancelled) setOffer(res.data);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load offer details');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [firebaseUser, id]);

  const handleConfirmReceipt = async () => {
    if (!firebaseUser || !id) return;
    setSubmitting(true);
    setError(null);
    try {
      const token = await firebaseUser.getIdToken();
      const res = await offerService.confirmRequester(token, id);
      setOffer(res.data);
      setNotReceived(false);
    } catch (err) {
      setError(err.message || 'Failed to confirm receipt');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNotReceived = () => {
    setNotReceived(true);
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-32 gap-3 text-[#64707A]">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-sm font-medium">Loading offer details…</span>
        </div>
      </PageContainer>
    );
  }

  if (error && !offer) {
    return (
      <PageContainer>
        <div className="max-w-lg mx-auto px-6 py-20 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="font-semibold text-red-700 mb-4">{error}</p>
          <Button variant="outline" onClick={() => navigate('/requester/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </PageContainer>
    );
  }

  const confirmedByDonor = offer.confirmedByDonor;
  const confirmedByRequester = offer.confirmedByRequester;
  const isFullyCompleted = offer.status === 'completed';

  return (
    <PageContainer>
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-8">
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Main Confirmation Canvas */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Header & Summary Card */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#304355]/10 space-y-6">
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#304355] tracking-tight">
                Confirm Support Completion
              </h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#FBF9FA] p-6 rounded-xl border border-slate-100">
                <div>
                  <span className="text-xs text-[#64707A] uppercase tracking-wider block mb-1">Requirement</span>
                  <span className="font-semibold text-sm text-[#1F2933]">{offer.requirementTitle}</span>
                </div>
                <div>
                  <span className="text-xs text-[#64707A] uppercase tracking-wider block mb-1">Requester</span>
                  <span className="font-semibold text-sm text-[#1F2933]">{offer.requesterName}</span>
                </div>
                <div className="md:col-span-2 my-2 border-t border-slate-200/60" />
                <div>
                  <span className="text-xs text-[#64707A] uppercase tracking-wider block mb-1">Item & Quantity</span>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-[#1F2933]">
                    <Utensils className="w-4 h-4 text-[#304355]" />
                    {offer.item} • {offer.quantityOffered} {offer.unit}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-[#64707A] uppercase tracking-wider block mb-1">Location</span>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-[#1F2933]">
                    <MapPin className="w-4 h-4 text-[#304355]" />
                    {offer.location || 'Maharashtra'}
                  </div>
                </div>
                <div className="md:col-span-2 my-2 border-t border-slate-200/60" />
                <div>
                  <span className="text-xs text-[#64707A] uppercase tracking-wider block mb-1">Donor</span>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-[#1F2933]">
                    <User className="w-4 h-4 text-[#304355]" />
                    {offer.donorName}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-[#64707A] uppercase tracking-wider block mb-1">Date of Offer</span>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-[#1F2933]">
                    <Calendar className="w-4 h-4 text-[#304355]" />
                    {new Date(offer.offeredOn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>

            {/* Two-Party Confirmation Tracker */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#304355]/10 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-lg font-bold text-[#304355]">Confirmation Status</h2>
                {isFullyCompleted ? (
                  <div className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4" />
                    Support Offer Fully Completed
                  </div>
                ) : notReceived ? (
                  <div className="bg-red-50 text-red-700 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-red-200">
                    <XCircle className="w-4 h-4" />
                    Awaiting Coordination / Review
                  </div>
                ) : (
                  <div className="bg-amber-50 text-amber-800 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-amber-200">
                    <Clock className="w-4 h-4" />
                    Awaiting Dual Confirmation
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                {/* Connector Line (Desktop) */}
                <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-[2px] bg-slate-200 -translate-y-1/2 z-0" />
                
                {/* Donor Status */}
                <div className={`bg-[#FBF9FA] relative z-10 p-5 rounded-xl border flex flex-col items-center text-center ${
                  confirmedByDonor ? 'border-emerald-200' : 'border-amber-200'
                }`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                    confirmedByDonor ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {confirmedByDonor ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6 animate-pulse" />}
                  </div>
                  <h3 className="font-bold text-sm text-[#1F2933] mb-1">DONOR: {offer.donorName}</h3>
                  <p className={`text-xs font-bold ${confirmedByDonor ? 'text-emerald-600' : 'text-amber-700'}`}>
                    {confirmedByDonor ? '✓ Confirmed delivered' : 'Awaiting delivery confirmation'}
                  </p>
                </div>

                {/* Requester Status */}
                <div className={`bg-[#FBF9FA] relative z-10 p-5 rounded-xl border flex flex-col items-center text-center transition-all duration-300 ${
                  confirmedByRequester 
                    ? 'border-emerald-200' 
                    : notReceived
                    ? 'border-red-200'
                    : 'border-amber-200 shadow-[0_0_15px_rgba(245,124,0,0.08)]'
                }`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                    confirmedByRequester 
                      ? 'bg-emerald-100 text-emerald-600' 
                      : notReceived
                      ? 'bg-red-100 text-red-600'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {confirmedByRequester ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : notReceived ? (
                      <XCircle className="w-6 h-6" />
                    ) : (
                      <Clock className="w-6 h-6 animate-pulse" />
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-[#1F2933] mb-1">REQUESTER: {offer.requesterName}</h3>
                  <p className={`text-xs font-bold ${
                    confirmedByRequester 
                      ? 'text-emerald-600' 
                      : notReceived
                      ? 'text-red-600'
                      : 'text-amber-700'
                  }`}>
                    {confirmedByRequester 
                      ? '✓ Confirmed completed' 
                      : notReceived
                      ? 'Reported as not yet received'
                      : 'Waiting for receipt confirmation'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Area */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#304355]/20 text-center space-y-6">
              <div className="max-w-md mx-auto space-y-2">
                <Utensils className="w-10 h-10 text-[#304355] mx-auto mb-2" />
                <h2 className="text-lg font-bold text-[#304355]">
                  Did you receive the {offer.quantityOffered} {offer.unit} of {offer.item} from {offer.donorName}?
                </h2>
                <p className="text-xs text-[#64707A]">
                  Please confirm receipt to finalize this support offer and update your requirement progress.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-xs font-semibold max-w-md mx-auto">
                  {error}
                </div>
              )}

              {confirmedByRequester ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-800 text-sm font-semibold max-w-md mx-auto">
                  Thank you! You have confirmed the receipt of this support offer.
                </div>
              ) : notReceived ? (
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 text-sm font-semibold max-w-md mx-auto">
                    You indicated that the support has not yet been received.
                  </div>
                  <Button variant="outline" onClick={() => setNotReceived(false)}>
                    Change status
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <button
                    onClick={handleNotReceived}
                    disabled={submitting}
                    className="bg-[#E8E8E2] border border-[#304355] text-[#304355] font-bold text-sm px-6 py-3 rounded-lg hover:bg-slate-200 transition-colors w-full sm:w-auto flex justify-center items-center gap-2 disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Not yet received
                  </button>
                  <button
                    onClick={handleConfirmReceipt}
                    disabled={submitting}
                    className="bg-[#304355] text-white font-bold text-sm px-6 py-3 rounded-lg hover:bg-[#243342] transition-colors w-full sm:w-auto flex justify-center items-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Yes, I have received it
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Requirement Impact Preview */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#304355]/10 space-y-4">
              <div className="flex items-center gap-2 text-[#304355] border-b border-slate-100 pb-3">
                <BarChart3 className="w-5 h-5" />
                <h3 className="font-bold text-sm">Requirement Impact Preview</h3>
              </div>
              <p className="text-xs text-[#64707A]">
                Once dual confirmed, this requirement will be updated automatically.
              </p>
              
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center bg-emerald-50 px-2.5 py-2 rounded border border-emerald-100">
                  <span className="text-emerald-700 font-bold">This offer:</span>
                  <span className="font-bold text-emerald-700">+{offer.quantityOffered} {offer.unit}</span>
                </div>
              </div>
            </div>

            {/* Platform disclaimer */}
            <div className="bg-[#FBF9FA] border border-[#304355]/10 rounded-2xl p-5 flex items-start gap-3">
              <Info className="w-5 h-5 text-[#304355] shrink-0 mt-0.5" />
              <p className="text-xs text-[#64707A] leading-relaxed">
                <strong className="text-[#1F2933]">PoshanSetu helps connect people with needs.</strong> Dual confirmation ensures transparency and protects both donors and institutions.
              </p>
            </div>

          </div>
        </main>
      </div>
    </PageContainer>
  );
}

