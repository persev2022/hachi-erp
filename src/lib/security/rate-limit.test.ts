import { describe, it, expect } from "vitest";
import { checkRateLimit } from "./rate-limit";

describe("checkRateLimit", () => {
  it("allows requests within limit", () => {
    const key = `test-${Date.now()}-allow`;
    const result = checkRateLimit(key, { windowMs: 60000, max: 5 });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("blocks after exceeding max", () => {
    const key = `test-${Date.now()}-block`;
    const opts = { windowMs: 60000, max: 3 };

    checkRateLimit(key, opts); // 1
    checkRateLimit(key, opts); // 2
    checkRateLimit(key, opts); // 3

    const result = checkRateLimit(key, opts); // 4 — blocked
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("uses separate counters for different keys", () => {
    const key1 = `test-${Date.now()}-a`;
    const key2 = `test-${Date.now()}-b`;
    const opts = { windowMs: 60000, max: 2 };

    checkRateLimit(key1, opts);
    checkRateLimit(key1, opts);
    const blocked = checkRateLimit(key1, opts);
    expect(blocked.allowed).toBe(false);

    const allowed = checkRateLimit(key2, opts);
    expect(allowed.allowed).toBe(true);
  });
});
