'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { authService } from '@/services/authService';
import { getCookie, setCookie, deleteCookie } from '@/lib/utils';
import { toast } from 'sonner';
import { Smartphone, Lock, UserCircle, Users, Eye, EyeOff, Zap, ArrowRight } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   DESIGN SYSTEM — exact mirror of all app pages
   ─ Single accent: #f97316  |  Ink: #0d0d0d  |  Surface: #f9fafb
   ─ Fonts: Instrument Serif (display) + Geist (body)
   ─ Motion: tilt, morph, shine, ripple, orbit
═══════════════════════════════════════════════════════════════ */

const LOGIN_STYLES = `
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

.lg-font-display { font-family: 'Instrument Serif', Georgia, serif; }
.lg-font-body    { font-family: 'Geist', system-ui, sans-serif; }

@keyframes lg-fade-up {
  from { opacity:0; transform:translateY(24px); filter:blur(4px); }
  to   { opacity:1; transform:translateY(0);    filter:blur(0); }
}
@keyframes lg-card-in {
  from { opacity:0; transform:translateY(18px) scale(0.96); filter:blur(4px); }
  to   { opacity:1; transform:translateY(0)    scale(1);    filter:blur(0); }
}
@keyframes lg-spin-slow  { from { transform:rotate(0deg); }  to { transform:rotate(360deg); } }
@keyframes lg-spin-rev   { from { transform:rotate(0deg); }  to { transform:rotate(-360deg); } }
@keyframes lg-blink      { 0%,100%{ opacity:1; } 50%{ opacity:0.2; } }
@keyframes lg-live-ring  {
  0%   { transform:scale(1);   opacity:0.5; }
  70%  { transform:scale(2.2); opacity:0; }
  100% { transform:scale(2.2); opacity:0; }
}
@keyframes lg-blob-morph {
  0%,100% { border-radius:60% 40% 30% 70% / 60% 30% 70% 40%; }
  33%      { border-radius:30% 70% 60% 40% / 50% 60% 30% 60%; }
  66%      { border-radius:50% 30% 70% 40% / 40% 70% 30% 60%; }
}
@keyframes lg-shine      { from { left:-80%; } to { left:130%; } }
@keyframes lg-ripple-out { from { transform:scale(0); opacity:0.35; } to { transform:scale(3.5); opacity:0; } }
@keyframes lg-orbit {
  from { transform:rotate(0deg) translateX(44px) rotate(0deg); }
  to   { transform:rotate(360deg) translateX(44px) rotate(-360deg); }
}
@keyframes lg-underline {
  from { transform:scaleX(0); transform-origin:left; }
  to   { transform:scaleX(1); transform-origin:left; }
}
@keyframes lg-float {
  0%,100% { transform:translateY(0); }
  50%      { transform:translateY(-8px); }
}
@keyframes lg-pulse-ring {
  0%   { transform:scale(0.85); opacity:0.6; }
  70%  { transform:scale(1.7);  opacity:0; }
  100% { transform:scale(1.7);  opacity:0; }
}

.lg-section-enter { animation:lg-card-in 0.65s var(--ease-expo) both; }

/* Shine */
.lg-shine { position:relative; overflow:hidden; }
.lg-shine::before {
  content:''; position:absolute; top:-50%; left:-80%;
  width:50%; height:200%;
  background:linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.5) 50%,transparent 70%);
  transform:skewX(-20deg); pointer-events:none; z-index:2;
}
.lg-shine:hover::before { animation:lg-shine 0.5s ease forwards; }

/* Ripple */
.lg-ripple { position:relative; overflow:hidden; }
.lg-ripple-circle {
  position:absolute; border-radius:50%;
  background:rgba(255,255,255,0.28);
  transform:scale(0);
  animation:lg-ripple-out 0.6s linear forwards;
  pointer-events:none;
}

/* Blob */
.lg-blob {
  border-radius:60% 40% 30% 70% / 60% 30% 70% 40%;
  animation:lg-blob-morph 10s ease-in-out infinite;
  position:absolute; pointer-events:none;
}

/* Input */
.lg-input {
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
  transition:border-color 0.2s, box-shadow 0.2s;
}
.lg-input::placeholder { color:var(--ink-faint); }
.lg-input:focus {
  border-color:var(--accent);
  box-shadow:0 0 0 3px var(--accent-dim);
}

/* Stagger for form elements */
.lg-stagger > *:nth-child(1) { animation:lg-fade-up 0.5s var(--ease-expo) 0.08s both; }
.lg-stagger > *:nth-child(2) { animation:lg-fade-up 0.5s var(--ease-expo) 0.15s both; }
.lg-stagger > *:nth-child(3) { animation:lg-fade-up 0.5s var(--ease-expo) 0.22s both; }
.lg-stagger > *:nth-child(4) { animation:lg-fade-up 0.5s var(--ease-expo) 0.29s both; }
.lg-stagger > *:nth-child(5) { animation:lg-fade-up 0.5s var(--ease-expo) 0.36s both; }
`;

