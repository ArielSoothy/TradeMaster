import type { Chapter, Mission } from '../types/career';

// Chapter 1: The Basics - Learn fundamental trading concepts
const chapter1Missions: Mission[] = [
  {
    id: 'c1m1-first-trade',
    chapter: 1,
    order: 1,
    title: 'Your First Trade',
    subtitle: 'Every journey begins with a single step',
    description: 'Learn the basics of buying and selling. This is Apple on a typical trading day - watch the price move and make your first trade.',
    learningObjective: 'Understand how to open and close a position',
    historicalContext: 'A regular Apple trading day with moderate volatility - perfect for learning the ropes.',
    historicalDate: 'September 9, 2024',
    stockSymbol: 'AAPL',
    startDate: '2024-09-09',
    endDate: '2024-09-09',
    winConditions: [
      { type: 'profit_target', value: 50, description: 'Make $50 profit' },
    ],
    rewards: [
      { type: 'xp', value: 100, label: '+100 XP' },
    ],
    difficulty: 'easy',
    estimatedTime: '1-2 min',
    tips: [
      'Green means the price is going up - good time to buy!',
      'Red means the price is going down - consider selling',
      'Start small - you can always trade again',
    ],
  },
  {
    id: 'c1m2-cut-losses',
    chapter: 1,
    order: 2,
    title: 'Learning to Cut Losses',
    subtitle: 'The most important skill in trading',
    description: 'The market doesn\'t always go your way. Learn to recognize when a trade isn\'t working and exit before it gets worse.',
    learningObjective: 'Understand the importance of cutting losses early',
    historicalContext: 'A choppy day where holding losers would have been painful. Smart traders cut their losses.',
    historicalDate: 'January 15, 2024',
    stockSymbol: 'MSFT',
    startDate: '2024-01-15',
    endDate: '2024-01-15',
    winConditions: [
      { type: 'max_drawdown', value: 5, description: 'Keep drawdown under 5%' },
      { type: 'trades_count', value: 3, description: 'Complete at least 3 trades' },
    ],
    rewards: [
      { type: 'xp', value: 150, label: '+150 XP' },
      { type: 'title', value: 'Loss Cutter', label: 'Title: Loss Cutter' },
    ],
    difficulty: 'easy',
    estimatedTime: '2-3 min',
    tips: [
      'Set a mental stop-loss before entering a trade',
      'A small loss is better than a big loss',
      'Live to trade another day',
    ],
  },
  {
    id: 'c1m3-riding-winners',
    chapter: 1,
    order: 3,
    title: 'Riding Winners',
    subtitle: 'Let your profits run',
    description: 'The opposite of cutting losses - when you\'re right, stay in the trade longer. Learn to maximize winning trades.',
    learningObjective: 'Learn to hold winning positions and maximize profits',
    historicalContext: 'NVIDIA on a strong uptrend day. Those who held their winners made bank.',
    historicalDate: 'February 22, 2024',
    stockSymbol: 'NVDA',
    startDate: '2024-02-22',
    endDate: '2024-02-22',
    winConditions: [
      { type: 'profit_target', value: 500, description: 'Make $500 profit' },
      { type: 'win_rate', value: 50, description: 'Maintain 50%+ win rate' },
    ],
    rewards: [
      { type: 'xp', value: 200, label: '+200 XP' },
      { type: 'unlock_leverage', value: 2, label: 'Unlock 2x Leverage' },
    ],
    difficulty: 'medium',
    estimatedTime: '3-4 min',
    tips: [
      'Don\'t sell just because you\'re green - is the trend still going?',
      'Use partial sells to lock in some profit while riding the rest',
      'Greed is good... in moderation',
    ],
  },
  {
    id: 'c1m4-position-sizing',
    chapter: 1,
    order: 4,
    title: 'Position Sizing',
    subtitle: 'Risk management is everything',
    description: 'Even the best traders lose sometimes. Position sizing ensures one bad trade doesn\'t wipe you out.',
    learningObjective: 'Understand how position size affects risk and reward',
    historicalContext: 'A volatile day on Tesla - high risk, high reward. Position sizing makes all the difference.',
    historicalDate: 'July 10, 2024',
    stockSymbol: 'TSLA',
    startDate: '2024-07-10',
    endDate: '2024-07-10',
    winConditions: [
      { type: 'survive', value: 1, description: 'Don\'t get liquidated' },
      { type: 'profit_percent', value: 5, description: 'End with 5%+ portfolio gain' },
    ],
    rewards: [
      { type: 'xp', value: 250, label: '+250 XP' },
    ],
    difficulty: 'medium',
    estimatedTime: '3-4 min',
    tips: [
      'Higher leverage = higher risk of liquidation',
      'Never risk more than you can afford to lose',
      'Consistent small wins beat occasional big wins',
    ],
  },
  {
    id: 'c1m5-boss-flash-crash',
    chapter: 1,
    order: 5,
    title: 'Survive the Flash Crash',
    subtitle: 'BOSS BATTLE',
    description: 'The infamous 2010 Flash Crash - the market dropped 9% in minutes. Can you survive this historic chaos?',
    learningObjective: 'Handle extreme volatility and market panic',
    historicalContext: 'May 6, 2010: The Dow dropped nearly 1,000 points in minutes before recovering. One of the most chaotic days in market history.',
    historicalDate: 'May 6, 2010',
    stockSymbol: 'SPY',
    startDate: '2010-05-06',
    endDate: '2010-05-06',
    winConditions: [
      { type: 'survive', value: 1, description: 'Don\'t get liquidated' },
      { type: 'profit_target', value: 0, description: 'End in profit (any amount)' },
    ],
    rewards: [
      { type: 'xp', value: 500, label: '+500 XP' },
      { type: 'title', value: 'Flash Crash Survivor', label: 'Title: Flash Crash Survivor' },
      { type: 'unlock_category', value: 'leveraged', label: 'Unlock Leveraged ETFs' },
    ],
    difficulty: 'boss',
    estimatedTime: '4-5 min',
    isBoss: true,
    tips: [
      'In extreme volatility, cash is a position too',
      'Don\'t panic sell at the bottom',
      'The market often overreacts - look for opportunities',
    ],
  },
];

