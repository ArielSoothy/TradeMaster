import { useEffect, useRef, useMemo, useState } from 'react';
import { createChart, CandlestickSeries, AreaSeries, ColorType, CrosshairMode } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, CandlestickData, AreaData, Time } from 'lightweight-charts';
import type { CandleData, Position } from '../../types/game';

export type ChartMode = 'candles' | 'line';

// Easing function for smooth animation
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

interface TradingChartProps {
  data: CandleData[];
  currentIndex: number;
  position: Position | null;
  isPlaying: boolean;
  chartMode?: ChartMode;
  mysteryMode?: boolean;
  basePrice?: number;
}

export function TradingChart({ data, currentIndex, position, isPlaying, chartMode = 'candles', mysteryMode = false, basePrice = 0 }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const areaSeriesRef = useRef<ISeriesApi<'Area'> | null>(null);
  const prevChartModeRef = useRef<ChartMode>(chartMode);

  // Animation state for smooth flowing line
  const [animatedPrice, setAnimatedPrice] = useState<number | null>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const prevPriceRef = useRef<number | null>(null);
  const targetPriceRef = useRef<number | null>(null);
  const animationStartRef = useRef<number>(0);
  const lastIndexRef = useRef<number>(-1);
  const ANIMATION_DURATION = 450; // ms - slightly less than tick interval for smooth overlap

  // Use a base timestamp offset so the chart library interprets our indices as recent dates
  // This prevents "01 Jan '70" from appearing on day boundaries
  const BASE_TIMESTAMP = 1704067200; // Jan 1, 2024 00:00:00 UTC

  // Convert timestamp-based data to sequential index-based to avoid time gaps
  // This prevents weird horizontal lines when there are overnight/weekend gaps
  // Store original timestamps for x-axis label formatting
  const indexedData = useMemo(() => {
    return data.map((candle, index) => ({
      ...candle,
      // Use base timestamp + index*60 (pretend 1 min intervals) to avoid gaps
      // This tricks the library into thinking data is continuous recent data
      time: (BASE_TIMESTAMP + index * 60) as unknown as Time,
      originalTime: candle.time as number, // Keep original for display
    }));
  }, [data]);

  // Store data in ref so tickMarkFormatter can access current data
  const dataRef = useRef<CandleData[]>(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Get visible data up to current index for candlesticks
  const visibleCandleData = useMemo(() => {
    return indexedData.slice(0, currentIndex + 1).map(c => ({
      time: c.time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    })) as CandlestickData<Time>[];
  }, [indexedData, currentIndex]);

  // Get visible data for line/area chart (close prices) - without animation
  const visibleLineData = useMemo(() => {
    return indexedData.slice(0, currentIndex + 1).map(candle => ({
      time: candle.time,
      value: candle.close,
    })) as AreaData<Time>[];
  }, [indexedData, currentIndex]);

  // Animate price transitions for smooth flowing effect in line mode
  useEffect(() => {
    if (chartMode !== 'line' || data.length === 0) return;

    const currentPrice = data[currentIndex]?.close;
    if (currentPrice === undefined) return;

    // Check if this is a new candle (index changed)
    const isNewCandle = currentIndex !== lastIndexRef.current;

    if (isNewCandle) {
      lastIndexRef.current = currentIndex;

      // Get the previous candle's close price for smooth transition
      const prevPrice = currentIndex > 0
        ? data[currentIndex - 1]?.close ?? currentPrice
        : currentPrice;

      // If we have no animated price yet, start from previous candle
      if (animatedPrice === null) {
        prevPriceRef.current = prevPrice;
        setAnimatedPrice(prevPrice);
      } else {
        // Use current animated position as start point
        prevPriceRef.current = animatedPrice;
      }

      targetPriceRef.current = currentPrice;
      animationStartRef.current = performance.now();

      // Cancel any existing animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      // Start smooth animation
      const animate = (timestamp: number) => {
        const elapsed = timestamp - animationStartRef.current;
        const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
        const easedProgress = easeOutCubic(progress);

        const startPrice = prevPriceRef.current ?? currentPrice;
        const endPrice = targetPriceRef.current ?? currentPrice;
        const interpolated = startPrice + (endPrice - startPrice) * easedProgress;

        setAnimatedPrice(interpolated);

        // Continue animation until complete
        if (progress < 1 && chartMode === 'line') {
          animationRef.current = requestAnimationFrame(animate);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentIndex, chartMode, data]);

  // Generate smooth interpolated line data with animated last point
  const smoothLineData = useMemo(() => {
    if (chartMode !== 'line' || visibleLineData.length === 0) return visibleLineData;

    // Use animated price for the last point
    const result = [...visibleLineData];
    if (animatedPrice !== null && result.length > 0) {
      result[result.length - 1] = {
        ...result[result.length - 1],
        value: animatedPrice,
      };
    }
    return result;
  }, [visibleLineData, animatedPrice, chartMode]);

  // Current candle for price display
  const currentCandle = data[currentIndex];

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      localization: {
        timeFormatter: (time: number) => {
          // time is BASE_TIMESTAMP + index*60, convert back to index
          const BASE_TS = 1704067200;
          const index = Math.round((time - BASE_TS) / 60);
          const data = dataRef.current;
          if (!data || data.length === 0) return '';
          // Clamp to valid range to always show a meaningful time
          const clampedIndex = Math.max(0, Math.min(index, data.length - 1));
          const candle = data[clampedIndex];
          if (!candle) return '';
          const originalTimestamp = candle.time as number;
          const date = new Date(originalTimestamp * 1000);
          return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });
        },
      },
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: 'rgba(255, 255, 255, 0.3)',
          width: 1,
          labelBackgroundColor: '#333',
        },
        horzLine: {
          color: 'rgba(255, 255, 255, 0.3)',
          width: 1,
          labelBackgroundColor: '#333',
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        timeVisible: true,
        secondsVisible: false,
        tickMarkFormatter: (time: number, tickMarkType: number) => {
          // time is BASE_TIMESTAMP + index*60, convert back to index
          const BASE_TS = 1704067200;
          const index = Math.round((time - BASE_TS) / 60);
          const data = dataRef.current;
          if (!data || data.length === 0) return '';
          // Clamp to valid range - always show nearest valid time
          const clampedIndex = Math.max(0, Math.min(index, data.length - 1));
          const candle = data[clampedIndex];
          if (!candle) return '';
          const originalTimestamp = candle.time as number;
          if (!originalTimestamp || originalTimestamp < 1000000000) return '';
          const date = new Date(originalTimestamp * 1000);
          // tickMarkType: 0=Year, 1=Month, 2=DayOfMonth, 3=Time, 4=TimeWithSeconds
          if (tickMarkType <= 2) {
            // For date-type ticks, show date
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }
          return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });
        },
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: false,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    // Create candlestick series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
      visible: chartMode === 'candles',
    });

    // Create area series for smooth line mode
    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: '#8b5cf6',
      topColor: 'rgba(139, 92, 246, 0.4)',
      bottomColor: 'rgba(139, 92, 246, 0.0)',
      lineWidth: 3,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 6,
      crosshairMarkerBorderColor: '#8b5cf6',
      crosshairMarkerBackgroundColor: '#1f1f1f',
      visible: chartMode === 'line',
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    areaSeriesRef.current = areaSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Update chart data
  useEffect(() => {
    if (visibleCandleData.length === 0) return;

    // Update candlestick data
    if (candleSeriesRef.current) {
      candleSeriesRef.current.setData(visibleCandleData);
    }

    // Update area/line data with smooth animation
    if (areaSeriesRef.current) {
      areaSeriesRef.current.setData(chartMode === 'line' ? smoothLineData : visibleLineData);
    }

    // Auto-scroll to latest candle when playing
    if (chartRef.current && isPlaying) {
      chartRef.current.timeScale().scrollToRealTime();
    }
  }, [visibleCandleData, visibleLineData, smoothLineData, isPlaying, chartMode]);

  // Handle chart mode switching
  useEffect(() => {
    if (prevChartModeRef.current !== chartMode) {
      // Toggle visibility
      if (candleSeriesRef.current) {
        candleSeriesRef.current.applyOptions({ visible: chartMode === 'candles' });
      }
      if (areaSeriesRef.current) {
        areaSeriesRef.current.applyOptions({ visible: chartMode === 'line' });
      }
      prevChartModeRef.current = chartMode;
    }
  }, [chartMode]);

  // Position entry marker effect is handled via UI overlay instead of chart markers
  // (chart markers API changed in v5)

  return (
    <div className="relative w-full h-full">
      <div ref={chartContainerRef} className="w-full h-full" />

      {/* Current price overlay */}
      {currentCandle && (
        <div className="absolute top-4 left-4 glass-card px-4 py-2">
          {mysteryMode ? (
            // Mystery mode: show only percentage from base
            <>
              <div className={`text-2xl font-bold ${
                currentCandle.close >= basePrice ? 'text-green-400' : 'text-red-400'
              }`}>
                {currentCandle.close >= basePrice ? '+' : ''}
                {((currentCandle.close - basePrice) / basePrice * 100).toFixed(2)}%
              </div>
              <div className="text-xs text-gray-500">
                from session start
              </div>
            </>
          ) : (
            // Normal mode: show actual price
            <>
              <div className="text-2xl font-bold">
                ${currentCandle.close.toFixed(2)}
              </div>
              <div className={`text-sm ${
                currentCandle.close >= currentCandle.open ? 'text-green-400' : 'text-red-400'
              }`}>
                {currentCandle.close >= currentCandle.open ? '+' : ''}
                {((currentCandle.close - currentCandle.open) / currentCandle.open * 100).toFixed(2)}%
              </div>
            </>
          )}
        </div>
      )}

      {/* Position indicator */}
      {position && (
        <div className={`absolute top-4 right-4 px-4 py-2 rounded-lg font-bold ${
          position.type === 'long'
            ? 'bg-green-500/20 border border-green-500/50 text-green-400'
            : 'bg-red-500/20 border border-red-500/50 text-red-400'
        }`}>
          {position.type === 'long' ? '📈 LONG' : '📉 SHORT'} {position.leverage}x
          <div className="text-xs font-normal opacity-75">
            Entry: ${position.entryPrice.toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
}
