/**
 * Password policy enforcement.
 * Requirements: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char.
 */

export interface PasswordPolicyResult {
  valid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordPolicyResult {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Mínimo 8 caracteres");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Pelo menos 1 letra maiúscula");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Pelo menos 1 letra minúscula");
  }
  if (!/\d/.test(password)) {
    errors.push("Pelo menos 1 número");
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push("Pelo menos 1 caractere especial (!@#$%...)");
  }

  return { valid: errors.length === 0, errors };
}
