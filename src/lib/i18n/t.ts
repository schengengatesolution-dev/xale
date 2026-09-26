import type { Locale } from "./config";
import { getDictionary, type Dictionary } from "./dictionaries";

type Primitive = string | number | boolean | null | undefined;

/** Dot-path keys into the nested dictionary. */
export type DictKey = {
  [K1 in keyof Dictionary]: Dictionary[K1] extends Primitive
    ? K1 & string
    : {
        [K2 in keyof Dictionary[K1]]: Dictionary[K1][K2] extends Primitive
          ? `${K1 & string}.${K2 & string}`
          : {
              [K3 in keyof Dictionary[K1][K2]]: Dictionary[K1][K2][K3] extends Primitive
                ? `${K1 & string}.${K2 & string}.${K3 & string}`
                : never;
            }[keyof Dictionary[K1][K2]];
      }[keyof Dictionary[K1]];
}[keyof Dictionary];

function resolve(dict: Dictionary, key: string): string {
  const parts = key.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cur: any = dict;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return key;
    cur = cur[p];
  }
  return typeof cur === "string" ? cur : key;
}

export type TranslateFn = (
  key: DictKey | string,
  vars?: Record<string, string | number>
) => string;

export function createT(locale: Locale): TranslateFn {
  const dict = getDictionary(locale);
  return (key, vars) => {
    let s = resolve(dict, key);
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        s = s.replaceAll(`{${k}}`, String(v));
      }
    }
    return s;
  };
}

export function interpolate(
  template: string,
  vars?: Record<string, string | number>
): string {
  if (!vars) return template;
  let s = template;
  for (const [k, v] of Object.entries(vars)) {
    s = s.replaceAll(`{${k}}`, String(v));
  }
  return s;
}
