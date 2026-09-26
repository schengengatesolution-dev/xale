"use client";

import PhoneAuthForm from "@/components/PhoneAuthForm";
import { useT } from "@/lib/i18n";

export default function LoginPage() {
  const t = useT();
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-12">
      <h1 className="text-2xl font-bold tracking-tight">{t("auth.loginTitle")}</h1>
      <p className="mt-2 text-sm text-stone-600">{t("auth.loginSubtitle")}</p>
      <div className="mt-8">
        <PhoneAuthForm
          purpose="login"
          altHref="/signup"
          altLabel={t("nav.signup")}
        />
      </div>
    </div>
  );
}
