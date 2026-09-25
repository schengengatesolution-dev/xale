"use client";

import PhoneAuthForm from "@/components/PhoneAuthForm";

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-12">
      <h1 className="text-2xl font-bold tracking-tight">Нэвтрэх</h1>
      <p className="mt-2 text-sm text-stone-600">
        Утасны дугаараар код авч нэвтэрнэ.
      </p>
      <div className="mt-8">
        <PhoneAuthForm
          purpose="login"
          altHref="/signup"
          altLabel="Бүртгүүлэх"
        />
      </div>
    </div>
  );
}
