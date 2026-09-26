"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { coordsForListing, UB_CENTER } from "@/lib/geo";
import {
  formatMNT,
  formatPickupWindow,
  type CategoryKey,
} from "@/lib/constants";
import type { MapListing } from "./types";
import { PayCheckout } from "@/components/PayCheckout";
import { useT } from "@/lib/i18n";

function MapLoading() {
  const t = useT();
  return (
    <div className="flex h-full w-full items-center justify-center bg-cream-100 text-sm text-stone-500">
      {t("map.loadingMap")}
    </div>
  );
}

const BagMap = dynamic(
  () => import("./BagMap").then((m) => m.BagMap),
  {
    ssr: false,
    loading: () => <MapLoading />,
  }
);

type SessionInfo = {
  id: string;
  role: string;
  name: string;
} | null;

type Props = {
  initialSession: SessionInfo;
  checkoutEnabled?: boolean;
};

export function MapDiscovery({ initialSession, checkoutEnabled = false }: Props) {
  const t = useT();
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
  const [reserveOk, setReserveOk] = useState(false);
  const [payReservationId, setPayReservationId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState<number | undefined>();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/listings?status=ACTIVE");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || t("map.errorGeneric"));
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
              photoUrl: l.photoUrl ?? null,
              lat: c.lat,
              lng: c.lng,
              seller: l.seller,
              _count: l._count,
            };
          }
        );
        if (!cancelled) setListings(mapped);
      } catch {
        if (!cancelled) setError(t("map.loadError"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setUserPos({ lat: UB_CENTER.lat, lng: UB_CENTER.lng });
      setGeoNote(t("map.geoUnavailable"));
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
        setGeoNote(t("map.geoDenied"));
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = useMemo(
    () => listings.find((l) => l.id === selectedId) ?? null,
    [listings, selectedId]
  );

  const closeSheet = useCallback(() => {
    setSelectedId(null);
    setReserveMsg(null);
    setReserveOk(false);
    setPayReservationId(null);
  }, []);

  async function reserveSelected() {
    if (!selected || !session || session.role !== "BUYER") return;
    setReserving(true);
    setReserveMsg(null);
    setReserveOk(false);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: selected.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setReserveMsg(data.error || t("map.reserveError"));
        return;
      }
      const rid = data.reservation?.id as string | undefined;
      if (checkoutEnabled && rid) {
        setPayReservationId(rid);
        setPayAmount(data.reservation?.listing?.bagPrice ?? selected.bagPrice);
        setReserveMsg(t("map.reserveOkPay"));
        setReserveOk(true);
      } else {
        setReserveMsg(t("map.reserveOk"));
        setReserveOk(true);
      }
    } catch {
      setReserveMsg(t("map.networkError"));
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

  const catRaw = selected
    ? t(`categories.${selected.category as CategoryKey}`)
    : "";
  const catLabel =
    selected && catRaw === `categories.${selected.category}`
      ? selected.category
      : catRaw;

  return (
    <div className="fixed inset-x-0 top-14 bottom-[3.75rem] z-30 w-full overflow-hidden bg-cream-100 md:bottom-0 md:top-[3.75rem]">
      <div className="absolute inset-0 pb-[env(safe-area-inset-bottom)] md:pb-0">
        {!loading && !error && (
          <BagMap
            listings={listings}
            userPos={userPos}
            selectedId={selectedId}
            onSelect={(id) => {
              setSelectedId(id);
              setReserveMsg(null);
              setReserveOk(false);
              setPayReservationId(null);
            }}
          />
        )}
        {loading && (
          <div className="flex h-full items-center justify-center text-sm text-stone-500">
            {t("map.loading")}
          </div>
        )}
        {error && (
          <div className="flex h-full items-center justify-center text-sm text-red-600">
            {error}
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute left-0 right-0 top-0 z-[500] flex items-start justify-between gap-2 p-3">
        <div className="pointer-events-auto rounded-2xl border border-stone-200/80 bg-white/95 px-3 py-2 shadow-md backdrop-blur">
          <p className="text-xs font-bold text-green-800">{t("map.chipTitle")}</p>
          <p className="text-[11px] text-stone-500">
            {t("map.bagCount", { n: listings.length })} ·{" "}
            {geoNote || (userPos ? t("map.yourLocation") : "…")}
          </p>
        </div>
        <Link
          href="/listings"
          className="pointer-events-auto rounded-full border border-stone-200 bg-white/95 px-3 py-2 text-xs font-semibold text-stone-700 shadow-md backdrop-blur hover:bg-white"
        >
          {t("map.list")}
        </Link>
      </div>

      {selected && (
        <>
          <button
            type="button"
            aria-label={t("map.close")}
            className="absolute inset-0 z-[600] bg-black/20"
            onClick={closeSheet}
          />
          <div className="absolute bottom-0 left-0 right-0 z-[700] mx-auto max-w-lg px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:pb-4">
            <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-2xl">
              {selected.photoUrl ? (
                <div className="mb-3 overflow-hidden rounded-xl bg-stone-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selected.photoUrl}
                    alt={selected.title}
                    className="aspect-[16/9] w-full object-cover"
                  />
                </div>
              ) : null}
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                    {catLabel}
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
                  aria-label={t("map.close")}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-1.5 text-sm text-stone-700">
                <p>
                  <span className="font-medium text-stone-500">
                    {t("map.location")}{" "}
                  </span>
                  {selected.pickupDistrict}
                  {selected.pickupAddress
                    ? ` · ${selected.pickupAddress}`
                    : ""}
                </p>
                {phone && (
                  <p>
                    <span className="font-medium text-stone-500">
                      {t("map.phone")}{" "}
                    </span>
                    <a
                      href={`tel:${phone}`}
                      className="font-semibold text-green-700 underline-offset-2 hover:underline"
                    >
                      {selected.seller.phone}
                    </a>
                  </p>
                )}
                <p>
                  <span className="font-medium text-stone-500">
                    {t("map.price")}{" "}
                  </span>
                  <span className="font-bold text-green-800">
                    {formatMNT(selected.bagPrice)}
                  </span>
                  <span className="ml-1 text-xs text-stone-400 line-through">
                    {formatMNT(selected.estimatedRetailValue)}
                  </span>
                </p>
                <p>
                  <span className="font-medium text-stone-500">
                    {t("map.pickupWindow")}{" "}
                  </span>
                  {formatPickupWindow(selected.pickupStart, selected.pickupEnd)}
                </p>
                <p className="text-xs text-stone-500">
                  {t("map.remaining", { n: remaining })}
                </p>
              </div>

              {reserveMsg && (
                <p
                  className={`mt-3 rounded-xl px-3 py-2 text-sm ${
                    reserveOk
                      ? "bg-green-50 text-green-800"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {reserveMsg}
                </p>
              )}

              {checkoutEnabled && payReservationId && (
                <PayCheckout
                  reservationId={payReservationId}
                  amountMnt={payAmount}
                  checkoutEnabled
                  autoStart
                />
              )}

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Link
                  href={`/listings/${selected.id}`}
                  className="btn-secondary flex-1 !py-2.5 text-center text-sm"
                >
                  {t("map.details")}
                </Link>
                {session?.role === "BUYER" ? (
                  <button
                    type="button"
                    disabled={reserving || remaining <= 0}
                    onClick={reserveSelected}
                    className="btn-primary flex-1 !py-2.5 text-sm disabled:opacity-50"
                  >
                    {reserving
                      ? "…"
                      : remaining <= 0
                        ? t("map.soldOut")
                        : t("map.reserve")}
                  </button>
                ) : session?.role === "SELLER" ? (
                  <Link
                    href={`/listings/${selected.id}`}
                    className="btn-primary flex-1 !py-2.5 text-center text-sm"
                  >
                    {t("map.view")}
                  </Link>
                ) : (
                  <Link
                    href={`/signup?next=/map`}
                    className="btn-primary flex-1 !py-2.5 text-center text-sm"
                  >
                    {t("map.signupToOrder")}
                  </Link>
                )}
              </div>
              {!session && (
                <p className="mt-2 text-center text-[11px] text-stone-400">
                  {t("map.guestNote")}{" "}
                  <Link href="/login" className="text-green-700 underline">
                    {t("map.loginLink")}
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
