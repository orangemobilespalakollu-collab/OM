'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { employeeService } from '@/services/employeeService';
import { useAuth } from '@/components/AuthProvider';
import {
  Plus,
  Smartphone,
  User,
  Lock,
  RefreshCw,
  XCircle,
  Clock,
  ArrowLeft,
  Users,
  KeyRound,
  Zap,
  Activity,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════
   DESIGN SYSTEM — exact mirror of dashboard + all pages
   ─ Single accent: #f97316  |  Ink: #0d0d0d  |  Surface: #f9fafb
   ─ Fonts: Instrument Serif (display) + Geist (body)
   ─ Motion: tilt, stagger, morph, shine, ripple, orbit
═══════════════════════════════════════════════════════════════ */

const EM_STYLES = `
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

.em-font-display { font-family: 'Instrument Serif', Georgia, serif; }
.em-font-body    { font-family: 'Geist', system-ui, sans-serif; }

@keyframes em-fade-up {
  from { opacity:0; transform:translateY(20px); filter:blur(4px); }
  to   { opacity:1; transform:translateY(0);    filter:blur(0); }
}
@keyframes em-card-in {
  from { opacity:0; transform:translateY(16px) scale(0.97); filter:blur(3px); }
  to   { opacity:1; transform:translateY(0)    scale(1);    filter:blur(0); }
}
@keyframes em-num-rise {
  from { opacity:0; transform:translateY(10px) scale(0.9); }
  to   { opacity:1; transform:translateY(0)    scale(1); }
}
@keyframes em-spin-slow  { from { transform:rotate(0deg); }  to { transform:rotate(360deg); } }
@keyframes em-spin-rev   { from { transform:rotate(0deg); }  to { transform:rotate(-360deg); } }
@keyframes em-blink      { 0%,100%{ opacity:1; } 50%{ opacity:0.2; } }
@keyframes em-live-ring  {
  0%   { transform:scale(1);   opacity:0.5; }
  70%  { transform:scale(2.4); opacity:0; }
  100% { transform:scale(2.4); opacity:0; }
}
@keyframes em-blob-morph {
  0%,100% { border-radius:60% 40% 30% 70% / 60% 30% 70% 40%; }
  33%      { border-radius:30% 70% 60% 40% / 50% 60% 30% 60%; }
  66%      { border-radius:50% 30% 70% 40% / 40% 70% 30% 60%; }
}
@keyframes em-shine      { from { left:-80%; } to { left:130%; } }
@keyframes em-ripple-out { from { transform:scale(0); opacity:0.35; } to { transform:scale(3.5); opacity:0; } }
@keyframes em-orbit {
  from { transform:rotate(0deg) translateX(44px) rotate(0deg); }
  to   { transform:rotate(360deg) translateX(44px) rotate(-360deg); }
}
@keyframes em-underline {
  from { transform:scaleX(0); transform-origin:left; }
  to   { transform:scaleX(1); transform-origin:left; }
}
@keyframes em-pulse-ring {
  0%   { transform:scale(0.85); opacity:0.6; }
  70%  { transform:scale(1.7);  opacity:0; }
  100% { transform:scale(1.7);  opacity:0; }
}

/* Stagger */
.em-stagger > *:nth-child(1) { animation:em-card-in 0.52s var(--ease-expo) 0.04s both; }
.em-stagger > *:nth-child(2) { animation:em-card-in 0.52s var(--ease-expo) 0.10s both; }
.em-stagger > *:nth-child(3) { animation:em-card-in 0.52s var(--ease-expo) 0.16s both; }
.em-stagger > *:nth-child(4) { animation:em-card-in 0.52s var(--ease-expo) 0.22s both; }
.em-stagger > *:nth-child(5) { animation:em-card-in 0.52s var(--ease-expo) 0.28s both; }
.em-stagger > *:nth-child(6) { animation:em-card-in 0.52s var(--ease-expo) 0.34s both; }

.em-section-enter { animation:em-fade-up 0.65s var(--ease-expo) both; }

/* Shine */
.em-shine { position:relative; overflow:hidden; }
.em-shine::before {
  content:''; position:absolute; top:-50%; left:-80%;
  width:50%; height:200%;
  background:linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.5) 50%,transparent 70%);
  transform:skewX(-20deg); pointer-events:none; z-index:2;
}
.em-shine:hover::before { animation:em-shine 0.5s ease forwards; }

/* Ripple */
.em-ripple { position:relative; overflow:hidden; }
.em-ripple-circle {
  position:absolute; border-radius:50%;
  background:rgba(255,255,255,0.28);
  transform:scale(0);
  animation:em-ripple-out 0.6s linear forwards;
  pointer-events:none;
}

/* Blob */
.em-blob {
  border-radius:60% 40% 30% 70% / 60% 30% 70% 40%;
  animation:em-blob-morph 10s ease-in-out infinite;
  position:absolute; pointer-events:none;
}

/* Input */
.em-input {
  width:100%; background:transparent; border:none; outline:none;
  font-size:0.9375rem; font-weight:600; color:var(--ink);
  font-family:'Geist', system-ui, sans-serif;
}
.em-input::placeholder { color:var(--ink-faint); font-weight:500; }
`;

function StyleInjector() {
  useEffect(() => {
    if (document.getElementById('em-v2-styles')) return;
    const el = document.createElement('style');
    el.id = 'em-v2-styles';
    el.textContent = EM_STYLES;
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
    circle.className = 'em-ripple-circle';
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
    el.style.transform = `perspective(700px) rotateY(${dx*strength}deg) rotateX(${-dy*strength}deg) translateY(-3px) scale(1.018)`;
    el.style.boxShadow = `${-dx*6}px ${dy*6}px 28px rgba(0,0,0,0.09), 0 0 0 1.5px rgba(249,115,22,0.22)`;
  }, [strength]);
  const onLeave = useCallback(() => {
    const el = ref.current; if (!el) return;
    el.style.transform = ''; el.style.boxShadow = '';
  }, []);
  return { ref, onMouseMove: onMove, onMouseLeave: onLeave };
}

/* ── Count-up hook ── */
function useCountUp(target, duration = 900, delay = 0) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (typeof target !== 'number') { setValue(target); return; }
    let start = null;
    const t = setTimeout(() => {
      const step = (ts) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 4);
        setValue(Math.floor(ease * target));
        if (p < 1) requestAnimationFrame(step);
        else setValue(target);
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(t);
  }, [target, duration, delay]);
  return value;
}

