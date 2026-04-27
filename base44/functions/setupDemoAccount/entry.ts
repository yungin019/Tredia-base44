import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Admin-only function to ensure the demo account has correct profile settings.
// Call this after trediodemo@outlook.com has logged in at least once.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Must be admin
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Find the demo user
    const users = await base44.asServiceRole.entities.User.filter({ email: 'trediodemo@outlook.com' });
    if (!users || users.length === 0) {
      return Response.json({
        error: 'Demo account not found. The user must log in at least once to create the record.',
        hint: 'Register trediodemo@outlook.com via the SignIn page first, then call this endpoint.',
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
      message: 'Demo account updated: onboarding_completed=true, tier=elite',
      userId: demoUser.id,
      email: demoUser.email,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});