"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"SELLER" | "BUYER">("BUYER");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") || "");
    const passwordConfirm = String(fd.get("passwordConfirm") || "");
    if (password !== passwordConfirm) {
      setError("Нууц үг таарахгүй байна. Дахин оруулна уу.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: fd.get("email"),
          password,
          passwordConfirm,
          name: fd.get("name"),
          phone: fd.get("phone") || undefined,
          whatsapp: fd.get("whatsapp") || undefined,
          role,
          ...(role === "SELLER"
            ? {
                bankName: fd.get("bankName") || undefined,
                bankAccount: fd.get("bankAccount") || undefined,
                bankAccountName: fd.get("bankAccountName") || undefined,
              }
            : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Бүртгүүлэхэд алдаа гарлаа");
        return;
      }
      router.push(data.user.role === "SELLER" ? "/seller" : "/listings");
      router.refresh();
    } catch {
      setError("Сүлжээний алдаа. Дахин оролдоно уу.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-12">
      <h1 className="text-2xl font-bold tracking-tight">Бүртгүүлэх</h1>
      <p className="mt-2 text-sm text-stone-600">
        Аль хэдийн бүртгэлтэй юу?{" "}
        <Link href="/login" className="font-semibold text-green-700 hover:underline">
          Нэвтрэх
        </Link>
      </p>

      <form onSubmit={onSubmit} className="card mt-8 space-y-4">
        {error && <div className="alert-error">{error}</div>}

        <div>
          <span className="label">Төрөл</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole("BUYER")}
              className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                role === "BUYER"
                  ? "border-green-600 bg-green-50 text-green-800 ring-2 ring-green-600/20"
                  : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
              }`}
            >
              Худалдан авагч
            </button>
            <button
              type="button"
              onClick={() => setRole("SELLER")}
              className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                role === "SELLER"
                  ? "border-green-600 bg-green-50 text-green-800 ring-2 ring-green-600/20"
                  : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
              }`}
            >
              Худалдагч
            </button>
          </div>
          <p className="mt-2 text-xs text-stone-500">
            {role === "SELLER"
              ? "Азтай уут нийтэлнэ. Банкны мэдээлэл заавал — төлбөр шууд данс руу."
              : "Зарууд үзэж, захиална."}
          </p>
        </div>

        <div>
          <label className="label" htmlFor="name">
            Нэр / Байгууллагын нэр
          </label>
          <input id="name" name="name" required className="input" autoComplete="name" />
        </div>
        <div>
          <label className="label" htmlFor="email">
            Имэйл
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="input"
            autoComplete="email"
          />
        </div>
        <div>
          <label className="label" htmlFor="password">
            Нууц үг (дор хаяж 6 тэмдэгт)
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            className="input"
            autoComplete="new-password"
          />
        </div>
        <div>
          <label className="label" htmlFor="passwordConfirm">
            Нууц үг давтах
          </label>
          <input
            id="passwordConfirm"
            name="passwordConfirm"
            type="password"
            required
            minLength={6}
            className="input"
            autoComplete="new-password"
          />
        </div>
        <div>
          <label className="label" htmlFor="phone">
            Утас
          </label>
          <input
            id="phone"
            name="phone"
            className="input"
            placeholder="99112233"
            inputMode="tel"
          />
        </div>
        <div>
          <label className="label" htmlFor="whatsapp">
            WhatsApp (заавал биш)
          </label>
          <input
            id="whatsapp"
            name="whatsapp"
            className="input"
            placeholder="99112233"
            inputMode="tel"
          />
        </div>

        {role === "SELLER" && (
          <>
            <div>
              <label className="label" htmlFor="bankName">
                Банкны нэр *
              </label>
              <input id="bankName" name="bankName" required className="input" placeholder="Жишээ: Хаан банк" />
            </div>
            <div>
              <label className="label" htmlFor="bankAccount">
                Дансны дугаар *
              </label>
              <input id="bankAccount" name="bankAccount" required className="input" inputMode="numeric" />
            </div>
            <div>
              <label className="label" htmlFor="bankAccountName">
                Данс эзэмшигчийн нэр *
              </label>
              <input id="bankAccountName" name="bankAccountName" required className="input" />
            </div>
            <p className="text-xs text-stone-500">
              Төлбөр баталгаажсан даруй таны данс руу шилжүүлнэ
            </p>
          </>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Түр хүлээнэ үү..." : "Бүртгүүлэх"}
        </button>
      </form>
      <p className="mt-6 text-center text-xs text-stone-400">
        Төлбөрийн нөхцөл:{" "}
        <Link href="/payment-terms" className="underline hover:text-stone-600">
          Төлбөрийн нөхцөл
        </Link>
      </p>
    </div>
  );
}
