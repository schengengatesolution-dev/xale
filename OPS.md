# xale — Going live checklist (xale.mn)

Одоогийн production: https://xale-app.vercel.app  
Домэйн `xale.mn` дараа нь холбоно.

## 1. Env (Vercel → Project → Settings → Environment Variables)

| Variable | Тайлбар |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string (Neon / Supabase / Vercel Postgres). Serverless-д pooled URL ашиглаж болно. |
| `AUTH_SECRET` | Урт, random JWT secret (ж: `openssl rand -base64 32`) |
| `ADMIN_PASSWORD` | Админ `/admin/login` нууц үг — хүчтэй нууц үг (бүү commit) |
| `ADMIN_EMAIL` | (заавал биш) default `admin@xale.mn` |

Production + Preview-д хоёуланд нь тохируулна. `.env*` commit хийхгүй.

## 2. Database (production DB-г бүү эвдэ)

Анхны удаа / schema өөрчлөлт:

```bash
# Local-ээс production DATABASE_URL-тай:
npx prisma db push
```

MVP-д `db push` хангалттай. Хожим `prisma migrate deploy` руу шилжиж болно.

**Seed** (demo өгөгдөл хүсвэл — production дээр болгоомжтой):

```bash
npm run seed
```

Demo нууц үг бүгдэд: `demo1234`

| Имэйл | Төрөл |
|-------|-------|
| seller@xale.mn | Худалдагч |
| cafe@xale.mn | Худалдагч |
| bakery@xale.mn | Худалдагч |
| buyer@xale.mn | Худалдан авагч |
| farm@xale.mn | Худалдан авагч |

## 3. DNS (xale.mn худалдаж авсны дараа)

1. Vercel → Project → Settings → Domains → `xale.mn` (болон `www.xale.mn`) нэмнэ.
2. Registrar дээр Vercel-ийн заасан **A / CNAME** (эсвэл nameserver) тохируулна.
3. SSL автоматаар (Vercel). DNS тархахыг хүлээнэ (минут–цаг).
4. Шалгах: `https://xale.mn`, `https://www.xale.mn` → app.

## 4. Deploy дараа шалгах

- [ ] Landing (`/`) — CTA, сүүлийн зарууд
- [ ] Бүртгүүлэх / Нэвтрэх (Монгол алдааны мессеж)
- [ ] Demo: `buyer@xale.mn` / `demo1234` → `/listings`
- [ ] Demo: `seller@xale.mn` / `demo1234` → `/seller` самбар
- [ ] Зар үүсгэх / засах / устгах
- [ ] «Сонирхож байна» + seller `/seller/interests`
- [ ] Mobile: hamburger цэс ажиллана
- [ ] Админ: `/admin/login` → `/admin` хэрэглэгчдийн жагсаалт (ADMIN_PASSWORD)
- [ ] `npm run build` CI/Vercel дээр ногоон
- [ ] `/payment-terms` — төсөл баннер, шимтгэлгүй

## 5. Тэмдэглэл

- Төлбөр / хүргэлт — одоогоор байхгүй (утас/WhatsApp). Төсөл: `/payment-terms`.
- Зураг — Vercel Blob upload (`BLOB_READ_WRITE_TOKEN`, @vercel/blob). Seller form → `/api/uploads` → `Listing.photoUrl`.
- Production DB-д seed дахин ажиллуулахад demo хэрэглэгч/зар давхардаж болно — зөвхөн шаардлагатай үед.


## QPay staging (Hairan)

Env (Vercel + local `.env.local`, never commit secrets):

| Variable | Notes |
|----------|-------|
| `QPAY_BASE_URL` | prod merchant host for staging credentials |
| `QPAY_CLIENT_ID` / `QPAY_CLIENT_SECRET` | Basic auth — do not log |
| `QPAY_INVOICE_CODE` | invoice template code |
| `QPAY_CHECKOUT_ENABLED` | gate real invoice create; Mongolian 503 if false |
| `QPAY_LIVE` | **must stay `false`** until Hairan ААН + live cutover |
| `PLATFORM_FEE_BPS` | `1000` = 10% (admin/settlement only; never public UI) |
| `APP_URL` | callback base `${APP_URL}/api/payments/qpay/callback` |

Money flow (staging):

1. Buyer pays full bagPrice via QPay → funds land on **SGS/merchant** account.
2. Webhook + `POST /v2/payment/check` verify → Payment PAID + Reservation PAID + Settlement **READY** (same moment).
3. Seller amount = 90%, platform = 10% recorded on Settlement. Admin marks PROCESSING → PAID_OUT after bank transfer.
4. True split-at-QPay (multi-merchant) is later; staging = merchant receive then immediate 90% payout intent.

**Float prerequisite (OPS only):** Instant seller payout requires sufficient merchant/float balance to cover seller 90% before/while QPay settlement clears. Do not turn `QPAY_LIVE=true` until Hairan ААН KYC + float ops are ready.

Qty: still decremented on reserve (demo continuity); `paymentStatus` tracks UNPAID→PENDING→PAID. Sellers should treat unpaid cautiously.

Seller-facing copy (exact): «Төлбөр баталгаажсан даруй таны данс руу шилжүүлнэ» — never promise seconds; never show % on buyer/public UI.


## Phone OTP / SMS

| Variable | Notes |
|----------|-------|
| `SMS_PROVIDER` | `console` (log code) or `http` (POST to gateway) |
| `SMS_HTTP_URL` | Required when provider=http |
| `SMS_HTTP_TOKEN` | Optional Bearer |
| `SMS_HTTP_API_KEY` | Optional X-Api-Key |
| `SMS_FROM` | Optional sender id |

SMS body must stay exactly: `Hairan Kod: XXXXXX`. Do not commit live Mobicom keys.
