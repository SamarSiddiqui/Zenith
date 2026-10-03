import { Ratelimit } from '@upstash/ratelimit';
import { getRedis } from './client';

let diagnosisRateLimiter: Ratelimit | null = null;

const redis = getRedis();

if (redis) {
  try {
    diagnosisRateLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '10 m'), // 10 requests per 10 minutes per user/IP
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
    return { success: true, remaining: 10, limit: 10, reset: 0 };
  }

  try {
    return await diagnosisRateLimiter.limit(identifier);
  } catch (err) {
    console.warn('[Ratelimit] Rate limit check failed, allowing request as fallback:', err);
    return { success: true, remaining: 10, limit: 10, reset: 0 };
  }
}
