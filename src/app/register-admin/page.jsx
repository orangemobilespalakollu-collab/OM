'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { getCookie, setCookie, deleteCookie } from '@/lib/utils';
import { toast } from 'sonner';
import { Smartphone, Lock, User, ShieldCheck, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

const REG_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

.reg-font    { font-family: 'DM Sans', sans-serif; }
.reg-display { font-family: 'Syne', sans-serif; }

.reg-bg {
  min-height: 100vh;
  background-color: #0f0f10;
  background-image:
    radial-gradient(at 20% 20%, rgba(249,115,22,0.18) 0px, transparent 55%),
    radial-gradient(at 80% 10%, rgba(168,85,247,0.14) 0px, transparent 50%),
    radial-gradient(at 10% 80%, rgba(59,130,246,0.10) 0px, transparent 50%),
    radial-gradient(at 85% 80%, rgba(249,115,22,0.08) 0px, transparent 45%);
}

.reg-card {
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.10);
  border-radius: 1.75rem;
}

.reg-inner {
  background: #ffffff;
  border-radius: 1.5rem;
  overflow: hidden;
}

@keyframes reg-float {
  0%,100% { transform: translateY(0px) rotate(0deg); }
  33%      { transform: translateY(-8px) rotate(1deg); }
  66%      { transform: translateY(-4px) rotate(-1deg); }
}
@keyframes reg-slide-up {
  from { opacity:0; transform:translateY(24px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes reg-shimmer {
  0%   { background-position: -300% center; }
  100% { background-position:  300% center; }
}
@keyframes reg-spin {
  to { transform: rotate(360deg); }
}
@keyframes reg-pulse {
  0%,100% { opacity:1; transform:scale(1); }
  50%     { opacity:0.7; transform:scale(0.95); }
}

.reg-float   { animation: reg-float 4s ease-in-out infinite; }
.reg-slide-up{ animation: reg-slide-up 0.5s cubic-bezier(.22,1,.36,1) forwards; }

.reg-shimmer-text {
  background: linear-gradient(90deg, #f97316, #a855f7, #3b82f6, #f97316);
  background-size: 300% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: reg-shimmer 4s linear infinite;
}

.reg-input {
  width: 100%;
  border-radius: 0.75rem;
  border: 1.5px solid #e5e7eb;
  padding: 0.75rem 0.875rem 0.75rem 2.75rem;
  font-size: 0.875rem;
  font-family: 'DM Sans', sans-serif;
  background: #fafafa;
  color: #111827;
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
  outline: none;
}
.reg-input:focus {
  border-color: #f97316;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(249,115,22,0.12);
}
.reg-input::placeholder { color: #9ca3af; }

.reg-input-valid {
  border-color: #10b981 !important;
  box-shadow: 0 0 0 3px rgba(16,185,129,0.10) !important;
}

.reg-btn {
  width: 100%;
  border-radius: 0.875rem;
  padding: 0.875rem;
  font-size: 0.9375rem;
  font-weight: 700;
  font-family: 'DM Sans', sans-serif;
  color: white;
  background: linear-gradient(135deg, #f97316, #ea580c);
  box-shadow: 0 8px 24px rgba(249,115,22,0.30);
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}
.reg-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #fb923c, #f97316);
  box-shadow: 0 12px 28px rgba(249,115,22,0.38);
  transform: translateY(-1px);
}
.reg-btn:active:not(:disabled) { transform: scale(0.98); }
.reg-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; box-shadow: none; }

.reg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(50px);
  pointer-events: none;
}

.strength-bar {
  height: 3px;
  border-radius: 9999px;
  transition: width 0.3s ease, background-color 0.3s ease;
}
`;

function RegStyleInjector() {
  useEffect(() => {
    if (document.getElementById('reg-styles')) return;
    const el = document.createElement('style');
    el.id = 'reg-styles';
    el.textContent = REG_STYLES;
    document.head.appendChild(el);
  }, []);
  return null;
}

function getPasswordStrength(pwd) {
  if (!pwd) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pwd.length >= 6)  score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { score, label: 'Weak',   color: '#ef4444', pct: 20 };
  if (score <= 2) return { score, label: 'Fair',   color: '#f59e0b', pct: 40 };
  if (score <= 3) return { score, label: 'Good',   color: '#3b82f6', pct: 65 };
  if (score <= 4) return { score, label: 'Strong', color: '#10b981', pct: 85 };
  return { score, label: 'Very Strong', color: '#059669', pct: 100 };
}

import { useAuth } from '@/components/AuthProvider';

export default function RegisterAdminPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const DRAFT_COOKIE_KEY = 'registerAdminDraft';
  const [formData, setFormData] = useState({ name: '', mobile: '', password: '', confirmPassword: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const isReloadRef = useRef(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  const strength = getPasswordStrength(formData.password);
  const pwdMatch = formData.confirmPassword && formData.password === formData.confirmPassword;
  const pwdMismatch = formData.confirmPassword && formData.password !== formData.confirmPassword;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const draft = getCookie(DRAFT_COOKIE_KEY);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed?.formData) setFormData(prev => ({ ...prev, ...parsed.formData }));
      } catch {}
    }
    const handler = () => sessionStorage.setItem('registerAdminIsReload', '1');
    window.addEventListener('beforeunload', handler);
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
      <div className="reg-font reg-bg flex min-h-screen flex-col items-center justify-center p-4">

        {/* floating decorative orbs */}
        <div className="reg-orb w-72 h-72 bg-orange-500/20" style={{ top: '-60px', left: '-60px' }} />
        <div className="reg-orb w-56 h-56 bg-purple-500/18" style={{ top: '10%', right: '-40px' }} />
        <div className="reg-orb w-48 h-48 bg-blue-500/15" style={{ bottom: '5%', left: '5%' }} />
        <div className="reg-orb w-40 h-40 bg-orange-400/12" style={{ bottom: '-30px', right: '10%' }} />

        <div className="relative w-full max-w-md reg-slide-up">

          {/* ── Icon Badge ── */}
          <div className="flex justify-center mb-6">
            <div className="reg-float relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-2xl"
                style={{ background: 'linear-gradient(135deg, #f97316, #a855f7)', boxShadow: '0 16px 40px rgba(249,115,22,0.4)' }}>
                <ShieldCheck className="h-8 w-8 text-white" strokeWidth={2} />
              </div>
              {/* glow ring */}
              <div className="absolute inset-0 rounded-2xl" style={{ background: 'linear-gradient(135deg, #f97316, #a855f7)', opacity: 0.3, filter: 'blur(12px)', zIndex: -1 }} />
            </div>
          </div>

          {/* ── Heading ── */}
          <div className="text-center mb-8">
            <h1 className="reg-display text-3xl font-bold text-white mb-2">
              Initial <span className="reg-shimmer-text">Setup</span>
            </h1>
            <p className="text-sm text-white/40 font-medium">Create the first administrator account</p>
          </div>

          {/* ── Form Card ── */}
          <div className="reg-inner shadow-2xl" style={{ boxShadow: '0 32px 64px rgba(0,0,0,0.5)' }}>

            {/* card top accent */}
            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #f97316, #a855f7, #3b82f6)' }} />

            <div className="p-7 space-y-5">

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text" required placeholder="Admin Name"
                    className={`reg-input ${formData.name.length > 1 ? 'reg-input-valid' : ''}`}
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                  {formData.name.length > 1 && (
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                  )}
                </div>
              </div>

              {/* Mobile */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Mobile Number</label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel" required maxLength={10} placeholder="10-digit mobile"
                    className={`reg-input ${formData.mobile.length === 10 ? 'reg-input-valid' : ''}`}
                    value={formData.mobile}
                    onChange={e => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                  />
                  {formData.mobile.length === 10 && (
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showPwd ? 'text' : 'password'} required placeholder="Min. 6 characters"
                    className="reg-input pr-10"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button type="button" onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {/* Strength bar */}
                {formData.password && (
                  <div className="space-y-1 pt-1">
                    <div className="flex gap-1">
                      {[20,40,65,85,100].map((pct, i) => (
                        <div key={i} className="flex-1 rounded-full bg-gray-100 overflow-hidden" style={{ height: '3px' }}>
                          <div className="strength-bar h-full"
                            style={{
                              width: strength.pct >= pct ? '100%' : '0%',
                              backgroundColor: strength.color,
                            }} />
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] font-bold" style={{ color: strength.color }}>{strength.label}</p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showConfirm ? 'text' : 'password'} required placeholder="Re-enter password"
                    className={`reg-input pr-10 ${pwdMatch ? 'reg-input-valid' : ''}`}
                    style={pwdMismatch ? { borderColor:'#ef4444', boxShadow:'0 0 0 3px rgba(239,68,68,0.10)' } : {}}
                    value={formData.confirmPassword}
                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                  <button type="button" onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {pwdMismatch && (
                  <p className="text-[10px] font-bold text-red-500">Passwords do not match</p>
                )}
                {pwdMatch && (
                  <p className="text-[10px] font-bold text-emerald-500">✓ Passwords match</p>
                )}
              </div>

              {/* Submit */}
              <div className="pt-1">
                <button type="submit" disabled={loading} className="reg-btn" onClick={handleRegister}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent"
                        style={{ animation: 'reg-spin 0.7s linear infinite' }} />
                      Registering…
                    </span>
                  ) : 'Register Admin Account'}
                </button>
              </div>

              {/* Footer note */}
              <p className="text-center text-[11px] text-gray-400 pt-1">
                This account will have full administrative access.
              </p>
            </div>
          </div>

          {/* bottom note */}
          <p className="text-center text-xs text-white/20 mt-6">
            Already have an account?{' '}
            <button onClick={() => router.push('/login')} className="text-white/40 hover:text-white/70 transition font-semibold underline underline-offset-2">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </>
  );
}
