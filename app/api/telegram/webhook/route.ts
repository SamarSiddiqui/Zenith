import { NextResponse } from 'next/server';
import { createAdminClient } from '../../../../lib/supabase/admin';
import {
  sendTelegramMessage,
  answerTelegramCallback,
  getTelegramConfig,
} from '../../../../lib/services/telegram';
import { calculateSprintDayInfo, getMondayOfWeek } from '../../../../lib/utils/sprintDate';

interface HabitItem {
  id: string;
  name: string;
  current_status?: string;
  weekly_history?: string[];
  micro_version?: string;
}

export async function POST(request: Request) {
  try {
    const update = await request.json();
    const supabase = createAdminClient();

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

        if (supabase && habitId) {
          const currentMonday = getMondayOfWeek(new Date());
          const dayInfo = calculateSprintDayInfo(currentMonday.toISOString(), 7);
          const todayIndex = dayInfo.dayIndex;
          const healthBoost = isMicro ? 82 : 90;

          let recordedName = 'Ritual';
          let actionSuccess = false;

          // 1. Try RPC record function first (bypasses RLS via SECURITY DEFINER)
          try {
            const { data: rpcResult, error: rpcErr } = await supabase.rpc('record_telegram_habit_action', {
              p_habit_id: habitId,
              p_day_index: todayIndex,
              p_status: 'completed',
              p_health_boost: healthBoost,
            });

            if (!rpcErr && rpcResult && rpcResult.length > 0) {
              recordedName = rpcResult[0].name || 'Ritual';
              actionSuccess = true;
            }
          } catch (e) {
            console.error('RPC record_telegram_habit_action error:', e);
          }

          // 2. Direct table update fallback
          if (!actionSuccess) {
            const { data: habitData } = await supabase
              .from('habits')
              .select('*')
              .eq('id', habitId)
              .maybeSingle();

            if (habitData) {
              recordedName = habitData.name;
              const weekHistory = Array.isArray(habitData.weekly_history)
                ? [...habitData.weekly_history]
                : ['unlogged', 'unlogged', 'unlogged', 'unlogged', 'unlogged', 'unlogged', 'unlogged'];

              while (weekHistory.length <= todayIndex) {
                weekHistory.push('unlogged');
              }

              weekHistory[todayIndex] = 'completed';
              const calculatedHealth = isMicro ? Math.min(100, (habitData.health_score || 80) + 2) : 90;

              await supabase
                .from('habits')
                .update({
                  weekly_history: weekHistory,
                  current_status: 'completed',
                  health_score: calculatedHealth,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', habitId);

              actionSuccess = true;
            }
          }

          if (actionSuccess) {
            const toastText = isMicro
              ? `⚡ 5m micro-step logged for "${recordedName}"! Identity momentum preserved.`
              : `✅ "${recordedName}" marked as completed!`;

            await answerTelegramCallback(callbackId, toastText);

            if (chatId) {
              await sendTelegramMessage(
                chatId,
                `✨ <b>Ritual Recorded:</b> <i>${recordedName}</i> has been logged as <b>${isMicro ? 'Micro-Step ⚡' : 'Completed ✅'}</b> in your Zenith Habit Planner.`
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

        if (token && supabase) {
          // 1. Try RPC link function first (runs as SECURITY DEFINER in Postgres)
          let linkedUser: { full_name?: string; email?: string } | null = null;

          try {
            const { data: rpcData, error: rpcError } = await supabase.rpc('link_telegram_chat', {
              p_link_token: token,
              p_chat_id: chatId,
              p_username: username || null,
            });

            if (!rpcError && rpcData && rpcData.length > 0) {
              linkedUser = rpcData[0];
            }
          } catch (e) {
            console.error('RPC link_telegram_chat error:', e);
          }

          // 2. Direct table update fallback (works when using service role key)
          if (!linkedUser) {
            const { data: updatedProfiles } = await supabase
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

            if (updatedProfiles && updatedProfiles.length > 0) {
              linkedUser = updatedProfiles[0];
            }
          }

          if (linkedUser) {
            const welcomeText =
              `🌿 <b>Welcome to Zenith, ${linkedUser.full_name || firstName}!</b>\n\n` +
              `Your Telegram account is now successfully connected.\n\n` +
              `Zenith will gently notify you at the end of your working window if any daily rituals remain unlogged.\n\n` +
              `Commands available:\n` +
              `• <b>/status</b> — Check today's habits and completion rate\n` +
              `• <b>/help</b> — Information about mindful circadian notifications`;

            await sendTelegramMessage(chatId, welcomeText, [
              [{ text: '🔗 Open Zenith Dashboard', url: `${getTelegramConfig().appUrl}/habits` }],
            ]);

            return NextResponse.json({ ok: true });
          }
        }

        // Check if already linked
        if (supabase) {
          let existingName: string | null = null;

          try {
            const { data: rpcProfile } = await supabase.rpc('get_telegram_profile', {
              p_chat_id: chatId,
            });
            if (rpcProfile && rpcProfile.length > 0) {
              existingName = rpcProfile[0].full_name;
            }
          } catch {
            // fallback
          }

          if (!existingName) {
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('id, full_name')
              .eq('telegram_chat_id', chatId)
              .maybeSingle();
            if (existingProfile) {
              existingName = existingProfile.full_name;
            }
          }

          if (existingName !== null) {
            const welcomeBack =
              `🌿 <b>Welcome back, ${existingName || firstName}!</b>\n\n` +
              `Your Zenith account is connected and active.\n\n` +
              `• Use <b>/status</b> to check today's rituals\n` +
              `• Use <b>/help</b> for assistant information`;

            await sendTelegramMessage(chatId, welcomeBack, [
              [{ text: '🔗 Open Habit Planner', url: `${getTelegramConfig().appUrl}/habits` }],
            ]);
            return NextResponse.json({ ok: true });
          }
        }

        // Generic welcome if no token provided or invalid
        const defaultWelcome =
          `✨ <b>Hello ${firstName}! I am your Zenith Circadian Habit Assistant.</b>\n\n` +
          `To link your account:\n` +
          `1. Go to <b>Zenith Settings</b> in your browser.\n` +
          `2. Click <b>"Open Telegram Bot"</b> (or paste your Chat ID: <code>${chatId}</code> into Settings).\n\n` +
          `Commands available:\n` +
          `• <b>/status</b> — Check today's rituals and completion progress\n` +
          `• <b>/help</b> — Information about mindful circadian notifications`;

        await sendTelegramMessage(chatId, defaultWelcome);
        return NextResponse.json({ ok: true });
      }

      // Handle /status command
      if (text.startsWith('/status')) {
        if (supabase) {
          const currentMonday = getMondayOfWeek(new Date());
          const dayInfo = calculateSprintDayInfo(currentMonday.toISOString(), 7);
          const todayIndex = dayInfo.dayIndex;

          // 1. Try unified RPC get_telegram_status first (SECURITY DEFINER, bypasses RLS)
          try {
            const { data: statusRpc, error: statusErr } = await supabase.rpc('get_telegram_status', {
              p_chat_id: chatId,
            });

            if (!statusErr && statusRpc && typeof statusRpc === 'object') {
              const habits: HabitItem[] = (statusRpc.habits as HabitItem[]) || [];
              const userName = statusRpc.userName || 'Zenith User';

              const completed = habits.filter((h) => h.weekly_history?.[todayIndex] === 'completed').length;
              const total = habits.length;

              let statusMsg = `📊 <b>Today's Zenith Habit Status for ${userName}:</b>\n\n`;
              statusMsg += `Completed: <b>${completed} / ${total}</b> rituals\n\n`;

              if (habits.length === 0) {
                statusMsg += `<i>No active habits configured yet. Add habits in the Zenith dashboard.</i>\n`;
              } else {
                habits.forEach((h) => {
                  const status = h.weekly_history?.[todayIndex] || 'unlogged';
                  const icon = status === 'completed' ? '✅' : status === 'missed' ? '❌' : '⏳';
                  statusMsg += `${icon} <b>${h.name}</b> (${status})\n`;
                });
              }

              const keyboard: Array<Array<{ text: string; callback_data?: string; url?: string }>> = [];
              const uncompletedHabits = habits.filter((h) => h.weekly_history?.[todayIndex] !== 'completed');

              if (uncompletedHabits.length > 0) {
                statusMsg += `\n<i>Tap below to log any habit right now:</i>\n`;
                uncompletedHabits.forEach((h) => {
                  keyboard.push([
                    {
                      text: `✅ ${h.name.length > 14 ? h.name.slice(0, 12) + '…' : h.name}`,
                      callback_data: `done_${h.id}`,
                    },
                    {
                      text: `⚡ Micro`,
                      callback_data: `micro_${h.id}`,
                    },
                  ]);
                });
              }

              keyboard.push([
                { text: '🔗 Open Habit Planner', url: `${getTelegramConfig().appUrl}/habits` },
              ]);

              await sendTelegramMessage(chatId, statusMsg, keyboard);
              return NextResponse.json({ ok: true });
            }
          } catch (e) {
            console.error('RPC get_telegram_status error:', e);
          }

          // 2. Direct query fallback (if service role key is active or RPC not yet deployed)
          let userProfile: { id: string; full_name?: string } | null = null;

          try {
            const { data: rpcProfile } = await supabase.rpc('get_telegram_profile', {
              p_chat_id: chatId,
            });
            if (rpcProfile && rpcProfile.length > 0) {
              userProfile = rpcProfile[0];
            }
          } catch {
            // fallback
          }

          if (!userProfile) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('id, full_name')
              .eq('telegram_chat_id', chatId)
              .maybeSingle();
            userProfile = profile;
          }

          if (userProfile) {
            const { data: habits } = await supabase
              .from('habits')
              .select('*')
              .eq('user_id', userProfile.id);

            const habitList: HabitItem[] = (habits as HabitItem[]) || [];
            const completed = habitList.filter((h) => h.weekly_history?.[todayIndex] === 'completed').length;
            const total = habitList.length;

            let statusMsg = `📊 <b>Today's Zenith Habit Status:</b>\n\n`;
            statusMsg += `Completed: <b>${completed} / ${total}</b> rituals\n\n`;

            if (habitList.length === 0) {
              statusMsg += `<i>No active habits configured yet. Add habits in the Zenith dashboard.</i>\n`;
            } else {
              habitList.forEach((h) => {
                const status = h.weekly_history?.[todayIndex] || 'unlogged';
                const icon = status === 'completed' ? '✅' : status === 'missed' ? '❌' : '⏳';
                statusMsg += `${icon} <b>${h.name}</b> (${status})\n`;
              });
            }

            const fallbackKeyboard: Array<Array<{ text: string; callback_data?: string; url?: string }>> = [];
            const unloggedFallback = habitList.filter((h) => h.weekly_history?.[todayIndex] !== 'completed');

            if (unloggedFallback.length > 0) {
              statusMsg += `\n<i>Tap below to log any habit right now:</i>\n`;
              unloggedFallback.forEach((h) => {
                fallbackKeyboard.push([
                  {
                    text: `✅ ${h.name.length > 14 ? h.name.slice(0, 12) + '…' : h.name}`,
                    callback_data: `done_${h.id}`,
                  },
                  {
                    text: `⚡ Micro`,
                    callback_data: `micro_${h.id}`,
                  },
                ]);
              });
            }

            fallbackKeyboard.push([
              { text: '🔗 Open Habit Planner', url: `${getTelegramConfig().appUrl}/habits` },
            ]);

            await sendTelegramMessage(chatId, statusMsg, fallbackKeyboard);
            return NextResponse.json({ ok: true });
          }
        }

        await sendTelegramMessage(
          chatId,
          `Account not connected yet.\n\nYour Telegram Chat ID is: <code>${chatId}</code>\nEnter this in Zenith Settings to link your account!`
        );
        return NextResponse.json({ ok: true });
      }

      // Handle /help command
      if (text.startsWith('/help')) {
        const helpText =
          `🌿 <b>Zenith Habit Assistant</b>\n\n` +
          `Zenith helps you build steady daily habits that fit your work schedule.\n\n` +
          `• <b>Daily Summary:</b> Sends a quick check-in at the end of your day if any habits are still unlogged.\n` +
          `• <b>1-Click Logging:</b> Tap <b>Done</b> or <b>Micro-Step</b> directly in Telegram to log your progress.\n` +
          `• <b>Status Check:</b> Type <b>/status</b> anytime to see how you're doing today.`;

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
