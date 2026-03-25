import { supabase } from '@/lib/supabase';

export const historyService = {
  async getServiceHistory(profile) {
    let query = supabase.from('services').select('*').eq('status', 'Returned');
    
    // Employee restriction: only their own
    if (profile?.role === 'employee') {
      query = query.or(`registered_by.eq.${profile.id},returned_by.eq.${profile.id}`);
    }

    const { data, error } = await query.order('returned_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getSalesHistory(profile) {
    let query = supabase.from('sales').select('*, profiles(full_name)');
    
    if (profile?.role === 'employee') {
      query = query.eq('recorded_by', profile.id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }
};
