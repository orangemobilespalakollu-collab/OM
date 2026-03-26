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
    received: 0,
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
  const [allActivities, setAllActivities] = useState([]); // NEW
  const [currentPage, setCurrentPage] = useState(1); // NEW
  const [isExpanded, setIsExpanded] = useState(false); // NEW

  const [loading, setLoading] = useState(true);

  const ITEMS_PER_PAGE = 5; // NEW

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      setLoading(true);
      const [statsData, activityData] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getRecentActivity(50) // UPDATED
      ]);

      setStats(statsData);
      setAllActivities(activityData); // NEW
      setRecentActivity(activityData.slice(0, 5)); // NEW
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  // PAGINATION LOGIC
  const totalPages = Math.ceil(allActivities.length / ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    setRecentActivity(allActivities.slice(start, end));
  };

  function handleSeeMore() {
    setIsExpanded(true);
    handlePageChange(2);
  }

  function handleSeeLess() {
    setIsExpanded(false);
    setCurrentPage(1);
    setRecentActivity(allActivities.slice(0, 5));
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {quickActions.map((action) => (
            <button
              key={action.name}
              onClick={() => router.push(action.href)}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-4 text-white shadow-sm transition-all hover:scale-[1.02] hover:shadow-md active:scale-[0.98]",
                action.color
              )}
            >
              <div className="rounded-xl bg-white/20 p-2.5 backdrop-blur-sm">
                <action.icon className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold leading-tight">{action.name}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Work Priority */}
      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">Work Priority</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <PriorityCard title="Received" count={stats.received || 0} color="text-orange-600" bgColor="bg-orange-50" onClick={() => router.push('/services?status=Received')} />
          <PriorityCard title="In Progress" count={stats.inProgress} color="text-blue-600" bgColor="bg-blue-50" onClick={() => router.push('/services?status=In Progress')} />
          <PriorityCard title="Waiting for Parts" count={stats.waitingForParts} color="text-yellow-600" bgColor="bg-yellow-50" onClick={() => router.push('/services?status=Waiting for Parts')} />
          <PriorityCard title="Completed (Not Returned)" count={stats.completedNotReturned} color="text-green-600" bgColor="bg-green-50" onClick={() => router.push('/services?status=Completed')} />
        </div>
      </section>

      {/* Today Summary */}
      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">Today Summary</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-6">
          <SummaryCard title="Registered" count={stats.registeredToday} onClick={() => router.push('/services?filter=registeredToday')} />
          <SummaryCard title="Completed" count={stats.completedToday} onClick={() => router.push('/services?filter=completedToday')} />
          <SummaryCard title="Non Repairable" count={stats.notRepairableToday} onClick={() => router.push('/services?filter=notRepairableToday')} />
          <SummaryCard title="Returned" count={stats.returnedToday} onClick={() => router.push('/history?tab=services&today=returned')} />
          <SummaryCard title="Sales" count={stats.salesToday} onClick={() => router.push('/sales?today=true')} />
          <SummaryCard title="Revenue" count={formatCurrency(stats.revenueToday)} isCurrency onClick={() => router.push('/sales?today=true')} />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        
        {/* Recent Activity */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
          </div>

          <div className="space-y-4">
            {recentActivity.length === 0 && (
              <p className="text-sm text-gray-500 text-center">No data found</p>
            )}

            {recentActivity.map((activity, i) => (
              <button
                key={i}
                onClick={() => {
                  const serviceId = activity.services?.id;
                  if (serviceId) {
                    router.push(`/services?serviceId=${serviceId}`);
                  }
                }}
                className="w-full rounded-xl border border-gray-100 bg-white p-3 text-left hover:bg-orange-50"
              >
                <div className="flex items-start gap-4">
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
              </button>
            ))}
          </div>

          {/* Pagination + Controls */}
          <div className="mt-4 flex flex-col items-center gap-3">

            {!isExpanded && allActivities.length > 5 && (
              <button onClick={handleSeeMore} className="text-sm font-medium text-orange-600 hover:underline">
                See More
              </button>
            )}

            {isExpanded && (
              <>
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-2 py-1 text-xs rounded bg-gray-100 disabled:opacity-50"
                  >
                    Prev
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .slice(0, 10)
                    .map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={cn(
                          "px-2 py-1 text-xs rounded",
                          currentPage === page
                            ? "bg-orange-500 text-white"
                            : "bg-gray-100"
                        )}
                      >
                        {page}
                      </button>
                    ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 text-xs rounded bg-gray-100 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>

                <button onClick={handleSeeLess} className="text-sm font-medium text-gray-500 hover:underline">
                  See Less
                </button>
              </>
            )}
          </div>
        </section>

        {/* Smart Alerts */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-bold text-gray-900">Smart Alerts</h3>
          <div className="space-y-4">
            {stats.inProgress > 0 && <AlertItem message="Service in progress for more than 3 days" type="warning" />}
            {stats.waitingForParts > 5 && <AlertItem message="High number of services waiting for parts" type="danger" />}
            <AlertItem message="All systems operational" type="success" />
          </div>
        </section>
      </div>

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
