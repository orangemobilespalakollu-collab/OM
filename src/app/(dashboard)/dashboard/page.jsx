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
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600;700;800&display=swap');

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

/* ── ORIGINAL KEYFRAMES ── */
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
@keyframes blink {
  0%,100% { opacity: 1; }
  50%      { opacity: 0.2; }
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

/* ── NEW ENHANCED KEYFRAMES ── */

/* Greeting text shimmer */
@keyframes text-shimmer {
  0%   { background-position: -300% center; }
  100% { background-position:  300% center; }
}

/* Floating particle */
@keyframes particle-float {
  0%   { transform: translateY(0)   translateX(0)   scale(1);   opacity: 0.8; }
  50%  { transform: translateY(-32px) translateX(8px)  scale(1.2); opacity: 0.4; }
  100% { transform: translateY(-64px) translateX(-4px) scale(0.6); opacity: 0; }
}

/* Number slot-machine roll */
@keyframes slot-roll {
  0%   { transform: translateY(100%); opacity: 0; }
  20%  { opacity: 1; }
  100% { transform: translateY(0);    opacity: 1; }
}

/* Ink drop reveal — card enters with ink spreading from center */
@keyframes ink-spread {
  from { clip-path: circle(0% at 50% 50%); opacity: 0; }
  to   { clip-path: circle(150% at 50% 50%); opacity: 1; }
}

/* Border trace — accent border draws around card on hover */
@keyframes border-trace {
  0%   { stroke-dashoffset: 800; }
  100% { stroke-dashoffset: 0; }
}

/* Magnetic pull — icon snaps toward cursor */
@keyframes magnetic-snap {
  0%   { transform: scale(1) rotate(0deg); }
  50%  { transform: scale(1.15) rotate(-6deg); }
  100% { transform: scale(1.1) rotate(3deg); }
}

/* Stagger entrance with spring overshoot */
@keyframes spring-in {
  0%   { opacity: 0; transform: translateY(24px) scale(0.94); filter: blur(4px); }
  60%  { opacity: 1; transform: translateY(-4px) scale(1.01); filter: blur(0); }
  80%  { transform: translateY(2px) scale(0.995); }
  100% { transform: translateY(0)   scale(1); }
}

/* Clock pulse aura */
@keyframes clock-aura {
  0%   { box-shadow: 0 0 0 0px rgba(249,115,22,0.0), 0 0 0 0px rgba(249,115,22,0.0); }
  50%  { box-shadow: 0 0 0 8px rgba(249,115,22,0.06), 0 0 0 16px rgba(249,115,22,0.03); }
  100% { box-shadow: 0 0 0 0px rgba(249,115,22,0.0), 0 0 0 0px rgba(249,115,22,0.0); }
}

/* Section label line draw */
@keyframes line-draw {
  from { width: 0; opacity: 0; }
  to   { width: 100%; opacity: 1; }
}

/* Alert enter — left wipe */
@keyframes alert-enter {
  from { opacity: 0; transform: translateX(-20px) scaleX(0.95); }
  to   { opacity: 1; transform: translateX(0)      scaleX(1); }
}

/* Activity row — alternating sides */
@keyframes row-from-left {
  from { opacity: 0; transform: translateX(-16px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes row-from-right {
  from { opacity: 0; transform: translateX(16px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* Stat digit count flip */
@keyframes digit-flip {
  0%   { transform: rotateX(-90deg); opacity: 0; }
  60%  { transform: rotateX(10deg);  opacity: 1; }
  100% { transform: rotateX(0deg);   opacity: 1; }
}

/* Background noise grain */
@keyframes noise-pan {
  0%   { transform: translate(0, 0); }
  10%  { transform: translate(-2%, -3%); }
  20%  { transform: translate(3%, 1%); }
  30%  { transform: translate(-1%, 4%); }
  40%  { transform: translate(4%, -2%); }
  50%  { transform: translate(-3%, 2%); }
  60%  { transform: translate(1%, -4%); }
  70%  { transform: translate(-4%, 1%); }
  80%  { transform: translate(2%, 3%); }
  90%  { transform: translate(-1%, -2%); }
  100% { transform: translate(0, 0); }
}

/* Orb drift */
@keyframes orb-drift {
  0%,100% { transform: translate(0, 0)    scale(1); }
  33%      { transform: translate(12px, -16px) scale(1.05); }
  66%      { transform: translate(-8px, 8px)   scale(0.97); }
}

/* Summary card icon bounce */
@keyframes icon-spring {
  0%   { transform: scale(1)    rotate(0deg); }
  30%  { transform: scale(1.25) rotate(-8deg); }
  60%  { transform: scale(0.9)  rotate(4deg); }
  80%  { transform: scale(1.05) rotate(-2deg); }
  100% { transform: scale(1)    rotate(0deg); }
}

/* Gradient sweep on dark header */
@keyframes header-sweep {
  0%,100% { opacity: 0.5; }
  50%      { opacity: 0.9; }
}

/* Section enter — spring physics */
@keyframes section-spring {
  0%   { opacity: 0; transform: translateY(28px); filter: blur(6px); }
  55%  { opacity: 1; transform: translateY(-5px); filter: blur(0); }
  75%  { transform: translateY(2px); }
  90%  { transform: translateY(-1px); }
  100% { transform: translateY(0); }
}

/* Priority card count — rolling digits */
@keyframes count-roll {
  0%   { opacity: 0; transform: translateY(20px) scale(0.85); }
  50%  { opacity: 1; transform: translateY(-2px) scale(1.02); }
  100% { transform: translateY(0) scale(1); }
}

/* Hover glow ring that expands outward */
@keyframes expand-ring {
  0%   { transform: scale(0.8); opacity: 0.5; }
  100% { transform: scale(1.5); opacity: 0; }
}

/* ── STAGGER ── */
.stagger > *:nth-child(1) { animation: spring-in 0.65s var(--ease-expo) 0.04s both; }
.stagger > *:nth-child(2) { animation: spring-in 0.65s var(--ease-expo) 0.10s both; }
.stagger > *:nth-child(3) { animation: spring-in 0.65s var(--ease-expo) 0.16s both; }
.stagger > *:nth-child(4) { animation: spring-in 0.65s var(--ease-expo) 0.22s both; }
.stagger > *:nth-child(5) { animation: spring-in 0.65s var(--ease-expo) 0.28s both; }
.stagger > *:nth-child(6) { animation: spring-in 0.65s var(--ease-expo) 0.34s both; }

.section-enter { animation: section-spring 0.75s var(--ease-expo) both; }

/* ── SHINE SWEEP ── */
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

/* ── RIPPLE ── */
.ripple-host { position: relative; overflow: hidden; }
.ripple-circle {
  position: absolute; border-radius: 50%;
  background: rgba(255,255,255,0.28);
  transform: scale(0);
  animation: ripple-out 0.6s linear forwards;
  pointer-events: none;
}

/* ── BLOB ── */
.blob {
  border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
  animation: blob-morph 10s ease-in-out infinite, orb-drift 8s ease-in-out infinite;
  position: absolute; pointer-events: none;
}

/* ── ACCENT LINE ── */
.accent-line {
  display: block; height: 2px; background: var(--accent);
  animation: underline-grow 0.8s var(--ease-expo) 0.3s both;
}

/* ── GLOW BREATHE ── */
.accent-glow { animation: glow-breathe 3s ease-in-out infinite; }

/* ── SHIMMER TEXT ── */
.shimmer-greeting {
  background: linear-gradient(90deg,
    rgba(255,255,255,0.94) 0%,
    var(--accent) 30%,
    rgba(255,255,255,0.94) 50%,
    var(--accent) 70%,
    rgba(255,255,255,0.94) 100%
  );
  background-size: 300% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: text-shimmer 5s linear infinite;
}

/* ── NOISE OVERLAY ── */
.noise-overlay::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 3;
  opacity: 0.025;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  animation: noise-pan 0.4s steps(2) infinite;
  mix-blend-mode: overlay;
  border-radius: inherit;
}

/* ── CLOCK AURA ── */
.clock-aura { animation: clock-aura 3s ease-in-out infinite; }

/* ── DIALOG OVERRIDES (unchanged) ── */
[role="dialog"] {
  border-radius: 1.5rem !important;
  border: 1px solid var(--border) !important;
  box-shadow: 0 25px 60px -12px rgba(0,0,0,0.18) !important;
  font-family: 'Geist', system-ui, sans-serif !important;
  overflow: hidden !important;
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

/* ── PRIORITY CARD RING ── */
.priority-ring {
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s;
}
.priority-ring-active { opacity: 1; }

/* ── FLOATING PARTICLE ── */
.dash-particle {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  animation: particle-float 1.4s ease-out forwards;
}
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

/* ─── 3D Tilt hook — ENHANCED with velocity tracking ─── */
function useTilt(strength = 6) {
  const ref = useRef(null);
  const velRef = useRef({ x: 0, y: 0, lastX: 0, lastY: 0 });

  const onMove = useCallback((e) => {
    const el = ref.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
    const dy = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);

    /* velocity-based dynamic strength */
    const vx = e.clientX - velRef.current.lastX;
    const vy = e.clientY - velRef.current.lastY;
    velRef.current = { x: vx, y: vy, lastX: e.clientX, lastY: e.clientY };
    const speed = Math.sqrt(vx * vx + vy * vy);
    const dynStrength = strength + Math.min(speed * 0.15, 4);

    el.style.transform = `perspective(700px) rotateY(${dx * dynStrength}deg) rotateX(${-dy * dynStrength}deg) translateY(-3px) scale(1.018)`;
    el.style.boxShadow = `${-dx * 8}px ${dy * 8}px 32px rgba(0,0,0,0.12), 0 0 0 1.5px rgba(249,115,22,0.22)`;
    el.style.transition = 'transform 0.08s linear, box-shadow 0.08s linear';
  }, [strength]);

  const onLeave = useCallback(() => {
    const el = ref.current; if (!el) return;
    el.style.transition = 'transform 0.5s var(--ease-spring), box-shadow 0.5s ease';
    el.style.transform = '';
    el.style.boxShadow = '';
  }, []);

  return { ref, onMouseMove: onMove, onMouseLeave: onLeave };
}

/* ─── Count-up hook — ENHANCED with slot-machine effect ─── */
function useCountUp(target, duration = 1000, delay = 0) {
  const [value, setValue] = useState(0);
  const [isRolling, setIsRolling] = useState(false);

  useEffect(() => {
    if (typeof target !== 'number') { setValue(target); return; }
    let start = null;
    const t = setTimeout(() => {
      setIsRolling(true);
      const step = (ts) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 4);
        setValue(Math.floor(ease * target));
        if (p < 1) requestAnimationFrame(step);
        else { setValue(target); setTimeout(() => setIsRolling(false), 100); }
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(t);
  }, [target, duration, delay]);

  return { value, isRolling };
}

/* ─── Particle emitter — fires on hover ─── */
function useParticleEmitter(color = 'var(--accent)') {
  const [particles, setParticles] = useState([]);

  const emit = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const id = Math.random().toString(36).slice(2);
    setParticles(p => [...p.slice(-8), { id, x, y, size: 4 + Math.random() * 5 }]);
    setTimeout(() => setParticles(p => p.filter(pt => pt.id !== id)), 1500);
  }, []);

  const ParticleLayer = () => (
    <>
      {particles.map(pt => (
        <span key={pt.id} className="dash-particle" style={{
          left: `${pt.x}%`, top: `${pt.y}%`,
          width: pt.size, height: pt.size,
          background: color, opacity: 0.65,
          animationDuration: `${1.1 + Math.random() * 0.5}s`,
        }} />
      ))}
    </>
  );

  return { emit, ParticleLayer };
}

/* ─── Parallax hook — ties element movement to scroll/mouse ─── */
function useParallax(factor = 0.04) {
  const ref = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const handleMouse = (e) => {
      if (!ref.current) return;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const dx = (e.clientX - cx) * factor;
        const dy = (e.clientY - cy) * factor;
        if (ref.current) {
          ref.current.style.transform = `translate(${dx}px, ${dy}px)`;
        }
      });
    };
    window.addEventListener('mousemove', handleMouse, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouse);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [factor]);

  return ref;
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

  /* NEW — header mouse parallax */
  const headerRef = useRef(null);
  const blob1Ref  = useParallax(0.025);
  const blob2Ref  = useParallax(0.04);

  /* Header section cursor glow */
  const [headerCursor, setHeaderCursor] = useState({ x: 50, y: 50, active: false });

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

  /* Header cursor tracking for radial highlight */
  const handleHeaderMouseMove = useCallback((e) => {
    const rect = headerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top)  / rect.height) * 100;
    setHeaderCursor({ x, y, active: true });
  }, []);

  if (loading) return <DashboardSkeleton />;

  const totalPages = Math.ceil(Math.min(totalActivities, MAX_ACT) / PER_PAGE);
  const h = now.getHours();
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';

  const S = {
    panel: {
      background: 'var(--surface-raise)',
      border: '1px solid var(--border)',
      borderRadius: '1.5rem',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
    },
    topAccentBar: {
      position: 'absolute', top: 0, left: '1.5rem', right: '1.5rem', height: 2,
      background: 'linear-gradient(90deg, var(--accent), transparent)',
      borderRadius: '0 0 3px 3px', opacity: 0.55,
    },
    panelTitle: {
      display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem',
    },
    panelIcon: {
      width: 32, height: 32, borderRadius: '0.625rem',
      background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
  };

  return (
    <>
      <StyleInjector />
      <div className="font-body" style={{ backgroundColor: 'var(--surface)', minHeight: '100vh', padding: '0.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* ══════════ HERO HEADER ══════════ */}
          <header
            ref={headerRef}
            className={cn(mounted && 'section-enter', 'noise-overlay')}
            onMouseMove={handleHeaderMouseMove}
            onMouseLeave={() => setHeaderCursor(c => ({ ...c, active: false }))}
            style={{
              background: 'linear-gradient(135deg, #0d0d0d 0%, #181818 60%, #0d0d0d 100%)',
              borderRadius: '1.75rem',
              padding: '1.75rem',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 24px 60px -16px rgba(0,0,0,0.45)',
              animationDelay: '0s',
            }}
          >
            {/* Cursor-following radial highlight */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
              borderRadius: 'inherit',
              background: headerCursor.active
                ? `radial-gradient(circle 180px at ${headerCursor.x}% ${headerCursor.y}%, rgba(249,115,22,0.10) 0%, transparent 70%)`
                : 'none',
              transition: 'background 0.1s ease',
            }} />

            {/* Morphing blobs — now with parallax via refs */}
            <div ref={blob1Ref} className="blob" style={{ width: 280, height: 280, background: 'var(--accent)', opacity: 0.07, top: -70, right: -50, transition: 'transform 0.6s ease-out' }} />
            <div ref={blob2Ref} className="blob" style={{ width: 180, height: 180, background: 'var(--accent)', opacity: 0.05, bottom: -50, left: '25%', animationDelay: '4s', transition: 'transform 0.9s ease-out' }} />

            {/* Third small accent blob — slow pulse */}
            <div style={{
              position: 'absolute', width: 100, height: 100, left: '8%', top: '20%',
              borderRadius: '50%', background: 'var(--accent)', opacity: 0.04, filter: 'blur(24px)',
              animation: 'blob-morph 14s ease-in-out 2s infinite',
              pointerEvents: 'none',
            }} />

            {/* Spinning orbit rings */}
            <div style={{ position: 'absolute', right: 28, top: 28, width: 88, height: 88, animation: 'spin-slow 20s linear infinite', pointerEvents: 'none' }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '1px dashed rgba(249,115,22,0.18)' }} />
            </div>
            <div style={{ position: 'absolute', right: 36, top: 36, width: 56, height: 56, animation: 'spin-slow 9s linear infinite reverse', pointerEvents: 'none' }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '1px solid rgba(249,115,22,0.1)' }} />
            </div>
            {/* NEW — third ring, counter-rotate */}
            <div style={{ position: 'absolute', right: 20, top: 20, width: 110, height: 110, animation: 'spin-slow 35s linear infinite', pointerEvents: 'none', opacity: 0.6 }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '1px dotted rgba(249,115,22,0.08)' }} />
            </div>
            {/* Orbiting dot */}
            <div style={{ position: 'absolute', right: 50, top: 50, pointerEvents: 'none' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', opacity: 0.65, animation: 'orbit 9s linear infinite' }} />
            </div>
            {/* NEW — second orbiting dot, opposite phase */}
            <div style={{ position: 'absolute', right: 50, top: 50, pointerEvents: 'none' }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', animation: 'orbit 14s linear 4.5s infinite reverse' }} />
            </div>

            {/* Corner accent line */}
            <div style={{ position: 'absolute', top: 0, left: '8%', width: 100, height: 2, background: 'linear-gradient(90deg, var(--accent), transparent)', opacity: 0.55 }} />
            {/* NEW — bottom edge accent line */}
            <div style={{ position: 'absolute', bottom: 0, right: '12%', width: 60, height: 1, background: 'linear-gradient(90deg, transparent, rgba(249,115,22,0.3))', animation: 'header-sweep 4s ease-in-out infinite' }} />

            <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1.25rem' }}>
              <div>
                <p style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', marginBottom: '0.5rem' }}>
                  {formatDate(now)}
                </p>
                {/* ENHANCED — shimmer greeting */}
                <h1 className="font-display shimmer-greeting" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 400, lineHeight: 1.1, marginBottom: '0.5rem', fontStyle: 'italic' }}>
                  {greeting}, {profile?.name?.split(' ')[0] || 'there'}
                </h1>
                <span className="accent-line" style={{ width: 56 }} />
                <p style={{ marginTop: '0.7rem', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>
                  Your shop's pulse, at a glance.
                </p>
              </div>

              {/* Clock — ENHANCED with aura */}
              <div
                className="clock-aura"
                style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '1.125rem', padding: '0.85rem 1.4rem', textAlign: 'right', minWidth: 128, position: 'relative', overflow: 'hidden' }}
              >
                {/* Clock internal shimmer sweep */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, transparent, rgba(249,115,22,0.04), transparent)', backgroundSize: '200% 100%', animation: 'shine 3s ease infinite', pointerEvents: 'none', borderRadius: 'inherit' }} />
                <p style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', lineHeight: 1, margin: 0, position: 'relative' }}>
                  {formatTime(now)}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem', marginTop: '0.4rem' }}>
                  <span style={{ display: 'inline-block', position: 'relative', width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }}>
                    <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#22c55e', animation: 'live-ring 2s ease-out infinite' }} />
                  </span>
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)' }}>Live</span>
                </div>
              </div>
            </div>
          </header>

          {/* ══════════ QUICK ACTIONS ══════════ */}
          <section className={cn(mounted && 'section-enter')} style={{ animationDelay: '0.12s' }}>
            <SectionLabel icon={Zap} label="Quick Actions" />
            <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              {[
                { name: 'Register New Service', desc: 'Create a service ticket',    icon: PlusCircle,  href: '/services?action=new' },
                { name: 'Add New Sale',         desc: 'Record parts / accessories', icon: ShoppingBag, href: '/sales?action=new' },
                { name: 'View Services',        desc: 'Manage active repairs',       icon: Wrench,      href: '/services' },
              ].map(a => <QuickActionButton key={a.name} action={a} onClick={() => router.push(a.href)} />)}
            </div>
          </section>

          {/* ══════════ WORK PRIORITY ══════════ */}
          <section className={cn(mounted && 'section-enter')} style={{ animationDelay: '0.20s' }}>
            <SectionLabel icon={Activity} label="Work Priority" />
            <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
              <PriorityCard title="Received"               count={stats.received}            statusColor="#3b82f6" onClick={() => router.push('/services?status=Received')} />
              <PriorityCard title="In Progress"            count={stats.inProgress}           statusColor="#f97316" onClick={() => router.push('/services?status=In Progress')} />
              <PriorityCard title="Waiting for Parts"      count={stats.waitingForParts}      statusColor="#f59e0b" onClick={() => router.push('/services?status=Waiting for Parts')} />
              <PriorityCard title="Completed (Unreturned)" count={stats.completedNotReturned} statusColor="#10b981" onClick={() => router.push('/services?status=Completed')} />
            </div>
          </section>

          {/* ══════════ TODAY SUMMARY ══════════ */}
          <section className={cn(mounted && 'section-enter')} style={{ animationDelay: '0.28s' }}>
            <SectionLabel icon={Sparkles} label="Today Summary" />
            <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.875rem' }}>
              <MetricDetailsDialog title="Registered Today" dataList={stats.registeredTodayList}>
                <SummaryCard title="Registered"    value={stats.registeredToday}             icon={FileEdit}     dotColor="#3b82f6" />
              </MetricDetailsDialog>
              <SummaryCard title="Completed"      value={stats.completedToday}               icon={CheckCircle2} dotColor="#10b981" onClick={() => router.push('/services?filter=completedToday')} />
              <SummaryCard title="Non Repairable" value={stats.notRepairableToday}           icon={XOctagon}     dotColor="#ef4444" onClick={() => router.push('/services?filter=notRepairableToday')} />
              <SummaryCard title="Returned"       value={stats.returnedToday}                icon={PackageCheck} dotColor="#06b6d4" onClick={() => router.push('/history?tab=services&today=returned')} />
              <SummaryCard title="Sales"          value={stats.salesToday}                   icon={ShoppingBag}  dotColor="#a855f7" onClick={() => router.push('/sales?today=true')} />
              <SummaryCard title="Revenue"        value={formatCurrency(stats.revenueToday)} icon={IndianRupee}  dotColor="#f97316" isCurrency
                onClick={() => { if (profile?.role === 'admin' || profile?.role === 'owner') setIsRevenueOpen(true); }} />
            </div>
          </section>

          {/* ══════════ BOTTOM GRID ══════════ */}
          <div className={cn(mounted && 'section-enter')} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', animationDelay: '0.36s' }}>

            {/* Recent Activity */}
            <section style={S.panel}>
              <div style={S.topAccentBar} />
              <div style={S.panelTitle}>
                <div style={S.panelIcon}><Clock style={{ width: 15, height: 15, color: 'var(--accent)' }} /></div>
                <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--ink)' }}>Recent Activity</span>
                <span style={{
                  marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem',
                  fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
                  color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0',
                  borderRadius: 100, padding: '0.25rem 0.75rem',
                }}>
                  <span style={{ position: 'relative', display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }}>
                    <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#22c55e', animation: 'live-ring 2s ease-out infinite' }} />
                  </span>
                  Live
                </span>
              </div>

              {activityLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} style={{ height: 72, borderRadius: '0.875rem', background: '#f3f4f6', animation: `fade-up 0.3s ease ${i * 0.05}s both` }} />
                  ))}
                </div>
              ) : recentActivity.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 160, borderRadius: '0.875rem', border: '2px dashed var(--border)', background: 'var(--surface)', gap: '0.5rem' }}>
                  <Clock style={{ width: 28, height: 28, color: 'var(--border-strong)' }} />
                  <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ink-faint)' }}>No activity yet today</p>
                </div>
              ) : (
                <>
                  <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
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
                    <div style={{ marginTop: '1.125rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <PaginationBtn label="← Prev" disabled={currentPage === 1}          onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} />
                      <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-faint)' }}>
                        Page <strong style={{ color: 'var(--ink)' }}>{currentPage}</strong> / <strong style={{ color: 'var(--ink)' }}>{totalPages}</strong>
                      </p>
                      <PaginationBtn label="Next →" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} />
                    </div>
                  )}
                </>
              )}
            </section>

            {/* Smart Alerts */}
            <section style={S.panel}>
              <div style={S.topAccentBar} />
              <div style={S.panelTitle}>
                <div style={S.panelIcon}><Bell style={{ width: 15, height: 15, color: 'var(--accent)' }} /></div>
                <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--ink)' }}>Smart Alerts</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {stats.alerts ? (
                  <>
                    {stats.alerts.oldInProgress > 0 && (
                      <AlertItem message={`${stats.alerts.oldInProgress} service${stats.alerts.oldInProgress > 1 ? 's have' : ' has'} been In Progress for over 3 days`} type="warning" index={0} />
                    )}
                    {stats.alerts.oldWaitingForParts > 0 && (
                      <AlertItem message={`${stats.alerts.oldWaitingForParts} service${stats.alerts.oldWaitingForParts > 1 ? 's are' : ' is'} stuck waiting for parts (5+ days)`} type="danger" index={1} />
                    )}
                    {stats.alerts.oldCompletedNotReturned > 0 && (
                      <AlertItem message={`${stats.alerts.oldCompletedNotReturned} completed service${stats.alerts.oldCompletedNotReturned > 1 ? 's have' : ' has'} not been picked up for over a week`} type="warning" index={2} />
                    )}
                    {stats.alerts.oldInProgress === 0 && stats.alerts.oldWaitingForParts === 0 && stats.alerts.oldCompletedNotReturned === 0 && (
                      <AlertItem message="All systems clear — no pending bottlenecks 🎉" type="success" index={0} />
                    )}
                  </>
                ) : (
                  <>
                    <div style={{ height: 56, borderRadius: '0.75rem', background: '#f3f4f6', animation: 'fade-up 0.3s ease both' }} />
                    <div style={{ height: 56, borderRadius: '0.75rem', background: '#f3f4f6', animation: 'fade-up 0.3s ease 0.06s both' }} />
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

/* ─── SectionLabel — ENHANCED with animated line ─── */
function SectionLabel({ icon: Icon, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.875rem' }}>
      <div style={{ width: 24, height: 24, borderRadius: '0.375rem', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon style={{ width: 12, height: 12, color: 'var(--accent)' }} strokeWidth={2.5} />
      </div>
      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ink-mid)', letterSpacing: '0.01em' }}>{label}</span>
      {/* Enhanced: two-layer line — static base + animated accent */}
      <div style={{ flex: 1, position: 'relative', height: 1 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'var(--border)', borderRadius: 2 }} />
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '40%', background: 'linear-gradient(90deg, rgba(249,115,22,0.35), transparent)', borderRadius: 2, animation: 'underline-grow 0.9s var(--ease-expo) 0.2s both' }} />
      </div>
    </div>
  );
}

