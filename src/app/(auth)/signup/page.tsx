"use client";

import Link from "next/link";
import PhoneAuthForm from "@/components/PhoneAuthForm";
import { useT } from "@/lib/i18n";

export default function SignupPage() {
  const t = useT();
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-12">
      <h1 className="text-2xl font-bold tracking-tight">{t("auth.signupTitle")}</h1>
      <p className="mt-2 text-sm text-stone-600">{t("auth.signupSubtitle")}</p>
      <div className="mt-8">
        <PhoneAuthForm
          purpose="register"
          altHref="/login"
          altLabel={t("nav.login")}
        />
      </div>
      <p className="mt-6 text-center text-xs text-stone-400">
        {t("auth.paymentTermsNote")}{" "}
        <Link href="/payment-terms" className="underline hover:text-stone-600">
          {t("auth.paymentTermsLink")}
        </Link>
      </p>
    </div>
  );
}
