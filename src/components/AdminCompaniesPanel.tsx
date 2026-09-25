"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/constants";

type Seller = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  bankName?: string | null;
  bankAccount?: string | null;
  bankAccountName?: string | null;
  createdAt: string | Date;
  _count?: { listings: number };
};

export function AdminCompaniesPanel({
  initialSellers,
}: {
  initialSellers: Seller[];
}) {
  const router = useRouter();
  const [sellers, setSellers] = useState(initialSellers);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function onAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setOk("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") || "");
    const passwordConfirm = String(fd.get("passwordConfirm") || "");
    if (password !== passwordConfirm) {
      setError("Нууц үг таарахгүй байна.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/admin/sellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          password,
          phone: fd.get("phone") || undefined,
          whatsapp: fd.get("whatsapp") || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Нэмэхэд алдаа гарлаа");
        return;
      }
      setOk(`${data.seller.name} нэмэгдлээ`);
      e.currentTarget.reset();
      router.refresh();
      setSellers((prev) => [
        { ...data.seller, _count: { listings: 0 } },
        ...prev,
      ]);
    } catch {
      setError("Сүлжээний алдаа");
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id: string, name: string) {
    if (
      !confirm(
        `«${name}» компанийг устгах уу? Бүх Азтай уут болон захиалга устана.`
      )
    ) {
      return;
    }
    setDeletingId(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/sellers/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Устгахад алдаа гарлаа");
        return;
      }
      setSellers((prev) => prev.filter((s) => s.id !== id));
      setOk(`«${name}» устгагдлаа`);
      router.refresh();
    } catch {
      setError("Сүлжээний алдаа");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mt-10 space-y-6">
      <div>
        <h2 className="text-lg font-bold">Компаниуд (худалдагч)</h2>
        <p className="text-xs text-stone-500">
          Админ эндээс компани нэмэх / устгах боломжтой
        </p>
      </div>

      <form onSubmit={onAdd} className="card space-y-3">
        <h3 className="font-semibold text-stone-800">Компани нэмэх</h3>
        {error && <div className="alert-error">{error}</div>}
        {ok && (
          <div className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-800">
            {ok}
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="co-name">
              Байгууллагын нэр
            </label>
            <input id="co-name" name="name" required className="input" />
          </div>
          <div>
            <label className="label" htmlFor="co-email">
              Имэйл (нэвтрэх)
            </label>
            <input
              id="co-email"
              name="email"
              type="email"
              required
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="co-password">
              Нууц үг
            </label>
            <input
              id="co-password"
              name="password"
              type="password"
              required
              minLength={6}
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="co-passwordConfirm">
              Нууц үг давтах
            </label>
            <input
              id="co-passwordConfirm"
              name="passwordConfirm"
              type="password"
              required
              minLength={6}
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="co-phone">
              Утас
            </label>
            <input id="co-phone" name="phone" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="co-whatsapp">
              WhatsApp
            </label>
            <input id="co-whatsapp" name="whatsapp" className="input" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Нэмэж байна…" : "Компани нэмэх"}
        </button>
      </form>

      <ul className="space-y-3">
        {sellers.length === 0 ? (
          <li className="card text-center text-stone-500">
            Одоогоор компани байхгүй.
          </li>
        ) : (
          sellers.map((s) => (
            <li
              key={s.id}
              className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between !p-4"
            >
              <div>
                <p className="font-semibold text-stone-900">{s.name}</p>
                <p className="text-sm text-stone-600">{s.email}</p>
                    <p className="text-xs text-stone-500">Банк: {s.bankName || "—"} · {s.bankAccount || "—"} · {s.bankAccountName || "—"}</p>
                <p className="text-xs text-stone-500">
                  {s.phone || "утасгүй"} · уут {s._count?.listings ?? 0} ·{" "}
                  {formatDate(s.createdAt)}
                </p>
              </div>
              <button
                type="button"
                disabled={deletingId === s.id}
                onClick={() => onDelete(s.id, s.name)}
                className="rounded-lg border border-rose-300 bg-white px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
              >
                {deletingId === s.id ? "Устгаж байна…" : "Устгах"}
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
