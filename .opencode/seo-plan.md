# SEO REBUILD PLAN — Safari Perfumes

Status: IN PROGRESS (started 2026-08-20)
Stack: Next.js 16.2.4 App Router (confirmed), Prisma 5.22 + Turso (libSQL), Tailwind. Prices PKR, Pakistan ops, ~335 active products.
Committed: 56ec6a1, 67fce30, aeb515b (pushed to main). Domain confirmed: safari-perfumes.com.

## PRIORITY 0 — Fix SSR rendering on product pages (DONE)
- [x] Diagnose /shop/[slug] (was "use client" + useEffect fetch → no product HTML in SSR)
- [x] Server-render: name as <h1>, description, price, notes, real <img src> in initial HTML
- [x] generateStaticParams + revalidate=300 → SSG/ISR (395 pages prerendered); verified via prod server curl
- [x] Root layout headers() removed → sitewide ISR enabled (admin chrome → client SiteShell; AdminShell has own container)
- [x] /track Suspense fix (useSearchParams prerender error)
- [x] Removed fabricated PDP reviews (6 fake reviews + fake 4.8/127 summary + fake distribution bars); real rating/reviewCount shown only when reviewCount>0

## PRIORITY 1 — Unique metadata per page (DONE)
- [x] Root: title template "%s | Safari Perfumes", homepage title/desc, canonical, OG, Twitter, metadataBase
- [x] Product pages: '{Name} | Impression of X | PKR price | Safari Perfumes Pakistan' + per-product description (nan junk sanitized) + canonical + OG (real product image) + Twitter
- [x] /shop: category-aware titles (Attars for Men, Perfume Collection, Bestsellers, New Arrivals...) + canonical to /shop parent
- [x] Static pages: about, contact, gift-cards (server wrappers), shipping, returns, bundles, bundles/[slug], collections; noindex on privacy/terms/cookies

## PRIORITY 2 — JSON-LD structured data (DONE)
- [x] Organization (root layout) — real name/url/logo only; contact omitted pending real NAP (no fake data)
- [x] Product schema per product page (name, desc, image, brand, offers PKR, availability, sku); AggregateRating ONLY when reviewCount>0 && rating>0
- [x] BreadcrumbList on product + shop/category pages
- [x] Bundle Product schema + BlogPosting schema
- [ ] Validate with Google Rich Results Test (manual, post-deploy)

## PRIORITY 3 — Sitemap, robots, indexing (DONE)
- [x] Dynamic sitemap.xml (ISR 5m): 9 static + 335 products + 4 bundles (348 URLs) with lastModified/priority; verified 200
- [x] robots.txt: disallow /admin /account /login /signup /forgot-password /checkout /track /api/; sitemap referenced; verified 200
- [ ] Search Console / Bing verification + sitemap submission (manual, needs user)

## PRIORITY 4 — Content & keyword strategy (PARTIAL)
- [x] Blog/guides section: 3 posts (impressions guide, oud vs attar, perfume longevity), long-tail targets, each links 3-4 real products, BlogPosting JSON-LD, linked from header+footer
- [x] Testimonials duplication fixed (single DOM instance, responsive carousel/grid via CSS)
- [ ] Founding year inconsistency — BLOCKED: user chose "another year" but hasn't stated which; footer says 2015, BrandStory says 2019
- [ ] Product descriptions 150-300 words per product — data-side (331 have short/long desc; some contain 'nan' junk), flagged for admin cleanup
- [ ] Impression labeling uniformity — product titles use designer names; PDP shows "Impression of X" when impressionOf set (259/335 have it); missing for 76 → flagged for admin data entry

## PRIORITY 5 — Trust / NAP (BLOCKED)
- [ ] Footer still shows fake "+1 (555) 123-4567" / "123 Luxury Lane, New York" / hello@SAFARI.com — user selected "Only real phone + email" but has NOT provided them
- [ ] Settings.storePhone/storeAddress/storeEmail are NULL in DB — could be populated once real info provided
- [ ] Organization schema sameAs + footer social buttons — user selected "Yes — provide links" but hasn't pasted URLs
- [ ] Contact page — check for NAP references once real info provided

## PRIORITY 6 — Performance / CWV (PARTIAL)
- [x] Renamed generic public assets to descriptive names (banner1, sents1-6, story, Attarcollection, ourcollection, 'perfume collection') — product images live in Vercel blob (data-side rename not feasible without re-upload)
- [x] Descriptive alt text on PDP main/thumbnails; existing components already use next/image with alt
- [ ] next/image conversion of PDP/bundle <img> — DEFERRED: next.config.js sets images.unoptimized:true (cPanel/standalone); no resize/WebP gains possible. Revisit if hosting changes
- [ ] Lighthouse mobile 90+ — run post-deploy after rendering fix ships
- [ ] PageSpeed for product pages should improve significantly now (SSG + cached)

## FINAL VALIDATION CHECKLIST
- [x] Product page HTML (view-source, no JS) shows real name/desc/price/images
- [x] Every page unique <title> + <meta description> (all routes enumerated; private pages rely on robots.txt)
- [x] Canonical tags present (products, bundles, static, shop/collections)
- [x] JSON-LD present (Organization, Product, BreadcrumbList, Bundle, BlogPosting) — Rich Results Test pending manual check
- [x] sitemap.xml lists all product + category + static pages, linked from robots.txt
- [x] robots.txt blocks private routes, allows public
- [x] Homepage testimonials no longer duplicated (single DOM)
- [ ] Footer/contact/schema show real, consistent business info — BLOCKED on user NAP
- [ ] Founding year consistent — BLOCKED on user input
- [ ] Mobile PageSpeed 90+ — pending post-deploy run
- [x] 3 blog/guide posts published, each linking to products

## BLOCKED ITEMS — NEED USER INPUT
1. Real founding year (user chose "another year" but didn't specify)
2. Real phone + email (user chose "Only real phone + email" but didn't provide)
3. Social profile URLs for sameAs + footer buttons (user chose "Yes — provide links" but didn't paste)