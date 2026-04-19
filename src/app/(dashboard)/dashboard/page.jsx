'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { dashboardService } from '@/services/dashboardService';
import {
  PlusCircle,
  ShoppingBag,
  Wrench,
  AlertCircle,
  TrendingUp,
  Clock,
  ChevronRight,
  FileEdit,
  CheckCircle2,
  XOctagon,
  PackageCheck,
  IndianRupee,
  Activity,
  Zap,
  ArrowUpRight,
  Sparkles,
  Bell,
  TriangleAlert,
  CircleCheck,
} from 'lucide-react';
import { cn, formatCurrency, formatDate, formatTime, formatNumber } from '@/lib/utils';
import { MetricDetailsDialog } from '@/components/MetricDetailsDialog';
import { toast } from 'sonner';
import { historyService } from '@/services/historyService';

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN PHILOSOPHY
   ─ Single accent: #f97316 (orange)  |  Dark ink: #0d0d0d  |  Surface: #fafafa
   ─ Motion IS the visual hierarchy — tilt, count-up, reveal, morphing blobs
   ─ No rainbow gradients; depth via shadow + motion + monochrome layering
───────────────────────────────────────────────────────────────────────────── */

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600;700;800&family=Geist+Mono:wght@400;600;700&display=swap');

:root {
  --accent:        #f97316;
  --accent-glow:   #fb923c;
  --accent-dim:    rgba(249,115,22,0.08);
  --ink:           #0f172a;
  --ink-mid:       #475569;
  --ink-faint:     #94a3b8;
  --surface:       #f1f5f9;
  --surface-raise: #ffffff;
  --border:        #e2e8f0;
  --border-lux:    rgba(255,255,255,0.7);
  --ease-lux:      cubic-bezier(0.16, 1, 0.3, 1);
  --ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1);
}

.font-display { font-family: 'Instrument Serif', Georgia, serif; }
.font-body    { font-family: 'Geist', system-ui, sans-serif; }
.font-mono    { font-family: 'Geist Mono', monospace; }

/* ────────────────── VFX KEYFRAMES ────────────────── */

@keyframes vfx-star-drift {
  from { transform: perspective(1000px) rotateX(0deg) translateZ(0); }
  to   { transform: perspective(1000px) rotateX(2deg) translateZ(300px); }
}

@keyframes vfx-mesh-float {
  0%, 100% { background-position: 0% 50%; opacity: 0.1; }
  50% { background-position: 100% 50%; opacity: 0.2; }
}

@keyframes vfx-flare {
  0%   { transform: rotate(0deg) scale(1); opacity: 0.5; }
  50%  { transform: rotate(180deg) scale(1.2); opacity: 0.8; }
  100% { transform: rotate(360deg) scale(1); opacity: 0.5; }
}

@keyframes vfx-floating {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

@keyframes vfx-fade-in-up {
  from { opacity: 0; transform: translateY(20px); filter: blur(5px); }
  to   { opacity: 1; transform: translateY(0); filter: blur(0); }
}

@keyframes vfx-live-pulse {
  0%   { transform: scale(1);   opacity: 1; }
  100% { transform: scale(2.5); opacity: 0; }
}

@keyframes vfx-draw-border {
  from { stroke-dashoffset: 600; }
  to   { stroke-dashoffset: 0; }
}

/* ────────────────── UTILITIES ────────────────── */

.lux-glass {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(25px) saturate(200%);
  border: 1px solid var(--border-lux);
}

.lux-card {
  transition: all 0.6s var(--ease-lux);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
}
.lux-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  border-color: var(--accent-glow) !important;
}

.lux-shadow-deep {
  box-shadow: 0 32px 64px -16px rgba(0, 0, 0, 0.12);
}

/* ────────────────── MESH BACKGROUND ────────────────── */
.mesh-bg {
  position: absolute; inset: 0;
  background: radial-gradient(at 0% 0%, hsla(25,100%,70%,0.2) 0, transparent 50%),
              radial-gradient(at 50% 0%, hsla(25,100%,80%,0.15) 0, transparent 50%),
              radial-gradient(at 100% 100%, hsla(25,100%,90%,0.2) 0, transparent 50%);
  background-size: 200% 200%;
  animation: vfx-mesh-float 20s ease infinite;
  pointer-events: none;
}

