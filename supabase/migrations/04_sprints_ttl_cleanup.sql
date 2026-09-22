-- 04_sprints_ttl_cleanup.sql
-- Automated 30-Day TTL Cleanup for Archived / Completed Sprints

-- 1. Create cleanup function to purge completed sprints older than 30 days
CREATE OR REPLACE FUNCTION public.cleanup_expired_sprints()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.sprints
  WHERE status = 'completed'
    AND end_date < (NOW() - INTERVAL '30 days');
    
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- 2. Optional: If pg_cron extension is enabled on Supabase, schedule daily cleanup at 03:00 UTC
-- (Run in Supabase SQL editor if pg_cron is enabled in your project extensions)
-- SELECT cron.schedule(
--   'cleanup-expired-sprints-daily',
--   '0 3 * * *',
--   $$SELECT public.cleanup_expired_sprints();$$
-- );
