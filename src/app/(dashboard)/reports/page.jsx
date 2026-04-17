'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  X,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { cn, formatCurrency, formatDate, formatNumber } from '@/lib/utils';
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  Tooltip, CartesianGrid,
} from 'recharts';
import Link from 'next/link';
import { MetricDetailsDialog } from '@/components/MetricDetailsDialog';

/* ═══════════════════════════════════════════════════════════════
   DESIGN SYSTEM — exact mirror of dashboard + services + sales + history
   ─ Single accent: #f97316  |  Ink: #0d0d0d  |  Surface: #f9fafb
   ─ Fonts: Instrument Serif (display) + Geist (body)
   ─ Motion: tilt, count-up, stagger, morph, shine, ripple, orbit
═══════════════════════════════════════════════════════════════ */

const REPORT_STYLES = `
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

.rp-font-display { font-family: 'Instrument Serif', Georgia, serif; }
.rp-font-body    { font-family: 'Geist', system-ui, sans-serif; }

/* ── Keyframes ── */
@keyframes rp-fade-up {
  from { opacity:0; transform:translateY(20px); filter:blur(4px); }
  to   { opacity:1; transform:translateY(0);    filter:blur(0); }
}
@keyframes rp-card-in {
  from { opacity:0; transform:translateY(16px) scale(0.97); filter:blur(3px); }
  to   { opacity:1; transform:translateY(0)    scale(1);    filter:blur(0); }
}
@keyframes rp-num-rise {
  from { opacity:0; transform:translateY(10px) scale(0.9); }
  to   { opacity:1; transform:translateY(0)    scale(1); }
}
@keyframes rp-spin-slow  { from { transform:rotate(0deg); }  to { transform:rotate(360deg); } }
@keyframes rp-spin-rev   { from { transform:rotate(0deg); }  to { transform:rotate(-360deg); } }
@keyframes rp-blink      { 0%,100%{ opacity:1; } 50%{ opacity:0.2; } }
@keyframes rp-live-ring  {
  0%   { transform:scale(1);   opacity:0.5; }
  70%  { transform:scale(2.4); opacity:0; }
  100% { transform:scale(2.4); opacity:0; }
}
@keyframes rp-blob-morph {
  0%,100% { border-radius:60% 40% 30% 70% / 60% 30% 70% 40%; }
  33%      { border-radius:30% 70% 60% 40% / 50% 60% 30% 60%; }
  66%      { border-radius:50% 30% 70% 40% / 40% 70% 30% 60%; }
}
@keyframes rp-shine      { from { left:-80%; } to { left:130%; } }
@keyframes rp-ripple-out { from { transform:scale(0); opacity:0.35; } to { transform:scale(3.5); opacity:0; } }
@keyframes rp-orbit {
  from { transform:rotate(0deg) translateX(44px) rotate(0deg); }
  to   { transform:rotate(360deg) translateX(44px) rotate(-360deg); }
}
@keyframes rp-underline {
  from { transform:scaleX(0); transform-origin:left; }
  to   { transform:scaleX(1); transform-origin:left; }
}
@keyframes rp-glow {
  0%,100% { box-shadow:0 0 0 0 rgba(249,115,22,0); }
  50%      { box-shadow:0 0 28px 8px rgba(249,115,22,0.2); }
}

/* ── Stagger ── */
.rp-stagger > *:nth-child(1)  { animation:rp-card-in 0.52s var(--ease-expo) 0.04s both; }
.rp-stagger > *:nth-child(2)  { animation:rp-card-in 0.52s var(--ease-expo) 0.09s both; }
.rp-stagger > *:nth-child(3)  { animation:rp-card-in 0.52s var(--ease-expo) 0.14s both; }
.rp-stagger > *:nth-child(4)  { animation:rp-card-in 0.52s var(--ease-expo) 0.19s both; }

.rp-section-enter { animation:rp-fade-up 0.65s var(--ease-expo) both; }

/* ── Shine ── */
.rp-shine { position:relative; overflow:hidden; }
.rp-shine::before {
  content:'';
  position:absolute; top:-50%; left:-80%;
  width:50%; height:200%;
  background:linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.5) 50%,transparent 70%);
  transform:skewX(-20deg);
  pointer-events:none; z-index:2;
}
.rp-shine:hover::before { animation:rp-shine 0.5s ease forwards; }

/* ── Ripple ── */
.rp-ripple { position:relative; overflow:hidden; }
.rp-ripple-circle {
  position:absolute; border-radius:50%;
  background:rgba(255,255,255,0.28);
  transform:scale(0);
  animation:rp-ripple-out 0.6s linear forwards;
  pointer-events:none;
}

/* ── Blob ── */
.rp-blob {
  border-radius:60% 40% 30% 70% / 60% 30% 70% 40%;
  animation:rp-blob-morph 10s ease-in-out infinite;
  position:absolute; pointer-events:none;
}

/* ── Accent glow ── */
.rp-accent-glow { animation:rp-glow 3s ease-in-out infinite; }

/* ── Input ── */
.rp-input {
  background:transparent;
  border:none;
  outline:none;
  font-size:0.875rem;
  font-weight:600;
  color:var(--ink);
  font-family:'Geist', system-ui, sans-serif;
  width:100%;
}

/* ── Chart styles ── */
.rp-chart-grid line { stroke:#f1f5f9; }

/* ── AI content formatting ── */
.rp-ai-content strong { font-weight:700; color:var(--ink); }
.rp-ai-content em     { font-style:italic; color:#1f2937; }

/* ── Dialog overrides ── */
[role="dialog"] {
  border-radius:1.5rem !important;
  border:1px solid var(--border) !important;
  box-shadow:0 25px 60px -12px rgba(0,0,0,0.18) !important;
  font-family:'Geist', system-ui, sans-serif !important;
  overflow:hidden !important;
}
`;

