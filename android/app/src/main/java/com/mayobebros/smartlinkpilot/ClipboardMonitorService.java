package com.mayobebros.smartlinkpilot;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.graphics.PixelFormat;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.core.app.NotificationCompat;

import java.util.regex.Pattern;

/**
 * ClipboardMonitorService
 * ========================
 * A foreground service that:
 *  1. Keeps a tiny invisible overlay to enable clipboard reading on Android 10+
 *  2. Listens for clipboard changes via OnPrimaryClipChangedListener
 *  3. When a URL is detected, shows a beautiful floating bubble over all apps
 *  4. Bubble lets user shorten the URL with one tap — opens SmartLink Pilot
 */
public class ClipboardMonitorService extends Service {

    private static final String CHANNEL_ID   = "clipboard_monitor";
    private static final int    NOTIF_ID     = 7001;
    private static final int    AUTO_DISMISS = 25_000; // ms

    private static final Pattern URL_PATTERN = Pattern.compile(
        "https?://(www\\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}" +
        "\\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)",
        Pattern.CASE_INSENSITIVE
    );

    private WindowManager        windowManager;
    private ClipboardManager     clipboardManager;
    private View                 bubbleView;
    private View                 invisibleAnchor;    // 1×1 overlay to enable clipboard reads
    private String               lastUrl      = "";
    private boolean              bubbleShown  = false;

    private final Handler        handler      = new Handler(Looper.getMainLooper());
    private Runnable             autoDismiss;

    // ── Clipboard change listener ──────────────────────────────────────────────
    private final ClipboardManager.OnPrimaryClipChangedListener clipListener = () -> {
        handler.post(this::checkClipboard);
    };

    // ─────────────────────────────────────────────────────────────────────────
    @Override
    public void onCreate() {
        super.onCreate();
        windowManager    = (WindowManager) getSystemService(WINDOW_SERVICE);
        clipboardManager = (ClipboardManager) getSystemService(CLIPBOARD_SERVICE);

        createNotificationChannel();
        startForeground(NOTIF_ID, buildForegroundNotification());
        addInvisibleAnchor();
        clipboardManager.addPrimaryClipChangedListener(clipListener);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        return START_STICKY; // restart if killed
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (clipboardManager != null)
            clipboardManager.removePrimaryClipChangedListener(clipListener);
        removeInvisibleAnchor();
        removeBubble();
    }

    // ── Clipboard check ────────────────────────────────────────────────────────
    private void checkClipboard() {
        try {
            ClipData clip = clipboardManager.getPrimaryClip();
            if (clip == null || clip.getItemCount() == 0) return;

            String text = clip.getItemAt(0).coerceToText(this).toString().trim();
            if (text.isEmpty() || text.equals(lastUrl)) return;
            if (!URL_PATTERN.matcher(text).matches()) return;

            lastUrl = text;
            showBubble(text);
        } catch (Exception ignored) {}
    }

    // ── Invisible 1×1 overlay (allows clipboard reading on Android 10+) ────────
    private void addInvisibleAnchor() {
        if (!android.provider.Settings.canDrawOverlays(this)) return;

        invisibleAnchor = new View(this);
        WindowManager.LayoutParams params = new WindowManager.LayoutParams(
            1, 1,
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                : WindowManager.LayoutParams.TYPE_PHONE,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
                | WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL
                | WindowManager.LayoutParams.FLAG_WATCH_OUTSIDE_TOUCH,
            PixelFormat.TRANSPARENT
        );
        params.gravity = Gravity.TOP | Gravity.START;
        try {
            windowManager.addView(invisibleAnchor, params);
        } catch (Exception ignored) {}
    }

    private void removeInvisibleAnchor() {
        if (invisibleAnchor != null) {
            try { windowManager.removeView(invisibleAnchor); } catch (Exception ignored) {}
            invisibleAnchor = null;
        }
    }

