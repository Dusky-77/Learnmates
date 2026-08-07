import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
  },
});

/** Redirect URL for OAuth — must match an entry in Supabase → Auth → URL Configuration. */
export function getAuthRedirectUrl(path = '/login'): string {
  const configuredOrigin = import.meta.env.VITE_APP_URL?.replace(/\/$/, '');
  const origin = configuredOrigin || window.location.origin;
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
}