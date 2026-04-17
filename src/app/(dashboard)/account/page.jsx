'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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

/* ═══════════════════════════════════════════════════════════════
   DESIGN SYSTEM — exact mirror of dashboard + services + sales + history + reports
   ─ Single accent: #f97316  |  Ink: #0d0d0d  |  Surface: #f9fafb
   ─ Fonts: Instrument Serif (display) + Geist (body)
   ─ Motion: tilt, stagger, morph, shine, ripple, orbit
═══════════════════════════════════════════════════════════════ */

const ACCOUNT_STYLES = `
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

.ac-font-display { font-family: 'Instrument Serif', Georgia, serif; }
.ac-font-body    { font-family: 'Geist', system-ui, sans-serif; }

/* ── Keyframes ── */
@keyframes ac-fade-up {
  from { opacity:0; transform:translateY(20px); filter:blur(4px); }
  to   { opacity:1; transform:translateY(0);    filter:blur(0); }
}
@keyframes ac-card-in {
  from { opacity:0; transform:translateY(16px) scale(0.97); filter:blur(3px); }
  to   { opacity:1; transform:translateY(0)    scale(1);    filter:blur(0); }
}
@keyframes ac-spin-slow  { from { transform:rotate(0deg); }  to { transform:rotate(360deg); } }
@keyframes ac-spin-rev   { from { transform:rotate(0deg); }  to { transform:rotate(-360deg); } }
@keyframes ac-blink      { 0%,100%{ opacity:1; } 50%{ opacity:0.2; } }
@keyframes ac-live-ring  {
  0%   { transform:scale(1);   opacity:0.5; }
  70%  { transform:scale(2.4); opacity:0; }
  100% { transform:scale(2.4); opacity:0; }
}
@keyframes ac-blob-morph {
  0%,100% { border-radius:60% 40% 30% 70% / 60% 30% 70% 40%; }
  33%      { border-radius:30% 70% 60% 40% / 50% 60% 30% 60%; }
  66%      { border-radius:50% 30% 70% 40% / 40% 70% 30% 60%; }
}
@keyframes ac-shine      { from { left:-80%; } to { left:130%; } }
@keyframes ac-ripple-out { from { transform:scale(0); opacity:0.35; } to { transform:scale(3.5); opacity:0; } }
@keyframes ac-orbit {
  from { transform:rotate(0deg) translateX(44px) rotate(0deg); }
  to   { transform:rotate(360deg) translateX(44px) rotate(-360deg); }
}
@keyframes ac-underline {
  from { transform:scaleX(0); transform-origin:left; }
  to   { transform:scaleX(1); transform-origin:left; }
}

/* ── Stagger ── */
.ac-stagger > *:nth-child(1) { animation:ac-card-in 0.52s var(--ease-expo) 0.04s both; }
.ac-stagger > *:nth-child(2) { animation:ac-card-in 0.52s var(--ease-expo) 0.10s both; }
.ac-stagger > *:nth-child(3) { animation:ac-card-in 0.52s var(--ease-expo) 0.16s both; }
.ac-stagger > *:nth-child(4) { animation:ac-card-in 0.52s var(--ease-expo) 0.22s both; }

.ac-section-enter { animation:ac-fade-up 0.65s var(--ease-expo) both; }

/* ── Shine ── */
.ac-shine { position:relative; overflow:hidden; }
.ac-shine::before {
  content:'';
  position:absolute; top:-50%; left:-80%;
  width:50%; height:200%;
  background:linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.5) 50%,transparent 70%);
  transform:skewX(-20deg);
  pointer-events:none; z-index:2;
}
.ac-shine:hover::before { animation:ac-shine 0.5s ease forwards; }

/* ── Ripple ── */
.ac-ripple { position:relative; overflow:hidden; }
.ac-ripple-circle {
  position:absolute; border-radius:50%;
  background:rgba(255,255,255,0.28);
  transform:scale(0);
  animation:ac-ripple-out 0.6s linear forwards;
  pointer-events:none;
}

/* ── Blob ── */
.ac-blob {
  border-radius:60% 40% 30% 70% / 60% 30% 70% 40%;
  animation:ac-blob-morph 10s ease-in-out infinite;
  position:absolute; pointer-events:none;
}

/* ── Password input ── */
.ac-pwd-input {
  width:100%;
  background:transparent;
  border:none;
  outline:none;
  font-size:0.9375rem;
  font-weight:600;
  color:var(--ink);
  font-family:'Geist', system-ui, sans-serif;
  letter-spacing:0.05em;
}
.ac-pwd-input::placeholder { color:var(--ink-faint); letter-spacing:0.1em; }

/* ── Strength bar ── */
.ac-strength-bar {
  height:3px;
  border-radius:999px;
  transition:background-color 0.3s, flex 0.3s;
  flex:1;
}
`;

