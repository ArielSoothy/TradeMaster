/**
 * Leaderboard service for TradeMaster.
 * Fetches and manages leaderboard data from Supabase.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  level: number;

  // Session data
  symbol: string;
  pnlPercent: number;
  pnlAmount: number;
  beatMarketDelta: number;
  grade: string;
  totalTrades: number;
  maxStreak: number;

  // Metadata
  sessionId: string;
  createdAt: string;
}

export interface ProfileLeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  level: number;

  // Cumulative stats
  totalSessions: number;
  totalProfit: number;
  beatMarketScore: number;
  bestStreak: number;
}

export type LeaderboardType = 'daily' | 'weekly' | 'allTime' | 'beatMarket';
export type LeaderboardMetric = 'pnl' | 'beatMarket';

/**
 * Get session-based leaderboard (daily, weekly, all-time best sessions)
 */
export async function getSessionLeaderboard(
  type: LeaderboardType,
  metric: LeaderboardMetric = 'pnl',
  limit: number = 50
): Promise<LeaderboardEntry[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  // Calculate date filter based on type
  let dateFilter: string | null = null;
  const now = new Date();

  if (type === 'daily') {
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    dateFilter = startOfDay.toISOString();
  } else if (type === 'weekly') {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    dateFilter = startOfWeek.toISOString();
  }

  // Build query
  let query = supabase
    .from('sessions')
    .select(`
      id,
      user_id,
      symbol,
      pnl_percent,
      final_balance,
      starting_balance,
      beat_market_delta,
      grade,
      total_trades,
      max_streak,
      created_at,
      profiles!inner (
        username,
        display_name,
        avatar_url,
        level
      )
    `)
    .not('pnl_percent', 'is', null);

  // Apply date filter
  if (dateFilter) {
    query = query.gte('created_at', dateFilter);
  }

  // Order by metric
  if (metric === 'beatMarket' || type === 'beatMarket') {
    query = query.order('beat_market_delta', { ascending: false, nullsFirst: false });
  } else {
    query = query.order('pnl_percent', { ascending: false });
  }

  // Limit results
  query = query.limit(limit);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }

  // Transform to LeaderboardEntry format
  return (data || []).map((row: any, index: number) => ({
    rank: index + 1,
    userId: row.user_id,
    username: row.profiles?.username || 'Unknown',
    displayName: row.profiles?.display_name,
    avatarUrl: row.profiles?.avatar_url,
    level: row.profiles?.level || 1,
    symbol: row.symbol,
    pnlPercent: Number(row.pnl_percent) || 0,
    pnlAmount: Number(row.final_balance) - Number(row.starting_balance),
    beatMarketDelta: Number(row.beat_market_delta) || 0,
    grade: row.grade || 'C',
    totalTrades: row.total_trades || 0,
    maxStreak: row.max_streak || 0,
    sessionId: row.id,
    createdAt: row.created_at,
  }));
}

/**
 * Get cumulative profile leaderboard (total beat market score)
 */
export async function getProfileLeaderboard(
  limit: number = 50
): Promise<ProfileLeaderboardEntry[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .gt('total_sessions', 0)
    .order('beat_market_score', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching profile leaderboard:', error);
    return [];
  }

  return (data || []).map((row: any, index: number) => ({
    rank: index + 1,
    userId: row.id,
    username: row.username,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    level: row.level || 1,
    totalSessions: row.total_sessions || 0,
    totalProfit: Number(row.total_profit) || 0,
    beatMarketScore: Number(row.beat_market_score) || 0,
    bestStreak: row.best_streak || 0,
  }));
}

/**
 * Get user's rank on a specific leaderboard
 */
export async function getUserRank(
  userId: string,
  type: LeaderboardType
): Promise<number | null> {
  const leaderboard = await getSessionLeaderboard(type, type === 'beatMarket' ? 'beatMarket' : 'pnl', 1000);
  const userEntry = leaderboard.find(entry => entry.userId === userId);
  return userEntry?.rank || null;
}

/**
 * Get user's best session for sharing
 */
export async function getUserBestSession(userId: string): Promise<LeaderboardEntry | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data, error } = await supabase
    .from('sessions')
    .select(`
      id,
      user_id,
      symbol,
      pnl_percent,
      final_balance,
      starting_balance,
      beat_market_delta,
      grade,
      total_trades,
      max_streak,
      created_at,
      profiles!inner (
        username,
        display_name,
        avatar_url,
        level
      )
    `)
    .eq('user_id', userId)
    .order('pnl_percent', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  const row = data as any;
  return {
    rank: 0, // Will be calculated separately
    userId: row.user_id,
    username: row.profiles?.username || 'Unknown',
    displayName: row.profiles?.display_name,
    avatarUrl: row.profiles?.avatar_url,
    level: row.profiles?.level || 1,
    symbol: row.symbol,
    pnlPercent: Number(row.pnl_percent) || 0,
    pnlAmount: Number(row.final_balance) - Number(row.starting_balance),
    beatMarketDelta: Number(row.beat_market_delta) || 0,
    grade: row.grade || 'C',
    totalTrades: row.total_trades || 0,
    maxStreak: row.max_streak || 0,
    sessionId: row.id,
    createdAt: row.created_at,
  };
}

/**
 * Get recent sessions for activity feed
 */
export async function getRecentSessions(limit: number = 20): Promise<LeaderboardEntry[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase
    .from('sessions')
    .select(`
      id,
      user_id,
      symbol,
      pnl_percent,
      final_balance,
      starting_balance,
      beat_market_delta,
      grade,
      total_trades,
      max_streak,
      created_at,
      profiles!inner (
        username,
        display_name,
        avatar_url,
        level
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent sessions:', error);
    return [];
  }

  return (data || []).map((row: any, index: number) => ({
    rank: index + 1,
    userId: row.user_id,
    username: row.profiles?.username || 'Unknown',
    displayName: row.profiles?.display_name,
    avatarUrl: row.profiles?.avatar_url,
    level: row.profiles?.level || 1,
    symbol: row.symbol,
    pnlPercent: Number(row.pnl_percent) || 0,
    pnlAmount: Number(row.final_balance) - Number(row.starting_balance),
    beatMarketDelta: Number(row.beat_market_delta) || 0,
    grade: row.grade || 'C',
    totalTrades: row.total_trades || 0,
    maxStreak: row.max_streak || 0,
    sessionId: row.id,
    createdAt: row.created_at,
  }));
}
