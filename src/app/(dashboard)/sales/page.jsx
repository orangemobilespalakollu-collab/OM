'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { cn, formatCurrency, formatTime, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

/* ─── Styles (same token system as dashboard) ─── */
const SALES_STYLES = `
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
@keyframes slide-in-right {
  from { opacity: 0; transform: translateX(30px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes scale-in {
  from { opacity: 0; transform: scale(0.92); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes count-in {
  from { opacity: 0; transform: scale(0.5); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes blink {
  0%,100% { opacity: 1; }
  50%      { opacity: 0.3; }
}
@keyframes gradient-shift {
  0%,100% { background-position: 0% 50%; }
  50%      { background-position: 100% 50%; }
}
@keyframes pulse-glow {
  0%,100% { box-shadow: 0 0 0 0 rgba(168,85,247,0.3); }
  50%      { box-shadow: 0 0 0 8px rgba(168,85,247,0); }
}

.sales-slide-up        { animation: slide-up 0.45s ease forwards; }
.sales-slide-right     { animation: slide-in-right 0.4s ease forwards; }
.sales-scale-in        { animation: scale-in 0.35s cubic-bezier(.34,1.56,.64,1) forwards; }
.sales-count-in        { animation: count-in 0.4s cubic-bezier(.34,1.56,.64,1) forwards; }
.sales-float           { animation: float 3s ease-in-out infinite; }
.sales-spin-slow       { animation: spin-slow 8s linear infinite; }
.sales-blink           { animation: blink 2s ease-in-out infinite; }

.sales-shimmer-text {
  background: linear-gradient(90deg, #a855f7, #f97316, #3b82f6, #a855f7);
  background-size: 300% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 4s linear infinite;
}

.sales-mesh-bg {
  background-color: #fafafa;
  background-image:
    radial-gradient(at 10% 10%, rgba(168,85,247,0.09) 0px, transparent 50%),
    radial-gradient(at 85% 5%,  rgba(249,115,22,0.07) 0px, transparent 50%),
    radial-gradient(at 5%  70%, rgba(59,130,246,0.06) 0px, transparent 50%),
    radial-gradient(at 90% 80%, rgba(34,197,94,0.05)  0px, transparent 50%);
}

.sales-glass {
  background: rgba(255,255,255,0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.9);
}

.sales-card-hover {
  transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), box-shadow 0.25s ease, border-color 0.2s;
}
.sales-card-hover:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: 0 20px 40px -10px rgba(0,0,0,0.12);
}

.sales-orb {
  border-radius: 50%;
  filter: blur(40px);
  position: absolute;
  pointer-events: none;
}

.sales-tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  transition: all 0.18s ease;
  cursor: pointer;
}
.sales-tag-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.sales-input {
  width: 100%;
  border-radius: 12px;
  border: 1.5px solid #e5e7eb;
  padding: 10px 14px;
  font-size: 14px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 500;
  color: #111827;
  background: #fff;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
}
.sales-input:focus {
  border-color: #a855f7;
  box-shadow: 0 0 0 3px rgba(168,85,247,0.12);
}
.sales-input::placeholder { color: #9ca3af; }

.sales-font   { font-family: 'DM Sans', sans-serif; }
.display-font { font-family: 'Syne', sans-serif; }

.gradient-purple-card { background: linear-gradient(135deg, #faf5ff, #fff); }
.gradient-orange-card { background: linear-gradient(135deg, #fff7ed, #fff); }
.gradient-blue-card   { background: linear-gradient(135deg, #eff6ff, #fff); }
.gradient-green-card  { background: linear-gradient(135deg, #f0fdf4, #fff); }

.pulse-glow-purple { animation: pulse-glow 2s ease-in-out infinite; }
`;

function SalesStyleInjector() {
  useEffect(() => {
    if (document.getElementById('sales-styles')) return;
    const el = document.createElement('style');
    el.id = 'sales-styles';
    el.textContent = SALES_STYLES;
    document.head.appendChild(el);
  }, []);
  return null;
}

