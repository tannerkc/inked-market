/**
 * Input sanitization, formatting, and validation for auth + signup flows.
 *
 * Validators return a user-facing error message, or null when valid.
 * Sanitizers/formatters return the cleaned value.
 *
 * Note on injection: all persistence goes through supabase-js (parameterized
 * PostgREST calls), so SQL injection is not possible via these fields. These
 * helpers exist for data quality and UX; React escaping handles XSS on render.
 */

export const PASSWORD_MIN_LENGTH = 8;
// Supabase (GoTrue) hashes with bcrypt, which truncates beyond 72 bytes.
export const PASSWORD_MAX_LENGTH = 72;
export const NAME_MAX_LENGTH = 80;
export const EMAIL_MAX_LENGTH = 254;

/** Trim, collapse repeated whitespace, and strip control characters. */
export function sanitizeText(raw: string, maxLength = NAME_MAX_LENGTH): string {
  // Collapse whitespace first so tabs/newlines become spaces, THEN drop any
  // remaining control characters (which are no longer whitespace).
  const collapsed = raw.replace(/\s+/g, " ");
  const printable = Array.from(collapsed)
    .filter((ch) => {
      const code = ch.codePointAt(0) ?? 0;
      return code >= 32 && code !== 127;
    })
    .join("");
  return printable.trim().slice(0, maxLength);
}

export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) return "Email is required.";
  if (trimmed.length > EMAIL_MAX_LENGTH) return "Email is too long.";
  // Pragmatic shape check — Supabase does the authoritative validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
    return "Enter a valid email address.";
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Password is required.";
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return `Password must be ${PASSWORD_MAX_LENGTH} characters or fewer.`;
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return "Password must include at least one letter and one number.";
  }
  return null;
}

/** Required display-name style field (person name, studio name). */
export function validateName(name: string, label = "Name"): string | null {
  const cleaned = sanitizeText(name);
  if (!cleaned) return `${label} is required.`;
  if (cleaned.length < 2) return `${label} must be at least 2 characters.`;
  return null;
}

/** Keep digits only, capped at a 10-digit US number. */
export function phoneDigits(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 10);
}

/** Progressive US phone formatting: 5551234567 → (555) 123-4567. */
export function formatPhone(raw: string): string {
  const d = phoneDigits(raw);
  if (d.length === 0) return "";
  if (d.length < 4) return `(${d}`;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

/** Phone is optional; when present it must be a complete US number. */
export function validatePhone(phone: string): string | null {
  const d = phoneDigits(phone);
  if (!d) return null;
  if (d.length !== 10) return "Enter a 10-digit phone number.";
  return null;
}
