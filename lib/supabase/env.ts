/**
 * Zenith Supabase Environment Helpers
 * Safely validates whether live Supabase keys are configured.
 */

export const getSupabaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || '';
};

export const getSupabaseAnonKey = (): string => {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
};

export const isSupabaseConfigured = (): boolean => {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  return Boolean(
    url &&
    anonKey &&
    url.startsWith('https://') &&
    url.includes('.supabase.co') &&
    anonKey.length > 20 &&
    !url.includes('your-project-url') &&
    !anonKey.includes('your-anon-key')
  );
};
