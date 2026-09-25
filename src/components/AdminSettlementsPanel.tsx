"use client";

import { useEffect, useState } from "react";
import { formatDate, formatMNT } from "@/lib/constants";

type SettlementRow = {
  id: string;
  status: string;
  amountSellerMnt: number;
  amountPlatformMnt: number;
  payoutTargetDate: string | Date | null;
  note: string | null;
  createdAt: string | Date;
  seller: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    bankName: string | null;
    bankAccount: string | null;
    bankAccountName: string | null;
  };
  payment: {
    id: string;
    amountMnt: number;
    reservation: { id: string; listing: { title: string } } | null;
  };
};

export function AdminSettlementsPanel() {
  const [rows, setRows] = useState<SettlementRow[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/settlements");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Ачаалж чадсангүй");
        return;
      }
      setRows(data.settlements || []);
    } catch {
      setError("Сүлжээний алдаа");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function setStatus(id: string, status: string) {
    setBusyId(id);
    setError("");
    try {
      const res = await fetch("/api/admin/settlements", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Шинэчлэхэд алдаа");
        return;
      }
      await load();
    } catch {
      setError("Сүлжээний алдаа");
    } finally {
      setBusyId(null);
    }
  }

  const queue = rows.filter((r) => r.status === "READY" || r.status === "PROCESSING");

  return (
    <div className="mt-10">
      <h2 className="text-lg font-bold">Төлбөр шилжүүлэг (Settlement)</h2>
      <p className="text-xs text-stone-500">
        QPay баталгаажсаны дараа READY — админ банк руу шилжүүлнэ. Хувь % зөвхөн энд.
        Staging: merchant → шууд 90% payout intent.
      </p>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {loading ? (
        <p className="mt-4 text-sm text-stone-500">Ачаалж байна…</p>
      ) : rows.length === 0 ? (
        <div className="card mt-4 text-center text-stone-500">
          Одоогоор settlement байхгүй.
        </div>
      ) : (
        <>
          <p className="mt-3 text-sm text-stone-600">
            Хүлээгдэж буй: <strong>{queue.length}</strong> · Нийт: {rows.length}
          </p>
          <ul className="mt-4 space-y-3">
            {rows.map((s) => (
              <li key={s.id} className="card !p-4 space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-stone-900">
                      {s.seller.name} ·{" "}
                      {s.payment.reservation?.listing?.title || "Уут"}
                    </p>
                    <p className="text-xs text-stone-500">
                      {formatDate(s.createdAt)} · {s.seller.email}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      s.status === "READY"
                        ? "bg-amber-100 text-amber-900"
                        : s.status === "PROCESSING"
                          ? "bg-blue-100 text-blue-900"
                          : s.status === "PAID_OUT"
                            ? "bg-green-100 text-green-900"
                            : "bg-stone-200 text-stone-700"
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
                <dl className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                  <div>
                    <dt className="text-stone-400">Нийт</dt>
                    <dd className="font-semibold">{formatMNT(s.payment.amountMnt)}</dd>
                  </div>
                  <div>
                    <dt className="text-stone-400">Худалдагчид</dt>
                    <dd className="font-semibold text-green-800">
                      {formatMNT(s.amountSellerMnt)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-stone-400">Платформ</dt>
                    <dd className="font-semibold">{formatMNT(s.amountPlatformMnt)}</dd>
                  </div>
                  <div>
                    <dt className="text-stone-400">Банк</dt>
                    <dd>
                      {s.seller.bankName || "—"} / {s.seller.bankAccount || "—"}
                      <br />
                      <span className="text-stone-500">
                        {s.seller.bankAccountName || "нэргүй"}
                      </span>
                    </dd>
                  </div>
                </dl>
                <div className="flex flex-wrap gap-2 pt-1">
                  {s.status === "READY" && (
                    <button
                      type="button"
                      disabled={busyId === s.id}
                      onClick={() => void setStatus(s.id, "PROCESSING")}
                      className="btn-secondary !px-3 !py-1.5 text-xs"
                    >
                      PROCESSING
                    </button>
                  )}
                  {(s.status === "READY" || s.status === "PROCESSING") && (
                    <button
                      type="button"
                      disabled={busyId === s.id}
                      onClick={() => void setStatus(s.id, "PAID_OUT")}
                      className="btn-primary !px-3 !py-1.5 text-xs"
                    >
                      PAID_OUT
                    </button>
                  )}
                  {s.status !== "HELD" && s.status !== "PAID_OUT" && (
                    <button
                      type="button"
                      disabled={busyId === s.id}
                      onClick={() => void setStatus(s.id, "HELD")}
                      className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-700"
                    >
                      HELD
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
