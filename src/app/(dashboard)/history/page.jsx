'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { historyService } from '@/services/historyService';
import { useAuth } from '@/components/AuthProvider';
import {
  Search, ChevronRight, Wrench, ShoppingBag, User,
  MapPin, Smartphone, SlidersHorizontal, Clock,
  IndianRupee, PackageCheck, ArrowLeft, Calendar,
  TrendingUp, Activity, Sparkles, CheckCircle2,
  Tag, Hash, ChevronDown, X, ArrowUpRight, ReceiptText,
} from 'lucide-react';
import { cn, formatCurrency, formatDate, formatDateTime, formatNumber } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════
   DESIGN SYSTEM — exact mirror of dashboard + services + sales
   ─ Single accent: #f97316  |  Ink: #0d0d0d  |  Surface: #f9fafb
   ─ Fonts: Instrument Serif (display) + Geist (body)
   ─ Motion: tilt, stagger, morph, shine, ripple, orbit
═══════════════════════════════════════════════════════════════ */

const HISTORY_STYLES = `
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

.hy-font-display { font-family: 'Instrument Serif', Georgia, serif; }
.hy-font-body    { font-family: 'Geist', system-ui, sans-serif; }

/* ── Keyframes ── */
@keyframes hy-fade-up {
  from { opacity:0; transform:translateY(20px); filter:blur(4px); }
  to   { opacity:1; transform:translateY(0);    filter:blur(0); }
}
@keyframes hy-card-in {
  from { opacity:0; transform:translateY(16px) scale(0.97); filter:blur(3px); }
  to   { opacity:1; transform:translateY(0)    scale(1);    filter:blur(0); }
}
@keyframes hy-num-rise {
  from { opacity:0; transform:translateY(10px) scale(0.9); }
  to   { opacity:1; transform:translateY(0)    scale(1); }
}
@keyframes hy-spin-slow  { from { transform:rotate(0deg); }  to { transform:rotate(360deg); } }
@keyframes hy-spin-rev   { from { transform:rotate(0deg); }  to { transform:rotate(-360deg); } }
@keyframes hy-blink      { 0%,100%{ opacity:1; } 50%{ opacity:0.2; } }
@keyframes hy-live-ring  {
  0%   { transform:scale(1);   opacity:0.5; }
  70%  { transform:scale(2.4); opacity:0; }
  100% { transform:scale(2.4); opacity:0; }
}
@keyframes hy-blob-morph {
  0%,100% { border-radius:60% 40% 30% 70% / 60% 30% 70% 40%; }
  33%      { border-radius:30% 70% 60% 40% / 50% 60% 30% 60%; }
  66%      { border-radius:50% 30% 70% 40% / 40% 70% 30% 60%; }
}
@keyframes hy-shine      { from { left:-80%; } to { left:130%; } }
@keyframes hy-ripple-out { from { transform:scale(0); opacity:0.35; } to { transform:scale(3.5); opacity:0; } }
@keyframes hy-slide-right{ from { opacity:0; transform:translateX(-14px); } to { opacity:1; transform:translateX(0); } }
@keyframes hy-orbit {
  from { transform:rotate(0deg) translateX(44px) rotate(0deg); }
  to   { transform:rotate(360deg) translateX(44px) rotate(-360deg); }
}
@keyframes hy-underline {
  from { transform:scaleX(0); transform-origin:left; }
  to   { transform:scaleX(1); transform-origin:left; }
}
@keyframes hy-pulse-ring {
  0%   { transform:scale(0.85); opacity:0.6; }
  70%  { transform:scale(1.7);  opacity:0; }
  100% { transform:scale(1.7);  opacity:0; }
}

/* ── Stagger ── */
.hy-stagger > *:nth-child(1)  { animation:hy-card-in 0.52s var(--ease-expo) 0.04s both; }
.hy-stagger > *:nth-child(2)  { animation:hy-card-in 0.52s var(--ease-expo) 0.09s both; }
.hy-stagger > *:nth-child(3)  { animation:hy-card-in 0.52s var(--ease-expo) 0.14s both; }
.hy-stagger > *:nth-child(4)  { animation:hy-card-in 0.52s var(--ease-expo) 0.19s both; }
.hy-stagger > *:nth-child(5)  { animation:hy-card-in 0.52s var(--ease-expo) 0.24s both; }
.hy-stagger > *:nth-child(6)  { animation:hy-card-in 0.52s var(--ease-expo) 0.29s both; }
.hy-stagger > *:nth-child(7)  { animation:hy-card-in 0.52s var(--ease-expo) 0.34s both; }
.hy-stagger > *:nth-child(8)  { animation:hy-card-in 0.52s var(--ease-expo) 0.39s both; }
.hy-stagger > *:nth-child(9)  { animation:hy-card-in 0.52s var(--ease-expo) 0.44s both; }

.hy-section-enter { animation:hy-fade-up 0.65s var(--ease-expo) both; }

/* ── Shine ── */
.hy-shine { position:relative; overflow:hidden; }
.hy-shine::before {
  content:'';
  position:absolute; top:-50%; left:-80%;
  width:50%; height:200%;
  background:linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.5) 50%,transparent 70%);
  transform:skewX(-20deg);
  pointer-events:none; z-index:2;
}
.hy-shine:hover::before { animation:hy-shine 0.5s ease forwards; }

/* ── Ripple ── */
.hy-ripple { position:relative; overflow:hidden; }
.hy-ripple-circle {
  position:absolute; border-radius:50%;
  background:rgba(255,255,255,0.28);
  transform:scale(0);
  animation:hy-ripple-out 0.6s linear forwards;
  pointer-events:none;
}

/* ── Blob ── */
.hy-blob {
  border-radius:60% 40% 30% 70% / 60% 30% 70% 40%;
  animation:hy-blob-morph 10s ease-in-out infinite;
  position:absolute; pointer-events:none;
}

/* ── Input ── */
.hy-input {
  width:100%;
  border-radius:0.875rem;
  border:1.5px solid var(--border);
  padding:0.6875rem 0.875rem;
  font-size:0.84375rem;
  font-family:'Geist', system-ui, sans-serif;
  font-weight:500;
  color:var(--ink);
  background:var(--surface-raise);
  outline:none;
  transition:border-color 0.2s, box-shadow 0.2s;
}
.hy-input:focus {
  border-color:var(--accent);
  box-shadow:0 0 0 3px var(--accent-dim);
}
.hy-input::placeholder { color:var(--ink-faint); }

.hy-label {
  display:block;
  font-size:0.625rem;
  font-weight:700;
  letter-spacing:0.12em;
  text-transform:uppercase;
  color:var(--ink-faint);
  margin-bottom:0.375rem;
  font-family:'Geist', system-ui, sans-serif;
}
`;

