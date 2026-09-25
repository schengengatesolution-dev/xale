/**
 * Seller payout SLA (Asia/Ulaanbaatar).
 * Weekly batch: Thursday 23:59:59 cutoff → Friday payout run → seller bank.
 * Sales after Thu midnight belong in the NEXT Friday payout batch.
 * Never mention platform fee % in seller/public copy.
 */

export const UB_TZ = "Asia/Ulaanbaatar";

/** Seller-facing SLA — no %, no «төлбөр ормогц» / instant promise. */
export const SELLER_PAYOUT_ONELINER =
  "Пүрэв шөнө cutoff → Баасан гаригт таны данс";

export const SELLER_PAYOUT_DETAIL =
  "Долоо хоног бүрийн Пүрэв гаригийн 23:59:59 (Asia/Ulaanbaatar) хүртэлх баталгаажсан захиалгыг нэгтгэж, Баасан гаригт таны банкны данс руу шилжүүлнэ. Пүрэв шөнөөрөөс хойшхи борлуулалт дараагийн Баасан багцад орно.";

/** Settlement statuses: READY = awaiting weekly Thu-cutoff / Fri-payout batch. */
export const SETTLEMENT_STATUS = {
  READY: "READY",
  PROCESSING: "PROCESSING",
  PAID_OUT: "PAID_OUT",
  HELD: "HELD",
} as const;

export type SettlementStatus =
  (typeof SETTLEMENT_STATUS)[keyof typeof SETTLEMENT_STATUS];

export const PAYOUT_BATCH_STATUS = {
  OPEN: "OPEN",
  EXPORTED: "EXPORTED",
  PAID: "PAID",
} as const;

/** Parts of a calendar day in Asia/Ulaanbaatar. */
export function ubParts(date: Date = new Date()): {
  year: number;
  month: number; // 1–12
  day: number;
  weekday: number; // 0=Sun … 6=Sat (JS)
  hour: number;
  minute: number;
  second: number;
} {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: UB_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const map: Record<string, string> = {};
  for (const p of fmt.formatToParts(date)) {
    if (p.type !== "literal") map[p.type] = p.value;
  }
  const wdMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    weekday: wdMap[map.weekday] ?? 0,
    hour: Number(map.hour === "24" ? "0" : map.hour),
    minute: Number(map.minute),
    second: Number(map.second),
  };
}

/**
 * Instant corresponding to UB wall-clock Y-M-D H:M:S.ms
 * (UB is always UTC+8, no DST).
 */
export function ubWallToUtc(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
  ms = 0
): Date {
  const pad = (n: number, w = 2) => String(n).padStart(w, "0");
  const iso = `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:${pad(second)}.${String(ms).padStart(3, "0")}+08:00`;
  return new Date(iso);
}

/**
 * End of the most recent Thursday in Asia/Ulaanbaatar (23:59:59.999).
 * If `ref` falls on Thursday, that Thursday is the cutoff day.
 * Friday payout run uses this cutoff; sales after it join the next Friday batch.
 */
export function getLastThursdayCutoff(ref: Date = new Date()): Date {
  const p = ubParts(ref);
  // days since Thursday: Thu=0, Fri=1, … Wed=6
  const daysSinceThursday = (p.weekday - 4 + 7) % 7;
  const cutoffDay = ubWallToUtc(p.year, p.month, p.day, 0, 0, 0, 0);
  cutoffDay.setUTCDate(cutoffDay.getUTCDate() - daysSinceThursday);
  const c = ubParts(cutoffDay);
  return ubWallToUtc(c.year, c.month, c.day, 23, 59, 59, 999);
}

/** @deprecated Use getLastThursdayCutoff — kept for any stray imports. */
export const getLastFridayCutoff = getLastThursdayCutoff;

/** Human label for cutoff in mn-MN / UB. */
export function formatCutoffMn(cutoff: Date): string {
  return cutoff.toLocaleString("mn-MN", {
    timeZone: UB_TZ,
    year: "numeric",
    month: "short",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Short batch id from cutoff date, e.g. 2026-W39-THU.
 * Suffix is cutoff weekday; payout run day remains Friday.
 */
export function batchLabelFromCutoff(cutoff: Date): string {
  const p = ubParts(cutoff);
  const jan4 = ubWallToUtc(p.year, 1, 4);
  const dayOfYear =
    Math.floor(
      (ubWallToUtc(p.year, p.month, p.day).getTime() -
        ubWallToUtc(p.year, 1, 1).getTime()) /
        86400000
    ) + 1;
  const week = Math.min(53, Math.ceil((dayOfYear + ((ubParts(jan4).weekday + 6) % 7)) / 7));
  return `${p.year}-W${String(week).padStart(2, "0")}-THU`;
}
