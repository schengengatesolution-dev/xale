# Хайран — STATUS

**Бүтээгдэхүүн:** Хайран / Hairan (Азтай уут food-rescue marketplace, Монгол)  
**Уриа:** Хайран Юм / Hairan yum  
**Домэйн:** hairan.mn (маркетинг) · дотоод код/API: `/workspace/xale`, `@xale.mn`, `xale-app.vercel.app`  
**UX лавлагаа:** Too Good To Go хэв маяг зөвхөн — нэр/лого хуулахгүй  
**Огноо:** 2026-09-18  
**Production:** https://xale-app.vercel.app

## Phase 1d — Бүтээгдэхүүний зураг upload

- [x] Seller create/edit: файл upload (JPEG/PNG/WebP ≤5MB)
- [x] Vercel Blob (`hairan-blob`) + `/api/uploads` → `Listing.photoUrl`
- [x] Buyer card/detail + map sheet + seller list thumbnail

## Phase 1c — Газрын зураг discovery (одоо)

- [x] Map-first discovery `/map` (Leaflet + OSM, SSR-free)
- [x] Browser geolocation + УБ төв fallback (~47.918 / 106.917)
- [x] Bag pins + bottom sheet: нэр, байршил, утас (`tel:`), үнэ, авах цонх
- [x] Зочин үзэж болно; захиалах = нэвтэрсэн buyer эсвэл «Бүртгүүлээд захиалах»
- [x] Listing `lat`/`lng` (optional Float) + seed UB coords; client district→coords jitter fallback
- [x] Navbar / BottomNav / homepage CTAs → `/map` (жагсаалт `/listings` үлдсэн)
- [x] Expo mirror: map home + production listing пин

## Phase 1b — Азтай уут

- [x] Prisma Listing → Азтай уут талбарууд
- [x] Reservation flow, seller collect / no-show (Авсан / Ирээгүй)
- [x] Seed 6 demo Азтай уут (УБ) + lat/lng
- [x] PWA v1 / forest teal + cream UI
- [x] How-it-works: **Ол → Захиалах → Авах → Аврах**

## Утасны апп — rollout

| Шат | Төлөв | Тайлбар |
|-----|-------|---------|
| **1. Вэбсайт redesign** | ✅ | Food-rescue UI |
| **1b. Азтай уут product** | ✅ | Reserve + collect |
| **1c. Map discovery** | ✅ одоо | `/map` Leaflet |
| **2. PWA v1** | ✅ | Add to Home Screen |
| **3. In-app pay** | ✅ staging | QPay V2 wired · `QPAY_LIVE=false` · checkout gated |
| **4. Native Expo** | ✅ map home | `/workspace/xale-mobile` |
| **5. Домэйн hairan.mn** | ⏳ дараа | OPS.md |

## QPay staging (2026-09-25)

- [x] Prisma: Payment + Settlement + seller bank fields; Reservation.paymentStatus
- [x] `/api/payments/create` · `/api/payments/qpay/callback` (verify via payment/check) · status poll
- [x] On PAID: Settlement **READY** immediately (instant payout intent; no next-business-day delay)
- [x] Seller bank required on signup / listing publish / checkout
- [x] Buyer UI: no platform fee %; seller copy: «Төлбөр баталгаажсан даруй таны данс руу шилжүүлнэ»
- [x] Admin `/admin` settlements queue (READY → PROCESSING → PAID_OUT)
- Live OFF until Hairan ААН; see OPS.md float note

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
| `/how-it-works` | 4 алхам: Ол → Захиалах → Авах → Аврах |
| `/seller` | Бизнес самбар |
| `/login` `/signup` | Auth |
| `/admin` | Админ |
| `/payment-terms` | Төлбөрийн нөхцөл |

Дэлгэрэнгүй: `OPS.md`, `README.md`
