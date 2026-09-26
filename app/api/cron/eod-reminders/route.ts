import { NextResponse } from 'next/server';
import { createAdminClient } from '../../../../lib/supabase/admin';
import { sendTelegramMessage, formatEodReminder } from '../../../../lib/services/telegram';
import { calculateSprintDayInfo, getMondayOfWeek } from '../../../../lib/utils/sprintDate';
import { mapDbRowToHabit } from '../../../../lib/services/habits';
import type { HabitDbRow } from '../../../../types/zenith';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return handleCronJob(request);
}

export async function POST(request: Request) {
  return handleCronJob(request);
}

async function handleCronJob(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // Verify authorization if CRON_SECRET is configured
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    const url = new URL(request.url);
    const querySecret =
      url.searchParams.get('secret') ||
      url.searchParams.get('cron_secret') ||
      url.searchParams.get('key') ||
      url.searchParams.get('token');

    if (querySecret !== cronSecret) {
      return NextResponse.json(
        {
          error: 'Unauthorized cron invocation',
          hint: 'Pass ?secret=YOUR_CRON_SECRET in the URL or Authorization: Bearer YOUR_CRON_SECRET header.',
        },
        { status: 401 }
      );
    }
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase client unavailable' }, { status: 500 });
  }

  try {
    // 1. Query all users with Telegram notifications enabled and chat ID configured
    let profiles: Array<{
      id: string;
      full_name?: string | null;
      telegram_chat_id?: string | null;
      telegram_reminders_enabled?: boolean;
      working_window?: unknown;
    }> | null = null;

    try {
      const { data: rpcProfiles, error: rpcErr } = await supabase.rpc('get_telegram_eod_users');
      if (!rpcErr && rpcProfiles && rpcProfiles.length > 0) {
        profiles = rpcProfiles;
      }
    } catch {
      // fallback
    }

    if (!profiles) {
      const { data: tableProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, telegram_chat_id, telegram_reminders_enabled, working_window')
        .not('telegram_chat_id', 'is', null);

      if (profilesError) {
        console.error('Error querying profiles for EOD cron:', profilesError);
        return NextResponse.json({ error: profilesError.message }, { status: 500 });
      }
      profiles = (tableProfiles || []).filter(
        (p) => p.telegram_chat_id && p.telegram_reminders_enabled !== false
      );
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users with active Telegram notifications found.',
        dispatchedCount: 0,
      });
    }

    const currentMonday = getMondayOfWeek(new Date());
    const dayInfo = calculateSprintDayInfo(currentMonday.toISOString(), 7);
    const todayIndex = dayInfo.dayIndex;
    const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    let dispatchedCount = 0;
    const results: Array<{ userId: string; unloggedCount: number; status: string }> = [];

    // 2. Iterate through each connected user
    for (const profile of profiles) {
      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', profile.id);

      if (habitsError || !habitsData) {
        continue;
      }

      const habits = habitsData.map((row) => mapDbRowToHabit(row as HabitDbRow));

      // Filter unlogged rituals for today
      const unloggedHabits = habits.filter((h) => {
        const status = h.week[todayIndex] || 'unlogged';
        return status === 'unlogged';
      });

      if (unloggedHabits.length > 0 && profile.telegram_chat_id) {
        const { message, keyboard } = formatEodReminder(
          profile.full_name || 'Zenith User',
          unloggedHabits,
          dayName
        );

        const dispatch = await sendTelegramMessage(profile.telegram_chat_id, message, keyboard);

        if (dispatch.success) {
          dispatchedCount++;
          results.push({
            userId: profile.id,
            unloggedCount: unloggedHabits.length,
            status: 'sent',
          });
        } else {
          results.push({
            userId: profile.id,
            unloggedCount: unloggedHabits.length,
            status: `error: ${dispatch.error}`,
          });
        }
      } else {
        results.push({
          userId: profile.id,
          unloggedCount: 0,
          status: 'all_habits_completed',
        });
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      dispatchedCount,
      totalUsersChecked: profiles.length,
      results,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Cron execution failure';
    console.error('EOD Cron error:', errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
