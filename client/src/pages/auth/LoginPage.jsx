import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Eye,
  EyeOff,
  HandHeart,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sprout,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { getDashboardForRole } from '../../context/AuthContext';

const ROLE_PREFIXES = Object.freeze({
  donor: ['/donor/'],
  requester: ['/requester/'],
  institution: ['/institution/', '/institution-profile'],
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

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = new URLSearchParams(location.search).get('redirect') || '/dashboard';
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitted(true);
    
    try {
      const { profile } = await login(email, password);

      if (!profile) {
        setErrors({
          form: 'Your account sign-in completed, but your profile could not be loaded. Please try again or contact support.'
        });
        setSubmitted(false);
        return;
      }

      const roleDashboard = getDashboardForRole(profile.role);
      if (!roleDashboard) {
        setErrors({
          form: `Your account has an unrecognized role (${profile.role || 'none'}). Please contact support.`
        });
        setSubmitted(false);
        return;
      }

      const redirectIsAuthorized = isRedirectAuthorizedForRole(redirect, profile.role);
      const useRedirect = redirect !== '/dashboard' && redirectIsAuthorized;
      const finalRedirect = useRedirect ? redirect : roleDashboard;
      navigate(finalRedirect);
    } catch (err) {
      setErrors({ form: err.message });
      setSubmitted(false);
    }
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        .ps-login-root * { box-sizing: border-box; }
        .ps-login-root { font-family: 'Manrope', sans-serif; }
        .ps-login-ambient {
          background:
            radial-gradient(circle at 18% 25%, rgba(208,229,251,0.45), transparent 45%),
            radial-gradient(circle at 82% 75%, rgba(255,221,183,0.35), transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(245,243,244,0.6), transparent 60%);
          animation: psLoginAmbient 20s ease-in-out infinite alternate;
        }
        @keyframes psLoginAmbient {
          0% { transform: scale(1) translate(0,0); }
          50% { transform: scale(1.06) translate(15px,-18px); }
          100% { transform: scale(0.96) translate(-18px,15px); }
        }
        .ps-login-contours { animation: psLoginWave 14s ease-in-out infinite; }
        @keyframes psLoginWave {
          0%,100% { transform: translateY(0) rotate(0); opacity: .12; }
          50% { transform: translateY(-12px) rotate(2deg); opacity: .2; }
        }
        .ps-login-aura { animation: psLoginAura 6s ease-in-out infinite; }
        @keyframes psLoginAura {
          0%,100% { transform: scale(1); opacity: .35; filter: blur(14px); }
          50% { transform: scale(1.35); opacity: .65; filter: blur(20px); }
        }
        .ps-login-left { animation: psLoginEnterLeft 400ms cubic-bezier(.16,1,.3,1) forwards; }
        .ps-login-right { animation: psLoginEnterRight 400ms cubic-bezier(.16,1,.3,1) 100ms backwards; }
        @keyframes psLoginEnterLeft {
          from { opacity: 0; transform: translateX(-24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes psLoginEnterRight {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .ps-login-input:focus {
          border-color: rgba(48,67,85,.4) !important;
          background: #fff !important;
          box-shadow: 0 0 0 2px rgba(48,67,85,.12);
        }
        .ps-login-trust { transition: transform 200ms ease, background-color 200ms ease; }
        .ps-login-trust:hover { transform: translateX(4px); background: rgba(255,255,255,.08) !important; }
        .ps-login-button { transition: transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease; }
        .ps-login-button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px -4px rgba(48,67,85,.28); }
        .ps-login-button:active:not(:disabled) { transform: scale(.98); }
        .ps-login-shimmer::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.22), transparent);
          animation: psLoginShimmer 5s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes psLoginShimmer {
          0% { transform: translateX(-150%) skewX(-20deg); }
          20%,100% { transform: translateX(250%) skewX(-20deg); }
        }
        @media (max-width: 767px) {
          .ps-login-main { padding: 20px 12px !important; }
          .ps-login-card { max-width: 520px !important; }
          .ps-login-left { display: none !important; }
          .ps-login-right { flex-basis: 100% !important; padding: 28px 22px !important; }
        }
        @media (max-height: 650px) and (min-width: 768px) {
          .ps-login-main { padding-top: 8px !important; padding-bottom: 8px !important; }
          .ps-login-left, .ps-login-right { padding-top: 18px !important; padding-bottom: 18px !important; }
          .ps-login-trust-list { gap: 6px !important; }
          .ps-login-trust { padding: 7px !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ps-login-ambient, .ps-login-contours, .ps-login-aura,
          .ps-login-left, .ps-login-right, .ps-login-shimmer::after {
            animation: none !important;
          }
          .ps-login-trust, .ps-login-button { transition: none !important; }
          .ps-login-trust:hover, .ps-login-button:hover { transform: none !important; }
        }
      `}</style>

      <main className="ps-login-root" style={{
        minHeight:'calc(100vh - 140px)',
        background:'#FAF8F6',
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        padding:'24px 16px',
        position:'relative',
        overflow:'hidden',
      }}>
        <div aria-hidden="true" className="ps-login-ambient" style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }} />
        <div aria-hidden="true" style={{ position:'absolute', top:'8%', left:'10%', width:300, height:300, borderRadius:'50%', background:'rgba(208,229,251,.2)', filter:'blur(48px)', pointerEvents:'none' }} />
        <div aria-hidden="true" style={{ position:'absolute', bottom:'8%', right:'10%', width:320, height:320, borderRadius:'50%', background:'rgba(255,221,183,.3)', filter:'blur(48px)', pointerEvents:'none' }} />

        <div className="ps-login-card" style={{
          width:'100%',
          maxWidth:1040,
          background:'#fff',
          borderRadius:16,
          boxShadow:'0 20px 60px -10px rgba(0,0,0,.15)',
          overflow:'hidden',
          display:'flex',
          flexWrap:'wrap',
          border:'1px solid rgba(116,119,125,.2)',
          position:'relative',
          zIndex:1,
        }}>
          <section className="ps-login-left" style={{
            width:'40%',
            minWidth:280,
            flex:'1 1 280px',
            background:'#304355',
            color:'#fff',
            padding:28,
            display:'flex',
            flexDirection:'column',
            justifyContent:'space-between',
            position:'relative',
            overflow:'hidden',
          }}>
            <div aria-hidden="true" style={{ position:'absolute', inset:0, pointerEvents:'none', opacity:.2 }}>
              <svg className="ps-login-contours" style={{ width:'100%', height:'100%' }} viewBox="0 0 400 700" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M-50 120 C80 180,150 60,280 140 C380 200,410 110,450 160" stroke="#d0e5fb" strokeWidth="1.2" strokeDasharray="4 6" />
                <path d="M-40 230 C90 310,180 190,310 280 C390 340,420 250,460 300" stroke="#d0e5fb" strokeWidth="1.2" />
                <path d="M-60 370 C70 420,160 330,270 410 C360 480,400 410,470 450" stroke="#d0e5fb" strokeWidth="1" />
                <path d="M-30 510 C100 580,190 480,300 550 C380 600,410 540,450 580" stroke="#d0e5fb" strokeWidth="1.4" strokeDasharray="3 5" />
                <circle cx="210" cy="270" r="140" stroke="#ffddb7" strokeWidth=".8" opacity=".3" />
                <circle cx="210" cy="270" r="210" stroke="#ffddb7" strokeWidth=".6" strokeDasharray="6 8" opacity=".2" />
              </svg>
            </div>
            <div style={{ position:'relative', zIndex:1 }}>
              <div style={{ position:'relative', display:'inline-flex', marginBottom:14 }}>
                <div className="ps-login-aura" style={{ position:'absolute', inset:0, borderRadius:14, background:'#d0e5fb' }} />
                <div style={{ width:48, height:48, borderRadius:12, background:'#fff', color:'#304355', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', boxShadow:'0 4px 12px rgba(0,0,0,.15)' }}>
                  <Sprout size={30} aria-hidden="true" />
                </div>
              </div>
              <h1 style={{ fontSize:24, fontWeight:700, letterSpacing:'-.01em', lineHeight:1.3, margin:0 }}>Welcome back</h1>
              <p style={{ fontSize:13, color:'#b5c9df', marginTop:8, lineHeight:1.5 }}>
                Sign in to continue supporting local food needs.
              </p>
            </div>

            <div className="ps-login-trust-list" style={{ display:'flex', flexDirection:'column', gap:10, position:'relative', zIndex:1 }}>
              {[
                { icon:HandHeart, title:'Food-only support', desc:'No cash or delivery.' },
                { icon:ShieldCheck, title:'Community requirements', desc:'Shared by people and organizations.' },
                { icon:BarChart3, title:'Official district indicators', desc:'Separate from community needs.' },
              ].map(({ icon: Icon, title, desc }, index) => (
                <div key={title} className="ps-login-trust" style={{ padding:10, borderRadius:12, display:'flex', alignItems:'flex-start', gap:12, background:'rgba(48,67,85,.4)' }}>
                  <div style={{ width:36, height:36, borderRadius:8, background:index === 1 ? 'rgba(255,221,183,.2)' : 'rgba(208,229,251,.2)', color:index === 1 ? '#ffddb7' : '#d0e5fb', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Icon size={20} strokeWidth={2} aria-hidden="true" />
                  </div>
                  <div>
                    <h2 style={{ fontSize:13, fontWeight:700, color:'#fff', margin:0 }}>{title}</h2>
                    <p style={{ fontSize:12, color:'#9cafc5', marginTop:2, lineHeight:1.4 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ paddingTop:12, borderTop:'1px solid rgba(255,255,255,.1)', position:'relative', zIndex:1, color:'#9cafc5', fontSize:12 }}>
              Community food support coordination
            </div>
          </section>

          <section className="ps-login-right" style={{
            flex:'1 1 380px',
            minWidth:0,
            background:'#fff',
            padding:'32px 40px',
            display:'flex',
            flexDirection:'column',
            justifyContent:'center',
          }}>
            <div style={{ marginBottom:24 }}>
              <span style={{ display:'inline-flex', alignItems:'center', gap:7, fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'#64707A', marginBottom:10 }}>
                <LockKeyhole size={14} aria-hidden="true" /> Secure sign in
              </span>
              <h2 style={{ fontSize:24, fontWeight:700, color:'#1F2933', margin:0, lineHeight:1.25 }}>Log in to PoshanSetu</h2>
              <p style={{ fontSize:13, color:'#64707A', marginTop:7, lineHeight:1.5 }}>
                Access your dashboard and community support.
              </p>
            </div>

            {submitted && !errors.form && (
              <div role="status" style={{ marginBottom:16, padding:'11px 12px', background:'#ecfdf3', border:'1px solid #bbf7d0', borderRadius:10, color:'#15803d', fontSize:12, fontWeight:600, display:'flex', alignItems:'center', gap:8 }}>
                <span className="ps-login-spinner" aria-hidden="true" />
                Signing you in…
              </div>
            )}

            {errors.form && (
              <div role="alert" style={{ marginBottom:16, padding:12, background:'#fff1f0', border:'1px solid #fecaca', borderRadius:10, color:'#b91c1c', fontSize:12, fontWeight:600, display:'flex', alignItems:'flex-start', gap:8 }}>
                <AlertCircle size={16} style={{ flexShrink:0 }} aria-hidden="true" />
                <span>{errors.form}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div>
                <label htmlFor="login-email" style={{ display:'block', fontSize:13, fontWeight:600, color:'#64707A', marginBottom:6 }}>Email Address</label>
                <div style={{ position:'relative', display:'flex', alignItems:'center' }}>
                  <Mail size={18} color={errors.email ? '#ba1a1a' : '#74777d'} aria-hidden="true" style={{ position:'absolute', left:12, pointerEvents:'none' }} />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'login-email-error' : undefined}
                    onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined, form: undefined })); }}
                    placeholder="name@example.com"
                    className="ps-login-input"
                    style={{ width:'100%', padding:'11px 12px 11px 40px', fontSize:13, color:'#1F2933', background:errors.email ? 'rgba(186,26,26,.05)' : '#f5f3f4', border:errors.email ? '2px solid #ba1a1a' : '2px solid transparent', borderRadius:9, outline:'none', transition:'all 200ms', fontFamily:'inherit' }}
                  />
                </div>
                {errors.email && <p id="login-email-error" style={{ fontSize:11, color:'#ba1a1a', margin:'5px 0 0', display:'flex', alignItems:'center', gap:4 }}><AlertCircle size={13} aria-hidden="true" />{errors.email}</p>}
              </div>

              <div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                  <label htmlFor="login-password" style={{ fontSize:13, fontWeight:600, color:'#64707A' }}>Password</label>
                  <Link to="/forgot-password" style={{ fontSize:12, color:'#304355', fontWeight:600, textDecoration:'none' }}>Forgot password?</Link>
                </div>
                <div style={{ position:'relative', display:'flex', alignItems:'center' }}>
                  <LockKeyhole size={18} color={errors.password ? '#ba1a1a' : '#74777d'} aria-hidden="true" style={{ position:'absolute', left:12, pointerEvents:'none' }} />
                  <input
                    id="login-password"
                    type={passwordVisible ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? 'login-password-error' : undefined}
                    onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined, form: undefined })); }}
                    placeholder="********"
                    className="ps-login-input"
                    style={{ width:'100%', padding:'11px 42px 11px 40px', fontSize:13, color:'#1F2933', background:errors.password ? 'rgba(186,26,26,.05)' : '#f5f3f4', border:errors.password ? '2px solid #ba1a1a' : '2px solid transparent', borderRadius:9, outline:'none', transition:'all 200ms', fontFamily:'inherit' }}
                  />
                  <button type="button" aria-label={passwordVisible ? 'Hide password' : 'Show password'} onClick={() => setPasswordVisible((visible) => !visible)} style={{ position:'absolute', right:11, display:'flex', alignItems:'center', justifyContent:'center', border:0, padding:4, background:'transparent', color:'#64707A', cursor:'pointer' }}>
                    {passwordVisible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                  </button>
                </div>
                {errors.password && <p id="login-password-error" style={{ fontSize:11, color:'#ba1a1a', margin:'5px 0 0', display:'flex', alignItems:'center', gap:4 }}><AlertCircle size={13} aria-hidden="true" />{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={submitted}
                className="ps-login-button ps-login-shimmer"
                style={{ width:'100%', position:'relative', overflow:'hidden', marginTop:2, padding:'12px 18px', border:0, borderRadius:9, background:'#304355', color:'#fff', fontSize:13, fontWeight:700, letterSpacing:'.03em', display:'flex', alignItems:'center', justifyContent:'center', gap:8, cursor:submitted ? 'not-allowed' : 'pointer', opacity:submitted ? .7 : 1, boxShadow:'0 4px 12px rgba(48,67,85,.25)' }}
              >
                Log In <ArrowRight size={17} aria-hidden="true" />
              </button>
            </form>

            <div style={{ marginTop:22, paddingTop:16, borderTop:'1px solid rgba(48,67,85,.1)', textAlign:'center' }}>
              <p style={{ fontSize:12, color:'#64707A', margin:0 }}>
                New to PoshanSetu?{' '}
                <Link to="/register" style={{ color:'#304355', fontWeight:700, textDecoration:'none' }}>Create an account</Link>
              </p>
            </div>
          </section>
        </div>
      </main>

      <style>{`
        .ps-login-spinner {
          width:14px;
          height:14px;
          border:2px solid #bbf7d0;
          border-top-color:#15803d;
          border-radius:50%;
          animation: psLoginSpin 700ms linear infinite;
        }
        @keyframes psLoginSpin { to { transform:rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) {
          .ps-login-spinner { animation-duration: 2s; }
        }
      `}</style>
    </>
  );
}
