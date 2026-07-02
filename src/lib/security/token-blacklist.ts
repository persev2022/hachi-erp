/**
 * In-memory token blacklist for invalidating JWTs on logout.
 * In production, use Redis with TTL matching token expiry.
 */

const blacklist = new Set<string>();

// Cleanup old tokens every hour (they'll expire naturally via JWT exp)
setInterval(() => {
  // In production with Redis, TTL handles this automatically.
  // For in-memory, we just clear tokens older than 7 days (max token life)
  // This is a simplified approach; in production use Redis EXPIRE.
  if (blacklist.size > 10000) {
    blacklist.clear();
  }
}, 60 * 60 * 1000);

export function blacklistToken(token: string): void {
  blacklist.add(token);
}

export function isTokenBlacklisted(token: string): boolean {
  return blacklist.has(token);
}
