import { randomInt } from "crypto";

/** Digits only — easy to say aloud; unambiguous fonts. */
const DIGITS = "0123456789";

/**
 * Generate a 6-digit numeric pickup/redeem code.
 * Collision rarity handled by caller (unique constraint + retry).
 */
export function generatePickupCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += DIGITS[randomInt(DIGITS.length)];
  }
  return code;
}

/** Normalize user-entered code for comparison (trim + digits only). */
export function normalizePickupCode(raw: string): string {
  return String(raw || "")
    .trim()
    .replace(/\s+/g, "")
    .replace(/[^0-9]/g, "");
}
