'use client';

import { useState } from 'react';
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
  History
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Layout({ children }) {
  const { profile, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Services', href: '/services', icon: Wrench },
    { name: 'Sales', href: '/sales', icon: ShoppingBag },
    { name: 'Past History', href: '/history', icon: History },
    ...(profile?.role === 'admin' ? [
      { name: 'Employees', href: '/employees', icon: Users },
      { name: 'Reports', href: '/reports', icon: BarChart3 },
    ] : []),
    { name: 'My Account', href: '/account', icon: UserCircle },
  ];

  async function handleLogout() {
    try {
      await authService.logout();
      logout();
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  }

  const activePage = navigation.find(item => item.href === pathname)?.name || 'Orange Mobile';

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar for Desktop */}
      <aside className="hidden w-64 flex-col bg-white shadow-lg lg:flex">
        <div className="flex h-16 items-center border-b px-6">
          <h1 className="text-xl font-bold text-orange-600">Orange Mobile</h1>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-orange-50 text-orange-600"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="border-t p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      <div className={cn(
        "fixed inset-0 z-50 bg-black/50 transition-opacity lg:hidden",
        isSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
      )} onClick={() => setIsSidebarOpen(false)} />
      
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform lg:hidden",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center justify-between border-b px-6">
          <h1 className="text-xl font-bold text-orange-600">Orange Mobile</h1>
          <button onClick={() => setIsSidebarOpen(false)}>
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-orange-50 text-orange-600"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button className="lg:hidden" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="h-6 w-6 text-gray-500" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">{activePage}</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right lg:block">
              <p className="text-sm font-medium text-gray-900">{profile?.full_name}</p>
              <p className="text-xs text-gray-500 capitalize">{profile?.role}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
              <UserCircle className="h-6 w-6" />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
