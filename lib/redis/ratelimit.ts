import { Ratelimit } from '@upstash/ratelimit';
import { getRedis } from './client';

let diagnosisRateLimiter: Ratelimit | null = null;

const redis = getRedis();

if (redis) {
  try {
    diagnosisRateLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 requests per 15 minutes (~1 per 3 mins)
      analytics: true,
      prefix: 'zenith:rl:diagnosis',
    });
  } catch (err) {
    console.warn('[Ratelimit] Failed to initialize Ratelimit instance:', err);
    diagnosisRateLimiter = null;
  }
}

export async function checkDiagnosisRateLimit(identifier: string) {
  if (!diagnosisRateLimiter) {
    return { success: true, remaining: 5, limit: 5, reset: 0 };
  }

  try {
    return await diagnosisRateLimiter.limit(identifier);
  } catch (err) {
    console.warn('[Ratelimit] Rate limit check failed, allowing request as fallback:', err);
    return { success: true, remaining: 5, limit: 5, reset: 0 };
  }
}
