/**
 * Supabase Database Types for TradeMaster.
 * Generated from the database schema.
 */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          level: number;
          xp: number;
          total_profit: number;
          total_trades: number;
          total_sessions: number;
          total_wins: number;
          total_losses: number;
          best_session_pnl: number;
          best_streak: number;
          beat_market_score: number;
          daily_streak: number;
          last_played_at: string | null;
          referral_code: string | null;
          referred_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          level?: number;
          xp?: number;
          total_profit?: number;
          total_trades?: number;
          total_sessions?: number;
          total_wins?: number;
          total_losses?: number;
          best_session_pnl?: number;
          best_streak?: number;
          beat_market_score?: number;
          daily_streak?: number;
          last_played_at?: string | null;
          referral_code?: string | null;
          referred_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          level?: number;
          xp?: number;
          total_profit?: number;
          total_trades?: number;
          total_sessions?: number;
          total_wins?: number;
          total_losses?: number;
          best_session_pnl?: number;
          best_streak?: number;
          beat_market_score?: number;
          daily_streak?: number;
          last_played_at?: string | null;
          referral_code?: string | null;
          referred_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          symbol: string;
          starting_balance: number;
          final_balance: number;
          pnl_percent: number;
          total_trades: number;
          wins: number;
          losses: number;
          max_streak: number;
          max_drawdown: number;
          grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
          xp_earned: number;
          stock_baseline_move: number | null;
          beat_market_delta: number | null;
          mystery_mode: boolean;
          leverage_used: number;
          duration_seconds: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
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
          stock_baseline_move?: number | null;
          mystery_mode?: boolean;
          leverage_used?: number;
          duration_seconds?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          symbol?: string;
          starting_balance?: number;
          final_balance?: number;
          total_trades?: number;
          wins?: number;
          losses?: number;
          max_streak?: number;
          max_drawdown?: number;
          grade?: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
          xp_earned?: number;
          stock_baseline_move?: number | null;
          mystery_mode?: boolean;
          leverage_used?: number;
          duration_seconds?: number | null;
          created_at?: string;
        };
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          unlocked_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_id: string;
          unlocked_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          achievement_id?: string;
          unlocked_at?: string;
        };
      };
    };
    Functions: {
      // Add RPC functions here as needed
    };
    Enums: {
      // Add enums here as needed
    };
  };
}

// Convenience type aliases
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Session = Database['public']['Tables']['sessions']['Row'];
export type SessionInsert = Database['public']['Tables']['sessions']['Insert'];

export type UserAchievement = Database['public']['Tables']['user_achievements']['Row'];
export type UserAchievementInsert = Database['public']['Tables']['user_achievements']['Insert'];
