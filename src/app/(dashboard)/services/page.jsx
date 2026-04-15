'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { serviceService } from '@/services/serviceService';
import { useAuth } from '@/components/AuthProvider';
import { compressImage } from '@/lib/imageCompression';
import {
  Plus, Search, ChevronRight, History, Camera, Wrench,
  AlertCircle, Smartphone, User, MapPin, IndianRupee,
  XCircle, SlidersHorizontal, X, Clock, CheckCircle2,
  XOctagon, Package, ArrowLeft, Zap, ChevronDown,
  Activity, Sparkles, ArrowUpRight, FileText, ReceiptText,
} from 'lucide-react';
import { cn, formatCurrency, formatDateTime, setCookie, getCookie, deleteCookie } from '@/lib/utils';
import { toast } from 'sonner';

/* ═══════════════════════════════════════════════════════════════
   DESIGN SYSTEM — exact mirror of dashboard
   ─ Single accent: #f97316  |  Ink: #0d0d0d  |  Surface: #f9fafb
   ─ Fonts: Instrument Serif (display) + Geist (body)
   ─ Motion: tilt, count-up, stagger, morph, shine, ripple
═══════════════════════════════════════════════════════════════ */

const SVC_STYLES = `
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

.svc-font-display { font-family: 'Instrument Serif', Georgia, serif; }
.svc-font-body    { font-family: 'Geist', system-ui, sans-serif; }

/* ── Keyframes ── */
@keyframes svc-fade-up {
  from { opacity:0; transform:translateY(20px); filter:blur(4px); }
  to   { opacity:1; transform:translateY(0);    filter:blur(0); }
}
@keyframes svc-card-in {
  from { opacity:0; transform:translateY(16px) scale(0.97); filter:blur(3px); }
  to   { opacity:1; transform:translateY(0)    scale(1);    filter:blur(0); }
}
@keyframes svc-num-rise {
  from { opacity:0; transform:translateY(10px) scale(0.92); }
  to   { opacity:1; transform:translateY(0)    scale(1); }
}
@keyframes svc-spin-slow  { from { transform:rotate(0deg); }   to { transform:rotate(360deg); } }
@keyframes svc-spin-rev   { from { transform:rotate(0deg); }   to { transform:rotate(-360deg); } }
@keyframes svc-blink      { 0%,100%{ opacity:1; } 50%{ opacity:0.2; } }
@keyframes svc-live-ring  { 0%{ transform:scale(1); opacity:0.5; } 70%{ transform:scale(2.4); opacity:0; } 100%{ transform:scale(2.4); opacity:0; } }
@keyframes svc-blob-morph {
  0%,100% { border-radius:60% 40% 30% 70% / 60% 30% 70% 40%; }
  33%      { border-radius:30% 70% 60% 40% / 50% 60% 30% 60%; }
  66%      { border-radius:50% 30% 70% 40% / 40% 70% 30% 60%; }
}
@keyframes svc-shine      { from { left:-80%; } to { left:130%; } }
@keyframes svc-ripple-out { from { transform:scale(0); opacity:0.35; } to { transform:scale(3.5); opacity:0; } }
@keyframes svc-slide-right{ from { opacity:0; transform:translateX(-14px); } to { opacity:1; transform:translateX(0); } }
@keyframes svc-orbit {
  from { transform:rotate(0deg) translateX(44px) rotate(0deg); }
  to   { transform:rotate(360deg) translateX(44px) rotate(-360deg); }
}
@keyframes svc-underline {
  from { transform:scaleX(0); transform-origin:left; }
  to   { transform:scaleX(1); transform-origin:left; }
}
@keyframes svc-glow {
  0%,100% { box-shadow:0 0 0 0 rgba(249,115,22,0); }
  50%      { box-shadow:0 0 28px 8px rgba(249,115,22,0.20); }
}
@keyframes svc-shimmer {
  0%   { background-position:-200% center; }
  100% { background-position: 200% center; }
}
@keyframes svc-top-bar {
  from { transform:scaleX(0); transform-origin:left; }
  to   { transform:scaleX(1); transform-origin:left; }
}

/* ── Stagger ── */
.svc-stagger > *:nth-child(1) { animation:svc-card-in 0.52s var(--ease-expo) 0.04s both; }
.svc-stagger > *:nth-child(2) { animation:svc-card-in 0.52s var(--ease-expo) 0.09s both; }
.svc-stagger > *:nth-child(3) { animation:svc-card-in 0.52s var(--ease-expo) 0.14s both; }
.svc-stagger > *:nth-child(4) { animation:svc-card-in 0.52s var(--ease-expo) 0.19s both; }
.svc-stagger > *:nth-child(5) { animation:svc-card-in 0.52s var(--ease-expo) 0.24s both; }
.svc-stagger > *:nth-child(6) { animation:svc-card-in 0.52s var(--ease-expo) 0.29s both; }
.svc-stagger > *:nth-child(7) { animation:svc-card-in 0.52s var(--ease-expo) 0.34s both; }
.svc-stagger > *:nth-child(8) { animation:svc-card-in 0.52s var(--ease-expo) 0.39s both; }
.svc-stagger > *:nth-child(9) { animation:svc-card-in 0.52s var(--ease-expo) 0.44s both; }

.svc-section-enter { animation:svc-fade-up 0.65s var(--ease-expo) both; }

/* ── Shine sweep ── */
.svc-shine { position:relative; overflow:hidden; }
.svc-shine::before {
  content:'';
  position:absolute; top:-50%; left:-80%;
  width:50%; height:200%;
  background:linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%);
  transform:skewX(-20deg);
  pointer-events:none; z-index:2;
}
.svc-shine:hover::before { animation:svc-shine 0.5s ease forwards; }

/* ── Ripple ── */
.svc-ripple { position:relative; overflow:hidden; }
.svc-ripple-circle {
  position:absolute; border-radius:50%;
  background:rgba(255,255,255,0.28);
  transform:scale(0);
  animation:svc-ripple-out 0.6s linear forwards;
  pointer-events:none;
}

/* ── Blob ── */
.svc-blob {
  border-radius:60% 40% 30% 70% / 60% 30% 70% 40%;
  animation:svc-blob-morph 10s ease-in-out infinite;
  position:absolute; pointer-events:none;
}

/* ── Accent glow ── */
.svc-accent-glow { animation:svc-glow 3s ease-in-out infinite; }

/* ── Inputs ── */
.svc-input {
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
.svc-input:focus {
  border-color:var(--accent);
  box-shadow:0 0 0 3px var(--accent-dim);
}
.svc-input::placeholder { color:var(--ink-faint); }
.svc-input:disabled { opacity:0.5; cursor:not-allowed; }

.svc-label {
  display:block;
  font-size:0.625rem;
  font-weight:700;
  letter-spacing:0.12em;
  text-transform:uppercase;
  color:var(--ink-faint);
  margin-bottom:0.375rem;
  font-family:'Geist', system-ui, sans-serif;
}

/* ── Photo aspect ── */
.svc-photo-aspect { aspect-ratio:1/1; }

/* ── Timeline line ── */
.svc-tl-line::before {
  content:'';
  position:absolute;
  left:14px; top:30px; bottom:-12px;
  width:2px;
  background:linear-gradient(180deg, var(--border), transparent);
}

/* ── Status pill ── */
.svc-status-pill {
  display:inline-flex; align-items:center; gap:5px;
  border-radius:9999px; padding:4px 10px;
  font-size:0.625rem; font-weight:800;
  letter-spacing:0.07em; text-transform:uppercase;
  white-space:nowrap;
  font-family:'Geist', system-ui, sans-serif;
}

/* ── Shimmer text ── */
.svc-shimmer-text {
  background:linear-gradient(90deg,#f97316,#f97316cc,#f97316);
  background-size:300% auto;
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  animation:svc-shimmer 3s linear infinite;
}

/* ── Dialog overrides ── */
[role="dialog"] {
  border-radius:1.5rem !important;
  border:1px solid var(--border) !important;
  box-shadow:0 25px 60px -12px rgba(0,0,0,0.18) !important;
  font-family:'Geist', system-ui, sans-serif !important;
  overflow:hidden !important;
}
`;