/* ─── QuickActionButton — ENHANCED with particle emitter ─── */
function QuickActionButton({ action: a, onClick }) {
  const ripple = useRipple();
  const { ref, onMouseMove, onMouseLeave } = useTilt(4);
  const [hovered, setHovered] = useState(false);
  const { emit, ParticleLayer } = useParticleEmitter('var(--accent)');

  return (
    <button
      ref={ref}
      onClick={(e) => { ripple(e); onClick(); }}
      onMouseMove={(e) => { onMouseMove(e); }}
      onMouseLeave={() => { onMouseLeave(); setHovered(false); }}
      onMouseEnter={(e) => { setHovered(true); emit(e); }}
      className="ripple-host shine-host"
      style={{
        position: 'relative', display: 'flex', alignItems: 'center', gap: '1rem',
        padding: '1rem 1.1rem', borderRadius: '1.125rem', cursor: 'pointer', textAlign: 'left',
        background: hovered ? 'var(--ink)' : 'var(--surface-raise)',
        border: `1.5px solid ${hovered ? 'var(--ink)' : 'var(--border)'}`,
        transition: 'background 0.25s, border-color 0.25s', willChange: 'transform',
      }}
    >
      <ParticleLayer />
      {/* Accent stripe */}
      <div style={{
        position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 3,
        borderRadius: '0 3px 3px 0', background: 'var(--accent)',
        transform: hovered ? 'scaleY(1)' : 'scaleY(0.35)',
        transition: 'transform 0.3s var(--ease-spring)', transformOrigin: 'center',
      }} />
      <div style={{
        width: 40, height: 40, borderRadius: '0.75rem', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: hovered ? 'rgba(249,115,22,0.15)' : 'var(--surface)',
        border: `1px solid ${hovered ? 'rgba(249,115,22,0.35)' : 'var(--border)'}`,
        transition: 'background 0.25s, border-color 0.25s, transform 0.3s var(--ease-spring)',
        transform: hovered ? 'scale(1.1) rotate(4deg)' : 'scale(1)',
        animation: hovered ? 'icon-spring 0.5s var(--ease-spring)' : 'none',
      }}>
        <a.icon style={{ width: 18, height: 18, color: hovered ? 'var(--accent)' : 'var(--ink-mid)', transition: 'color 0.2s' }} strokeWidth={2.5} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: hovered ? '#fff' : 'var(--ink)', transition: 'color 0.2s', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</p>
        <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: hovered ? 'rgba(255,255,255,0.42)' : 'var(--ink-faint)', transition: 'color 0.2s' }}>{a.desc}</p>
      </div>
      <ArrowUpRight style={{ width: 15, height: 15, flexShrink: 0, color: hovered ? 'var(--accent)' : 'var(--border-strong)', transform: hovered ? 'translate(2px,-2px)' : 'translate(0,0)', transition: 'transform 0.2s, color 0.2s' }} />
    </button>
  );
}

