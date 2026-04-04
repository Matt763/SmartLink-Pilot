import { CapacitorConfig } from '@capacitor/cli';
import 'dotenv/config';

const config: CapacitorConfig = {
  appId: 'com.mayobebros.smartlinkpilot',
  appName: 'SmartLink Pilot',
  webDir: 'out',
  server: {
    url: 'https://www.smartlinkpilot.com',
    cleartext: false,
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#0a0a0a',
    minWebViewVersion: 80,
    loggingBehavior: 'none',
    initialFocus: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2200,
      launchAutoHide: true,
      launchFadeOutDuration: 400,
      backgroundColor: '#0a0a0a',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#4f46e5',
      sound: 'beep.wav',
    },
    StatusBar: {
      style: 'Dark',
      backgroundColor: '#0a0a0a',
      overlaysWebView: false,
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
    App: {},
    // Native Google Sign-In — uses the Android Google Sign-In SDK,
    // no browser or Custom Tab required.  serverClientId must be the
    // Web OAuth 2.0 client ID so the server can verify the returned idToken.
    GoogleAuth: {
      scopes: ['profile', 'email'],
      // Using the primary Web Client ID from google-services.json
      serverClientId: '497304910795-t0303p4hi560nfjiomuvelao2qv1abrp.apps.googleusercontent.com',
      forceCodeForRefreshToken: false,
    },
  },
};

export default config;
