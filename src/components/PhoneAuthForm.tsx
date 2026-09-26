"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";

type Step = "phone" | "code" | "role";
type Purpose = "login" | "register";
type Role = "BUYER" | "SELLER";

type Props = {
  purpose: Purpose;
  /** Link to the other auth page */
  altHref: string;
  altLabel: string;
};

export default function PhoneAuthForm({ purpose, altHref, altLabel }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [normalizedPhone, setNormalizedPhone] = useState("");
  const [code, setCode] = useState("");
  const [role, setRole] = useState<Role>("BUYER");
  const [name, setName] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [userExists, setUserExists] = useState(false);
  const [showEmailFallback, setShowEmailFallback] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const redirectAfterAuth = useCallback(
    (userRole: string) => {
      router.push(userRole === "SELLER" ? "/seller" : "/map");
      router.refresh();
    },
    [router]
  );

  async function sendCode(e?: FormEvent) {
    e?.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, purpose }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Код илгээхэд алдаа гарлаа");
        if (data.retryAfterSeconds) setCooldown(data.retryAfterSeconds);
        return;
      }
      setNormalizedPhone(data.phone || phone);
      setUserExists(Boolean(data.exists));
      setCooldown(data.cooldownSeconds ?? 60);
      setStep("code");
      setCode("");
    } catch {
      setError("Сүлжээний алдаа. Дахин оролдоно уу.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        phone: normalizedPhone || phone,
        code,
        purpose,
      };
      if (step === "role") {
        payload.role = role;
        if (name.trim()) payload.name = name.trim();
        if (role === "SELLER") {
          payload.bankName = bankName;
          payload.bankAccount = bankAccount;
          payload.bankAccountName = bankAccountName;
        }
      }
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Баталгаажуулахад алдаа гарлаа");
        return;
      }
      if (data.needsRole) {
        setStep("role");
        setUserExists(false);
        return;
      }
      if (data.user) {
        redirectAfterAuth(data.user.role);
      }
    } catch {
      setError("Сүлжээний алдаа. Дахин оролдоно уу.");
    } finally {
      setLoading(false);
    }
  }

  async function onEmailSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      if (purpose === "login") {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: fd.get("email"),
            password: fd.get("password"),
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error || "Нэвтрэхэд алдаа гарлаа");
          return;
        }
        redirectAfterAuth(data.user.role);
      } else {
        const password = String(fd.get("password") || "");
        const passwordConfirm = String(fd.get("passwordConfirm") || "");
        if (password !== passwordConfirm) {
          setError("Нууц үг таарахгүй байна. Дахин оруулна уу.");
          return;
        }
        const emailRole = (fd.get("emailRole") as Role) || "BUYER";
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: fd.get("email"),
            password,
            passwordConfirm,
            name: fd.get("name"),
            phone: fd.get("fallbackPhone") || undefined,
            role: emailRole,
            ...(emailRole === "SELLER"
              ? {
                  bankName: fd.get("bankName") || undefined,
                  bankAccount: fd.get("bankAccount") || undefined,
                  bankAccountName: fd.get("bankAccountName") || undefined,
                }
              : {}),
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error || "Бүртгүүлэхэд алдаа гарлаа");
          return;
        }
        redirectAfterAuth(data.user.role);
      }
    } catch {
      setError("Сүлжээний алдаа. Дахин оролдоно уу.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {step === "phone" && (
        <form onSubmit={sendCode} className="card space-y-4">
          {error && <div className="alert-error">{error}</div>}
          <div>
            <label className="label" htmlFor="phone">
              Утасны дугаар
            </label>
            <input
              id="phone"
              name="phone"
              className="input"
              placeholder="99112233"
              inputMode="tel"
              autoComplete="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <p className="mt-1.5 text-xs text-stone-500">
              +976 + 8 орон. SMS: «Hairan Kod: ……»
            </p>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Түр хүлээнэ үү..." : "Код авах"}
          </button>
        </form>
      )}

      {step === "code" && (
        <form onSubmit={verifyCode} className="card space-y-4">
          {error && <div className="alert-error">{error}</div>}
          <p className="text-sm text-stone-600">
            <span className="font-medium text-stone-800">
              {normalizedPhone || phone}
            </span>{" "}
            дугаарт код илгээлээ.
          </p>
          <div>
            <label className="label" htmlFor="code">
              6 оронтой код
            </label>
            <input
              id="code"
              name="code"
              className="input text-center text-2xl tracking-[0.4em] font-semibold"
              placeholder="••••••"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            />
            <p className="mt-1.5 text-xs text-stone-500">
              Мессеж: Hairan Kod: XXXXXX
            </p>
          </div>
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="btn-primary w-full"
          >
            {loading ? "Түр хүлээнэ үү..." : "Баталгаажуулах"}
          </button>
          <div className="flex items-center justify-between gap-2 text-sm">
            <button
              type="button"
              className="text-stone-500 hover:text-stone-800"
              onClick={() => {
                setStep("phone");
                setError("");
                setCode("");
              }}
            >
              ← Утас солих
            </button>
            <button
              type="button"
              disabled={loading || cooldown > 0}
              onClick={() => sendCode()}
              className={`font-semibold ${
                cooldown > 0
                  ? "text-stone-400 cursor-not-allowed"
                  : "text-green-700 hover:underline"
              }`}
            >
              {cooldown > 0 ? `Дахин илгээх (${cooldown}с)` : "Дахин илгээх"}
            </button>
          </div>
          {userExists && (
            <p className="text-xs text-stone-500">
              Энэ утас бүртгэлтэй — нэвтэрнэ.
            </p>
          )}
        </form>
      )}

      {step === "role" && (
        <form onSubmit={verifyCode} className="card space-y-4">
          {error && <div className="alert-error">{error}</div>}
          <p className="text-sm text-stone-600">
            Код зөв. Таны төрлийг сонгоно уу.
          </p>
          <div>
            <span className="label">Төрөл</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole("BUYER")}
                className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                  role === "BUYER"
                    ? "border-green-600 bg-green-50 text-green-800 ring-2 ring-green-600/20"
                    : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                }`}
              >
                Худалдан авагч
              </button>
              <button
                type="button"
                onClick={() => setRole("SELLER")}
                className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                  role === "SELLER"
                    ? "border-green-600 bg-green-50 text-green-800 ring-2 ring-green-600/20"
                    : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                }`}
              >
                Худалдагч
              </button>
            </div>
            <p className="mt-2 text-xs text-stone-500">
              {role === "SELLER"
                ? "Азтай уут нийтэлнэ. Банкны мэдээлэл заавал — долоо хоног бүр данс руу шилжүүлнэ."
                : "Зарууд үзэж, захиална."}
            </p>
          </div>
          <div>
            <label className="label" htmlFor="otpName">
              Нэр / Байгууллагын нэр
            </label>
            <input
              id="otpName"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              placeholder={role === "SELLER" ? "Дэлгүүрийн нэр" : "Таны нэр"}
            />
          </div>
          {role === "SELLER" && (
            <>
              <div>
                <label className="label" htmlFor="otpBankName">
                  Банкны нэр *
                </label>
                <input
                  id="otpBankName"
                  required
                  className="input"
                  placeholder="Жишээ: Хаан банк"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                />
              </div>
              <div>
                <label className="label" htmlFor="otpBankAccount">
                  Дансны дугаар *
                </label>
                <input
                  id="otpBankAccount"
                  required
                  className="input"
                  inputMode="numeric"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                />
              </div>
              <div>
                <label className="label" htmlFor="otpBankAccountName">
                  Данс эзэмшигчийн нэр *
                </label>
                <input
                  id="otpBankAccountName"
                  required
                  className="input"
                  value={bankAccountName}
                  onChange={(e) => setBankAccountName(e.target.value)}
                />
              </div>
              <p className="text-xs text-stone-500">
                Пүрэв шөнө cutoff → Баасан гаригт таны данс
              </p>
            </>
          )}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Түр хүлээнэ үү..." : "Бүртгэл үүсгэх"}
          </button>
        </form>
      )}

      <p className="text-center text-sm text-stone-600">
        {purpose === "login" ? "Бүртгэлгүй юу?" : "Аль хэдийн бүртгэлтэй юу?"}{" "}
        <Link href={altHref} className="font-semibold text-green-700 hover:underline">
          {altLabel}
        </Link>
      </p>

      <div className="border-t border-stone-200 pt-4">
        <button
          type="button"
          onClick={() => {
            setShowEmailFallback((v) => !v);
            setError("");
          }}
          className="w-full text-center text-xs font-medium text-stone-500 hover:text-stone-800"
        >
          {showEmailFallback
            ? "Утасны кодоор буцах ▲"
            : "Имэйл + нууц үг (хуучин арга) ▼"}
        </button>

        {showEmailFallback && purpose === "login" && (
          <form onSubmit={onEmailSubmit} className="mt-4 space-y-3">
            {error && <div className="alert-error">{error}</div>}
            <div>
              <label className="label" htmlFor="email">
                Имэйл
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="input"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="label" htmlFor="password">
                Нууц үг
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="input"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-secondary w-full">
              {loading ? "Түр хүлээнэ үү..." : "Имэйлээр нэвтрэх"}
            </button>
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs text-stone-600">
              <p className="font-semibold text-stone-800">
                Demo (нууц үг: demo1234)
              </p>
              <ul className="mt-1 space-y-0.5">
                <li>
                  <code className="rounded bg-white px-1">seller@hairan.mn</code> —
                  худалдагч
                </li>
                <li>
                  <code className="rounded bg-white px-1">buyer@hairan.mn</code> —
                  худалдан авагч
                </li>
              </ul>
            </div>
          </form>
        )}

        {showEmailFallback && purpose === "register" && (
          <EmailSignupFallback
            loading={loading}
            error={error}
            onSubmit={onEmailSubmit}
          />
        )}
      </div>
    </div>
  );
}

