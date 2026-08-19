import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../common/Button';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function Step8Success() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto py-12 text-center">
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12" />
        </div>
      </div>
      
      <h1 className="text-3xl font-bold text-[#304355] mb-4">Requirement Submitted Successfully!</h1>
      <p className="text-[#64707A] text-lg mb-8 max-w-lg mx-auto">
        Your food requirement has been successfully recorded. Donors in your area have been notified and can now connect with you.
      </p>

      <div className="bg-white border border-[#304355]/10 rounded-lg p-6 shadow-sm mb-8 text-left max-w-md mx-auto">
        <h3 className="text-[#1F2933] font-semibold mb-2">What happens next?</h3>
        <ul className="space-y-2 text-[#64707A] text-sm list-disc list-inside">
          <li>Your requirement is now live on the platform.</li>
          <li>Donors can view it and choose to support it.</li>
          <li>We will notify you via email when someone offers help.</li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </Button>
        <Button onClick={() => navigate('/explore')} icon={ArrowRight} iconPosition="right">
          Explore Other Needs
        </Button>
      </div>
    </div>
  );
}
