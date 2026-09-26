import { cookies } from "next/headers";
import {
  COOKIE_NAME,
  defaultLocale,
  normalizeLocale,
  type Locale,
} from "./config";

/** Server-side locale from `hairan_lang` cookie (default: mn). */
export function getLocale(): Locale {
  try {
    const raw = cookies().get(COOKIE_NAME)?.value;
    return normalizeLocale(raw);
  } catch {
    return defaultLocale;
  }
}
