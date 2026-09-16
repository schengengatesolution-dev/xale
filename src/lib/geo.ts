/** Ulaanbaatar map defaults + district → approximate coords */

export const UB_CENTER = { lat: 47.918, lng: 106.917 } as const;

/** Approximate district centers (UB) */
export const DISTRICT_COORDS: Record<string, { lat: number; lng: number }> = {
  Сүхбаатар: { lat: 47.9215, lng: 106.927 },
  Баянзүрх: { lat: 47.914, lng: 106.952 },
  Баянгол: { lat: 47.911, lng: 106.888 },
  Чингэлтэй: { lat: 47.926, lng: 106.905 },
  "Хан-Уул": { lat: 47.878, lng: 106.902 },
  Сонгинохайрхан: { lat: 47.908, lng: 106.82 },
  Багануур: { lat: 47.79, lng: 108.32 },
  Багахангай: { lat: 47.36, lng: 105.9 },
  Налайх: { lat: 47.77, lng: 107.26 },
};

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/** Small deterministic jitter so pins in same district don't stack */
export function jitterCoords(
  base: { lat: number; lng: number },
  seed: string,
  magnitude = 0.008
): { lat: number; lng: number } {
  const h = hashString(seed);
  const a = ((h % 1000) / 1000 - 0.5) * 2 * magnitude;
  const b = (((h / 1000) % 1000) / 1000 - 0.5) * 2 * magnitude;
  return { lat: base.lat + a, lng: base.lng + b };
}

export function coordsForListing(input: {
  id: string;
  pickupDistrict: string;
  lat?: number | null;
  lng?: number | null;
}): { lat: number; lng: number } {
  if (
    typeof input.lat === "number" &&
    typeof input.lng === "number" &&
    Number.isFinite(input.lat) &&
    Number.isFinite(input.lng)
  ) {
    return { lat: input.lat, lng: input.lng };
  }
  const base =
    DISTRICT_COORDS[input.pickupDistrict] ?? {
      lat: UB_CENTER.lat,
      lng: UB_CENTER.lng,
    };
  return jitterCoords(base, input.id);
}
