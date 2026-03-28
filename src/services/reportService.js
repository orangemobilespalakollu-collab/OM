import { supabase } from '@/lib/supabase';

export const reportService = {
  async getReportData(startDate, endDate) {
    // In a real app, we'd calculate dates based on dateRange
    let servicesQuery = supabase.from('services').select('*');
    let salesQuery = supabase.from('sales').select('*');

    const now = new Date().toISOString();
    const start = startDate ? new Date(startDate).toISOString() : null;
    const end = endDate ? new Date(endDate).toISOString() : now;

    if (start) {
      servicesQuery = servicesQuery.gte('created_at', start);
      salesQuery = salesQuery.gte('created_at', start);
    }

    if (end) {
      servicesQuery = servicesQuery.lte('created_at', end);
      salesQuery = salesQuery.lte('created_at', end);
    }

    const { data: services, error: servicesError } = await servicesQuery;
    const { data: sales, error: salesError } = await salesQuery;

    if (servicesError) throw servicesError;
    if (salesError) throw salesError;

    const profileIds = [
      ...(services || []).map((s) => s.registered_by).filter(Boolean),
      ...(services || []).map((s) => s.returned_by).filter(Boolean),
      ...(sales || []).map((s) => s.recorded_by).filter(Boolean),
    ];

    const uniqueIds = Array.from(new Set(profileIds));
    const profileMap = new Map();

    if (uniqueIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', uniqueIds);

      if (profilesError) throw profilesError;
      profiles?.forEach((profile) => profileMap.set(profile.id, profile.full_name));
    }

    const servicesWithNames = (services || []).map((service) => ({
      ...service,
      registered_by_name: profileMap.get(service.registered_by) || service.registered_by,
      returned_by_name: profileMap.get(service.returned_by) || service.returned_by,
    }));

    const salesWithNames = (sales || []).map((sale) => ({
      ...sale,
      recorded_by_name: profileMap.get(sale.recorded_by) || sale.recorded_by,
    }));

    const totalServices = servicesWithNames.length || 0;
    const returnedServices = services?.filter(s => s.status === 'Returned').length || 0;
    const estimatedAmount = services?.reduce((sum, s) => sum + (s.estimated_cost || 0), 0) || 0;
    const finalAmount = services?.filter(s => s.status === 'Returned').reduce((sum, s) => sum + (s.final_amount || 0), 0) || 0;
    const totalSales = sales?.reduce((sum, s) => sum + (s.price * s.quantity), 0) || 0;

    return {
      summary: {
        totalServices,
        completedServices: services?.filter(s => s.status === 'Completed').length || 0,
        returnedServices,
        estimatedAmount,
        finalAmount,
        totalSales,
        overallRevenue: finalAmount + totalSales,
        gapInRevenue: estimatedAmount - finalAmount,
      },
      services: servicesWithNames,
      sales: salesWithNames,
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
