/**
 * Profile card component for TradeMaster.
 * Displays user info and stats in the header.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { LoginModal } from './LoginModal';

export function ProfileCard() {
  const { user, profile, isLoading, isAnonymous, signOut } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Guest user - show sign in button
  if (isAnonymous || !user) {
    return (
      <>
        <motion.button
          onClick={() => setShowLoginModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500
                     text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-600
                     transition-all shadow-lg shadow-indigo-500/25"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          Sign In
        </motion.button>

        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      </>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl">
        <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
        <div className="w-20 h-4 bg-white/10 rounded animate-pulse" />
      </div>
    );
  }

  // Authenticated user
  return (
    <div className="relative">
      <motion.button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-3 px-3 py-2 bg-white/5 border border-white/10
                   rounded-xl hover:bg-white/10 transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500
                        flex items-center justify-center text-white font-bold text-sm overflow-hidden">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            profile?.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'
          )}
        </div>

        {/* Name & Level */}
        <div className="text-left hidden sm:block">
          <div className="text-sm font-medium text-white truncate max-w-[100px]">
            {profile?.display_name || profile?.username || user.email?.split('@')[0]}
          </div>
          <div className="text-xs text-gray-400">
            Lv.{profile?.level || 1} • {formatNumber(profile?.xp || 0)} XP
          </div>
        </div>

        {/* Dropdown Arrow */}
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {showDropdown && (
          <>
            {/* Backdrop to close dropdown */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowDropdown(false)}
            />

            <motion.div
              className="absolute right-0 top-full mt-2 w-64 bg-gray-900 border border-white/10
                         rounded-xl shadow-2xl z-50 overflow-hidden"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
            >
              {/* Profile Info */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500
                                  flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      profile?.username?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-white">
                      {profile?.display_name || profile?.username}
                    </div>
                    <div className="text-xs text-gray-400">{user.email}</div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="p-4 border-b border-white/10 grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-lg font-bold text-white">{profile?.level || 1}</div>
                  <div className="text-xs text-gray-500">Level</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-400">
                    {formatNumber(profile?.total_sessions || 0)}
                  </div>
                  <div className="text-xs text-gray-500">Sessions</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-yellow-400">
                    {profile?.daily_streak || 0}
                  </div>
                  <div className="text-xs text-gray-500">Streak</div>
                </div>
              </div>

              {/* Beat the Market Score */}
              {profile && (
                <div className="px-4 py-3 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Beat Market Score</span>
                    <span className={`font-bold ${
                      (profile.beat_market_score || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {(profile.beat_market_score || 0) >= 0 ? '+' : ''}
                      {(Number(profile.beat_market_score) || 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1">
                    Cumulative skill vs buy & hold
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="p-2">
                <button
                  onClick={async () => {
                    setShowDropdown(false);
                    await signOut();
                  }}
                  className="w-full px-4 py-2 text-left text-red-400 hover:bg-white/5 rounded-lg
                             transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Format large numbers with K/M suffix.
 */
function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}
