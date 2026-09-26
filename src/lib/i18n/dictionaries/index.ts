import type { Locale } from "../config";
import type { Dictionary } from "./mn";
import { mn } from "./mn";
import { en } from "./en";

export const dictionaries: Record<Locale, Dictionary> = { mn, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? mn;
}

export type { Dictionary };
export { mn, en };
