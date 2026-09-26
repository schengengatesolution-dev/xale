"use client";

import { useLocale } from "./LocaleProvider";
import type { Locale } from "./config";

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { locale, setLocale, t } = useLocale();

  function select(next: Locale) {
    if (next === locale) return;
    setLocale(next);
  }

  return (
    <div
      className={`inline-flex items-center rounded-full border border-stone-200 bg-white p-0.5 text-xs font-bold ${className}`}
      role="group"
      aria-label={t("lang.switchTo")}
    >
      <button
        type="button"
        onClick={() => select("mn")}
        className={`rounded-full px-2.5 py-1 transition ${
          locale === "mn"
            ? "bg-green-600 text-white shadow-sm"
            : "text-stone-500 hover:text-stone-800"
        }`}
        aria-pressed={locale === "mn"}
      >
        {t("lang.mn")}
      </button>
      <button
        type="button"
        onClick={() => select("en")}
        className={`rounded-full px-2.5 py-1 transition ${
          locale === "en"
            ? "bg-green-600 text-white shadow-sm"
            : "text-stone-500 hover:text-stone-800"
        }`}
        aria-pressed={locale === "en"}
      >
        {t("lang.en")}
      </button>
    </div>
  );
}