function HistoryStyleInjector() {
  useEffect(() => {
    if (document.getElementById('hy-v2-styles')) return;
    const el = document.createElement('style');
    el.id = 'hy-v2-styles';
    el.textContent = HISTORY_STYLES;
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
    circle.className = 'hy-ripple-circle';
    Object.assign(circle.style, {
      width: `${d}px`, height: `${d}px`,
      left: `${e.clientX - r.left - d / 2}px`,
      top:  `${e.clientY - r.top  - d / 2}px`,
    });
    btn.appendChild(circle);
    setTimeout(() => circle.remove(), 700);
  }, []);
}

/* ── 3D Tilt hook ── */
function useTilt(strength = 6) {
  const ref = useRef(null);
  const onMove = useCallback((e) => {
    const el = ref.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width / 2)  / (rect.width / 2);
    const dy = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);
    el.style.transform = `perspective(700px) rotateY(${dx * strength}deg) rotateX(${-dy * strength}deg) translateY(-3px) scale(1.018)`;
    el.style.boxShadow = `${-dx * 6}px ${dy * 6}px 28px rgba(0,0,0,0.09), 0 0 0 1.5px rgba(249,115,22,0.22)`;
  }, [strength]);
  const onLeave = useCallback(() => {
    const el = ref.current; if (!el) return;
    el.style.transform = '';
    el.style.boxShadow = '';
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

/* ── Panel + topbar shared styles ── */
const panelStyle = {
  background: 'var(--surface-raise)', border: '1px solid var(--border)',
  borderRadius: '1.5rem', padding: '1.5rem',
  position: 'relative', overflow: 'hidden',
  boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
};
const topAccentBar = {
  position: 'absolute', top: 0, left: '1.5rem', right: '1.5rem', height: 2,
  background: 'linear-gradient(90deg, var(--accent), transparent)',
  borderRadius: '0 0 3px 3px', opacity: 0.5,
};

/* ── Section Label — identical to dashboard ── */
function HySectionLabel({ icon: Icon, label }) {
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

/* ── Back Button ── */
function BackBtn({ onClick }) {
  const ripple = useRipple();
  return (
    <button onClick={(e) => { ripple(e); onClick(); }} className="hy-ripple"
      style={{ width:40, height:40, borderRadius:'0.875rem', display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.15)', cursor:'pointer', color:'#fff', flexShrink:0 }}>
      <ArrowLeft style={{ width:16, height:16 }} />
    </button>
  );
}

/* ── Status helpers ── */
function getStatusStyles(status = '') {
  const s = status.toLowerCase();
  const make = (dot, text, badgeBg, badgeBorder, dotColor) => ({ dot, text, badgeBg, badgeBorder, dotColor });
  if (s.includes('received'))   return make('#3b82f6','#1d4ed8','#eff6ff','#bfdbfe','#3b82f6');
  if (s.includes('diagnosed'))  return make('#8b5cf6','#7c3aed','#f5f3ff','#ddd6fe','#8b5cf6');
  if (s.includes('repair')||s.includes('in repair')||s.includes('repairing')||s.includes('in progress'))
                                 return make('#f97316','#ea580c','#fff7ed','#fed7aa','#f97316');
  if (s.includes('waiting'))    return make('#f59e0b','#d97706','#fffbeb','#fde68a','#f59e0b');
  if (s.includes('completed'))  return make('#10b981','#059669','#ecfdf5','#a7f3d0','#10b981');
  if (s.includes('returned'))   return make('#22c55e','#16a34a','#f0fdf4','#bbf7d0','#22c55e');
  if (s.includes('cancel')||s.includes('non repairable')||s.includes('not repairable')||s.includes('rejected'))
                                 return make('#ef4444','#dc2626','#fef2f2','#fecaca','#ef4444');
  return make('#6b7280','#374151','#f9fafb','#e5e7eb','#6b7280');
}
function formatStatusLabel(s = '') { return s.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase()); }

/* ── Card accent palette (semantic, not decorative) ── */
const SERVICE_ACCENTS = ['#3b82f6','#10b981','#8b5cf6','#06b6d4','#f59e0b','#ec4899'];
const SALE_ACCENTS    = ['#10b981','#3b82f6','#8b5cf6','#06b6d4','#f59e0b','#ec4899'];

/* ═══════════════════════════════════════════════════════════════
   SERVICE CARD
═══════════════════════════════════════════════════════════════ */
function ServiceCard({ service, onClick, index }) {
  const ripple = useRipple();
  const { ref, onMouseMove, onMouseLeave } = useTilt(4);
  const [hovered, setHovered] = useState(false);
  const dotColor = SERVICE_ACCENTS[index % SERVICE_ACCENTS.length];

  return (
    <button
      ref={ref}
      onClick={(e) => { ripple(e); onClick(); }}
      onMouseMove={onMouseMove}
      onMouseLeave={() => { onMouseLeave(); setHovered(false); }}
      onMouseEnter={() => setHovered(true)}
      className="hy-ripple hy-shine"
      style={{
        textAlign:'left', cursor:'pointer', width:'100%',
        borderRadius:'1.25rem', padding:'1.25rem', paddingLeft:'1.375rem',
        background:'var(--surface-raise)',
        border:`1.5px solid ${hovered ? dotColor+'55' : 'var(--border)'}`,
        position:'relative', overflow:'hidden',
        transition:'border-color 0.25s, box-shadow 0.25s',
        boxShadow: hovered ? `0 8px 32px ${dotColor}22` : '0 2px 8px rgba(0,0,0,0.04)',
        willChange:'transform',
      }}
    >
      {/* top bar reveal */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:dotColor, transform:hovered?'scaleX(1)':'scaleX(0)', transformOrigin:'left', transition:'transform 0.35s var(--ease-expo)' }} />
      {/* left accent */}
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:3, background:dotColor, opacity:0.65, borderRadius:'1.25rem 0 0 1.25rem' }} />
      {/* ambient glow */}
      <div style={{ position:'absolute', right:-20, bottom:-20, width:80, height:80, borderRadius:'50%', background:dotColor, opacity:hovered?0.09:0.04, transition:'opacity 0.3s', filter:'blur(20px)' }} />

      {/* ticket + arrow */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'0.5rem', marginBottom:'0.75rem' }}>
        <div style={{ minWidth:0, flex:1 }}>
          <p style={{ fontSize:'0.625rem', fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', color:dotColor, marginBottom:'0.3rem' }}>{service.ticket_number}</p>
          <p className="hy-font-display" style={{ fontSize:'1rem', fontWeight:400, color:'var(--ink)', lineHeight:1.2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontStyle:'italic' }}>
            {service.customer_name}
          </p>
          <div style={{ display:'flex', alignItems:'center', gap:'0.375rem', marginTop:'0.2rem' }}>
            <Smartphone style={{ width:11, height:11, color:'var(--ink-faint)', flexShrink:0 }} />
            <p style={{ fontSize:'0.75rem', color:'var(--ink-faint)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{service.device_brand} {service.device_model}</p>
          </div>
        </div>
        <div style={{ width:28, height:28, borderRadius:'0.625rem', display:'flex', alignItems:'center', justifyContent:'center', background:`${dotColor}15`, flexShrink:0, transform:hovered?'translate(2px,-2px)':'translate(0,0)', transition:'transform 0.2s' }}>
          <ArrowUpRight style={{ width:13, height:13, color:dotColor }} />
        </div>
      </div>

      {/* issue chip */}
      <div style={{ marginBottom:'0.875rem' }}>
        <span style={{ display:'inline-flex', alignItems:'center', gap:'0.35rem', padding:'0.25rem 0.625rem', borderRadius:'0.5rem', background:`${dotColor}12`, border:`1px solid ${dotColor}25`, color:dotColor, fontSize:'0.6875rem', fontWeight:700 }}>
          <Wrench style={{ width:10, height:10 }} strokeWidth={2} />{service.issue_type}
        </span>
      </div>

      {/* bottom row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', borderTop:`1px solid ${dotColor}15`, paddingTop:'0.75rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
          <Calendar style={{ width:11, height:11, color:'var(--ink-faint)' }} />
          <span style={{ fontSize:'0.6875rem', fontWeight:600, color:'var(--ink-faint)' }}>{formatDate(service.returned_at || service.updated_at)}</span>
        </div>
        <div style={{ display:'flex', alignItems:'baseline', gap:'0.25rem' }}>
          <span style={{ fontSize:'0.6875rem', color:'var(--ink-faint)', fontWeight:500 }}>₹</span>
          <span className="hy-font-display" style={{ fontSize:'1.125rem', fontWeight:400, color:dotColor, fontStyle:'italic' }}>{formatNumber(service.final_amount)}</span>
        </div>
      </div>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SALE CARD
═══════════════════════════════════════════════════════════════ */
function SaleCard({ sale, index }) {
  const { ref, onMouseMove, onMouseLeave } = useTilt(4);
  const [hovered, setHovered] = useState(false);
  const dotColor = SALE_ACCENTS[index % SALE_ACCENTS.length];
  const total = (Number(sale.price) || 0) * (Number(sale.quantity) || 1);

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={() => { onMouseLeave(); setHovered(false); }}
      onMouseEnter={() => setHovered(true)}
      className="hy-shine"
      style={{
        borderRadius:'1.25rem', padding:'1.25rem', paddingLeft:'1.375rem',
        background:'var(--surface-raise)',
        border:`1.5px solid ${hovered ? dotColor+'55' : 'var(--border)'}`,
        position:'relative', overflow:'hidden',
        transition:'border-color 0.25s, box-shadow 0.25s',
        boxShadow: hovered ? `0 8px 32px ${dotColor}22` : '0 2px 8px rgba(0,0,0,0.04)',
        willChange:'transform', cursor:'default',
      }}
    >
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:dotColor, transform:hovered?'scaleX(1)':'scaleX(0)', transformOrigin:'left', transition:'transform 0.35s var(--ease-expo)' }} />
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:3, background:dotColor, opacity:0.65, borderRadius:'1.25rem 0 0 1.25rem' }} />
      <div style={{ position:'absolute', right:-20, bottom:-20, width:80, height:80, borderRadius:'50%', background:dotColor, opacity:hovered?0.09:0.04, transition:'opacity 0.3s', filter:'blur(20px)' }} />

      {/* icon + price */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'0.5rem', marginBottom:'0.75rem' }}>
        <div style={{ width:40, height:40, borderRadius:'0.875rem', display:'flex', alignItems:'center', justifyContent:'center', background:`${dotColor}15`, border:`1.5px solid ${dotColor}28`, flexShrink:0, transform:hovered?'scale(1.08) rotate(3deg)':'scale(1)', transition:'transform 0.3s var(--ease-spring)' }}>
          <ShoppingBag style={{ width:18, height:18, color:dotColor }} strokeWidth={2} />
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ display:'flex', alignItems:'baseline', gap:'0.25rem', justifyContent:'flex-end' }}>
            <span style={{ fontSize:'0.75rem', color:'var(--ink-faint)', fontWeight:500 }}>₹</span>
            <span className="hy-font-display" style={{ fontSize:'1.125rem', fontWeight:400, color:dotColor, fontStyle:'italic' }}>{formatNumber(sale.price)}</span>
          </div>
          <p style={{ fontSize:'0.6875rem', color:'var(--ink-faint)', fontWeight:500 }}>per unit</p>
        </div>
      </div>

      <p className="hy-font-display" style={{ fontSize:'1rem', fontWeight:400, color:'var(--ink)', lineHeight:1.2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontStyle:'italic', marginBottom:'0.2rem' }}>
        {sale.product_name}
      </p>
      <p style={{ fontSize:'0.75rem', color:'var(--ink-faint)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:'0.875rem' }}>{sale.brand_type}</p>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', borderTop:`1px solid ${dotColor}15`, paddingTop:'0.75rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <span style={{ display:'inline-flex', alignItems:'center', gap:'0.3rem', padding:'0.25rem 0.625rem', borderRadius:'0.5rem', background:`${dotColor}12`, color:dotColor, fontSize:'0.6875rem', fontWeight:700 }}>
            <PackageCheck style={{ width:11, height:11 }} strokeWidth={2} />Qty {sale.quantity}
          </span>
          {sale.quantity > 1 && (
            <span style={{ fontSize:'0.8125rem', fontWeight:800, color:'var(--ink)' }}>= {formatCurrency(total)}</span>
          )}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'0.375rem' }}>
          <User style={{ width:11, height:11, color:'var(--ink-faint)' }} />
          <span style={{ fontSize:'0.6875rem', fontWeight:600, color:'var(--ink-faint)', overflow:'hidden', textOverflow:'ellipsis', maxWidth:80, whiteSpace:'nowrap' }}>
            {sale.profiles?.full_name || 'Staff'}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STAT CARD (summary strip)
