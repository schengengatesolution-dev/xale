"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDate, formatMNT } from "@/lib/constants";

type SellerGroup = {
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  phone: string | null;
  bankName: string | null;
  bankAccount: string | null;
  bankAccountName: string | null;
  hasBank: boolean;
  orderCount: number;
  amountSellerMnt: number;
  amountPlatformMnt: number;
  amountGrossMnt: number;
  settlementIds: string[];
};

type Preview = {
  cutoffAt: string;
  cutoffLabel: string;
  batchLabel: string;
  settlementCount: number;
  sellerCount: number;
  totalSellerMnt: number;
  totalPlatformMnt: number;
  totalGrossMnt: number;
  sellersMissingBank: number;
  groups: SellerGroup[];
};

type RecentBatch = {
  id: string;
  label: string;
  status: string;
  cutoffAt: string;
  paidAt: string | null;
  exportedAt: string | null;
  totalSellerMnt: number;
  sellerCount: number;
  settlementCount: number;
  operatorNote: string | null;
  operatorEmail: string | null;
  createdAt: string;
};

type SettlementRow = {
  id: string;
  status: string;
  amountSellerMnt: number;
  amountPlatformMnt: number;
  paidOutAt?: string | Date | null;
  payoutBatchId?: string | null;
  createdAt: string | Date;
  seller: {
    id: string;
    name: string;
    email: string;
    bankName: string | null;
    bankAccount: string | null;
    bankAccountName: string | null;
  };
  payment: {
    amountMnt: number;
    reservation: { id: string; listing: { title: string } } | null;
  };
};

