import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    if (!email.trim()) return 'Email address is required.';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email address.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setIsSubmitting(true);
    
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] bg-[#E8E8E2] flex items-center justify-center p-6">
      {/* Decorative blurs */}
      <div className="absolute top-0 left-0 w-[40vw] h-[40vw] rounded-full bg-[#e3c19a]/20 blur-[100px] pointer-events-none" />

      <div className="bg-white rounded-2xl shadow-md border border-[#304355]/10 w-full max-w-md p-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#304355]/10 text-[#304355] mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#304355] mb-1">
            {sent ? 'Check Your Email' : 'Forgot Password'}
          </h1>
          <p className="text-sm text-[#64707A]">
            {sent
              ? `We've sent password reset instructions to ${email}. Check your inbox (and spam folder).`
              : "Enter your registered email address and we'll send you a link to reset your password."}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="fp-email" className="block text-xs font-bold text-[#64707A]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64707A]" />
                <input
                  id="fp-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="name@example.com"
                  className={`w-full bg-[#FBF9FA] border rounded-xl pl-10 pr-4 py-3 text-sm text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#304355] transition ${error ? 'border-red-400' : 'border-[#304355]/20'}`}
                />
              </div>
              {error && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {error}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-[#304355] text-white py-3 px-4 rounded-xl font-bold text-sm hover:bg-[#243342] transition-all flex justify-center items-center gap-2 shadow-xs"
            >
              Send Reset Link <ArrowRight className="w-4 h-4" />
            </button>

            <Link to="/login" className="flex items-center justify-center gap-1 text-xs text-[#64707A] hover:text-[#304355] transition mt-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
            </Link>
          </form>
        ) : (
          /* Success State */
          <div className="space-y-5 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <p className="text-xs text-[#64707A]">
              Didn't receive it?{' '}
              <button onClick={() => { setSent(false); setEmail(''); }} className="text-[#304355] font-bold hover:underline">
                Try again with a different email
              </button>
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-[#304355] text-white py-3 px-4 rounded-xl font-bold text-sm hover:bg-[#243342] transition-all flex justify-center items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
