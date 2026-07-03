import { describe, it, expect } from "vitest";
import { blacklistToken, isTokenBlacklisted } from "./token-blacklist";

describe("Token Blacklist", () => {
  it("reports non-blacklisted token as valid", () => {
    expect(isTokenBlacklisted("random-token-abc")).toBe(false);
  });

  it("blacklists a token", () => {
    const token = `test-token-${Date.now()}`;
    blacklistToken(token);
    expect(isTokenBlacklisted(token)).toBe(true);
  });

  it("different tokens are independent", () => {
    const token1 = `token1-${Date.now()}`;
    const token2 = `token2-${Date.now()}`;
    blacklistToken(token1);
    expect(isTokenBlacklisted(token1)).toBe(true);
    expect(isTokenBlacklisted(token2)).toBe(false);
  });
});
