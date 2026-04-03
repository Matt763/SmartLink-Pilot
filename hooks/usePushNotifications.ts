'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

/** Returns true when the JS is running inside the Capacitor native shell */
function isNative(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!(window as any).Capacitor?.isNativePlatform?.()
  );
}

/**
 * Registers the device for FCM push notifications when the user is signed in
 * and the app is running natively (Android / iOS via Capacitor).
 *
 * Silently no-ops in regular browsers.
 */
export function usePushNotifications() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user || !isNative()) return;

    let removeListeners: (() => void) | null = null;

    (async () => {
      try {
        const { PushNotifications } = await import('@capacitor/push-notifications');
        const { LocalNotifications } = await import('@capacitor/local-notifications');

        // Ask the OS for permission
        const perm = await PushNotifications.requestPermissions();
        if (perm.receive !== 'granted') return;

        // Tell FCM to register this device
        await PushNotifications.register();

        // FCM gives us a token → persist it in our DB
        const onRegistration = await PushNotifications.addListener(
          'registration',
          async ({ value: token }) => {
            try {
              await fetch('/api/notifications/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, platform: 'android' }),
              });
            } catch {
              // non-fatal
            }
          }
        );

        // If a push arrives while the app is in the foreground, show a local notification
        const onReceived = await PushNotifications.addListener(
          'pushNotificationReceived',
          async (notification) => {
            const localPerm = await LocalNotifications.requestPermissions();
            if (localPerm.display !== 'granted') return;

            await LocalNotifications.schedule({
              notifications: [
                {
                  id: Date.now() % 2147483647,
                  title: notification.title ?? 'SmartLink Pilot',
                  body: notification.body ?? 'You have a notification',
                  extra: notification.data,
                  channelId: 'link_clicks',
                },
              ],
            });
          }
        );

        // Notification tapped → navigate to analytics for that link
        const onAction = await PushNotifications.addListener(
          'pushNotificationActionPerformed',
          (action) => {
            const { shortCode } = action.notification.data ?? {};
            if (shortCode) {
              window.location.href = `/dashboard/analytics/${shortCode}`;
            }
          }
        );

        removeListeners = async () => {
          await onRegistration.remove();
          await onReceived.remove();
          await onAction.remove();
        };
      } catch (err) {
        // Plugin not available (e.g. running in browser) — silent
      }
    })();

    return () => {
      removeListeners?.();
    };
  }, [session?.user]);
}
