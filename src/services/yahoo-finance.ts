import type { CandleData, YahooChartResponse } from '../types/game';
import type { UTCTimestamp } from 'lightweight-charts';

// CORS proxy for frontend access to Yahoo Finance
const CORS_PROXY = 'https://corsproxy.io/?';
const YAHOO_CHART_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';

// Intraday ranges and intervals
// 1m data: max 7 days
// 5m data: max 60 days
// 15m/30m data: max 60 days
export type TimeRange = '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y';
export type Interval = '1m' | '2m' | '5m' | '15m' | '30m' | '1h' | '1d';

interface FetchStockDataParams {
  symbol: string;
  range?: TimeRange;
  interval?: Interval;
}

/**
 * Fetch historical stock data from Yahoo Finance
 * For day trading: use 5m interval with 1mo range (good balance of data)
 */
export async function fetchStockData({
  symbol,
  range = '1mo',
  interval = '5m',
}: FetchStockDataParams): Promise<CandleData[]> {
  const url = `${CORS_PROXY}${encodeURIComponent(
    `${YAHOO_CHART_URL}/${symbol}?range=${range}&interval=${interval}&includePrePost=false`
  )}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`);
    }

    const data: YahooChartResponse = await response.json();

    if (data.chart.error) {
      throw new Error(data.chart.error.description);
    }

    const result = data.chart.result?.[0];
    if (!result) {
      throw new Error('No data returned from Yahoo Finance');
    }

    return transformToCandles(result);
  } catch (error) {
    console.error('Yahoo Finance fetch error:', error);
    throw error;
  }
}

/**
 * Transform Yahoo Finance response to candlestick format
 */
function transformToCandles(result: YahooChartResponse['chart']['result'][0]): CandleData[] {
  const { timestamp, indicators } = result;
  const quote = indicators.quote[0];

  const candles: CandleData[] = [];

  for (let i = 0; i < timestamp.length; i++) {
    // Skip if any OHLC value is null
    if (
      quote.open[i] === null ||
      quote.high[i] === null ||
      quote.low[i] === null ||
      quote.close[i] === null
    ) {
      continue;
    }

    candles.push({
      time: timestamp[i] as UTCTimestamp,
      open: quote.open[i]!,
      high: quote.high[i]!,
      low: quote.low[i]!,
      close: quote.close[i]!,
      volume: quote.volume[i] ?? undefined,
    });
  }

  return candles;
}

// Volatility levels for categorization
export type VolatilityLevel = 'extreme' | 'high' | 'medium' | 'low';

export interface StockInfo {
  symbol: string;
  name: string;
  volatility: VolatilityLevel;
  category: StockCategory;
}

export type StockCategory = 'all' | 'meme' | 'crypto' | 'tech' | 'leveraged' | 'bluechip';

// Category display info
export const CATEGORY_INFO: Record<StockCategory, { label: string; emoji: string; description: string }> = {
  all: { label: 'All', emoji: '📊', description: 'All stocks' },
  meme: { label: 'Meme', emoji: '🎰', description: 'High risk meme stocks' },
  crypto: { label: 'Crypto', emoji: '🪙', description: 'Cryptocurrency' },
  tech: { label: 'Tech', emoji: '🚀', description: 'High beta tech stocks' },
  leveraged: { label: 'Leveraged', emoji: '⚡', description: '3x leveraged ETFs' },
  bluechip: { label: 'Blue Chip', emoji: '🌊', description: 'Stable large caps' },
};

// Volatility display info
export const VOLATILITY_INFO: Record<VolatilityLevel, { label: string; emoji: string; color: string }> = {
  extreme: { label: 'EXTREME', emoji: '🔥', color: 'text-red-500' },
  high: { label: 'HIGH', emoji: '⚡', color: 'text-orange-400' },
  medium: { label: 'MEDIUM', emoji: '📈', color: 'text-yellow-400' },
  low: { label: 'LOW', emoji: '🌊', color: 'text-blue-400' },
};

/**
 * Comprehensive stock list with volatility and category info
 */
