'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [hasAdmin, setHasAdmin] = useState(null);
  const [isConfigMissing, setIsConfigMissing] = useState(false);

  console.log('RootPage state:', { user, loading, hasAdmin, isConfigMissing });

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    console.log('Supabase Config Check:', { 
      hasUrl: !!url, 
      urlPrefix: url?.substring(0, 10),
      hasKey: !!key,
      keyPrefix: key?.substring(0, 10)
    });

    if (!url || !key) {
      setIsConfigMissing(true);
      return;
    }
    checkAdmin();
  }, []);

  async function checkAdmin() {
    console.log('Checking for admin user...');
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin');

      if (error) {
        console.error('Supabase error checking admin:', error);
        throw error;
      }
      console.log('Admin count:', count);
      setHasAdmin(count !== null && count > 0);
    } catch (err) {
      console.error('Error checking admin:', err);
      setHasAdmin(false);
    }
  }

  useEffect(() => {
    if (loading || hasAdmin === null || isConfigMissing) return;

    if (!hasAdmin) {
      router.replace('/register-admin');
    } else if (!user) {
      router.replace('/login');
    } else {
      router.replace('/dashboard');
    }
  }, [user, loading, hasAdmin, router, isConfigMissing]);

  if (isConfigMissing) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <div className="max-w-md space-y-4 rounded-2xl bg-white p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-red-600">Configuration Required</h1>
          <p className="text-gray-600">
            Please add your Supabase credentials to the environment variables:
          </p>
          <div className="rounded-lg bg-gray-100 p-4 text-left font-mono text-sm">
            <p>NEXT_PUBLIC_SUPABASE_URL</p>
            <p>NEXT_PUBLIC_SUPABASE_ANON_KEY</p>
          </div>
          <p className="text-sm text-gray-500">
            Once added, the application will automatically connect.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
    </div>
  );
}
