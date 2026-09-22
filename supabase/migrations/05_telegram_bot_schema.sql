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

-- 3. Function to link Telegram chat ID via secure link token
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
