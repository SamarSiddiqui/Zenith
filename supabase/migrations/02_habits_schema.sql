-- 02_habits_schema.sql
-- High-Performance Mindful Habits System

CREATE TABLE IF NOT EXISTS public.habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  window_label VARCHAR(64) NOT NULL,
  duration_minutes SMALLINT DEFAULT 20 CHECK (duration_minutes > 0 AND duration_minutes <= 1440),
  health_score SMALLINT DEFAULT 80 CHECK (health_score >= 0 AND health_score <= 100),
  micro_version VARCHAR(255),
  circadian_slot VARCHAR(16) DEFAULT 'morning' CHECK (circadian_slot IN ('morning', 'afternoon', 'evening', 'anytime')),
  category VARCHAR(32) DEFAULT 'focus' CHECK (category IN ('focus', 'mindfulness', 'physical', 'craft', 'rest')),
  current_status VARCHAR(16) DEFAULT 'unlogged' CHECK (current_status IN ('completed', 'missed', 'unlogged')),
  weekly_history JSONB DEFAULT '["unlogged", "unlogged", "unlogged", "unlogged", "unlogged", "unlogged", "unlogged"]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for Sub-Millisecond Queries
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON public.habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_user_circadian ON public.habits(user_id, circadian_slot);
CREATE INDEX IF NOT EXISTS idx_habits_user_created ON public.habits(user_id, created_at DESC);

-- Auto-Updating `updated_at` Trigger
CREATE OR REPLACE TRIGGER set_habits_updated_at
  BEFORE UPDATE ON public.habits
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Single-Evaluation Row Level Security
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own habits"
  ON public.habits
  FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own habits"
  ON public.habits
  FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own habits"
  ON public.habits
  FOR UPDATE
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own habits"
  ON public.habits
  FOR DELETE
  USING ((SELECT auth.uid()) = user_id);
