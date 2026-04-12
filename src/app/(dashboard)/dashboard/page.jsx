'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { dashboardService } from '@/services/dashboardService';
import {
  PlusCircle, ShoppingBag, Wrench, AlertCircle, TrendingUp,
  Clock, ChevronRight, FileEdit, CheckCircle2, XOctagon,
  PackageCheck, IndianRupee, Activity, Zap, ArrowUpRight,
  Sparkles, Bell, TriangleAlert, CircleCheck,
} from 'lucide-react';
import { cn, formatCurrency, formatDate, formatTime, formatNumber } from '@/lib/utils';
import { MetricDetailsDialog } from '@/components/MetricDetailsDialog';
import { toast } from 'sonner';
import { historyService } from '@/services/historyService';

/* ═══════════════════════════════════════════════════════════════
   MOTION SYSTEM — Mobile-first VFX, Animations & Transitions
   Drop this file as your new dashboard/page.jsx.
   All motion classes exported at bottom for reuse across pages.
   ═══════════════════════════════════════════════════════════════ */

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

/* ── CSS Custom Properties ── */
:root {
  --orange: #f97316; --orange-light: #fed7aa;
  --purple: #a855f7; --purple-light: #e9d5ff;
  --blue: #3b82f6;   --blue-light: #bfdbfe;
  --green: #22c55e;  --green-light: #bbf7d0;
  --cyan: #06b6d4;   --amber: #f59e0b;
  --red: #ef4444;    --emerald: #10b981;

  /* Motion tokens — tweak here to tune feel globally */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-back: cubic-bezier(0.36, 0, 0.66, -0.56);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --dur-fast: 180ms;
  --dur-normal: 320ms;
  --dur-slow: 500ms;
  --dur-lazy: 800ms;
}

/* ══════════════════════════════
   KEYFRAME LIBRARY
   ══════════════════════════════ */

