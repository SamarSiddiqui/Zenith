import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseAnonKey } from './env';

/**
 * Creates an admin / service-level Supabase client for Webhooks and Cron Jobs.
 * Uses SUPABASE_SERVICE_ROLE_KEY if present, otherwise falls back to anon key.
 */
export function createAdminClient() {
  const url = getSupabaseUrl();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = getSupabaseAnonKey();

  const key = serviceRoleKey || anonKey;

  if (!url || !key) {
    return null;
  }

  return createSupabaseClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
