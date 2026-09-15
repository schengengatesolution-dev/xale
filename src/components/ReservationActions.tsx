"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReservationActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function setStatus(next: "COLLECTED" | "NO_SHOW") {
    setLoading(next);
    setError("");
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Алдаа гарлаа");
        return;
      }
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

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <button
        type="button"
        disabled={!!loading}
        onClick={() => setStatus("COLLECTED")}
        className="rounded-full bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-60"
      >
        {loading === "COLLECTED" ? "..." : "Авсан · Collected"}
      </button>
      <button
        type="button"
        disabled={!!loading}
        onClick={() => setStatus("NO_SHOW")}
        className="rounded-full bg-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-300 disabled:opacity-60"
      >
        {loading === "NO_SHOW" ? "..." : "Ирээгүй · No-show"}
      </button>
      {error && <p className="w-full text-xs text-red-600">{error}</p>}
    </div>
  );
}
