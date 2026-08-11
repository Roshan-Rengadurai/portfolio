/**
 * IP-based rate limiting for the contact form. Keyed by IP rather than a
 * cookie or client-generated token, since those reset in a private window
 * or on refresh; the IP does not.
 *
 * In-memory, so it's scoped to a single warm function instance (Fluid
 * Compute keeps instances alive across requests, so this holds up for a
 * personal site's traffic). If this ever needs to be airtight across
 * regions/instances, swap the Maps below for Upstash Redis.
 */

const COOLDOWN_MS = 20_000; // minimum gap between two sends from the same IP
const WINDOW_MS = 60 * 60_000; // rolling window for the hard cap
const WINDOW_MAX = 5; // max sends per IP per window

const lastSendAt = new Map<string, number>();
const windowCounts = new Map<string, { count: number; resetAt: number }>();

function cleanup(now: number) {
  lastSendAt.forEach((ts, ip) => {
    if (now - ts > COOLDOWN_MS) lastSendAt.delete(ip);
  });
  windowCounts.forEach((w, ip) => {
    if (now > w.resetAt) windowCounts.delete(ip);
  });
}

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  if (Math.random() < 0.1) cleanup(now);

  const last = lastSendAt.get(ip);
  if (last !== undefined && now - last < COOLDOWN_MS) {
    return { allowed: false, retryAfterSeconds: Math.ceil((COOLDOWN_MS - (now - last)) / 1000) };
  }

  const w = windowCounts.get(ip);
  if (w && now < w.resetAt && w.count >= WINDOW_MAX) {
    return { allowed: false, retryAfterSeconds: Math.ceil((w.resetAt - now) / 1000) };
  }

  return { allowed: true };
}

/** Call only after a message actually sends successfully. */
export function recordSend(ip: string) {
  const now = Date.now();
  lastSendAt.set(ip, now);

  const w = windowCounts.get(ip);
  if (w && now < w.resetAt) {
    w.count += 1;
  } else {
    windowCounts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  }
}
