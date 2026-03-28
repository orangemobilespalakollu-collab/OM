'use client';

import { useState, useEffect } from 'react';
import { reportService } from '@/services/reportService';
import { useAuth } from '@/components/AuthProvider';
import {
  TrendingUp,
  Wrench,
  ShoppingBag,
  IndianRupee,
  Lock,
  TrendingDown,
  DownloadCloud,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { cn, formatCurrency } from '@/lib/utils';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';


export default function ReportsPage() {
  const { profile } = useAuth();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [aiMode, setAiMode] = useState('sales');
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [data, setData] = useState({
    summary: {
      totalServices: 0,
      completedServices: 0,
      returnedServices: 0,
      estimatedAmount: 0,
      finalAmount: 0,
      totalSales: 0,
      overallRevenue: 0,
      gapInRevenue: 0,
    },
    services: [],
    sales: [],
  });

  const serviceExportColumns = [
    { key: 'ticket_number', label: 'Ticket Number' },
    { key: 'customer_name', label: 'Customer Name' },
    { key: 'customer_mobile', label: 'Customer Mobile' },
    { key: 'customer_address', label: 'Customer Address' },
    { key: 'device_brand', label: 'Device Brand' },
    { key: 'device_model', label: 'Device Model' },
    { key: 'issue_type', label: 'Issue Type' },
    { key: 'issue_description', label: 'Issue Description' },
    { key: 'estimated_cost', label: 'Estimated Cost' },
    { key: 'final_amount', label: 'Final Amount' },
    { key: 'status', label: 'Status' },
    { key: 'registered_by', label: 'Registered By' },
    { key: 'returned_by', label: 'Returned By' },
    { key: 'created_at', label: 'Created At' },
    { key: 'returned_at', label: 'Returned At' },
  ];

  const salesExportColumns = [
    { key: 'product_name', label: 'Product Name' },
    { key: 'brand_type', label: 'Brand Type' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'price', label: 'Price' },
    { key: 'total', label: 'Total' },
    { key: 'recorded_by', label: 'Recorded By' },
    { key: 'created_at', label: 'Created At' },
  ];

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchReportData();
    }
  }, [startDate, endDate, profile]);

  async function fetchReportData() {
    try {
      setLoading(true);
      const reportData = await reportService.getReportData(startDate, endDate);
      setData(reportData);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  }

  function csvEscape(value) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    return `"${str.replace(/"/g, '""')}"`;
  }

  function downloadCsv(records, columns, fileName, title, timeframe) {
    if (!records?.length) return;
    const headers = columns.map(column => csvEscape(column.label));
    const rows = records.map(record =>
      columns.map(column => csvEscape(record[column.key])).join(',')
    );
    const csvContent = [
      csvEscape(title),
      csvEscape(timeframe),
      '',
      headers.join(','),
      ...rows,
    ].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function downloadPdf(records, columns, fileName, title, timeframe) {
    if (!records?.length) return;
    const doc = new jsPDF({ orientation: 'landscape' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 12;

    // Page border
    doc.setLineWidth(0.8);
    doc.setDrawColor(0);
    doc.rect(margin / 2, margin / 2, pageWidth - margin, pageHeight - margin);

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Orange Mobiles', pageWidth / 2, 18, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(timeframe, pageWidth / 2, 26, { align: 'center' });
    doc.setFontSize(12);
    doc.text(title, pageWidth / 2, 34, { align: 'center' });

    const headers = columns.map(column => column.label);
    const body = records.map(record =>
      columns.map(column =>
        record[column.key] === null || record[column.key] === undefined
          ? ''
          : String(record[column.key])
      )
    );

    autoTable(doc, {
      startY: 40,
      margin: { left: margin, right: margin, top: margin },
      head: [headers],
      body,
      styles: {
        fontSize: 8,
        overflow: 'linebreak',
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [249, 115, 22],
        textColor: 255,
        halign: 'center',
      },
      columnStyles: columns.reduce((acc, _column, index) => {
        acc[index] = { cellWidth: 'wrap', halign: 'left' };
        return acc;
      }, {}),
      tableWidth: 'auto',
      theme: 'grid',
    });

    doc.save(`${fileName}.pdf`);
  }

  function getServiceExportRows() {
    return data.services.map(service => ({
      ticket_number: service.ticket_number || '',
      customer_name: service.customer_name || '',
      customer_mobile: service.customer_mobile || '',
      customer_address: service.customer_address || '',
      device_brand: service.device_brand || '',
      device_model: service.device_model || '',
      issue_type: service.issue_type || '',
      issue_description: service.issue_description || '',
      estimated_cost: service.estimated_cost ?? '',
      final_amount: service.final_amount ?? '',
      status: service.status || '',
      registered_by: service.registered_by_name || service.profiles?.full_name || service.registered_by || '',
      returned_by: service.returned_by_name || service.returned_by_profile?.full_name || service.returned_by || '',
      created_at: service.created_at ? new Date(service.created_at).toLocaleString() : '',
      returned_at: service.returned_at ? new Date(service.returned_at).toLocaleString() : '',
    }));
  }

  function getSalesExportRows() {
    return data.sales.map(sale => ({
      product_name: sale.product_name || '',
      brand_type: sale.brand_type || '',
      quantity: sale.quantity ?? '',
      price: sale.price ?? '',
      total: sale.price && sale.quantity ? sale.price * sale.quantity : '',
      recorded_by: sale.recorded_by_name || sale.profiles?.full_name || sale.recorded_by || '',
      created_at: sale.created_at ? new Date(sale.created_at).toLocaleString() : '',
    }));
  }

  function handleExport(type, format) {
    const rows = type === 'sales' ? getSalesExportRows() : getServiceExportRows();
    const columns = type === 'sales' ? salesExportColumns : serviceExportColumns;
    if (!rows?.length) {
      return;
    }
    const rangeSuffix = startDate && endDate ? `${startDate}_to_${endDate}` : 'till_now';
    const fileName = `${type}_${rangeSuffix}`;
    const title = `${type === 'sales' ? 'Sales' : 'Service'} Report`;
    const timeframe = startDate && endDate ? `Time Frame: ${startDate} to ${endDate}` : 'Time Frame: Till Now';
    if (format === 'csv') {
      downloadCsv(rows, columns, fileName, title, timeframe);
    } else {
      downloadPdf(rows, columns, fileName, title, timeframe);
    }
  }

  async function requestAiAnalysis(mode) {
    setAiMode(mode);
    setAiResult('');
    setAiError('');
    setAiLoading(true);

    try {
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, startDate, endDate }),
      });
      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result.error || 'AI analysis request failed.');
      }

      setAiResult(result.summary || 'No analysis was returned.');
    } catch (err) {
      setAiError(err.message || 'Failed to generate AI analysis.');
    } finally {
      setAiLoading(false);
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
      <div className="flex flex-col gap-6 rounded-3xl border border-orange-100 bg-orange-50/60 p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
        </div>
        <div className="flex w-full flex-col gap-4 sm:w-[520px] sm:flex-row sm:items-end sm:gap-4">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-gray-700">From</label>
            <input
              type="date"
              className="w-full rounded-2xl border border-gray-200 bg-white py-3 px-4 text-sm shadow-sm transition focus:border-orange-500 focus:outline-none"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-gray-700">To</label>
            <input
              type="date"
              className="w-full rounded-2xl border border-gray-200 bg-white py-3 px-4 text-sm shadow-sm transition focus:border-orange-500 focus:outline-none"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-2 sm:mt-0">
          <Dialog>
            <DialogTrigger>
              <div
                className="w-full rounded-2xl border border-orange-200 bg-white p-6 text-left shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Export Reports</p>
                    <p className="mt-1 text-sm text-gray-500">Click to download sales and service data as CSV or PDF.</p>
                  </div>
                  <DownloadCloud className="h-6 w-6 text-orange-500" />
                </div>
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Export Reports</DialogTitle>
                <DialogDescription>Choose one of the available export formats for services or sales.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 py-4">
                <DialogClose render={<Button variant="outline" className="w-full" onClick={() => handleExport('services', 'csv')}>Export Service CSV</Button>} />
                <DialogClose render={<Button variant="outline" className="w-full" onClick={() => handleExport('services', 'pdf')}>Export Service PDF</Button>} />
                <DialogClose render={<Button variant="outline" className="w-full" onClick={() => handleExport('sales', 'csv')}>Export Sales CSV</Button>} />
                <DialogClose render={<Button variant="outline" className="w-full" onClick={() => handleExport('sales', 'pdf')}>Export Sales PDF</Button>} />
              </div>
              <DialogFooter>
                <DialogClose render={<Button variant="ghost" className="w-full sm:w-auto">Close</Button>} />
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* AI Analysis Card */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Analysis</h3>
            <p className="text-sm text-gray-500">Open the AI analysis popup and choose a mode to generate insights.</p>
          </div>
          <Dialog>
            <DialogTrigger>
              <div
                className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700"
              >
                <DownloadCloud className="h-4 w-4" />
                Open AI Analysis
              </div>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>AI Analysis</DialogTitle>
                <DialogDescription>Select a mode to analyze sales, service, feedback, or struggles.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 py-4 sm:grid-cols-2">
                {['sales', 'service', 'feedback', 'struggles'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => requestAiAnalysis(mode)}
                    className={
                      `rounded-2xl border px-4 py-3 text-sm font-semibold transition ` +
                      (aiMode === mode ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 bg-white text-slate-700 hover:border-orange-300')
                    }
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
              <div className="space-y-3 pt-3">
                {aiLoading && <p className="text-sm text-slate-500">Generating analysis, please wait...</p>}
                {aiError && <p className="text-sm text-red-600">{aiError}</p>}
                {!aiLoading && !aiError && !aiResult && (
                  <p className="text-sm text-slate-500">Select an analysis mode to load a summary.</p>
                )}
                {aiResult && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <p className="font-semibold text-slate-900 mb-3 text-lg">{aiMode.charAt(0).toUpperCase() + aiMode.slice(1)} Analysis</p>
                    {typeof aiResult === 'object' ? (
                      <div className="space-y-4">
                        {aiResult.overview && <p className="text-slate-800">{formatHighlight(aiResult.overview)}</p>}
                        
                        {aiResult.positives?.length > 0 && (
                          <div className="rounded-xl bg-white p-4 border border-green-100 shadow-sm">
                            <p className="font-semibold text-green-700 mb-2">Highlights & Positives</p>
                            <ul className="list-disc pl-5 space-y-1 text-slate-600">
                              {aiResult.positives.map((text, i) => <li key={i}>{formatHighlight(text)}</li>)}
                            </ul>
                          </div>
                        )}
                        
                        {aiResult.improvements?.length > 0 && (
                          <div className="rounded-xl bg-white p-4 border border-orange-100 shadow-sm">
                            <p className="font-semibold text-orange-700 mb-2">Areas for Improvement</p>
                            <ul className="list-disc pl-5 space-y-1 text-slate-600">
                              {aiResult.improvements.map((text, i) => <li key={i}>{formatHighlight(text)}</li>)}
                            </ul>
                          </div>
                        )}

                        {aiResult.recommendations?.length > 0 && (
                          <div className="rounded-xl bg-white p-4 border border-blue-100 shadow-sm">
                            <p className="font-semibold text-blue-700 mb-2">Actionable Recommendations</p>
                            <ul className="list-disc pl-5 space-y-1 text-slate-600">
                              {aiResult.recommendations.map((text, i) => <li key={i}>{formatHighlight(text)}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-2 whitespace-pre-line">{String(aiResult)}</div>
                    )}
                  </div>
                )}
              </div>
              <DialogFooter>
                <DialogClose render={<Button variant="ghost" className="w-full sm:w-auto">Close</Button>} />
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* Summary Cards */}
      <section>
        <h3 className="mb-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Summary</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          <ReportCard title="Total Services" value={data.summary.totalServices} icon={Wrench} color="text-blue-600" />
          <ReportCard title="Returned Services" value={data.summary.returnedServices} icon={TrendingUp} color="text-green-600" />
          <ReportCard title="Total Sales" value={formatCurrency(data.summary.totalSales)} icon={ShoppingBag} color="text-purple-600" />
          <ReportCard title="Overall Revenue" value={formatCurrency(data.summary.overallRevenue)} icon={IndianRupee} color="text-orange-600" />
          <ReportCard title="Gap in Revenue" value={formatCurrency(data.summary.gapInRevenue)} icon={TrendingDown} color="text-red-600" />
        </div>
      </section>

      {/* Revenue Trend Chart */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-2 text-lg font-semibold text-gray-900">Revenue Trend</h3>
        <p className="text-sm text-gray-500">Daily total revenue across completed sales and returned services.</p>
        <RevenueChart sales={data.sales} services={data.services} />
      </section>
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

function RevenueChart({ sales, services }) {
  const dailyData = {};

  sales.forEach(sale => {
    if (!sale.created_at) return;
    const date = new Date(sale.created_at).toISOString().split('T')[0];
    const amount = (sale.price || 0) * (sale.quantity || 0);
    if (!dailyData[date]) dailyData[date] = 0;
    dailyData[date] += amount;
  });

  services.forEach(service => {
    if (service.status !== 'Returned' || !service.returned_at) return;
    const date = new Date(service.returned_at).toISOString().split('T')[0];
    const amount = service.final_amount || 0;
    if (!dailyData[date]) dailyData[date] = 0;
    dailyData[date] += amount;
  });

  const chartData = Object.keys(dailyData)
    .sort()
    .map(date => ({
      date,
      Revenue: dailyData[date]
    }));

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 mt-6 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50">
        <p className="text-sm text-gray-400">No revenue data available for the selected period.</p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full mt-8">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#64748b' }} 
            dy={10}
            tickFormatter={(val) => {
              const d = new Date(val);
              return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
            }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#64748b' }}
            tickFormatter={(val) => `₹${val}`}
            width={80}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value) => [`₹${value}`, 'Revenue']}
            labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          />
          <Area type="monotone" dataKey="Revenue" stroke="#ea580c" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function formatHighlight(text) {
  if (typeof text !== 'string') return text;
  
  const htmlSafe = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-gray-800">$1</em>');
    
  return <span dangerouslySetInnerHTML={{ __html: htmlSafe }} />;
}
