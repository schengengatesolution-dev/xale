# xale — STATUS

**Бүтээгдэхүүн:** xale (Surprise Bag food-rescue marketplace, Монгол)  
**Байршил:** `/workspace/xale/`  
**Огноо:** 2026-09-15  
**Production:** https://xale-app.vercel.app

## Phase 1b — Surprise Bag (одоо)

- [x] Prisma Listing → Surprise Bag талбарууд (`bagPrice`, `estimatedRetailValue`, `pickupStart`/`pickupEnd`, `quantityAvailable`, `dietaryNotes`, …)
- [x] Interest → **Reservation** (`RESERVED` / `COLLECTED` / `NO_SHOW`)
- [x] Buyer: discovery cards + detail reserve (апп дотор төлбөргүй)
- [x] Seller: Bag CRUD + захиалга жагсаалт + Авсан / Ирээгүй
- [x] Homepage / how-it-works / payment-terms — Surprise Bag хэл (Монгол); урсгал: ол → захиал → ав
- [x] Seed 6 demo Surprise Bag (УБ)
- [x] Админ хэрэглэгчийн жагсаалт хэвээр
- [x] Calmer greens UI + PWA v1 хадгалсан

## Утасны апп — rollout

| Шат | Төлөв | Тайлбар |
|-----|-------|---------|
| **1. Вэбсайт redesign** | ✅ | Food-rescue UI |
| **1b. Surprise Bag product** | ✅ одоо | Reserve + collect |
| **2. PWA v1** | ✅ | Add to Home Screen |
| **3. In-app pay** | ⏳ дараа | Карт төлбөр |
| **4. Native Expo** | ⏳ дараа | App Store / Play |
| **5. Домэйн xale.mn** | ⏳ дараа | OPS.md |

## Deploy

- **Production live:** https://xale-app.vercel.app (Vercel direct deploy `dpl_6QrT7fjQmAvp3dnKZvE1YYXggWT6`)
- **Local commit:** `e1d9a7d` on `main` (ahead of origin — GitHub push needs `GH_TOKEN`; session sudo blocked PAT/SSH key creation)
- Neon DB schema pushed + 6 Surprise Bags seeded

## Demo

Нууц үг: `demo1234`

| Имэйл | Төрөл |
|-------|-------|
| `buyer@xale.mn` | Худалдан авагч — захиалах |
| `seller@xale.mn` | Худалдагч (дэлгүүр) |
| `cafe@xale.mn` | Кафе / ресторан |
| `bakery@xale.mn` | Талхны дэлгүүр |
| `hotel@xale.mn` | Зочид буудал |

### Хэрхэн турших

1. `/listings` — Surprise Bag картууд (үнэ, retail, авах цонх, үлдсэн уут)
2. `buyer@xale.mn` нэвтэрч detail дээр **Захиалах**
3. `bakery@xale.mn` (эсвэл бусад seller) → `/seller/reservations` → **Авсан** / **Ирээгүй**
4. `/how-it-works`, `/payment-terms` — Surprise Bag хэл

## Гол URL

| Зам | Тайлбар |
|-----|---------|
| `/` | Landing (Surprise Bag) |
| `/how-it-works` | 4 алхам |
| `/listings` | Bag discovery |
| `/listings/[id]` | Detail + reserve |
| `/seller` | Бизнес самбар |
| `/seller/listings` | Миний Bag |
| `/seller/reservations` | Захиалгууд |
| `/login` `/signup` | Auth |
| `/admin` | Админ хэрэглэгчид |
| `/payment-terms` | Төлбөрийн нөхцөл (төсөл) |

Дэлгэрэнгүй: `OPS.md`, `README.md`
