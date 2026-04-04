package com.mayobebros.smartlinkpilot;

import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.webkit.JavascriptInterface;

import com.getcapacitor.BridgeActivity;

/**
 * MainActivity — SmartLink Pilot
 *
 * Extends BridgeActivity (Capacitor) and adds:
 *  1. Optional overlay permission (SYSTEM_ALERT_WINDOW) — user controls this
 *     via the in-app Settings panel toggle; never forced on startup.
 *  2. Starts ClipboardMonitorService only when the user has opted in AND
 *     the system permission is granted.
 *  3. AndroidBridge JS interface — lets React call into native for overlay
 *     enable/disable and permission checks.
 *  4. Handles incoming "shorten_url" extras from the floating bubble
 *     → injects the URL into the WebView so the web app can pre-fill it.
 */
public class MainActivity extends BridgeActivity {

    private static final int    REQUEST_OVERLAY   = 1001;
    private static final String PREFS_NAME        = "smartlink_prefs";
    private static final String KEY_OVERLAY       = "overlay_enabled";

    // ── Lifecycle ──────────────────────────────────────────────────────────────

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Register native bridge so React can call overlay helpers
        getBridge().getWebView().addJavascriptInterface(new AndroidBridge(), "AndroidBridge");

        // Do NOT auto-request overlay permission — user opts in via Settings panel
        // If they already enabled it in a previous session, restart the service
        if (isOverlayUserEnabled() && Settings.canDrawOverlays(this)) {
            startClipboardService();
        }

        handleShortenIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleShortenIntent(intent);
    }

    @Override
    public void onResume() {
        super.onResume();
        // User may have just returned from Android's overlay permission screen.
        // Only start the service if they had opted in AND permission is now granted.
        if (isOverlayUserEnabled() && Settings.canDrawOverlays(this)) {
            startClipboardService();
        }
    }

    // ── Overlay permission result (returns from ACTION_MANAGE_OVERLAY_PERMISSION) ─

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQUEST_OVERLAY) {
            boolean granted = Settings.canDrawOverlays(this);
            if (granted) {
                startClipboardService();
            } else {
                // User did not grant — clear the saved preference so the
                // toggle reflects the real state when they return to the app
                setOverlayUserEnabled(false);
            }
            // Notify the React layer so the toggle updates immediately
            notifyOverlayStatus(granted);
        }
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private boolean isOverlayUserEnabled() {
        return getSharedPreferences(PREFS_NAME, MODE_PRIVATE)
                .getBoolean(KEY_OVERLAY, false);
    }

    private void setOverlayUserEnabled(boolean value) {
        getSharedPreferences(PREFS_NAME, MODE_PRIVATE)
                .edit()
                .putBoolean(KEY_OVERLAY, value)
                .apply();
    }

    private void startClipboardService() {
        Intent serviceIntent = new Intent(this, ClipboardMonitorService.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent);
        } else {
            startService(serviceIntent);
        }
    }

    /** Fire a CustomEvent in the WebView so React can update the toggle state. */
    private void notifyOverlayStatus(boolean enabled) {
        String js = "window.dispatchEvent(" +
                "new CustomEvent('overlay-permission-changed', " +
                "{detail:{enabled:" + enabled + "}}));";
        getBridge().getWebView().post(() ->
                getBridge().getWebView().evaluateJavascript(js, null));
    }

    // ── Handle URL from floating bubble's "Shorten Now" button ────────────────

    private void handleShortenIntent(Intent intent) {
        if (intent == null) return;
        String url = intent.getStringExtra("shorten_url");
        if (url == null || url.isEmpty()) return;

        final String js = "window.dispatchEvent(" +
                "new CustomEvent('capacitor:url-detected', {detail: {url: '" +
                url.replace("'", "\\'") +
                "'}}) );";

        getBridge().getWebView().post(() ->
                getBridge().getWebView().evaluateJavascript(js, null));
    }

    // ══════════════════════════════════════════════════════════════════════════
    // AndroidBridge — JavaScript interface callable from React via
    //   window.AndroidBridge.methodName()
    // ══════════════════════════════════════════════════════════════════════════

    public class AndroidBridge {

        /**
         * Returns "true" if overlay permission is granted AND the user has
         * enabled the feature; "false" otherwise.
         * Call from JS: window.AndroidBridge.checkOverlayEnabled()
         */
        @JavascriptInterface
        public String checkOverlayEnabled() {
            boolean granted     = Settings.canDrawOverlays(MainActivity.this);
            boolean userEnabled = isOverlayUserEnabled();
            return (granted && userEnabled) ? "true" : "false";
        }

        /**
         * Returns "true" if the system overlay permission is granted,
         * regardless of the user's in-app preference.
         * Call from JS: window.AndroidBridge.canDrawOverlays()
         */
        @JavascriptInterface
        public String canDrawOverlays() {
            return Settings.canDrawOverlays(MainActivity.this) ? "true" : "false";
        }

        /**
         * User toggled the feature ON.
         * • If permission already granted → start the service immediately.
         * • If not granted → open Android's "Display over other apps" settings.
         *   onActivityResult will notify JS when the user returns.
         * Call from JS: window.AndroidBridge.enableOverlay()
         */
        @JavascriptInterface
        public void enableOverlay() {
            setOverlayUserEnabled(true);
            runOnUiThread(() -> {
                if (Settings.canDrawOverlays(MainActivity.this)) {
                    startClipboardService();
                    notifyOverlayStatus(true);
                } else {
                    // Take user to system settings to grant permission
                    Intent intent = new Intent(
                            Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                            Uri.parse("package:" + getPackageName()));
                    startActivityForResult(intent, REQUEST_OVERLAY);
                }
            });
        }

        /**
         * User toggled the feature OFF.
         * Stops the service; does NOT revoke the OS-level permission
         * (Android doesn't allow that programmatically).
         * Call from JS: window.AndroidBridge.disableOverlay()
         */
        @JavascriptInterface
        public void disableOverlay() {
            setOverlayUserEnabled(false);
            runOnUiThread(() -> {
                stopService(new Intent(MainActivity.this, ClipboardMonitorService.class));
                notifyOverlayStatus(false);
            });
        }
    }
}
