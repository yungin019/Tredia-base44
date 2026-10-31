import { verifyFirebaseToken } from '../../shared/firebaseAuth.ts';

Deno.serve(async () => {
  const key = Deno.env.get('VITE_FIREBASE_API_KEY') || '';
  const out: Record<string, unknown> = { hasKey: !!key };

  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'qa.onb.31oct@tredio-qa.dev', password: 'Tredio-QA-2026', returnSecureToken: true }),
  });
  const body = await res.json().catch(() => ({}));
  out.signInStatus = res.status;
  out.tokenPresent = !!body?.idToken;
  if (body?.idToken) {
    const parts = body.idToken.split('.');
    try {
      out.claims = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    } catch (_) { out.claimsError = true; }
    const identity = await verifyFirebaseToken(body.idToken);
    out.verified = identity;
  } else {
    out.signInError = body?.error?.message || null;
  }
  return Response.json(out);
});