'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import {
  User,
  Smartphone,
  Shield,
  Lock,
  LogOut,
  ChevronRight,
  Eye,
  EyeOff,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageTransition, MagicalGrid, ScaleIn } from '@/components/MotionWrappers';

/* ─── Styles ─── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-6px); }
}
@keyframes slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes blink {
  0%,100% { opacity: 1; }
  50%      { opacity: 0.3; }
}
@keyframes count-in {
  from { opacity: 0; transform: scale(0.5); }
  to   { opacity: 1; transform: scale(1); }
}

.ac-slide-up   { animation: slide-up 0.45s ease forwards; }
.ac-float      { animation: float 3s ease-in-out infinite; }
.ac-spin-slow  { animation: spin-slow 8s linear infinite; }
.ac-blink      { animation: blink 2s ease-in-out infinite; }

.ac-shimmer-text {
  background: linear-gradient(90deg, #f97316, #a855f7, #3b82f6, #f97316);
  background-size: 300% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 4s linear infinite;
}

.ac-glass {
  background: rgba(255,255,255,0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.9);
}

.ac-mesh {
  background-color: transparent;

.ac-card-hover {
  transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), box-shadow 0.25s ease;
}
.ac-card-hover:hover {
  transform: translateY(-3px) scale(1.01);
  box-shadow: 0 16px 32px -8px rgba(0,0,0,0.10);
}

.ac-orb {
  border-radius: 50%;
  filter: blur(40px);
  position: absolute;
  pointer-events: none;
}

.ac-font   { font-family: 'DM Sans', sans-serif; }
.ac-display{ font-family: 'Syne', sans-serif; }

.ac-input {
  width: 100%;
  border-radius: 1rem;
  border: 2px solid #e5e7eb;
  background: #fff;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-family: 'DM Sans', sans-serif;
  font-weight: 500;
  color: #111827;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.ac-input:focus {
  border-color: #f97316;
  box-shadow: 0 0 0 3px rgba(249,115,22,0.12);
}

/* password strength bar */
.strength-bar {
  height: 4px;
  border-radius: 999px;
  transition: width 0.4s ease, background-color 0.4s ease;
}
`;

function StyleInjector() {
  if (typeof document !== 'undefined' && !document.getElementById('account-styles')) {
    const el = document.createElement('style');
    el.id = 'account-styles';
    el.textContent = STYLES;
    document.head.appendChild(el);
  }
  return null;
}

/* ─── Section Label ─── */
function SectionLabel({ icon: Icon, label }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-orange-400 to-purple-500 shadow-sm">
        <Icon className="h-3 w-3 text-white" strokeWidth={2.5} />
      </div>
      <h3 className="ac-font text-sm font-semibold text-gray-700">{label}</h3>
      <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
    </div>
  );
}

/* ─── Password strength helper ─── */
function getStrength(pwd) {
  if (!pwd) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pwd.length >= 6) score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { score, label: 'Weak', color: '#ef4444' };
  if (score <= 3) return { score, label: 'Fair', color: '#f59e0b' };
  if (score === 4) return { score, label: 'Good', color: '#3b82f6' };
  return { score, label: 'Strong', color: '#10b981' };
}

/* ─── Main Page ─── */
export default function AccountPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { profile, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState(
    searchParams.get('forceChange') === 'true' ? 'password' : 'info'
  );
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });

  const isForced = searchParams.get('forceChange') === 'true';
  const strength = getStrength(passwordData.new);

  async function handleLogout() {
    logout();
    router.push('/login');
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm)
      return toast.error('New passwords do not match');
    if (passwordData.current !== profile?.password)
      return toast.error('Current password is incorrect');

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ password: passwordData.new, is_first_login: false })
        .eq('id', profile?.id);
      if (error) throw error;
      toast.success('Password updated! Please login again.');
      handleLogout();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  const roleColor = {
    admin: { color: '#f97316', bg: '#fff7ed', border: '#fed7aa', label: 'Admin' },
    owner: { color: '#a855f7', bg: '#faf5ff', border: '#e9d5ff', label: 'Owner' },
    staff: { color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', label: 'Staff' },
  }[profile?.role] || { color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb', label: profile?.role };

  const initials = (profile?.full_name || profile?.name || '')
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <PageTransition>
      <StyleInjector />
      <div className="ac-mesh ac-font min-h-screen p-1">
        <div className="mx-auto max-w-xl space-y-8">

          {/* ── Hero Header ── */}
          <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-7 shadow-2xl">
            <div className="ac-orb w-56 h-56 bg-orange-500/20 -top-16 -left-16 ac-float" style={{ animationDelay: '0s' }} />
            <div className="ac-orb w-40 h-40 bg-purple-500/20 -bottom-10 right-8 ac-float" style={{ animationDelay: '1.2s' }} />
            <div className="absolute right-6 top-6 h-16 w-16 rounded-full border-2 border-dashed border-white/10 ac-spin-slow" />
            <div className="absolute right-9 top-9 h-10 w-10 rounded-full border border-orange-400/30 ac-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '5s' }} />

            <div className="relative flex items-center gap-5">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-purple-500 shadow-xl text-white ac-display text-2xl font-bold">
                  {initials}
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-400 border-2 border-gray-900">
                  <span className="h-2 w-2 rounded-full bg-white ac-blink" />
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40 mb-0.5">My Account</p>
                <h1 className="ac-display text-xl sm:text-2xl font-bold text-white truncate">
                  <span className="ac-shimmer-text">{profile?.full_name || profile?.name || 'User'}</span>
                </h1>
                <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest"
                  style={{ borderColor: roleColor.border, backgroundColor: roleColor.bg + 'cc', color: roleColor.color }}>
                  <Shield className="h-2.5 w-2.5" />
                  {roleColor.label}
                </div>
              </div>
            </div>
          </header>

          {view === 'info' ? (
            <div className="space-y-6 ac-slide-up">

              {/* ── Profile Info ── */}
              <section>
                <SectionLabel icon={User} label="Profile Information" />
                <div className="ac-glass rounded-3xl p-6 shadow-xl overflow-hidden relative space-y-3">
                  <div className="ac-orb w-36 h-36 bg-orange-400/08 -top-8 -right-8" />

                  {[
                    { label: 'Full Name', value: profile?.full_name || profile?.name || '—', icon: User, color: '#f97316', bg: '#fff7ed', border: '#fed7aa' },
                    { label: 'Mobile Number', value: profile?.mobile || '—', icon: Smartphone, color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
                    { label: 'Role', value: roleColor.label, icon: Shield, color: roleColor.color, bg: roleColor.bg, border: roleColor.border },
                  ].map((field, i) => (
                    <div
                      key={field.label}
                      className="relative flex items-center gap-4 rounded-2xl border-2 p-4"
                      style={{ borderColor: field.border, backgroundColor: field.bg + '80', animationDelay: `${i * 0.08}s` }}
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ backgroundColor: field.color }} />
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white shadow-sm"
                        style={{ backgroundColor: field.color + '18' }}>
                        <field.icon className="h-4 w-4" style={{ color: field.color }} strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-extrabold uppercase tracking-widest mb-0.5" style={{ color: field.color + 'bb' }}>{field.label}</p>
                        <p className="ac-display text-sm font-bold text-gray-900 truncate">{field.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* ── Actions ── */}
              <section>
                <SectionLabel icon={Sparkles} label="Account Actions" />
                <div className="space-y-3">

                  {/* Change Password */}
                  <button
                    onClick={() => setView('password')}
                    className="ac-card-hover group relative w-full flex items-center gap-4 rounded-2xl border-2 p-4 text-left shadow-sm transition-all"
                    style={{ borderColor: '#e9d5ff', backgroundColor: '#faf5ff' }}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-purple-500" />
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3"
                      style={{ backgroundColor: '#a855f718', border: '1.5px solid #a855f740' }}>
                      <KeyRound className="h-5 w-5 text-purple-500" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">Change Password</p>
                      <p className="text-xs mt-0.5 font-medium text-purple-400">Update your login credentials</p>
                    </div>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: '#a855f715', border: '1px solid #a855f730' }}>
                      <ChevronRight className="h-4 w-4 text-purple-400 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </button>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="ac-card-hover group relative w-full flex items-center gap-4 rounded-2xl border-2 p-4 text-left shadow-sm transition-all"
                    style={{ borderColor: '#fecaca', backgroundColor: '#fef2f2' }}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-red-500" />
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3"
                      style={{ backgroundColor: '#ef444418', border: '1.5px solid #ef444440' }}>
                      <LogOut className="h-5 w-5 text-red-500" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-red-700">Logout</p>
                      <p className="text-xs mt-0.5 font-medium text-red-400">Sign out of your account</p>
                    </div>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: '#ef444415', border: '1px solid #ef444430' }}>
                      <ChevronRight className="h-4 w-4 text-red-400 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </button>
                </div>
              </section>
            </div>

          ) : (
            /* ── Password View ── */
            <div className="ac-slide-up space-y-6">

              {!isForced && (
                <button
                  onClick={() => setView('info')}
                  className="ac-card-hover group inline-flex items-center gap-2 rounded-2xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 shadow-sm transition-all hover:border-orange-300"
                >
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                  Back to Info
                </button>
              )}

              <section>
                <SectionLabel icon={KeyRound} label="Update Password" />

                <div className="ac-glass rounded-3xl overflow-hidden shadow-xl">
                  {/* section header */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 px-6 py-5">
                    <div className="ac-orb w-28 h-28 bg-purple-500/20 -top-6 -right-6" />
                    <div className="ac-orb w-20 h-20 bg-orange-500/20 -bottom-6 left-4" />
                    <div className="relative flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-400 to-blue-500 shadow-lg">
                        <Lock className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/40 mb-0.5">Security</p>
                        <h3 className="ac-display text-base font-bold text-white">
                          {isForced ? 'Set New Password' : 'Change Password'}
                        </h3>
                        {isForced && (
                          <p className="text-xs text-orange-300/80 mt-0.5">You must update your default password to continue.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleChangePassword} className="p-6 space-y-5 bg-white">

                    {/* Current Password */}
                    <PasswordField
                      label="Current Password"
                      value={passwordData.current}
                      show={showPwd.current}
                      onToggle={() => setShowPwd(s => ({ ...s, current: !s.current }))}
                      onChange={v => setPasswordData(d => ({ ...d, current: v }))}
                      color="#3b82f6"
                      bg="#eff6ff"
                      border="#bfdbfe"
                    />

                    {/* New Password */}
                    <div>
                      <PasswordField
                        label="New Password"
                        value={passwordData.new}
                        show={showPwd.new}
                        onToggle={() => setShowPwd(s => ({ ...s, new: !s.new }))}
                        onChange={v => setPasswordData(d => ({ ...d, new: v }))}
                        color="#a855f7"
                        bg="#faf5ff"
                        border="#e9d5ff"
                      />
                      {/* Strength meter */}
                      {passwordData.new && (
                        <div className="mt-2.5 px-1">
                          <div className="flex gap-1 mb-1">
                            {[1, 2, 3, 4, 5].map(i => (
                              <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                                style={{ backgroundColor: i <= strength.score ? strength.color : '#e5e7eb' }} />
                            ))}
                          </div>
                          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: strength.color }}>
                            {strength.label}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <PasswordField
                        label="Confirm New Password"
                        value={passwordData.confirm}
                        show={showPwd.confirm}
                        onToggle={() => setShowPwd(s => ({ ...s, confirm: !s.confirm }))}
                        onChange={v => setPasswordData(d => ({ ...d, confirm: v }))}
                        color="#10b981"
                        bg="#f0fdf4"
                        border="#bbf7d0"
                      />
                      {/* Match indicator */}
                      {passwordData.confirm && (
                        <div className="mt-2 px-1 flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5"
                            style={{ color: passwordData.new === passwordData.confirm ? '#10b981' : '#ef4444' }} />
                          <p className="text-[10px] font-bold uppercase tracking-widest"
                            style={{ color: passwordData.new === passwordData.confirm ? '#10b981' : '#ef4444' }}>
                            {passwordData.new === passwordData.confirm ? 'Passwords match' : 'Passwords do not match'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="ac-card-hover relative w-full overflow-hidden rounded-2xl py-4 font-bold text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: loading
                          ? '#9ca3af'
                          : 'linear-gradient(135deg, #f97316, #a855f7)',
                        boxShadow: loading ? 'none' : '0 8px 24px rgba(249,115,22,0.35)',
                      }}
                    >
                      {/* shimmer overlay on idle */}
                      {!loading && (
                        <span className="pointer-events-none absolute inset-0 opacity-20"
                          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)', backgroundSize: '200% auto', animation: 'shimmer 2s linear infinite' }} />
                      )}
                      <span className="relative ac-display text-sm tracking-wide">
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                            Updating…
                          </span>
                        ) : 'Update Password'}
                      </span>
                    </button>

                  </form>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

/* ─── Password Input Field ─── */
function PasswordField({ label, value, show, onToggle, onChange, color, bg, border }) {
  return (
    <div className="relative flex items-center gap-4 rounded-2xl border-2 p-4 transition-all"
      style={{ borderColor: value ? border : '#e5e7eb', backgroundColor: value ? bg + '80' : '#fafafa' }}>
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl transition-all"
        style={{ backgroundColor: value ? color : '#e5e7eb' }} />

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white shadow-sm"
        style={{ backgroundColor: value ? color + '18' : '#f3f4f6' }}>
        <Lock className="h-4 w-4 transition-colors" style={{ color: value ? color : '#9ca3af' }} strokeWidth={2} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-extrabold uppercase tracking-widest mb-0.5"
          style={{ color: value ? color + 'bb' : '#9ca3af' }}>{label}</p>
        <input
          type={show ? 'text' : 'password'}
          required
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-transparent text-sm font-semibold text-gray-900 placeholder:text-gray-300 focus:outline-none"
          placeholder="••••••••"
        />
      </div>

      <button type="button" onClick={onToggle}
        className="shrink-0 flex h-8 w-8 items-center justify-center rounded-xl transition-colors"
        style={{ backgroundColor: value ? color + '12' : '#f3f4f6' }}>
        {show
          ? <EyeOff className="h-3.5 w-3.5" style={{ color: value ? color : '#9ca3af' }} />
          : <Eye className="h-3.5 w-3.5" style={{ color: value ? color : '#9ca3af' }} />
        }
      </button>
    </div>
  );
}
