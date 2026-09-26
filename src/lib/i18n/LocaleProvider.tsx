"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  COOKIE_MAX_AGE,
  COOKIE_NAME,
  STORAGE_KEY,
  defaultLocale,
  normalizeLocale,
  type Locale,
} from "./config";
import { createT, type TranslateFn } from "./t";
import { getDictionary, type Dictionary } from "./dictionaries";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslateFn;
  dict: Dictionary;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function persistLocale(locale: Locale) {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    /* ignore */
  }
  document.cookie = `${COOKIE_NAME}=${locale};path=/;max-age=${COOKIE_MAX_AGE};SameSite=Lax`;
  document.documentElement.lang = locale;
}

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: ReactNode;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(
    normalizeLocale(initialLocale)
  );

  // Prefer localStorage on mount if present (client-only preference).
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const next = normalizeLocale(stored);
        if (next !== locale) {
          setLocaleState(next);
          persistLocale(next);
          router.refresh();
        } else {
          persistLocale(next);
        }
        return;
      }
    } catch {
      /* ignore */
    }
    persistLocale(locale);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLocale = useCallback(
    (next: Locale) => {
      const normalized = normalizeLocale(next);
      setLocaleState(normalized);
      persistLocale(normalized);
      router.refresh();
    },
    [router]
  );

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t: createT(locale),
      dict: getDictionary(locale),
    }),
    [locale, setLocale]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    // Fallback for components rendered outside provider (shouldn't happen).
    const locale = defaultLocale;
    return {
      locale,
      setLocale: () => {},
      t: createT(locale),
      dict: getDictionary(locale),
    };
  }
  return ctx;
}

export function useT(): TranslateFn {
  return useLocale().t;
}
