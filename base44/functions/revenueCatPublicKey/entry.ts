/**
 * revenueCatPublicKey — hands the app its public RevenueCat iOS SDK key.
 *
 * The key starts with "appl_" and identifies the app to RevenueCat, not the
 * account: it is compiled into every App Store binary and is safe in the open.
 * It lives behind this endpoint because the frontend build never receives app
 * secrets, so the native build otherwise had no key and purchases could not
 * start at all.
 *
 * The server key (REVENUECAT_API_KEY, used for tier verification) is never
 * returned from here.
 */
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve((req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  const key = Deno.env.get('VITE_REVENUECAT_IOS_KEY') || '';
  if (!key.startsWith('appl_')) {
    console.warn('[revenueCatPublicKey] VITE_REVENUECAT_IOS_KEY missing or not an appl_ key');
    return Response.json({ error: 'REVENUECAT_KEY_MISSING' }, { status: 503, headers: CORS });
  }
  return Response.json({ key }, { headers: CORS });
});