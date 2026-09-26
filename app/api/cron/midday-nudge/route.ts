import { NextResponse } from 'next/server';
import { createAdminClient } from '../../../../lib/supabase/admin';
import { sendTelegramMessage, formatMiddayMicroNudge } from '../../../../lib/services/telegram';
import { calculateSprintDayInfo, getMondayOfWeek } from '../../../../lib/utils/sprintDate';
import { mapDbRowToHabit } from '../../../../lib/services/habits';
import type { HabitDbRow } from '../../../../types/zenith';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return handleMiddayNudge(request);
}

export async function POST(request: Request) {
  return handleMiddayNudge(request);
}

async function handleMiddayNudge(request: Request) {
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
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, telegram_chat_id, telegram_reminders_enabled')
      .not('telegram_chat_id', 'is', null)
      .eq('telegram_reminders_enabled', true);

    if (profilesError) {
      console.error('Error querying profiles for midday nudge:', profilesError);
      return NextResponse.json({ error: profilesError.message }, { status: 500 });
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
    const results: Array<{ userId: string; habitName?: string; status: string }> = [];

    // 2. Iterate through each connected user
    for (const profile of profiles) {
      if (!profile.telegram_chat_id) continue;

      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', profile.id);

      if (habitsError || !habitsData || habitsData.length === 0) {
        continue;
      }

      const habits = habitsData.map((row) => mapDbRowToHabit(row as HabitDbRow));

      // Filter unlogged rituals for today
      const unloggedHabits = habits.filter((h) => {
        const status = h.week[todayIndex] || 'unlogged';
        return status === 'unlogged';
      });

      if (unloggedHabits.length === 0) {
        results.push({
          userId: profile.id,
          status: 'all_habits_completed',
        });
        continue;
      }

      // Prioritize: morning/afternoon rituals first, sorted by shortest duration
      const prioritizedHabits = [...unloggedHabits].sort((a, b) => {
        const slotScore = (slot: string) => {
          if (slot === 'morning') return 1;
          if (slot === 'afternoon') return 2;
          if (slot === 'anytime') return 3;
          return 4; // evening
        };
        const scoreDiff = slotScore(a.circadianSlot) - slotScore(b.circadianSlot);
        if (scoreDiff !== 0) return scoreDiff;
        return (a.minutes || 15) - (b.minutes || 15);
      });

      const selectedHabit = prioritizedHabits[0];

      const { message, keyboard } = formatMiddayMicroNudge(
        profile.full_name || 'Zenith User',
        selectedHabit,
        dayName
      );

      const dispatch = await sendTelegramMessage(profile.telegram_chat_id, message, keyboard);

      if (dispatch.success) {
        dispatchedCount++;
        results.push({
          userId: profile.id,
          habitName: selectedHabit.name,
          status: 'sent',
        });
      } else {
        results.push({
          userId: profile.id,
          habitName: selectedHabit.name,
          status: `error: ${dispatch.error}`,
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
    const errorMsg = err instanceof Error ? err.message : 'Midday nudge execution failure';
    console.error('Midday Nudge Cron error:', errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
