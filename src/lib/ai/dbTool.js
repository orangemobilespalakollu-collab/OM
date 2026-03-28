import { supabase } from '@/lib/supabase';

function applyDateRange(query, startDate, endDate) {
  if (startDate) {
    const startIso = new Date(startDate).toISOString();
    query = query.gte('created_at', startIso);
  }

  if (endDate) {
    const endIso = new Date(endDate).toISOString();
    query = query.lte('created_at', endIso);
  }

  return query;
}

export async function fetchSalesData(filters = {}) {
  const { startDate, endDate } = filters;
  let query = supabase.from('sales').select('*');
  query = applyDateRange(query, startDate, endDate);
  const { data, error } = await query.order('created_at', { ascending: false });
  return {
    records: data ?? [],
    error: error?.message || null,
  };
}

export async function fetchServiceData(filters = {}) {
  const { startDate, endDate } = filters;
  let query = supabase.from('services').select('*');
  query = applyDateRange(query, startDate, endDate);
  const { data, error } = await query.order('created_at', { ascending: false });
  return {
    records: data ?? [],
    error: error?.message || null,
  };
}

export async function fetchFeedbackData(filters = {}) {
  const { startDate, endDate } = filters;
  let query = supabase.from('feedback').select('*');

  if (startDate) {
    const startIso = new Date(startDate).toISOString();
    query = query.gte('created_at', startIso);
  }

  if (endDate) {
    const endIso = new Date(endDate).toISOString();
    query = query.lte('created_at', endIso);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  return {
    records: data ?? [],
    error: error?.message || null,
  };
}

export async function fetchStrugglesData(filters = {}) {
  const { startDate, endDate } = filters;
  let query = supabase.from('services').select('*');
  query = applyDateRange(query, startDate, endDate);
  query = query.eq('status', 'Not Repairable');
  const { data, error } = await query.order('created_at', { ascending: false });
  return {
    records: data ?? [],
    error: error?.message || null,
  };
}
