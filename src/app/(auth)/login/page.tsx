"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: fd.get("email"),
        password: fd.get("password"),
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
      <h1 className="text-2xl font-bold">Нэвтрэх</h1>
      <p className="mt-2 text-sm text-stone-600">
        Бүртгэлгүй юу?{" "}
        <Link href="/signup" className="font-semibold text-green-700">
          Бүртгүүлэх
        </Link>
      </p>

      <form onSubmit={onSubmit} className="card mt-8 space-y-4">
        {error && (
          <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
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
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="label" htmlFor="password">
            Нууц үг
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="input"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Түр хүлээнэ үү..." : "Нэвтрэх"}
        </button>
      </form>

      <div className="mt-6 rounded-xl bg-stone-100 p-4 text-xs text-stone-600">
        <p className="font-semibold">Demo бүртгэл:</p>
        <p className="mt-1">seller@xale.mn / demo1234 (худалдагч)</p>
        <p>buyer@xale.mn / demo1234 (худалдан авагч)</p>
      </div>
    </div>
  );
}
