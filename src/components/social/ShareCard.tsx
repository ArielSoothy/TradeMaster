/**
 * ShareCard component - generates shareable images for social media.
 * This is the PRIMARY viral mechanic.
 */

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export interface ShareCardData {
  username: string;
  symbol: string;
  pnlPercent: number;
  pnlAmount: number;
  beatMarketDelta: number;
  grade: string;
  streak: number;
  rank?: number;
  leaderboardType?: 'daily' | 'weekly' | 'allTime';
}

interface ShareCardProps {
  data: ShareCardData;
  onClose: () => void;
}

export function ShareCard({ data, onClose }: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    generateCard();
  }, [data]);

  async function generateCard() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Card dimensions (1200x630 for Twitter/OG)
    const width = 1200;
    const height = 630;
    canvas.width = width;
    canvas.height = height;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f0f23');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add subtle grid pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i < height; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // Border
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.5)';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // Header
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
    ctx.fillText('TRADEMASTER', 60, 80);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '24px system-ui, -apple-system, sans-serif';
    ctx.fillText('SESSION RESULTS', 60, 115);

    // Username
    ctx.fillStyle = '#a5b4fc';
    ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`@${data.username}`, width - 60, 80);
    ctx.textAlign = 'left';

    // Main content area
    const contentY = 180;

    // Symbol
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 72px system-ui, -apple-system, sans-serif';
    ctx.fillText(data.symbol, 60, contentY + 60);

    // Grade badge
    const gradeColors: Record<string, string> = {
      S: '#fbbf24',
      A: '#34d399',
      B: '#60a5fa',
      C: '#a78bfa',
      D: '#f87171',
      F: '#ef4444',
    };
    const gradeX = 60 + ctx.measureText(data.symbol).width + 30;
    ctx.fillStyle = gradeColors[data.grade] || '#a78bfa';
    roundRect(ctx, gradeX, contentY + 15, 80, 60, 12);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
    ctx.fillText(data.grade, gradeX + 25, contentY + 55);

    // PnL - BIG
    const isPositive = data.pnlPercent >= 0;
    ctx.fillStyle = isPositive ? '#34d399' : '#f87171';
    ctx.font = 'bold 120px system-ui, -apple-system, sans-serif';
    const pnlText = `${isPositive ? '+' : ''}${data.pnlPercent.toFixed(1)}%`;
    ctx.fillText(pnlText, 60, contentY + 200);

    // PnL amount
    ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = isPositive ? 'rgba(52, 211, 153, 0.7)' : 'rgba(248, 113, 113, 0.7)';
    const amountText = `${isPositive ? '+' : ''}$${Math.abs(data.pnlAmount).toFixed(0)}`;
    ctx.fillText(amountText, 60, contentY + 260);

    // Stats row
    const statsY = contentY + 330;

    // Beat Market
    if (data.beatMarketDelta !== 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '24px system-ui, -apple-system, sans-serif';
      ctx.fillText('BEAT MARKET', 60, statsY);

      const bmPositive = data.beatMarketDelta > 0;
      ctx.fillStyle = bmPositive ? '#34d399' : '#f87171';
      ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${bmPositive ? '+' : ''}${data.beatMarketDelta.toFixed(1)}%`, 60, statsY + 45);
    }

    // Streak
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '24px system-ui, -apple-system, sans-serif';
    ctx.fillText('STREAK', 350, statsY);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
    ctx.fillText(`${data.streak}`, 350, statsY + 45);

    // Rank (if available)
    if (data.rank) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '24px system-ui, -apple-system, sans-serif';
      const leaderboardLabel = data.leaderboardType === 'daily' ? 'TODAY' :
                               data.leaderboardType === 'weekly' ? 'THIS WEEK' : 'ALL TIME';
      ctx.fillText(leaderboardLabel, 500, statsY);

      ctx.fillStyle = '#a5b4fc';
      ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
      ctx.fillText(`#${data.rank}`, 500, statsY + 45);
    }

    // Right side decorative chart
    drawMiniChart(ctx, width - 350, 150, 280, 200, isPositive);

    // Footer
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '20px system-ui, -apple-system, sans-serif';
    ctx.fillText('trademaster.app', 60, height - 50);

    // CTA
    ctx.fillStyle = '#6366f1';
    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Can you beat the market?', width - 60, height - 50);
    ctx.textAlign = 'left';

    // Generate image URL
    const url = canvas.toDataURL('image/png');
    setImageUrl(url);
    setIsGenerating(false);
  }

  function downloadImage() {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.download = `trademaster-${data.symbol}-${Date.now()}.png`;
    link.href = imageUrl;
    link.click();
  }

  async function shareToTwitter() {
    const text = `Just ${data.pnlPercent >= 0 ? 'made' : 'lost'} ${data.pnlPercent >= 0 ? '+' : ''}${data.pnlPercent.toFixed(1)}% trading ${data.symbol} on TradeMaster! ${data.beatMarketDelta > 0 ? `Beat the market by ${data.beatMarketDelta.toFixed(1)}%` : ''} Can you do better?`;
    const url = 'https://trademaster.app';
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank');
  }

  async function copyImage() {
    if (!canvasRef.current) return;
    try {
      const blob = await new Promise<Blob>((resolve) => {
        canvasRef.current!.toBlob((b) => resolve(b!), 'image/png');
      });
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      alert('Image copied to clipboard!');
    } catch {
      alert('Could not copy image. Try downloading instead.');
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-2xl bg-gray-900 rounded-2xl overflow-hidden border border-white/10"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Preview */}
        <div className="p-4 border-b border-white/10">
          <h3 className="text-lg font-bold text-white mb-4">Share Your Results</h3>
          <div className="aspect-[1200/630] bg-gray-800 rounded-lg overflow-hidden">
            {isGenerating ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : imageUrl ? (
              <img src={imageUrl} alt="Share card" className="w-full h-full object-contain" />
            ) : null}
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Actions */}
        <div className="p-4 flex flex-wrap gap-3">
          <button
            onClick={shareToTwitter}
            className="flex-1 min-w-[140px] py-3 px-4 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Share on X
          </button>

          <button
            onClick={copyImage}
            className="flex-1 min-w-[140px] py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            Copy Image
          </button>

          <button
            onClick={downloadImage}
            className="flex-1 min-w-[140px] py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </motion.div>
    </motion.div>
  );
}

