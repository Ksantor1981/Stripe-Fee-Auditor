const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeWaitlistEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidWaitlistEmail(email: string): boolean {
  if (email.length < 5 || email.length > 254) return false;
  return EMAIL_RE.test(email);
}
