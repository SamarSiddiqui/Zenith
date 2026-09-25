import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseUrl, getSupabaseAnonKey, isSupabaseConfigured } from './env';

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Creates or retrieves the singleton browser-side Supabase client for Next.js App Router.
 * Returns null if Supabase environment variables are unconfigured.
 */
export function createClient() {
  if (!isSupabaseConfigured()) {
    // Return null or placeholder client in unconfigured local development mode
    return null;
  }

  if (!browserClient) {
    browserClient = createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey());
  }

  return browserClient;
}
