# xale — STATUS

**Бүтээгдэхүүн:** xale (илүүдэл / near-expiry барааны зах зээл, Монгол)  
**Байршил:** `/workspace/xale/`  
**Огноо:** 2026-09-14

## Хийгдсэн зүйлс

- [x] Next.js 14 App Router + TypeScript + Tailwind
- [x] Prisma + **PostgreSQL** (`provider = "postgresql"`) — Vercel serverless-д бэлэн
- [x] Landing page (асуудал, 3 алхам, зорилтот бүлэг, CTA бүртгүүлэх) — бүх UI Монгол
- [x] Auth: signup/login, role Худалдагч / Худалдан авагч (JWT cookie, `AUTH_SECRET`)
- [x] Seller CRUD зарууд (ангилал: хүнс / рестораны илүүдэл / бусад)
- [x] Buyer browse/filter + detail + утас/WhatsApp + «Сонирхож байна»
- [x] Seed: 12 УБ demo зар + 5 demo хэрэглэгч (Postgres-тай ажиллана)
- [x] Mobile-responsive Tailwind UI
- [x] README + seed script (`npm run seed`)
- [x] Vercel-ready: Postgres datasource, build = `prisma generate && next build`

## Хэрхэн нээх

```bash
cd /workspace/xale
npm install
# DATABASE_URL=postgresql://...  AUTH_SECRET=...  (.env)
npx prisma db push   # эхний удаа / MVP
npm run seed
npm run dev
```

Дараа нь браузерээр **http://localhost:3000** нээнэ.

Demo нэвтрэх: `buyer@xale.mn` / `demo1234` эсвэл `seller@xale.mn` / `demo1234`

Production build шалгах:

```bash
npm run build
npm run start
```

## Vercel

Шаардлагатай env:

- `DATABASE_URL` — PostgreSQL (SQLite биш)
- `AUTH_SECRET` — JWT secret

Анхны deploy дараа: `prisma db push` (MVP), дараа нь `npm run seed` (хүсвэл).  
`vercel.json` хэрэггүй. Deploy хийгээгүй — зөвхөн код бэлтгэсэн.

## Гол URL-ууд

| Зам | Тайлбар |
|-----|---------|
| `/` | Landing |
| `/signup` | Бүртгүүлэх |
| `/login` | Нэвтрэх |
| `/listings` | Зарууд (шүүлтүүр) |
| `/listings/[id]` | Зар дэлгэрэнгүй |
| `/seller/listings` | Худалдагчийн зарууд |
| `/seller/listings/new` | Шинэ зар |
| `/seller/interests` | Ирсэн сонирхол |

## Гадуурх (out of scope)

Төлбөр, хүргэлт, Англи-first UI — хийгдээгүй (шаардлагын дагуу).
