-- TradeMaster Database Schema
-- Run this in the Supabase SQL Editor
-- Project: https://supabase.com/dashboard/project/dslmwsdbkaciwljnxxjt

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,

  -- Progression (synced from local)
  level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 100),
  xp INTEGER DEFAULT 0 CHECK (xp >= 0),

  -- Lifetime stats
  total_profit DECIMAL(12,2) DEFAULT 0,
  total_trades INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  total_losses INTEGER DEFAULT 0,
  best_session_pnl DECIMAL(12,2) DEFAULT 0,
  best_streak INTEGER DEFAULT 0,

  -- Beat the Market cumulative score (skill metric)
  beat_market_score DECIMAL(8,4) DEFAULT 0,

  -- Engagement
  daily_streak INTEGER DEFAULT 0,
  last_played_at TIMESTAMPTZ,

  -- Referral system
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES public.profiles(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SESSIONS TABLE (for leaderboards)
-- ============================================

CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- Stock info
  symbol TEXT NOT NULL,

  -- Results
  starting_balance DECIMAL(12,2) DEFAULT 10000,
  final_balance DECIMAL(12,2) NOT NULL,

  -- Trade stats
  total_trades INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  max_streak INTEGER DEFAULT 0,
  max_drawdown DECIMAL(5,4) DEFAULT 0,

  -- Grading
  grade CHAR(1) CHECK (grade IN ('S','A','B','C','D','F')),
  xp_earned INTEGER DEFAULT 0,

  -- Beat the Market calculation
  pnl_percent DECIMAL(8,4), -- Player's return %
  stock_baseline_move DECIMAL(8,4), -- Stock's raw % move during session
  beat_market_delta DECIMAL(8,4), -- pnl_percent - stock_baseline_move

  -- Metadata
  mystery_mode BOOLEAN DEFAULT FALSE,
  leverage_used INTEGER DEFAULT 1,
  duration_seconds INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ACHIEVEMENTS TABLE (cloud sync)
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, self write
DROP POLICY IF EXISTS "Profiles viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Sessions: Public read, self insert
DROP POLICY IF EXISTS "Sessions viewable by everyone" ON public.sessions;
CREATE POLICY "Sessions viewable by everyone" ON public.sessions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own sessions" ON public.sessions;
CREATE POLICY "Users can insert own sessions" ON public.sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Achievements: Public read, self insert
DROP POLICY IF EXISTS "Achievements viewable by everyone" ON public.user_achievements;
CREATE POLICY "Achievements viewable by everyone" ON public.user_achievements
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own achievements" ON public.user_achievements;
CREATE POLICY "Users can insert own achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- INDEXES FOR LEADERBOARD QUERIES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_sessions_user ON public.sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_pnl ON public.sessions(pnl_percent DESC, created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_beat_market ON public.sessions(beat_market_delta DESC, created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_created ON public.sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_symbol ON public.sessions(symbol, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_achievements_user ON public.user_achievements(user_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_count INTEGER;
BEGIN
  LOOP
    code := upper(substr(md5(random()::text), 1, 6));
    SELECT COUNT(*) INTO exists_count FROM public.profiles WHERE referral_code = code;
    EXIT WHEN exists_count = 0;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- NOTE: Profile creation is handled by the app (src/services/auth.ts)
-- We removed the database trigger due to RLS/permission issues with Supabase
-- The app creates the profile immediately after signup using createProfile()

-- Update profile stats after session insert
CREATE OR REPLACE FUNCTION update_profile_after_session()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles SET
    total_sessions = total_sessions + 1,
    total_trades = total_trades + NEW.total_trades,
    total_wins = total_wins + NEW.wins,
    total_losses = total_losses + NEW.losses,
    total_profit = total_profit + (NEW.final_balance - NEW.starting_balance),
    best_session_pnl = GREATEST(best_session_pnl, NEW.final_balance - NEW.starting_balance),
    best_streak = GREATEST(best_streak, NEW.max_streak),
    beat_market_score = beat_market_score + COALESCE(NEW.beat_market_delta, 0),
    xp = xp + NEW.xp_earned,
    last_played_at = NOW(),
    updated_at = NOW()
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update profile after session
DROP TRIGGER IF EXISTS on_session_created ON public.sessions;
CREATE TRIGGER on_session_created
  AFTER INSERT ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION update_profile_after_session();

-- ============================================
-- DONE!
-- ============================================
-- After running this, verify by checking:
-- 1. Tables created: profiles, sessions, user_achievements
-- 2. RLS enabled on all tables
-- 3. Triggers created: on_auth_user_created, on_session_created
