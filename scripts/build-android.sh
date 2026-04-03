#!/usr/bin/env bash
# =============================================================================
# SmartLink Pilot — Android Production Build Script
# =============================================================================
# Usage:
#   ./scripts/build-android.sh          # builds debug APK (quick test)
#   ./scripts/build-android.sh release  # builds signed release AAB + APK
#
# Required env vars for release builds (set in your shell or CI/CD secrets):
#   KEYSTORE_PATH           path to the .keystore file  (default: android/app/release.keystore)
#   KEYSTORE_PASSWORD       keystore password
#   KEYSTORE_ALIAS          key alias inside keystore   (default: smartlink)
#   KEYSTORE_ALIAS_PASSWORD alias password
# =============================================================================

set -euo pipefail

MODE="${1:-debug}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_DIR="$ROOT_DIR/android"

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   SmartLink Pilot  ·  Android Build           ║"
echo "║   Mode: $MODE                                  "
echo "╚══════════════════════════════════════════════╝"
echo ""

# ── Step 1: Install dependencies ─────────────────────────────────────────────
echo "▶  Installing npm dependencies..."
cd "$ROOT_DIR"
npm install

# ── Step 2: Sync Capacitor (copies web assets + plugins to android/) ─────────
echo "▶  Syncing Capacitor to Android..."
npx cap sync android

# ── Step 3: Build ─────────────────────────────────────────────────────────────
cd "$ANDROID_DIR"

if [ "$MODE" = "release" ]; then
    # Verify signing secrets are present
    if [ -z "${KEYSTORE_PASSWORD:-}" ]; then
        echo "❌  KEYSTORE_PASSWORD is not set. Export it before running release builds."
        exit 1
    fi

    echo "▶  Building release AAB (for Google Play Store)..."
    ./gradlew bundleRelease

    echo "▶  Building release APK (for direct download)..."
    ./gradlew assembleRelease

    AAB_PATH="$ANDROID_DIR/app/build/outputs/bundle/release/app-release.aab"
    APK_PATH="$ANDROID_DIR/app/build/outputs/apk/release/app-release.apk"

    echo ""
    echo "✅  Release build complete!"
    echo "   AAB  →  $AAB_PATH"
    echo "   APK  →  $APK_PATH"
    echo ""
    echo "Next steps:"
    echo "  1. Upload the AAB to Google Play Console"
    echo "  2. Copy the APK to public/downloads/smartlink-pilot.apk for direct download"
    echo "     cp \"$APK_PATH\" \"$ROOT_DIR/public/downloads/smartlink-pilot.apk\""

else
    echo "▶  Building debug APK..."
    ./gradlew assembleDebug

    APK_PATH="$ANDROID_DIR/app/build/outputs/apk/debug/app-debug.apk"
    echo ""
    echo "✅  Debug build complete!"
    echo "   APK  →  $APK_PATH"
    echo ""
    echo "Install on a connected device:"
    echo "   adb install -r \"$APK_PATH\""
fi

echo ""
