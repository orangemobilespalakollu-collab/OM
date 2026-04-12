'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { dashboardService } from '@/services/dashboardService';
import { 
  PageTransition, 
  StaggerContainer, 
  Reveal, 
  ScaleIn 
} from '@/components/MotionWrappers';
import { motion } from 'framer-motion';
import { IndianRupee, Activity, Zap, ArrowUpRight, Sparkles, Bell, TriangleAlert, CircleCheck, PlusCircle, ShoppingBag, Wrench, AlertCircle, TrendingUp, Clock, ChevronRight, FileEdit, CheckCircle2, XOctagon, PackageCheck } from 'lucide-react';
import { cn, formatCurrency, formatDate, formatTime, formatNumber } from '@/lib/utils';
import { MetricDetailsDialog } from '@/components/MetricDetailsDialog';
import { toast } from 'sonner';
import { historyService } from '@/services/historyService';

/* ─── tiny keyframes injected once ─── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

:root {
  --orange: #f97316;
  --orange-light: #fed7aa;
  --purple: #a855f7;
  --purple-light: #e9d5ff;
  --blue: #3b82f6;
  --blue-light: #bfdbfe;
  --green: #22c55e;
  --green-light: #bbf7d0;
  --cyan: #06b6d4;
  --amber: #f59e0b;
  --red: #ef4444;
  --emerald: #10b981;
}

@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-6px); }
}
@keyframes pulse-ring {
  0%   { transform: scale(0.8); opacity: 0.8; }
  70%  { transform: scale(1.6); opacity: 0; }
  100% { transform: scale(1.6); opacity: 0; }
}
@keyframes slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes count-in {
  from { opacity: 0; transform: scale(0.5); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes gradient-shift {
  0%,100% { background-position: 0% 50%; }
  50%      { background-position: 100% 50%; }
}
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes blink {
  0%,100% { opacity: 1; }
  50%      { opacity: 0.3; }
}

.animate-slide-up   { animation: slide-up 0.5s ease forwards; }
.animate-count-in   { animation: count-in 0.4s cubic-bezier(.34,1.56,.64,1) forwards; }
.animate-float      { animation: float 3s ease-in-out infinite; }
.animate-spin-slow  { animation: spin-slow 8s linear infinite; }
.animate-blink      { animation: blink 2s ease-in-out infinite; }

/* ── MetricDetailsDialog override ── */
[role="dialog"] [data-radix-dialog-content],
[data-state="open"][role="dialog"] {
  border-radius: 1.5rem !important;
  border: none !important;
  box-shadow: 0 25px 60px -12px rgba(0,0,0,0.18) !important;
  overflow: hidden !important;
  font-family: 'DM Sans', sans-serif !important;
}
[role="dialog"] h2,
[role="dialog"] [data-dialog-title] {
  font-family: 'DM Sans', sans-serif !important;
  font-size: 0.9375rem !important;
  font-weight: 600 !important;
  color: #111827 !important;
}
[role="dialog"] table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 4px;
}
[role="dialog"] thead th {
  font-size: 0.65rem !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.1em !important;
  color: #9ca3af !important;
  padding: 4px 10px !important;
}
[role="dialog"] tbody tr {
  background: #f9fafb;
  border-radius: 10px;
  transition: background 0.15s;
}
[role="dialog"] tbody tr:hover { background: #eff6ff !important; }
[role="dialog"] tbody td {
  padding: 8px 10px !important;
  font-size: 0.8125rem !important;
  font-weight: 500 !important;
  color: #374151 !important;
  border-top: none !important;
}
[role="dialog"] tbody td:first-child { border-radius: 10px 0 0 10px; }
[role="dialog"] tbody td:last-child  { border-radius: 0 10px 10px 0; }

.shimmer-text {
  background: linear-gradient(90deg, #f97316, #a855f7, #3b82f6, #f97316);
  background-size: 300% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 4s linear infinite;
}

.glass {
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.9);
}

.mesh-bg {
  background-color: #fafafa;
  background-image:
    radial-gradient(at 20% 10%, rgba(249,115,22,0.08) 0px, transparent 50%),
    radial-gradient(at 80% 0%,  rgba(168,85,247,0.07) 0px, transparent 50%),
    radial-gradient(at 0%  60%, rgba(59,130,246,0.06) 0px, transparent 50%),
    radial-gradient(at 90% 80%, rgba(34,197,94,0.05)  0px, transparent 50%);
}

.card-hover {
  transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), box-shadow 0.25s ease, border-color 0.2s;
}
.card-hover:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: 0 20px 40px -10px rgba(0,0,0,0.12);
}