═══════════════════════════════════════════════════════════════ */
function StatCard({ label, value, icon: Icon, dotColor, isCurrency, delay = 0 }) {
  const animated = typeof value === 'number' ? useCountUp(value, 800, delay) : value;
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ borderRadius:'1.25rem', padding:'1.125rem', background:'var(--surface-raise)', border:`1.5px solid ${hovered ? dotColor+'50' : 'var(--border)'}`, position:'relative', overflow:'hidden', transition:'border-color 0.2s, box-shadow 0.2s', boxShadow:hovered?`0 6px 24px ${dotColor}1a`:'0 2px 8px rgba(0,0,0,0.03)' }}
    >
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:dotColor, transform:hovered?'scaleX(1)':'scaleX(0)', transformOrigin:'left', transition:'transform 0.3s var(--ease-expo)' }} />
      <div style={{ position:'absolute', right:-14, bottom:-14, width:56, height:56, borderRadius:'50%', background:dotColor, opacity:hovered?0.1:0.04, transition:'opacity 0.3s', filter:'blur(14px)' }} />
      <div style={{ width:30, height:30, borderRadius:'0.5rem', display:'flex', alignItems:'center', justifyContent:'center', background:`${dotColor}15`, border:`1px solid ${dotColor}28`, marginBottom:'0.5rem', transform:hovered?'scale(1.1) rotate(-4deg)':'scale(1)', transition:'transform 0.3s var(--ease-spring)' }}>
        <Icon style={{ width:14, height:14, color:dotColor }} strokeWidth={2} />
      </div>
      <p style={{ fontSize:isCurrency?'1rem':'1.5rem', fontWeight:800, letterSpacing:'-0.03em', lineHeight:1, color:'var(--ink)', margin:0, animation:'hy-num-rise 0.5s var(--ease-spring) both' }}>
        {isCurrency ? value : animated}
      </p>
      <p style={{ marginTop:'0.3rem', fontSize:'0.6875rem', fontWeight:600, color:'var(--ink-faint)', textTransform:'uppercase', letterSpacing:'0.08em' }}>{label}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EMPTY STATE
