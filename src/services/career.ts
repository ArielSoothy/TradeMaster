import type {
  CareerProgress,
  ChapterProgress,
  Mission,
  GameMode,
  WinCondition,
  MissionReward,
} from '../types/career';
import { CHAPTERS, getMissionById, getNextMission, getTotalMissions } from '../data/missions';

// Win condition check result
export interface WinConditionResult {
  condition: WinCondition;
  passed: boolean;
  actualValue: number;
  targetValue: number;
}

export interface MissionResult {
  missionId: string;
  allConditionsMet: boolean;
  conditionResults: WinConditionResult[];
  pnl: number;
  pnlPercent: number;
  grade: string;
  score: number;
  rewards: MissionReward[];
}

// Game state needed for win condition checking
export interface GameStateForMission {
  totalPnL: number;
  startingBalance: number;
  balance: number;
  winCount: number;
  lossCount: number;
  maxStreak: number;
  currentStreak: number;
  maxDrawdown: number;
  gameStatus: 'playing' | 'paused' | 'ended' | 'idle';
  // For beat_market condition
  startPrice: number;
  endPrice: number;
}

/**
 * Check all win conditions for a mission
 */
export function checkWinConditions(
  mission: Mission,
  gameState: GameStateForMission
): WinConditionResult[] {
  const results: WinConditionResult[] = [];

  for (const condition of mission.winConditions) {
    const result = checkSingleCondition(condition, gameState);
    results.push(result);
  }

  return results;
}

/**
 * Check a single win condition
 */
function checkSingleCondition(
  condition: WinCondition,
  state: GameStateForMission
): WinConditionResult {
  let actualValue = 0;
  let passed = false;

  const pnlPercent = (state.totalPnL / state.startingBalance) * 100;
  const totalTrades = state.winCount + state.lossCount;
  const winRate = totalTrades > 0 ? (state.winCount / totalTrades) * 100 : 0;
  const buyAndHoldReturn = state.startPrice > 0
    ? ((state.endPrice - state.startPrice) / state.startPrice) * 100
    : 0;

  switch (condition.type) {
    case 'profit_target':
      actualValue = state.totalPnL;
      passed = state.totalPnL >= condition.value;
      break;

    case 'profit_percent':
      actualValue = pnlPercent;
      passed = pnlPercent >= condition.value;
      break;

    case 'survive':
      actualValue = state.balance > 0 ? 1 : 0;
      passed = state.balance > 0;
      break;

    case 'win_streak':
      actualValue = state.maxStreak;
      passed = state.maxStreak >= condition.value;
      break;

    case 'win_rate':
      actualValue = winRate;
      passed = winRate >= condition.value;
      break;

    case 'max_drawdown':
      actualValue = state.maxDrawdown;
      // Drawdown should be UNDER the target value
      passed = state.maxDrawdown <= condition.value;
      break;

    case 'beat_market':
      actualValue = pnlPercent - buyAndHoldReturn;
      passed = pnlPercent > buyAndHoldReturn;
      break;

    case 'trades_count':
      actualValue = totalTrades;
      passed = totalTrades >= condition.value;
      break;

    default:
      passed = false;
  }

  return {
    condition,
    passed,
    actualValue,
    targetValue: condition.value,
  };
}

/**
 * Evaluate mission completion and calculate rewards
 */
export function evaluateMission(
  mission: Mission,
  gameState: GameStateForMission
): MissionResult {
  const conditionResults = checkWinConditions(mission, gameState);
  const allConditionsMet = conditionResults.every((r) => r.passed);

  const pnl = gameState.totalPnL;
  const pnlPercent = (pnl / gameState.startingBalance) * 100;
  const totalTrades = gameState.winCount + gameState.lossCount;
  const winRate = totalTrades > 0 ? (gameState.winCount / totalTrades) * 100 : 0;

  // Calculate grade
  const grade = calculateMissionGrade(pnl, pnlPercent, winRate, gameState.maxStreak, allConditionsMet);

  // Calculate score based on performance
  const score = calculateMissionScore(pnl, pnlPercent, winRate, gameState.maxStreak, conditionResults);

  // Only give rewards if all conditions are met
  const rewards = allConditionsMet ? mission.rewards : [];

  return {
    missionId: mission.id,
    allConditionsMet,
    conditionResults,
    pnl,
    pnlPercent,
    grade,
    score,
    rewards,
  };
}

