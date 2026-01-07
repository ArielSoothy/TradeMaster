# TradeMaster Vision Document

## User's Original Vision (January 2025)

> "ultrathink and research. if this was a viral mobile game. would this how it would look?"

### Core Concept
TradeMaster must serve **TWO distinct audiences** simultaneously:

1. **Casual Players** - Fun, addictive arcade-style gameplay that even kids can play
2. **Actual Traders** - Realistic platform for day traders to practice in a fun, educational way

### Key Requirements

#### Immediate Understanding
- User should understand what's happening **immediately** upon entering
- Clear onboarding, no confusion

#### Two Game Modes (Proposed)
- **Story Mode** - Guided progression, challenges, narrative
- **Freestyle Mode** - Open practice, pick any stock

#### Two Visual Styles (Already Built)
- **Line Chart** - Could be "Arcade Mode" - simpler, more game-like
- **Candlestick Chart** - Could be "Real Mode" - for serious traders

#### Realism is Critical
> "if this is not realistic (except the 'time' coz we want to be able to control the speed of time for it to be more interesting) if its not realistic than its just a slop game that ppl will uninstall fast"

- Based on REAL historical trading data
- If a trader made these trades live, they'd see actual results
- Time compression is the only "unrealistic" element (necessary for gameplay)

#### User Retention Hooks
> "if they actually see hey, this is based on real trading day. im getting better, im learning. etc etc. then it will bring them back"

- Progress tracking that shows skill improvement
- Educational value that users recognize
- Real data that traders can verify

#### Different User Journeys
- **Trader**: Practice on favorite stocks (BTC, TSLA, etc.), improve skills
- **Casual Player**: Get highest score, clear the game, compete on leaderboards

### Future Features

#### Real-Time Mode
- Free delayed data (15-20 min delay)
- Premium subscription for real-time data
- Could be a monetization avenue

### Monetization Constraints
> "i want to publish it but not invest lots of money upfront"

- Must be low/no upfront cost
- Consider freemium model
- Premium features vs ads tradeoff

### Publication Goal
> "i want to try to publish this game, for real. so its not just a nice little project"

This is a REAL product intended for App Store / Play Store publication.

---

## Research Areas Needed

1. Mobile gaming psychology (addiction, retention, virality)
2. Trading simulator UX best practices
3. Dual-audience product design
4. Mobile game monetization (freemium, ads, subscriptions)
5. Educational game design
6. Onboarding best practices
7. Story mode design for casual games
8. Real-time data providers and costs

---

## Implementation Progress (January 2026)

### Phase 1: Home Screen Overhaul - COMPLETED

**Research Conducted:**
- Mobile game psychology (compulsion loops, variable rewards, dopamine)
- FTUE best practices (fun in <60 seconds)
- Trading simulator success factors
- Robinhood gamification controversy lessons
- Monetization strategies (freemium, subscriptions)

**Key Insight:** Realism IS the hook - real data creates authentic learning, which drives retention better than pure gamification.

**Files Created:**
```
src/types/career.ts              - Game mode types, mission/chapter structures
src/data/missions.ts             - 15 missions across 3 chapters
src/services/career.ts           - Career progress management
src/data/tutorial-scenarios.ts   - FTUE tutorial scenarios
src/components/home/CareerModeCard.tsx
src/components/home/ModeSelector.tsx
src/components/tutorial/TutorialOverlay.tsx
```

**New Home Screen Features:**
1. **Career Mode Card** (Hero CTA) - Orange gradient, shows progress
2. **Quick Play Section** with two modes:
   - **Arcade Mode** (Green) - Fast & fun, mystery mode, score-focused
   - **Trader Mode** (Purple) - Realistic practice, P&L tracking
3. **Today's Movers** - Real market gainers
4. **Daily Challenges** - Locked until Level 50
5. **Leaderboard Teaser** - Locked until Level 30

**Career Mode Missions (Famous Market Events):**
- Chapter 1 - The Basics: Flash Crash 2010, COVID Crash March 2020
- Chapter 2 - Market Dynamics: Tesla Rally, GME Squeeze, Fed Days
- Chapter 3 - Advanced: Bitcoin ATH, NVDA Earnings, Bear Market 2022

**User Decisions:**
- 3 chapters, ~15 missions total
- Use famous historical events
- Same layout, different color themes for modes
- Focus on gameplay first, no monetization in v1

### Phase 2: Career Mode Full Integration - IN PROGRESS

**TODO:**
- [ ] Wire Career Mode to load specific historical date ranges
- [ ] Integrate FTUE tutorial into first-launch flow
- [ ] Add mission briefing screen before career gameplay
- [ ] Implement mission completion logic and rewards
- [ ] Add mission win condition checking

### Phase 3: Mode Differentiation - PENDING

**TODO:**
- [ ] Arcade mode: simplified UI, faster defaults
- [ ] Trader mode: pro UI, advanced metrics (Sharpe ratio)
- [ ] Visual theme switching based on mode

### Phase 4: Daily Engagement - PENDING

**TODO:**
- [ ] Wire up Daily Challenge logic
- [ ] Implement daily streak tracking
- [ ] Add push notification hooks

---

*Document created to preserve vision across conversation context limits*
