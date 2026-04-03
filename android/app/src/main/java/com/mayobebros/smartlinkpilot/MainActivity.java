package com.mayobebros.smartlinkpilot;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;

import com.getcapacitor.BridgeActivity;

/**
 * MainActivity — SmartLink Pilot
 *
 * Extends BridgeActivity (Capacitor) and adds:
 *  1. Overlay permission request (SYSTEM_ALERT_WINDOW)  — needed for the
 *     floating URL bubble that appears over other apps
 *  2. Starts ClipboardMonitorService once permission is granted
 *  3. Handles incoming "shorten_url" extras from the floating bubble
 *     → injects the URL into the WebView so the web app can pre-fill it
 */
public class MainActivity extends BridgeActivity {

    private static final int REQUEST_OVERLAY = 1001;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestOverlayPermissionIfNeeded();
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
        // If the user just came back after granting overlay permission, start the service
        if (Settings.canDrawOverlays(this)) {
            startClipboardService();
        }
    }

    // ── Overlay permission ─────────────────────────────────────────────────────
    private void requestOverlayPermissionIfNeeded() {
        if (Settings.canDrawOverlays(this)) {
            startClipboardService();
        } else {
            // Send user to the system screen to grant "Display over other apps"
            Intent intent = new Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:" + getPackageName())
            );
            startActivityForResult(intent, REQUEST_OVERLAY);
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQUEST_OVERLAY) {
            if (Settings.canDrawOverlays(this)) {
                startClipboardService();
            }
            // If denied — app still works, just without the floating overlay
        }
    }

    // ── Start / restart the clipboard monitor service ──────────────────────────
    private void startClipboardService() {
        Intent serviceIntent = new Intent(this, ClipboardMonitorService.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent);
        } else {
            startService(serviceIntent);
        }
    }

    // ── Handle URL coming in from the floating bubble's "Shorten Now" button ────
    private void handleShortenIntent(Intent intent) {
        if (intent == null) return;
        String url = intent.getStringExtra("shorten_url");
        if (url == null || url.isEmpty()) return;

        // Inject the URL into the WebView via Capacitor's bridge
        // The web app listens for the 'capacitor:shorten-url' CustomEvent
        final String js = "window.dispatchEvent(" +
            "new CustomEvent('capacitor:url-detected', {detail: {url: '" +
            url.replace("'", "\\'") +
            "'}}) );";

        getBridge().getWebView().post(() -> {
            getBridge().getWebView().evaluateJavascript(js, null);
        });
    }
}
