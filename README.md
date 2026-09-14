# xale

**xale** — Монголын илүүдэл / хугацаа дуусах дөхсөн барааны зах зээлийн MVP.

Худалдагч (дэлгүүр, ресторан) → худалдан авагч (иргэд, ферм, бөөний) холбодог.

UI бүрэн **Монгол** (Кирилл).

## Стек

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Prisma + PostgreSQL (Vercel / production)
- JWT cookie session (jose + bcryptjs)

## Суулгах (local)

Postgres шаардлагатай (`DATABASE_URL`).

```bash
cd xale
npm install
npx prisma db push
npm run seed
```

MVP-д schema sync-д `prisma db push` хангалттай. Production-д later `prisma migrate deploy` ашиглаж болно.

## Ажиллуулах

```bash
npm run dev
```

Браузерээр: [http://localhost:3000](http://localhost:3000)

## Бусад командууд

| Команд | Тайлбар |
|--------|---------|
| `npm run dev` | Development сервер |
| `npm run build` | Production build (`prisma generate && next build`) |
| `npm run start` | Production сервер |
| `npm run seed` | Demo өгөгдөл оруулах |

## Demo бүртгэлүүд

Нууц үг бүгдэд: **`demo1234`**

| Имэйл | Төрөл | Нэр |
|-------|-------|-----|
| `seller@xale.mn` | Худалдагч | Номин дэлгүүр |
| `cafe@xale.mn` | Худалдагч | Улаанбаатар кафе |
| `bakery@xale.mn` | Худалдагч | Талхны дэлгүүр |
| `buyer@xale.mn` | Худалдан авагч | Батбаяр |
| `farm@xale.mn` | Худалдан авагч | Гахайн ферм ХХК |

## Онцлог

1. **Landing** — асуудал, 3 алхам, зорилтот хэрэглэгчид, CTA бүртгүүлэх
2. **Auth** — имэйл/нууц үг, Худалдагч эсвэл Худалдан авагч
3. **Худалдагч** — зар CRUD (гарчиг, ангилал, үнэ, тоо, дуусах огноо, дүүрэг, зураг URL, төлөв)
4. **Худалдан авагч** — шүүх/харах, утас/WhatsApp, «Сонирхож байна»
5. **Seed** — 12 УБ demo зар

## Орчны хувьсагч

`.env` (local) жишээ:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require"
AUTH_SECRET="change-me-to-a-long-random-string"
```

### Vercel deploy

SQLite Vercel serverless дээр ажиллахгүй — **PostgreSQL** ашиглана (Neon, Supabase, Vercel Postgres гэх мэт).

Vercel Environment Variables:

| Variable | Тайлбар |
|----------|---------|
| `DATABASE_URL` | Postgres connection string (pooled URL OK for serverless) |
| `AUTH_SECRET` | JWT signing secret (урт, random) |

Анхны deploy-ийн дараа:

1. Schema sync: `npx prisma db push` (MVP) — эсвэл later `npx prisma migrate deploy`
2. Seed (optional): `npm run seed` (local/CI-ээс `DATABASE_URL`-тай)

`vercel.json` шаардлагагүй (Next.js default). Build script: `prisma generate && next build`.

## Хязгаарлалт (MVP)

- Төлбөр, хүргэлт байхгүй
- Зураг URL-ээр (файл upload биш)
- Англи UI байхгүй
