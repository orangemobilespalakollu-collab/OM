import { supabase } from '@/lib/supabase';

export const salesService = {
  async getTodaySales() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('sales')
      .select('*, profiles(full_name)')
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async recordSale(formData, userId) {
    const { error } = await supabase.from('sales').insert({
      product_name: formData.product_name,
      brand_type: formData.brand_type,
      quantity: formData.quantity,
      price: parseFloat(formData.price),
      recorded_by: userId
    });

    if (error) throw error;
  }
};
