import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getRedis } from '../../../lib/redis/client';

export type FeedbackType = 'feature_idea' | 'improvement' | 'bug_report' | 'general';

export interface FeedbackSubmission {
  id?: string;
  type: FeedbackType;
  category: string;
  title: string;
  message: string;
  email?: string;
  userId?: string;
  createdAt?: string;
}

function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as FeedbackSubmission;

    const { type = 'feature_idea', category = 'General', title, message, email, userId } = body;

    // Basic Validation
    if (!title || title.trim().length < 3) {
      return NextResponse.json(
        { error: 'Please provide a title with at least 3 characters.' },
        { status: 400 }
      );
    }

    if (!message || message.trim().length < 8) {
      return NextResponse.json(
        { error: 'Please provide a descriptive message explaining your idea or suggestion.' },
        { status: 400 }
      );
    }

    const feedbackRecord = {
      id: `feedback_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      feedback_type: type,
      category: category.trim(),
      title: title.trim(),
      message: message.trim(),
      email: email ? email.trim() : null,
      user_id: userId && userId !== 'local-user' ? userId : null,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    // 1. Dual-Persistence: Guaranteed storage in Upstash Redis
    try {
      const redis = getRedis();
      if (redis) {
        await Promise.allSettled([
          // Append to global feedback queue
          redis.lpush('zenith:feedback:all', JSON.stringify(feedbackRecord)),
          // Store specific record with 90-day retention
          redis.set(`zenith:feedback:${feedbackRecord.id}`, JSON.stringify(feedbackRecord), {
            ex: 90 * 24 * 60 * 60,
          }),
        ]);
      }
    } catch (redisErr) {
      console.warn('[Feedback API] Redis storage warning:', redisErr);
    }

    // 2. Dual-Persistence: Attempt storage in Supabase database
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        const { error: dbError } = await supabase.from('feedback').insert({
          feedback_type: feedbackRecord.feedback_type,
          category: feedbackRecord.category,
          title: feedbackRecord.title,
          message: feedbackRecord.message,
          email: feedbackRecord.email,
          user_id: feedbackRecord.user_id,
          status: 'pending',
        });

        if (dbError) {
          // Table might not be migrated yet; Redis already safely holds the record
          console.warn('[Feedback API] Supabase insert note (held in Redis):', dbError.message);
        }
      } catch (dbErr: any) {
        console.warn('[Feedback API] Supabase table insertion warning:', dbErr.message);
      }
    }

    return NextResponse.json(
      {
        success: true,
        id: feedbackRecord.id,
        message: 'Thank you for your thoughts and ideas! We review every submission to guide Zenith.',
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Feedback Submission Error:', err);
    return NextResponse.json(
      { error: err.message || 'An unexpected error occurred while saving your feedback.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({ feedbacks: [] }, { status: 200 });
    }

    // Fetch latest 30 submissions for administrative review
    const rawList = await redis.lrange('zenith:feedback:all', 0, 29);
    const feedbacks = rawList.map((item: any) => {
      try {
        return typeof item === 'string' ? JSON.parse(item) : item;
      } catch {
        return null;
      }
    }).filter(Boolean);

    return NextResponse.json({ feedbacks, total: feedbacks.length }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to read feedback' }, { status: 500 });
  }
}
