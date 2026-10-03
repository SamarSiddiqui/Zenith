import { NextRequest, NextResponse } from 'next/server';
import { deleteCached, deleteByPattern } from '../../../../lib/redis/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId = body.userId;

    if (!userId || userId === 'local-user') {
      return NextResponse.json({ success: true, bypassed: true }, { status: 200 });
    }

    const habitsCacheKey = `zenith:habits:${userId}`;
    const diagnosisPattern = `zenith:diag:${userId}:*`;

    // Invalidate habits cache and user's cached diagnoses in parallel
    await Promise.allSettled([
      deleteCached(habitsCacheKey),
      deleteByPattern(diagnosisPattern),
    ]);

    return NextResponse.json(
      { success: true, invalidated: true, keys: [habitsCacheKey, diagnosisPattern] },
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
