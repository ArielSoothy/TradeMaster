# TradeMaster 📈🎮

An arcade-style day trading simulator with real historical stock data. Practice your trading skills without risking real money!

## Features

- **Real Market Data**: Intraday candles from Yahoo Finance API (1m, 5m, 15m intervals)
- **Any Ticker Symbol**: Enter any Yahoo Finance ticker (stocks, crypto, ETFs)
- **Time Range Selection**: 1 Day, 5 Days, or 1 Month of historical data
- **Chart Modes**:
  - 📊 **Candlestick Mode**: Realistic trading view
  - 〰️ **Line Mode**: Smooth flowing wave animation with easing (iOS game style)
- **Volatility Categories**:
  - 🎰 **Meme Stocks**: GME, AMC, BBBY - Extreme volatility
  - 🪙 **Crypto**: BTC, ETH, DOGE, SOL - Wild price swings
  - 🚀 **High Beta Tech**: TSLA, NVDA, AMD - High volatility
  - ⚡ **Leveraged ETFs**: TQQQ, SQQQ, SPXL - 3x built-in leverage!
  - 🌊 **Blue Chips**: AAPL, MSFT, SPY - Calmer trades
- **Simple Controls**: B key = Buy, S key = Sell, Space = Pause
- **Leverage Trading**: 1x, 2x, 5x, 10x options
- **Speed Control**: 1x, 2x, 4x playback speed
- **Scoring System**: XP, levels, grades (S/A/B/C/D/F)
- **iOS-Style UI**: Glass morphism, smooth animations
- **20+ Popular Stocks**: AAPL, TSLA, NVDA, and more

## Tech Stack

- React 18 + TypeScript + Vite
- Tailwind CSS v4 + Framer Motion
- TradingView lightweight-charts v5
- Yahoo Finance API (real historical data)

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## How to Play

1. Select a stock from the home screen
2. Watch the chart animate through real historical 5-minute candles
3. Press **B** or click BUY to go long
4. Press **S** or click SELL to go short or close position
5. Use leverage for higher risk/reward
6. Try to maximize your $10,000 starting balance!

## Controls

| Key | Action |
|-----|--------|
| B | Buy / Go Long |
| S | Sell / Go Short / Close |
| Space | Pause / Resume |

## Chart Modes

Toggle between chart modes using the 📊/〰️ buttons in the header:

- **📊 Candlestick Mode**: Traditional OHLC candlestick chart - realistic for learning actual trading patterns
- **〰️ Line Mode**: Smooth flowing area chart with purple gradient - more visually appealing and game-like

## Scoring

- **Win trades** earn 100+ XP
- **Streak bonuses** multiply XP (up to 5x)
- **10 Levels**: Rookie Trader → Trading God
- **Grades**: S (70%+ win rate, 50%+ profit) to F

## License

MIT

---

Built with ❤️ by Ariel Soothy
