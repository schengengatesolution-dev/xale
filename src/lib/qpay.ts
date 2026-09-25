/**
 * QPay V2 client (staging/prod via env).
 * Secrets never logged. Real invoice creation gated by QPAY_CHECKOUT_ENABLED.
 */

import QRCode from "qrcode";

type TokenCache = { accessToken: string; expiresAt: number };

let tokenCache: TokenCache | null = null;

export function isCheckoutEnabled(): boolean {
  const v = (process.env.QPAY_CHECKOUT_ENABLED || "").toLowerCase().trim();
  return v === "true" || v === "1" || v === "yes";
}

export function isQpayLive(): boolean {
  const v = (process.env.QPAY_LIVE || "").toLowerCase().trim();
  return v === "true" || v === "1" || v === "yes";
}

export function getPlatformFeeBps(): number {
  const n = Number(process.env.PLATFORM_FEE_BPS || "1000");
  if (!Number.isFinite(n) || n < 0 || n > 10000) return 1000;
  return Math.floor(n);
}

/** Split bag price: platform fee + seller amount. Does not expose % to callers. */
export function splitAmount(amountMnt: number): {
  platformFeeMnt: number;
  sellerAmountMnt: number;
} {
  const bps = getPlatformFeeBps();
  const platformFeeMnt = Math.round((amountMnt * bps) / 10000);
  const sellerAmountMnt = amountMnt - platformFeeMnt;
  return { platformFeeMnt, sellerAmountMnt };
}

/** Callback / app base URL with production-safe fallbacks. */
export function getAppUrl(): string {
  const fromEnv = (process.env.APP_URL || "").replace(/\/$/, "").trim();
  if (fromEnv) return fromEnv;
  const vercel = (process.env.VERCEL_URL || "").replace(/\/$/, "").trim();
  if (vercel) {
    return vercel.startsWith("http") ? vercel : `https://${vercel}`;
  }
  return "https://hairan.mn";
}

function requireQpayEnv(): {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  invoiceCode: string;
} {
  const baseUrl = (process.env.QPAY_BASE_URL || "").replace(/\/$/, "");
  const clientId = process.env.QPAY_CLIENT_ID || "";
  const clientSecret = process.env.QPAY_CLIENT_SECRET || "";
  const invoiceCode = process.env.QPAY_INVOICE_CODE || "";
  if (!baseUrl || !clientId || !clientSecret || !invoiceCode) {
    throw new Error("QPAY_CONFIG_MISSING");
  }
  return { baseUrl, clientId, clientSecret, invoiceCode };
}

