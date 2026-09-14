# xale

**xale** — Монголын илүүдэл / хугацаа дуусах дөхсөн барааны зах зээлийн MVP.

Худалдагч (дэлгүүр, ресторан) → худалдан авагч (иргэд, ферм, бөөний) холбодог.

UI бүрэн **Монгол** (Кирилл).

## Стек

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Prisma + SQLite
- JWT cookie session (jose + bcryptjs)

## Суулгах

```bash
cd xale
npm install
npx prisma db push
npm run seed
```

## Ажиллуулах

```bash
npm run dev
```

Браузерээр: [http://localhost:3000](http://localhost:3000)

## Бусад командууд

| Команд | Тайлбар |
|--------|---------|
| `npm run dev` | Development сервер |
| `npm run build` | Production build |
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

`.env` файл:

```
DATABASE_URL="file:./dev.db"
AUTH_SECRET="xale-dev-secret-change-in-production-mn-2026"
```

## Хязгаарлалт (MVP)

- Төлбөр, хүргэлт байхгүй
- Зураг URL-ээр (файл upload биш)
- Англи UI байхгүй
