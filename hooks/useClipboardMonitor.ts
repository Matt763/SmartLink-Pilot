'use client';

import { useEffect, useCallback, useRef } from 'react';

/** Returns true when running inside Capacitor native shell */
function isNative(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!(window as any).Capacitor?.isNativePlatform?.()
  );
}

const URL_REGEX =
  /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)$/i;

/**
 * On native (Capacitor), monitors the clipboard each time the app comes back
 * to the foreground. If a URL is found, calls `onUrlDetected(url)` AND shows
 * a local notification so the user can shorten it with one tap.
 *
 * On web, this hook is a no-op (the existing ClipboardShortener.tsx handles it).
 */
export function useClipboardMonitor(onUrlDetected: (url: string) => void) {
  const lastSeenUrl = useRef<string | null>(null);

  const checkClipboard = useCallback(async () => {
    if (!isNative()) return;

    try {
      const { Clipboard } = await import('@capacitor/clipboard');
      const { value, type } = await Clipboard.read();

      if (
        type !== 'text/plain' ||
        !value ||
        !URL_REGEX.test(value.trim()) ||
        value === lastSeenUrl.current
      ) {
        return;
      }

      const url = value.trim();
      lastSeenUrl.current = url;

      onUrlDetected(url);

      // Show a local notification so the user can shorten without switching apps
      try {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        const perm = await LocalNotifications.requestPermissions();
        if (perm.display !== 'granted') return;

        const preview = url.length > 60 ? url.slice(0, 57) + '…' : url;

        await LocalNotifications.schedule({
          notifications: [
            {
              id: 9001,
              title: '🔗 URL Detected in Clipboard',
              body: `Tap to shorten: ${preview}`,
              extra: { url },
              channelId: 'clipboard_detection',
              actionTypeId: 'SHORTEN_URL',
              smallIcon: 'ic_stat_icon_config_sample',
            },
          ],
        });
      } catch {
        // LocalNotifications may not be set up yet — silent
      }
    } catch {
      // Clipboard may be empty or permission denied — silent
    }
  }, [onUrlDetected]);

  useEffect(() => {
    if (!isNative()) return;

    let cleanup: (() => void) | null = null;

    (async () => {
      try {
        const { App } = await import('@capacitor/app');

        const listener = await App.addListener('appStateChange', ({ isActive }) => {
          if (isActive) checkClipboard();
        });

        // Also check immediately when the hook first mounts
        checkClipboard();

        cleanup = () => listener.remove();
      } catch {
        // silent
      }
    })();

    return () => {
      cleanup?.();
    };
  }, [checkClipboard]);
}
