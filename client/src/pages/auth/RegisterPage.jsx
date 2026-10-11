import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { getDashboardForRole } from '../../context/AuthContext';

/* â”€â”€â”€ Role-redirect guard â”€â”€â”€ */
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
        return roleKey === role || role === 'admin';
      }
    }
  }
  return true;
}

const ROLE_DATA = [
  {
    id: 'donor',
    icon: 'volunteer_activism',
    label: 'Donor',
    desc: 'Provide nutrition, groceries, or logistics support.',
    namePlaceholder: 'Enter your full name or foundation',
    nameHint: 'Donor representative name',
    leftHint: 'Join as a resource provider or community donor.',
  },
  {
    id: 'requester',
    icon: 'person',
    label: 'Requester',
    desc: 'Seek direct nutrition kits for pregnant women or infants.',
    namePlaceholder: 'Enter your full name or guardian name',
    nameHint: 'Primary beneficiary contact',
    leftHint: 'Request maternal and child nutrition assistance directly.',
  },
  {
    id: 'institution',
    icon: 'domain',
    label: 'Institution',
    desc: 'Anganwadi centers, orphanages, or verified NGOs.',
    namePlaceholder: 'Enter institution coordinator name',
    nameHint: 'Authorized nodal officer',
    leftHint: 'Manage cluster nutrition demands for anganwadis or schools.',
  },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = new URLSearchParams(location.search).get('redirect') || '/dashboard';
  const { register } = useAuth();

  const [accountType, setAccountType] = useState('donor');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [submitStageLabel, setSubmitStageLabel] = useState('');
  const [submitDone, setSubmitDone] = useState(false);
  const [rippleRole, setRippleRole] = useState(null);
  const [toggledPass, setToggledPass] = useState(false);

  const selectedRole = ROLE_DATA.find(r => r.id === accountType);

  const validate = () => {
    const errs = {};
    if (!fullName.trim()) errs.fullName = 'Full name is required.';
    if (!email.trim()) errs.email = 'Email address is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Email already in registry or invalid.';
    if (!password) errs.password = 'Password is required.';
    else if (password.length < 8) errs.password = 'Min. 8 characters';
    if (!terms) errs.terms = 'You must accept the terms to continue.';
    return errs;
  };

  const runSubmitProgress = () => {
    const stages = [
      { pct: 30, label: 'Verifying details...' },
      { pct: 68, label: 'Connecting to Maharashtra nutrition registry...' },
      { pct: 95, label: 'Setting up secure public directory profile...' },
    ];
    let i = 0;
    setSubmitProgress(30);
    setSubmitStageLabel(stages[0].label);
    const timer = setInterval(() => {
      i++;
      if (i < stages.length) {
        setSubmitProgress(stages[i].pct);
        setSubmitStageLabel(stages[i].label);
      } else {
        clearInterval(timer);
      }
    }, 650);
    return timer;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setIsSubmitting(true);
    setSubmitDone(false);
    const timer = runSubmitProgress();

    try {
      const { profile } = await register(email, password, accountType, fullName);
      clearInterval(timer);

      if (!profile) {
        setErrors({ form: 'Your Firebase account was created, but the profile sync failed. Please try logging in.' });
        setIsSubmitting(false);
        return;
      }

      const roleDashboard = getDashboardForRole(profile.role);
      if (!roleDashboard) {
        setErrors({ form: `Your account was created, but the role (${profile.role || 'none'}) is not recognized. Please contact support.` });
        setIsSubmitting(false);
        return;
      }

      setSubmitProgress(100);
      setSubmitStageLabel('Account registered successfully!');
      setSubmitDone(true);

      setTimeout(() => {
        const redirectIsAuthorized = isRedirectAuthorizedForRole(redirect, profile.role);
        const useRedirect = redirect !== '/dashboard' && redirectIsAuthorized;
        navigate(useRedirect ? redirect : roleDashboard);
      }, 600);
    } catch (err) {
      clearInterval(timer);
      setErrors({ form: err.message });
      setIsSubmitting(false);
    }
  };

  const handleRoleSelect = (roleId) => {
    setAccountType(roleId);
    setRippleRole(roleId);
    setTimeout(() => setRippleRole(null), 550);
  };

  const nameValid = fullName.trim().length >= 2;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />

      <style>{`
        .ps-root * { box-sizing: border-box; }
        .ps-root { font-family: 'Manrope', sans-serif; }

        /* Ambient background */
        .ps-ambient-bg {
          background:
            radial-gradient(circle at 18% 25%, rgba(208,229,251,0.45), transparent 45%),
            radial-gradient(circle at 82% 75%, rgba(255,221,183,0.35), transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(245,243,244,0.6), transparent 60%);
          animation: ambientDrift 20s ease-in-out infinite alternate;
        }
        @keyframes ambientDrift {
          0%   { transform: scale(1) translate(0,0); }
          50%  { transform: scale(1.06) translate(15px,-18px); }
          100% { transform: scale(0.96) translate(-18px,15px); }
        }

        /* Particles */
        .ps-particle {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          opacity: 0.45;
          animation: particleFloat ease-in-out infinite alternate;
        }
        @keyframes particleFloat {
          0%   { transform: translateY(0) translateX(0) scale(0.9); }
          50%  { transform: translateY(-24px) translateX(12px) scale(1.1); }
          100% { transform: translateY(-48px) translateX(-10px) scale(1); }
        }

        /* Left panel contour wave */
        @keyframes waveFloat {
          0%   { transform: translateY(0) rotate(0deg); opacity: 0.12; }
          50%  { transform: translateY(-12px) rotate(2deg); opacity: 0.2; }
          100% { transform: translateY(0) rotate(0deg); opacity: 0.12; }
        }
        .ps-contour-mesh { animation: waveFloat 14s ease-in-out infinite; }

        /* Logo aura */
        @keyframes auraPulse {
          0%,100% { transform: scale(1); opacity: 0.35; filter: blur(14px); }
          50%      { transform: scale(1.35); opacity: 0.65; filter: blur(20px); }
        }
        .ps-logo-aura { animation: auraPulse 6s ease-in-out infinite; }

        /* Slide-in panels */
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .ps-panel-left  { animation: slideInLeft  400ms cubic-bezier(0.16,1,0.3,1) forwards; }
        .ps-panel-right { animation: slideInRight 400ms cubic-bezier(0.16,1,0.3,1) 100ms backwards; }

        /* Stagger up */
        @keyframes staggerUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ps-s1 { animation: staggerUp 380ms cubic-bezier(0.16,1,0.3,1) 120ms backwards; }
        .ps-s2 { animation: staggerUp 380ms cubic-bezier(0.16,1,0.3,1) 180ms backwards; }
        .ps-s3 { animation: staggerUp 380ms cubic-bezier(0.16,1,0.3,1) 240ms backwards; }
        .ps-s4 { animation: staggerUp 380ms cubic-bezier(0.16,1,0.3,1) 300ms backwards; }
        .ps-s5 { animation: staggerUp 380ms cubic-bezier(0.16,1,0.3,1) 360ms backwards; }
        .ps-s6 { animation: staggerUp 380ms cubic-bezier(0.16,1,0.3,1) 420ms backwards; }

        /* Error alert slide */
        @keyframes alertSlide {
          0%   { opacity:0; max-height:0; transform:translateY(-10px) scale(0.98); }
          70%  { transform:translateY(2px) scale(1.01); }
          100% { opacity:1; max-height:90px; transform:translateY(0) scale(1); }
        }
        .ps-alert-entry { animation: alertSlide 320ms cubic-bezier(0.16,1,0.3,1) forwards; }

        /* Shake */
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%,60%  { transform: translateX(-4px); }
          40%,80%  { transform: translateX(4px); }
        }
        .ps-shake { animation: shake 380ms ease-in-out; }

        /* Check pop */
        @keyframes checkPop {
          0%   { opacity:0; transform:scale(0.2) rotate(-35deg); }
          65%  { transform:scale(1.22) rotate(6deg); }
          100% { opacity:1; transform:scale(1) rotate(0deg); }
        }
        .ps-check-pop { animation: checkPop 320ms cubic-bezier(0.34,1.56,0.64,1) forwards; }

        /* Icon wiggle */
        @keyframes iconWiggle {
          0%   { transform: scale(1) rotate(0deg); }
          30%  { transform: scale(1.18) rotate(-10deg); }
          60%  { transform: scale(1.1) rotate(8deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        .ps-icon-wiggle { animation: iconWiggle 440ms cubic-bezier(0.34,1.56,0.64,1); }

        /* Ripple */
        @keyframes rippleExpand {
          0%   { transform: scale(0.7); opacity: 0.7; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .ps-ripple {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          border: 2px solid rgba(48,67,85,0.4);
          pointer-events: none;
          animation: rippleExpand 500ms ease-out forwards;
        }

        /* Button shimmer */
        @keyframes btnShimmer {
          0%     { transform: translateX(-150%) skewX(-20deg); }
          20%,100% { transform: translateX(250%) skewX(-20deg); }
        }
        .ps-btn-shimmer::after {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 50%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent);
          animation: btnShimmer 5s ease-in-out infinite;
          pointer-events: none;
        }

        /* Input focus line */
        .ps-input-wrapper { position: relative; }
        .ps-focus-line {
          position: absolute; bottom: 0; left: 50%;
          width: 0; height: 2px;
          background: #304355; border-radius: 9999px;
          transition: width 260ms cubic-bezier(0.16,1,0.3,1), left 260ms cubic-bezier(0.16,1,0.3,1);
        }
        .ps-input-wrapper:focus-within .ps-focus-line { width: 100%; left: 0; }

        /* Role card hover */
        .ps-role-card {
          transition: transform 220ms cubic-bezier(0.16,1,0.3,1), box-shadow 220ms ease, border-color 220ms ease, background-color 220ms ease;
        }
        .ps-role-card:hover { transform: translateY(-4px) scale(1.01); box-shadow: 0 10px 22px -6px rgba(48,67,85,0.12); }

        /* CTA button */
        .ps-cta {
          transition: transform 160ms cubic-bezier(0.16,1,0.3,1), box-shadow 160ms ease;
        }
        .ps-cta:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px -4px rgba(48,67,85,0.28); }
        .ps-cta:active:not(:disabled) { transform: scale(0.98); }

        /* Trust item hover */
        .ps-trust-item {
          transition: transform 200ms cubic-bezier(0.16,1,0.3,1), background-color 200ms ease;
        }
        .ps-trust-item:hover { transform: translateX(4px); background-color: rgba(255,255,255,0.08); }
        .ps-trust-item:hover .ps-trust-icon { box-shadow: 0 0 16px rgba(255,255,255,0.3); transform: scale(1.12); }
        .ps-trust-icon { transition: transform 300ms ease, box-shadow 300ms ease; }

        /* Animated link underline */
        .ps-alink { position: relative; text-decoration: none; display: inline-block; }
        .ps-alink::after { content:''; position:absolute; width:0; height:1.5px; bottom:-1px; left:0; background:currentColor; transition: width 240ms cubic-bezier(0.16,1,0.3,1); }
        .ps-alink:hover::after { width: 100%; }

        /* Validation icon */
        .ps-val-icon { transition: opacity 220ms ease, transform 220ms cubic-bezier(0.34,1.56,0.64,1); }

        /* Pass toggle */
        .ps-pass-toggle { transition: transform 220ms cubic-bezier(0.34,1.56,0.64,1), color 180ms ease; }
        .ps-pass-toggle:hover { transform: scale(1.12); }
        .ps-pass-toggle.toggled { transform: rotate(180deg) scale(1.1); }

        /* Custom checkbox */
        .ps-checkbox { transition: transform 140ms cubic-bezier(0.34,1.56,0.64,1), background-color 140ms ease; }
        .ps-checkbox:active { transform: scale(0.8); }

        /* Spin utility */
        @keyframes spin { to { transform: rotate(360deg); } }
        .ps-spin { animation: spin 1s linear infinite; }

        /* Ping utility */
        @keyframes ping { 75%,100% { transform:scale(2); opacity:0; } }
        .ps-ping { animation: ping 1s cubic-bezier(0,0,0.2,1) infinite; }

        /* Pulse utility */
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        .ps-pulse { animation: pulse 2s cubic-bezier(0.4,0,0.6,1) infinite; }

        @media (prefers-reduced-motion: reduce) {
          *,::before,::after { animation-duration:0.001ms!important; animation-iteration-count:1!important; transition-duration:0.001ms!important; }
        }
      `}</style>

      <div
        className="ps-root"
        style={{
          background: '#FAF8F6',
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflowX: 'hidden',
          padding: '0 0',
        }}
      >
        {/* â”€â”€ Ambient background â”€â”€ */}
        <div aria-hidden className="ps-ambient-bg" style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }} />
        {/* Particles */}
        <div aria-hidden className="ps-particle" style={{width:10,height:10,background:'rgba(48,67,85,0.2)',top:'6rem',left:'12%',animationDuration:'12s',filter:'blur(0.5px)'}}/>
        <div aria-hidden className="ps-particle" style={{width:14,height:14,background:'rgba(255,221,183,0.6)',top:'33%',left:'6%',animationDuration:'16s',animationDelay:'2s'}}/>
        <div aria-hidden className="ps-particle" style={{width:8,height:8,background:'rgba(48,67,85,0.15)',bottom:'8rem',left:'18%',animationDuration:'14s',animationDelay:'4s'}}/>
        <div aria-hidden className="ps-particle" style={{width:12,height:12,background:'rgba(227,193,154,0.5)',top:'5rem',right:'15%',animationDuration:'18s',animationDelay:'1s'}}/>
        <div aria-hidden className="ps-particle" style={{width:16,height:16,background:'rgba(48,67,85,0.1)',bottom:'6rem',right:'10%',animationDuration:'15s',animationDelay:'3s'}}/>
        <div aria-hidden className="ps-particle" style={{width:8,height:8,background:'rgba(208,229,251,0.4)',top:'50%',right:'5%',animationDuration:'13s',animationDelay:'5s'}}/>

        {/* â”€â”€ Main content â”€â”€ */}
        <main style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'12px 16px', position:'relative', zIndex:10 }}>
          <div style={{ display:'flex', flexDirection:'column', width:'100%', alignItems:'center', justifyContent:'center', position:'relative' }}>
            {/* Glow blobs */}
            <div aria-hidden style={{ position:'absolute', top:-48, left:-64, width:384, height:384, borderRadius:'50%', background:'rgba(208,229,251,0.2)', filter:'blur(48px)', pointerEvents:'none' }}/>
            <div aria-hidden style={{ position:'absolute', bottom:-64, right:-64, width:384, height:384, borderRadius:'50%', background:'rgba(255,221,183,0.3)', filter:'blur(48px)', pointerEvents:'none' }}/>

            {/* Live Registry Pill */}
            <div className="ps-s1" style={{ marginBottom:10, display:'flex', alignItems:'center', gap:10, padding:'4px 14px', borderRadius:9999, background:'#efedef', boxShadow:'0 1px 3px rgba(0,0,0,.08)', border:'1px solid rgba(116,119,125,0.3)', fontSize:11, color:'#64707A', letterSpacing:'0.05em', textTransform:'uppercase', fontWeight:600 }}>
              <div style={{ position:'relative', width:10, height:10 }}>
                <span className="ps-ping" style={{ position:'absolute', inset:0, borderRadius:'50%', background:'#388E3C', opacity:0.75 }}/>
                <span style={{ position:'relative', display:'inline-flex', width:10, height:10, borderRadius:'50%', background:'#388E3C' }}/>
              </div>
              Live Registry Pulse â€¢ 36 Districts Synchronized â€¢ NFHS-5 Geo-Aligned
            </div>

            {/* Split container */}
            <div style={{
              width:'100%', maxWidth:1040,
              background:'#ffffff',
              borderRadius:16,
              boxShadow:'0 20px 60px -10px rgba(0,0,0,0.15)',
              overflow:'hidden',
              display:'flex',
              flexWrap:'wrap',
              border:'1px solid rgba(116,119,125,0.2)',
              position:'relative', zIndex:10,
            }}>

              {/* â•â• LEFT PANEL â•â• */}
              <div className="ps-panel-left" style={{
                width:'40%',
                minWidth:280,
                flex:'1 1 280px',
                background:'#304355',
                color:'#ffffff',
                padding:'24px',
                display:'flex',
                flexDirection:'column',
                justifyContent:'space-between',
                position:'relative',
                overflow:'hidden',
              }}>
                {/* Topographic contour mesh */}
                <div aria-hidden style={{ position:'absolute', inset:0, pointerEvents:'none', opacity:0.2 }}>
                  <svg className="ps-contour-mesh" style={{ width:'100%', height:'100%' }} viewBox="0 0 400 700" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M-50 120 C80 180,150 60,280 140 C380 200,410 110,450 160" stroke="#d0e5fb" strokeWidth="1.2" strokeDasharray="4 6"/>
                    <path d="M-40 230 C90 310,180 190,310 280 C390 340,420 250,460 300" stroke="#d0e5fb" strokeWidth="1.2"/>
                    <path d="M-60 370 C70 420,160 330,270 410 C360 480,400 410,470 450" stroke="#d0e5fb" strokeWidth="1"/>
                    <path d="M-30 510 C100 580,190 480,300 550 C380 600,410 540,450 580" stroke="#d0e5fb" strokeWidth="1.4" strokeDasharray="3 5"/>
                    <circle cx="210" cy="270" r="140" stroke="#ffddb7" strokeWidth="0.8" opacity="0.3"/>
                    <circle cx="210" cy="270" r="210" stroke="#ffddb7" strokeWidth="0.6" strokeDasharray="6 8" opacity="0.2"/>
                  </svg>
                </div>

                {/* Left header */}
                <div style={{ position:'relative', zIndex:10 }}>
                  <div style={{ position:'relative', display:'inline-flex', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
                    <div className="ps-logo-aura" style={{ position:'absolute', inset:0, borderRadius:16, background:'#d0e5fb' }}/>
                    <div style={{ width:44, height:44, borderRadius:12, background:'#ffffff', color:'#304355', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 12px rgba(0,0,0,0.15)', position:'relative', zIndex:10 }}>
                      <span className="material-symbols-outlined" style={{ fontSize:32, color:'#304355', fontVariationSettings:"'FILL' 1" }}>spa</span>
                    </div>
                  </div>
                  <span style={{ display:'inline-block', padding:'2px 10px', marginBottom:8, fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', borderRadius:4, background:'#192d3e', color:'#d0e5fb', fontWeight:700 }}>
                    Public Good Architecture
                  </span>
                  <h1 style={{ fontSize:22, fontWeight:700, color:'#ffffff', letterSpacing:'-0.01em', lineHeight:1.3, margin:0 }}>
                    Join PoshanSetu
                  </h1>
                  <p style={{ fontSize:13, color:'#9cafc5', marginTop:6, lineHeight:1.5 }}>
                    {selectedRole?.leftHint || 'Your account type helps us personalize your civic engagement, district routing, and verified grassroots requests.'}
                  </p>
                  <div style={{ marginTop:16, display:'inline-flex', alignItems:'center', gap:8, padding:'6px 12px', borderRadius:8, background:'rgba(48,67,85,0.7)', color:'#d0e5fb', fontSize:12, fontWeight:600 }}>
                    <span className="ps-pulse" style={{ width:8, height:8, borderRadius:'50%', background:'#388E3C', display:'inline-block' }}/>
                    Verified Non-Custodial Coordination
                  </div>
                </div>

                {/* Trust pillars */}
                <div style={{ margin:'16px 0', display:'flex', flexDirection:'column', gap:10, position:'relative', zIndex:10 }}>
                  {[
                    { icon:'handshake', iconBg:'rgba(208,229,251,0.2)', iconColor:'#d0e5fb', title:'Direct drop-off, no cash handling', desc:'Physical nutritional kits delivered straight to local anganwadis.' },
                    { icon:'verified_user', iconBg:'rgba(255,221,183,0.2)', iconColor:'#ffddb7', title:'Verified grassroots institutions', desc:'Cross-checked via Gram Panchayat and Women & Child Development logs.' },
                    { icon:'analytics', iconBg:'rgba(208,229,251,0.2)', iconColor:'#d0e5fb', title:'NFHS-5 District Intelligence', desc:'Demands prioritized by real-time stunting and wasting metrics.' },
                  ].map((item) => (
                    <div key={item.icon} className="ps-trust-item" style={{ padding:10, borderRadius:12, display:'flex', alignItems:'flex-start', gap:12, background:'rgba(48,67,85,0.4)', backdropFilter:'blur(4px)' }}>
                      <div className="ps-trust-icon" style={{ width:36, height:36, borderRadius:8, background:item.iconBg, color:item.iconColor, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <span className="material-symbols-outlined" style={{ fontSize:20 }}>{item.icon}</span>
                      </div>
                      <div>
                        <h4 style={{ fontSize:13, fontWeight:700, color:'#ffffff', margin:0 }}>{item.title}</h4>
                        <p style={{ fontSize:12, color:'#9cafc5', marginTop:2, lineHeight:1.4 }}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom footnote */}
                <div style={{ paddingTop:10, borderTop:'1px solid rgba(255,255,255,0.1)', position:'relative', zIndex:10, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, color:'#9cafc5', fontSize:12 }}>
                    <span className="material-symbols-outlined" style={{ fontSize:16 }}>health_and_safety</span>
                    Zero Commission Civic Infrastructure
                  </div>
                  <span style={{ fontSize:12, color:'#d0e5fb', fontFamily:'monospace', fontWeight:600 }}>v2.4</span>
                </div>
              </div>

              {/* â•â• RIGHT PANEL â•â• */}
              <div className="ps-panel-right" style={{
                flex:'1 1 320px',
                background:'#ffffff',
                padding:'24px 28px',
                display:'flex',
                flexDirection:'column',
                justifyContent:'space-between',
                gap:14,
              }}>

                {/* Global error banner */}
                {errors.form && (
                  <div className={`ps-alert-entry ${errors.form ? 'ps-shake' : ''}`} style={{
                    padding:'14px', borderRadius:12, background:'#ffdad6', color:'#93000a',
                    display:'flex', alignItems:'flex-start', gap:12,
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize:20, color:'#ba1a1a', flexShrink:0 }}>report</span>
                    <div>
                      <h5 style={{ fontSize:13, fontWeight:700, margin:0 }}>Please check your registration details</h5>
                      <p style={{ fontSize:12, marginTop:2, lineHeight:1.4 }}>{errors.form}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate style={{ display:'flex', flexDirection:'column', gap:14 }}>

                  {/* STEP 1: Role */}
                  <div className="ps-s2">
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                      <label style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#1F2933', display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ width:20, height:20, borderRadius:'50%', background:'#304355', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0 }}>1</span>
                        Choose Your Account Type
                      </label>
                      <span style={{ fontSize:12, color:'#64707A', fontWeight:500 }}>
                        Selected: {selectedRole?.label}
                      </span>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                      {ROLE_DATA.map((role) => {
                        const isSelected = accountType === role.id;
                        return (
                          <div
                            key={role.id}
                            className="ps-role-card"
                            onClick={() => handleRoleSelect(role.id)}
                            style={{
                              cursor:'pointer',
                              position:'relative',
                              padding:10,
                              borderRadius:12,
                              border: isSelected ? '2px solid #304355' : '2px solid transparent',
                              background: isSelected ? 'rgba(48,67,85,0.08)' : '#f5f3f4',
                              boxShadow: isSelected ? '0 0 0 2px rgba(48,67,85,0.2)' : 'none',
                              display:'flex',
                              flexDirection:'column',
                              justifyContent:'space-between',
                              overflow:'hidden',
                            }}
                          >
                            {/* Ripple */}
                            {rippleRole === role.id && <div className="ps-ripple"/>}
                            {/* Check badge */}
                            {isSelected && (
                              <div className="ps-check-pop" style={{ position:'absolute', top:8, right:8, width:20, height:20, borderRadius:'50%', background:'#304355', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <span className="material-symbols-outlined" style={{ fontSize:13, fontWeight:700 }}>check</span>
                              </div>
                            )}
                            {/* Icon */}
                            <div style={{
                              width:36, height:36, borderRadius:'50%',
                              background: isSelected ? '#304355' : '#e4e2e3',
                              color: isSelected ? '#fff' : '#64707A',
                              display:'flex', alignItems:'center', justifyContent:'center',
                              marginBottom:10,
                              transition:'all 200ms',
                            }}>
                              <span className={`material-symbols-outlined${isSelected ? ' ps-icon-wiggle' : ''}`} style={{ fontSize:18 }}>{role.icon}</span>
                            </div>
                            <div>
                              <p style={{ fontSize:13, fontWeight:700, color:'#1F2933', margin:0 }}>{role.label}</p>
                              <p style={{ fontSize:12, color:'#64707A', marginTop:2, lineHeight:1.3 }}>{role.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* STEP 2: Fields */}
                  <div className="ps-s3" style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <label style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#1F2933', display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ width:20, height:20, borderRadius:'50%', background:'#304355', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0 }}>2</span>
                        Your Details
                      </label>
                      <span style={{ fontSize:12, color:'#64707A' }}>{selectedRole?.nameHint}</span>
                    </div>

                    {/* Full Name */}
                    <div>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                        <label htmlFor="ps-fullName" style={{ fontSize:13, fontWeight:500, color:'#64707A' }}>Full Name / Organization</label>
                      </div>
                      <div className="ps-input-wrapper" style={{ position:'relative', display:'flex', alignItems:'center' }}>
                        <span className="material-symbols-outlined" style={{ position:'absolute', left:12, fontSize:18, color:'#74777d', pointerEvents:'none' }}>badge</span>
                        <input
                          id="ps-fullName"
                          type="text"
                          placeholder={selectedRole?.namePlaceholder}
                          value={fullName}
                          required
                          disabled={isSubmitting}
                          onChange={(e) => { setFullName(e.target.value); setErrors(p => ({ ...p, fullName: undefined, form: undefined })); }}
                          style={{
                            width:'100%', paddingLeft:40, paddingRight:36, paddingTop:8, paddingBottom:8,
                            fontSize:13, color: errors.fullName ? '#ba1a1a' : '#1F2933',
                            background: errors.fullName ? 'rgba(186,26,26,0.05)' : '#f5f3f4',
                            border: errors.fullName ? '2px solid #ba1a1a' : '2px solid transparent',
                            borderRadius:8, outline:'none',
                            transition:'all 200ms',
                            fontFamily:"'Manrope',sans-serif",
                          }}
                          onFocus={e => { if (!errors.fullName) e.target.style.borderColor='rgba(48,67,85,0.4)'; e.target.style.background='#ffffff'; e.target.style.boxShadow='0 0 0 2px rgba(48,67,85,0.12)'; }}
                          onBlur={e => { if (!errors.fullName) { e.target.style.borderColor='transparent'; e.target.style.background='#f5f3f4'; e.target.style.boxShadow='none'; } }}
                        />
                        <span className="material-symbols-outlined ps-val-icon" style={{ position:'absolute', right:12, fontSize:18, color:'#388E3C', opacity: nameValid ? 1 : 0, transform: nameValid ? 'scale(1)' : 'scale(0.5)' }}>check_circle</span>
                        <div className="ps-focus-line"/>
                      </div>
                      {errors.fullName && <p style={{ fontSize:11, color:'#ba1a1a', marginTop:3, display:'flex', alignItems:'center', gap:4 }}><span className="material-symbols-outlined" style={{fontSize:13}}>error</span>{errors.fullName}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                        <label htmlFor="ps-email" style={{ fontSize:13, fontWeight:500, color:'#64707A' }}>Official Email Address</label>
                        {errors.email && <span style={{ fontSize:11, color:'#ba1a1a', fontWeight:500 }}>Email already in registry</span>}
                      </div>
                      <div className="ps-input-wrapper" style={{ position:'relative', display:'flex', alignItems:'center' }}>
                        <span className="material-symbols-outlined" style={{ position:'absolute', left:12, fontSize:18, color: errors.email ? '#ba1a1a' : '#74777d', pointerEvents:'none' }}>mail</span>
                        <input
                          id="ps-email"
                          type="email"
                          placeholder="name@organization.org"
                          value={email}
                          required
                          disabled={isSubmitting}
                          onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined, form: undefined })); }}
                          style={{
                            width:'100%', paddingLeft:40, paddingRight:36, paddingTop:8, paddingBottom:8,
                            fontSize:13, color: errors.email ? '#ba1a1a' : '#1F2933',
                            background: errors.email ? 'rgba(186,26,26,0.05)' : '#f5f3f4',
                            border: errors.email ? '2px solid #ba1a1a' : '2px solid transparent',
                            borderRadius:8, outline:'none',
                            transition:'all 200ms',
                            fontFamily:"'Manrope',sans-serif",
                          }}
                          onFocus={e => { if (!errors.email) { e.target.style.borderColor='rgba(48,67,85,0.4)'; e.target.style.background='#ffffff'; e.target.style.boxShadow='0 0 0 2px rgba(48,67,85,0.12)'; } }}
                          onBlur={e => { if (!errors.email) { e.target.style.borderColor='transparent'; e.target.style.background='#f5f3f4'; e.target.style.boxShadow='none'; } }}
                        />
                        <span className="material-symbols-outlined ps-val-icon" style={{ position:'absolute', right:12, fontSize:18, color:'#388E3C', opacity: emailValid && !errors.email ? 1 : 0, transform: emailValid && !errors.email ? 'scale(1)' : 'scale(0.5)' }}>check_circle</span>
                        <div className="ps-focus-line"/>
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                        <label htmlFor="ps-password" style={{ fontSize:13, fontWeight:500, color:'#64707A' }}>Create Password</label>
                        <span style={{ fontSize:11, color:'#64707A' }}>Min. 8 characters</span>
                      </div>
                      <div className="ps-input-wrapper" style={{ position:'relative', display:'flex', alignItems:'center' }}>
                        <span className="material-symbols-outlined" style={{ position:'absolute', left:12, fontSize:18, color:'#74777d', pointerEvents:'none' }}>lock</span>
                        <input
                          id="ps-password"
                          type={passwordVisible ? 'text' : 'password'}
                          placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                          value={password}
                          required
                          disabled={isSubmitting}
                          onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined, form: undefined })); }}
                          style={{
                            width:'100%', paddingLeft:40, paddingRight:40, paddingTop:8, paddingBottom:8,
                            fontSize:13, color: errors.password ? '#ba1a1a' : '#1F2933',
                            background: errors.password ? 'rgba(186,26,26,0.05)' : '#f5f3f4',
                            border: errors.password ? '2px solid #ba1a1a' : '2px solid transparent',
                            borderRadius:8, outline:'none',
                            transition:'all 200ms',
                            fontFamily:"'Manrope',sans-serif",
                          }}
                          onFocus={e => { if (!errors.password) { e.target.style.borderColor='rgba(48,67,85,0.4)'; e.target.style.background='#ffffff'; e.target.style.boxShadow='0 0 0 2px rgba(48,67,85,0.12)'; } }}
                          onBlur={e => { if (!errors.password) { e.target.style.borderColor='transparent'; e.target.style.background='#f5f3f4'; e.target.style.boxShadow='none'; } }}
                        />
                        <button
                          type="button"
                          aria-label="Toggle password visibility"
                          className={`ps-pass-toggle${toggledPass ? ' toggled' : ''}`}
                          onClick={() => { setPasswordVisible(v => !v); setToggledPass(t => !t); }}
                          style={{ position:'absolute', right:10, background:'none', border:'none', cursor:'pointer', color:'#74777d', display:'flex', alignItems:'center', padding:0 }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize:19 }}>{passwordVisible ? 'visibility_off' : 'visibility'}</span>
                        </button>
                        <div className="ps-focus-line"/>
                      </div>
                      {errors.password && <p style={{ fontSize:11, color:'#ba1a1a', marginTop:3, display:'flex', alignItems:'center', gap:4 }}><span className="material-symbols-outlined" style={{fontSize:13}}>error</span>{errors.password}</p>}
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="ps-s4" style={{ paddingTop:2 }}>
                    <label style={{ display:'flex', alignItems:'flex-start', gap:12, cursor:'pointer' }}>
                      <input
                        type="checkbox"
                        checked={terms}
                        disabled={isSubmitting}
                        onChange={(e) => { setTerms(e.target.checked); setErrors(p => ({ ...p, terms: undefined })); }}
                        className="ps-checkbox"
                        style={{ marginTop:3, width:16, height:16, borderRadius:4, accentColor:'#304355', cursor:'pointer', flexShrink:0 }}
                      />
                      <span style={{ fontSize:12, color:'#64707A', lineHeight:1.5 }}>
                        I agree to PoshanSetu's{' '}
                        <a href="#" style={{ color:'#1F2933', textDecoration:'underline', fontWeight:500 }}>Terms of Service</a>{' '}
                        and{' '}
                        <a href="#" style={{ color:'#1F2933', textDecoration:'underline', fontWeight:500 }}>Privacy Policy</a>.{' '}
                        I understand that PoshanSetu is a non-custodial coordination layer and does not hold cash reserves.
                      </span>
                    </label>
                    {errors.terms && <p style={{ fontSize:11, color:'#ba1a1a', marginTop:4, paddingLeft:28, display:'flex', alignItems:'center', gap:4 }}><span className="material-symbols-outlined" style={{fontSize:13}}>error</span>{errors.terms}</p>}
                  </div>

                  {/* Submitting progress */}
                  {isSubmitting && (
                    <div className="ps-s5" style={{ padding:12, borderRadius:8, background:'#efedef' }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:12, color:'#64707A', marginBottom:8 }}>
                        <span style={{ display:'flex', alignItems:'center', gap:6, fontWeight:600, color:'#1F2933' }}>
                          {submitDone
                            ? <span className="material-symbols-outlined" style={{ fontSize:16, color:'#388E3C' }}>verified</span>
                            : <span className="material-symbols-outlined ps-spin" style={{ fontSize:16, color:'#304355' }}>autorenew</span>
                          }
                          {submitStageLabel || 'Verifying details...'}
                        </span>
                        <span style={{ fontFamily:'monospace', fontWeight:700, color:'#304355' }}>{submitProgress}%</span>
                      </div>
                      <div style={{ width:'100%', height:6, background:'#e4e2e3', borderRadius:9999, overflow:'hidden' }}>
                        <div style={{ height:'100%', background:'#304355', borderRadius:9999, width:`${submitProgress}%`, transition:'width 500ms ease' }}/>
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  <div className="ps-s6">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="ps-btn-shimmer ps-cta"
                      style={{
                        width:'100%', position:'relative', overflow:'hidden',
                        padding:'10px 20px', borderRadius:8,
                        background:'#304355', color:'#ffffff',
                        fontSize:13, fontWeight:600, letterSpacing:'0.04em',
                        display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                        border:'none', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        boxShadow:'0 4px 12px rgba(48,67,85,0.3)',
                        opacity: isSubmitting ? 0.6 : 1,
                        fontFamily:"'Manrope',sans-serif",
                      }}
                    >
                      <span>{submitDone ? 'Success!' : isSubmitting ? 'Creating profile...' : 'Create Account'}</span>
                      {isSubmitting && !submitDone
                        ? <span className="material-symbols-outlined ps-spin" style={{ fontSize:18 }}>progress_activity</span>
                        : <span className="material-symbols-outlined" style={{ fontSize:18 }}>arrow_forward</span>
                      }
                    </button>
                  </div>

                  {/* Sign in link */}
                  <div style={{ textAlign:'center', paddingTop:4 }}>
                    <p style={{ fontSize:13, color:'#64707A' }}>
                      Already have an account on the network?{' '}
                      <Link to="/login" className="ps-alink" style={{ fontWeight:600, color:'#304355', marginLeft:4 }}>
                        Sign In to Dashboard
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>

            {/* Bottom civic badge bar */}
            <div className="ps-s1" style={{ marginTop:12, display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'center', gap:14, color:'#64707A', fontSize:12 }}>
              {[
                { icon:'lock_clock', text:'256-Bit Encrypted Data Transits' },
                { icon:'shield_person', text:'Aadhaar/PAN verification for nodal coordinators' },
                { icon:'public', text:'Maharashtra Nutrition Registry v2.4' },
              ].map((item, i) => (
                <React.Fragment key={item.icon}>
                  {i > 0 && <span style={{ color:'#c3c7cc', display:'none' }} className="sm-dot">â€¢</span>}
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <span className="material-symbols-outlined" style={{ fontSize:18, color:'#304355' }}>{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
