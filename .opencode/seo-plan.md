# SEO REBUILD PLAN — Safari Perfumes

Status: IN PROGRESS (started 2026-08-20)
Stack: Next.js 16.2.4 App Router (confirmed), Prisma 5.22 + Turso (libSQL), Tailwind. Prices PKR, Pakistan ops, ~339 products.

## PRIORITY 0 — Fix SSR rendering on product pages (BLOCKER)
- [ ] Diagnose /shop/[slug] (currently "use client", data fetched in useEffect → no product HTML in server response)
- [ ] Server-render: name as <h1>, description, price, notes, real <img src> in initial HTML (SSR/ISR)
- [ ] Verify via view-source / curl with JS disabled

## PRIORITY 1 — Unique metadata per page
- [ ] generateMetadata on homepage, category/shop, product, static pages
- [ ] Canonical tags (self-referencing; filtered variants → parent)
- [ ] Open Graph + Twitter Card per page (real product image)

## PRIORITY 2 — JSON-LD structured data
- [ ] Organization (root layout) — real PK business info, sameAs
- [ ] Product schema per product page (name, desc, image, brand, offers PKR)
- [ ] BreadcrumbList on category + product pages
- [ ] NO fabricated AggregateRating/Review until real reviews exist

## PRIORITY 3 — Sitemap, robots, indexing
- [ ] Dynamic sitemap.xml (products, categories, static pages) via ISR
- [ ] robots.txt — block /account, /login, /cart, /checkout, /admin, /api; reference sitemap
- [ ] Search Console / Bing verification + sitemap submission (manual, needs user)

## PRIORITY 4 — Content & keyword strategy
- [ ] Long-tail strategy (impressions/dupes in PK) — NOT head term "safari perfume"
- [ ] Blog/guides section (3+ posts linking to products)
- [ ] Fix founding-year inconsistency (2015 vs 2019 — confirm true date)
- [ ] Fix duplicated homepage testimonials block

## PRIORITY 5 — Trust / NAP consistency
- [ ] Replace placeholder US address ("123 Luxury Lane, New York") + fake "+1 (555) 123-4567" in footer/contact/schema with REAL PK details (ASK USER — do not invent)

## PRIORITY 6 — Performance / CWV
- [ ] Descriptive image filenames (sents1.png → safari-rose-attar-bottle.jpg)
- [ ] Real descriptive alt text everywhere
- [ ] next/image responsive + lazy + WebP/AVIF
- [ ] Lighthouse mobile 90+ on homepage, category, product

## FINAL VALIDATION CHECKLIST
- [ ] Product HTML (view-source, no JS) shows real name/desc/price
- [ ] Every page unique <title> + <meta description>
- [ ] Canonicals correct everywhere
- [ ] JSON-LD validates in Google Rich Results Test
- [ ] sitemap lists all URLs, linked from robots.txt
- [ ] robots.txt blocks private, allows public
- [ ] Homepage testimonials not duplicated
- [ ] Footer/contact/schema consistent real PK info
- [ ] Founding year consistent
- [ ] Mobile PageSpeed 90+ on 3 key pages
- [ ] 3+ blog posts published linking to products

## EXECUTION ORDER
1. Priority 0 (SSR) — unblocks everything else
2. Priority 1 (metadata) + Priority 2 (JSON-LD) — ship together per page type
3. Priority 3 (sitemap/robots)
4. Priority 4 content fixes (testimonials, founding year)
5. Priority 5 NAP (needs user-provided real contact info)
6. Priority 6 performance (image naming/alt/CWV)
7. Final validation + report