/**
 * Leaderboard screen with tabs for different time periods and metrics.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getSessionLeaderboard,
  getProfileLeaderboard,
  type LeaderboardEntry,
  type ProfileLeaderboardEntry,
  type LeaderboardType,
} from '../../services/leaderboard';
import { useAuth } from '../../context/AuthContext';

interface LeaderboardScreenProps {
  onBack: () => void;
}

type TabType = 'daily' | 'weekly' | 'allTime' | 'skill';

const TABS: { id: TabType; label: string; icon: string }[] = [
  { id: 'daily', label: 'Today', icon: '📅' },
  { id: 'weekly', label: 'Week', icon: '📆' },
  { id: 'allTime', label: 'All Time', icon: '👑' },
  { id: 'skill', label: 'Skill', icon: '🎯' },
];

export function LeaderboardScreen({ onBack }: LeaderboardScreenProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('daily');
  const [sessionEntries, setSessionEntries] = useState<LeaderboardEntry[]>([]);
  const [profileEntries, setProfileEntries] = useState<ProfileLeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [activeTab]);

  async function loadLeaderboard() {
    setIsLoading(true);

    if (activeTab === 'skill') {
      const data = await getProfileLeaderboard(50);
      setProfileEntries(data);
      setSessionEntries([]);
    } else {
      const type: LeaderboardType = activeTab === 'allTime' ? 'allTime' : activeTab;
      const data = await getSessionLeaderboard(type, 'pnl', 50);
      setSessionEntries(data);
      setProfileEntries([]);
    }

    setIsLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold">Leaderboard</h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-20"
            >
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </motion.div>
          ) : activeTab === 'skill' ? (
            <motion.div
              key="skill"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Skill Leaderboard Description */}
              <div className="mb-4 p-3 bg-indigo-500/20 border border-indigo-500/30 rounded-xl">
                <p className="text-sm text-indigo-200">
                  <span className="font-bold">Beat the Market Score</span> measures skill - how much you outperform buy & hold across all sessions.
                </p>
              </div>

              {profileEntries.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="space-y-2">
                  {profileEntries.map((entry) => (
                    <ProfileLeaderboardRow
                      key={entry.userId}
                      entry={entry}
                      isCurrentUser={entry.userId === user?.id}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {sessionEntries.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="space-y-2">
                  {sessionEntries.map((entry) => (
                    <SessionLeaderboardRow
                      key={entry.sessionId}
                      entry={entry}
                      isCurrentUser={entry.userId === user?.id}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SessionLeaderboardRow({
  entry,
  isCurrentUser,
}: {
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
}) {
  const isPositive = entry.pnlPercent >= 0;

  return (
    <motion.div
      className={`p-4 rounded-xl border transition-colors ${
        isCurrentUser
          ? 'bg-indigo-500/20 border-indigo-500/50'
          : 'bg-white/5 border-white/10 hover:bg-white/10'
      }`}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-center gap-3">
        {/* Rank */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
          entry.rank === 1 ? 'bg-yellow-500 text-black' :
          entry.rank === 2 ? 'bg-gray-300 text-black' :
          entry.rank === 3 ? 'bg-amber-600 text-white' :
          'bg-white/10 text-white'
        }`}>
          {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold truncate">
              {entry.displayName || entry.username}
            </span>
            <span className="text-xs text-gray-500">Lv.{entry.level}</span>
            {isCurrentUser && (
              <span className="text-xs bg-indigo-500 px-2 py-0.5 rounded-full">You</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="font-mono">{entry.symbol}</span>
            <span>•</span>
            <span>Grade {entry.grade}</span>
            {entry.beatMarketDelta !== 0 && (
              <>
                <span>•</span>
                <span className={entry.beatMarketDelta > 0 ? 'text-emerald-400' : 'text-red-400'}>
                  {entry.beatMarketDelta > 0 ? '+' : ''}{entry.beatMarketDelta.toFixed(1)}% vs market
                </span>
              </>
            )}
          </div>
        </div>

        {/* PnL */}
        <div className="text-right">
          <div className={`text-lg font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{entry.pnlPercent.toFixed(1)}%
          </div>
          <div className={`text-sm ${isPositive ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
            {isPositive ? '+' : ''}${entry.pnlAmount.toFixed(0)}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ProfileLeaderboardRow({
  entry,
  isCurrentUser,
}: {
  entry: ProfileLeaderboardEntry;
  isCurrentUser: boolean;
}) {
  const isPositive = entry.beatMarketScore >= 0;

  return (
    <motion.div
      className={`p-4 rounded-xl border transition-colors ${
        isCurrentUser
          ? 'bg-indigo-500/20 border-indigo-500/50'
          : 'bg-white/5 border-white/10 hover:bg-white/10'
      }`}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-center gap-3">
        {/* Rank */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
          entry.rank === 1 ? 'bg-yellow-500 text-black' :
          entry.rank === 2 ? 'bg-gray-300 text-black' :
          entry.rank === 3 ? 'bg-amber-600 text-white' :
          'bg-white/10 text-white'
        }`}>
          {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold truncate">
              {entry.displayName || entry.username}
            </span>
            <span className="text-xs text-gray-500">Lv.{entry.level}</span>
            {isCurrentUser && (
              <span className="text-xs bg-indigo-500 px-2 py-0.5 rounded-full">You</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>{entry.totalSessions} sessions</span>
            <span>•</span>
            <span>Best streak: {entry.bestStreak}</span>
          </div>
        </div>

        {/* Beat Market Score */}
        <div className="text-right">
          <div className={`text-lg font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{entry.beatMarketScore.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">Beat Market</div>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="text-6xl mb-4">🏆</div>
      <h3 className="text-xl font-bold mb-2">No Sessions Yet</h3>
      <p className="text-gray-400">Be the first to make the leaderboard!</p>
    </div>
  );
}
