import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mayobebros.smartlinkpilot',
  appName: 'SmartLink Pilot',
  webDir: 'out',
  bundledWebRuntime: false,
  server: {
    url: 'https://www.smartlinkpilot.com',
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#ffffff',
  },
};

export default config;