/* ─── PriorityCard — ENHANCED with ring expand on hover ─── */
function PriorityCard({ title, count, statusColor, onClick }) {
  const { value: animated, isRolling } = useCountUp(count, 950, 280);
  const { ref, onMouseMove, onMouseLeave } = useTilt(5);
  const [hovered, setHovered] = useState(false);
  const [ringActive, setRingActive] = useState(false);

  return (
    <button
      ref={ref} onClick={onClick}
      onMouseMove={onMouseMove}
      onMouseLeave={() => { onMouseLeave(); setHovered(false); setRingActive(false); }}
      onMouseEnter={() => { setHovered(true); setRingActive(true); setTimeout(() => setRingActive(false), 600); }}
      className="ripple-host shine-host"
      style={{
        textAlign: 'left', cursor: 'pointer',
        borderRadius: '1.25rem', padding: '1.25rem',
        background: 'var(--surface-raise)',
        border: `1.5px solid ${hovered ? statusColor + '55' : 'var(--border)'}`,
        position: 'relative', overflow: 'hidden',
        transition: 'border-color 0.25s, box-shadow 0.25s',
        boxShadow: hovered ? `0 8px 32px ${statusColor}22` : '0 2px 8px rgba(0,0,0,0.04)',
        willChange: 'transform',
      }}
    >
      {/* Top bar reveal */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: statusColor, transform: hovered ? 'scaleX(1)' : 'scaleX(0)', transformOrigin: 'left', transition: 'transform 0.35s var(--ease-expo)' }} />
      {/* Ambient glow spot */}
      <div style={{ position: 'absolute', right: -20, bottom: -20, width: 80, height: 80, borderRadius: '50%', background: statusColor, opacity: hovered ? 0.09 : 0.04, transition: 'opacity 0.3s', filter: 'blur(20px)' }} />

      {/* NEW — expand ring on hover entry */}
      {ringActive && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 'inherit',
          border: `1.5px solid ${statusColor}`,
          animation: 'expand-ring 0.6s ease-out forwards',
          pointerEvents: 'none',
        }} />
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor, display: 'inline-block', boxShadow: `0 0 0 3px ${statusColor}22` }} />
        <TrendingUp style={{ width: 13, height: 13, color: hovered ? statusColor : 'var(--border-strong)', transition: 'color 0.2s' }} />
      </div>
      <p style={{
        fontSize: '2.625rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1,
        color: 'var(--ink)', margin: 0,
        animation: isRolling ? 'count-roll 0.4s var(--ease-spring) both' : 'num-rise 0.5s var(--ease-spring) both',
        display: 'inline-block',
      }}>
        {animated}
      </p>
      <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', fontWeight: 500, color: 'var(--ink-faint)', lineHeight: 1.3 }}>{title}</p>
    </button>
  );
}