/**
 * Calculate mission grade
 */
function calculateMissionGrade(
  pnl: number,
  pnlPercent: number,
  winRate: number,
  maxStreak: number,
  passedAllConditions: boolean
): string {
  if (!passedAllConditions) {
    // If didn't pass, grade based on how close they got
    if (pnl > 0 && winRate > 40) return 'C';
    if (pnl > 0) return 'D';
    return 'F';
  }

  // Passed all conditions - grade based on excellence
  let score = 0;

  // PnL percent scoring
  if (pnlPercent >= 20) score += 35;
  else if (pnlPercent >= 10) score += 30;
  else if (pnlPercent >= 5) score += 25;
  else if (pnlPercent >= 0) score += 15;

  // Win rate scoring
  if (winRate >= 80) score += 35;
  else if (winRate >= 60) score += 30;
  else if (winRate >= 50) score += 25;
  else score += 15;

  // Streak bonus
  if (maxStreak >= 5) score += 30;
  else if (maxStreak >= 3) score += 20;
  else score += 10;

  // Convert to grade
  if (score >= 90) return 'S';
  if (score >= 75) return 'A';
  if (score >= 60) return 'B';
  return 'C'; // Passed but not great
}

/**
 * Calculate mission score (for leaderboards/display)
 */
function calculateMissionScore(
  pnl: number,
  pnlPercent: number,
  winRate: number,
  maxStreak: number,
  conditionResults: WinConditionResult[]
): number {
  let score = 0;

  // Base score from PnL
  score += Math.max(0, pnl);

  // Bonus for % return
  score += Math.max(0, pnlPercent * 100);

  // Bonus for win rate
  score += winRate * 10;

  // Bonus for streaks
  score += maxStreak * 50;

  // Bonus for each condition passed
  const conditionsPassed = conditionResults.filter((r) => r.passed).length;
  score += conditionsPassed * 200;

  return Math.round(score);
}

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
    currentMissionId: CHAPTERS[0]?.missions[0]?.id || '',
    chapters,
    missionScores: {},
    completedMissions: [],
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
      const parsed = JSON.parse(stored);
      // Migrate old format if needed
      const progress: CareerProgress = {
        currentChapter: parsed.currentChapter ?? 1,
        currentMissionId: parsed.currentMissionId ?? parsed.currentMission ?? CHAPTERS[0]?.missions[0]?.id ?? '',
        chapters: parsed.chapters ?? {},
        missionScores: parsed.missionScores ?? parsed.missions ?? {},
        completedMissions: parsed.completedMissions ?? Object.keys(parsed.missions ?? {}).filter(
          (id: string) => parsed.missions?.[id]?.completed
        ),
        totalMissionsCompleted: parsed.totalMissionsCompleted ?? 0,
        careerStartedAt: parsed.careerStartedAt ?? new Date().toISOString(),
        lastPlayedAt: parsed.lastPlayedAt ?? new Date().toISOString(),
      };
      // Ensure all chapters exist (for backwards compatibility)
      for (const chapter of CHAPTERS) {
        if (!progress.chapters[chapter.id]) {
          progress.chapters[chapter.id] = {
            chapterId: chapter.id,
            missionsCompleted: 0,
            totalMissions: chapter.missions.length,
            unlocked: chapter.id === 1,
          };
        }
      }
      return progress;
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
  const existing = progress.missionScores[missionId];
  const isFirstCompletion = !progress.completedMissions.includes(missionId);

  progress.missionScores[missionId] = {
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
    progress.completedMissions.push(missionId);

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
    progress.currentMissionId = nextMission.id;
    progress.currentChapter = nextMission.chapter;
  }

  saveCareerProgress(progress);
  return progress;
}

// Record a mission attempt (without completing)
export function recordMissionAttempt(missionId: string): void {
  const progress = loadCareerProgress();
  const existing = progress.missionScores[missionId];

  progress.missionScores[missionId] = {
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

  return careerProgress.completedMissions.includes(previousMission.id);
}

// Get the current mission to play
export function getCurrentMission(): Mission | undefined {
  const progress = loadCareerProgress();
  return getMissionById(progress.currentMissionId);
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
  const currentMission = getMissionById(progress.currentMissionId);
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