═══════════════════════════════════════════════════════════════ */
function EmptyState({ icon: Icon, label }) {
  return (
    <div style={{ gridColumn:'1/-1', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'6rem 2rem', gap:'1.25rem', animation:'hy-fade-up 0.5s var(--ease-expo) both' }}>
      <div style={{ position:'relative' }}>
        <div style={{ width:80, height:80, borderRadius:'1.5rem', background:'var(--surface-raise)', border:'2px dashed var(--border)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Icon style={{ width:32, height:32, color:'var(--border-strong)' }} />
        </div>
      </div>
      <div style={{ textAlign:'center' }}>
        <p className="hy-font-display" style={{ fontSize:'1.125rem', fontWeight:400, color:'var(--ink-faint)', fontStyle:'italic' }}>No {label} found</p>
        <p style={{ fontSize:'0.8125rem', color:'var(--ink-faint)', marginTop:'0.375rem' }}>Try adjusting your filters</p>
      </div>
    </div>
  );
}

/* ── Card Skeleton ── */
function CardSkeleton({ index = 0 }) {
  return (
    <div style={{ height:164, borderRadius:'1.25rem', background:'#f3f4f6', animation:`hy-card-in 0.4s var(--ease-expo) ${index * 0.05}s both`, position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:3, background:'var(--border)', borderRadius:'1.25rem 0 0 1.25rem' }} />
    </div>
  );
}

/* ── Detail info item ── */
function InfoItem({ label, value, icon: Icon, color = 'var(--accent)' }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'0.375rem' }}>
      <label className="hy-label">{label}</label>
      <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
        <div style={{ width:28, height:28, borderRadius:'0.5rem', display:'flex', alignItems:'center', justifyContent:'center', background:`${color}15`, border:`1px solid ${color}25`, flexShrink:0 }}>
          <Icon style={{ width:13, height:13, color }} strokeWidth={2} />
        </div>
        <p style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--ink)', margin:0 }}>{value}</p>
      </div>
    </div>
  );
}

