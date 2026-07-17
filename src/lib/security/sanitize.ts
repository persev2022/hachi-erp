/**
 * Sanitize string input to prevent XSS.
 * Strips HTML tags and dangerous characters from user inputs.
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== "string") return input;
  return input
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/[<>]/g, "") // Remove remaining angle brackets
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers like onclick=
    .trim();
}

/**
 * Sanitize all string values in an object (shallow).
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = { ...obj };
  for (const key of Object.keys(sanitized)) {
    if (typeof sanitized[key] === "string") {
      (sanitized as Record<string, unknown>)[key] = sanitizeString(sanitized[key] as string);
    }
  }
  return sanitized;
}
