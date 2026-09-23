import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/client';
import { generateTelegramLinkToken, getTelegramConfig } from '../../../../lib/services/telegram';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const token = await generateTelegramLinkToken(userId);

    if (!token) {
      return NextResponse.json({ error: 'Failed to generate link token' }, { status: 500 });
    }

    const { botUsername } = getTelegramConfig();
    const deepLink = `https://t.me/${botUsername}?start=${token}`;

    return NextResponse.json({
      success: true,
      token,
      botUsername,
      deepLink,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