/* ── Shared panel styles ── */
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
function EmSectionLabel({ icon: Icon, label }) {
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

/* ── Back Button (dark header) ── */
function BackBtn({ onClick }) {
  const ripple = useRipple();
  return (
    <button onClick={(e) => { ripple(e); onClick(); }} className="em-ripple"
      style={{ width:40, height:40, borderRadius:'0.875rem', display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.15)', cursor:'pointer', color:'#fff', flexShrink:0 }}>
      <ArrowLeft style={{ width:16, height:16 }} />
    </button>
  );
}

/* ── Employee accent palette (semantic, rotated) ── */
const EMP_COLORS = ['#3b82f6','#10b981','#8b5cf6','#06b6d4','#f59e0b','#ec4899'];

/* ── Initials Avatar ── */
function Avatar({ name, size = 'md', dotColor }) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);
  const dim = size === 'lg' ? 64 : size === 'sm' ? 36 : 48;
  const fs  = size === 'lg' ? '1.5rem' : size === 'sm' ? '0.75rem' : '1rem';
  return (
    <div className="em-font-display" style={{
      width:dim, height:dim, borderRadius:'0.875rem', flexShrink:0,
      display:'flex', alignItems:'center', justifyContent:'center',
      background:`linear-gradient(135deg, ${dotColor}, ${dotColor}cc)`,
      boxShadow:`0 4px 16px ${dotColor}30`,
      fontSize:fs, fontWeight:400, color:'#fff', fontStyle:'italic',
    }}>
      {initials}
    </div>
  );
}

/* ── Status dot with live ring ── */
function LiveDot({ active = true }) {
  return (
    <span style={{ position:'relative', display:'inline-block', width:10, height:10, borderRadius:'50%', background: active ? '#22c55e' : 'var(--ink-faint)', flexShrink:0 }}>
      {active && <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:'#22c55e', animation:'em-live-ring 2s ease-out infinite' }} />}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN EMPLOYEES PAGE
