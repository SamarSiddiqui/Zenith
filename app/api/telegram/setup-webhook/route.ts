import { NextResponse } from 'next/server';
import { getTelegramConfig } from '../../../../lib/services/telegram';

export async function POST(request: Request) {
  try {
    const { botToken, appUrl } = getTelegramConfig();

    if (!botToken) {
      return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN is not configured.' }, { status: 400 });
    }

    // Allow overriding domain if passed in body or headers
    let targetUrl = `${appUrl}/api/telegram/webhook`;
    try {
      const body = await request.json();
      if (body.customAppUrl) {
        targetUrl = `${body.customAppUrl.replace(/\/$/, '')}/api/telegram/webhook`;
      }
    } catch {
      // Body optional
    }

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/setWebhook?url=${encodeURIComponent(targetUrl)}`
    );
    const data = await response.json();

    if (!response.ok || !data.ok) {
      return NextResponse.json({ error: data.description || 'Failed to set Telegram webhook' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      webhookUrl: targetUrl,
      telegramResponse: data,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  const { botToken } = getTelegramConfig();
  if (!botToken) {
    return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN is not configured' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch webhook info';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
