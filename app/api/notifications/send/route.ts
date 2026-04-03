import { NextRequest, NextResponse } from 'next/server';
import { sendPushToUser } from '@/lib/firebase-admin';

/**
 * POST /api/notifications/send
 * Internal endpoint — secured with INTERNAL_API_KEY header.
 * Used by other API routes (e.g. link-click handler) to trigger push notifications.
 *
 * Body:
 * {
 *   userId: string          — recipient user ID
 *   title: string           — notification title
 *   body: string            — notification body text
 *   data?: Record<string, string>   — extra data payload (e.g. { shortCode, clickCount })
 *   imageUrl?: string       — optional banner image
 * }
 */
export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-internal-key');
  if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: {
    userId: string;
    title: string;
    body: string;
    data?: Record<string, string>;
    imageUrl?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.userId || !body.title || !body.body) {
    return NextResponse.json({ error: 'Missing required fields: userId, title, body' }, { status: 400 });
  }

  try {
    const result = await sendPushToUser({
      userId: body.userId,
      title: body.title,
      body: body.body,
      data: body.data,
      imageUrl: body.imageUrl,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[push/send] Firebase error:', err?.message);
    return NextResponse.json({ error: 'Failed to send notification', detail: err?.message }, { status: 500 });
  }
}
