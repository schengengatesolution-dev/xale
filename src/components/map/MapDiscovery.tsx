"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { coordsForListing, UB_CENTER } from "@/lib/geo";
import {
  CATEGORIES,
  formatMNT,
  formatPickupWindow,
  type CategoryKey,
} from "@/lib/constants";
import type { MapListing } from "./types";

const BagMap = dynamic(
  () => import("./BagMap").then((m) => m.BagMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-cream-100 text-sm text-stone-500">
        Газрын зураг ачаалж байна…
      </div>
    ),
  }
);

type SessionInfo = {
  id: string;
  role: string;
  name: string;
} | null;

type Props = {
  initialSession: SessionInfo;
};

export function MapDiscovery({ initialSession }: Props) {
  const [listings, setListings] = useState<MapListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [geoNote, setGeoNote] = useState<string | null>(null);
  const [session] = useState<SessionInfo>(initialSession);
  const [reserving, setReserving] = useState(false);
  const [reserveMsg, setReserveMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/listings?status=ACTIVE");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Алдаа");
        const mapped: MapListing[] = (data.listings || []).map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (l: any) => {
            const c = coordsForListing({
              id: l.id,
              pickupDistrict: l.pickupDistrict,
              lat: l.lat,
              lng: l.lng,
            });
            return {
              id: l.id,
              title: l.title,
              category: l.category,
              bagPrice: l.bagPrice,
              estimatedRetailValue: l.estimatedRetailValue,
              quantityAvailable: l.quantityAvailable,
              pickupStart: l.pickupStart,
              pickupEnd: l.pickupEnd,
              pickupDistrict: l.pickupDistrict,
              pickupAddress: l.pickupAddress ?? null,
              lat: c.lat,
              lng: c.lng,
              seller: l.seller,
              _count: l._count,
            };
          }
        );
        if (!cancelled) setListings(mapped);
      } catch {
        if (!cancelled) setError("Уутнуудыг ачаалж чадсангүй");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setUserPos({ lat: UB_CENTER.lat, lng: UB_CENTER.lng });
      setGeoNote("Байршил боломжгүй — УБ төв");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setGeoNote(null);
      },
      () => {
        setUserPos({ lat: UB_CENTER.lat, lng: UB_CENTER.lng });
        setGeoNote("Байршил зөвшөөрөгдөөгүй — УБ төв");
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 }
    );
  }, []);

  const selected = useMemo(
    () => listings.find((l) => l.id === selectedId) ?? null,
    [listings, selectedId]
  );

  const closeSheet = useCallback(() => {
    setSelectedId(null);
    setReserveMsg(null);
  }, []);

  async function reserveSelected() {
    if (!selected || !session || session.role !== "BUYER") return;
    setReserving(true);
    setReserveMsg(null);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: selected.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setReserveMsg(data.error || "Захиалахад алдаа гарлаа");
        return;
      }
      setReserveMsg("Захиалга амжилттай! Авах цонхонд очино уу.");
    } catch {
      setReserveMsg("Сүлжээний алдаа");
    } finally {
      setReserving(false);
    }
  }

  const phone = selected?.seller?.phone?.replace(/\s+/g, "") || null;
  const remaining = selected
    ? Math.max(
        0,
        selected.quantityAvailable - (selected._count?.reservations ?? 0)
      )
    : 0;

  return (
    <div className="fixed inset-x-0 top-14 bottom-[3.75rem] z-30 w-full overflow-hidden bg-cream-100 md:bottom-0 md:top-[3.75rem]">
      {/* Map */}
      <div className="absolute inset-0 pb-[env(safe-area-inset-bottom)] md:pb-0">
        {!loading && !error && (
          <BagMap
            listings={listings}
            userPos={userPos}
            selectedId={selectedId}
            onSelect={(id) => {
              setSelectedId(id);
              setReserveMsg(null);
            }}
          />
        )}
        {loading && (
          <div className="flex h-full items-center justify-center text-sm text-stone-500">
            Ачаалж байна…
          </div>
        )}
        {error && (
          <div className="flex h-full items-center justify-center text-sm text-red-600">
            {error}
          </div>
        )}
      </div>

      {/* Top chip bar */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-[500] flex items-start justify-between gap-2 p-3">
        <div className="pointer-events-auto rounded-2xl border border-stone-200/80 bg-white/95 px-3 py-2 shadow-md backdrop-blur">
          <p className="text-xs font-bold text-green-800">Азтай уут · газрын зураг</p>
          <p className="text-[11px] text-stone-500">
            {listings.length} уут ·{" "}
            {geoNote || (userPos ? "Таны байршил" : "…")}
          </p>
        </div>
        <Link
          href="/listings"
          className="pointer-events-auto rounded-full border border-stone-200 bg-white/95 px-3 py-2 text-xs font-semibold text-stone-700 shadow-md backdrop-blur hover:bg-white"
        >
          Жагсаалт
        </Link>
      </div>

      {/* Bottom sheet */}
      {selected && (
        <>
          <button
            type="button"
            aria-label="Хаах"
            className="absolute inset-0 z-[600] bg-black/20"
            onClick={closeSheet}
          />
          <div className="absolute bottom-0 left-0 right-0 z-[700] mx-auto max-w-lg px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:pb-4">
            <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-2xl">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                    {CATEGORIES[selected.category as CategoryKey] ||
                      selected.category}
                  </p>
                  <h2 className="text-lg font-bold leading-snug text-green-900">
                    {selected.seller?.name || selected.title}
                  </h2>
                  <p className="mt-0.5 text-sm text-stone-600">{selected.title}</p>
                </div>
                <button
                  type="button"
                  onClick={closeSheet}
                  className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                  aria-label="Хаах"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-1.5 text-sm text-stone-700">
                <p>
                  <span className="font-medium text-stone-500">Байршил: </span>
                  {selected.pickupDistrict}
                  {selected.pickupAddress
                    ? ` · ${selected.pickupAddress}`
                    : ""}
                </p>
                {phone && (
                  <p>
                    <span className="font-medium text-stone-500">Утас: </span>
                    <a
                      href={`tel:${phone}`}
                      className="font-semibold text-green-700 underline-offset-2 hover:underline"
                    >
                      {selected.seller.phone}
                    </a>
                  </p>
                )}
                <p>
                  <span className="font-medium text-stone-500">Үнэ: </span>
                  <span className="font-bold text-green-800">
                    {formatMNT(selected.bagPrice)}
                  </span>
                  <span className="ml-1 text-xs text-stone-400 line-through">
                    {formatMNT(selected.estimatedRetailValue)}
                  </span>
                </p>
                <p>
                  <span className="font-medium text-stone-500">Авах цонх: </span>
                  {formatPickupWindow(selected.pickupStart, selected.pickupEnd)}
                </p>
                <p className="text-xs text-stone-500">
                  Үлдсэн уут: {remaining}
                </p>
              </div>

              {reserveMsg && (
                <p
                  className={`mt-3 rounded-xl px-3 py-2 text-sm ${
                    reserveMsg.includes("амжилттай")
                      ? "bg-green-50 text-green-800"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {reserveMsg}
                </p>
              )}

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Link
                  href={`/listings/${selected.id}`}
                  className="btn-secondary flex-1 !py-2.5 text-center text-sm"
                >
                  Дэлгэрэнгүй
                </Link>
                {session?.role === "BUYER" ? (
                  <button
                    type="button"
                    disabled={reserving || remaining <= 0}
                    onClick={reserveSelected}
                    className="btn-primary flex-1 !py-2.5 text-sm disabled:opacity-50"
                  >
                    {reserving ? "…" : remaining <= 0 ? "Дууссан" : "Захиалах"}
                  </button>
                ) : session?.role === "SELLER" ? (
                  <Link
                    href={`/listings/${selected.id}`}
                    className="btn-primary flex-1 !py-2.5 text-center text-sm"
                  >
                    Харах
                  </Link>
                ) : (
                  <Link
                    href={`/signup?next=/map`}
                    className="btn-primary flex-1 !py-2.5 text-center text-sm"
                  >
                    Бүртгүүлээд захиалах
                  </Link>
                )}
              </div>
              {!session && (
                <p className="mt-2 text-center text-[11px] text-stone-400">
                  Зочин үзэж болно · захиалахын тулд{" "}
                  <Link href="/login" className="text-green-700 underline">
                    нэвтэрнэ үү
                  </Link>
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
