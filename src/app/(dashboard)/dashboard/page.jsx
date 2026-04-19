"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Activity, Bell, CheckCircle2, Clock, 
  IndianRupee, PackageCheck, PlusCircle, 
  ShoppingBag, Wrench, FileEdit, ChevronRight, 
  ArrowUpRight, Sparkles, Zap, TriangleAlert, AlertCircle, CircleCheck
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { dashboardService } from '@/services/dashboardService';
import { cn, formatCurrency, formatDate, formatTime, formatNumber } from '@/lib/utils';
import { MetricDetailsDialog } from '@/components/MetricDetailsDialog';
import { toast } from 'sonner';

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN PHILOSOPHY: LUXURY & FLUID V4
   ─ High-motion "Nebula" architecture with deep glassmorphism.
   ─ Magnetic interactions with SVG border-drawing effects.
   ─ Dynamic mesh-glow system with orbiting elements.
───────────────────────────────────────────────────────────────────────────── */

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600;700;800&family=Geist+Mono:wght@400;600;700&display=swap');

:root {
  --accent:        #f97316;
  --accent-glow:   #fb923c;
  --accent-dim:    rgba(249,115,22,0.12);
  --ink:           #0f172a;
  --ink-mid:       #475569;
  --ink-faint:     #94a3b8;
  --surface:       #f8fafc;
  --surface-raise: #ffffff;
  --border:        #e2e8f0;
  --border-lux:    rgba(255,255,255,0.7);
  --ease-lux:      cubic-bezier(0.16, 1, 0.3, 1);
}

.font-display { font-family: 'Instrument Serif', Georgia, serif; }
.font-body    { font-family: 'Geist', system-ui, sans-serif; }
.font-mono    { font-family: 'Geist Mono', monospace; }

@keyframes vfx-star-drift {
  from { transform: perspective(1000px) rotateX(0deg) translateZ(0); }
  to   { transform: perspective(1000px) rotateX(2deg) translateZ(300px); }
}

@keyframes vfx-mesh-float {
  0%, 100% { background-position: 0% 50%; opacity: 0.1; }
  50% { background-position: 100% 50%; opacity: 0.25; }
}

@keyframes vfx-orbit {
  from { transform: rotate(0deg) translateX(40px) rotate(0deg); }
  to   { transform: rotate(360deg) translateX(40px) rotate(-360deg); }
}

@keyframes vfx-fade-in-up {
  from { opacity: 0; transform: translateY(30px); filter: blur(10px); }
  to   { opacity: 1; transform: translateY(0); filter: blur(0); }
}

@keyframes vfx-live-pulse {
  0%   { transform: scale(1);   opacity: 1; }
  100% { transform: scale(2.8); opacity: 0; }
}

@keyframes vfx-draw-border {
  from { stroke-dashoffset: 800; }
  to   { stroke-dashoffset: 0; }
}

.lux-glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid var(--border-lux);
}

.lux-card {
  transition: all 0.6s var(--ease-lux);
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}
.lux-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 32px 64px -16px rgba(0,0,0,0.12);
  border-color: var(--accent-glow) !important;
}

.mesh-bg {
  position: absolute; inset: 0;
  background: radial-gradient(at 0% 0%, hsla(25,100%,70%,0.2) 0, transparent 50%),
              radial-gradient(at 50% 0%, hsla(25,100%,80%,0.15) 0, transparent 50%),
              radial-gradient(at 100% 100%, hsla(25,100%,90%,0.2) 0, transparent 50%);
  background-size: 200% 200%;
  animation: vfx-mesh-float 20s ease infinite;
  pointer-events: none;
}

.stagger > *:nth-child(1) { animation: vfx-fade-in-up 0.8s var(--ease-lux) 0.05s both; }
.stagger > *:nth-child(2) { animation: vfx-fade-in-up 0.8s var(--ease-lux) 0.10s both; }
.stagger > *:nth-child(3) { animation: vfx-fade-in-up 0.8s var(--ease-lux) 0.15s both; }
.stagger > *:nth-child(4) { animation: vfx-fade-in-up 0.8s var(--ease-lux) 0.20s both; }
.stagger > *:nth-child(5) { animation: vfx-fade-in-up 0.8s var(--ease-lux) 0.25s both; }

