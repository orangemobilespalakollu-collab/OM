import { supabase } from '@/lib/supabase';

export const employeeService = {
  async getEmployees() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'employee')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async registerEmployee(formData) {
    const defaultPassword = `Orange@${formData.mobile.slice(-4)}`;

    // Create profile directly in the profiles table
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          full_name: formData.name,
          mobile: formData.mobile,
          password: defaultPassword,
          role: 'employee',
          is_first_login: true,
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') throw new Error('Mobile number already registered');
      throw error;
    }

    return { defaultPassword };
  },

  async getEmployeeActivity(employeeId) {
    const { data, error } = await supabase
      .from('service_status_history')
      .select('*, services(customer_name, device_model)')
      .eq('updated_by', employeeId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;
    return data || [];
  },

  async resetPassword(employeeId, mobile) {
    const defaultPassword = `Orange@${mobile.slice(-4)}`;
    const { error } = await supabase
      .from('profiles')
      .update({ 
        password: defaultPassword,
        is_first_login: true 
      })
      .eq('id', employeeId);

    if (error) throw error;
    return { defaultPassword };
  }
};