export async function getToken(): Promise<string> {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now + 30_000) {
    return tokenCache.accessToken;
  }

  const { baseUrl, clientId, clientSecret } = requireQpayEnv();
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(`${baseUrl}/v2/auth/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("QPay auth failed", res.status, text.slice(0, 200));
    throw new Error("QPAY_AUTH_FAILED");
  }

  const data = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
  };
  if (!data.access_token) {
    throw new Error("QPAY_AUTH_FAILED");
  }

  const ttlSec = typeof data.expires_in === "number" ? data.expires_in : 3600;
  tokenCache = {
    accessToken: data.access_token,
    expiresAt: now + ttlSec * 1000,
  };
  return data.access_token;
}

export type QpayUrlItem = {
  name?: string;
  description?: string;
  link?: string;
  logo?: string;
};

export type QpayInvoiceResult = {
  invoice_id: string;
  qr_text?: string;
  qr_image?: string;
  shortUrl?: string;
  urls?: QpayUrlItem[];
  [key: string]: unknown;
};

function pickString(
  raw: Record<string, unknown>,
  keys: string[]
): string | undefined {
  for (const key of keys) {
    const v = raw[key];
    if (typeof v === "string" && v.trim()) return v;
  }
  return undefined;
}

function pickUrls(raw: Record<string, unknown>): QpayUrlItem[] {
  for (const key of ["urls", "Urls", "deeplinks", "deep_links"]) {
    const v = raw[key];
    if (Array.isArray(v)) return v as QpayUrlItem[];
  }
  return [];
}

/**
 * Normalize QPay v2 invoice JSON into a stable shape.
 * Live keys: invoice_id, qr_text, qr_image, qPay_shortUrl, urls
 * Also accepts camelCase / alternate spellings.
 */
export function normalizeInvoicePayload(
  raw: Record<string, unknown>
): QpayInvoiceResult {
  const invoice_id =
    pickString(raw, ["invoice_id", "invoiceId", "id"]) || "";
  const qr_text = pickString(raw, ["qr_text", "qrText", "qr_data", "qrData"]);
  let qr_image = pickString(raw, ["qr_image", "qrImage", "qr_img", "qrImg"]);
  const shortUrl = pickString(raw, [
    "qPay_shortUrl",
    "qpay_shortUrl",
    "qpay_short_url",
    "short_url",
    "shortUrl",
  ]);
  const urls = pickUrls(raw);

  // Strip data-URL prefix if present so callers can re-prefix consistently
  if (qr_image?.startsWith("data:")) {
    const comma = qr_image.indexOf(",");
    if (comma >= 0) qr_image = qr_image.slice(comma + 1);
  }

  return {
    ...raw,
    invoice_id,
    qr_text,
    qr_image,
    shortUrl,
    urls,
  };
}

/** Generate PNG base64 (no data: prefix) from QR payload text. */
export async function qrImageFromText(qrText: string): Promise<string> {
  const dataUrl = await QRCode.toDataURL(qrText, {
    type: "image/png",
    margin: 1,
    width: 320,
    errorCorrectionLevel: "M",
  });
  const comma = dataUrl.indexOf(",");
  return comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
}

export async function createInvoice(params: {
  senderInvoiceNo: string;
  amount: number;
  description: string;
  callbackUrl: string;
}): Promise<QpayInvoiceResult> {
  const { baseUrl, invoiceCode } = requireQpayEnv();
  const token = await getToken();

  const res = await fetch(`${baseUrl}/v2/invoice`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      invoice_code: invoiceCode,
      sender_invoice_no: params.senderInvoiceNo,
      invoice_receiver_code: "terminal",
      invoice_description: params.description,
      amount: params.amount,
      callback_url: params.callbackUrl,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("QPay create invoice failed", res.status, text.slice(0, 300));
    throw new Error("QPAY_INVOICE_FAILED");
  }

  const raw = (await res.json()) as Record<string, unknown>;
  const data = normalizeInvoicePayload(raw);

  if (!data.invoice_id) {
    console.error("QPay invoice missing invoice_id; keys=", Object.keys(raw));
    throw new Error("QPAY_INVOICE_FAILED");
  }

  if (!data.qr_image && data.qr_text) {
    try {
      data.qr_image = await qrImageFromText(data.qr_text);
    } catch (e) {
      console.error(
        "QPay qr_image generate failed; keys=",
        Object.keys(raw),
        e instanceof Error ? e.message : e
      );
    }
  }

  if (!data.qr_image && !data.qr_text && !data.shortUrl) {
    console.error(
      "QPay invoice missing qr_image/qr_text/shortUrl; keys=",
      Object.keys(raw)
    );
  }

  return data;
}

export type QpayCheckResult = {
  count?: number;
  paid_amount?: number;
  rows?: Array<{
    payment_id?: string;
    payment_status?: string;
    payment_amount?: number;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
};

/** Verify payment for an invoice before marking PAID. */
export async function checkPayment(invoiceId: string): Promise<{
  paid: boolean;
  raw: QpayCheckResult;
}> {
  const { baseUrl } = requireQpayEnv();
  const token = await getToken();

  const res = await fetch(`${baseUrl}/v2/payment/check`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      object_type: "INVOICE",
      object_id: invoiceId,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("QPay check failed", res.status, text.slice(0, 300));
    throw new Error("QPAY_CHECK_FAILED");
  }

  const raw = (await res.json()) as QpayCheckResult;
  const rows = raw.rows || [];
  const paid =
    (typeof raw.count === "number" && raw.count > 0) ||
    rows.some((r) => {
      const s = String(r.payment_status || "").toUpperCase();
      return s === "PAID" || s === "PAYMENT_PAID" || s === "DONE";
    }) ||
    (typeof raw.paid_amount === "number" && raw.paid_amount > 0);

  return { paid, raw };
}
