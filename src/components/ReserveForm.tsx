"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function ReserveForm({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    setError("");
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          note: note.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("err");
        setError(data.error || "Захиалахад алдаа гарлаа");
        return;
      }
      setStatus("ok");
      router.refresh();
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
        <p className="font-semibold">Surprise Bag захиалагдлаа!</p>
        <p className="mt-1">
          Авах цонхны хугацаанд дэлгүүр / ресторан дээр очиж баталгаажуулаарай.
          Апп доторх төлбөр удахгүй нэмэгдэнэ — одоо авах үедээ төлнө.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
        Одоогоор апп дотор карт төлбөргүй. Захиалга нөөцлөнө — төлбөрийг авах
        үедээ хийнэ. Апп доторх төлбөр удахгүй.
      </p>
      <label className="label" htmlFor="note">
        Тэмдэглэл (заавал биш)
      </label>
      <textarea
        id="note"
        className="input min-h-[70px]"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Жишээ: харшлын талаар..."
      />
      {status === "err" && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
        {loading ? "Захиалж байна..." : "Захиалах · Reserve"}
      </button>
    </form>
  );
}
