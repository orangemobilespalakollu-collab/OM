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

/* ══════════════════════════════════════════════════════
   STYLES — full dashboard token system
══════════════════════════════════════════════════════ */
const SVC_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}
@keyframes float {
  0%,100% { transform: translateY(0px); }
  50%      { transform: translateY(-6px); }
}
@keyframes spin-slow  { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes spin-rev   { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
@keyframes slide-up   { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
@keyframes scale-in   { from { opacity:0; transform:scale(0.93); } to { opacity:1; transform:scale(1); } }
@keyframes fade-in    { from { opacity:0; } to { opacity:1; } }
@keyframes count-in   { from { opacity:0; transform:scale(0.5); } to { opacity:1; transform:scale(1); } }
@keyframes blink      { 0%,100%{ opacity:1; } 50%{ opacity:0.25; } }
@keyframes pulse-ring { 0%{ transform:scale(0.85); opacity:0.6; } 70%{ transform:scale(1.6); opacity:0; } 100%{ transform:scale(1.6); opacity:0; } }
@keyframes tab-pop    { 0%{ transform:scale(0.9); } 100%{ transform:scale(1); } }

.svc-slide-up  { animation: slide-up 0.45s ease forwards; }
.svc-scale-in  { animation: scale-in 0.4s cubic-bezier(.34,1.56,.64,1) forwards; }
.svc-fade-in   { animation: fade-in 0.3s ease forwards; }
.svc-count-in  { animation: count-in 0.4s cubic-bezier(.34,1.56,.64,1) forwards; }
.svc-float     { animation: float 3.5s ease-in-out infinite; }
.svc-spin      { animation: spin-slow 10s linear infinite; }
.svc-spin-rev  { animation: spin-rev 7s linear infinite; }
.svc-blink     { animation: blink 2s ease-in-out infinite; }

.svc-shimmer-text {
  background: linear-gradient(90deg,#f97316,#a855f7,#3b82f6,#f97316);
  background-size: 300% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 4s linear infinite;
}

.svc-mesh-bg {
  background-color: #fafafa;
  background-image:
    radial-gradient(at 15% 10%, rgba(249,115,22,0.08) 0px, transparent 50%),
    radial-gradient(at 85% 5%,  rgba(168,85,247,0.07) 0px, transparent 50%),
    radial-gradient(at 5%  70%, rgba(59,130,246,0.06) 0px, transparent 50%),
    radial-gradient(at 90% 85%,rgba(34,197,94,0.05)  0px, transparent 50%);
}

.svc-glass {
  background: rgba(255,255,255,0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.9);
}

.svc-orb {
  border-radius: 50%;
  filter: blur(40px);
  position: absolute;
  pointer-events: none;
}

/* card hover — same as dashboard */
.svc-card-hover {
  transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), box-shadow 0.25s ease, border-color 0.2s;
}
.svc-card-hover:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: 0 20px 40px -10px rgba(0,0,0,0.12);
}
.svc-card-hover:active { transform: scale(0.98); }

/* input */
.svc-input {
  width: 100%;
  border-radius: 14px;
  border: 1.5px solid #e5e7eb;
  padding: 11px 14px;
  font-size: 13.5px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 500;
  color: #111827;
  background: #fff;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.svc-input:focus {
  border-color: #f97316;
  box-shadow: 0 0 0 3px rgba(249,115,22,0.12);
}
.svc-input::placeholder { color: #9ca3af; }

.svc-label {
  display: block;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #6b7280;
  margin-bottom: 6px;
  font-family: 'DM Sans', sans-serif;
}

/* gradient cards */
.grad-blue    { background: linear-gradient(135deg,#eff6ff,#fff); }
.grad-orange  { background: linear-gradient(135deg,#fff7ed,#fff); }
.grad-amber   { background: linear-gradient(135deg,#fffbeb,#fff); }
.grad-emerald { background: linear-gradient(135deg,#ecfdf5,#fff); }
.grad-red     { background: linear-gradient(135deg,#fef2f2,#fff); }
.grad-purple  { background: linear-gradient(135deg,#faf5ff,#fff); }

.svc-font    { font-family: 'DM Sans', sans-serif; }
.display-font{ font-family: 'Syne', sans-serif; }

/* timeline */
.tl-line::before {
  content:'';
  position:absolute;
  left:15px; top:32px; bottom:-12px;
  width:2px;
  background: linear-gradient(180deg,#f3f4f6,transparent);
}

/* tag chip */
.svc-chip {
  display:inline-flex;
  align-items:center;
  gap:4px;
  padding:5px 12px;
  border-radius:999px;
  font-size:11px;
  font-weight:700;
  font-family:'DM Sans',sans-serif;
  transition: all 0.18s ease;
  cursor:pointer;
}
.svc-chip:hover { transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,0.10); }

/* status pill */
.status-pill {
  display:inline-flex;
  align-items:center;
  gap:5px;
  border-radius:9999px;
  padding:4px 10px;
  font-size:10px;
  font-weight:800;
  letter-spacing:0.07em;
  text-transform:uppercase;
  white-space:nowrap;
  font-family:'DM Sans',sans-serif;
}

/* photo aspect ratio helper */
.photo-aspect { aspect-ratio: 1/1; }

:root {
  --accent:        #f97316;
  --accent-dim:    rgba(249,115,22,0.12);
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

.font-display { font-family: 'Instrument Serif', Georgia, serif; }
.font-body    { font-family: 'Geist', system-ui, sans-serif; }

@keyframes fade-up {
  from { opacity: 0; transform: translateY(22px); filter: blur(4px); }
  to   { opacity: 1; transform: translateY(0);    filter: blur(0); }
}
@keyframes num-rise {
  from { opacity: 0; transform: translateY(10px) scale(0.92); }
  to   { opacity: 1; transform: translateY(0)    scale(1); }
}
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes live-ring {
  0%   { transform: scale(1);   opacity: 0.5; }
  70%  { transform: scale(2.4); opacity: 0; }
  100% { transform: scale(2.4); opacity: 0; }
}
@keyframes card-in {
  from { opacity: 0; transform: translateY(18px) scale(0.97); filter: blur(3px); }
  to   { opacity: 1; transform: translateY(0)    scale(1);    filter: blur(0); }
}
@keyframes shine {
  from { left: -80%; }
  to   { left: 130%; }
}
@keyframes ripple-out {
  from { transform: scale(0); opacity: 0.35; }
  to   { transform: scale(3.5); opacity: 0; }
}
@keyframes slide-right {
  from { opacity: 0; transform: translateX(-14px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes underline-grow {
  from { transform: scaleX(0); transform-origin: left; }
  to   { transform: scaleX(1); transform-origin: left; }
}
@keyframes blob-morph {
  0%,100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
  33%      { border-radius: 30% 70% 60% 40% / 50% 60% 30% 60%; }
  66%      { border-radius: 50% 30% 70% 40% / 40% 70% 30% 60%; }
}
@keyframes glow-breathe {
  0%,100% { box-shadow: 0 0 0 0 rgba(249,115,22,0); }
  50%      { box-shadow: 0 0 28px 8px rgba(249,115,22,0.2); }
}
@keyframes orbit {
  from { transform: rotate(0deg) translateX(44px) rotate(0deg); }
  to   { transform: rotate(360deg) translateX(44px) rotate(-360deg); }
}
@keyframes top-bar-in {
  from { transform: scaleX(0); transform-origin: left; }
  to   { transform: scaleX(1); transform-origin: left; }
}

.stagger > *:nth-child(1) { animation: card-in 0.55s var(--ease-expo) 0.04s both; }
.stagger > *:nth-child(2) { animation: card-in 0.55s var(--ease-expo) 0.10s both; }
.stagger > *:nth-child(3) { animation: card-in 0.55s var(--ease-expo) 0.16s both; }
.stagger > *:nth-child(4) { animation: card-in 0.55s var(--ease-expo) 0.22s both; }
.stagger > *:nth-child(5) { animation: card-in 0.55s var(--ease-expo) 0.28s both; }
.stagger > *:nth-child(6) { animation: card-in 0.55s var(--ease-expo) 0.34s both; }

.section-enter { animation: fade-up 0.65s var(--ease-expo) both; }

.shine-host { position: relative; overflow: hidden; }
.shine-host::before {
  content: '';
  position: absolute;
  top: -50%; left: -80%;
  width: 50%; height: 200%;
  background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%);
  transform: skewX(-20deg);
  pointer-events: none; z-index: 2;
}
.shine-host:hover::before { animation: shine 0.5s ease forwards; }

.ripple-host { position: relative; overflow: hidden; }
.ripple-circle {
  position: absolute; border-radius: 50%;
  background: rgba(255,255,255,0.28);
  transform: scale(0);
  animation: ripple-out 0.6s linear forwards;
  pointer-events: none;
}

.blob {
  border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
  animation: blob-morph 10s ease-in-out infinite;
  position: absolute; pointer-events: none;
}

.accent-line {
  display: block; height: 2px; background: var(--accent);
  animation: underline-grow 0.8s var(--ease-expo) 0.3s both;
}

.accent-glow { animation: glow-breathe 3s ease-in-out infinite; }
`;

function SvcStyleInjector() {
  useEffect(() => {
    if (document.getElementById('svc-styles2')) return;
    const el = document.createElement('style');
    el.id = 'svc-styles2';
    el.textContent = SVC_STYLES;
    document.head.appendChild(el);
  }, []);
  return null;
}

function useRipple() {
  return useCallback((e) => {
    const btn = e.currentTarget;
    const circle = document.createElement('span');
    const d = Math.max(btn.clientWidth, btn.clientHeight);
    const r = btn.getBoundingClientRect();
    circle.className = 'ripple-circle';
    Object.assign(circle.style, {
      width: `${d}px`, height: `${d}px`,
      left: `${e.clientX - r.left - d / 2}px`,
      top: `${e.clientY - r.top - d / 2}px`,
    });
    btn.appendChild(circle);
    setTimeout(() => circle.remove(), 700);
  }, []);
}

function useTilt(strength = 6) {
  const ref = useRef(null);
  const onMove = useCallback((e) => {
    const el = ref.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const dy = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
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

/* ══════════════════════════════════════════════════════
   STATUS CONFIG
══════════════════════════════════════════════════════ */
const STATUS_CFG = {
  'Received':          { color:'#3b82f6', bg:'#eff6ff', border:'#bfdbfe', dot:'#3b82f6', grad:'grad-blue',    shadow:'rgba(59,130,246,0.15)',  icon:Clock },
  'In Progress':       { color:'#f97316', bg:'#fff7ed', border:'#fed7aa', dot:'#f97316', grad:'grad-orange',  shadow:'rgba(249,115,22,0.15)',  icon:Wrench },
  'Waiting for Parts': { color:'#f59e0b', bg:'#fffbeb', border:'#fde68a', dot:'#f59e0b', grad:'grad-amber',   shadow:'rgba(245,158,11,0.15)',  icon:Package },
  'Completed':         { color:'#10b981', bg:'#ecfdf5', border:'#a7f3d0', dot:'#10b981', grad:'grad-emerald', shadow:'rgba(16,185,129,0.15)',  icon:CheckCircle2 },
  'Not Repairable':    { color:'#ef4444', bg:'#fef2f2', border:'#fecaca', dot:'#ef4444', grad:'grad-red',     shadow:'rgba(239,68,68,0.15)',   icon:XOctagon },
};

function StatusPill({ status }) {
  const cfg = STATUS_CFG[status] || { color:'#6b7280', bg:'#f9fafb', border:'#e5e7eb', dot:'#6b7280' };
  return (
    <span className="status-pill" style={{ backgroundColor:cfg.bg, border:`1.5px solid ${cfg.border}`, color:cfg.color }}>
      <span className="h-1.5 w-1.5 rounded-full svc-blink" style={{ backgroundColor:cfg.dot }} />
      {status}
    </span>
  );
}

/* Section label — identical to dashboard */
function SvcSectionLabel({ icon: Icon, label, color = '' }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <div className="flex h-6 w-6 items-center justify-center rounded-md shadow-sm"
        style={{ background: color || 'linear-gradient(135deg,#f97316,#a855f7)' }}>
        <Icon className="h-3 w-3 text-white" strokeWidth={2.5} />
      </div>
      <h3 className="text-sm font-semibold text-gray-700">{label}</h3>
      <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
    </div>
  );
}

function ServiceCard({ service, onSelect, index }) {
  const ripple = useRipple();
  const { ref, onMouseMove, onMouseLeave } = useTilt(4);
  const [hovered, setHovered] = useState(false);
  const cfg = STATUS_CFG[service.status] || { color:'#6b7280', bg:'#f9fafb', border:'#e5e7eb', dot:'#6b7280', grad:'', shadow:'rgba(0,0,0,0.08)', icon:Clock };
  const StatusIcon = cfg.icon || Clock;

  return (
    <button
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={() => { onMouseLeave(); setHovered(false); }}
      onMouseEnter={() => setHovered(true)}
      onClick={(e) => { ripple(e); onSelect(service); }}
      className={cn('ripple-host shine-host relative w-full overflow-hidden rounded-2xl border border-white/80 text-left shadow-md svc-slide-up', cfg.grad)}
      style={{
        boxShadow: hovered ? `0 18px 42px ${cfg.shadow}` : `0 4px 20px ${cfg.shadow}`,
        animationDelay: `${index * 0.05}s`,
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
        style={{ background:`linear-gradient(90deg,${cfg.color}90,${cfg.color}10)` }} />
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ background:`linear-gradient(180deg,${cfg.color}80,${cfg.color}20)` }} />
      <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full blur-2xl opacity-15"
        style={{ backgroundColor:cfg.color }} />

      <div className="p-5 pl-6">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{color:cfg.color}}>
              {service.ticket_number}
            </p>
            <h4 className="display-font text-base font-bold text-gray-900 truncate leading-tight">
              {service.customer_name}
            </h4>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{service.device_brand} {service.device_model}</p>
          </div>
          <StatusPill status={service.status} />
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg" style={{background:`${cfg.color}15`}}>
            <StatusIcon className="h-3 w-3" style={{color:cfg.color}} strokeWidth={2} />
          </div>
          <span className="text-xs text-gray-500 truncate flex-1">{service.issue_type}</span>
        </div>

        <div className="flex items-center justify-between border-t pt-3" style={{borderColor:`${cfg.color}15`}}>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold" style={{color:cfg.color}}>
              {formatCurrency(service.estimated_cost)}
            </span>
            <span className="text-[10px] text-gray-400">est.</span>
          </div>
          <div className="flex h-7 w-7 items-center justify-center rounded-xl shadow-sm transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            style={{background:`${cfg.color}15`}}>
            <ArrowUpRight className="h-3.5 w-3.5" style={{color:cfg.color}} />
          </div>
        </div>
      </div>
    </button>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════ */
export default function ServicesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { profile } = useAuth();
  const [view, setView] = useState('list');
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [issueFilter, setIssueFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [specialFilter, setSpecialFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [mounted, setMounted] = useState(false);
  const ripple = useRipple();

  useEffect(() => {
    const action = searchParams.get('action');
    const serviceId = searchParams.get('serviceId');
    if (action === 'new') setView('register');
    else if (serviceId) setView('details');
    else setView('list');
    fetchServices(serviceId);
  }, [searchParams]);

  useEffect(() => {
    const timeout = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const statusParam = searchParams.get('status');
    const filterParam = searchParams.get('filter');
    setSpecialFilter('all');
    setStatusFilter(statusParam || 'all');
    if (filterParam === 'registeredToday') { setSpecialFilter('registeredToday'); setDateFrom(today); setDateTo(today); }
    else if (filterParam === 'completedToday') { setSpecialFilter('completedToday'); setStatusFilter('Completed'); setDateFrom(''); setDateTo(''); }
    else if (filterParam === 'notRepairableToday') { setSpecialFilter('notRepairableToday'); setStatusFilter('Not Repairable'); setDateFrom(''); setDateTo(''); }
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
      if (dateTo){const t=new Date(dateTo);t.setHours(23,59,59,999);matchesDate=matchesDate&&d<=t;}
    }
    return matchesSearch && matchesStatus && matchesIssue && matchesBrand && matchesDate;
  });

  const hasActiveFilters = issueFilter!=='all'||brandFilter!=='all'||dateFrom||dateTo;

  // counts per status
  const counts = {
    all: services.length,
    'Received': services.filter(s=>s.status==='Received').length,
    'In Progress': services.filter(s=>s.status==='In Progress').length,
    'Waiting for Parts': services.filter(s=>s.status==='Waiting for Parts').length,
    'Completed': services.filter(s=>s.status==='Completed').length,
    'Not Repairable': services.filter(s=>s.status==='Not Repairable').length,
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
      <div className="svc-mesh-bg svc-font min-h-screen space-y-7 p-1">

        {/* ── Hero Header ── */}
        <header className={cn('relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-7 shadow-2xl', mounted && 'section-enter')} style={{ animationDelay: '0.05s' }}>
          <div className="svc-orb w-64 h-64 bg-orange-500/20 -top-16 -left-16 svc-float" style={{animationDelay:'0s'}} />
          <div className="svc-orb w-48 h-48 bg-blue-500/15 -bottom-12 left-1/3 svc-float" style={{animationDelay:'1.2s'}} />
          <div className="svc-orb w-52 h-52 bg-purple-500/12 -top-8 right-10 svc-float" style={{animationDelay:'2s'}} />
          <div className="absolute right-6 top-6 h-20 w-20 rounded-full border-2 border-dashed border-white/10 svc-spin" />
          <div className="absolute right-10 top-10 h-12 w-12 rounded-full border border-orange-400/30 svc-spin-rev" />
          <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',backgroundSize:'32px 32px'}} />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-purple-500 shadow-lg">
                  <Wrench className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                </div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-white/40">Repair Center</p>
              </div>
              <h1 className="display-font text-2xl sm:text-3xl font-bold text-white mb-1">
                Active <span className="svc-shimmer-text">Services</span>
              </h1>
              <p className="text-sm text-white/45">Track and manage all active repairs.</p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* live count pill */}
              <div className="svc-glass rounded-2xl px-5 py-3 text-right">
                <p className="text-[9px] font-extrabold uppercase tracking-widest text-gray-500 mb-0.5">Active Jobs</p>
                <p className="display-font text-2xl font-bold text-gray-900 svc-count-in">{services.length}</p>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-400 svc-blink" />
                  <p className="text-[10px] font-semibold text-gray-500">Live</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ── Search + Actions ── */}
        <div className={cn('flex items-center gap-3', mounted && 'section-enter')} style={{ animationDelay: '0.1s' }}>
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search name, mobile, ticket, model…"
              className="svc-input pl-10 pr-4 py-3"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <button
            onClick={(e) => { ripple(e); setView('register'); }}
            className="ripple-host svc-card-hover flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-lg"
            style={{background:'linear-gradient(135deg,#f97316,#ea580c)',boxShadow:'0 8px 24px rgba(249,115,22,0.35)'}}
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            <span className="hidden sm:inline">New Service</span>
          </button>

          <button onClick={(e) => { ripple(e); router.push('/history?tab=services'); }}
            className="ripple-host svc-card-hover flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-gray-200 bg-white text-gray-500 shadow-sm hover:border-orange-300 hover:text-orange-600 transition">
            <History className="h-4 w-4" />
          </button>

          <button onClick={(e) => { ripple(e); setShowFilters(!showFilters); }}
            className={cn(
              "ripple-host svc-card-hover relative flex h-11 w-11 items-center justify-center rounded-2xl border-2 transition",
              showFilters||hasActiveFilters
                ? "border-orange-400/60 bg-orange-50 text-orange-600"
                : "border-gray-200 bg-white text-gray-500 hover:border-orange-300 hover:text-orange-600"
            )}>
            <SlidersHorizontal className="h-4 w-4" />
            {hasActiveFilters && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-orange-500 border-2 border-white" />}
          </button>
        </div>

        {/* ── Filters Panel ── */}
        {showFilters && (
          <div className={cn('svc-glass rounded-3xl p-5 shadow-xl svc-slide-up', mounted && 'section-enter')} style={{ animationDelay: '0.15s' }}>
            <SvcSectionLabel icon={SlidersHorizontal} label="Advanced Filters" />
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-1.5">
                <label className="svc-label">Issue Type</label>
                <select value={issueFilter} onChange={e=>setIssueFilter(e.target.value)} className="svc-input w-auto text-xs py-2 px-3">
                  <option value="all">All Issues</option>
                  {['Display Problem','Battery Problem','Charging Problem','Software Issue','Water Damage','Other'].map(v=><option key={v}>{v}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="svc-label">Brand</label>
                <select value={brandFilter} onChange={e=>setBrandFilter(e.target.value)} className="svc-input w-auto text-xs py-2 px-3">
                  <option value="all">All Brands</option>
                  {['samsung','apple','oneplus','xiaomi','oppo','vivo','realme','motorola','other'].map(v=><option key={v} value={v}>{v.charAt(0).toUpperCase()+v.slice(1)}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="svc-label">From</label>
                <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} className="svc-input w-auto text-xs py-2 px-3" />
              </div>
              <div className="space-y-1.5">
                <label className="svc-label">To</label>
                <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} className="svc-input w-auto text-xs py-2 px-3" />
              </div>
              {hasActiveFilters && (
                <button onClick={(e)=>{ ripple(e); setIssueFilter('all'); setBrandFilter('all'); setDateFrom(''); setDateTo(''); }}
                  className="ripple-host flex items-center gap-1.5 rounded-2xl bg-red-50 border border-red-200 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition">
                  <X className="h-3.5 w-3.5" /> Clear All
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Status Tabs — with mini count badges ── */}
        <div className={cn('flex flex-wrap gap-2.5', mounted && 'section-enter')} style={{ animationDelay: '0.18s' }}>
          {STATUS_TABS.map(tab => {
            const active = statusFilter === tab.key;
            const cfg = tab.color ? STATUS_CFG[tab.key] : null;
            const count = counts[tab.key];
            return (
              <button
                key={tab.key}
                onClick={(e) => { ripple(e); setStatusFilter(tab.key); }}
                className="ripple-host svc-card-hover relative flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold border-2 transition-all"
                style={active
                  ? { backgroundColor: cfg?.color||'#111827', color:'#fff', borderColor: cfg?.color||'#111827', boxShadow:`0 4px 14px ${cfg?.color||'#111'}35` }
                  : { backgroundColor:'#fff', color:'#6b7280', borderColor:'#e5e7eb' }
                }
              >
                {tab.color && active && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white/70 svc-blink" />
                )}
                {tab.label}
                {count > 0 && (
                  <span className="rounded-full px-1.5 py-0.5 text-[9px] font-extrabold tabular-nums"
                    style={active
                      ? { backgroundColor:'rgba(255,255,255,0.22)', color:'#fff' }
                      : { backgroundColor: cfg?.bg||'#f3f4f6', color: cfg?.color||'#6b7280' }
                    }>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Services Grid ── */}
        {loading ? (
          <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3', mounted && 'section-enter')} style={{ animationDelay: '0.22s' }}>
            {[...Array(6)].map((_,i) => <div key={i} className="h-44 animate-pulse rounded-2xl bg-white border border-gray-100" style={{animationDelay:`${i*0.05}s`}} />)}
          </div>
        ) : filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map((service, i) => (
              <ServiceCard
                key={service.id}
                service={service}
                index={i}
                onSelect={(svc) => { setSelectedService(svc); setView('details'); }}
              />
            ))}
          </div>
        ) : (
          /* ── Empty State ── */
          <div className={cn('flex flex-col items-center justify-center py-24 gap-5 svc-scale-in', mounted && 'section-enter')} style={{ animationDelay: '0.22s' }}>
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-100 to-blue-50 border-2 border-dashed border-orange-200">
                <Wrench className="h-10 w-10 text-orange-300" />
              </div>
              <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-gradient-to-br from-orange-400 to-purple-500 flex items-center justify-center shadow-md">
                <Plus className="h-3 w-3 text-white" strokeWidth={3} />
              </div>
            </div>
            <div className="text-center">
              <p className="display-font text-lg font-bold text-gray-800">No services found</p>
              <p className="text-sm text-gray-400 mt-1">{searchQuery ? 'Try a different search' : 'Register your first service to get started.'}</p>
            </div>
            <button onClick={(e) => { ripple(e); setView('register'); }}
              className="ripple-host svc-card-hover flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-white shadow-lg"
              style={{background:'linear-gradient(135deg,#f97316,#ea580c)'}}>
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              Register New Service
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════
   SERVICE REGISTRATION
══════════════════════════════════════════════════════ */
function ServiceRegistration({ onCancel, onComplete }) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const COOKIE_KEY = 'serviceRegistrationDraft';
  const [formData, setFormData] = useState({
    customer_mobile:'', customer_name:'', customer_address:'',
    device_brand:'', device_model:'', imei:'',
    issue_type:['Display Problem'], issue_description:'', estimated_cost:'',
  });
  const [photos, setPhotos] = useState({ customer:null, front:null, back:null });
  const isRefreshRef = useRef(false);
  const ripple = useRipple();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = getCookie(COOKIE_KEY);
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        if (draft?.formData) {
          if (typeof draft.formData.issue_type==='string') draft.formData.issue_type=[draft.formData.issue_type];
          setFormData(prev=>({...prev,...draft.formData}));
        }
      } catch {}
    }
    const handler = () => sessionStorage.setItem('serviceRegistrationIsReload','1');
    window.addEventListener('beforeunload', handler);
    return () => {
      window.removeEventListener('beforeunload', handler);
      const isReload = sessionStorage.getItem('serviceRegistrationIsReload')==='1';
      if (isReload) { isRefreshRef.current=true; sessionStorage.removeItem('serviceRegistrationIsReload'); }
      if (!isReload) deleteCookie(COOKIE_KEY);
    };
  }, []);

  useEffect(() => { try { setCookie(COOKIE_KEY, JSON.stringify({formData}), 7); } catch {} }, [formData]);

  async function handleMobileBlur() {
    if (formData.customer_mobile.length===10) {
      try {
        const data = await serviceService.getCustomerLastDetails(formData.customer_mobile);
        if (data) {
          setFormData(prev=>({...prev, customer_name:data.customer_name, customer_address:data.customer_address||''}));
          toast.info('Customer details auto-filled');
        }
      } catch {}
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.issue_type||formData.issue_type.length===0) { toast.error('Please select at least one issue type.'); return; }
    setLoading(true);
    try {
      const submitData = { ...formData, issue_type: Array.isArray(formData.issue_type)?formData.issue_type.join(', '):formData.issue_type };
      const service = await serviceService.registerService(submitData, photos, profile?.id);
      toast.success(`Service registered! Ticket: ${service.ticket_number}`);
      deleteCookie(COOKIE_KEY);
      onComplete();
    } catch (err) { toast.error(err.message||'Registration failed'); }
    finally { setLoading(false); }
  }

  const ISSUE_TYPES = ['Display Problem','Battery Problem','Charging Problem','Software Issue','Water Damage','Other'];
  const totalCost = parseFloat(formData.estimated_cost)||0;

  return (
    <>
      <SvcStyleInjector />
      <div className="svc-mesh-bg svc-font min-h-screen pb-24">

        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-7 shadow-2xl mb-7">
          <div className="svc-orb w-56 h-56 bg-orange-500/20 -top-16 -left-14 svc-float" />
          <div className="svc-orb w-40 h-40 bg-purple-500/15 -bottom-10 right-10 svc-float" style={{animationDelay:'1.5s'}} />
          <div className="absolute right-6 top-6 h-20 w-20 rounded-full border-2 border-dashed border-white/10 svc-spin" />
          <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',backgroundSize:'28px 28px'}} />

          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button onClick={(e) => { ripple(e); deleteCookie(COOKIE_KEY); onCancel(); }}
                className="ripple-host flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white hover:bg-white/20 transition">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-white/40 mb-0.5">New Ticket</p>
                <h1 className="display-font text-2xl font-bold text-white">
                  Register <span className="svc-shimmer-text">Service</span>
                </h1>
              </div>
            </div>
            {totalCost > 0 && (
              <div className="svc-glass rounded-2xl px-4 py-2.5 text-right">
                <p className="text-[9px] font-extrabold uppercase tracking-widest text-gray-500">Est. Cost</p>
                <p className="display-font text-lg font-bold text-gray-900">{formatCurrency(totalCost)}</p>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-5">

          {/* ── Customer Info ── */}
          <RegSection icon={User} title="Customer Information" color="linear-gradient(135deg,#f97316,#ea580c)">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <RegField label="Mobile Number">
                <div className="relative">
                  <input type="tel" required maxLength={10} className="svc-input pr-14"
                    placeholder="10-digit number"
                    value={formData.customer_mobile} onBlur={handleMobileBlur}
                    onChange={e=>setFormData({...formData,customer_mobile:e.target.value.replace(/\D/g,'')})} />
                  {formData.customer_mobile.length>0&&(
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold tabular-nums"
                      style={{color:formData.customer_mobile.length===10?'#22c55e':'#d1d5db'}}>
                      {formData.customer_mobile.length}/10
                    </span>
                  )}
                </div>
              </RegField>
              <RegField label="Customer Name">
                <input type="text" required className="svc-input" placeholder="Full name"
                  value={formData.customer_name} onChange={e=>setFormData({...formData,customer_name:e.target.value})} />
              </RegField>
              <div className="col-span-full space-y-2">
                <RegField label="Address / Area">
                  <input type="text" className="svc-input" placeholder="Street, area, locality"
                    value={formData.customer_address} onChange={e=>setFormData({...formData,customer_address:e.target.value})} />
                </RegField>
                <div className="flex flex-wrap gap-2">
                  {['Bus Stand','College Road','Market Area','Old Town','New Colony'].map(area=>(
                    <button key={area} type="button" onClick={()=>setFormData({...formData,customer_address:area})}
                      className="svc-chip"
                      style={formData.customer_address===area
                        ?{background:'linear-gradient(135deg,#f97316,#ea580c)',color:'#fff',boxShadow:'0 4px 12px rgba(249,115,22,0.3)'}
                        :{background:'#fff7ed',color:'#ea580c',border:'1px solid #fed7aa'}
                      }>
                      {area}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </RegSection>

          {/* ── Device Info ── */}
          <RegSection icon={Smartphone} title="Device Information" color="linear-gradient(135deg,#a855f7,#7c3aed)">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <RegField label="Mobile Brand">
                <input type="text" required className="svc-input" placeholder="e.g. Samsung, Apple"
                  value={formData.device_brand} onChange={e=>setFormData({...formData,device_brand:e.target.value})} />
              </RegField>
              <RegField label="Mobile Model">
                <input type="text" required className="svc-input" placeholder="e.g. Galaxy A54"
                  value={formData.device_model} onChange={e=>setFormData({...formData,device_model:e.target.value})} />
              </RegField>
            </div>
          </RegSection>

          {/* ── Issue Details ── */}
          <RegSection icon={AlertCircle} title="Issue Details" color="linear-gradient(135deg,#3b82f6,#2563eb)">
            <div className="space-y-4">
              <RegField label="Issue Types (select all that apply)">
                <div className="flex flex-wrap gap-2 mt-1">
                  {ISSUE_TYPES.map(type => {
                    const isSelected = (Array.isArray(formData.issue_type)?formData.issue_type:[]).includes(type);
                    return (
                      <button key={type} type="button"
                        onClick={() => {
                          const cur=Array.isArray(formData.issue_type)?formData.issue_type:[];
                          setFormData({...formData,issue_type:isSelected?cur.filter(t=>t!==type):[...cur,type]});
                        }}
                        className="svc-chip"
                        style={isSelected
                          ?{background:'linear-gradient(135deg,#3b82f6,#2563eb)',color:'#fff',boxShadow:'0 4px 12px rgba(59,130,246,0.3)'}
                          :{background:'#eff6ff',color:'#2563eb',border:'1px solid #bfdbfe'}
                        }>
                        {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white/80" />}
                        {type}
                      </button>
                    );
                  })}
                </div>
              </RegField>
              <RegField label="Description (Optional)">
                <textarea className="svc-input" rows={3} placeholder="Describe the issue in detail…"
                  value={formData.issue_description} onChange={e=>setFormData({...formData,issue_description:e.target.value})} />
              </RegField>
              <RegField label="Estimated Service Cost">
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-md bg-orange-100">
                    <IndianRupee className="h-3 w-3 text-orange-600" />
                  </div>
                  <input type="number" required className="svc-input pl-10" placeholder="0.00"
                    value={formData.estimated_cost} onChange={e=>setFormData({...formData,estimated_cost:e.target.value})} />
                </div>
              </RegField>
            </div>
          </RegSection>

          {/* ── Photos ── */}
          <RegSection icon={Camera} title="Device Photos" color="linear-gradient(135deg,#10b981,#059669)">
            <div className="grid grid-cols-3 gap-4">
              <PhotoUpload label="Customer Photo" onFile={file=>setPhotos(prev=>({...prev,customer:file}))} />
              <PhotoUpload label="Device Front"   onFile={file=>setPhotos(prev=>({...prev,front:file}))} />
              <PhotoUpload label="Device Back"    onFile={file=>setPhotos(prev=>({...prev,back:file}))} />
            </div>
          </RegSection>

          {/* ── Submit ── */}
          <button type="submit" disabled={loading}
            onClick={(e) => { ripple(e); }}
            className="ripple-host svc-card-hover w-full relative overflow-hidden rounded-3xl py-4 text-sm font-bold text-white shadow-xl transition-all disabled:opacity-50"
            style={{background:'linear-gradient(135deg,#f97316,#ea580c,#c2410c)',boxShadow:'0 8px 28px rgba(249,115,22,0.30)'}}>
            {!loading && (
              <div className="absolute inset-0 -skew-x-12 pointer-events-none"
                style={{background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.10),transparent)',animation:'shimmer 2.5s linear infinite',backgroundSize:'200% auto'}} />
            )}
            <span className="relative flex items-center justify-center gap-2">
              {loading
                ? <><div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white" style={{animation:'spin-slow 0.7s linear infinite'}} />Registering…</>
                : <><Zap className="h-4 w-4" strokeWidth={2.5} />Confirm &amp; Register Service</>
              }
            </span>
          </button>
        </form>
      </div>
    </>
  );
}

function RegSection({ icon: Icon, title, color, children }) {
  return (
    <div className="svc-glass rounded-3xl p-6 shadow-xl border border-white/80 svc-slide-up">
      <div className="mb-5 flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-xl shadow-sm" style={{background:color}}>
          <Icon className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
        </div>
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
        <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
      </div>
      {children}
    </div>
  );
}

function RegField({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="svc-label">{label}</label>
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PHOTO UPLOAD
══════════════════════════════════════════════════════ */
function PhotoUpload({ label, onFile }) {
  const [preview, setPreview] = useState(null);
  const [objectUrl, setObjectUrl] = useState('');
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef(null);
  const inputId = `photo-${label.replace(/\s+/g,'-').toLowerCase()}`;

  useEffect(()=>{ return ()=>{ if(objectUrl) URL.revokeObjectURL(objectUrl); }; },[objectUrl]);

  async function handleChange(e) {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;
    try {
      setProcessing(true);
      const compressed = await compressImage(rawFile);
      onFile(compressed);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      const url = URL.createObjectURL(compressed);
      setObjectUrl(url); setPreview(url);
      if (inputRef.current) inputRef.current.value='';
    } catch { alert('Image processing failed.'); }
    finally { setProcessing(false); }
  }

  function handleRemove() {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    setObjectUrl(''); setPreview(null); onFile(null);
    if (inputRef.current) inputRef.current.value='';
  }

  return (
    <div className="space-y-2">
      <label className="svc-label">{label}</label>
      <div className="relative photo-aspect overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/80 transition hover:border-orange-300 hover:bg-orange-50/30">
        {preview ? (
          <>
            <img src={preview} alt="Preview" loading="lazy" className="h-full w-full object-cover" />
            <button type="button" onClick={handleRemove}
              className="absolute bottom-2 right-2 rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm hover:bg-black/70 transition">
              <X className="h-3 w-3" />
            </button>
          </>
        ) : (
          <label htmlFor={inputId} className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 text-gray-400 p-2">
            {processing ? (
              <><div className="h-6 w-6 rounded-full border-2 border-orange-400 border-t-transparent" style={{animation:'spin-slow 0.7s linear infinite'}} />
              <span className="text-[9px] font-bold uppercase">Processing…</span></>
            ) : (
              <><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 border border-orange-200">
                <Camera className="h-5 w-5 text-orange-400" /></div>
              <span className="text-[9px] font-bold uppercase text-center leading-tight">{label}</span></>
            )}
            <input ref={inputRef} id={inputId} type="file" accept="image/*" capture="user" className="hidden" onChange={handleChange} disabled={processing} />
          </label>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SERVICE DETAILS
══════════════════════════════════════════════════════ */
function ServiceDetails({ service, onBack, onUpdate }) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showReturn, setShowReturn] = useState(false);
  const [finalAmount, setFinalAmount] = useState(service.estimated_cost.toString());
  const [statusReason, setStatusReason] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(service.status);
  const [previewIndex, setPreviewIndex] = useState(null);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);
  const isFinalStatus = service.status==='Completed'||service.status==='Not Repairable';
  const cfg = STATUS_CFG[service.status]||{color:'#6b7280',bg:'#f9fafb',border:'#e5e7eb',dot:'#6b7280',grad:'',shadow:'rgba(0,0,0,0.08)'};
  const photoList = [service.customer_photo_url,service.device_front_photo_url,service.device_back_photo_url].filter(Boolean);
  const canReturn = service.status==='Completed'||service.status==='Not Repairable';
  const ripple = useRipple();

  function goToPrev(){ setPreviewIndex(p=>p===0?photoList.length-1:p-1); }
  function goToNext(){ setPreviewIndex(p=>p===photoList.length-1?0:p+1); }
  function handleTouchStart(e){ setTouchEndX(null); setTouchStartX(e.targetTouches[0].clientX); }
  function handleTouchMove(e){ setTouchEndX(e.targetTouches[0].clientX); }
  function handleTouchEnd(){ if(!touchStartX||!touchEndX)return; const d=touchStartX-touchEndX; if(d>50)goToNext(); else if(d<-50)goToPrev(); }

  useEffect(()=>{ fetchHistory(); },[service.id]);

  async function fetchHistory() {
    try { const data=await serviceService.getServiceHistory(service.id); setHistory(data); } catch {}
  }

  async function updateStatus() {
    try {
      setLoading(true);
      await serviceService.updateStatus(service.id, selectedStatus, profile?.id, statusReason);
      toast.success(`Status updated to ${selectedStatus}`);
      setStatusReason('');
      await fetchHistory();
      await onUpdate();
    } catch(err){ toast.error(err.message); }
    finally{ setLoading(false); }
  }

  async function handleReturn() {
    try {
      setLoading(true);
      await serviceService.returnService(service.id, finalAmount, profile?.id);
      toast.success('Mobile returned successfully');
      onUpdate(); onBack();
    } catch(err){ toast.error(err.message); }
    finally{ setLoading(false); }
  }

  return (
    <>
      <SvcStyleInjector />
      <div className="svc-mesh-bg svc-font min-h-screen pb-20">

        {/* ── Details Hero ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-7 shadow-2xl mb-7">
          <div className="svc-orb w-56 h-56 bg-orange-500/15 -top-14 -left-14 svc-float" />
          <div className="svc-orb w-44 h-44" style={{backgroundColor:`${cfg.color}18`,bottom:'-20px',right:'8%',filter:'blur(40px)'}} />
          <div className="absolute right-6 top-6 h-20 w-20 rounded-full border-2 border-dashed border-white/10 svc-spin" />
          <div className="absolute right-10 top-10 h-10 w-10 rounded-full border border-orange-400/30 svc-spin-rev" />
          <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',backgroundSize:'28px 28px'}} />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <button onClick={(e) => { ripple(e); onBack(); }}
                className="ripple-host flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white hover:bg-white/20 transition">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest mb-0.5" style={{color:cfg.color}}>
                  {service.ticket_number}
                </p>
                <h1 className="display-font text-xl sm:text-2xl font-bold text-white">{service.customer_name}</h1>
                <p className="text-xs text-white/45 mt-0.5">{service.device_brand} {service.device_model}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <StatusPill status={service.status} />
              <div className="svc-glass rounded-2xl px-4 py-2.5 text-right">
                <p className="text-[9px] font-extrabold uppercase tracking-widest text-gray-500">Est. Cost</p>
                <p className="display-font text-lg font-bold text-gray-900">{formatCurrency(service.estimated_cost)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* ── Left / Main Col ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Info Card */}
            <div className="svc-glass rounded-3xl p-6 shadow-xl border border-white/80 svc-slide-up">
              <SvcSectionLabel icon={FileText} label="Service Details" />
              <div className="grid grid-cols-2 gap-5">
                <DtlItem icon={Smartphone}   label="Mobile"    value={service.customer_mobile} color={cfg.color} />
                <DtlItem icon={MapPin}        label="Area"      value={service.customer_address||'N/A'} color={cfg.color} />
                <DtlItem icon={Wrench}        label="Device"    value={`${service.device_brand} ${service.device_model}`} color={cfg.color} />
                <DtlItem icon={IndianRupee}   label="Est. Cost" value={formatCurrency(service.estimated_cost)} color={cfg.color} />
              </div>
              <div className="mt-5 border-t border-gray-100 pt-5">
                <label className="svc-label">Issue</label>
                <p className="text-sm font-bold text-gray-900 mt-1.5 mb-1">{service.issue_type}</p>
                {service.issue_description && (
                  <p className="text-sm text-gray-500 leading-relaxed">{service.issue_description}</p>
                )}
              </div>
            </div>

            {/* Photos Card */}
            <div className="svc-glass rounded-3xl p-6 shadow-xl border border-white/80 svc-slide-up" style={{animationDelay:'0.07s'}}>
              <SvcSectionLabel icon={Camera} label="Device Photos" />
              <div className="grid grid-cols-3 gap-4">
                {[
                  {url:service.customer_photo_url, label:'Customer'},
                  {url:service.device_front_photo_url, label:'Front'},
                  {url:service.device_back_photo_url, label:'Back'},
                ].map(({url,label})=> url ? (
                  <button key={label} type="button" onClick={()=>setPreviewIndex(photoList.indexOf(url))}
                    className="group relative photo-aspect overflow-hidden rounded-2xl border-2 border-gray-100 hover:border-orange-300 transition-all svc-card-hover">
                    <img src={url} alt={label} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    <span className="absolute bottom-2 left-2 rounded-xl bg-black/50 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur-sm">{label}</span>
                  </button>
                ) : (
                  <div key={label} className="photo-aspect rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1.5">
                    <Camera className="h-6 w-6 text-gray-300" />
                    <span className="text-[9px] text-gray-400 font-bold uppercase">No {label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right Col ── */}
          <div className="space-y-5">

            {/* Status Update Card */}
            <div className="svc-glass rounded-3xl p-6 shadow-xl border border-white/80 svc-slide-up" style={{animationDelay:'0.05s'}}>
              <SvcSectionLabel icon={Activity} label="Update Status" />

              {isFinalStatus ? (
                <div className="flex items-center gap-3 rounded-2xl p-4 border-2"
                  style={{backgroundColor:cfg.bg, borderColor:cfg.border}}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{background:`${cfg.color}20`}}>
                    {cfg.icon && <cfg.icon className="h-4 w-4" style={{color:cfg.color}} />}
                  </div>
                  <div>
                    <p className="text-xs font-bold" style={{color:cfg.color}}>{service.status}</p>
                    <p className="text-[10px] text-gray-400">Final status</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <select value={selectedStatus} onChange={e=>setSelectedStatus(e.target.value)}
                      disabled={loading} className="svc-input appearance-none pr-9">
                      {['Received','In Progress','Waiting for Parts','Completed','Not Repairable'].map(s=>(
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>

                  {(selectedStatus==='Waiting for Parts'||selectedStatus==='Not Repairable') && (
                    <div className="space-y-1.5">
                      <label className="svc-label">Reason / Details</label>
                      <textarea className="svc-input" rows={2} placeholder="Enter details…"
                        value={statusReason} onChange={e=>setStatusReason(e.target.value)} />
                    </div>
                  )}

                  <button onClick={(e) => { ripple(e); updateStatus(); }}
                    disabled={loading||selectedStatus===service.status}
                    className="ripple-host svc-card-hover w-full relative overflow-hidden rounded-2xl py-3 text-sm font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                    style={{
                      background: selectedStatus!==service.status
                        ? 'linear-gradient(135deg,#1f2937,#111827)'
                        : '#e5e7eb',
                      color: selectedStatus!==service.status?'#fff':'#9ca3af',
                    }}>
                    <span className="relative flex items-center justify-center gap-2">
                      {loading
                        ?<><div className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white" style={{animation:'spin-slow 0.7s linear infinite'}} />Updating…</>
                        :<><Zap className="h-3.5 w-3.5" strokeWidth={2.5} />Update Status</>
                      }
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Timeline Card */}
            <div className="svc-glass rounded-3xl p-6 shadow-xl border border-white/80 svc-slide-up" style={{animationDelay:'0.1s'}}>
              <div className="mb-4 flex items-center justify-between">
                <SvcSectionLabel icon={Clock} label="Timeline" />
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-bold text-gray-500 -mt-4">
                  {history.length}
                </span>
              </div>

              <div className="space-y-3">
                {history.length > 0 ? history.map((item,idx) => {
                  const ss = getStatusStyles(item.status);
                  const isMine = item.updated_by===profile?.id;
                  return (
                    <div key={item.id||idx}
                      className={cn(
                        'relative rounded-2xl border p-3.5 pl-4 svc-slide-up',
                        idx!==history.length-1?'tl-line':'',
                        isMine
                          ?'border-orange-200 bg-gradient-to-r from-orange-50 via-white to-orange-50/40 ring-1 ring-orange-100'
                          :'border-gray-100 bg-white'
                      )}
                      style={{animationDelay:`${idx*0.04}s`}}
                    >
                      {isMine && <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-gradient-to-b from-orange-400 to-purple-500" />}
                      <div className="flex items-start gap-2.5">
                        <span className="mt-1 block h-2.5 w-2.5 shrink-0 rounded-full ring-4" style={{backgroundColor:ss.dotColor, ringColor:`${ss.dotColor}25`}} />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                            <p className="text-xs font-bold" style={{color:ss.textColor}}>{formatStatusLabel(item.status)}</p>
                            {isMine && (
                              <span className="rounded-full bg-gradient-to-r from-orange-400 to-purple-500 px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-wider text-white">You</span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-400">
                            by <span className="font-semibold text-gray-600">{item.profiles?.full_name||'Staff'}</span>
                          </p>
                          <p className="text-[10px] text-gray-400">{formatDateTime(item.created_at)}</p>
                          {item.reason && (
                            <div className="mt-2 inline-flex rounded-xl border px-2.5 py-1 text-[10px] font-semibold"
                              style={{backgroundColor:ss.badgeBg, borderColor:ss.badgeBorder, color:ss.textColor}}>
                              {item.reason}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="flex flex-col items-center justify-center py-6 gap-2">
                    <Clock className="h-6 w-6 text-gray-200" />
                    <p className="text-xs text-gray-400">No updates yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Return Button */}
            <button onClick={()=>setShowReturn(true)} disabled={!canReturn}
              className="svc-card-hover w-full relative overflow-hidden rounded-3xl py-4 text-sm font-bold text-white shadow-xl transition-all disabled:cursor-not-allowed"
              style={{
                background: canReturn?'linear-gradient(135deg,#f97316,#ea580c,#c2410c)':'#e5e7eb',
                color: canReturn?'#fff':'#9ca3af',
                boxShadow: canReturn?'0 8px 28px rgba(249,115,22,0.30)':'none',
              }}>
              {canReturn && (
                <div className="absolute inset-0 -skew-x-12 pointer-events-none"
                  style={{background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.10),transparent)',animation:'shimmer 2.5s linear infinite',backgroundSize:'200% auto'}} />
              )}
              <span className="relative flex items-center justify-center gap-2">
                <ReceiptText className="h-4 w-4" strokeWidth={2.5} />
                Return Mobile to Customer
              </span>
            </button>
          </div>
        </div>

        {/* ── Return Modal ── */}
        {showReturn && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm svc-fade-in">
            <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden svc-scale-in border border-white/80">
              {/* modal hero */}
              <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-6 py-5">
                <div className="svc-orb w-32 h-32 bg-orange-500/20 -top-8 -right-8" />
                <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage:'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',backgroundSize:'24px 24px'}} />
                <div className="absolute top-0 left-0 right-0 h-0.5" style={{background:'linear-gradient(90deg,#f97316,#a855f7,transparent)'}} />
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/40 mb-0.5">Confirm Return</p>
                    <h3 className="display-font text-lg font-bold text-white">Return Mobile</h3>
                  </div>
                  <button onClick={()=>setShowReturn(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition text-white">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* customer preview card */}
                <div className="flex items-center gap-3 rounded-2xl p-4 border-2"
                  style={{background:cfg.bg, borderColor:cfg.border}}>
                  {service.customer_photo_url && (
                    <img src={service.customer_photo_url} className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-md" alt="" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{service.customer_name}</p>
                    <p className="text-xs text-gray-500 truncate">{service.device_brand} {service.device_model}</p>
                    <p className="text-[10px] font-extrabold uppercase tracking-wider mt-0.5" style={{color:cfg.color}}>{service.ticket_number}</p>
                  </div>
                  <StatusPill status={service.status} />
                </div>

                <div className="space-y-1.5">
                  <label className="svc-label">Final Collected Amount</label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-md bg-orange-100">
                      <IndianRupee className="h-3 w-3 text-orange-600" />
                    </div>
                    <input type="number" className="svc-input pl-10" value={finalAmount} onChange={e=>setFinalAmount(e.target.value)} />
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <button onClick={(e)=>{ ripple(e); setShowReturn(false); }}
                    className="ripple-host flex-1 rounded-2xl border-2 border-gray-200 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 transition">
                    Cancel
                  </button>
                  <button onClick={(e)=>{ ripple(e); handleReturn(); }} disabled={loading}
                    className="ripple-host svc-card-hover flex-1 relative overflow-hidden rounded-2xl py-3 text-sm font-bold text-white transition-all disabled:opacity-50"
                    style={{background:'linear-gradient(135deg,#f97316,#ea580c)',boxShadow:'0 4px 16px rgba(249,115,22,0.30)'}}>
                    <span className="relative flex items-center justify-center gap-2">
                      {loading?'Processing…':'Confirm Return'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Image Preview Modal ── */}
        {previewIndex!==null && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/88 p-4 svc-fade-in"
            onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
            <button onClick={()=>setPreviewIndex(null)}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 transition text-white backdrop-blur-sm">
              <X className="h-4 w-4" />
            </button>
            {photoList.length>1&&(
              <>
                <button onClick={goToPrev} className="absolute left-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 transition text-white text-xl backdrop-blur-sm">‹</button>
                <button onClick={goToNext} className="absolute right-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 transition text-white text-xl backdrop-blur-sm">›</button>
              </>
            )}
            <img src={photoList[previewIndex]} alt="Preview"
              className="max-h-[88vh] max-w-[88vw] rounded-2xl object-contain select-none shadow-2xl" />
            <div className="absolute bottom-5 flex gap-1.5">
              {photoList.map((_,i)=>(
                <button key={i} onClick={()=>setPreviewIndex(i)}
                  className="h-1.5 rounded-full transition-all"
                  style={{width:i===previewIndex?'1.5rem':'0.375rem', backgroundColor:i===previewIndex?'#f97316':'rgba(255,255,255,0.35)'}} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ── Detail Item ── */
function DtlItem({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{background:`${color}12`, border:`1.5px solid ${color}20`}}>
        <Icon className="h-3.5 w-3.5" style={{color}} strokeWidth={2} />
      </div>
      <div>
        <label className="svc-label mb-0.5">{label}</label>
        <p className="text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

/* ── Status helpers ── */
function getStatusStyles(status='') {
  const s=status.toLowerCase();
  const make=(dot,text,badgeBg,badgeBorder)=>({dotColor:dot,textColor:text,badgeBg,badgeBorder});
  if(s.includes('received'))   return make('#3b82f6','#1d4ed8','#eff6ff','#bfdbfe');
  if(s.includes('diagnosed'))  return make('#8b5cf6','#7c3aed','#f5f3ff','#ddd6fe');
  if(s.includes('in repair')||s.includes('repairing')||s.includes('in progress')) return make('#f97316','#ea580c','#fff7ed','#fed7aa');
  if(s.includes('waiting'))    return make('#f59e0b','#d97706','#fffbeb','#fde68a');
  if(s.includes('completed'))  return make('#10b981','#059669','#ecfdf5','#a7f3d0');
  if(s.includes('returned'))   return make('#22c55e','#16a34a','#f0fdf4','#bbf7d0');
  if(s.includes('cancel')||s.includes('non repairable')||s.includes('not repairable')||s.includes('rejected')) return make('#ef4444','#dc2626','#fef2f2','#fecaca');
  return make('#6b7280','#374151','#f9fafb','#e5e7eb');
}
function formatStatusLabel(status=''){ return status.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()); }
