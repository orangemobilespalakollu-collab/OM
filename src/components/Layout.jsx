'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { authService } from '@/services/authService';
import {
  LayoutDashboard,
  Wrench,
  ShoppingBag,
  Users,
  BarChart3,
  UserCircle,
  Menu,
  X,
  LogOut,
  History,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

/* ─── Styles ─── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}
@keyframes float {
  0%,100% { transform: translateY(0px); }
  50%      { transform: translateY(-5px); }
}
@keyframes blink {
  0%,100% { opacity: 1; }
  50%      { opacity: 0.3; }
}
@keyframes slide-in-left {
  from { opacity: 0; transform: translateX(-16px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes fade-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes avatar-glow {
  0%,100% { box-shadow: 0 0 0 0px rgba(249,115,22,0); }
  50%      { box-shadow: 0 0 0 6px rgba(249,115,22,0.18); }
}
@keyframes header-shimmer {
  0%   { background-position: -300% center; }
  100% { background-position:  300% center; }
}
@keyframes notif-pop {
  0%   { transform: scale(0); opacity: 0; }
  70%  { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes breadcrumb-in {
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0); }
}

.lyt-shimmer-text {
  background: linear-gradient(90deg, #f97316, #a855f7, #3b82f6, #f97316);
  background-size: 300% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 4s linear infinite;
}
.lyt-blink     { animation: blink 2s ease-in-out infinite; }
.lyt-float     { animation: float 3s ease-in-out infinite; }
.lyt-spin-slow { animation: spin-slow 10s linear infinite; }
.lyt-slide-in  { animation: slide-in-left 0.35s ease forwards; }
.lyt-fade-in   { animation: fade-in 0.25s ease forwards; }

.lyt-font    { font-family: 'DM Sans', sans-serif; }
.lyt-display { font-family: 'Syne', sans-serif; }

.lyt-avatar-glow { animation: avatar-glow 2.5s ease-in-out infinite; }
.lyt-breadcrumb-in { animation: breadcrumb-in 0.3s ease forwards; }

.lyt-header-pill {
  background: rgba(255,255,255,0.9);
  border: 1px solid rgba(0,0,0,0.07);
  backdrop-filter: blur(8px);
  transition: all 0.2s ease;
}
.lyt-header-pill:hover {
  background: rgba(255,255,255,1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transform: translateY(-1px);
}

/* Avatar ring pulse */
.lyt-avatar-btn {
  position: relative;
  transition: transform 0.2s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease;
}
.lyt-avatar-btn:hover {
  transform: scale(1.08);
}
.lyt-avatar-btn::before {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 16px;
  background: conic-gradient(from 0deg, #f97316, #a855f7, #3b82f6, #f97316);
  animation: spin-slow 4s linear infinite;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.2s;
}
.lyt-avatar-btn:hover::before { opacity: 1; }

.lyt-dropdown-item {
  transition: background 0.15s, transform 0.15s;
}
.lyt-dropdown-item:hover {
  transform: translateX(2px);
}

.lyt-glass {
  background: rgba(255,255,255,0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.lyt-orb {
  border-radius: 50%;
  filter: blur(36px);
  position: absolute;
  pointer-events: none;
}

/* nav item hover */
.lyt-nav-item {
  position: relative;
  transition: all 0.2s cubic-bezier(.34,1.56,.64,1);
}
.lyt-nav-item:hover {
  transform: translateX(3px);
}

/* active nav indicator pulse */
@keyframes active-pulse {
  0%,100% { opacity: 1; }
  50%      { opacity: 0.6; }
}
`;

function StyleInjector() {
  useEffect(() => {
    if (document.getElementById('layout-styles')) return;
    const el = document.createElement('style');
    el.id = 'layout-styles';
    el.textContent = STYLES;
    document.head.appendChild(el);
  }, []);
  return null;
}

/* ── Role config ── */
function getRoleConfig(role) {
  return {
    admin:      { color: '#a855f7', bg: '#faf5ff', border: '#e9d5ff', grad: 'from-purple-500 to-purple-700', label: 'Admin' },
    owner:      { color: '#f97316', bg: '#fff7ed', border: '#fed7aa', grad: 'from-orange-400 to-orange-600', label: 'Owner' },
    technician: { color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', grad: 'from-blue-500 to-blue-700',    label: 'Technician' },
    staff:      { color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0', grad: 'from-emerald-500 to-emerald-700', label: 'Staff' },
  }[role] || { color: '#f97316', bg: '#fff7ed', border: '#fed7aa', grad: 'from-orange-400 to-orange-600', label: role || 'User' };
}

/* ── Nav icon colors ── */
const NAV_COLORS = {
  '/dashboard': { color: '#f97316', bg: '#fff7ed', border: '#fed7aa' },
  '/services':  { color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
  '/sales':     { color: '#a855f7', bg: '#faf5ff', border: '#e9d5ff' },
  '/history':   { color: '#06b6d4', bg: '#ecfeff', border: '#a5f3fc' },
  '/employees': { color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0' },
  '/reports':   { color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
  '/account':   { color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' },
};

export default function Layout({ children }) {
  const { profile, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setIsDropdownOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Close sidebar on route change
  useEffect(() => { setIsSidebarOpen(false); }, [pathname]);

  const navigation = [
    { name: 'Dashboard',   href: '/dashboard',  icon: LayoutDashboard },
    { name: 'Services',    href: '/services',   icon: Wrench },
    { name: 'Sales',       href: '/sales',      icon: ShoppingBag },
    { name: 'Past History',href: '/history',    icon: History },
    ...(profile?.role === 'admin' || profile?.role === 'owner' ? [
      { name: 'Employees', href: '/employees',  icon: Users },
      { name: 'Reports',   href: '/reports',    icon: BarChart3 },
    ] : []),
    { name: 'My Account',  href: '/account',    icon: UserCircle },
  ];

  async function handleLogout() {
    try {
      await authService.logout();
      logout();
      router.push('/login');
    } catch (err) { console.error('Logout failed:', err); }
  }

  const roleConfig = getRoleConfig(profile?.role);
  const initials = (profile?.full_name || profile?.name || 'U')
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const activePage = navigation.find(i => i.href === pathname)?.name || 'Orange Mobile';
  const activeNavColor = NAV_COLORS[pathname] || NAV_COLORS['/dashboard'];

  return (
    <>
      <StyleInjector />
      <div className="lyt-font flex min-h-screen" style={{ backgroundColor: '#fafafa' }}>

        {/* ════════════════════════════════════════
            DESKTOP SIDEBAR
        ════════════════════════════════════════ */}
        <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 z-30">
          {/* Sidebar background — dark gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800" />
          {/* Decorative orbs */}
          <div className="lyt-orb w-48 h-48 bg-orange-500/15 -top-12 -left-12 lyt-float" style={{ animationDelay: '0s' }} />
          <div className="lyt-orb w-36 h-36 bg-purple-500/12 top-1/2 -right-10 lyt-float" style={{ animationDelay: '1.5s' }} />
          <div className="lyt-orb w-32 h-32 bg-blue-500/10 bottom-12 -left-8 lyt-float" style={{ animationDelay: '0.8s' }} />
          {/* Spinning ring accent */}
          <div className="absolute bottom-24 right-4 h-12 w-12 rounded-full border border-dashed border-white/8 lyt-spin-slow" />

          <div className="relative flex flex-col h-full">
            {/* ── Brand ── */}
            <div className="flex items-center gap-3 px-5 py-5 border-b border-white/8">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-500/30">
                <span className="lyt-display text-sm font-bold text-white">O</span>
              </div>
              <div>
                <h1 className="lyt-display text-base font-bold">
                  <span className="lyt-shimmer-text">Orange Mobile</span>
                </h1>
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/30 mt-0.5">Service Center</p>
              </div>
            </div>

            {/* ── Nav ── */}
            <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
              {navigation.map((item, i) => {
                const isActive = pathname === item.href;
                const nc = NAV_COLORS[item.href] || NAV_COLORS['/dashboard'];
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'lyt-nav-item group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all overflow-hidden',
                      isActive
                        ? 'text-white'
                        : 'text-white/40 hover:text-white/90'
                    )}
                    style={isActive ? {
                      backgroundColor: nc.color + '20',
                      boxShadow: `0 8px 20px -6px ${nc.color}40`,
                    } : {}}
                  >
                    {/* Active Glint Effect */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 z-0 opacity-20"
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                        style={{
                          background: `linear-gradient(90deg, transparent, ${nc.color}, transparent)`,
                        }}
                      />
                    )}

                    {/* active left bar */}
                    {isActive && (
                      <motion.span 
                        layoutId="activeNavIndicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full z-10"
                        style={{ backgroundColor: nc.color }} 
                      />
                    )}

                    <div className={cn(
                      'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all',
                      isActive ? 'shadow-md scale-110' : 'group-hover:bg-white/8'
                    )}
                      style={isActive ? { backgroundColor: nc.color + '25', border: `1px solid ${nc.color}40` } : {}}>
                      <item.icon className="h-4 w-4 transition-colors"
                        style={{ color: isActive ? nc.color : undefined }}
                        strokeWidth={isActive ? 2.5 : 2} />
                    </div>

                    <span className={cn('relative z-10 flex-1 text-[13px]', isActive && 'lyt-display font-bold')}
                      style={isActive ? { color: '#fff' } : {}}>
                      {item.name}
                    </span>

                    {isActive && (
                      <motion.div
                        initial={{ x: -5, opacity: 0 }}
                        animate={{ x: 0, opacity: 0.6 }}
                      >
                        <ChevronRight className="h-3.5 w-3.5 shrink-0" style={{ color: nc.color }} />
                      </motion.div>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* ── User card at bottom ── */}
            <div className="px-3 pb-4 pt-3 border-t border-white/8">
              {/* Profile mini card */}
              <div className="relative overflow-hidden rounded-2xl p-3 mb-3"
                style={{ backgroundColor: roleConfig.color + '15', border: `1.5px solid ${roleConfig.color}25` }}>
                <div className="flex items-center gap-3">
                  <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white lyt-display text-sm font-bold shadow-md', roleConfig.grad)}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{profile?.full_name || profile?.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400 lyt-blink" />
                      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: roleConfig.color + 'cc' }}>
                        {roleConfig.label}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="lyt-nav-item group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-red-400/80 hover:text-red-300 transition-all"
                style={{ border: '1.5px solid transparent' }}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl group-hover:bg-red-500/15 transition-all">
                  <LogOut className="h-4 w-4" strokeWidth={2} />
                </div>
                <span className="text-[13px]">Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* ════════════════════════════════════════
            MOBILE SIDEBAR OVERLAY
        ════════════════════════════════════════ */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-md lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
              />

              {/* Drawer */}
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 z-50 w-72 flex flex-col lg:hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800" />
                {/* mesh background inside drawer */}
                <div className="absolute inset-0 opacity-30">
                  <div className="lyt-orb w-64 h-64 bg-orange-500/20 -top-20 -left-20" />
                  <div className="lyt-orb w-48 h-48 bg-purple-500/20 bottom-10 -right-10" />
                </div>

                <div className="relative flex flex-col h-full">
                  {/* Brand + close */}
                  <div className="flex items-center justify-between px-5 py-5 border-b border-white/8">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-500/30">
                        <span className="lyt-display text-sm font-bold text-white">O</span>
                      </div>
                      <div>
                        <h1 className="lyt-display text-base font-bold text-white">
                          <span className="lyt-shimmer-text">Orange Mobile</span>
                        </h1>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/30">Service Center</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsSidebarOpen(false)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-white/60 hover:text-white transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Nav */}
                  <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
                    {navigation.map((item, i) => {
                      const isActive = pathname === item.href;
                      const nc = NAV_COLORS[item.href] || NAV_COLORS['/dashboard'];
                      return (
                        <motion.div
                          key={item.name}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <Link
                            href={item.href}
                            className={cn(
                              'lyt-nav-item group relative flex items-center gap-4 rounded-2xl px-4 py-3.5 text-sm font-medium transition-all overflow-hidden',
                              isActive ? 'text-white' : 'text-white/40 hover:text-white/90'
                            )}
                            style={isActive ? {
                              backgroundColor: nc.color + '20',
                              boxShadow: `0 8px 30px -4px ${nc.color}40`,
                            } : {}}
                          >
                            {/* Glint */}
                            {isActive && (
                              <motion.div
                                className="absolute inset-0 z-0 opacity-20"
                                initial={{ x: '-100%' }}
                                animate={{ x: '100%' }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                                style={{
                                  background: `linear-gradient(90deg, transparent, white, transparent)`,
                                }}
                              />
                            )}

                            <div className={cn('relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all', isActive ? 'shadow-lg scale-110' : 'bg-white/5')}
                              style={isActive ? { backgroundColor: nc.color } : {}}>
                              <item.icon className="h-5 w-5" style={{ color: isActive ? '#fff' : undefined }} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className={cn('relative z-10 flex-1 text-sm', isActive && 'lyt-display font-black')} style={isActive ? { color: '#fff' } : {}}>
                              {item.name}
                            </span>
                            {isActive && <ChevronRight className="relative z-10 h-4 w-4 opacity-50 shrink-0" style={{ color: nc.color }} />}
                          </Link>
                        </motion.div>
                      );
                    })}
                  </nav>

                  {/* User + logout */}
                  <div className="px-4 pb-8 pt-4 border-t border-white/8">
                    <div className="relative overflow-hidden rounded-2xl p-4 mb-4"
                      style={{ backgroundColor: roleConfig.color + '15', border: `1px solid ${roleConfig.color}25` }}>
                      <div className="flex items-center gap-3">
                        <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white lyt-display text-base font-bold shadow-lg', roleConfig.grad)}>
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{profile?.full_name || profile?.name}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-400 lyt-blink" />
                            <p className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: roleConfig.color }}>
                              {roleConfig.label}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button onClick={handleLogout}
                      className="group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 group-hover:bg-red-500/20 transition-all">
                        <LogOut className="h-4 w-4" strokeWidth={2.5} />
                      </div>
                      <span>Logout Account</span>
                    </button>
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ════════════════════════════════════════
            MAIN CONTENT AREA
        ════════════════════════════════════════ */}
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden lg:pl-64">

          {/* ══════════════════════════════════════
              PREMIUM TOP HEADER
          ══════════════════════════════════════ */}
          <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between px-4 lg:px-6"
            style={{
              background: 'rgba(250,250,250,0.92)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(0,0,0,0.055)',
              boxShadow: '0 1px 24px rgba(0,0,0,0.04)',
            }}>

            {/* ── Left: hamburger + page identity ── */}
            <div className="flex items-center gap-3">

              {/* Mobile hamburger */}
              <button
                className="lg:hidden relative flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm border border-gray-100 transition-all hover:shadow-md active:scale-95"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="h-4 w-4 text-gray-600" />
              </button>

              {/* Divider — mobile only */}
              <div className="lg:hidden w-px h-6 bg-gray-200" />

              {/* Page identity pill */}
              <div className="lyt-breadcrumb-in flex items-center gap-2.5">
                {/* Icon bubble */}
                <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm"
                  style={{
                    background: `linear-gradient(135deg, ${activeNavColor.color}22, ${activeNavColor.color}10)`,
                    border: `1.5px solid ${activeNavColor.color}35`,
                  }}>
                  {/* top-left corner accent */}
                  <div className="absolute top-0 left-0 w-2 h-2 rounded-tl-xl rounded-br-xl opacity-60"
                    style={{ backgroundColor: activeNavColor.color + '40' }} />
                  {(() => {
                    const NavIcon = navigation.find(n => n.href === pathname)?.icon || LayoutDashboard;
                    return <NavIcon className="h-4 w-4 relative z-10" style={{ color: activeNavColor.color }} strokeWidth={2.5} />;
                  })()}
                </div>

                {/* Title + subtle sub-label */}
                <div>
                  <h2 className="lyt-display text-[15px] font-bold text-gray-900 leading-tight">{activePage}</h2>
                  <p className="hidden sm:block text-[9px] font-semibold uppercase tracking-[0.18em] text-gray-400 mt-px">
                    Orange Mobile · Service Center
                  </p>
                </div>

                {/* Accent line under title */}
                <div className="hidden lg:block h-6 w-px bg-gray-200 mx-1" />

                {/* Live chip — visible desktop */}
                <div className="hidden lg:flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
                  style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a' }}>
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 lyt-blink" />
                  Live
                </div>
              </div>
            </div>

            {/* ── Right: info + avatar ── */}
            <div className="flex items-center gap-2.5">

              {/* Name + role pill — desktop */}
              <div className="hidden md:flex items-center gap-2 lyt-header-pill rounded-2xl px-4 py-2">
                {/* Role color dot */}
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: roleConfig.color }} />
                <div className="text-right">
                  <p className="lyt-display text-[13px] font-bold text-gray-900 leading-tight truncate max-w-[120px]">
                    {profile?.full_name || profile?.name}
                  </p>
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.16em]" style={{ color: roleConfig.color }}>
                    {roleConfig.label}
                  </p>
                </div>
              </div>

              {/* Avatar + dropdown */}
              <div className="relative" ref={dropdownRef}>
                {/* Avatar button */}
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="lyt-avatar-btn relative flex h-10 w-10 items-center justify-center rounded-[14px] text-white lyt-display text-sm font-bold shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${roleConfig.color}, ${roleConfig.color}cc)`,
                    boxShadow: `0 4px 14px ${roleConfig.color}45`,
                  }}
                >
                  {/* Spinning conic gradient ring on hover (CSS ::before handles it) */}
                  {/* Inner white inset */}
                  <span className="relative z-10">{initials}</span>

                  {/* Online dot */}
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-green-400 lyt-blink" />
                  </span>

                  {/* Dropdown open indicator */}
                  {isDropdownOpen && (
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-orange-400 border-2 border-white"
                      style={{ animation: 'notif-pop 0.2s ease forwards' }} />
                  )}
                </button>

                {/* ── Dropdown ── */}
                {isDropdownOpen && (
                  <div className="lyt-fade-in absolute right-0 top-[52px] z-50 w-60 overflow-hidden rounded-3xl shadow-2xl"
                    style={{ border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 24px 48px -8px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04)' }}>

                    {/* Header — dark gradient matching sidebar */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 px-5 py-4">
                      {/* orbs */}
                      <div className="lyt-orb w-24 h-24 -top-8 -right-8" style={{ backgroundColor: roleConfig.color + '30' }} />
                      <div className="lyt-orb w-16 h-16 -bottom-6 left-2" style={{ backgroundColor: '#a855f730' }} />

                      <div className="relative flex items-center gap-3">
                        {/* Large avatar in dropdown */}
                        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white lyt-display text-base font-bold shadow-xl"
                          style={{
                            background: `linear-gradient(135deg, ${roleConfig.color}, ${roleConfig.color}aa)`,
                            boxShadow: `0 6px 20px ${roleConfig.color}50`,
                          }}>
                          {initials}
                          <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gray-900 border border-gray-700">
                            <span className="h-2 w-2 rounded-full bg-green-400 lyt-blink" />
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="lyt-display text-sm font-bold text-white truncate">
                            {profile?.full_name || profile?.name}
                          </p>
                          {/* Role badge */}
                          <div className="mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5"
                            style={{ backgroundColor: roleConfig.color + '25', border: `1px solid ${roleConfig.color}40` }}>
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: roleConfig.color }} />
                            <span className="text-[9px] font-extrabold uppercase tracking-widest" style={{ color: roleConfig.color }}>
                              {roleConfig.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="bg-white py-1.5">
                      <Link
                        href="/account"
                        onClick={() => setIsDropdownOpen(false)}
                        className="lyt-dropdown-item flex items-center gap-3 mx-2 my-0.5 rounded-2xl px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-purple-50 transition-all"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-sm"
                          style={{ backgroundColor: '#faf5ff', border: '1.5px solid #e9d5ff' }}>
                          <UserCircle className="h-4 w-4 text-purple-500" strokeWidth={2} />
                        </div>
                        <span>My Account</span>
                        <ChevronRight className="h-3.5 w-3.5 ml-auto text-gray-300" />
                      </Link>

                      <div className="mx-3 my-1.5 h-px bg-gray-100" />

                      <button
                        onClick={() => { setIsDropdownOpen(false); handleLogout(); }}
                        className="lyt-dropdown-item flex w-full items-center gap-3 mx-2 my-0.5 rounded-2xl px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-all"
                        style={{ width: 'calc(100% - 16px)' }}
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-sm"
                          style={{ backgroundColor: '#fef2f2', border: '1.5px solid #fecaca' }}>
                          <LogOut className="h-4 w-4 text-red-500" strokeWidth={2} />
                        </div>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* ── Page Content ── */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