/* ────────────────── STAGGER ENTRANCE ────────────────── */
.stagger > *:nth-child(1) { animation: vfx-fade-in-up 0.6s var(--ease-lux) 0.05s both; }
.stagger > *:nth-child(2) { animation: vfx-fade-in-up 0.6s var(--ease-lux) 0.10s both; }
.stagger > *:nth-child(3) { animation: vfx-fade-in-up 0.6s var(--ease-lux) 0.15s both; }
.stagger > *:nth-child(4) { animation: vfx-fade-in-up 0.6s var(--ease-lux) 0.20s both; }
.stagger > *:nth-child(5) { animation: vfx-fade-in-up 0.6s var(--ease-lux) 0.25s both; }
.stagger > *:nth-child(6) { animation: vfx-fade-in-up 0.6s var(--ease-lux) 0.30s both; }

.section-enter { animation: vfx-fade-in-up 0.8s var(--ease-lux) both; }

/* ────────────────── DIALOG ────────────────── */
[role="dialog"] {
  border-radius: 2rem !important;
  border: 1px solid var(--border) !important;
  box-shadow: 0 40px 100px -20px rgba(0,0,0,0.2) !important;
  font-family: 'Geist', sans-serif !important;
}
[role="dialog"] h2, [role="dialog"] [data-radix-dialog-title] {
  font-family: 'Geist', sans-serif !important;
  font-size: 0.9375rem !important; font-weight: 600 !important;
  color: var(--ink) !important;
}
[role="dialog"] table { width: 100%; border-collapse: separate; border-spacing: 0 4px; }
[role="dialog"] thead th {
  font-size: 0.65rem !important; font-weight: 700 !important;
  text-transform: uppercase !important; letter-spacing: 0.1em !important;
  color: var(--ink-faint) !important; padding: 4px 10px !important;
}
[role="dialog"] tbody tr { background: #f9fafb; border-radius: 10px; transition: background 0.15s; }
[role="dialog"] tbody tr:hover { background: #fff7ed !important; }
[role="dialog"] tbody td {
  padding: 8px 10px !important; font-size: 0.8125rem !important;
  font-weight: 500 !important; color: var(--ink-mid) !important; border-top: none !important;
}
[role="dialog"] tbody td:first-child { border-radius: 10px 0 0 10px; }
[role="dialog"] tbody td:last-child  { border-radius: 0 10px 10px 0; }
`;

/* ─── Style Injector ─── */
function StyleInjector() {
  useEffect(() => {
    if (document.getElementById('dash-v2')) return;
    const el = document.createElement('style');
    el.id = 'dash-v2';
    el.textContent = STYLES;
    document.head.appendChild(el);
  }, []);
  return null;
}

/* ─── Ripple hook ─── */
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
      top:  `${e.clientY - r.top  - d / 2}px`,
    });
    btn.appendChild(circle);
    setTimeout(() => circle.remove(), 700);
  }, []);
}

/* ─── 3D Tilt hook ─── */
function useTilt(strength = 6) {
  const ref = useRef(null);
  const onMove = useCallback((e) => {
    const el = ref.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
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

/* ─── Count-up hook ─── */
function useCountUp(target, duration = 1000, delay = 0) {
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
   MAIN DASHBOARD
═══════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    received: 0, inProgress: 0, waitingForParts: 0, completedNotReturned: 0,
    registeredToday: 0, completedToday: 0, notRepairableToday: 0,
    returnedToday: 0, salesToday: 0, revenueToday: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalActivities, setTotalActivities] = useState(0);
  const [activityLoading, setActivityLoading] = useState(false);
  const [isRevenueOpen, setIsRevenueOpen] = useState(false);
  const [now, setNow] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  const PER_PAGE = 5;
  const MAX_ACT  = 50;

  useEffect(() => {
    fetchAll();
    const t = setInterval(() => setNow(new Date()), 60000);
    setTimeout(() => setMounted(true), 50);
    return () => clearInterval(t);
  }, []);

  useEffect(() => { if (!loading) fetchActivity(); }, [currentPage]);

  async function fetchAll() {
    try {
      setLoading(true);
      const [s, a] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getRecentActivity(currentPage, PER_PAGE, MAX_ACT),
      ]);
      setStats(s);
      setRecentActivity(a.data || []);
      setTotalActivities(a.total || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function fetchActivity() {
    try {
      setActivityLoading(true);
      const r = await dashboardService.getRecentActivity(currentPage, PER_PAGE, MAX_ACT);
      setRecentActivity(r.data || []);
      setTotalActivities(r.total || 0);
    } catch (e) { console.error(e); }
    finally { setActivityLoading(false); }
  }

  async function handleActivityClick(activity) {
    const svc = activity.services;
    if (!svc?.id) return;
    if (svc.status === 'Returned') {
      if (profile?.role === 'admin' || profile?.role === 'owner') {
        router.push(`/history?tab=services&serviceId=${svc.id}`);
      } else {
        try {
          const h = await historyService.getServiceHistory(profile);
          if (h.some(s => s.id === svc.id)) router.push(`/history?tab=services&serviceId=${svc.id}`);
          else toast.error('You do not have permission to view this service.');
        } catch { toast.error('Error verifying access'); }
      }
    } else {
      router.push(`/services?serviceId=${svc.id}`);
    }
  }

  if (loading) return <DashboardSkeleton />;

  const totalPages = Math.ceil(Math.min(totalActivities, MAX_ACT) / PER_PAGE);
  const h = now.getHours();
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';

  const S = { // luxury style helpers
    panel: {
      background: 'var(--surface-raise)',
      border: '1px solid var(--border)',
      borderRadius: '2rem',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
    },
    topAccentBar: {
      position: 'absolute', top: 0, left: '2rem', right: '2rem', height: 3,
      background: 'linear-gradient(90deg, var(--accent), transparent)',
      opacity: 0.4,
    },
    panelTitle: {
      display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem',
    },
    panelIcon: {
      width: 36, height: 36, borderRadius: '0.875rem',
      background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
  };

  return (
    <>
      <StyleInjector />
      <div className="font-body" style={{ backgroundColor: 'var(--surface)', minHeight: '100vh', padding: '0.75rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 1600, margin: '0 auto' }}>

          {/* ══════════ HERO HEADER ══════════ */}
          <header
            className={cn(mounted && 'section-enter', 'lux-shadow-deep')}
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              borderRadius: '2.5rem',
              padding: '3rem',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* VFX LAYERS */}
            <div className="mesh-bg" />
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              <div style={{ position: 'absolute', width: '200%', height: '200%', top: '-50%', left: '-50%', background: 'radial-gradient(circle, rgba(249,115,22,0.05) 1px, transparent 1px)', backgroundSize: '60px 60px', animation: 'vfx-star-drift 120s linear infinite' }} />
              {/* FLYERS / PARTICLES */}
              <div style={{ position: 'absolute', top: '20%', left: '10%', width: 40, height: 40, borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%', background: 'linear-gradient(45deg, var(--accent), transparent)', opacity: 0.1, animation: 'vfx-floating 8s ease-in-out infinite' }} />
              <div style={{ position: 'absolute', bottom: '15%', right: '15%', width: 60, height: 60, borderRadius: '50%', border: '1px solid var(--accent)', opacity: 0.05, animation: 'vfx-floating 12s ease-in-out infinite reverse' }} />
            </div>

            <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '2rem' }}>
              <div style={{ flex: 1, minWidth: 300 }}>
                <p className="font-mono" style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '1rem' }}>
                  System Active • {formatDate(now)}
                </p>
                <h1 className="font-display" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 400, lineHeight: 1.1, color: '#fff', marginBottom: '1.5rem', fontStyle: 'italic' }}>
                  {greeting}, <span style={{ color: 'var(--accent)', textShadow: '0 0 40px rgba(249,115,22,0.4)' }}>{profile?.name?.split(' ')[0] || 'Operator'}</span>
                </h1>
                <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.5)', maxWidth: 500, lineHeight: 1.6 }}>
                  Operational parameters are nominal. System synchronization completed at {formatTime(now)}.
                </p>
              </div>

              <div className="lux-glass" style={{ borderRadius: '2rem', padding: '1.5rem 2.5rem', textAlign: 'right', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="font-mono" style={{ fontSize: '3rem', fontWeight: 600, letterSpacing: '-0.05em', color: '#fff', lineHeight: 1, margin: 0 }}>
                  {formatTime(now).split(' ')[0]}
                </p>
                <p style={{ fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem' }}>
                  {formatTime(now).split(' ')[1]}
                </p>
              </div>
            </div>
          </header>

          {/* ══════════ WORK PRIORITY ══════════ */}
          <section className={cn(mounted && 'section-enter')} style={{ animationDelay: '0.15s' }}>
            <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
              <PriorityCard title="Received"               count={stats.received}            statusColor="#3b82f6" onClick={() => router.push('/services?status=Received')} />
              <PriorityCard title="In Progress"            count={stats.inProgress}           statusColor="#f97316" onClick={() => router.push('/services?status=In Progress')} />
              <PriorityCard title="Waiting for Parts"      count={stats.waitingForParts}      statusColor="#f59e0b" onClick={() => router.push('/services?status=Waiting for Parts')} />
              <PriorityCard title="Completed"              count={stats.completedNotReturned} statusColor="#10b981" onClick={() => router.push('/services?status=Completed')} />
            </div>
          </section>

          {/* ══════════ QUICK ACTIONS ══════════ */}
          <section className={cn(mounted && 'section-enter')} style={{ animationDelay: '0.2s' }}>
            <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {[
                { name: 'Service Intake', desc: 'Initialize new repair ticket',  icon: PlusCircle,  href: '/services?action=new', accent: '#3b82f6' },
                { name: 'Point of Sale',  desc: 'Process product transaction', icon: ShoppingBag, href: '/sales?action=new',   accent: '#a855f7' },
                { name: 'Repair Hub',      desc: 'Active diagnostic queue',      icon: Wrench,      href: '/services',        accent: '#f59e0b' },
              ].map(a => <QuickActionButton key={a.name} action={a} onClick={() => router.push(a.href)} />)}
            </div>
          </section>

          {/* ══════════ TODAY SUMMARY ══════════ */}
          <section className={cn(mounted && 'section-enter')} style={{ animationDelay: '0.25s' }}>
            <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
              <SummaryCard title="Today's Revenue" value={formatCurrency(stats.revenueToday)} icon={IndianRupee} dotColor="#f97316" isCurrency large
                onClick={() => { if (profile?.role === 'admin' || profile?.role === 'owner') setIsRevenueOpen(true); }} />
              <SummaryCard title="Registered Today" value={stats.registeredToday} icon={FileEdit} dotColor="#3b82f6" />
              <SummaryCard title="Completed Today" value={stats.completedToday} icon={CheckCircle2} dotColor="#10b981" />
              <SummaryCard title="Returned Today" value={stats.returnedToday} icon={PackageCheck} dotColor="#06b6d4" />
              <SummaryCard title="Sales Today" value={stats.salesToday} icon={ShoppingBag} dotColor="#a855f7" />
            </div>
          </section>

          {/* ══════════ BOTTOM GRID ══════════ */}
          <div className={cn(mounted && 'section-enter')} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', animationDelay: '0.3s' }}>

            {/* Recent Activity */}
            <section style={S.panel} className="lux-shadow-deep">
              <div style={S.topAccentBar} />
              <div style={S.panelTitle}>
                <div style={S.panelIcon}><Clock style={{ width: 18, height: 18, color: 'var(--accent)' }} /></div>
                <span style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--ink)' }}>Recent Activity</span>
                <span style={{
                  marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem',
                  fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: '#10b981', background: '#f0fdf4',
                  borderRadius: 100, padding: '0.4rem 0.8rem', border: '1px solid #bbf7d0',
                }}>
                  <span style={{ position: 'relative', display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#10b981' }}>
                    <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#10b981', animation: 'vfx-live-pulse 2s infinite' }} />
                  </span>
                  Live
                </span>
              </div>

              {activityLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} style={{ height: 84, borderRadius: '1.25rem', background: '#f1f5f9', animation: `vfx-fade-in-up 0.4s var(--ease-lux) ${i * 0.05}s both` }} />
                  ))}
                </div>
              ) : recentActivity.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 240, borderRadius: '1.5rem', border: '2px dashed var(--border)', background: 'var(--surface)', gap: '1rem' }}>
                  <Activity style={{ width: 40, height: 40, color: 'var(--ink-faint)', opacity: 0.2 }} />
                  <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--ink-faint)' }}>Queue is empty today</p>
                </div>
              ) : (
                <>
                  <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {recentActivity.map((activity, i) => (
                      <ActivityRow
                        key={activity.id || i}
                        activity={activity}
                        isMine={activity.updated_by === profile?.id}
                        ss={getStatusStyles(activity.status)}
                        index={i}
                        onClickHandler={handleActivityClick}
                      />
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <PaginationBtn label="← Previous" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} />
                      <p className="font-mono" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ink-faint)' }}>
                        <span style={{ color: 'var(--ink)' }}>{currentPage}</span> / {totalPages}
                      </p>
                      <PaginationBtn label="Next →" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} />
                    </div>
                  )}
                </>
              )}
            </section>

            {/* Smart Alerts */}
            <section style={S.panel} className="lux-shadow-deep">
              <div style={S.topAccentBar} />
              <div style={S.panelTitle}>
                <div style={S.panelIcon}><Bell style={{ width: 18, height: 18, color: 'var(--accent)' }} /></div>
                <span style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--ink)' }}>Smart Alerts</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {stats.alerts ? (
                  <>
                    {stats.alerts.oldInProgress > 0 && (
                      <AlertItem message={`${stats.alerts.oldInProgress} services have been in progress for more than 3 days.`} type="warning" index={0} />
                    )}
                    {stats.alerts.oldWaitingForParts > 0 && (
                      <AlertItem message={`Action Required: ${stats.alerts.oldWaitingForParts} items stuck in parts queue.`} type="danger" index={1} />
                    )}
                    {stats.alerts.oldCompletedNotReturned > 0 && (
                      <AlertItem message={`${stats.alerts.oldCompletedNotReturned} items ready for weeks, pending customer collection.`} type="warning" index={2} />
                    )}
                    {stats.alerts.oldInProgress === 0 && stats.alerts.oldWaitingForParts === 0 && stats.alerts.oldCompletedNotReturned === 0 && (
                      <AlertItem message="All operations are running smooth! No bottlenecks detected." type="success" index={0} />
                    )}
                  </>
                ) : (
                  <>
                    <div style={{ height: 64, borderRadius: '1.25rem', background: '#f1f5f9', animation: 'vfx-fade-in-up 0.4s var(--ease-lux) both' }} />
                    <div style={{ height: 64, borderRadius: '1.25rem', background: '#f1f5f9', animation: 'vfx-fade-in-up 0.4s var(--ease-lux) 0.08s both' }} />
                  </>
                )}
              </div>
            </section>
          </div>

        </div>

        {isRevenueOpen && (
          <RevenueBreakdownModal
            onClose={() => setIsRevenueOpen(false)}
            serviceRevenue={stats.serviceRevenueToday}
            salesRevenue={stats.salesRevenueToday}
            router={router}
          />
        )}
      </div>
    </>
  );
}

/* ─── SectionLabel ─── */
function SectionLabel({ icon: Icon, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.875rem' }}>
      <div style={{ width: 24, height: 24, borderRadius: '0.375rem', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon style={{ width: 12, height: 12, color: 'var(--accent)' }} strokeWidth={2.5} />
      </div>
      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ink-mid)', letterSpacing: '0.01em' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--border)', borderRadius: 2 }} />
    </div>
  );
}

/* ─── QuickActionButton ─── */
function QuickActionButton({ action: a, onClick }) {
  const ripple = useRipple();
  const [hovered, setHovered] = useState(false);
  const { ref, onMouseMove, onMouseLeave } = useTilt(4);
  
  return (
    <button
      ref={ref}
      onClick={(e) => { ripple(e); onClick(); }}
      onMouseMove={onMouseMove}
      onMouseLeave={() => { onMouseLeave(); setHovered(false); }}
      onMouseEnter={() => setHovered(true)}
      className="lux-card ripple-host"
      style={{
        position: 'relative', display: 'flex', alignItems: 'center', gap: '1.25rem',
        padding: '1.25rem', borderRadius: '1.5rem', cursor: 'pointer', textAlign: 'left',
        background: hovered ? 'var(--ink)' : 'var(--surface-raise)',
        border: '1.5px solid var(--border)',
        overflow: 'hidden', willChange: 'transform',
      }}
    >
      {/* MAGNETIC GLOW VFX */}
      {hovered && (
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at center, ${a.accent}15 0%, transparent 70%)`, pointerEvents: 'none' }} />
      )}
      
      {/* SVG BORDER DRAWING */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: hovered ? 1 : 0, transition: 'opacity 0.3s' }}>
        <rect x="0" y="0" width="100%" height="100%" fill="none" stroke={a.accent} strokeWidth="2" strokeDasharray="600"
          style={{ animation: hovered ? 'vfx-draw-border 1.5s var(--ease-lux) forwards' : 'none' }} rx="24" />
      </svg>

      <div style={{
        width: 48, height: 48, borderRadius: '1rem', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: hovered ? `${a.accent}20` : 'var(--surface)',
        border: `1px solid ${hovered ? `${a.accent}40` : 'var(--border)'}`,
        transition: 'all 0.4s var(--ease-lux)',
        transform: hovered ? 'scale(1.1) rotate(5deg)' : 'scale(1)',
      }}>
        <a.icon style={{ width: 22, height: 22, color: hovered ? a.accent : 'var(--ink-mid)' }} strokeWidth={2} />
      </div>
      
      <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
        <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: hovered ? '#fff' : 'var(--ink)', transition: 'color 0.3s' }}>{a.name}</p>
        <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: hovered ? 'rgba(255,255,254,0.4)' : 'var(--ink-faint)', transition: 'color 0.3s' }}>{a.desc}</p>
      </div>

      <ArrowUpRight style={{ width: 18, height: 18, color: hovered ? a.accent : 'var(--border-strong)', transform: hovered ? 'translate(2px, -2px)' : 'none', transition: 'all 0.3s' }} />
    </button>
  );
}

