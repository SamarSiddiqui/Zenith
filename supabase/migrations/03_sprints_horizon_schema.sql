-- 03_sprints_horizon_schema.sql
-- High-Performance Dynamic Sprints Horizon (1 to 15 Days) & Retrospective Analytics

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

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_sprints_user_id ON public.sprints(user_id);
CREATE INDEX IF NOT EXISTS idx_sprints_user_status ON public.sprints(user_id, status);
CREATE INDEX IF NOT EXISTS idx_sprints_user_number ON public.sprints(user_id, sprint_number DESC);

-- Auto-Updating `updated_at` Trigger
CREATE OR REPLACE TRIGGER set_sprints_updated_at
  BEFORE UPDATE ON public.sprints
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Single-Evaluation Row Level Security
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
