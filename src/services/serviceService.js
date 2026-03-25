import { supabase } from '@/lib/supabase';
import { generateTicketNumber } from '@/lib/utils';

export const serviceService = {
  async getActiveServices() {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .neq('status', 'Returned')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getServiceHistory(serviceId) {
    const { data, error } = await supabase
      .from('service_status_history')
      .select('*, profiles(full_name)')
      .eq('service_id', serviceId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async registerService(formData, photos, userId) {
    const { count } = await supabase.from('services').select('*', { count: 'exact', head: true });
    const ticket_number = generateTicketNumber(count || 0);

    const photoUrls = {};
    const photoMapping = {
      customer: 'customer_photo_url',
      front: 'device_front_photo_url',
      back: 'device_back_photo_url'
    };

    for (const [key, file] of Object.entries(photos)) {
      if (file) {
        const path = `${ticket_number}/${key}_${Date.now()}.jpg`;
        const { error } = await supabase.storage.from('service-photos').upload(path, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('service-photos').getPublicUrl(path);
        photoUrls[photoMapping[key]] = publicUrl;
      }
    }

    const { data: service, error } = await supabase.from('services').insert({
      ticket_number,
      customer_mobile: formData.customer_mobile,
      customer_name: formData.customer_name,
      customer_address: formData.customer_address,
      device_brand: formData.device_brand,
      device_model: formData.device_model,
      imei: formData.imei,
      issue_type: formData.issue_type,
      issue_description: formData.issue_description,
      estimated_cost: parseFloat(formData.estimated_cost) || 0,
      status: 'Received',
      registered_by: userId,
      ...photoUrls
    }).select().single();

    if (error) throw error;

    await supabase.from('service_status_history').insert({
      service_id: service.id,
      status: 'Received',
      updated_by: userId
    });

    return service;
  },

  async updateStatus(serviceId, newStatus, userId, reason = '') {
    const { error } = await supabase
      .from('services')
      .update({ status: newStatus })
      .eq('id', serviceId);

    if (error) throw error;

    await supabase.from('service_status_history').insert({
      service_id: serviceId,
      status: newStatus,
      updated_by: userId,
      reason: reason
    });
  },

  async returnService(serviceId, finalAmount, userId) {
    const { error } = await supabase
      .from('services')
      .update({ 
        status: 'Returned', 
        final_amount: parseFloat(finalAmount),
        returned_by: userId,
        returned_at: new Date().toISOString(),
        customer_photo_url: null,
        device_front_photo_url: null,
        device_back_photo_url: null,
        imei: null
      })
      .eq('id', serviceId);

    if (error) throw error;

    await supabase.from('service_status_history').insert({
      service_id: serviceId,
      status: 'Returned',
      updated_by: userId
    });
  },

  async getCustomerLastDetails(mobile) {
    const { data, error } = await supabase
      .from('services')
      .select('customer_name, customer_address')
      .eq('customer_mobile', mobile)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
};