.section-enter { animation: vfx-fade-in-up 1s var(--ease-lux) both; }

[role="dialog"] {
  border-radius: 2rem !important;
  border: 1px solid var(--border) !important;
  box-shadow: 0 40px 100px -20px rgba(0,0,0,0.3) !important;
  font-family: 'Geist', sans-serif !important;
}
`;

function StyleInjector() {
  useEffect(() => {
    if (document.getElementById('dash-v4-beauty')) return;
    const el = document.createElement('style');
    el.id = 'dash-v4-beauty';
    el.textContent = STYLES;
    document.head.appendChild(el);
  }, []);
  return null;
}

/* ─── Custom Hooks ─── */
function useCountUp(end, duration = 1000, delay = 0) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        start += increment;
        if (start >= end) { setCount(end); clearInterval(interval); }
        else { setCount(Math.floor(start)); }
      }, 16);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [end, duration, delay]);
  return count;
}

function useTilt(intensity = 5) {
  const ref = useRef(null);
  const onMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    ref.current.style.transform = `perspective(1000px) rotateY(${x * intensity}deg) rotateX(${-y * intensity}deg) translateY(-8px)`;
  };
  const onMouseLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg) translateY(0px)`;
  };
  return { ref, onMouseMove, onMouseLeave };
}

function useRipple() {
  return (event) => {
    const btn = event.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(btn.clientWidth, btn.clientHeight);
    const radius = diameter / 2;
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - btn.getBoundingClientRect().left - radius}px`;
    circle.style.top = `${event.clientY - btn.getBoundingClientRect().top - radius}px`;
    circle.classList.add("ripple");
    const ripple = btn.getElementsByClassName("ripple")[0];
    if (ripple) ripple.remove();
    btn.appendChild(circle);
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({ 
    received: 0, inProgress: 0, waitingForParts: 0, completedNotReturned: 0, 
    revenueToday: 0, registeredToday: 0, completedToday: 0, returnedToday: 0, salesToday: 0, 
    serviceRevenueToday: 0, salesRevenueToday: 0, alerts: null 
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [isRevenueOpen, setIsRevenueOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setNow(new Date()), 1000);
    fetchStats();
    fetchActivity(1);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => { fetchActivity(currentPage); }, [currentPage]);

  const fetchStats = async () => {
    try {
      const data = await dashboardService.getDashboardStats();
      setStats(data);
    } catch (err) { toast.error("Failed to sync system telemetry"); }
  };

  const fetchActivity = async (page) => {
    setActivityLoading(true);
    try {
      const { data, total } = await dashboardService.getRecentActivity(page, 6);
      setRecentActivity(data);
      setTotalPages(Math.ceil(total / 6));
    } catch (err) { console.error(err); }
    setActivityLoading(false);
  };

  const handleActivityClick = (activity) => {
    if (activity.services?.id) router.push(`/services?id=${activity.services.id}`);
  };

  if (!mounted) return <DashboardSkeleton />;

  const h = now.getHours();
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';

  const S = {
    panel: {
      background: 'var(--surface-raise)', border: '1px solid var(--border)', borderRadius: '2rem', padding: '2rem',
      position: 'relative', overflow: 'hidden',
    },
    topAccentBar: {
      position: 'absolute', top: 0, left: '2rem', right: '2rem', height: 3,
      background: 'linear-gradient(90deg, var(--accent), transparent)', opacity: 0.4,
    },
    panelTitle: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' },
    panelIcon: { width: 36, height: 36, borderRadius: '0.875rem', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  };

  return (
    <>
      <StyleInjector />
      <div className="font-body" style={{ backgroundColor: 'var(--surface)', minHeight: '100vh', padding: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: 1600, margin: '0 auto' }}>

          {/* ══════════ NEBULA HERO HEADER ══════════ */}
          <header className={cn('section-enter')}
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              borderRadius: '2.5rem', padding: '3.5rem', position: 'relative', overflow: 'hidden', boxShadow: '0 40px 100px -20px rgba(15,23,42,0.3)'
            }}>
            <div className="mesh-bg" />
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              <div style={{ position: 'absolute', width: '200%', height: '200%', top: '-50%', left: '-50%', background: 'radial-gradient(circle, rgba(249,115,22,0.05) 1px, transparent 1px)', backgroundSize: '60px 60px', animation: 'vfx-star-drift 120s linear infinite' }} />
              {/* ORBITING BEAUTY ELEMENTS */}
              <div style={{ position: 'absolute', right: '10%', top: '20%', width: 140, height: 140, animation: 'vfx-orbit 40s linear infinite', opacity: 0.5 }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '1px solid rgba(249,115,22,0.1)' }} />
              </div>
              <div style={{ position: 'absolute', right: '12%', top: '22%', width: 100, height: 100, animation: 'vfx-orbit 25s linear infinite reverse', opacity: 0.3 }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '1px dashed rgba(249,115,22,0.15)' }} />
              </div>
            </div>

            <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '3rem' }}>
              <div style={{ flex: 1, minWidth: 320 }}>
                <p className="font-mono" style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '1.25rem' }}>
                  System Telemetry Active • {formatDate(now)}
                </p>
                <h1 className="font-display" style={{ fontSize: 'clamp(3rem, 6vw, 4.5rem)', fontWeight: 400, lineHeight: 1.1, color: '#fff', marginBottom: '1.5rem', fontStyle: 'italic' }}>
                  {greeting}, <span style={{ color: 'var(--accent)', textShadow: '0 0 50px rgba(249,115,22,0.5)' }}>{profile?.name?.split(' ')[0] || 'Operator'}</span>
                </h1>
                <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,254,0.5)', maxWidth: 550, lineHeight: 1.7 }}>
                  Operational efficiency is peak. All maintenance modules are synchronized and ready for deployment.
                </p>
              </div>

              <div className="lux-glass" style={{ borderRadius: '2.5rem', padding: '2rem 3rem', textAlign: 'right' }}>
                <p className="font-mono" style={{ fontSize: '4rem', fontWeight: 600, letterSpacing: '-0.05em', color: '#fff', lineHeight: 1, margin: 0 }}>
                  {formatTime(now).split(' ')[0]}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>{formatTime(now).split(' ')[1]}</span>
                  <div style={{ position: 'relative', width: 10, height: 10 }}>
                    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 15px #10b981' }} />
                    <div style={{ position: 'absolute', inset: -5, borderRadius: '50%', background: '#10b981', opacity: 0.4, animation: 'vfx-live-pulse 2s infinite' }} />
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* ══════════ QUICK OPERATIONS ══════════ */}
          <section className="section-enter" style={{ animationDelay: '0.2s' }}>
            <SectionLabel icon={Zap} label="Quick Operations" />
            <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {[
                { name: 'Service Intake', desc: 'Generate new repair ticket', icon: PlusCircle, href: '/services?action=new', accent: '#3b82f6' },
                { name: 'Point of Sale', desc: 'Process accessory transaction', icon: ShoppingBag, href: '/sales?action=new', accent: '#a855f7' },
                { name: 'Repair Hub', desc: 'Manage active work queue', icon: Wrench, href: '/services', accent: '#f97316' },
              ].map(a => <QuickActionButton key={a.name} action={a} onClick={() => router.push(a.href)} />)}
            </div>
          </section>

          {/* ══════════ SYSTEM PRIORITY ══════════ */}
          <section className="section-enter" style={{ animationDelay: '0.3s' }}>
            <SectionLabel icon={Activity} label="System Priority" />
            <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              <PriorityCard title="Received" count={stats.received} statusColor="#3b82f6" onClick={() => router.push('/services?status=Received')} />
              <PriorityCard title="In Progress" count={stats.inProgress} statusColor="#f97316" onClick={() => router.push('/services?status=In Progress')} />
              <PriorityCard title="Waiting for Parts" count={stats.waitingForParts} statusColor="#f59e0b" onClick={() => router.push('/services?status=Waiting for Parts')} />
              <PriorityCard title="Completed" count={stats.completedNotReturned} statusColor="#10b981" onClick={() => router.push('/services?status=Completed')} />
            </div>
          </section>

          {/* ══════════ DAILY ANALYTICS ══════════ */}
          <section className="section-enter" style={{ animationDelay: '0.4s' }}>
            <SectionLabel icon={Sparkles} label="Daily Analytics" />
            <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
              <SummaryCard title="Revenue Today" value={formatCurrency(stats.revenueToday)} icon={IndianRupee} dotColor="#f97316" isCurrency large
                onClick={() => { if (profile?.role === 'admin' || profile?.role === 'owner') setIsRevenueOpen(true); }} />
              <SummaryCard title="Registered Today" value={stats.registeredToday} icon={FileEdit} dotColor="#3b82f6" />
              <SummaryCard title="Completed Today" value={stats.completedToday} icon={CheckCircle2} dotColor="#10b981" />
              <SummaryCard title="Returned Today" value={stats.returnedToday} icon={PackageCheck} dotColor="#06b6d4" />
              <SummaryCard title="Sales Today" value={stats.salesToday} icon={ShoppingBag} dotColor="#a855f7" />
            </div>
          </section>

          {/* ══════════ BOTTOM GRID ══════════ */}
          <div className="section-enter" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem', animationDelay: '0.5s' }}>
            
            {/* Recent Activity */}
            <section style={S.panel} className="lux-card">
              <div style={S.topAccentBar} />
              <div style={S.panelTitle}>
                <div style={S.panelIcon}><Clock style={{ width: 18, height: 18, color: 'var(--accent)' }} /></div>
                <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--ink)' }}>Recent Activity</span>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.65rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 100, padding: '0.5rem 1rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: 'vfx-live-pulse 2s infinite' }} />
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#166534', letterSpacing: '0.05em' }}>Live Stream</span>
                </div>
              </div>

              {activityLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[...Array(5)].map((_, i) => <div key={i} style={{ height: 84, borderRadius: '1.5rem', background: '#f1f5f9', animation: 'pulse 2s infinite' }} />)}
                </div>
              ) : recentActivity.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 280, gap: '1rem', border: '2px dashed var(--border)', borderRadius: '2rem', background: 'var(--surface)' }}>
                  <Activity style={{ width: 48, height: 48, color: 'var(--ink-faint)', opacity: 0.2 }} />
                  <p style={{ color: 'var(--ink-faint)', fontWeight: 600 }}>No operations logged today</p>
                </div>
              ) : (
                <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {recentActivity.map((activity, i) => (
                    <ActivityRow key={activity.id || i} activity={activity} isMine={activity.updated_by === profile?.id} ss={getStatusStyles(activity.status)} index={i} onClickHandler={handleActivityClick} />
                  ))}
                  {totalPages > 1 && (
                    <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <PaginationBtn label="← Previous" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} />
                      <p className="font-mono" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink-faint)' }}>{currentPage} / {totalPages}</p>
                      <PaginationBtn label="Next →" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} />
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Smart Alerts */}
            <section style={S.panel} className="lux-card">
              <div style={S.topAccentBar} />
              <div style={S.panelTitle}>
                <div style={S.panelIcon}><Bell style={{ width: 18, height: 18, color: 'var(--accent)' }} /></div>
                <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--ink)' }}>Smart Alerts</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {stats.alerts ? (
                  <>
                    {stats.alerts.oldInProgress > 0 && <AlertItem message={`${stats.alerts.oldInProgress} services have been in progress for more than 3 days.`} type="warning" index={0} />}
                    {stats.alerts.oldWaitingForParts > 0 && <AlertItem message={`Action Required: ${stats.alerts.oldWaitingForParts} items stuck in parts queue.`} type="danger" index={1} />}
                    {stats.alerts.oldCompletedNotReturned > 0 && <AlertItem message={`${stats.alerts.oldCompletedNotReturned} items ready for weeks, pending customer collection.`} type="warning" index={2} />}
                    {stats.alerts.oldInProgress === 0 && stats.alerts.oldWaitingForParts === 0 && stats.alerts.oldCompletedNotReturned === 0 && <AlertItem message="All operations are running smooth! No bottlenecks detected." type="success" index={0} />}
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ height: 64, borderRadius: '1.25rem', background: '#f1f5f9' }} />
                    <div style={{ height: 64, borderRadius: '1.25rem', background: '#f1f5f9' }} />
                  </div>
                )}
              </div>
            </section>

          </div>
        </div>

        {isRevenueOpen && (
          <RevenueBreakdownModal onClose={() => setIsRevenueOpen(false)} serviceRevenue={stats.serviceRevenueToday} salesRevenue={stats.salesRevenueToday} router={router} />
        )}
      </div>
    </>
  );
}

/* ─── Components ─── */

function SectionLabel({ icon: Icon, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingLeft: '0.5rem' }}>
      <div style={{ width: 32, height: 32, borderRadius: '0.75rem', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon style={{ width: 16, height: 16, color: 'var(--accent)' }} />
      </div>
      <span style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--ink-mid)' }}>{label}</span>
      <div style={{ height: 1, flex: 1, background: 'linear-gradient(90deg, var(--border), transparent)', marginLeft: '1rem' }} />
    </div>
  );
}

function QuickActionButton({ action: a, onClick }) {
  const ripple = useRipple();
  const [hovered, setHovered] = useState(false);
  const { ref, onMouseMove, onMouseLeave } = useTilt(4);
  return (
    <button ref={ref} onClick={(e) => { ripple(e); onClick(); }} onMouseMove={onMouseMove} onMouseLeave={() => { onMouseLeave(); setHovered(false); }} onMouseEnter={() => setHovered(true)} className="lux-card ripple-host"
      style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.75rem', borderRadius: '2rem', cursor: 'pointer', textAlign: 'left', background: hovered ? 'var(--ink)' : 'var(--surface-raise)', border: '1.5px solid var(--border)', overflow: 'hidden' }}>
      {hovered && <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at center, ${a.accent}15 0%, transparent 70%)` }} />}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: hovered ? 1 : 0, transition: 'opacity 0.3s' }}>
        <rect x="0" y="0" width="100%" height="100%" fill="none" stroke={a.accent} strokeWidth="2" strokeDasharray="800" style={{ animation: hovered ? 'vfx-draw-border 1.5s var(--ease-lux) forwards' : 'none' }} rx="32" />
      </svg>
      <div style={{ width: 60, height: 60, borderRadius: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: hovered ? `${a.accent}20` : 'var(--surface)', transition: 'all 0.4s var(--ease-lux)', transform: hovered ? 'scale(1.1) rotate(5deg)' : 'scale(1)' }}>
        <a.icon style={{ width: 28, height: 28, color: hovered ? a.accent : 'var(--ink-mid)' }} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '1.125rem', fontWeight: 600, color: hovered ? '#fff' : 'var(--ink)', transition: 'color 0.3s' }}>{a.name}</p>
        <p style={{ fontSize: '0.875rem', color: hovered ? 'rgba(255,255,254,0.4)' : 'var(--ink-faint)', transition: 'color 0.3s' }}>{a.desc}</p>
      </div>
      <ArrowUpRight style={{ width: 20, height: 20, color: hovered ? a.accent : 'var(--border)', transform: hovered ? 'translate(3px, -3px)' : 'none', transition: 'all 0.3s' }} />
    </button>
  );
}

