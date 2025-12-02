import { createClient } from '@supabase/supabase-js';

// Replace these with your Supabase project credentials
// To use this feature:
// 1. Create a Supabase project at https://supabase.com
// 2. Replace the URL and anon key below
// 3. Create a 'teams' table with the schema described in the README

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

console.log('🔧 Supabase Config:', {
  url: supabaseUrl ? '✅ Configured' : '❌ Missing',
  key: supabaseAnonKey ? '✅ Configured' : '❌ Missing',
  enabled: !!(supabaseUrl && supabaseAnonKey)
});

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseEnabled = () => {
  return supabase !== null;
};
