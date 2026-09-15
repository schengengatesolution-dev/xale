"use client";

import { FormEvent, useState } from "react";

export function InterestForm({ listingId }: { listingId: string }) {
  const [message, setMessage] = useState(
    "Сайн байна уу, энэ барааг сонирхож байна. Холбогдоно уу."
  );
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    setError("");
    try {
      const res = await fetch("/api/interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("err");
        setError(data.error || "Сонирхол илгээхэд алдаа гарлаа");
        return;
      }
      setStatus("ok");
    } catch {
      setStatus("err");
      setError("Сүлжээний алдаа. Дахин оролдоно уу.");
    } finally {
      setLoading(false);
    }
  }

  if (status === "ok") {
    return (
      <div className="rounded-xl bg-green-50 p-4 text-sm text-green-800">
        Таны сонирхол амжилттай илгээгдлээ! Худалдагч тантай холбогдох болно.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="label" htmlFor="message">
        Зурвас
      </label>
      <textarea
        id="message"
        className="input min-h-[90px]"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
      />
      {status === "err" && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Илгээж байна..." : "Сонирхож байна"}
      </button>
    </form>
  );
}