function StyleInjector() {
  useEffect(() => {
    if (document.getElementById('ac-v2-styles')) return;
    const el = document.createElement('style');
    el.id = 'ac-v2-styles';
    el.textContent = ACCOUNT_STYLES;
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
    circle.className = 'ac-ripple-circle';
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
    el.style.transform = `perspective(700px) rotateY(${dx*strength}deg) rotateX(${-dy*strength}deg) translateY(-3px) scale(1.015)`;
    el.style.boxShadow = `${-dx*5}px ${dy*5}px 24px rgba(0,0,0,0.09), 0 0 0 1.5px rgba(249,115,22,0.18)`;
  }, [strength]);
  const onLeave = useCallback(() => {
    const el = ref.current; if (!el) return;
    el.style.transform = ''; el.style.boxShadow = '';
  }, []);
  return { ref, onMouseMove: onMove, onMouseLeave: onLeave };
}

/* ── Password strength ── */
function getStrength(pwd) {
  if (!pwd) return { score:0, label:'', color:'' };
  let score = 0;
  if (pwd.length >= 6)           score++;
  if (pwd.length >= 10)          score++;
  if (/[A-Z]/.test(pwd))         score++;
  if (/[0-9]/.test(pwd))         score++;
  if (/[^A-Za-z0-9]/.test(pwd))  score++;
  if (score <= 1) return { score, label:'Weak',   color:'#ef4444' };
  if (score <= 3) return { score, label:'Fair',   color:'#f59e0b' };
  if (score === 4) return { score, label:'Good',   color:'#3b82f6' };
  return              { score, label:'Strong', color:'#10b981' };
}

/* ── Shared panel style ── */
const panelStyle = {
  background:'var(--surface-raise)', border:'1px solid var(--border)',
  borderRadius:'1.5rem', padding:'1.5rem',
  position:'relative', overflow:'hidden',
  boxShadow:'0 2px 16px rgba(0,0,0,0.04)',
};
const topAccentBar = {
  position:'absolute', top:0, left:'1.5rem', right:'1.5rem', height:2,
  background:'linear-gradient(90deg, var(--accent), transparent)',
  borderRadius:'0 0 3px 3px', opacity:0.5,
};

