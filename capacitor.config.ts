import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mwakai.app',
  appName: 'touch-grass',
  webDir: 'dist',
  server: {
    cleartext: true, // Allow HTTP traffic
    allowNavigation: [
      'https://fd112b3ec1da.ngrok-free.app'
    ]
  }
};

export default config;
