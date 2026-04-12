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
   STYLES — All original styles PRESERVED + advanced VFX/motion layer added
───────────────────────────────────────────────────────────────────────────── */
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

  /* VFX tokens */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
  --ease-in-back: cubic-bezier(0.36, 0, 0.66, -0.56);
}

/* ── Original keyframes (preserved) ── */
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

/* ── NEW Advanced VFX keyframes ── */
@keyframes morph {
  0%,100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
  25%      { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
  50%      { border-radius: 50% 60% 30% 40% / 40% 50% 60% 50%; }
  75%      { border-radius: 40% 30% 60% 70% / 60% 40% 50% 30%; }
}
@keyframes aurora {
  0%   { transform: translate(-50%,-50%) rotate(0deg)   scale(1);   opacity: 0.5; }
  33%  { transform: translate(-50%,-50%) rotate(120deg) scale(1.15); opacity: 0.7; }
  66%  { transform: translate(-50%,-50%) rotate(240deg) scale(0.95); opacity: 0.4; }
  100% { transform: translate(-50%,-50%) rotate(360deg) scale(1);   opacity: 0.5; }
}
@keyframes ticker-slide {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
@keyframes reveal-left {
  from { clip-path: inset(0 100% 0 0); opacity: 0; }
  to   { clip-path: inset(0 0% 0 0);   opacity: 1; }
}
@keyframes pop-in {
  0%   { opacity: 0; transform: scale(0.6) rotate(-6deg); }
  60%  { transform: scale(1.08) rotate(2deg); }
  100% { opacity: 1; transform: scale(1) rotate(0deg); }
}
@keyframes glow-pulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(249,115,22,0); }
  50%      { box-shadow: 0 0 28px 8px rgba(249,115,22,0.18); }
}
@keyframes number-roll {
  from { transform: translateY(100%); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
@keyframes bg-pan {
  from { background-position: 0% 50%; }
  to   { background-position: 100% 50%; }
}
@keyframes dash-draw {
  from { stroke-dashoffset: 1000; }
  to   { stroke-dashoffset: 0; }
}
@keyframes card-enter {
  from { opacity: 0; transform: translateY(32px) scale(0.96); filter: blur(4px); }
  to   { opacity: 1; transform: translateY(0)    scale(1);    filter: blur(0); }
}
@keyframes icon-bounce {
  0%,100% { transform: scale(1) rotate(0deg); }
  30%      { transform: scale(1.2) rotate(-8deg); }
  60%      { transform: scale(0.95) rotate(4deg); }
}
@keyframes shine-sweep {
  from { left: -100%; }
  to   { left: 200%; }
}
@keyframes floating-particle {
  0%   { transform: translateY(0px)   translateX(0px)   opacity: 1; }
  100% { transform: translateY(-80px) translateX(20px)  opacity: 0; }
}
@keyframes counter-up {
  from { transform: translateY(8px); opacity: 0; }
  to   { transform: translateY(0);   opacity: 1; }
}
@keyframes ripple {
  0%   { transform: scale(0);   opacity: 0.5; }
  100% { transform: scale(4);   opacity: 0; }
}
@keyframes line-grow {
  from { transform: scaleX(0); transform-origin: left; }
  to   { transform: scaleX(1); transform-origin: left; }
}
@keyframes noise-shift {
  0%   { transform: translate(0,0); }
  10%  { transform: translate(-2%,-2%); }
  20%  { transform: translate(2%, 1%); }
  30%  { transform: translate(-1%, 3%); }
  40%  { transform: translate(3%,-1%); }
  50%  { transform: translate(-2%, 2%); }
  60%  { transform: translate(1%,-3%); }
  70%  { transform: translate(-3%, 1%); }
  80%  { transform: translate(2%, 2%); }
  90%  { transform: translate(-1%,-2%); }
  100% { transform: translate(0,0); }
}

/* ── Original utility classes (preserved) ── */
.animate-slide-up   { animation: slide-up 0.5s ease forwards; }
.animate-count-in   { animation: count-in 0.4s cubic-bezier(.34,1.56,.64,1) forwards; }
.animate-float      { animation: float 3s ease-in-out infinite; }
.animate-spin-slow  { animation: spin-slow 8s linear infinite; }
.animate-blink      { animation: blink 2s ease-in-out infinite; }

/* ── NEW VFX utility classes ── */
.animate-morph       { animation: morph 8s ease-in-out infinite; }
.animate-aurora      { animation: aurora 12s linear infinite; }
.animate-pop-in      { animation: pop-in 0.5s var(--ease-spring) forwards; }
.animate-glow-pulse  { animation: glow-pulse 3s ease-in-out infinite; }
.animate-card-enter  { animation: card-enter 0.6s var(--ease-out-expo) forwards; }
.animate-icon-bounce { animation: icon-bounce 0.5s var(--ease-spring) forwards; }
.animate-counter-up  { animation: counter-up 0.4s var(--ease-out-quart) forwards; }
.animate-line-grow   { animation: line-grow 0.8s var(--ease-out-expo) forwards; }

/* ── MetricDetailsDialog overrides (preserved) ── */
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
[role="dialog"] table { width: 100%; border-collapse: separate; border-spacing: 0 4px; }
[role="dialog"] thead th {
  font-size: 0.65rem !important; font-weight: 700 !important;
  text-transform: uppercase !important; letter-spacing: 0.1em !important;
  color: #9ca3af !important; padding: 4px 10px !important;
}
[role="dialog"] tbody tr { background: #f9fafb; border-radius: 10px; transition: background 0.15s; }
[role="dialog"] tbody tr:hover { background: #eff6ff !important; }
[role="dialog"] tbody td {
  padding: 8px 10px !important; font-size: 0.8125rem !important;
  font-weight: 500 !important; color: #374151 !important; border-top: none !important;
}
[role="dialog"] tbody td:first-child { border-radius: 10px 0 0 10px; }
[role="dialog"] tbody td:last-child  { border-radius: 0 10px 10px 0; }
[role="dialog"] {
  border-radius: 1.5rem !important; border: 1px solid #e5e7eb !important;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.18) !important;
  font-family: 'DM Sans', sans-serif !important; overflow: hidden !important;
}
[role="dialog"] h2, [role="dialog"] [data-radix-dialog-title] {
  font-family: 'DM Sans', sans-serif !important; font-size: 0.9375rem !important;
  font-weight: 600 !important; color: #111827 !important;
}
[role="dialog"] table, [role="dialog"] [data-list] { font-size: 0.8125rem !important; }
[role="dialog"] tr:nth-child(even), [role="dialog"] li:nth-child(even) { background-color: #f9fafb !important; }

/* ── Original token classes (preserved) ── */
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
.gradient-orange  { background: linear-gradient(135deg, #fff7ed, #fff); }
.gradient-purple  { background: linear-gradient(135deg, #faf5ff, #fff); }
.gradient-blue    { background: linear-gradient(135deg, #eff6ff, #fff); }
.gradient-green   { background: linear-gradient(135deg, #f0fdf4, #fff); }
.gradient-cyan    { background: linear-gradient(135deg, #ecfeff, #fff); }
.gradient-amber   { background: linear-gradient(135deg, #fffbeb, #fff); }
.gradient-red     { background: linear-gradient(135deg, #fef2f2, #fff); }
.gradient-emerald { background: linear-gradient(135deg, #ecfdf5, #fff); }
.glow-orange { box-shadow: 0 4px 24px rgba(249,115,22,0.18); }
.glow-purple { box-shadow: 0 4px 24px rgba(168,85,247,0.18); }
.glow-blue   { box-shadow: 0 4px 24px rgba(59,130,246,0.18); }
.glow-green  { box-shadow: 0 4px 24px rgba(34,197,94,0.18); }
.orb {
  border-radius: 50%; filter: blur(40px);
  position: absolute; pointer-events: none;
}
.dashboard-font { font-family: 'DM Sans', sans-serif; }
.display-font   { font-family: 'Syne', sans-serif; }

/* ── NEW VFX Specific styles ── */

/* Magnetic card — enhanced card-hover with magnetic field effect */
.magnetic-card {
  transition: transform 0.3s var(--ease-spring), box-shadow 0.3s ease, border-color 0.2s;
  will-change: transform;
}

/* Shimmer sweep on hover (shine across card) */
.shine-on-hover {
  position: relative;
  overflow: hidden;
}
.shine-on-hover::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -100%;
  width: 60%;
  height: 200%;
  background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.5) 50%, transparent 60%);
  transform: skewX(-20deg);
  transition: none;
  pointer-events: none;
}
.shine-on-hover:hover::after {
  animation: shine-sweep 0.55s ease forwards;
}

/* Aurora header bg */
.aurora-bg {
  position: relative;
  overflow: hidden;
}
.aurora-bg::before {
  content: '';
  position: absolute;
  width: 500px; height: 500px;
  background: conic-gradient(
    from 0deg,
    rgba(249,115,22,0.25),
    rgba(168,85,247,0.2),
    rgba(59,130,246,0.2),
    rgba(249,115,22,0.25)
  );
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  animation: aurora 16s linear infinite;
  border-radius: 50%;
  filter: blur(60px);
}

/* Morph blob decoration */
.morph-blob {
  animation: morph 10s ease-in-out infinite;
  border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
}

/* Stagger entrance for grid children */
.stagger-enter > *:nth-child(1) { animation: card-enter 0.55s var(--ease-out-expo) 0.05s both; }
.stagger-enter > *:nth-child(2) { animation: card-enter 0.55s var(--ease-out-expo) 0.12s both; }
.stagger-enter > *:nth-child(3) { animation: card-enter 0.55s var(--ease-out-expo) 0.19s both; }
.stagger-enter > *:nth-child(4) { animation: card-enter 0.55s var(--ease-out-expo) 0.26s both; }
.stagger-enter > *:nth-child(5) { animation: card-enter 0.55s var(--ease-out-expo) 0.33s both; }
.stagger-enter > *:nth-child(6) { animation: card-enter 0.55s var(--ease-out-expo) 0.40s both; }

/* Section reveal */
.section-reveal {
  animation: card-enter 0.7s var(--ease-out-expo) both;
}

/* Gradient border (animated) */
.gradient-border {
  position: relative;
}
.gradient-border::before {
  content: '';
  position: absolute;
  inset: -1.5px;
  border-radius: inherit;
  background: linear-gradient(135deg, #f97316, #a855f7, #3b82f6, #f97316);
  background-size: 300% 300%;
  animation: bg-pan 4s linear infinite;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s;
}
.gradient-border:hover::before { opacity: 1; }

/* Ripple button effect */
.ripple-btn {
  position: relative;
  overflow: hidden;
}
.ripple-btn .ripple-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255,255,255,0.35);
  transform: scale(0);
  animation: ripple 0.6s linear;
  pointer-events: none;
}

/* Ticker bar */
.ticker-wrapper {
  overflow: hidden;
  white-space: nowrap;
}
.ticker-content {
  display: inline-block;
  animation: ticker-slide 28s linear infinite;
  will-change: transform;
}
.ticker-content:hover { animation-play-state: paused; }

/* Number counter animation override */
.count-animate {
  display: inline-block;
  animation: counter-up 0.5s var(--ease-spring) both;
}

/* Noise texture overlay (subtle film grain) */
.grain::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  pointer-events: none;
  mix-blend-mode: overlay;
  opacity: 0.4;
  animation: noise-shift 0.5s steps(2) infinite;
}

/* Glowing border accent on active cards */
.glow-border-orange { box-shadow: 0 0 0 1.5px rgba(249,115,22,0.3), 0 8px 32px rgba(249,115,22,0.15); }
.glow-border-purple { box-shadow: 0 0 0 1.5px rgba(168,85,247,0.3), 0 8px 32px rgba(168,85,247,0.15); }
.glow-border-blue   { box-shadow: 0 0 0 1.5px rgba(59,130,246,0.3),  0 8px 32px rgba(59,130,246,0.15); }
.glow-border-green  { box-shadow: 0 0 0 1.5px rgba(34,197,94,0.3),   0 8px 32px rgba(34,197,94,0.15); }

/* Floating particle trail */
.particle {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  animation: floating-particle 1.2s ease-out forwards;
}

/* Progress bar shimmer */
.progress-shimmer {
  position: relative;
  overflow: hidden;
}
.progress-shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%);
  animation: shimmer 1.5s ease infinite;
  background-size: 200% 100%;
}

/* Header text reveal */
.text-reveal {
  animation: reveal-left 0.8s var(--ease-out-expo) both;
}

/* SVG path draw */
.svg-draw {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: dash-draw 2s var(--ease-out-expo) forwards;
}

/* Status badge pulse */
.status-live {
  position: relative;
}
.status-live::before {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  background: inherit;
  opacity: 0.4;
  animation: pulse-ring 2s cubic-bezier(0.215,0.61,0.355,1) infinite;
}
`;

/* ─────────────────────────────────────────────────────────────────────────────
   Style Injector (same pattern as original)
───────────────────────────────────────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────────────────────────────────────
   Ripple hook — adds click ripple to any button ref
───────────────────────────────────────────────────────────────────────────── */
function useRipple() {
  return useCallback((e) => {
    const btn = e.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(btn.clientWidth, btn.clientHeight);
    const radius = diameter / 2;
    const rect = btn.getBoundingClientRect();
    circle.classList.add('ripple-circle');
    Object.assign(circle.style, {
      width: `${diameter}px`, height: `${diameter}px`,
      left: `${e.clientX - rect.left - radius}px`,
      top:  `${e.clientY - rect.top  - radius}px`,
    });
    btn.appendChild(circle);
    setTimeout(() => circle.remove(), 700);
  }, []);
}

/* ─────────────────────────────────────────────────────────────────────────────
   Magnetic card — subtle cursor-tracking tilt
───────────────────────────────────────────────────────────────────────────── */
function useMagneticTilt(strength = 8) {
  const ref = useRef(null);
  const onMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width  / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    el.style.transform = `perspective(600px) rotateY(${dx * strength}deg) rotateX(${-dy * strength}deg) translateY(-4px) scale(1.02)`;
    el.style.boxShadow = `${-dx * 8}px ${dy * 8}px 32px rgba(0,0,0,0.12)`;
  }, [strength]);
  const onLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = '';
    el.style.boxShadow = '';
  }, []);
  return { ref, onMouseMove: onMove, onMouseLeave: onLeave };
}

/* ─────────────────────────────────────────────────────────────────────────────
   Animated counter hook
───────────────────────────────────────────────────────────────────────────── */
function useCountUp(target, duration = 900, delay = 0) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (typeof target !== 'number') { setValue(target); return; }
    let start = null;
    const t = setTimeout(() => {
      const step = (ts) => {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 4);
        setValue(Math.floor(ease * target));
        if (progress < 1) requestAnimationFrame(step);
        else setValue(target);
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(t);
  }, [target, duration, delay]);
  return value;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Particle emitter on hover
───────────────────────────────────────────────────────────────────────────── */
function ParticleEmitter({ color, active }) {
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      const id = Math.random().toString(36).slice(2);
      setParticles(p => [...p.slice(-6), {
        id, x: 40 + Math.random() * 20, y: 50,
        size: 3 + Math.random() * 4,
      }]);
    }, 180);
    return () => clearInterval(id);
  }, [active]);

  useEffect(() => {
    if (particles.length) {
      const t = setTimeout(() => setParticles(p => p.slice(1)), 1300);
      return () => clearTimeout(t);
    }
  }, [particles]);

  return (
    <>
      {particles.map(p => (
        <span key={p.id} className="particle" style={{
          left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size,
          backgroundColor: color, opacity: 0.7,
        }} />
      ))}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Live Stats Ticker bar
───────────────────────────────────────────────────────────────────────────── */
function StatsTicker({ stats }) {
  const items = [
    { label: 'Received',    val: stats.received,            color: '#3b82f6' },
    { label: 'In Progress', val: stats.inProgress,          color: '#f97316' },
    { label: 'Waiting',     val: stats.waitingForParts,     color: '#f59e0b' },
    { label: 'Completed',   val: stats.completedNotReturned,color: '#10b981' },
    { label: 'Sales Today', val: stats.salesToday,           color: '#a855f7' },
    { label: 'Revenue',     val: formatCurrency(stats.revenueToday), color: '#f97316' },
  ];
  const doubled = [...items, ...items]; // seamless loop

  return (
    <div className="ticker-wrapper relative rounded-2xl bg-gray-900/95 border border-white/10 px-4 py-2.5 overflow-hidden">
      {/* grain on ticker */}
      <div className="absolute inset-0 grain rounded-2xl pointer-events-none" />
      <div className="ticker-content flex items-center gap-8">
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center gap-2 shrink-0">
            <span className="h-1.5 w-1.5 rounded-full animate-blink" style={{ backgroundColor: item.color }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">{item.label}</span>
            <span className="text-[11px] font-extrabold" style={{ color: item.color }}>{item.val}</span>
            <span className="text-white/20 text-xs ml-2">·</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main Dashboard Page
───────────────────────────────────────────────────────────────────────────── */
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

  const ACTIVITIES_PER_PAGE = 5;
  const MAX_ACTIVITIES = 50;

  useEffect(() => {
    fetchInitialDashboard();
    const ticker = setInterval(() => setNow(new Date()), 60000);
    // Trigger mount animations
    setTimeout(() => setMounted(true), 50);
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
    <>
      <StyleInjector />
      <div className="mesh-bg dashboard-font min-h-screen space-y-6 p-1">

        {/* ── Hero Header — Aurora VFX + morph blobs + grain ── */}
        <header
          className={cn(
            "aurora-bg grain relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-7 shadow-2xl",
            mounted && "section-reveal"
          )}
          style={{ animationDelay: '0s' }}
        >
          {/* Original decorative orbs */}
          <div className="orb w-64 h-64 bg-orange-500/20 -top-16 -left-16 animate-float" style={{animationDelay:'0s'}} />
          <div className="orb w-48 h-48 bg-purple-500/20 -bottom-12 left-1/3 animate-float" style={{animationDelay:'1s'}} />
          <div className="orb w-56 h-56 bg-blue-500/15 -top-8 right-10 animate-float" style={{animationDelay:'2s'}} />

          {/* NEW — morph blob accents */}
          <div
            className="morph-blob absolute w-32 h-32 opacity-10 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #f97316, #a855f7)', right: '15%', top: '10%', animationDelay: '0s' }}
          />
          <div
            className="morph-blob absolute w-20 h-20 opacity-8 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #3b82f6, #06b6d4)', left: '40%', bottom: '5%', animationDelay: '3s' }}
          />

          {/* Original spinning rings */}
          <div className="absolute right-6 top-6 h-20 w-20 rounded-full border-2 border-dashed border-white/10 animate-spin-slow" />
          <div className="absolute right-10 top-10 h-12 w-12 rounded-full border border-orange-400/30 animate-spin-slow"
            style={{animationDirection:'reverse',animationDuration:'5s'}} />

          {/* NEW — extra concentric animated rings */}
          <div className="absolute right-4 top-4 h-28 w-28 rounded-full border border-purple-400/10 animate-spin-slow"
            style={{animationDuration:'14s'}} />
          <div className="absolute right-8 top-8 h-16 w-16 rounded-full border border-cyan-400/15"
            style={{animation:'spin-slow 6s linear infinite reverse'}} />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40 mb-1 text-reveal">{dateStr}</p>
              <h1 className="display-font text-2xl sm:text-3xl font-bold text-white mb-1">
                {greeting},{' '}
                <span className="shimmer-text">{profile?.name?.split(' ')[0] || 'there'} 👋</span>
              </h1>
              <p className="text-sm text-white/50">Here's what's happening in your shop today.</p>
            </div>

            <div className="flex items-center gap-3">
              {/* NEW — animated ring around clock */}
              <div className="relative">
                <div className="absolute -inset-2 rounded-2xl border border-orange-400/20 animate-spin-slow" style={{animationDuration:'20s'}} />
                <div className="glass rounded-2xl px-5 py-3 text-right relative z-10">
                  <p className="display-font text-2xl font-bold text-gray-900">{timeStr}</p>
                  <div className="flex items-center justify-end gap-1.5 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-blink status-live" />
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Live</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ── Stats Ticker (NEW) ── */}
        <div className={cn(mounted && "section-reveal")} style={{ animationDelay: '0.08s' }}>
          <StatsTicker stats={stats} />
        </div>

        {/* ── Quick Actions ── */}
        <section className={cn(mounted && "section-reveal")} style={{ animationDelay: '0.15s' }}>
          <SectionLabel icon={Zap} label="Quick Actions" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 stagger-enter">
            {[
              { name: 'Register New Service', desc: 'Create a service ticket', icon: PlusCircle, color: '#f97316', lightBg: '#fff7ed', borderColor: '#fed7aa', href: '/services?action=new', glowClass: 'glow-border-orange' },
              { name: 'Add New Sale',         desc: 'Record parts / accessories', icon: ShoppingBag, color: '#a855f7', lightBg: '#faf5ff', borderColor: '#e9d5ff', href: '/sales?action=new',   glowClass: 'glow-border-purple' },
              { name: 'View Services',        desc: 'Manage active repairs', icon: Wrench,      color: '#3b82f6', lightBg: '#eff6ff', borderColor: '#bfdbfe', href: '/services',            glowClass: 'glow-border-blue'   },
            ].map((a) => (
              <QuickActionButton key={a.name} action={a} onClick={() => router.push(a.href)} />
            ))}
          </div>
        </section>

        {/* ── Work Priority ── */}
        <section className={cn(mounted && "section-reveal")} style={{ animationDelay: '0.22s' }}>
          <SectionLabel icon={Activity} label="Work Priority" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 stagger-enter">
            <PriorityCard title="Received"               count={stats.received || 0}           color="#3b82f6" gradClass="gradient-blue"    shadowColor="rgba(59,130,246,0.2)"  onClick={() => router.push('/services?status=Received')} />
            <PriorityCard title="In Progress"            count={stats.inProgress}               color="#f97316" gradClass="gradient-orange"  shadowColor="rgba(249,115,22,0.2)"  onClick={() => router.push('/services?status=In Progress')} />
            <PriorityCard title="Waiting for Parts"      count={stats.waitingForParts}          color="#f59e0b" gradClass="gradient-amber"   shadowColor="rgba(245,158,11,0.2)"  onClick={() => router.push('/services?status=Waiting for Parts')} />
            <PriorityCard title="Completed (Unreturned)" count={stats.completedNotReturned}     color="#10b981" gradClass="gradient-emerald" shadowColor="rgba(16,185,129,0.2)"  onClick={() => router.push('/services?status=Completed')} />
          </div>
        </section>

        {/* ── Today Summary ── */}
        <section className={cn(mounted && "section-reveal")} style={{ animationDelay: '0.29s' }}>
          <SectionLabel icon={Sparkles} label="Today Summary" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 stagger-enter">
            <MetricDetailsDialog title="Registered Today" dataList={stats.registeredTodayList}>
              <SummaryCard title="Registered"    count={stats.registeredToday}             icon={FileEdit}     color="#3b82f6" gradClass="gradient-blue"    />
            </MetricDetailsDialog>
            <SummaryCard title="Completed"      count={stats.completedToday}               icon={CheckCircle2} color="#10b981" gradClass="gradient-emerald" onClick={() => router.push('/services?filter=completedToday')} />
            <SummaryCard title="Non Repairable" count={stats.notRepairableToday}           icon={XOctagon}     color="#ef4444" gradClass="gradient-red"     onClick={() => router.push('/services?filter=notRepairableToday')} />
            <SummaryCard title="Returned"       count={stats.returnedToday}                icon={PackageCheck} color="#06b6d4" gradClass="gradient-cyan"    onClick={() => router.push('/history?tab=services&today=returned')} />
            <SummaryCard title="Sales"          count={stats.salesToday}                   icon={ShoppingBag}  color="#a855f7" gradClass="gradient-purple"  onClick={() => router.push('/sales?today=true')} />
            <SummaryCard title="Revenue"        count={formatCurrency(stats.revenueToday)} icon={IndianRupee}  color="#f97316" gradClass="gradient-orange"  isCurrency
              onClick={() => { if (profile?.role === 'admin' || profile?.role === 'owner') setIsRevenueOpen(true); }} />
          </div>
        </section>

        {/* ── Bottom grid ── */}
        <div className={cn("grid grid-cols-1 gap-8 lg:grid-cols-2", mounted && "section-reveal")} style={{ animationDelay: '0.36s' }}>

          {/* Recent Activity */}
          <section className="glass rounded-3xl p-6 shadow-xl overflow-hidden relative">
            <div className="orb w-40 h-40 bg-orange-400/10 -top-10 -right-10 pointer-events-none" />
            <div className="orb w-32 h-32 bg-purple-400/10 -bottom-8 -left-8 pointer-events-none" />
            {/* NEW morph accent */}
            <div className="morph-blob absolute w-16 h-16 opacity-5 pointer-events-none"
              style={{ background: 'radial-gradient(circle, #f97316, #a855f7)', right: '8%', top: '12%' }} />

            <div className="relative mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-purple-500 shadow-md">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">Recent Activity</h3>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-green-600 border border-green-200">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-blink status-live" />
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
                      <ActivityRow
                        key={activity.id || i}
                        activity={activity}
                        isMine={isMine}
                        ss={ss}
                        index={i}
                        onClickHandler={handleActivityClick}
                        profile={profile}
                      />
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                    <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}
                      className="ripple-btn rounded-xl border border-gray-200 bg-white px-4 py-1.5 text-xs font-bold text-gray-600 shadow-sm transition hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                      ← Prev
                    </button>
                    <p className="text-xs font-semibold text-gray-500">
                      Page <span className="font-black text-gray-900">{currentPage}</span> / <span className="font-black text-gray-900">{totalPages}</span>
                    </p>
                    <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}
                      className="ripple-btn rounded-xl border border-gray-200 bg-white px-4 py-1.5 text-xs font-bold text-gray-600 shadow-sm transition hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
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
            {/* NEW morph blob */}
            <div className="morph-blob absolute w-20 h-20 opacity-5 pointer-events-none"
              style={{ background: 'radial-gradient(circle, #3b82f6, #a855f7)', left: '10%', bottom: '10%', animationDelay: '2s' }} />

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
                      type="warning" index={0}
                    />
                  )}
                  {stats.alerts.oldWaitingForParts > 0 && (
                    <AlertItem
                      message={`${stats.alerts.oldWaitingForParts} service${stats.alerts.oldWaitingForParts > 1 ? 's are' : ' is'} stuck waiting for parts (5+ days)`}
                      type="danger" index={1}
                    />
                  )}
                  {stats.alerts.oldCompletedNotReturned > 0 && (
                    <AlertItem
                      message={`${stats.alerts.oldCompletedNotReturned} completed service${stats.alerts.oldCompletedNotReturned > 1 ? 's have' : ' has'} not been picked up for over a week`}
                      type="warning" index={2}
                    />
                  )}
                  {stats.alerts.oldInProgress === 0 && stats.alerts.oldWaitingForParts === 0 && stats.alerts.oldCompletedNotReturned === 0 && (
                    <AlertItem message="All systems operational — no pending bottlenecks 🎉" type="success" index={0} />
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
        </div>

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
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Sub-components — all original logic preserved, VFX layered on top
───────────────────────────────────────────────────────────────────────────── */

/* SectionLabel — original, unchanged */
function SectionLabel({ icon: Icon, label }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-orange-400 to-purple-500 shadow-sm">
        <Icon className="h-3 w-3 text-white" strokeWidth={2.5} />
      </div>
      <h3 className="text-sm font-semibold text-gray-700">{label}</h3>
      {/* NEW: animated gradient line */}
      <div className="flex-1 h-px relative overflow-hidden rounded-full">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-transparent animate-line-grow" />
        <div className="absolute inset-0 bg-gradient-to-r from-orange-300/40 via-purple-300/30 to-transparent"
          style={{ backgroundSize: '200% 100%', animation: 'bg-pan 3s ease infinite' }} />
      </div>
    </div>
  );
}

/* QuickActionButton — original logic + magnetic tilt + shine + ripple + particles */
function QuickActionButton({ action: a, onClick }) {
  const ripple = useRipple();
  const { ref, onMouseMove, onMouseLeave } = useMagneticTilt(5);
  const [hovered, setHovered] = useState(false);

  return (
    <button
      ref={ref}
      onClick={(e) => { ripple(e); onClick(); }}
      onMouseMove={onMouseMove}
      onMouseLeave={() => { onMouseLeave(); setHovered(false); }}
      onMouseEnter={() => setHovered(true)}
      className={cn(
        "ripple-btn shine-on-hover gradient-border magnetic-card group relative flex items-center gap-4 rounded-2xl border-2 p-4 text-left",
        a.glowClass
      )}
      style={{ borderColor: a.borderColor, backgroundColor: a.lightBg, transition: 'transform 0.3s var(--ease-spring), box-shadow 0.3s ease' }}
    >
      {/* original left stripe */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ backgroundColor: a.color }} />

      {/* NEW particle emitter */}
      <ParticleEmitter color={a.color} active={hovered} />

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
  );
}

/* PriorityCard — original + animated count-up + magnetic tilt + shine */
function PriorityCard({ title, count, color, gradClass, shadowColor, onClick }) {
  const animatedCount = useCountUp(count, 900, 300);
  const { ref, onMouseMove, onMouseLeave } = useMagneticTilt(6);

  return (
    <button
      ref={ref}
      onClick={onClick}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={cn("shine-on-hover gradient-border group relative overflow-hidden rounded-2xl border border-white/80 p-5 text-left shadow-md", gradClass)}
      style={{ boxShadow: `0 4px 20px ${shadowColor}`, transition: 'transform 0.3s var(--ease-spring), box-shadow 0.3s ease' }}
    >
      {/* original blobs */}
      <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full blur-2xl opacity-20" style={{ backgroundColor: color }} />
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: `linear-gradient(90deg, ${color}80, ${color}20)` }} />

      <div className="flex items-center justify-between mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white shadow-sm"
          style={{ background: `${color}15` }}>
          <Activity className="h-4 w-4" style={{ color }} strokeWidth={2} />
        </div>
        <TrendingUp className="h-3.5 w-3.5 text-gray-300 transition-colors group-hover:text-gray-500" />
      </div>

      {/* Animated count-up replaces static number */}
      <p className="text-4xl font-bold tabular-nums leading-none text-gray-900 count-animate">
        {animatedCount}
      </p>
      <p className="mt-2 text-[13px] font-medium text-gray-500">{title}</p>
    </button>
  );
}

/* SummaryCard — original + count-up + shine + hover glow */
function SummaryCard({ title, count, isCurrency, onClick, icon: Icon, color, gradClass }) {
  const animatedCount = typeof count === 'number' ? useCountUp(count, 800, 400) : count;

  return (
    <button
      onClick={onClick}
      className={cn("shine-on-hover gradient-border card-hover group relative w-full overflow-hidden rounded-2xl border border-white/80 p-4 text-left shadow-md", gradClass)}
    >
      <div className="absolute -top-8 -right-8 h-20 w-20 rounded-full blur-2xl opacity-20" style={{ backgroundColor: color }} />
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: `linear-gradient(90deg, ${color}70, ${color}10)` }} />

      <div className="relative mb-3 flex h-9 w-9 items-center justify-center rounded-xl border border-white shadow-sm transition-transform group-hover:scale-110 animate-icon-bounce"
        style={{ background: `${color}15`, animationDelay: '0s', animationFillMode: 'both' }}>
        {Icon && <Icon className="h-4 w-4" style={{ color }} strokeWidth={2} />}
      </div>

      <p className="text-2xl font-bold tabular-nums leading-none text-gray-900 count-animate">
        {isCurrency ? count : animatedCount}
      </p>
      <p className="mt-2 text-[11px] font-semibold text-gray-500">{title}</p>
    </button>
  );
}

/* AlertItem — original + stagger entrance + left-stripe VFX */
function AlertItem({ message, type, index = 0 }) {
  const cfg = {
    warning: { bg: '#fffbeb', border: '#fde68a', text: '#92400e', icon: TriangleAlert, iconColor: '#f59e0b', accent: '#f59e0b' },
    danger:  { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', icon: AlertCircle,   iconColor: '#ef4444', accent: '#ef4444' },
    success: { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534', icon: CircleCheck,   iconColor: '#22c55e', accent: '#22c55e' },
  }[type];
  const Ic = cfg.icon;

  return (
    <div
      className="relative flex items-start gap-3 rounded-2xl border p-4 text-sm font-medium overflow-hidden animate-slide-up shine-on-hover"
      style={{
        backgroundColor: cfg.bg, borderColor: cfg.border, color: cfg.text,
        animationDelay: `${index * 0.1}s`, animationFillMode: 'both',
      }}
    >
      {/* animated left stripe */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl animate-line-grow"
        style={{ backgroundColor: cfg.accent }} />
      <Ic className="h-5 w-5 shrink-0 mt-0.5" style={{ color: cfg.iconColor }} />
      <span className="leading-snug">{message}</span>
    </div>
  );
}

/* ActivityRow — original logic extracted as component + VFX */
function ActivityRow({ activity, isMine, ss, index, onClickHandler, profile }) {
  const ripple = useRipple();

  return (
    <button
      onClick={(e) => { ripple(e); onClickHandler(activity); }}
      className={cn(
        "ripple-btn shine-on-hover group w-full relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 card-hover",
        "animate-slide-up",
        isMine
          ? "border-orange-300/60 bg-gradient-to-r from-orange-50 via-white to-purple-50/30 shadow-md ring-1 ring-orange-200/50"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
      )}
      style={{ animationDelay: `${index * 0.06}s` }}
    >
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
                <span className="animate-pop-in rounded-full bg-gradient-to-r from-orange-400 to-purple-500 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-white shadow-sm">
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
  );
}

/* CurrencyDisplay — original, unchanged */
function CurrencyDisplay({ amount, color }) {
  const number = formatNumber(amount);
  return (
    <p className="flex items-center gap-1.5 tabular-nums font-bold" style={{ color }}>
      <span className="text-sm font-semibold opacity-70">₹</span>
      <span className="text-2xl tracking-tight leading-none">{number}</span>
    </p>
  );
}

/* RevenueBreakdownModal — original + VFX entrance + grain */
function RevenueBreakdownModal({ onClose, serviceRevenue, salesRevenue, router }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      style={{ animation: 'slide-up 0.3s var(--ease-out-expo) both' }}>
      <div className="w-full max-w-sm rounded-3xl bg-white shadow-2xl overflow-hidden border border-white/80 animate-pop-in">
        {/* modal header */}
        <div className="aurora-bg grain relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 px-6 py-5">
          <div className="orb w-32 h-32 bg-orange-500/20 -top-8 -right-8" />
          <div className="orb w-24 h-24 bg-purple-500/20 -bottom-8 left-4" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/40 mb-1">Breakdown</p>
              <h3 className="text-base font-semibold text-white">Today's Revenue</h3>
            </div>
            <button onClick={onClose}
              className="ripple-btn flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition text-white text-sm font-bold">
              ✕
            </button>
          </div>
        </div>

        <div className="p-5 space-y-3 bg-white">
          <button onClick={() => router.push('/history?tab=services&today=returned')}
            className="shine-on-hover card-hover w-full flex justify-between items-center px-5 py-4 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/60 text-left glow-blue">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-blue-500 mb-0.5">Services</p>
              <p className="text-[10px] text-blue-400/80 font-medium">View history →</p>
            </div>
            <CurrencyDisplay amount={serviceRevenue || 0} color="#1d4ed8" />
          </button>

          <button onClick={() => router.push('/history?tab=sales&today=true')}
            className="shine-on-hover card-hover w-full flex justify-between items-center px-5 py-4 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/60 text-left glow-purple">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-purple-500 mb-0.5">Sales</p>
              <p className="text-[10px] text-purple-400/80 font-medium">View history →</p>
            </div>
            <CurrencyDisplay amount={salesRevenue || 0} color="#7e22ce" />
          </button>

          {/* total */}
          <div className="shine-on-hover rounded-2xl bg-gradient-to-r from-orange-400 to-purple-500 p-4 flex justify-between items-center shadow-lg animate-glow-pulse">
            <p className="text-sm font-semibold text-white">Total Revenue</p>
            <CurrencyDisplay amount={(serviceRevenue || 0) + (salesRevenue || 0)} color="#ffffff" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* DashboardSkeleton — original, unchanged */
function DashboardSkeleton() {
  return (
    <div className="mesh-bg dashboard-font min-h-screen space-y-8 p-1 animate-pulse">
      <div className="h-28 rounded-3xl bg-gray-200" />
      <div className="h-10 rounded-2xl bg-gray-200" />
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

/* ── status style helper — original, unchanged ── */
function getStatusStyles(status = '') {
  const s = status.toLowerCase();
  const make = (dot, badge) => ({ dotColor: dot, badgeBg: badge + '18', badgeBorder: badge + '40', badgeText: badge });
  if (s.includes('received'))                                                             return make('#3b82f6', '#3b82f6');
  if (s.includes('diagnosed'))                                                            return make('#8b5cf6', '#8b5cf6');
  if (s.includes('repair started')||s.includes('repairing')||s.includes('in repair'))    return make('#f97316', '#f97316');
  if (s.includes('waiting'))                                                              return make('#f59e0b', '#f59e0b');
  if (s.includes('completed'))                                                            return make('#10b981', '#10b981');
  if (s.includes('returned'))                                                             return make('#22c55e', '#22c55e');
  if (s.includes('cancel')||s.includes('non repairable')||s.includes('rejected'))        return make('#ef4444', '#ef4444');
  return make('#6b7280', '#6b7280');
}
