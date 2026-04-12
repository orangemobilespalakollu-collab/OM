'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { authService } from '@/services/authService';
import { getCookie, setCookie, deleteCookie } from '@/lib/utils';
import { toast } from 'sonner';
import { Smartphone, Lock, UserCircle, Users, Eye, EyeOff, Zap, ArrowRight } from 'lucide-react';

/* ─── Styles — same token system as dashboard ─── */
const LOGIN_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-7px); }
}
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes slide-up {
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes scale-in {
  from { opacity: 0; transform: scale(0.93); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes blink {
  0%,100% { opacity: 1; }
  50%      { opacity: 0.25; }
}
@keyframes pulse-ring {
  0%   { transform: scale(0.85); opacity: 0.6; }
  70%  { transform: scale(1.6);  opacity: 0; }
  100% { transform: scale(1.6);  opacity: 0; }
}

.lg-slide-up  { animation: slide-up 0.5s ease forwards; }
.lg-scale-in  { animation: scale-in 0.4s cubic-bezier(.34,1.56,.64,1) forwards; }
.lg-float     { animation: float 3.5s ease-in-out infinite; }
.lg-spin      { animation: spin-slow 10s linear infinite; }
.lg-spin-rev  { animation: spin-slow 7s linear infinite reverse; }
.lg-blink     { animation: blink 2s ease-in-out infinite; }

.lg-shimmer-text {
  background: linear-gradient(90deg, #f97316, #a855f7, #3b82f6, #f97316);
  background-size: 300% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 4s linear infinite;
}

.lg-mesh-bg {
  background-color: #fafafa;
  background-image:
    radial-gradient(at 15% 15%, rgba(249,115,22,0.10) 0px, transparent 50%),
    radial-gradient(at 85% 5%,  rgba(168,85,247,0.08) 0px, transparent 50%),
    radial-gradient(at 5%  80%, rgba(59,130,246,0.07) 0px, transparent 50%),
    radial-gradient(at 90% 85%, rgba(34,197,94,0.05)  0px, transparent 50%);
}

.lg-glass {
  background: rgba(255,255,255,0.75);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255,255,255,0.95);
}

.lg-orb {
  border-radius: 50%;
  filter: blur(50px);
  position: absolute;
  pointer-events: none;
}

.lg-card-hover {
  transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), box-shadow 0.25s ease;
}
.lg-card-hover:hover:not(:disabled) {
  transform: translateY(-3px) scale(1.01);
  box-shadow: 0 20px 40px -10px rgba(0,0,0,0.11);
}

.lg-input {
  width: 100%;
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 14px;
  padding: 12px 14px 12px 44px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.lg-input::placeholder { color: #9ca3af; }
.lg-input:focus {
  border-color: #f97316;
  box-shadow: 0 0 0 3px rgba(249,115,22,0.12);
}

.lg-font      { font-family: 'DM Sans', sans-serif; }
.display-font { font-family: 'Syne', sans-serif; }
`;

function LoginStyleInjector() {
  useEffect(() => {
    if (document.getElementById('login-styles')) return;
    const el = document.createElement('style');
    el.id = 'login-styles';
    el.textContent = LOGIN_STYLES;
    document.head.appendChild(el);
  }, []);
  return null;
}

export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ mobile: '', password: '' });
  const [focused, setFocused] = useState(null);
  const isReloadRef = useRef(false);
  const DRAFT_COOKIE_KEY = 'loginDraft';

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/dashboard');
    }
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
    const handleBeforeUnload = () => sessionStorage.setItem('loginIsReload', '1');
    window.addEventListener('beforeunload', handleBeforeUnload);
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
      <div className="lg-font lg-mesh-bg relative min-h-screen flex items-center justify-center overflow-hidden p-4">

        {/* ── ambient orbs — identical to dashboard ── */}
        <div className="lg-orb w-80 h-80 bg-orange-400/15 lg-float" style={{ top: '-60px', left: '-60px' }} />
        <div className="lg-orb w-64 h-64 bg-purple-500/12 lg-float" style={{ top: '5%', right: '-40px', animationDelay: '1s' }} />
        <div className="lg-orb w-56 h-56 bg-blue-400/10 lg-float" style={{ bottom: '-40px', left: '20%', animationDelay: '2s' }} />
        <div className="lg-orb w-40 h-40 bg-green-400/08 lg-float" style={{ bottom: '10%', right: '5%', animationDelay: '0.5s' }} />

        {/* ── decorative spinning rings ── */}
        <div className="absolute top-8 right-8 h-24 w-24 rounded-full border-2 border-dashed border-orange-200/60 lg-spin hidden sm:block" />
        <div className="absolute top-14 right-14 h-10 w-10 rounded-full border border-purple-300/40 lg-spin-rev hidden sm:block" />
        <div className="absolute bottom-10 left-10 h-16 w-16 rounded-full border border-dashed border-blue-200/50 lg-spin hidden sm:block" style={{ animationDuration: '14s' }} />

        {/* ── Card ── */}
        <div className="lg-glass lg-scale-in relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
          style={{ boxShadow: '0 32px 80px -12px rgba(0,0,0,0.13), 0 0 0 1px rgba(255,255,255,0.9)' }}>

          {/* top gradient accent line */}
          <div className="absolute top-0 left-0 right-0 h-0.5 z-10"
            style={{ background: 'linear-gradient(90deg, #f97316, #a855f7, #3b82f6, transparent)' }} />

          {/* ── Dark hero banner — same as dashboard header ── */}
          <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-8 pt-8 pb-10">
            {/* inner orbs */}
            <div className="lg-orb w-48 h-48 bg-orange-500/20" style={{ top: '-40px', left: '-30px', filter: 'blur(35px)' }} />
            <div className="lg-orb w-36 h-36 bg-purple-500/18" style={{ bottom: '-20px', right: '10px', filter: 'blur(30px)' }} />
            {/* grid texture */}
            <div className="absolute inset-0 opacity-[0.04]"
              style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
            {/* spinning rings inside banner */}
            <div className="absolute right-5 top-5 h-16 w-16 rounded-full border-2 border-dashed border-white/10 lg-spin" />
            <div className="absolute right-9 top-9 h-8 w-8 rounded-full border border-orange-400/30 lg-spin-rev" />

            <div className="relative flex items-center gap-5">
              {/* logo icon */}
              <div className="relative shrink-0">
                <div className="h-14 w-14 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', boxShadow: '0 8px 28px rgba(249,115,22,0.45)' }}>
                  <Smartphone className="h-7 w-7 text-white" strokeWidth={2} />
                </div>
                {/* pulse ring */}
                <div className="absolute inset-0 rounded-2xl"
                  style={{ backgroundColor: 'rgba(249,115,22,0.35)', animation: 'pulse-ring 2.5s cubic-bezier(0.215,0.61,0.355,1) infinite' }} />
                {/* live dot */}
                <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-400 border-2 border-gray-900 flex items-center justify-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-white lg-blink" />
                </div>
              </div>

              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-white/35 mb-0.5">Welcome back</p>
                <h1 className="display-font text-2xl font-bold text-white">
                  Orange <span className="lg-shimmer-text">Mobile</span>
                </h1>
                <p className="text-xs text-white/40 mt-0.5 font-medium">Sign in to your workspace</p>
              </div>
            </div>
          </div>

          {/* ── Form body ── */}
          <div className="px-8 pb-8 pt-7 space-y-6">

            {/* Role tabs — same style as dashboard quick actions */}
            <div className="lg-slide-up" style={{ animationDelay: '0.07s' }}>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-2.5">Login as</p>
              <div className="flex gap-2.5">
                {[
                  { key: 'admin',    label: 'Admin',    Icon: UserCircle, color: '#f97316', lightBg: '#fff7ed', border: '#fed7aa' },
                  { key: 'employee', label: 'Employee', Icon: Users,      color: '#a855f7', lightBg: '#faf5ff', border: '#e9d5ff' },
                ].map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setLoginType(tab.key)}
                    className="lg-card-hover flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 py-3 text-sm font-bold transition-all"
                    style={
                      loginType === tab.key
                        ? { borderColor: tab.border, backgroundColor: tab.lightBg, color: tab.color, boxShadow: `0 4px 16px ${tab.color}25` }
                        : { borderColor: '#e5e7eb', backgroundColor: '#f9fafb', color: '#9ca3af' }
                    }
                  >
                    <tab.Icon className="h-4 w-4" strokeWidth={2} />
                    {tab.label}
                    {loginType === tab.key && (
                      <span className="h-1.5 w-1.5 rounded-full lg-blink" style={{ backgroundColor: tab.color }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile input */}
            <div className="lg-slide-up space-y-1.5" style={{ animationDelay: '0.12s' }}>
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Mobile Number</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-md transition-all"
                  style={{ background: focused === 'mobile' ? 'rgba(249,115,22,0.15)' : '#f3f4f6' }}>
                  <Smartphone className="h-3 w-3 transition-colors"
                    style={{ color: focused === 'mobile' ? '#f97316' : '#9ca3af' }} strokeWidth={2.5} />
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
                  onChange={e => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                />
                {formData.mobile.length > 0 && (
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold tabular-nums transition-colors"
                    style={{ color: formData.mobile.length === 10 ? '#22c55e' : '#d1d5db' }}>
                    {formData.mobile.length}/10
                  </span>
                )}
              </div>
            </div>

            {/* Password input */}
            <div className="lg-slide-up space-y-1.5" style={{ animationDelay: '0.17s' }}>
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Password</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-md transition-all"
                  style={{ background: focused === 'password' ? 'rgba(249,115,22,0.15)' : '#f3f4f6' }}>
                  <Lock className="h-3 w-3 transition-colors"
                    style={{ color: focused === 'password' ? '#f97316' : '#9ca3af' }} strokeWidth={2.5} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="lg-input pr-12"
                  placeholder="Enter your password"
                  value={formData.password}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-xl transition-all hover:scale-110"
                  style={{ background: '#f3f4f6' }}
                >
                  {showPassword
                    ? <EyeOff className="h-3.5 w-3.5 text-gray-400" />
                    : <Eye className="h-3.5 w-3.5 text-gray-400" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <div className="lg-slide-up pt-1" style={{ animationDelay: '0.22s' }}>
              <button
                type="button"
                disabled={loading || !isReady}
                onClick={handleLogin}
                className="lg-card-hover w-full relative overflow-hidden rounded-2xl py-4 text-sm font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                style={{
                  background: isReady
                    ? 'linear-gradient(135deg,#f97316 0%,#ea580c 60%,#c2410c 100%)'
                    : '#e5e7eb',
                  color: isReady ? '#fff' : '#9ca3af',
                  boxShadow: isReady ? '0 8px 28px rgba(249,115,22,0.30)' : 'none',
                }}
              >
                {isReady && !loading && (
                  <div className="absolute inset-0 -skew-x-12 pointer-events-none"
                    style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)', animation: 'shimmer 2.5s linear infinite', backgroundSize: '200% auto' }} />
                )}
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white" style={{ animation: 'spin-slow 0.7s linear infinite' }} />
                      Signing in…
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" strokeWidth={2.5} />
                      Sign In
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </span>
              </button>
            </div>

            {/* Footer */}
            <p className="lg-slide-up text-center text-[11px] font-semibold text-gray-300" style={{ animationDelay: '0.27s' }}>
              Orange Mobile · Point of Sale System
            </p>
          </div>

          {/* bottom accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(249,115,22,0.25), rgba(168,85,247,0.18), transparent)' }} />
        </div>
      </div>
    </>
  );
}
