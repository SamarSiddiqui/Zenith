import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/client';
import {
  sendTelegramMessage,
  answerTelegramCallback,
  getTelegramConfig,
} from '../../../../lib/services/telegram';
import { calculateSprintDayInfo, getMondayOfWeek } from '../../../../lib/utils/sprintDate';

export async function POST(request: Request) {
  try {
    const update = await request.json();

    // 1. Handle Inline Button Callback Queries (Micro-actions & Completions)
    if (update.callback_query) {
      const cb = update.callback_query;
      const callbackId = cb.id;
      const data: string = cb.data || '';
      const chatId = cb.message?.chat?.id?.toString();

      if (data === 'test_ping') {
        await answerTelegramCallback(callbackId, '⚡ Interactive connection verified! Momentum active.');
        return NextResponse.json({ ok: true });
      }

      if (data.startsWith('done_') || data.startsWith('micro_')) {
        const isMicro = data.startsWith('micro_');
        const habitId = isMicro ? data.replace('micro_', '') : data.replace('done_', '');
        const supabase = createClient();

        if (supabase && habitId) {
          // Fetch the habit
          const { data: habitData } = await supabase
            .from('habits')
            .select('*')
            .eq('id', habitId)
            .maybeSingle();

          if (habitData) {
            const currentMonday = getMondayOfWeek(new Date());
            const dayInfo = calculateSprintDayInfo(currentMonday.toISOString(), 7);
            const todayIndex = dayInfo.dayIndex;

            const weekHistory = Array.isArray(habitData.weekly_history)
              ? [...habitData.weekly_history]
              : ['unlogged', 'unlogged', 'unlogged', 'unlogged', 'unlogged', 'unlogged', 'unlogged'];

            while (weekHistory.length <= todayIndex) {
              weekHistory.push('unlogged');
            }

            weekHistory[todayIndex] = 'completed';
            const healthBoost = isMicro ? Math.min(100, (habitData.health_score || 80) + 2) : 90;

            await supabase
              .from('habits')
              .update({
                weekly_history: weekHistory,
                current_status: 'completed',
                health_score: healthBoost,
                updated_at: new Date().toISOString(),
              })
              .eq('id', habitId);

            const toastText = isMicro
              ? `⚡ 5m micro-step logged for "${habitData.name}"! Identity momentum preserved.`
              : `✅ "${habitData.name}" marked as completed!`;

            await answerTelegramCallback(callbackId, toastText);

            if (chatId) {
              await sendTelegramMessage(
                chatId,
                `✨ <b>Ritual Recorded:</b> <i>${habitData.name}</i> has been logged as <b>${isMicro ? 'Micro-Step ⚡' : 'Completed ✅'}</b> in your Zenith Habit Planner.`
              );
            }

            return NextResponse.json({ ok: true });
          }
        }

        await answerTelegramCallback(callbackId, 'Ritual updated ✨');
        return NextResponse.json({ ok: true });
      }

      await answerTelegramCallback(callbackId);
      return NextResponse.json({ ok: true });
    }

    // 2. Handle Text Messages & Commands
    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat?.id?.toString();
      const text: string = msg.text || '';
      const username: string = msg.from?.username || '';
      const firstName: string = msg.from?.first_name || 'there';

      if (!chatId) {
        return NextResponse.json({ ok: true });
      }

      // Handle /start or /start <token>
      if (text.startsWith('/start')) {
        const parts = text.split(' ');
        const token = parts.length > 1 ? parts[1].trim() : null;
        const supabase = createClient();

        if (token && supabase) {
          // Attempt to link profile via token
          const { data: updatedProfiles, error } = await supabase
            .from('profiles')
            .update({
              telegram_chat_id: chatId,
              telegram_username: username || null,
              telegram_link_token: null, // consume token
              telegram_reminders_enabled: true,
              updated_at: new Date().toISOString(),
            })
            .eq('telegram_link_token', token)
            .select();

          if (!error && updatedProfiles && updatedProfiles.length > 0) {
            const userProfile = updatedProfiles[0];
            const welcomeText =
              `🌿 <b>Welcome to Zenith, ${userProfile.full_name || firstName}!</b>\n\n` +
              `Your Telegram account is now connected. Zenith will gently notify you at the end of your working window if any rituals remain unlogged.\n\n` +
              `Use <b>/status</b> anytime to check today's rituals.`;

            await sendTelegramMessage(chatId, welcomeText, [
              [{ text: '🔗 Open Zenith Dashboard', url: `${getTelegramConfig().appUrl}/habits` }],
            ]);

            return NextResponse.json({ ok: true });
          }
        }

        // Generic welcome if no token provided or already linked
        const defaultWelcome =
          `✨ <b>Hello ${firstName}! I am your Zenith Circadian Habit Assistant.</b>\n\n` +
          `To link your account, go to <b>Zenith Settings</b> in your browser and click <b>Connect Telegram</b>.\n\n` +
          `Commands available:\n` +
          `• <b>/status</b> — Check today's rituals and completion progress\n` +
          `• <b>/help</b> — Information about mindful circadian notifications`;

        await sendTelegramMessage(chatId, defaultWelcome);
        return NextResponse.json({ ok: true });
      }

      // Handle /status command
      if (text.startsWith('/status')) {
        const supabase = createClient();
        if (supabase) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name')
            .eq('telegram_chat_id', chatId)
            .maybeSingle();

          if (profile) {
            const { data: habits } = await supabase
              .from('habits')
              .select('*')
              .eq('user_id', profile.id);

            const currentMonday = getMondayOfWeek(new Date());
            const dayInfo = calculateSprintDayInfo(currentMonday.toISOString(), 7);
            const todayIndex = dayInfo.dayIndex;

            const habitList = habits || [];
            const completed = habitList.filter((h) => h.weekly_history?.[todayIndex] === 'completed').length;
            const total = habitList.length;

            let statusMsg = `📊 <b>Today's Zenith Habit Status:</b>\n\n`;
            statusMsg += `Completed: <b>${completed} / ${total}</b> rituals\n\n`;

            habitList.forEach((h) => {
              const status = h.weekly_history?.[todayIndex] || 'unlogged';
              const icon = status === 'completed' ? '✅' : status === 'missed' ? '❌' : '⏳';
              statusMsg += `${icon} <b>${h.name}</b> (${status})\n`;
            });

            await sendTelegramMessage(chatId, statusMsg, [
              [{ text: '🔗 Open Habit Planner', url: `${getTelegramConfig().appUrl}/habits` }],
            ]);

            return NextResponse.json({ ok: true });
          }
        }

        await sendTelegramMessage(chatId, 'Account not connected. Please visit Zenith Settings to connect your Telegram.');
        return NextResponse.json({ ok: true });
      }

      // Handle /help command
      if (text.startsWith('/help')) {
        const helpText =
          `🌿 <b>Zenith Circadian Habit Assistant</b>\n\n` +
          `Zenith uses adaptive circadian tracking and zero-guilt micro-fallbacks.\n\n` +
          `• <b>End-of-Day Check-in:</b> Arrives at your configured EOD time.\n` +
          `• <b>Micro-Steps:</b> When busy, tap "⚡ Micro-Step" on any reminder to preserve your identity streak.\n` +
          `• <b>Commands:</b> Send /status to review today's show-up rate anytime.`;

        await sendTelegramMessage(chatId, helpText);
        return NextResponse.json({ ok: true });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Webhook error';
    console.error('Telegram Webhook error:', errorMsg);
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}