/* ── Active Filter Chip ── */
function FilterChip({ label, onRemove, color = 'var(--accent)' }) {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:'0.3rem', padding:'0.25rem 0.625rem', borderRadius:'9999px', background:`${color}12`, border:`1px solid ${color}30`, color, fontSize:'0.6875rem', fontWeight:700 }}>
      {label}
      <button onClick={onRemove} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', color, opacity:0.7, padding:0 }}>
        <X style={{ width:10, height:10 }} />
      </button>
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SERVICE HISTORY DETAILS
═══════════════════════════════════════════════════════════════ */
function ServiceHistoryDetails({ service, onBack, profile }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (service?.id) fetchHistory();
    setTimeout(() => setMounted(true), 50);
  }, [service?.id]);

  async function fetchHistory() {
    try {
      setLoading(true);
      const data = await historyService.getServiceTimeline(service.id);
      setHistory(data || []);
    } catch { setHistory([]); }
    finally { setLoading(false); }
  }

  const isAdmin      = profile?.role === 'admin' || profile?.role === 'owner';
  const isTechnician = profile?.role === 'technician';
  const isEmployee   = profile?.role === 'employee';
  const duration     = service.returned_at ? Math.ceil((new Date(service.returned_at) - new Date(service.created_at)) / (1000*60*60*24)) : null;
  const profitLoss   = (Number(service.final_amount) || 0) - (Number(service.estimated_cost) || 0);

  return (
    <div className="hy-font-body" style={{ backgroundColor:'var(--surface)', minHeight:'100vh', paddingBottom:'5rem' }}>
      <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>

        {/* Hero */}
        <header
          className={cn(mounted && 'hy-section-enter')}
          style={{ background:'linear-gradient(135deg,#0d0d0d 0%,#181818 60%,#0d0d0d 100%)', borderRadius:'1.75rem', padding:'1.75rem', position:'relative', overflow:'hidden', boxShadow:'0 24px 60px -16px rgba(0,0,0,0.45)', animationDelay:'0s' }}
        >
          <div className="hy-blob" style={{ width:250, height:250, background:'var(--accent)', opacity:0.06, top:-55, right:-35 }} />
          <div className="hy-blob" style={{ width:160, height:160, background:'var(--accent)', opacity:0.04, bottom:-40, left:'20%', animationDelay:'4s' }} />
          <div style={{ position:'absolute', right:28, top:28, width:88, height:88, animation:'hy-spin-slow 20s linear infinite', pointerEvents:'none' }}>
            <div style={{ width:'100%', height:'100%', borderRadius:'50%', border:'1px dashed rgba(249,115,22,0.18)' }} />
          </div>
          <div style={{ position:'absolute', right:36, top:36, width:54, height:54, animation:'hy-spin-rev 9s linear infinite', pointerEvents:'none' }}>
            <div style={{ width:'100%', height:'100%', borderRadius:'50%', border:'1px solid rgba(249,115,22,0.10)' }} />
          </div>
          <div style={{ position:'absolute', right:49, top:49, pointerEvents:'none' }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent)', opacity:0.65, animation:'hy-orbit 9s linear infinite' }} />
          </div>
          <div style={{ position:'absolute', top:0, left:'8%', width:100, height:2, background:'linear-gradient(90deg,var(--accent),transparent)', opacity:0.55 }} />

          <div style={{ position:'relative', display:'flex', flexWrap:'wrap', alignItems:'flex-end', justifyContent:'space-between', gap:'1.25rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'1rem', minWidth:0 }}>
              <BackBtn onClick={onBack} />
              <div style={{ minWidth:0 }}>
                <p style={{ fontSize:'0.625rem', fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:'rgba(255,255,255,0.28)', marginBottom:'0.35rem' }}>Service History</p>
                <h1 className="hy-font-display" style={{ fontSize:'clamp(1.375rem,3vw,2rem)', fontWeight:400, lineHeight:1.1, color:'rgba(255,255,255,0.94)', fontStyle:'italic', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {service.customer_name}
                </h1>
                <p style={{ fontSize:'0.8125rem', color:'rgba(255,255,255,0.35)', marginTop:'0.25rem' }}>{service.device_brand} {service.device_model}</p>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap', flexShrink:0 }}>
              <span style={{ padding:'0.375rem 0.875rem', borderRadius:'0.75rem', background:'rgba(249,115,22,0.15)', border:'1px solid rgba(249,115,22,0.3)', fontSize:'0.625rem', fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--accent)' }}>
                {service.ticket_number}
              </span>
              <div style={{ background:'rgba(255,255,255,0.06)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:'1.125rem', padding:'0.75rem 1.25rem', textAlign:'right' }}>
                <p style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(255,255,255,0.28)', marginBottom:'0.2rem' }}>Collected</p>
                <p style={{ fontSize:'1.375rem', fontWeight:800, letterSpacing:'-0.03em', color:'var(--accent)', margin:0 }}>{formatCurrency(service.final_amount)}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Body grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'1.5rem', alignItems:'start' }}>

          {/* Left — Customer + Timeline */}
          <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem', gridColumn:'span 2' }}>

            {/* Customer & Device */}
            <div style={{ ...panelStyle, animation:'hy-card-in 0.55s var(--ease-expo) 0.05s both' }}>
              <div style={topAccentBar} />
              <HySectionLabel icon={User} label="Customer & Device" />
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'1rem' }}>
                {!isEmployee && <InfoItem label="Mobile Number" value={service.customer_mobile} icon={User} color="#3b82f6" />}
                {!isEmployee && <InfoItem label="Address / Area" value={service.customer_address || 'N/A'} icon={MapPin} color="#10b981" />}
                <InfoItem label="Device" value={`${service.device_brand} ${service.device_model}`} icon={Smartphone} color="#8b5cf6" />
                <InfoItem label="Issue Type" value={service.issue_type} icon={Wrench} color="var(--accent)" />
              </div>
              {service.issue_description && (
                <div style={{ marginTop:'1rem', padding:'0.875rem 1rem', borderRadius:'0.875rem', background:'var(--surface)', border:'1px solid var(--border)' }}>
                  <label className="hy-label">Issue Description</label>
                  <p style={{ fontSize:'0.875rem', fontWeight:500, color:'var(--ink-mid)', lineHeight:1.6, marginTop:'0.375rem' }}>{service.issue_description}</p>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div style={{ ...panelStyle, animation:'hy-card-in 0.55s var(--ease-expo) 0.1s both' }}>
              <div style={topAccentBar} />
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.875rem' }}>
                <HySectionLabel icon={Activity} label="Service Timeline" />
                <span style={{ borderRadius:'9999px', background:'var(--surface)', border:'1px solid var(--border)', padding:'0.2rem 0.6rem', fontSize:'0.6875rem', fontWeight:700, color:'var(--ink-mid)', marginTop:'-0.875rem', flexShrink:0 }}>
                  {history.length} updates
                </span>
              </div>

              {loading ? (
                <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                  {[1,2,3].map(i => (
                    <div key={i} style={{ height:56, borderRadius:'0.875rem', background:'#f3f4f6', animation:`hy-card-in 0.3s ease ${i*0.06}s both` }} />
                  ))}
                </div>
              ) : history.length === 0 ? (
                <p style={{ fontSize:'0.8125rem', color:'var(--ink-faint)', fontWeight:500 }}>No timeline found.</p>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'0.625rem' }}>
                  {history.map((item, idx) => {
                    const ss     = getStatusStyles(item.status);
                    const isMine = item.updated_by === profile?.id;
                    return (
                      <div key={item.id}
                        style={{
                          position:'relative', borderRadius:'0.875rem', padding:'0.875rem',
                          border:`1.5px solid ${isMine ? 'rgba(249,115,22,0.25)' : 'var(--border)'}`,
                          background: isMine ? 'linear-gradient(135deg,#fff7ed 0%,#fff 100%)' : 'var(--surface-raise)',
                          animation:`hy-slide-right 0.4s var(--ease-expo) ${idx * 0.06}s both`,
                        }}
                      >
                        {/* connector line */}
                        {idx !== history.length - 1 && (
                          <div style={{ position:'absolute', left:19, top:40, height:'calc(100% + 10px)', width:2, background:'linear-gradient(180deg, var(--border), transparent)' }} />
                        )}
                        {isMine && <div style={{ position:'absolute', left:0, top:0, bottom:0, width:3, background:'var(--accent)', borderRadius:'0.875rem 0 0 0.875rem' }} />}

                        <div style={{ display:'flex', alignItems:'flex-start', gap:'0.625rem', paddingLeft: isMine ? '0.5rem' : 0 }}>
                          <div style={{ position:'relative', flexShrink:0, marginTop:3 }}>
                            <span style={{ display:'block', width:11, height:11, borderRadius:'50%', background:ss.dot }} />
                            {isMine && <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:ss.dot, opacity:0.35, animation:'hy-live-ring 2.5s ease-out infinite' }} />}
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:'0.4rem', marginBottom:'0.2rem' }}>
                              <p style={{ fontSize:'0.8125rem', fontWeight:700, color:ss.text, margin:0 }}>{formatStatusLabel(item.status)}</p>
                              {isMine && (
                                <span style={{ borderRadius:100, padding:'0.2rem 0.5rem', background:'var(--accent)', color:'#fff', fontSize:'0.6rem', fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase' }}>You</span>
                              )}
                            </div>
                            <p style={{ fontSize:'0.6875rem', color:'var(--ink-faint)', margin:0 }}>
                              by <strong style={{ color:'var(--ink-mid)' }}>{item.profiles?.full_name || 'Staff'}</strong>
                            </p>
                            <p style={{ fontSize:'0.6875rem', color:'var(--ink-faint)', margin:'0.15rem 0 0' }}>{formatDateTime(item.created_at)}</p>
                            {item.reason && (
                              <div style={{ marginTop:'0.5rem', display:'inline-flex', borderRadius:'0.5rem', border:`1px solid ${ss.badgeBorder}`, padding:'0.2rem 0.625rem', fontSize:'0.6875rem', fontWeight:600, background:ss.badgeBg, color:ss.dotColor }}>
                                {item.reason}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right col */}
          <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

            {/* Summary */}
            <div style={{ ...panelStyle, animation:'hy-card-in 0.55s var(--ease-expo) 0.08s both' }}>
              <div style={topAccentBar} />
              <HySectionLabel icon={CheckCircle2} label="Summary" />
              <div style={{ display:'flex', flexDirection:'column', gap:'0' }}>
                {[
                  { label:'Received',  value: formatDate(service.created_at) },
                  { label:'Returned',  value: service.returned_at ? formatDate(service.returned_at) : '—' },
                  { label:'Estimated', value: formatCurrency(service.estimated_cost) },
                ].map(row => (
                  <div key={row.label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.625rem 0', borderBottom:'1px solid var(--border)' }}>
                    <span style={{ fontSize:'0.8125rem', fontWeight:500, color:'var(--ink-faint)' }}>{row.label}</span>
                    <span style={{ fontSize:'0.8125rem', fontWeight:700, color:'var(--ink)' }}>{row.value}</span>
                  </div>
                ))}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:'0.875rem', marginTop:'0.25rem' }}>
                  <span style={{ fontSize:'0.9375rem', fontWeight:600, color:'var(--ink)' }}>Final Amount</span>
                  <span style={{ fontSize:'1.25rem', fontWeight:800, letterSpacing:'-0.03em', color:'#10b981' }}>{formatCurrency(service.final_amount || 0)}</span>
                </div>
              </div>
            </div>

            {/* Admin Business Details */}
            {isAdmin && (
              <div style={{ ...panelStyle, animation:'hy-card-in 0.55s var(--ease-expo) 0.13s both' }}>
                <div style={topAccentBar} />
                <HySectionLabel icon={TrendingUp} label="Business Details" />
                <div style={{ display:'flex', flexDirection:'column', gap:'0' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.625rem 0', borderBottom:'1px solid var(--border)' }}>
                    <span style={{ fontSize:'0.8125rem', fontWeight:500, color:'var(--ink-faint)' }}>Duration</span>
                    <span style={{ fontSize:'0.8125rem', fontWeight:700, color:'var(--ink)' }}>
                      {duration != null ? `${duration} day${duration !== 1 ? 's' : ''}` : '—'}
                    </span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:'0.875rem', marginTop:'0.25rem' }}>
                    <span style={{ fontSize:'0.9375rem', fontWeight:600, color:'var(--ink)' }}>Profit / Loss</span>
                    <span style={{ fontSize:'1.25rem', fontWeight:800, letterSpacing:'-0.03em', color: profitLoss >= 0 ? '#10b981' : '#ef4444' }}>
                      {profitLoss >= 0 ? '+' : '-'}{formatCurrency(Math.abs(profitLoss))}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Technician Notes */}
            {isTechnician && (
              <div style={{ ...panelStyle, animation:'hy-card-in 0.55s var(--ease-expo) 0.13s both' }}>
                <div style={topAccentBar} />
                <HySectionLabel icon={Wrench} label="Tech Notes" />
                <div style={{ padding:'0.75rem 1rem', borderRadius:'0.875rem', background:'var(--accent-dim)', border:'1px solid var(--accent-mid)' }}>
                  <p style={{ fontSize:'0.8125rem', fontWeight:700, color:'var(--accent)', margin:0 }}>
                    Final Status: <span style={{ fontWeight:800 }}>{service.status || 'Completed'}</span>
                  </p>
                  <p style={{ fontSize:'0.75rem', color:'var(--ink-mid)', marginTop:'0.25rem' }}>Device returned to customer.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN HISTORY PAGE
═══════════════════════════════════════════════════════════════ */
export default function HistoryPage() {
  const searchParams = useSearchParams();
  const initialTab   = searchParams.get('tab') === 'sales' ? 'sales' : 'services';
  const todayParam   = searchParams.get('today');
  const serviceIdParam = searchParams.get('serviceId');

  const { profile } = useAuth();
  const [activeTab, setActiveTab]       = useState(initialTab);
  const [services, setServices]         = useState([]);
  const [sales, setSales]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchQuery, setSearchQuery]   = useState('');
  const [dateFrom, setDateFrom]         = useState('');
  const [dateTo, setDateTo]             = useState('');
  const [brandFilter, setBrandFilter]   = useState('all');
  const [typeFilter, setTypeFilter]     = useState('all');
  const [showFilters, setShowFilters]   = useState(false);
  const filtersRef = useRef(null);
  const [view, setView]                 = useState('list');
  const [selectedService, setSelectedService] = useState(null);
  const [mounted, setMounted]           = useState(false);

  useEffect(() => {
    if (profile) fetchHistory();
    setTimeout(() => setMounted(true), 50);
  }, [activeTab, profile]);

  useEffect(() => {
    if (serviceIdParam && services.length > 0) {
      const found = services.find(s => s.id === serviceIdParam);
      if (found && !selectedService) { setSelectedService(found); setView('details'); }
    }
  }, [serviceIdParam, services, selectedService]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (filtersRef.current && !filtersRef.current.contains(e.target)) setShowFilters(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setSearchQuery(''); setBrandFilter('all'); setTypeFilter('all');
    setDateFrom(''); setDateTo(''); setShowFilters(false);
  }, [activeTab]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if ((todayParam === 'returned' && activeTab === 'services') || todayParam === 'true') {
      setDateFrom(today); setDateTo(today);
    }
  }, [todayParam, activeTab]);

  async function fetchHistory() {
    try {
      setLoading(true);
      if (activeTab === 'services') {
        const data = await historyService.getServiceHistory(profile); setServices(data);
      } else {
        const data = await historyService.getSalesHistory(profile); setSales(data);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  const filteredServices = services.filter(s => {
    const q = searchQuery.toLowerCase();
    const matchSearch = s.customer_name.toLowerCase().includes(q) ||
      s.device_brand.toLowerCase().includes(q) || s.device_model.toLowerCase().includes(q) ||
      s.ticket_number.toLowerCase().includes(q) || s.issue_type.toLowerCase().includes(q) ||
      (s.issue_description || '').toLowerCase().includes(q);
    const matchBrand = brandFilter === 'all' || s.device_brand.toLowerCase() === brandFilter.toLowerCase();
    let matchDate = true;
    if (dateFrom || dateTo) {
      const d = new Date(s.returned_at || s.updated_at || s.created_at);
      if (dateFrom) { const f = new Date(dateFrom); f.setHours(0,0,0,0); matchDate = matchDate && d >= f; }
      if (dateTo)   { const t = new Date(dateTo);   t.setHours(23,59,59,999); matchDate = matchDate && d <= t; }
    }
    return matchSearch && matchBrand && matchDate;
  });

  const filteredSales = sales.filter(s => {
    const q = searchQuery.toLowerCase();
    const matchSearch = (s.product_name || '').toLowerCase().includes(q) || (s.brand_type || '').toLowerCase().includes(q);
    const matchBrand  = brandFilter === 'all' || (s.brand_type || '').toLowerCase() === brandFilter.toLowerCase();
    const matchType   = typeFilter  === 'all' || (s.product_name || '').toLowerCase() === typeFilter.toLowerCase();
    let matchDate = true;
    if (dateFrom || dateTo) {
      const d = new Date(s.created_at);
      if (dateFrom) { const f = new Date(dateFrom); f.setHours(0,0,0,0); matchDate = matchDate && d >= f; }
      if (dateTo)   { const t = new Date(dateTo);   t.setHours(23,59,59,999); matchDate = matchDate && d <= t; }
    }
    return matchSearch && matchBrand && matchType && matchDate;
  });

  const totalServiceRevenue = filteredServices.reduce((sum, s) => s.status === 'Returned' ? sum + (Number(s.final_amount) || 0) : sum, 0);
  const totalSalesRevenue   = filteredSales.reduce((sum, s) => sum + (Number(s.price) || 0) * (Number(s.quantity) || 1), 0);
  const hasActiveFilters    = brandFilter !== 'all' || typeFilter !== 'all' || dateFrom || dateTo;

  function clearFilters() { setBrandFilter('all'); setTypeFilter('all'); setDateFrom(''); setDateTo(''); }

  if (view === 'details' && selectedService) {
    return (
      <>
        <HistoryStyleInjector />
        <div className="hy-font-body" style={{ backgroundColor:'var(--surface)', minHeight:'100vh', padding:'0.25rem' }}>
          <ServiceHistoryDetails service={selectedService} onBack={() => { setView('list'); setSelectedService(null); }} profile={profile} />
        </div>
      </>
    );
  }

  return (
    <>
      <HistoryStyleInjector />
      <div className="hy-font-body" style={{ backgroundColor:'var(--surface)', minHeight:'100vh', padding:'0.25rem' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>

          {/* ═══ HERO HEADER ═══ */}
          <header
            className={cn(mounted && 'hy-section-enter')}
            style={{ background:'linear-gradient(135deg,#0d0d0d 0%,#181818 60%,#0d0d0d 100%)', borderRadius:'1.75rem', padding:'1.75rem', position:'relative', overflow:'hidden', boxShadow:'0 24px 60px -16px rgba(0,0,0,0.45)', animationDelay:'0s' }}
          >
            <div className="hy-blob" style={{ width:260, height:260, background:'var(--accent)', opacity:0.06, top:-60, right:-40 }} />
            <div className="hy-blob" style={{ width:160, height:160, background:'var(--accent)', opacity:0.04, bottom:-40, left:'22%', animationDelay:'4s' }} />
            <div style={{ position:'absolute', right:28, top:28, width:88, height:88, animation:'hy-spin-slow 20s linear infinite', pointerEvents:'none' }}>
              <div style={{ width:'100%', height:'100%', borderRadius:'50%', border:'1px dashed rgba(249,115,22,0.18)' }} />
            </div>
            <div style={{ position:'absolute', right:36, top:36, width:54, height:54, animation:'hy-spin-rev 9s linear infinite', pointerEvents:'none' }}>
              <div style={{ width:'100%', height:'100%', borderRadius:'50%', border:'1px solid rgba(249,115,22,0.10)' }} />
            </div>
            <div style={{ position:'absolute', right:49, top:49, pointerEvents:'none' }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent)', opacity:0.65, animation:'hy-orbit 9s linear infinite' }} />
            </div>
            <div style={{ position:'absolute', top:0, left:'8%', width:100, height:2, background:'linear-gradient(90deg,var(--accent),transparent)', opacity:0.55 }} />

            <div style={{ position:'relative', display:'flex', flexWrap:'wrap', alignItems:'flex-end', justifyContent:'space-between', gap:'1.25rem' }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.625rem', marginBottom:'0.5rem' }}>
                  <div style={{ width:28, height:28, borderRadius:'0.625rem', background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <ReceiptText style={{ width:14, height:14, color:'#fff' }} strokeWidth={2.5} />
                  </div>
                  <p style={{ fontSize:'0.625rem', fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:'rgba(255,255,255,0.28)' }}>Records</p>
                </div>
                <h1 className="hy-font-display" style={{ fontSize:'clamp(1.75rem,4vw,2.5rem)', fontWeight:400, lineHeight:1.1, color:'rgba(255,255,255,0.94)', marginBottom:'0.5rem', fontStyle:'italic' }}>
                  History <span style={{ color:'var(--accent)' }}>Archive</span>
                </h1>
                <div style={{ height:2, width:56, background:'var(--accent)', animation:'hy-underline 0.8s var(--ease-expo) 0.3s both', borderRadius:2 }} />
                <p style={{ marginTop:'0.7rem', fontSize:'0.8125rem', color:'rgba(255,255,255,0.3)', fontWeight:400 }}>
                  All completed services and sales records.
                </p>
              </div>

              {/* Revenue widget */}
              <div style={{ background:'rgba(255,255,255,0.06)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:'1.125rem', padding:'0.85rem 1.4rem', textAlign:'right', minWidth:148 }}>
                <p style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(255,255,255,0.28)', marginBottom:'0.3rem' }}>
                  {activeTab === 'services' ? 'Service Revenue' : 'Sales Revenue'}
                </p>
                <p style={{ fontSize:'1.625rem', fontWeight:800, letterSpacing:'-0.03em', color:'var(--accent)', lineHeight:1, margin:0, animation:'hy-num-rise 0.5s var(--ease-spring) both' }}>
                  {formatCurrency(activeTab === 'services' ? totalServiceRevenue : totalSalesRevenue)}
                </p>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:'0.4rem', marginTop:'0.4rem' }}>
                  <span style={{ display:'inline-block', position:'relative', width:7, height:7, borderRadius:'50%', background:'#22c55e' }}>
                    <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:'#22c55e', animation:'hy-live-ring 2s ease-out infinite' }} />
                  </span>
                  <span style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(255,255,255,0.28)' }}>
                    {activeTab === 'services' ? filteredServices.length : filteredSales.length} records
                  </span>
                </div>
              </div>
            </div>

            {/* Tab switcher inside header */}
            <div style={{ position:'relative', marginTop:'1.25rem', display:'flex', gap:'0.5rem', borderRadius:'1rem', padding:'0.375rem', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.08)' }}>
              {[
                { key:'services', label:'Services', icon:Wrench },
                { key:'sales',    label:'Sales',    icon:ShoppingBag },
              ].map(tab => {
                const active = activeTab === tab.key;
                return (
                  <TabBtn key={tab.key} active={active} icon={tab.icon} label={tab.label} onClick={() => setActiveTab(tab.key)} />
                );
              })}
            </div>
          </header>

          {/* ═══ STATS STRIP ═══ */}
          {!loading && (
            <div className={cn(mounted && 'hy-section-enter')} style={{ animationDelay:'0.1s' }}>
              <div className="hy-stagger" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:'1rem' }}>
                <StatCard label={activeTab==='services'?'Services':'Sales'} value={activeTab==='services'?filteredServices.length:filteredSales.length} icon={activeTab==='services'?Wrench:ShoppingBag} dotColor="#3b82f6" delay={0} />
                <StatCard label="Revenue" value={formatCurrency(activeTab==='services'?totalServiceRevenue:totalSalesRevenue)} icon={IndianRupee} dotColor="var(--accent)" isCurrency delay={80} />
                <StatCard label="Total Records" value={activeTab==='services'?services.length:sales.length} icon={PackageCheck} dotColor="#10b981" delay={160} />
                <StatCard label="Filtered" value={activeTab==='services'?filteredServices.length:filteredSales.length} icon={Activity} dotColor="#8b5cf6" delay={240} />
              </div>
            </div>
          )}

          {/* ═══ SEARCH + FILTER ═══ */}
          <div className={cn(mounted && 'hy-section-enter')} style={{ animationDelay:'0.18s', position:'relative' }} ref={filtersRef}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
              <div style={{ position:'relative', flex:1 }}>
                <Search style={{ position:'absolute', left:'0.875rem', top:'50%', transform:'translateY(-50%)', width:16, height:16, color:'var(--ink-faint)' }} />
                <input type="text"
                  placeholder={`Search ${activeTab==='services'?'customer, device, ticket…':'product, brand…'}`}
                  className="hy-input"
                  style={{ paddingLeft:'2.5rem', paddingRight: searchQuery ? '2.5rem' : '0.875rem' }}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)} />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')}
                    style={{ position:'absolute', right:'0.75rem', top:'50%', transform:'translateY(-50%)', width:22, height:22, borderRadius:'50%', background:'var(--border)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <X style={{ width:10, height:10, color:'var(--ink-mid)' }} />
                  </button>
                )}
              </div>

              <FilterToggleBtn active={showFilters || hasActiveFilters} badge={hasActiveFilters} onClick={() => setShowFilters(!showFilters)} />
            </div>

            {/* Filter panel */}
            {showFilters && (
              <div style={{ ...panelStyle, position:'absolute', right:0, top:'calc(100% + 0.75rem)', zIndex:30, width:'100%', maxWidth:580, animation:'hy-fade-up 0.3s var(--ease-expo) both', boxShadow:'0 16px 48px rgba(0,0,0,0.12)' }}>
                <div style={topAccentBar} />
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.875rem' }}>
                  <HySectionLabel icon={SlidersHorizontal} label="Filters" />
                  {hasActiveFilters && (
                    <button onClick={clearFilters}
                      style={{ display:'flex', alignItems:'center', gap:'0.3rem', fontSize:'0.75rem', fontWeight:700, color:'var(--accent)', background:'none', border:'none', cursor:'pointer', marginTop:'-0.875rem' }}>
                      <X style={{ width:12, height:12 }} /> Clear all
                    </button>
                  )}
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', alignItems:'flex-end', gap:'1rem' }}>
                  {activeTab === 'sales' && (
                    <FilterSelect label="Type" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                      {['all','watches','screen guards','pouches','chargers','cases','accessories','other'].map(o => (
                        <option key={o} value={o}>{o==='all'?'All Types':o.charAt(0).toUpperCase()+o.slice(1)}</option>
                      ))}
                    </FilterSelect>
                  )}
                  <FilterSelect label="Brand" value={brandFilter} onChange={e => setBrandFilter(e.target.value)}>
                    {(activeTab === 'services'
                      ? ['all','samsung','apple','oneplus','xiaomi','oppo','vivo','realme','motorola','other']
                      : ['all','fire boltt','boat','samsung a series','iphone','samsung','oneplus','xiaomi','other']
                    ).map(o => (
                      <option key={o} value={o}>{o==='all'?'All Brands':o.charAt(0).toUpperCase()+o.slice(1)}</option>
                    ))}
                  </FilterSelect>
                  <FilterDate label="From" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                  <FilterDate label="To"   value={dateTo}   onChange={e => setDateTo(e.target.value)} />
                </div>
              </div>
            )}
          </div>

          {/* ═══ ACTIVE FILTER CHIPS ═══ */}
          {!loading && (hasActiveFilters || searchQuery) && (
            <div className={cn(mounted && 'hy-section-enter')} style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:'0.5rem', animationDelay:'0.22s' }}>
              <span style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--ink-faint)' }}>
                {activeTab==='services'?filteredServices.length:filteredSales.length} results
              </span>
              {brandFilter !== 'all' && <FilterChip label={brandFilter} onRemove={() => setBrandFilter('all')} color="var(--accent)" />}
              {typeFilter  !== 'all' && <FilterChip label={typeFilter}  onRemove={() => setTypeFilter('all')}  color="#8b5cf6" />}
              {(dateFrom || dateTo) && (
                <FilterChip
                  label={`${dateFrom || '…'} → ${dateTo || '…'}`}
                  onRemove={() => { setDateFrom(''); setDateTo(''); }}
                  color="#3b82f6"
                />
              )}
            </div>
          )}

          {/* ═══ CARDS GRID ═══ */}
          <div className="hy-stagger" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'1rem' }}>
            {loading ? (
              [...Array(6)].map((_, i) => <CardSkeleton key={i} index={i} />)
            ) : activeTab === 'services' ? (
              filteredServices.length > 0
                ? filteredServices.map((svc, i) => (
                    <ServiceCard key={svc.id} service={svc} index={i}
                      onClick={() => { setSelectedService(svc); setView('details'); }} />
                  ))
                : <EmptyState icon={Wrench} label="service history" />
            ) : (
              filteredSales.length > 0
                ? filteredSales.map((sale, i) => <SaleCard key={sale.id} sale={sale} index={i} />)
                : <EmptyState icon={ShoppingBag} label="sales history" />
            )}
          </div>

        </div>
      </div>
    </>
  );
}

/* ── Tab Button ── */
function TabBtn({ active, icon: Icon, label, onClick }) {
  const ripple = useRipple();
  return (
    <button onClick={(e) => { ripple(e); onClick(); }} className="hy-ripple hy-shine"
      style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', padding:'0.625rem 1rem', borderRadius:'0.75rem', fontSize:'0.875rem', fontWeight:700, cursor:'pointer', border:'none', transition:'all 0.2s', background: active ? 'rgba(255,255,255,0.92)' : 'transparent', color: active ? 'var(--accent)' : 'rgba(255,255,255,0.35)', boxShadow: active ? '0 4px 16px rgba(0,0,0,0.12)' : 'none' }}>
      <Icon style={{ width:15, height:15 }} strokeWidth={2.5} />
      {label}
      {active && <span style={{ width:5, height:5, borderRadius:'50%', background:'var(--accent)', display:'inline-block', animation:'hy-blink 2s ease-in-out infinite' }} />}
    </button>
  );
}

/* ── Filter Select / Date ── */
function FilterSelect({ label, value, onChange, children }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'0.375rem' }}>
      <label className="hy-label">{label}</label>
      <select value={value} onChange={onChange} className="hy-input" style={{ width:'auto', paddingRight:'2rem' }}>{children}</select>
    </div>
  );
}
function FilterDate({ label, value, onChange }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'0.375rem' }}>
      <label className="hy-label">{label}</label>
      <input type="date" value={value} onChange={onChange} className="hy-input" style={{ width:'auto' }} />
    </div>
  );
}

/* ── Filter Toggle Button ── */
function FilterToggleBtn({ active, badge, onClick }) {
  const ripple = useRipple();
  return (
    <button onClick={(e) => { ripple(e); onClick(); }} className="hy-ripple"
      style={{ width:44, height:44, borderRadius:'0.875rem', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', border:`1.5px solid ${active?'var(--accent)':'var(--border)'}`, background: active?'var(--accent-dim)':'var(--surface-raise)', color: active?'var(--accent)':'var(--ink-mid)', cursor:'pointer', position:'relative', transition:'border-color 0.2s, background 0.2s, color 0.2s' }}>
      <SlidersHorizontal style={{ width:16, height:16 }} />
      {badge && <span style={{ position:'absolute', top:-4, right:-4, width:10, height:10, borderRadius:'50%', background:'var(--accent)', border:'2px solid var(--surface)' }} />}
    </button>
  );
}
