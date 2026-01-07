import type {
  CareerProgress,
  ChapterProgress,
  Mission,
  GameMode,
} from '../types/career';
import { CHAPTERS, getMissionById, getNextMission, getTotalMissions } from '../data/missions';

const CAREER_STORAGE_KEY = 'trademaster_career';
const GAME_MODE_KEY = 'trademaster_game_mode';
const FIRST_LAUNCH_KEY = 'trademaster_first_launch';

// Initialize default career progress
function createDefaultCareerProgress(): CareerProgress {
  const chapters: Record<number, ChapterProgress> = {};

  for (const chapter of CHAPTERS) {
    chapters[chapter.id] = {
      chapterId: chapter.id,
      missionsCompleted: 0,
      totalMissions: chapter.missions.length,
      unlocked: chapter.id === 1, // Only first chapter unlocked by default
    };
  }

  return {
    currentChapter: 1,
    currentMission: CHAPTERS[0]?.missions[0]?.id || '',
    chapters,
    missions: {},
    totalMissionsCompleted: 0,
    careerStartedAt: new Date().toISOString(),
    lastPlayedAt: new Date().toISOString(),
  };
}

// Load career progress from localStorage
export function loadCareerProgress(): CareerProgress {
  try {
    const stored = localStorage.getItem(CAREER_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as CareerProgress;
      // Ensure all chapters exist (for backwards compatibility)
      for (const chapter of CHAPTERS) {
        if (!parsed.chapters[chapter.id]) {
          parsed.chapters[chapter.id] = {
            chapterId: chapter.id,
            missionsCompleted: 0,
            totalMissions: chapter.missions.length,
            unlocked: chapter.id === 1,
          };
        }
      }
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load career progress:', e);
  }
  return createDefaultCareerProgress();
}

// Save career progress to localStorage
export function saveCareerProgress(progress: CareerProgress): void {
  try {
    progress.lastPlayedAt = new Date().toISOString();
    localStorage.setItem(CAREER_STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save career progress:', e);
  }
}

// Complete a mission
export function completeMission(
  missionId: string,
  pnl: number,
  score: number,
  grade: string
): CareerProgress {
  const progress = loadCareerProgress();
  const mission = getMissionById(missionId);

  if (!mission) {
    console.error('Mission not found:', missionId);
    return progress;
  }

  // Update or create mission progress
  const existing = progress.missions[missionId];
  const isFirstCompletion = !existing?.completed;

  progress.missions[missionId] = {
    missionId,
    completed: true,
    bestScore: Math.max(existing?.bestScore || 0, score),
    bestPnL: Math.max(existing?.bestPnL || -Infinity, pnl),
    bestGrade: getBetterGrade(existing?.bestGrade, grade),
    attempts: (existing?.attempts || 0) + 1,
    completedAt: new Date().toISOString(),
  };

  // Update chapter progress
  if (isFirstCompletion) {
    const chapter = progress.chapters[mission.chapter];
    if (chapter) {
      chapter.missionsCompleted += 1;

      // Check if chapter is complete, unlock next chapter
      if (chapter.missionsCompleted >= chapter.totalMissions) {
        const nextChapter = progress.chapters[mission.chapter + 1];
        if (nextChapter) {
          nextChapter.unlocked = true;
        }
      }
    }
    progress.totalMissionsCompleted += 1;
  }

  // Update current mission to next one
  const nextMission = getNextMission(missionId);
  if (nextMission) {
    progress.currentMission = nextMission.id;
    progress.currentChapter = nextMission.chapter;
  }

  saveCareerProgress(progress);
  return progress;
}

// Record a mission attempt (without completing)
export function recordMissionAttempt(missionId: string): void {
  const progress = loadCareerProgress();
  const existing = progress.missions[missionId];

  progress.missions[missionId] = {
    ...existing,
    missionId,
    completed: existing?.completed || false,
    attempts: (existing?.attempts || 0) + 1,
  };

  saveCareerProgress(progress);
}

// Check if a mission is unlocked
export function isMissionUnlocked(missionId: string, progress?: CareerProgress): boolean {
  const careerProgress = progress || loadCareerProgress();
  const mission = getMissionById(missionId);

  if (!mission) return false;

  // First mission of first chapter is always unlocked
  if (mission.chapter === 1 && mission.order === 1) return true;

  // Chapter must be unlocked
  const chapter = careerProgress.chapters[mission.chapter];
  if (!chapter?.unlocked) return false;

  // Previous mission must be completed (or it's the first mission in chapter)
  if (mission.order === 1) return true;

  const chapterData = CHAPTERS.find(c => c.id === mission.chapter);
  if (!chapterData) return false;

  const previousMission = chapterData.missions.find(m => m.order === mission.order - 1);
  if (!previousMission) return true;

  return careerProgress.missions[previousMission.id]?.completed || false;
}

// Get the current mission to play
export function getCurrentMission(): Mission | undefined {
  const progress = loadCareerProgress();
  return getMissionById(progress.currentMission);
}

// Get career completion percentage
export function getCareerCompletionPercent(): number {
  const progress = loadCareerProgress();
  const total = getTotalMissions();
  if (total === 0) return 0;
  return Math.round((progress.totalMissionsCompleted / total) * 100);
}

// Get chapter completion percentage
export function getChapterCompletionPercent(chapterId: number): number {
  const progress = loadCareerProgress();
  const chapter = progress.chapters[chapterId];
  if (!chapter || chapter.totalMissions === 0) return 0;
  return Math.round((chapter.missionsCompleted / chapter.totalMissions) * 100);
}

// Helper to compare grades
function getBetterGrade(existing: string | undefined, newGrade: string): string {
  const gradeOrder = ['S', 'A', 'B', 'C', 'D', 'F'];
  if (!existing) return newGrade;
  const existingIndex = gradeOrder.indexOf(existing);
  const newIndex = gradeOrder.indexOf(newGrade);
  // Lower index = better grade
  return newIndex < existingIndex ? newGrade : existing;
}

// Reset career progress
export function resetCareerProgress(): void {
  localStorage.removeItem(CAREER_STORAGE_KEY);
}

// Game mode management
export function getGameMode(): GameMode {
  try {
    const stored = localStorage.getItem(GAME_MODE_KEY);
    if (stored && ['career', 'arcade', 'trader'].includes(stored)) {
      return stored as GameMode;
    }
  } catch (e) {
    console.error('Failed to load game mode:', e);
  }
  return 'arcade'; // Default to arcade for new users
}

export function setGameMode(mode: GameMode): void {
  try {
    localStorage.setItem(GAME_MODE_KEY, mode);
  } catch (e) {
    console.error('Failed to save game mode:', e);
  }
}

// First launch detection
export function isFirstLaunch(): boolean {
  try {
    return localStorage.getItem(FIRST_LAUNCH_KEY) !== 'false';
  } catch (e) {
    return true;
  }
}

export function markFirstLaunchComplete(): void {
  try {
    localStorage.setItem(FIRST_LAUNCH_KEY, 'false');
  } catch (e) {
    console.error('Failed to mark first launch complete:', e);
  }
}

// Get stats for display
export interface CareerStats {
  totalMissionsCompleted: number;
  totalMissions: number;
  currentChapter: number;
  totalChapters: number;
  completionPercent: number;
  currentMissionTitle: string;
  currentChapterTitle: string;
}

export function getCareerStats(): CareerStats {
  const progress = loadCareerProgress();
  const currentMission = getMissionById(progress.currentMission);
  const currentChapter = CHAPTERS.find(c => c.id === progress.currentChapter);

  return {
    totalMissionsCompleted: progress.totalMissionsCompleted,
    totalMissions: getTotalMissions(),
    currentChapter: progress.currentChapter,
    totalChapters: CHAPTERS.length,
    completionPercent: getCareerCompletionPercent(),
    currentMissionTitle: currentMission?.title || 'Your First Trade',
    currentChapterTitle: currentChapter?.title || 'The Basics',
  };
}

// Best scores for quick play modes
const ARCADE_HIGHSCORE_KEY = 'trademaster_arcade_highscore';
const TRADER_BEST_PNL_KEY = 'trademaster_trader_best_pnl';

export function getArcadeHighScore(): number {
  try {
    const stored = localStorage.getItem(ARCADE_HIGHSCORE_KEY);
    return stored ? parseInt(stored, 10) : 0;
  } catch {
    return 0;
  }
}

export function setArcadeHighScore(score: number): void {
  const current = getArcadeHighScore();
  if (score > current) {
    localStorage.setItem(ARCADE_HIGHSCORE_KEY, score.toString());
  }
}

export function getTraderBestPnL(): number {
  try {
    const stored = localStorage.getItem(TRADER_BEST_PNL_KEY);
    return stored ? parseFloat(stored) : 0;
  } catch {
    return 0;
  }
}

export function setTraderBestPnL(pnl: number): void {
  const current = getTraderBestPnL();
  if (pnl > current) {
    localStorage.setItem(TRADER_BEST_PNL_KEY, pnl.toString());
  }
}
