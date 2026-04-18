'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { getCookie, setCookie, deleteCookie } from '@/lib/utils';
import { toast } from 'sonner';
import { Smartphone, Lock, User, ShieldCheck, Eye, EyeOff, CheckCircle2, ArrowRight, Zap } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

/* ═══════════════════════════════════════════════════════════════
   DESIGN SYSTEM — exact mirror of all app pages
   ─ Single accent: #f97316  |  Ink: #0d0d0d  |  Surface: #f9fafb
   ─ Fonts: Instrument Serif (display) + Geist (body)
   ─ Motion: tilt, morph, shine, ripple, orbit
═══════════════════════════════════════════════════════════════ */

const REG_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600;700;800&display=swap');

:root {
  --accent:        #f97316;
  --accent-dim:    rgba(249,115,22,0.12);
  --accent-mid:    rgba(249,115,22,0.22);
  --ink:           #0d0d0d;
  --ink-mid:       #4b5563;
  --ink-faint:     #9ca3af;
  --surface:       #f9fafb;
  --surface-raise: #ffffff;
  --border:        #e5e7eb;
  --border-strong: #d1d5db;
  --ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-expo:     cubic-bezier(0.16, 1, 0.3, 1);
}

.rg-font-display { font-family: 'Instrument Serif', Georgia, serif; }
.rg-font-body    { font-family: 'Geist', system-ui, sans-serif; }

@keyframes rg-fade-up {
  from { opacity:0; transform:translateY(24px); filter:blur(4px); }
  to   { opacity:1; transform:translateY(0);    filter:blur(0); }
}
@keyframes rg-card-in {
  from { opacity:0; transform:translateY(18px) scale(0.96); filter:blur(4px); }
  to   { opacity:1; transform:translateY(0)    scale(1);    filter:blur(0); }
}
@keyframes rg-spin-slow  { from { transform:rotate(0deg); }  to { transform:rotate(360deg); } }
@keyframes rg-spin-rev   { from { transform:rotate(0deg); }  to { transform:rotate(-360deg); } }
@keyframes rg-blink      { 0%,100%{ opacity:1; } 50%{ opacity:0.2; } }
@keyframes rg-live-ring  {
  0%   { transform:scale(1);   opacity:0.5; }
  70%  { transform:scale(2.2); opacity:0; }
  100% { transform:scale(2.2); opacity:0; }
}
@keyframes rg-blob-morph {
  0%,100% { border-radius:60% 40% 30% 70% / 60% 30% 70% 40%; }
  33%      { border-radius:30% 70% 60% 40% / 50% 60% 30% 60%; }
  66%      { border-radius:50% 30% 70% 40% / 40% 70% 30% 60%; }
}
@keyframes rg-shine      { from { left:-80%; } to { left:130%; } }
@keyframes rg-ripple-out { from { transform:scale(0); opacity:0.35; } to { transform:scale(3.5); opacity:0; } }
@keyframes rg-orbit {
  from { transform:rotate(0deg) translateX(44px) rotate(0deg); }
  to   { transform:rotate(360deg) translateX(44px) rotate(-360deg); }
}
@keyframes rg-underline {
  from { transform:scaleX(0); transform-origin:left; }
  to   { transform:scaleX(1); transform-origin:left; }
}
@keyframes rg-float {
  0%,100% { transform:translateY(0); }
  50%      { transform:translateY(-8px); }
}
@keyframes rg-pulse-ring {
  0%   { transform:scale(0.85); opacity:0.6; }
  70%  { transform:scale(1.7);  opacity:0; }
  100% { transform:scale(1.7);  opacity:0; }
}

.rg-section-enter { animation:rg-card-in 0.65s var(--ease-expo) both; }

/* Shine */
.rg-shine { position:relative; overflow:hidden; }
.rg-shine::before {
  content:''; position:absolute; top:-50%; left:-80%;
  width:50%; height:200%;
  background:linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.5) 50%,transparent 70%);
  transform:skewX(-20deg); pointer-events:none; z-index:2;
}
.rg-shine:hover::before { animation:rg-shine 0.5s ease forwards; }

/* Ripple */
.rg-ripple { position:relative; overflow:hidden; }
.rg-ripple-circle {
  position:absolute; border-radius:50%;
  background:rgba(255,255,255,0.28);
  transform:scale(0);
  animation:rg-ripple-out 0.6s linear forwards;
  pointer-events:none;
}