    // ── Floating bubble ────────────────────────────────────────────────────────
    private void showBubble(final String url) {
        if (!android.provider.Settings.canDrawOverlays(this)) return;
        removeBubble(); // clear any previous bubble

        LayoutInflater inflater = LayoutInflater.from(this);
        bubbleView = inflater.inflate(R.layout.floating_overlay, null);

        // Populate URL text
        TextView tvUrl = bubbleView.findViewById(R.id.tvUrl);
        tvUrl.setText(url);

        // Draggable window params — appears at top-centre
        final WindowManager.LayoutParams params = new WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                : WindowManager.LayoutParams.TYPE_PHONE,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT
        );
        params.gravity = Gravity.TOP | Gravity.CENTER_HORIZONTAL;
        params.x = 0;
        params.y = 120; // offset from top in px

        // ── Drag to reposition ────────────────────────────────────────────────
        bubbleView.setOnTouchListener(new View.OnTouchListener() {
            int initialX, initialY;
            float initialTouchX, initialTouchY;

            @Override
            public boolean onTouch(View v, MotionEvent event) {
                switch (event.getAction()) {
                    case MotionEvent.ACTION_DOWN:
                        initialX      = params.x;
                        initialY      = params.y;
                        initialTouchX = event.getRawX();
                        initialTouchY = event.getRawY();
                        return true;
                    case MotionEvent.ACTION_MOVE:
                        params.x = initialX + (int)(event.getRawX() - initialTouchX);
                        params.y = initialY + (int)(event.getRawY() - initialTouchY);
                        try { windowManager.updateViewLayout(bubbleView, params); } catch (Exception ignored) {}
                        return true;
                }
                return false;
            }
        });

        // ── Shorten button ────────────────────────────────────────────────────
        Button btnShorten = bubbleView.findViewById(R.id.btnShorten);
        btnShorten.setOnClickListener(v -> {
            removeBubble();
            openAppWithUrl(url);
        });

        // ── Dismiss button ────────────────────────────────────────────────────
        Button btnDismiss = bubbleView.findViewById(R.id.btnDismiss);
        btnDismiss.setOnClickListener(v -> removeBubble());

        // ── Close (X) button ─────────────────────────────────────────────────
        TextView btnClose = bubbleView.findViewById(R.id.btnClose);
        btnClose.setOnClickListener(v -> removeBubble());

        // Add to window
        try {
            windowManager.addView(bubbleView, params);
            bubbleShown = true;
        } catch (Exception e) {
            bubbleView = null;
            return;
        }

        // Auto-dismiss after 25 seconds
        autoDismiss = this::removeBubble;
        handler.postDelayed(autoDismiss, AUTO_DISMISS);
    }

    private void removeBubble() {
        if (autoDismiss != null) {
            handler.removeCallbacks(autoDismiss);
            autoDismiss = null;
        }
        if (bubbleView != null) {
            try { windowManager.removeView(bubbleView); } catch (Exception ignored) {}
            bubbleView = null;
            bubbleShown = false;
        }
    }

    // ── Launch SmartLink Pilot with the URL pre-filled ─────────────────────────
    private void openAppWithUrl(String url) {
        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        intent.putExtra("shorten_url", url);
        startActivity(intent);
    }

    // ── Foreground notification ───────────────────────────────────────────────
    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Clipboard Monitor",
                NotificationManager.IMPORTANCE_MIN  // silent, no heads-up
            );
            channel.setDescription("Watches clipboard for URLs to shorten");
            channel.setShowBadge(false);
            channel.setSound(null, null);
            NotificationManager nm = getSystemService(NotificationManager.class);
            nm.createNotificationChannel(channel);
        }
    }

    private Notification buildForegroundNotification() {
        Intent openIntent = new Intent(this, MainActivity.class);
        openIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        PendingIntent pendingOpen = PendingIntent.getActivity(
            this, 0, openIntent,
            PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT
        );

        Intent stopIntent = new Intent(this, ClipboardMonitorService.class);
        stopIntent.setAction("STOP");
        PendingIntent pendingStop = PendingIntent.getService(
            this, 1, stopIntent,
            PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT
        );

        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("SmartLink Pilot")
            .setContentText("Watching for URLs to shorten…")
            .setSmallIcon(R.mipmap.ic_launcher)
            .setPriority(NotificationCompat.PRIORITY_MIN)
            .setOngoing(true)
            .setSilent(true)
            .setContentIntent(pendingOpen)
            .addAction(0, "Stop", pendingStop)
            .build();
    }
}
