/**
 * Mongolian phone normalization → +976XXXXXXXX (8 digits after 976).
 */

export function normalizeMnPhone(input: string): string | null {
  if (!input || typeof input !== "string") return null;
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("976") && digits.length === 11) {
    digits = digits.slice(3);
  } else if (digits.startsWith("00976") && digits.length === 13) {
    digits = digits.slice(5);
  }
  // Local 8-digit mobile (starts with 8/9 typically, but accept any 8 digits)
  if (digits.length === 8) {
    return `+976${digits}`;
  }
  return null;
}

/** Digits only after country code, for synthetic email etc. */
export function phoneLocalDigits(e164: string): string {
  return e164.replace(/^\+976/, "").replace(/\D/g, "");
}

export function syntheticEmailFromPhone(e164: string): string {
  return `${phoneLocalDigits(e164)}@phone.hairan.mn`;
}

export function formatPhoneDisplay(e164: string): string {
  const d = phoneLocalDigits(e164);
  if (d.length === 8) return `+976 ${d.slice(0, 4)} ${d.slice(4)}`;
  return e164;
}