export const STOCKS: StockInfo[] = [
  // 🎰 MEME STOCKS - Extreme volatility
  { symbol: 'GME', name: 'GameStop Corp.', volatility: 'extreme', category: 'meme' },
  { symbol: 'AMC', name: 'AMC Entertainment', volatility: 'extreme', category: 'meme' },
  { symbol: 'BBBY', name: 'Bed Bath & Beyond', volatility: 'extreme', category: 'meme' },
  { symbol: 'BB', name: 'BlackBerry Ltd.', volatility: 'high', category: 'meme' },
  { symbol: 'PLTR', name: 'Palantir Technologies', volatility: 'high', category: 'meme' },

  // 🪙 CRYPTO - Extreme/High volatility
  { symbol: 'BTC-USD', name: 'Bitcoin USD', volatility: 'extreme', category: 'crypto' },
  { symbol: 'ETH-USD', name: 'Ethereum USD', volatility: 'extreme', category: 'crypto' },
  { symbol: 'DOGE-USD', name: 'Dogecoin USD', volatility: 'extreme', category: 'crypto' },
  { symbol: 'SOL-USD', name: 'Solana USD', volatility: 'extreme', category: 'crypto' },
  { symbol: 'XRP-USD', name: 'Ripple USD', volatility: 'high', category: 'crypto' },
  { symbol: 'COIN', name: 'Coinbase Global Inc.', volatility: 'high', category: 'crypto' },
  { symbol: 'MARA', name: 'Marathon Digital', volatility: 'extreme', category: 'crypto' },
  { symbol: 'RIOT', name: 'Riot Platforms', volatility: 'extreme', category: 'crypto' },

  // 🚀 HIGH BETA TECH - High volatility
  { symbol: 'TSLA', name: 'Tesla Inc.', volatility: 'high', category: 'tech' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', volatility: 'high', category: 'tech' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', volatility: 'high', category: 'tech' },
  { symbol: 'META', name: 'Meta Platforms Inc.', volatility: 'high', category: 'tech' },
  { symbol: 'NFLX', name: 'Netflix Inc.', volatility: 'high', category: 'tech' },
  { symbol: 'SHOP', name: 'Shopify Inc.', volatility: 'high', category: 'tech' },
  { symbol: 'SQ', name: 'Block Inc.', volatility: 'high', category: 'tech' },
  { symbol: 'ROKU', name: 'Roku Inc.', volatility: 'high', category: 'tech' },

  // ⚡ LEVERAGED ETFs - Extreme volatility (3x leverage built in!)
  { symbol: 'TQQQ', name: 'ProShares 3x QQQ', volatility: 'extreme', category: 'leveraged' },
  { symbol: 'SQQQ', name: 'ProShares -3x QQQ', volatility: 'extreme', category: 'leveraged' },
  { symbol: 'SPXL', name: 'Direxion 3x S&P 500', volatility: 'extreme', category: 'leveraged' },
  { symbol: 'SPXS', name: 'Direxion -3x S&P 500', volatility: 'extreme', category: 'leveraged' },
  { symbol: 'SOXL', name: 'Direxion 3x Semis', volatility: 'extreme', category: 'leveraged' },
  { symbol: 'LABU', name: 'Direxion 3x Biotech', volatility: 'extreme', category: 'leveraged' },

  // 🌊 BLUE CHIP - Low/Medium volatility
  { symbol: 'AAPL', name: 'Apple Inc.', volatility: 'medium', category: 'bluechip' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', volatility: 'medium', category: 'bluechip' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', volatility: 'medium', category: 'bluechip' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', volatility: 'medium', category: 'bluechip' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', volatility: 'low', category: 'bluechip' },
  { symbol: 'V', name: 'Visa Inc.', volatility: 'low', category: 'bluechip' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', volatility: 'low', category: 'bluechip' },
  { symbol: 'WMT', name: 'Walmart Inc.', volatility: 'low', category: 'bluechip' },
  { symbol: 'KO', name: 'Coca-Cola Company', volatility: 'low', category: 'bluechip' },
  { symbol: 'PG', name: 'Procter & Gamble', volatility: 'low', category: 'bluechip' },
  { symbol: 'SPY', name: 'S&P 500 ETF', volatility: 'low', category: 'bluechip' },
  { symbol: 'QQQ', name: 'Nasdaq-100 ETF', volatility: 'medium', category: 'bluechip' },
  { symbol: 'DIS', name: 'The Walt Disney Company', volatility: 'medium', category: 'bluechip' },
  { symbol: 'BA', name: 'Boeing Company', volatility: 'medium', category: 'bluechip' },
];

// Legacy export for backwards compatibility
export const POPULAR_STOCKS = STOCKS;

/**
 * Get stocks by category
 */
export function getStocksByCategory(category: StockCategory): StockInfo[] {
  if (category === 'all') return STOCKS;
  return STOCKS.filter(stock => stock.category === category);
}

/**
 * Get stocks by volatility level
 */
export function getStocksByVolatility(level: VolatilityLevel): StockInfo[] {
  return STOCKS.filter(stock => stock.volatility === level);
}

/**
 * Get high volatility stocks (extreme + high)
 */
export function getVolatileStocks(): StockInfo[] {
  return STOCKS.filter(stock => stock.volatility === 'extreme' || stock.volatility === 'high');
}

/**
 * Get a random stock from a category
 */
export function getRandomStock(category: StockCategory): StockInfo {
  const stocks = category === 'all' ? STOCKS : getStocksByCategory(category);
  return stocks[Math.floor(Math.random() * stocks.length)];
}

/**
 * Get a random stock by volatility level
 */
export function getRandomStockByVolatility(level: VolatilityLevel): StockInfo {
  const stocks = getStocksByVolatility(level);
  return stocks[Math.floor(Math.random() * stocks.length)];
}

/**
 * Fetch daily top gainers from Yahoo Finance
 * Falls back to volatile stocks if API fails
 */
export async function fetchDailyGainers(limit = 5): Promise<StockInfo[]> {
  try {
    // Try Yahoo Finance screener API for day gainers
    const url = `${CORS_PROXY}${encodeURIComponent(
      'https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved?scrIds=day_gainers&count=' + limit
    )}`;

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) throw new Error('Screener API failed');

    const data = await response.json();
    const quotes = data?.finance?.result?.[0]?.quotes;

    if (!quotes || quotes.length === 0) throw new Error('No gainers data');

    // Transform to StockInfo format
    return quotes.slice(0, limit).map((quote: { symbol: string; shortName?: string; longName?: string }) => ({
      symbol: quote.symbol,
      name: quote.shortName || quote.longName || quote.symbol,
      volatility: 'extreme' as VolatilityLevel,
      category: 'all' as StockCategory,
    }));
  } catch (error) {
    console.warn('Failed to fetch daily gainers, using fallback:', error);
    // Fallback: return random extreme volatility stocks
    const extremeStocks = getStocksByVolatility('extreme');
    const shuffled = [...extremeStocks].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);
  }
}