/* Blob */
.rg-blob {
  border-radius:60% 40% 30% 70% / 60% 30% 70% 40%;
  animation:rg-blob-morph 10s ease-in-out infinite;
  position:absolute; pointer-events:none;
}

/* Input */
.rg-input {
  width:100%;
  background:var(--surface-raise);
  border:1.5px solid var(--border);
  border-radius:0.875rem;
  padding:0.75rem 0.875rem 0.75rem 2.75rem;
  font-family:'Geist', system-ui, sans-serif;
  font-size:0.9375rem;
  font-weight:500;
  color:var(--ink);
  outline:none;
  transition:border-color 0.2s, box-shadow 0.2s, background 0.2s;
}
.rg-input::placeholder { color:var(--ink-faint); }
.rg-input:focus {
  border-color:var(--accent);
  box-shadow:0 0 0 3px var(--accent-dim);
}
.rg-input-valid {
  border-color:#10b981 !important;
  box-shadow:0 0 0 3px rgba(16,185,129,0.10) !important;
}
.rg-input-error {
  border-color:#ef4444 !important;
  box-shadow:0 0 0 3px rgba(239,68,68,0.10) !important;
}

/* Stagger form fields */
.rg-stagger > *:nth-child(1) { animation:rg-fade-up 0.5s var(--ease-expo) 0.08s both; }
.rg-stagger > *:nth-child(2) { animation:rg-fade-up 0.5s var(--ease-expo) 0.14s both; }
.rg-stagger > *:nth-child(3) { animation:rg-fade-up 0.5s var(--ease-expo) 0.20s both; }
.rg-stagger > *:nth-child(4) { animation:rg-fade-up 0.5s var(--ease-expo) 0.26s both; }
.rg-stagger > *:nth-child(5) { animation:rg-fade-up 0.5s var(--ease-expo) 0.32s both; }
.rg-stagger > *:nth-child(6) { animation:rg-fade-up 0.5s var(--ease-expo) 0.38s both; }
`;

function RegStyleInjector() {
  useEffect(() => {
    if (document.getElementById('rg-v2-styles')) return;
    const el = document.createElement('style');
    el.id = 'rg-v2-styles';
    el.textContent = REG_STYLES;
    document.head.appendChild(el);
  }, []);
  return null;
}

/* ── Ripple hook ── */
function useRipple() {
  return useCallback((e) => {
    const btn = e.currentTarget;
    const circle = document.createElement('span');
    const d = Math.max(btn.clientWidth, btn.clientHeight);
    const r = btn.getBoundingClientRect();
    circle.className = 'rg-ripple-circle';
    Object.assign(circle.style, {
      width:`${d}px`, height:`${d}px`,
      left:`${e.clientX - r.left - d/2}px`,
      top:`${e.clientY - r.top  - d/2}px`,
    });
    btn.appendChild(circle);
    setTimeout(() => circle.remove(), 700);
  }, []);
}

/* ── 3D Tilt hook ── */
function useTilt(strength = 3) {
  const ref = useRef(null);
  const onMove = useCallback((e) => {
    const el = ref.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width/2)  / (rect.width/2);
    const dy = (e.clientY - rect.top  - rect.height/2) / (rect.height/2);
    el.style.transform = `perspective(900px) rotateY(${dx*strength}deg) rotateX(${-dy*strength}deg)`;
    el.style.boxShadow = `${-dx*8}px ${dy*8}px 48px rgba(0,0,0,0.13), 0 0 0 1px rgba(255,255,255,0.9)`;
  }, [strength]);
  const onLeave = useCallback(() => {
    const el = ref.current; if (!el) return;
    el.style.transform = ''; el.style.boxShadow = '';
  }, []);
  return { ref, onMouseMove: onMove, onMouseLeave: onLeave };
}

/* ── Password strength ── */
function getPasswordStrength(pwd) {
  if (!pwd) return { score:0, label:'', color:'', pct:0 };
  let score = 0;
  if (pwd.length >= 6)           score++;
  if (pwd.length >= 10)          score++;
  if (/[A-Z]/.test(pwd))         score++;
  if (/[0-9]/.test(pwd))         score++;
  if (/[^A-Za-z0-9]/.test(pwd))  score++;
  if (score <= 1) return { score, label:'Weak',        color:'#ef4444', pct:20 };
  if (score <= 2) return { score, label:'Fair',        color:'#f59e0b', pct:40 };
  if (score <= 3) return { score, label:'Good',        color:'#3b82f6', pct:65 };
  if (score <= 4) return { score, label:'Strong',      color:'#10b981', pct:85 };
  return              { score, label:'Very Strong', color:'#059669', pct:100 };
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export default function RegisterAdminPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const DRAFT_COOKIE_KEY = 'registerAdminDraft';
  const [formData, setFormData] = useState({ name:'', mobile:'', password:'', confirmPassword:'' });
  const [showPwd, setShowPwd]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focused, setFocused]         = useState(null);
  const isReloadRef = useRef(false);

  const { ref: cardRef, onMouseMove: cardMove, onMouseLeave: cardLeave } = useTilt(3);
  const ripple = useRipple();

  useEffect(() => {
    if (!authLoading && user) router.replace('/dashboard');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const draft = getCookie(DRAFT_COOKIE_KEY);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed?.formData) setFormData(prev => ({ ...prev, ...parsed.formData }));
      } catch {}
    }
    const handler = () => sessionStorage.setItem('registerAdminIsReload','1');
    window.addEventListener('beforeunload', handler);
    setTimeout(() => setMounted(true), 50);
    return () => {
      window.removeEventListener('beforeunload', handler);
      const isReload = sessionStorage.getItem('registerAdminIsReload') === '1';
      if (isReload) { isReloadRef.current = true; sessionStorage.removeItem('registerAdminIsReload'); }
      if (!isReload) deleteCookie(DRAFT_COOKIE_KEY);
    };
  }, []);

  useEffect(() => {
    setCookie(DRAFT_COOKIE_KEY, JSON.stringify({ formData }), 7);
  }, [formData]);

  const strength    = getPasswordStrength(formData.password);
  const pwdMatch    = formData.confirmPassword && formData.password === formData.confirmPassword;
  const pwdMismatch = formData.confirmPassword && formData.password !== formData.confirmPassword;

  async function handleRegister(e) {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return toast.error('Passwords do not match');
    if (formData.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await authService.registerAdmin(formData.mobile, formData.password, formData.name);
      toast.success('Admin registered successfully!');
      deleteCookie(DRAFT_COOKIE_KEY);
      router.push('/login');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
      setLoading(false);
    }
  }

  return (
    <>
      <RegStyleInjector />
      <div
        className="rg-font-body"
        style={{
          minHeight:'100vh', position:'relative', overflow:'hidden',
          display:'flex', alignItems:'center', justifyContent:'center',
          padding:'1rem',
          backgroundColor:'var(--surface)',
        }}
      >
        {/* ── Background ambient blobs — same as login ── */}
        <div className="rg-blob" style={{ width:300, height:300, background:'var(--accent)', opacity:0.06, top:-70, left:-70, animation:'rg-blob-morph 12s ease-in-out infinite, rg-float 6s ease-in-out infinite' }} />
        <div className="rg-blob" style={{ width:220, height:220, background:'var(--accent)', opacity:0.04, top:'8%', right:-50, animationDelay:'3s', animation:'rg-blob-morph 14s ease-in-out 3s infinite, rg-float 7s ease-in-out 1s infinite' }} />
        <div className="rg-blob" style={{ width:180, height:180, background:'var(--accent)', opacity:0.03, bottom:-30, left:'20%', animationDelay:'6s', animation:'rg-blob-morph 11s ease-in-out 6s infinite, rg-float 8s ease-in-out 2s infinite' }} />

        {/* Decorative spinning rings */}
        <div style={{ position:'absolute', top:32, right:32, width:80, height:80, animation:'rg-spin-slow 22s linear infinite', pointerEvents:'none' }}>
          <div style={{ width:'100%', height:'100%', borderRadius:'50%', border:'1px dashed rgba(249,115,22,0.15)' }} />
        </div>
        <div style={{ position:'absolute', top:42, right:42, width:48, height:48, animation:'rg-spin-rev 11s linear infinite', pointerEvents:'none' }}>
          <div style={{ width:'100%', height:'100%', borderRadius:'50%', border:'1px solid rgba(249,115,22,0.08)' }} />
        </div>
        <div style={{ position:'absolute', bottom:32, left:32, width:64, height:64, animation:'rg-spin-slow 16s linear infinite', pointerEvents:'none' }}>
          <div style={{ width:'100%', height:'100%', borderRadius:'50%', border:'1px dashed rgba(249,115,22,0.12)' }} />
        </div>
        {/* Orbiting dot */}
        <div style={{ position:'absolute', top:50, right:50, pointerEvents:'none' }}>
          <div style={{ width:5, height:5, borderRadius:'50%', background:'var(--accent)', opacity:0.5, animation:'rg-orbit 10s linear infinite' }} />
        </div>

        {/* ══════════════════ CARD ══════════════════ */}
        <div
          ref={cardRef}
          onMouseMove={cardMove}
          onMouseLeave={cardLeave}
          className={mounted ? 'rg-section-enter' : ''}
          style={{
            width:'100%', maxWidth:440, position:'relative',
            borderRadius:'1.75rem',
            background:'var(--surface-raise)',
            border:'1px solid var(--border)',
            boxShadow:'0 24px 64px -16px rgba(0,0,0,0.14), 0 0 0 1px rgba(255,255,255,0.9)',
            overflow:'hidden',
            willChange:'transform',
            transition:'box-shadow 0.3s ease',
          }}
        >
          {/* ── Dark hero banner — identical to login ── */}
          <div style={{ background:'linear-gradient(135deg,#0d0d0d 0%,#181818 60%,#0d0d0d 100%)', padding:'1.75rem', position:'relative', overflow:'hidden' }}>
            <div className="rg-blob" style={{ width:200, height:200, background:'var(--accent)', opacity:0.07, top:-50, right:-30 }} />
            <div className="rg-blob" style={{ width:130, height:130, background:'var(--accent)', opacity:0.04, bottom:-35, left:'15%', animationDelay:'4s' }} />

            {/* Spinning rings */}
            <div style={{ position:'absolute', right:24, top:24, width:72, height:72, animation:'rg-spin-slow 18s linear infinite', pointerEvents:'none' }}>
              <div style={{ width:'100%', height:'100%', borderRadius:'50%', border:'1px dashed rgba(249,115,22,0.2)' }} />
            </div>
            <div style={{ position:'absolute', right:31, top:31, width:44, height:44, animation:'rg-spin-rev 8s linear infinite', pointerEvents:'none' }}>
              <div style={{ width:'100%', height:'100%', borderRadius:'50%', border:'1px solid rgba(249,115,22,0.12)' }} />
            </div>
            {/* Orbiting dot */}
            <div style={{ position:'absolute', right:40, top:40, pointerEvents:'none' }}>
              <div style={{ width:5, height:5, borderRadius:'50%', background:'var(--accent)', opacity:0.7, animation:'rg-orbit 8s linear infinite' }} />
            </div>
            {/* Corner accent line */}
            <div style={{ position:'absolute', top:0, left:'8%', width:90, height:2, background:'linear-gradient(90deg,var(--accent),transparent)', opacity:0.6 }} />

            <div style={{ position:'relative', display:'flex', alignItems:'center', gap:'1.125rem' }}>
              {/* Logo icon */}
              <div style={{ position:'relative', flexShrink:0 }}>
                <div style={{ width:56, height:56, borderRadius:'1rem', background:'linear-gradient(135deg,var(--accent),#c2410c)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 28px rgba(249,115,22,0.4)' }}>
                  <ShieldCheck style={{ width:26, height:26, color:'#fff' }} strokeWidth={2} />
                </div>
                {/* Pulse ring */}
                <div style={{ position:'absolute', inset:0, borderRadius:'1rem', background:'rgba(249,115,22,0.35)', animation:'rg-pulse-ring 2.5s cubic-bezier(0.215,0.61,0.355,1) infinite' }} />
                {/* Live dot */}
                <span style={{ position:'absolute', top:-3, right:-3, width:14, height:14, borderRadius:'50%', background:'#22c55e', border:'2.5px solid #0d0d0d', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ width:5, height:5, borderRadius:'50%', background:'#fff', animation:'rg-blink 2s ease-in-out infinite', display:'inline-block' }} />
                </span>
              </div>

              <div>
                <p style={{ fontSize:'0.625rem', fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:'rgba(255,255,255,0.28)', marginBottom:'0.35rem' }}>
                  Initial Setup
                </p>
                <h1 className="rg-font-display" style={{ fontSize:'clamp(1.5rem,3.5vw,2rem)', fontWeight:400, lineHeight:1.1, color:'rgba(255,255,255,0.94)', fontStyle:'italic', marginBottom:'0.4rem' }}>
                  Create <span style={{ color:'var(--accent)' }}>Admin</span>
                </h1>
                {/* Animated underline */}
                <div style={{ height:2, width:48, background:'var(--accent)', animation:'rg-underline 0.8s var(--ease-expo) 0.4s both', borderRadius:2 }} />
                <p style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.3)', marginTop:'0.5rem', fontWeight:400 }}>
                  Register the first administrator account
                </p>
              </div>
            </div>
          </div>

          {/* ── Form body ── */}
          <div style={{ padding:'1.75rem', display:'flex', flexDirection:'column', gap:'1.125rem' }} className="rg-stagger">

            {/* Full Name */}
            <InputField
              label="Full Name"
              icon={User}
              value={formData.name}
              placeholder="Admin name"
              type="text"
              focused={focused === 'name'}
              onFocus={() => setFocused('name')}
              onBlur={() => setFocused(null)}
              onChange={v => setFormData({ ...formData, name: v })}
              valid={formData.name.length > 1}
            />

            {/* Mobile */}
            <InputField
              label="Mobile Number"
              icon={Smartphone}
              value={formData.mobile}
              placeholder="10-digit mobile number"
              type="tel"
              maxLength={10}
              focused={focused === 'mobile'}
              onFocus={() => setFocused('mobile')}
              onBlur={() => setFocused(null)}
              onChange={v => setFormData({ ...formData, mobile: v.replace(/\D/g,'') })}
              valid={formData.mobile.length === 10}
              suffix={formData.mobile.length > 0 && (
                <span style={{ fontSize:'0.6875rem', fontWeight:700, color: formData.mobile.length===10?'#22c55e':'var(--border-strong)', transition:'color 0.2s' }}>
                  {formData.mobile.length}/10
                </span>
              )}
            />

            {/* Password */}
            <div style={{ display:'flex', flexDirection:'column', gap:'0.375rem' }}>
              <InputField
                label="Password"
                icon={Lock}
                value={formData.password}
                placeholder="Min. 6 characters"
                type={showPwd ? 'text' : 'password'}
                focused={focused === 'password'}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                onChange={v => setFormData({ ...formData, password: v })}
                suffix={
                  <button type="button" onClick={() => setShowPwd(v => !v)}
                    style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', color:'var(--ink-faint)', padding:0 }}>
                    {showPwd ? <EyeOff style={{ width:14, height:14 }} /> : <Eye style={{ width:14, height:14 }} />}
                  </button>
                }
              />
              {/* Strength meter */}
              {formData.password && (
                <div style={{ paddingLeft:'0.25rem', display:'flex', flexDirection:'column', gap:'0.375rem' }}>
                  <div style={{ display:'flex', gap:'0.25rem' }}>
                    {[20,40,65,85,100].map((pct, i) => (
                      <div key={i} style={{ flex:1, height:3, borderRadius:999, background:'var(--border)', overflow:'hidden' }}>
                        <div style={{ height:'100%', width: strength.pct >= pct ? '100%' : '0%', background:strength.color, transition:'width 0.3s ease, background-color 0.3s ease', borderRadius:999 }} />
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize:'0.625rem', fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', color:strength.color, margin:0 }}>
                    {strength.label}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div style={{ display:'flex', flexDirection:'column', gap:'0.375rem' }}>
              <InputField
                label="Confirm Password"
                icon={Lock}
                value={formData.confirmPassword}
                placeholder="Re-enter password"
                type={showConfirm ? 'text' : 'password'}
                focused={focused === 'confirm'}
                onFocus={() => setFocused('confirm')}
                onBlur={() => setFocused(null)}
                onChange={v => setFormData({ ...formData, confirmPassword: v })}
                valid={pwdMatch}
                error={pwdMismatch}
                suffix={
                  <button type="button" onClick={() => setShowConfirm(v => !v)}
                    style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', color:'var(--ink-faint)', padding:0 }}>
                    {showConfirm ? <EyeOff style={{ width:14, height:14 }} /> : <Eye style={{ width:14, height:14 }} />}
                  </button>
                }
              />
              {pwdMismatch && (
                <p style={{ fontSize:'0.625rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#ef4444', margin:0, paddingLeft:'0.25rem' }}>
                  Passwords do not match
                </p>
              )}
              {pwdMatch && (
                <p style={{ fontSize:'0.625rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#10b981', margin:0, paddingLeft:'0.25rem', display:'flex', alignItems:'center', gap:'0.3rem' }}>
                  <CheckCircle2 style={{ width:11, height:11 }} /> Passwords match
                </p>
              )}
            </div>

            {/* Submit */}
            <RegisterBtn loading={loading} onSubmit={handleRegister} />

            {/* Footer note */}
            <p style={{ textAlign:'center', fontSize:'0.6875rem', fontWeight:500, color:'var(--ink-faint)' }}>
              This account will have full administrative access.
            </p>
          </div>

          {/* Bottom accent line */}
          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:'linear-gradient(90deg, transparent, rgba(249,115,22,0.3), transparent)' }} />
        </div>

        {/* Sign in link */}
        <p style={{ textAlign:'center', fontSize:'0.8125rem', fontWeight:500, color:'var(--ink-faint)', marginTop:'1.5rem' }}>
          Already have an account?{' '}
          <button
            onClick={() => router.push('/login')}
            style={{ background:'none', border:'none', cursor:'pointer', fontWeight:700, color:'var(--ink-mid)', textDecoration:'underline', textUnderlineOffset:3, transition:'color 0.2s', fontSize:'0.8125rem' }}
          >
            Sign in
          </button>
        </p>
      </div>
    </>
  );
}

/* ── Input Field ── */
function InputField({ label, icon: Icon, value, placeholder, type, maxLength, focused, onFocus, onBlur, onChange, valid, error, suffix }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'0.375rem' }}>
      <label style={{ fontSize:'0.625rem', fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-faint)' }}>
        {label}
      </label>
      <div style={{ position:'relative' }}>
        <div style={{
          position:'absolute', left:'0.875rem', top:'50%', transform:'translateY(-50%)',
          width:20, height:20, borderRadius:'0.375rem', display:'flex', alignItems:'center', justifyContent:'center',
          background: focused ? 'var(--accent-dim)' : 'var(--surface)',
          transition:'background 0.2s',
        }}>
          <Icon style={{ width:11, height:11, color: focused ? 'var(--accent)' : 'var(--ink-faint)', transition:'color 0.2s' }} strokeWidth={2.5} />
        </div>
        <input
          type={type}
          maxLength={maxLength}
          placeholder={placeholder}
          value={value}
          onFocus={onFocus}
          onBlur={onBlur}
          onChange={e => onChange(e.target.value)}
          className={`rg-input${valid?' rg-input-valid':''}${error?' rg-input-error':''}`}
          style={{ paddingRight: suffix ? '3rem' : '0.875rem' }}
        />
        {suffix && (
          <div style={{ position:'absolute', right:'0.875rem', top:'50%', transform:'translateY(-50%)', display:'flex', alignItems:'center' }}>
            {suffix}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Register Button ── */
function RegisterBtn({ loading, onSubmit }) {
  const ripple = useRipple();
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      disabled={loading}
      onClick={(e) => { ripple(e); onSubmit(e); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="rg-ripple rg-shine"
      style={{
        width:'100%', padding:'1rem', borderRadius:'1.125rem', marginTop:'0.25rem',
        fontSize:'0.9375rem', fontWeight:700, color:'#fff',
        cursor:loading?'not-allowed':'pointer',
        background:'var(--ink)',
        border:`1.5px solid ${hovered?'var(--accent)':'var(--ink)'}`,
        boxShadow:hovered?'0 10px 32px rgba(0,0,0,0.25)':'0 4px 16px rgba(0,0,0,0.15)',
        transition:'all 0.2s',
        transform:hovered&&!loading?'translateY(-1px)':'translateY(0)',
        opacity:loading?0.7:1,
        display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem',
      }}
    >
      {loading ? (
        <>
          <div style={{ width:16, height:16, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', animation:'rg-spin-slow 0.7s linear infinite' }} />
          Registering…
        </>
      ) : (
        <>
          <Zap style={{ width:16, height:16, color:'var(--accent)' }} strokeWidth={2.5} />
          Register Admin Account
          <ArrowRight style={{ width:15, height:15, color: hovered?'var(--accent)':'rgba(255,255,255,0.55)', transform:hovered?'translateX(2px)':'translateX(0)', transition:'transform 0.2s, color 0.2s' }} />
        </>
      )}
    </button>
  );
}
