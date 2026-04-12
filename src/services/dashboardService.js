import { supabase } from '@/lib/supabase';

export const dashboardService = {
  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();

    // Fetch Service Stats
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('id, status, created_at, returned_at, final_amount, customer_name, device_model, device_brand, customer_mobile, estimated_cost, ticket_number');
    
    if (servicesError) throw servicesError;

    const inProgress = services?.filter(s => s.status === 'In Progress').length || 0;
    const waitingForParts = services?.filter(s => s.status === 'Waiting for Parts').length || 0;
    const completedNotReturned = services?.filter(s => s.status === 'Completed').length || 0;
    const received = services?.filter(s => s.status === 'Received').length || 0;
    
    const now = new Date();
    const oldInProgress = services?.filter(s => s.status === 'In Progress' && (now - new Date(s.created_at)) > 3 * 24 * 60 * 60 * 1000).length || 0;
    const oldWaitingForParts = services?.filter(s => s.status === 'Waiting for Parts' && (now - new Date(s.created_at)) > 5 * 24 * 60 * 60 * 1000).length || 0;
    const oldCompletedNotReturned = services?.filter(s => s.status === 'Completed' && (now - new Date(s.created_at)) > 7 * 24 * 60 * 60 * 1000).length || 0;
    
    const registeredTodayList = services?.filter(s => new Date(s.created_at) >= today) || [];
    const registeredToday = registeredTodayList.length;
    const completedToday = services?.filter(s => s.status === 'Completed' && new Date(s.created_at) >= today).length || 0;
    const returnedToday = services?.filter(s => s.status === 'Returned' && new Date(s.returned_at) >= today).length || 0;
    
    const serviceRevenueToday = services
      ?.filter(s => s.status === 'Returned' && new Date(s.returned_at) >= today)
      .reduce((sum, s) => sum + (s.final_amount || 0), 0) || 0;

    // Fetch Sales Today
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select('price, quantity, created_at')
      .gte('created_at', todayStr);
    
    if (salesError) throw salesError;

    const salesToday = sales?.length || 0;
    const salesRevenueToday = sales?.reduce((sum, s) => sum + (s.price * s.quantity), 0) || 0;

    return {
      received,
      inProgress,
      waitingForParts,
      completedNotReturned,
      registeredTodayList,
      registeredToday,
      completedToday,
      notRepairableToday: 0,
      returnedToday,
      salesToday,
      revenueToday: serviceRevenueToday + salesRevenueToday,
      serviceRevenueToday,
      salesRevenueToday,
      alerts: {
        oldInProgress,
        oldWaitingForParts,
        oldCompletedNotReturned
      }
    };
  },

  async getRecentActivity(page = 1, limit = 5, max = 50) {
    const safePage = Math.max(1, page);
    const offset = (safePage - 1) * limit;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();

    // Prevent page overflow beyond max 50
    if (offset >= max) {
      const { count } = await supabase
        .from('service_status_history')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayStr);

      return {
        data: [],
        total: Math.min(count || 0, max),
      };
    }

    const start = offset;
    const end = Math.min(offset + limit - 1, max - 1);

    const { data, count, error } = await supabase
      .from('service_status_history')
      .select(`
        id,
        status,
        created_at,
        updated_by,
        services (
          id,
          customer_name,
          device_brand,
          device_model,
          status
        )
      `, { count: 'exact' })
      .gte('created_at', todayStr)
      .order('created_at', { ascending: false })
      .range(start, end);

    if (error) throw error;

    return {
      data: data || [],
      total: Math.min(count || 0, max),
    };
}
};
