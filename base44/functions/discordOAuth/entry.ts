import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { code } = await req.json();
    if (!code) return Response.json({ error: 'No code provided' }, { status: 400 });

    const clientId = Deno.env.get('DISCORD_CLIENT_ID');
    const clientSecret = Deno.env.get('DISCORD_CLIENT_SECRET');
    const redirectUri = 'https://tredia-trade-flow.base44.app/auth/discord/callback';

    // Exchange code for token
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return Response.json({ error: 'Token exchange failed', details: tokenData }, { status: 400 });
    }

    // Fetch Discord user info
    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const discordUser = await userRes.json();

    // Save to UserStat entity
    const existing = await base44.asServiceRole.entities.UserStat.filter({ user_id: user.email || user.id });
    const statsData = {
      user_id: user.email || user.id,
      username: user.full_name || user.email,
      discord_id: discordUser.id,
      discord_username: discordUser.username,
      discord_avatar: discordUser.avatar
        ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
        : null,
      discord_connected: true,
    };

    if (existing.length > 0) {
      await base44.asServiceRole.entities.UserStat.update(existing[0].id, statsData);
    } else {
      await base44.asServiceRole.entities.UserStat.create(statsData);
    }

    return Response.json({
      success: true,
      discord_username: discordUser.username,
      discord_avatar: statsData.discord_avatar,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});