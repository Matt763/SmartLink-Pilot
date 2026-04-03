# =============================================================================
# SmartLink Pilot — ProGuard / R8 Rules
# =============================================================================

# ── Debugging ────────────────────────────────────────────────────────────────
# Keep line numbers so crash stack traces are readable in Play Console
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# ── Capacitor ────────────────────────────────────────────────────────────────
-keep class com.getcapacitor.** { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin class * { *; }
-keepclassmembers class * extends com.getcapacitor.Plugin {
    @com.getcapacitor.annotation.PluginMethod public *;
}

# ── Firebase / FCM ───────────────────────────────────────────────────────────
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# ── AndroidX ─────────────────────────────────────────────────────────────────
-keep class androidx.** { *; }
-dontwarn androidx.**

# ── WebView JavaScript Interface ─────────────────────────────────────────────
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# ── Serialisation (Gson / JSON) ───────────────────────────────────────────────
-keepclassmembers class * implements java.io.Serializable { *; }
-keep class com.mayobebros.smartlinkpilot.** { *; }

# ── Misc ─────────────────────────────────────────────────────────────────────
-dontwarn okhttp3.**
-dontwarn okio.**
