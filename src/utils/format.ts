/**
 * Format a number as currency (USD)
 */
export function formatCurrency(value: number, showSign = false): string {
  const sign = showSign && value > 0 ? '+' : '';
  return sign + new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a number as a percentage
 */
export function formatPercent(value: number, showSign = false): string {
  const sign = showSign && value > 0 ? '+' : '';
  return sign + value.toFixed(2) + '%';
}

/**
 * Format a large number with K/M/B suffixes
 */
export function formatCompact(value: number): string {
  if (value >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(1) + 'B';
  }
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(1) + 'M';
  }
  if (value >= 1_000) {
    return (value / 1_000).toFixed(1) + 'K';
  }
  return value.toFixed(0);
}

/**
 * Format a stock price
 */
export function formatPrice(price: number): string {
  if (price >= 1000) {
    return price.toFixed(0);
  }
  if (price >= 100) {
    return price.toFixed(1);
  }
  return price.toFixed(2);
}

/**
 * Format a timestamp to readable time
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
