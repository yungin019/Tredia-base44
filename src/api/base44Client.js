import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { Capacitor } from '@capacitor/core';

const { appId, token, functionsVersion } = appParams;

// On native (capacitor://localhost), relative API calls resolve to the local bundle (HTML).
// We must always point to the Base44 cloud API.
const BASE44_SERVER_URL = 'https://app.base44.com';

export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: BASE44_SERVER_URL,
  requiresAuth: false,
  appBaseUrl: 'https://tredio.app',
});
