'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { authService } from '@/services/authService';
import { getCookie, setCookie, deleteCookie } from '@/lib/utils';
import { toast } from 'sonner';
import { Smartphone, Lock, UserCircle, Users } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState('admin');
  const DRAFT_COOKIE_KEY = 'loginDraft';
  const [formData, setFormData] = useState({
    mobile: '',
    password: '',
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
        console.error('Error parsing login draft cookie', error);
      }
    }

    const handleBeforeUnload = () => sessionStorage.setItem('loginIsReload', '1');
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      const isReload = sessionStorage.getItem('loginIsReload') === '1';
      if (isReload) {
        isReloadRef.current = true;
        sessionStorage.removeItem('loginIsReload');
      }

      if (!isReload) {
        deleteCookie(DRAFT_COOKIE_KEY);
      }
    };
  }, []);

  useEffect(() => {
    setCookie(DRAFT_COOKIE_KEY, JSON.stringify({ formData, loginType }), 7);
  }, [formData, loginType]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const { profile } = await authService.login(formData.mobile, formData.password, loginType);
      
      login(profile);
      toast.success('Login successful!');
      deleteCookie(DRAFT_COOKIE_KEY);
      
      if (profile.is_first_login) {
        router.push('/account?forceChange=true');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-orange-600">Orange Mobile</h1>
          <p className="mt-2 text-gray-500">Login to your account</p>
        </div>

        <div className="flex rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setLoginType('admin')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all ${
              loginType === 'admin' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <UserCircle className="h-4 w-4" />
            Admin
          </button>
          <button
            onClick={() => setLoginType('employee')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all ${
              loginType === 'employee' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="h-4 w-4" />
            Employee
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-orange-600 py-3 font-semibold text-white transition-colors hover:bg-orange-700 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
