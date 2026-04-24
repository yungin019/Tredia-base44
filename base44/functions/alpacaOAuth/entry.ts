import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

/**
 * Handles Alpaca OAuth token exchange securely on the backend.
 * POST body: { action: "exchange_token", code: string }
 * POST body: { action: "get_account", alpaca_token: string }
 * POST body: { action: "get_positions", alpaca_token: string }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action } = body;

    const clientId = Deno.env.get('ALPACA_CLIENT_ID');
    const clientSecret = Deno.env.get('ALPACA_CLIENT_SECRET');
    const redirectUri = Deno.env.get('ALPACA_REDIRECT_URI') || 'https://tredio.app/alpaca-callback';

    // ── Get Auth URL (build OAuth redirect URL server-side) ────────
    if (action === 'get_auth_url') {
      if (!clientId) {
        return Response.json({ error: 'ALPACA_CLIENT_ID not configured' }, { status: 503 });
      }
      const state = Math.random().toString(36).slice(2, 14);
      const scope = encodeURIComponent('account:write trading');
      const encodedRedirect = encodeURIComponent(redirectUri);
      const auth_url = `https://app.alpaca.markets/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodedRedirect}&scope=${scope}&state=${state}`;
      return Response.json({ auth_url });
    }

    // ── Token Exchange ─────────────────────────────────────────────
    if (action === 'exchange_token') {
      const { code } = body;
      if (!code) return Response.json({ error: 'No code provided' }, { status: 400 });

      if (!clientId || !clientSecret) {
        return Response.json({
          error: 'ALPACA_CLIENT_ID or ALPACA_CLIENT_SECRET not configured. This feature is blocked until OAuth app credentials are set.',
          blocked: true,
        }, { status: 503 });
      }

      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      });

      const tokenRes = await fetch('https://api.alpaca.markets/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      const tokenData = await tokenRes.json();
      if (!tokenRes.ok) {
        return Response.json({ error: tokenData.error_description || 'Token exchange failed', details: tokenData }, { status: 400 });
      }

      return Response.json({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        scope: tokenData.scope,
      });
    }

    // ── Get Account (using user OAuth token) ──────────────────────
    if (action === 'get_account') {
      const { alpaca_token } = body;
      if (!alpaca_token) return Response.json({ error: 'No token' }, { status: 400 });

      const res = await fetch('https://api.alpaca.markets/v2/account', {
        headers: { Authorization: `Bearer ${alpaca_token}` },
      });
      const data = await res.json();
      if (!res.ok) return Response.json({ error: data.message || 'Failed to fetch account' }, { status: res.status });
      return Response.json(data);
    }

    // ── Get Positions (using user OAuth token) ────────────────────
    if (action === 'get_positions') {
      const { alpaca_token } = body;
      if (!alpaca_token) return Response.json({ error: 'No token' }, { status: 400 });

      const res = await fetch('https://api.alpaca.markets/v2/positions', {
        headers: { Authorization: `Bearer ${alpaca_token}` },
      });
      const data = await res.json();
      if (!res.ok) return Response.json({ error: data.message || 'Failed to fetch positions' }, { status: res.status });
      return Response.json(Array.isArray(data) ? data : []);
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});