'use client';

import { useState, useEffect, useRef } from 'react';
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

/* ══════════════════════════════════════════════════════
   STYLES — full dashboard token system
══════════════════════════════════════════════════════ */
const HISTORY_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}
@keyframes float {
  0%,100% { transform: translateY(0px); }
  50%      { transform: translateY(-6px); }
}
@keyframes slide-up {
  from { opacity:0; transform:translateY(18px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes slide-right {
  from { opacity:0; transform:translateX(20px); }
  to   { opacity:1; transform:translateX(0); }
}
@keyframes count-in {
  from { opacity:0; transform:scale(0.5); }
  to   { opacity:1; transform:scale(1); }
}
@keyframes spin-slow { from{transform:rotate(0deg);}to{transform:rotate(360deg);} }
@keyframes blink     { 0%,100%{opacity:1;}50%{opacity:0.25;} }
@keyframes pulse-ring{ 0%{transform:scale(0.8);opacity:0.8;}70%{transform:scale(1.6);opacity:0;}100%{transform:scale(1.6);opacity:0;} }
@keyframes fade-in   { from{opacity:0;}to{opacity:1;} }
@keyframes spin-rev  { from{transform:rotate(360deg);}to{transform:rotate(0deg);} }

.hy-slide-up    { animation: slide-up  0.45s ease forwards; }
.hy-slide-right { animation: slide-right 0.4s ease forwards; }
.hy-count-in    { animation: count-in  0.4s cubic-bezier(.34,1.56,.64,1) forwards; }
.hy-float       { animation: float     3s ease-in-out infinite; }
.hy-spin        { animation: spin-slow 8s linear infinite; }
.hy-spin-rev    { animation: spin-rev  5s linear infinite; }
.hy-blink       { animation: blink     2s ease-in-out infinite; }
.hy-fade-in     { animation: fade-in   0.3s ease forwards; }

.hy-shimmer-text {
  background: linear-gradient(90deg,#f97316,#a855f7,#3b82f6,#f97316);
  background-size: 300% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 4s linear infinite;
}

.hy-mesh-bg {
  background-color: #fafafa;
  background-image:
    radial-gradient(at 20% 10%, rgba(249,115,22,0.08)  0px, transparent 50%),
    radial-gradient(at 80% 0%,  rgba(168,85,247,0.07)  0px, transparent 50%),
    radial-gradient(at 0%  60%, rgba(59,130,246,0.06)  0px, transparent 50%),
    radial-gradient(at 90% 80%, rgba(34,197,94,0.05)   0px, transparent 50%);
}

.hy-glass {
  background: rgba(255,255,255,0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.9);
}

.hy-orb {
  border-radius: 50%;
  filter: blur(40px);
  position: absolute;
  pointer-events: none;
}

.hy-card-hover {
  transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), box-shadow 0.25s ease, border-color 0.2s;
}
.hy-card-hover:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: 0 20px 40px -10px rgba(0,0,0,0.12);
}
.hy-card-hover:active { transform:scale(0.98); }

/* gradient card backgrounds */
.grad-orange  { background: linear-gradient(135deg,#fff7ed,#fff); }
.grad-purple  { background: linear-gradient(135deg,#faf5ff,#fff); }
.grad-blue    { background: linear-gradient(135deg,#eff6ff,#fff); }
.grad-emerald { background: linear-gradient(135deg,#ecfdf5,#fff); }
.grad-cyan    { background: linear-gradient(135deg,#ecfeff,#fff); }
.grad-amber   { background: linear-gradient(135deg,#fffbeb,#fff); }

/* input */
.hy-input {
  width:100%;
  border-radius:14px;
  border:1.5px solid #e5e7eb;
  padding:11px 14px;
  font-size:13.5px;
  font-family:'DM Sans',sans-serif;
  font-weight:500;
  color:#111827;
  background:#fff;
  outline:none;
  transition:border-color 0.2s, box-shadow 0.2s;
}
.hy-input:focus {
  border-color:#f97316;
  box-shadow:0 0 0 3px rgba(249,115,22,0.12);
}
.hy-input::placeholder { color:#9ca3af; }

.hy-label {
  display:block;
  font-size:10px;
  font-weight:800;
  letter-spacing:0.1em;
  text-transform:uppercase;
  color:#6b7280;
  margin-bottom:6px;
  font-family:'DM Sans',sans-serif;
}

.hy-font    { font-family:'DM Sans',sans-serif; }
.display-font { font-family:'Syne',sans-serif; }
`;

function HistoryStyleInjector() {
  useEffect(() => {
    if (document.getElementById('hy-styles')) return;
    const el = document.createElement('style');
    el.id = 'hy-styles';
    el.textContent = HISTORY_STYLES;
    document.head.appendChild(el);
  }, []);
  return null;
}

/* ── Section Label — identical to dashboard ── */
function SectionLabel({ icon: Icon, label, gradient = 'linear-gradient(135deg,#f97316,#a855f7)' }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <div className="flex h-6 w-6 items-center justify-center rounded-md shadow-sm" style={{ background: gradient }}>
        <Icon className="h-3 w-3 text-white" strokeWidth={2.5} />
      </div>
      <h3 className="hy-font text-sm font-semibold text-gray-700">{label}</h3>
      <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   COLOR PALETTES — rotating per-card, same as sales page
══════════════════════════════════════════════════════ */
const SERVICE_ACCENTS = [
  { color:'#f97316', grad:'grad-orange',  shadow:'rgba(249,115,22,0.13)'  },
  { color:'#3b82f6', grad:'grad-blue',    shadow:'rgba(59,130,246,0.13)'  },
  { color:'#10b981', grad:'grad-emerald', shadow:'rgba(16,185,129,0.13)'  },
  { color:'#a855f7', grad:'grad-purple',  shadow:'rgba(168,85,247,0.13)'  },
  { color:'#f59e0b', grad:'grad-amber',   shadow:'rgba(245,158,11,0.13)'  },
  { color:'#06b6d4', grad:'grad-cyan',    shadow:'rgba(6,182,212,0.13)'   },
];

const SALE_ACCENTS = [
  { color:'#a855f7', grad:'grad-purple',  shadow:'rgba(168,85,247,0.13)'  },
  { color:'#f97316', grad:'grad-orange',  shadow:'rgba(249,115,22,0.13)'  },
  { color:'#06b6d4', grad:'grad-cyan',    shadow:'rgba(6,182,212,0.13)'   },
  { color:'#10b981', grad:'grad-emerald', shadow:'rgba(16,185,129,0.13)'  },
  { color:'#3b82f6', grad:'grad-blue',    shadow:'rgba(59,130,246,0.13)'  },
  { color:'#f59e0b', grad:'grad-amber',   shadow:'rgba(245,158,11,0.13)'  },
];

/* ══════════════════════════════════════════════════════
   STAT PILL
══════════════════════════════════════════════════════ */
function StatPill({ label, value, color, icon: Icon, isCurrency, index = 0 }) {
  const grads = ['grad-orange','grad-blue','grad-emerald','grad-purple'];
  const grad = grads[index % grads.length];
  return (
    <div className={cn('hy-card-hover hy-glass relative overflow-hidden rounded-2xl border border-white/80 p-4 shadow-md', grad)}
      style={{ boxShadow:`0 4px 20px ${color}18` }}>
      <div className="hy-orb w-16 h-16 -top-4 -right-4 opacity-25" style={{ backgroundColor:color }} />
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
        style={{ background:`linear-gradient(90deg,${color}80,${color}10)` }} />
      <div className="flex h-8 w-8 items-center justify-center rounded-xl mb-3"
        style={{ background:`${color}18`, border:`1.5px solid ${color}30` }}>
        <Icon className="h-4 w-4" style={{ color }} strokeWidth={2} />
      </div>
      <p className={cn('font-bold tabular-nums leading-none text-gray-900 hy-count-in', isCurrency ? 'text-base display-font' : 'text-2xl display-font')}>
        {value}
      </p>
      <p className="mt-1.5 text-[11px] font-semibold text-gray-500">{label}</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SERVICE CARD — rotating accents, display font numbers
══════════════════════════════════════════════════════ */
function ServiceCard({ service, onClick, index }) {
  const a = SERVICE_ACCENTS[index % SERVICE_ACCENTS.length];
  return (
    <button
      onClick={onClick}
      className={cn(
        'hy-card-hover group w-full relative overflow-hidden rounded-2xl border border-white/80 text-left shadow-md hy-slide-up',
        a.grad
      )}
      style={{ boxShadow:`0 4px 20px ${a.shadow}`, animationDelay:`${index * 0.05}s` }}
    >
      {/* top accent stripe */}
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
        style={{ background:`linear-gradient(90deg,${a.color}90,${a.color}10)` }} />
      {/* left bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ background:`linear-gradient(180deg,${a.color}80,${a.color}20)` }} />
      {/* ambient blob */}
      <div className="hy-orb -bottom-8 -right-8 h-24 w-24 opacity-15" style={{ backgroundColor:a.color }} />

      <div className="p-5 pl-6">
        {/* top row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            {/* ticket number in accent color */}
            <p className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color:a.color }}>
              {service.ticket_number}
            </p>
            <p className="display-font text-base font-bold text-gray-900 truncate leading-tight">
              {service.customer_name}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Smartphone className="h-3 w-3 text-gray-400" />
              <p className="text-xs text-gray-500 truncate">{service.device_brand} {service.device_model}</p>
            </div>
          </div>
          {/* arrow */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-sm transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            style={{ background:`${a.color}15` }}>
            <ArrowUpRight className="h-3.5 w-3.5" style={{ color:a.color }} />
          </div>
        </div>

        {/* issue chip */}
        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-[10px] font-bold border"
            style={{ backgroundColor:`${a.color}12`, borderColor:`${a.color}25`, color:a.color }}>
            <Wrench className="h-2.5 w-2.5" />
            {service.issue_type}
          </span>
        </div>

        {/* bottom row */}
        <div className="flex items-center justify-between border-t pt-3" style={{ borderColor:`${a.color}15` }}>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3 text-gray-400" />
            <span className="text-[10px] font-semibold text-gray-400">
              {formatDate(service.returned_at || service.updated_at)}
            </span>
          </div>
          {/* final amount in display font */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold text-gray-400">₹</span>
            <span className="display-font text-base font-bold" style={{ color:a.color }}>
              {formatNumber(service.final_amount)}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

/* ══════════════════════════════════════════════════════
   SALE CARD — rotating accents
══════════════════════════════════════════════════════ */
function SaleCard({ sale, index }) {
  const a = SALE_ACCENTS[index % SALE_ACCENTS.length];
  const total = (Number(sale.price) || 0) * (Number(sale.quantity) || 1);

  return (
    <div
      className={cn(
        'hy-card-hover group w-full relative overflow-hidden rounded-2xl border border-white/80 shadow-md hy-slide-up',
        a.grad
      )}
      style={{ boxShadow:`0 4px 20px ${a.shadow}`, animationDelay:`${index * 0.05}s` }}
    >
      {/* top accent stripe */}
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
        style={{ background:`linear-gradient(90deg,${a.color}90,${a.color}10)` }} />
      {/* left bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ background:`linear-gradient(180deg,${a.color}80,${a.color}20)` }} />
      {/* ambient blob */}
      <div className="hy-orb -bottom-8 -right-8 h-24 w-24 opacity-15" style={{ backgroundColor:a.color }} />

      <div className="p-5 pl-6">
        {/* icon + price */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl shadow-sm shrink-0"
            style={{ background:`${a.color}15`, border:`1.5px solid ${a.color}25` }}>
            <ShoppingBag className="h-4 w-4" style={{ color:a.color }} strokeWidth={2} />
          </div>
          <div className="text-right">
            {/* unit price in display font */}
            <div className="flex items-center gap-1.5 justify-end">
              <span className="text-xs font-semibold text-gray-400">₹</span>
              <span className="display-font text-lg font-bold" style={{ color:a.color }}>
                {formatNumber(sale.price)}
              </span>
            </div>
            <p className="text-[9px] font-semibold text-gray-400">per unit</p>
          </div>
        </div>

        {/* product info */}
        <p className="display-font text-sm font-bold text-gray-900 truncate mb-0.5 capitalize">{sale.product_name}</p>
        <p className="text-xs font-medium text-gray-500 capitalize mb-4">{sale.brand_type}</p>

        {/* bottom row */}
        <div className="flex items-center justify-between border-t pt-3" style={{ borderColor:`${a.color}15` }}>
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold"
              style={{ backgroundColor:`${a.color}12`, color:a.color }}>
              <PackageCheck className="h-2.5 w-2.5" />
              Qty {sale.quantity}
            </span>
            {sale.quantity > 1 && (
              <span className="text-[10px] font-bold text-gray-500">
                = <span className="display-font" style={{ color:a.color }}>₹{formatNumber(total)}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <User className="h-3 w-3 text-gray-400" />
            <span className="text-[10px] font-semibold text-gray-400 truncate max-w-[80px]">
              {sale.profiles?.full_name || 'Staff'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   EMPTY STATE
══════════════════════════════════════════════════════ */
function EmptyState({ icon: Icon, label }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 gap-5 hy-fade-in">
      <div className="relative">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-gray-100 to-gray-50 border-2 border-dashed border-gray-200">
          <Icon className="h-10 w-10 text-gray-300" />
        </div>
      </div>
      <div className="text-center">
        <p className="display-font text-base font-bold text-gray-400">No {label} found</p>
        <p className="text-xs text-gray-300 mt-1 font-medium">Try adjusting your filters</p>
      </div>
    </div>
  );
}

/* ── Skeleton ── */
function CardSkeleton({ index = 0 }) {
  return (
    <div className="animate-pulse rounded-2xl bg-white border border-gray-100 h-40 relative overflow-hidden shadow-sm"
      style={{ animationDelay:`${index*0.05}s` }}>
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-100 rounded-l-2xl" />
      <div className="p-5 pl-6 space-y-3">
        <div className="h-2.5 bg-gray-100 rounded-full w-1/4" />
        <div className="h-4 bg-gray-100 rounded-lg w-3/4" />
        <div className="h-3 bg-gray-100 rounded-lg w-1/2" />
        <div className="h-3 bg-gray-100 rounded-lg w-1/3 mt-4" />
      </div>
    </div>
  );
}

/* ── InfoItem ── */
function InfoItem({ label, value, icon: Icon, color = '#f97316' }) {
  return (
    <div className="space-y-1.5">
      <p className="hy-label">{label}</p>
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-xl"
          style={{ background:`${color}15`, border:`1.5px solid ${color}25` }}>
          <Icon className="h-3.5 w-3.5" style={{ color }} strokeWidth={2} />
        </div>
        <p className="text-sm font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

/* ── Status helpers ── */
function getStatusStyles(status = '') {
  const s = status.toLowerCase();
  const make = (dot,text,badgeBg,badgeBorder,dotColor) => ({dot,text,badgeBg,badgeBorder,dotColor});
  if(s.includes('received'))   return make('bg-blue-500','text-blue-700','#eff6ff','#bfdbfe','#3b82f6');
  if(s.includes('diagnosed'))  return make('bg-violet-500','text-violet-700','#f5f3ff','#ddd6fe','#8b5cf6');
  if(s.includes('repair')||s.includes('in repair')||s.includes('repairing')||s.includes('in progress'))
                                return make('bg-orange-500','text-orange-700','#fff7ed','#fed7aa','#f97316');
  if(s.includes('waiting'))    return make('bg-amber-500','text-amber-700','#fffbeb','#fde68a','#f59e0b');
  if(s.includes('completed'))  return make('bg-emerald-500','text-emerald-700','#ecfdf5','#a7f3d0','#10b981');
  if(s.includes('returned'))   return make('bg-green-500','text-green-700','#f0fdf4','#bbf7d0','#22c55e');
  if(s.includes('cancel')||s.includes('non repairable')||s.includes('not repairable')||s.includes('rejected'))
                                return make('bg-red-500','text-red-700','#fef2f2','#fecaca','#ef4444');
  return make('bg-gray-400','text-gray-600','#f9fafb','#e5e7eb','#6b7280');
}

function formatStatusLabel(s = '') {
  return s.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
}

/* ══════════════════════════════════════════════════════
   SERVICE HISTORY DETAILS
══════════════════════════════════════════════════════ */
function ServiceHistoryDetails({ service, onBack, profile }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if(service?.id) fetchHistory(); }, [service?.id]);

  async function fetchHistory() {
    try {
      setLoading(true);
      const data = await historyService.getServiceTimeline(service.id);
      setHistory(data || []);
    } catch { setHistory([]); }
    finally { setLoading(false); }
  }

  const isAdmin = profile?.role==='admin'||profile?.role==='owner';
  const isTechnician = profile?.role==='technician';
  const isEmployee = profile?.role==='employee';

  const duration = service.returned_at
    ? Math.ceil((new Date(service.returned_at)-new Date(service.created_at))/(1000*60*60*24)) : null;
  const profitLoss = (Number(service.final_amount)||0)-(Number(service.estimated_cost)||0);

  return (
    <div className="hy-font max-w-4xl mx-auto pb-20 hy-slide-right">

      {/* ── Details Hero ── */}
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-7 shadow-2xl mb-7">
        <div className="hy-orb w-56 h-56 bg-orange-500/20 -top-14 -left-14 hy-float" />
        <div className="hy-orb w-40 h-40 bg-purple-500/18 -bottom-10 right-12 hy-float" style={{animationDelay:'1.2s'}} />
        <div className="absolute right-6 top-6 h-20 w-20 rounded-full border-2 border-dashed border-white/10 hy-spin" />
        <div className="absolute right-10 top-10 h-10 w-10 rounded-full border border-orange-400/30 hy-spin-rev" />
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',backgroundSize:'28px 28px'}} />
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{background:'linear-gradient(90deg,#f97316,#a855f7,transparent)'}} />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={onBack}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white hover:bg-white/20 transition">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-white/40 mb-0.5">Service History</p>
              <h2 className="display-font text-2xl font-bold text-white truncate">{service.customer_name}</h2>
              <p className="text-xs text-white/40 mt-0.5">{service.device_brand} {service.device_model}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-orange-500/18 border border-orange-500/30 px-4 py-2 text-[10px] font-extrabold uppercase tracking-widest text-orange-300">
              {service.ticket_number}
            </span>
            {/* final amount pill */}
            <div className="hy-glass rounded-2xl px-4 py-2.5 text-right">
              <p className="text-[9px] font-extrabold uppercase tracking-widest text-gray-500">Collected</p>
              <p className="display-font text-xl font-bold text-gray-900">{formatCurrency(service.final_amount)}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* ── Left Col ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Customer & Device */}
          <div className="hy-glass rounded-3xl p-6 shadow-xl border border-white/80 relative overflow-hidden hy-slide-up">
            <div className="hy-orb w-32 h-32 bg-orange-400/10 -top-8 -right-8" />
            <SectionLabel icon={User} label="Customer & Device" gradient="linear-gradient(135deg,#f97316,#ea580c)" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {!isEmployee && <InfoItem label="Mobile Number" value={service.customer_mobile} icon={User} color="#f97316" />}
              {!isEmployee && <InfoItem label="Address / Area" value={service.customer_address||'N/A'} icon={MapPin} color="#f97316" />}
              <InfoItem label="Device" value={`${service.device_brand} ${service.device_model}`} icon={Smartphone} color="#3b82f6" />
              <InfoItem label="Issue Type" value={service.issue_type} icon={Wrench} color="#a855f7" />
            </div>
            {service.issue_description && (
              <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
                <p className="hy-label">Issue Description</p>
                <p className="text-sm font-medium text-gray-700 leading-relaxed mt-1">{service.issue_description}</p>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="hy-glass rounded-3xl p-6 shadow-xl border border-white/80 relative overflow-hidden hy-slide-up" style={{animationDelay:'0.07s'}}>
            <div className="hy-orb w-28 h-28 bg-purple-400/10 -bottom-6 -left-6" />
            <div className="flex items-center justify-between mb-1">
              <SectionLabel icon={Activity} label="Service Timeline" gradient="linear-gradient(135deg,#a855f7,#7c3aed)" />
              <span className="shrink-0 -mt-4 rounded-full bg-gray-100 border border-gray-200 px-3 py-0.5 text-[10px] font-bold text-gray-500">
                {history.length} updates
              </span>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1,2,3].map(i=>(
                  <div key={i} className="animate-pulse flex gap-3">
                    <div className="h-4 w-4 rounded-full bg-gray-200 mt-1 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-1/3" />
                      <div className="h-2 bg-gray-100 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : history.length===0 ? (
              <p className="text-sm text-gray-400 font-medium">No timeline found.</p>
            ) : (
              <div className="space-y-3">
                {history.map((item,idx) => {
                  const ss = getStatusStyles(item.status);
                  const isMine = item.updated_by===profile?.id;
                  return (
                    <div key={item.id}
                      className={cn(
                        'relative rounded-2xl border p-4 pl-5 hy-slide-up',
                        isMine
                          ? 'border-orange-200/70 bg-gradient-to-r from-orange-50 via-white to-purple-50/30 shadow-md ring-1 ring-orange-100'
                          : 'border-gray-100 bg-white'
                      )}
                      style={{animationDelay:`${idx*0.06}s`}}
                    >
                      {/* connector line */}
                      {idx!==history.length-1 && (
                        <div className="absolute left-[19px] top-10 h-[calc(100%+12px)] border-l-2 border-gray-100" />
                      )}
                      {isMine && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-gradient-to-b from-orange-400 to-purple-500" />
                      )}

                      <div className="flex items-start gap-3 pl-1">
                        <div className="relative shrink-0 mt-1">
                          <span className={cn('block h-3.5 w-3.5 rounded-full shadow-sm', ss.dot)} />
                          {isMine && (
                            <span className={cn('absolute inset-0 rounded-full', ss.dot)}
                              style={{animation:'pulse-ring 2s cubic-bezier(0.215,0.61,0.355,1) infinite'}} />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-0.5">
                            <p className={cn('text-sm font-bold', ss.text)}>{formatStatusLabel(item.status)}</p>
                            {isMine && (
                              <span className="rounded-full bg-gradient-to-r from-orange-400 to-purple-500 px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-widest text-white">You</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">
                            by <span className="font-semibold text-gray-600">{item.profiles?.full_name||'Staff'}</span>
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {formatDateTime(item.created_at)}
                          </p>
                          {item.reason && (
                            <div className="mt-2 inline-flex rounded-xl border px-3 py-1 text-[10px] font-semibold"
                              style={{backgroundColor:ss.badgeBg, borderColor:ss.badgeBorder, color:ss.dotColor}}>
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

        {/* ── Right Col ── */}
        <div className="space-y-5">

          {/* Summary Card */}
          <div className="hy-glass rounded-3xl p-5 shadow-xl border border-white/80 relative overflow-hidden hy-slide-up" style={{animationDelay:'0.05s'}}>
            <div className="hy-orb w-24 h-24 bg-green-400/12 -top-6 -right-6" />
            <SectionLabel icon={CheckCircle2} label="Summary" gradient="linear-gradient(135deg,#10b981,#059669)" />
            <div className="space-y-3">
              {[
                { label:'Received', value: formatDate(service.created_at) },
                { label:'Returned', value: service.returned_at ? formatDate(service.returned_at) : '—' },
                { label:'Estimated', value: formatCurrency(service.estimated_cost) },
              ].map(row=>(
                <div key={row.label} className="flex items-center justify-between py-1">
                  <span className="text-xs font-semibold text-gray-400">{row.label}</span>
                  <span className="text-xs font-bold text-gray-700">{row.value}</span>
                </div>
              ))}
              {/* final amount — display font, big */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-1">
                <span className="text-sm font-semibold text-gray-700">Final Amount</span>
                <div className="text-base font-bold text-green-600">
                  {formatCurrency(service.final_amount || 0)}
                </div>
              </div>
            </div>
          </div>

          {/* Admin Business Details */}
          {isAdmin && (
            <div className="hy-glass rounded-3xl p-5 shadow-xl border border-white/80 relative overflow-hidden hy-slide-up" style={{animationDelay:'0.1s'}}>
              <div className="hy-orb w-24 h-24 bg-blue-400/12 -bottom-6 -left-6" />
              <SectionLabel icon={TrendingUp} label="Business Details" gradient="linear-gradient(135deg,#3b82f6,#a855f7)" />
              <div className="space-y-3">
                <div className="flex items-center justify-between py-1">
                  <span className="text-xs font-semibold text-gray-400">Duration</span>
                  <span className="text-xs font-bold text-gray-700">
                    {duration!=null?`${duration} day${duration!==1?'s':''}` : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-1">
                  <span className="text-sm font-semibold text-gray-700">Profit / Loss</span>
                  <div className="text-base font-bold" style={{ color: profitLoss >= 0 ? '#10b981' : '#ef4444' }}>
                    {profitLoss >= 0 ? '+' : '-'}{formatCurrency(Math.abs(profitLoss))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Technician Panel */}
          {isTechnician && (
            <div className="hy-glass rounded-3xl p-5 shadow-xl border border-white/80 hy-slide-up" style={{animationDelay:'0.1s'}}>
              <SectionLabel icon={Wrench} label="Tech Notes" gradient="linear-gradient(135deg,#f97316,#f59e0b)" />
              <div className="rounded-2xl bg-orange-50 border border-orange-100 p-3">
                <p className="text-xs font-semibold text-orange-700">
                  Final Status: <span className="font-black">{service.status||'Completed'}</span>
                </p>
                <p className="text-xs text-orange-400 mt-1">Device returned to customer.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN HISTORY PAGE
══════════════════════════════════════════════════════ */
export default function HistoryPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab')==='sales'?'sales':'services';
  const todayParam = searchParams.get('today');
  const serviceIdParam = searchParams.get('serviceId');

  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [services, setServices] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [brandFilter, setBrandFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const filtersRef = useRef(null);
  const [view, setView] = useState('list');
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => { if(profile) fetchHistory(); }, [activeTab, profile]);

  useEffect(() => {
    if(serviceIdParam&&services.length>0) {
      const found=services.find(s=>s.id===serviceIdParam);
      if(found&&!selectedService){setSelectedService(found);setView('details');}
    }
  },[serviceIdParam,services,selectedService]);

  useEffect(() => {
    function handleClickOutside(e) {
      if(filtersRef.current&&!filtersRef.current.contains(e.target)) setShowFilters(false);
    }
    document.addEventListener('mousedown',handleClickOutside);
    return()=>document.removeEventListener('mousedown',handleClickOutside);
  },[]);

  useEffect(() => {
    setSearchQuery(''); setBrandFilter('all'); setTypeFilter('all');
    setDateFrom(''); setDateTo(''); setShowFilters(false);
  },[activeTab]);

  useEffect(() => {
    const today=new Date().toISOString().split('T')[0];
    if((todayParam==='returned'&&activeTab==='services')||todayParam==='true') {
      setDateFrom(today); setDateTo(today);
    }
  },[todayParam,activeTab]);

  async function fetchHistory() {
    try {
      setLoading(true);
      if(activeTab==='services') {
        const data=await historyService.getServiceHistory(profile);
        setServices(data);
      } else {
        const data=await historyService.getSalesHistory(profile);
        setSales(data);
      }
    } catch(err){console.error(err);}
    finally{setLoading(false);}
  }

  /* ── Filters ── */
  const filteredServices = services.filter(s => {
    const q=searchQuery.toLowerCase();
    const matchSearch=s.customer_name.toLowerCase().includes(q)||
      s.device_brand.toLowerCase().includes(q)||s.device_model.toLowerCase().includes(q)||
      s.ticket_number.toLowerCase().includes(q)||s.issue_type.toLowerCase().includes(q)||
      (s.issue_description||'').toLowerCase().includes(q);
    const matchBrand=brandFilter==='all'||s.device_brand.toLowerCase()===brandFilter.toLowerCase();
    let matchDate=true;
    if(dateFrom||dateTo){
      const d=new Date(s.returned_at||s.updated_at||s.created_at);
      if(dateFrom){const f=new Date(dateFrom);f.setHours(0,0,0,0);matchDate=matchDate&&d>=f;}
      if(dateTo){const t=new Date(dateTo);t.setHours(23,59,59,999);matchDate=matchDate&&d<=t;}
    }
    return matchSearch&&matchBrand&&matchDate;
  });

  const filteredSales = sales.filter(s => {
    const q=searchQuery.toLowerCase();
    const matchSearch=(s.product_name||'').toLowerCase().includes(q)||(s.brand_type||'').toLowerCase().includes(q);
    const matchBrand=brandFilter==='all'||(s.brand_type||'').toLowerCase()===brandFilter.toLowerCase();
    const matchType=typeFilter==='all'||(s.product_name||'').toLowerCase()===typeFilter.toLowerCase();
    let matchDate=true;
    if(dateFrom||dateTo){
      const d=new Date(s.created_at);
      if(dateFrom){const f=new Date(dateFrom);f.setHours(0,0,0,0);matchDate=matchDate&&d>=f;}
      if(dateTo){const t=new Date(dateTo);t.setHours(23,59,59,999);matchDate=matchDate&&d<=t;}
    }
    return matchSearch&&matchBrand&&matchType&&matchDate;
  });

  const totalServiceRevenue=filteredServices.reduce((sum,s)=>s.status==='Returned'?sum+(Number(s.final_amount)||0):sum,0);
  const totalSalesRevenue=filteredSales.reduce((sum,s)=>sum+(Number(s.price)||0)*(Number(s.quantity)||1),0);
  const hasActiveFilters=brandFilter!=='all'||typeFilter!=='all'||dateFrom||dateTo;

  function clearFilters(){ setBrandFilter('all');setTypeFilter('all');setDateFrom('');setDateTo(''); }

  if(view==='details'&&selectedService) {
    return (
      <>
        <HistoryStyleInjector />
        <div className="hy-mesh-bg hy-font min-h-screen p-1">
          <ServiceHistoryDetails service={selectedService} onBack={()=>{setView('list');setSelectedService(null);}} profile={profile} />
        </div>
      </>
    );
  }

  return (
    <>
      <HistoryStyleInjector />
      <div className="hy-mesh-bg hy-font min-h-screen space-y-7 p-1">

        {/* ── Hero Header ── */}
        <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-7 shadow-2xl">
          <div className="hy-orb w-64 h-64 bg-orange-500/20 -top-16 -left-16 hy-float" style={{animationDelay:'0s'}} />
          <div className="hy-orb w-48 h-48 bg-purple-500/18 -bottom-12 left-1/3 hy-float" style={{animationDelay:'1s'}} />
          <div className="hy-orb w-52 h-52 bg-blue-500/14 -top-8 right-10 hy-float" style={{animationDelay:'2s'}} />
          <div className="absolute right-6 top-6 h-20 w-20 rounded-full border-2 border-dashed border-white/10 hy-spin" />
          <div className="absolute right-10 top-10 h-12 w-12 rounded-full border border-orange-400/30 hy-spin-rev" />
          <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',backgroundSize:'32px 32px'}} />
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{background:'linear-gradient(90deg,#f97316,#a855f7,#3b82f6,transparent)'}} />

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-purple-500 shadow-lg">
                  <ReceiptText className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                </div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-white/40">Records</p>
              </div>
              <h1 className="display-font text-2xl sm:text-3xl font-bold text-white mb-1">
                History <span className="hy-shimmer-text">Archive</span>
              </h1>
              <p className="text-sm text-white/45">All completed services and sales records.</p>
            </div>

            {/* live revenue pill */}
            <div className="hy-glass rounded-2xl px-5 py-3 text-right">
              <p className="text-[9px] font-extrabold uppercase tracking-widest text-gray-500 mb-0.5">
                {activeTab==='services'?'Service Revenue':'Sales Revenue'}
              </p>
              <p className="display-font text-2xl font-bold text-gray-900">
                {formatCurrency(activeTab==='services'?totalServiceRevenue:totalSalesRevenue)}
              </p>
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-400 hy-blink" />
                <p className="text-[10px] font-semibold text-gray-500">
                  {activeTab==='services'?filteredServices.length:filteredSales.length} records
                </p>
              </div>
            </div>
          </div>

          {/* ── Tabs inside hero ── */}
          <div className="relative mt-5 flex gap-2 rounded-2xl p-1.5" style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.08)'}}>
            {[
              { key:'services', label:'Services', icon:Wrench,      activeColor:'#f97316' },
              { key:'sales',    label:'Sales',    icon:ShoppingBag, activeColor:'#a855f7' },
            ].map(tab=>(
              <button key={tab.key} onClick={()=>setActiveTab(tab.key)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200"
                style={activeTab===tab.key
                  ?{background:'rgba(255,255,255,0.92)',color:tab.activeColor,boxShadow:`0 4px 16px ${tab.activeColor}25`}
                  :{color:'rgba(255,255,255,0.35)'}
                }>
                <tab.icon className="h-4 w-4" strokeWidth={2.5} />
                {tab.label}
                {activeTab===tab.key&&(
                  <span className="h-1.5 w-1.5 rounded-full hy-blink" style={{backgroundColor:tab.activeColor}} />
                )}
              </button>
            ))}
          </div>
        </header>

        {/* ── Stats Strip ── */}
        {!loading && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 hy-slide-up">
            <StatPill index={0}
              label={activeTab==='services'?'Services':'Sales'}
              value={activeTab==='services'?filteredServices.length:filteredSales.length}
              color="#3b82f6" icon={activeTab==='services'?Wrench:ShoppingBag} />
            <StatPill index={1}
              label="Total Revenue"
              value={formatCurrency(activeTab==='services'?totalServiceRevenue:totalSalesRevenue)}
              color={activeTab==='services'?'#f97316':'#a855f7'}
              icon={IndianRupee} isCurrency />
            <StatPill index={2}
              label="Total Records"
              value={activeTab==='services'?services.length:sales.length}
              color="#10b981" icon={PackageCheck} />
            <StatPill index={3}
              label="Filtered"
              value={activeTab==='services'?filteredServices.length:filteredSales.length}
              color="#a855f7" icon={Activity} />
          </div>
        )}

        {/* ── Search + Filter ── */}
        <div className="relative" ref={filtersRef}>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab==='services'?'customer, device, ticket…':'product, brand…'}`}
                className="hy-input pl-11 py-3"
                value={searchQuery}
                onChange={e=>setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={()=>setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 transition">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            <button onClick={()=>setShowFilters(!showFilters)}
              className={cn(
                'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 transition-all shadow-sm',
                showFilters||hasActiveFilters
                  ?'border-orange-400 bg-orange-50 text-orange-600'
                  :'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
              )}>
              <SlidersHorizontal className="h-4 w-4" />
              {hasActiveFilters && <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-orange-500 border-2 border-white" />}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="hy-glass absolute right-0 top-[60px] z-30 w-full max-w-2xl rounded-3xl border border-gray-100 p-5 shadow-2xl hy-slide-up">
              <div className="flex items-center justify-between mb-4">
                <SectionLabel icon={SlidersHorizontal} label="Filters" gradient="linear-gradient(135deg,#6b7280,#374151)" />
                {hasActiveFilters && (
                  <button onClick={clearFilters}
                    className="flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:text-orange-700 -mt-4">
                    <X className="h-3 w-3" /> Clear all
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-end gap-4">
                {activeTab==='sales' && (
                  <div className="space-y-1.5">
                    <label className="hy-label">Type</label>
                    <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)} className="hy-input w-auto text-xs py-2 px-3">
                      {['all','watches','screen guards','pouches','chargers','cases','accessories','other'].map(o=>(
                        <option key={o} value={o}>{o==='all'?'All Types':o.charAt(0).toUpperCase()+o.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="hy-label">Brand</label>
                  <select value={brandFilter} onChange={e=>setBrandFilter(e.target.value)} className="hy-input w-auto text-xs py-2 px-3">
                    {(activeTab==='services'
                      ?['all','samsung','apple','oneplus','xiaomi','oppo','vivo','realme','motorola','other']
                      :['all','fire boltt','boat','samsung a series','iphone','samsung','oneplus','xiaomi','other']
                    ).map(o=>(
                      <option key={o} value={o}>{o==='all'?'All Brands':o.charAt(0).toUpperCase()+o.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="hy-label">From</label>
                  <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} className="hy-input w-auto text-xs py-2 px-3" />
                </div>
                <div className="space-y-1.5">
                  <label className="hy-label">To</label>
                  <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} className="hy-input w-auto text-xs py-2 px-3" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Active filter chips + count ── */}
        {!loading && (hasActiveFilters||searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 hy-slide-up">
            <span className="text-xs font-bold text-gray-400">
              {activeTab==='services'?filteredServices.length:filteredSales.length} results
            </span>
            {brandFilter!=='all' && (
              <span className="flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-orange-600">
                {brandFilter}<button onClick={()=>setBrandFilter('all')}><X className="h-2.5 w-2.5 ml-0.5" /></button>
              </span>
            )}
            {typeFilter!=='all' && (
              <span className="flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-[10px] font-bold text-purple-600">
                {typeFilter}<button onClick={()=>setTypeFilter('all')}><X className="h-2.5 w-2.5 ml-0.5" /></button>
              </span>
            )}
            {(dateFrom||dateTo) && (
              <span className="flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-600">
                <Calendar className="h-2.5 w-2.5" />
                {dateFrom||'…'} → {dateTo||'…'}
                <button onClick={()=>{setDateFrom('');setDateTo('');}}><X className="h-2.5 w-2.5 ml-0.5" /></button>
              </span>
            )}
          </div>
        )}

        {/* ── Cards Grid ── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            [...Array(6)].map((_,i)=><CardSkeleton key={i} index={i} />)
          ) : activeTab==='services' ? (
            filteredServices.length>0
              ? filteredServices.map((svc,i)=>(
                  <ServiceCard key={svc.id} service={svc} index={i}
                    onClick={()=>{setSelectedService(svc);setView('details');}} />
                ))
              : <EmptyState icon={Wrench} label="service history" />
          ) : (
            filteredSales.length>0
              ? filteredSales.map((sale,i)=><SaleCard key={sale.id} sale={sale} index={i} />)
              : <EmptyState icon={ShoppingBag} label="sales history" />
          )}
        </div>
      </div>
    </>
  );
}
