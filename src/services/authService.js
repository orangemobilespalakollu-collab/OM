import { supabase } from '@/lib/supabase';

export const authService = {
  async login(mobile, password, loginType) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('mobile', mobile)
      .eq('password', password) // In a real app, use hashing. For now, matching plain text as requested.
      .single();

    if (error || !profile) {
      throw new Error('Invalid mobile number or password');
    }

    if (profile.role !== loginType) {
      throw new Error(`This account is not registered as an ${loginType}`);
    }

    // Store session in localStorage
    localStorage.setItem('orange_session', JSON.stringify(profile));
    return { user: profile, profile };
  },

  async logout() {
    localStorage.removeItem('orange_session');
  },

  async checkAdminExists() {
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin');

      if (error) throw error;
      return count !== null && count > 0;
    } catch (err) {
      console.error('Error checking admin:', err);
      return false;
    }
  },

  async registerAdmin(mobile, password, name) {
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          full_name: name,
          mobile: mobile,
          password: password,
          role: 'admin',
          is_first_login: false,
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') throw new Error('Mobile number already registered');
      throw error;
    }

    // Store session
    localStorage.setItem('orange_session', JSON.stringify(data));
    return data;
  }
};
