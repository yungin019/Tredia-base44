/**
 * subscriptionSync — writes the verified subscription tier to the user's
 * profile. The tier is never sent from here: the server reads the customer's
 * entitlements from RevenueCat with that uid and stores what it finds.
 */
import { invokeFunction } from '@/api/functionsClient';
import { getIdToken } from '@/api/userData';

export async function syncSubscriptionTier() {
  const idToken = await getIdToken();
  if (!idToken) return null;
  const data = await invokeFunction('userData', { action: 'subscription.sync', idToken });
  return data?.tier || null;
}