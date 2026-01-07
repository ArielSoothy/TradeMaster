/**
 * Authentication service for TradeMaster.
 * Handles sign-in, sign-up, and profile management.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Profile } from '../types/database';

export interface AuthUser {
  id: string;
  email: string | null;
  provider: string;
}

/**
 * Sign in with email and password.
 */
export async function signInWithEmail(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { user: null, error: 'Supabase not configured' };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { user: null, error: error.message };
  }

  if (data.user) {
    return {
      user: {
        id: data.user.id,
        email: data.user.email ?? null,
        provider: 'email',
      },
      error: null,
    };
  }

  return { user: null, error: 'Unknown error' };
}

/**
 * Generate a unique referral code.
 */
function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Create profile for new user (called after signup).
 */
async function createProfile(userId: string, email: string, username?: string): Promise<{ success: boolean; error: string | null }> {
  const baseUsername = username || email.split('@')[0] || 'trader';
  let finalUsername = baseUsername;
  let counter = 0;

  // Make username unique
  while (true) {
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', finalUsername)
      .single();

    if (!existing) break;
    counter++;
    finalUsername = `${baseUsername}${counter}`;
  }

  const { error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      username: finalUsername,
      display_name: finalUsername,
      referral_code: generateReferralCode(),
    } as never);

  if (error) {
    console.error('Error creating profile:', error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

/**
 * Sign up with email and password.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  username?: string
): Promise<{ user: AuthUser | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { user: null, error: 'Supabase not configured' };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username || email.split('@')[0],
      },
    },
  });

  if (error) {
    return { user: null, error: error.message };
  }

  if (data.user) {
    // Create profile from app side (bypass trigger)
    const profileResult = await createProfile(data.user.id, email, username);
    if (!profileResult.success) {
      // Profile creation failed, but user was created
      // Try to continue anyway - profile might be created by trigger later
      console.warn('Profile creation failed:', profileResult.error);
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email ?? null,
        provider: 'email',
      },
      error: null,
    };
  }

  return { user: null, error: 'Unknown error' };
}

/**
 * Sign in anonymously (no email required).
 * Perfect for trying the app - can link email later.
 */
export async function signInAnonymously(): Promise<{ user: AuthUser | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { user: null, error: 'Supabase not configured' };
  }

  const { data, error } = await supabase.auth.signInAnonymously();

  if (error) {
    return { user: null, error: error.message };
  }

  if (data.user) {
    return {
      user: {
        id: data.user.id,
        email: null,
        provider: 'anonymous',
      },
      error: null,
    };
  }

  return { user: null, error: 'Unknown error' };
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { error: null };
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

/**
 * Get the current authenticated user.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    return {
      id: user.id,
      email: user.email ?? null,
      provider: user.app_metadata.provider || 'email',
    };
  }

  return null;
}

/**
 * Get the current user's profile.
 */
export async function getProfile(userId: string): Promise<Profile | null> {
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

  return data;
}

/**
 * Update the current user's profile.
 */
export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<{ success: boolean; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq('id', userId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

/**
 * Check if a username is available.
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return true;
  }

  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single();

  return !data;
}

/**
 * Subscribe to auth state changes.
 */
export function onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
  if (!isSupabaseConfigured()) {
    return () => {};
  }

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      callback({
        id: session.user.id,
        email: session.user.email ?? null,
        provider: session.user.app_metadata.provider || 'email',
      });
    } else {
      callback(null);
    }
  });

  return () => subscription.unsubscribe();
}