/* ─── PriorityCard ─── */
function PriorityCard({ title, count, statusColor, onClick }) {
  const animated = useCountUp(count, 1200, 400);
  const [hovered, setHovered] = useState(false);
  const { ref, onMouseMove, onMouseLeave } = useTilt(5);

  return (
    <button
      ref={ref} onClick={onClick}
      onMouseMove={onMouseMove}
      onMouseLeave={() => { onMouseLeave(); setHovered(false); }}
      onMouseEnter={() => setHovered(true)}
      className="lux-card ripple-host"
      style={{
        textAlign: 'left', cursor: 'pointer', borderRadius: '1.5rem', padding: '1.5rem',
        background: 'var(--surface-raise)', border: '1.5px solid var(--border)',
        position: 'relative', overflow: 'hidden', willChange: 'transform',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: statusColor, transform: hovered ? 'scaleX(1)' : 'scaleX(0)', transformOrigin: 'left', transition: 'transform 0.4s var(--ease-lux)' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ position: 'relative', width: 10, height: 10 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: statusColor, boxShadow: `0 0 10px ${statusColor}` }} />
          {hovered && <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', background: statusColor, opacity: 0.3, animation: 'vfx-live-pulse 1.5s infinite' }} />}
        </div>
        <Activity style={{ width: 14, height: 14, color: hovered ? statusColor : 'var(--ink-faint)', transition: 'color 0.3s' }} />
      </div>
      <p className="font-mono" style={{ fontSize: '2.75rem', fontWeight: 700, letterSpacing: '-0.05em', lineHeight: 1, color: 'var(--ink)', margin: 0 }}>
        {animated}
      </p>
      <p style={{ marginTop: '0.75rem', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--ink-faint)', letterSpacing: '0.01em' }}>{title}</p>
    </button>
  );
}

/* ─── SummaryCard ─── */
function SummaryCard({ title, value, isCurrency, onClick, icon: Icon, dotColor, large, horizontal }) {
  const animated = typeof value === 'number' ? useCountUp(value, 1100, 500) : value;
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="lux-card ripple-host"
      style={{
        width: '100%', height: '100%', textAlign: 'left', cursor: 'pointer',
        borderRadius: '1.5rem', padding: large ? '2rem' : horizontal ? '1rem 1.25rem' : '1.25rem',
        background: 'var(--surface-raise)', border: '1.5px solid var(--border)',
        position: 'relative', overflow: 'hidden',
        display: horizontal ? 'flex' : 'block', alignItems: horizontal ? 'center' : 'stretch', gap: horizontal ? '1rem' : 0,
      }}
    >
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: horizontal ? 0 : 'auto', right: horizontal ? 'auto' : 0, width: horizontal ? 3 : 'auto', height: horizontal ? 'auto' : 3, background: dotColor, transform: hovered ? (horizontal ? 'scaleY(1)' : 'scaleX(1)') : (horizontal ? 'scaleY(0)' : 'scaleX(0)'), transformOrigin: horizontal ? 'top' : 'left', transition: 'transform 0.4s var(--ease-lux)' }} />
      
      <div style={{
        width: large ? 56 : 40, height: large ? 56 : 40, borderRadius: '1rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `${dotColor}12`, marginBottom: horizontal ? 0 : '1rem',
        transform: hovered ? 'scale(1.1) rotate(-5deg)' : 'scale(1)', transition: 'all 0.4s var(--ease-lux)',
      }}>
        <Icon style={{ width: large ? 24 : 18, height: large ? 24 : 18, color: dotColor }} strokeWidth={2.5} />
      </div>

      <div style={{ flex: 1 }}>
        <p className="font-mono" style={{ fontSize: large ? '2.5rem' : horizontal ? '1.25rem' : '1.75rem', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.1, color: 'var(--ink)', margin: 0 }}>
          {isCurrency ? value : animated}
        </p>
        <p style={{ marginTop: '0.375rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{title}</p>
      </div>
    </button>
  );
}

/* ─── ActivityRow ─── */
function ActivityRow({ activity, isMine, ss, index, onClickHandler }) {
  const ripple = useRipple();
  const [hovered, setHovered] = useState(false);
  
  return (
    <button
      onClick={(e) => { ripple(e); onClickHandler(activity); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="lux-card ripple-host"
      style={{
        width: '100%', textAlign: 'left', cursor: 'pointer',
        borderRadius: '1.25rem', padding: '1rem 1.25rem',
        border: `1.5px solid ${isMine ? 'var(--accent)' : 'var(--border)'}`,
        background: isMine ? 'linear-gradient(135deg, #fff7ed 0%, #fff 100%)' : 'var(--surface-raise)',
        display: 'flex', alignItems: 'center', gap: '1rem', overflow: 'hidden',
        animation: `vfx-fade-in-up 0.4s var(--ease-lux) ${index * 0.04}s both`,
      }}
    >
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: ss.dotColor, boxShadow: `0 0 8px ${ss.dotColor}80` }} />
        <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', background: ss.dotColor, opacity: 0.3, animation: 'vfx-live-pulse 2s infinite' }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--ink)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {activity.services?.customer_name || 'Anonymous Operator'}
          </p>
          <span className="font-mono" style={{ fontSize: '0.6875rem', color: 'var(--ink-faint)' }}>{formatTime(activity.created_at)}</span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--ink-faint)', margin: '0.25rem 0 0.5rem' }}>
          {[activity.services?.device_brand, activity.services?.device_model].filter(Boolean).join(' ') || 'Legacy Hardware'}
        </p>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.625rem', borderRadius: '0.5rem', background: `${ss.dotColor}10`, color: ss.dotColor, fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {activity.status}
        </span>
      </div>

      <ChevronRight style={{ width: 18, height: 18, color: hovered ? 'var(--ink)' : 'var(--border-strong)', transform: hovered ? 'translateX(4px)' : 'none', transition: 'all 0.3s var(--ease-lux)' }} />
    </button>
  );
}

