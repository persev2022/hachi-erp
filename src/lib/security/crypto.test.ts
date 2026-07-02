import { describe, it, expect, beforeAll } from "vitest";

// Set test encryption key before import
beforeAll(() => {
  process.env.ENCRYPTION_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
});

import { encrypt, decrypt, generateKey } from "./crypto";

describe("AES-256-GCM crypto", () => {
  it("encrypts and decrypts correctly", () => {
    const plaintext = "Paciente apresenta quadro depressivo moderado. CID-10: F32.1";
    const encrypted = encrypt(plaintext);
    expect(encrypted).not.toBe(plaintext);
    expect(encrypted.length).toBeGreaterThan(0);

    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it("produces different ciphertext for same plaintext (random IV)", () => {
    const text = "Diagnóstico confidencial";
    const enc1 = encrypt(text);
    const enc2 = encrypt(text);
    expect(enc1).not.toBe(enc2); // Different IVs
    expect(decrypt(enc1)).toBe(text);
    expect(decrypt(enc2)).toBe(text);
  });

  it("handles empty string", () => {
    const encrypted = encrypt("");
    expect(decrypt(encrypted)).toBe("");
  });

  it("handles unicode/accents", () => {
    const text = "Evolução: paciente com melhora significativa. Prescrição mantida.";
    expect(decrypt(encrypt(text))).toBe(text);
  });

  it("generates valid 64-char hex key", () => {
    const key = generateKey();
    expect(key).toHaveLength(64);
    expect(/^[0-9a-f]+$/.test(key)).toBe(true);
  });

  it("fails to decrypt tampered data", () => {
    const encrypted = encrypt("Secret data");
    const tampered = encrypted.slice(0, -2) + "XX";
    expect(() => decrypt(tampered)).toThrow();
  });
});
