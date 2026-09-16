# xale — STATUS

**Бүтээгдэхүүн:** xale (Азтай уут food-rescue marketplace, Монгол)  
**Байршил:** `/workspace/xale/`  
**Огноо:** 2026-09-17  
**Production:** https://xale-app.vercel.app

## Phase 1c — Газрын зураг discovery (одоо)

- [x] Map-first discovery `/map` (Leaflet + OSM, SSR-free)
- [x] Browser geolocation + УБ төв fallback (~47.918 / 106.917)
- [x] Bag pins + bottom sheet: нэр, байршил, утас (`tel:`), үнэ, авах цонх
- [x] Зочин үзэж болно; захиалах = нэвтэрсэн buyer эсвэл «Бүртгүүлээд захиалах»
- [x] Listing `lat`/`lng` (optional Float) + seed UB coords; client district→coords jitter fallback
- [x] Navbar / BottomNav / homepage CTAs → `/map` (жагсаалт `/listings` үлдсэн)
- [x] Expo mirror: `(tabs)/map` пин жагсаалт + вэб `/map` нээх

## Phase 1b — Азтай уут

- [x] Prisma Listing → Азтай уут талбарууд
- [x] Reservation flow, seller collect / no-show
- [x] Seed 6 demo Азтай уут (УБ) + lat/lng
- [x] PWA v1 / calmer greens UI

## Утасны апп — rollout

| Шат | Төлөв | Тайлбар |
|-----|-------|---------|
| **1. Вэбсайт redesign** | ✅ | Food-rescue UI |
| **1b. Азтай уут product** | ✅ | Reserve + collect |
| **1c. Map discovery** | ✅ одоо | `/map` Leaflet |
| **2. PWA v1** | ✅ | Add to Home Screen |
| **3. In-app pay** | ⏳ дараа | Карт төлбөр |
| **4. Native Expo** | ⏳ | Map tab + web map link |
| **5. Домэйн xale.mn** | ⏳ дараа | OPS.md |

## Deploy

- **Production live:** https://xale-app.vercel.app
- Neon DB: `lat`/`lng` pushed + re-seeded 2026-09-17
- **Deploy blocker:** Vercel CLI logged out on box — redeploy from Vercel dashboard / CI after push
- GitHub push: only if `gh` auth already works (do not create tokens)

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

1. `/map` — газрын зураг, пин дарж sheet; зочиноор үзэж болно
2. `buyer@xale.mn` — sheet дээр **Захиалах**
3. `/listings` — жагсаалт (хоёрдогч)
4. Seller → `/seller/reservations` → Авсан / Ирээгүй

## Гол URL

| Зам | Тайлбар |
|-----|---------|
| `/` | Landing |
| `/map` | **Primary discovery** (газрын зураг) |
| `/listings` | Жагсаалт (alternate) |
| `/listings/[id]` | Detail + reserve |
| `/how-it-works` | 4 алхам |
| `/seller` | Бизнес самбар |
| `/login` `/signup` | Auth |
| `/admin` | Админ |
| `/payment-terms` | Төлбөрийн нөхцөл |

Дэлгэрэнгүй: `OPS.md`, `README.md`