/* ─── SummaryCard — ENHANCED with icon spring on hover ─── */
function SummaryCard({ title, value, isCurrency, onClick, icon: Icon, dotColor }) {
  const { value: animated } = useCountUp(typeof value === 'number' ? value : 0, 800, 380);
  const displayValue = isCurrency ? value : (typeof value === 'number' ? animated : value);
  const [hovered, setHovered] = useState(false);
  const [iconSprung, setIconSprung] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => { setHovered(true); setIconSprung(true); setTimeout(() => setIconSprung(false), 500); }}
      onMouseLeave={() => setHovered(false)}
      className="ripple-host shine-host"
      style={{
        width: '100%', textAlign: 'left', cursor: 'pointer',
        borderRadius: '1.125rem', padding: '1rem',
        background: 'var(--surface-raise)',
        border: `1.5px solid ${hovered ? dotColor + '50' : 'var(--border)'}`,
        position: 'relative', overflow: 'hidden',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: hovered ? `0 6px 24px ${dotColor}1a` : '0 2px 8px rgba(0,0,0,0.03)',
        willChange: 'transform',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: dotColor, transform: hovered ? 'scaleX(1)' : 'scaleX(0)', transformOrigin: 'left', transition: 'transform 0.3s var(--ease-expo)' }} />

      {/* Ambient corner glow */}
      <div style={{ position: 'absolute', right: -10, bottom: -10, width: 48, height: 48, borderRadius: '50%', background: dotColor, opacity: hovered ? 0.12 : 0.04, filter: 'blur(12px)', transition: 'opacity 0.3s' }} />

      <div style={{
        width: 32, height: 32, borderRadius: '0.625rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: dotColor + '15', border: `1px solid ${dotColor}28`, marginBottom: '0.625rem',
        transition: 'transform 0.3s var(--ease-spring)',
        animation: iconSprung ? 'icon-spring 0.5s var(--ease-spring)' : 'none',
      }}>
        <Icon style={{ width: 15, height: 15, color: dotColor }} strokeWidth={2} />
      </div>
      <p style={{ fontSize: isCurrency ? '1.0625rem' : '1.625rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, color: 'var(--ink)', margin: 0, animation: 'num-rise 0.5s var(--ease-spring) both' }}>
        {displayValue}
      </p>
      <p style={{ marginTop: '0.375rem', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</p>
    </button>
  );
}

/* ─── AlertItem — ENHANCED with staggered enter + left wipe ─── */
function AlertItem({ message, type, index = 0 }) {
  const cfg = {
    warning: { bg: '#fffbeb', border: '#fde68a', text: '#92400e', icon: TriangleAlert, iconColor: '#f59e0b', accent: '#f59e0b' },
    danger:  { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', icon: AlertCircle,   iconColor: '#ef4444', accent: '#ef4444' },
    success: { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534', icon: CircleCheck,   iconColor: '#22c55e', accent: '#22c55e' },
  }[type];
  const Ic = cfg.icon;
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
      borderRadius: '0.875rem', padding: '0.875rem 1rem',
      background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.text,
      fontSize: '0.8125rem', fontWeight: 500, lineHeight: 1.4,
      position: 'relative', overflow: 'hidden',
      animation: `alert-enter 0.45s var(--ease-expo) ${index * 0.1}s both`,
    }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: cfg.accent, borderRadius: '0.875rem 0 0 0.875rem' }} />
      {/* Animated fill from left */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '100%', background: cfg.accent, opacity: 0.04, transformOrigin: 'left', animation: `underline-grow 0.6s var(--ease-expo) ${index * 0.1}s both`, pointerEvents: 'none' }} />
      <Ic style={{ width: 17, height: 17, color: cfg.iconColor, flexShrink: 0, marginTop: 1, position: 'relative' }} />
      <span style={{ position: 'relative' }}>{message}</span>
    </div>
  );
}

