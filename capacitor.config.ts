import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mayobebros.smartlinkpilot',
  appName: 'SmartLink Pilot',
  webDir: 'out',
  bundledWebRuntime: false,
  server: {
    // This points the native app shell to the live hosted SaaS url. 
    // It enables all Next.js Server Components, PostgreSQL DB access, and API routes to function over Native.
    // Replace this with your exact production domain once deployed.
    url: 'https://smartlinkpilot.com', 
    cleartext: true
  },
  android: {
    // Allows the app to be set as a default handler for shared URLs natively
    allowMixedContent: true,
  }
};

export default config;
