import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * resetDemoAccount
 * Admin-only: resets trediodemo@outlook.com password and ensures all
 * required fields are set correctly for TestFlight review.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const DEMO_EMAIL = 'trediodemo@outlook.com';
    const DEMO_PASS  = 'trediotest2026';

    // Use Base44 SDK service role to update password
    let resetBody = null;
    let resetStatus = 'not_attempted';
    try {
      // Try the SDK's built-in admin password update
      await base44.asServiceRole.auth.setPassword(DEMO_EMAIL, DEMO_PASS);
      resetBody = { method: 'sdk_setPassword', ok: true };
      resetStatus = 'success';
    } catch (e1) {
      resetBody = { sdkError: e1.message };
      resetStatus = 'sdk_failed';
    }

    // Regardless of password reset API result, ensure user data is correct
    const users = await base44.asServiceRole.entities.User.filter({ email: DEMO_EMAIL });
    if (!users || users.length === 0) {
      return Response.json({ error: 'Demo user not found in DB' }, { status: 404 });
    }

    const demoUser = users[0];
    await base44.asServiceRole.entities.User.update(demoUser.id, {
      onboarding_completed: true,
      subscription_tier: 'elite',
      trading_mode: 'practice',
      broker_status: 'not_connected',
      referral_code: demoUser.referral_code || 'REF-DEMO2026',
      language: 'en',
    });

    return Response.json({
      success: true,
      userId: demoUser.id,
      email: demoUser.email,
      is_verified: demoUser.is_verified,
      passwordResetStatus: resetStatus,
      passwordResetBody: resetBody,
      note: 'User entity fields updated. Password reset attempted via admin API.',
    });
  } catch (error) {
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});