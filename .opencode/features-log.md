# Safari Perfumes — Features & Upgrades Log

> Log started: 2026-05-14
> Tracks all completed upgrades, current work, and planned additions.

---

## Legend
- **✅ Completed** — Fully implemented, tested, and deployed
- **🔄 In Progress** — Currently being worked on  
- **⏳ Planned** — Queued for future development

---

## Completed Upgrades

| Date | Feature | Description | Files Affected |
|------|---------|-------------|----------------|
| 2026-05-14 | **Per-Size Pricing** | Products now support individual prices for 30ml, 50ml, 100ml. Price updates dynamically on size selection. Admin can set per-size prices in add/edit dialogs. | `prisma/schema.prisma`, `prisma/seed.ts`, `prisma/apply-migration.ts`, `src/data/products.ts`, `src/app/api/products/route.ts`, `src/app/shop/[slug]/page.tsx`, `src/app/admin/products/page.tsx`, `src/app/admin/actions.ts` |
| Prior | **Bundle Admin CRUD** | Admin panel has full bundle management (create, read, update, delete) with product assignment. | `prisma/schema.prisma`, `prisma/seed.ts`, `src/app/admin/actions.ts`, `src/app/admin/bundles/page.tsx` |
| Prior | **Admin Panel** | Full admin dashboard with products, categories, orders, users, notifications, and settings management. | `src/app/admin/*` |
| Prior | **Authentication** | Login, signup, forgot-password flows with JWT-based auth and admin role enforcement. | `src/app/login/*`, `src/app/signup/*`, `src/app/forgot-password/*`, `src/lib/auth.ts` |
| Prior | **shadcn/ui Integration** | Component library installed with Button, Input, Badge, Card, Dialog, Select, Checkbox, Tabs, Breadcrumb, Accordion, Table, Sheet, Skeleton, and more. | `src/components/ui/*` |
| Prior | **Customer Pages** | About, Contact, Returns, Shipping, Track Order, Gift Cards, Collections, Privacy, Terms, Cookies, Blog (placeholder) pages. | `src/app/{about,contact,returns,shipping,track,gift-cards,collections,privacy,terms,cookies,blog}/*` |
| Prior | **Cart System** | Slide-out cart sidebar with add/remove/update quantity, price calculation, localStorage persistence via React Context. | `src/context/CartContext.tsx`, `src/components/CartSidebar.tsx` |
| Prior | **Shop Listing** | Product grid with category, size, fragrance family, price range filters; sort by price/newest; pagination. | `src/app/shop/*`, `src/components/ProductCard.tsx` |
| Prior | **Product Detail** | Image gallery, thumbnail nav, size selector, quantity controls, add-to-cart, accordion (description/notes/shipping), related products. | `src/app/shop/[slug]/page.tsx` |
| Prior | **Homepage** | Hero slider, featured collections, best sellers, testimonials, newsletter signup, brand story. | `src/components/HomePage.tsx`, `src/components/HeroSlider.tsx` |
| Prior | **Database (Turso)** | Prisma schema with Product, Category, Bundle, BundleItem, User, CartItem, Order, OrderItem, Notification, Settings, Address, WishlistItem models. | `prisma/schema.prisma`, `prisma/seed.ts`, `src/lib/turso.ts` |

---

## Currently In Progress

| Feature | Description | Plan Ref | Started |
|---------|-------------|----------|---------|
| **shadcn/ui Migration** | Migrate all public-facing pages from raw HTML/CSS to shadcn/ui components and CSS variables. PHASE 1 (CSS vars) done, PHASES 2-10 pending. | `plans/migration-plan.md` | Prior |
| **Bundle Page Enhancement** | Redesign bundle detail page (`/bundles/[slug]`) with rich layout, features grid, product cards, value breakdown, CTAs. Also reduce homepage section padding. | `plans/bundle-page-enhancements.md` | 2026-05-15 |

---

## Planned Features

| Feature | Description | Plan Ref | Priority |
|---------|-------------|----------|----------|
| **Product Detail — shadcn/ui pass** | Replace remaining raw elements with shadcn components (`Heart` icon, `Button`, `Badge`). | `plans/migration-plan.md#phase-2` | Medium |
| **Auth Pages — shadcn/ui pass** | `<input>` → `<Input>`, `<label>` → `<Label>`, checkboxes → `<Checkbox>`, buttons → `<Button>`. | `plans/migration-plan.md#phase-3` | Medium |
| **Shop Listing — shadcn/ui pass** | Filter checkboxes → `<Checkbox>`, sort dropdown → `<Select>`, pagination → `<Button variant="outline">`. | `plans/migration-plan.md#phase-4` | Medium |
| **Checkout — shadcn/ui pass** | Inputs → `<Input>`, labels → `<Label>`, buttons → `<Button>`, steps → `<Badge>`, summary → `<Card>`. | `plans/migration-plan.md#phase-5` | Medium |
| **Account Page — shadcn/ui pass** | Tabs → `<Tabs>`, sidebar → `<Button variant="ghost">`, forms → `<Input>`+`<Label>`, orders → `<Card>`. | `plans/migration-plan.md#phase-6` | Medium |
| **Info Pages — shadcn/ui pass** | Contact, Returns, Shipping, Track, Gift Cards, Collections, About — all use shadcn. | `plans/migration-plan.md#phase-7` | Low |
| **HomePage — shadcn/ui pass** | Trust cards → `<Card>`, newsletter → `<Input>`+`<Button>`, testimonials → `<Card>`, Star SVGs → `lucide-react`. | `plans/migration-plan.md#phase-8` | Low |
| **Component Refinements** | ProductCard, Footer, Header, CartSidebar — replace raw buttons/inputs with shadcn. | `plans/migration-plan.md#phase-9` | Low |
| **Empty Routes** | Create blog, cookies, privacy, terms pages with consistent pattern. | `plans/migration-plan.md#phase-10` | Low |
| ~~**Customer Bundle Pages**~~ | ✅ Bundle listing and detail pages exist and are enhanced. See `plans/bundle-page-enhancements.md`. | `plans/bundle-admin.md#sections-7-9` | Medium |
| **Nav/Footer Bundle Links** | Update header/footer to link to `/bundles` instead of `/shop?filter=bundles`, clean up ShopContent. | `plans/bundle-admin.md#section-10` | Low |
| **Wishlist** | Wishlist functionality with add/remove, persistence, and context. | — | Low |
| **Order Management** | Full order lifecycle (pending → processing → shipped → delivered) with status tracking for admin and customer. | — | Low |
| **Payment Integration** | Stripe or similar payment gateway integration (currently UI-only checkout). | — | Low |
| **Reviews & Ratings** | Customer review submission, rating breakdown, and display on product detail page. | — | Low |
| **Image Optimization** | Replace `<img>` tags with Next.js `<Image>` component across all pages. | — | Low |
| **Search** | Full-text product search with autocomplete, debounced API calls, and search results page. | — | Low |
| **Email Notifications** | Transactional emails for order confirmation, shipping updates, password reset. | — | Low |

---

## How to Add New Entries

When starting a new feature:
1. Create a plan file in `.opencode/plans/<feature-name>.md`
2. Add the feature to the **Planned** or **In Progress** table above
3. Move to **Completed** when all steps are done and lint passes
