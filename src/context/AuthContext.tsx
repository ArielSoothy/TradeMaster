/**
 * Authentication context for TradeMaster.
 * Manages user auth state and profile across the app.
 */

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { Profile } from '../types/database';
import {
  getCurrentUser,
  getProfile,
  onAuthStateChange,
  signInWithEmail,
  signUpWithEmail,
  signInAnonymously,
  signOut as authSignOut,
  type AuthUser,
} from '../services/auth';
import { syncProgress } from '../services/sync';
import { isSupabaseConfigured } from '../lib/supabase';

interface AuthState {
  user: AuthUser | null;
  profile: Profile | null;
  isLoading: boolean;
  isAnonymous: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error: string | null }>;
  signUp: (email: string, password: string, username?: string) => Promise<{ success: boolean; error: string | null }>;
  signInAnon: () => Promise<{ success: boolean; error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    isLoading: true,
    isAnonymous: true,
    error: null,
  });

  // Load profile and sync
  const loadProfile = useCallback(async (user: AuthUser) => {
    try {
      const profile = await getProfile(user.id);

      if (profile) {
        // Sync local progress with cloud
        await syncProgress(user.id);

        // Refetch profile after sync
        const updatedProfile = await getProfile(user.id);

        setState({
          user,
          profile: updatedProfile,
          isLoading: false,
          isAnonymous: false,
          error: null,
        });
      } else {
        // Profile should be created by trigger, but might take a moment
        // Retry once after a short delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        const retryProfile = await getProfile(user.id);

        setState({
          user,
          profile: retryProfile,
          isLoading: false,
          isAnonymous: false,
          error: retryProfile ? null : 'Profile not found',
        });
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load profile',
      }));
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setState({
        user: null,
        profile: null,
        isLoading: false,
        isAnonymous: true,
        error: null,
      });
      return;
    }

    // Check for existing session
    getCurrentUser().then(user => {
      if (user) {
        loadProfile(user);
      } else {
        setState({
          user: null,
          profile: null,
          isLoading: false,
          isAnonymous: true,
          error: null,
        });
      }
    });

    // Subscribe to auth changes
    const unsubscribe = onAuthStateChange(user => {
      if (user) {
        loadProfile(user);
      } else {
        setState({
          user: null,
          profile: null,
          isLoading: false,
          isAnonymous: true,
          error: null,
        });
      }
    });

    return unsubscribe;
  }, [loadProfile]);

  // Sign in with email
  const signIn = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    const { user, error } = await signInWithEmail(email, password);

    if (error) {
      setState(prev => ({ ...prev, isLoading: false, error }));
      return { success: false, error };
    }

    if (user) {
      await loadProfile(user);
    }

    return { success: true, error: null };
  }, [loadProfile]);

  // Sign up with email
  const signUp = useCallback(async (email: string, password: string, username?: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    const { user, error } = await signUpWithEmail(email, password, username);

    if (error) {
      setState(prev => ({ ...prev, isLoading: false, error }));
      return { success: false, error };
    }

    if (user) {
      // Wait a bit for the profile trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 1500));
      await loadProfile(user);
    }

    return { success: true, error: null };
  }, [loadProfile]);

  // Sign in anonymously (quick play)
  const signInAnon = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    const { user, error } = await signInAnonymously();

    if (error) {
      setState(prev => ({ ...prev, isLoading: false, error }));
      return { success: false, error };
    }

    if (user) {
      // Wait for profile trigger to create profile
      await new Promise(resolve => setTimeout(resolve, 1500));
      await loadProfile(user);
    }

    return { success: true, error: null };
  }, [loadProfile]);

  // Sign out
  const signOut = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    await authSignOut();

    setState({
      user: null,
      profile: null,
      isLoading: false,
      isAnonymous: true,
      error: null,
    });
  }, []);

  // Refresh profile
  const refreshProfile = useCallback(async () => {
    if (!state.user) return;

    const profile = await getProfile(state.user.id);
    setState(prev => ({ ...prev, profile }));
  }, [state.user]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const value: AuthContextValue = {
    ...state,
    signIn,
    signUp,
    signInAnon,
    signOut,
    refreshProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
