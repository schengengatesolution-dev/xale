"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { SellerNav } from "@/components/SellerNav";

export default function SellerSettingsPage() {
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/seller/bank");
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.bank) {
          setBankName(data.bank.bankName || "");
          setBankAccount(data.bank.bankAccount || "");
          setBankAccountName(data.bank.bankAccountName || "");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setOk("");
    try {
      const res = await fetch("/api/seller/bank", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bankName, bankAccount, bankAccountName }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Хадгалахад алдаа гарлаа");
        return;
      }
      setOk("Банкны мэдээлэл хадгалагдлаа");
    } catch {
      setError("Сүлжээний алдаа");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-bold">Тохиргоо · банк</h1>
      <p className="mt-1 text-sm text-stone-600">
        Баасан cutoff → дараагийн 1–5 ажлын өдөрт таны данс
      </p>
      <div className="mt-6">
        <SellerNav active="/seller/settings" />
      </div>

      <form onSubmit={onSubmit} className="card mt-4 space-y-4">
        {loading ? (
          <p className="text-sm text-stone-500">Ачаалж байна…</p>
        ) : (
          <>
            {error && <div className="alert-error">{error}</div>}
            {ok && (
              <div className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-800">
                {ok}
              </div>
            )}
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              Банкны мэдээлэл заавал. Бөглөөгүй бол Азтай уут нийтлэх боломжгүй.
            </p>
            <div>
              <label className="label" htmlFor="bankName">
                Банкны нэр
              </label>
              <input
                id="bankName"
                className="input"
                required
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Жишээ: Хаан банк"
              />
            </div>
            <div>
              <label className="label" htmlFor="bankAccount">
                Дансны дугаар
              </label>
              <input
                id="bankAccount"
                className="input"
                required
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                placeholder="5123…"
                inputMode="numeric"
              />
            </div>
            <div>
              <label className="label" htmlFor="bankAccountName">
                Данс эзэмшигчийн нэр
              </label>
              <input
                id="bankAccountName"
                className="input"
                required
                value={bankAccountName}
                onChange={(e) => setBankAccountName(e.target.value)}
              />
            </div>
            <button type="submit" disabled={saving} className="btn-primary w-full">
              {saving ? "Хадгалж байна..." : "Хадгалах"}
            </button>
          </>
        )}
      </form>
      <p className="mt-4 text-center text-xs text-stone-400">
        <Link href="/seller" className="underline hover:text-stone-600">
          Самбар руу буцах
        </Link>
      </p>
    </div>
  );
}
