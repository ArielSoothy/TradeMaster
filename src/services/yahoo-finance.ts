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

/**
 * Search for stocks by query
 * Note: Yahoo Finance search API requires different handling
 * For MVP, we'll use a predefined list of popular stocks
 */
export const POPULAR_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'AMD', name: 'Advanced Micro Devices' },
  { symbol: 'NFLX', name: 'Netflix Inc.' },
  { symbol: 'DIS', name: 'The Walt Disney Company' },
  { symbol: 'COIN', name: 'Coinbase Global Inc.' },
  { symbol: 'SPY', name: 'S&P 500 ETF' },
  { symbol: 'QQQ', name: 'Nasdaq-100 ETF' },
  { symbol: 'GME', name: 'GameStop Corp.' },
  { symbol: 'AMC', name: 'AMC Entertainment' },
  { symbol: 'BA', name: 'Boeing Company' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
  { symbol: 'V', name: 'Visa Inc.' },
  { symbol: 'JNJ', name: 'Johnson & Johnson' },
  { symbol: 'WMT', name: 'Walmart Inc.' },
];

/**
 * Search stocks from predefined list
 */
export function searchStocks(query: string): typeof POPULAR_STOCKS {
  const lowerQuery = query.toLowerCase();
  return POPULAR_STOCKS.filter(
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
