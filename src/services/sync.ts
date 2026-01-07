/**
 * Cloud sync service for TradeMaster.
 * Handles synchronization between localStorage and Supabase.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Profile } from '../types/database';
import { loadProgress, saveProgress, type SavedProgress } from './storage';

// Session insert type for cloud submission
interface CloudSessionInsert {
  user_id: string;
  symbol: string;
  starting_balance?: number;
  final_balance: number;
  total_trades?: number;
  wins?: number;
  losses?: number;
  max_streak?: number;
  max_drawdown?: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  xp_earned?: number;
  pnl_percent?: number;
  stock_baseline_move?: number | null;
  beat_market_delta?: number | null;
  mystery_mode?: boolean;
  leverage_used?: number;
  duration_seconds?: number | null;
}

// Achievement insert type
interface CloudAchievementInsert {
  user_id: string;
  achievement_id: string;
}

// Cloud profile type (what comes back from Supabase)
interface CloudProfile {
  id: string;
  total_profit: number;
  total_trades: number;
  total_sessions: number;
  total_wins: number;
  total_losses: number;
  best_session_pnl: number;
  best_streak: number;
  level: number;
  xp: number;
  daily_streak: number;
  [key: string]: unknown;
}

// Cloud achievement type
interface CloudAchievement {
  achievement_id: string;
}

/**
 * Sync local progress with cloud.
 * Uses "highest value wins" merge strategy for stats.
 */
export async function syncProgress(userId: string): Promise<{ success: boolean; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    // Load local progress
    const local = loadProgress();

    // Fetch cloud profile
    const { data: cloudProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching cloud profile:', fetchError);
      return { success: false, error: fetchError.message };
    }

    const profile = cloudProfile as unknown as CloudProfile;

    // Merge: Take highest values
    const merged: SavedProgress = {
      ...local,
      totalProfit: Math.max(local.totalProfit, Number(profile.total_profit) || 0),
      totalTrades: Math.max(local.totalTrades, profile.total_trades || 0),
      totalSessions: Math.max(local.totalSessions, profile.total_sessions || 0),
      totalWins: Math.max(local.totalWins, profile.total_wins || 0),
      totalLosses: Math.max(local.totalLosses, profile.total_losses || 0),
      bestSessionPnL: Math.max(local.bestSessionPnL, Number(profile.best_session_pnl) || 0),
      bestStreak: Math.max(local.bestStreak, profile.best_streak || 0),
      level: Math.max(local.level, profile.level || 1),
      xp: Math.max(local.xp, profile.xp || 0),
      dailyStreak: Math.max(local.dailyStreak, profile.daily_streak || 0),
    };

    // Sync achievements from cloud
    const { data: cloudAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId);

    const achievements = (cloudAchievements || []) as unknown as CloudAchievement[];

    if (achievements.length > 0) {
      const cloudAchievementIds = achievements.map(a => a.achievement_id);
      merged.achievements = [...new Set([...local.achievements, ...cloudAchievementIds])];
    }

    // Save merged progress locally
    saveProgress(merged);

    // Update cloud with merged stats
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        level: merged.level,
        xp: merged.xp,
        total_profit: merged.totalProfit,
        total_trades: merged.totalTrades,
        total_sessions: merged.totalSessions,
        total_wins: merged.totalWins,
        total_losses: merged.totalLosses,
        best_session_pnl: merged.bestSessionPnL,
        best_streak: merged.bestStreak,
        daily_streak: merged.dailyStreak,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating cloud profile:', updateError);
      return { success: false, error: updateError.message };
    }

    // Upload any local achievements not in cloud
    const localOnlyAchievements = local.achievements.filter(
      id => !achievements.some(a => a.achievement_id === id)
    );

    if (localOnlyAchievements.length > 0) {
      const achievementsToInsert: CloudAchievementInsert[] = localOnlyAchievements.map(id => ({
        user_id: userId,
        achievement_id: id,
      }));

      await supabase.from('user_achievements').upsert(achievementsToInsert as never, {
        onConflict: 'user_id,achievement_id',
      });
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Sync error:', err);
    return { success: false, error: 'Sync failed' };
  }
}

/**
 * Submit a completed session to the cloud.
 */
export async function submitSession(
  userId: string,
  session: Omit<CloudSessionInsert, 'user_id'>
): Promise<{ success: boolean; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  const sessionData: CloudSessionInsert = {
    user_id: userId,
    ...session,
  };

  const { error } = await supabase.from('sessions').insert(sessionData as never);

  if (error) {
    console.error('Error submitting session:', error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

/**
 * Sync a single achievement to cloud.
 */
export async function syncAchievement(
  userId: string,
  achievementId: string
): Promise<{ success: boolean; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  const data: CloudAchievementInsert = {
    user_id: userId,
    achievement_id: achievementId,
  };

  const { error } = await supabase.from('user_achievements').upsert(data as never, {
    onConflict: 'user_id,achievement_id',
  });

  if (error) {
    console.error('Error syncing achievement:', error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

/**
 * Fetch user's cloud profile.
 */
export async function fetchCloudProfile(userId: string): Promise<Profile | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data as unknown as Profile;
}

/**
 * Calculate "Beat the Market" baseline move.
 * This is the stock's raw % change during the session.
 */
export function calculateBaselineMove(
  startPrice: number,
  endPrice: number
): number {
  if (startPrice <= 0) return 0;
  return ((endPrice - startPrice) / startPrice) * 100;
}