/* ─── ActivityRow — ENHANCED with alternating slide directions ─── */
function ActivityRow({ activity, isMine, ss, index, onClickHandler }) {
  const ripple = useRipple();
  const [hovered, setHovered] = useState(false);
  /* Alternate: even rows from left, odd from right */
  const fromLeft = index % 2 === 0;

  return (
    <button
      onClick={(e) => { ripple(e); onClickHandler(activity); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="ripple-host shine-host"
      style={{
        width: '100%', textAlign: 'left', cursor: 'pointer',
        borderRadius: '0.875rem', padding: '0.875rem 1rem',
        border: `1.5px solid ${isMine ? 'rgba(249,115,22,0.28)' : hovered ? 'var(--border-strong)' : 'var(--border)'}`,
        background: isMine ? 'linear-gradient(135deg,#fff7ed 0%,#fff 100%)' : hovered ? 'var(--surface)' : 'var(--surface-raise)',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        position: 'relative', overflow: 'hidden',
        transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
        boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.07)' : 'none',
        animation: `${fromLeft ? 'row-from-left' : 'row-from-right'} 0.45s var(--ease-expo) ${index * 0.07}s both`,
      }}
    >
      {isMine && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: 'var(--accent)', borderRadius: '0.875rem 0 0 0.875rem' }} />}
      {/* Hover shimmer tint */}
      {hovered && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(249,115,22,0.02), transparent)', pointerEvents: 'none', borderRadius: 'inherit' }} />}

      {/* Status dot with pulse */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <span style={{ display: 'block', width: 10, height: 10, borderRadius: '50%', background: ss.dotColor }} />
        <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: ss.dotColor, opacity: 0.35, animation: 'live-ring 2.5s ease-out infinite' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activity.services?.customer_name || 'Unknown Customer'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
            {isMine && (
              <span style={{ borderRadius: 100, padding: '0.2rem 0.5rem', background: 'var(--accent)', color: '#fff', fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>You</span>
            )}
            <span style={{ fontSize: '0.6875rem', fontWeight: 500, color: 'var(--ink-faint)' }}>{formatTime(activity.created_at)}</span>
          </div>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--ink-faint)', margin: '0.2rem 0 0.4rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {[activity.services?.device_brand, activity.services?.device_model].filter(Boolean).join(' ') || 'Device'}
        </p>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.2rem 0.6rem', borderRadius: '0.375rem', background: ss.dotColor + '12', border: `1px solid ${ss.dotColor}28`, color: ss.dotColor, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: ss.dotColor, display: 'inline-block' }} />
          {activity.status}
        </span>
      </div>
      <ChevronRight style={{ width: 15, height: 15, flexShrink: 0, color: hovered ? 'var(--ink-mid)' : 'var(--border-strong)', transform: hovered ? 'translateX(2px)' : 'translateX(0)', transition: 'transform 0.2s, color 0.2s' }} />
    </button>
  );
}

/* ─── PaginationBtn (unchanged) ─── */
function PaginationBtn({ label, disabled, onClick }) {
  const ripple = useRipple();
  return (
    <button
      onClick={(e) => { ripple(e); onClick(); }}
      disabled={disabled}
      className="ripple-host"
      style={{ padding: '0.375rem 0.875rem', borderRadius: '0.625rem', border: '1.5px solid var(--border)', background: 'var(--surface-raise)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ink-mid)', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1, transition: 'opacity 0.2s' }}
    >{label}</button>
  );
}

/* ─── RevenueBreakdownModal (unchanged) ─── */
function RevenueBreakdownModal({ onClose, serviceRevenue, salesRevenue, router }) {
  const ripple = useRipple();
  const total = (serviceRevenue || 0) + (salesRevenue || 0);
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', padding: '1rem', animation: 'fade-up 0.25s var(--ease-expo) both' }}>
      <div style={{ width: '100%', maxWidth: 360, borderRadius: '1.5rem', background: 'var(--surface-raise)', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.3)', animation: 'num-rise 0.35s var(--ease-spring) both', border: '1px solid var(--border)' }}>
        <div style={{ background: 'var(--ink)', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--accent)' }} />
          <div>
            <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', marginBottom: '0.25rem' }}>Breakdown</p>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', margin: 0 }}>Today's Revenue</h3>
          </div>
          <button onClick={(e) => { ripple(e); onClose(); }} className="ripple-host" style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', color: '#fff', fontSize: '0.8125rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          <RevenueRow label="Services" sublabel="View history →" amount={serviceRevenue || 0} onClick={() => router.push('/history?tab=services&today=returned')} accentColor="#3b82f6" />
          <RevenueRow label="Sales"    sublabel="View history →" amount={salesRevenue   || 0} onClick={() => router.push('/history?tab=sales&today=true')}       accentColor="#a855f7" />
          <div className="accent-glow" style={{ borderRadius: '0.875rem', background: 'var(--ink)', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.65)', margin: 0 }}>Total Revenue</p>
            <p style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--accent)', margin: 0 }}>{formatCurrency(total)}</p>
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
    <button onClick={(e) => { ripple(e); onClick(); }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} className="ripple-host shine-host"
      style={{ width: '100%', textAlign: 'left', cursor: 'pointer', borderRadius: '0.875rem', padding: '1rem 1.25rem', border: `1.5px solid ${hovered ? accentColor + '50' : 'var(--border)'}`, background: hovered ? accentColor + '08' : 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'border-color 0.2s, background 0.2s' }}>
      <div>
        <p style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: accentColor, margin: 0 }}>{label}</p>
        <p style={{ fontSize: '0.6875rem', color: 'var(--ink-faint)', margin: '0.2rem 0 0', fontWeight: 500 }}>{sublabel}</p>
      </div>
      <p style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em', color: accentColor, margin: 0 }}>{formatCurrency(amount)}</p>
    </button>
  );
}

/* ─── DashboardSkeleton (unchanged) ─── */
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

/* ─── Status styles helper (unchanged) ─── */
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
