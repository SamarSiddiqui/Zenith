-- 05_telegram_bot_schema.sql
-- Telegram Bot End-of-Day (EOD) Habit Reminders & Interactive Notifications

-- 1. Add Telegram columns to public.profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS telegram_chat_id VARCHAR(64),
  ADD COLUMN IF NOT EXISTS telegram_username VARCHAR(120),
  ADD COLUMN IF NOT EXISTS telegram_link_token VARCHAR(64) UNIQUE,
  ADD COLUMN IF NOT EXISTS telegram_reminders_enabled BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS telegram_eod_time TIME DEFAULT '20:00';

-- 2. Index for high-efficiency webhook and link lookup
CREATE INDEX IF NOT EXISTS idx_profiles_telegram_chat_id ON public.profiles(telegram_chat_id);
CREATE INDEX IF NOT EXISTS idx_profiles_telegram_link_token ON public.profiles(telegram_link_token);

-- 3. Function to link Telegram chat ID via secure link token (bypasses RLS)
CREATE OR REPLACE FUNCTION public.link_telegram_chat(
  p_link_token VARCHAR,
  p_chat_id VARCHAR,
  p_username VARCHAR DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  full_name VARCHAR,
  email VARCHAR
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.profiles
  SET 
    telegram_chat_id = p_chat_id,
    telegram_username = COALESCE(p_username, telegram_username),
    telegram_link_token = NULL, -- single-use consumption
    telegram_reminders_enabled = TRUE,
    updated_at = TIMEZONE('utc'::text, NOW())
  WHERE telegram_link_token = p_link_token
  RETURNING profiles.id, profiles.full_name, profiles.email;
END;
$$;

-- 4. Function to get user profile by Telegram chat ID (bypasses RLS for bot commands)
CREATE OR REPLACE FUNCTION public.get_telegram_profile(
  p_chat_id VARCHAR
)
RETURNS TABLE (
  id UUID,
  full_name VARCHAR,
  email VARCHAR,
  telegram_reminders_enabled BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT profiles.id, profiles.full_name, profiles.email, profiles.telegram_reminders_enabled
  FROM public.profiles
  WHERE profiles.telegram_chat_id = p_chat_id
  LIMIT 1;
END;
$$;

-- 5. Function to get status and habits in one call (bypasses RLS for /status command)
CREATE OR REPLACE FUNCTION public.get_telegram_status(
  p_chat_id VARCHAR
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_user_name VARCHAR;
  v_habits JSONB;
BEGIN
  -- 1. Find user by telegram_chat_id
  SELECT profiles.id, profiles.full_name INTO v_user_id, v_user_name
  FROM public.profiles
  WHERE profiles.telegram_chat_id = p_chat_id
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- 2. Fetch active habits
  SELECT COALESCE(jsonb_agg(to_jsonb(h)), '[]'::jsonb) INTO v_habits
  FROM (
    SELECT id, name, window_label, duration_minutes, current_status, weekly_history, micro_version
    FROM public.habits
    WHERE user_id = v_user_id
    ORDER BY created_at ASC
  ) h;

  RETURN jsonb_build_object(
    'userId', v_user_id,
    'userName', COALESCE(v_user_name, 'Zenith User'),
    'habits', v_habits
  );
END;
$$;

-- 6. Function to record habit completion or micro-step from Telegram (bypasses RLS)
CREATE OR REPLACE FUNCTION public.record_telegram_habit_action(
  p_habit_id UUID,
  p_day_index INT,
  p_status VARCHAR DEFAULT 'completed',
  p_health_boost INT DEFAULT 90
)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  current_status VARCHAR,
  health_score INT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.habits
  SET
    current_status = p_status,
    health_score = p_health_boost,
    weekly_history = jsonb_set(
      COALESCE(weekly_history, '["unlogged","unlogged","unlogged","unlogged","unlogged","unlogged","unlogged"]'::jsonb),
      ARRAY[p_day_index::text],
      to_jsonb(p_status)
    ),
    updated_at = TIMEZONE('utc'::text, NOW())
  WHERE habits.id = p_habit_id
  RETURNING habits.id, habits.name, habits.current_status::VARCHAR, habits.health_score INTO id, name, current_status, health_score;

  RETURN NEXT;
END;
$$;

-- 7. Function to fetch all active telegram reminder users for cron (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_telegram_eod_users()
RETURNS TABLE (
  id UUID,
  full_name VARCHAR,
  telegram_chat_id VARCHAR,
  telegram_reminders_enabled BOOLEAN,
  working_window JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    profiles.id, 
    profiles.full_name, 
    profiles.telegram_chat_id, 
    profiles.telegram_reminders_enabled,
    profiles.working_window
  FROM public.profiles
  WHERE profiles.telegram_chat_id IS NOT NULL 
    AND profiles.telegram_reminders_enabled = TRUE;
END;
$$;

-- 8. Function to safely set telegram link token (bypasses RLS)
CREATE OR REPLACE FUNCTION public.set_telegram_link_token(
  p_user_id UUID,
  p_link_token VARCHAR
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET 
    telegram_link_token = p_link_token,
    updated_at = TIMEZONE('utc'::text, NOW())
  WHERE id = p_user_id;

  RETURN FOUND;
END;
$$;

-- 9. Grant execution permissions to API roles
GRANT EXECUTE ON FUNCTION public.link_telegram_chat(VARCHAR, VARCHAR, VARCHAR) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_telegram_profile(VARCHAR) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_telegram_status(VARCHAR) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.record_telegram_habit_action(UUID, INT, VARCHAR, INT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_telegram_eod_users() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.set_telegram_link_token(UUID, VARCHAR) TO anon, authenticated, service_role;