/* ─── PaginationBtn ─── */
function PaginationBtn({ label, disabled, onClick }) {
  const ripple = useRipple();
  return (
    <button
      onClick={(e) => { ripple(e); onClick(); }}
      disabled={disabled}
      className="ripple-host"
      style={{ padding: '0.375rem 0.875rem', borderRadius: '0.625rem', border: '1.5px solid var(--border)', background: 'var(--surface-raise)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ink-mid)', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1, transition: 'all 0.2s' }}
    >{label}</button>
  );
}

/* ─── AlertItem ─── */
function AlertItem({ message, type, index = 0 }) {
  const cfg = {
    warning: { bg: 'rgba(255, 251, 235, 0.5)', border: '#fde68a', text: '#92400e', icon: TriangleAlert, iconColor: '#f59e0b', accent: '#f59e0b' },
    danger:  { bg: 'rgba(254, 242, 242, 0.5)', border: '#fecaca', text: '#991b1b', icon: AlertCircle,   iconColor: '#ef4444', accent: '#ef4444' },
    success: { bg: 'rgba(240, 253, 244, 0.5)', border: '#bbf7d0', text: '#166534', icon: CircleCheck,   iconColor: '#22c55e', accent: '#22c55e' },
  }[type];
  const Ic = cfg.icon;

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '0.875rem', borderRadius: '1rem',
      padding: '1rem', background: cfg.bg, border: `1px solid ${cfg.border}`,
      color: cfg.text, fontSize: '0.8125rem', fontWeight: 500, lineHeight: 1.5,
      position: 'relative', overflow: 'hidden', backdropFilter: 'blur(8px)',
      animation: `vfx-fade-in-up 0.5s var(--ease-lux) ${index * 0.1}s both`,
    }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: cfg.accent }} />
      <Ic style={{ width: 18, height: 18, color: cfg.iconColor, flexShrink: 0, marginTop: 1 }} />
      <span>{message}</span>
    </div>
  );
}

