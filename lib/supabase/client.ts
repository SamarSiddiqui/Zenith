import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseUrl, getSupabaseAnonKey, isSupabaseConfigured } from './env';

/**
 * Creates a browser-side Supabase client for Next.js App Router.
 * Returns null if Supabase environment variables are unconfigured.
 */
export function createClient() {
  if (!isSupabaseConfigured()) {
    // Return null or placeholder client in unconfigured local development mode
    return null;
  }

  return createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey());
}
