import * as admin from 'firebase-admin';

let app: admin.app.App | null = null;

/**
 * Returns an initialised Firebase Admin app.
 * Call this inside server-only code (API routes, server actions).
 *
 * Required env var:
 *   FIREBASE_SERVICE_ACCOUNT_JSON — the full contents of the service account
 *   JSON file you download from the Firebase console, stringified.
 *   e.g.  FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"...",...}'
 */
export function getFirebaseAdmin(): admin.app.App {
  if (app) return app;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_JSON is not set. ' +
      'Add it to your .env file (server side only).'
    );
  }

  let serviceAccount: admin.ServiceAccount;
  try {
    serviceAccount = JSON.parse(raw);
  } catch {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON.');
  }

  if (admin.apps.length) {
    app = admin.apps[0]!;
  } else {
    app = admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  }

  return app;
}

export interface PushPayload {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

/**
 * Send an FCM push notification to all active device tokens for a user.
 * Returns { sent, failed } counts.
 */
export async function sendPushToUser(payload: PushPayload): Promise<{ sent: number; failed: number }> {
  const { prisma } = await import('@/lib/prisma');

  const tokens = await prisma.deviceToken.findMany({
    where: { userId: payload.userId, active: true },
    select: { id: true, token: true },
  });

  if (!tokens.length) return { sent: 0, failed: 0 };

  const adminApp = getFirebaseAdmin();
  const messaging = adminApp.messaging();

  const results = await Promise.allSettled(
    tokens.map(({ token }) =>
      messaging.send({
        token,
        notification: {
          title: payload.title,
          body: payload.body,
          ...(payload.imageUrl ? { imageUrl: payload.imageUrl } : {}),
        },
        data: payload.data ?? {},
        android: {
          priority: 'high',
          notification: {
            channelId: 'link_clicks',
            color: '#4f46e5',
            sound: 'default',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      })
    )
  );

  // Deactivate tokens that are no longer valid
  const invalidTokenIds: string[] = [];
  results.forEach((result, i) => {
    if (
      result.status === 'rejected' &&
      (result.reason?.errorInfo?.code === 'messaging/registration-token-not-registered' ||
       result.reason?.errorInfo?.code === 'messaging/invalid-registration-token')
    ) {
      invalidTokenIds.push(tokens[i].id);
    }
  });

  if (invalidTokenIds.length) {
    await prisma.deviceToken.updateMany({
      where: { id: { in: invalidTokenIds } },
      data: { active: false },
    });
  }

  return {
    sent: results.filter(r => r.status === 'fulfilled').length,
    failed: results.filter(r => r.status === 'rejected').length,
  };
}
