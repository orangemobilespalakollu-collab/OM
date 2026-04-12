'use client';

import { useState, useEffect } from 'react';
import { reportService } from '@/services/reportService';
import { useAuth } from '@/components/AuthProvider';
import {
  TrendingUp,
  Wrench,
  ShoppingBag,
  IndianRupee,
  Lock,
  TrendingDown,
  DownloadCloud,
  XCircle,
  BarChart3,
  Sparkles,
  FileDown,
  Bot,
  CalendarRange,
  Activity,
  Zap,
  ArrowUpRight,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { cn, formatCurrency, formatDate, formatNumber } from '@/lib/utils';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import Link from 'next/link';
import { MetricDetailsDialog } from '@/components/MetricDetailsDialog';

/* ─── Styles (matching dashboard) ─── */
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
@keyframes pulse-ring {
  0%   { transform: scale(0.8); opacity: 0.8; }
  70%  { transform: scale(1.6); opacity: 0; }
  100% { transform: scale(1.6); opacity: 0; }
}

.rp-animate-slide-up  { animation: slide-up 0.5s ease forwards; }
.rp-animate-count-in  { animation: count-in 0.4s cubic-bezier(.34,1.56,.64,1) forwards; }
.rp-animate-float     { animation: float 3s ease-in-out infinite; }
.rp-animate-spin-slow { animation: spin-slow 8s linear infinite; }
.rp-animate-blink     { animation: blink 2s ease-in-out infinite; }

.rp-shimmer-text {
  background: linear-gradient(90deg, #f97316, #a855f7, #3b82f6, #f97316);
  background-size: 300% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 4s linear infinite;
}

.rp-glass {
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.9);
}

.rp-mesh-bg {
  background-color: #fafafa;
  background-image:
    radial-gradient(at 20% 10%, rgba(249,115,22,0.08) 0px, transparent 50%),
    radial-gradient(at 80% 0%,  rgba(168,85,247,0.07) 0px, transparent 50%),
    radial-gradient(at 0%  60%, rgba(59,130,246,0.06) 0px, transparent 50%),
    radial-gradient(at 90% 80%, rgba(34,197,94,0.05)  0px, transparent 50%);
}

.rp-card-hover {
  transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), box-shadow 0.25s ease, border-color 0.2s;
}
.rp-card-hover:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: 0 20px 40px -10px rgba(0,0,0,0.12);
}

.rp-orb {
  border-radius: 50%;
  filter: blur(40px);
  position: absolute;
  pointer-events: none;
}

.rp-dashboard-font { font-family: 'DM Sans', sans-serif; }
.rp-display-font   { font-family: 'Syne', sans-serif; }

