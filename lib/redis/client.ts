import { Redis } from '@upstash/redis';

/**
 * Normalizes environment variables (strips wrapping quotes if present)
 */
function cleanEnv(val?: string): string | undefined {
  if (!val) return undefined;
  return val.trim().replace(/^["']|["']$/g, '');
}

const url = cleanEnv(process.env.UPSTASH_REDIS_REST_URL);
const token = cleanEnv(process.env.UPSTASH_REDIS_REST_TOKEN);

let redisInstance: Redis | null = null;

if (url && token) {
  try {
    redisInstance = new Redis({
      url,
      token,
    });
  } catch (err) {
    console.warn('[Redis] Failed to initialize Upstash Redis client. Caching will be bypassed:', err);
    redisInstance = null;
  }
} else {
  console.warn('[Redis] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN missing. Caching will be bypassed.');
}

/**
 * Returns the singleton Upstash Redis client or null if unavailable.
 */
export function getRedis(): Redis | null {
  return redisInstance;
}

/**
 * Check if Redis is configured and available
 */
export function isRedisAvailable(): boolean {
  return redisInstance !== null;
}

/**
 * Generic Cache GET helper with safe graceful fallback
 */
export async function getCached<T>(key: string): Promise<T | null> {
  if (!redisInstance) return null;
  try {
    const data = await redisInstance.get<T>(key);
    return data ?? null;
  } catch (err) {
    console.warn(`[Redis GET error] for key "${key}":`, err);
    return null;
  }
}

/**
 * Generic Cache SET helper with optional TTL (in seconds)
 */
export async function setCached<T>(
  key: string,
  value: T,
  ttlSeconds?: number
): Promise<boolean> {
  if (!redisInstance) return false;
  try {
    if (ttlSeconds && ttlSeconds > 0) {
      await redisInstance.set(key, value, { ex: ttlSeconds });
    } else {
      await redisInstance.set(key, value);
    }
    return true;
  } catch (err) {
    console.warn(`[Redis SET error] for key "${key}":`, err);
    return false;
  }
}

/**
 * Generic Cache DELETE helper
 */
export async function deleteCached(key: string): Promise<boolean> {
  if (!redisInstance) return false;
  try {
    await redisInstance.del(key);
    return true;
  } catch (err) {
    console.warn(`[Redis DEL error] for key "${key}":`, err);
    return false;
  }
}

/**
 * Deletes keys matching a wildcard pattern using SCAN (safe for production)
 */
export async function deleteByPattern(pattern: string): Promise<number> {
  if (!redisInstance) return 0;
  try {
    let cursor = 0;
    let totalDeleted = 0;

    do {
      const [nextCursor, keys] = await redisInstance.scan(cursor, {
        match: pattern,
        count: 100,
      });

      cursor = Number(nextCursor);

      if (keys && keys.length > 0) {
        await redisInstance.del(...keys);
        totalDeleted += keys.length;
      }
    } while (cursor !== 0);

    return totalDeleted;
  } catch (err) {
    console.warn(`[Redis SCAN/DEL error] for pattern "${pattern}":`, err);
    return 0;
  }
}

/**
 * Computes a fast, deterministic hash string from habits array and sprint context
 * to use as a cache invalidation key.
 */
export function hashHabitsState(habits: any[], sprintDay: number = 0, workingWindow?: any): string {
  try {
    const signature = habits
      .map((h) => {
        const id = h.id || '';
        const weekStr = (h.week || []).join('');
        const slot = h.circadianSlot || '';
        const minutes = h.minutes || 0;
        return `${id}:${weekStr}:${slot}:${minutes}`;
      })
      .sort()
      .join('|');

    const fullSignature = `${signature}#day:${sprintDay}#win:${workingWindow?.startTime || ''}-${workingWindow?.endTime || ''}`;

    // Fast 32-bit FNV-1a string hash
    let hash = 2166136261;
    for (let i = 0; i < fullSignature.length; i++) {
      hash ^= fullSignature.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  } catch {
    return String(Date.now());
  }
}
