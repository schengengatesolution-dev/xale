"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/admin/login", {
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
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Сүлжээний алдаа. Дахин оролдоно уу.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-12">
      <h1 className="text-2xl font-bold tracking-tight">Админ нэвтрэх</h1>
      <p className="mt-2 text-sm text-stone-600">
        Зөвхөн системийн админ хандана.{" "}
        <Link href="/" className="font-semibold text-green-700 hover:underline">
          Нүүр хуудас
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
            autoComplete="username"
            className="input"
            placeholder="admin@xale.mn"
            defaultValue="admin@xale.mn"
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
    </div>
  );
}
