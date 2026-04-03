import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/notifications/register
 * Registers (or refreshes) a device FCM token for push notifications.
 * Body: { token: string, platform: "android" | "ios" | "web" }
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let token: string, platform: string;
  try {
    ({ token, platform } = await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!token || typeof token !== 'string' || token.length < 20) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }

  const validPlatforms = ['android', 'ios', 'web'];
  if (!validPlatforms.includes(platform)) {
    return NextResponse.json({ error: 'Invalid platform' }, { status: 400 });
  }

  await prisma.deviceToken.upsert({
    where: { token },
    update: {
      userId: session.user.id,
      platform,
      active: true,
      updatedAt: new Date(),
    },
    create: {
      userId: session.user.id,
      token,
      platform,
      active: true,
    },
  });

  return NextResponse.json({ success: true });
}

/**
 * DELETE /api/notifications/register
 * Deactivates a device token (e.g. on logout).
 * Body: { token: string }
 */
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let token: string;
  try {
    ({ token } = await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  await prisma.deviceToken.updateMany({
    where: { token, userId: session.user.id },
    data: { active: false },
  });

  return NextResponse.json({ success: true });
}
