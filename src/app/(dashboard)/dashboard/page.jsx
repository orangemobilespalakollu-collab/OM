'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { dashboardService } from '@/services/dashboardService';
import { 
  PlusCircle, 
  ShoppingBag, 
  Wrench, 
  AlertCircle, 
  TrendingUp, 
  Clock
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    inProgress: 0,
    waitingForParts: 0,
    completedNotReturned: 0,
    registeredToday: 0,
    completedToday: 0,
    notRepairableToday: 0,
    returnedToday: 0,
    salesToday: 0,
    revenueToday: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      setLoading(true);
      const [statsData, activityData] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getRecentActivity()
      ]);

      setStats(statsData);
      setRecentActivity(activityData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  const quickActions = [
    { name: 'Register New Service', icon: PlusCircle, color: 'bg-orange-500', href: '/services?action=new' },
    { name: 'Add New Sale', icon: ShoppingBag, color: 'bg-purple-500', href: '/sales?action=new' },
    { name: 'View Current Services', icon: Wrench, color: 'bg-blue-500', href: '/services' },
  ];

  if (loading) return (
    <div className="animate-pulse space-y-8">
      <div className="h-32 rounded-xl bg-gray-200"></div>
      <div className="grid grid-cols-3 gap-4">
        <div className="h-24 rounded-xl bg-gray-200"></div>
        <div className="h-24 rounded-xl bg-gray-200"></div>
        <div className="h-24 rounded-xl bg-gray-200"></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {quickActions.map((action) => (
            <button
              key={action.name}
              onClick={() => router.push(action.href)}
              className={cn(
                "flex items-center gap-4 rounded-2xl p-6 text-white transition-transform hover:scale-[1.02] active:scale-[0.98]",
                action.color
              )}
            >
              <div className="rounded-full bg-white/20 p-3">
                <action.icon className="h-6 w-6" />
              </div>
              <span className="text-lg font-bold">{action.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Work Priority */}
      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">Work Priority</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <PriorityCard 
            title="In Progress" 
            count={stats.inProgress} 
            color="text-blue-600" 
            bgColor="bg-blue-50" 
            onClick={() => router.push('/services?status=In Progress')}
          />
          <PriorityCard 
            title="Waiting for Parts" 
            count={stats.waitingForParts} 
            color="text-yellow-600" 
            bgColor="bg-yellow-50" 
            onClick={() => router.push('/services?status=Waiting for Parts')}
          />
          <PriorityCard 
            title="Completed (Not Returned)" 
            count={stats.completedNotReturned} 
            color="text-green-600" 
            bgColor="bg-green-50" 
            onClick={() => router.push('/services?status=Completed')}
          />
        </div>
      </section>

      {/* Today Summary */}
      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">Today Summary</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <SummaryCard title="Registered" count={stats.registeredToday} />
          <SummaryCard title="Completed" count={stats.completedToday} />
          <SummaryCard title="Returned" count={stats.returnedToday} />
          <SummaryCard title="Sales" count={stats.salesToday} />
          <SummaryCard title="Revenue" count={formatCurrency(stats.revenueToday)} isCurrency />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Activity */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
            <button className="text-sm font-medium text-orange-600 hover:underline">See More</button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex items-start gap-4 border-b pb-4 last:border-0">
                <div className="rounded-full bg-gray-100 p-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.services?.customer_name} - {activity.services?.device_model}
                  </p>
                  <p className="text-xs text-gray-500">
                    Status updated to <span className="font-semibold text-orange-600">{activity.status}</span>
                  </p>
                </div>
                <span className="text-[10px] text-gray-400">
                  {new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Smart Alerts */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-bold text-gray-900">Smart Alerts</h3>
          <div className="space-y-4">
            {stats.inProgress > 0 && (
              <AlertItem 
                message="Service in progress for more than 3 days" 
                type="warning" 
              />
            )}
            {stats.waitingForParts > 5 && (
              <AlertItem 
                message="High number of services waiting for parts" 
                type="danger" 
              />
            )}
            <AlertItem 
              message="All systems operational" 
              type="success" 
            />
          </div>
        </section>
      </div>

      {/* Admin Only Section */}
      {profile?.role === 'admin' && (
        <section className="rounded-2xl bg-gradient-to-br from-orange-600 to-orange-700 p-8 text-white">
          <div className="mb-8 flex items-center justify-between">
            <h3 className="text-xl font-bold">Admin Insights</h3>
            <TrendingUp className="h-6 w-6 opacity-50" />
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div>
              <p className="text-sm opacity-80">Total Revenue Today</p>
              <p className="text-3xl font-bold">{formatCurrency(stats.revenueToday)}</p>
            </div>
            <div>
              <p className="text-sm opacity-80">Most Serviced Brand</p>
              <p className="text-xl font-bold">Samsung</p>
            </div>
            <div>
              <p className="text-sm opacity-80">Top Employee</p>
              <p className="text-xl font-bold">Saketh</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function PriorityCard({ title, count, color, bgColor, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn("flex items-center justify-between rounded-2xl p-6 transition-transform hover:scale-[1.02]", bgColor)}
    >
      <span className="font-medium text-gray-700">{title}</span>
      <span className={cn("text-3xl font-bold", color)}>{count}</span>
    </button>
  );
}

function SummaryCard({ title, count, isCurrency }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-gray-500 uppercase">{title}</p>
      <p className={cn("mt-1 font-bold text-gray-900", isCurrency ? "text-sm" : "text-xl")}>{count}</p>
    </div>
  );
}

function AlertItem({ message, type }) {
  const styles = {
    warning: "bg-yellow-50 text-yellow-700 border-yellow-100",
    danger: "bg-red-50 text-red-700 border-red-100",
    success: "bg-green-50 text-green-700 border-green-100",
  };

  return (
    <div className={cn("flex items-center gap-3 rounded-lg border p-4 text-sm font-medium", styles[type])}>
      <AlertCircle className="h-5 w-5 shrink-0" />
      {message}
    </div>
  );
}
