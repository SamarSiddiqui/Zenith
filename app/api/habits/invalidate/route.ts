import { NextRequest, NextResponse } from 'next/server';
import { deleteCached } from '../../../../lib/redis/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId = body.userId;

    if (!userId || userId === 'local-user') {
      return NextResponse.json({ success: true, bypassed: true }, { status: 200 });
    }

    const habitsCacheKey = `zenith:habits:${userId}`;
    const latestDiagnosisKey = `zenith:diag:latest:${userId}`;

    // Invalidate habits list + latest snapshot pointer in O(1).
    // Content-addressed `zenith:diag:${userId}:${stateHash}` keys stay cached
    // so reverting to a prior habit set hits Redis in ~10ms with 0 AI calls.
    await Promise.allSettled([
      deleteCached(habitsCacheKey),
      deleteCached(latestDiagnosisKey),
    ]);

    return NextResponse.json(
      { success: true, invalidated: true, keys: [habitsCacheKey, latestDiagnosisKey] },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('Habits Invalidation Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to invalidate cache' },
      { status: 500 }
    );
  }
}
