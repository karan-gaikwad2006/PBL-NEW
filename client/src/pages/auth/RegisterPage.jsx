import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HeartHandshake, User, Building2, Lock, Mail, UserCheck, AlertCircle } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import useAuth from '../../hooks/useAuth';
import { getDashboardForRole } from '../../context/AuthContext';

const ROLE_PREFIXES = Object.freeze({
  donor: ['/donor/'],
  requester: ['/requester/'],
  institution: ['/institution-profile'],
  admin: ['/admin/'],
});

function isRedirectAuthorizedForRole(redirectPath, role) {
  if (!redirectPath || !role) return true;
  if (redirectPath === '/dashboard' || redirectPath === '/') return true;

  for (const [roleKey, prefixes] of Object.entries(ROLE_PREFIXES)) {
    for (const prefix of prefixes) {
      if (redirectPath.startsWith(prefix)) {
        if (roleKey === role || role === 'admin') return true;
        return false;
      }
    }
  }
  return true;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = new URLSearchParams(location.search).get('redirect') || '/dashboard';
  const { register } = useAuth();

  const [accountType, setAccountType] = useState('donor');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!fullName.trim()) errs.fullName = 'Full name is required.';
    if (!email.trim()) errs.email = 'Email address is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Please enter a valid email address.';
    if (!password) errs.password = 'Password is required.';
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (!terms) errs.terms = 'You must accept the terms to continue.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setIsSubmitting(true);
    
    try {
      const { profile } = await register(email, password, accountType, fullName);

      if (!profile) {
        setErrors({
          form: 'Your Firebase account was created, but the profile sync failed. Please try logging in.'
        });
        setIsSubmitting(false);
        return;
      }

      const roleDashboard = getDashboardForRole(profile.role);
      if (!roleDashboard) {
        setErrors({
          form: `Your account was created, but the role (${profile.role || 'none'}) is not recognized. Please contact support.`
        });
        setIsSubmitting(false);
        return;
      }

      const redirectIsAuthorized = isRedirectAuthorizedForRole(redirect, profile.role);
      const useRedirect = redirect !== '/dashboard' && redirectIsAuthorized;
      const finalRedirect = useRedirect ? redirect : roleDashboard;
      navigate(finalRedirect);
    } catch (err) {
      setErrors({ form: err.message });
      setIsSubmitting(false);
    }
  };

  const ROLE_CARDS = [
    {
      value: 'donor',
      icon: HeartHandshake,
      title: 'Donor',
      desc: 'I want to contribute resources.',
    },
    {
      value: 'requester',
      icon: User,
      title: 'Individual Requester',
      desc: 'I need nutritional support.',
    },
    {
      value: 'institution',
      icon: Building2,
      title: 'Institution / Ashram Shala',
      desc: 'We manage community needs.',
    },
  ];

  return (
    <div className="bg-[#E8E8E2] min-h-[calc(100vh-140px)] flex items-center justify-center py-10 px-4">
      <div className="max-w-2xl w-full bg-white shadow-md border border-[#304355]/10 rounded-2xl overflow-hidden">
        <div className="bg-[#304355] text-white p-8 sm:p-10 text-center space-y-2">
          <div className="text-xl font-bold tracking-tight">PoshanSetu</div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Join PoshanSetu</h1>
          <p className="text-sm text-slate-200 max-w-md mx-auto pt-1">
            Your account type helps us personalize your PoshanSetu experience.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8" noValidate>
          {errors.form && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold text-center flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4" /> {errors.form}
            </div>
          )}

          <fieldset className="space-y-3">
            <legend className="text-lg font-bold text-[#1F2933]">What brings you here?</legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ROLE_CARDS.map(({ value, icon: Icon, title, desc }) => (
                <label
                  key={value}
                  onClick={() => setAccountType(value)}
                  className="relative cursor-pointer block h-full"
                >
                  <input type="radio" name="account_type" value={value} checked={accountType === value} onChange={() => setAccountType(value)} className="sr-only" />
                  <div
                    className={`h-full border-2 rounded-xl p-5 flex flex-col items-center text-center transition-all ${
                      accountType === value
                        ? 'border-[#304355] bg-[#304355]/5 shadow-xs'
                        : 'border-slate-200 hover:border-[#304355]/40'
                    }`}
                  >
                    <Icon className={`w-10 h-10 mb-2 transition-colors ${accountType === value ? 'text-[#304355]' : 'text-slate-400'}`} />
                    <h3 className="font-bold text-sm text-[#1F2933] mb-1">{title}</h3>
                    <p className="text-xs text-[#64707A]">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>

          <hr className="border-slate-200" />

          <div className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setErrors((p) => ({ ...p, fullName: undefined })); }}
              icon={UserCheck}
              error={errors.fullName}
              required
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
              icon={Mail}
              error={errors.email}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
              helperText="Must be at least 8 characters."
              icon={Lock}
              error={errors.password}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={terms}
                onChange={(e) => { setTerms(e.target.checked); setErrors((p) => ({ ...p, terms: undefined })); }}
                className="mt-0.5 accent-[#304355] w-4 h-4 shrink-0"
              />
              <span className="text-xs text-[#64707A] leading-relaxed">
                I agree to PoshanSetu's{' '}
                <a href="#" className="text-[#304355] font-semibold hover:underline">Terms of Service</a>{' '}
                and{' '}
                <a href="#" className="text-[#304355] font-semibold hover:underline">Privacy Policy</a>.
                I understand that PoshanSetu does not process payments or logistics directly.
              </span>
            </label>
            {errors.terms && (
              <p className="text-xs text-red-600 flex items-center gap-1 pl-7">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.terms}
              </p>
            )}
          </div>

          <div className="space-y-4 pt-2">
            <Button variant="primary" type="submit" className="w-full py-3.5 text-base font-bold shadow-xs">
              Create Account
            </Button>
            <p className="text-center text-xs text-[#64707A]">
              Already have an account?{' '}
              <Link to="/login" className="text-[#304355] font-bold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