/* ── Section Label — identical to dashboard ── */
function AcSectionLabel({ icon: Icon, label }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'0.625rem', marginBottom:'0.875rem' }}>
      <div style={{ width:24, height:24, borderRadius:'0.375rem', background:'var(--ink)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon style={{ width:12, height:12, color:'var(--accent)' }} strokeWidth={2.5} />
      </div>
      <span style={{ fontSize:'0.8125rem', fontWeight:600, color:'var(--ink-mid)', letterSpacing:'0.01em' }}>{label}</span>
      <div style={{ flex:1, height:1, background:'var(--border)', borderRadius:2 }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN ACCOUNT PAGE
═══════════════════════════════════════════════════════════════ */
export default function AccountPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const { profile, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState(
    searchParams.get('forceChange') === 'true' ? 'password' : 'info'
  );
  const [showPwd, setShowPwd]       = useState({ current:false, new:false, confirm:false });
  const [passwordData, setPasswordData] = useState({ current:'', new:'', confirm:'' });

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const isForced = searchParams.get('forceChange') === 'true';
  const strength = getStrength(passwordData.new);

  const roleConfig = {
    admin:      { color:'#f97316', label:'Admin' },
    owner:      { color:'#8b5cf6', label:'Owner' },
    technician: { color:'#3b82f6', label:'Technician' },
    staff:      { color:'#10b981', label:'Staff' },
  }[profile?.role] || { color:'#6b7280', label: profile?.role || 'User' };

  const initials = (profile?.full_name || profile?.name || '')
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) || '?';

  async function handleLogout() {
    logout();
    router.push('/login');
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) return toast.error('New passwords do not match');
    if (passwordData.current !== profile?.password)  return toast.error('Current password is incorrect');
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ password: passwordData.new, is_first_login: false })
        .eq('id', profile?.id);
      if (error) throw error;
      toast.success('Password updated! Please login again.');
      handleLogout();
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  }

  return (
    <>
      <StyleInjector />
      <div className="ac-font-body" style={{ backgroundColor:'var(--surface)', minHeight:'100vh', padding:'0.25rem' }}>
        <div style={{ maxWidth:560, margin:'0 auto', display:'flex', flexDirection:'column', gap:'1.5rem' }}>

          {/* ═══ HERO HEADER ═══ */}
          <header
            className={mounted ? 'ac-section-enter' : ''}
            style={{ background:'linear-gradient(135deg,#0d0d0d 0%,#181818 60%,#0d0d0d 100%)', borderRadius:'1.75rem', padding:'1.75rem', position:'relative', overflow:'hidden', boxShadow:'0 24px 60px -16px rgba(0,0,0,0.45)', animationDelay:'0s' }}
          >
            {/* Morphing blobs */}
            <div className="ac-blob" style={{ width:220, height:220, background:'var(--accent)', opacity:0.06, top:-50, right:-30 }} />
            <div className="ac-blob" style={{ width:140, height:140, background:'var(--accent)', opacity:0.04, bottom:-35, left:'18%', animationDelay:'4s' }} />

            {/* Spinning rings */}
            <div style={{ position:'absolute', right:28, top:28, width:80, height:80, animation:'ac-spin-slow 20s linear infinite', pointerEvents:'none' }}>
              <div style={{ width:'100%', height:'100%', borderRadius:'50%', border:'1px dashed rgba(249,115,22,0.18)' }} />
            </div>
            <div style={{ position:'absolute', right:36, top:36, width:50, height:50, animation:'ac-spin-rev 9s linear infinite', pointerEvents:'none' }}>
              <div style={{ width:'100%', height:'100%', borderRadius:'50%', border:'1px solid rgba(249,115,22,0.10)' }} />
            </div>
            {/* Orbiting dot */}
            <div style={{ position:'absolute', right:46, top:46, pointerEvents:'none' }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent)', opacity:0.65, animation:'ac-orbit 9s linear infinite' }} />
            </div>
            {/* Corner accent line */}
            <div style={{ position:'absolute', top:0, left:'8%', width:100, height:2, background:'linear-gradient(90deg,var(--accent),transparent)', opacity:0.55 }} />

            <div style={{ position:'relative', display:'flex', alignItems:'center', gap:'1.25rem' }}>
              {/* Avatar */}
              <div style={{ position:'relative', flexShrink:0 }}>
                <div style={{
                  width:64, height:64, borderRadius:'1.125rem',
                  background:'linear-gradient(135deg, var(--accent), #c2410c)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  boxShadow:'0 8px 24px rgba(249,115,22,0.35)',
                }}>
                  <span className="ac-font-display" style={{ fontSize:'1.5rem', fontWeight:400, color:'#fff', fontStyle:'italic' }}>
                    {initials}
                  </span>
                </div>
                {/* Online indicator */}
                <span style={{ position:'absolute', bottom:-3, right:-3, width:18, height:18, borderRadius:'50%', background:'#22c55e', border:'2.5px solid #0d0d0d', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ width:7, height:7, borderRadius:'50%', background:'#fff', animation:'ac-blink 2s ease-in-out infinite', display:'inline-block' }} />
                </span>
              </div>

              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:'0.625rem', fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:'rgba(255,255,255,0.28)', marginBottom:'0.375rem' }}>
                  My Account
                </p>
                <h1 className="ac-font-display" style={{ fontSize:'clamp(1.375rem,3vw,1.875rem)', fontWeight:400, lineHeight:1.1, color:'rgba(255,255,255,0.94)', fontStyle:'italic', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {profile?.full_name || profile?.name || 'User'}
                </h1>
                {/* Animated underline */}
                <div style={{ height:2, width:48, background:'var(--accent)', animation:'ac-underline 0.8s var(--ease-expo) 0.3s both', borderRadius:2, marginTop:'0.4rem', marginBottom:'0.5rem' }} />
                {/* Role badge */}
                <span style={{ display:'inline-flex', alignItems:'center', gap:'0.35rem', padding:'0.25rem 0.75rem', borderRadius:'9999px', background:`${roleConfig.color}18`, border:`1px solid ${roleConfig.color}35`, fontSize:'0.625rem', fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', color:roleConfig.color }}>
                  <Shield style={{ width:10, height:10 }} strokeWidth={2.5} />
                  {roleConfig.label}
                </span>
              </div>
            </div>
          </header>

          {/* ═══ INFO VIEW ═══ */}
          {view === 'info' ? (
            <>
              {/* Profile Info */}
              <section className={mounted ? 'ac-section-enter' : ''} style={{ animationDelay:'0.1s' }}>
                <AcSectionLabel icon={User} label="Profile Information" />
                <div style={panelStyle}>
                  <div style={topAccentBar} />
                  <div className="ac-stagger" style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                    <ProfileInfoRow
                      label="Full Name"
                      value={profile?.full_name || profile?.name || '—'}
                      icon={User}
                      dotColor="#3b82f6"
                    />
                    <ProfileInfoRow
                      label="Mobile Number"
                      value={profile?.mobile || '—'}
                      icon={Smartphone}
                      dotColor="#10b981"
                    />
                    <ProfileInfoRow
                      label="Role"
                      value={roleConfig.label}
                      icon={Shield}
                      dotColor={roleConfig.color}
                    />
                  </div>
                </div>
              </section>

              {/* Account Actions */}
              <section className={mounted ? 'ac-section-enter' : ''} style={{ animationDelay:'0.18s' }}>
                <AcSectionLabel icon={Sparkles} label="Account Actions" />
                <div className="ac-stagger" style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                  <ActionBtn
                    icon={KeyRound}
                    label="Change Password"
                    desc="Update your login credentials"
                    dotColor="#8b5cf6"
                    onClick={() => setView('password')}
                  />
                  <ActionBtn
                    icon={LogOut}
                    label="Logout"
                    desc="Sign out of your account"
                    dotColor="#ef4444"
                    onClick={handleLogout}
                    danger
                  />
                </div>
              </section>
            </>

          ) : (
            /* ═══ PASSWORD VIEW ═══ */
            <>
              {!isForced && (
                <div className={mounted ? 'ac-section-enter' : ''} style={{ animationDelay:'0.05s' }}>
                  <BackToInfoBtn onClick={() => setView('info')} />
                </div>
              )}

              <section className={mounted ? 'ac-section-enter' : ''} style={{ animationDelay:'0.12s' }}>
                <AcSectionLabel icon={KeyRound} label="Update Password" />
                <div style={panelStyle}>
                  <div style={topAccentBar} />

                  {/* Section sub-header */}
                  <div style={{
                    background:'var(--ink)', borderRadius:'1.125rem', padding:'1.125rem 1.25rem',
                    marginBottom:'1.25rem', position:'relative', overflow:'hidden',
                  }}>
                    <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'var(--accent)', opacity:0.7 }} />
                    <div className="ac-blob" style={{ width:100, height:100, background:'var(--accent)', opacity:0.06, top:-25, right:-15 }} />
                    <div style={{ position:'relative', display:'flex', alignItems:'center', gap:'0.875rem' }}>
                      <div style={{ width:40, height:40, borderRadius:'0.75rem', background:'rgba(249,115,22,0.15)', border:'1px solid rgba(249,115,22,0.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <Lock style={{ width:18, height:18, color:'var(--accent)' }} strokeWidth={2.5} />
                      </div>
                      <div>
                        <p style={{ fontSize:'0.625rem', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(255,255,255,0.28)', marginBottom:'0.2rem' }}>Security</p>
                        <p style={{ fontSize:'0.9375rem', fontWeight:600, color:'rgba(255,255,255,0.92)', margin:0 }}>
                          {isForced ? 'Set New Password' : 'Change Password'}
                        </p>
                        {isForced && (
                          <p style={{ fontSize:'0.75rem', color:'rgba(249,115,22,0.7)', marginTop:'0.2rem' }}>
                            You must update your default password to continue.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleChangePassword} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>

                    <PasswordField
                      label="Current Password"
                      value={passwordData.current}
                      show={showPwd.current}
                      onToggle={() => setShowPwd(s => ({ ...s, current:!s.current }))}
                      onChange={v => setPasswordData(d => ({ ...d, current:v }))}
                      dotColor="#3b82f6"
                    />

                    <div style={{ display:'flex', flexDirection:'column', gap:'0.625rem' }}>
                      <PasswordField
                        label="New Password"
                        value={passwordData.new}
                        show={showPwd.new}
                        onToggle={() => setShowPwd(s => ({ ...s, new:!s.new }))}
                        onChange={v => setPasswordData(d => ({ ...d, new:v }))}
                        dotColor="#8b5cf6"
                      />
                      {/* Strength meter */}
                      {passwordData.new && (
                        <div style={{ paddingLeft:'0.25rem' }}>
                          <div style={{ display:'flex', gap:'0.25rem', marginBottom:'0.375rem' }}>
                            {[1,2,3,4,5].map(i => (
                              <div key={i} className="ac-strength-bar"
                                style={{ background: i <= strength.score ? strength.color : 'var(--border)' }} />
                            ))}
                          </div>
                          <p style={{ fontSize:'0.625rem', fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', color:strength.color, margin:0 }}>
                            {strength.label}
                          </p>
                        </div>
                      )}
                    </div>

                    <div style={{ display:'flex', flexDirection:'column', gap:'0.625rem' }}>
                      <PasswordField
                        label="Confirm New Password"
                        value={passwordData.confirm}
                        show={showPwd.confirm}
                        onToggle={() => setShowPwd(s => ({ ...s, confirm:!s.confirm }))}
                        onChange={v => setPasswordData(d => ({ ...d, confirm:v }))}
                        dotColor="#10b981"
                      />
                      {/* Match indicator */}
                      {passwordData.confirm && (
                        <div style={{ paddingLeft:'0.25rem', display:'flex', alignItems:'center', gap:'0.4rem' }}>
                          <CheckCircle2 style={{ width:13, height:13, color: passwordData.new === passwordData.confirm ? '#10b981' : '#ef4444', flexShrink:0 }} />
                          <p style={{ fontSize:'0.625rem', fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', color: passwordData.new === passwordData.confirm ? '#10b981' : '#ef4444', margin:0 }}>
                            {passwordData.new === passwordData.confirm ? 'Passwords match' : 'Passwords do not match'}
                          </p>
                        </div>
                      )}
                    </div>

                    <UpdatePasswordBtn loading={loading} />
                  </form>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════════════════════════ */

/* ── Profile Info Row ── */
function ProfileInfoRow({ label, value, icon: Icon, dotColor }) {
  const { ref, onMouseMove, onMouseLeave } = useTilt(3);
  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        position:'relative', display:'flex', alignItems:'center', gap:'0.875rem',
        padding:'1rem', borderRadius:'1rem',
        border:`1.5px solid ${dotColor}22`,
        background:`${dotColor}06`,
        willChange:'transform',
      }}
    >
      {/* Left accent stripe */}
      <div style={{ position:'absolute', left:0, top:'20%', bottom:'20%', width:3, borderRadius:'0 3px 3px 0', background:dotColor }} />
      {/* Icon */}
      <div style={{ width:38, height:38, borderRadius:'0.75rem', display:'flex', alignItems:'center', justifyContent:'center', background:`${dotColor}15`, border:`1.5px solid ${dotColor}28`, flexShrink:0 }}>
        <Icon style={{ width:16, height:16, color:dotColor }} strokeWidth={2} />
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:'0.625rem', fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:dotColor, marginBottom:'0.25rem' }}>{label}</p>
        <p className="ac-font-display" style={{ fontSize:'1rem', fontWeight:400, color:'var(--ink)', fontStyle:'italic', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', margin:0 }}>
          {value}
        </p>
      </div>
    </div>
  );
}

/* ── Action Button ── */
function ActionBtn({ icon: Icon, label, desc, dotColor, onClick, danger }) {
  const ripple = useRipple();
  const { ref, onMouseMove, onMouseLeave } = useTilt(4);
  const [hovered, setHovered] = useState(false);
  return (
    <button
      ref={ref}
      onClick={(e) => { ripple(e); onClick(); }}
      onMouseMove={onMouseMove}
      onMouseLeave={() => { onMouseLeave(); setHovered(false); }}
      onMouseEnter={() => setHovered(true)}
      className="ac-ripple ac-shine"
      style={{
        width:'100%', textAlign:'left', cursor:'pointer',
        display:'flex', alignItems:'center', gap:'0.875rem',
        padding:'1rem', borderRadius:'1.125rem',
        border:`1.5px solid ${hovered ? dotColor+'55' : 'var(--border)'}`,
        background: hovered ? 'var(--ink)' : 'var(--surface-raise)',
        position:'relative', transition:'background 0.25s, border-color 0.25s',
        willChange:'transform',
      }}
    >
      {/* Accent stripe */}
      <div style={{ position:'absolute', left:0, top:'20%', bottom:'20%', width:3, borderRadius:'0 3px 3px 0', background:dotColor, transform:hovered?'scaleY(1)':'scaleY(0.35)', transition:'transform 0.3s var(--ease-spring)', transformOrigin:'center' }} />

      <div style={{ width:42, height:42, borderRadius:'0.875rem', display:'flex', alignItems:'center', justifyContent:'center', background:hovered?`${dotColor}20`:'var(--surface)', border:`1.5px solid ${hovered?dotColor+'40':'var(--border)'}`, flexShrink:0, transition:'background 0.25s, border-color 0.25s, transform 0.3s var(--ease-spring)', transform:hovered?'scale(1.1) rotate(4deg)':'scale(1)' }}>
        <Icon style={{ width:18, height:18, color:hovered?dotColor:'var(--ink-mid)', transition:'color 0.2s' }} strokeWidth={2.5} />
      </div>

      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:'0.9375rem', fontWeight:600, color:hovered?(danger?dotColor:'#fff'):'var(--ink)', margin:0, transition:'color 0.2s' }}>{label}</p>
        <p style={{ fontSize:'0.8125rem', color:hovered?`${dotColor}99`:'var(--ink-faint)', margin:'0.2rem 0 0', transition:'color 0.2s' }}>{desc}</p>
      </div>

      <div style={{ width:28, height:28, borderRadius:'0.5rem', display:'flex', alignItems:'center', justifyContent:'center', background:hovered?`${dotColor}20`:'var(--surface)', flexShrink:0, transition:'background 0.2s, transform 0.2s', transform:hovered?'translateX(3px)':'translateX(0)' }}>
        <ChevronRight style={{ width:14, height:14, color:hovered?dotColor:'var(--border-strong)' }} />
      </div>
    </button>
  );
}

/* ── Back to Info Button ── */
function BackToInfoBtn({ onClick }) {
  const ripple = useRipple();
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={(e) => { ripple(e); onClick(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="ac-ripple ac-shine"
      style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', padding:'0.625rem 1.125rem', borderRadius:'0.875rem', border:`1.5px solid ${hovered?'var(--accent)':'var(--border)'}`, background:hovered?'var(--ink)':'var(--surface-raise)', color:hovered?'#fff':'var(--ink-mid)', fontSize:'0.875rem', fontWeight:600, cursor:'pointer', transition:'all 0.2s' }}
    >
      <ArrowLeft style={{ width:14, height:14, color:hovered?'var(--accent)':'var(--ink-faint)', transform:hovered?'translateX(-2px)':'translateX(0)', transition:'transform 0.2s, color 0.2s' }} />
      Back to Info
    </button>
  );
}

/* ── Password Field ── */
function PasswordField({ label, value, show, onToggle, onChange, dotColor }) {
  const hasValue = !!value;
  return (
    <div style={{
      position:'relative', display:'flex', alignItems:'center', gap:'0.875rem',
      padding:'1rem', borderRadius:'1rem',
      border:`1.5px solid ${hasValue ? dotColor+'45' : 'var(--border)'}`,
      background: hasValue ? `${dotColor}07` : 'var(--surface)',
      transition:'border-color 0.2s, background 0.2s',
    }}>
      {/* Left stripe */}
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:3, borderRadius:'1rem 0 0 1rem', background:hasValue?dotColor:'var(--border)', transition:'background 0.2s' }} />

      {/* Lock icon */}
      <div style={{ width:38, height:38, borderRadius:'0.75rem', display:'flex', alignItems:'center', justifyContent:'center', background:hasValue?`${dotColor}15`:'var(--surface)', border:`1.5px solid ${hasValue?dotColor+'28':'var(--border)'}`, flexShrink:0, transition:'background 0.2s, border-color 0.2s' }}>
        <Lock style={{ width:16, height:16, color:hasValue?dotColor:'var(--ink-faint)', transition:'color 0.2s' }} strokeWidth={2} />
      </div>

      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:'0.625rem', fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:hasValue?dotColor:'var(--ink-faint)', marginBottom:'0.3rem', transition:'color 0.2s' }}>{label}</p>
        <input
          type={show ? 'text' : 'password'}
          required
          value={value}
          onChange={e => onChange(e.target.value)}
          className="ac-pwd-input"
          placeholder="••••••••"
        />
      </div>

      {/* Toggle visibility */}
      <button
        type="button"
        onClick={onToggle}
        style={{ width:32, height:32, borderRadius:'0.5rem', display:'flex', alignItems:'center', justifyContent:'center', background:hasValue?`${dotColor}12`:'var(--surface)', border:'none', cursor:'pointer', flexShrink:0, transition:'background 0.2s' }}
      >
        {show
          ? <EyeOff style={{ width:14, height:14, color:hasValue?dotColor:'var(--ink-faint)' }} />
          : <Eye    style={{ width:14, height:14, color:hasValue?dotColor:'var(--ink-faint)' }} />
        }
      </button>
    </div>
  );
}

/* ── Update Password Button ── */
function UpdatePasswordBtn({ loading }) {
  const ripple = useRipple();
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="submit"
      disabled={loading}
      onClick={ripple}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="ac-ripple ac-shine"
      style={{
        width:'100%', padding:'1rem', borderRadius:'1.125rem', marginTop:'0.25rem',
        fontSize:'0.9375rem', fontWeight:700, color:'#fff', cursor:loading?'not-allowed':'pointer',
        background:'var(--ink)',
        border:`1.5px solid ${hovered?'var(--accent)':'var(--ink)'}`,
        boxShadow:hovered?'0 8px 28px rgba(0,0,0,0.25)':'0 4px 16px rgba(0,0,0,0.15)',
        transition:'all 0.2s',
        transform:hovered&&!loading?'translateY(-1px)':'translateY(0)',
        opacity:loading?0.6:1,
        display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem',
      }}
    >
      {loading ? (
        <>
          <div style={{ width:16, height:16, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', animation:'ac-spin-slow 0.7s linear infinite' }} />
          Updating…
        </>
      ) : (
        <>
          <Zap style={{ width:16, height:16, color:'var(--accent)' }} strokeWidth={2.5} />
          Update Password
        </>
      )}
    </button>
  );
}

/* ── Zap icon inline import fix ── */
function Zap({ style, strokeWidth, ...rest }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth||2} strokeLinecap="round" strokeLinejoin="round" style={style} {...rest}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