function EmailSignupFallback({
  loading,
  error,
  onSubmit,
}: {
  loading: boolean;
  error: string;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}) {
  const [role, setRole] = useState<Role>("BUYER");
  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-3">
      {error && <div className="alert-error">{error}</div>}
      <input type="hidden" name="emailRole" value={role} />
      <div>
        <span className="label">Төрөл</span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setRole("BUYER")}
            className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
              role === "BUYER"
                ? "border-green-600 bg-green-50 text-green-800"
                : "border-stone-200"
            }`}
          >
            Худалдан авагч
          </button>
          <button
            type="button"
            onClick={() => setRole("SELLER")}
            className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
              role === "SELLER"
                ? "border-green-600 bg-green-50 text-green-800"
                : "border-stone-200"
            }`}
          >
            Худалдагч
          </button>
        </div>
      </div>
      <div>
        <label className="label" htmlFor="fbName">
          Нэр
        </label>
        <input id="fbName" name="name" required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="fbEmail">
          Имэйл
        </label>
        <input id="fbEmail" name="email" type="email" required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="fbPassword">
          Нууц үг
        </label>
        <input
          id="fbPassword"
          name="password"
          type="password"
          required
          minLength={6}
          className="input"
        />
      </div>
      <div>
        <label className="label" htmlFor="fbPasswordConfirm">
          Нууц үг давтах
        </label>
        <input
          id="fbPasswordConfirm"
          name="passwordConfirm"
          type="password"
          required
          minLength={6}
          className="input"
        />
      </div>
      <div>
        <label className="label" htmlFor="fallbackPhone">
          Утас
        </label>
        <input
          id="fallbackPhone"
          name="fallbackPhone"
          className="input"
          placeholder="99112233"
          inputMode="tel"
        />
      </div>
      {role === "SELLER" && (
        <>
          <div>
            <label className="label" htmlFor="fbBankName">
              Банкны нэр *
            </label>
            <input id="fbBankName" name="bankName" required className="input" />
          </div>
          <div>
            <label className="label" htmlFor="fbBankAccount">
              Дансны дугаар *
            </label>
            <input
              id="fbBankAccount"
              name="bankAccount"
              required
              className="input"
              inputMode="numeric"
            />
          </div>
          <div>
            <label className="label" htmlFor="fbBankAccountName">
              Данс эзэмшигчийн нэр *
            </label>
            <input
              id="fbBankAccountName"
              name="bankAccountName"
              required
              className="input"
            />
          </div>
        </>
      )}
      <button type="submit" disabled={loading} className="btn-secondary w-full">
        {loading ? "Түр хүлээнэ үү..." : "Имэйлээр бүртгүүлэх"}
      </button>
    </form>
  );
}
