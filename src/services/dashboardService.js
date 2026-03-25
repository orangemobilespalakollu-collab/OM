import { supabase } from '@/lib/supabase';

export const dashboardService = {
  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();

    // Fetch Service Stats
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('status, created_at, returned_at, final_amount');
    
    if (servicesError) throw servicesError;

    const inProgress = services?.filter(s => s.status === 'In Progress').length || 0;
    const waitingForParts = services?.filter(s => s.status === 'Waiting for Parts').length || 0;
    const completedNotReturned = services?.filter(s => s.status === 'Completed').length || 0;
    const received = services?.filter(s => s.status === 'Received').length || 0;
    
    const registeredToday = services?.filter(s => new Date(s.created_at) >= today).length || 0;
    const completedToday = services?.filter(s => s.status === 'Completed' && new Date(s.created_at) >= today).length || 0;
    const returnedToday = services?.filter(s => s.status === 'Returned' && new Date(s.returned_at) >= today).length || 0;
    
    const serviceRevenueToday = services?.filter(s => s.status === 'Returned' && new Date(s.returned_at) >= today)
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
      registeredToday,
      completedToday,
      notRepairableToday: 0,
      returnedToday,
      salesToday,
      revenueToday: serviceRevenueToday + salesRevenueToday,
    };
  },

  async getRecentActivity(limit = 5) {
    const { data, error } = await supabase
      .from('service_status_history')
      .select('*, services(customer_name, device_model)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }
};
