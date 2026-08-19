import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LockKeyhole, ArrowRight, ArrowLeft } from 'lucide-react';

/**
 * LoginRequired — Stitch screen 84b8dd2e56c24781a966e8c5541ce933
 * Intercept page that explains why auth is needed, preserves intended destination,
 * and offers Login / Create Account actions.
 */
export default function LoginRequired() {
  const navigate = useNavigate();
  const location = useLocation();

  // The "from" location is passed via router state by protected flows
  const from = location.state?.from || location.search
    ? new URLSearchParams(location.search).get('redirect') || '/dashboard'
    : '/dashboard';

  const context = location.state?.context || 'respond to a requirement';

  const handleLogin = () => navigate(`/login?redirect=${encodeURIComponent(from)}`);
  const handleRegister = () => navigate(`/register?redirect=${encodeURIComponent(from)}`);
  const handleBack = () => navigate(-1);

  return (
    <div className="min-h-[calc(100vh-140px)] bg-[#E8E8E2] flex items-center justify-center p-6">
      {/* Decorative blur */}
      <div className="absolute top-0 right-0 w-[30vw] h-[30vw] rounded-full bg-[#304355]/10 rounded-bl-full pointer-events-none" />

      {/* Auth Intercept Card */}
      <div className="bg-white rounded-2xl shadow-md border border-[#304355]/10 max-w-md w-full p-8 flex flex-col items-center text-center relative overflow-hidden z-10">
        {/* Corner decoration */}
        <div className="absolute top-0 right-0 w-28 h-28 bg-[#304355]/5 rounded-bl-full pointer-events-none" />

        {/* Lock icon */}
        <div className="w-16 h-16 rounded-full bg-[#FBF9FA] border border-[#304355]/10 flex items-center justify-center mb-5 text-[#304355]">
          <LockKeyhole className="w-8 h-8" />
        </div>

        {/* Title & Explanation */}
        <h1 className="text-2xl font-extrabold text-[#304355] mb-3">
          Log in to coordinate support safely
        </h1>
        <p className="text-sm text-[#64707A] leading-relaxed mb-7">
          To {context} and ensure the security of our community network, please sign in or create an account to proceed with your offer to help.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col w-full gap-3">
          <button
            onClick={handleLogin}
            className="w-full bg-[#304355] text-white font-bold text-sm py-3 px-4 rounded-xl hover:bg-[#243342] transition-all flex justify-center items-center gap-2 shadow-xs"
          >
            <span>Log In</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200" />
            <span className="flex-shrink-0 mx-4 text-[#64707A] text-xs font-semibold">or</span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          <button
            onClick={handleRegister}
            className="w-full bg-white border-2 border-[#304355] text-[#304355] font-bold text-sm py-3 px-4 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Create Account
          </button>
        </div>

        {/* Back */}
        <button
          onClick={handleBack}
          className="mt-6 text-[#64707A] hover:text-[#304355] transition-colors flex items-center gap-1 text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Requirement
        </button>
      </div>
    </div>
  );
}
