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
    // 1) Get existing photo URLs first
    const { data: existingService, error: fetchError } = await supabase
      .from('services')
      .select('customer_photo_url, device_front_photo_url, device_back_photo_url')
      .eq('id', serviceId)
      .single();

    if (fetchError) throw fetchError;

    // 2) Extract storage file paths from public URLs
    const urls = [
      existingService?.customer_photo_url,
      existingService?.device_front_photo_url,
      existingService?.device_back_photo_url,
    ].filter(Boolean);

    const filePaths = urls
      .map((url) => {
        try {
          const marker = '/storage/v1/object/public/service-photos/';
          const index = url.indexOf(marker);
          return index !== -1 ? url.substring(index + marker.length) : null;
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    // 3) Delete files from Supabase Storage (only if paths exist)
    if (filePaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from('service-photos')
        .remove(filePaths);

      if (storageError) {
        console.error('Error deleting storage files:', storageError);
        // not throwing here so return flow won't break
      }
    }

    // 4) Update DB record
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

    // 5) Add history entry
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
