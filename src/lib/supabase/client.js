import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let supabase = null;
let currentUserId = null;

export const setSupabaseUserId = (userId) => {
  currentUserId = userId;
};

export const getSupabaseBrowserClient = (userId = null) => {
  if (!isSupabaseConfigured) return null;
  if (userId) currentUserId = userId;

  if (!supabase) {
    supabase = createBrowserClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          fetch: async (url, options = {}) => {
            const headers = new Headers(options.headers || {});
            if (currentUserId) {
              headers.set('x-user-id', String(currentUserId));
            }
            return fetch(url, { ...options, headers });
          }
        }
      }
    );
  }
  return supabase;
};
