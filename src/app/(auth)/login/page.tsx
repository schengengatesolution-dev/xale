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
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: fd.get("email"),
          password: fd.get("password"),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Нэвтрэхэд алдаа гарлаа");
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
      <h1 className="text-2xl font-bold tracking-tight">Нэвтрэх</h1>
      <p className="mt-2 text-sm text-stone-600">
        Бүртгэлгүй юу?{" "}
        <Link href="/signup" className="font-semibold text-green-700 hover:underline">
          Бүртгүүлэх
        </Link>
      </p>

      <form onSubmit={onSubmit} className="card mt-8 space-y-4">
        {error && <div className="alert-error">{error}</div>}
        <div>
          <label className="label" htmlFor="email">
            Имэйл
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
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
            autoComplete="current-password"
            className="input"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Түр хүлээнэ үү..." : "Нэвтрэх"}
        </button>
      </form>

      <div className="mt-6 rounded-xl border border-stone-200 bg-stone-50 p-4 text-xs text-stone-600">
        <p className="font-semibold text-stone-800">Demo бүртгэл (нууц үг: demo1234)</p>
        <ul className="mt-2 space-y-1">
          <li>
            <code className="rounded bg-white px-1">seller@xale.mn</code> — худалдагч
          </li>
          <li>
            <code className="rounded bg-white px-1">buyer@xale.mn</code> — худалдан авагч
          </li>
        </ul>
      </div>
    </div>
  );
}
