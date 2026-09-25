/**
 * SMS provider abstraction for Hairan OTP.
 *
 * SMS_PROVIDER=console  — log body (staging / local); never send real SMS
 * SMS_PROVIDER=http     — POST to SMS_HTTP_URL with optional auth headers
 *
 * Do NOT hardcode live Mobicom / carrier keys.
 *
 * Env:
 *   SMS_PROVIDER=console|http
 *   SMS_HTTP_URL=         POST endpoint when provider=http
 *   SMS_HTTP_TOKEN=       optional Bearer token
 *   SMS_HTTP_API_KEY=     optional X-Api-Key header
 *   SMS_FROM=             optional sender id / from field
 */

export type SendSmsResult = {
  ok: boolean;
  provider: string;
  error?: string;
};

/** Exact product SMS body. */
export function hairanOtpBody(code: string): string {
  return `Hairan Kod: ${code}`;
}

export async function sendSms(
  phoneE164: string,
  body: string
): Promise<SendSmsResult> {
  const provider = (process.env.SMS_PROVIDER || "console").toLowerCase();

  if (provider === "console" || provider === "log") {
    console.info(`[sms:console] to=${phoneE164} body=${body}`);
    return { ok: true, provider: "console" };
  }

  if (provider === "http") {
    const url = process.env.SMS_HTTP_URL;
    if (!url) {
      console.error("[sms:http] SMS_HTTP_URL missing");
      return { ok: false, provider: "http", error: "SMS_HTTP_URL тохируулаагүй" };
    }
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const token = process.env.SMS_HTTP_TOKEN;
    const apiKey = process.env.SMS_HTTP_API_KEY;
    if (token) headers.Authorization = `Bearer ${token}`;
    if (apiKey) headers["X-Api-Key"] = apiKey;

    const payload = {
      to: phoneE164,
      phone: phoneE164,
      text: body,
      message: body,
      from: process.env.SMS_FROM || undefined,
    };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error(`[sms:http] status=${res.status} ${text.slice(0, 200)}`);
        return {
          ok: false,
          provider: "http",
          error: `SMS илгээхэд алдаа (${res.status})`,
        };
      }
      return { ok: true, provider: "http" };
    } catch (e) {
      console.error("[sms:http]", e);
      return { ok: false, provider: "http", error: "SMS сүлжээний алдаа" };
    }
  }

  console.error(`[sms] unknown SMS_PROVIDER=${provider}`);
  return {
    ok: false,
    provider,
    error: "SMS_PROVIDER буруу (console|http)",
  };
}

export async function sendHairanOtp(
  phoneE164: string,
  code: string
): Promise<SendSmsResult> {
  return sendSms(phoneE164, hairanOtpBody(code));
}