export function AdminSettlementsPanel() {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [recentBatches, setRecentBatches] = useState<RecentBatch[]>([]);
  const [rows, setRows] = useState<SettlementRow[]>([]);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [tab, setTab] = useState<"batch" | "all">("batch");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [batchRes, listRes] = await Promise.all([
        fetch("/api/admin/settlements/batch"),
        fetch("/api/admin/settlements"),
      ]);
      const batchData = await batchRes.json().catch(() => ({}));
      const listData = await listRes.json().catch(() => ({}));
      if (!batchRes.ok) {
        setError(batchData.error || "Багц ачаалж чадсангүй");
        return;
      }
      if (!listRes.ok) {
        setError(listData.error || "Жагсаалт ачаалж чадсангүй");
        return;
      }
      setPreview(batchData.preview || null);
      setRecentBatches(batchData.recentBatches || []);
      setRows(listData.settlements || []);
    } catch {
      setError("Сүлжээний алдаа");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function runAction(action: "mark_paid" | "mark_exported") {
    if (
      action === "mark_paid" &&
      !window.confirm(
        "Банк руу шилжүүлэг хийсэн гэж үзэж READY/PROCESSING-ийг PAID_OUT болгох уу?"
      )
    ) {
      return;
    }
    setBusy(true);
    setError("");
    setOk("");
    try {
      const res = await fetch("/api/admin/settlements/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          operatorNote: note.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Үйлдэл амжилтгүй");
        return;
      }
      setOk(
        action === "mark_paid"
          ? `Төлсөн: ${data.label} · ${data.settlementCount} settlement · ${formatMNT(data.totalSellerMnt)}`
          : `Экспортлогдсон: ${data.label} · ${data.settlementCount} settlement`
      );
      setNote("");
      await load();
    } catch {
      setError("Сүлжээний алдаа");
    } finally {
      setBusy(false);
    }
  }

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

  return (
    <div className="mt-10">
      <h2 className="text-lg font-bold">Долоо хоногийн seller payout</h2>
      <p className="text-xs text-stone-500">
        Баасан cutoff (Asia/Ulaanbaatar) → READY settlement-уудыг худалдагчаар
        нэгтгэж, гараар банк руу шилжүүлнэ. Хувь / шимтгэл зөвхөн админд.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTab("batch")}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
            tab === "batch"
              ? "bg-green-600 text-white"
              : "bg-stone-100 text-stone-700"
          }`}
        >
          Долоо хоногийн багц
        </button>
        <button
          type="button"
          onClick={() => setTab("all")}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
            tab === "all"
              ? "bg-green-600 text-white"
              : "bg-stone-100 text-stone-700"
          }`}
        >
          Бүх settlement
        </button>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {ok && <p className="mt-2 text-sm text-green-700">{ok}</p>}

      {loading ? (
        <p className="mt-4 text-sm text-stone-500">Ачаалж байна…</p>
      ) : tab === "batch" ? (
        <div className="mt-4 space-y-4">
          {preview && (
            <div className="card space-y-3 !p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-stone-900">
                    {preview.batchLabel}
                  </p>
                  <p className="text-xs text-stone-500">
                    Cutoff: {preview.cutoffLabel} (UB)
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p>
                    Худалдагч: <strong>{preview.sellerCount}</strong>
                  </p>
                  <p>
                    Захиалга: <strong>{preview.settlementCount}</strong>
                  </p>
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                <div>
                  <dt className="text-stone-400">Худалдагчид нийт</dt>
                  <dd className="text-base font-bold text-green-800">
                    {formatMNT(preview.totalSellerMnt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-stone-400">Платформ (админ)</dt>
                  <dd className="text-base font-bold">
                    {formatMNT(preview.totalPlatformMnt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-stone-400">QPay нийт</dt>
                  <dd className="font-semibold">
                    {formatMNT(preview.totalGrossMnt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-stone-400">Банк дутуу</dt>
                  <dd
                    className={
                      preview.sellersMissingBank
                        ? "font-semibold text-red-700"
                        : "font-semibold text-green-700"
                    }
                  >
                    {preview.sellersMissingBank}
                  </dd>
                </div>
              </dl>

              <label className="block text-xs text-stone-500">
                Оператор тэмдэглэл
                <input
                  className="input mt-1"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Жишээ: Хаан банк шилжүүлэг #123"
                />
              </label>

              <div className="flex flex-wrap gap-2">
                <a
                  href="/api/admin/settlements/batch?format=csv"
                  className="btn-secondary !px-3 !py-1.5 text-xs"
                >
                  CSV татах
                </a>
                <button
                  type="button"
                  disabled={busy || preview.settlementCount === 0}
                  onClick={() => void runAction("mark_exported")}
                  className="btn-secondary !px-3 !py-1.5 text-xs"
                >
                  Экспортлогдсон (PROCESSING)
                </button>
                <button
                  type="button"
                  disabled={
                    busy ||
                    preview.settlementCount === 0 ||
                    preview.sellersMissingBank > 0
                  }
                  onClick={() => void runAction("mark_paid")}
                  className="btn-primary !px-3 !py-1.5 text-xs"
                >
                  Төлсөн (PAID_OUT)
                </button>
              </div>
            </div>
          )}

          {preview && preview.groups.length === 0 ? (
            <div className="card text-center text-stone-500">
              Энэ cutoff хүртэл READY settlement байхгүй.
            </div>
          ) : (
            <ul className="space-y-3">
              {preview?.groups.map((g) => (
                <li key={g.sellerId} className="card space-y-2 !p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-stone-900">
                        {g.sellerName}
                      </p>
                      <p className="text-xs text-stone-500">
                        {g.sellerEmail}
                        {g.phone ? ` · ${g.phone}` : ""}
                      </p>
                    </div>
                    {!g.hasBank && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
                        Банк дутуу
                      </span>
                    )}
                  </div>
                  <dl className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                    <div>
                      <dt className="text-stone-400">Төлөх дүн</dt>
                      <dd className="font-bold text-green-800">
                        {formatMNT(g.amountSellerMnt)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-stone-400">Платформ</dt>
                      <dd className="font-semibold">
                        {formatMNT(g.amountPlatformMnt)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-stone-400">Захиалга</dt>
                      <dd className="font-semibold">{g.orderCount}</dd>
                    </div>
                    <div>
                      <dt className="text-stone-400">Банк</dt>
                      <dd>
                        {g.bankName || "—"} / {g.bankAccount || "—"}
                        <br />
                        <span className="text-stone-500">
                          {g.bankAccountName || "нэргүй"}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          )}

          {recentBatches.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-bold text-stone-800">
                Сүүлийн багцууд
              </h3>
              <ul className="mt-2 space-y-2">
                {recentBatches.map((b) => (
                  <li
                    key={b.id}
                    className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs"
                  >
                    <div className="flex flex-wrap justify-between gap-2">
                      <span className="font-semibold">
                        {b.label} · {b.status}
                      </span>
                      <span>
                        {formatMNT(b.totalSellerMnt)} · {b.sellerCount}{" "}
                        худалдагч · {b.settlementCount} захиалга
                      </span>
                    </div>
                    <p className="mt-0.5 text-stone-500">
                      {formatDate(b.createdAt)}
                      {b.operatorEmail ? ` · ${b.operatorEmail}` : ""}
                      {b.operatorNote ? ` · ${b.operatorNote}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : rows.length === 0 ? (
        <div className="card mt-4 text-center text-stone-500">
          Одоогоор settlement байхгүй.
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((s) => (
            <li key={s.id} className="card space-y-2 !p-4">
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
                  <dd className="font-semibold">
                    {formatMNT(s.payment.amountMnt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-stone-400">Худалдагчид</dt>
                  <dd className="font-semibold text-green-800">
                    {formatMNT(s.amountSellerMnt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-stone-400">Платформ</dt>
                  <dd className="font-semibold">
                    {formatMNT(s.amountPlatformMnt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-stone-400">Банк</dt>
                  <dd>
                    {s.seller.bankName || "—"} / {s.seller.bankAccount || "—"}
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
      )}
    </div>
  );
}
