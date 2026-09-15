export const CATEGORIES = {
  FOOD: "хүнс",
  RESTAURANT_SURPLUS: "рестораны илүүдэл",
  OTHER: "бусад",
} as const;

export type CategoryKey = keyof typeof CATEGORIES;

export const CATEGORY_KEYS = Object.keys(CATEGORIES) as CategoryKey[];

export const STATUSES = {
  ACTIVE: "Идэвхтэй",
  SOLD: "Зарагдсан",
  EXPIRED: "Хугацаа дууссан",
  HIDDEN: "Нуугдсан",
} as const;

export type StatusKey = keyof typeof STATUSES;

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

/** Calendar days until expiry (negative if past). */
export function daysUntilExpiry(date: Date | string): number {
  const d = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function expiryLabel(date: Date | string): string {
  const days = daysUntilExpiry(date);
  if (days < 0) return "Хугацаа дууссан";
  if (days === 0) return "Өнөөдөр дуусна";
  if (days === 1) return "Маргааш дуусна";
  if (days <= 3) return `${days} хоногийн дотор`;
  return formatDate(date);
}
