import { createClient } from '@supabase/supabase-js';

// Get configuration from env or localStorage
const getSavedCredentials = () => {
  try {
    const saved = localStorage.getItem('got_supabase_config') || localStorage.getItem('fitmate_supabase_config');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error reading saved supabase credentials', e);
  }
  return {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    key: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  };
};

let credentials = getSavedCredentials();
export let supabase = (credentials.url && credentials.key) 
  ? createClient(credentials.url, credentials.key) 
  : null;

export const updateSupabaseClient = (url, key) => {
  credentials = { url: url.trim(), key: key.trim() };
  localStorage.setItem('got_supabase_config', JSON.stringify(credentials));
  if (credentials.url && credentials.key) {
    try {
      supabase = createClient(credentials.url, credentials.key);
      return true;
    } catch (e) {
      console.error('Failed to create supabase client', e);
      supabase = null;
      return false;
    }
  } else {
    supabase = null;
    return false;
  }
};

export const getSupabaseConfig = () => credentials;

// Auth Helpers
export const supabaseSignIn = async (email, password) => {
  if (!supabase) {
    throw new Error('Supabase no está configurado. Conectá tus credenciales en el modal.');
  }
  return await supabase.auth.signInWithPassword({ email, password });
};

export const supabaseSignUp = async (email, password, fullName) => {
  if (!supabase) {
    throw new Error('Supabase no está configurado. Conectá tus credenciales en el modal.');
  }
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName }
    }
  });
};

export const supabaseSignOut = async () => {
  if (supabase) {
    await supabase.auth.signOut();
  }
};

// Sync Helpers (Offline-first to Cloud)
export const syncBodyMetricToSupabase = async (metric) => {
  if (!supabase) return false;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase.from('body_metrics').insert([{
      user_id: user.id,
      recorded_date: metric.date,
      weight_kg: metric.weight,
      arm_left_cm: metric.armLeft,
      arm_right_cm: metric.armRight,
      km_run_accumulated: metric.km,
      satisfaction: metric.satisfaction,
      notes: metric.notes
    }]);

    return !error;
  } catch (e) {
    console.error('Error syncing body metric to Supabase', e);
    return false;
  }
};