/* Entry animations */
@keyframes fade-up {
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fade-down {
  from { opacity: 0; transform: translateY(-18px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes scale-in {
  from { opacity: 0; transform: scale(0.88); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes scale-pop {
  0%   { opacity: 0; transform: scale(0.5); }
  70%  { transform: scale(1.08); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes slide-left {
  from { opacity: 0; transform: translateX(30px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes slide-right {
  from { opacity: 0; transform: translateX(-30px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes blur-in {
  from { opacity: 0; filter: blur(8px) scale(0.97); }
  to   { opacity: 1; filter: blur(0) scale(1); }
}

/* Count-up number animation */
@keyframes count-in {
  from { opacity: 0; transform: scale(0.4) translateY(10px); }
  70%  { transform: scale(1.12) translateY(-2px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

/* Continuous motion */
@keyframes float {
  0%,100% { transform: translateY(0px) rotate(0deg); }
  33%      { transform: translateY(-7px) rotate(0.5deg); }
  66%      { transform: translateY(-3px) rotate(-0.5deg); }
}
@keyframes float-alt {
  0%,100% { transform: translateY(0px) scale(1); }
  50%      { transform: translateY(-10px) scale(1.03); }
}
@keyframes drift {
  0%,100% { transform: translate(0, 0) rotate(0deg); }
  25%      { transform: translate(6px, -8px) rotate(1deg); }
  50%      { transform: translate(-4px, -12px) rotate(-0.5deg); }
  75%      { transform: translate(-8px, -4px) rotate(0.8deg); }
}
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes spin-slow-r {
  from { transform: rotate(0deg); }
  to   { transform: rotate(-360deg); }
}
@keyframes morph {
  0%,100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
  33%      { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
  66%      { border-radius: 50% 60% 30% 60% / 30% 40% 70% 60%; }
}

/* Shimmer & glow */
@keyframes shimmer {
  0%   { background-position: -300% center; }
  100% { background-position:  300% center; }
}
@keyframes glow-pulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(249,115,22,0); }
  50%      { box-shadow: 0 0 20px 4px rgba(249,115,22,0.25); }
}
@keyframes gradient-shift {
  0%,100% { background-position: 0% 50%; }
  50%      { background-position: 100% 50%; }
}
@keyframes aurora {
  0%   { background-position: 0% 50%; opacity: 0.6; }
  50%  { background-position: 100% 50%; opacity: 1; }
  100% { background-position: 0% 50%; opacity: 0.6; }
}

/* Status / badge */
@keyframes pulse-ring {
  0%   { transform: scale(0.85); opacity: 0.9; }
  70%  { transform: scale(1.8); opacity: 0; }
  100% { transform: scale(1.8); opacity: 0; }
}
@keyframes blink {
  0%,100% { opacity: 1; }
  50%      { opacity: 0.25; }
}
@keyframes ping {
  75%,100% { transform: scale(2); opacity: 0; }
}

/* Ripple on tap (mobile UX) */
@keyframes ripple {
  0%   { transform: scale(0); opacity: 0.45; }
  100% { transform: scale(4); opacity: 0; }
}

/* Ticker / progress */
@keyframes progress-fill {
  from { width: 0%; }
  to   { width: var(--target-width, 100%); }
}
@keyframes slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Page transition wipe */
@keyframes wipe-in {
  from { clip-path: inset(0 100% 0 0); }
  to   { clip-path: inset(0 0% 0 0); }
}

/* Shake — for error states */
@keyframes shake {
  0%,100% { transform: translateX(0); }
  20%      { transform: translateX(-6px); }
  40%      { transform: translateX(6px); }
  60%      { transform: translateX(-4px); }
  80%      { transform: translateX(4px); }
}

/* Card press (mobile tactile) */
@keyframes press {
  0%   { transform: scale(1); }
  50%  { transform: scale(0.97); }
  100% { transform: scale(1); }
}

/* Number flip */
@keyframes flip-up {
  from { transform: rotateX(-90deg) translateY(8px); opacity: 0; }
  to   { transform: rotateX(0deg) translateY(0); opacity: 1; }
}

/* ══════════════════════════════
   UTILITY ANIMATION CLASSES
   (reusable across every page)
   ══════════════════════════════ */

.animate-fade-up    { animation: fade-up var(--dur-slow) var(--ease-out-expo) forwards; opacity: 0; }
.animate-fade-down  { animation: fade-down var(--dur-normal) var(--ease-out-expo) forwards; opacity: 0; }
.animate-fade-in    { animation: fade-in var(--dur-normal) ease forwards; opacity: 0; }
.animate-scale-in   { animation: scale-in var(--dur-normal) var(--ease-spring) forwards; opacity: 0; }
.animate-scale-pop  { animation: scale-pop 0.4s var(--ease-spring) forwards; opacity: 0; }
.animate-slide-left { animation: slide-left var(--dur-slow) var(--ease-out-expo) forwards; opacity: 0; }
.animate-slide-right{ animation: slide-right var(--dur-slow) var(--ease-out-expo) forwards; opacity: 0; }
.animate-blur-in    { animation: blur-in var(--dur-slow) var(--ease-out-expo) forwards; opacity: 0; }
.animate-slide-up   { animation: slide-up var(--dur-slow) var(--ease-out-expo) forwards; opacity: 0; }
.animate-count-in   { animation: count-in 0.5s var(--ease-spring) forwards; opacity: 0; }
.animate-float      { animation: float 3.5s ease-in-out infinite; }
.animate-float-alt  { animation: float-alt 4s ease-in-out infinite; }
.animate-drift      { animation: drift 6s ease-in-out infinite; }
.animate-spin-slow  { animation: spin-slow 9s linear infinite; }
.animate-spin-slow-r{ animation: spin-slow-r 7s linear infinite; }
.animate-morph      { animation: morph 8s ease-in-out infinite; }
.animate-shimmer    { animation: shimmer 3s linear infinite; }
.animate-glow-pulse { animation: glow-pulse 2.5s ease-in-out infinite; }
.animate-aurora     { animation: aurora 6s ease infinite; background-size: 200% 200%; }
.animate-pulse-ring { animation: pulse-ring 2.2s cubic-bezier(0.215,0.61,0.355,1) infinite; }
.animate-blink      { animation: blink 2s ease-in-out infinite; }
.animate-ping       { animation: ping 1.2s cubic-bezier(0,0,0.2,1) infinite; }
.animate-shake      { animation: shake 0.4s ease; }
.animate-press      { animation: press 0.25s ease; }
.animate-flip-up    { animation: flip-up 0.35s var(--ease-out-expo) forwards; }
.animate-wipe-in    { animation: wipe-in 0.6s var(--ease-out-expo) forwards; }

/* Staggered delays for list items */
.stagger-1  { animation-delay: 0.04s; }
.stagger-2  { animation-delay: 0.08s; }
.stagger-3  { animation-delay: 0.12s; }
.stagger-4  { animation-delay: 0.16s; }
.stagger-5  { animation-delay: 0.20s; }
.stagger-6  { animation-delay: 0.24s; }
.stagger-7  { animation-delay: 0.28s; }
.stagger-8  { animation-delay: 0.32s; }

/* ══════════════════════════════
   SHIMMER TEXT
   ══════════════════════════════ */
.shimmer-text {
  background: linear-gradient(90deg, #f97316, #a855f7, #3b82f6, #06b6d4, #f97316);
  background-size: 300% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 4s linear infinite;
}
.shimmer-text-fast {
  background: linear-gradient(90deg, #f97316, #a855f7, #3b82f6, #f97316);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 2s linear infinite;
}

/* ══════════════════════════════
   GLASS & SURFACE SYSTEM
   ══════════════════════════════ */
.glass {
  background: rgba(255,255,255,0.72);
  backdrop-filter: blur(14px) saturate(180%);
  -webkit-backdrop-filter: blur(14px) saturate(180%);
  border: 1px solid rgba(255,255,255,0.92);
}
.glass-dark {
  background: rgba(17,24,39,0.7);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border: 1px solid rgba(255,255,255,0.08);
}
.glass-tinted {
  background: rgba(249,115,22,0.06);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(249,115,22,0.2);
}

/* ══════════════════════════════
   MESH / BACKGROUND SYSTEM
   ══════════════════════════════ */
.mesh-bg {
  background-color: #fafafa;
  background-image:
    radial-gradient(at 15% 10%, rgba(249,115,22,0.09) 0px, transparent 55%),
    radial-gradient(at 85% 5%,  rgba(168,85,247,0.08) 0px, transparent 50%),
    radial-gradient(at 0%  65%, rgba(59,130,246,0.07) 0px, transparent 50%),
    radial-gradient(at 95% 80%, rgba(34,197,94,0.06)  0px, transparent 50%),
    radial-gradient(at 50% 50%,rgba(6,182,212,0.03)   0px, transparent 60%);
}

/* ══════════════════════════════
   INTERACTIVE HOVER / ACTIVE (Mobile-optimised)
   ══════════════════════════════ */

/* Card hover — lift + subtle border glow */
.card-hover {
  transition:
    transform var(--dur-normal) var(--ease-spring),
    box-shadow var(--dur-normal) ease,
    border-color var(--dur-fast) ease;
  will-change: transform;
  -webkit-tap-highlight-color: transparent;
}
.card-hover:hover {
  transform: translateY(-5px) scale(1.012);
  box-shadow: 0 22px 44px -10px rgba(0,0,0,0.13);
}
/* Mobile active press — tactile feedback */
.card-hover:active {
  transform: scale(0.97);
  transition: transform 0.12s ease;
}

/* Icon hover pop */
.icon-pop {
  transition: transform var(--dur-fast) var(--ease-spring);
}
.icon-pop:hover { transform: scale(1.18) rotate(6deg); }
.card-hover:active .icon-pop { transform: scale(0.92); }

/* Button press ripple container */
.ripple-wrap {
  position: relative;
  overflow: hidden;
  -webkit-tap-highlight-color: transparent;
}
.ripple-wrap::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at var(--rx,50%) var(--ry,50%), rgba(255,255,255,0.4) 0%, transparent 70%);
  transform: scale(0);
  opacity: 0;
  border-radius: inherit;
  transition: transform 0.5s ease, opacity 0.5s ease;
  pointer-events: none;
}
.ripple-wrap:active::after {
  transform: scale(3);
  opacity: 1;
  transition: none;
}

/* ══════════════════════════════
   GRADIENT BACKGROUNDS
   ══════════════════════════════ */
.gradient-orange  { background: linear-gradient(135deg, #fff7ed 0%, #ffffff 100%); }
.gradient-purple  { background: linear-gradient(135deg, #faf5ff 0%, #ffffff 100%); }
.gradient-blue    { background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%); }
.gradient-green   { background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%); }
.gradient-cyan    { background: linear-gradient(135deg, #ecfeff 0%, #ffffff 100%); }
.gradient-amber   { background: linear-gradient(135deg, #fffbeb 0%, #ffffff 100%); }
.gradient-red     { background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%); }
.gradient-emerald { background: linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%); }

/* Vivid gradient overlays for hero sections */
.hero-gradient {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  background-size: 200% 200%;
  animation: gradient-shift 8s ease infinite;
}
.aurora-bg {
  background: linear-gradient(135deg, #f97316, #a855f7, #3b82f6, #06b6d4);
  background-size: 300% 300%;
  animation: aurora 8s ease infinite;
}

/* ══════════════════════════════
   GLOW UTILITIES
   ══════════════════════════════ */
.glow-orange { box-shadow: 0 4px 28px rgba(249,115,22,0.22), 0 1px 4px rgba(249,115,22,0.1); }
.glow-purple { box-shadow: 0 4px 28px rgba(168,85,247,0.22), 0 1px 4px rgba(168,85,247,0.1); }
.glow-blue   { box-shadow: 0 4px 28px rgba(59,130,246,0.22), 0 1px 4px rgba(59,130,246,0.1); }
.glow-green  { box-shadow: 0 4px 28px rgba(34,197,94,0.22),  0 1px 4px rgba(34,197,94,0.1); }
.glow-cyan   { box-shadow: 0 4px 28px rgba(6,182,212,0.22),  0 1px 4px rgba(6,182,212,0.1); }
.glow-amber  { box-shadow: 0 4px 28px rgba(245,158,11,0.22), 0 1px 4px rgba(245,158,11,0.1); }

/* ══════════════════════════════
   DECORATIVE ORB SYSTEM
   ══════════════════════════════ */
.orb {
  border-radius: 50%;
  filter: blur(42px);
  position: absolute;
  pointer-events: none;
  will-change: transform;
}
.orb-sm  { width: 80px;  height: 80px; }
.orb-md  { width: 140px; height: 140px; }
.orb-lg  { width: 220px; height: 220px; }
.orb-xl  { width: 320px; height: 320px; }

/* ══════════════════════════════
   PAGE TRANSITION SYSTEM
   Apply .page-enter on route changes
   ══════════════════════════════ */
.page-enter {
  animation: fade-up 0.45s var(--ease-out-expo) both;
}
.page-exit {
  animation: fade-in 0.25s ease reverse both;
}

/* ══════════════════════════════
   SKELETON SHIMMER (loading)
   ══════════════════════════════ */
@keyframes skeleton-wave {
  0%   { background-position: -400px 0; }
  100% { background-position:  400px 0; }
}
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 800px 100%;
  animation: skeleton-wave 1.4s ease-in-out infinite;
  border-radius: 12px;
}

/* ══════════════════════════════
   DIALOG / MODAL OVERRIDES
   ══════════════════════════════ */
[role="dialog"] {
  border-radius: 1.5rem !important;
  border: 1px solid #e5e7eb !important;
  box-shadow: 0 25px 60px -12px rgba(0,0,0,0.2) !important;
  font-family: 'DM Sans', sans-serif !important;
  overflow: hidden !important;
  animation: scale-in 0.3s var(--ease-spring) !important;
}
[role="dialog"] h2,
[role="dialog"] [data-radix-dialog-title] {
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
[role="dialog"] tbody tr {
  background: #f9fafb; border-radius: 10px;
  transition: background 0.15s, transform 0.15s;
}
[role="dialog"] tbody tr:hover { background: #eff6ff !important; transform: translateX(2px); }
[role="dialog"] tbody td {
  padding: 8px 10px !important; font-size: 0.8125rem !important;
  font-weight: 500 !important; color: #374151 !important; border-top: none !important;
}
[role="dialog"] tbody td:first-child { border-radius: 10px 0 0 10px; }
[role="dialog"] tbody td:last-child  { border-radius: 0 10px 10px 0; }

/* ══════════════════════════════
   SCROLLBAR STYLE
   ══════════════════════════════ */
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.22); }

/* ══════════════════════════════
   FONT HELPERS
   ══════════════════════════════ */
.dashboard-font { font-family: 'DM Sans', sans-serif; }
.display-font   { font-family: 'Syne', sans-serif; }

/* ══════════════════════════════
   MOBILE-SPECIFIC TOUCH ENHANCEMENTS
   ══════════════════════════════ */
@media (max-width: 640px) {
  .card-hover:active {
    transform: scale(0.96);
    transition: transform 0.1s ease;
  }
  .animate-float { animation-duration: 4.5s; }
  /* Reduce motion on low-end preference */
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`;

/* ── Style injector (idempotent) ── */
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

/* ══════════════════════════════════════════════════
   MOTION HOOKS — reuse across all pages
   ══════════════════════════════════════════════════ */

/** Intersection observer — triggers .animate-* classes when element enters viewport */
export function useRevealOnScroll(threshold = 0.15) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.style.opacity = '';
        el.classList.add('is-visible');
        obs.disconnect();
      }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return ref;
}

/** Staggered children reveal — add to list wrappers */
export function useStaggerReveal(count = 8, baseDelay = 0.05) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const children = Array.from(el.children);
    children.forEach((child, i) => {
      child.style.animationDelay = `${i * baseDelay}s`;
    });
  }, [count, baseDelay]);
  return ref;
}

/** Ripple effect for touch/click on mobile */
export function useRipple() {
  return useCallback((e) => {
    const btn = e.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(btn.clientWidth, btn.clientHeight);
    const rect = btn.getBoundingClientRect();
    const x = (e.clientX ?? rect.left + rect.width / 2) - rect.left;
    const y = (e.clientY ?? rect.top + rect.height / 2) - rect.top;

    Object.assign(circle.style, {
      width: diameter + 'px', height: diameter + 'px',
      left: (x - diameter / 2) + 'px', top: (y - diameter / 2) + 'px',
      position: 'absolute', borderRadius: '50%',
      background: 'rgba(255,255,255,0.35)',
      transform: 'scale(0)', pointerEvents: 'none',
      animation: 'ripple 0.6s linear forwards',
    });
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(circle);
    setTimeout(() => circle.remove(), 620);
  }, []);
}

/* ══════════════════════════════════════════════════
   ANIMATED NUMBER — counts up from 0
   ══════════════════════════════════════════════════ */
export function AnimatedNumber({ value, duration = 900, className = '' }) {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    if (typeof value !== 'number') return;
    const start = performance.now();
    const from = 0;
    const to = value;

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out-expo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    }
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value, duration]);

  return <span className={className}>{display}</span>;
}

/* ══════════════════════════════════════════════════
   PARTICLE BURST — fires from tap point (mobile VFX)
   ══════════════════════════════════════════════════ */
export function ParticleBurst({ colors = ['#f97316','#a855f7','#3b82f6','#22c55e','#06b6d4'] }) {
  const [particles, setParticles] = useState([]);

  const burst = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = (e.clientX ?? rect.left + rect.width / 2) - rect.left;
    const cy = (e.clientY ?? rect.top + rect.height / 2) - rect.top;

    const newParticles = Array.from({ length: 10 }, (_, i) => ({
      id: Date.now() + i,
      x: cx, y: cy,
      dx: (Math.random() - 0.5) * 70,
      dy: (Math.random() - 0.5) * 70 - 20,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 6 + 3,
    }));
    setParticles(p => [...p, ...newParticles]);
    setTimeout(() => setParticles(p => p.filter(x => !newParticles.find(n => n.id === x.id))), 700);
    return burst;
  }, [colors]);

  return { burst, Particles: (
    <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden' }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position:'absolute', left: p.x, top: p.y,
          width: p.size, height: p.size, borderRadius:'50%',
          background: p.color,
          transform: `translate(${p.dx}px, ${p.dy}px)`,
          opacity: 0, transition:'all 0.65s cubic-bezier(0,0,0.2,1)',
        }} className="animate-ping" />
      ))}
    </div>
  )};
}

/* ══════════════════════════════════════════════════
   ANIMATED STATUS DOT — replaces static dots
   ══════════════════════════════════════════════════ */
export function StatusDot({ color, size = 12, pulse = true }) {
  return (
    <span className="relative inline-flex" style={{ width: size, height: size }}>
      {pulse && (
        <span className="absolute inset-0 rounded-full animate-ping" style={{ backgroundColor: color, opacity: 0.4 }} />
      )}
      <span className="relative rounded-full shadow-sm" style={{ width: size, height: size, backgroundColor: color }} />
    </span>
  );
}

/* ══════════════════════════════════════════════════
   LIVE INDICATOR BADGE
   ══════════════════════════════════════════════════ */
export function LiveBadge() {
  return (
    <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-green-600 border border-green-200">
      <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-blink" />
      Live
    </span>
  );
}

/* ══════════════════════════════════════════════════
   MINI SPARKLINE — decorative trend line
   ══════════════════════════════════════════════════ */
export function MiniSparkline({ data = [3,5,2,8,6,9,7], color = '#f97316', width = 60, height = 24 }) {
  if (!data.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} style={{ overflow:'visible' }}>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ strokeDasharray: 300, strokeDashoffset: 300,
          animation: 'wipe-in 1s var(--ease-out-expo) 0.3s forwards' }}
      />
      {/* Glow duplicate */}
      <polyline points={pts} fill="none" stroke={color} strokeWidth="4"
        strokeLinecap="round" strokeLinejoin="round" opacity="0.15" />
      {/* End dot */}
      {data.length > 1 && (() => {
        const lastPt = pts.split(' ').pop().split(',');
        return <circle cx={lastPt[0]} cy={lastPt[1]} r="3" fill={color} className="animate-ping" style={{animationDuration:'2s'}} />;
      })()}
    </svg>
  );
}

/* ══════════════════════════════════════════════════
   STAGGERED SECTION REVEAL WRAPPER
   Wrap any section with this for scroll-triggered
   staggered child animations.
   ══════════════════════════════════════════════════ */
export function RevealSection({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={cn(className, visible ? 'animate-fade-up' : 'opacity-0')}
      style={visible ? { animationDelay: `${delay}s` } : {}}>
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN DASHBOARD PAGE
   ══════════════════════════════════════════════════ */
export default function DashboardPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const ripple = useRipple();

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
  const [headerVisible, setHeaderVisible] = useState(false);

  const ACTIVITIES_PER_PAGE = 5;
  const MAX_ACTIVITIES = 50;

  useEffect(() => {
    fetchInitialDashboard();
    const ticker = setInterval(() => setNow(new Date()), 60000);
    // Trigger hero entrance
    const t = setTimeout(() => setHeaderVisible(true), 60);
    return () => { clearInterval(ticker); clearTimeout(t); };
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
      <div className="mesh-bg dashboard-font min-h-screen space-y-8 p-1">

        {/* ── Hero Header ── */}
        <header
          className={cn(
            "relative overflow-hidden rounded-3xl p-7 shadow-2xl",
            "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900",
            headerVisible ? 'animate-blur-in' : 'opacity-0'
          )}
        >
          {/* Animated background aurora */}
          <div className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(249,115,22,0.3), rgba(168,85,247,0.2), rgba(59,130,246,0.2))',
              backgroundSize: '300% 300%',
              animation: 'aurora 10s ease infinite',
            }} />

          {/* Decorative orbs — now with drift animation */}
          <div className="orb orb-lg bg-orange-500/25 -top-16 -left-16 animate-drift" style={{animationDelay:'0s'}} />
          <div className="orb orb-md bg-purple-500/20 -bottom-12 left-1/3 animate-drift" style={{animationDelay:'1.5s'}} />
          <div className="orb orb-md bg-blue-500/15 -top-8 right-10 animate-drift" style={{animationDelay:'3s'}} />
          <div className="orb orb-sm bg-cyan-400/20 bottom-4 right-4 animate-float-alt" style={{animationDelay:'0.5s'}} />

          {/* Spinning rings */}
          <div className="absolute right-6 top-6 h-20 w-20 rounded-full border-2 border-dashed border-white/10 animate-spin-slow" />
          <div className="absolute right-10 top-10 h-12 w-12 rounded-full border border-orange-400/30 animate-spin-slow-r" />
          {/* Extra decorative ring — morphing blob */}
          <div className="absolute right-4 bottom-4 w-16 h-16 bg-purple-500/10 animate-morph" />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="animate-slide-right" style={{animationDelay:'0.1s'}}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40 mb-1">{dateStr}</p>
              <h1 className="display-font text-2xl sm:text-3xl font-bold text-white mb-1">
                {greeting},{' '}
                <span className="shimmer-text">{profile?.name?.split(' ')[0] || 'there'} 👋</span>
              </h1>
              <p className="text-sm text-white/50">Here's what's happening in your shop today.</p>
            </div>

            <div className="flex items-center gap-3 animate-slide-left" style={{animationDelay:'0.2s'}}>
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
        <RevealSection>
          <SectionLabel icon={Zap} label="Quick Actions" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { name: 'Register New Service', desc: 'Create a service ticket', icon: PlusCircle, color: '#f97316', lightBg: '#fff7ed', borderColor: '#fed7aa', href: '/services?action=new' },
              { name: 'Add New Sale',         desc: 'Record parts / accessories', icon: ShoppingBag, color: '#a855f7', lightBg: '#faf5ff', borderColor: '#e9d5ff', href: '/sales?action=new' },
              { name: 'View Services',        desc: 'Manage active repairs', icon: Wrench, color: '#3b82f6', lightBg: '#eff6ff', borderColor: '#bfdbfe', href: '/services' },
            ].map((a, i) => (
              <button
                key={a.name}
                onClick={(e) => { ripple(e); router.push(a.href); }}
                className={cn(
                  "card-hover ripple-wrap group relative flex items-center gap-4 rounded-2xl border-2 p-4 text-left shadow-sm transition-all animate-fade-up"
                )}
                style={{
                  borderColor: a.borderColor, backgroundColor: a.lightBg,
                  animationDelay: `${0.05 + i * 0.08}s`,
                }}
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ backgroundColor: a.color }} />
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm icon-pop"
                  style={{ backgroundColor: a.color + '20', border: `1.5px solid ${a.color}40` }}
                >
                  <a.icon className="h-5 w-5" style={{ color: a.color }} strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{a.name}</p>
                  <p className="text-xs mt-0.5 font-medium" style={{ color: a.color + 'bb' }}>{a.desc}</p>
                </div>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-sm transition-transform group-hover:rotate-45 duration-300"
                  style={{ backgroundColor: a.color + '15', border: `1px solid ${a.color}30` }}>
                  <ArrowUpRight className="h-4 w-4" style={{ color: a.color }} />
                </div>
              </button>
            ))}
          </div>
        </RevealSection>

        {/* ── Work Priority ── */}
        <RevealSection delay={0.05}>
          <SectionLabel icon={Activity} label="Work Priority" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { title:'Received',               count: stats.received || 0,           color:'#3b82f6', gradClass:'gradient-blue',    shadowColor:'rgba(59,130,246,0.2)',  status:'Received' },
              { title:'In Progress',            count: stats.inProgress,              color:'#f97316', gradClass:'gradient-orange',  shadowColor:'rgba(249,115,22,0.2)',  status:'In Progress' },
              { title:'Waiting for Parts',      count: stats.waitingForParts,         color:'#f59e0b', gradClass:'gradient-amber',   shadowColor:'rgba(245,158,11,0.2)',  status:'Waiting for Parts' },
              { title:'Completed (Unreturned)', count: stats.completedNotReturned,    color:'#10b981', gradClass:'gradient-emerald', shadowColor:'rgba(16,185,129,0.2)',  status:'Completed' },
            ].map((c, i) => (
              <PriorityCard key={c.title} {...c}
                animDelay={i * 0.07}
                onClick={() => router.push(`/services?status=${c.status}`)}
                onTap={ripple}
              />
            ))}
          </div>
        </RevealSection>

        {/* ── Today Summary ── */}
        <RevealSection delay={0.08}>
          <SectionLabel icon={Sparkles} label="Today Summary" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { title:'Registered',    count: stats.registeredToday,            icon: FileEdit,    color:'#3b82f6', gradClass:'gradient-blue',    wrapper: (c) => <MetricDetailsDialog title="Registered Today" dataList={stats.registeredTodayList}>{c}</MetricDetailsDialog> },
              { title:'Completed',     count: stats.completedToday,             icon: CheckCircle2,color:'#10b981', gradClass:'gradient-emerald',  onClick: () => router.push('/services?filter=completedToday') },
              { title:'Non Repairable',count: stats.notRepairableToday,         icon: XOctagon,    color:'#ef4444', gradClass:'gradient-red',      onClick: () => router.push('/services?filter=notRepairableToday') },
              { title:'Returned',      count: stats.returnedToday,              icon: PackageCheck, color:'#06b6d4', gradClass:'gradient-cyan',     onClick: () => router.push('/history?tab=services&today=returned') },
              { title:'Sales',         count: stats.salesToday,                 icon: ShoppingBag, color:'#a855f7', gradClass:'gradient-purple',   onClick: () => router.push('/sales?today=true') },
              { title:'Revenue',       count: formatCurrency(stats.revenueToday),icon: IndianRupee, color:'#f97316', gradClass:'gradient-orange',  isCurrency:true, onClick: () => { if (profile?.role === 'admin' || profile?.role === 'owner') setIsRevenueOpen(true); } },
            ].map((s, i) => {
              const card = (
                <SummaryCard key={s.title} {...s}
                  animDelay={i * 0.06}
                  onTap={ripple}
                />
              );
              return s.wrapper ? s.wrapper(card) : card;
            })}
          </div>
        </RevealSection>

        {/* ── Bottom grid ── */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">

          {/* Recent Activity */}
          <RevealSection delay={0.1}>
            <section className="glass rounded-3xl p-6 shadow-xl overflow-hidden relative">
              <div className="orb orb-md bg-orange-400/10 -top-10 -right-10 animate-drift" style={{animationDelay:'0s'}} />
              <div className="orb orb-sm bg-purple-400/10 -bottom-8 -left-8 animate-drift" style={{animationDelay:'2s'}} />

              <div className="relative mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-purple-500 shadow-md icon-pop">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Recent Activity</h3>
                </div>
                <LiveBadge />
              </div>

              {activityLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="skeleton h-[72px]" style={{animationDelay: `${i*0.07}s`}} />
                  ))}
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 gap-2 animate-fade-in">
                  <Clock className="h-7 w-7 text-gray-300 animate-float" />
                  <p className="text-sm font-semibold text-gray-400">No activity yet today</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {recentActivity.map((activity, i) => {
                      const isMine = activity.updated_by === profile?.id;
                      const ss = getStatusStyles(activity.status);
                      return (
                        <button
                          key={activity.id || i}
                          onClick={(e) => { ripple(e); handleActivityClick(activity); }}
                          className={cn(
                            "ripple-wrap group w-full relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 card-hover animate-fade-up",
                            isMine
                              ? "border-orange-300/60 bg-gradient-to-r from-orange-50 via-white to-purple-50/30 shadow-md ring-1 ring-orange-200/50"
                              : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                          )}
                          style={{ animationDelay: `${i * 0.06}s` }}
                        >
                          {isMine && (
                            <div className="absolute top-0 left-0 h-full w-1 rounded-l-2xl bg-gradient-to-b from-orange-400 to-purple-500" />
                          )}
                          <div className="flex items-center gap-3 pl-1">
                            {/* Animated status dot */}
                            <StatusDot color={ss.dotColor} size={12} pulse />

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <p className="display-font text-sm font-bold text-gray-900 truncate">
                                  {activity.services?.customer_name || 'Unknown Customer'}
                                </p>
                                <div className="flex items-center gap-2 shrink-0">
                                  {isMine && (
                                    <span className="rounded-full bg-gradient-to-r from-orange-400 to-purple-500 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-white shadow-sm animate-scale-pop">
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
                                <StatusDot color={ss.dotColor} size={6} pulse={false} />
                                {activity.status}
                              </div>
                            </div>

                            <ChevronRight className="h-4 w-4 text-gray-300 shrink-0 transition-transform duration-200 group-hover:translate-x-1 group-active:translate-x-2" />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4 animate-fade-in">
                      <button
                        onClick={(e) => { ripple(e); setCurrentPage(p => Math.max(p - 1, 1)); }}
                        disabled={currentPage === 1}
                        className="ripple-wrap rounded-xl border border-gray-200 bg-white px-4 py-1.5 text-xs font-bold text-gray-600 shadow-sm transition-all hover:bg-gray-50 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        ← Prev
                      </button>
                      <p className="text-xs font-semibold text-gray-500">
                        Page <span className="font-black text-gray-900">{currentPage}</span> / <span className="font-black text-gray-900">{totalPages}</span>
                      </p>
                      <button
                        onClick={(e) => { ripple(e); setCurrentPage(p => Math.min(p + 1, totalPages)); }}
                        disabled={currentPage === totalPages}
                        className="ripple-wrap rounded-xl border border-gray-200 bg-white px-4 py-1.5 text-xs font-bold text-gray-600 shadow-sm transition-all hover:bg-gray-50 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          </RevealSection>

          {/* Smart Alerts */}
          <RevealSection delay={0.12}>
            <section className="glass rounded-3xl p-6 shadow-xl overflow-hidden relative">
              <div className="orb orb-md bg-blue-400/10 -top-10 -right-10 animate-drift" style={{animationDelay:'1s'}} />
              <div className="orb orb-sm bg-amber-400/08 bottom-0 left-0 animate-float-alt" />

              <div className="relative mb-6 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 shadow-md icon-pop">
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
                        type="warning" animDelay={0}
                      />
                    )}
                    {stats.alerts.oldWaitingForParts > 0 && (
                      <AlertItem
                        message={`${stats.alerts.oldWaitingForParts} service${stats.alerts.oldWaitingForParts > 1 ? 's are' : ' is'} stuck waiting for parts (5+ days)`}
                        type="danger" animDelay={0.07}
                      />
                    )}
                    {stats.alerts.oldCompletedNotReturned > 0 && (
                      <AlertItem
                        message={`${stats.alerts.oldCompletedNotReturned} completed service${stats.alerts.oldCompletedNotReturned > 1 ? 's have' : ' has'} not been picked up for over a week`}
                        type="warning" animDelay={0.14}
                      />
                    )}
                    {stats.alerts.oldInProgress === 0 && stats.alerts.oldWaitingForParts === 0 && stats.alerts.oldCompletedNotReturned === 0 && (
                      <AlertItem message="All systems operational — no pending bottlenecks 🎉" type="success" animDelay={0} />
                    )}
                  </>
                ) : (
                  <div className="space-y-3">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="skeleton h-14" style={{animationDelay:`${i*0.1}s`}} />
                    ))}
                  </div>
                )}
              </div>
            </section>
          </RevealSection>
        </div>

        {/* Revenue Modal */}
        {isRevenueOpen && (
          <RevenueBreakdownModal
            onClose={() => setIsRevenueOpen(false)}
            serviceRevenue={stats.serviceRevenueToday}
            salesRevenue={stats.salesRevenueToday}
            router={router}
            ripple={ripple}
          />
        )}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════ */

function SectionLabel({ icon: Icon, label }) {
  return (
    <div className="mb-4 flex items-center gap-2.5 animate-fade-in">
      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-orange-400 to-purple-500 shadow-sm icon-pop">
        <Icon className="h-3 w-3 text-white" strokeWidth={2.5} />
      </div>
      <h3 className="text-sm font-semibold text-gray-700">{label}</h3>
      <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
    </div>
  );
}

function PriorityCard({ title, count, color, gradClass, shadowColor, onClick, onTap, animDelay = 0 }) {
  return (
    <button
      onClick={(e) => { onTap?.(e); onClick?.(); }}
      className={cn("card-hover ripple-wrap group relative overflow-hidden rounded-2xl border border-white/80 p-5 text-left shadow-md animate-scale-in", gradClass)}
      style={{ boxShadow: `0 4px 20px ${shadowColor}`, animationDelay: `${animDelay}s` }}
    >
      {/* Animated glow blob */}
      <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full blur-2xl animate-float-alt opacity-20"
        style={{ backgroundColor: color, animationDelay: `${animDelay}s` }} />
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${color}90, ${color}15)` }} />

      <div className="flex items-center justify-between mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white shadow-sm icon-pop"
          style={{ background: `${color}18` }}>
          <Activity className="h-4 w-4" style={{ color }} strokeWidth={2} />
        </div>
        {/* Decorative sparkline */}
        <MiniSparkline color={color} data={[2,4,3,7,5,8,count || 0]} width={44} height={18} />
      </div>

      {/* Animated number */}
      <p className="text-4xl font-bold tabular-nums leading-none text-gray-900">
        <AnimatedNumber value={count || 0} duration={800} />
      </p>
      <p className="mt-2 text-[13px] font-medium text-gray-500">{title}</p>
    </button>
  );
}

function SummaryCard({ title, count, isCurrency, onClick, icon: Icon, color, gradClass, onTap, animDelay = 0 }) {
  return (
    <button
      onClick={(e) => { onTap?.(e); onClick?.(); }}
      className={cn("card-hover ripple-wrap group relative w-full overflow-hidden rounded-2xl border border-white/80 p-4 text-left shadow-md animate-fade-up", gradClass)}
      style={{ animationDelay: `${animDelay}s` }}
    >
      <div className="absolute -top-8 -right-8 h-20 w-20 rounded-full blur-2xl animate-float-alt opacity-25"
        style={{ backgroundColor: color, animationDelay: `${animDelay}s` }} />
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${color}70, ${color}10)` }} />

      <div className="relative mb-3 flex h-9 w-9 items-center justify-center rounded-xl border border-white shadow-sm icon-pop"
        style={{ background: `${color}18` }}>
        {Icon && <Icon className="h-4 w-4" style={{ color }} strokeWidth={2} />}
      </div>

      <p className="text-2xl font-bold tabular-nums leading-none text-gray-900">
        {isCurrency ? count : <AnimatedNumber value={count || 0} duration={700} />}
      </p>
      <p className="mt-2 text-[11px] font-semibold text-gray-500">{title}</p>
    </button>
  );
}

function AlertItem({ message, type, animDelay = 0 }) {
  const cfg = {
    warning: { bg:'#fffbeb', border:'#fde68a', text:'#92400e', icon: TriangleAlert, iconColor:'#f59e0b', accent:'#f59e0b' },
    danger:  { bg:'#fef2f2', border:'#fecaca', text:'#991b1b', icon: AlertCircle,   iconColor:'#ef4444', accent:'#ef4444' },
    success: { bg:'#f0fdf4', border:'#bbf7d0', text:'#166534', icon: CircleCheck,   iconColor:'#22c55e', accent:'#22c55e' },
  }[type];
  const Ic = cfg.icon;

  return (
    <div
      className="relative flex items-start gap-3 rounded-2xl border p-4 text-sm font-medium overflow-hidden animate-slide-right"
      style={{ backgroundColor: cfg.bg, borderColor: cfg.border, color: cfg.text, animationDelay: `${animDelay}s` }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ backgroundColor: cfg.accent }} />
      {/* Pulse glow on accent line */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl animate-glow-pulse opacity-60"
        style={{ backgroundColor: cfg.accent }} />
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

function RevenueBreakdownModal({ onClose, serviceRevenue, salesRevenue, router, ripple }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-white shadow-2xl overflow-hidden border border-white/80 animate-scale-pop">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 px-6 py-5">
          <div className="orb orb-md bg-orange-500/20 -top-8 -right-8 animate-drift" />
          <div className="orb orb-sm bg-purple-500/20 -bottom-8 left-4 animate-float-alt" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/40 mb-1">Breakdown</p>
              <h3 className="text-base font-semibold text-white">Today's Revenue</h3>
            </div>
            <button
              onClick={onClose}
              className="ripple-wrap flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:scale-90 transition text-white text-sm font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-5 space-y-3 bg-white">
          <button
            onClick={(e) => { ripple?.(e); router.push('/history?tab=services&today=returned'); }}
            className="card-hover ripple-wrap w-full flex justify-between items-center px-5 py-4 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/60 text-left glow-blue animate-slide-right"
            style={{animationDelay:'0.1s'}}
          >
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-blue-500 mb-0.5">Services</p>
              <p className="text-[10px] text-blue-400/80 font-medium">View history →</p>
            </div>
            <CurrencyDisplay amount={serviceRevenue || 0} color="#1d4ed8" />
          </button>

          <button
            onClick={(e) => { ripple?.(e); router.push('/history?tab=sales&today=true'); }}
            className="card-hover ripple-wrap w-full flex justify-between items-center px-5 py-4 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/60 text-left glow-purple animate-slide-right"
            style={{animationDelay:'0.18s'}}
          >
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-purple-500 mb-0.5">Sales</p>
              <p className="text-[10px] text-purple-400/80 font-medium">View history →</p>
            </div>
            <CurrencyDisplay amount={salesRevenue || 0} color="#7e22ce" />
          </button>

          {/* Total */}
          <div className="rounded-2xl bg-gradient-to-r from-orange-400 to-purple-500 p-4 flex justify-between items-center shadow-lg animate-scale-in" style={{animationDelay:'0.26s'}}>
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
    <div className="mesh-bg dashboard-font min-h-screen space-y-8 p-1">
      <div className="skeleton h-28 rounded-3xl" />
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" style={{animationDelay:`${i*0.07}s`}} />)}
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" style={{animationDelay:`${i*0.07}s`}} />)}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" style={{animationDelay:`${i*0.05}s`}} />)}
      </div>
    </div>
  );
}

/* ── Status style helper ── */
function getStatusStyles(status = '') {
  const s = status.toLowerCase();
  const make = (dot, badge) => ({ dotColor: dot, badgeBg: badge+'18', badgeBorder: badge+'40', badgeText: badge });
  if (s.includes('received'))    return make('#3b82f6','#3b82f6');
  if (s.includes('diagnosed'))   return make('#8b5cf6','#8b5cf6');
  if (s.includes('repair started')||s.includes('repairing')||s.includes('in repair')) return make('#f97316','#f97316');
  if (s.includes('waiting'))     return make('#f59e0b','#f59e0b');
  if (s.includes('completed'))   return make('#10b981','#10b981');
  if (s.includes('returned'))    return make('#22c55e','#22c55e');
  if (s.includes('cancel')||s.includes('non repairable')||s.includes('rejected')) return make('#ef4444','#ef4444');
  return make('#6b7280','#6b7280');
}

/* ═══════════════════════════════════════════════════════
   EXPORTS — use these helpers across ALL other pages
   ═══════════════════════════════════════════════════════

   import { 
     useRipple, useRevealOnScroll, useStaggerReveal,
     AnimatedNumber, StatusDot, LiveBadge,
     MiniSparkline, RevealSection, ParticleBurst
   } from '@/app/dashboard/page';

   CSS classes available globally after StyleInjector mounts:
   .animate-fade-up / .animate-fade-down / .animate-fade-in
   .animate-scale-in / .animate-scale-pop / .animate-blur-in
   .animate-slide-left / .animate-slide-right / .animate-slide-up
   .animate-count-in / .animate-flip-up / .animate-wipe-in
   .animate-float / .animate-float-alt / .animate-drift
   .animate-spin-slow / .animate-spin-slow-r / .animate-morph
   .animate-shimmer / .animate-glow-pulse / .animate-aurora
   .animate-pulse-ring / .animate-blink / .animate-ping
   .animate-shake / .animate-press
   .stagger-1 … .stagger-8  (animation-delay helpers)
   .shimmer-text / .shimmer-text-fast
   .glass / .glass-dark / .glass-tinted
   .mesh-bg / .hero-gradient / .aurora-bg
   .card-hover / .icon-pop / .ripple-wrap
   .gradient-orange/purple/blue/green/cyan/amber/red/emerald
   .glow-orange/purple/blue/green/cyan/amber
   .orb / .orb-sm / .orb-md / .orb-lg / .orb-xl
   .skeleton
   .page-enter / .page-exit
   .dashboard-font / .display-font
*/