/* ─── Main Page ─── */
export default function SalesPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [view, setView] = useState('list');
  const [sales, setSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Check URL for ?action=new
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('action') === 'new') setView('record');
    }
    fetchTodaySales();
  }, []);

  async function fetchTodaySales() {
    try {
      setLoading(true);
      const data = await salesService.getTodaySales();
      setSales(data);
    } catch (err) {
      console.error('Error fetching sales:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredSales = sales.filter(s =>
    s.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.brand_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = filteredSales.reduce((sum, s) => sum + (s.price * s.quantity), 0);
  const totalItems = filteredSales.reduce((sum, s) => sum + s.quantity, 0);

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
      <div className="sales-mesh-bg sales-font min-h-screen space-y-7 p-1">

        {/* ── Hero Header ── */}
        <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900 p-7 shadow-2xl">
          <div className="sales-orb w-72 h-72 bg-purple-500/20 -top-20 -left-16 sales-float" style={{ animationDelay: '0s' }} />
          <div className="sales-orb w-48 h-48 bg-orange-500/15 -bottom-12 left-1/3 sales-float" style={{ animationDelay: '1.2s' }} />
          <div className="sales-orb w-56 h-56 bg-blue-500/12 -top-8 right-10 sales-float" style={{ animationDelay: '2s' }} />

          {/* decorative rings */}
          <div className="absolute right-6 top-6 h-20 w-20 rounded-full border-2 border-dashed border-white/10 sales-spin-slow" />
          <div className="absolute right-10 top-10 h-12 w-12 rounded-full border border-purple-400/30 sales-spin-slow"
            style={{ animationDirection: 'reverse', animationDuration: '5s' }} />

          {/* grid texture overlay */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '32px 32px' }} />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-orange-500 shadow-lg">
                  <ShoppingBag className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                </div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-white/40">Sales</p>
              </div>
              <h1 className="display-font text-2xl sm:text-3xl font-bold text-white mb-1">
                Today's <span className="sales-shimmer-text">Sales</span>
              </h1>
              <p className="text-sm text-white/45">Track accessories, parts & product sales.</p>
            </div>

            {/* live stat pill */}
            <div className="flex items-center gap-3">
              <div className="sales-glass rounded-2xl px-5 py-3 text-right">
                <p className="text-[9px] font-extrabold uppercase tracking-widest text-gray-500 mb-0.5">Today's Revenue</p>
                <p className="display-font text-2xl font-bold text-gray-900">
                  {formatCurrency(totalRevenue)}
                </p>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-400 sales-blink" />
                  <p className="text-[10px] font-semibold text-gray-500">{filteredSales.length} sale{filteredSales.length !== 1 ? 's' : ''} · {totalItems} items</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ── Quick Summary Chips ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Sales', value: filteredSales.length, icon: ReceiptText, color: '#a855f7', gradClass: 'gradient-purple-card', shadow: 'rgba(168,85,247,0.15)' },
            { label: 'Items Sold',  value: totalItems,           icon: Box,         color: '#f97316', gradClass: 'gradient-orange-card', shadow: 'rgba(249,115,22,0.15)' },
            { label: 'Revenue',     value: formatCurrency(totalRevenue), icon: IndianRupee, color: '#10b981', gradClass: 'gradient-green-card', shadow: 'rgba(16,185,129,0.15)', isCurrency: true },
          ].map((chip, i) => (
            <div key={chip.label}
              className={cn('relative overflow-hidden rounded-2xl border border-white/80 p-4 shadow-md', chip.gradClass, 'sales-slide-up')}
              style={{ boxShadow: `0 4px 20px ${chip.shadow}`, animationDelay: `${i * 0.07}s` }}>
              <div className="absolute -bottom-6 -right-6 h-20 w-20 rounded-full blur-2xl opacity-20" style={{ backgroundColor: chip.color }} />
              <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: `linear-gradient(90deg, ${chip.color}80, ${chip.color}10)` }} />
              <div className="flex h-8 w-8 items-center justify-center rounded-xl mb-3 shadow-sm"
                style={{ background: `${chip.color}18`, border: `1.5px solid ${chip.color}30` }}>
                <chip.icon className="h-4 w-4" style={{ color: chip.color }} strokeWidth={2} />
              </div>
              <p className={cn('font-bold tabular-nums leading-none text-gray-900 sales-count-in', chip.isCurrency ? 'text-lg' : 'text-2xl')}
                style={{ animationDelay: `${i * 0.07 + 0.1}s` }}>
                {chip.value}
              </p>
              <p className="mt-1.5 text-[11px] font-semibold text-gray-500">{chip.label}</p>
            </div>
          ))}
        </div>

        {/* ── Search + Actions ── */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search product or brand…"
              className="sales-input pl-10 pr-4 py-3"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button
            onClick={() => setView('record')}
            className="sales-card-hover flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-lg pulse-glow-purple"
            style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            <span className="hidden sm:inline">New Sale</span>
          </button>

          <button
            onClick={() => router.push('/history?tab=sales')}
            className="sales-card-hover flex items-center justify-center h-11 w-11 rounded-2xl border-2 border-gray-200 bg-white text-gray-500 shadow-sm hover:border-purple-300 hover:text-purple-600 transition-colors"
          >
            <History className="h-4 w-4" />
          </button>
        </div>

        {/* ── Section label ── */}
        <SalesSectionLabel icon={Sparkles} label="Today's Sales" />

        {/* ── Sales Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-36 animate-pulse rounded-2xl bg-gray-100" />
            ))}
          </div>
        ) : filteredSales.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSales.map((sale, i) => (
              <SaleCard
                key={sale.id}
                sale={sale}
                index={i}
                onClick={() => { setSelectedSale(sale); setView('details'); }}
              />
            ))}
          </div>
        ) : (
          <EmptyState onNewSale={() => setView('record')} />
        )}
      </div>
    </>
  );
}

/* ─── Sale Card ─── */
function SaleCard({ sale, index, onClick }) {
  const total = sale.price * sale.quantity;
  // pick a rotating accent
  const accents = [
    { color: '#a855f7', gradClass: 'gradient-purple-card', shadow: 'rgba(168,85,247,0.12)' },
    { color: '#f97316', gradClass: 'gradient-orange-card', shadow: 'rgba(249,115,22,0.12)' },
    { color: '#3b82f6', gradClass: 'gradient-blue-card',   shadow: 'rgba(59,130,246,0.12)' },
    { color: '#10b981', gradClass: 'gradient-green-card',  shadow: 'rgba(16,185,129,0.12)' },
  ];
  const a = accents[index % accents.length];

  return (
    <button
      onClick={onClick}
      className={cn(
        'sales-card-hover group relative overflow-hidden rounded-2xl border border-white/80 p-5 text-left shadow-md w-full sales-slide-up',
        a.gradClass
      )}
      style={{ boxShadow: `0 4px 20px ${a.shadow}`, animationDelay: `${index * 0.06}s` }}
    >
      {/* top accent stripe */}
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${a.color}90, ${a.color}10)` }} />
      {/* left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ background: `linear-gradient(180deg, ${a.color}80, ${a.color}20)` }} />
      {/* ambient glow */}
      <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full blur-2xl opacity-15"
        style={{ backgroundColor: a.color }} />

      <div className="pl-2">
        {/* top row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl shadow-sm shrink-0"
            style={{ background: `${a.color}15`, border: `1.5px solid ${a.color}30` }}>
            <ShoppingBag className="h-4 w-4" style={{ color: a.color }} strokeWidth={2} />
          </div>
          <div className="flex flex-col items-end">
            <p className="display-font text-lg font-bold text-gray-900 tabular-nums leading-tight">
              {formatCurrency(sale.price)}
            </p>
            <p className="text-[10px] font-semibold text-gray-400">per unit</p>
          </div>
        </div>

        {/* product info */}
        <h4 className="display-font text-base font-bold text-gray-900 truncate mb-0.5">{sale.product_name}</h4>
        <p className="text-xs font-medium text-gray-500 truncate mb-4">{sale.brand_type}</p>

        {/* bottom row */}
        <div className="flex items-center justify-between border-t pt-3" style={{ borderColor: `${a.color}20` }}>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold"
              style={{ backgroundColor: `${a.color}15`, color: a.color }}>
              <Package className="h-3 w-3" />
              Qty {sale.quantity}
            </span>
            <span className="text-[11px] font-bold text-gray-700">
              = {formatCurrency(total)}
            </span>
          </div>
          <div className="flex h-7 w-7 items-center justify-center rounded-xl shadow-sm transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            style={{ background: `${a.color}15` }}>
            <ArrowUpRight className="h-3.5 w-3.5" style={{ color: a.color }} />
          </div>
        </div>
      </div>
    </button>
  );
}

/* ─── Empty State ─── */
function EmptyState({ onNewSale }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-5 sales-scale-in">
      <div className="relative">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-100 to-orange-50 border-2 border-dashed border-purple-200">
          <ShoppingBag className="h-10 w-10 text-purple-300" />
        </div>
        <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-gradient-to-br from-orange-400 to-purple-500 flex items-center justify-center shadow-md">
          <Plus className="h-3 w-3 text-white" strokeWidth={3} />
        </div>
      </div>
      <div className="text-center">
        <p className="display-font text-lg font-bold text-gray-800">No sales yet today</p>
        <p className="text-sm text-gray-400 mt-1">Record your first sale to get started.</p>
      </div>
      <button
        onClick={onNewSale}
        className="sales-card-hover flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-white shadow-lg"
        style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
        Record First Sale
      </button>
    </div>
  );
}

/* ─── Record Sale ─── */
function RecordSale({ onCancel, onComplete }) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ product_name: '', brand_type: '', quantity: 1, price: '' });

  const productSuggestions = ['Cable', 'Ear Buds', 'Pouches', 'Screen Guards', 'Watches'];
  const brandSuggestions = {
    'Cable':         ['Type C', 'Micro USB', 'Lightning', 'Apple Cable', 'Fast Charging'],
    'Ear Buds':      ['Realme T10', 'Boat Airdopes', 'Noise Buds', 'OnePlus Buds', 'Samsung Buds'],
    'Pouches':       ['Vivo T3 Lite', 'Samsung A Series', 'Redmi Note Series', 'Realme Narzo', 'Universal'],
    'Screen Guards': ['Vivo', 'Samsung', 'Redmi', 'Realme', 'Universal'],
    'Watches':       ['Noise', 'Boat', 'Fire Boltt', 'Realme', 'OnePlus'],
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
    } catch (err) {
      toast.error(err.message || 'Failed to record sale');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sales-mesh-bg sales-font min-h-screen p-1">
      <div className="max-w-xl mx-auto pb-24">

        {/* ── Page header ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900 p-7 shadow-2xl mb-7">
          <div className="sales-orb w-64 h-64 bg-purple-500/20 -top-16 -left-16 sales-float" />
          <div className="sales-orb w-40 h-40 bg-orange-500/15 -bottom-10 right-10 sales-float" style={{ animationDelay: '1.5s' }} />
          <div className="absolute right-6 top-6 h-20 w-20 rounded-full border-2 border-dashed border-white/10 sales-spin-slow" />

          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-white/40 mb-1">Sales</p>
              <h1 className="display-font text-2xl font-bold text-white">
                Record <span className="sales-shimmer-text">New Sale</span>
              </h1>
              <p className="text-sm text-white/45 mt-1">Fill in the details below.</p>
            </div>
            <button
              onClick={onCancel}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 transition text-white text-sm font-bold"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── Product Section ── */}
          <div className="sales-glass rounded-3xl p-6 shadow-xl border border-white/80 sales-slide-up" style={{ animationDelay: '0.05s' }}>
            <SalesSectionLabel icon={Tag} label="Product Details" />

            {/* Product name */}
            <div className="space-y-2 mb-5">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Accessory Type</label>
              <input
                type="text"
                required
                className="sales-input"
                placeholder="e.g. Cable, Ear Buds, Pouches…"
                value={formData.product_name}
                onChange={(e) => setFormData({ ...formData, product_name: e.target.value, brand_type: '' })}
              />
              <div className="flex flex-wrap gap-2 pt-1">
                {productSuggestions.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData({ ...formData, product_name: p, brand_type: '' })}
                    className="sales-tag-chip"
                    style={
                      formData.product_name === p
                        ? { background: 'linear-gradient(135deg,#a855f7,#7c3aed)', color: '#fff', boxShadow: '0 4px 12px rgba(168,85,247,0.35)' }
                        : { background: '#f3f0ff', color: '#7c3aed', border: '1px solid #e9d5ff' }
                    }
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Brand / Type</label>
              <input
                type="text"
                required
                className="sales-input"
                placeholder="e.g. Type C, Samsung Buds…"
                value={formData.brand_type}
                onChange={(e) => setFormData({ ...formData, brand_type: e.target.value })}
              />
              {brandSuggestions[formData.product_name] && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {brandSuggestions[formData.product_name].map(b => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setFormData({ ...formData, brand_type: b })}
                      className="sales-tag-chip"
                      style={
                        formData.brand_type === b
                          ? { background: 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff', boxShadow: '0 4px 12px rgba(249,115,22,0.35)' }
                          : { background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa' }
                      }
                    >
                      {b}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Pricing Section ── */}
          <div className="sales-glass rounded-3xl p-6 shadow-xl border border-white/80 sales-slide-up" style={{ animationDelay: '0.1s' }}>
            <SalesSectionLabel icon={IndianRupee} label="Pricing" />

            <div className="grid grid-cols-2 gap-4">
              {/* Quantity */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Quantity</label>
                <div className="flex items-center gap-2 rounded-2xl border-2 border-gray-200 bg-white p-1.5 focus-within:border-purple-400 transition-colors">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, quantity: Math.max(1, formData.quantity - 1) })}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <Minus className="h-4 w-4 text-gray-600" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    className="w-full bg-transparent text-center font-bold text-gray-900 text-lg focus:outline-none"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, quantity: formData.quantity + 1 })}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition-transform hover:scale-105"
                    style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)' }}
                  >
                    <Plus className="h-4 w-4" strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Unit Price</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-md bg-purple-100">
                    <IndianRupee className="h-3 w-3 text-purple-600" />
                  </div>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="sales-input pl-10"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Live total preview */}
            {totalPreview > 0 && (
              <div className="mt-4 flex items-center justify-between rounded-2xl p-4 sales-scale-in"
                style={{ background: 'linear-gradient(135deg,rgba(168,85,247,0.08),rgba(249,115,22,0.06))', border: '1.5px solid rgba(168,85,247,0.2)' }}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-semibold text-gray-600">Total Amount</span>
                </div>
                <p className="display-font text-xl font-bold" style={{ color: '#7c3aed' }}>
                  {formatCurrency(totalPreview)}
                </p>
              </div>
            )}
          </div>

          {/* ── Submit ── */}
          <button
            type="submit"
            disabled={loading || !isReady}
            className="sales-card-hover w-full relative overflow-hidden rounded-3xl py-4 text-base font-bold text-white shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed sales-slide-up"
            style={{
              background: isReady
                ? 'linear-gradient(135deg, #a855f7 0%, #7c3aed 50%, #6d28d9 100%)'
                : '#d1d5db',
              animationDelay: '0.15s',
            }}
          >
            {/* shimmer sweep on ready */}
            {isReady && !loading && (
              <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                style={{ animation: 'shimmer 2.5s linear infinite', backgroundSize: '200% auto' }} />
            )}
            <span className="relative flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Recording Sale…
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" strokeWidth={2.5} />
                  Record Sale
                </>
              )}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─── Sale Details ─── */
function SaleDetails({ sale, onBack }) {
  const total = sale.price * sale.quantity;

  return (
    <div className="sales-mesh-bg sales-font min-h-screen p-1">
      <div className="max-w-xl mx-auto pb-20">

        {/* hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900 p-7 shadow-2xl mb-7 sales-scale-in">
          <div className="sales-orb w-56 h-56 bg-purple-500/20 -top-14 -left-14 sales-float" />
          <div className="sales-orb w-40 h-40 bg-orange-500/15 -bottom-10 right-8 sales-float" style={{ animationDelay: '1s' }} />
          <div className="absolute right-6 top-6 h-20 w-20 rounded-full border-2 border-dashed border-white/10 sales-spin-slow" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={onBack}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition"
                >
                  <ChevronRight className="h-4 w-4 text-white rotate-180" />
                </button>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-white/40">Sale Details</p>
              </div>
              <h1 className="display-font text-2xl font-bold text-white truncate">{sale.product_name}</h1>
              <p className="text-sm text-white/50 mt-0.5">{sale.brand_type}</p>
            </div>
            <div className="sales-glass rounded-2xl px-4 py-3 text-right shrink-0">
              <p className="text-[9px] font-extrabold uppercase tracking-widest text-gray-500">Unit Price</p>
              <p className="display-font text-xl font-bold text-gray-900">{formatCurrency(sale.price)}</p>
            </div>
          </div>
        </div>

        {/* details grid */}
        <div className="space-y-4">
          {/* top cards */}
          <div className="grid grid-cols-2 gap-4">
            <DetailCard label="Quantity" value={sale.quantity} icon={Package} color="#a855f7" gradClass="gradient-purple-card" />
            <DetailCard label="Total Amount" value={formatCurrency(total)} icon={IndianRupee} color="#10b981" gradClass="gradient-green-card" isBig />
          </div>

          {/* recorded by */}
          <div className="sales-glass rounded-3xl p-5 shadow-xl border border-white/80 sales-slide-up" style={{ animationDelay: '0.05s' }}>
            <SalesSectionLabel icon={Clock} label="Transaction Info" />
            <div className="grid grid-cols-2 gap-5 mt-2">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-1">Recorded By</p>
                <p className="text-sm font-bold text-gray-900">{sale.profiles?.full_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-1">Time</p>
                <p className="text-sm font-bold text-gray-900">
                  {formatTime(sale.created_at)}
                </p>
                <p className="text-xs text-gray-400">
                  {formatDate(sale.created_at)}
                </p>
              </div>
            </div>
          </div>

          {/* total banner */}
          <div className="relative overflow-hidden rounded-3xl p-6 shadow-xl sales-slide-up"
            style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed,#6d28d9)', animationDelay: '0.1s' }}>
            <div className="sales-orb w-32 h-32 bg-white/10 -top-8 -right-8" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/60 mb-0.5">Total Revenue</p>
                <p className="text-sm font-semibold text-white/80">{sale.quantity} × {formatCurrency(sale.price)}</p>
              </div>
              <div className="text-right">
                <p className="display-font text-3xl font-bold text-white">{formatCurrency(total)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Detail Card ─── */
function DetailCard({ label, value, icon: Icon, color, gradClass, isBig }) {
  return (
    <div className={cn('relative overflow-hidden rounded-2xl border border-white/80 p-5 shadow-md sales-slide-up', gradClass)}>
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${color}80, ${color}10)` }} />
      <div className="flex h-8 w-8 items-center justify-center rounded-xl mb-3"
        style={{ background: `${color}18`, border: `1.5px solid ${color}30` }}>
        <Icon className="h-4 w-4" style={{ color }} strokeWidth={2} />
      </div>
      <p className={cn('font-bold tabular-nums text-gray-900 leading-tight', isBig ? 'text-xl' : 'text-2xl')}>{value}</p>
      <p className="mt-1 text-[11px] font-semibold text-gray-500">{label}</p>
    </div>
  );
}

/* ─── Section Label (same as dashboard) ─── */
function SalesSectionLabel({ icon: Icon, label }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-purple-400 to-orange-500 shadow-sm">
        <Icon className="h-3 w-3 text-white" strokeWidth={2.5} />
      </div>
      <h3 className="text-sm font-semibold text-gray-700">{label}</h3>
      <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
    </div>
  );
}
