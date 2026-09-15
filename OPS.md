# xale — Going live checklist (xale.mn)

Одоогийн production: https://xale-app.vercel.app  
Домэйн `xale.mn` дараа нь холбоно.

## 1. Env (Vercel → Project → Settings → Environment Variables)

| Variable | Тайлбар |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string (Neon / Supabase / Vercel Postgres). Serverless-д pooled URL ашиглаж болно. |
| `AUTH_SECRET` | Урт, random JWT secret (ж: `openssl rand -base64 32`) |

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
- [ ] `npm run build` CI/Vercel дээр ногоон

## 5. Тэмдэглэл

- Төлбөр / хүргэлт — одоогоор байхгүй (утас/WhatsApp).
- Зураг — URL-ээр (файл upload биш).
- Production DB-д seed дахин ажиллуулахад demo хэрэглэгч/зар давхардаж болно — зөвхөн шаардлагатай үед.