function LoginStyleInjector() {
  useEffect(() => {
    if (document.getElementById('lg-v2-styles')) return;
    const el = document.createElement('style');
    el.id = 'lg-v2-styles';
    el.textContent = LOGIN_STYLES;
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
    circle.className = 'lg-ripple-circle';
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
function useTilt(strength = 5) {
  const ref = useRef(null);
  const onMove = useCallback((e) => {
    const el = ref.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width/2)  / (rect.width/2);
    const dy = (e.clientY - rect.top  - rect.height/2) / (rect.height/2);
    el.style.transform = `perspective(800px) rotateY(${dx*strength}deg) rotateX(${-dy*strength}deg)`;
    el.style.boxShadow = `${-dx*8}px ${dy*8}px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.9)`;
  }, [strength]);
  const onLeave = useCallback(() => {
    const el = ref.current; if (!el) return;
    el.style.transform = ''; el.style.boxShadow = '';
  }, []);
  return { ref, onMouseMove: onMove, onMouseLeave: onLeave };
}

/* ═══════════════════════════════════════════════════════════════
   MAIN LOGIN PAGE
═══════════════════════════════════════════════════════════════ */
export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading]         = useState(false);
  const [loginType, setLoginType]     = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData]       = useState({ mobile:'', password:'' });
  const [focused, setFocused]         = useState(null);
  const [mounted, setMounted]         = useState(false);
  const isReloadRef = useRef(false);
  const DRAFT_COOKIE_KEY = 'loginDraft';

  const ripple = useRipple();
  const { ref: cardRef, onMouseMove: cardMove, onMouseLeave: cardLeave } = useTilt(3);

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
    const handleBeforeUnload = () => sessionStorage.setItem('loginIsReload','1');
    window.addEventListener('beforeunload', handleBeforeUnload);
    setTimeout(() => setMounted(true), 50);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      const isReload = sessionStorage.getItem('loginIsReload') === '1';
      if (isReload) { isReloadRef.current = true; sessionStorage.removeItem('loginIsReload'); }
      if (!isReload) deleteCookie(DRAFT_COOKIE_KEY);
    };
  }, []);

  useEffect(() => {
    setCookie(DRAFT_COOKIE_KEY, JSON.stringify({ formData, loginType }), 7);
  }, [formData, loginType]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { profile } = await authService.login(formData.mobile, formData.password, loginType);
      login(profile);
      toast.success('Login successful!');
      deleteCookie(DRAFT_COOKIE_KEY);
      router.push(profile.is_first_login ? '/account?forceChange=true' : '/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed');
      setLoading(false);
    }
  }

  const isReady = formData.mobile.length === 10 && formData.password.length > 0;

  return (
    <>
      <LoginStyleInjector />
      <div
        className="lg-font-body"
        style={{
          minHeight:'100vh', position:'relative', overflow:'hidden',
          display:'flex', alignItems:'center', justifyContent:'center',
          padding:'1rem',
          /* Same surface bg as all pages */
          backgroundColor:'var(--surface)',
        }}
      >
        {/* ── Background ambient blobs — matching dashboard ── */}
        <div className="lg-blob" style={{ width:320, height:320, background:'var(--accent)', opacity:0.06, top:-80, left:-80, animation:'lg-blob-morph 12s ease-in-out infinite, lg-float 6s ease-in-out infinite' }} />
        <div className="lg-blob" style={{ width:240, height:240, background:'var(--accent)', opacity:0.04, top:'5%', right:-60, animationDelay:'3s', animation:'lg-blob-morph 14s ease-in-out 3s infinite, lg-float 7s ease-in-out 1s infinite' }} />
        <div className="lg-blob" style={{ width:200, height:200, background:'var(--accent)', opacity:0.03, bottom:-40, left:'25%', animationDelay:'6s', animation:'lg-blob-morph 11s ease-in-out 6s infinite, lg-float 8s ease-in-out 2s infinite' }} />

        {/* ── Decorative spinning rings (page-level, same as dashboard) ── */}
        <div style={{ position:'absolute', top:32, right:32, width:80, height:80, animation:'lg-spin-slow 22s linear infinite', pointerEvents:'none' }}>
          <div style={{ width:'100%', height:'100%', borderRadius:'50%', border:'1px dashed rgba(249,115,22,0.15)' }} />
        </div>
        <div style={{ position:'absolute', top:42, right:42, width:48, height:48, animation:'lg-spin-rev 11s linear infinite', pointerEvents:'none' }}>
          <div style={{ width:'100%', height:'100%', borderRadius:'50%', border:'1px solid rgba(249,115,22,0.08)' }} />
        </div>
        <div style={{ position:'absolute', bottom:32, left:32, width:64, height:64, animation:'lg-spin-slow 16s linear infinite', pointerEvents:'none' }}>
          <div style={{ width:'100%', height:'100%', borderRadius:'50%', border:'1px dashed rgba(249,115,22,0.12)' }} />
        </div>
        {/* Orbiting dot */}
        <div style={{ position:'absolute', top:50, right:50, pointerEvents:'none' }}>
          <div style={{ width:5, height:5, borderRadius:'50%', background:'var(--accent)', opacity:0.5, animation:'lg-orbit 10s linear infinite' }} />
        </div>

        {/* ══════════════════ CARD ══════════════════ */}
        <div
          ref={cardRef}
          onMouseMove={cardMove}
          onMouseLeave={cardLeave}
          className={mounted ? 'lg-section-enter' : ''}
          style={{
            width:'100%', maxWidth:420, position:'relative',
            borderRadius:'1.75rem',
            background:'var(--surface-raise)',
            border:'1px solid var(--border)',
            boxShadow:'0 24px 64px -16px rgba(0,0,0,0.14), 0 0 0 1px rgba(255,255,255,0.9)',
            overflow:'hidden',
            willChange:'transform',
            transition:'box-shadow 0.3s ease',
          }}
        >
          {/* ── Dark hero banner — identical to all page headers ── */}
          <div style={{ background:'linear-gradient(135deg,#0d0d0d 0%,#181818 60%,#0d0d0d 100%)', padding:'1.75rem', position:'relative', overflow:'hidden' }}>
            {/* Morphing blobs inside banner */}
            <div className="lg-blob" style={{ width:200, height:200, background:'var(--accent)', opacity:0.07, top:-50, right:-30 }} />
            <div className="lg-blob" style={{ width:130, height:130, background:'var(--accent)', opacity:0.04, bottom:-35, left:'15%', animationDelay:'4s' }} />

            {/* Spinning rings inside banner */}
            <div style={{ position:'absolute', right:24, top:24, width:72, height:72, animation:'lg-spin-slow 18s linear infinite', pointerEvents:'none' }}>
              <div style={{ width:'100%', height:'100%', borderRadius:'50%', border:'1px dashed rgba(249,115,22,0.2)' }} />
            </div>
            <div style={{ position:'absolute', right:31, top:31, width:44, height:44, animation:'lg-spin-rev 8s linear infinite', pointerEvents:'none' }}>
              <div style={{ width:'100%', height:'100%', borderRadius:'50%', border:'1px solid rgba(249,115,22,0.12)' }} />
            </div>
            {/* Orbiting dot */}
            <div style={{ position:'absolute', right:40, top:40, pointerEvents:'none' }}>
              <div style={{ width:5, height:5, borderRadius:'50%', background:'var(--accent)', opacity:0.7, animation:'lg-orbit 8s linear infinite' }} />
            </div>

            {/* Corner accent line — same as all page headers */}
            <div style={{ position:'absolute', top:0, left:'8%', width:90, height:2, background:'linear-gradient(90deg,var(--accent),transparent)', opacity:0.6 }} />

            <div style={{ position:'relative', display:'flex', alignItems:'center', gap:'1.125rem' }}>
              {/* Logo icon with pulse ring */}
              <div style={{ position:'relative', flexShrink:0 }}>
                <div style={{
                  width:56, height:56, borderRadius:'1rem',
                  background:'linear-gradient(135deg,var(--accent),#c2410c)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  boxShadow:'0 8px 28px rgba(249,115,22,0.4)',
                }}>
                  <Smartphone style={{ width:26, height:26, color:'#fff' }} strokeWidth={2} />
                </div>
                {/* Pulse ring */}
                <div style={{ position:'absolute', inset:0, borderRadius:'1rem', background:'rgba(249,115,22,0.35)', animation:'lg-pulse-ring 2.5s cubic-bezier(0.215,0.61,0.355,1) infinite' }} />
                {/* Live dot */}
                <span style={{ position:'absolute', top:-3, right:-3, width:14, height:14, borderRadius:'50%', background:'#22c55e', border:'2.5px solid #0d0d0d', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ width:5, height:5, borderRadius:'50%', background:'#fff', animation:'lg-blink 2s ease-in-out infinite', display:'inline-block' }} />
                </span>
              </div>

              <div>
                <p style={{ fontSize:'0.625rem', fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:'rgba(255,255,255,0.28)', marginBottom:'0.35rem' }}>
                  Welcome back
                </p>
                <h1 className="lg-font-display" style={{ fontSize:'clamp(1.5rem,3.5vw,2rem)', fontWeight:400, lineHeight:1.1, color:'rgba(255,255,255,0.94)', fontStyle:'italic', marginBottom:'0.4rem' }}>
                  Orange <span style={{ color:'var(--accent)' }}>Mobile</span>
                </h1>
                {/* Animated underline */}
                <div style={{ height:2, width:48, background:'var(--accent)', animation:'lg-underline 0.8s var(--ease-expo) 0.4s both', borderRadius:2 }} />
                <p style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.3)', marginTop:'0.5rem', fontWeight:400 }}>
                  Sign in to your workspace
                </p>
              </div>
            </div>
          </div>

          {/* ── Form body ── */}
          <div style={{ padding:'1.75rem', display:'flex', flexDirection:'column', gap:'1.25rem' }} className="lg-stagger">

            {/* Role tabs */}
            <div>
              <p style={{ fontSize:'0.625rem', fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-faint)', marginBottom:'0.625rem' }}>
                Login as
              </p>
              <div style={{ display:'flex', gap:'0.625rem' }}>
                {[
                  { key:'admin',    label:'Admin',    Icon:UserCircle, dotColor:'var(--accent)' },
                  { key:'employee', label:'Employee', Icon:Users,      dotColor:'#8b5cf6' },
                ].map(tab => {
                  const active = loginType === tab.key;
                  const rippleFn = useRipple();
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={(e) => { rippleFn(e); setLoginType(tab.key); }}
                      className="lg-ripple lg-shine"
                      style={{
                        flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem',
                        padding:'0.75rem', borderRadius:'0.875rem', cursor:'pointer',
                        fontSize:'0.875rem', fontWeight:700,
                        border:`1.5px solid ${active ? (tab.dotColor === 'var(--accent)' ? 'rgba(249,115,22,0.4)' : '#8b5cf640') : 'var(--border)'}`,
                        background: active ? (tab.dotColor === 'var(--accent)' ? 'var(--accent-dim)' : 'rgba(139,92,246,0.1)') : 'var(--surface)',
                        color: active ? (tab.dotColor === 'var(--accent)' ? 'var(--accent)' : '#8b5cf6') : 'var(--ink-faint)',
                        transition:'all 0.2s',
                        boxShadow: active ? `0 4px 16px ${tab.dotColor === 'var(--accent)' ? 'rgba(249,115,22,0.18)' : 'rgba(139,92,246,0.15)'}` : 'none',
                      }}
                    >
                      <tab.Icon style={{ width:15, height:15 }} strokeWidth={2} />
                      {tab.label}
                      {active && (
                        <span style={{ width:5, height:5, borderRadius:'50%', background: tab.dotColor === 'var(--accent)' ? 'var(--accent)' : '#8b5cf6', display:'inline-block', animation:'lg-blink 2s ease-in-out infinite' }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile input */}
            <div style={{ display:'flex', flexDirection:'column', gap:'0.375rem' }}>
              <label style={{ fontSize:'0.625rem', fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-faint)' }}>
                Mobile Number
              </label>
              <div style={{ position:'relative' }}>
                <div style={{
                  position:'absolute', left:'0.875rem', top:'50%', transform:'translateY(-50%)',
                  width:20, height:20, borderRadius:'0.375rem', display:'flex', alignItems:'center', justifyContent:'center',
                  background: focused === 'mobile' ? 'var(--accent-dim)' : 'var(--surface)',
                  transition:'background 0.2s',
                }}>
                  <Smartphone style={{ width:11, height:11, color: focused === 'mobile' ? 'var(--accent)' : 'var(--ink-faint)', transition:'color 0.2s' }} strokeWidth={2.5} />
                </div>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  className="lg-input"
                  placeholder="10-digit mobile number"
                  value={formData.mobile}
                  onFocus={() => setFocused('mobile')}
                  onBlur={() => setFocused(null)}
                  onChange={e => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g,'') })}
                  style={{ paddingRight: formData.mobile.length > 0 ? '3.5rem' : '0.875rem' }}
                />
                {formData.mobile.length > 0 && (
                  <span style={{
                    position:'absolute', right:'0.875rem', top:'50%', transform:'translateY(-50%)',
                    fontSize:'0.6875rem', fontWeight:700,
                    color: formData.mobile.length === 10 ? '#22c55e' : 'var(--border-strong)',
                    transition:'color 0.2s',
                  }}>
                    {formData.mobile.length}/10
                  </span>
                )}
              </div>
            </div>

            {/* Password input */}
            <div style={{ display:'flex', flexDirection:'column', gap:'0.375rem' }}>
              <label style={{ fontSize:'0.625rem', fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-faint)' }}>
                Password
              </label>
              <div style={{ position:'relative' }}>
                <div style={{
                  position:'absolute', left:'0.875rem', top:'50%', transform:'translateY(-50%)',
                  width:20, height:20, borderRadius:'0.375rem', display:'flex', alignItems:'center', justifyContent:'center',
                  background: focused === 'password' ? 'var(--accent-dim)' : 'var(--surface)',
                  transition:'background 0.2s',
                }}>
                  <Lock style={{ width:11, height:11, color: focused === 'password' ? 'var(--accent)' : 'var(--ink-faint)', transition:'color 0.2s' }} strokeWidth={2.5} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="lg-input"
                  placeholder="Enter your password"
                  value={formData.password}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  style={{ paddingRight:'3rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    position:'absolute', right:'0.75rem', top:'50%', transform:'translateY(-50%)',
                    width:28, height:28, borderRadius:'0.5rem', border:'none', cursor:'pointer',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    background:'var(--surface)', transition:'background 0.2s',
                  }}
                >
                  {showPassword
                    ? <EyeOff style={{ width:14, height:14, color:'var(--ink-faint)' }} />
                    : <Eye    style={{ width:14, height:14, color:'var(--ink-faint)' }} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <SignInBtn isReady={isReady} loading={loading} onSubmit={handleLogin} />

            {/* Footer */}
            <p style={{ textAlign:'center', fontSize:'0.6875rem', fontWeight:500, color:'var(--ink-faint)' }}>
              Orange Mobile · Point of Sale System
            </p>
          </div>

          {/* Bottom accent line */}
          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:'linear-gradient(90deg, transparent, rgba(249,115,22,0.3), transparent)' }} />
        </div>
      </div>
    </>
  );
}

/* ── Sign In Button ── */
function SignInBtn({ isReady, loading, onSubmit }) {
  const ripple = useRipple();
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      disabled={loading || !isReady}
      onClick={(e) => { ripple(e); onSubmit(e); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="lg-ripple lg-shine"
      style={{
        width:'100%', padding:'1rem', borderRadius:'1.125rem',
        fontSize:'0.9375rem', fontWeight:700,
        cursor:(loading||!isReady)?'not-allowed':'pointer',
        background: isReady ? 'var(--ink)' : 'var(--surface)',
        color: isReady ? '#fff' : 'var(--ink-faint)',
        border:`1.5px solid ${isReady ? (hovered?'var(--accent)':'var(--ink)') : 'var(--border)'}`,
        boxShadow: isReady ? (hovered?'0 10px 32px rgba(0,0,0,0.25)':'0 4px 16px rgba(0,0,0,0.15)') : 'none',
        transition:'all 0.2s',
        transform: hovered&&isReady&&!loading ? 'translateY(-1px)' : 'translateY(0)',
        opacity: loading ? 0.7 : 1,
        display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem',
      }}
    >
      {loading ? (
        <>
          <div style={{ width:16, height:16, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', animation:'lg-spin-slow 0.7s linear infinite' }} />
          Signing in…
        </>
      ) : (
        <>
          <Zap style={{ width:16, height:16, color: isReady ? 'var(--accent)' : 'var(--ink-faint)' }} strokeWidth={2.5} />
          Sign In
          <ArrowRight style={{ width:15, height:15, color: isReady ? (hovered?'var(--accent)':'rgba(255,255,255,0.6)') : 'var(--ink-faint)', transform:hovered&&isReady?'translateX(2px)':'translateX(0)', transition:'transform 0.2s, color 0.2s' }} />
        </>
      )}
    </button>
  );
}
