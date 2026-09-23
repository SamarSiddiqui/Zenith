import { createClient } from '../supabase/client';
import type { Habit } from '../../types/zenith';

export interface TelegramInlineButton {
  text: string;
  callback_data?: string;
  url?: string;
}

export interface TelegramConfig {
  botToken: string;
  botUsername: string;
  appUrl: string;
}

export function getTelegramConfig(): TelegramConfig {
  return {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    botUsername: process.env.TELEGRAM_BOT_USERNAME || 'ZenithHabitBot',
    appUrl: process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'),
  };
}

/**
 * Send an HTML or Markdown formatted message to a Telegram chat with optional interactive inline buttons.
 */
export async function sendTelegramMessage(
  chatId: string,
  htmlText: string,
  inlineKeyboard?: TelegramInlineButton[][]
): Promise<{ success: boolean; messageId?: number; error?: string }> {
  const { botToken } = getTelegramConfig();

  if (!botToken) {
    console.warn('TELEGRAM_BOT_TOKEN is not configured in environment variables.');
    return { success: false, error: 'Telegram Bot Token not configured' };
  }

  try {
    const payload: Record<string, unknown> = {
      chat_id: chatId,
      text: htmlText,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    };

    if (inlineKeyboard && inlineKeyboard.length > 0) {
      payload.reply_markup = {
        inline_keyboard: inlineKeyboard,
      };
    }

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok || !result.ok) {
      console.error('Telegram API error:', result);
      return { success: false, error: result.description || 'Failed to send Telegram message' };
    }

    return { success: true, messageId: result.result?.message_id };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Network failure contacting Telegram';
    console.error('Telegram message dispatch failed:', errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * Answer a callback query from an inline button tap.
 */
export async function answerTelegramCallback(
  callbackQueryId: string,
  text?: string
): Promise<boolean> {
  const { botToken } = getTelegramConfig();
  if (!botToken) return false;

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: text || 'Ritual updated in Zenith ✨',
        show_alert: false,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Format a mindful, zero-guilt End-of-Day (EOD) reminder with actionable micro-fallbacks.
 */
export function formatEodReminder(
  userName: string,
  unloggedHabits: Habit[],
  dayName: string = 'today'
): { message: string; keyboard: TelegramInlineButton[][] } {
  const { appUrl } = getTelegramConfig();
  const firstName = userName ? userName.split(' ')[0] : 'there';

  let message = `🌿 <b>Zenith Circadian EOD Digest</b>\n\n`;
  message += `Hey <b>${firstName}</b>, your usable working window has closed for <b>${dayName}</b>.\n\n`;
  message += `Here are your uncompleted rituals for today:\n\n`;

  const keyboard: TelegramInlineButton[][] = [];

  unloggedHabits.forEach((habit) => {
    const micro = habit.microVersion || '5 min micro-step';
    message += `• <b>${habit.name}</b> (${habit.minutes}m)\n`;
    message += `  ↳ ⚡ <i>${micro}</i>\n\n`;

    // Add inline action buttons for each habit (max 2 per row)
    keyboard.push([
      {
        text: `✅ ${habit.name.length > 14 ? habit.name.slice(0, 12) + '…' : habit.name}`,
        callback_data: `done_${habit.id}`,
      },
      {
        text: `⚡ Micro-Step`,
        callback_data: `micro_${habit.id}`,
      },
    ]);
  });

  message += `<i>A 5-minute micro-step preserves 100% of identity momentum without fatigue.</i>`;

  // Append web link button
  keyboard.push([
    {
      text: `🔗 Open Zenith Habit Planner`,
      url: `${appUrl}/habits`,
    },
  ]);

  return { message, keyboard };
}

/**
 * Format a test notification to verify Telegram Bot connectivity.
 */
export function formatTestNotification(userName: string): { message: string; keyboard: TelegramInlineButton[][] } {
  const { appUrl } = getTelegramConfig();
  const firstName = userName ? userName.split(' ')[0] : 'there';

  const message = `✨ <b>Zenith Telegram Integration Connected!</b>\n\n` +
    `Hello <b>${firstName}</b>, your Telegram account is successfully connected to Zenith.\n\n` +
    `You will receive gentle, zero-guilt check-ins at the end of your circadian working window if any daily rituals remain unlogged.\n\n` +
    `<i>Ready to maintain steady momentum with effortless micro-fallbacks!</i>`;

  const keyboard: TelegramInlineButton[][] = [
    [
      {
        text: `⚡ Test Micro-Fallback Action`,
        callback_data: `test_ping`,
      },
      {
        text: `🔗 Open Planner`,
        url: `${appUrl}/habits`,
      },
    ],
  ];

  return { message, keyboard };
}

/**
 * Generate a single-use Telegram link token for the authenticated user.
 */
export async function generateTelegramLinkToken(userId: string): Promise<string | null> {
  const supabase = createClient();
  if (!supabase || !userId) return null;

  const token = `zn_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`;

  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        telegram_link_token: token,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('Failed to store Telegram link token:', error);
      return null;
    }

    return token;
  } catch (err) {
    console.error('Error generating link token:', err);
    return null;
  }
}