/* ── Style injector ── */
function SvcStyleInjector() {
  useEffect(() => {
    if (document.getElementById('svc-v2-styles')) return;
    const el = document.createElement('style');
    el.id = 'svc-v2-styles';
    el.textContent = SVC_STYLES;
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
    circle.className = 'svc-ripple-circle';
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
function useTilt(strength = 6) {
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

/* ═══════════════════════════════════════════════════════════════
   STATUS CONFIG — semantic colors preserved (data meaning)
═══════════════════════════════════════════════════════════════ */
const STATUS_CFG = {
  'Received':          { color:'#3b82f6', bg:'#eff6ff', border:'#bfdbfe', icon:Clock },
  'In Progress':       { color:'#f97316', bg:'#fff7ed', border:'#fed7aa', icon:Wrench },
  'Waiting for Parts': { color:'#f59e0b', bg:'#fffbeb', border:'#fde68a', icon:Package },
  'Completed':         { color:'#10b981', bg:'#ecfdf5', border:'#a7f3d0', icon:CheckCircle2 },
  'Not Repairable':    { color:'#ef4444', bg:'#fef2f2', border:'#fecaca', icon:XOctagon },
};

function getStatusCfg(status) {
  return STATUS_CFG[status] || { color:'#6b7280', bg:'#f9fafb', border:'#e5e7eb', icon:Clock };
}

/* ── Status Pill ── */
function StatusPill({ status }) {
  const cfg = getStatusCfg(status);
  return (
    <span className="svc-status-pill" style={{ backgroundColor:cfg.bg, border:`1.5px solid ${cfg.border}`, color:cfg.color }}>
      <span style={{ display:'inline-block', width:6, height:6, borderRadius:'50%', background:cfg.color, animation:'svc-blink 2s ease-in-out infinite' }} />
      {status}
    </span>
  );
}

/* ── Section label — identical to dashboard ── */
function SvcSectionLabel({ icon: Icon, label }) {
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
   MAIN SERVICES PAGE
═══════════════════════════════════════════════════════════════ */
export default function ServicesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { profile } = useAuth();

  const [view, setView]                   = useState('list');
  const [services, setServices]           = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading]             = useState(true);
  const [searchQuery, setSearchQuery]     = useState('');
  const [statusFilter, setStatusFilter]   = useState('all');
  const [showFilters, setShowFilters]     = useState(false);
  const [issueFilter, setIssueFilter]     = useState('all');
  const [brandFilter, setBrandFilter]     = useState('all');
  const [specialFilter, setSpecialFilter] = useState('all');
  const [dateFrom, setDateFrom]           = useState('');
  const [dateTo, setDateTo]               = useState('');
  const [mounted, setMounted]             = useState(false);

  useEffect(() => {
    const action    = searchParams.get('action');
    const serviceId = searchParams.get('serviceId');
    if (action === 'new') setView('register');
    else if (serviceId) setView('details');
    else setView('list');
    fetchServices(serviceId);
    setTimeout(() => setMounted(true), 50);
  }, [searchParams]);

  useEffect(() => {
    const today       = new Date().toISOString().split('T')[0];
    const statusParam = searchParams.get('status');
    const filterParam = searchParams.get('filter');
    setSpecialFilter('all');
    setStatusFilter(statusParam || 'all');
    if (filterParam === 'registeredToday')      { setSpecialFilter('registeredToday');    setDateFrom(today); setDateTo(today); }
    else if (filterParam === 'completedToday')   { setSpecialFilter('completedToday');     setStatusFilter('Completed');     setDateFrom(''); setDateTo(''); }
    else if (filterParam === 'notRepairableToday'){ setSpecialFilter('notRepairableToday'); setStatusFilter('Not Repairable'); setDateFrom(''); setDateTo(''); }
    else { setDateFrom(''); setDateTo(''); }
  }, [searchParams]);

  async function fetchServices(serviceId = null) {
    try {
      setLoading(true);
      const data = await serviceService.getActiveServices();
      setServices(data);
      if (serviceId) {
        const matched = data.find(s => s.id === Number(serviceId) || s.id === serviceId);
        if (matched) { setSelectedService(matched); setView('details'); }
      } else if (selectedService) {
        const updated = data.find(s => s.id === selectedService.id);
        if (updated) setSelectedService(updated);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  const filteredServices = services.filter(s => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      s.customer_name.toLowerCase().includes(q) ||
      s.customer_mobile.includes(q) ||
      s.device_brand.toLowerCase().includes(q) ||
      s.device_model.toLowerCase().includes(q) ||
      s.ticket_number.toLowerCase().includes(q) ||
      s.issue_type.toLowerCase().includes(q) ||
      (s.issue_description && s.issue_description.toLowerCase().includes(q));
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesIssue  = issueFilter  === 'all' || (s.issue_type && s.issue_type.includes(issueFilter));
    const matchesBrand  = brandFilter  === 'all' || s.device_brand.toLowerCase() === brandFilter.toLowerCase();
    let matchesDate = true;
    if (specialFilter === 'registeredToday') {
      const t=new Date(), d=new Date(s.created_at);
      matchesDate = d.getFullYear()===t.getFullYear()&&d.getMonth()===t.getMonth()&&d.getDate()===t.getDate();
    } else if (specialFilter === 'completedToday') {
      const t=new Date(), d=new Date(s.updated_at||s.created_at);
      matchesDate = s.status==='Completed'&&d.getFullYear()===t.getFullYear()&&d.getMonth()===t.getMonth()&&d.getDate()===t.getDate();
    } else if (specialFilter === 'notRepairableToday') {
      const t=new Date(), d=new Date(s.updated_at||s.created_at);
      matchesDate = s.status==='Not Repairable'&&d.getFullYear()===t.getFullYear()&&d.getMonth()===t.getMonth()&&d.getDate()===t.getDate();
    } else if (dateFrom||dateTo) {
      const d=new Date(s.created_at);
      if (dateFrom){const f=new Date(dateFrom);f.setHours(0,0,0,0);matchesDate=matchesDate&&d>=f;}
      if (dateTo){const tt=new Date(dateTo);tt.setHours(23,59,59,999);matchesDate=matchesDate&&d<=tt;}
    }
    return matchesSearch && matchesStatus && matchesIssue && matchesBrand && matchesDate;
  });

  const hasActiveFilters = issueFilter!=='all'||brandFilter!=='all'||dateFrom||dateTo;

  const counts = {
    all:                services.length,
    'Received':         services.filter(s=>s.status==='Received').length,
    'In Progress':      services.filter(s=>s.status==='In Progress').length,
    'Waiting for Parts':services.filter(s=>s.status==='Waiting for Parts').length,
    'Completed':        services.filter(s=>s.status==='Completed').length,
    'Not Repairable':   services.filter(s=>s.status==='Not Repairable').length,
  };

  if (view === 'register') return <ServiceRegistration onCancel={() => setView('list')} onComplete={() => { setView('list'); fetchServices(); }} />;
  if (view === 'details' && selectedService) return <ServiceDetails service={selectedService} onBack={() => setView('list')} onUpdate={fetchServices} />;

  const STATUS_TABS = [
    { key:'all',               label:'All Active',     color:null },
    { key:'Received',          label:'Received',       color:'#3b82f6' },
    { key:'In Progress',       label:'In Progress',    color:'#f97316' },
    { key:'Waiting for Parts', label:'Waiting',        color:'#f59e0b' },
    { key:'Completed',         label:'Completed',      color:'#10b981' },
    { key:'Not Repairable',    label:'Not Repairable', color:'#ef4444' },
  ];

  return (
    <>
      <SvcStyleInjector />
      <div className="svc-font-body" style={{ backgroundColor:'var(--surface)', minHeight:'100vh', padding:'0.25rem' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>

          {/* ═══ HERO HEADER ═══ */}
          <header
            className={cn(mounted && 'svc-section-enter')}
            style={{
              background:'linear-gradient(135deg, #0d0d0d 0%, #181818 60%, #0d0d0d 100%)',
              borderRadius:'1.75rem', padding:'1.75rem',
              position:'relative', overflow:'hidden',
              boxShadow:'0 24px 60px -16px rgba(0,0,0,0.45)',
              animationDelay:'0s',
            }}
          >
            {/* Morphing blobs */}
            <div className="svc-blob" style={{ width:260, height:260, background:'var(--accent)', opacity:0.06, top:-60, right:-40 }} />
            <div className="svc-blob" style={{ width:160, height:160, background:'var(--accent)', opacity:0.04, bottom:-40, left:'20%', animationDelay:'3.5s' }} />

            {/* Spinning rings */}
            <div style={{ position:'absolute', right:28, top:28, width:88, height:88, animation:'svc-spin-slow 20s linear infinite', pointerEvents:'none' }}>
              <div style={{ width:'100%', height:'100%', borderRadius:'50%', border:'1px dashed rgba(249,115,22,0.18)' }} />
            </div>
            <div style={{ position:'absolute', right:36, top:36, width:54, height:54, animation:'svc-spin-rev 9s linear infinite', pointerEvents:'none' }}>
              <div style={{ width:'100%', height:'100%', borderRadius:'50%', border:'1px solid rgba(249,115,22,0.10)' }} />
            </div>
            {/* Orbiting dot */}
            <div style={{ position:'absolute', right:49, top:49, pointerEvents:'none' }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent)', opacity:0.65, animation:'svc-orbit 9s linear infinite' }} />
            </div>
            {/* Corner accent line */}
            <div style={{ position:'absolute', top:0, left:'8%', width:100, height:2, background:'linear-gradient(90deg, var(--accent), transparent)', opacity:0.55 }} />

            <div style={{ position:'relative', display:'flex', flexWrap:'wrap', alignItems:'flex-end', justifyContent:'space-between', gap:'1.25rem' }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.625rem', marginBottom:'0.5rem' }}>
                  <div style={{ width:28, height:28, borderRadius:'0.625rem', background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Wrench style={{ width:14, height:14, color:'#fff' }} strokeWidth={2.5} />
                  </div>
                  <p style={{ fontSize:'0.625rem', fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:'rgba(255,255,255,0.28)' }}>
                    Repair Center
                  </p>
                </div>
                <h1 className="svc-font-display" style={{ fontSize:'clamp(1.75rem,4vw,2.5rem)', fontWeight:400, lineHeight:1.1, color:'rgba(255,255,255,0.94)', marginBottom:'0.5rem', fontStyle:'italic' }}>
                  Active <span style={{ color:'var(--accent)' }}>Services</span>
                </h1>
                {/* Animated accent underline */}
                <div style={{ height:2, width:56, background:'var(--accent)', animation:'svc-underline 0.8s var(--ease-expo) 0.3s both', borderRadius:2 }} />
                <p style={{ marginTop:'0.7rem', fontSize:'0.8125rem', color:'rgba(255,255,255,0.3)', fontWeight:400 }}>
                  Track and manage all active repairs.
                </p>
              </div>

              {/* Live count widget */}
              <div style={{ background:'rgba(255,255,255,0.06)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:'1.125rem', padding:'0.85rem 1.4rem', textAlign:'right', minWidth:120 }}>
                <p style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(255,255,255,0.28)', marginBottom:'0.3rem' }}>Active Jobs</p>
                <p style={{ fontSize:'2rem', fontWeight:800, letterSpacing:'-0.03em', color:'#fff', lineHeight:1, margin:0, animation:'svc-num-rise 0.5s var(--ease-spring) both' }}>
                  {services.length}
                </p>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:'0.4rem', marginTop:'0.4rem' }}>
                  <span style={{ display:'inline-block', position:'relative', width:7, height:7, borderRadius:'50%', background:'#22c55e' }}>
                    <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:'#22c55e', animation:'svc-live-ring 2s ease-out infinite' }} />
                  </span>
                  <span style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(255,255,255,0.28)' }}>Live</span>
                </div>
              </div>
            </div>
          </header>

          {/* ═══ SEARCH + ACTIONS ═══ */}
          <div className={cn(mounted && 'svc-section-enter')} style={{ display:'flex', alignItems:'center', gap:'0.75rem', animationDelay:'0.1s' }}>
            {/* Search */}
            <div style={{ position:'relative', flex:1 }}>
              <Search style={{ position:'absolute', left:'0.875rem', top:'50%', transform:'translateY(-50%)', width:16, height:16, color:'var(--ink-faint)' }} />
              <input
                type="text"
                placeholder="Search name, mobile, ticket, model…"
                className="svc-input"
                style={{ paddingLeft:'2.5rem', paddingRight:searchQuery ? '2.5rem' : '0.875rem' }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={{ position:'absolute', right:'0.75rem', top:'50%', transform:'translateY(-50%)', width:22, height:22, borderRadius:'50%', background:'var(--border)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <X style={{ width:10, height:10, color:'var(--ink-mid)' }} />
                </button>
              )}
            </div>

            {/* New Service */}
            <NewServiceBtn onClick={() => setView('register')} />

            {/* History */}
            <IconBtn onClick={() => router.push('/history?tab=services')} title="History">
              <History style={{ width:16, height:16 }} />
            </IconBtn>

            {/* Filters toggle */}
            <IconBtn
              onClick={() => setShowFilters(!showFilters)}
              active={showFilters || hasActiveFilters}
              badge={hasActiveFilters}
              title="Filters"
            >
              <SlidersHorizontal style={{ width:16, height:16 }} />
            </IconBtn>
          </div>

          {/* ═══ FILTERS PANEL ═══ */}
          {showFilters && (
            <div
              className={cn(mounted && 'svc-section-enter')}
              style={{ background:'var(--surface-raise)', border:'1px solid var(--border)', borderRadius:'1.5rem', padding:'1.25rem 1.5rem', boxShadow:'0 2px 16px rgba(0,0,0,0.04)', animationDelay:'0s' }}
            >
              <SvcSectionLabel icon={SlidersHorizontal} label="Advanced Filters" />
              <div style={{ display:'flex', flexWrap:'wrap', alignItems:'flex-end', gap:'1rem' }}>
                <FilterSelect label="Issue Type" value={issueFilter} onChange={e => setIssueFilter(e.target.value)}>
                  <option value="all">All Issues</option>
                  {['Display Problem','Battery Problem','Charging Problem','Software Issue','Water Damage','Other'].map(v => <option key={v}>{v}</option>)}
                </FilterSelect>
                <FilterSelect label="Brand" value={brandFilter} onChange={e => setBrandFilter(e.target.value)}>
                  <option value="all">All Brands</option>
                  {['samsung','apple','oneplus','xiaomi','oppo','vivo','realme','motorola','other'].map(v => (
                    <option key={v} value={v}>{v.charAt(0).toUpperCase()+v.slice(1)}</option>
                  ))}
                </FilterSelect>
                <FilterDate label="From" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                <FilterDate label="To"   value={dateTo}   onChange={e => setDateTo(e.target.value)} />
                {hasActiveFilters && (
                  <button
                    onClick={() => { setIssueFilter('all'); setBrandFilter('all'); setDateFrom(''); setDateTo(''); }}
                    style={{ display:'flex', alignItems:'center', gap:'0.375rem', padding:'0.5rem 1rem', borderRadius:'0.75rem', background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626', fontSize:'0.75rem', fontWeight:700, cursor:'pointer' }}
                  >
                    <X style={{ width:13, height:13 }} /> Clear All
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ═══ STATUS TABS ═══ */}
          <div className={cn(mounted && 'svc-section-enter')} style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem', animationDelay:'0.15s' }}>
            {STATUS_TABS.map(tab => {
              const active = statusFilter === tab.key;
              const cfg    = tab.color ? STATUS_CFG[tab.key] : null;
              const count  = counts[tab.key];
              return (
                <StatusTab
                  key={tab.key}
                  label={tab.label}
                  count={count}
                  active={active}
                  color={tab.color}
                  statusBg={cfg?.bg}
                  onClick={() => setStatusFilter(tab.key)}
                />
              );
            })}
          </div>

          {/* ═══ SERVICES GRID ═══ */}
          {loading ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'1rem' }}>
              {[...Array(6)].map((_,i) => (
                <div key={i} style={{ height:176, borderRadius:'1.25rem', background:'#f3f4f6', animation:`svc-card-in 0.4s var(--ease-expo) ${i*0.05}s both` }} />
              ))}
            </div>
          ) : filteredServices.length > 0 ? (
            <div className="svc-stagger" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'1rem' }}>
              {filteredServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onClick={() => { setSelectedService(service); setView('details'); }}
                />
              ))}
            </div>
          ) : (
            <EmptyState searchQuery={searchQuery} onRegister={() => setView('register')} />
          )}
        </div>
      </div>
    </>
  );
}

/* ── Status Tab ── */
function StatusTab({ label, count, active, color, statusBg, onClick }) {
  const ripple = useRipple();
  return (
    <button
      onClick={(e) => { ripple(e); onClick(); }}
      className="svc-ripple svc-shine"
      style={{
        display:'flex', alignItems:'center', gap:'0.4rem',
        padding:'0.375rem 0.875rem', borderRadius:'9999px',
        fontSize:'0.75rem', fontWeight:700, cursor:'pointer',
        border:`1.5px solid ${active ? (color||'var(--ink)') : 'var(--border)'}`,
        background: active ? (color||'var(--ink)') : 'var(--surface-raise)',
        color: active ? '#fff' : 'var(--ink-mid)',
        boxShadow: active ? `0 4px 14px ${(color||'#111')}35` : 'none',
        transition:'background 0.2s, border-color 0.2s, box-shadow 0.2s',
      }}
    >
      {color && active && (
        <span style={{ display:'inline-block', width:5, height:5, borderRadius:'50%', background:'rgba(255,255,255,0.7)', animation:'svc-blink 2s ease-in-out infinite' }} />
      )}
      {label}
      {count > 0 && (
        <span style={{
          borderRadius:'9999px', padding:'0.15rem 0.45rem',
          fontSize:'0.6rem', fontWeight:800,
          background: active ? 'rgba(255,255,255,0.2)' : (statusBg||'var(--surface)'),
          color: active ? '#fff' : (color||'var(--ink-mid)'),
        }}>
          {count}
        </span>
      )}
    </button>
  );
}

/* ── Service Card ── */
function ServiceCard({ service, onClick }) {
  const ripple = useRipple();
  const { ref, onMouseMove, onMouseLeave } = useTilt(4);
  const [hovered, setHovered] = useState(false);
  const cfg = getStatusCfg(service.status);
  const StatusIcon = cfg.icon || Clock;

  return (
    <button
      ref={ref}
      onClick={(e) => { ripple(e); onClick(); }}
      onMouseMove={onMouseMove}
      onMouseLeave={() => { onMouseLeave(); setHovered(false); }}
      onMouseEnter={() => setHovered(true)}
      className="svc-ripple svc-shine"
      style={{
        textAlign:'left', cursor:'pointer', width:'100%',
        borderRadius:'1.25rem', padding:'1.25rem', paddingLeft:'1.375rem',
        background:'var(--surface-raise)',
        border:`1.5px solid ${hovered ? cfg.color+'55' : 'var(--border)'}`,
        position:'relative', overflow:'hidden',
        transition:'border-color 0.25s, box-shadow 0.25s',
        boxShadow: hovered ? `0 8px 32px ${cfg.color}22` : '0 2px 8px rgba(0,0,0,0.04)',
        willChange:'transform',
      }}
    >
      {/* Top bar reveal on hover */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:cfg.color, transform:hovered?'scaleX(1)':'scaleX(0)', transformOrigin:'left', transition:'transform 0.35s var(--ease-expo)' }} />
      {/* Left accent bar */}
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:3, background:cfg.color, opacity:0.7, borderRadius:'1.25rem 0 0 1.25rem' }} />
      {/* Ambient glow spot */}
      <div style={{ position:'absolute', right:-20, bottom:-20, width:80, height:80, borderRadius:'50%', background:cfg.color, opacity:hovered?0.09:0.04, transition:'opacity 0.3s', filter:'blur(20px)' }} />

      {/* Ticket + Status */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'0.5rem', marginBottom:'0.75rem' }}>
        <div style={{ minWidth:0, flex:1 }}>
          <p style={{ fontSize:'0.625rem', fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', color:cfg.color, marginBottom:'0.3rem' }}>
            {service.ticket_number}
          </p>
          <p className="svc-font-display" style={{ fontSize:'1rem', fontWeight:400, color:'var(--ink)', lineHeight:1.2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontStyle:'italic' }}>
            {service.customer_name}
          </p>
          <p style={{ fontSize:'0.75rem', color:'var(--ink-faint)', marginTop:'0.2rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {service.device_brand} {service.device_model}
          </p>
        </div>
        <StatusPill status={service.status} />
      </div>

      {/* Issue */}
      <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.875rem' }}>
        <div style={{ width:24, height:24, borderRadius:'0.5rem', display:'flex', alignItems:'center', justifyContent:'center', background:`${cfg.color}15`, flexShrink:0 }}>
          <StatusIcon style={{ width:12, height:12, color:cfg.color }} strokeWidth={2} />
        </div>
        <span style={{ fontSize:'0.75rem', color:'var(--ink-faint)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>
          {service.issue_type}
        </span>
      </div>

      {/* Bottom row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', borderTop:`1px solid ${cfg.color}18`, paddingTop:'0.75rem' }}>
        <div style={{ display:'flex', alignItems:'baseline', gap:'0.25rem' }}>
          <span style={{ fontSize:'0.8125rem', fontWeight:800, color:cfg.color }}>{formatCurrency(service.estimated_cost)}</span>
          <span style={{ fontSize:'0.6875rem', color:'var(--ink-faint)', fontWeight:500 }}>est.</span>
        </div>
        <div style={{
          width:28, height:28, borderRadius:'0.625rem',
          display:'flex', alignItems:'center', justifyContent:'center',
          background:`${cfg.color}15`,
          transform: hovered ? 'translate(2px,-2px)' : 'translate(0,0)',
          transition:'transform 0.2s',
        }}>
          <ArrowUpRight style={{ width:13, height:13, color:cfg.color }} />
        </div>
      </div>
    </button>
  );
}

/* ── New Service Button ── */
function NewServiceBtn({ onClick }) {
  const ripple = useRipple();
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={(e) => { ripple(e); onClick(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="svc-ripple svc-shine"
      style={{
        display:'flex', alignItems:'center', gap:'0.5rem',
        padding:'0.6875rem 1.25rem', borderRadius:'0.875rem',
        fontSize:'0.875rem', fontWeight:700, color:'#fff', cursor:'pointer',
        background:'var(--ink)',
        border:'1.5px solid var(--ink)',
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.25)' : '0 4px 12px rgba(0,0,0,0.15)',
        transition:'box-shadow 0.2s, transform 0.2s',
        transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
        whiteSpace:'nowrap',
      }}
    >
      <Plus style={{ width:16, height:16, color:'var(--accent)' }} strokeWidth={2.5} />
      <span className="hidden sm:inline">New Service</span>
    </button>
  );
}

/* ── Icon Button ── */
function IconBtn({ onClick, active, badge, title, children }) {
  const ripple = useRipple();
  return (
    <button
      onClick={(e) => { ripple(e); onClick(); }}
      title={title}
      className="svc-ripple"
      style={{
        width:44, height:44, borderRadius:'0.875rem', flexShrink:0,
        display:'flex', alignItems:'center', justifyContent:'center',
        border:`1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
        background: active ? 'var(--accent-dim)' : 'var(--surface-raise)',
        color: active ? 'var(--accent)' : 'var(--ink-mid)',
        cursor:'pointer', position:'relative',
        transition:'border-color 0.2s, background 0.2s, color 0.2s',
      }}
    >
      {children}
      {badge && (
        <span style={{ position:'absolute', top:-4, right:-4, width:10, height:10, borderRadius:'50%', background:'var(--accent)', border:'2px solid var(--surface)' }} />
      )}
    </button>
  );
}

/* ── Filter helpers ── */
function FilterSelect({ label, value, onChange, children }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'0.375rem' }}>
      <label className="svc-label">{label}</label>
      <select value={value} onChange={onChange} className="svc-input" style={{ width:'auto', paddingRight:'2rem' }}>{children}</select>
    </div>
  );
}
function FilterDate({ label, value, onChange }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'0.375rem' }}>
      <label className="svc-label">{label}</label>
      <input type="date" value={value} onChange={onChange} className="svc-input" style={{ width:'auto' }} />
    </div>
  );
}

/* ── Empty State ── */
function EmptyState({ searchQuery, onRegister }) {
  const ripple = useRipple();
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'6rem 2rem', gap:'1.25rem', animation:'svc-fade-up 0.5s var(--ease-expo) both' }}>
      <div style={{ position:'relative' }}>
        <div style={{ width:88, height:88, borderRadius:'1.5rem', background:'var(--surface-raise)', border:'2px dashed var(--border)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Wrench style={{ width:36, height:36, color:'var(--border-strong)' }} />
        </div>
        <div style={{ position:'absolute', top:-8, right:-8, width:24, height:24, borderRadius:'50%', background:'var(--ink)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Plus style={{ width:12, height:12, color:'var(--accent)' }} strokeWidth={3} />
        </div>
      </div>
      <div style={{ textAlign:'center' }}>
        <p className="svc-font-display" style={{ fontSize:'1.25rem', fontWeight:400, color:'var(--ink)', fontStyle:'italic' }}>No services found</p>
        <p style={{ fontSize:'0.8125rem', color:'var(--ink-faint)', marginTop:'0.375rem' }}>
          {searchQuery ? 'Try a different search term.' : 'Register your first service to get started.'}
        </p>
      </div>
      <button
        onClick={(e) => { ripple(e); onRegister(); }}
        className="svc-ripple svc-shine"
        style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.75rem 1.5rem', borderRadius:'0.875rem', background:'var(--ink)', color:'#fff', fontSize:'0.875rem', fontWeight:700, cursor:'pointer', border:'none', boxShadow:'0 4px 16px rgba(0,0,0,0.15)' }}
      >
        <Plus style={{ width:15, height:15, color:'var(--accent)' }} strokeWidth={2.5} />
        Register New Service
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SERVICE REGISTRATION
═══════════════════════════════════════════════════════════════ */
function ServiceRegistration({ onCancel, onComplete }) {
  const { profile } = useAuth();
  const [loading, setLoading]   = useState(false);
  const COOKIE_KEY = 'serviceRegistrationDraft';
  const [formData, setFormData] = useState({
    customer_mobile:'', customer_name:'', customer_address:'',
    device_brand:'', device_model:'', imei:'',
    issue_type:['Display Problem'], issue_description:'', estimated_cost:'',
  });
  const [photos, setPhotos] = useState({ customer:null, front:null, back:null });
  const isRefreshRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = getCookie(COOKIE_KEY);
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        if (draft?.formData) {
          if (typeof draft.formData.issue_type === 'string') draft.formData.issue_type = [draft.formData.issue_type];
          setFormData(prev => ({ ...prev, ...draft.formData }));
        }
      } catch {}
    }
    const handler = () => sessionStorage.setItem('serviceRegistrationIsReload','1');
    window.addEventListener('beforeunload', handler);
    return () => {
      window.removeEventListener('beforeunload', handler);
      const isReload = sessionStorage.getItem('serviceRegistrationIsReload') === '1';
      if (isReload) { isRefreshRef.current = true; sessionStorage.removeItem('serviceRegistrationIsReload'); }
      if (!isReload) deleteCookie(COOKIE_KEY);
    };
  }, []);

  useEffect(() => { try { setCookie(COOKIE_KEY, JSON.stringify({ formData }), 7); } catch {} }, [formData]);

  async function handleMobileBlur() {
    if (formData.customer_mobile.length === 10) {
      try {
        const data = await serviceService.getCustomerLastDetails(formData.customer_mobile);
        if (data) {
          setFormData(prev => ({ ...prev, customer_name: data.customer_name, customer_address: data.customer_address||'' }));
          toast.info('Customer details auto-filled');
        }
      } catch {}
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.issue_type || formData.issue_type.length === 0) { toast.error('Please select at least one issue type.'); return; }
    setLoading(true);
    try {
      const submitData = { ...formData, issue_type: Array.isArray(formData.issue_type) ? formData.issue_type.join(', ') : formData.issue_type };
      const service = await serviceService.registerService(submitData, photos, profile?.id);
      toast.success(`Service registered! Ticket: ${service.ticket_number}`);
      deleteCookie(COOKIE_KEY);
      onComplete();
    } catch (err) { toast.error(err.message || 'Registration failed'); }
    finally { setLoading(false); }
  }

  const ISSUE_TYPES = ['Display Problem','Battery Problem','Charging Problem','Software Issue','Water Damage','Other'];
  const totalCost   = parseFloat(formData.estimated_cost) || 0;

  const panelStyle = {
    background:'var(--surface-raise)', border:'1px solid var(--border)',
    borderRadius:'1.5rem', padding:'1.5rem', position:'relative', overflow:'hidden',
    boxShadow:'0 2px 16px rgba(0,0,0,0.04)',
  };
  const topAccentBar = {
    position:'absolute', top:0, left:'1.5rem', right:'1.5rem', height:2,
    background:'linear-gradient(90deg, var(--accent), transparent)',
    borderRadius:'0 0 3px 3px', opacity:0.5,
  };

  return (
    <>
      <SvcStyleInjector />
      <div className="svc-font-body" style={{ backgroundColor:'var(--surface)', minHeight:'100vh', paddingBottom:'6rem' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem', maxWidth:'100%' }}>

          {/* Header */}
          <header style={{ background:'linear-gradient(135deg,#0d0d0d 0%,#181818 60%,#0d0d0d 100%)', borderRadius:'1.75rem', padding:'1.75rem', position:'relative', overflow:'hidden', boxShadow:'0 24px 60px -16px rgba(0,0,0,0.45)', animation:'svc-fade-up 0.6s var(--ease-expo) both' }}>
            <div className="svc-blob" style={{ width:240, height:240, background:'var(--accent)', opacity:0.06, top:-50, right:-30 }} />
            <div style={{ position:'absolute', right:28, top:28, width:80, height:80, animation:'svc-spin-slow 20s linear infinite', pointerEvents:'none' }}>
              <div style={{ width:'100%', height:'100%', borderRadius:'50%', border:'1px dashed rgba(249,115,22,0.18)' }} />
            </div>
            <div style={{ position:'absolute', top:0, left:'8%', width:100, height:2, background:'linear-gradient(90deg,var(--accent),transparent)', opacity:0.55 }} />

            <div style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1rem', flexWrap:'wrap' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                <BackBtn onClick={() => { deleteCookie(COOKIE_KEY); onCancel(); }} />
                <div>
                  <p style={{ fontSize:'0.625rem', fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:'rgba(255,255,255,0.28)', marginBottom:'0.35rem' }}>New Ticket</p>
                  <h1 className="svc-font-display" style={{ fontSize:'clamp(1.5rem,3.5vw,2.25rem)', fontWeight:400, lineHeight:1.1, color:'rgba(255,255,255,0.94)', fontStyle:'italic' }}>
                    Register <span style={{ color:'var(--accent)' }}>Service</span>
                  </h1>
                </div>
              </div>
              {totalCost > 0 && (
                <div style={{ background:'rgba(255,255,255,0.06)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:'1.125rem', padding:'0.75rem 1.25rem', textAlign:'right' }}>
                  <p style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(255,255,255,0.28)', marginBottom:'0.2rem' }}>Est. Cost</p>
                  <p style={{ fontSize:'1.375rem', fontWeight:800, letterSpacing:'-0.03em', color:'var(--accent)', margin:0 }}>{formatCurrency(totalCost)}</p>
                </div>
              )}
            </div>
          </header>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ maxWidth:680, margin:'0 auto', width:'100%', display:'flex', flexDirection:'column', gap:'1.25rem' }}>

            {/* Customer Info */}
            <div style={{ ...panelStyle, animationDelay:'0.1s' }} className="svc-section-enter">
              <div style={topAccentBar} />
              <SvcSectionLabel icon={User} label="Customer Information" />
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'1rem' }}>
                <RegField label="Mobile Number">
                  <div style={{ position:'relative' }}>
                    <input type="tel" required maxLength={10} className="svc-input" placeholder="10-digit number"
                      style={{ paddingRight:'3rem' }}
                      value={formData.customer_mobile} onBlur={handleMobileBlur}
                      onChange={e => setFormData({ ...formData, customer_mobile: e.target.value.replace(/\D/g,'') })} />
                    {formData.customer_mobile.length > 0 && (
                      <span style={{ position:'absolute', right:'0.875rem', top:'50%', transform:'translateY(-50%)', fontSize:'0.6875rem', fontWeight:700, color: formData.customer_mobile.length===10 ? '#22c55e' : 'var(--border-strong)' }}>
                        {formData.customer_mobile.length}/10
                      </span>
                    )}
                  </div>
                </RegField>
                <RegField label="Customer Name">
                  <input type="text" required className="svc-input" placeholder="Full name"
                    value={formData.customer_name} onChange={e => setFormData({ ...formData, customer_name: e.target.value })} />
                </RegField>
                <div style={{ gridColumn:'1 / -1' }}>
                  <RegField label="Address / Area">
                    <input type="text" className="svc-input" placeholder="Street, area, locality"
                      value={formData.customer_address} onChange={e => setFormData({ ...formData, customer_address: e.target.value })} />
                  </RegField>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem', marginTop:'0.625rem' }}>
                    {['Bus Stand','College Road','Market Area','Old Town','New Colony'].map(area => {
                      const sel = formData.customer_address === area;
                      return (
                        <button key={area} type="button"
                          onClick={() => setFormData({ ...formData, customer_address: area })}
                          style={{ display:'inline-flex', alignItems:'center', gap:'0.25rem', padding:'0.3125rem 0.75rem', borderRadius:'9999px', fontSize:'0.75rem', fontWeight:700, cursor:'pointer', transition:'all 0.18s', border: sel ? 'none' : '1px solid var(--border)', background: sel ? 'var(--ink)' : 'var(--surface)', color: sel ? '#fff' : 'var(--ink-mid)' }}>
                          {sel && <span style={{ width:5, height:5, borderRadius:'50%', background:'var(--accent)', display:'inline-block' }} />}
                          {area}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Device Info */}
            <div style={{ ...panelStyle, animationDelay:'0.16s' }} className="svc-section-enter">
              <div style={topAccentBar} />
              <SvcSectionLabel icon={Smartphone} label="Device Information" />
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'1rem' }}>
                <RegField label="Mobile Brand">
                  <input type="text" required className="svc-input" placeholder="e.g. Samsung, Apple"
                    value={formData.device_brand} onChange={e => setFormData({ ...formData, device_brand: e.target.value })} />
                </RegField>
                <RegField label="Mobile Model">
                  <input type="text" required className="svc-input" placeholder="e.g. Galaxy A54"
                    value={formData.device_model} onChange={e => setFormData({ ...formData, device_model: e.target.value })} />
                </RegField>
              </div>
            </div>

            {/* Issue Details */}
            <div style={{ ...panelStyle, animationDelay:'0.22s' }} className="svc-section-enter">
              <div style={topAccentBar} />
              <SvcSectionLabel icon={AlertCircle} label="Issue Details" />
              <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                <RegField label="Issue Types (select all that apply)">
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem', marginTop:'0.25rem' }}>
                    {['Display Problem','Battery Problem','Charging Problem','Software Issue','Water Damage','Other'].map(type => {
                      const selected = (Array.isArray(formData.issue_type) ? formData.issue_type : []).includes(type);
                      return (
                        <IssueChip
                          key={type} label={type} selected={selected}
                          onClick={() => {
                            const cur = Array.isArray(formData.issue_type) ? formData.issue_type : [];
                            setFormData({ ...formData, issue_type: selected ? cur.filter(t=>t!==type) : [...cur,type] });
                          }}
                        />
                      );
                    })}
                  </div>
                </RegField>
                <RegField label="Description (Optional)">
                  <textarea className="svc-input" rows={3} placeholder="Describe the issue in detail…"
                    value={formData.issue_description} onChange={e => setFormData({ ...formData, issue_description: e.target.value })} />
                </RegField>
                <RegField label="Estimated Service Cost">
                  <div style={{ position:'relative' }}>
                    <div style={{ position:'absolute', left:'0.875rem', top:'50%', transform:'translateY(-50%)', width:20, height:20, borderRadius:'0.375rem', background:'var(--accent-dim)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <IndianRupee style={{ width:11, height:11, color:'var(--accent)' }} />
                    </div>
                    <input type="number" required className="svc-input" placeholder="0.00"
                      style={{ paddingLeft:'2.5rem' }}
                      value={formData.estimated_cost} onChange={e => setFormData({ ...formData, estimated_cost: e.target.value })} />
                  </div>
                </RegField>
              </div>
            </div>

            {/* Photos */}
            <div style={{ ...panelStyle, animationDelay:'0.28s' }} className="svc-section-enter">
              <div style={topAccentBar} />
              <SvcSectionLabel icon={Camera} label="Device Photos" />
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem' }}>
                <PhotoUpload label="Customer Photo" onFile={file => setPhotos(prev => ({ ...prev, customer: file }))} />
                <PhotoUpload label="Device Front"   onFile={file => setPhotos(prev => ({ ...prev, front: file }))} />
                <PhotoUpload label="Device Back"    onFile={file => setPhotos(prev => ({ ...prev, back: file }))} />
              </div>
            </div>

            {/* Submit */}
            <SubmitBtn loading={loading} />
          </form>
        </div>
      </div>
    </>
  );
}

function IssueChip({ label, selected, onClick }) {
  const ripple = useRipple();
  return (
    <button type="button"
      onClick={(e) => { ripple(e); onClick(); }}
      className="svc-ripple"
      style={{
        display:'inline-flex', alignItems:'center', gap:'0.3rem',
        padding:'0.375rem 0.75rem', borderRadius:'9999px',
        fontSize:'0.75rem', fontWeight:700, cursor:'pointer',
        border: `1.5px solid ${selected ? 'transparent' : 'var(--border)'}`,
        background: selected ? 'var(--ink)' : 'var(--surface)',
        color: selected ? '#fff' : 'var(--ink-mid)',
        transition:'all 0.18s',
        boxShadow: selected ? '0 4px 12px rgba(0,0,0,0.18)' : 'none',
      }}
    >
      {selected && <span style={{ width:5, height:5, borderRadius:'50%', background:'var(--accent)', display:'inline-block' }} />}
      {label}
    </button>
  );
}

function RegField({ label, children }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'0.375rem' }}>
      <label className="svc-label">{label}</label>
      {children}
    </div>
  );
}

function SubmitBtn({ loading }) {
  const ripple = useRipple();
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="submit" disabled={loading}
      onClick={ripple}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="svc-ripple svc-shine"
      style={{
        width:'100%', padding:'1rem', borderRadius:'1.25rem',
        fontSize:'0.9375rem', fontWeight:700, color:'#fff', cursor: loading ? 'not-allowed' : 'pointer',
        background:'var(--ink)',
        border: `1.5px solid ${hovered ? 'var(--accent)' : 'var(--ink)'}`,
        boxShadow: hovered ? '0 8px 28px rgba(0,0,0,0.25)' : '0 4px 16px rgba(0,0,0,0.15)',
        transition:'box-shadow 0.2s, border-color 0.2s, transform 0.2s',
        transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
        opacity: loading ? 0.6 : 1,
        animation:'svc-section-enter 0.5s var(--ease-expo) 0.32s both',
      }}
    >
      <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem' }}>
        {loading ? (
          <>
            <div style={{ width:16, height:16, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', animation:'svc-spin-slow 0.7s linear infinite' }} />
            Registering…
          </>
        ) : (
          <>
            <Zap style={{ width:16, height:16, color:'var(--accent)' }} strokeWidth={2.5} />
            Confirm &amp; Register Service
          </>
        )}
      </span>
    </button>
  );
}

function BackBtn({ onClick }) {
  const ripple = useRipple();
  return (
    <button onClick={(e) => { ripple(e); onClick(); }} className="svc-ripple"
      style={{ width:40, height:40, borderRadius:'0.875rem', display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.15)', cursor:'pointer', color:'#fff', flexShrink:0, transition:'background 0.2s' }}>
      <ArrowLeft style={{ width:16, height:16 }} />
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PHOTO UPLOAD
═══════════════════════════════════════════════════════════════ */
function PhotoUpload({ label, onFile }) {
  const [preview, setPreview]       = useState(null);
  const [objectUrl, setObjectUrl]   = useState('');
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef(null);
  const inputId  = `photo-${label.replace(/\s+/g,'-').toLowerCase()}`;

  useEffect(() => { return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); }; }, [objectUrl]);

  async function handleChange(e) {
    const rawFile = e.target.files?.[0]; if (!rawFile) return;
    try {
      setProcessing(true);
      const compressed = await compressImage(rawFile);
      onFile(compressed);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      const url = URL.createObjectURL(compressed);
      setObjectUrl(url); setPreview(url);
      if (inputRef.current) inputRef.current.value = '';
    } catch { alert('Image processing failed.'); }
    finally { setProcessing(false); }
  }

  function handleRemove() {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    setObjectUrl(''); setPreview(null); onFile(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
      <label className="svc-label">{label}</label>
      <div className="svc-photo-aspect" style={{ position:'relative', overflow:'hidden', borderRadius:'1rem', border:`2px dashed var(--border)`, background:'var(--surface)', transition:'border-color 0.2s' }}>
        {preview ? (
          <>
            <img src={preview} alt="Preview" loading="lazy" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            <button type="button" onClick={handleRemove}
              style={{ position:'absolute', bottom:8, right:8, width:28, height:28, borderRadius:'50%', background:'rgba(0,0,0,0.55)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }}>
              <X style={{ width:12, height:12, color:'#fff' }} />
            </button>
          </>
        ) : (
          <label htmlFor={inputId} style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', width:'100%', cursor:'pointer', gap:'0.5rem', padding:'0.75rem' }}>
            {processing ? (
              <>
                <div style={{ width:24, height:24, borderRadius:'50%', border:'2px solid var(--border)', borderTopColor:'var(--accent)', animation:'svc-spin-slow 0.7s linear infinite' }} />
                <span className="svc-label" style={{ margin:0 }}>Processing…</span>
              </>
            ) : (
              <>
                <div style={{ width:36, height:36, borderRadius:'0.75rem', background:'var(--accent-dim)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Camera style={{ width:18, height:18, color:'var(--accent)' }} />
                </div>
                <span className="svc-label" style={{ margin:0, textAlign:'center', lineHeight:1.3 }}>{label}</span>
              </>
            )}
            <input ref={inputRef} id={inputId} type="file" accept="image/*" capture="user" style={{ display:'none' }} onChange={handleChange} disabled={processing} />
          </label>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SERVICE DETAILS
═══════════════════════════════════════════════════════════════ */
function ServiceDetails({ service, onBack, onUpdate }) {
  const { profile }  = useAuth();
  const [loading, setLoading]           = useState(false);
  const [history, setHistory]           = useState([]);
  const [showReturn, setShowReturn]     = useState(false);
  const [finalAmount, setFinalAmount]   = useState(service.estimated_cost.toString());
  const [statusReason, setStatusReason] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(service.status);
  const [previewIndex, setPreviewIndex] = useState(null);
  const [touchStartX, setTouchStartX]   = useState(null);
  const [touchEndX, setTouchEndX]       = useState(null);

  const cfg          = getStatusCfg(service.status);
  const StatusIcon   = cfg.icon || Clock;
  const isFinalStatus = service.status === 'Completed' || service.status === 'Not Repairable';
  const canReturn     = service.status === 'Completed' || service.status === 'Not Repairable';
  const photoList     = [service.customer_photo_url, service.device_front_photo_url, service.device_back_photo_url].filter(Boolean);

  function goToPrev() { setPreviewIndex(p => p===0 ? photoList.length-1 : p-1); }
  function goToNext() { setPreviewIndex(p => p===photoList.length-1 ? 0 : p+1); }
  function handleTouchStart(e){ setTouchEndX(null); setTouchStartX(e.targetTouches[0].clientX); }
  function handleTouchMove(e){ setTouchEndX(e.targetTouches[0].clientX); }
  function handleTouchEnd(){ if(!touchStartX||!touchEndX) return; const d=touchStartX-touchEndX; if(d>50)goToNext(); else if(d<-50)goToPrev(); }

  useEffect(() => { fetchHistory(); }, [service.id]);

  async function fetchHistory() {
    try { const data = await serviceService.getServiceHistory(service.id); setHistory(data); } catch {}
  }

  async function updateStatus() {
    try {
      setLoading(true);
      await serviceService.updateStatus(service.id, selectedStatus, profile?.id, statusReason);
      toast.success(`Status updated to ${selectedStatus}`);
      setStatusReason('');
      await fetchHistory();
      await onUpdate();
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  }

  async function handleReturn() {
    try {
      setLoading(true);
      await serviceService.returnService(service.id, finalAmount, profile?.id);
      toast.success('Mobile returned successfully');
      onUpdate(); onBack();
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  }

  const panelStyle = {
    background:'var(--surface-raise)', border:'1px solid var(--border)',
    borderRadius:'1.5rem', padding:'1.5rem', position:'relative', overflow:'hidden',
    boxShadow:'0 2px 16px rgba(0,0,0,0.04)',
  };
  const topAccentBar = {
    position:'absolute', top:0, left:'1.5rem', right:'1.5rem', height:2,
    background:'linear-gradient(90deg, var(--accent), transparent)',
    borderRadius:'0 0 3px 3px', opacity:0.5,
  };

  return (
    <>
      <SvcStyleInjector />
      <div className="svc-font-body" style={{ backgroundColor:'var(--surface)', minHeight:'100vh', paddingBottom:'5rem' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>

          {/* Details Hero */}
          <header style={{ background:'linear-gradient(135deg,#0d0d0d 0%,#181818 60%,#0d0d0d 100%)', borderRadius:'1.75rem', padding:'1.75rem', position:'relative', overflow:'hidden', boxShadow:'0 24px 60px -16px rgba(0,0,0,0.45)', animation:'svc-fade-up 0.6s var(--ease-expo) both' }}>
            <div className="svc-blob" style={{ width:240, height:240, background:'var(--accent)', opacity:0.06, top:-50, right:-30 }} />
            {/* Status-colored secondary blob */}
            <div className="svc-blob" style={{ width:180, height:180, background:cfg.color, opacity:0.05, bottom:-30, left:'25%', animationDelay:'5s' }} />
            <div style={{ position:'absolute', right:28, top:28, width:80, height:80, animation:'svc-spin-slow 20s linear infinite', pointerEvents:'none' }}>
              <div style={{ width:'100%', height:'100%', borderRadius:'50%', border:'1px dashed rgba(249,115,22,0.18)' }} />
            </div>
            <div style={{ position:'absolute', right:36, top:36, width:52, height:52, animation:'svc-spin-rev 9s linear infinite', pointerEvents:'none' }}>
              <div style={{ width:'100%', height:'100%', borderRadius:'50%', border:'1px solid rgba(249,115,22,0.10)' }} />
            </div>
            <div style={{ position:'absolute', right:49, top:49, pointerEvents:'none' }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent)', opacity:0.65, animation:'svc-orbit 9s linear infinite' }} />
            </div>
            <div style={{ position:'absolute', top:0, left:'8%', width:100, height:2, background:'linear-gradient(90deg,var(--accent),transparent)', opacity:0.55 }} />

            <div style={{ position:'relative', display:'flex', flexWrap:'wrap', alignItems:'flex-end', justifyContent:'space-between', gap:'1.25rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                <BackBtn onClick={onBack} />
                <div>
                  <p style={{ fontSize:'0.625rem', fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', color:cfg.color, marginBottom:'0.3rem' }}>
                    {service.ticket_number}
                  </p>
                  <h1 className="svc-font-display" style={{ fontSize:'clamp(1.375rem,3vw,2rem)', fontWeight:400, lineHeight:1.1, color:'rgba(255,255,255,0.94)', fontStyle:'italic' }}>
                    {service.customer_name}
                  </h1>
                  <p style={{ fontSize:'0.8125rem', color:'rgba(255,255,255,0.35)', marginTop:'0.25rem' }}>
                    {service.device_brand} {service.device_model}
                  </p>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap' }}>
                <StatusPill status={service.status} />
                <div style={{ background:'rgba(255,255,255,0.06)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:'1.125rem', padding:'0.75rem 1.25rem', textAlign:'right' }}>
                  <p style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(255,255,255,0.28)', marginBottom:'0.2rem' }}>Est. Cost</p>
                  <p style={{ fontSize:'1.375rem', fontWeight:800, letterSpacing:'-0.03em', color:'var(--accent)', margin:0 }}>{formatCurrency(service.estimated_cost)}</p>
                </div>
              </div>
            </div>
          </header>

          {/* Main grid */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:'1.5rem', alignItems:'start' }}>

            {/* ── LEFT / MAIN ── */}
            <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem', gridColumn:'span 2' }}>

              {/* Info */}
              <div style={{ ...panelStyle, animation:'svc-card-in 0.55s var(--ease-expo) 0.05s both' }}>
                <div style={topAccentBar} />
                <SvcSectionLabel icon={FileText} label="Service Details" />
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'1.25rem' }}>
                  <DtlItem icon={Smartphone}  label="Mobile"    value={service.customer_mobile}       color={cfg.color} />
                  <DtlItem icon={MapPin}       label="Area"      value={service.customer_address||'N/A'} color={cfg.color} />
                  <DtlItem icon={Wrench}       label="Device"    value={`${service.device_brand} ${service.device_model}`} color={cfg.color} />
                  <DtlItem icon={IndianRupee}  label="Est. Cost" value={formatCurrency(service.estimated_cost)} color={cfg.color} />
                </div>
                <div style={{ marginTop:'1.25rem', borderTop:'1px solid var(--border)', paddingTop:'1.25rem' }}>
                  <label className="svc-label">Issue</label>
                  <p style={{ fontSize:'0.9375rem', fontWeight:700, color:'var(--ink)', margin:'0.375rem 0 0.25rem' }}>{service.issue_type}</p>
                  {service.issue_description && (
                    <p style={{ fontSize:'0.8125rem', color:'var(--ink-mid)', lineHeight:1.6 }}>{service.issue_description}</p>
                  )}
                </div>
              </div>

              {/* Photos */}
              <div style={{ ...panelStyle, animation:'svc-card-in 0.55s var(--ease-expo) 0.1s both' }}>
                <div style={topAccentBar} />
                <SvcSectionLabel icon={Camera} label="Device Photos" />
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem' }}>
                  {[
                    { url:service.customer_photo_url,       label:'Customer' },
                    { url:service.device_front_photo_url,   label:'Front' },
                    { url:service.device_back_photo_url,    label:'Back' },
                  ].map(({ url, label }) => url ? (
                    <button key={label} type="button"
                      onClick={() => setPreviewIndex(photoList.indexOf(url))}
                      className="svc-shine"
                      style={{ position:'relative', aspectRatio:'1/1', overflow:'hidden', borderRadius:'0.875rem', border:'1.5px solid var(--border)', cursor:'pointer', transition:'border-color 0.2s', padding:0 }}
                    >
                      <img src={url} alt={label} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      <span style={{ position:'absolute', bottom:8, left:8, background:'rgba(0,0,0,0.55)', backdropFilter:'blur(4px)', borderRadius:'0.375rem', padding:'0.15rem 0.5rem', fontSize:'0.6rem', fontWeight:700, color:'#fff', textTransform:'uppercase', letterSpacing:'0.08em' }}>{label}</span>
                    </button>
                  ) : (
                    <div key={label} style={{ aspectRatio:'1/1', borderRadius:'0.875rem', background:'var(--surface)', border:'2px dashed var(--border)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'0.375rem' }}>
                      <Camera style={{ width:22, height:22, color:'var(--border-strong)' }} />
                      <span className="svc-label" style={{ margin:0 }}>No {label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── RIGHT COL ── */}
            <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

              {/* Status Update */}
              <div style={{ ...panelStyle, animation:'svc-card-in 0.55s var(--ease-expo) 0.08s both' }}>
                <div style={topAccentBar} />
                <SvcSectionLabel icon={Activity} label="Update Status" />

                {isFinalStatus ? (
                  <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'1rem', borderRadius:'0.875rem', background:cfg.bg, border:`1.5px solid ${cfg.border}` }}>
                    <div style={{ width:36, height:36, borderRadius:'0.75rem', display:'flex', alignItems:'center', justifyContent:'center', background:`${cfg.color}18`, flexShrink:0 }}>
                      <StatusIcon style={{ width:18, height:18, color:cfg.color }} />
                    </div>
                    <div>
                      <p style={{ fontSize:'0.8125rem', fontWeight:700, color:cfg.color, margin:0 }}>{service.status}</p>
                      <p style={{ fontSize:'0.6875rem', color:'var(--ink-faint)', margin:'0.2rem 0 0' }}>Final status</p>
                    </div>
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                    <div style={{ position:'relative' }}>
                      <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} disabled={loading} className="svc-input" style={{ appearance:'none', paddingRight:'2.25rem' }}>
                        {['Received','In Progress','Waiting for Parts','Completed','Not Repairable'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <ChevronDown style={{ position:'absolute', right:'0.75rem', top:'50%', transform:'translateY(-50%)', width:16, height:16, color:'var(--ink-faint)', pointerEvents:'none' }} />
                    </div>

                    {(selectedStatus==='Waiting for Parts'||selectedStatus==='Not Repairable') && (
                      <div style={{ display:'flex', flexDirection:'column', gap:'0.375rem' }}>
                        <label className="svc-label">Reason / Details</label>
                        <textarea className="svc-input" rows={2} placeholder="Enter details…" value={statusReason} onChange={e => setStatusReason(e.target.value)} />
                      </div>
                    )}

                    <UpdateStatusBtn loading={loading} disabled={selectedStatus===service.status} onClick={updateStatus} />
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div style={{ ...panelStyle, animation:'svc-card-in 0.55s var(--ease-expo) 0.13s both' }}>
                <div style={topAccentBar} />
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.875rem' }}>
                  <SvcSectionLabel icon={Clock} label="Timeline" />
                  <span style={{ borderRadius:'9999px', background:'var(--surface)', border:'1px solid var(--border)', padding:'0.2rem 0.6rem', fontSize:'0.6875rem', fontWeight:700, color:'var(--ink-mid)', marginTop:'-0.875rem' }}>
                    {history.length}
                  </span>
                </div>

                <div style={{ display:'flex', flexDirection:'column', gap:'0.625rem' }}>
                  {history.length > 0 ? history.map((item, idx) => {
                    const ss    = getStatusStyles(item.status);
                    const isMine = item.updated_by === profile?.id;
                    return (
                      <div key={item.id||idx}
                        className={cn(idx!==history.length-1 ? 'svc-tl-line' : '')}
                        style={{
                          position:'relative', borderRadius:'0.875rem', padding:'0.875rem',
                          border:`1.5px solid ${isMine ? 'rgba(249,115,22,0.25)' : 'var(--border)'}`,
                          background: isMine ? 'linear-gradient(135deg,#fff7ed 0%,#fff 100%)' : 'var(--surface-raise)',
                          animation:`svc-slide-right 0.4s var(--ease-expo) ${idx*0.06}s both`,
                        }}
                      >
                        {isMine && <div style={{ position:'absolute', left:0, top:0, bottom:0, width:3, background:'var(--accent)', borderRadius:'0.875rem 0 0 0.875rem' }} />}
                        <div style={{ display:'flex', alignItems:'flex-start', gap:'0.625rem', paddingLeft: isMine ? '0.5rem' : 0 }}>
                          <div style={{ position:'relative', flexShrink:0, marginTop:3 }}>
                            <span style={{ display:'block', width:10, height:10, borderRadius:'50%', background:ss.dotColor }} />
                            <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:ss.dotColor, opacity:0.3, animation:'svc-live-ring 2.5s ease-out infinite' }} />
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:'0.4rem', marginBottom:'0.2rem' }}>
                              <p style={{ fontSize:'0.8125rem', fontWeight:700, color:ss.textColor, margin:0 }}>{formatStatusLabel(item.status)}</p>
                              {isMine && (
                                <span style={{ borderRadius:100, padding:'0.2rem 0.5rem', background:'var(--accent)', color:'#fff', fontSize:'0.6rem', fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase' }}>You</span>
                              )}
                            </div>
                            <p style={{ fontSize:'0.6875rem', color:'var(--ink-faint)', margin:0 }}>
                              by <strong style={{ color:'var(--ink-mid)' }}>{item.profiles?.full_name||'Staff'}</strong>
                            </p>
                            <p style={{ fontSize:'0.6875rem', color:'var(--ink-faint)', margin:'0.15rem 0 0' }}>{formatDateTime(item.created_at)}</p>
                            {item.reason && (
                              <div style={{ marginTop:'0.5rem', display:'inline-flex', borderRadius:'0.5rem', border:`1px solid ${ss.badgeBorder}`, padding:'0.2rem 0.625rem', fontSize:'0.6875rem', fontWeight:600, background:ss.badgeBg, color:ss.textColor }}>
                                {item.reason}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }) : (
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'2rem', gap:'0.5rem' }}>
                      <Clock style={{ width:24, height:24, color:'var(--border-strong)' }} />
                      <p style={{ fontSize:'0.8125rem', color:'var(--ink-faint)', fontWeight:500 }}>No updates yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Return Button */}
              <ReturnBtn canReturn={canReturn} onClick={() => setShowReturn(true)} />
            </div>
          </div>
        </div>

        {/* ── Return Modal ── */}
        {showReturn && (
          <div style={{ position:'fixed', inset:0, zIndex:60, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.55)', backdropFilter:'blur(6px)', padding:'1rem', animation:'svc-fade-up 0.25s var(--ease-expo) both' }}>
            <div style={{ width:'100%', maxWidth:380, borderRadius:'1.5rem', background:'var(--surface-raise)', overflow:'hidden', boxShadow:'0 32px 80px rgba(0,0,0,0.3)', border:'1px solid var(--border)', animation:'svc-num-rise 0.35s var(--ease-spring) both' }}>
              <div style={{ background:'var(--ink)', padding:'1.25rem 1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'var(--accent)' }} />
                <div className="svc-blob" style={{ width:120, height:120, background:'var(--accent)', opacity:0.06, top:-30, right:-20 }} />
                <div style={{ position:'relative' }}>
                  <p style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(255,255,255,0.28)', marginBottom:'0.25rem' }}>Confirm Return</p>
                  <h3 style={{ fontSize:'1rem', fontWeight:600, color:'#fff', margin:0 }}>Return Mobile</h3>
                </div>
                <CloseBtn onClick={() => setShowReturn(false)} />
              </div>

              <div style={{ padding:'1.25rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
                {/* Customer preview */}
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.875rem 1rem', borderRadius:'0.875rem', background:cfg.bg, border:`1.5px solid ${cfg.border}` }}>
                  {service.customer_photo_url && (
                    <img src={service.customer_photo_url} style={{ width:44, height:44, borderRadius:'50%', objectFit:'cover', border:'2px solid var(--surface-raise)', flexShrink:0 }} alt="" />
                  )}
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:'0.875rem', fontWeight:700, color:'var(--ink)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', margin:0 }}>{service.customer_name}</p>
                    <p style={{ fontSize:'0.75rem', color:'var(--ink-faint)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', margin:'0.2rem 0' }}>{service.device_brand} {service.device_model}</p>
                    <p style={{ fontSize:'0.6rem', fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', color:cfg.color, margin:0 }}>{service.ticket_number}</p>
                  </div>
                  <StatusPill status={service.status} />
                </div>

                <RegField label="Final Collected Amount">
                  <div style={{ position:'relative' }}>
                    <div style={{ position:'absolute', left:'0.875rem', top:'50%', transform:'translateY(-50%)', width:20, height:20, borderRadius:'0.375rem', background:'var(--accent-dim)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <IndianRupee style={{ width:11, height:11, color:'var(--accent)' }} />
                    </div>
                    <input type="number" className="svc-input" style={{ paddingLeft:'2.5rem' }} value={finalAmount} onChange={e => setFinalAmount(e.target.value)} />
                  </div>
                </RegField>

                <div style={{ display:'flex', gap:'0.75rem', paddingTop:'0.25rem' }}>
                  <button onClick={() => setShowReturn(false)}
                    style={{ flex:1, padding:'0.75rem', borderRadius:'0.875rem', border:'1.5px solid var(--border)', background:'var(--surface-raise)', fontSize:'0.875rem', fontWeight:700, color:'var(--ink-mid)', cursor:'pointer' }}>
                    Cancel
                  </button>
                  <ConfirmReturnBtn loading={loading} onClick={handleReturn} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Image Preview Modal ── */}
        {previewIndex !== null && (
          <div
            style={{ position:'fixed', inset:0, zIndex:70, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.9)', padding:'1rem', animation:'svc-fade-up 0.25s var(--ease-expo) both' }}
            onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
          >
            <button onClick={() => setPreviewIndex(null)}
              style={{ position:'absolute', right:16, top:16, width:40, height:40, borderRadius:'0.875rem', background:'rgba(255,255,255,0.1)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }}>
              <X style={{ width:16, height:16, color:'#fff' }} />
            </button>
            {photoList.length > 1 && (
              <>
                <button onClick={goToPrev} style={{ position:'absolute', left:16, width:44, height:44, borderRadius:'0.875rem', background:'rgba(255,255,255,0.1)', border:'none', cursor:'pointer', color:'#fff', fontSize:'1.375rem', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }}>‹</button>
                <button onClick={goToNext} style={{ position:'absolute', right:16, width:44, height:44, borderRadius:'0.875rem', background:'rgba(255,255,255,0.1)', border:'none', cursor:'pointer', color:'#fff', fontSize:'1.375rem', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }}>›</button>
              </>
            )}
            <img src={photoList[previewIndex]} alt="Preview"
              style={{ maxHeight:'88vh', maxWidth:'88vw', borderRadius:'1rem', objectFit:'contain', userSelect:'none', boxShadow:'0 32px 64px rgba(0,0,0,0.5)' }} />
            <div style={{ position:'absolute', bottom:20, display:'flex', gap:'0.375rem' }}>
              {photoList.map((_,i) => (
                <button key={i} onClick={() => setPreviewIndex(i)}
                  style={{ height:6, width: i===previewIndex?24:8, borderRadius:3, background: i===previewIndex?'var(--accent)':'rgba(255,255,255,0.3)', border:'none', cursor:'pointer', transition:'all 0.2s', padding:0 }} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ── Action Buttons ── */
function UpdateStatusBtn({ loading, disabled, onClick }) {
  const ripple = useRipple();
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={(e) => { ripple(e); onClick(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={loading || disabled}
      className="svc-ripple svc-shine"
      style={{
        width:'100%', padding:'0.75rem', borderRadius:'0.875rem',
        fontSize:'0.875rem', fontWeight:700,
        background: disabled ? 'var(--surface)' : 'var(--ink)',
        color: disabled ? 'var(--ink-faint)' : '#fff',
        border: `1.5px solid ${disabled ? 'var(--border)' : hovered ? 'var(--accent)' : 'var(--ink)'}`,
        cursor: (loading||disabled) ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1,
        transition:'all 0.2s',
        transform: hovered && !disabled ? 'translateY(-1px)' : 'translateY(0)',
      }}
    >
      <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.4rem' }}>
        {loading ? (
          <><div style={{ width:14, height:14, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', animation:'svc-spin-slow 0.7s linear infinite' }} />Updating…</>
        ) : (
          <><Zap style={{ width:14, height:14, color: disabled ? 'var(--ink-faint)' : 'var(--accent)' }} strokeWidth={2.5} />Update Status</>
        )}
      </span>
    </button>
  );
}

function ReturnBtn({ canReturn, onClick }) {
  const ripple = useRipple();
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={(e) => { ripple(e); if (canReturn) onClick(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={!canReturn}
      className="svc-ripple svc-shine svc-accent-glow"
      style={{
        width:'100%', padding:'1rem', borderRadius:'1.25rem',
        fontSize:'0.9375rem', fontWeight:700,
        background: canReturn ? 'var(--ink)' : 'var(--surface)',
        color: canReturn ? '#fff' : 'var(--ink-faint)',
        border: `1.5px solid ${canReturn ? (hovered ? 'var(--accent)' : 'var(--ink)') : 'var(--border)'}`,
        cursor: canReturn ? 'pointer' : 'not-allowed',
        boxShadow: canReturn ? (hovered ? '0 8px 28px rgba(0,0,0,0.25)' : '0 4px 16px rgba(0,0,0,0.15)') : 'none',
        transition:'all 0.2s',
        transform: hovered && canReturn ? 'translateY(-1px)' : 'translateY(0)',
      }}
    >
      <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem' }}>
        <ReceiptText style={{ width:16, height:16, color: canReturn ? 'var(--accent)' : 'var(--ink-faint)' }} strokeWidth={2.5} />
        Return Mobile to Customer
      </span>
    </button>
  );
}

function ConfirmReturnBtn({ loading, onClick }) {
  const ripple = useRipple();
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={(e) => { ripple(e); onClick(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={loading}
      className="svc-ripple"
      style={{
        flex:1, padding:'0.75rem', borderRadius:'0.875rem',
        fontSize:'0.875rem', fontWeight:700, color:'#fff',
        background:'var(--ink)',
        border: `1.5px solid ${hovered ? 'var(--accent)' : 'var(--ink)'}`,
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1,
        transition:'border-color 0.2s, transform 0.2s',
        transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
      }}
    >
      {loading ? 'Processing…' : 'Confirm Return'}
    </button>
  );
}

function CloseBtn({ onClick }) {
  const ripple = useRipple();
  return (
    <button onClick={(e) => { ripple(e); onClick(); }} className="svc-ripple"
      style={{ width:32, height:32, borderRadius:'50%', background:'rgba(255,255,255,0.1)', border:'none', cursor:'pointer', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', flexShrink:0 }}>
      <X style={{ width:14, height:14 }} />
    </button>
  );
}

/* ── Detail Item ── */
function DtlItem({ icon: Icon, label, value, color }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', gap:'0.75rem' }}>
      <div style={{ width:36, height:36, borderRadius:'0.75rem', display:'flex', alignItems:'center', justifyContent:'center', background:`${color}12`, border:`1.5px solid ${color}20`, flexShrink:0 }}>
        <Icon style={{ width:15, height:15, color }} strokeWidth={2} />
      </div>
      <div>
        <label className="svc-label" style={{ marginBottom:'0.25rem' }}>{label}</label>
        <p style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--ink)', margin:0 }}>{value}</p>
      </div>
    </div>
  );
}

/* ── Helpers ── */
function getStatusStyles(status = '') {
  const s = status.toLowerCase();
  const make = (dot, text, badgeBg, badgeBorder) => ({ dotColor:dot, textColor:text, badgeBg, badgeBorder });
  if (s.includes('received'))                                                                           return make('#3b82f6','#1d4ed8','#eff6ff','#bfdbfe');
  if (s.includes('diagnosed'))                                                                          return make('#8b5cf6','#7c3aed','#f5f3ff','#ddd6fe');
  if (s.includes('in repair')||s.includes('repairing')||s.includes('in progress'))                     return make('#f97316','#ea580c','#fff7ed','#fed7aa');
  if (s.includes('waiting'))                                                                            return make('#f59e0b','#d97706','#fffbeb','#fde68a');
  if (s.includes('completed'))                                                                          return make('#10b981','#059669','#ecfdf5','#a7f3d0');
  if (s.includes('returned'))                                                                           return make('#22c55e','#16a34a','#f0fdf4','#bbf7d0');
  if (s.includes('cancel')||s.includes('non repairable')||s.includes('not repairable')||s.includes('rejected')) return make('#ef4444','#dc2626','#fef2f2','#fecaca');
  return make('#6b7280','#374151','#f9fafb','#e5e7eb');
}

function formatStatusLabel(status = '') {
  return status.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase());
}