// Chapter 2: Market Dynamics - Understanding market patterns
const chapter2Missions: Mission[] = [
  {
    id: 'c2m1-trend-following',
    chapter: 2,
    order: 1,
    title: 'Riding the Tesla Wave',
    subtitle: 'The trend is your friend',
    description: 'Tesla\'s legendary 2020 rally. Learn to identify and follow strong trends.',
    learningObjective: 'Identify trending markets and trade with the trend',
    historicalContext: 'Tesla stock split announcement rally - the stock surged over 80% in a month. This day was particularly explosive.',
    historicalDate: 'August 11, 2020',
    stockSymbol: 'TSLA',
    startDate: '2020-08-11',
    endDate: '2020-08-11',
    winConditions: [
      { type: 'profit_percent', value: 10, description: 'Make 10%+ return' },
      { type: 'beat_market', value: 1, description: 'Beat buy-and-hold strategy' },
    ],
    rewards: [
      { type: 'xp', value: 300, label: '+300 XP' },
      { type: 'unlock_leverage', value: 4, label: 'Unlock 4x Leverage' },
    ],
    difficulty: 'medium',
    estimatedTime: '3-4 min',
    tips: [
      'In a strong uptrend, buy dips instead of shorting',
      'Don\'t fight the tape',
      'Higher highs and higher lows = uptrend',
    ],
  },
  {
    id: 'c2m2-gme-squeeze',
    chapter: 2,
    order: 2,
    title: 'The GameStop Squeeze',
    subtitle: 'When memes move markets',
    description: 'January 2021: Reddit\'s WallStreetBets takes on Wall Street. Experience the most viral stock moment in history.',
    learningObjective: 'Navigate extreme volatility and short squeezes',
    historicalContext: 'GameStop went from $20 to $483 in weeks as retail traders squeezed hedge fund shorts. This day saw 100%+ swings.',
    historicalDate: 'January 27, 2021',
    stockSymbol: 'GME',
    startDate: '2021-01-27',
    endDate: '2021-01-27',
    winConditions: [
      { type: 'profit_target', value: 1000, description: 'Make $1,000 profit' },
      { type: 'survive', value: 1, description: 'Don\'t get liquidated' },
    ],
    rewards: [
      { type: 'xp', value: 400, label: '+400 XP' },
      { type: 'title', value: 'Diamond Hands', label: 'Title: Diamond Hands' },
      { type: 'unlock_category', value: 'meme', label: 'Unlock Meme Stocks' },
    ],
    difficulty: 'hard',
    estimatedTime: '4-5 min',
    tips: [
      'In a squeeze, normal rules don\'t apply',
      'Set tight stops - things can reverse fast',
      'FOMO is the enemy - have a plan',
    ],
  },
  {
    id: 'c2m3-earnings-play',
    chapter: 2,
    order: 3,
    title: 'The Earnings Beat',
    subtitle: 'When numbers exceed expectations',
    description: 'NVIDIA crushes earnings expectations. Learn to trade the post-earnings volatility.',
    learningObjective: 'Understand earnings reactions and gap trading',
    historicalContext: 'NVIDIA reported Q4 2024 earnings that blew past estimates. The stock gapped up and kept running.',
    historicalDate: 'February 21, 2024',
    stockSymbol: 'NVDA',
    startDate: '2024-02-21',
    endDate: '2024-02-21',
    winConditions: [
      { type: 'profit_percent', value: 8, description: 'Make 8%+ return' },
      { type: 'trades_count', value: 5, description: 'Complete at least 5 trades' },
    ],
    rewards: [
      { type: 'xp', value: 350, label: '+350 XP' },
    ],
    difficulty: 'medium',
    estimatedTime: '3-4 min',
    tips: [
      'Earnings gaps often continue in the same direction',
      'Volume confirms the move',
      'Wait for consolidation before entering',
    ],
  },
  {
    id: 'c2m4-fed-day',
    chapter: 2,
    order: 4,
    title: 'Fed Rate Decision',
    subtitle: 'When the Fed speaks, markets listen',
    description: 'A Federal Reserve interest rate announcement. Watch the market react in real-time.',
    learningObjective: 'Trade around major economic events',
    historicalContext: 'The Fed held rates steady but hinted at future cuts. Markets whipsawed on every word from Powell.',
    historicalDate: 'January 31, 2024',
    stockSymbol: 'SPY',
    startDate: '2024-01-31',
    endDate: '2024-01-31',
    winConditions: [
      { type: 'profit_target', value: 300, description: 'Make $300 profit' },
      { type: 'max_drawdown', value: 10, description: 'Keep drawdown under 10%' },
    ],
    rewards: [
      { type: 'xp', value: 350, label: '+350 XP' },
      { type: 'title', value: 'Fed Whisperer', label: 'Title: Fed Whisperer' },
    ],
    difficulty: 'hard',
    estimatedTime: '4-5 min',
    tips: [
      'Markets often fake out in both directions during Fed',
      'Wait for the dust to settle before committing',
      'The initial move is often wrong',
    ],
  },
  {
    id: 'c2m5-boss-covid-crash',
    chapter: 2,
    order: 5,
    title: 'The COVID Crash',
    subtitle: 'BOSS BATTLE',
    description: 'March 2020: The world shuts down, markets collapse. Navigate one of the fastest market crashes in history.',
    learningObjective: 'Survive a market crash and find opportunities in chaos',
    historicalContext: 'COVID-19 panic selling. The S&P 500 fell 34% in 23 days. This was one of the worst single days.',
    historicalDate: 'March 16, 2020',
    stockSymbol: 'SPY',
    startDate: '2020-03-16',
    endDate: '2020-03-16',
    winConditions: [
      { type: 'survive', value: 1, description: 'Don\'t get liquidated' },
      { type: 'profit_target', value: 500, description: 'Make $500 profit' },
    ],
    rewards: [
      { type: 'xp', value: 600, label: '+600 XP' },
      { type: 'title', value: 'Pandemic Trader', label: 'Title: Pandemic Trader' },
      { type: 'unlock_leverage', value: 10, label: 'Unlock 10x Leverage' },
    ],
    difficulty: 'boss',
    estimatedTime: '5-6 min',
    isBoss: true,
    tips: [
      'In a crash, shorting can be very profitable',
      'But crashes also have violent bounces',
      'Cash is king when fear is high',
    ],
  },
];

