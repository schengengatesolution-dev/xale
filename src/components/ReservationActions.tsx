"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReservationActions({
  id,
  status,
  paymentStatus,
  pickupWindowEnded,
}: {
  id: string;
  status: string;
  paymentStatus: string;
  /** True when now > listing.pickupEnd — code expired; only NO_SHOW/CANCELLED */
  pickupWindowEnded: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [showCodeForm, setShowCodeForm] = useState(false);

  async function setStatus(
    next: "COLLECTED" | "NO_SHOW",
    pickupCode?: string
  ) {
    setLoading(next);
    setError("");
    try {
      const body: { status: string; pickupCode?: string } = { status: next };
      if (next === "COLLECTED" && pickupCode != null) {
        body.pickupCode = pickupCode;
      }
      const res = await fetch(`/api/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Алдаа гарлаа");
        return;
      }
      setShowCodeForm(false);
      setCode("");
      router.refresh();
    } catch {
      setError("Сүлжээний алдаа");
    } finally {
      setLoading(null);
    }
  }

  if (status !== "RESERVED") {
    return null;
  }

  const canRedeem =
    paymentStatus === "PAID" && !pickupWindowEnded;

  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs font-medium text-stone-600">
        Зөвхөн авах кодоор уут өгнө.
      </p>

      {canRedeem && !showCodeForm && (
        <button
          type="button"
          disabled={!!loading}
          onClick={() => {
            setError("");
            setShowCodeForm(true);
          }}
          className="rounded-full bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-60"
        >
          Код оруулж авсан гэж тэмдэглэх
        </button>
      )}

      {canRedeem && showCodeForm && (
        <div className="rounded-xl border border-green-200 bg-green-50/70 p-3">
          <label
            htmlFor={`pickup-code-${id}`}
            className="block text-xs font-semibold text-green-900"
          >
            Худалдан авагчийн авах код
          </label>
          <input
            id={`pickup-code-${id}`}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="6 оронтой код"
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-center font-mono text-2xl font-bold tracking-[0.35em] text-stone-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!!loading || code.length < 4}
              onClick={() => void setStatus("COLLECTED", code)}
              className="rounded-full bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-60"
            >
              {loading === "COLLECTED" ? "..." : "Баталгаажуулж авсан"}
            </button>
            <button
              type="button"
              disabled={!!loading}
              onClick={() => {
                setShowCodeForm(false);
                setCode("");
                setError("");
              }}
              className="rounded-full bg-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-300 disabled:opacity-60"
            >
              Болих
            </button>
          </div>
        </div>
      )}

      {!canRedeem && paymentStatus !== "PAID" && (
        <p className="text-xs text-amber-800">
          Төлбөр баталгаажаагүй — уут өгөх боломжгүй.
        </p>
      )}

      {pickupWindowEnded && (
        <p className="text-xs text-amber-800">
          Авах цонх дууссан — код хүчингүй. Ирээгүй гэж тэмдэглэнэ үү.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!!loading}
          onClick={() => void setStatus("NO_SHOW")}
          className="rounded-full bg-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-300 disabled:opacity-60"
        >
          {loading === "NO_SHOW" ? "..." : "Ирээгүй"}
        </button>
      </div>
      {error && <p className="w-full text-xs text-red-600">{error}</p>}
    </div>
  );
}
