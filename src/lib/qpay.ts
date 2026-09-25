/**
 * QPay V2 client (staging/prod via env).
 * Secrets never logged. Real invoice creation gated by QPAY_CHECKOUT_ENABLED.
 */

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

export type QpayInvoiceResult = {
  invoice_id: string;
  qr_text?: string;
  qr_image?: string;
  urls?: Array<{ name?: string; description?: string; link?: string; logo?: string }>;
  [key: string]: unknown;
};

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

  const data = (await res.json()) as QpayInvoiceResult;
  if (!data.invoice_id) {
    throw new Error("QPAY_INVOICE_FAILED");
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
