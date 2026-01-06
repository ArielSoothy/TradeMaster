/**
 * IndexedDB-based candle data cache for TradeMaster.
 * Stores 1-minute candle data locally to accumulate history over time.
 */

import type { CandleData } from '../types/game';

const DB_NAME = 'TradeMasterCandleCache';
const DB_VERSION = 1;
const CANDLES_STORE = 'candles';
const META_STORE = 'meta';

// Singleton database connection
let dbInstance: IDBDatabase | null = null;

export interface CacheMeta {
  symbol: string;
  oldestTimestamp: number;
  newestTimestamp: number;
  totalCandles: number;
  lastFetchTime: number;
}

/**
 * Initialize IndexedDB and return the database connection.
 * Creates object stores if they don't exist.
 */
export function initCandleCache(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Failed to open IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      console.log('IndexedDB candle cache initialized');
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Candles store: compound key [symbol, timestamp] for deduplication
      if (!db.objectStoreNames.contains(CANDLES_STORE)) {
        const candleStore = db.createObjectStore(CANDLES_STORE, {
          keyPath: ['symbol', 'timestamp'],
        });
        // Index for querying all candles for a symbol
        candleStore.createIndex('by-symbol', 'symbol', { unique: false });
      }

      // Meta store: track cache state per symbol
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: 'symbol' });
      }
    };
  });
}

/**
 * Get database connection, initializing if needed.
 */
async function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;
  return initCandleCache();
}

/**
 * Store candles to cache. Handles merge automatically via compound key.
 * Duplicate timestamps are overwritten (idempotent).
 */
export async function storeCandlesToCache(
  symbol: string,
  candles: CandleData[]
): Promise<void> {
  if (candles.length === 0) return;

  const db = await getDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction([CANDLES_STORE, META_STORE], 'readwrite');
    const candleStore = tx.objectStore(CANDLES_STORE);
    const metaStore = tx.objectStore(META_STORE);

    // Store each candle (compound key handles dedup)
    for (const candle of candles) {
      const record = {
        symbol,
        timestamp: candle.time as number,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        volume: candle.volume,
      };
      candleStore.put(record);
    }

    // Update metadata
    const timestamps = candles.map((c) => c.time as number);
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);

    // Get existing meta to merge
    const metaRequest = metaStore.get(symbol);
    metaRequest.onsuccess = () => {
      const existing = metaRequest.result as CacheMeta | undefined;
      const meta: CacheMeta = {
        symbol,
        oldestTimestamp: existing
          ? Math.min(existing.oldestTimestamp, minTime)
          : minTime,
        newestTimestamp: existing
          ? Math.max(existing.newestTimestamp, maxTime)
          : maxTime,
        totalCandles: (existing?.totalCandles || 0) + candles.length,
        lastFetchTime: Date.now() / 1000,
      };
      metaStore.put(meta);
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Get cached candles for a symbol within optional time range.
 * Returns empty array if no cache exists.
 */
export async function getCachedCandles(
  symbol: string,
  startTime?: number,
  endTime?: number
): Promise<CandleData[]> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(CANDLES_STORE, 'readonly');
    const store = tx.objectStore(CANDLES_STORE);
    const index = store.index('by-symbol');

    const candles: CandleData[] = [];
    const request = index.openCursor(IDBKeyRange.only(symbol));

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        const record = cursor.value;
        const timestamp = record.timestamp as number;

        // Apply time range filter if specified
        const afterStart = !startTime || timestamp >= startTime;
        const beforeEnd = !endTime || timestamp <= endTime;

        if (afterStart && beforeEnd) {
          candles.push({
            time: timestamp,
            open: record.open,
            high: record.high,
            low: record.low,
            close: record.close,
            volume: record.volume,
          } as CandleData);
        }
        cursor.continue();
      } else {
        // Sort by timestamp ascending
        candles.sort((a, b) => (a.time as number) - (b.time as number));
        resolve(candles);
      }
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Get cache metadata for a symbol.
 */
export async function getCacheMeta(symbol: string): Promise<CacheMeta | null> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE, 'readonly');
    const store = tx.objectStore(META_STORE);
    const request = store.get(symbol);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all cached symbols with their metadata.
 */
export async function getAllCacheMeta(): Promise<CacheMeta[]> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE, 'readonly');
    const store = tx.objectStore(META_STORE);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Clear all cached data for a specific symbol.
 */
export async function clearSymbolCache(symbol: string): Promise<void> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction([CANDLES_STORE, META_STORE], 'readwrite');
    const candleStore = tx.objectStore(CANDLES_STORE);
    const metaStore = tx.objectStore(META_STORE);
    const index = candleStore.index('by-symbol');

    // Delete all candles for this symbol
    const request = index.openCursor(IDBKeyRange.only(symbol));
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };

    // Delete metadata
    metaStore.delete(symbol);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Clear entire cache (all symbols).
 */
export async function clearAllCache(): Promise<void> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction([CANDLES_STORE, META_STORE], 'readwrite');
    tx.objectStore(CANDLES_STORE).clear();
    tx.objectStore(META_STORE).clear();

    tx.oncomplete = () => {
      console.log('Candle cache cleared');
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Get total cache size info.
 */
export async function getCacheStats(): Promise<{
  totalSymbols: number;
  totalCandles: number;
  symbols: string[];
}> {
  const metas = await getAllCacheMeta();
  return {
    totalSymbols: metas.length,
    totalCandles: metas.reduce((sum, m) => sum + m.totalCandles, 0),
    symbols: metas.map((m) => m.symbol),
  };
}
