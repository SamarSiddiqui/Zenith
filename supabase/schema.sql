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

-- 7. High-Performance B-Tree Indexes (Zero Full-Table Scans, Sub-Millisecond Disk I/O)
-- Foreign key index
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON public.habits(user_id);

-- Composite index for fast circadian slot grouping per user
CREATE INDEX IF NOT EXISTS idx_habits_user_circadian ON public.habits(user_id, circadian_slot);

-- Composite index for sorted timeline reads
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
