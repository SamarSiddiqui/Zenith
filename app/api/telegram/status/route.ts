import { NextResponse } from 'next/server';
import { createAdminClient } from '../../../../lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const chatId = url.searchParams.get('chatId');

    if (!userId && !chatId) {
      return NextResponse.json({ error: 'userId or chatId is required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database client unavailable' }, { status: 500 });
    }

    if (userId) {
      // 1. Try RPC lookup
      try {
        const { data: rpcData } = await supabase.rpc('get_telegram_profile', {
          p_chat_id: chatId || '',
        });
        if (rpcData && rpcData.length > 0) {
          return NextResponse.json({
            connected: true,
            chatId: rpcData[0].telegram_chat_id || null,
            fullName: rpcData[0].full_name,
          });
        }
      } catch {
        // fallback
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, telegram_chat_id, telegram_username, telegram_reminders_enabled')
        .eq('id', userId)
        .maybeSingle();

      if (profile && profile.telegram_chat_id) {
        return NextResponse.json({
          connected: true,
          chatId: profile.telegram_chat_id,
          username: profile.telegram_username,
          fullName: profile.full_name,
        });
      }

      return NextResponse.json({
        connected: false,
        chatId: null,
      });
    }

    return NextResponse.json({ connected: false });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error checking status';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
