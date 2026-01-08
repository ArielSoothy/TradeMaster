import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CHAPTERS, getMissionById } from '../../data/missions';
import { loadCareerProgress, type CareerProgress } from '../../services/career';
import type { Mission, Chapter } from '../../types/career';

interface CareerScreenProps {
  onSelectMission: (mission: Mission) => void;
  onBack: () => void;
}

export function CareerScreen({ onSelectMission, onBack }: CareerScreenProps) {
  const [progress, setProgress] = useState<CareerProgress | null>(null);
  const [expandedChapter, setExpandedChapter] = useState<number>(1);

  useEffect(() => {
    const careerProgress = loadCareerProgress();
    setProgress(careerProgress);

    // Auto-expand the chapter with the current mission
    if (careerProgress.currentMissionId) {
      const mission = getMissionById(careerProgress.currentMissionId);
      if (mission) {
        setExpandedChapter(mission.chapter);
      }
    }
  }, []);

  const isMissionUnlocked = (mission: Mission, chapterMissions: Mission[]): boolean => {
    if (!progress) return mission.order === 1 && mission.chapter === 1;

    // First mission of first chapter is always unlocked
    if (mission.chapter === 1 && mission.order === 1) return true;

    // Check if previous mission in same chapter is completed
    if (mission.order > 1) {
      const prevMission = chapterMissions.find((m) => m.order === mission.order - 1);
      if (prevMission && progress.completedMissions.includes(prevMission.id)) {
        return true;
      }
      return false;
    }

    // First mission of a chapter - check if previous chapter's boss is completed
    const prevChapter = CHAPTERS.find((c) => c.id === mission.chapter - 1);
    if (prevChapter) {
      const bossMission = prevChapter.missions.find((m) => m.isBoss);
      if (bossMission && progress.completedMissions.includes(bossMission.id)) {
        return true;
      }
    }

    return false;
  };

  const getMissionStatus = (mission: Mission): 'locked' | 'available' | 'completed' => {
    if (!progress) return mission.order === 1 && mission.chapter === 1 ? 'available' : 'locked';

    if (progress.completedMissions.includes(mission.id)) {
      return 'completed';
    }

    const chapter = CHAPTERS.find((c) => c.id === mission.chapter);
    if (chapter && isMissionUnlocked(mission, chapter.missions)) {
      return 'available';
    }

    return 'locked';
  };

  const getChapterProgress = (chapter: Chapter): { completed: number; total: number } => {
    if (!progress) return { completed: 0, total: chapter.missions.length };

    const completed = chapter.missions.filter((m) =>
      progress.completedMissions.includes(m.id)
    ).length;

    return { completed, total: chapter.missions.length };
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-4 border-b border-white/10">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ← Back
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Career Mode</h1>
          <p className="text-sm text-gray-500">Master trading through famous market events</p>
        </div>
      </div>

      {/* Chapters List */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {CHAPTERS.map((chapter) => {
          const chapterProgress = getChapterProgress(chapter);
          const isExpanded = expandedChapter === chapter.id;
          const isChapterLocked = chapter.id > 1 && chapterProgress.completed === 0 && !progress?.completedMissions.some(
            (id) => CHAPTERS.find((c) => c.id === chapter.id - 1)?.missions.some((m) => m.id === id && m.isBoss)
          );

          return (
            <motion.div
              key={chapter.id}
              className={`rounded-2xl border overflow-hidden ${
                isChapterLocked
                  ? 'border-gray-700/50 bg-gray-800/30'
                  : 'border-white/10 bg-white/5'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: chapter.id * 0.1 }}
            >
              {/* Chapter Header */}
              <button
                onClick={() => !isChapterLocked && setExpandedChapter(isExpanded ? 0 : chapter.id)}
                disabled={isChapterLocked}
                className={`w-full p-4 flex items-center justify-between ${
                  isChapterLocked ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`text-3xl ${isChapterLocked ? 'grayscale opacity-50' : ''}`}
                  >
                    {chapter.theme.icon}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <h2 className={`font-bold ${isChapterLocked ? 'text-gray-500' : 'text-white'}`}>
                        Chapter {chapter.id}: {chapter.title}
                      </h2>
                      {isChapterLocked && (
                        <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-400">
                          🔒 Locked
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${isChapterLocked ? 'text-gray-600' : 'text-gray-400'}`}>
                      {chapter.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Progress */}
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      chapterProgress.completed === chapterProgress.total
                        ? 'text-green-400'
                        : 'text-gray-400'
                    }`}>
                      {chapterProgress.completed}/{chapterProgress.total}
                    </div>
                    <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          chapterProgress.completed === chapterProgress.total
                            ? 'bg-green-500'
                            : 'bg-indigo-500'
                        }`}
                        style={{
                          width: `${(chapterProgress.completed / chapterProgress.total) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Expand indicator */}
                  {!isChapterLocked && (
                    <motion.span
                      className="text-gray-400"
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                    >
                      ▼
                    </motion.span>
                  )}
                </div>
              </button>

              {/* Missions List (Expanded) */}
              <motion.div
                initial={false}
                animate={{
                  height: isExpanded ? 'auto' : 0,
                  opacity: isExpanded ? 1 : 0,
                }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-2">
                  {chapter.missions.map((mission) => {
                    const status = getMissionStatus(mission);

                    return (
                      <motion.button
                        key={mission.id}
                        onClick={() => status !== 'locked' && onSelectMission(mission)}
                        disabled={status === 'locked'}
                        className={`w-full p-4 rounded-xl flex items-center justify-between transition-all ${
                          status === 'locked'
                            ? 'bg-gray-800/30 cursor-not-allowed'
                            : status === 'completed'
                            ? 'bg-green-500/10 border border-green-500/20 hover:bg-green-500/20'
                            : 'bg-white/5 border border-white/10 hover:bg-white/10'
                        }`}
                        whileHover={status !== 'locked' ? { scale: 1.01 } : {}}
                        whileTap={status !== 'locked' ? { scale: 0.99 } : {}}
                      >
                        <div className="flex items-center gap-3">
                          {/* Status icon */}
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              status === 'locked'
                                ? 'bg-gray-700 text-gray-500'
                                : status === 'completed'
                                ? 'bg-green-500/20 text-green-400'
                                : mission.isBoss
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-indigo-500/20 text-indigo-400'
                            }`}
                          >
                            {status === 'locked' ? (
                              '🔒'
                            ) : status === 'completed' ? (
                              '✓'
                            ) : mission.isBoss ? (
                              '⚔️'
                            ) : (
                              mission.order
                            )}
                          </div>

                          <div className="text-left">
                            <div className={`font-medium ${
                              status === 'locked' ? 'text-gray-500' : 'text-white'
                            }`}>
                              {mission.title}
                            </div>
                            <div className={`text-sm ${
                              status === 'locked' ? 'text-gray-600' : 'text-gray-400'
                            }`}>
                              {mission.stockSymbol} • {mission.historicalDate}
                            </div>
                          </div>
                        </div>

                        {/* Right side info */}
                        <div className="flex items-center gap-2">
                          {status === 'completed' && progress?.missionScores[mission.id] && (
                            <span className="text-amber-400 font-bold">
                              {progress.missionScores[mission.id].grade}
                            </span>
                          )}
                          {status !== 'locked' && (
                            <span className="text-gray-400">→</span>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
