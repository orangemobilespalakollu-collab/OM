import { supabase } from '@/lib/supabase';

export const reportService = {
  async getReportData(startDate, endDate) {
    let servicesQuery = supabase.from('services').select('*');
    let salesQuery = supabase.from('sales').select('*');
    // We strictly use ilike %repairable% to prevent any trailing spaces or typos breaking the count
    let strugglesQuery = supabase.from('service_status_history').select('service_id').ilike('status', '%repairable%');

    const now = new Date().toISOString();
    let start = null;
    let end = now;

    if (startDate) {
      const startObj = new Date(startDate);
      startObj.setHours(0, 0, 0, 0);
      start = startObj.toISOString();
    }

    if (endDate) {
      const endObj = new Date(endDate);
      endObj.setHours(23, 59, 59, 999);
      end = endObj.toISOString();
    }

    if (start) {
      servicesQuery = servicesQuery.gte('created_at', start);
      salesQuery = salesQuery.gte('created_at', start);
      strugglesQuery = strugglesQuery.gte('created_at', start);
    }

    if (end) {
      servicesQuery = servicesQuery.lte('created_at', end);
      salesQuery = salesQuery.lte('created_at', end);
      strugglesQuery = strugglesQuery.lte('created_at', end);
    }

    const [
      { data: services, error: servicesError },
      { data: sales, error: salesError },
      { data: strugglesHistory, error: strugglesError }
    ] = await Promise.all([
      servicesQuery,
      salesQuery,
      strugglesQuery
    ]);

    if (servicesError) throw servicesError;
    if (salesError) throw salesError;
    // Log silently, don't crash the report dashboard if history table fails for some reason
    if (strugglesError) console.error("Struggles history error:", strugglesError);

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

    // Calculate unique struggles by counting unique service IDs that hit 'Not Repairable'
    const notRepairableSet = new Set((strugglesHistory || []).map(h => h.service_id));
    const notRepairableServicesCount = notRepairableSet.size;

    const servicesWithNames = (services || []).map((service) => ({
      ...service,
      registered_by_name: profileMap.get(service.registered_by) || service.registered_by,
      returned_by_name: profileMap.get(service.returned_by) || service.returned_by,
      was_not_repairable: notRepairableSet.has(service.id)
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
    const realizedGap = services?.filter(s => s.status === 'Returned').reduce((sum, s) => sum + ((s.estimated_cost || 0) - (s.final_amount || 0)), 0) || 0;

    return {
      summary: {
        totalServices,
        completedServices: services?.filter(s => s.status === 'Completed').length || 0,
        returnedServices,
        notRepairableServices: notRepairableServicesCount,
        estimatedAmount,
        finalAmount,
        totalSales,
        overallRevenue: finalAmount + totalSales,
        gapInRevenue: realizedGap,
      },
      services: servicesWithNames,
      sales: salesWithNames,
      insights: {
        notRepairableCount: notRepairableServicesCount,
      },
      chartData: []
    };
  }
};
