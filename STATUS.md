# xale — STATUS

**Бүтээгдэхүүн:** xale (илүүдэл / near-expiry барааны зах зээл, Монгол)  
**Байршил:** `/workspace/xale/`  
**Огноо:** 2026-09-15  
**Production:** https://xale-app.vercel.app

## Хийгдсэн зүйлс

- [x] Next.js 14 App Router + TypeScript + Tailwind
- [x] Prisma + **PostgreSQL**
- [x] Auth: signup/login, SELLER / BUYER (JWT cookie)
- [x] Seller CRUD + `/seller` самбар + сонирхол
- [x] Buyer browse/filter + interest
- [x] Mobile hamburger nav + **bottom nav** (PWA-friendly)
- [x] Empty states + Монгол алдааны мессеж
- [x] Seed demo accounts (README / OPS.md)
- [x] OPS.md — xale.mn go-live checklist
- [x] Admin `/admin` — бүртгэлтэй хэрэглэгчдийн жагсаалт (`ADMIN_PASSWORD`)
- [x] `/payment-terms` — Монгол төлбөрийн нөхцөл (төсөл, үнэгүй зар · ирээдүй 3%+VIP)
- [x] **TGTG-inspired redesign** — deeper forest/teal greens (`#0B3D2E` / `#005A57`), cream bg, soft coral accents (no neon amber)
- [x] Homepage hero + numbered Mongolian steps (Ол → Сонирхол → Ав → Хаягдал↓)
- [x] `/how-it-works` page (nav + footer)
- [x] **PWA v1** — manifest, icons, apple-mobile-web-app, service worker («Нүүр дэлгэцэд нэмэх»)

## Утасны апп — rollout

| Шат | Төлөв | Тайлбар |
|-----|-------|---------|
| **1. Вэбсайт redesign** | ✅ одоо | TGTG calmer UI + how-it-works |
| **2. PWA v1** | ✅ вэбсайттай хамт | Add to Home Screen — утасны «апп» |
| **3. Native Expo** | ⏳ дараа | App Store / Play Store — сонголттой |
| **4. Домэйн xale.mn** | ⏳ дараа | OPS.md |

### PWA суулгах

- **iPhone (Safari):** Share → **Add to Home Screen** / Нүүр дэлгэцэд нэмэх
- **Android (Chrome):** цэс → **Install app** / **Add to Home screen**

## Demo

Нууц үг: `demo1234` · `seller@xale.mn` · `buyer@xale.mn`

## Гол URL

| Зам | Тайлбар |
|-----|---------|
| `/` | Landing (TGTG-like) |
| `/how-it-works` | 4 алхам |
| `/listings` | Зарууд |
| `/seller` | Худалдагчийн самбар |
| `/seller/listings` | Миний зарууд |
| `/seller/interests` | Сонирхол |
| `/login` `/signup` | Auth |
| `/admin/login` | Админ нэвтрэх |
| `/admin` | Админ самбар |
| `/payment-terms` | Төлбөрийн нөхцөл (төсөл) |

Дэлгэрэнгүй: `OPS.md`, `README.md`
