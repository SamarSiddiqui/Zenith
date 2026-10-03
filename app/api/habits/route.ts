import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCached, setCached } from '../../../lib/redis/client';
import { mapDbRowToHabit } from '../../../lib/services/habits';
import type { Habit, HabitDbRow } from '../../../types/zenith';

const HABITS_CACHE_TTL_SECONDS = 30 * 60; // 30 Minutes TTL

function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId || userId === 'local-user') {
      return NextResponse.json({ habits: [] }, { status: 200 });
    }

    const cacheKey = `zenith:habits:${userId}`;

    // 1. Check Redis Cache
    const cachedHabits = await getCached<Habit[]>(cacheKey);
    if (cachedHabits) {
      const duration = Date.now() - startTime;
      return NextResponse.json(
        { habits: cachedHabits, isCached: true },
        {
          status: 200,
          headers: {
            'x-cache': 'HIT',
            'x-cache-key': cacheKey,
            'x-response-time-ms': String(duration),
          },
        }
      );
    }

    // 2. Fetch from Supabase
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ habits: [], error: 'Supabase not configured' }, { status: 500 });
    }

    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const habits: Habit[] = (data || []).map((row) => mapDbRowToHabit(row as HabitDbRow));

    // 3. Store in Redis
    await setCached(cacheKey, habits, HABITS_CACHE_TTL_SECONDS);

    const duration = Date.now() - startTime;
    return NextResponse.json(
      { habits, isCached: false },
      {
        status: 200,
        headers: {
          'x-cache': 'MISS',
          'x-cache-key': cacheKey,
          'x-response-time-ms': String(duration),
        },
      }
    );
  } catch (err: any) {
    console.error('Habits API Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch habits', habits: [] },
      { status: 500 }
    );
  }
}