.gradient-orange { background: linear-gradient(135deg, #fff7ed, #fff); }
.gradient-purple { background: linear-gradient(135deg, #faf5ff, #fff); }
.gradient-blue   { background: linear-gradient(135deg, #eff6ff, #fff); }
.gradient-green  { background: linear-gradient(135deg, #f0fdf4, #fff); }
.gradient-cyan   { background: linear-gradient(135deg, #ecfeff, #fff); }
.gradient-amber  { background: linear-gradient(135deg, #fffbeb, #fff); }
.gradient-red    { background: linear-gradient(135deg, #fef2f2, #fff); }
.gradient-emerald{ background: linear-gradient(135deg, #ecfdf5, #fff); }

.rp-chart-grid line { stroke: #f1f5f9; }

/* AI result formatting */
.ai-result-content strong { font-weight: 700; color: #111827; }
.ai-result-content em     { font-style: italic; color: #1f2937; }
`;

function StyleInjector() {
  useEffect(() => {
    if (document.getElementById('reports-styles')) return;
    const el = document.createElement('style');
    el.id = 'reports-styles';
    el.textContent = STYLES;
    document.head.appendChild(el);
  }, []);
  return null;
}

/* ─── Section Label (matches dashboard) ─── */
function SectionLabel({ icon: Icon, label }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-orange-400 to-purple-500 shadow-sm">
        <Icon className="h-3 w-3 text-white" strokeWidth={2.5} />
      </div>
      <h3 className="rp-dashboard-font text-sm font-semibold text-gray-700">{label}</h3>
      <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
    </div>
  );
}

/* ─── Main Page ─── */
export default function ReportsPage() {
  const { profile } = useAuth();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [aiMode, setAiMode] = useState('sales');
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [data, setData] = useState({
    summary: {
      totalServices: 0,
      completedServices: 0,
      returnedServices: 0,
      notRepairableServices: 0,
      estimatedAmount: 0,
      finalAmount: 0,
      totalSales: 0,
      overallRevenue: 0,
      gapInRevenue: 0,
    },
    services: [],
    sales: [],
  });

  /* ── column definitions (unchanged) ── */
  const serviceExportColumns = [
    { key: 'ticket_number', label: 'Ticket Number' },
    { key: 'customer_name', label: 'Customer Name' },
    { key: 'customer_mobile', label: 'Customer Mobile' },
    { key: 'customer_address', label: 'Customer Address' },
    { key: 'device_brand', label: 'Device Brand' },
    { key: 'device_model', label: 'Device Model' },
    { key: 'issue_type', label: 'Issue Type' },
    { key: 'issue_description', label: 'Issue Description' },
    { key: 'estimated_cost', label: 'Estimated Cost' },
    { key: 'final_amount', label: 'Final Amount' },
    { key: 'status', label: 'Status' },
    { key: 'registered_by', label: 'Registered By' },
    { key: 'returned_by', label: 'Returned By' },
    { key: 'created_at', label: 'Created At' },
    { key: 'returned_at', label: 'Returned At' },
  ];
  const salesExportColumns = [
    { key: 'product_name', label: 'Product Name' },
    { key: 'brand_type', label: 'Brand Type' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'price', label: 'Price' },
    { key: 'total', label: 'Total' },
    { key: 'recorded_by', label: 'Recorded By' },
    { key: 'created_at', label: 'Created At' },
  ];
  const servicePdfColumns = [
    { key: 'ticket_number', label: 'Ticket' },
    { key: 'customer_name', label: 'Customer' },
    { key: 'customer_mobile', label: 'Mobile' },
    { key: 'device_brand', label: 'Brand' },
    { key: 'device_model', label: 'Model' },
    { key: 'issue_type', label: 'Issue' },
    { key: 'estimated_cost', label: 'Est Cost' },
    { key: 'final_amount', label: 'Final' },
    { key: 'status', label: 'Status' },
    { key: 'created_at', label: 'Date' },
  ];
  const salesPdfColumns = [
    { key: 'product_name', label: 'Product' },
    { key: 'brand_type', label: 'Brand' },
    { key: 'quantity', label: 'Qty' },
    { key: 'price', label: 'Price' },
    { key: 'total', label: 'Total' },
    { key: 'created_at', label: 'Date' },
  ];

  useEffect(() => {
    if (profile?.role === 'admin' || profile?.role === 'owner') fetchReportData();
  }, [startDate, endDate, profile]);

  async function fetchReportData() {
    try {
      setLoading(true);
      const reportData = await reportService.getReportData(startDate, endDate);
      setData(reportData);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  }

  /* ── export helpers (unchanged logic) ── */
  function csvEscape(value) {
    if (value === null || value === undefined) return '';
    return `"${String(value).replace(/"/g, '""')}"`;
  }

  function downloadCsv(records, columns, fileName, title, timeframe) {
    if (!records?.length) return;
    const headers = columns.map(c => csvEscape(c.label));
    const rows = records.map(r => columns.map(c => csvEscape(r[c.key])).join(','));
    const csv = [csvEscape(title), csvEscape(timeframe), '', headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${fileName}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  function downloadPdf(records, columns, fileName, title, timeframe) {
    if (!records?.length) return;
    const doc = new jsPDF({ orientation: 'landscape' });
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    const m = 12;
    doc.setLineWidth(0.8); doc.setDrawColor(0);
    doc.rect(m / 2, m / 2, pw - m, ph - m);
    doc.setFontSize(18); doc.setFont('helvetica', 'bold');
    doc.text('Orange Mobiles', pw / 2, 18, { align: 'center' });
    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    doc.text(timeframe, pw / 2, 26, { align: 'center' });
    doc.setFontSize(12);
    doc.text(title, pw / 2, 34, { align: 'center' });
    autoTable(doc, {
      startY: 40, margin: { left: m, right: m, top: m },
      head: [columns.map(c => c.label)],
      body: records.map(r => columns.map(c => r[c.key] == null ? '' : String(r[c.key]))),
      styles: { fontSize: 7, overflow: 'linebreak', cellPadding: { top: 3, right: 2, bottom: 3, left: 2 } },
      headStyles: { fillColor: [249, 115, 22], textColor: 255, halign: 'left' },
      theme: 'grid',
    });
    doc.save(`${fileName}.pdf`);
  }

  function getServiceExportRows() {
    return data.services.map(s => ({
      ticket_number: s.ticket_number || '',
      customer_name: s.customer_name || '',
      customer_mobile: s.customer_mobile || '',
      customer_address: s.customer_address || '',
      device_brand: s.device_brand || '',
      device_model: s.device_model || '',
      issue_type: s.issue_type || '',
      issue_description: s.issue_description || '',
      estimated_cost: s.estimated_cost ?? '',
      final_amount: s.final_amount ?? '',
      status: s.status || '',
      registered_by: s.registered_by_name || s.profiles?.full_name || s.registered_by || '',
      returned_by: s.returned_by_name || s.returned_by_profile?.full_name || s.returned_by || '',
      created_at: s.created_at ? formatDate(s.created_at) : '',
      returned_at: s.returned_at ? formatDate(s.returned_at) : '',
    }));
  }

  function getSalesExportRows() {
    return data.sales.map(s => ({
      product_name: s.product_name || '',
      brand_type: s.brand_type || '',
      quantity: s.quantity ?? '',
      price: s.price ?? '',
      total: s.price && s.quantity ? s.price * s.quantity : '',
      recorded_by: s.recorded_by_name || s.profiles?.full_name || s.recorded_by || '',
      created_at: s.created_at ? formatDate(s.created_at) : '',
    }));
  }

  function handleExport(type, format) {
    const rows = type === 'sales' ? getSalesExportRows() : getServiceExportRows();
    const columns = type === 'sales'
      ? (format === 'pdf' ? salesPdfColumns : salesExportColumns)
      : (format === 'pdf' ? servicePdfColumns : serviceExportColumns);
    if (!rows?.length) return;
    const range = startDate && endDate ? `${startDate}_to_${endDate}` : 'till_now';
    const title = `${type === 'sales' ? 'Sales' : 'Service'} Report`;
    const timeframe = startDate && endDate ? `Time Frame: ${startDate} to ${endDate}` : 'Time Frame: Till Now';
    format === 'csv'
      ? downloadCsv(rows, columns, `${type}_${range}`, title, timeframe)
      : downloadPdf(rows, columns, `${type}_${range}`, title, timeframe);
  }

  async function requestAiAnalysis(mode) {
    setAiMode(mode);
    setAiResult('');
    setAiError('');
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, startDate, endDate }),
      });
      const result = await res.json();
      if (!res.ok || result.error) throw new Error(result.error || 'AI analysis request failed.');
      setAiResult(result.summary || 'No analysis was returned.');
    } catch (err) {
      setAiError(err.message || 'Failed to generate AI analysis.');
    } finally {
      setAiLoading(false);
    }
  }

  /* ── Access Denied ── */
  if (profile?.role !== 'admin' && profile?.role !== 'owner') {
    return (
      <>
        <StyleInjector />
        <div className="rp-mesh-bg rp-dashboard-font flex min-h-[500px] flex-col items-center justify-center gap-5 rounded-3xl p-8 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-red-400 to-red-600 shadow-2xl shadow-red-200">
            <Lock className="h-9 w-9 text-white" />
          </div>
          <div>
            <h2 className="rp-display-font text-2xl font-bold text-gray-900">Access Denied</h2>
            <p className="mt-1 text-sm text-gray-500">Only administrators can view analytics reports.</p>
          </div>
        </div>
      </>
    );
  }

  if (loading) return <ReportsSkeleton />;

  const dateLabel = startDate && endDate
    ? `${formatDate(startDate)} → ${formatDate(endDate)}`
    : 'All time';

  return (
    <>
      <StyleInjector />
      <div className="rp-mesh-bg rp-dashboard-font min-h-screen space-y-8 p-1">

        {/* ── Hero Header ── */}
        <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-7 shadow-2xl">
          <div className="rp-orb w-64 h-64 bg-orange-500/20 -top-16 -left-16 rp-animate-float" style={{ animationDelay: '0s' }} />
          <div className="rp-orb w-48 h-48 bg-purple-500/20 -bottom-12 left-1/3 rp-animate-float" style={{ animationDelay: '1s' }} />
          <div className="rp-orb w-56 h-56 bg-blue-500/15 -top-8 right-10 rp-animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute right-6 top-6 h-20 w-20 rounded-full border-2 border-dashed border-white/10 rp-animate-spin-slow" />
          <div className="absolute right-10 top-10 h-12 w-12 rounded-full border border-orange-400/30 rp-animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '5s' }} />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40 mb-1">Analytics & Reports</p>
              <h1 className="rp-display-font text-2xl sm:text-3xl font-bold text-white mb-1">
                <span className="rp-shimmer-text">Business Intelligence</span> 📊
              </h1>
              <p className="text-sm text-white/50">Deep-dive into your shop's performance data.</p>
            </div>
            {/* Live date badge */}
            <div className="flex items-center gap-3">
              <div className="rp-glass rounded-2xl px-5 py-3 text-right">
                <p className="rp-display-font text-sm font-bold text-gray-900 truncate max-w-[180px]">{dateLabel}</p>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-400 rp-animate-blink" />
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Range</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ── Date Filter + Export ── */}
        <section>
          <SectionLabel icon={CalendarRange} label="Date Range & Export" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

            {/* From date */}
            <div
              className="relative flex items-center gap-4 rounded-2xl border-2 p-4 shadow-sm"
              style={{ borderColor: '#bfdbfe', backgroundColor: '#eff6ff' }}
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-blue-500" />
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: '#3b82f620', border: '1.5px solid #3b82f640' }}>
                <CalendarRange className="h-5 w-5 text-blue-500" strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-blue-500">From</label>
                <input
                  type="date"
                  className="mt-0.5 w-full bg-transparent text-sm font-semibold text-gray-900 focus:outline-none"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
              </div>
            </div>

            {/* To date */}
            <div
              className="relative flex items-center gap-4 rounded-2xl border-2 p-4 shadow-sm"
              style={{ borderColor: '#e9d5ff', backgroundColor: '#faf5ff' }}
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-purple-500" />
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: '#a855f720', border: '1.5px solid #a855f740' }}>
                <CalendarRange className="h-5 w-5 text-purple-500" strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-purple-500">To</label>
                <input
                  type="date"
                  className="mt-0.5 w-full bg-transparent text-sm font-semibold text-gray-900 focus:outline-none"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Export button */}
            <Dialog>
              <DialogTrigger asChild>
                <button
                  className="rp-card-hover group relative flex items-center gap-4 rounded-2xl border-2 p-4 text-left shadow-sm transition-all"
                  style={{ borderColor: '#fed7aa', backgroundColor: '#fff7ed' }}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-orange-500" />
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110 group-hover:rotate-3"
                    style={{ backgroundColor: '#f9731620', border: '1.5px solid #f9731640' }}>
                    <FileDown className="h-5 w-5 text-orange-500" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">Export Reports</p>
                    <p className="text-xs mt-0.5 font-medium text-orange-500/80">Download CSV or PDF</p>
                  </div>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-sm"
                    style={{ backgroundColor: '#f9731615', border: '1px solid #f9731630' }}>
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-orange-500" />
                  </div>
                </button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl border-0 shadow-2xl overflow-hidden p-0 sm:max-w-md">
                {/* modal header */}
                <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 px-6 py-5">
                  <div className="rp-orb w-32 h-32 bg-orange-500/20 -top-8 -right-8" />
                  <div className="rp-orb w-24 h-24 bg-purple-500/20 -bottom-8 left-4" />
                  <div className="relative">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/40 mb-1">Download</p>
                    <DialogTitle className="rp-display-font text-lg font-bold text-white">Export Reports</DialogTitle>
                    <DialogDescription className="text-white/50 text-xs mt-0.5">Choose format for services or sales data.</DialogDescription>
                  </div>
                </div>
                <div className="grid gap-3 p-5 bg-white">
                  {[
                    { label: 'Service Report — CSV', type: 'services', format: 'csv', color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
                    { label: 'Service Report — PDF', type: 'services', format: 'pdf', color: '#f97316', bg: '#fff7ed', border: '#fed7aa' },
                    { label: 'Sales Report — CSV', type: 'sales', format: 'csv', color: '#a855f7', bg: '#faf5ff', border: '#e9d5ff' },
                    { label: 'Sales Report — PDF', type: 'sales', format: 'pdf', color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0' },
                  ].map(btn => (
                    <DialogClose key={btn.label} asChild>
                      <button
                        onClick={() => handleExport(btn.type, btn.format)}
                        className="rp-card-hover flex items-center justify-between rounded-2xl border-2 px-5 py-3.5 text-left text-sm font-semibold transition-all"
                        style={{ borderColor: btn.border, backgroundColor: btn.bg, color: btn.color }}
                      >
                        <span>{btn.label}</span>
                        <FileDown className="h-4 w-4 opacity-70" />
                      </button>
                    </DialogClose>
                  ))}
                </div>
                <div className="px-5 pb-5 bg-white">
                  <DialogClose asChild>
                    <Button variant="ghost" className="w-full rounded-2xl border border-gray-100">Close</Button>
                  </DialogClose>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </section>

        {/* ── Revenue Overview ── */}
        <section>
          <SectionLabel icon={IndianRupee} label="Revenue Overview" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Link href="/history?tab=sales" className="block">
              <RevenueCard
                title="Sales Revenue"
                value={formatCurrency(data.summary.totalSales)}
                icon={ShoppingBag}
                color="#a855f7"
                gradClass="gradient-purple"
                shadowColor="rgba(168,85,247,0.2)"
              />
            </Link>
            <Link href="/history?tab=services" className="block">
              <RevenueCard
                title="Services Revenue"
                value={formatCurrency(data.summary.finalAmount)}
                icon={Wrench}
                color="#3b82f6"
                gradClass="gradient-blue"
                shadowColor="rgba(59,130,246,0.2)"
              />
            </Link>
            <RevenueCard
              title="Overall Revenue"
              value={formatCurrency(data.summary.overallRevenue)}
              icon={IndianRupee}
              color="#f97316"
              gradClass="gradient-orange"
              shadowColor="rgba(249,115,22,0.2)"
              highlight
            />
          </div>
        </section>

        {/* ── Service Metrics ── */}
        <section>
          <SectionLabel icon={Activity} label="Service Metrics" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MetricDetailsDialog title="Total Services" dataList={data.services}>
              <MetricCard
                title="Total Services"
                count={data.summary.totalServices}
                icon={Wrench}
                color="#3b82f6"
                gradClass="gradient-blue"
                shadowColor="rgba(59,130,246,0.2)"
              />
            </MetricDetailsDialog>
            <MetricDetailsDialog title="Returned Services" dataList={data.services.filter(s => s.status === 'Returned')}>
              <MetricCard
                title="Returned"
                count={data.summary.returnedServices}
                icon={TrendingUp}
                color="#10b981"
                gradClass="gradient-emerald"
                shadowColor="rgba(16,185,129,0.2)"
              />
            </MetricDetailsDialog>
            <MetricDetailsDialog title="Not Repairable" dataList={data.services.filter(s => s.was_not_repairable)}>
              <MetricCard
                title="Not Repairable"
                count={data.summary.notRepairableServices}
                icon={XCircle}
                color="#ef4444"
                gradClass="gradient-red"
                shadowColor="rgba(239,68,68,0.2)"
              />
            </MetricDetailsDialog>
            <MetricDetailsDialog
              title="Gap in Revenue"
              dataList={data.services.filter(s => s.status === 'Returned' && (s.estimated_cost || 0) !== (s.final_amount || 0))}
            >
              <MetricCard
                title="Revenue Gap"
                count={formatCurrency(data.summary.gapInRevenue)}
                icon={TrendingDown}
                color="#f59e0b"
                gradClass="gradient-amber"
                shadowColor="rgba(245,158,11,0.2)"
                isCurrency
              />
            </MetricDetailsDialog>
          </div>
        </section>

        {/* ── Bottom Grid: Chart + AI ── */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">

          {/* Revenue Trend Chart */}
          <section className="rp-glass rounded-3xl p-6 shadow-xl overflow-hidden relative lg:col-span-3">
            <div className="rp-orb w-40 h-40 bg-orange-400/10 -top-10 -right-10" />
            <div className="rp-orb w-32 h-32 bg-blue-400/10 -bottom-8 -left-8" />

            <div className="relative mb-5 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-purple-500 shadow-md">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Revenue Trend</h3>
                <p className="text-[11px] text-gray-400">Daily revenue across sales & services</p>
              </div>
            </div>

            <RevenueChart
              sales={data.sales}
              services={data.services}
              startDate={startDate}
              endDate={endDate}
            />
          </section>

          {/* AI Analysis */}
          <section className="rp-glass rounded-3xl p-6 shadow-xl overflow-hidden relative lg:col-span-2">
            <div className="rp-orb w-40 h-40 bg-purple-400/10 -top-10 -right-10" />

            <div className="relative mb-5 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-blue-500 shadow-md">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">AI Analysis</h3>
                <p className="text-[11px] text-gray-400">Powered insights from your data</p>
              </div>
            </div>

            {/* Mode buttons */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                { key: 'sales', color: '#f97316', bg: '#fff7ed', border: '#fed7aa' },
                { key: 'service', color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
                { key: 'feedback', color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0' },
                { key: 'struggles', color: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
              ].map(m => (
                <button
                  key={m.key}
                  onClick={() => requestAiAnalysis(m.key)}
                  disabled={aiLoading}
                  className="rp-card-hover rounded-2xl border-2 py-2.5 text-xs font-bold uppercase tracking-wide transition-all disabled:opacity-50"
                  style={{
                    borderColor: aiMode === m.key ? m.color : m.border,
                    backgroundColor: aiMode === m.key ? m.bg : '#fff',
                    color: aiMode === m.key ? m.color : '#6b7280',
                  }}
                >
                  {m.key}
                </button>
              ))}
            </div>

            {/* Open full AI dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <button className="rp-card-hover w-full flex items-center justify-between gap-2 rounded-2xl border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 px-4 py-3 text-left mb-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    <span className="text-xs font-semibold text-purple-700">Open Full AI Analysis</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-purple-400" />
                </button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl border-0 shadow-2xl overflow-hidden p-0 max-h-[90vh] sm:max-w-3xl">
                <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 px-6 py-5">
                  <div className="rp-orb w-32 h-32 bg-purple-500/20 -top-8 -right-8" />
                  <div className="rp-orb w-24 h-24 bg-orange-500/20 -bottom-8 left-4" />
                  <div className="relative">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/40 mb-1">Powered by AI</p>
                    <DialogTitle className="rp-display-font text-lg font-bold text-white">AI Analysis</DialogTitle>
                    <DialogDescription className="text-white/50 text-xs mt-0.5">Select a mode to analyze your business data.</DialogDescription>
                  </div>
                </div>
                <div className="overflow-y-auto bg-white p-5 space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { key: 'sales', color: '#f97316', bg: '#fff7ed', border: '#fed7aa' },
                      { key: 'service', color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
                      { key: 'feedback', color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0' },
                      { key: 'struggles', color: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
                    ].map(m => (
                      <button
                        key={m.key}
                        onClick={() => requestAiAnalysis(m.key)}
                        disabled={aiLoading}
                        className="rp-card-hover rounded-2xl border-2 py-3 text-sm font-bold uppercase tracking-wide transition-all disabled:opacity-50"
                        style={{
                          borderColor: aiMode === m.key ? m.color : m.border,
                          backgroundColor: aiMode === m.key ? m.bg : '#fafafa',
                          color: aiMode === m.key ? m.color : '#6b7280',
                        }}
                      >
                        {m.key.charAt(0).toUpperCase() + m.key.slice(1)}
                      </button>
                    ))}
                  </div>

                  {/* AI result area */}
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 min-h-[200px]">
                    {aiLoading && (
                      <div className="flex flex-col items-center justify-center h-40 gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-400 to-blue-500 shadow-md rp-animate-spin-slow">
                          <Bot className="h-6 w-6 text-white" />
                        </div>
                        <p className="text-sm font-semibold text-gray-500">Generating analysis…</p>
                      </div>
                    )}
                    {aiError && (
                      <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
                        <AlertCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
                        <p className="text-sm text-red-700">{aiError}</p>
                      </div>
                    )}
                    {!aiLoading && !aiError && !aiResult && (
                      <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
                        <Bot className="h-8 w-8 text-gray-300" />
                        <p className="text-sm font-semibold text-gray-400">Select a mode above to load insights</p>
                      </div>
                    )}
                    {!aiLoading && !aiError && aiResult && (
                      <div className="space-y-4">
                        <p className="rp-display-font text-base font-bold text-gray-900">
                          {aiMode.charAt(0).toUpperCase() + aiMode.slice(1)} Analysis
                        </p>
                        {typeof aiResult === 'object' ? (
                          <>
                            {aiResult.overview && (
                              <p className="text-sm text-gray-700 leading-relaxed ai-result-content">
                                {formatHighlight(aiResult.overview)}
                              </p>
                            )}
                            {aiResult.positives?.length > 0 && (
                              <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
                                <p className="text-xs font-bold uppercase tracking-widest text-green-600 mb-2">Highlights</p>
                                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                                  {aiResult.positives.map((t, i) => <li key={i} className="ai-result-content">{formatHighlight(t)}</li>)}
                                </ul>
                              </div>
                            )}
                            {aiResult.improvements?.length > 0 && (
                              <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
                                <p className="text-xs font-bold uppercase tracking-widest text-orange-600 mb-2">Improvements</p>
                                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                                  {aiResult.improvements.map((t, i) => <li key={i} className="ai-result-content">{formatHighlight(t)}</li>)}
                                </ul>
                              </div>
                            )}
                            {aiResult.recommendations?.length > 0 && (
                              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                                <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">Recommendations</p>
                                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                                  {aiResult.recommendations.map((t, i) => <li key={i} className="ai-result-content">{formatHighlight(t)}</li>)}
                                </ul>
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line ai-result-content">
                            {String(aiResult)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="px-5 pb-5 bg-white border-t border-gray-100">
                  <DialogClose asChild>
                    <Button variant="ghost" className="w-full rounded-2xl border border-gray-100 mt-3">Close</Button>
                  </DialogClose>
                </div>
              </DialogContent>
            </Dialog>

            {/* Inline AI preview result */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 min-h-[100px]">
              {aiLoading && (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
                  <p className="text-xs font-semibold text-gray-400">Analyzing…</p>
                </div>
              )}
              {aiError && <p className="text-xs text-red-500">{aiError}</p>}
              {!aiLoading && !aiError && !aiResult && (
                <p className="text-xs text-gray-400 text-center mt-4">Choose a mode above to see a quick preview here.</p>
              )}
              {!aiLoading && !aiError && aiResult && (
                <p className="text-xs text-gray-700 leading-relaxed line-clamp-5 ai-result-content">
                  {typeof aiResult === 'object' ? aiResult.overview || 'Analysis ready.' : String(aiResult)}
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

/* ─── Revenue Card (matches PriorityCard style) ─── */
function RevenueCard({ title, value, icon: Icon, color, gradClass, shadowColor, highlight }) {
  return (
    <div
      className={cn('rp-card-hover group relative overflow-hidden rounded-2xl border border-white/80 p-5 text-left shadow-md cursor-pointer', gradClass)}
      style={{ boxShadow: `0 4px 20px ${shadowColor}` }}
    >
      <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full blur-2xl opacity-20" style={{ backgroundColor: color }} />
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: `linear-gradient(90deg, ${color}80, ${color}20)` }} />

      <div className="flex items-center justify-between mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3"
          style={{ background: `${color}15` }}>
          <Icon className="h-5 w-5" style={{ color }} strokeWidth={2} />
        </div>
        {highlight && <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-orange-600">Total</span>}
      </div>

      <p className="rp-display-font text-2xl sm:text-3xl font-bold tabular-nums leading-none text-gray-900 rp-animate-count-in truncate">{value}</p>
      <p className="mt-2 text-[13px] font-medium text-gray-500">{title}</p>
    </div>
  );
}

/* ─── Metric Card (matches SummaryCard) ─── */
function MetricCard({ title, count, icon: Icon, color, gradClass, shadowColor, isCurrency }) {
  return (
    <div
      className={cn('rp-card-hover group relative w-full overflow-hidden rounded-2xl border border-white/80 p-5 text-left shadow-md cursor-pointer', gradClass)}
      style={{ boxShadow: `0 4px 20px ${shadowColor}` }}
    >
      <div className="absolute -bottom-8 -right-8 h-20 w-20 rounded-full blur-2xl opacity-20" style={{ backgroundColor: color }} />
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: `linear-gradient(90deg, ${color}70, ${color}10)` }} />

      <div className="flex items-center justify-between mb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white shadow-sm transition-transform group-hover:scale-110"
          style={{ background: `${color}15` }}>
          <Icon className="h-4 w-4" style={{ color }} strokeWidth={2} />
        </div>
        <Activity className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
      </div>

      <p className="rp-display-font text-3xl font-bold tabular-nums leading-none text-gray-900 rp-animate-count-in truncate">
        {count}
      </p>
      <p className="mt-2 text-[12px] font-semibold text-gray-500">{title}</p>
    </div>
  );
}

/* ─── Revenue Chart ─── */
function RevenueChart({ sales, services, startDate, endDate }) {
  const [activeRange, setActiveRange] = useState('All');
  const [activeMetric, setActiveMetric] = useState('Sales');

  const dailyData = {};
  sales.forEach(sale => {
    if (!sale.created_at) return;
    const date = new Date(sale.created_at).toISOString().split('T')[0];
    const amount = (sale.price || 0) * (sale.quantity || 0);
    if (!dailyData[date]) dailyData[date] = { Sales: 0, Services: 0 };
    dailyData[date].Sales += amount;
  });
  services.forEach(service => {
    if (service.status !== 'Returned' || !service.returned_at) return;
    const date = new Date(service.returned_at).toISOString().split('T')[0];
    const amount = service.final_amount || 0;
    if (!dailyData[date]) dailyData[date] = { Sales: 0, Services: 0 };
    dailyData[date].Services += amount;
  });

  const dataDates = Object.keys(dailyData).sort();
  let minDateStr = startDate || (dataDates.length > 0 ? dataDates[0] : null);
  let maxDateStr = endDate || new Date().toISOString().split('T')[0];

  if (minDateStr && maxDateStr) {
    let curr = new Date(minDateStr);
    const endObj = new Date(maxDateStr);
    let cb = 0;
    while (curr <= endObj && cb < 5000) {
      const d = curr.toISOString().split('T')[0];
      if (!dailyData[d]) dailyData[d] = { Sales: 0, Services: 0 };
      curr.setDate(curr.getDate() + 1);
      cb++;
    }
  }

  let chartData = Object.keys(dailyData).sort().map(date => ({
    date, Sales: dailyData[date].Sales, Services: dailyData[date].Services,
  }));

  if (activeRange !== 'All' && chartData.length > 0) {
    const cutoff = new Date(maxDateStr);
    if (activeRange === '1D') cutoff.setDate(cutoff.getDate() - 1);
    else if (activeRange === '1W') cutoff.setDate(cutoff.getDate() - 7);
    else if (activeRange === '1M') cutoff.setMonth(cutoff.getMonth() - 1);
    else if (activeRange === '3M') cutoff.setMonth(cutoff.getMonth() - 3);
    else if (activeRange === '6M') cutoff.setMonth(cutoff.getMonth() - 6);
    else if (activeRange === '1Y') cutoff.setFullYear(cutoff.getFullYear() - 1);
    chartData = chartData.filter(d => new Date(d.date) >= cutoff);
  }

  const metricColor = activeMetric === 'Sales' ? '#f97316' : '#10b981';

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const dateStr = formatDate(label);
    const p = payload.find(x => x.dataKey === activeMetric);
    if (!p) return null;
    return (
      <div className="rp-glass rounded-2xl px-4 py-3 shadow-xl text-sm">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-1">{dateStr}</p>
        <p className="font-bold text-gray-900">₹{formatNumber(p.value)}</p>
      </div>
    );
  };

  const ranges = ['1W', '1M', '3M', '6M', '1Y', 'All'];

  return (
    <div className="w-full">
      {/* Metric toggle */}
      <div className="mb-4 flex gap-2">
        {[
          { key: 'Sales', color: '#f97316', bg: '#fff7ed', border: '#fed7aa', label: 'Sales' },
          { key: 'Services', color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0', label: 'Services' },
        ].map(m => (
          <button
            key={m.key}
            onClick={() => setActiveMetric(m.key)}
            className="flex items-center gap-1.5 rounded-xl border-2 px-4 py-1.5 text-xs font-bold transition-all"
            style={{
              borderColor: activeMetric === m.key ? m.color : m.border,
              backgroundColor: activeMetric === m.key ? m.bg : '#fff',
              color: activeMetric === m.key ? m.color : '#9ca3af',
            }}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: m.color }} />
            {m.label}
          </button>
        ))}
      </div>

      {chartData.length === 0 ? (
        <div className="flex h-56 items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 gap-2 flex-col">
          <BarChart3 className="h-7 w-7 text-gray-300" />
          <p className="text-sm font-semibold text-gray-400">No data for selected period</p>
        </div>
      ) : (
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 4, left: 4, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="0" />
              <XAxis dataKey="date" hide />
              <YAxis hide domain={['dataMin - 200', 'dataMax + 500']} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1, strokeDasharray: '4 4' }} isAnimationActive={false} />
              <Line
                type="monotone"
                dataKey={activeMetric}
                stroke={metricColor}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: metricColor, stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Range selector */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {ranges.map(r => (
          <button
            key={r}
            onClick={() => setActiveRange(r)}
            className="px-4 py-1.5 text-[12px] font-semibold rounded-full transition-all"
            style={activeRange === r
              ? { backgroundColor: '#f97316', color: '#fff', boxShadow: '0 2px 8px rgba(249,115,22,0.3)' }
              : { backgroundColor: 'transparent', color: '#9ca3af' }
            }
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Skeleton ─── */
function ReportsSkeleton() {
  return (
    <div className="rp-mesh-bg rp-dashboard-font min-h-screen space-y-8 p-1 animate-pulse">
      <div className="h-28 rounded-3xl bg-gray-200" />
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-gray-200" />)}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-gray-200" />)}
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-gray-200" />)}
      </div>
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3 h-64 rounded-3xl bg-gray-200" />
        <div className="col-span-2 h-64 rounded-3xl bg-gray-200" />
      </div>
    </div>
  );
}

/* ─── Helpers ─── */
function formatHighlight(text) {
  if (typeof text !== 'string') return text;
  const html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
