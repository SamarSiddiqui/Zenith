-- ==============================================================================
-- ZENITH HIGH-PERFORMANCE DATABASE SCHEMA & ROW LEVEL SECURITY (SUPABASE)
-- Optimized for ultra-low disk I/O (<5MB/s), indexed joins, and lean payload footprint
-- ==============================================================================

-- 1. Create Profiles Table (Linked to Supabase Auth Users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(120),
  avatar_url VARCHAR(512),
  working_window JSONB DEFAULT '{"startTime": "09:00", "endTime": "19:00", "timezone": "UTC", "activeDays": [1, 2, 3, 4, 5]}'::jsonb,
  onboarded BOOLEAN DEFAULT FALSE,
  theme_preference VARCHAR(16) DEFAULT 'system',
  mindful_reminders BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Enable Row Level Security on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Optimized RLS Policies for Profiles (Evaluates auth.uid() once per statement)
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- 4. Auto-Updating `updated_at` Timestamp Trigger Function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 5. Trigger for Automatic User Profile Creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, working_window, onboarded)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    '{"startTime": "09:00", "endTime": "19:00", "timezone": "UTC", "activeDays": [1, 2, 3, 4, 5]}'::jsonb,
    FALSE
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 6. High-Performance Habits Table
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

-- 7. High-Performance B-Tree Indexes for Habits (Sub-Millisecond I/O)
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON public.habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_user_circadian ON public.habits(user_id, circadian_slot);
CREATE INDEX IF NOT EXISTS idx_habits_user_created ON public.habits(user_id, created_at DESC);

-- 8. Auto-Updating `updated_at` Trigger for Habits
CREATE OR REPLACE TRIGGER set_habits_updated_at
  BEFORE UPDATE ON public.habits
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 9. Optimized RLS Policies for Habits
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

-- 10. High-Performance Sprints & Retrospectives Table (1 to 15 Days)
CREATE TABLE IF NOT EXISTS public.sprints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sprint_number INTEGER NOT NULL DEFAULT 1,
  duration_days SMALLINT DEFAULT 7 CHECK (duration_days >= 1 AND duration_days <= 15),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status VARCHAR(16) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  sprint_goal VARCHAR(255),
  habit_snapshots JSONB DEFAULT '[]'::jsonb,
  analytics JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 11. High-Performance B-Tree Indexes for Sprints
CREATE INDEX IF NOT EXISTS idx_sprints_user_id ON public.sprints(user_id);
CREATE INDEX IF NOT EXISTS idx_sprints_user_status ON public.sprints(user_id, status);
CREATE INDEX IF NOT EXISTS idx_sprints_user_number ON public.sprints(user_id, sprint_number DESC);

-- 12. Auto-Updating Trigger for Sprints
CREATE OR REPLACE TRIGGER set_sprints_updated_at
  BEFORE UPDATE ON public.sprints
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 13. Optimized RLS Policies for Sprints
ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sprints"
  ON public.sprints
  FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own sprints"
  ON public.sprints
  FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own sprints"
  ON public.sprints
  FOR UPDATE
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own sprints"
  ON public.sprints
  FOR DELETE
  USING ((SELECT auth.uid()) = user_id);
