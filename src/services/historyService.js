import { supabase } from '@/lib/supabase';

export const historyService = {
  async getServiceHistory(profile) {
    // ADMIN / OWNER -> see all returned services
    if (profile?.role === 'admin' || profile?.role === 'owner') {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          profiles:registered_by(full_name),
          returned_by_profile:returned_by(full_name)
        `)
        .eq('status', 'Returned')
        .order('returned_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }

    // EMPLOYEE / TECHNICIAN -> see services they touched in ANY status
    const { data: touchedHistory, error: historyError } = await supabase
      .from('service_status_history')
      .select('service_id')
      .eq('updated_by', profile.id);

    if (historyError) throw historyError;

    const touchedServiceIds = [...new Set((touchedHistory || []).map(item => item.service_id))];

    // also include directly received / returned services
    const { data: directServices, error: directError } = await supabase
      .from('services')
      .select('id')
      .eq('status', 'Returned')
      .or(`registered_by.eq.${profile.id},returned_by.eq.${profile.id}`);

    if (directError) throw directError;

    const directIds = (directServices || []).map(item => item.id);

    const serviceIds = [...new Set([...touchedServiceIds, ...directIds])];

    if (serviceIds.length === 0) return [];

    const { data, error } = await supabase
      .from('services')
      .select(`
        *,
        profiles:registered_by(full_name),
        returned_by_profile:returned_by(full_name)
      `)
      .eq('status', 'Returned')
      .in('id', serviceIds)
      .order('returned_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getSalesHistory(profile) {
    let query = supabase
      .from('sales')
      .select('*, profiles(full_name)');

    if (profile?.role === 'employee') {
      query = query.eq('recorded_by', profile.id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // ✅ REAL TIMELINE FETCH
  async getServiceTimeline(serviceId) {
    const { data, error } = await supabase
      .from('service_status_history')
      .select(`
        id,
        service_id,
        status,
        updated_by,
        created_at,
        reason,
        profiles!service_status_history_updated_by_fkey(full_name)
      `)
      .eq('service_id', serviceId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }
};
