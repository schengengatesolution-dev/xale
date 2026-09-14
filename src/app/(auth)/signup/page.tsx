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
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: fd.get("email"),
        password: fd.get("password"),
        name: fd.get("name"),
        phone: fd.get("phone") || undefined,
        whatsapp: fd.get("whatsapp") || undefined,
        role,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Алдаа гарлаа");
      return;
    }
    router.push(data.user.role === "SELLER" ? "/seller/listings" : "/listings");
    router.refresh();
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-12">
      <h1 className="text-2xl font-bold">Бүртгүүлэх</h1>
      <p className="mt-2 text-sm text-stone-600">
        Аль хэдийн бүртгэлтэй юу?{" "}
        <Link href="/login" className="font-semibold text-green-700">
          Нэвтрэх
        </Link>
      </p>

      <form onSubmit={onSubmit} className="card mt-8 space-y-4">
        {error && (
          <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <span className="label">Төрөл</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole("BUYER")}
              className={`rounded-xl border px-3 py-3 text-sm font-semibold ${
                role === "BUYER"
                  ? "border-green-600 bg-green-50 text-green-800"
                  : "border-stone-200 bg-white text-stone-600"
              }`}
            >
              Худалдан авагч
            </button>
            <button
              type="button"
              onClick={() => setRole("SELLER")}
              className={`rounded-xl border px-3 py-3 text-sm font-semibold ${
                role === "SELLER"
                  ? "border-green-600 bg-green-50 text-green-800"
                  : "border-stone-200 bg-white text-stone-600"
              }`}
            >
              Худалдагч
            </button>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="name">
            Нэр / Байгууллагын нэр
          </label>
          <input id="name" name="name" required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="email">
            Имэйл
          </label>
          <input id="email" name="email" type="email" required className="input" />
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
          />
        </div>
        <div>
          <label className="label" htmlFor="phone">
            Утас
          </label>
          <input id="phone" name="phone" className="input" placeholder="99112233" />
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
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Түр хүлээнэ үү..." : "Бүртгүүлэх"}
        </button>
      </form>
    </div>
  );
}