/* ─── RevenueBreakdownModal ─── */
function RevenueBreakdownModal({ onClose, serviceRevenue, salesRevenue, router }) {
  const ripple = useRipple();
  const total = (serviceRevenue || 0) + (salesRevenue || 0);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2, 6, 23, 0.7)', backdropFilter: 'blur(12px)', padding: '1rem', animation: 'vfx-fade-in-up 0.5s var(--ease-lux) both' }}>
      <div style={{ width: '100%', maxWidth: 400, borderRadius: '2rem', background: 'var(--surface-raise)', overflow: 'hidden', boxShadow: '0 40px 120px rgba(0,0,0,0.5)', border: '1px solid var(--border)' }}>
        <div style={{ background: 'var(--ink)', padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--accent)' }} />
          <div>
            <p className="font-mono" style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '0.25rem' }}>Audit Log</p>
            <h3 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 400, color: '#fff', margin: 0, fontStyle: 'italic' }}>Financial Distribution</h3>
          </div>
          <button onClick={(e) => { ripple(e); onClose(); }} className="ripple-host" style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>✕</button>
        </div>
        
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <RevenueRow label="Hardware Services" sublabel="Technical repair billings" amount={serviceRevenue || 0} onClick={() => router.push('/history?tab=services&today=returned')} accentColor="#3b82f6" />
          <RevenueRow label="Accessory Sales"    sublabel="Point of sale inventory" amount={salesRevenue   || 0} onClick={() => router.push('/history?tab=sales&today=true')}       accentColor="#a855f7" />
          
          <div style={{ borderRadius: '1.25rem', background: 'var(--ink)', padding: '1.25rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', margin: 0 }}>Total Liquidity</p>
            <p className="font-mono" style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.05em', color: 'var(--accent)', margin: 0 }}>{formatCurrency(total)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RevenueRow({ label, sublabel, amount, onClick, accentColor }) {
  const [hovered, setHovered] = useState(false);
  const ripple = useRipple();

  return (
    <button onClick={(e) => { ripple(e); onClick(); }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} className="ripple-host lux-card"
      style={{ width: '100%', textAlign: 'left', cursor: 'pointer', borderRadius: '1.25rem', padding: '1.25rem 1.5rem', border: `1.5px solid ${hovered ? accentColor : 'var(--border)'}`, background: hovered ? `${accentColor}08` : 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <p style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: accentColor, margin: 0 }}>{label}</p>
        <p style={{ fontSize: '0.8125rem', color: 'var(--ink-faint)', margin: '0.25rem 0 0', fontWeight: 500 }}>{sublabel}</p>
      </div>
      <p className="font-mono" style={{ fontSize: '1.375rem', fontWeight: 700, letterSpacing: '-0.03em', color: accentColor, margin: 0 }}>{formatCurrency(amount)}</p>
    </button>
  );
}