// Chapter 3: Advanced Strategies - Master-level trading
const chapter3Missions: Mission[] = [
  {
    id: 'c3m1-crypto-volatility',
    chapter: 3,
    order: 1,
    title: 'Bitcoin\'s All-Time High',
    subtitle: 'Digital gold goes parabolic',
    description: 'Bitcoin breaks $70,000 for the first time. Experience crypto\'s legendary volatility.',
    learningObjective: 'Trade cryptocurrency\'s unique volatility patterns',
    historicalContext: 'Bitcoin ETF approval hype pushed BTC to new all-time highs. Extreme moves in both directions.',
    historicalDate: 'March 14, 2024',
    stockSymbol: 'BTC-USD',
    startDate: '2024-03-14',
    endDate: '2024-03-14',
    winConditions: [
      { type: 'profit_percent', value: 15, description: 'Make 15%+ return' },
      { type: 'win_streak', value: 3, description: 'Win 3 trades in a row' },
    ],
    rewards: [
      { type: 'xp', value: 400, label: '+400 XP' },
      { type: 'unlock_category', value: 'crypto', label: 'Unlock Crypto Trading' },
    ],
    difficulty: 'hard',
    estimatedTime: '4-5 min',
    tips: [
      'Crypto moves 24/7 - momentum can be relentless',
      'Take profits incrementally',
      'Volatility works both ways',
    ],
  },
  {
    id: 'c3m2-leveraged-etf',
    chapter: 3,
    order: 2,
    title: 'Triple Leverage',
    subtitle: '3x the risk, 3x the reward',
    description: 'Trade TQQQ - the triple-leveraged Nasdaq ETF. For experienced traders only.',
    learningObjective: 'Master leveraged products and their decay',
    historicalContext: 'A volatile Nasdaq day. With 3x leverage, small moves become huge opportunities (and risks).',
    historicalDate: 'April 15, 2024',
    stockSymbol: 'TQQQ',
    startDate: '2024-04-15',
    endDate: '2024-04-15',
    winConditions: [
      { type: 'profit_target', value: 800, description: 'Make $800 profit' },
      { type: 'max_drawdown', value: 15, description: 'Keep drawdown under 15%' },
    ],
    rewards: [
      { type: 'xp', value: 450, label: '+450 XP' },
      { type: 'title', value: 'Leverage Master', label: 'Title: Leverage Master' },
    ],
    difficulty: 'hard',
    estimatedTime: '4-5 min',
    tips: [
      'Leveraged ETFs are for short-term trading only',
      'They decay over time - don\'t hold overnight',
      'Smaller position sizes with leveraged products',
    ],
  },
  {
    id: 'c3m3-reversal-trading',
    chapter: 3,
    order: 3,
    title: 'Catching the Knife',
    subtitle: 'Buying the dip - the hard way',
    description: 'A stock crashes then reverses. Learn to identify exhaustion and catch the bounce.',
    learningObjective: 'Identify reversal patterns and exhaustion',
    historicalContext: 'META had a brutal selloff that reversed hard. Timing the bottom is dangerous but rewarding.',
    historicalDate: 'October 26, 2022',
    stockSymbol: 'META',
    startDate: '2022-10-26',
    endDate: '2022-10-26',
    winConditions: [
      { type: 'profit_percent', value: 12, description: 'Make 12%+ return' },
      { type: 'trades_count', value: 4, description: 'Complete at least 4 trades' },
    ],
    rewards: [
      { type: 'xp', value: 450, label: '+450 XP' },
      { type: 'title', value: 'Knife Catcher', label: 'Title: Knife Catcher' },
    ],
    difficulty: 'hard',
    estimatedTime: '4-5 min',
    tips: [
      'Never catch the first bounce - wait for confirmation',
      'Volume spike often marks the bottom',
      'Scale into positions - don\'t go all in',
    ],
  },
  {
    id: 'c3m4-range-trading',
    chapter: 3,
    order: 4,
    title: 'The Chop Zone',
    subtitle: 'When markets go sideways',
    description: 'Not every day has a clear trend. Learn to profit from range-bound markets.',
    learningObjective: 'Trade sideways markets using support and resistance',
    historicalContext: 'A low-volatility day on Amazon. No clear direction, but skilled traders found opportunity.',
    historicalDate: 'June 10, 2024',
    stockSymbol: 'AMZN',
    startDate: '2024-06-10',
    endDate: '2024-06-10',
    winConditions: [
      { type: 'win_rate', value: 70, description: 'Maintain 70%+ win rate' },
      { type: 'trades_count', value: 6, description: 'Complete at least 6 trades' },
    ],
    rewards: [
      { type: 'xp', value: 400, label: '+400 XP' },
    ],
    difficulty: 'hard',
    estimatedTime: '5-6 min',
    tips: [
      'Buy at support, sell at resistance',
      'In a range, take smaller profits',
      'Breakouts often fail in choppy markets',
    ],
  },
  {
    id: 'c3m5-boss-bear-market',
    chapter: 3,
    order: 5,
    title: 'The 2022 Bear Market',
    subtitle: 'FINAL BOSS',
    description: 'The worst tech selloff in years. Everything is crashing. Can you not just survive, but thrive?',
    learningObjective: 'Profit in a bear market using shorts and careful position sizing',
    historicalContext: 'June 2022: Tech stocks in free fall, inflation soaring, Fed hiking aggressively. QQQ down 30%+ from highs.',
    historicalDate: 'June 13, 2022',
    stockSymbol: 'QQQ',
    startDate: '2022-06-13',
    endDate: '2022-06-13',
    winConditions: [
      { type: 'survive', value: 1, description: 'Don\'t get liquidated' },
      { type: 'profit_target', value: 1000, description: 'Make $1,000 profit' },
      { type: 'beat_market', value: 1, description: 'Beat buy-and-hold (which lost money!)' },
    ],
    rewards: [
      { type: 'xp', value: 1000, label: '+1,000 XP' },
      { type: 'title', value: 'Bear Market Master', label: 'Title: Bear Market Master' },
      { type: 'unlock_feature', value: 'pro_stats', label: 'Unlock Pro Statistics' },
    ],
    difficulty: 'boss',
    estimatedTime: '6-7 min',
    isBoss: true,
    tips: [
      'In a bear market, the trend is DOWN',
      'Short rallies instead of buying dips',
      'Bear market rallies are traps for bulls',
    ],
  },
];