function PriorityCard({ title, count, statusColor, onClick }) {
  const animated = useCountUp(count, 1200, 400);
  const [hovered, setHovered] = useState(false);
  const { ref, onMouseMove, onMouseLeave } = useTilt(5);
  return (
    <button ref={ref} onClick={onClick} onMouseMove={onMouseMove} onMouseLeave={() => { onMouseLeave(); setHovered(false); }} onMouseEnter={() => setHovered(true)} className="lux-card ripple-host"
      style={{ textAlign: 'left', cursor: 'pointer', borderRadius: '1.75rem', padding: '2rem', background: 'var(--surface-raise)', border: '1.5px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: statusColor, transform: hovered ? 'scaleX(1)' : 'scaleX(0)', transformOrigin: 'left', transition: 'transform 0.4s var(--ease-lux)' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: statusColor, boxShadow: `0 0 15px ${statusColor}` }} />
        <Activity style={{ width: 16, height: 16, color: hovered ? statusColor : 'var(--ink-faint)' }} />
      </div>
      <p className="font-mono" style={{ fontSize: '3.5rem', fontWeight: 700, letterSpacing: '-0.05em', lineHeight: 1, color: 'var(--ink)' }}>{animated}</p>
      <p style={{ marginTop: '1rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{title}</p>
    </button>
  );
}

function SummaryCard({ title, value, isCurrency, onClick, icon: Icon, dotColor, large }) {
  const animated = typeof value === 'number' ? useCountUp(value, 1100, 500) : value;
  const [hovered, setHovered] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} className="lux-card ripple-host"
      style={{ width: '100%', textAlign: 'left', cursor: 'pointer', borderRadius: '1.75rem', padding: '1.5rem', background: 'var(--surface-raise)', border: '1.5px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, right: 0, height: 3, background: dotColor, transform: hovered ? 'scaleX(1)' : 'scaleX(0)', transformOrigin: 'left', transition: 'transform 0.4s var(--ease-lux)' }} />
      <div style={{ width: 44, height: 44, borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${dotColor}15`, marginBottom: '1rem', transform: hovered ? 'scale(1.1) rotate(-5deg)' : 'scale(1)', transition: 'all 0.4s var(--ease-lux)' }}>
        <Icon style={{ width: 20, height: 20, color: dotColor }} />
      </div>
      <p className="font-mono" style={{ fontSize: large ? '2.5rem' : '1.75rem', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.1, color: 'var(--ink)' }}>{isCurrency ? value : animated}</p>
      <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{title}</p>
    </button>
  );
}

function ActivityRow({ activity, isMine, ss, index, onClickHandler }) {
  const ripple = useRipple();
  const [hovered, setHovered] = useState(false);
  return (
    <button onClick={(e) => { ripple(e); onClickHandler(activity); }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} className="lux-card ripple-host"
      style={{ width: '100%', textAlign: 'left', cursor: 'pointer', borderRadius: '1.5rem', padding: '1.25rem 1.5rem', border: `1.5px solid ${isMine ? 'var(--accent)' : 'var(--border)'}`, background: isMine ? 'linear-gradient(135deg, #fff7ed 0%, #fff 100%)' : 'var(--surface-raise)', display: 'flex', alignItems: 'center', gap: '1.25rem', overflow: 'hidden' }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{ width: 14, height: 14, borderRadius: '50%', background: ss.dotColor, boxShadow: `0 0 10px ${ss.dotColor}80` }} />
        <div style={{ position: 'absolute', inset: -5, borderRadius: '50%', background: ss.dotColor, opacity: 0.3, animation: 'vfx-live-pulse 2s infinite' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>{activity.services?.customer_name || 'Operator Update'}</p>
          <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--ink-faint)' }}>{formatTime(activity.created_at)}</span>
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--ink-faint)', margin: '0.25rem 0' }}>{[activity.services?.device_brand, activity.services?.device_model].filter(Boolean).join(' ') || 'General Task'}</p>
        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.25rem 0.75rem', borderRadius: '0.5rem', background: `${ss.dotColor}15`, color: ss.dotColor, fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}>{activity.status}</span>
      </div>
      <ChevronRight style={{ width: 20, height: 20, color: hovered ? 'var(--ink)' : 'var(--border)', transform: hovered ? 'translateX(5px)' : 'none', transition: 'all 0.3s' }} />
    </button>
  );
}

function PaginationBtn({ label, disabled, onClick }) {
  const ripple = useRipple();
  return (
    <button onClick={(e) => { ripple(e); onClick(); }} disabled={disabled} className="ripple-host" style={{ padding: '0.5rem 1rem', borderRadius: '0.75rem', border: '1.5px solid var(--border)', background: 'var(--surface-raise)', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--ink-mid)', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1, transition: 'all 0.2s' }}>{label}</button>
  );
}

function AlertItem({ message, type, index = 0 }) {
  const cfg = {
    warning: { bg: 'rgba(255, 251, 235, 0.5)', border: '#fde68a', text: '#92400e', icon: TriangleAlert, color: '#f59e0b' },
    danger:  { bg: 'rgba(254, 242, 242, 0.5)', border: '#fecaca', text: '#991b1b', icon: AlertCircle, color: '#ef4444' },
    success: { bg: 'rgba(240, 253, 244, 0.5)', border: '#bbf7d0', text: '#166534', icon: CircleCheck, color: '#22c55e' },
  }[type];
  const Ic = cfg.icon;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', borderRadius: '1.25rem', padding: '1.25rem', background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.text, fontSize: '0.875rem', fontWeight: 500, position: 'relative', overflow: 'hidden', backdropFilter: 'blur(10px)', animation: `vfx-fade-in-up 0.5s var(--ease-lux) ${index * 0.1}s both` }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: cfg.color }} />
      <Ic style={{ width: 20, height: 20, color: cfg.color, flexShrink: 0, marginTop: 2 }} />
      <span>{message}</span>
    </div>
  );
}

function RevenueBreakdownModal({ onClose, serviceRevenue, salesRevenue, router }) {
  const ripple = useRipple();
  const total = (serviceRevenue || 0) + (salesRevenue || 0);
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2, 6, 23, 0.7)', backdropFilter: 'blur(15px)', padding: '1.5rem', animation: 'vfx-fade-in-up 0.5s var(--ease-lux) both' }}>
      <div style={{ width: '100%', maxWidth: 450, borderRadius: '2.5rem', background: 'var(--surface-raise)', overflow: 'hidden', boxShadow: '0 50px 150px rgba(0,0,0,0.6)', border: '1px solid var(--border)' }}>
        <div style={{ background: 'var(--ink)', padding: '2rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'var(--accent)' }} />
          <div>
            <p className="font-mono" style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem' }}>Audit Log</p>
            <h3 className="font-display" style={{ fontSize: '1.75rem', fontWeight: 400, color: '#fff', margin: 0, fontStyle: 'italic' }}>Revenue Distribution</h3>
          </div>
          <button onClick={(e) => { ripple(e); onClose(); }} className="ripple-host" style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
        <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <RevenueRow label="Hardware Services" sublabel="Technical repair billings" amount={serviceRevenue || 0} onClick={() => router.push('/history?tab=services&today=returned')} accentColor="#3b82f6" />
          <RevenueRow label="Accessory Sales" sublabel="Point of sale inventory" amount={salesRevenue || 0} onClick={() => router.push('/history?tab=sales&today=true')} accentColor="#a855f7" />
          <div style={{ borderRadius: '1.5rem', background: 'var(--ink)', padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
            <p style={{ fontSize: '1.125rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', margin: 0 }}>Total Liquidity</p>
            <p className="font-mono" style={{ fontSize: '2.25rem', fontWeight: 700, letterSpacing: '-0.05em', color: 'var(--accent)', margin: 0 }}>{formatCurrency(total)}</p>
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
      style={{ width: '100%', textAlign: 'left', cursor: 'pointer', borderRadius: '1.5rem', padding: '1.35rem 1.75rem', border: `1.5px solid ${hovered ? accentColor : 'var(--border)'}`, background: hovered ? `${accentColor}08` : 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <p style={{ fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em', color: accentColor, margin: 0 }}>{label}</p>
        <p style={{ fontSize: '0.875rem', color: 'var(--ink-faint)', margin: '0.25rem 0 0', fontWeight: 500 }}>{sublabel}</p>
      </div>
      <p className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 700, color: accentColor, margin: 0 }}>{formatCurrency(amount)}</p>
    </button>
  );
}

function DashboardSkeleton() {
  return (
    <div className="font-body" style={{ backgroundColor: 'var(--surface)', minHeight: '100vh', padding: '1.5rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ height: 260, borderRadius: '2.5rem', background: '#e5e7eb', animation: 'pulse 2s infinite' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
          {[...Array(4)].map((_,i) => <div key={i} style={{ height: 160, borderRadius: '1.75rem', background: '#f3f4f6' }} />)}
        </div>
      </div>
    </div>
  );
}

function getStatusStyles(status = '') {
  const s = status.toLowerCase();
  const c = (color) => ({ dotColor: color });
  if (s.includes('received')) return c('#3b82f6');
  if (s.includes('in progress')) return c('#f97316');
  if (s.includes('waiting')) return c('#f59e0b');
  if (s.includes('completed')) return c('#10b981');
  if (s.includes('returned')) return c('#22c55e');
  if (s.includes('cancel') || s.includes('non repairable')) return c('#ef4444');
  return c('#6b7280');
}
