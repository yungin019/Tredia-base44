import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tredio.app',
  appName: 'Tredio',
  webDir: 'dist',
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['google.com', 'apple.com'],
    },
  },
  experimental: {
    ios: {
      spm: {
        // firebase-auth plugin ships its Swift package inside an npm package,
        // so the CLI symlinks it instead of cloning a repository.
        packageOptions: {
          '@capacitor-firebase/authentication': { symlink: true },
        },
        swiftToolsVersion: '6.1',
        // Only Google Sign-In is linked; Facebook's SDK is not used by the app.
        packageTraits: {
          '@capacitor-firebase/authentication': ['Google'],
        },
      },
    },
  },
};

export default config;