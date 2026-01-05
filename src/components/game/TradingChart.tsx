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
}

export function TradingChart({ data, currentIndex, position, isPlaying, chartMode = 'candles' }: TradingChartProps) {
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
  const ANIMATION_DURATION = 400; // ms for smooth transition

  // Get visible data up to current index for candlesticks
  const visibleCandleData = useMemo(() => {
    return data.slice(0, currentIndex + 1) as CandlestickData<Time>[];
  }, [data, currentIndex]);

  // Get visible data for line/area chart (close prices) - without animation
  const visibleLineData = useMemo(() => {
    return data.slice(0, currentIndex + 1).map(candle => ({
      time: candle.time,
      value: candle.close,
    })) as AreaData<Time>[];
  }, [data, currentIndex]);

  // Animate price transitions for smooth flowing effect
  useEffect(() => {
    if (chartMode !== 'line' || !isPlaying || data.length === 0) return;

    const currentPrice = data[currentIndex]?.close;
    if (currentPrice === undefined) return;

    // Initialize on first render
    if (prevPriceRef.current === null) {
      prevPriceRef.current = currentPrice;
      setAnimatedPrice(currentPrice);
      return;
    }

    // Start animation to new price
    if (currentPrice !== targetPriceRef.current) {
      prevPriceRef.current = animatedPrice ?? currentPrice;
      targetPriceRef.current = currentPrice;
      animationStartRef.current = performance.now();

      const animate = (timestamp: number) => {
        const elapsed = timestamp - animationStartRef.current;
        const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
        const easedProgress = easeOutCubic(progress);

        const prev = prevPriceRef.current ?? currentPrice;
        const target = targetPriceRef.current ?? currentPrice;
        const interpolated = prev + (target - prev) * easedProgress;

        setAnimatedPrice(interpolated);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentIndex, chartMode, isPlaying, data, animatedPrice]);

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
          <div className="text-2xl font-bold">
            ${currentCandle.close.toFixed(2)}
          </div>
          <div className={`text-sm ${
            currentCandle.close >= currentCandle.open ? 'text-green-400' : 'text-red-400'
          }`}>
            {currentCandle.close >= currentCandle.open ? '+' : ''}
            {((currentCandle.close - currentCandle.open) / currentCandle.open * 100).toFixed(2)}%
          </div>
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
