'use client';

import { useState, useEffect } from 'react';
import { reportService } from '@/services/reportService';
import { useAuth } from '@/components/AuthProvider';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Wrench, 
  ShoppingBag, 
  IndianRupee,
  Calendar,
  ChevronDown,
  AlertCircle,
  Lock
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

export default function ReportsPage() {
  const { profile } = useAuth();
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    summary: {
      totalServices: 0,
      completedServices: 0,
      returnedServices: 0,
      estimatedAmount: 0,
      finalAmount: 0,
      totalSales: 0,
      overallRevenue: 0,
    },
    insights: {
      topIssue: 'N/A',
      repeatCustomer: 'N/A',
      topEmployee: 'N/A',
      notRepairableCount: 0,
    },
    chartData: [],
  });

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchReportData();
    }
  }, [dateRange, profile]);

  async function fetchReportData() {
    try {
      setLoading(true);
      const reportData = await reportService.getReportData(dateRange);
      setData(reportData);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  }

  if (profile?.role !== 'admin') {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
        <Lock className="mb-4 h-12 w-12 text-red-500" />
        <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
        <p className="text-gray-500">Only administrators can view analytics reports.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Date Filter */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Reports</h2>
        <div className="relative">
          <select
            className="appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm font-bold text-gray-700 focus:border-orange-500 focus:outline-none"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            {['Today', 'Last 7 Days', 'Last 30 Days', '1 Year', 'All Time'].map(range => (
              <option key={range} value={range}>{range}</option>
            ))}
          </select>
          <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Summary Cards */}
      <section>
        <h3 className="mb-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Summary</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ReportCard title="Total Services" value={data.summary.totalServices} icon={Wrench} color="text-blue-600" />
          <ReportCard title="Returned Services" value={data.summary.returnedServices} icon={TrendingUp} color="text-green-600" />
          <ReportCard title="Total Sales" value={formatCurrency(data.summary.totalSales)} icon={ShoppingBag} color="text-purple-600" />
          <ReportCard title="Overall Revenue" value={formatCurrency(data.summary.overallRevenue)} icon={IndianRupee} color="text-orange-600" />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Revenue Chart */}
        <section className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-bold text-gray-900">Revenue Trend</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: '#f97316', opacity: 0.1 }}
                />
                <Bar dataKey="revenue" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Insights */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-bold text-gray-900">Key Insights</h3>
          <div className="space-y-6">
            <InsightItem label="Top Issue" value={data.insights.topIssue} icon={AlertCircle} />
            <InsightItem label="Repeat Customer" value={data.insights.repeatCustomer} icon={Users} />
            <InsightItem label="Top Employee" value={data.insights.topEmployee} icon={BarChart3} />
            <InsightItem label="Not Repairable" value={data.insights.notRepairableCount} icon={AlertCircle} />
          </div>
        </section>
      </div>
    </div>
  );
}

function ReportCard({ title, value, icon: Icon, color }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm transition-transform hover:scale-[1.02]">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50">
        <Icon className={cn("h-5 w-5", color)} />
      </div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function InsightItem({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center gap-4">
      <div className="rounded-lg bg-orange-50 p-2">
        <Icon className="h-5 w-5 text-orange-600" />
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
