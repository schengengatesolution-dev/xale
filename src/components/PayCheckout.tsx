"use client";

import { useCallback, useEffect, useState } from "react";
import { formatMNT } from "@/lib/constants";

type QpayUrl = { name?: string; description?: string; link?: string; logo?: string };

type Props = {
  reservationId: string;
  amountMnt?: number;
  /** When false, component renders nothing (reserve-only mode). */
  checkoutEnabled: boolean;
  autoStart?: boolean;
};

export function PayCheckout({
  reservationId,
  amountMnt,
  checkoutEnabled,
  autoStart = false,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [qrText, setQrText] = useState<string | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [urls, setUrls] = useState<QpayUrl[]>([]);
  const [amount, setAmount] = useState<number | undefined>(amountMnt);
  const [paid, setPaid] = useState(false);
  const [payoutNote, setPayoutNote] = useState<string | null>(null);

  const startPay = useCallback(async () => {
    setLoading(true);
    setError("");
    setWarning("");
    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservationId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Төлбөр үүсгэхэд алдаа гарлаа");
        return;
      }

      const nextQrText =
        (typeof data.qr_text === "string" && data.qr_text) ||
        (typeof data.qrText === "string" && data.qrText) ||
        null;
      const nextQrImage =
        (typeof data.qr_image === "string" && data.qr_image) ||
        (typeof data.qrImage === "string" && data.qrImage) ||
        null;
      const nextShortUrl =
        (typeof data.shortUrl === "string" && data.shortUrl) ||
        (typeof data.qPay_shortUrl === "string" && data.qPay_shortUrl) ||
        null;
      const nextUrls = Array.isArray(data.urls) ? data.urls : [];

      if (!nextQrImage && !nextQrText && !nextShortUrl) {
        setError(
          "QPay QR үүсээгүй байна. Дахин оролдоно уу, эсвэл дэмжлэгтэй холбогдоно уу."
        );
        return;
      }

      setPaymentId(data.paymentId);
      setQrText(nextQrText);
      setQrImage(nextQrImage);
      setShortUrl(nextShortUrl);
      setUrls(nextUrls);
      setAmount(data.amountMnt);
      if (typeof data.warning === "string" && data.warning) {
        setWarning(data.warning);
      }
    } catch {
      setError("Сүлжээний алдаа. Дахин оролдоно уу.");
    } finally {
      setLoading(false);
    }
  }, [reservationId]);

  useEffect(() => {
    if (checkoutEnabled && autoStart && !paymentId && !paid) {
      void startPay();
    }
  }, [checkoutEnabled, autoStart, paymentId, paid, startPay]);

  useEffect(() => {
    if (!paymentId || paid) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const res = await fetch(`/api/payments/${paymentId}/status`);
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (data.status === "PAID") {
          setPaid(true);
          setPayoutNote(
            data.settlement?.note ||
              "Баасан cutoff → дараагийн 1–5 ажлын өдөрт таны данс"
          );
        }
      } catch {
        /* ignore poll errors */
      }
    };
    const id = setInterval(tick, 3000);
    void tick();
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [paymentId, paid]);

  if (!checkoutEnabled) return null;

  if (paid) {
    return (
      <div className="mt-3 rounded-xl bg-green-50 p-4 text-sm text-green-900">
        <p className="font-semibold">Төлбөр амжилттай!</p>
        <p className="mt-1">
          Байршил дээр очиж азтай уутаа авна уу.
          {amount != null ? ` · ${formatMNT(amount)}` : ""}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-3">
      {!paymentId ? (
        <button
          type="button"
          disabled={loading}
          onClick={() => void startPay()}
          className="btn-primary w-full !py-3"
        >
          {loading ? "Төлбөр бэлдэж байна..." : "Төлбөр төлөх"}
        </button>
      ) : (
        <div className="rounded-xl border border-green-200 bg-green-50/60 p-4">
          <p className="text-sm font-semibold text-green-900">
            QPay-ээр төлнө үү
            {amount != null ? ` · ${formatMNT(amount)}` : ""}
          </p>
          <p className="mt-1 text-xs text-stone-600">
            Банкны апп-аараа QR уншуулна уу. Төлбөр баталгаажсаны дараа
            автоматаар шинэчлэгдэнэ.
          </p>
          {qrImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={
                qrImage.startsWith("data:")
                  ? qrImage
                  : `data:image/png;base64,${qrImage}`
              }
              alt="QPay QR"
              className="mx-auto mt-3 h-48 w-48 rounded-lg bg-white p-2"
            />
          )}
          {!qrImage && shortUrl && (
            <a
              href={shortUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 block rounded-xl bg-green-700 px-3 py-3 text-center text-sm font-semibold text-white hover:bg-green-800"
            >
              QPay холбоосоор нээх
            </a>
          )}
          {qrText && !qrImage && (
            <p className="mt-2 break-all rounded-lg bg-white p-2 font-mono text-[10px] text-stone-600">
              {qrText}
            </p>
          )}
          {urls.length > 0 && (
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {urls.map((u, i) =>
                u.link ? (
                  <li key={i}>
                    <a
                      href={u.link}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-xl border border-stone-200 bg-white px-3 py-2 text-center text-xs font-semibold text-green-800 hover:bg-stone-50"
                    >
                      {u.name || u.description || "Банкны апп"}
                    </a>
                  </li>
                ) : null
              )}
            </ul>
          )}
          <p className="mt-3 text-center text-[11px] text-stone-500">
            Төлбөр шалгаж байна…
          </p>
        </div>
      )}
      {warning && (
        <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900">
          {warning}
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800"
        >
          {error}
        </p>
      )}
      {/* payoutNote reserved for post-pay seller views; buyer never sees % */}
      {payoutNote ? null : null}
    </div>
  );
}
