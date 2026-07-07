import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let supabase = null;

export const getSupabaseBrowserClient = () => {
  if (!isSupabaseConfigured) return null;
  if (!supabase) {
    supabase = createBrowserClient(
      supabaseUrl,
      supabaseAnonKey
    );
  }
  return supabase;
};

