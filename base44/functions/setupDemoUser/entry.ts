/**
 * setupDemoUser — creates/updates the demo account in Base44
 * POST with no body, admin only.
 * Firebase user creation must be done manually in Firebase Console.
 * This function sets the Base44 profile for trediodemo@outlook.com.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const DEMO_EMAIL = 'trediodemo@outlook.com';

    // Find existing user
    const users = await base44.asServiceRole.entities.User.filter({ email: DEMO_EMAIL });
    const existing = users?.[0];

    const profileData = {
      email: DEMO_EMAIL,
      full_name: 'Tredio Demo',
      onboarding_completed: true,
      subscription_tier: 'elite',
      broker_status: 'not_connected',
      trading_mode: 'practice',
    };

    if (existing?.id) {
      await base44.asServiceRole.entities.User.update(existing.id, profileData);
      return Response.json({ success: true, action: 'updated', id: existing.id });
    } else {
      return Response.json({
        success: false,
        message: 'Demo user not found in Base44 yet. Sign in with trediodemo@outlook.com first (via email), then call this endpoint again to elevate the profile.',
      });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});