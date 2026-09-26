"use client";

import Link from "next/link";
import PhoneAuthForm from "@/components/PhoneAuthForm";

export default function SignupPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-12">
      <h1 className="text-2xl font-bold tracking-tight">Бүртгүүлэх</h1>
      <p className="mt-2 text-sm text-stone-600">
        Утасны дугаараар код авч бүртгүүлнэ. Төрөл (худалдан авагч / худалдагч)
        кодын дараа сонгоно.
      </p>
      <div className="mt-8">
        <PhoneAuthForm
          purpose="register"
          altHref="/login"
          altLabel="Нэвтрэх"
        />
      </div>
      <p className="mt-6 text-center text-xs text-stone-400">
        Төлбөрийн нөхцөл:{" "}
        <Link href="/payment-terms" className="underline hover:text-stone-600">
          Төлбөрийн нөхцөл
        </Link>
      </p>
    </div>
  );
}
