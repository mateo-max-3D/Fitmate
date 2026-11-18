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

// UUID Utilities (Ensures PostgreSQL UUID compatibility)
export const isValidUUID = (str) => {
  if (!str || typeof str !== 'string') return false;
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(str);
};

export const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
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
    throw new Error('Supabase no está configurado.');
  }
  return await supabase.auth.signInWithPassword({ email, password });
};

export const supabaseSignUp = async (email, password, fullName) => {
  if (!supabase) {
    throw new Error('Supabase no está configurado.');
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

// =========================================================================
// SYNC HELPERS: BODY METRICS
// =========================================================================
export const syncBodyMetricToSupabase = async (metric, explicitUserId = null) => {
  if (!supabase) return false;
  try {
    let uid = explicitUserId;
    if (!uid) {
      const { data: { user } } = await supabase.auth.getUser();
      uid = user?.id;
    }
    if (!uid) {
      console.warn('Cannot sync body metric: No authenticated Supabase user');
      return false;
    }

    const metricId = isValidUUID(metric.id) ? metric.id : generateUUID();
    // Clamp satisfaction to 1..5 for DB constraint
    const rawSat = Number(metric.satisfaction) || 5;
    const sat = Math.max(1, Math.min(5, rawSat > 5 ? Math.round(rawSat / 2) : rawSat));

    const payload = {
      id: metricId,
      user_id: uid,
      recorded_date: metric.date || new Date().toISOString().split('T')[0],
      weight_kg: Number(metric.weight) || 0,
      arm_left_cm: Number(metric.armLeft) || 0,
      arm_right_cm: Number(metric.armRight) || 0,
      running_km: Number(metric.km) || 0,
      satisfaction: sat,
      notes: metric.notes || ''
    };

    const { error } = await supabase.from('body_metrics').upsert([payload]);
    if (error) {
      console.error('Error syncing body metric to Supabase:', error);
      return false;
    }
    console.log('Body metric successfully synced to Supabase! ✅', metricId);
    return metricId;
  } catch (e) {
    console.error('Exception syncing body metric to Supabase:', e);
    return false;
  }
};

export const fetchUserBodyMetrics = async (userId) => {
  if (!supabase || !userId) return [];
  try {
    const { data, error } = await supabase
      .from('body_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_date', { ascending: false });

    if (error) {
      console.error('Error fetching body metrics:', error);
      return [];
    }

    // Map DB fields to frontend model
    return (data || []).map((row) => ({
      id: row.id,
      date: row.recorded_date,
      weight: row.weight_kg,
      armLeft: row.arm_left_cm,
      armRight: row.arm_right_cm,
      km: row.running_km,
      satisfaction: row.satisfaction,
      notes: row.notes || ''
    }));
  } catch (e) {
    console.error('Exception fetching body metrics:', e);
    return [];
  }
};

// =========================================================================
// SYNC HELPERS: ROUTINES
// =========================================================================
export const syncRoutineToSupabase = async (routine, explicitUserId = null) => {
  if (!supabase) return false;
  try {
    let uid = explicitUserId;
    if (!uid) {
      const { data: { user } } = await supabase.auth.getUser();
      uid = user?.id;
    }
    if (!uid) {
      console.warn('Cannot sync routine: No authenticated Supabase user');
      return false;
    }

    const routineId = isValidUUID(routine.id) ? routine.id : generateUUID();

    // 1. Try upserting routine (with exercises JSON column if available)
    let payload = {
      id: routineId,
      user_id: uid,
      name: routine.name.trim(),
      description: (routine.description || '').trim(),
      color: routine.color || '#344B35',
      exercises: routine.exercises || []
    };

    let { error } = await supabase.from('routines').upsert(payload);

    if (error && error.message && error.message.includes('exercises')) {
      // Fallback: If DB schema doesn't have exercises column yet, save basic metadata
      delete payload.exercises;
      const { error: err2 } = await supabase.from('routines').upsert(payload);
      if (err2) {
        console.error('Error syncing routine fallback:', err2);
        return false;
      }
    } else if (error) {
      console.error('Error syncing routine:', error);
      return false;
    }

    console.log('Routine successfully synced to Supabase! ✅', routine.name, routineId);
    return routineId;
  } catch (e) {
    console.error('Exception syncing routine to Supabase:', e);
    return false;
  }
};

export const deleteRoutineFromSupabase = async (routineId) => {
  if (!supabase || !routineId) return;
  try {
    if (isValidUUID(routineId)) {
      await supabase.from('routines').delete().eq('id', routineId);
    }
  } catch (e) {
    console.error('Error deleting routine from Supabase:', e);
  }
};

export const fetchUserRoutines = async (userId) => {
  if (!supabase || !userId) return null;
  try {
    const { data, error } = await supabase
      .from('routines')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching routines:', error);
      return null;
    }

    if (!data || data.length === 0) return null;

    const routinesMap = {};
    data.forEach((r) => {
      routinesMap[r.id] = {
        id: r.id,
        name: r.name,
        description: r.description || '',
        color: r.color || '#344B35',
        exercises: Array.isArray(r.exercises) ? r.exercises : []
      };
    });
    return routinesMap;
  } catch (e) {
    console.error('Exception fetching routines:', e);
    return null;
  }
};

// =========================================================================
// SYNC ALL PENDING LOCAL DATA TO SUPABASE (Run on login/app mount)
// =========================================================================
export const syncAllLocalDataToSupabase = async (routines, bodyMetrics, userId) => {
  if (!supabase || !userId) return;
  console.log('Starting full local-to-cloud sync for athlete:', userId);

  // 1. Sync all routines
  if (routines && typeof routines === 'object') {
    for (const r of Object.values(routines)) {
      await syncRoutineToSupabase(r, userId);
    }
  }

  // 2. Sync all body metrics
  if (Array.isArray(bodyMetrics) && bodyMetrics.length > 0) {
    for (const m of bodyMetrics) {
      await syncBodyMetricToSupabase(m, userId);
    }
  }
};
