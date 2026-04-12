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
  Clock,
  ArrowLeft,
  Users,
  KeyRound,
  Zap,
  Activity,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import { PageTransition, MagicalGrid, ScaleIn } from '@/components/MotionWrappers';

/* ─── Styles ─── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}
@keyframes float {
  0%,100% { transform: translateY(0px); }
  50%      { transform: translateY(-6px); }
}
@keyframes slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes blink {
  0%,100% { opacity: 1; }
  50%      { opacity: 0.3; }
}
@keyframes count-in {
  from { opacity: 0; transform: scale(0.5); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes pulse-ring {
  0%   { transform: scale(0.8); opacity: 0.8; }
  70%  { transform: scale(1.6); opacity: 0; }
  100% { transform: scale(1.6); opacity: 0; }
}

.em-slide-up  { animation: slide-up 0.45s ease forwards; }
.em-float     { animation: float 3s ease-in-out infinite; }
.em-spin-slow { animation: spin-slow 8s linear infinite; }
.em-blink     { animation: blink 2s ease-in-out infinite; }
.em-count-in  { animation: count-in 0.4s cubic-bezier(.34,1.56,.64,1) forwards; }

.em-shimmer-text {
  background: linear-gradient(90deg, #f97316, #a855f7, #3b82f6, #f97316);
  background-size: 300% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 4s linear infinite;
}

.em-glass {
  background: rgba(255,255,255,0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.9);
}

.em-mesh {
  background-color: transparent;
}

.em-card-hover {
  transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), box-shadow 0.25s ease, border-color 0.2s;
}
.em-card-hover:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: 0 20px 40px -10px rgba(0,0,0,0.12);
}

.em-orb {
  border-radius: 50%;
  filter: blur(40px);
  position: absolute;
  pointer-events: none;
}

.em-font    { font-family: 'DM Sans', sans-serif; }
.em-display { font-family: 'Syne', sans-serif; }

.em-input {
  width: 100%;
  background: transparent;
  font-size: 0.875rem;
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  color: #111827;
  outline: none;
  border: none;
}
.em-input::placeholder { color: #d1d5db; font-weight: 500; }
`;

function StyleInjector() {
  useEffect(() => {
    if (document.getElementById('em-styles')) return;
    const el = document.createElement('style');
    el.id = 'em-styles';
    el.textContent = STYLES;
    document.head.appendChild(el);
  }, []);
  return null;
}

function SectionLabel({ icon: Icon, label }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-orange-400 to-purple-500 shadow-sm">
        <Icon className="h-3 w-3 text-white" strokeWidth={2.5} />
      </div>
      <h3 className="em-font text-sm font-semibold text-gray-700">{label}</h3>
      <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
    </div>
  );
}

/* ── Initials avatar ── */
function Avatar({ name, size = 'md', color = '#f97316' }) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const dims = size === 'lg' ? 'h-16 w-16 text-2xl' : size === 'sm' ? 'h-9 w-9 text-xs' : 'h-12 w-12 text-sm';
  return (
    <div className={`em-display flex shrink-0 items-center justify-center rounded-2xl font-bold text-white shadow-lg ${dims}`}
      style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)` }}>
      {initials}
    </div>
  );
}

function StatusDot() {
  return (
    <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-green-500 border-2 border-white ring-2 ring-green-100 ring-offset-0">
      <span className="h-1.5 w-1.5 rounded-full bg-white opacity-40 animate-pulse" />
    </span>
  );
}

/* ─── Main Page ─── */
export default function EmployeesPage() {
  const { profile: adminProfile } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' | 'register' | 'details'
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (adminProfile?.role === 'admin' || adminProfile?.role === 'owner') fetchEmployees();
  }, [adminProfile]);

  async function fetchEmployees() {
    try {
      setLoading(true);
      const data = await employeeService.getEmployees();
      setEmployees(data);
    } catch (err) {
      console.error('Error fetching employees:', err);
      toast.error('Failed to load employee list');
    } finally {
      setLoading(false);
    }
  }

  const EMP_COLORS = ['#f97316', '#a855f7', '#3b82f6', '#10b981', '#f43f5e', '#f59e0b'];
  const EMP_GRADS = [
    'gradient-orange', 'gradient-purple', 'gradient-blue', 'gradient-emerald', 'gradient-red', 'gradient-amber'
  ];

  if (adminProfile?.role !== 'admin' && adminProfile?.role !== 'owner') {
    return (
      <PageTransition>
        <StyleInjector />
        <div className="em-mesh em-font flex min-h-[500px] flex-col items-center justify-center gap-5 rounded-3xl p-8 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-red-400 to-red-600 shadow-2xl shadow-red-200">
            <Lock className="h-9 w-9 text-white" />
          </div>
          <div>
            <h2 className="em-display text-2xl font-bold text-gray-900">Access Denied</h2>
            <p className="mt-1 text-sm text-gray-500">Only administrators can manage employees.</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (view === 'register') return <RegisterEmployee onCancel={() => setView('list')} onComplete={() => { setView('list'); fetchEmployees(); }} />;
  if (view === 'details' && selectedEmployee) return <EmployeeDetails employee={selectedEmployee} color={EMP_COLORS[selectedIndex % EMP_COLORS.length]} onBack={() => setView('list')} />;

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <PageTransition>
      <StyleInjector />
      <div className="em-mesh em-font min-h-screen space-y-8 p-1">

        {/* Hero Header */}
        <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-7 shadow-2xl">
          <div className="em-orb w-64 h-64 bg-orange-500/20 -top-16 -left-16 em-float" style={{ animationDelay: '0s' }} />
          <div className="em-orb w-48 h-48 bg-purple-500/20 -bottom-12 right-10 em-float" style={{ animationDelay: '1.2s' }} />
          <div className="absolute right-6 top-6 h-20 w-20 rounded-full border-2 border-dashed border-white/10 em-spin-slow" />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40 mb-1">Company Directory</p>
              <h1 className="em-display text-2xl sm:text-3xl font-bold text-white mb-1">
                <span className="em-shimmer-text">Our Team</span> 👥
              </h1>
              <p className="text-sm text-white/50">Manage your staff and their permissions.</p>
            </div>
            <button
              onClick={() => setView('register')}
              className="em-card-hover group flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-orange-400 to-purple-500 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
              Add Member
            </button>
          </div>
        </header>

        {/* Team Grid */}
        <section>
          <SectionLabel icon={Users} label="Active Members" />
          {employees.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50">
              <Users className="h-8 w-8 text-gray-300" />
              <p className="text-sm font-semibold text-gray-400">No employees registered yet.</p>
              <button
                onClick={() => setView('register')}
                className="mt-2 text-xs font-bold text-orange-500 underline"
              >
                Register your first member
              </button>
            </div>
          ) : (
            <MagicalGrid className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {employees.map((emp, i) => {
                const color = EMP_COLORS[i % EMP_COLORS.length];
                const gradClass = EMP_GRADS[i % EMP_GRADS.length];
                return (
                  <ScaleIn key={emp.id} delay={i * 0.05}>
                    <button
                      onClick={() => { setSelectedEmployee(emp); setSelectedIndex(i); setView('details'); }}
                      className={`em-card-hover group relative overflow-hidden rounded-2xl border border-white/80 p-5 text-left shadow-md ${gradClass}`}
                      style={{ boxShadow: `0 4px 20px ${color}22` }}
                    >
                      {/* top accent */}
                      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                        style={{ background: `linear-gradient(90deg, ${color}80, ${color}20)` }} />
                      {/* glow blob */}
                      <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full blur-2xl opacity-20"
                        style={{ backgroundColor: color }} />

                      <div className="flex items-center gap-4 mb-4">
                        <div className="relative">
                          <Avatar name={emp.full_name} color={color} />
                          <span className="absolute -bottom-0.5 -right-0.5">
                            <StatusDot />
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="em-display text-sm font-bold text-gray-900 truncate">{emp.full_name}</p>
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{emp.mobile}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest"
                          style={{ backgroundColor: color + '15', borderColor: color + '30', color }}>
                          <Shield className="h-2.5 w-2.5" />
                          Staff
                        </span>
                        <div className="flex h-7 w-7 items-center justify-center rounded-xl transition-transform group-hover:translate-x-0.5"
                          style={{ backgroundColor: color + '12' }}>
                          <ChevronRight className="h-3.5 w-3.5" style={{ color }} />
                        </div>
                      </div>
                    </button>
                  </ScaleIn>
                );
              })}
            </MagicalGrid>
          )}
        </section>
      </div>
    </PageTransition>
  );
}

/* ─── Register Employee ─── */
function RegisterEmployee({ onCancel, onComplete }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ mobile: '', name: '' });
  const [done, setDone] = useState(null); // stores defaultPassword on success

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { defaultPassword } = await employeeService.registerEmployee(formData);
      setDone(defaultPassword);
      toast.success(`Employee registered! Default password: ${defaultPassword}`);
    } catch (err) {
      toast.error(err.message || 'Failed to register employee');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageTransition>
      <StyleInjector />
      <div className="em-mesh em-font min-h-screen space-y-8 p-1">

        {/* Hero */}
        <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-7 shadow-2xl">
          <div className="em-orb w-56 h-56 bg-orange-500/20 -top-16 -left-16 em-float" style={{ animationDelay: '0s' }} />
          <div className="em-orb w-40 h-40 bg-purple-500/20 -bottom-10 right-8 em-float" style={{ animationDelay: '1s' }} />
          <div className="absolute right-6 top-6 h-16 w-16 rounded-full border-2 border-dashed border-white/10 em-spin-slow" />

          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button onClick={onCancel}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 transition text-white">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40 mb-0.5">Team Management</p>
                <h1 className="em-display text-xl sm:text-2xl font-bold text-white">
                  <span className="em-shimmer-text">Register Employee</span>
                </h1>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-md">

          {done ? (
            /* ── Success state ── */
            <div className="em-glass rounded-3xl overflow-hidden shadow-xl em-slide-up">
              <div className="relative overflow-hidden bg-gradient-to-br from-green-600 to-emerald-700 px-6 py-8 text-center">
                <div className="em-orb w-32 h-32 bg-white/10 -top-8 -right-8" />
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 shadow-lg">
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </div>
                <h3 className="em-display text-xl font-bold text-white">Employee Registered!</h3>
                <p className="text-sm text-white/70 mt-1">Share the credentials below with the employee.</p>
              </div>
              <div className="p-6 bg-white space-y-4">
                <div className="rounded-2xl border-2 border-orange-200 bg-orange-50 p-5 text-center">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-orange-400 mb-1">Default Password</p>
                  <p className="em-display text-3xl font-bold text-orange-600 tracking-widest">{done}</p>
                  <p className="text-xs text-orange-400/80 mt-1">Employee must change this on first login</p>
                </div>
                <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-4 text-xs text-blue-700 flex gap-3 items-start">
                  <Shield className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
                  <p>The employee will be prompted to change their password immediately after their first login for security.</p>
                </div>
                <button onClick={onComplete}
                  className="em-card-hover w-full rounded-2xl py-4 font-bold text-white shadow-lg transition-all"
                  style={{ background: 'linear-gradient(135deg, #f97316, #a855f7)', boxShadow: '0 8px 24px rgba(249,115,22,0.3)' }}>
                  <span className="em-display text-sm tracking-wide">Done — Back to Employees</span>
                </button>
              </div>
            </div>
          ) : (
            /* ── Form ── */
            <div className="em-glass rounded-3xl overflow-hidden shadow-xl em-slide-up">
              {/* modal header */}
              <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 px-6 py-5">
                <div className="em-orb w-28 h-28 bg-orange-500/20 -top-6 -right-6" />
                <div className="em-orb w-20 h-20 bg-purple-500/20 -bottom-6 left-4" />
                <div className="relative flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-purple-500 shadow-lg">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/40 mb-0.5">New Member</p>
                    <h3 className="em-display text-base font-bold text-white">Employee Details</h3>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 bg-white space-y-4">

                {/* Mobile */}
                <FormField
                  label="Mobile Number"
                  icon={Smartphone}
                  color="#3b82f6"
                  bg="#eff6ff"
                  border="#bfdbfe"
                >
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    className="em-input"
                    placeholder="10-digit mobile number"
                    value={formData.mobile}
                    onChange={e => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                  />
                </FormField>

                {/* Name */}
                <FormField
                  label="Full Name"
                  icon={User}
                  color="#a855f7"
                  bg="#faf5ff"
                  border="#e9d5ff"
                >
                  <input
                    type="text"
                    required
                    className="em-input"
                    placeholder="Employee full name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </FormField>

                {/* Info note */}
                <div className="flex items-start gap-3 rounded-2xl border-2 border-blue-200 bg-blue-50 p-4">
                  <Shield className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wide text-blue-600 mb-0.5">Auto Password</p>
                    <p className="text-xs text-blue-600/80">A secure default password is auto-generated. The employee must change it on first login.</p>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="em-card-hover relative w-full overflow-hidden rounded-2xl py-4 font-bold text-white shadow-lg transition-all disabled:opacity-50"
                  style={{ background: loading ? '#9ca3af' : 'linear-gradient(135deg, #f97316, #a855f7)', boxShadow: loading ? 'none' : '0 8px 24px rgba(249,115,22,0.3)' }}
                >
                  <span className="em-display text-sm tracking-wide relative">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        Registering…
                      </span>
                    ) : 'Register Employee'}
                  </span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

/* ─── Employee Details ─── */
function EmployeeDetails({ employee, color, onBack }) {
  const [activity, setActivity] = useState([]);
  const [actLoading, setActLoading] = useState(true);
  const [resetLoading, setResetLoading] = useState(false);
  const [newPassword, setNewPassword] = useState(null);

  useEffect(() => { fetchActivity(); }, [employee.id]);

  async function fetchActivity() {
    try {
      setActLoading(true);
      const data = await employeeService.getEmployeeActivity(employee.id);
      setActivity(data);
    } catch (err) { console.error(err); }
    finally { setActLoading(false); }
  }

  async function handleResetPassword() {
    try {
      setResetLoading(true);
      setNewPassword(null);
      const { defaultPassword } = await employeeService.resetPassword(employee.id, employee.mobile);
      setNewPassword(defaultPassword);
      toast.success(`Password reset! New default: ${defaultPassword}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setResetLoading(false);
    }
  }

  const statusStyles = {
    Received:          { dot: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' },
    'In Progress':     { dot: '#f97316', bg: '#fff7ed', border: '#fed7aa', text: '#c2410c' },
    'Waiting for Parts':{ dot: '#f59e0b', bg: '#fffbeb', border: '#fde68a', text: '#b45309' },
    Completed:         { dot: '#10b981', bg: '#f0fdf4', border: '#bbf7d0', text: '#047857' },
    Returned:          { dot: '#22c55e', bg: '#f0fdf4', border: '#86efac', text: '#15803d' },
  };

  return (
    <PageTransition>
      <StyleInjector />
      <div className="em-mesh em-font min-h-screen space-y-8 p-1">

        {/* Hero */}
        <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-7 shadow-2xl">
          <div className="em-orb w-56 h-56 em-float" style={{ backgroundColor: color + '22', animationDelay: '0s' }} />
          <div className="em-orb w-40 h-40 bg-purple-500/15 -bottom-10 right-8 em-float" style={{ animationDelay: '1.2s' }} />
          <div className="absolute right-6 top-6 h-16 w-16 rounded-full border-2 border-dashed border-white/10 em-spin-slow" />

          <div className="relative flex items-center gap-5">
            <button onClick={onBack}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 transition text-white">
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="relative shrink-0">
              <Avatar name={employee.full_name} size="lg" color={color} />
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-400 border-2 border-gray-900">
                <span className="h-2 w-2 rounded-full bg-white em-blink" />
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40 mb-0.5">Employee</p>
              <h1 className="em-display text-xl sm:text-2xl font-bold text-white truncate">
                <span style={{ color, filter: 'brightness(1.4)' }}>{employee.full_name}</span>
              </h1>
              <p className="text-sm text-white/50 mt-0.5">{employee.mobile}</p>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-2xl space-y-8">

          {/* ── Info Cards ── */}
          <section className="em-slide-up">
            <SectionLabel icon={User} label="Employee Info" />
            <div className="space-y-3">
              {[
                { label: 'Full Name', value: employee.full_name, icon: User, color: color, bg: color + '12', border: color + '30' },
                { label: 'Mobile', value: employee.mobile, icon: Smartphone, color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
                { label: 'Role', value: 'Staff', icon: Shield, color: '#a855f7', bg: '#faf5ff', border: '#e9d5ff' },
              ].map(f => (
                <div key={f.label} className="relative flex items-center gap-4 rounded-2xl border-2 p-4"
                  style={{ borderColor: f.border, backgroundColor: f.bg }}>
                  <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ backgroundColor: f.color }} />
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white shadow-sm" style={{ backgroundColor: f.color + '18' }}>
                    <f.icon className="h-4 w-4" style={{ color: f.color }} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest mb-0.5" style={{ color: f.color + 'bb' }}>{f.label}</p>
                    <p className="em-display text-sm font-bold text-gray-900 truncate">{f.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Reset Password ── */}
          <section className="em-slide-up">
            <SectionLabel icon={KeyRound} label="Security" />
            <div className="em-glass rounded-3xl overflow-hidden shadow-xl">
              <div className="p-5 space-y-3 bg-white">
                {newPassword && (
                  <div className="rounded-2xl border-2 border-orange-200 bg-orange-50 p-4 text-center em-slide-up">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-orange-400 mb-1">New Default Password</p>
                    <p className="em-display text-2xl font-bold text-orange-600 tracking-widest">{newPassword}</p>
                  </div>
                )}

                <button
                  onClick={handleResetPassword}
                  disabled={resetLoading}
                  className="em-card-hover group relative w-full flex items-center gap-4 rounded-2xl border-2 p-4 text-left shadow-sm transition-all disabled:opacity-60"
                  style={{ borderColor: '#fed7aa', backgroundColor: '#fff7ed' }}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-orange-500" />
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                    style={{ backgroundColor: '#f9731620', border: '1.5px solid #f9731640' }}>
                    <RefreshCw className={`h-5 w-5 text-orange-500 ${resetLoading ? 'animate-spin' : ''}`} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">Reset Password</p>
                    <p className="text-xs mt-0.5 font-medium text-orange-400">Generate a new default password</p>
                  </div>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: '#f9731615', border: '1px solid #f9731630' }}>
                    <ArrowUpRight className="h-4 w-4 text-orange-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </button>
              </div>
            </div>
          </section>

          {/* ── Recent Activity ── */}
          <section className="em-slide-up">
            <SectionLabel icon={Activity} label="Recent Activity" />
            <div className="em-glass rounded-3xl p-6 shadow-xl overflow-hidden relative">
              <div className="em-orb w-36 h-36 bg-orange-400/10 -top-8 -right-8" />

              {actLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse h-16 rounded-2xl bg-gray-100" />
                  ))}
                </div>
              ) : activity.length === 0 ? (
                <div className="flex h-36 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50">
                  <Clock className="h-7 w-7 text-gray-300" />
                  <p className="text-sm font-semibold text-gray-400">No activity found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activity.map((act, i) => {
                    const ss = statusStyles[act.status] || { dot: '#6b7280', bg: '#f9fafb', border: '#e5e7eb', text: '#374151' };
                    return (
                      <div key={i}
                        className="relative flex items-center gap-3 rounded-2xl border p-4 em-slide-up"
                        style={{ animationDelay: `${i * 0.06}s`, borderColor: ss.border, backgroundColor: ss.bg + '80' }}>
                        <div className="relative shrink-0">
                          <span className="block h-3 w-3 rounded-full" style={{ backgroundColor: ss.dot }} />
                          <span className="absolute inset-0 rounded-full" style={{ backgroundColor: ss.dot, animation: 'pulse-ring 2s cubic-bezier(0.215,0.61,0.355,1) infinite' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="em-display text-sm font-bold text-gray-900 truncate">
                            {act.services?.customer_name || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5 truncate">
                            {[act.services?.device_brand, act.services?.device_model].filter(Boolean).join(' ') || 'Device'}
                          </p>
                          <div className="mt-1.5 inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                            style={{ backgroundColor: ss.bg, borderColor: ss.border, color: ss.text }}>
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ss.dot }} />
                            {act.status}
                          </div>
                        </div>
                        <span className="shrink-0 text-[10px] font-semibold text-gray-400">
                          {formatDate(act.created_at)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </PageTransition>
  );
}

/* ─── Reusable form field wrapper ─── */
function FormField({ label, icon: Icon, color, bg, border, children }) {
  return (
    <div className="relative flex items-center gap-4 rounded-2xl border-2 p-4 transition-all"
      style={{ borderColor: border, backgroundColor: bg + '80' }}>
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ backgroundColor: color }} />
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white shadow-sm"
        style={{ backgroundColor: color + '18' }}>
        <Icon className="h-4 w-4" style={{ color }} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-extrabold uppercase tracking-widest mb-0.5" style={{ color: color + 'bb' }}>{label}</p>
        {children}
      </div>
    </div>
  );
}
