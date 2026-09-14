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