/* ─── DashboardSkeleton ─── */
function DashboardSkeleton() {
  return (
    <div className="font-body" style={{ backgroundColor: 'var(--surface)', minHeight: '100vh', padding: '0.25rem' }}>
      <style>{STYLES}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ height: 128, borderRadius: '1.75rem', background: '#e5e7eb', animation: 'fade-up 0.3s ease both' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem' }}>
          {[...Array(3)].map((_,i) => <div key={i} style={{ height: 72, borderRadius: '1.125rem', background: '#f3f4f6' }} />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
          {[...Array(4)].map((_,i) => <div key={i} style={{ height: 104, borderRadius: '1.25rem', background: '#f3f4f6' }} />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '0.875rem' }}>
          {[...Array(6)].map((_,i) => <div key={i} style={{ height: 96, borderRadius: '1.125rem', background: '#f3f4f6' }} />)}
        </div>
      </div>
    </div>
  );
}

/* ─── Status styles helper ─── */
function getStatusStyles(status = '') {
  const s = status.toLowerCase();
  const c = (color) => ({ dotColor: color });
  if (s.includes('received'))                                                                  return c('#3b82f6');
  if (s.includes('diagnosed'))                                                                 return c('#8b5cf6');
  if (s.includes('repair started')||s.includes('repairing')||s.includes('in repair'))         return c('#f97316');
  if (s.includes('in progress'))                                                               return c('#f97316');
  if (s.includes('waiting'))                                                                   return c('#f59e0b');
  if (s.includes('completed'))                                                                 return c('#10b981');
  if (s.includes('returned'))                                                                  return c('#22c55e');
  if (s.includes('cancel')||s.includes('non repairable')||s.includes('rejected'))             return c('#ef4444');
  return c('#6b7280');
}
