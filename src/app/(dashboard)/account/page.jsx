'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { 
  User, 
  Smartphone, 
  Shield, 
  Lock, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function AccountPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { profile, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState(
    searchParams.get('forceChange') === 'true' ? 'password' : 'info'
  );

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  async function handleLogout() {
    logout();
    router.push('/login');
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      return toast.error('New passwords do not match');
    }

    if (passwordData.current !== profile?.password) {
      return toast.error('Current password is incorrect');
    }

    setLoading(true);
    try {
      // Update profile in the database
      const { error } = await supabase
        .from('profiles')
        .update({ 
          password: passwordData.new,
          is_first_login: false 
        })
        .eq('id', profile?.id);

      if (error) throw error;

      toast.success('Password updated successfully! Please login again.');
      handleLogout();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Account</h2>
        {view === 'password' && searchParams.get('forceChange') !== 'true' && (
          <button onClick={() => setView('info')} className="text-sm font-bold text-orange-600">Back to Info</button>
        )}
      </div>

      {view === 'info' ? (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-8 shadow-sm space-y-8">
            <div className="flex items-center gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <User className="h-10 w-10" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{profile?.full_name}</h3>
                <p className="text-gray-500 capitalize">{profile?.role}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 border-t pt-8">
              <AccountField label="Name" value={profile?.full_name || ''} icon={User} />
              <AccountField label="Mobile Number" value={profile?.mobile || ''} icon={Smartphone} />
              <AccountField label="Role" value={profile?.role || ''} icon={Shield} />
            </div>

            <div className="space-y-3 border-t pt-8">
              <button
                onClick={() => setView('password')}
                className="flex w-full items-center justify-between rounded-xl border border-gray-200 p-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-gray-400" />
                  <span className="font-bold text-gray-700">Change Password</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-300" />
              </button>
              
              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-between rounded-xl border border-red-100 bg-red-50 p-4 transition-colors hover:bg-red-100"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="h-5 w-5 text-red-600" />
                  <span className="font-bold text-red-600">Logout</span>
                </div>
                <ChevronRight className="h-5 w-5 text-red-300" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-8 shadow-sm space-y-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-orange-600">
              <Lock className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Update Password</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchParams.get('forceChange') === 'true' 
                ? 'You must change your default password before continuing.' 
                : 'Enter your current and new password below.'}
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Current Password</label>
              <input
                type="password"
                required
                className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-orange-500 focus:outline-none"
                value={passwordData.current}
                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                required
                className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-orange-500 focus:outline-none"
                value={passwordData.new}
                onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
              <input
                type="password"
                required
                className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-orange-500 focus:outline-none"
                value={passwordData.confirm}
                onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-orange-600 py-4 font-bold text-white shadow-lg transition-all hover:bg-orange-700 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function AccountField({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center gap-4">
      <div className="rounded-lg bg-gray-50 p-2">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