// Combine all chapters
export const CHAPTERS: Chapter[] = [
  {
    id: 1,
    title: 'The Basics',
    subtitle: 'Learn to Trade',
    description: 'Master the fundamentals of trading. Learn to buy, sell, manage risk, and survive market chaos.',
    missions: chapter1Missions,
    unlockLevel: 1,
    theme: {
      gradient: 'from-green-500 to-emerald-600',
      icon: '📚',
    },
  },
  {
    id: 2,
    title: 'Market Dynamics',
    subtitle: 'Read the Market',
    description: 'Understand how markets move. Trade trends, squeezes, earnings, and Fed days like a pro.',
    missions: chapter2Missions,
    unlockLevel: 10,
    theme: {
      gradient: 'from-blue-500 to-indigo-600',
      icon: '📈',
    },
  },
  {
    id: 3,
    title: 'Advanced Strategies',
    subtitle: 'Master the Game',
    description: 'Elite trading techniques. Crypto, leverage, reversals, and thriving in bear markets.',
    missions: chapter3Missions,
    unlockLevel: 20,
    theme: {
      gradient: 'from-purple-500 to-pink-600',
      icon: '🎯',
    },
  },
];

// Helper functions
export function getMissionById(id: string): Mission | undefined {
  for (const chapter of CHAPTERS) {
    const mission = chapter.missions.find(m => m.id === id);
    if (mission) return mission;
  }
  return undefined;
}

export function getChapterById(id: number): Chapter | undefined {
  return CHAPTERS.find(c => c.id === id);
}

export function getNextMission(currentMissionId: string): Mission | undefined {
  for (const chapter of CHAPTERS) {
    const currentIndex = chapter.missions.findIndex(m => m.id === currentMissionId);
    if (currentIndex !== -1) {
      // Check if there's another mission in this chapter
      if (currentIndex + 1 < chapter.missions.length) {
        return chapter.missions[currentIndex + 1];
      }
      // Check next chapter
      const nextChapter = CHAPTERS.find(c => c.id === chapter.id + 1);
      if (nextChapter && nextChapter.missions.length > 0) {
        return nextChapter.missions[0];
      }
    }
  }
  return undefined;
}

export function getTotalMissions(): number {
  return CHAPTERS.reduce((total, chapter) => total + chapter.missions.length, 0);
}
