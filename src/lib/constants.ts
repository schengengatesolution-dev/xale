export const CATEGORIES = {
  BAKERY: "Талх / нарийн боов",
  RESTAURANT: "Ресторан",
  HOTEL: "Зочид буудал",
  GROCERY: "Хүнсний дэлгүүр",
  CAFE: "Кафе",
  OTHER: "Бусад",
} as const;

export type CategoryKey = keyof typeof CATEGORIES;

export const CATEGORY_KEYS = Object.keys(CATEGORIES) as CategoryKey[];

export const STATUSES = {
  ACTIVE: "Идэвхтэй",
  SOLD_OUT: "Дууссан",
  EXPIRED: "Хугацаа дууссан",
  HIDDEN: "Нуугдсан",
} as const;

export type StatusKey = keyof typeof STATUSES;

export const RESERVATION_STATUSES = {
  RESERVED: "Захиалсан",
  COLLECTED: "Авсан",
  NO_SHOW: "Ирээгүй",
  CANCELLED: "Цуцлагдсан",
} as const;

export type ReservationStatusKey = keyof typeof RESERVATION_STATUSES;

export const ROLES = {
  SELLER: "Худалдагч",
  BUYER: "Худалдан авагч",
} as const;

export type RoleKey = keyof typeof ROLES;

export const UB_DISTRICTS = [
  "Баянзүрх",
  "Баянгол",
  "Сүхбаатар",
  "Чингэлтэй",
  "Хан-Уул",
  "Сонгинохайрхан",
  "Багануур",
  "Багахангай",
  "Налайх",
] as const;

export function formatMNT(amount: number): string {
  return new Intl.NumberFormat("mn-MN").format(amount) + "₮";
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("mn-MN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatPickupWindow(
  start: Date | string,
  end: Date | string
): string {
  const s = typeof start === "string" ? new Date(start) : start;
  const e = typeof end === "string" ? new Date(end) : end;
  const sameDay =
    s.toDateString() === e.toDateString();
  if (sameDay) {
    return `${formatDate(s)} · ${formatTime(s)}–${formatTime(e)}`;
  }
  return `${formatDate(s)} ${formatTime(s)} – ${formatDate(e)} ${formatTime(e)}`;
}

/** Calendar days until date (negative if past). */
export function daysUntil(date: Date | string): number {
  const d = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  return Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
}

export function pickupUrgencyLabel(end: Date | string): string {
  const days = daysUntil(end);
  if (days < 0) return "Цонх дууссан";
  if (days === 0) return "Өнөөдөр авах";
  if (days === 1) return "Маргааш авах";
  if (days <= 3) return `${days} хоногийн дотор`;
  return formatDate(end);
}

export function savingsPercent(bagPrice: number, retail: number): number {
  if (retail <= 0) return 0;
  return Math.round((1 - bagPrice / retail) * 100);
}

/** datetime-local value from Date */
export function toLocalInputValue(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