═══════════════════════════════════════════════════════════════ */
export default function EmployeesPage() {
  const { profile: adminProfile } = useAuth();
  const [employees, setEmployees]     = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedIndex, setSelectedIndex]       = useState(0);
  const [view, setView]               = useState('list');
  const [loading, setLoading]         = useState(true);
  const [mounted, setMounted]         = useState(false);
  const animatedCount                 = useCountUp(employees.length, 800, 300);

  useEffect(() => {
    if (adminProfile?.role === 'admin' || adminProfile?.role === 'owner') fetchEmployees();
    setTimeout(() => setMounted(true), 50);
  }, [adminProfile]);

  async function fetchEmployees() {
    try { setLoading(true); const data = await employeeService.getEmployees(); setEmployees(data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  /* ── Access Denied ── */
  if (adminProfile?.role !== 'admin' && adminProfile?.role !== 'owner') {
    return (
      <>
        <StyleInjector />
        <div className="em-font-body" style={{ backgroundColor:'var(--surface)', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem' }}>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'1.25rem', textAlign:'center', maxWidth:360 }}>
            <div style={{ width:72, height:72, borderRadius:'1.25rem', background:'var(--ink)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 12px 32px rgba(0,0,0,0.2)' }}>
              <Lock style={{ width:32, height:32, color:'var(--accent)' }} />
            </div>
            <div>
              <p className="em-font-display" style={{ fontSize:'1.5rem', fontWeight:400, color:'var(--ink)', fontStyle:'italic' }}>Access Denied</p>
              <p style={{ fontSize:'0.875rem', color:'var(--ink-faint)', marginTop:'0.375rem' }}>Only administrators can manage employees.</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (view === 'register') return (
    <RegisterEmployee onCancel={() => setView('list')} onComplete={() => { setView('list'); fetchEmployees(); }} />
  );
  if (view === 'details' && selectedEmployee) return (
    <EmployeeDetails employee={selectedEmployee} dotColor={EMP_COLORS[selectedIndex % EMP_COLORS.length]} onBack={() => setView('list')} />
  );

  return (
    <>
      <StyleInjector />
      <div className="em-font-body" style={{ backgroundColor:'var(--surface)', minHeight:'100vh', padding:'0.25rem' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>

          {/* ═══ HERO HEADER ═══ */}
          <header
            className={mounted ? 'em-section-enter' : ''}
            style={{ background:'linear-gradient(135deg,#0d0d0d 0%,#181818 60%,#0d0d0d 100%)', borderRadius:'1.75rem', padding:'1.75rem', position:'relative', overflow:'hidden', boxShadow:'0 24px 60px -16px rgba(0,0,0,0.45)', animationDelay:'0s' }}
          >
            <div className="em-blob" style={{ width:260, height:260, background:'var(--accent)', opacity:0.06, top:-60, right:-40 }} />
            <div className="em-blob" style={{ width:160, height:160, background:'var(--accent)', opacity:0.04, bottom:-40, left:'22%', animationDelay:'4s' }} />
            <div style={{ position:'absolute', right:28, top:28, width:88, height:88, animation:'em-spin-slow 20s linear infinite', pointerEvents:'none' }}>
              <div style={{ width:'100%', height:'100%', borderRadius:'50%', border:'1px dashed rgba(249,115,22,0.18)' }} />
            </div>
            <div style={{ position:'absolute', right:36, top:36, width:54, height:54, animation:'em-spin-rev 9s linear infinite', pointerEvents:'none' }}>
              <div style={{ width:'100%', height:'100%', borderRadius:'50%', border:'1px solid rgba(249,115,22,0.10)' }} />
            </div>
            <div style={{ position:'absolute', right:49, top:49, pointerEvents:'none' }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent)', opacity:0.65, animation:'em-orbit 9s linear infinite' }} />
            </div>
            <div style={{ position:'absolute', top:0, left:'8%', width:100, height:2, background:'linear-gradient(90deg,var(--accent),transparent)', opacity:0.55 }} />

            <div style={{ position:'relative', display:'flex', flexWrap:'wrap', alignItems:'flex-end', justifyContent:'space-between', gap:'1.25rem' }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.625rem', marginBottom:'0.5rem' }}>
                  <div style={{ width:28, height:28, borderRadius:'0.625rem', background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Users style={{ width:14, height:14, color:'#fff' }} strokeWidth={2.5} />
                  </div>
                  <p style={{ fontSize:'0.625rem', fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:'rgba(255,255,255,0.28)' }}>Team Management</p>
                </div>
                <h1 className="em-font-display" style={{ fontSize:'clamp(1.75rem,4vw,2.5rem)', fontWeight:400, lineHeight:1.1, color:'rgba(255,255,255,0.94)', marginBottom:'0.5rem', fontStyle:'italic' }}>
                  Employee <span style={{ color:'var(--accent)' }}>Directory</span>
                </h1>
                <div style={{ height:2, width:56, background:'var(--accent)', animation:'em-underline 0.8s var(--ease-expo) 0.3s both', borderRadius:2 }} />
                <p style={{ marginTop:'0.7rem', fontSize:'0.8125rem', color:'rgba(255,255,255,0.3)', fontWeight:400 }}>
                  {loading ? 'Loading team…' : `${employees.length} team member${employees.length !== 1 ? 's' : ''} registered`}
                </p>
              </div>

              {/* Count widget */}
              <div style={{ background:'rgba(255,255,255,0.06)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:'1.125rem', padding:'0.85rem 1.4rem', textAlign:'right', minWidth:120 }}>
                <p style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(255,255,255,0.28)', marginBottom:'0.3rem' }}>Active</p>
                <p style={{ fontSize:'2rem', fontWeight:800, letterSpacing:'-0.03em', color:'var(--accent)', lineHeight:1, margin:0, animation:'em-num-rise 0.5s var(--ease-spring) both' }}>
                  {animatedCount}
                </p>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:'0.4rem', marginTop:'0.4rem' }}>
                  <LiveDot />
                  <span style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(255,255,255,0.28)' }}>Staff</span>
                </div>
              </div>
            </div>
          </header>

          {/* ═══ QUICK ACTIONS ═══ */}
          <section className={mounted ? 'em-section-enter' : ''} style={{ animationDelay:'0.1s' }}>
            <EmSectionLabel icon={Zap} label="Quick Actions" />
            <RegisterBtn onClick={() => setView('register')} />
          </section>

          {/* ═══ TEAM MEMBERS GRID ═══ */}
          <section className={mounted ? 'em-section-enter' : ''} style={{ animationDelay:'0.18s' }}>
            <EmSectionLabel icon={Users} label="Team Members" />

            {loading ? (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'1rem' }}>
                {[...Array(4)].map((_,i) => (
                  <div key={i} style={{ height:120, borderRadius:'1.25rem', background:'#f3f4f6', animation:`em-card-in 0.4s var(--ease-expo) ${i*0.05}s both` }} />
                ))}
              </div>
            ) : employees.length === 0 ? (
              <EmptyTeam onAdd={() => setView('register')} />
            ) : (
              <div className="em-stagger" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'1rem' }}>
                {employees.map((emp, i) => (
                  <EmployeeCard
                    key={emp.id}
                    employee={emp}
                    index={i}
                    onClick={() => { setSelectedEmployee(emp); setSelectedIndex(i); setView('details'); }}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

/* ── Register Button ── */
function RegisterBtn({ onClick }) {
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
      className="em-ripple em-shine"
      style={{
        display:'flex', alignItems:'center', gap:'1rem', padding:'1rem 1.1rem',
        borderRadius:'1.125rem', cursor:'pointer', textAlign:'left',
        background:hovered?'var(--ink)':'var(--surface-raise)',
        border:`1.5px solid ${hovered?'var(--ink)':'var(--border)'}`,
        position:'relative', transition:'background 0.25s, border-color 0.25s', willChange:'transform',
        width:'100%', maxWidth:320,
      }}
    >
      <div style={{ position:'absolute', left:0, top:'20%', bottom:'20%', width:3, borderRadius:'0 3px 3px 0', background:'var(--accent)', transform:hovered?'scaleY(1)':'scaleY(0.35)', transition:'transform 0.3s var(--ease-spring)', transformOrigin:'center' }} />
      <div style={{ width:42, height:42, borderRadius:'0.875rem', display:'flex', alignItems:'center', justifyContent:'center', background:hovered?'rgba(249,115,22,0.15)':'var(--surface)', border:`1.5px solid ${hovered?'rgba(249,115,22,0.35)':'var(--border)'}`, flexShrink:0, transition:'all 0.25s, transform 0.3s var(--ease-spring)', transform:hovered?'scale(1.1) rotate(4deg)':'scale(1)' }}>
        <Plus style={{ width:18, height:18, color:hovered?'var(--accent)':'var(--ink-mid)', transition:'color 0.2s' }} strokeWidth={2.5} />
      </div>
      <div style={{ flex:1 }}>
        <p style={{ margin:0, fontSize:'0.9375rem', fontWeight:600, color:hovered?'#fff':'var(--ink)', transition:'color 0.2s' }}>Register New Employee</p>
        <p style={{ margin:'2px 0 0', fontSize:'0.8125rem', color:hovered?'rgba(255,255,255,0.42)':'var(--ink-faint)', transition:'color 0.2s' }}>Add a team member</p>
      </div>
      <ArrowUpRight style={{ width:15, height:15, color:hovered?'var(--accent)':'var(--border-strong)', transform:hovered?'translate(2px,-2px)':'translate(0,0)', transition:'transform 0.2s, color 0.2s', flexShrink:0 }} />
    </button>
  );
}

/* ── Employee Card ── */
function EmployeeCard({ employee, index, onClick }) {
  const ripple = useRipple();
  const { ref, onMouseMove, onMouseLeave } = useTilt(4);
  const [hovered, setHovered] = useState(false);
  const dotColor = EMP_COLORS[index % EMP_COLORS.length];

  return (
    <button
      ref={ref}
      onClick={(e) => { ripple(e); onClick(); }}
      onMouseMove={onMouseMove}
      onMouseLeave={() => { onMouseLeave(); setHovered(false); }}
      onMouseEnter={() => setHovered(true)}
      className="em-ripple em-shine"
      style={{
        textAlign:'left', cursor:'pointer', width:'100%',
        borderRadius:'1.25rem', padding:'1.25rem', paddingLeft:'1.375rem',
        background:'var(--surface-raise)',
        border:`1.5px solid ${hovered?dotColor+'55':'var(--border)'}`,
        position:'relative', overflow:'hidden',
        transition:'border-color 0.25s, box-shadow 0.25s',
        boxShadow:hovered?`0 8px 32px ${dotColor}22`:'0 2px 8px rgba(0,0,0,0.04)',
        willChange:'transform',
      }}
    >
      {/* top bar */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:dotColor, transform:hovered?'scaleX(1)':'scaleX(0)', transformOrigin:'left', transition:'transform 0.35s var(--ease-expo)' }} />
      {/* left accent */}
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:3, background:dotColor, opacity:0.65, borderRadius:'1.25rem 0 0 1.25rem' }} />
      {/* ambient glow */}
      <div style={{ position:'absolute', right:-20, bottom:-20, width:80, height:80, borderRadius:'50%', background:dotColor, opacity:hovered?0.09:0.04, transition:'opacity 0.3s', filter:'blur(20px)' }} />

      {/* Avatar + Name */}
      <div style={{ display:'flex', alignItems:'center', gap:'0.875rem', marginBottom:'0.875rem' }}>
        <div style={{ position:'relative', flexShrink:0 }}>
          <Avatar name={employee.full_name} dotColor={dotColor} />
          <span style={{ position:'absolute', bottom:-2, right:-2 }}><LiveDot /></span>
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <p className="em-font-display" style={{ fontSize:'1rem', fontWeight:400, color:'var(--ink)', lineHeight:1.2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontStyle:'italic', margin:0 }}>
            {employee.full_name}
          </p>
          <p style={{ fontSize:'0.75rem', color:'var(--ink-faint)', marginTop:'0.2rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {employee.mobile}
          </p>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', borderTop:`1px solid ${dotColor}18`, paddingTop:'0.75rem' }}>
        <span style={{ display:'inline-flex', alignItems:'center', gap:'0.35rem', padding:'0.25rem 0.625rem', borderRadius:'0.5rem', background:`${dotColor}12`, border:`1px solid ${dotColor}28`, color:dotColor, fontSize:'0.6875rem', fontWeight:700 }}>
          <Shield style={{ width:10, height:10 }} strokeWidth={2} />Staff
        </span>
        <div style={{ width:28, height:28, borderRadius:'0.625rem', display:'flex', alignItems:'center', justifyContent:'center', background:`${dotColor}15`, transform:hovered?'translate(2px,-2px)':'translate(0,0)', transition:'transform 0.2s' }}>
          <ChevronRight style={{ width:13, height:13, color:dotColor }} />
        </div>
      </div>
    </button>
  );
}

/* ── Empty Team ── */
function EmptyTeam({ onAdd }) {
  const ripple = useRipple();
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'5rem 2rem', gap:'1.25rem', animation:'em-fade-up 0.5s var(--ease-expo) both' }}>
      <div style={{ width:80, height:80, borderRadius:'1.5rem', background:'var(--surface-raise)', border:'2px dashed var(--border)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Users style={{ width:32, height:32, color:'var(--border-strong)' }} />
      </div>
      <div style={{ textAlign:'center' }}>
        <p className="em-font-display" style={{ fontSize:'1.125rem', fontWeight:400, color:'var(--ink-faint)', fontStyle:'italic' }}>No employees registered yet</p>
        <p style={{ fontSize:'0.8125rem', color:'var(--ink-faint)', marginTop:'0.375rem' }}>Add your first team member to get started.</p>
      </div>
      <button onClick={(e) => { ripple(e); onAdd(); }} className="em-ripple em-shine"
        style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.75rem 1.5rem', borderRadius:'0.875rem', background:'var(--ink)', color:'#fff', fontSize:'0.875rem', fontWeight:700, cursor:'pointer', border:'none', boxShadow:'0 4px 16px rgba(0,0,0,0.15)' }}>
        <Plus style={{ width:15, height:15, color:'var(--accent)' }} strokeWidth={2.5} />
        Add First Employee
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   REGISTER EMPLOYEE
═══════════════════════════════════════════════════════════════ */
function RegisterEmployee({ onCancel, onComplete }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ mobile:'', name:'' });
  const [done, setDone] = useState(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { defaultPassword } = await employeeService.registerEmployee(formData);
      setDone(defaultPassword);
      toast.success(`Employee registered! Default password: ${defaultPassword}`);
    } catch (err) { toast.error(err.message || 'Failed to register employee'); }
    finally { setLoading(false); }
  }

  return (
    <>
      <StyleInjector />
      <div className="em-font-body" style={{ backgroundColor:'var(--surface)', minHeight:'100vh', padding:'0.25rem' }}>
        <div style={{ maxWidth:540, margin:'0 auto', display:'flex', flexDirection:'column', gap:'1.5rem' }}>

          {/* Header */}
          <header className={mounted?'em-section-enter':''} style={{ background:'linear-gradient(135deg,#0d0d0d 0%,#181818 60%,#0d0d0d 100%)', borderRadius:'1.75rem', padding:'1.75rem', position:'relative', overflow:'hidden', boxShadow:'0 24px 60px -16px rgba(0,0,0,0.45)', animationDelay:'0s' }}>
            <div className="em-blob" style={{ width:220, height:220, background:'var(--accent)', opacity:0.06, top:-50, right:-30 }} />
            <div style={{ position:'absolute', right:28, top:28, width:80, height:80, animation:'em-spin-slow 20s linear infinite', pointerEvents:'none' }}>
              <div style={{ width:'100%', height:'100%', borderRadius:'50%', border:'1px dashed rgba(249,115,22,0.18)' }} />
            </div>
            <div style={{ position:'absolute', top:0, left:'8%', width:100, height:2, background:'linear-gradient(90deg,var(--accent),transparent)', opacity:0.55 }} />
            <div style={{ position:'absolute', right:49, top:49, pointerEvents:'none' }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent)', opacity:0.65, animation:'em-orbit 9s linear infinite' }} />
            </div>

            <div style={{ position:'relative', display:'flex', alignItems:'center', gap:'1rem' }}>
              <BackBtn onClick={onCancel} />
              <div>
                <p style={{ fontSize:'0.625rem', fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:'rgba(255,255,255,0.28)', marginBottom:'0.35rem' }}>Team Management</p>
                <h1 className="em-font-display" style={{ fontSize:'clamp(1.5rem,3.5vw,2.25rem)', fontWeight:400, lineHeight:1.1, color:'rgba(255,255,255,0.94)', fontStyle:'italic' }}>
                  Register <span style={{ color:'var(--accent)' }}>Employee</span>
                </h1>
              </div>
            </div>
          </header>

          {done ? (
            /* ── Success State ── */
            <div style={{ ...panelStyle, animation:'em-card-in 0.55s var(--ease-expo) 0.1s both' }}>
              <div style={topAccentBar} />
              {/* Success header */}
              <div style={{ borderRadius:'1rem', background:'var(--ink)', padding:'1.25rem', marginBottom:'1.25rem', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'#22c55e', opacity:0.8 }} />
                <div className="em-blob" style={{ width:100, height:100, background:'#22c55e', opacity:0.06, top:-25, right:-15 }} />
                <div style={{ position:'relative', display:'flex', alignItems:'center', gap:'0.875rem' }}>
                  <div style={{ width:40, height:40, borderRadius:'0.75rem', background:'rgba(34,197,94,0.15)', border:'1px solid rgba(34,197,94,0.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <CheckCircle2 style={{ width:20, height:20, color:'#22c55e' }} />
                  </div>
                  <div>
                    <p style={{ fontSize:'0.625rem', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(255,255,255,0.28)', marginBottom:'0.2rem' }}>Success</p>
                    <p style={{ fontSize:'0.9375rem', fontWeight:600, color:'rgba(255,255,255,0.92)', margin:0 }}>Employee Registered!</p>
                  </div>
                </div>
              </div>

              {/* Password display */}
              <div style={{ padding:'1.25rem', borderRadius:'1rem', background:'var(--accent-dim)', border:'1.5px solid var(--accent-mid)', textAlign:'center', marginBottom:'1rem' }}>
                <p style={{ fontSize:'0.625rem', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--accent)', marginBottom:'0.5rem' }}>Default Password</p>
                <p className="em-font-display" style={{ fontSize:'2.25rem', fontWeight:400, color:'var(--accent)', letterSpacing:'0.1em', margin:0, fontStyle:'italic' }}>{done}</p>
                <p style={{ fontSize:'0.75rem', color:'var(--ink-faint)', marginTop:'0.5rem' }}>Employee must change this on first login</p>
              </div>

              {/* Security note */}
              <div style={{ display:'flex', alignItems:'flex-start', gap:'0.625rem', padding:'0.875rem 1rem', borderRadius:'0.875rem', background:'#eff6ff', border:'1px solid #bfdbfe', marginBottom:'1rem' }}>
                <Shield style={{ width:15, height:15, color:'#3b82f6', flexShrink:0, marginTop:2 }} />
                <p style={{ fontSize:'0.8125rem', color:'#1d4ed8', margin:0, lineHeight:1.5 }}>
                  The employee will be prompted to change their password immediately after first login for security.
                </p>
              </div>

              <DoneBtn onClick={onComplete} />
            </div>
          ) : (
            /* ── Form ── */
            <div style={{ ...panelStyle, animation:'em-card-in 0.55s var(--ease-expo) 0.1s both' }}>
              <div style={topAccentBar} />
              <EmSectionLabel icon={Plus} label="Employee Details" />

              <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                <FormInputField
                  label="Mobile Number"
                  icon={Smartphone}
                  dotColor="#3b82f6"
                  value={formData.mobile}
                  placeholder="10-digit mobile number"
                  type="tel"
                  maxLength={10}
                  onChange={v => setFormData({ ...formData, mobile: v.replace(/\D/g,'') })}
                  required
                />
                <FormInputField
                  label="Full Name"
                  icon={User}
                  dotColor="#8b5cf6"
                  value={formData.name}
                  placeholder="Employee full name"
                  type="text"
                  onChange={v => setFormData({ ...formData, name: v })}
                  required
                />

                {/* Auto-password note */}
                <div style={{ display:'flex', alignItems:'flex-start', gap:'0.625rem', padding:'0.875rem 1rem', borderRadius:'0.875rem', background:'var(--accent-dim)', border:'1px solid var(--accent-mid)' }}>
                  <Shield style={{ width:14, height:14, color:'var(--accent)', flexShrink:0, marginTop:2 }} />
                  <div>
                    <p style={{ fontSize:'0.625rem', fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--accent)', marginBottom:'0.25rem' }}>Auto Password</p>
                    <p style={{ fontSize:'0.8125rem', color:'var(--ink-mid)', margin:0 }}>A secure default password is auto-generated. The employee must change it on first login.</p>
                  </div>
                </div>

                <RegisterSubmitBtn loading={loading} />
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Form Input Field ── */
function FormInputField({ label, icon: Icon, dotColor, value, placeholder, type, maxLength, onChange, required }) {
  const hasValue = !!value;
  return (
    <div style={{ position:'relative', display:'flex', alignItems:'center', gap:'0.875rem', padding:'1rem', borderRadius:'1rem', border:`1.5px solid ${hasValue?dotColor+'45':'var(--border)'}`, background:hasValue?`${dotColor}07`:'var(--surface)', transition:'border-color 0.2s, background 0.2s' }}>
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:3, borderRadius:'1rem 0 0 1rem', background:hasValue?dotColor:'var(--border)', transition:'background 0.2s' }} />
      <div style={{ width:38, height:38, borderRadius:'0.75rem', display:'flex', alignItems:'center', justifyContent:'center', background:hasValue?`${dotColor}15`:'var(--surface)', border:`1.5px solid ${hasValue?dotColor+'28':'var(--border)'}`, flexShrink:0, transition:'all 0.2s' }}>
        <Icon style={{ width:16, height:16, color:hasValue?dotColor:'var(--ink-faint)', transition:'color 0.2s' }} strokeWidth={2} />
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:'0.625rem', fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:hasValue?dotColor:'var(--ink-faint)', marginBottom:'0.3rem', transition:'color 0.2s' }}>{label}</p>
        <input type={type} required={required} maxLength={maxLength}
          value={value} placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          className="em-input" />
      </div>
    </div>
  );
}

/* ── Register Submit Button ── */
function RegisterSubmitBtn({ loading }) {
  const ripple = useRipple();
  const [hovered, setHovered] = useState(false);
  return (
    <button type="submit" disabled={loading} onClick={ripple}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      className="em-ripple em-shine"
      style={{ width:'100%', padding:'1rem', borderRadius:'1.125rem', fontSize:'0.9375rem', fontWeight:700, color: loading ? 'var(--ink-faint)' : '#fff', cursor:loading?'not-allowed':'pointer', background:loading?'var(--surface)':'var(--ink)', border:`1.5px solid ${hovered&&!loading?'var(--accent)':loading?'var(--border)':'var(--ink)'}`, boxShadow:hovered&&!loading?'0 8px 28px rgba(0,0,0,0.25)':'0 4px 16px rgba(0,0,0,0.12)', transition:'all 0.2s', transform:hovered&&!loading?'translateY(-1px)':'translateY(0)', opacity:loading?0.6:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem' }}>
      {loading ? (
        <><div style={{ width:16, height:16, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', animation:'em-spin-slow 0.7s linear infinite' }} />Registering…</>
      ) : (
        <><Zap style={{ width:16, height:16, color:'var(--accent)' }} strokeWidth={2.5} />Register Employee</>
      )}
    </button>
  );
}

/* ── Done Button ── */
function DoneBtn({ onClick }) {
  const ripple = useRipple();
  const [hovered, setHovered] = useState(false);
  return (
    <button onClick={(e) => { ripple(e); onClick(); }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      className="em-ripple em-shine"
      style={{ width:'100%', padding:'1rem', borderRadius:'1.125rem', fontSize:'0.9375rem', fontWeight:700, color:'#fff', cursor:'pointer', background:'var(--ink)', border:`1.5px solid ${hovered?'var(--accent)':'var(--ink)'}`, boxShadow:hovered?'0 8px 28px rgba(0,0,0,0.25)':'0 4px 16px rgba(0,0,0,0.12)', transition:'all 0.2s', transform:hovered?'translateY(-1px)':'translateY(0)', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem' }}>
      <CheckCircle2 style={{ width:16, height:16, color:'var(--accent)' }} strokeWidth={2.5} />
      Done — Back to Employees
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EMPLOYEE DETAILS
═══════════════════════════════════════════════════════════════ */
function EmployeeDetails({ employee, dotColor, onBack }) {
  const [activity, setActivity]       = useState([]);
  const [actLoading, setActLoading]   = useState(true);
  const [resetLoading, setResetLoading] = useState(false);
  const [newPassword, setNewPassword] = useState(null);
  const [mounted, setMounted]         = useState(false);
  useEffect(() => {
    fetchActivity();
    setTimeout(() => setMounted(true), 50);
  }, [employee.id]);

  async function fetchActivity() {
    try { setActLoading(true); const data = await employeeService.getEmployeeActivity(employee.id); setActivity(data); }
    catch (err) { console.error(err); }
    finally { setActLoading(false); }
  }

  async function handleResetPassword() {
    try {
      setResetLoading(true); setNewPassword(null);
      const { defaultPassword } = await employeeService.resetPassword(employee.id, employee.mobile);
      setNewPassword(defaultPassword);
      toast.success(`Password reset! New default: ${defaultPassword}`);
    } catch (err) { toast.error(err.message); }
    finally { setResetLoading(false); }
  }

  const STATUS_STYLES = {
    'Received':           { dot:'#3b82f6', text:'#1d4ed8', badgeBg:'#eff6ff', badgeBorder:'#bfdbfe' },
    'In Progress':        { dot:'#f97316', text:'#ea580c', badgeBg:'#fff7ed', badgeBorder:'#fed7aa' },
    'Waiting for Parts':  { dot:'#f59e0b', text:'#d97706', badgeBg:'#fffbeb', badgeBorder:'#fde68a' },
    'Completed':          { dot:'#10b981', text:'#059669', badgeBg:'#ecfdf5', badgeBorder:'#a7f3d0' },
    'Returned':           { dot:'#22c55e', text:'#16a34a', badgeBg:'#f0fdf4', badgeBorder:'#bbf7d0' },
  };

  return (
    <>
      <StyleInjector />
      <div className="em-font-body" style={{ backgroundColor:'var(--surface)', minHeight:'100vh', padding:'0.25rem', paddingBottom:'5rem' }}>
        <div style={{ maxWidth:660, margin:'0 auto', display:'flex', flexDirection:'column', gap:'1.5rem' }}>

          {/* Hero */}
          <header className={mounted?'em-section-enter':''} style={{ background:'linear-gradient(135deg,#0d0d0d 0%,#181818 60%,#0d0d0d 100%)', borderRadius:'1.75rem', padding:'1.75rem', position:'relative', overflow:'hidden', boxShadow:'0 24px 60px -16px rgba(0,0,0,0.45)', animationDelay:'0s' }}>
            <div className="em-blob" style={{ width:220, height:220, background:'var(--accent)', opacity:0.06, top:-50, right:-30 }} />
            <div className="em-blob" style={{ width:160, height:160, background:dotColor, opacity:0.05, bottom:-40, left:'25%', animationDelay:'5s' }} />
            <div style={{ position:'absolute', right:28, top:28, width:80, height:80, animation:'em-spin-slow 20s linear infinite', pointerEvents:'none' }}>
              <div style={{ width:'100%', height:'100%', borderRadius:'50%', border:'1px dashed rgba(249,115,22,0.18)' }} />
            </div>
            <div style={{ position:'absolute', right:36, top:36, width:52, height:52, animation:'em-spin-rev 9s linear infinite', pointerEvents:'none' }}>
              <div style={{ width:'100%', height:'100%', borderRadius:'50%', border:'1px solid rgba(249,115,22,0.10)' }} />
            </div>
            <div style={{ position:'absolute', right:49, top:49, pointerEvents:'none' }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent)', opacity:0.65, animation:'em-orbit 9s linear infinite' }} />
            </div>
            <div style={{ position:'absolute', top:0, left:'8%', width:100, height:2, background:'linear-gradient(90deg,var(--accent),transparent)', opacity:0.55 }} />

            <div style={{ position:'relative', display:'flex', alignItems:'center', gap:'1.125rem' }}>
              <BackBtn onClick={onBack} />
              <div style={{ position:'relative', flexShrink:0 }}>
                <Avatar name={employee.full_name} size="lg" dotColor={dotColor} />
                <span style={{ position:'absolute', bottom:-2, right:-2 }}><LiveDot /></span>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:'0.625rem', fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:'rgba(255,255,255,0.28)', marginBottom:'0.35rem' }}>Employee</p>
                <h1 className="em-font-display" style={{ fontSize:'clamp(1.375rem,3vw,2rem)', fontWeight:400, lineHeight:1.1, color:'rgba(255,255,255,0.94)', fontStyle:'italic', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {employee.full_name}
                </h1>
                <p style={{ fontSize:'0.8125rem', color:'rgba(255,255,255,0.35)', marginTop:'0.25rem' }}>{employee.mobile}</p>
              </div>
              <span style={{ padding:'0.375rem 0.875rem', borderRadius:'0.75rem', background:`${dotColor}18`, border:`1px solid ${dotColor}35`, fontSize:'0.625rem', fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', color:dotColor, flexShrink:0 }}>Staff</span>
            </div>
          </header>

          {/* Employee Info */}
          <section className={mounted?'em-section-enter':''} style={{ animationDelay:'0.1s' }}>
            <EmSectionLabel icon={User} label="Employee Info" />
            <div style={{ ...panelStyle }}>
              <div style={topAccentBar} />
              <div className="em-stagger" style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                {[
                  { label:'Full Name', value:employee.full_name, icon:User,       color:dotColor },
                  { label:'Mobile',   value:employee.mobile,    icon:Smartphone,  color:'#3b82f6' },
                  { label:'Role',     value:'Staff',             icon:Shield,      color:'#8b5cf6' },
                ].map(f => {
                  const { ref, onMouseMove, onMouseLeave } = useTilt(3);
                  return (
                    <div key={f.label} ref={ref} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}
                      style={{ position:'relative', display:'flex', alignItems:'center', gap:'0.875rem', padding:'1rem', borderRadius:'1rem', border:`1.5px solid ${f.color}22`, background:`${f.color}06`, willChange:'transform' }}>
                      <div style={{ position:'absolute', left:0, top:'20%', bottom:'20%', width:3, borderRadius:'0 3px 3px 0', background:f.color }} />
                      <div style={{ width:38, height:38, borderRadius:'0.75rem', display:'flex', alignItems:'center', justifyContent:'center', background:`${f.color}15`, border:`1.5px solid ${f.color}28`, flexShrink:0 }}>
                        <f.icon style={{ width:16, height:16, color:f.color }} strokeWidth={2} />
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:'0.625rem', fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:f.color, marginBottom:'0.25rem' }}>{f.label}</p>
                        <p className="em-font-display" style={{ fontSize:'1rem', fontWeight:400, color:'var(--ink)', fontStyle:'italic', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Security / Reset Password */}
          <section className={mounted?'em-section-enter':''} style={{ animationDelay:'0.18s' }}>
            <EmSectionLabel icon={KeyRound} label="Security" />
            <div style={panelStyle}>
              <div style={topAccentBar} />
              {newPassword && (
                <div style={{ padding:'1rem', borderRadius:'1rem', background:'var(--accent-dim)', border:'1.5px solid var(--accent-mid)', textAlign:'center', marginBottom:'1rem', animation:'em-card-in 0.4s var(--ease-spring) both' }}>
                  <p style={{ fontSize:'0.625rem', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--accent)', marginBottom:'0.375rem' }}>New Default Password</p>
                  <p className="em-font-display" style={{ fontSize:'2rem', fontWeight:400, color:'var(--accent)', letterSpacing:'0.1em', margin:0, fontStyle:'italic' }}>{newPassword}</p>
                </div>
              )}
              <ResetPasswordBtn loading={resetLoading} onClick={handleResetPassword} />
            </div>
          </section>

          {/* Recent Activity */}
          <section className={mounted?'em-section-enter':''} style={{ animationDelay:'0.26s' }}>
            <EmSectionLabel icon={Activity} label="Recent Activity" />
            <div style={panelStyle}>
              <div style={topAccentBar} />
              {actLoading ? (
                <div style={{ display:'flex', flexDirection:'column', gap:'0.625rem' }}>
                  {[...Array(3)].map((_,i) => <div key={i} style={{ height:72, borderRadius:'0.875rem', background:'#f3f4f6', animation:`em-card-in 0.3s ease ${i*0.06}s both` }} />)}
                </div>
              ) : activity.length === 0 ? (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:140, borderRadius:'0.875rem', border:'2px dashed var(--border)', background:'var(--surface)', gap:'0.5rem' }}>
                  <Clock style={{ width:24, height:24, color:'var(--border-strong)' }} />
                  <p style={{ fontSize:'0.8125rem', fontWeight:600, color:'var(--ink-faint)' }}>No activity found</p>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'0.625rem' }}>
                  {activity.map((act, i) => {
                    const ss = STATUS_STYLES[act.status] || { dot:'#6b7280', text:'#374151', badgeBg:'#f9fafb', badgeBorder:'#e5e7eb' };
                    return (
                      <div key={i} style={{ position:'relative', display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.875rem', borderRadius:'0.875rem', border:`1px solid ${ss.badgeBorder}`, background:`${ss.badgeBg}80`, animation:`em-card-in 0.45s var(--ease-expo) ${i*0.06}s both` }}>
                        <div style={{ position:'relative', flexShrink:0 }}>
                          <span style={{ display:'block', width:10, height:10, borderRadius:'50%', background:ss.dot }} />
                          <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:ss.dot, opacity:0.35, animation:'em-live-ring 2.5s ease-out infinite' }} />
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p className="em-font-display" style={{ fontSize:'0.9375rem', fontWeight:400, color:'var(--ink)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', margin:0, fontStyle:'italic' }}>
                            {act.services?.customer_name || 'Unknown'}
                          </p>
                          <p style={{ fontSize:'0.75rem', color:'var(--ink-faint)', margin:'0.2rem 0 0.4rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {[act.services?.device_brand, act.services?.device_model].filter(Boolean).join(' ') || 'Device'}
                          </p>
                          <span style={{ display:'inline-flex', alignItems:'center', gap:'0.35rem', padding:'0.2rem 0.6rem', borderRadius:'0.375rem', background:ss.badgeBg, border:`1px solid ${ss.badgeBorder}`, color:ss.dot, fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase' }}>
                            <span style={{ width:5, height:5, borderRadius:'50%', background:ss.dot, display:'inline-block' }} />
                            {act.status}
                          </span>
                        </div>
                        <span style={{ fontSize:'0.6875rem', fontWeight:500, color:'var(--ink-faint)', flexShrink:0 }}>{formatDate(act.created_at)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

/* ── Reset Password Button ── */
function ResetPasswordBtn({ loading, onClick }) {
  const ripple = useRipple();
  const { ref, onMouseMove, onMouseLeave } = useTilt(4);
  const [hovered, setHovered] = useState(false);
  return (
    <button ref={ref} onClick={(e) => { ripple(e); onClick(); }} onMouseMove={onMouseMove}
      onMouseLeave={() => { onMouseLeave(); setHovered(false); }}
      onMouseEnter={() => setHovered(true)}
      disabled={loading}
      className="em-ripple em-shine"
      style={{
        width:'100%', display:'flex', alignItems:'center', gap:'0.875rem', padding:'1rem', borderRadius:'1rem', cursor:loading?'not-allowed':'pointer', textAlign:'left',
        background:hovered?'var(--ink)':'var(--surface-raise)',
        border:`1.5px solid ${hovered?'var(--accent)':'var(--border)'}`,
        position:'relative', transition:'background 0.25s, border-color 0.25s', willChange:'transform',
        opacity:loading?0.6:1,
      }}>
      <div style={{ position:'absolute', left:0, top:'20%', bottom:'20%', width:3, borderRadius:'0 3px 3px 0', background:'var(--accent)', transform:hovered?'scaleY(1)':'scaleY(0.35)', transition:'transform 0.3s var(--ease-spring)', transformOrigin:'center' }} />
      <div style={{ width:40, height:40, borderRadius:'0.875rem', display:'flex', alignItems:'center', justifyContent:'center', background:hovered?'rgba(249,115,22,0.15)':'var(--surface)', border:`1.5px solid ${hovered?'rgba(249,115,22,0.35)':'var(--border)'}`, flexShrink:0, transition:'all 0.25s, transform 0.3s var(--ease-spring)', transform:hovered?'scale(1.1) rotate(4deg)':'scale(1)' }}>
        <RefreshCw style={{ width:17, height:17, color:hovered?'var(--accent)':'var(--ink-mid)', transition:'color 0.2s', animation:loading?'em-spin-slow 1s linear infinite':'none' }} strokeWidth={2.5} />
      </div>
      <div style={{ flex:1 }}>
        <p style={{ margin:0, fontSize:'0.9375rem', fontWeight:600, color:hovered?'#fff':'var(--ink)', transition:'color 0.2s' }}>Reset Password</p>
        <p style={{ margin:'2px 0 0', fontSize:'0.8125rem', color:hovered?'rgba(255,255,255,0.42)':'var(--ink-faint)', transition:'color 0.2s' }}>Generate a new default password</p>
      </div>
      <ArrowUpRight style={{ width:15, height:15, color:hovered?'var(--accent)':'var(--border-strong)', transform:hovered?'translate(2px,-2px)':'translate(0,0)', transition:'transform 0.2s, color 0.2s', flexShrink:0 }} />
    </button>
  );
}
