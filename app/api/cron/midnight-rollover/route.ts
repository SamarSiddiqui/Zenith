import { NextResponse } from 'next/server';
import { createAdminClient } from '../../../../lib/supabase/admin';
import { calculateSprintDayInfo, getMondayOfWeek } from '../../../../lib/utils/sprintDate';
import { mapDbRowToHabit, rolloverPastUnloggedDays } from '../../../../lib/services/habits';
import type { HabitDbRow } from '../../../../types/zenith';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return handleMidnightRollover(request);
}

export async function POST(request: Request) {
  return handleMidnightRollover(request);
}

async function handleMidnightRollover(request: Request) {
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
    const currentMonday = getMondayOfWeek(new Date());
    const dayInfo = calculateSprintDayInfo(currentMonday.toISOString(), 7);
    const currentDayIndex = dayInfo.dayIndex;

    // Fetch all habits across all users
    const { data: rows, error } = await supabase.from('habits').select('*');

    if (error) {
      console.error('Error fetching habits for midnight rollover:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!rows || rows.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No habits found for rollover.',
        updatedCount: 0,
      });
    }

    let updatedCount = 0;

    for (const row of rows) {
      const habit = mapDbRowToHabit(row as HabitDbRow);
      const { habit: updatedHabit, changed } = rolloverPastUnloggedDays(habit, currentDayIndex);

      if (changed) {
        await supabase
          .from('habits')
          .update({
            weekly_history: updatedHabit.week,
            health_score: updatedHabit.health,
            current_status: updatedHabit.status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', habit.id);

        updatedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      currentDayIndex,
      totalHabitsChecked: rows.length,
      updatedCount,
      message: `Rolled over ${updatedCount} habits from unlogged to missed for past days.`,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Midnight rollover execution failure';
    console.error('Midnight rollover cron error:', errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
