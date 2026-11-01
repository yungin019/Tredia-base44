/**
 * Who may see the admin surfaces in the UI.
 *
 * This only hides things. Every admin endpoint re-checks the same uid against
 * the verified Firebase ID token on the server, so a client that ignores this
 * list still gets a 403.
 */
export const ADMIN_UIDS = ['khjB1e1K4wWaRpRabUndgU8b1T82'];

export function isAdminUser(firebaseUser) {
  return Boolean(firebaseUser?.uid) && ADMIN_UIDS.includes(firebaseUser.uid);
}