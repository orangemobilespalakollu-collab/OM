import { supabase } from '@/lib/supabase';

export const reportService = {
  async getReportData(dateRange) {
    // In a real app, we'd calculate dates based on dateRange
    const { data: services, error: servicesError } = await supabase.from('services').select('*');
    const { data: sales, error: salesError } = await supabase.from('sales').select('*');

    if (servicesError) throw servicesError;
    if (salesError) throw salesError;

    const totalServices = services?.length || 0;
    const returnedServices = services?.filter(s => s.status === 'Returned').length || 0;
    const finalAmount = services?.filter(s => s.status === 'Returned').reduce((sum, s) => sum + (s.final_amount || 0), 0) || 0;
    const totalSales = sales?.reduce((sum, s) => sum + (s.price * s.quantity), 0) || 0;

    return {
      summary: {
        totalServices,
        completedServices: services?.filter(s => s.status === 'Completed').length || 0,
        returnedServices,
        estimatedAmount: services?.reduce((sum, s) => sum + (s.estimated_cost || 0), 0) || 0,
        finalAmount,
        totalSales,
        overallRevenue: finalAmount + totalSales,
      },
      insights: {
        topIssue: 'Display Problem',
        repeatCustomer: '9876543210 (Prasad)',
        topEmployee: 'Saketh',
        notRepairableCount: services?.filter(s => s.status === 'Not Repairable').length || 0,
      },
      chartData: [
        { name: 'Mon', revenue: 4000 },
        { name: 'Tue', revenue: 3000 },
        { name: 'Wed', revenue: 5000 },
        { name: 'Thu', revenue: 2780 },
        { name: 'Fri', revenue: 1890 },
        { name: 'Sat', revenue: 2390 },
        { name: 'Sun', revenue: 3490 },
      ]
    };
  }
};
