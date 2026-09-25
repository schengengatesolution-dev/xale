"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PayCheckout } from "@/components/PayCheckout";

export function ReserveForm({
  listingId,
  checkoutEnabled = false,
}: {
  listingId: string;
  checkoutEnabled?: boolean;
}) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [reservationId, setReservationId] = useState<string | null>(null);
  const [amountMnt, setAmountMnt] = useState<number | undefined>();

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
      setReservationId(data.reservation?.id || null);
      setAmountMnt(data.reservation?.listing?.bagPrice);
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
        <p className="font-semibold">Азтай уут захиалагдлаа!</p>
        {checkoutEnabled && reservationId ? (
          <>
            <p className="mt-1">
              Одоо төлбөрөө хийснээр захиалга баталгаажна.
            </p>
            <PayCheckout
              reservationId={reservationId}
              amountMnt={amountMnt}
              checkoutEnabled
              autoStart
            />
          </>
        ) : (
          <p className="mt-1">
            Байршил дээр очиж азтай уутаа авна уу!
            Апп доторх төлбөр удахгүй нэмэгдэнэ — одоо авах үедээ төлнө.
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <p className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-xs leading-relaxed text-green-900">
        Азтай уут: ангилал тодорхой; доторх зүйлийг сонгохгүй. Үнэ
        жижиглэнгийн ойролцоогоор ⅓.
      </p>
      {checkoutEnabled ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
          Захиалсны дараа QPay-ээр төлбөр хийнэ. Төлбөр амжилттай болсны дараа
          уутаа авна уу.
        </p>
      ) : (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
          Одоогоор апп дотор карт төлбөргүй. Захиалга нөөцлөнө — төлбөрийг авах
          үедээ хийнэ. Апп доторх төлбөр удахгүй.
        </p>
      )}
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
        {loading ? "Захиалж байна..." : "Захиалах"}
      </button>
    </form>
  );
}
