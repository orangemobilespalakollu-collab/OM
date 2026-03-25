'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { employeeService } from '@/services/employeeService';
import { useAuth } from '@/components/AuthProvider';
import { 
  Plus, 
  Smartphone, 
  User, 
  Lock, 
  RefreshCw, 
  XCircle,
  History,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function EmployeesPage() {
  const router = useRouter();
  const { profile: adminProfile } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [view, setView] = useState('list');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (adminProfile?.role === 'admin') {
      fetchEmployees();
    }
  }, [adminProfile]);

  async function fetchEmployees() {
    try {
      setLoading(true);
      const data = await employeeService.getEmployees();
      setEmployees(data);
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  }

  if (adminProfile?.role !== 'admin') {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
        <Lock className="mb-4 h-12 w-12 text-red-500" />
        <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
        <p className="text-gray-500">Only administrators can manage employees.</p>
      </div>
    );
  }

  if (view === 'register') return <RegisterEmployee onCancel={() => setView('list')} onComplete={() => { setView('list'); fetchEmployees(); }} />;
  if (view === 'details' && selectedEmployee) return <EmployeeDetails employee={selectedEmployee} onBack={() => setView('list')} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Manage Employees</h2>
        <button 
          onClick={() => setView('register')}
          className="flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 font-bold text-white transition-colors hover:bg-orange-700"
        >
          <Plus className="h-5 w-5" />
          Add Employee
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-32 animate-pulse rounded-2xl bg-gray-200"></div>)
        ) : employees.length > 0 ? (
          employees.map((emp) => (
            <div 
              key={emp.id}
              onClick={() => { setSelectedEmployee(emp); setView('details'); }}
              className="cursor-pointer rounded-2xl bg-white p-6 shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{emp.full_name}</h4>
                  <p className="text-sm text-gray-500">{emp.mobile}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
            <User className="h-16 w-16 opacity-20" />
            <p className="mt-4 font-medium">No employees registered yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

function RegisterEmployee({ onCancel, onComplete }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    mobile: '',
    name: '',
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const { defaultPassword } = await employeeService.registerEmployee(formData);
      toast.success(`Employee registered! Default password: ${defaultPassword}`);
      onComplete();
    } catch (err) {
      toast.error(err.message || 'Failed to register employee');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-md mx-auto max-w-md">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Register Employee</h2>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <XCircle className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl bg-white p-8 shadow-sm">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Mobile Number</label>
          <div className="relative">
            <Smartphone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="tel"
              required
              maxLength={10}
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 focus:border-orange-500 focus:outline-none"
              placeholder="10 Digit Mobile Number"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Name</label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              required
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 focus:border-orange-500 focus:outline-none"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
        </div>

        <div className="rounded-lg bg-blue-50 p-4 text-xs text-blue-700">
          <p className="font-bold">Note:</p>
          <p>A default password will be assigned automatically. The employee will be forced to change it on first login.</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-orange-600 py-3 font-bold text-white transition-colors hover:bg-orange-700 disabled:opacity-50"
        >
          {loading ? 'Registering...' : 'Register Employee'}
        </button>
      </form>
    </div>
  );
}

function EmployeeDetails({ employee, onBack }) {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchActivity();
  }, [employee.id]);

  async function fetchActivity() {
    try {
      const data = await employeeService.getEmployeeActivity(employee.id);
      setActivity(data);
    } catch (err) {
      console.error('Error fetching activity:', err);
    }
  }

  async function handleResetPassword() {
    try {
      setLoading(true);
      const { defaultPassword } = await employeeService.resetPassword(employee.id, employee.mobile);
      toast.success(`Password reset! New default password: ${defaultPassword}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="rounded-full bg-white p-2 shadow-sm">
          <History className="h-6 w-6 rotate-180" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Employee Details</h2>
      </div>

      <div className="rounded-2xl bg-white p-8 shadow-sm space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 text-orange-600">
              <User className="h-10 w-10" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{employee.full_name}</h3>
              <p className="text-gray-500">{employee.mobile}</p>
            </div>
          </div>
          <button
            onClick={handleResetPassword}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-bold text-orange-600 hover:bg-orange-100"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Reset Password
          </button>
        </div>

        <div className="border-t pt-8">
          <h4 className="mb-6 flex items-center gap-2 font-bold text-gray-900">
            <Clock className="h-5 w-5 text-orange-600" />
            Recent Activity
          </h4>
          <div className="space-y-4">
            {activity.length > 0 ? activity.map((act, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
                <div>
                  <p className="text-sm font-bold text-gray-900">{act.services?.customer_name}</p>
                  <p className="text-xs text-gray-500">{act.services?.device_model} - Status: {act.status}</p>
                </div>
                <span className="text-xs text-gray-400">{new Date(act.created_at).toLocaleDateString()}</span>
              </div>
            )) : (
              <p className="text-center py-8 text-gray-400">No recent activity found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
