import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tredia.app',
  appName: 'TREDIA',
  webDir: 'dist',
  server: {
    url: 'https://yungin019-tredia-bas-rx3x.bolt.host',
    cleartext: true
  }
};

export default config;
