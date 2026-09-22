import { NextResponse } from 'next/server';
import { sendTelegramMessage, formatTestNotification } from '../../../../lib/services/telegram';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { chatId, userName } = body;

    if (!chatId) {
      return NextResponse.json({ error: 'Telegram Chat ID is required' }, { status: 400 });
    }

    const { message, keyboard } = formatTestNotification(userName || 'Zenith User');
    const result = await sendTelegramMessage(chatId, message, keyboard);

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to send test message' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      message: 'Test notification delivered successfully to Telegram!',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
