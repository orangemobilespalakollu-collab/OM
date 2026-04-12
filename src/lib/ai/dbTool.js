import { supabase } from '@/lib/supabase';

function applyDateRange(query, startDate, endDate, dateColumn = 'created_at') {
  if (startDate && startDate.trim() !== '') {
    const startObj = new Date(startDate);
    startObj.setHours(0, 0, 0, 0);
    query = query.gte(dateColumn, startObj.toISOString());
  }

  if (endDate && endDate.trim() !== '') {
    const endObj = new Date(endDate);
    endObj.setHours(23, 59, 59, 999);
    query = query.lte(dateColumn, endObj.toISOString());
  }

  return query;
}

export async function fetchSalesData(filters = {}) {
  const { startDate, endDate } = filters;
  let query = supabase.from('sales').select('*');
  query = applyDateRange(query, startDate, endDate, 'created_at');
  const { data, error } = await query.order('created_at', { ascending: false });
  return {
    records: data ?? [],
    error: error?.message || null,
  };
}

export async function fetchServiceData(filters = {}) {
  const { startDate, endDate } = filters;
  let query = supabase.from('services').select('*');
  query = applyDateRange(query, startDate, endDate, 'created_at');
  const { data, error } = await query.order('created_at', { ascending: false });
  return {
    records: data ?? [],
    error: error?.message || null,
  };
}

export async function fetchFeedbackData(filters = {}) {
  const { startDate, endDate } = filters;
  let query = supabase.from('feedback').select('*');
  query = applyDateRange(query, startDate, endDate, 'created_at');
  const { data, error } = await query.order('created_at', { ascending: false });
  return {
    records: data ?? [],
    error: error?.message || null,
  };
}

export async function fetchStrugglesData(filters = {}) {
  const { startDate, endDate } = filters;
  
  // Query the status history table because the main table overwrites 'status' to 'Returned'
  let query = supabase.from('service_status_history')
    .select(`
      created_at,
      reason,
      services (
        ticket_number,
        device_brand,
        device_model,
        issue_type,
        issue_description,
        customer_mobile
      )
    `);
  
  query = applyDateRange(query, startDate, endDate, 'created_at');
  
  // Use fuzzy match in case of invisible trailing spaces or typos in the DB
  query = query.ilike('status', '%repairable%');
  
  const { data, error } = await query.order('created_at', { ascending: false });

  // Flatten the relation so langGraphClient mapping finds exactly what it expects
  const formattedData = data?.map(row => ({
    ...(row.services || {}),
    created_at: row.created_at,
    issue_description: row.reason ? `Mechanic Reason: ${row.reason} | Original Issue: ${row.services?.issue_description || ''}` : row.services?.issue_description,
  })) || [];

  return {
    records: formattedData,
    error: error?.message || null,
  };
}
