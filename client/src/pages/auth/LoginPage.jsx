import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Key, ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = new URLSearchParams(location.search).get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Email address is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Please enter a valid email address.';
    if (!password) errs.password = 'Password is required.';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters.';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitted(true);
    // UI-only: navigate to redirect destination after brief delay
    setTimeout(() => navigate(redirect), 600);
  };

  return (
    <div className="min-h-[calc(100vh-140px)] bg-[#E8E8E2] flex items-center justify-center p-6">
      {/* Decorative blurs */}
      <div className="absolute top-0 left-0 w-[40vw] h-[40vw] rounded-full bg-[#e3c19a]/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[30vw] h-[30vw] rounded-full bg-[#b5c9df]/20 blur-[80px] pointer-events-none" />

      {/* Login Card */}
      <div className="bg-white rounded-2xl shadow-md border border-[#304355]/10 w-full max-w-md p-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#304355]/10 text-[#304355] mb-3">
            <Key className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#304355] mb-1">Welcome Back</h1>
          <p className="text-sm text-[#64707A]">
            Log in to respond to requirements, manage support, or submit your needs.
          </p>
        </div>

        {/* Success Banner */}
        {submitted && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-semibold text-center">
            Signing you in…
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="block text-xs font-bold text-[#64707A]">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64707A]" />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                placeholder="name@example.com"
                className={`w-full bg-[#FBF9FA] border rounded-xl pl-10 pr-4 py-3 text-sm text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#304355] transition ${errors.email ? 'border-red-400' : 'border-[#304355]/20'}`}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="login-password" className="block text-xs font-bold text-[#64707A]">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs text-[#304355] font-semibold hover:underline">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64707A]" />
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                placeholder="••••••••"
                className={`w-full bg-[#FBF9FA] border rounded-xl pl-10 pr-4 py-3 text-sm text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#304355] transition ${errors.password ? 'border-red-400' : 'border-[#304355]/20'}`}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.password}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full mt-2 bg-[#304355] text-white py-3 px-4 rounded-xl font-bold text-sm hover:bg-[#243342] active:scale-[0.98] transition-all flex justify-center items-center gap-2 shadow-xs"
          >
            Log In <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-xs text-[#64707A]">
            New to PoshanSetu?{' '}
            <Link to="/register" className="text-[#304355] font-bold hover:underline ml-1">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