/**
 * Fetch daily top losers from Yahoo Finance
 * Falls back to volatile stocks if API fails
 */
export async function fetchDailyLosers(limit = 5): Promise<StockInfo[]> {
  try {
    const url = `${CORS_PROXY}${encodeURIComponent(
      'https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved?scrIds=day_losers&count=' + limit
    )}`;

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) throw new Error('Screener API failed');

    const data = await response.json();
    const quotes = data?.finance?.result?.[0]?.quotes;

    if (!quotes || quotes.length === 0) throw new Error('No losers data');

    return quotes.slice(0, limit).map((quote: { symbol: string; shortName?: string; longName?: string }) => ({
      symbol: quote.symbol,
      name: quote.shortName || quote.longName || quote.symbol,
      volatility: 'extreme' as VolatilityLevel,
      category: 'all' as StockCategory,
    }));
  } catch (error) {
    console.warn('Failed to fetch daily losers, using fallback:', error);
    const extremeStocks = getStocksByVolatility('extreme');
    const shuffled = [...extremeStocks].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);
  }
}

/**
 * Search stocks from predefined list
 */
export function searchStocks(query: string, category: StockCategory = 'all'): StockInfo[] {
  const lowerQuery = query.toLowerCase();
  const stocksToSearch = category === 'all' ? STOCKS : getStocksByCategory(category);
  return stocksToSearch.filter(
    stock =>
      stock.symbol.toLowerCase().includes(lowerQuery) ||
      stock.name.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Validate if a symbol exists (attempts to fetch minimal data)
 */
export async function validateSymbol(symbol: string): Promise<boolean> {
  try {
    const data = await fetchStockData({ symbol, range: '1mo', interval: '1d' });
    return data.length > 0;
  } catch {
    return false;
  }
}
