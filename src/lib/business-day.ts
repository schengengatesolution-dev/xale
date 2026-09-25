/**
 * Seller-facing payout copy (Mongolian). Never mentions platform fee %.
 * Staging: QPay merchant receives full amount → immediate 90% payout intent to seller bank.
 * True split-at-QPay needs multi-merchant later.
 */
export const SELLER_PAYOUT_ONELINER =
  "Төлбөр баталгаажсан даруй таны данс руу шилжүүлнэ";

/** Settlement statuses: READY = instant payout intent on webhook PAID. */
export const SETTLEMENT_STATUS = {
  READY: "READY",
  PROCESSING: "PROCESSING",
  PAID_OUT: "PAID_OUT",
  HELD: "HELD",
} as const;