// Helper functions
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawMiniChart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  isPositive: boolean
) {
  // Generate random-ish chart line
  const points: { x: number; y: number }[] = [];
  const segments = 20;

  let currentY = isPositive ? height * 0.7 : height * 0.3;
  const trend = isPositive ? -0.03 : 0.03;

  for (let i = 0; i <= segments; i++) {
    const px = x + (width / segments) * i;
    currentY += (Math.random() - 0.5 + trend) * (height * 0.15);
    currentY = Math.max(y + 20, Math.min(y + height - 20, currentY));
    points.push({ x: px, y: currentY });
  }

  // Draw area
  const gradient = ctx.createLinearGradient(x, y, x, y + height);
  if (isPositive) {
    gradient.addColorStop(0, 'rgba(52, 211, 153, 0.3)');
    gradient.addColorStop(1, 'rgba(52, 211, 153, 0)');
  } else {
    gradient.addColorStop(0, 'rgba(248, 113, 113, 0.3)');
    gradient.addColorStop(1, 'rgba(248, 113, 113, 0)');
  }

  ctx.beginPath();
  ctx.moveTo(points[0].x, y + height);
  points.forEach((p) => ctx.lineTo(p.x, p.y));
  ctx.lineTo(points[points.length - 1].x, y + height);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // Draw line
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  points.forEach((p) => ctx.lineTo(p.x, p.y));
  ctx.strokeStyle = isPositive ? '#34d399' : '#f87171';
  ctx.lineWidth = 3;
  ctx.stroke();
}