.gradient-orange { background: linear-gradient(135deg, #fff7ed, #fff); }
.gradient-purple { background: linear-gradient(135deg, #faf5ff, #fff); }
.gradient-blue   { background: linear-gradient(135deg, #eff6ff, #fff); }
.gradient-green  { background: linear-gradient(135deg, #f0fdf4, #fff); }
.gradient-cyan   { background: linear-gradient(135deg, #ecfeff, #fff); }
.gradient-amber  { background: linear-gradient(135deg, #fffbeb, #fff); }
.gradient-red    { background: linear-gradient(135deg, #fef2f2, #fff); }
.gradient-emerald{ background: linear-gradient(135deg, #ecfdf5, #fff); }

.glow-orange { box-shadow: 0 4px 24px rgba(249,115,22,0.18); }
.glow-purple { box-shadow: 0 4px 24px rgba(168,85,247,0.18); }
.glow-blue   { box-shadow: 0 4px 24px rgba(59,130,246,0.18); }
.glow-green  { box-shadow: 0 4px 24px rgba(34,197,94,0.18); }

/* ── MetricDetailsDialog override ── */
[role="dialog"] {
  border-radius: 1.5rem !important;
  border: 1px solid #e5e7eb !important;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.18) !important;
  font-family: 'DM Sans', sans-serif !important;
  overflow: hidden !important;
}
[role="dialog"] h2,
[role="dialog"] [data-radix-dialog-title] {
  font-family: 'DM Sans', sans-serif !important;
  font-size: 0.9375rem !important;
  font-weight: 600 !important;
  color: #111827 !important;
}
[role="dialog"] table,
[role="dialog"] [data-list] {
  font-size: 0.8125rem !important;
}
[role="dialog"] tr:nth-child(even),
[role="dialog"] li:nth-child(even) {
  background-color: #f9fafb !important;
}

.orb {
  border-radius: 50%;
  filter: blur(40px);
  position: absolute;
  pointer-events: none;
}

.dashboard-font { font-family: 'DM Sans', sans-serif; }
.display-font   { font-family: 'Syne', sans-serif; }
`;

function StyleInjector() {
  useEffect(() => {
    if (document.getElementById('dash-styles')) return;
    const el = document.createElement('style');
    el.id = 'dash-styles';
    el.textContent = STYLES;
    document.head.appendChild(el);
  }, []);
  return null;
}

/* ──────────────────────────────────────────────────────── */

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

  const ACTIVITIES_PER_PAGE = 5;
  const MAX_ACTIVITIES = 50;

  useEffect(() => {
    fetchInitialDashboard();
    const ticker = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(ticker);
  }, []);

  useEffect(() => { if (!loading) fetchRecentActivity(); }, [currentPage]);

  async function fetchInitialDashboard() {
    try {
      setLoading(true);
      const [statsData, activityResponse] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getRecentActivity(currentPage, ACTIVITIES_PER_PAGE, MAX_ACTIVITIES),
      ]);
      setStats(statsData);
      setRecentActivity(activityResponse.data || []);
      setTotalActivities(activityResponse.total || 0);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function fetchRecentActivity() {
    try {
      setActivityLoading(true);
      const r = await dashboardService.getRecentActivity(currentPage, ACTIVITIES_PER_PAGE, MAX_ACTIVITIES);
      setRecentActivity(r.data || []);
      setTotalActivities(r.total || 0);
    } catch (err) { console.error(err); }
    finally { setActivityLoading(false); }
  }

  async function handleActivityClick(activity) {
    const service = activity.services;
    if (!service?.id) return;
    if (service.status === 'Returned') {
      if (profile?.role === 'admin' || profile?.role === 'owner') {
        router.push(`/history?tab=services&serviceId=${service.id}`);
      } else {
        try {
          const historyData = await historyService.getServiceHistory(profile);
          if (historyData.some(s => s.id === service.id)) {
            router.push(`/history?tab=services&serviceId=${service.id}`);
          } else {
            toast.error("You do not have permission to view this returned service.");
          }
        } catch { toast.error("Error verifying access"); }
      }
    } else {
      router.push(`/services?serviceId=${service.id}`);
    }
  }

  if (loading) return <DashboardSkeleton />;

  const totalPages = Math.ceil(Math.min(totalActivities, MAX_ACTIVITIES) / ACTIVITIES_PER_PAGE);
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const timeStr = formatTime(now);
  const dateStr = formatDate(now);

  return (
    <PageTransition>
      <StyleInjector />
      <div className="relative dashboard-font min-h-screen space-y-8 p-1">

        {/* ── Hero Header ── */}
        <header className="vfx-aura relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-7 shadow-2xl">
          {/* decorative orbs */}
          <div className="orb w-64 h-64 bg-orange-500/20 -top-16 -left-16 animate-float" style={{animationDelay:'0s'}} />
          <div className="orb w-48 h-48 bg-purple-500/20 -bottom-12 left-1/3 animate-float" style={{animationDelay:'1s'}} />
          <div className="orb w-56 h-56 bg-blue-500/15 -top-8 right-10 animate-float" style={{animationDelay:'2s'}} />

          {/* spinning ring */}
          <div className="absolute right-6 top-6 h-20 w-20 rounded-full border-2 border-dashed border-white/10 animate-spin-slow" />
          <div className="absolute right-10 top-10 h-12 w-12 rounded-full border border-orange-400/30 animate-spin-slow" style={{animationDirection:'reverse',animationDuration:'5s'}} />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <motion.p 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40 mb-1"
              >
                {dateStr}
              </motion.p>
              <h1 className="display-font text-2xl sm:text-3xl font-bold text-white mb-1">
                <TextReveal text={`${greeting},`} className="inline-block" />
                <span className="shimmer-text ml-2">{profile?.name?.split(' ')[0] || 'there'} 👋</span>
              </h1>
              <motion.p 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 0.8 }}
                className="text-sm text-white/50"
              >
                Here's what's happening in your shop today.
              </motion.p>
            </div>
            <div className="flex items-center gap-3">
              <div className="glass rounded-2xl px-5 py-3 text-right">
                <p className="display-font text-2xl font-bold text-gray-900">{timeStr}</p>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-blink" />
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Live</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ── Quick Actions ── */}
        <section>
          <SectionLabel icon={Zap} label="Quick Actions" />
          <StaggerContainer>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { name: 'Register New Service', desc: 'Create a service ticket', icon: PlusCircle, color: '#f97316', lightBg: '#fff7ed', borderColor: '#fed7aa', href: '/services?action=new' },
                { name: 'Add New Sale', desc: 'Record parts / accessories', icon: ShoppingBag, color: '#a855f7', lightBg: '#faf5ff', borderColor: '#e9d5ff', href: '/sales?action=new' },
                { name: 'View Services', desc: 'Manage active repairs', icon: Wrench, color: '#3b82f6', lightBg: '#eff6ff', borderColor: '#bfdbfe', href: '/services' },
              ].map((a, i) => (
                <ScaleIn key={a.name} delay={i * 0.1}>
                  <button
                    onClick={() => router.push(a.href)}
                    className="card-hover group relative flex items-center gap-4 rounded-2xl border-2 p-4 text-left shadow-sm transition-all w-full"
                    style={{ borderColor: a.borderColor, backgroundColor: a.lightBg }}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ backgroundColor: a.color }} />
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3"
                      style={{ backgroundColor: a.color + '20', border: `1.5px solid ${a.color}40` }}>
                      <a.icon className="h-5 w-5" style={{ color: a.color }} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{a.name}</p>
                      <p className="text-xs mt-0.5 font-medium" style={{ color: a.color + 'bb' }}>{a.desc}</p>
                    </div>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-sm"
                      style={{ backgroundColor: a.color + '15', border: `1px solid ${a.color}30` }}>
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" style={{ color: a.color }} />
                    </div>
                  </button>
                </ScaleIn>
              ))}
            </div>
          </StaggerContainer>
        </section>

        {/* ── Work Priority ── */}
        <section>
          <SectionLabel icon={Activity} label="Work Priority" />
          <MagicalGrid className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <PriorityCard title="Received"            count={stats.received || 0}          color="#3b82f6" gradClass="gradient-blue"    shadowColor="rgba(59,130,246,0.2)"   onClick={() => router.push('/services?status=Received')} />
            <PriorityCard title="In Progress"         count={stats.inProgress}              color="#f97316" gradClass="gradient-orange"  shadowColor="rgba(249,115,22,0.2)"   onClick={() => router.push('/services?status=In Progress')} />
            <PriorityCard title="Waiting for Parts"   count={stats.waitingForParts}         color="#f59e0b" gradClass="gradient-amber"   shadowColor="rgba(245,158,11,0.2)"   onClick={() => router.push('/services?status=Waiting for Parts')} />
            <PriorityCard title="Completed (Unreturned)" count={stats.completedNotReturned} color="#10b981" gradClass="gradient-emerald" shadowColor="rgba(16,185,129,0.2)"   onClick={() => router.push('/services?status=Completed')} />
          </MagicalGrid>
        </section>

        {/* ── Today Summary ── */}
        <section>
          <SectionLabel icon={Sparkles} label="Today Summary" />
          <MagicalGrid className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <MetricDetailsDialog title="Registered Today" dataList={stats.registeredTodayList}>
              <SummaryCard title="Registered"    count={stats.registeredToday}               icon={FileEdit}      color="#3b82f6" gradClass="gradient-blue"    />
            </MetricDetailsDialog>
            <SummaryCard title="Completed"     count={stats.completedToday}                  icon={CheckCircle2}  color="#10b981" gradClass="gradient-emerald" onClick={() => router.push('/services?filter=completedToday')} />
            <SummaryCard title="Non Repairable" count={stats.notRepairableToday}             icon={XOctagon}      color="#ef4444" gradClass="gradient-red"     onClick={() => router.push('/services?filter=notRepairableToday')} />
            <SummaryCard title="Returned"      count={stats.returnedToday}                   icon={PackageCheck}  color="#06b6d4" gradClass="gradient-cyan"    onClick={() => router.push('/history?tab=services&today=returned')} />
            <SummaryCard title="Sales"         count={stats.salesToday}                      icon={ShoppingBag}   color="#a855f7" gradClass="gradient-purple"  onClick={() => router.push('/sales?today=true')} />
            <SummaryCard title="Revenue"       count={formatCurrency(stats.revenueToday)}    icon={IndianRupee}   color="#f97316" gradClass="gradient-orange"  isCurrency
              onClick={() => { if (profile?.role === 'admin' || profile?.role === 'owner') setIsRevenueOpen(true); }} />
          </MagicalGrid>
        </section>

        {/* ── Bottom grid ── */}
        <MagicalGrid className="grid grid-cols-1 gap-8 lg:grid-cols-2">

          {/* Recent Activity */}
          <section className="glass rounded-3xl p-6 shadow-xl overflow-hidden relative">
            {/* accent blob */}
            <div className="orb w-40 h-40 bg-orange-400/10 -top-10 -right-10 pointer-events-none" />
            <div className="orb w-32 h-32 bg-purple-400/10 -bottom-8 -left-8 pointer-events-none" />

            <div className="relative mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-purple-500 shadow-md">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">Recent Activity</h3>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-green-600 border border-green-200">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-blink" />
                Live
              </span>
            </div>

            {activityLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse rounded-2xl bg-gray-100/80 h-[72px]" />
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 gap-2">
                <Clock className="h-7 w-7 text-gray-300" />
                <p className="text-sm font-semibold text-gray-400">No activity yet today</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {recentActivity.map((activity, i) => {
                    const isMine = activity.updated_by === profile?.id;
                    const ss = getStatusStyles(activity.status);
                    return (
                      <ScaleIn key={activity.id || i} delay={i * 0.05}>
                        <button
                          onClick={() => handleActivityClick(activity)}
                          className={cn(
                            "group w-full relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 card-hover",
                            isMine
                              ? "border-orange-300/60 bg-gradient-to-r from-orange-50 via-white to-purple-50/30 shadow-md ring-1 ring-orange-200/50"
                              : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                          )}
                        >
                          {/* glow accent */}
                          {isMine && <div className="absolute top-0 left-0 h-full w-1 rounded-l-2xl bg-gradient-to-b from-orange-400 to-purple-500" />}

                          <div className="flex items-center gap-3 pl-1">
                            {/* status dot with pulse ring */}
                            <div className="relative shrink-0">
                              <span className="block h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: ss.dotColor }} />
                              <span className="absolute inset-0 rounded-full" style={{ backgroundColor: ss.dotColor, animation: 'pulse-ring 2s cubic-bezier(0.215,0.61,0.355,1) infinite' }} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <p className="display-font text-sm font-bold text-gray-900 truncate">
                                  {activity.services?.customer_name || 'Unknown Customer'}
                                </p>
                                <div className="flex items-center gap-2 shrink-0">
                                  {isMine && (
                                    <span className="rounded-full bg-gradient-to-r from-orange-400 to-purple-500 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-white shadow-sm">
                                      You
                                    </span>
                                  )}
                                  <span className="text-[10px] font-semibold text-gray-400">
                                    {formatTime(activity.created_at)}
                                  </span>
                                </div>
                              </div>

                              <p className="text-xs text-gray-400 mt-0.5 truncate">
                                {[activity.services?.device_brand, activity.services?.device_model].filter(Boolean).join(' ') || 'Device'}
                              </p>

                              <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 border text-[10px] font-bold uppercase tracking-wider"
                                style={{ backgroundColor: ss.badgeBg, borderColor: ss.badgeBorder, color: ss.badgeText }}>
                                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ss.dotColor }} />
                                {activity.status}
                              </div>
                            </div>

                            <ChevronRight className="h-4 w-4 text-gray-300 shrink-0 transition-transform group-hover:translate-x-0.5" />
                          </div>
                        </button>
                      </ScaleIn>
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                    <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}
                      className="rounded-xl border border-gray-200 bg-white px-4 py-1.5 text-xs font-bold text-gray-600 shadow-sm transition hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                      ← Prev
                    </button>
                    <p className="text-xs font-semibold text-gray-500">
                      Page <span className="font-black text-gray-900">{currentPage}</span> / <span className="font-black text-gray-900">{totalPages}</span>
                    </p>
                    <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}
                      className="rounded-xl border border-gray-200 bg-white px-4 py-1.5 text-xs font-bold text-gray-600 shadow-sm transition hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </section>

          {/* Smart Alerts */}
          <section className="glass rounded-3xl p-6 shadow-xl overflow-hidden relative">
            <div className="orb w-40 h-40 bg-blue-400/10 -top-10 -right-10 pointer-events-none" />

            <div className="relative mb-6 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 shadow-md">
                <Bell className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Smart Alerts</h3>
            </div>

            <div className="relative space-y-3">
              {stats.alerts ? (
                <>
                  {stats.alerts.oldInProgress > 0 && (
                    <AlertItem
                      message={`${stats.alerts.oldInProgress} service${stats.alerts.oldInProgress > 1 ? 's have' : ' has'} been In Progress for over 3 days`}
                      type="warning"
                    />
                  )}
                  {stats.alerts.oldWaitingForParts > 0 && (
                    <AlertItem
                      message={`${stats.alerts.oldWaitingForParts} service${stats.alerts.oldWaitingForParts > 1 ? 's are' : ' is'} stuck waiting for parts (5+ days)`}
                      type="danger"
                    />
                  )}
                  {stats.alerts.oldCompletedNotReturned > 0 && (
                    <AlertItem
                      message={`${stats.alerts.oldCompletedNotReturned} completed service${stats.alerts.oldCompletedNotReturned > 1 ? 's have' : ' has'} not been picked up for over a week`}
                      type="warning"
                    />
                  )}
                  {stats.alerts.oldInProgress === 0 && stats.alerts.oldWaitingForParts === 0 && stats.alerts.oldCompletedNotReturned === 0 && (
                    <AlertItem message="All systems operational — no pending bottlenecks 🎉" type="success" />
                  )}
                </>
              ) : (
                <div className="animate-pulse space-y-3">
                  <div className="h-14 rounded-2xl bg-gray-100" />
                  <div className="h-14 rounded-2xl bg-gray-100" />
                </div>
              )}
            </div>
          </section>
        </MagicalGrid>

        {/* Revenue Modal */}
        {isRevenueOpen && (
          <RevenueBreakdownModal
            onClose={() => setIsRevenueOpen(false)}
            serviceRevenue={stats.serviceRevenueToday}
            salesRevenue={stats.salesRevenueToday}
            router={router}
          />
        )}
      </div>
    </PageTransition>
  );
}

/* ───────────── Sub-components ───────────── */

function SectionLabel({ icon: Icon, label }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-orange-400 to-purple-500 shadow-sm">
        <Icon className="h-3 w-3 text-white" strokeWidth={2.5} />
      </div>
      <h3 className="text-sm font-semibold text-gray-700">{label}</h3>
      <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
    </div>
  );
}

function PriorityCard({ title, count, color, gradClass, shadowColor, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ y: -4, scale: 1.01 }}
      onClick={onClick}
      className={cn("group relative overflow-hidden rounded-2xl border border-white/80 p-5 text-left shadow-md", gradClass)}
      style={{ boxShadow: `0 4px 20px ${shadowColor}` }}
    >
      <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full blur-2xl opacity-20" style={{ backgroundColor: color }} />
      {/* top accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: `linear-gradient(90deg, ${color}80, ${color}20)` }} />

      <div className="flex items-center justify-between mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white shadow-sm"
          style={{ background: `${color}15` }}>
          <Activity className="h-4 w-4" style={{ color }} strokeWidth={2} />
        </div>
        <TrendingUp className="h-3.5 w-3.5 text-gray-300 transition-colors group-hover:text-gray-500" />
      </div>

      <p className="text-4xl font-bold tabular-nums leading-none text-gray-900">{count}</p>
      <p className="mt-2 text-[13px] font-medium text-gray-500">{title}</p>
    </motion.button>
  );
}

function SummaryCard({ title, count, isCurrency, onClick, icon: Icon, color, gradClass }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ y: -2, scale: 1.02 }}
      onClick={onClick}
      className={cn("group relative w-full overflow-hidden rounded-2xl border border-white/80 p-4 text-left shadow-md", gradClass)}
    >
      <div className="absolute -top-8 -right-8 h-20 w-20 rounded-full blur-2xl opacity-20" style={{ backgroundColor: color }} />
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: `linear-gradient(90deg, ${color}70, ${color}10)` }} />

      <div className="relative mb-3 flex h-9 w-9 items-center justify-center rounded-xl border border-white shadow-sm transition-transform group-hover:scale-110"
        style={{ background: `${color}15` }}>
        {Icon && <Icon className="h-4 w-4" style={{ color }} strokeWidth={2} />}
      </div>

      <p className="text-2xl font-bold tabular-nums leading-none text-gray-900">
        {count}
      </p>
      <p className="mt-2 text-[11px] font-semibold text-gray-500">{title}</p>
    </motion.button>
  );
}

function AlertItem({ message, type }) {
  const cfg = {
    warning: { bg: '#fffbeb', border: '#fde68a', text: '#92400e', icon: TriangleAlert, iconColor: '#f59e0b', accent: '#f59e0b' },
    danger:  { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', icon: AlertCircle,   iconColor: '#ef4444', accent: '#ef4444' },
    success: { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534', icon: CircleCheck,   iconColor: '#22c55e', accent: '#22c55e' },
  }[type];
  const Ic = cfg.icon;

  return (
    <div className="relative flex items-start gap-3 rounded-2xl border p-4 text-sm font-medium overflow-hidden animate-slide-up"
      style={{ backgroundColor: cfg.bg, borderColor: cfg.border, color: cfg.text }}>
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ backgroundColor: cfg.accent }} />
      <Ic className="h-5 w-5 shrink-0 mt-0.5" style={{ color: cfg.iconColor }} />
      <span className="leading-snug">{message}</span>
    </div>
  );
}

function CurrencyDisplay({ amount, color }) {
  const number = formatNumber(amount);
  return (
    <p className="flex items-center gap-1.5 tabular-nums font-bold" style={{ color }}>
      <span className="text-sm font-semibold opacity-70">₹</span>
      <span className="text-2xl tracking-tight leading-none">{number}</span>
    </p>
  );
}

function RevenueBreakdownModal({ onClose, serviceRevenue, salesRevenue, router }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white shadow-2xl overflow-hidden border border-white/80 animate-slide-up">
        {/* modal header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 px-6 py-5">
          <div className="orb w-32 h-32 bg-orange-500/20 -top-8 -right-8" />
          <div className="orb w-24 h-24 bg-purple-500/20 -bottom-8 left-4" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/40 mb-1">Breakdown</p>
              <h3 className="text-base font-semibold text-white">Today's Revenue</h3>
            </div>
            <button onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition text-white text-sm font-bold">
              ✕
            </button>
          </div>
        </div>

        <div className="p-5 space-y-3 bg-white">
          <button onClick={() => router.push('/history?tab=services&today=returned')}
            className="card-hover w-full flex justify-between items-center px-5 py-4 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/60 text-left glow-blue">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-blue-500 mb-0.5">Services</p>
              <p className="text-[10px] text-blue-400/80 font-medium">View history →</p>
            </div>
            <CurrencyDisplay amount={serviceRevenue || 0} color="#1d4ed8" />
          </button>

          <button onClick={() => router.push('/history?tab=sales&today=true')}
            className="card-hover w-full flex justify-between items-center px-5 py-4 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/60 text-left glow-purple">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-purple-500 mb-0.5">Sales</p>
              <p className="text-[10px] text-purple-400/80 font-medium">View history →</p>
            </div>
            <CurrencyDisplay amount={salesRevenue || 0} color="#7e22ce" />
          </button>

          {/* total */}
          <div className="rounded-2xl bg-gradient-to-r from-orange-400 to-purple-500 p-4 flex justify-between items-center shadow-lg">
            <p className="text-sm font-semibold text-white">Total Revenue</p>
            <CurrencyDisplay amount={(serviceRevenue || 0) + (salesRevenue || 0)} color="#ffffff" />
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mesh-bg dashboard-font min-h-screen space-y-8 p-1 animate-pulse">
      <div className="h-28 rounded-3xl bg-gray-200" />
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-gray-200" />)}
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-gray-200" />)}
      </div>
      <div className="grid grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-gray-200" />)}
      </div>
    </div>
  );
}

/* ── status style helper ── */
function getStatusStyles(status = '') {
  const s = status.toLowerCase();
  const make = (dot, badge) => ({ dotColor: dot, badgeBg: badge + '18', badgeBorder: badge + '40', badgeText: badge });
  if (s.includes('received'))                              return make('#3b82f6', '#3b82f6');
  if (s.includes('diagnosed'))                             return make('#8b5cf6', '#8b5cf6');
  if (s.includes('repair started')||s.includes('repairing')||s.includes('in repair')) return make('#f97316', '#f97316');
  if (s.includes('waiting'))                               return make('#f59e0b', '#f59e0b');
  if (s.includes('completed'))                             return make('#10b981', '#10b981');
  if (s.includes('returned'))                              return make('#22c55e', '#22c55e');
  if (s.includes('cancel')||s.includes('non repairable')||s.includes('rejected')) return make('#ef4444', '#ef4444');
  return make('#6b7280', '#6b7280');
}
