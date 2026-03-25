'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { getCookie, setCookie, deleteCookie } from '@/lib/utils';
import { toast } from 'sonner';
import { Smartphone, Lock, User, ShieldCheck } from 'lucide-react';

export default function RegisterAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const DRAFT_COOKIE_KEY = 'registerAdminDraft';
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });
  const isReloadRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const draft = getCookie(DRAFT_COOKIE_KEY);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed?.formData) setFormData((prev) => ({ ...prev, ...parsed.formData }));
      } catch (error) {
        console.error('Error parsing register admin draft cookie', error);
      }
    }

    const handleBeforeUnload = () => sessionStorage.setItem('registerAdminIsReload', '1');
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      const isReload = sessionStorage.getItem('registerAdminIsReload') === '1';
      if (isReload) {
        isReloadRef.current = true;
        sessionStorage.removeItem('registerAdminIsReload');
      }

      if (!isReload) {
        deleteCookie(DRAFT_COOKIE_KEY);
      }
    };
  }, []);

  useEffect(() => {
    setCookie(DRAFT_COOKIE_KEY, JSON.stringify({ formData }), 7);
  }, [formData]);

  async function handleRegister(e) {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    if (formData.password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setLoading(true);

    try {
      await authService.registerAdmin(formData.mobile, formData.password, formData.name);
      toast.success('Admin registered successfully!');
      deleteCookie(DRAFT_COOKIE_KEY);
      router.push('/login');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Initial Setup</h1>
          <p className="mt-2 text-gray-500">Create the first administrator account</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                required
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="Admin Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Mobile Number</label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                required
                maxLength={10}
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="Mobile Number"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="password"
                required
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="password"
                required
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-orange-600 py-3 font-semibold text-white transition-colors hover:bg-orange-700 disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Register Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}
