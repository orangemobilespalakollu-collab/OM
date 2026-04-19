'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { authService } from '@/services/authService';
import {
  LayoutDashboard, Wrench, ShoppingBag, Users,
  BarChart3, UserCircle, Menu, X, LogOut,
  History, ChevronRight, ArrowUpRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════
   DESIGN SYSTEM — exact mirror of all app pages
═══════════════════════════════════════════════════════════════ */

const LAYOUT_STYLES = `
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
  --ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-expo:     cubic-bezier(0.16, 1, 0.3, 1);
}

.lyt-font-display { font-family: 'Instrument Serif', Georgia, serif; }
.lyt-font-body    { font-family: 'Geist', system-ui, sans-serif; }

/* ── Keyframes ── */
@keyframes lyt-spin-slow  { from { transform:rotate(0deg); }  to { transform:rotate(360deg); } }
@keyframes lyt-spin-rev   { from { transform:rotate(0deg); }  to { transform:rotate(-360deg); } }
@keyframes lyt-blink      { 0%,100%{ opacity:1; } 50%{ opacity:0.2; } }
@keyframes lyt-blob-morph {
  0%,100% { border-radius:60% 40% 30% 70% / 60% 30% 70% 40%; }
  33%      { border-radius:30% 70% 60% 40% / 50% 60% 30% 60%; }
  66%      { border-radius:50% 30% 70% 40% / 40% 70% 30% 60%; }
}
@keyframes lyt-fade-up {
  from { opacity:0; transform:translateY(8px); filter:blur(3px); }
  to   { opacity:1; transform:translateY(0);   filter:blur(0); }
}
@keyframes lyt-slide-left {
  from { opacity:0; transform:translateX(-12px); }
  to   { opacity:1; transform:translateX(0); }
}
@keyframes lyt-orbit {
  from { transform:rotate(0deg) translateX(36px) rotate(0deg); }
  to   { transform:rotate(360deg) translateX(36px) rotate(-360deg); }
}
@keyframes lyt-ripple-out { from { transform:scale(0); opacity:0.35; } to { transform:scale(3); opacity:0; } }
@keyframes lyt-nav-pop {
  0%   { transform:scale(0.92); opacity:0; }
  60%  { transform:scale(1.04); }
  100% { transform:scale(1);    opacity:1; }
}
@keyframes lyt-underline {
  from { transform:scaleX(0); transform-origin:left; }
  to   { transform:scaleX(1); transform-origin:left; }
}
@keyframes lyt-live-ring {
  0%   { transform:scale(1);   opacity:0.5; }
  70%  { transform:scale(2.4); opacity:0; }
  100% { transform:scale(2.4); opacity:0; }
}
@keyframes lyt-badge-pop {
  0%   { transform:scale(0); opacity:0; }
  60%  { transform:scale(1.2); }
  100% { transform:scale(1);  opacity:1; }
}
@keyframes lyt-mobile-bar-in {
  from { transform:translateY(100%); opacity:0; }
  to   { transform:translateY(0);    opacity:1; }
}

/* ── Blob ── */
.lyt-blob {
  border-radius:60% 40% 30% 70% / 60% 30% 70% 40%;
  animation:lyt-blob-morph 10s ease-in-out infinite;
  position:absolute; pointer-events:none;
}

/* ── Ripple ── */
.lyt-ripple { position:relative; overflow:hidden; }
.lyt-ripple-circle {
  position:absolute; border-radius:50%;
  background:rgba(255,255,255,0.22);
  transform:scale(0);
  animation:lyt-ripple-out 0.55s linear forwards;
  pointer-events:none;
}

/* ── Nav item ── */
.lyt-nav-item {
  position:relative;
  transition:transform 0.2s var(--ease-spring), background 0.18s, border-color 0.18s;
}
.lyt-nav-item:hover { transform:translateX(2px); }
.lyt-nav-item:active { transform:scale(0.97); }

/* ── Header pill ── */
.lyt-header-pill {
  background:rgba(255,255,255,0.88);
  border:1px solid rgba(0,0,0,0.07);
  backdrop-filter:blur(8px);
  transition:all 0.2s;
}
.lyt-header-pill:hover {
  background:#fff;
  box-shadow:0 4px 12px rgba(0,0,0,0.08);
  transform:translateY(-1px);
}

/* ── Avatar button ── */
.lyt-avatar-btn {
  position:relative;
  transition:transform 0.25s var(--ease-spring), box-shadow 0.2s;
}
.lyt-avatar-btn:hover { transform:scale(1.08); }

/* ── Dropdown item ── */
.lyt-dropdown-item {
  transition:background 0.15s, transform 0.15s;
}
.lyt-dropdown-item:hover { transform:translateX(2px); }

/* ── Mobile bottom bar ── */
.lyt-mobile-bar {
  animation:lyt-mobile-bar-in 0.4s var(--ease-expo) both;
}

/* ── Active bottom nav indicator ── */
.lyt-bottom-active-dot {
  animation:lyt-badge-pop 0.3s var(--ease-spring) both;
}
`;

function StyleInjector() {
  useEffect(() => {
    if (document.getElementById('lyt-v2-styles')) return;
    const el = document.createElement('style');
    el.id = 'lyt-v2-styles';
    el.textContent = LAYOUT_STYLES;
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
    circle.className = 'lyt-ripple-circle';
    Object.assign(circle.style, {
      width:`${d}px`, height:`${d}px`,
      left:`${e.clientX - r.left - d/2}px`,
      top:`${e.clientY - r.top  - d/2}px`,
    });
    btn.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
  }, []);
}

/* ── Role config ── */
function getRoleConfig(role) {
  return {
    admin:      { color:'#f97316', label:'Admin' },
    owner:      { color:'#8b5cf6', label:'Owner' },
    technician: { color:'#3b82f6', label:'Technician' },
    staff:      { color:'#10b981', label:'Staff' },
  }[role] || { color:'#f97316', label: role || 'User' };
}

/* ── Per-nav semantic colors ── */
const NAV_COLORS = {
  '/dashboard': '#f97316',
  '/services':  '#3b82f6',
  '/sales':     '#8b5cf6',
  '/history':   '#06b6d4',
  '/employees': '#10b981',
  '/reports':   '#f59e0b',
  '/account':   '#ec4899',
};

/* ═══════════════════════════════════════════════════════════════
   MAIN LAYOUT
═══════════════════════════════════════════════════════════════ */
export default function Layout({ children }) {
  const { profile, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen]   = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const ripple = useRipple();

  useEffect(() => {
    function handleOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setIsDropdownOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  useEffect(() => { setIsSidebarOpen(false); }, [pathname]);

  const navigation = [
    { name:'Dashboard',   href:'/dashboard', icon:LayoutDashboard },
    { name:'Services',    href:'/services',  icon:Wrench },
    { name:'Sales',       href:'/sales',     icon:ShoppingBag },
    { name:'History',     href:'/history',   icon:History },
    ...(profile?.role === 'admin' || profile?.role === 'owner' ? [
      { name:'Employees', href:'/employees', icon:Users },
      { name:'Reports',   href:'/reports',   icon:BarChart3 },
    ] : []),
    { name:'Account',     href:'/account',   icon:UserCircle },
  ];

  /* Bottom nav — only most important 5 items on mobile */
  const bottomNav = [
    { name:'Home',     href:'/dashboard', icon:LayoutDashboard },
    { name:'Services', href:'/services',  icon:Wrench },
    { name:'Sales',    href:'/sales',     icon:ShoppingBag },
    { name:'History',  href:'/history',   icon:History },
    { name:'Account',  href:'/account',   icon:UserCircle },
  ];

  async function handleLogout() {
    try { await authService.logout(); logout(); router.push('/login'); }
    catch (err) { console.error('Logout failed:', err); }
  }

  const roleConfig  = getRoleConfig(profile?.role);
  const initials    = (profile?.full_name || profile?.name || 'U')
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);
  const activePage  = navigation.find(i => i.href === pathname)?.name || 'Orange Mobile';
  const activeColor = NAV_COLORS[pathname] || '#f97316';
  const ActiveIcon  = navigation.find(n => n.href === pathname)?.icon || LayoutDashboard;

  return (
    <>
      <StyleInjector />
      <div className="lyt-font-body flex" style={{ minHeight:'100vh', minHeight:'100dvh', backgroundColor:'var(--surface)' }}>

        {/* ════════════════════════════════════════
            DESKTOP SIDEBAR
        ════════════════════════════════════════ */}
        <aside
          className="hidden lg:flex flex-col"
          style={{ width:256, position:'fixed', top:0, left:0, bottom:0, zIndex:30 }}
        >
          {/* Dark background */}
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg, #0d0d0d 0%, #141414 60%, #0d0d0d 100%)' }} />

          {/* Morphing blobs */}
          <div className="lyt-blob" style={{ width:200, height:200, background:'var(--accent)', opacity:0.07, top:-50, left:-50 }} />
          <div className="lyt-blob" style={{ width:140, height:140, background:'var(--accent)', opacity:0.04, bottom:80, right:-30, animationDelay:'4s' }} />

          {/* Spinning rings — decorative */}
          <div style={{ position:'absolute', bottom:100, right:16, width:48, height:48, animation:'lyt-spin-slow 18s linear infinite', pointerEvents:'none' }}>
            <div style={{ width:'100%', height:'100%', borderRadius:'50%', border:'1px dashed rgba(249,115,22,0.15)' }} />
          </div>
          <div style={{ position:'absolute', bottom:100, right:16, pointerEvents:'none' }}>
            <div style={{ width:5, height:5, borderRadius:'50%', background:'var(--accent)', opacity:0.5, animation:'lyt-orbit 9s linear infinite' }} />
          </div>

          {/* Corner accent line */}
          <div style={{ position:'absolute', top:0, left:'10%', right:'10%', height:2, background:'linear-gradient(90deg, transparent, var(--accent), transparent)', opacity:0.5 }} />

          <div style={{ position:'relative', display:'flex', flexDirection:'column', height:'100%' }}>

            {/* ── Brand ── */}
            <div style={{ padding:'1.375rem 1.25rem', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', gap:'0.75rem' }}>
              <div style={{ width:36, height:36, borderRadius:'0.75rem', background:'linear-gradient(135deg, var(--accent), #c2410c)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 6px 20px rgba(249,115,22,0.4)', flexShrink:0 }}>
                <span className="lyt-font-display" style={{ fontSize:'1rem', fontWeight:400, color:'#fff', fontStyle:'italic' }}>O</span>
              </div>
              <div>
                <h1 className="lyt-font-display" style={{ fontSize:'1.0625rem', fontWeight:400, color:'rgba(255,255,255,0.94)', fontStyle:'italic', lineHeight:1.1 }}>
                  Orange <span style={{ color:'var(--accent)' }}>Mobile</span>
                </h1>
                <p style={{ fontSize:'0.5625rem', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(255,255,255,0.25)', marginTop:'0.2rem' }}>
                  Service Center
                </p>
              </div>
            </div>

            {/* ── Navigation ── */}
            <nav style={{ flex:1, padding:'0.75rem', overflowY:'auto', display:'flex', flexDirection:'column', gap:'0.25rem' }}>
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                const color    = NAV_COLORS[item.href] || '#f97316';
                return (
                  <SidebarNavItem
                    key={item.href}
                    item={item}
                    isActive={isActive}
                    color={color}
                  />
                );
              })}
            </nav>

            {/* ── User card ── */}
            <div style={{ padding:'0.75rem', paddingBottom:'1rem', borderTop:'1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ borderRadius:'1rem', padding:'0.875rem', background:`${roleConfig.color}12`, border:`1.5px solid ${roleConfig.color}22`, marginBottom:'0.5rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                  <div style={{ width:36, height:36, borderRadius:'0.75rem', background:`linear-gradient(135deg, ${roleConfig.color}, ${roleConfig.color}cc)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:`0 4px 12px ${roleConfig.color}35` }}>
                    <span className="lyt-font-display" style={{ fontSize:'0.875rem', fontWeight:400, color:'#fff', fontStyle:'italic' }}>{initials}</span>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:'0.8125rem', fontWeight:600, color:'rgba(255,255,255,0.9)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', margin:0 }}>
                      {profile?.full_name || profile?.name}
                    </p>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.35rem', marginTop:'0.2rem' }}>
                      <span style={{ display:'inline-block', position:'relative', width:6, height:6, borderRadius:'50%', background:'#22c55e' }}>
                        <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:'#22c55e', animation:'lyt-live-ring 2s ease-out infinite' }} />
                      </span>
                      <p style={{ fontSize:'0.5625rem', fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:`${roleConfig.color}bb`, margin:0 }}>
                        {roleConfig.label}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <LogoutBtn onClick={handleLogout} />
            </div>
          </div>
        </aside>

        {/* ════════════════════════════════════════
            MOBILE SIDEBAR DRAWER
        ════════════════════════════════════════ */}
        {/* Backdrop */}
        <div
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position:'fixed', inset:0, zIndex:40,
            background:'rgba(0,0,0,0.6)',
            backdropFilter:'blur(4px)',
            opacity: isSidebarOpen ? 1 : 0,
            pointerEvents: isSidebarOpen ? 'auto' : 'none',
            transition:'opacity 0.3s ease',
          }}
          className="lg:hidden"
        />

        {/* Drawer */}
        <aside
          className="lg:hidden"
          style={{
            position:'fixed', top:0, left:0, bottom:0, zIndex:50,
            width:288,
            transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition:'transform 0.3s var(--ease-expo)',
          }}
        >
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg, #0d0d0d 0%, #141414 60%, #0d0d0d 100%)' }} />
          <div className="lyt-blob" style={{ width:200, height:200, background:'var(--accent)', opacity:0.07, top:-50, left:-50 }} />
          <div className="lyt-blob" style={{ width:130, height:130, background:'var(--accent)', opacity:0.04, bottom:100, right:-20, animationDelay:'3s' }} />
          <div style={{ position:'absolute', top:0, left:'10%', right:'10%', height:2, background:'linear-gradient(90deg, transparent, var(--accent), transparent)', opacity:0.5 }} />

          <div style={{ position:'relative', display:'flex', flexDirection:'column', height:'100%' }}>
            {/* Brand + close */}
            <div style={{ padding:'1.25rem', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                <div style={{ width:36, height:36, borderRadius:'0.75rem', background:'linear-gradient(135deg, var(--accent), #c2410c)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 6px 20px rgba(249,115,22,0.4)', flexShrink:0 }}>
                  <span className="lyt-font-display" style={{ fontSize:'1rem', fontWeight:400, color:'#fff', fontStyle:'italic' }}>O</span>
                </div>
                <div>
                  <h1 className="lyt-font-display" style={{ fontSize:'1.0625rem', fontWeight:400, color:'rgba(255,255,255,0.94)', fontStyle:'italic', lineHeight:1.1 }}>
                    Orange <span style={{ color:'var(--accent)' }}>Mobile</span>
                  </h1>
                  <p style={{ fontSize:'0.5625rem', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(255,255,255,0.25)', marginTop:'0.2rem' }}>
                    Service Center
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                style={{ width:36, height:36, borderRadius:'0.75rem', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#fff', flexShrink:0 }}
              >
                <X style={{ width:16, height:16 }} />
              </button>
            </div>

            {/* Nav */}
            <nav style={{ flex:1, padding:'0.75rem', overflowY:'auto', display:'flex', flexDirection:'column', gap:'0.25rem' }}>
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                const color    = NAV_COLORS[item.href] || '#f97316';
                return (
                  <SidebarNavItem
                    key={item.href}
                    item={item}
                    isActive={isActive}
                    color={color}
                    large
                  />
                );
              })}
            </nav>

            {/* User + logout */}
            <div style={{ padding:'0.75rem', paddingBottom:'1.25rem', borderTop:'1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ borderRadius:'1rem', padding:'0.875rem', background:`${roleConfig.color}12`, border:`1.5px solid ${roleConfig.color}22`, marginBottom:'0.5rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                  <div style={{ width:40, height:40, borderRadius:'0.875rem', background:`linear-gradient(135deg, ${roleConfig.color}, ${roleConfig.color}cc)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:`0 4px 12px ${roleConfig.color}35` }}>
                    <span className="lyt-font-display" style={{ fontSize:'1rem', fontWeight:400, color:'#fff', fontStyle:'italic' }}>{initials}</span>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:'0.9375rem', fontWeight:600, color:'rgba(255,255,255,0.9)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', margin:0 }}>
                      {profile?.full_name || profile?.name}
                    </p>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.35rem', marginTop:'0.25rem' }}>
                      <span style={{ display:'inline-block', position:'relative', width:6, height:6, borderRadius:'50%', background:'#22c55e' }}>
                        <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:'#22c55e', animation:'lyt-live-ring 2s ease-out infinite' }} />
                      </span>
                      <p style={{ fontSize:'0.5625rem', fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:`${roleConfig.color}bb`, margin:0 }}>
                        {roleConfig.label}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <LogoutBtn onClick={handleLogout} />
            </div>
          </div>
        </aside>

        {/* ════════════════════════════════════════
            MAIN CONTENT
        ════════════════════════════════════════ */}
        <div
          style={{
            display:'flex', flexDirection:'column', flex:1, minWidth:0,
            paddingLeft:0,
            /* On desktop, offset by sidebar width */
          }}
          className="lg:pl-64"
        >
          {/* ══════════════════════════════════════
              TOPBAR
          ══════════════════════════════════════ */}
          <header
            style={{
              position:'sticky', top:0, zIndex:20,
              height:64, display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'0 1rem',
              background:'rgba(249,249,251,0.92)',
              backdropFilter:'blur(20px)',
              WebkitBackdropFilter:'blur(20px)',
              borderBottom:'1px solid rgba(0,0,0,0.055)',
              boxShadow:'0 1px 24px rgba(0,0,0,0.04)',
            }}
            className="lg:px-6"
          >
            {/* Left */}
            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
              {/* Hamburger */}
              <button
                onClick={(e) => { ripple(e); setIsSidebarOpen(true); }}
                className="lyt-ripple lg:hidden"
                style={{ width:38, height:38, borderRadius:'0.75rem', background:'var(--surface-raise)', border:'1.5px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}
              >
                <Menu style={{ width:16, height:16, color:'var(--ink-mid)' }} />
              </button>

              {/* Vertical divider — mobile */}
              <div className="lg:hidden" style={{ width:1, height:24, background:'var(--border)', flexShrink:0 }} />

              {/* Page identity */}
              <div style={{ display:'flex', alignItems:'center', gap:'0.625rem', animation:'lyt-slide-left 0.3s var(--ease-expo) both' }}>
                {/* Icon bubble */}
                <div style={{
                  width:36, height:36, borderRadius:'0.75rem', flexShrink:0,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  background:`${activeColor}15`,
                  border:`1.5px solid ${activeColor}30`,
                  position:'relative', overflow:'hidden',
                }}>
                  {/* Animated top accent bar */}
                  <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:activeColor, opacity:0.7 }} />
                  <ActiveIcon style={{ width:15, height:15, color:activeColor, position:'relative', zIndex:1 }} strokeWidth={2.5} />
                </div>

                <div>
                  <h2 className="lyt-font-display" style={{ fontSize:'1rem', fontWeight:400, color:'var(--ink)', lineHeight:1.1, fontStyle:'italic', margin:0 }}>
                    {activePage}
                  </h2>
                  <p className="hidden sm:block" style={{ fontSize:'0.5625rem', fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--ink-faint)', margin:'0.15rem 0 0' }}>
                    Orange Mobile · Service Center
                  </p>
                </div>

                {/* Divider + Live badge — desktop only */}
                <div className="hidden lg:flex" style={{ alignItems:'center', gap:'0.625rem', marginLeft:'0.25rem' }}>
                  <div style={{ width:1, height:24, background:'var(--border)' }} />
                  <span style={{ display:'inline-flex', alignItems:'center', gap:'0.35rem', padding:'0.25rem 0.625rem', borderRadius:9999, background:'#f0fdf4', border:'1px solid #bbf7d0', fontSize:'0.625rem', fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'#16a34a' }}>
                    <span style={{ position:'relative', display:'inline-block', width:6, height:6, borderRadius:'50%', background:'#22c55e' }}>
                      <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:'#22c55e', animation:'lyt-live-ring 2s ease-out infinite' }} />
                    </span>
                    Live
                  </span>
                </div>
              </div>
            </div>

            {/* Right */}
            <div style={{ display:'flex', alignItems:'center', gap:'0.625rem' }}>
              {/* Name + role — desktop */}
              <div className="hidden md:flex lyt-header-pill" style={{ alignItems:'center', gap:'0.625rem', borderRadius:'1.125rem', padding:'0.5rem 1rem' }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background:roleConfig.color, flexShrink:0 }} />
                <div style={{ textAlign:'right' }}>
                  <p className="lyt-font-display" style={{ fontSize:'0.875rem', fontWeight:400, color:'var(--ink)', lineHeight:1.1, fontStyle:'italic', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:140 }}>
                    {profile?.full_name || profile?.name}
                  </p>
                  <p style={{ fontSize:'0.5625rem', fontWeight:700, letterSpacing:'0.16em', textTransform:'uppercase', color:roleConfig.color, margin:0 }}>
                    {roleConfig.label}
                  </p>
                </div>
              </div>

              {/* Avatar + dropdown */}
              <div style={{ position:'relative' }} ref={dropdownRef}>
                <button
                  onClick={(e) => { ripple(e); setIsDropdownOpen(v => !v); }}
                  className="lyt-avatar-btn lyt-ripple"
                  style={{
                    width:40, height:40, borderRadius:'0.875rem',
                    background:`linear-gradient(135deg, ${roleConfig.color}, ${roleConfig.color}cc)`,
                    border:`2px solid ${roleConfig.color}30`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    cursor:'pointer', flexShrink:0,
                    boxShadow:`0 4px 14px ${roleConfig.color}35`,
                    position:'relative',
                  }}
                >
                  <span className="lyt-font-display" style={{ fontSize:'0.9375rem', fontWeight:400, color:'#fff', fontStyle:'italic', position:'relative', zIndex:1 }}>{initials}</span>
                  {/* Online dot */}
                  <span style={{ position:'absolute', bottom:-2, right:-2, width:12, height:12, borderRadius:'50%', background:'#22c55e', border:'2px solid var(--surface)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ width:5, height:5, borderRadius:'50%', background:'#fff', animation:'lyt-blink 2s ease-in-out infinite', display:'inline-block' }} />
                  </span>
                  {/* Open indicator */}
                  {isDropdownOpen && (
                    <span style={{ position:'absolute', top:-4, right:-4, width:10, height:10, borderRadius:'50%', background:'var(--accent)', border:'2px solid var(--surface)', animation:'lyt-badge-pop 0.25s var(--ease-spring) both' }} />
                  )}
                </button>

                {/* ── Dropdown ── */}
                {isDropdownOpen && (
                  <div
                    style={{
                      position:'absolute', right:0, top:52, zIndex:50, width:240,
                      borderRadius:'1.5rem', overflow:'hidden',
                      background:'var(--surface-raise)',
                      border:'1px solid var(--border)',
                      boxShadow:'0 24px 48px -8px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04)',
                      animation:'lyt-fade-up 0.25s var(--ease-expo) both',
                    }}
                  >
                    {/* Dark header */}
                    <div style={{ background:'linear-gradient(135deg, #0d0d0d, #181818)', padding:'1.125rem 1.25rem', position:'relative', overflow:'hidden' }}>
                      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'var(--accent)', opacity:0.7 }} />
                      <div className="lyt-blob" style={{ width:100, height:100, background:'var(--accent)', opacity:0.06, top:-25, right:-15 }} />
                      <div style={{ position:'relative', display:'flex', alignItems:'center', gap:'0.75rem' }}>
                        <div style={{ width:44, height:44, borderRadius:'0.875rem', background:`linear-gradient(135deg, ${roleConfig.color}, ${roleConfig.color}cc)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:`0 4px 16px ${roleConfig.color}40`, position:'relative' }}>
                          <span className="lyt-font-display" style={{ fontSize:'1rem', fontWeight:400, color:'#fff', fontStyle:'italic' }}>{initials}</span>
                          <span style={{ position:'absolute', bottom:-2, right:-2, width:12, height:12, borderRadius:'50%', background:'#22c55e', border:'2px solid #0d0d0d' }} />
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ fontSize:'0.9375rem', fontWeight:600, color:'rgba(255,255,255,0.92)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', margin:0 }}>
                            {profile?.full_name || profile?.name}
                          </p>
                          <span style={{ display:'inline-flex', alignItems:'center', gap:'0.3rem', marginTop:'0.3rem', padding:'0.15rem 0.5rem', borderRadius:9999, background:`${roleConfig.color}20`, border:`1px solid ${roleConfig.color}35`, fontSize:'0.5625rem', fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:roleConfig.color }}>
                            <span style={{ width:4, height:4, borderRadius:'50%', background:roleConfig.color, display:'inline-block' }} />
                            {roleConfig.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div style={{ padding:'0.5rem' }}>
                      <Link href="/account" onClick={() => setIsDropdownOpen(false)}
                        className="lyt-dropdown-item"
                        style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.75rem', borderRadius:'0.875rem', textDecoration:'none', color:'var(--ink)', fontSize:'0.875rem', fontWeight:600, transition:'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background='var(--surface)'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}
                      >
                        <div style={{ width:32, height:32, borderRadius:'0.625rem', background:'rgba(139,92,246,0.12)', border:'1px solid rgba(139,92,246,0.25)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <UserCircle style={{ width:15, height:15, color:'#8b5cf6' }} strokeWidth={2} />
                        </div>
                        <span style={{ flex:1 }}>My Account</span>
                        <ChevronRight style={{ width:14, height:14, color:'var(--border-strong)' }} />
                      </Link>

                      <div style={{ height:1, background:'var(--border)', margin:'0.375rem 0' }} />

                      <button
                        onClick={() => { setIsDropdownOpen(false); handleLogout(); }}
                        className="lyt-dropdown-item"
                        style={{ display:'flex', width:'100%', alignItems:'center', gap:'0.75rem', padding:'0.75rem', borderRadius:'0.875rem', background:'transparent', border:'none', cursor:'pointer', color:'#ef4444', fontSize:'0.875rem', fontWeight:600, textAlign:'left', transition:'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background='#fef2f2'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}
                      >
                        <div style={{ width:32, height:32, borderRadius:'0.625rem', background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.25)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <LogOut style={{ width:15, height:15, color:'#ef4444' }} strokeWidth={2} />
                        </div>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* ── Page content ── */}
          <main
            style={{
              flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch',
              /* Extra bottom padding on mobile for the fixed bottom nav */
              paddingBottom:'5.5rem',
            }}
            className="lg:pb-6"
          >
            <div style={{ padding:'1rem' }} className="lg:p-6">
              {children}
            </div>
          </main>
        </div>

        {/* ════════════════════════════════════════
            MOBILE BOTTOM NAV BAR
            (replaces hamburger as primary nav on mobile)
        ════════════════════════════════════════ */}
        <nav
          className="lyt-mobile-bar lg:hidden"
          style={{
            position:'fixed', bottom:0, left:0, right:0, zIndex:30,
            background:'rgba(255,255,255,0.95)',
            backdropFilter:'blur(20px)',
            WebkitBackdropFilter:'blur(20px)',
            borderTop:'1px solid rgba(0,0,0,0.06)',
            boxShadow:'0 -4px 24px rgba(0,0,0,0.07)',
            display:'flex', alignItems:'stretch',
            paddingBottom:'env(safe-area-inset-bottom)',
          }}
        >
          {bottomNav.map((item) => {
            const isActive = pathname === item.href;
            const color    = NAV_COLORS[item.href] || '#f97316';
            return (
              <BottomNavItem
                key={item.href}
                item={item}
                isActive={isActive}
                color={color}
              />
            );
          })}
        </nav>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════════════════════════ */

/* ── Sidebar Nav Item ── */
function SidebarNavItem({ item, isActive, color, large }) {
  const ripple = useRipple();
  return (
    <Link
      href={item.href}
      onClick={ripple}
      className="lyt-nav-item lyt-ripple"
      style={{
        display:'flex', alignItems:'center', gap:'0.75rem',
        padding: large ? '0.8125rem 0.875rem' : '0.6875rem 0.875rem',
        borderRadius:'1rem', textDecoration:'none',
        border: isActive ? `1.5px solid ${color}35` : '1.5px solid transparent',
        background: isActive ? `${color}18` : 'transparent',
        position:'relative',
      }}
    >
      {/* Active left stripe */}
      {isActive && (
        <div style={{ position:'absolute', left:0, top:'20%', bottom:'20%', width:3, borderRadius:'0 3px 3px 0', background:color }} />
      )}

      {/* Icon */}
      <div style={{
        width: large ? 36 : 32, height: large ? 36 : 32, borderRadius:'0.75rem', flexShrink:0,
        display:'flex', alignItems:'center', justifyContent:'center',
        background: isActive ? `${color}22` : 'rgba(255,255,255,0.06)',
        border: isActive ? `1px solid ${color}35` : '1px solid transparent',
        transition:'background 0.18s, border-color 0.18s',
      }}>
        <item.icon
          style={{ width: large ? 17 : 15, height: large ? 17 : 15, color: isActive ? color : 'rgba(255,255,255,0.45)', transition:'color 0.18s' }}
          strokeWidth={isActive ? 2.5 : 2}
        />
      </div>

      {/* Label */}
      <span className={isActive ? 'lyt-font-display' : ''}
        style={{
          flex:1, fontSize: large ? '0.9375rem' : '0.8125rem',
          fontWeight: isActive ? 400 : 500,
          fontStyle: isActive ? 'italic' : 'normal',
          color: isActive ? '#fff' : 'rgba(255,255,255,0.45)',
          transition:'color 0.18s',
        }}>
        {item.name}
      </span>

      {/* Arrow on active */}
      {isActive && (
        <ChevronRight style={{ width:13, height:13, color:`${color}80`, flexShrink:0 }} />
      )}
    </Link>
  );
}

/* ── Bottom Nav Item ── */
function BottomNavItem({ item, isActive, color }) {
  const ripple = useRipple();
  return (
    <Link
      href={item.href}
      onClick={ripple}
      className="lyt-ripple"
      style={{
        flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        gap:'0.25rem', padding:'0.5rem 0.25rem', textDecoration:'none', position:'relative',
        minHeight:56,
      }}
    >
      {/* Active top bar */}
      {isActive && (
        <div
          className="lyt-bottom-active-dot"
          style={{ position:'absolute', top:0, left:'25%', right:'25%', height:2.5, borderRadius:'0 0 3px 3px', background:color }}
        />
      )}

      {/* Icon container */}
      <div style={{
        width:36, height:32, borderRadius:'0.75rem',
        display:'flex', alignItems:'center', justifyContent:'center',
        background: isActive ? `${color}14` : 'transparent',
        transition:'background 0.2s var(--ease-spring), transform 0.2s var(--ease-spring)',
        transform: isActive ? 'scale(1.1)' : 'scale(1)',
      }}>
        <item.icon
          style={{ width:18, height:18, color: isActive ? color : 'var(--ink-faint)', transition:'color 0.2s' }}
          strokeWidth={isActive ? 2.5 : 2}
        />
      </div>

      {/* Label */}
      <span style={{
        fontSize:'0.625rem', fontWeight: isActive ? 700 : 500,
        letterSpacing: isActive ? '0.04em' : '0.02em',
        color: isActive ? color : 'var(--ink-faint)',
        transition:'color 0.2s',
        lineHeight:1,
      }}>
        {item.name}
      </span>
    </Link>
  );
}

/* ── Logout Button ── */
function LogoutBtn({ onClick }) {
  const ripple = useRipple();
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={(e) => { ripple(e); onClick(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="lyt-nav-item lyt-ripple"
      style={{
        display:'flex', width:'100%', alignItems:'center', gap:'0.75rem',
        padding:'0.6875rem 0.875rem', borderRadius:'1rem', cursor:'pointer',
        background: hovered ? 'rgba(239,68,68,0.12)' : 'transparent',
        border: '1.5px solid transparent',
        transition:'background 0.18s',
      }}
    >
      <div style={{ width:32, height:32, borderRadius:'0.75rem', display:'flex', alignItems:'center', justifyContent:'center', background: hovered ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)', transition:'background 0.18s', flexShrink:0 }}>
        <LogOut style={{ width:15, height:15, color: hovered ? '#ef4444' : 'rgba(255,255,255,0.35)', transition:'color 0.18s' }} strokeWidth={2} />
      </div>
      <span style={{ fontSize:'0.8125rem', fontWeight:500, color: hovered ? '#ef4444' : 'rgba(255,255,255,0.35)', transition:'color 0.18s' }}>
        Logout
      </span>
    </button>
  );
}
