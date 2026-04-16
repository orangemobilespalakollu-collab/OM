'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { salesService } from '@/services/salesService';
import { useAuth } from '@/components/AuthProvider';
import {
  Plus,
  Search,
  ShoppingBag,
  ChevronRight,
  History,
  Package,
  Tag,
  IndianRupee,
  XCircle,
  Minus,
  TrendingUp,
  Sparkles,
  Zap,
  ArrowUpRight,
  ReceiptText,
  BadgePercent,
  Box,
  Clock,
  CheckCircle2,
  ArrowLeft,
  X,
} from 'lucide-react';
import { cn, formatCurrency, formatTime, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

/* ═══════════════════════════════════════════════════════════════
   DESIGN SYSTEM — exact mirror of dashboard + services
   ─ Single accent: #f97316  |  Ink: #0d0d0d  |  Surface: #f9fafb
   ─ Fonts: Instrument Serif (display) + Geist (body)
   ─ Motion: tilt, count-up, stagger, morph, shine, ripple, orbit
═══════════════════════════════════════════════════════════════ */

const SALES_STYLES = `
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

.sl-font-display { font-family: 'Instrument Serif', Georgia, serif; }
.sl-font-body    { font-family: 'Geist', system-ui, sans-serif; }

/* ── Keyframes ── */
@keyframes sl-fade-up {
  from { opacity:0; transform:translateY(20px); filter:blur(4px); }
  to   { opacity:1; transform:translateY(0);    filter:blur(0); }
}
@keyframes sl-card-in {
  from { opacity:0; transform:translateY(16px) scale(0.97); filter:blur(3px); }
  to   { opacity:1; transform:translateY(0)    scale(1);    filter:blur(0); }
}
@keyframes sl-num-rise {
  from { opacity:0; transform:translateY(10px) scale(0.9); }
  to   { opacity:1; transform:translateY(0)    scale(1); }
}
@keyframes sl-spin-slow  { from { transform:rotate(0deg); }  to { transform:rotate(360deg); } }
@keyframes sl-spin-rev   { from { transform:rotate(0deg); }  to { transform:rotate(-360deg); } }
@keyframes sl-blink      { 0%,100%{ opacity:1; } 50%{ opacity:0.2; } }
@keyframes sl-live-ring  {
  0%   { transform:scale(1);   opacity:0.5; }
  70%  { transform:scale(2.4); opacity:0; }
  100% { transform:scale(2.4); opacity:0; }
}
@keyframes sl-blob-morph {
  0%,100% { border-radius:60% 40% 30% 70% / 60% 30% 70% 40%; }
  33%      { border-radius:30% 70% 60% 40% / 50% 60% 30% 60%; }
  66%      { border-radius:50% 30% 70% 40% / 40% 70% 30% 60%; }
}
@keyframes sl-shine      { from { left:-80%; } to { left:130%; } }
@keyframes sl-ripple-out { from { transform:scale(0); opacity:0.35; } to { transform:scale(3.5); opacity:0; } }
@keyframes sl-slide-right{ from { opacity:0; transform:translateX(-14px); } to { opacity:1; transform:translateX(0); } }
@keyframes sl-orbit {
  from { transform:rotate(0deg) translateX(44px) rotate(0deg); }
  to   { transform:rotate(360deg) translateX(44px) rotate(-360deg); }
}
@keyframes sl-underline {
  from { transform:scaleX(0); transform-origin:left; }
  to   { transform:scaleX(1); transform-origin:left; }
}
@keyframes sl-glow {
  0%,100% { box-shadow:0 0 0 0 rgba(249,115,22,0); }
  50%      { box-shadow:0 0 28px 8px rgba(249,115,22,0.20); }
}
@keyframes sl-top-bar-in {
  from { transform:scaleX(0); transform-origin:left; }
  to   { transform:scaleX(1); transform-origin:left; }
}

/* ── Stagger ── */
.sl-stagger > *:nth-child(1)  { animation:sl-card-in 0.52s var(--ease-expo) 0.04s both; }
.sl-stagger > *:nth-child(2)  { animation:sl-card-in 0.52s var(--ease-expo) 0.09s both; }
.sl-stagger > *:nth-child(3)  { animation:sl-card-in 0.52s var(--ease-expo) 0.14s both; }
.sl-stagger > *:nth-child(4)  { animation:sl-card-in 0.52s var(--ease-expo) 0.19s both; }
.sl-stagger > *:nth-child(5)  { animation:sl-card-in 0.52s var(--ease-expo) 0.24s both; }
.sl-stagger > *:nth-child(6)  { animation:sl-card-in 0.52s var(--ease-expo) 0.29s both; }
.sl-stagger > *:nth-child(7)  { animation:sl-card-in 0.52s var(--ease-expo) 0.34s both; }
.sl-stagger > *:nth-child(8)  { animation:sl-card-in 0.52s var(--ease-expo) 0.39s both; }
.sl-stagger > *:nth-child(9)  { animation:sl-card-in 0.52s var(--ease-expo) 0.44s both; }

.sl-section-enter { animation:sl-fade-up 0.65s var(--ease-expo) both; }

/* ── Shine ── */
.sl-shine { position:relative; overflow:hidden; }
.sl-shine::before {
  content:'';
  position:absolute; top:-50%; left:-80%;
  width:50%; height:200%;
  background:linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.5) 50%,transparent 70%);
  transform:skewX(-20deg);
  pointer-events:none; z-index:2;
}
.sl-shine:hover::before { animation:sl-shine 0.5s ease forwards; }

/* ── Ripple ── */
.sl-ripple { position:relative; overflow:hidden; }
.sl-ripple-circle {
  position:absolute; border-radius:50%;
  background:rgba(255,255,255,0.28);
  transform:scale(0);
  animation:sl-ripple-out 0.6s linear forwards;
  pointer-events:none;
}

/* ── Blob ── */
.sl-blob {
  border-radius:60% 40% 30% 70% / 60% 30% 70% 40%;
  animation:sl-blob-morph 10s ease-in-out infinite;
  position:absolute; pointer-events:none;
}

/* ── Accent glow ── */
.sl-accent-glow { animation:sl-glow 3s ease-in-out infinite; }

/* ── Input ── */
.sl-input {
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
.sl-input:focus {
  border-color:var(--accent);
  box-shadow:0 0 0 3px var(--accent-dim);
}
.sl-input::placeholder { color:var(--ink-faint); }
.sl-input:disabled { opacity:0.5; cursor:not-allowed; }

.sl-label {
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

function SalesStyleInjector() {
  useEffect(() => {
    if (document.getElementById('sl-v2-styles')) return;
    const el = document.createElement('style');
    el.id = 'sl-v2-styles';
    el.textContent = SALES_STYLES;
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
    circle.className = 'sl-ripple-circle';
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

/* ── Section Label — identical to dashboard ── */
function SlSectionLabel({ icon: Icon, label }) {
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

/* ── Panel style (reused) ── */
const panelStyle = {
  background: 'var(--surface-raise)',
  border: '1px solid var(--border)',
  borderRadius: '1.5rem',
  padding: '1.5rem',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
};
const topAccentBar = {
  position: 'absolute', top: 0, left: '1.5rem', right: '1.5rem', height: 2,
  background: 'linear-gradient(90deg, var(--accent), transparent)',
  borderRadius: '0 0 3px 3px', opacity: 0.5,
};

/* ── Back Button ── */
function BackBtn({ onClick }) {
  const ripple = useRipple();
  return (
    <button onClick={(e) => { ripple(e); onClick(); }} className="sl-ripple"
      style={{ width:40, height:40, borderRadius:'0.875rem', display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.15)', cursor:'pointer', color:'#fff', flexShrink:0, transition:'background 0.2s' }}>
      <ArrowLeft style={{ width:16, height:16 }} />
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN SALES PAGE
═══════════════════════════════════════════════════════════════ */
export default function SalesPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [view, setView]               = useState('list');
  const [sales, setSales]             = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted]         = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('action') === 'new') setView('record');
    }
    fetchTodaySales();
    setTimeout(() => setMounted(true), 50);
  }, []);

  async function fetchTodaySales() {
    try {
      setLoading(true);
      const data = await salesService.getTodaySales();
      setSales(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  const filteredSales = sales.filter(s =>
    s.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.brand_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = filteredSales.reduce((sum, s) => sum + (s.price * s.quantity), 0);
  const totalItems   = filteredSales.reduce((sum, s) => sum + s.quantity, 0);

  if (view === 'record') return (
    <>
      <SalesStyleInjector />
      <RecordSale onCancel={() => setView('list')} onComplete={() => { setView('list'); fetchTodaySales(); }} />
    </>
  );
  if (view === 'details' && selectedSale) return (
    <>
      <SalesStyleInjector />
      <SaleDetails sale={selectedSale} onBack={() => setView('list')} />
    </>
  );

  return (
    <>
      <SalesStyleInjector />
      <div className="sl-font-body" style={{ backgroundColor:'var(--surface)', minHeight:'100vh', padding:'0.25rem' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>

          {/* ═══ HERO HEADER ═══ */}
          <header
            className={cn(mounted && 'sl-section-enter')}
            style={{
              background:'linear-gradient(135deg, #0d0d0d 0%, #181818 60%, #0d0d0d 100%)',
              borderRadius:'1.75rem', padding:'1.75rem',
              position:'relative', overflow:'hidden',
              boxShadow:'0 24px 60px -16px rgba(0,0,0,0.45)',
              animationDelay:'0s',
            }}
          >
            {/* Morphing blobs */}
            <div className="sl-blob" style={{ width:260, height:260, background:'var(--accent)', opacity:0.06, top:-60, right:-40 }} />
            <div className="sl-blob" style={{ width:160, height:160, background:'var(--accent)', opacity:0.04, bottom:-40, left:'22%', animationDelay:'4s' }} />

            {/* Spinning rings */}
            <div style={{ position:'absolute', right:28, top:28, width:88, height:88, animation:'sl-spin-slow 20s linear infinite', pointerEvents:'none' }}>
              <div style={{ width:'100%', height:'100%', borderRadius:'50%', border:'1px dashed rgba(249,115,22,0.18)' }} />
            </div>
            <div style={{ position:'absolute', right:36, top:36, width:54, height:54, animation:'sl-spin-rev 9s linear infinite', pointerEvents:'none' }}>
              <div style={{ width:'100%', height:'100%', borderRadius:'50%', border:'1px solid rgba(249,115,22,0.10)' }} />
            </div>
            {/* Orbiting dot */}
            <div style={{ position:'absolute', right:49, top:49, pointerEvents:'none' }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent)', opacity:0.65, animation:'sl-orbit 9s linear infinite' }} />
            </div>
            {/* Corner accent line */}
            <div style={{ position:'absolute', top:0, left:'8%', width:100, height:2, background:'linear-gradient(90deg, var(--accent), transparent)', opacity:0.55 }} />

            <div style={{ position:'relative', display:'flex', flexWrap:'wrap', alignItems:'flex-end', justifyContent:'space-between', gap:'1.25rem' }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.625rem', marginBottom:'0.5rem' }}>
                  <div style={{ width:28, height:28, borderRadius:'0.625rem', background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <ShoppingBag style={{ width:14, height:14, color:'#fff' }} strokeWidth={2.5} />
                  </div>
                  <p style={{ fontSize:'0.625rem', fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:'rgba(255,255,255,0.28)' }}>Sales</p>
                </div>
                <h1 className="sl-font-display" style={{ fontSize:'clamp(1.75rem,4vw,2.5rem)', fontWeight:400, lineHeight:1.1, color:'rgba(255,255,255,0.94)', marginBottom:'0.5rem', fontStyle:'italic' }}>
                  Today's <span style={{ color:'var(--accent)' }}>Sales</span>
                </h1>
                <div style={{ height:2, width:56, background:'var(--accent)', animation:'sl-underline 0.8s var(--ease-expo) 0.3s both', borderRadius:2 }} />
                <p style={{ marginTop:'0.7rem', fontSize:'0.8125rem', color:'rgba(255,255,255,0.3)', fontWeight:400 }}>
                  Track accessories, parts &amp; product sales.
                </p>
              </div>

              {/* Revenue widget */}
              <div style={{ background:'rgba(255,255,255,0.06)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:'1.125rem', padding:'0.85rem 1.4rem', textAlign:'right', minWidth:148 }}>
                <p style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(255,255,255,0.28)', marginBottom:'0.3rem' }}>Today's Revenue</p>
                <p style={{ fontSize:'1.625rem', fontWeight:800, letterSpacing:'-0.03em', color:'var(--accent)', lineHeight:1, margin:0, animation:'sl-num-rise 0.5s var(--ease-spring) both' }}>
                  {formatCurrency(totalRevenue)}
                </p>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:'0.4rem', marginTop:'0.4rem' }}>
                  <span style={{ display:'inline-block', position:'relative', width:7, height:7, borderRadius:'50%', background:'#22c55e' }}>
                    <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:'#22c55e', animation:'sl-live-ring 2s ease-out infinite' }} />
                  </span>
                  <span style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(255,255,255,0.28)' }}>
                    {filteredSales.length} sale{filteredSales.length !== 1 ? 's' : ''} · {totalItems} items
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* ═══ SUMMARY STAT CARDS ═══ */}
          <div className={cn(mounted && 'sl-section-enter')} style={{ animationDelay:'0.1s' }}>
            <div className="sl-stagger" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem' }}>
              <SummaryStatCard label="Total Sales"  value={filteredSales.length}       icon={ReceiptText} dotColor="#3b82f6" delay={0} />
              <SummaryStatCard label="Items Sold"   value={totalItems}                 icon={Box}         dotColor="#10b981" delay={80} />
              <SummaryStatCard label="Revenue"      value={formatCurrency(totalRevenue)} icon={IndianRupee} dotColor="#f97316" delay={160} isCurrency />
            </div>
          </div>

          {/* ═══ SEARCH + ACTIONS ═══ */}
          <div className={cn(mounted && 'sl-section-enter')} style={{ display:'flex', alignItems:'center', gap:'0.75rem', animationDelay:'0.18s' }}>
            <div style={{ position:'relative', flex:1 }}>
              <Search style={{ position:'absolute', left:'0.875rem', top:'50%', transform:'translateY(-50%)', width:16, height:16, color:'var(--ink-faint)' }} />
              <input
                type="text"
                placeholder="Search product or brand…"
                className="sl-input"
                style={{ paddingLeft:'2.5rem', paddingRight: searchQuery ? '2.5rem' : '0.875rem' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')}
                  style={{ position:'absolute', right:'0.75rem', top:'50%', transform:'translateY(-50%)', width:22, height:22, borderRadius:'50%', background:'var(--border)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <X style={{ width:10, height:10, color:'var(--ink-mid)' }} />
                </button>
              )}
            </div>
            <NewSaleBtn onClick={() => setView('record')} />
            <HistoryBtn onClick={() => router.push('/history?tab=sales')} />
          </div>

          {/* ═══ SECTION LABEL ═══ */}
          <div className={cn(mounted && 'sl-section-enter')} style={{ animationDelay:'0.22s' }}>
            <SlSectionLabel icon={Sparkles} label="Today's Sales" />
          </div>

          {/* ═══ SALES GRID ═══ */}
          {loading ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:'1rem' }}>
              {[...Array(6)].map((_,i) => (
                <div key={i} style={{ height:160, borderRadius:'1.25rem', background:'#f3f4f6', animation:`sl-card-in 0.4s var(--ease-expo) ${i*0.05}s both` }} />
              ))}
            </div>
          ) : filteredSales.length > 0 ? (
            <div className="sl-stagger" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:'1rem' }}>
              {filteredSales.map((sale, i) => (
                <SaleCard key={sale.id} sale={sale} index={i} onClick={() => { setSelectedSale(sale); setView('details'); }} />
              ))}
            </div>
          ) : (
            <EmptyState onNewSale={() => setView('record')} />
          )}
        </div>
      </div>
    </>
  );
}

/* ── Summary Stat Card ── */
function SummaryStatCard({ label, value, icon: Icon, dotColor, isCurrency, delay }) {
  const animated = typeof value === 'number' ? useCountUp(value, 800, delay) : value;
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius:'1.25rem', padding:'1.125rem',
        background:'var(--surface-raise)',
        border:`1.5px solid ${hovered ? dotColor+'50' : 'var(--border)'}`,
        position:'relative', overflow:'hidden',
        transition:'border-color 0.2s, box-shadow 0.2s',
        boxShadow: hovered ? `0 6px 24px ${dotColor}1a` : '0 2px 8px rgba(0,0,0,0.03)',
      }}
    >
      {/* top bar */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:dotColor, transform:hovered?'scaleX(1)':'scaleX(0)', transformOrigin:'left', transition:'transform 0.3s var(--ease-expo)' }} />
      {/* ambient spot */}
      <div style={{ position:'absolute', right:-16, bottom:-16, width:64, height:64, borderRadius:'50%', background:dotColor, opacity:hovered?0.1:0.04, transition:'opacity 0.3s', filter:'blur(16px)' }} />

      <div style={{ width:32, height:32, borderRadius:'0.625rem', display:'flex', alignItems:'center', justifyContent:'center', background:dotColor+'15', border:`1px solid ${dotColor}28`, marginBottom:'0.625rem', transform:hovered?'scale(1.1) rotate(-4deg)':'scale(1)', transition:'transform 0.3s var(--ease-spring)' }}>
        <Icon style={{ width:15, height:15, color:dotColor }} strokeWidth={2} />
      </div>
      <p style={{ fontSize: isCurrency ? '1.0625rem' : '1.625rem', fontWeight:800, letterSpacing:'-0.03em', lineHeight:1, color:'var(--ink)', margin:0, animation:'sl-num-rise 0.5s var(--ease-spring) both' }}>
        {isCurrency ? value : animated}
      </p>
      <p style={{ marginTop:'0.375rem', fontSize:'0.6875rem', fontWeight:600, color:'var(--ink-faint)', textTransform:'uppercase', letterSpacing:'0.08em' }}>{label}</p>
    </div>
  );
}

/* ── Sale Card ── */
function SaleCard({ sale, index, onClick }) {
  const ripple = useRipple();
  const { ref, onMouseMove, onMouseLeave } = useTilt(4);
  const [hovered, setHovered] = useState(false);
  const total = sale.price * sale.quantity;

  // Rotate through semantic status colors — but muted, ink-based
  const accents = ['#3b82f6','#10b981','#8b5cf6','#06b6d4'];
  const dotColor = accents[index % accents.length];

  return (
    <button
      ref={ref}
      onClick={(e) => { ripple(e); onClick(); }}
      onMouseMove={onMouseMove}
      onMouseLeave={() => { onMouseLeave(); setHovered(false); }}
      onMouseEnter={() => setHovered(true)}
      className="sl-ripple sl-shine"
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
      {/* top bar */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:dotColor, transform:hovered?'scaleX(1)':'scaleX(0)', transformOrigin:'left', transition:'transform 0.35s var(--ease-expo)' }} />
      {/* left accent */}
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:3, background:dotColor, opacity:0.65, borderRadius:'1.25rem 0 0 1.25rem' }} />
      {/* ambient glow */}
      <div style={{ position:'absolute', right:-20, bottom:-20, width:80, height:80, borderRadius:'50%', background:dotColor, opacity:hovered?0.09:0.04, transition:'opacity 0.3s', filter:'blur(20px)' }} />

      {/* icon + price row */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'0.5rem', marginBottom:'0.75rem' }}>
        <div style={{ width:40, height:40, borderRadius:'0.875rem', display:'flex', alignItems:'center', justifyContent:'center', background:`${dotColor}15`, border:`1.5px solid ${dotColor}28`, flexShrink:0, transform:hovered?'scale(1.08) rotate(3deg)':'scale(1)', transition:'transform 0.3s var(--ease-spring)' }}>
          <ShoppingBag style={{ width:18, height:18, color:dotColor }} strokeWidth={2} />
        </div>
        <div style={{ textAlign:'right' }}>
          <p className="sl-font-display" style={{ fontSize:'1.125rem', fontWeight:400, color:'var(--ink)', lineHeight:1.1, fontStyle:'italic' }}>{formatCurrency(sale.price)}</p>
          <p style={{ fontSize:'0.6875rem', color:'var(--ink-faint)', fontWeight:500, marginTop:'0.1rem' }}>per unit</p>
        </div>
      </div>

      {/* product name */}
      <p className="sl-font-display" style={{ fontSize:'1rem', fontWeight:400, color:'var(--ink)', lineHeight:1.2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontStyle:'italic', marginBottom:'0.2rem' }}>
        {sale.product_name}
      </p>
      <p style={{ fontSize:'0.75rem', color:'var(--ink-faint)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:'0.875rem' }}>
        {sale.brand_type}
      </p>

      {/* bottom row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', borderTop:`1px solid ${dotColor}18`, paddingTop:'0.75rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <span style={{ display:'inline-flex', alignItems:'center', gap:'0.3rem', padding:'0.25rem 0.625rem', borderRadius:'0.5rem', background:`${dotColor}12`, color:dotColor, fontSize:'0.6875rem', fontWeight:700 }}>
            <Package style={{ width:11, height:11 }} strokeWidth={2} />
            Qty {sale.quantity}
          </span>
          <span style={{ fontSize:'0.8125rem', fontWeight:800, color:'var(--ink)' }}>= {formatCurrency(total)}</span>
        </div>
        <div style={{ width:28, height:28, borderRadius:'0.625rem', display:'flex', alignItems:'center', justifyContent:'center', background:`${dotColor}15`, transform:hovered?'translate(2px,-2px)':'translate(0,0)', transition:'transform 0.2s' }}>
          <ArrowUpRight style={{ width:13, height:13, color:dotColor }} />
        </div>
      </div>
    </button>
  );
}

/* ── Empty State ── */
function EmptyState({ onNewSale }) {
  const ripple = useRipple();
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'6rem 2rem', gap:'1.25rem', animation:'sl-fade-up 0.5s var(--ease-expo) both' }}>
      <div style={{ position:'relative' }}>
        <div style={{ width:88, height:88, borderRadius:'1.5rem', background:'var(--surface-raise)', border:'2px dashed var(--border)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <ShoppingBag style={{ width:36, height:36, color:'var(--border-strong)' }} />
        </div>
        <div style={{ position:'absolute', top:-8, right:-8, width:24, height:24, borderRadius:'50%', background:'var(--ink)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Plus style={{ width:12, height:12, color:'var(--accent)' }} strokeWidth={3} />
        </div>
      </div>
      <div style={{ textAlign:'center' }}>
        <p className="sl-font-display" style={{ fontSize:'1.25rem', fontWeight:400, color:'var(--ink)', fontStyle:'italic' }}>No sales yet today</p>
        <p style={{ fontSize:'0.8125rem', color:'var(--ink-faint)', marginTop:'0.375rem' }}>Record your first sale to get started.</p>
      </div>
      <button
        onClick={(e) => { ripple(e); onNewSale(); }}
        className="sl-ripple sl-shine"
        style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.75rem 1.5rem', borderRadius:'0.875rem', background:'var(--ink)', color:'#fff', fontSize:'0.875rem', fontWeight:700, cursor:'pointer', border:'none', boxShadow:'0 4px 16px rgba(0,0,0,0.15)' }}
      >
        <Plus style={{ width:15, height:15, color:'var(--accent)' }} strokeWidth={2.5} />
        Record First Sale
      </button>
    </div>
  );
}

/* ── Action Buttons ── */
function NewSaleBtn({ onClick }) {
  const ripple = useRipple();
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={(e) => { ripple(e); onClick(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="sl-ripple sl-shine"
      style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.6875rem 1.25rem', borderRadius:'0.875rem', fontSize:'0.875rem', fontWeight:700, color:'#fff', cursor:'pointer', background:'var(--ink)', border:`1.5px solid ${hovered?'var(--accent)':'var(--ink)'}`, boxShadow:hovered?'0 8px 24px rgba(0,0,0,0.25)':'0 4px 12px rgba(0,0,0,0.15)', transition:'box-shadow 0.2s, border-color 0.2s, transform 0.2s', transform:hovered?'translateY(-1px)':'translateY(0)', whiteSpace:'nowrap' }}
    >
      <Plus style={{ width:16, height:16, color:'var(--accent)' }} strokeWidth={2.5} />
      <span className="hidden sm:inline">New Sale</span>
    </button>
  );
}

function HistoryBtn({ onClick }) {
  const ripple = useRipple();
  return (
    <button onClick={(e) => { ripple(e); onClick(); }} className="sl-ripple"
      style={{ width:44, height:44, borderRadius:'0.875rem', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', border:'1.5px solid var(--border)', background:'var(--surface-raise)', color:'var(--ink-mid)', cursor:'pointer', transition:'border-color 0.2s, color 0.2s' }}>
      <History style={{ width:16, height:16 }} />
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   RECORD SALE
═══════════════════════════════════════════════════════════════ */
function RecordSale({ onCancel, onComplete }) {
  const { profile }   = useAuth();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({ product_name:'', brand_type:'', quantity:1, price:'' });

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const productSuggestions = ['Cable','Ear Buds','Pouches','Screen Guards','Watches'];
  const brandSuggestions = {
    'Cable':         ['Type C','Micro USB','Lightning','Apple Cable','Fast Charging'],
    'Ear Buds':      ['Realme T10','Boat Airdopes','Noise Buds','OnePlus Buds','Samsung Buds'],
    'Pouches':       ['Vivo T3 Lite','Samsung A Series','Redmi Note Series','Realme Narzo','Universal'],
    'Screen Guards': ['Vivo','Samsung','Redmi','Realme','Universal'],
    'Watches':       ['Noise','Boat','Fire Boltt','Realme','OnePlus'],
  };

  const totalPreview = (parseFloat(formData.price) || 0) * formData.quantity;
  const isReady = formData.product_name && formData.brand_type && formData.price;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await salesService.recordSale(formData, profile?.id);
      toast.success('Sale recorded successfully!');
      onComplete();
    } catch (err) { toast.error(err.message || 'Failed to record sale'); }
    finally { setLoading(false); }
  }

  return (
    <div className="sl-font-body" style={{ backgroundColor:'var(--surface)', minHeight:'100vh', paddingBottom:'6rem' }}>
      <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem', maxWidth:640, margin:'0 auto', padding:'0.25rem' }}>

        {/* Header */}
        <header
          className={cn(mounted && 'sl-section-enter')}
          style={{ background:'linear-gradient(135deg,#0d0d0d 0%,#181818 60%,#0d0d0d 100%)', borderRadius:'1.75rem', padding:'1.75rem', position:'relative', overflow:'hidden', boxShadow:'0 24px 60px -16px rgba(0,0,0,0.45)', animationDelay:'0s' }}
        >
          <div className="sl-blob" style={{ width:240, height:240, background:'var(--accent)', opacity:0.06, top:-50, right:-30 }} />
          <div style={{ position:'absolute', right:28, top:28, width:80, height:80, animation:'sl-spin-slow 20s linear infinite', pointerEvents:'none' }}>
            <div style={{ width:'100%', height:'100%', borderRadius:'50%', border:'1px dashed rgba(249,115,22,0.18)' }} />
          </div>
          <div style={{ position:'absolute', top:0, left:'8%', width:100, height:2, background:'linear-gradient(90deg,var(--accent),transparent)', opacity:0.55 }} />
          <div style={{ position:'absolute', right:49, top:49, pointerEvents:'none' }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent)', opacity:0.65, animation:'sl-orbit 9s linear infinite' }} />
          </div>

          <div style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1rem', flexWrap:'wrap' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
              <BackBtn onClick={onCancel} />
              <div>
                <p style={{ fontSize:'0.625rem', fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:'rgba(255,255,255,0.28)', marginBottom:'0.35rem' }}>Sales</p>
                <h1 className="sl-font-display" style={{ fontSize:'clamp(1.5rem,3.5vw,2.25rem)', fontWeight:400, lineHeight:1.1, color:'rgba(255,255,255,0.94)', fontStyle:'italic' }}>
                  Record <span style={{ color:'var(--accent)' }}>New Sale</span>
                </h1>
              </div>
            </div>
            {totalPreview > 0 && (
              <div style={{ background:'rgba(255,255,255,0.06)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:'1.125rem', padding:'0.75rem 1.25rem', textAlign:'right' }}>
                <p style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(255,255,255,0.28)', marginBottom:'0.2rem' }}>Total</p>
                <p style={{ fontSize:'1.375rem', fontWeight:800, letterSpacing:'-0.03em', color:'var(--accent)', margin:0 }}>{formatCurrency(totalPreview)}</p>
              </div>
            )}
          </div>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

          {/* Product Section */}
          <div style={{ ...panelStyle, animation:'sl-card-in 0.55s var(--ease-expo) 0.1s both' }}>
            <div style={topAccentBar} />
            <SlSectionLabel icon={Tag} label="Product Details" />

            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              {/* Product name */}
              <div style={{ display:'flex', flexDirection:'column', gap:'0.375rem' }}>
                <label className="sl-label">Accessory Type</label>
                <input type="text" required className="sl-input" placeholder="e.g. Cable, Ear Buds, Pouches…"
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value, brand_type:'' })} />
                <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem', marginTop:'0.25rem' }}>
                  {productSuggestions.map(p => (
                    <ChipBtn key={p} label={p} selected={formData.product_name === p}
                      onClick={() => setFormData({ ...formData, product_name: p, brand_type:'' })} />
                  ))}
                </div>
              </div>

              {/* Brand */}
              <div style={{ display:'flex', flexDirection:'column', gap:'0.375rem' }}>
                <label className="sl-label">Brand / Type</label>
                <input type="text" required className="sl-input" placeholder="e.g. Type C, Samsung Buds…"
                  value={formData.brand_type}
                  onChange={(e) => setFormData({ ...formData, brand_type: e.target.value })} />
                {brandSuggestions[formData.product_name] && (
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem', marginTop:'0.25rem' }}>
                    {brandSuggestions[formData.product_name].map(b => (
                      <ChipBtn key={b} label={b} selected={formData.brand_type === b}
                        onClick={() => setFormData({ ...formData, brand_type: b })} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div style={{ ...panelStyle, animation:'sl-card-in 0.55s var(--ease-expo) 0.16s both' }}>
            <div style={topAccentBar} />
            <SlSectionLabel icon={IndianRupee} label="Pricing" />

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              {/* Quantity */}
              <div style={{ display:'flex', flexDirection:'column', gap:'0.375rem' }}>
                <label className="sl-label">Quantity</label>
                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', borderRadius:'0.875rem', border:'1.5px solid var(--border)', background:'var(--surface-raise)', padding:'0.375rem' }}>
                  <QtyBtn icon={Minus} onClick={() => setFormData({ ...formData, quantity: Math.max(1, formData.quantity - 1) })} />
                  <input type="number" min="1"
                    style={{ flex:1, background:'transparent', border:'none', textAlign:'center', fontWeight:800, fontSize:'1.125rem', color:'var(--ink)', outline:'none', fontFamily:"'Geist', system-ui, sans-serif" }}
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })} />
                  <QtyBtn icon={Plus} accent onClick={() => setFormData({ ...formData, quantity: formData.quantity + 1 })} />
                </div>
              </div>

              {/* Price */}
              <div style={{ display:'flex', flexDirection:'column', gap:'0.375rem' }}>
                <label className="sl-label">Unit Price</label>
                <div style={{ position:'relative' }}>
                  <div style={{ position:'absolute', left:'0.875rem', top:'50%', transform:'translateY(-50%)', width:20, height:20, borderRadius:'0.375rem', background:'var(--accent-dim)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <IndianRupee style={{ width:11, height:11, color:'var(--accent)' }} />
                  </div>
                  <input type="number" required min="0" step="0.01" className="sl-input" placeholder="0.00"
                    style={{ paddingLeft:'2.5rem' }}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                </div>
              </div>
            </div>

            {/* Live total */}
            {totalPreview > 0 && (
              <div style={{ marginTop:'1rem', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.875rem 1rem', borderRadius:'0.875rem', background:'var(--accent-dim)', border:'1.5px solid var(--accent-mid)', animation:'sl-card-in 0.4s var(--ease-spring) both' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                  <CheckCircle2 style={{ width:16, height:16, color:'var(--accent)' }} />
                  <span style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--ink-mid)' }}>Total Amount</span>
                </div>
                <p className="sl-font-display" style={{ fontSize:'1.375rem', fontWeight:400, color:'var(--accent)', margin:0, fontStyle:'italic' }}>
                  {formatCurrency(totalPreview)}
                </p>
              </div>
            )}
          </div>

          {/* Submit */}
          <RecordSaleBtn loading={loading} isReady={isReady} />
        </form>
      </div>
    </div>
  );
}

/* ── Chip Button ── */
function ChipBtn({ label, selected, onClick }) {
  const ripple = useRipple();
  return (
    <button type="button" onClick={(e) => { ripple(e); onClick(); }} className="sl-ripple"
      style={{ display:'inline-flex', alignItems:'center', gap:'0.3rem', padding:'0.375rem 0.75rem', borderRadius:'9999px', fontSize:'0.75rem', fontWeight:700, cursor:'pointer', border:`1.5px solid ${selected?'transparent':'var(--border)'}`, background:selected?'var(--ink)':'var(--surface)', color:selected?'#fff':'var(--ink-mid)', transition:'all 0.18s', boxShadow:selected?'0 4px 12px rgba(0,0,0,0.18)':'none' }}>
      {selected && <span style={{ width:5, height:5, borderRadius:'50%', background:'var(--accent)', display:'inline-block' }} />}
      {label}
    </button>
  );
}

/* ── Qty Button ── */
function QtyBtn({ icon: Icon, onClick, accent }) {
  const ripple = useRipple();
  return (
    <button type="button" onClick={(e) => { ripple(e); onClick(); }} className="sl-ripple"
      style={{ width:34, height:34, borderRadius:'0.625rem', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, border:'none', cursor:'pointer', background:accent?'var(--ink)':'var(--surface)', color:accent?'var(--accent)':'var(--ink-mid)', transition:'background 0.2s' }}>
      <Icon style={{ width:15, height:15 }} strokeWidth={2.5} />
    </button>
  );
}

/* ── Record Sale Submit Btn ── */
function RecordSaleBtn({ loading, isReady }) {
  const ripple = useRipple();
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="submit" disabled={loading || !isReady}
      onClick={ripple}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="sl-ripple sl-shine"
      style={{
        width:'100%', padding:'1rem', borderRadius:'1.25rem',
        fontSize:'0.9375rem', fontWeight:700, color: isReady ? '#fff' : 'var(--ink-faint)',
        cursor:(loading||!isReady)?'not-allowed':'pointer',
        background: isReady ? 'var(--ink)' : 'var(--surface)',
        border:`1.5px solid ${isReady ? (hovered?'var(--accent)':'var(--ink)') : 'var(--border)'}`,
        boxShadow: isReady ? (hovered?'0 8px 28px rgba(0,0,0,0.25)':'0 4px 16px rgba(0,0,0,0.15)') : 'none',
        transition:'all 0.2s',
        transform: hovered && isReady ? 'translateY(-1px)' : 'translateY(0)',
        opacity: loading ? 0.6 : 1,
        animation:'sl-card-in 0.55s var(--ease-expo) 0.22s both',
      }}
    >
      <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem' }}>
        {loading ? (
          <><div style={{ width:16, height:16, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', animation:'sl-spin-slow 0.7s linear infinite' }} />Recording…</>
        ) : (
          <><Zap style={{ width:16, height:16, color: isReady?'var(--accent)':'var(--ink-faint)' }} strokeWidth={2.5} />Record Sale</>
        )}
      </span>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SALE DETAILS
═══════════════════════════════════════════════════════════════ */
function SaleDetails({ sale, onBack }) {
  const total   = sale.price * sale.quantity;
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  return (
    <div className="sl-font-body" style={{ backgroundColor:'var(--surface)', minHeight:'100vh', paddingBottom:'5rem' }}>
      <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem', maxWidth:580, margin:'0 auto', padding:'0.25rem' }}>

        {/* Hero */}
        <header
          className={cn(mounted && 'sl-section-enter')}
          style={{ background:'linear-gradient(135deg,#0d0d0d 0%,#181818 60%,#0d0d0d 100%)', borderRadius:'1.75rem', padding:'1.75rem', position:'relative', overflow:'hidden', boxShadow:'0 24px 60px -16px rgba(0,0,0,0.45)', animationDelay:'0s' }}
        >
          <div className="sl-blob" style={{ width:220, height:220, background:'var(--accent)', opacity:0.06, top:-45, right:-25 }} />
          <div style={{ position:'absolute', right:28, top:28, width:80, height:80, animation:'sl-spin-slow 20s linear infinite', pointerEvents:'none' }}>
            <div style={{ width:'100%', height:'100%', borderRadius:'50%', border:'1px dashed rgba(249,115,22,0.18)' }} />
          </div>
          <div style={{ position:'absolute', right:36, top:36, width:52, height:52, animation:'sl-spin-rev 9s linear infinite', pointerEvents:'none' }}>
            <div style={{ width:'100%', height:'100%', borderRadius:'50%', border:'1px solid rgba(249,115,22,0.10)' }} />
          </div>
          <div style={{ position:'absolute', right:49, top:49, pointerEvents:'none' }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent)', opacity:0.65, animation:'sl-orbit 9s linear infinite' }} />
          </div>
          <div style={{ position:'absolute', top:0, left:'8%', width:100, height:2, background:'linear-gradient(90deg,var(--accent),transparent)', opacity:0.55 }} />

          <div style={{ position:'relative', display:'flex', flexWrap:'wrap', alignItems:'flex-end', justifyContent:'space-between', gap:'1.25rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'1rem', minWidth:0 }}>
              <BackBtn onClick={onBack} />
              <div style={{ minWidth:0 }}>
                <p style={{ fontSize:'0.625rem', fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:'rgba(255,255,255,0.28)', marginBottom:'0.35rem' }}>Sale Details</p>
                <h1 className="sl-font-display" style={{ fontSize:'clamp(1.375rem,3vw,2rem)', fontWeight:400, lineHeight:1.1, color:'rgba(255,255,255,0.94)', fontStyle:'italic', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {sale.product_name}
                </h1>
                <p style={{ fontSize:'0.8125rem', color:'rgba(255,255,255,0.35)', marginTop:'0.25rem' }}>{sale.brand_type}</p>
              </div>
            </div>
            <div style={{ background:'rgba(255,255,255,0.06)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:'1.125rem', padding:'0.75rem 1.25rem', textAlign:'right', flexShrink:0 }}>
              <p style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(255,255,255,0.28)', marginBottom:'0.2rem' }}>Unit Price</p>
              <p style={{ fontSize:'1.375rem', fontWeight:800, letterSpacing:'-0.03em', color:'var(--accent)', margin:0 }}>{formatCurrency(sale.price)}</p>
            </div>
          </div>
        </header>

        {/* Detail cards */}
        <div className="sl-stagger" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
          <DetailStatCard label="Quantity"     value={sale.quantity}       icon={Package}    dotColor="#3b82f6" />
          <DetailStatCard label="Total Amount" value={formatCurrency(total)} icon={IndianRupee} dotColor="#f97316" isBig />
        </div>

        {/* Transaction info */}
        <div style={{ ...panelStyle, animation:'sl-card-in 0.55s var(--ease-expo) 0.12s both' }}>
          <div style={topAccentBar} />
          <SlSectionLabel icon={Clock} label="Transaction Info" />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem' }}>
            <div>
              <label className="sl-label">Recorded By</label>
              <p style={{ fontSize:'0.9375rem', fontWeight:700, color:'var(--ink)', margin:0 }}>{sale.profiles?.full_name || 'N/A'}</p>
            </div>
            <div>
              <label className="sl-label">Time</label>
              <p style={{ fontSize:'0.9375rem', fontWeight:700, color:'var(--ink)', margin:0 }}>{formatTime(sale.created_at)}</p>
              <p style={{ fontSize:'0.75rem', color:'var(--ink-faint)', marginTop:'0.2rem' }}>{formatDate(sale.created_at)}</p>
            </div>
          </div>
        </div>

        {/* Total banner */}
        <div
          className="sl-accent-glow"
          style={{ borderRadius:'1.5rem', background:'var(--ink)', padding:'1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between', position:'relative', overflow:'hidden', boxShadow:'0 8px 32px rgba(0,0,0,0.2)', animation:'sl-card-in 0.55s var(--ease-expo) 0.18s both' }}
        >
          <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'var(--accent)', opacity:0.8 }} />
          <div className="sl-blob" style={{ width:140, height:140, background:'var(--accent)', opacity:0.06, top:-40, right:-20 }} />
          <div style={{ position:'relative' }}>
            <p style={{ fontSize:'0.625rem', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)', marginBottom:'0.25rem' }}>Total Revenue</p>
            <p style={{ fontSize:'0.875rem', fontWeight:500, color:'rgba(255,255,255,0.5)', margin:0 }}>
              {sale.quantity} × {formatCurrency(sale.price)}
            </p>
          </div>
          <p className="sl-font-display" style={{ fontSize:'2rem', fontWeight:400, color:'var(--accent)', margin:0, fontStyle:'italic', position:'relative' }}>
            {formatCurrency(total)}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Detail Stat Card ── */
function DetailStatCard({ label, value, icon: Icon, dotColor, isBig }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ borderRadius:'1.25rem', padding:'1.125rem', background:'var(--surface-raise)', border:`1.5px solid ${hovered?dotColor+'50':'var(--border)'}`, position:'relative', overflow:'hidden', transition:'border-color 0.2s, box-shadow 0.2s', boxShadow:hovered?`0 6px 24px ${dotColor}1a`:'0 2px 8px rgba(0,0,0,0.03)', animation:'sl-card-in 0.55s var(--ease-expo) 0.08s both' }}
    >
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:dotColor, transform:hovered?'scaleX(1)':'scaleX(0)', transformOrigin:'left', transition:'transform 0.3s var(--ease-expo)' }} />
      <div style={{ width:32, height:32, borderRadius:'0.625rem', display:'flex', alignItems:'center', justifyContent:'center', background:`${dotColor}15`, border:`1px solid ${dotColor}28`, marginBottom:'0.625rem', transform:hovered?'scale(1.1) rotate(-4deg)':'scale(1)', transition:'transform 0.3s var(--ease-spring)' }}>
        <Icon style={{ width:15, height:15, color:dotColor }} strokeWidth={2} />
      </div>
      <p style={{ fontSize:isBig?'1.25rem':'1.875rem', fontWeight:800, letterSpacing:'-0.03em', lineHeight:1, color:'var(--ink)', margin:0 }}>{value}</p>
      <p style={{ marginTop:'0.375rem', fontSize:'0.6875rem', fontWeight:600, color:'var(--ink-faint)', textTransform:'uppercase', letterSpacing:'0.08em' }}>{label}</p>
    </div>
  );
}