function StyleInjector() {
  useEffect(() => {
    if (document.getElementById('rp-v2-styles')) return;
    const el = document.createElement('style');
    el.id = 'rp-v2-styles';
    el.textContent = REPORT_STYLES;
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
    circle.className = 'rp-ripple-circle';
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
function RpSectionLabel({ icon: Icon, label }) {
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
   MAIN REPORTS PAGE
═══════════════════════════════════════════════════════════════ */
export default function ReportsPage() {
  const { profile } = useAuth();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate]     = useState('');
  const [loading, setLoading]     = useState(true);
  const [aiMode, setAiMode]       = useState('sales');
  const [aiResult, setAiResult]   = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError]     = useState('');
  const [mounted, setMounted]     = useState(false);
  const [data, setData] = useState({
    summary: {
      totalServices:0, completedServices:0, returnedServices:0,
      notRepairableServices:0, estimatedAmount:0, finalAmount:0,
      totalSales:0, overallRevenue:0, gapInRevenue:0,
    },
    services: [], sales: [],
  });

  /* ── Column definitions (unchanged logic) ── */
  const serviceExportColumns = [
    { key:'ticket_number', label:'Ticket Number' },{ key:'customer_name', label:'Customer Name' },
    { key:'customer_mobile', label:'Customer Mobile' },{ key:'customer_address', label:'Customer Address' },
    { key:'device_brand', label:'Device Brand' },{ key:'device_model', label:'Device Model' },
    { key:'issue_type', label:'Issue Type' },{ key:'issue_description', label:'Issue Description' },
    { key:'estimated_cost', label:'Estimated Cost' },{ key:'final_amount', label:'Final Amount' },
    { key:'status', label:'Status' },{ key:'registered_by', label:'Registered By' },
    { key:'returned_by', label:'Returned By' },{ key:'created_at', label:'Created At' },
    { key:'returned_at', label:'Returned At' },
  ];
  const salesExportColumns = [
    { key:'product_name', label:'Product Name' },{ key:'brand_type', label:'Brand Type' },
    { key:'quantity', label:'Quantity' },{ key:'price', label:'Price' },
    { key:'total', label:'Total' },{ key:'recorded_by', label:'Recorded By' },
    { key:'created_at', label:'Created At' },
  ];
  const servicePdfColumns = [
    { key:'ticket_number', label:'Ticket' },{ key:'customer_name', label:'Customer' },
    { key:'customer_mobile', label:'Mobile' },{ key:'device_brand', label:'Brand' },
    { key:'device_model', label:'Model' },{ key:'issue_type', label:'Issue' },
    { key:'estimated_cost', label:'Est Cost' },{ key:'final_amount', label:'Final' },
    { key:'status', label:'Status' },{ key:'created_at', label:'Date' },
  ];
  const salesPdfColumns = [
    { key:'product_name', label:'Product' },{ key:'brand_type', label:'Brand' },
    { key:'quantity', label:'Qty' },{ key:'price', label:'Price' },
    { key:'total', label:'Total' },{ key:'created_at', label:'Date' },
  ];

  useEffect(() => {
    if (profile?.role === 'admin' || profile?.role === 'owner') fetchReportData();
    setTimeout(() => setMounted(true), 50);
  }, [startDate, endDate, profile]);

  async function fetchReportData() {
    try {
      setLoading(true);
      const reportData = await reportService.getReportData(startDate, endDate);
      setData(reportData);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  function csvEscape(value) {
    if (value === null || value === undefined) return '';
    return `"${String(value).replace(/"/g,'""')}"`;
  }
  function downloadCsv(records, columns, fileName, title, timeframe) {
    if (!records?.length) return;
    const headers = columns.map(c => csvEscape(c.label));
    const rows = records.map(r => columns.map(c => csvEscape(r[c.key])).join(','));
    const csv = [csvEscape(title), csvEscape(timeframe), '', headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${fileName}.csv`; a.click();
    URL.revokeObjectURL(url);
  }
  function downloadPdf(records, columns, fileName, title, timeframe) {
    if (!records?.length) return;
    const doc = new jsPDF({ orientation:'landscape' });
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    const m = 12;
    doc.setLineWidth(0.8); doc.setDrawColor(0);
    doc.rect(m/2, m/2, pw-m, ph-m);
    doc.setFontSize(18); doc.setFont('helvetica','bold');
    doc.text('Orange Mobiles', pw/2, 18, { align:'center' });
    doc.setFontSize(10); doc.setFont('helvetica','normal');
    doc.text(timeframe, pw/2, 26, { align:'center' });
    doc.setFontSize(12);
    doc.text(title, pw/2, 34, { align:'center' });
    autoTable(doc, {
      startY:40, margin:{left:m, right:m, top:m},
      head:[columns.map(c=>c.label)],
      body:records.map(r=>columns.map(c=>r[c.key]==null?'':String(r[c.key]))),
      styles:{fontSize:7, overflow:'linebreak', cellPadding:{top:3,right:2,bottom:3,left:2}},
      headStyles:{fillColor:[249,115,22], textColor:255, halign:'left'},
      theme:'grid',
    });
    doc.save(`${fileName}.pdf`);
  }
  function getServiceExportRows() {
    return data.services.map(s => ({
      ticket_number:s.ticket_number||'', customer_name:s.customer_name||'',
      customer_mobile:s.customer_mobile||'', customer_address:s.customer_address||'',
      device_brand:s.device_brand||'', device_model:s.device_model||'',
      issue_type:s.issue_type||'', issue_description:s.issue_description||'',
      estimated_cost:s.estimated_cost??'', final_amount:s.final_amount??'',
      status:s.status||'',
      registered_by:s.registered_by_name||s.profiles?.full_name||s.registered_by||'',
      returned_by:s.returned_by_name||s.returned_by_profile?.full_name||s.returned_by||'',
      created_at:s.created_at?formatDate(s.created_at):'',
      returned_at:s.returned_at?formatDate(s.returned_at):'',
    }));
  }
  function getSalesExportRows() {
    return data.sales.map(s => ({
      product_name:s.product_name||'', brand_type:s.brand_type||'',
      quantity:s.quantity??'', price:s.price??'',
      total:s.price&&s.quantity?s.price*s.quantity:'',
      recorded_by:s.recorded_by_name||s.profiles?.full_name||s.recorded_by||'',
      created_at:s.created_at?formatDate(s.created_at):'',
    }));
  }
  function handleExport(type, format) {
    const rows = type==='sales'?getSalesExportRows():getServiceExportRows();
    const columns = type==='sales'
      ?(format==='pdf'?salesPdfColumns:salesExportColumns)
      :(format==='pdf'?servicePdfColumns:serviceExportColumns);
    if (!rows?.length) return;
    const range = startDate&&endDate?`${startDate}_to_${endDate}`:'till_now';
    const title = `${type==='sales'?'Sales':'Service'} Report`;
    const timeframe = startDate&&endDate?`Time Frame: ${startDate} to ${endDate}`:'Time Frame: Till Now';
    format==='csv'
      ?downloadCsv(rows,columns,`${type}_${range}`,title,timeframe)
      :downloadPdf(rows,columns,`${type}_${range}`,title,timeframe);
  }
  async function requestAiAnalysis(mode) {
    setAiMode(mode); setAiResult(''); setAiError(''); setAiLoading(true);
    try {
      const res = await fetch('/api/ai-analysis', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ mode, startDate, endDate }),
      });
      const result = await res.json();
      if (!res.ok||result.error) throw new Error(result.error||'AI analysis request failed.');
      setAiResult(result.summary||'No analysis was returned.');
    } catch (err) { setAiError(err.message||'Failed to generate AI analysis.'); }
    finally { setAiLoading(false); }
  }

  /* ── Access Denied ── */
  if (profile?.role !== 'admin' && profile?.role !== 'owner') {
    return (
      <>
        <StyleInjector />
        <div className="rp-font-body" style={{ backgroundColor:'var(--surface)', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem' }}>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'1.25rem', textAlign:'center', maxWidth:360 }}>
            <div style={{ width:72, height:72, borderRadius:'1.25rem', background:'var(--ink)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 12px 32px rgba(0,0,0,0.2)' }}>
              <Lock style={{ width:32, height:32, color:'var(--accent)' }} />
            </div>
            <div>
              <p className="rp-font-display" style={{ fontSize:'1.5rem', fontWeight:400, color:'var(--ink)', fontStyle:'italic' }}>Access Denied</p>
              <p style={{ fontSize:'0.875rem', color:'var(--ink-faint)', marginTop:'0.375rem' }}>Only administrators can view analytics reports.</p>
            </div>
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
      <div className="rp-font-body" style={{ backgroundColor:'var(--surface)', minHeight:'100vh', padding:'0.25rem' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>

          {/* ═══ HERO HEADER ═══ */}
          <header
            className={cn(mounted && 'rp-section-enter')}
            style={{ background:'linear-gradient(135deg,#0d0d0d 0%,#181818 60%,#0d0d0d 100%)', borderRadius:'1.75rem', padding:'1.75rem', position:'relative', overflow:'hidden', boxShadow:'0 24px 60px -16px rgba(0,0,0,0.45)', animationDelay:'0s' }}
          >
            <div className="rp-blob" style={{ width:260, height:260, background:'var(--accent)', opacity:0.06, top:-60, right:-40 }} />
            <div className="rp-blob" style={{ width:160, height:160, background:'var(--accent)', opacity:0.04, bottom:-40, left:'22%', animationDelay:'4s' }} />
            <div style={{ position:'absolute', right:28, top:28, width:88, height:88, animation:'rp-spin-slow 20s linear infinite', pointerEvents:'none' }}>
              <div style={{ width:'100%', height:'100%', borderRadius:'50%', border:'1px dashed rgba(249,115,22,0.18)' }} />
            </div>
            <div style={{ position:'absolute', right:36, top:36, width:54, height:54, animation:'rp-spin-rev 9s linear infinite', pointerEvents:'none' }}>
              <div style={{ width:'100%', height:'100%', borderRadius:'50%', border:'1px solid rgba(249,115,22,0.10)' }} />
            </div>
            <div style={{ position:'absolute', right:49, top:49, pointerEvents:'none' }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent)', opacity:0.65, animation:'rp-orbit 9s linear infinite' }} />
            </div>
            <div style={{ position:'absolute', top:0, left:'8%', width:100, height:2, background:'linear-gradient(90deg,var(--accent),transparent)', opacity:0.55 }} />

            <div style={{ position:'relative', display:'flex', flexWrap:'wrap', alignItems:'flex-end', justifyContent:'space-between', gap:'1.25rem' }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.625rem', marginBottom:'0.5rem' }}>
                  <div style={{ width:28, height:28, borderRadius:'0.625rem', background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <BarChart3 style={{ width:14, height:14, color:'#fff' }} strokeWidth={2.5} />
                  </div>
                  <p style={{ fontSize:'0.625rem', fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:'rgba(255,255,255,0.28)' }}>Analytics</p>
                </div>
                <h1 className="rp-font-display" style={{ fontSize:'clamp(1.75rem,4vw,2.5rem)', fontWeight:400, lineHeight:1.1, color:'rgba(255,255,255,0.94)', marginBottom:'0.5rem', fontStyle:'italic' }}>
                  Business <span style={{ color:'var(--accent)' }}>Intelligence</span>
                </h1>
                <div style={{ height:2, width:56, background:'var(--accent)', animation:'rp-underline 0.8s var(--ease-expo) 0.3s both', borderRadius:2 }} />
                <p style={{ marginTop:'0.7rem', fontSize:'0.8125rem', color:'rgba(255,255,255,0.3)', fontWeight:400 }}>
                  Deep-dive into your shop's performance data.
                </p>
              </div>

              {/* Date range widget */}
              <div style={{ background:'rgba(255,255,255,0.06)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:'1.125rem', padding:'0.85rem 1.4rem', textAlign:'right', minWidth:148 }}>
                <p style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(255,255,255,0.28)', marginBottom:'0.3rem' }}>Range</p>
                <p style={{ fontSize:'0.9375rem', fontWeight:700, letterSpacing:'-0.01em', color:'var(--accent)', lineHeight:1.2, margin:0, maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {dateLabel}
                </p>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:'0.4rem', marginTop:'0.4rem' }}>
                  <span style={{ display:'inline-block', position:'relative', width:7, height:7, borderRadius:'50%', background:'#22c55e' }}>
                    <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:'#22c55e', animation:'rp-live-ring 2s ease-out infinite' }} />
                  </span>
                  <span style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(255,255,255,0.28)' }}>Live</span>
                </div>
              </div>
            </div>
          </header>

          {/* ═══ DATE RANGE + EXPORT ═══ */}
          <section className={cn(mounted && 'rp-section-enter')} style={{ animationDelay:'0.1s' }}>
            <RpSectionLabel icon={CalendarRange} label="Date Range & Export" />
            <div className="rp-stagger" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'0.875rem' }}>

              {/* From */}
              <DateInputCard label="From" color="#3b82f6" value={startDate} onChange={e => setStartDate(e.target.value)} />
              {/* To */}
              <DateInputCard label="To" color="#10b981" value={endDate} onChange={e => setEndDate(e.target.value)} />

              {/* Export button */}
              <Dialog>
                <DialogTrigger asChild>
                  <ExportTriggerBtn />
                </DialogTrigger>
                <DialogContent className="rounded-3xl border-0 shadow-2xl overflow-hidden p-0 sm:max-w-md">
                  <div style={{ background:'linear-gradient(135deg,#0d0d0d,#181818)', padding:'1.25rem 1.5rem', position:'relative', overflow:'hidden' }}>
                    <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'var(--accent)' }} />
                    <div className="rp-blob" style={{ width:120, height:120, background:'var(--accent)', opacity:0.06, top:-30, right:-20 }} />
                    <div style={{ position:'relative' }}>
                      <p style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(255,255,255,0.28)', marginBottom:'0.25rem' }}>Download</p>
                      <DialogTitle style={{ fontFamily:"'Geist', system-ui, sans-serif", fontSize:'1rem', fontWeight:600, color:'#fff', margin:0 }}>Export Reports</DialogTitle>
                      <DialogDescription style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.35)', marginTop:'0.25rem' }}>Choose format for services or sales data.</DialogDescription>
                    </div>
                  </div>
                  <div style={{ display:'grid', gap:'0.625rem', padding:'1.25rem', background:'var(--surface-raise)' }}>
                    {[
                      { label:'Service Report — CSV', type:'services', format:'csv', dotColor:'#3b82f6' },
                      { label:'Service Report — PDF', type:'services', format:'pdf', dotColor:'var(--accent)' },
                      { label:'Sales Report — CSV',   type:'sales',    format:'csv', dotColor:'#8b5cf6' },
                      { label:'Sales Report — PDF',   type:'sales',    format:'pdf', dotColor:'#10b981' },
                    ].map(btn => (
                      <DialogClose key={btn.label} asChild>
                        <ExportOptionBtn
                          label={btn.label}
                          dotColor={btn.dotColor}
                          onClick={() => handleExport(btn.type, btn.format)}
                        />
                      </DialogClose>
                    ))}
                  </div>
                  <div style={{ padding:'0 1.25rem 1.25rem', background:'var(--surface-raise)' }}>
                    <DialogClose asChild>
                      <button style={{ width:'100%', padding:'0.75rem', borderRadius:'0.875rem', border:'1.5px solid var(--border)', background:'var(--surface)', fontSize:'0.875rem', fontWeight:600, color:'var(--ink-mid)', cursor:'pointer' }}>
                        Close
                      </button>
                    </DialogClose>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </section>

          {/* ═══ REVENUE OVERVIEW ═══ */}
          <section className={cn(mounted && 'rp-section-enter')} style={{ animationDelay:'0.18s' }}>
            <RpSectionLabel icon={IndianRupee} label="Revenue Overview" />
            <div className="rp-stagger" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'1rem' }}>
              <Link href="/history?tab=sales" style={{ textDecoration:'none' }}>
                <RevenueCard title="Sales Revenue"    value={formatCurrency(data.summary.totalSales)}     icon={ShoppingBag} dotColor="#8b5cf6" />
              </Link>
              <Link href="/history?tab=services" style={{ textDecoration:'none' }}>
                <RevenueCard title="Services Revenue" value={formatCurrency(data.summary.finalAmount)}    icon={Wrench}      dotColor="#3b82f6" />
              </Link>
              <RevenueCard title="Overall Revenue"    value={formatCurrency(data.summary.overallRevenue)} icon={IndianRupee} dotColor="var(--accent)" highlight />
            </div>
          </section>

          {/* ═══ SERVICE METRICS ═══ */}
          <section className={cn(mounted && 'rp-section-enter')} style={{ animationDelay:'0.26s' }}>
            <RpSectionLabel icon={Activity} label="Service Metrics" />
            <div className="rp-stagger" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'1rem' }}>
              <MetricDetailsDialog title="Total Services" dataList={data.services}>
                <MetricCard title="Total Services" count={data.summary.totalServices}        icon={Wrench}       dotColor="#3b82f6" />
              </MetricDetailsDialog>
              <MetricDetailsDialog title="Returned Services" dataList={data.services.filter(s=>s.status==='Returned')}>
                <MetricCard title="Returned"       count={data.summary.returnedServices}     icon={TrendingUp}   dotColor="#10b981" />
              </MetricDetailsDialog>
              <MetricDetailsDialog title="Not Repairable" dataList={data.services.filter(s=>s.was_not_repairable)}>
                <MetricCard title="Not Repairable" count={data.summary.notRepairableServices} icon={XCircle}     dotColor="#ef4444" />
              </MetricDetailsDialog>
              <MetricDetailsDialog title="Gap in Revenue" dataList={data.services.filter(s=>s.status==='Returned'&&(s.estimated_cost||0)!==(s.final_amount||0))}>
                <MetricCard title="Revenue Gap"    count={formatCurrency(data.summary.gapInRevenue)} icon={TrendingDown} dotColor="#f59e0b" isCurrency />
              </MetricDetailsDialog>
            </div>
          </section>

          {/* ═══ BOTTOM: CHART + AI ═══ */}
          <div
            className={cn(mounted && 'rp-section-enter')}
            style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:'1.5rem', alignItems:'start', animationDelay:'0.34s' }}
          >
            {/* Revenue Chart */}
            <div style={{ ...panelStyle, gridColumn:'span 2' }}>
              <div style={topAccentBar} />
              <div style={{ display:'flex', alignItems:'center', gap:'0.625rem', marginBottom:'1.25rem' }}>
                <div style={{ width:32, height:32, borderRadius:'0.625rem', background:'var(--ink)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <BarChart3 style={{ width:15, height:15, color:'var(--accent)' }} strokeWidth={2.5} />
                </div>
                <div>
                  <p style={{ fontSize:'0.9375rem', fontWeight:600, color:'var(--ink)', margin:0 }}>Revenue Trend</p>
                  <p style={{ fontSize:'0.75rem', color:'var(--ink-faint)', margin:0 }}>Daily revenue across sales &amp; services</p>
                </div>
              </div>
              <RevenueChart sales={data.sales} services={data.services} startDate={startDate} endDate={endDate} />
            </div>

            {/* AI Analysis */}
            <div style={panelStyle}>
              <div style={topAccentBar} />
              <div style={{ display:'flex', alignItems:'center', gap:'0.625rem', marginBottom:'1.25rem' }}>
                <div style={{ width:32, height:32, borderRadius:'0.625rem', background:'var(--ink)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Bot style={{ width:15, height:15, color:'var(--accent)' }} strokeWidth={2.5} />
                </div>
                <div>
                  <p style={{ fontSize:'0.9375rem', fontWeight:600, color:'var(--ink)', margin:0 }}>AI Analysis</p>
                  <p style={{ fontSize:'0.75rem', color:'var(--ink-faint)', margin:0 }}>Powered insights from your data</p>
                </div>
              </div>

              {/* Mode buttons */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem', marginBottom:'1rem' }}>
                {[
                  { key:'sales',    dotColor:'var(--accent)' },
                  { key:'service',  dotColor:'#3b82f6' },
                  { key:'feedback', dotColor:'#10b981' },
                  { key:'struggles',dotColor:'#ef4444' },
                ].map(m => (
                  <AiModeBtn
                    key={m.key} label={m.key} dotColor={m.dotColor}
                    active={aiMode === m.key} disabled={aiLoading}
                    onClick={() => requestAiAnalysis(m.key)}
                  />
                ))}
              </div>

              {/* Full AI Dialog trigger */}
              <Dialog>
                <DialogTrigger asChild>
                  <FullAiBtn />
                </DialogTrigger>
                <DialogContent className="rounded-3xl border-0 shadow-2xl overflow-hidden p-0 max-h-[90vh] sm:max-w-3xl">
                  <div style={{ background:'linear-gradient(135deg,#0d0d0d,#181818)', padding:'1.25rem 1.5rem', position:'relative', overflow:'hidden' }}>
                    <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'var(--accent)' }} />
                    <div className="rp-blob" style={{ width:120, height:120, background:'var(--accent)', opacity:0.06, top:-30, right:-20 }} />
                    <div style={{ position:'relative' }}>
                      <p style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(255,255,255,0.28)', marginBottom:'0.25rem' }}>Powered by AI</p>
                      <DialogTitle style={{ fontFamily:"'Geist', system-ui, sans-serif", fontSize:'1rem', fontWeight:600, color:'#fff', margin:0 }}>AI Analysis</DialogTitle>
                      <DialogDescription style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.35)', marginTop:'0.25rem' }}>Select a mode to analyze your business data.</DialogDescription>
                    </div>
                  </div>
                  <div style={{ overflowY:'auto', background:'var(--surface-raise)', padding:'1.25rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.625rem' }}>
                      {[
                        { key:'sales', dotColor:'var(--accent)' },{ key:'service', dotColor:'#3b82f6' },
                        { key:'feedback', dotColor:'#10b981' },{ key:'struggles', dotColor:'#ef4444' },
                      ].map(m => (
                        <AiModeBtn key={m.key} label={m.key} dotColor={m.dotColor}
                          active={aiMode===m.key} disabled={aiLoading}
                          onClick={() => requestAiAnalysis(m.key)} large />
                      ))}
                    </div>
                    <AiResultArea aiLoading={aiLoading} aiError={aiError} aiResult={aiResult} aiMode={aiMode} large />
                  </div>
                  <div style={{ padding:'0 1.25rem 1.25rem', background:'var(--surface-raise)', borderTop:'1px solid var(--border)' }}>
                    <DialogClose asChild>
                      <button style={{ width:'100%', padding:'0.75rem', borderRadius:'0.875rem', border:'1.5px solid var(--border)', background:'var(--surface)', fontSize:'0.875rem', fontWeight:600, color:'var(--ink-mid)', cursor:'pointer', marginTop:'0.75rem' }}>
                        Close
                      </button>
                    </DialogClose>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Inline preview */}
              <AiResultArea aiLoading={aiLoading} aiError={aiError} aiResult={aiResult} aiMode={aiMode} preview />
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════════════════════════ */

/* ── Date Input Card ── */
function DateInputCard({ label, color, value, onChange }) {
  const { ref, onMouseMove, onMouseLeave } = useTilt(4);
  return (
    <div ref={ref} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}
      style={{ position:'relative', display:'flex', alignItems:'center', gap:'0.875rem', borderRadius:'1.125rem', border:`1.5px solid ${color}40`, background:`${color}08`, padding:'1rem', willChange:'transform' }}
    >
      <div style={{ position:'absolute', left:0, top:'20%', bottom:'20%', width:3, borderRadius:'0 3px 3px 0', background:color }} />
      <div style={{ width:40, height:40, borderRadius:'0.75rem', display:'flex', alignItems:'center', justifyContent:'center', background:`${color}15`, border:`1.5px solid ${color}30`, flexShrink:0 }}>
        <CalendarRange style={{ width:18, height:18, color }} strokeWidth={2.5} />
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <label style={{ display:'block', fontSize:'0.625rem', fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color, marginBottom:'0.25rem' }}>{label}</label>
        <input type="date" value={value} onChange={onChange} className="rp-input" style={{ color:'var(--ink)' }} />
      </div>
    </div>
  );
}

/* ── Export Trigger Button ── */
function ExportTriggerBtn() {
  const ripple = useRipple();
  const { ref, onMouseMove, onMouseLeave } = useTilt(4);
  const [hovered, setHovered] = useState(false);
  return (
    <button ref={ref} onClick={ripple} onMouseMove={onMouseMove}
      onMouseLeave={() => { onMouseLeave(); setHovered(false); }}
      onMouseEnter={() => setHovered(true)}
      className="rp-ripple rp-shine"
      style={{ width:'100%', display:'flex', alignItems:'center', gap:'0.875rem', borderRadius:'1.125rem', border:`1.5px solid ${hovered?'var(--accent)':'var(--border)'}`, background:hovered?'var(--ink)':'var(--surface-raise)', padding:'1rem', cursor:'pointer', textAlign:'left', transition:'background 0.25s, border-color 0.25s', willChange:'transform', position:'relative' }}
    >
      <div style={{ position:'absolute', left:0, top:'20%', bottom:'20%', width:3, borderRadius:'0 3px 3px 0', background:'var(--accent)', transform:hovered?'scaleY(1)':'scaleY(0.35)', transition:'transform 0.3s var(--ease-spring)', transformOrigin:'center' }} />
      <div style={{ width:40, height:40, borderRadius:'0.75rem', display:'flex', alignItems:'center', justifyContent:'center', background:hovered?'rgba(249,115,22,0.15)':'var(--surface)', border:`1.5px solid ${hovered?'rgba(249,115,22,0.35)':'var(--border)'}`, flexShrink:0, transition:'background 0.25s, border-color 0.25s, transform 0.3s var(--ease-spring)', transform:hovered?'scale(1.1) rotate(4deg)':'scale(1)' }}>
        <FileDown style={{ width:18, height:18, color:hovered?'var(--accent)':'var(--ink-mid)' }} strokeWidth={2.5} />
      </div>
      <div style={{ flex:1 }}>
        <p style={{ fontSize:'0.875rem', fontWeight:600, color:hovered?'#fff':'var(--ink)', margin:0, transition:'color 0.2s' }}>Export Reports</p>
        <p style={{ fontSize:'0.75rem', color:hovered?'rgba(255,255,255,0.45)':'var(--ink-faint)', margin:'2px 0 0', transition:'color 0.2s' }}>Download CSV or PDF</p>
      </div>
      <ArrowUpRight style={{ width:15, height:15, color:hovered?'var(--accent)':'var(--border-strong)', transform:hovered?'translate(2px,-2px)':'translate(0,0)', transition:'transform 0.2s, color 0.2s', flexShrink:0 }} />
    </button>
  );
}

/* ── Export Option Button ── */
function ExportOptionBtn({ label, dotColor, onClick }) {
  const ripple = useRipple();
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={(e) => { ripple(e); onClick(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="rp-ripple rp-shine"
      style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.875rem 1rem', borderRadius:'0.875rem', border:`1.5px solid ${hovered?dotColor+'55':'var(--border)'}`, background:hovered?`${dotColor}08`:'var(--surface)', cursor:'pointer', fontSize:'0.875rem', fontWeight:600, color:hovered?dotColor:'var(--ink-mid)', transition:'all 0.2s' }}
    >
      <div style={{ display:'flex', alignItems:'center', gap:'0.625rem' }}>
        <span style={{ width:8, height:8, borderRadius:'50%', background:dotColor, display:'inline-block' }} />
        {label}
      </div>
      <FileDown style={{ width:15, height:15, opacity:0.7 }} />
    </button>
  );
}

/* ── Revenue Card ── */
function RevenueCard({ title, value, icon: Icon, dotColor, highlight }) {
  const { ref, onMouseMove, onMouseLeave } = useTilt(5);
  const [hovered, setHovered] = useState(false);
  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={() => { onMouseLeave(); setHovered(false); }}
      onMouseEnter={() => setHovered(true)}
      className="rp-shine"
      style={{
        borderRadius:'1.25rem', padding:'1.25rem', background:'var(--surface-raise)',
        border:`1.5px solid ${hovered?dotColor+'55':'var(--border)'}`,
        position:'relative', overflow:'hidden', cursor:'pointer',
        transition:'border-color 0.25s, box-shadow 0.25s',
        boxShadow: hovered ? `0 8px 32px ${dotColor === 'var(--accent)' ? 'rgba(249,115,22,0.2)' : dotColor+'22'}` : '0 2px 8px rgba(0,0,0,0.04)',
        willChange:'transform',
      }}
    >
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:dotColor, transform:hovered?'scaleX(1)':'scaleX(0)', transformOrigin:'left', transition:'transform 0.35s var(--ease-expo)' }} />
      <div style={{ position:'absolute', right:-20, bottom:-20, width:80, height:80, borderRadius:'50%', background:dotColor, opacity:hovered?0.09:0.04, transition:'opacity 0.3s', filter:'blur(20px)' }} />

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
        <div style={{ width:40, height:40, borderRadius:'0.875rem', display:'flex', alignItems:'center', justifyContent:'center', background:`${dotColor}15`, border:`1.5px solid ${dotColor}28`, transform:hovered?'scale(1.1) rotate(3deg)':'scale(1)', transition:'transform 0.3s var(--ease-spring)' }}>
          <Icon style={{ width:18, height:18, color:dotColor === 'var(--accent)' ? 'var(--accent)' : dotColor }} strokeWidth={2} />
        </div>
        {highlight && (
          <span style={{ borderRadius:100, padding:'0.2rem 0.625rem', background:'var(--accent-dim)', border:'1px solid var(--accent-mid)', fontSize:'0.6rem', fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--accent)' }}>Total</span>
        )}
      </div>

      <p style={{ fontSize:'1.75rem', fontWeight:800, letterSpacing:'-0.03em', lineHeight:1, color:'var(--ink)', margin:0, animation:'rp-num-rise 0.5s var(--ease-spring) both', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
        {value}
      </p>
      <p style={{ marginTop:'0.5rem', fontSize:'0.8125rem', fontWeight:500, color:'var(--ink-faint)' }}>{title}</p>
    </div>
  );
}

/* ── Metric Card ── */
function MetricCard({ title, count, icon: Icon, dotColor, isCurrency }) {
  const animated = typeof count === 'number' ? useCountUp(count, 800, 200) : count;
  const { ref, onMouseMove, onMouseLeave } = useTilt(5);
  const [hovered, setHovered] = useState(false);
  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={() => { onMouseLeave(); setHovered(false); }}
      onMouseEnter={() => setHovered(true)}
      className="rp-shine"
      style={{
        borderRadius:'1.25rem', padding:'1.25rem', background:'var(--surface-raise)',
        border:`1.5px solid ${hovered?dotColor+'55':'var(--border)'}`,
        position:'relative', overflow:'hidden', cursor:'pointer',
        transition:'border-color 0.25s, box-shadow 0.25s',
        boxShadow: hovered ? `0 8px 32px ${dotColor}22` : '0 2px 8px rgba(0,0,0,0.04)',
        willChange:'transform',
      }}
    >
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:dotColor, transform:hovered?'scaleX(1)':'scaleX(0)', transformOrigin:'left', transition:'transform 0.35s var(--ease-expo)' }} />
      <div style={{ position:'absolute', right:-16, bottom:-16, width:64, height:64, borderRadius:'50%', background:dotColor, opacity:hovered?0.09:0.04, transition:'opacity 0.3s', filter:'blur(16px)' }} />

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.875rem' }}>
        <div style={{ width:36, height:36, borderRadius:'0.75rem', display:'flex', alignItems:'center', justifyContent:'center', background:`${dotColor}15`, border:`1px solid ${dotColor}28`, transform:hovered?'scale(1.1) rotate(-4deg)':'scale(1)', transition:'transform 0.3s var(--ease-spring)' }}>
          <Icon style={{ width:15, height:15, color:dotColor }} strokeWidth={2} />
        </div>
        <Activity style={{ width:13, height:13, color:hovered?'var(--ink-mid)':'var(--border-strong)', transition:'color 0.2s' }} />
      </div>

      <p style={{ fontSize: isCurrency?'1.125rem':'2.25rem', fontWeight:800, letterSpacing:'-0.03em', lineHeight:1, color:'var(--ink)', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', animation:'rp-num-rise 0.5s var(--ease-spring) both' }}>
        {isCurrency ? count : animated}
      </p>
      <p style={{ marginTop:'0.5rem', fontSize:'0.75rem', fontWeight:600, color:'var(--ink-faint)', textTransform:'uppercase', letterSpacing:'0.08em' }}>{title}</p>
    </div>
  );
}

/* ── AI Mode Button ── */
function AiModeBtn({ label, dotColor, active, disabled, onClick, large }) {
  const ripple = useRipple();
  return (
    <button
      onClick={(e) => { ripple(e); onClick(); }}
      disabled={disabled}
      className="rp-ripple"
      style={{
        padding: large ? '0.75rem' : '0.5rem 0.75rem',
        borderRadius:'0.75rem', border:`1.5px solid ${active?dotColor+'55':'var(--border)'}`,
        background: active ? `${dotColor}10` : 'var(--surface)',
        color: active ? (dotColor === 'var(--accent)' ? 'var(--accent)' : dotColor) : 'var(--ink-faint)',
        fontSize: large ? '0.875rem' : '0.75rem',
        fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em',
        cursor:disabled?'not-allowed':'pointer', opacity:disabled?0.5:1, transition:'all 0.2s',
        display:'flex', alignItems:'center', justifyContent:'center', gap:'0.4rem',
      }}
    >
      {active && <span style={{ width:5, height:5, borderRadius:'50%', background:dotColor === 'var(--accent)' ? 'var(--accent)' : dotColor, display:'inline-block', animation:'rp-blink 2s ease-in-out infinite' }} />}
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </button>
  );
}

/* ── Full AI Dialog Trigger ── */
function FullAiBtn() {
  const ripple = useRipple();
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={ripple}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="rp-ripple rp-shine"
      style={{
        width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'0.5rem',
        padding:'0.75rem 1rem', borderRadius:'0.875rem',
        border:`1.5px solid ${hovered?'var(--accent)':'var(--border)'}`,
        background:hovered?'var(--ink)':'var(--surface)',
        cursor:'pointer', marginBottom:'1rem', transition:'all 0.2s',
      }}
    >
      <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
        <Sparkles style={{ width:14, height:14, color:hovered?'var(--accent)':'var(--ink-mid)' }} />
        <span style={{ fontSize:'0.8125rem', fontWeight:600, color:hovered?'#fff':'var(--ink-mid)' }}>Open Full AI Analysis</span>
      </div>
      <ChevronRight style={{ width:14, height:14, color:hovered?'var(--accent)':'var(--border-strong)', transition:'transform 0.2s, color 0.2s', transform:hovered?'translateX(2px)':'translateX(0)' }} />
    </button>
  );
}

/* ── AI Result Area ── */
function AiResultArea({ aiLoading, aiError, aiResult, aiMode, preview, large }) {
  const minH = preview ? 100 : 200;
  return (
    <div style={{ borderRadius:'0.875rem', border:'1px solid var(--border)', background:'var(--surface)', padding:'1rem', minHeight:minH }}>
      {aiLoading && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'0.75rem', padding:'1rem 0' }}>
          <div style={{ width:36, height:36, borderRadius:'0.75rem', background:'var(--ink)', display:'flex', alignItems:'center', justifyContent:'center', animation:'rp-spin-slow 1s linear infinite' }}>
            <Bot style={{ width:18, height:18, color:'var(--accent)' }} />
          </div>
          <p style={{ fontSize:'0.8125rem', fontWeight:600, color:'var(--ink-faint)' }}>Analyzing…</p>
        </div>
      )}
      {aiError && (
        <div style={{ display:'flex', alignItems:'flex-start', gap:'0.625rem', padding:'0.75rem', borderRadius:'0.75rem', background:'#fef2f2', border:'1px solid #fecaca' }}>
          <AlertCircle style={{ width:15, height:15, color:'#ef4444', flexShrink:0, marginTop:2 }} />
          <p style={{ fontSize:'0.8125rem', color:'#dc2626', margin:0 }}>{aiError}</p>
        </div>
      )}
      {!aiLoading && !aiError && !aiResult && (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'1.5rem 0', gap:'0.5rem', textAlign:'center' }}>
          <Bot style={{ width:24, height:24, color:'var(--border-strong)' }} />
          <p style={{ fontSize:'0.8125rem', color:'var(--ink-faint)', fontWeight:500 }}>
            {preview ? 'Choose a mode above to see a quick preview here.' : 'Select a mode above to load insights'}
          </p>
        </div>
      )}
      {!aiLoading && !aiError && aiResult && (
        <div style={{ display:'flex', flexDirection:'column', gap:'0.875rem' }}>
          <p className="rp-font-display" style={{ fontSize:'0.9375rem', fontWeight:400, color:'var(--ink)', fontStyle:'italic', margin:0 }}>
            {aiMode.charAt(0).toUpperCase() + aiMode.slice(1)} Analysis
          </p>
          {preview ? (
            <p style={{ fontSize:'0.75rem', color:'var(--ink-mid)', lineHeight:1.6, margin:0, display:'-webkit-box', WebkitLineClamp:5, WebkitBoxOrient:'vertical', overflow:'hidden' }} className="rp-ai-content">
              {typeof aiResult === 'object' ? aiResult.overview || 'Analysis ready.' : String(aiResult)}
            </p>
          ) : (
            typeof aiResult === 'object' ? (
              <>
                {aiResult.overview && (
                  <p style={{ fontSize:'0.875rem', color:'var(--ink-mid)', lineHeight:1.6, margin:0 }} className="rp-ai-content">
                    {formatHighlight(aiResult.overview)}
                  </p>
                )}
                {aiResult.positives?.length > 0 && (
                  <AiSection color="#10b981" label="Highlights" items={aiResult.positives} />
                )}
                {aiResult.improvements?.length > 0 && (
                  <AiSection color="var(--accent)" label="Improvements" items={aiResult.improvements} />
                )}
                {aiResult.recommendations?.length > 0 && (
                  <AiSection color="#3b82f6" label="Recommendations" items={aiResult.recommendations} />
                )}
              </>
            ) : (
              <p style={{ fontSize:'0.875rem', color:'var(--ink-mid)', lineHeight:1.6, margin:0, whiteSpace:'pre-line' }} className="rp-ai-content">
                {String(aiResult)}
              </p>
            )
          )}
        </div>
      )}
    </div>
  );
}

function AiSection({ color, label, items }) {
  return (
    <div style={{ borderRadius:'0.875rem', border:`1px solid ${color}25`, background:`${color}08`, padding:'0.875rem' }}>
      <p style={{ fontSize:'0.625rem', fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', color, marginBottom:'0.5rem' }}>{label}</p>
      <ul style={{ margin:0, paddingLeft:'1.25rem', display:'flex', flexDirection:'column', gap:'0.25rem' }}>
        {items.map((t, i) => (
          <li key={i} style={{ fontSize:'0.8125rem', color:'var(--ink-mid)', lineHeight:1.5 }} className="rp-ai-content">
            {formatHighlight(t)}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   REVENUE CHART
═══════════════════════════════════════════════════════════════ */
function RevenueChart({ sales, services, startDate, endDate }) {
  const [activeRange, setActiveRange]   = useState('All');
  const [activeMetric, setActiveMetric] = useState('Sales');

  const dailyData = {};
  sales.forEach(sale => {
    if (!sale.created_at) return;
    const date = new Date(sale.created_at).toISOString().split('T')[0];
    const amount = (sale.price||0)*(sale.quantity||0);
    if (!dailyData[date]) dailyData[date] = { Sales:0, Services:0 };
    dailyData[date].Sales += amount;
  });
  services.forEach(service => {
    if (service.status !== 'Returned' || !service.returned_at) return;
    const date = new Date(service.returned_at).toISOString().split('T')[0];
    const amount = service.final_amount || 0;
    if (!dailyData[date]) dailyData[date] = { Sales:0, Services:0 };
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
      if (!dailyData[d]) dailyData[d] = { Sales:0, Services:0 };
      curr.setDate(curr.getDate()+1); cb++;
    }
  }

  let chartData = Object.keys(dailyData).sort().map(date => ({
    date, Sales:dailyData[date].Sales, Services:dailyData[date].Services,
  }));

  if (activeRange !== 'All' && chartData.length > 0) {
    const cutoff = new Date(maxDateStr);
    if (activeRange==='1D') cutoff.setDate(cutoff.getDate()-1);
    else if (activeRange==='1W') cutoff.setDate(cutoff.getDate()-7);
    else if (activeRange==='1M') cutoff.setMonth(cutoff.getMonth()-1);
    else if (activeRange==='3M') cutoff.setMonth(cutoff.getMonth()-3);
    else if (activeRange==='6M') cutoff.setMonth(cutoff.getMonth()-6);
    else if (activeRange==='1Y') cutoff.setFullYear(cutoff.getFullYear()-1);
    chartData = chartData.filter(d => new Date(d.date) >= cutoff);
  }

  const metricColor = activeMetric === 'Sales' ? 'var(--accent)' : '#10b981';
  const metricColorHex = activeMetric === 'Sales' ? '#f97316' : '#10b981';

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const p = payload.find(x => x.dataKey === activeMetric);
    if (!p) return null;
    return (
      <div style={{ background:'var(--surface-raise)', backdropFilter:'blur(12px)', border:'1px solid var(--border)', borderRadius:'0.875rem', padding:'0.75rem 1rem', boxShadow:'0 8px 24px rgba(0,0,0,0.1)' }}>
        <p style={{ fontSize:'0.625rem', fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-faint)', marginBottom:'0.25rem' }}>{formatDate(label)}</p>
        <p style={{ fontSize:'1rem', fontWeight:800, color:metricColorHex, margin:0 }}>₹{formatNumber(p.value)}</p>
      </div>
    );
  };

  return (
    <div style={{ width:'100%' }}>
      {/* Metric toggle */}
      <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1rem' }}>
        {[
          { key:'Sales',    color:'#f97316' },
          { key:'Services', color:'#10b981' },
        ].map(m => {
          const active = activeMetric === m.key;
          return (
            <button key={m.key} onClick={() => setActiveMetric(m.key)}
              style={{ display:'flex', alignItems:'center', gap:'0.4rem', padding:'0.375rem 0.875rem', borderRadius:'9999px', fontSize:'0.75rem', fontWeight:700, cursor:'pointer', border:`1.5px solid ${active?m.color+'55':'var(--border)'}`, background:active?`${m.color}12`:'var(--surface-raise)', color:active?m.color:'var(--ink-faint)', transition:'all 0.2s' }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:m.color, display:'inline-block' }} />
              {m.key}
            </button>
          );
        })}
      </div>

      {chartData.length === 0 ? (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:220, borderRadius:'0.875rem', border:'2px dashed var(--border)', background:'var(--surface)', gap:'0.5rem' }}>
          <BarChart3 style={{ width:28, height:28, color:'var(--border-strong)' }} />
          <p style={{ fontSize:'0.8125rem', fontWeight:600, color:'var(--ink-faint)' }}>No data for selected period</p>
        </div>
      ) : (
        <div style={{ height:240, width:'100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top:10, right:4, left:4, bottom:0 }}>
              <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="0" />
              <XAxis dataKey="date" hide />
              <YAxis hide domain={['dataMin - 200','dataMax + 500']} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke:'var(--border)', strokeWidth:1, strokeDasharray:'4 4' }} isAnimationActive={false} />
              <Line type="monotone" dataKey={activeMetric} stroke={metricColorHex} strokeWidth={2.5} dot={false}
                activeDot={{ r:5, fill:metricColorHex, stroke:'#fff', strokeWidth:2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Range selector */}
      <div style={{ marginTop:'1rem', display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'center', gap:'0.375rem' }}>
        {['1W','1M','3M','6M','1Y','All'].map(r => (
          <button key={r} onClick={() => setActiveRange(r)}
            style={{ padding:'0.3rem 0.875rem', fontSize:'0.75rem', fontWeight:700, borderRadius:'9999px', cursor:'pointer', border:'none', transition:'all 0.2s', background:activeRange===r?'var(--ink)':'transparent', color:activeRange===r?'var(--accent)':'var(--ink-faint)' }}>
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
    <div className="rp-font-body" style={{ backgroundColor:'var(--surface)', minHeight:'100vh', padding:'0.25rem' }}>
      <style>{REPORT_STYLES}</style>
      <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
        <div style={{ height:132, borderRadius:'1.75rem', background:'#e5e7eb', animation:'rp-fade-up 0.3s ease both' }} />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.875rem' }}>
          {[...Array(3)].map((_,i) => <div key={i} style={{ height:80, borderRadius:'1.125rem', background:'#f3f4f6' }} />)}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem' }}>
          {[...Array(3)].map((_,i) => <div key={i} style={{ height:108, borderRadius:'1.25rem', background:'#f3f4f6' }} />)}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem' }}>
          {[...Array(4)].map((_,i) => <div key={i} style={{ height:104, borderRadius:'1.25rem', background:'#f3f4f6' }} />)}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'1.5rem' }}>
          <div style={{ height:320, borderRadius:'1.5rem', background:'#f3f4f6' }} />
          <div style={{ height:320, borderRadius:'1.5rem', background:'#f3f4f6' }} />
        </div>
      </div>
    </div>
  );
}

/* ─── Helpers ─── */
function formatHighlight(text) {
  if (typeof text !== 'string') return text;
  const html = text
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.*?)\*/g,'<em>$1</em>');
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
