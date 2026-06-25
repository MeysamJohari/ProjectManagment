/**
 * Bearer-token auth middleware.
 *
 * - Reads `API_TOKEN` from env.
 * - If `ENFORCE_AUTH !== 'true'`: warns on missing/mismatched token but ALWAYS passes through.
 * - If `ENFORCE_AUTH === 'true'`: rejects (401) on missing/mismatched token.
 */
export function authMiddleware(req, res, next) {
  const expected = process.env.API_TOKEN;
  const enforce = String(process.env.ENFORCE_AUTH || '').toLowerCase() === 'true';

  const header = req.headers['authorization'] || '';
  const presented = header.startsWith('Bearer ') ? header.slice(7).trim() : '';

  if (!expected) {
    console.warn('[auth] API_TOKEN not set — running unauthenticated.');
    return next();
  }

  const ok = presented && presented === expected;

  if (ok) return next();

  if (!enforce) {
    if (!presented) {
      console.warn('[auth] missing token (pass-through — ENFORCE_AUTH=false)');
    } else {
      console.warn('[auth] wrong token (pass-through — ENFORCE_AUTH=false)');
    }
    return next();
  }

  return res.status(401).json({ error: 'Unauthorized', message: 'Missing or invalid token.' });
}
