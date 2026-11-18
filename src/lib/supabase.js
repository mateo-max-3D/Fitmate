import { createClient } from '@supabase/supabase-js';

// Default project credentials
const DEFAULT_URL = 'https://hgtfhfprszmpmcjyxkxo.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhndGZoZnByc3ptcG1janl4a3hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUwMDAxNjUsImV4cCI6MjExMDU3NjE2NX0.Y1B3a-L3pu37BROVLrhuPGrDs2uu7z_JH--kgrfJXbE';

const cleanUrl = (url) => {
  if (!url) return '';
  let u = url.trim();
  if (u.endsWith('/rest/v1/')) u = u.replace(/\/rest\/v1\/$/, '');
  if (u.endsWith('/rest/v1')) u = u.replace(/\/rest\/v1$/, '');
  if (u.endsWith('/')) u = u.slice(0, -1);
  return u;
};

// Get configuration from env or localStorage or defaults
const getSavedCredentials = () => {
  try {
    const saved = localStorage.getItem('got_supabase_config') || localStorage.getItem('fitmate_supabase_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.key) {
        return { url: cleanUrl(parsed.url), key: parsed.key.trim() };
      }
    }
  } catch (e) {
    console.error('Error reading saved supabase credentials', e);
  }
  return {
    url: cleanUrl(import.meta.env.VITE_SUPABASE_URL) || DEFAULT_URL,
    key: (import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_KEY).trim()
  };
};

let credentials = getSavedCredentials();
export let supabase = (credentials.url && credentials.key) 
  ? createClient(credentials.url, credentials.key) 
  : null;

export const updateSupabaseClient = (url, key) => {
  credentials = { url: cleanUrl(url), key: key.trim() };
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
