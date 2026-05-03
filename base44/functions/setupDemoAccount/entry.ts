import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * setupDemoAccount
 *
 * Sets up trediodemo@outlook.com with full access for App Review:
 *   onboarding_completed = true
 *   subscription_tier    = elite
 *   trading_mode         = practice
 *
 * Can be called by an admin OR by the demo account itself (self-setup on first login).
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    const DEMO_EMAIL = 'trediodemo@outlook.com';

    // Allow admin OR the demo user itself
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin' && user.email !== DEMO_EMAIL) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Find the demo user record
    const users = await base44.asServiceRole.entities.User.filter({ email: DEMO_EMAIL });
    if (!users || users.length === 0) {
      return Response.json({
        error: 'Demo account not found. Must log in at least once first.',
      }, { status: 404 });
    }

    const demoUser = users[0];
    await base44.asServiceRole.entities.User.update(demoUser.id, {
      onboarding_completed: true,
      subscription_tier: 'elite',
      trading_mode: 'practice',
      broker_status: 'not_connected',
      referral_code: demoUser.referral_code || 'REF-DEMO2026',
    });

    return Response.json({
      success: true,
      message: 'Demo account configured: onboarding_completed=true, tier=elite',
      email: demoUser.email,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});