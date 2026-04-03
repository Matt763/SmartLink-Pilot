'use client';

/**
 * CapacitorBridge — mounts once at the root layout level.
 *
 * Responsibilities:
 *  • Style the native status bar to match the app theme
 *  • Fade-out the splash screen after the web content is ready
 *  • Register local notification channels (Android 8+)
 *  • Register local notification action types (for clipboard shortening)
 *  • Listen for local notification taps → dispatch a CustomEvent so that
 *    ClipboardShortener.tsx can catch it and pre-fill the URL
 *  • Initialise push notifications (via usePushNotifications hook)
 */

import { useEffect } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

function isNative(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!(window as any).Capacitor?.isNativePlatform?.()
  );
}

export default function CapacitorBridge() {
  // Sets up FCM token registration and notification listeners
  usePushNotifications();

  useEffect(() => {
    if (!isNative()) return;

    (async () => {
      try {
        // ── Status Bar ────────────────────────────────────────────────────────
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#0a0a0a' });

        // ── Splash Screen ─────────────────────────────────────────────────────
        const { SplashScreen } = await import('@capacitor/splash-screen');
        // Let the web content fully paint before fading
        await new Promise(r => setTimeout(r, 400));
        await SplashScreen.hide({ fadeOutDuration: 400 });

        // ── Local Notification Channels (Android 8+ requirement) ──────────────
        const { LocalNotifications } = await import('@capacitor/local-notifications');

        await LocalNotifications.createChannel({
          id: 'link_clicks',
          name: 'Link Clicks',
          description: 'Real-time alerts when your shortened links are clicked',
          importance: 4,    // IMPORTANCE_HIGH — shows heads-up notification
          visibility: 1,    // VISIBILITY_PUBLIC
          vibration: true,
          sound: 'default',
          lights: true,
          lightColor: '#4f46e5',
        });

        await LocalNotifications.createChannel({
          id: 'clipboard_detection',
          name: 'Clipboard URL Detection',
          description: 'Alerts when a URL is found on your clipboard',
          importance: 3,    // IMPORTANCE_DEFAULT
          visibility: 1,
          vibration: true,
          sound: 'default',
        });

        // ── Notification Action Types (quick actions on notification) ──────────
        await LocalNotifications.registerActionTypes({
          types: [
            {
              id: 'SHORTEN_URL',
              actions: [
                {
                  id: 'shorten',
                  title: '✂️ Shorten Now',
                  foreground: true,
                },
                {
                  id: 'dismiss',
                  title: 'Dismiss',
                  destructive: true,
                },
              ],
            },
          ],
        });

        // ── Local Notification Taps → web CustomEvent ─────────────────────────
        await LocalNotifications.addListener(
          'localNotificationActionPerformed',
          (action) => {
            const url: string | undefined = action.notification.extra?.url;
            if (url && action.actionId !== 'dismiss') {
              window.dispatchEvent(
                new CustomEvent('capacitor:url-detected', { detail: { url } })
              );
            }
          }
        );

        // ── Haptic feedback helper — expose globally for web code ─────────────
        try {
          const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
          (window as any).__haptic = (style: 'light' | 'medium' | 'heavy' = 'light') =>
            Haptics.impact({
              style:
                style === 'heavy'
                  ? ImpactStyle.Heavy
                  : style === 'medium'
                    ? ImpactStyle.Medium
                    : ImpactStyle.Light,
            });
        } catch {
          (window as any).__haptic = () => {};
        }

      } catch (err) {
        // Non-fatal: plugin not available or permission denied
        console.warn('[CapacitorBridge]', err);
      }
    })();
  }, []);

  return null;
}
