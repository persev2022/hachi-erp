import crypto from "crypto";

const TOTP_DIGITS = 6;
const TOTP_PERIOD = 30; // seconds
const TOTP_ALGORITHM = "sha1";

/**
 * Generate a random base32-encoded secret for TOTP
 */
function generateRandomSecret(length = 20): string {
  const buffer = crypto.randomBytes(length);
  return base32Encode(buffer);
}

/**
 * Base32 encoding (RFC 4648)
 */
function base32Encode(buffer: Buffer): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0;
  let value = 0;
  let output = "";

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31];
  }

  return output;
}

/**
 * Base32 decoding (RFC 4648)
 */
function base32Decode(encoded: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const cleanInput = encoded.replace(/=+$/, "").toUpperCase();

  let bits = 0;
  let value = 0;
  let index = 0;
  const output = Buffer.alloc(Math.floor((cleanInput.length * 5) / 8));

  for (let i = 0; i < cleanInput.length; i++) {
    const charIndex = alphabet.indexOf(cleanInput[i]);
    if (charIndex === -1) continue;

    value = (value << 5) | charIndex;
    bits += 5;

    if (bits >= 8) {
      output[index++] = (value >>> (bits - 8)) & 255;
      bits -= 8;
    }
  }

  return output.subarray(0, index);
}

/**
 * Generate HMAC-based One-Time Password (HOTP) per RFC 4226
 */
function generateHOTP(secret: Buffer, counter: bigint): string {
  // Convert counter to 8-byte big-endian buffer
  const counterBuffer = Buffer.alloc(8);
  for (let i = 7; i >= 0; i--) {
    counterBuffer[i] = Number(counter & BigInt(0xff));
    counter = counter >> BigInt(8);
  }

  // Generate HMAC-SHA1
  const hmac = crypto.createHmac(TOTP_ALGORITHM, secret);
  hmac.update(counterBuffer);
  const hash = hmac.digest();

  // Dynamic truncation
  const offset = hash[hash.length - 1] & 0x0f;
  const binary =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);

  const otp = binary % Math.pow(10, TOTP_DIGITS);
  return otp.toString().padStart(TOTP_DIGITS, "0");
}

/**
 * Generate TOTP for current time per RFC 6238
 */
function generateTOTP(secret: Buffer, time?: number): string {
  const now = time || Math.floor(Date.now() / 1000);
  const counter = BigInt(Math.floor(now / TOTP_PERIOD));
  return generateHOTP(secret, counter);
}

/**
 * Generate a new TOTP secret with otpauth URL and QR data URL
 */
export function generateSecret(
  accountName = "HachiERP",
  issuer = "HachiERP"
): { secret: string; otpauthUrl: string; qrDataUrl: string } {
  const secret = generateRandomSecret(20);

  const otpauthUrl =
    `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}` +
    `?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=${TOTP_DIGITS}&period=${TOTP_PERIOD}`;

  // Generate a simple QR code data URL using a text-based representation
  // In production, use a QR code library. For now, return the otpauth URL as data for client-side QR generation
  const qrDataUrl = `data:text/plain;base64,${Buffer.from(otpauthUrl).toString("base64")}`;

  return { secret, otpauthUrl, qrDataUrl };
}

/**
 * Verify a TOTP token against a secret
 * Allows ±1 time step window to account for clock drift
 */
export function verifyTOTP(secret: string, token: string): boolean {
  if (!token || token.length !== TOTP_DIGITS) {
    return false;
  }

  const secretBuffer = base32Decode(secret);
  const now = Math.floor(Date.now() / 1000);

  // Check current time step and ±1 window for clock drift tolerance
  for (let offset = -1; offset <= 1; offset++) {
    const time = now + offset * TOTP_PERIOD;
    const expectedToken = generateTOTP(secretBuffer, time);
    if (timingSafeEqual(token, expectedToken)) {
      return true;
    }
  }

  return false;
}

/**
 * Timing-safe string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return crypto.timingSafeEqual(bufA, bufB);
}
