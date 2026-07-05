# SAFARI Website Improvement — OpenCode Implementation Prompt

> Paste this entire file's content into your OpenCode session inside your project folder.

---

## CONTEXT

I'm working on a Next.js e-commerce site called **SAFARI** (perfume/fragrance store, live at https://safari-fragnance.vercel.app/). I want to bring it closer to the UX/conversion quality of **Saeed Anwar Oud** (https://sabysaeedanwar.com/), a top Pakistani oud brand, while keeping SAFARI's own clean modern design language intact and improving it — not replacing it.

Before making ANY changes, scan the existing codebase, design tokens, color variables, fonts, spacing, and component patterns so every change you make visually **matches and enhances** the current UI.

---

## MOBILE-FIRST PRIORITY (READ THIS BEFORE STARTING ANY TASK)

Over 80% of customers visiting Pakistani e-commerce sites (like Saeed Anwar Oud and J.) browse and buy from mobile phones. Treat **mobile view as the primary design target**, not an afterthought. Apply these rules across EVERY task below:

1. **Design mobile first, then scale up** — build/test every new component at 375px-414px width first, then verify desktop scaling.
2. **Thumb-friendly touch targets** — all buttons/icons (wishlist, quick view, cart, tabs) minimum 44x44px on mobile.
3. **Horizontal scroll carousels, not cramped grids** — product carousels (New Arrivals, Best Sellers, OUR PRODUCTS tabs) must scroll horizontally with scroll-snap, showing 1.2-1.5 cards per view so the next card peeks in (like Saeed Anwar and J. do it).
4. **Sticky elements for convenience** — category tab bar sticky near top on mobile while scrolling; consider a sticky bottom bar on product pages (mobile only) with price + Add to Cart always visible.
5. **Native-feeling mobile menu** — hamburger menu slides in from the side (not dropdown from top), full-height drawer, large tappable rows (min 48px height), clear parent/child hierarchy.
6. **Optimized images for mobile data** — use Next.js `Image` component with proper responsive `sizes` prop so mobile loads smaller variants, not desktop images compressed via CSS.
7. **Reduce text-heavy sections on mobile** — expanded "Our Story" section should default to fully collapsed on mobile (1-2 lines + Read More).
8. **Announcement bar readability** — smaller marquee font on mobile, scroll speed readable, no overlap with header/logo.
9. **Cart drawer full-screen on mobile** — full screen width, clear close (X) button, large thumbnails, scrollable upsell row without feeling cluttered.
10. **Test on real breakpoints** — 375px, 414px, 768px, 1024px+ — not just "mobile vs desktop."

After each task below, explicitly confirm: **"Tested at 375px — [pass/fail + notes]"** before moving to the next task.

---

## CRITICAL UI-SAFETY RULES (APPLY TO EVERY TASK)

- Do not change existing colors, fonts, spacing, or layout structure unless the task specifically asks for it.
- Reuse existing CSS variables / Tailwind theme classes already defined in the project — no random new colors or inconsistent styles.
- Mentally test responsiveness for both mobile (375px-480px) and desktop (1280px+) before finalizing each component.
- After each task, double-check that no existing section, spacing, or alignment broke as a side effect.
- New sections must match the site's existing visual style (rounded corners, shadows, font sizing, button styles) so they look native, not bolted on.
- Show a before/after summary of files changed after each task, and flag any task where you're not fully confident the UI stayed intact.

---

## TASKS

### TASK 1 — Discount Pricing & Badges
Find the product card component (likely `components/ProductCard.tsx` or similar). Add:
- A discount badge (top-left of image) showing percentage off, calculated from `compareAtPrice` vs `price` — only render if `compareAtPrice > price`.
- Price display: strikethrough original price (gray, smaller) + discounted price (bold, brand color) when discount exists; normal price only when no discount.
- Works in all places `ProductCard` is reused (home page sections, shop page, search results).
- Badge must not overlap product title, rating, or "New"/"Bestseller" tags — reposition existing tags if needed so nothing overlaps.

### TASK 2 — Hover Image Swap
In `ProductCard`, add support for a secondary image field on the product data model. On desktop hover, crossfade from primary to secondary image (~300ms CSS transition). On mobile/touch, skip hover swap (keep primary image, optionally add a small dot indicator if multiple images exist). Card dimensions must stay exactly the same before/after — no layout shift.

### TASK 3 — "Summer Collection" Hero/Promo Banner Section
Add a new promotional banner section right after the main hero slider on the home page (before "New Arrivals"):
- Small label text: "Summer Collection"
- Large heading: "Fresh Notes for Warm Days" (or similar seasonal tagline matching SAFARI's tone)
- Background: lifestyle/seasonal image or gradient using existing brand colors only.
- "Shop Now" CTA button styled like the existing hero CTA (same border-radius, font, hover effect).
- Responsive: full-width image on desktop, stacked text-over-image on mobile with dark overlay/gradient if contrast is weak.
- This is a NEW section — do not replace or modify the existing hero slider.

### TASK 4 — "OUR PRODUCTS" Category Tab Section
Add a new section titled "OUR PRODUCTS" on the home page (after the Summer Collection banner, before "Explore Our Collections"):
- Section heading: "OUR PRODUCTS"
- Horizontally scrollable pill/tab navigation: Men, Women, Unisex, Bundles, Scent Profiles (Woody, Fresh, Floral) — match existing pill/button styling, otherwise create a rounded-pill tab matching the brand's button style.
- Each tab smooth-scrolls to a matching product grid section further down the page via anchor IDs (#men, #women, #unisex, etc.) — wrap existing product grids with these IDs, don't duplicate product data.
- Highlight active tab using IntersectionObserver based on scroll position.
- Mobile: tabs scroll horizontally, no wrap, snug padding, min 40px tap height.
- Do not disturb the existing "Explore Our Collections" cards section — this tab bar sits above/before it as a navigation aid.

### TASK 5 — Expanded Brand Story Section
Keep existing "Our Story" content (intro paragraph, quote, stats) exactly as is — only add new content below it. Add 5 collapsible subsections with H4 headings and 80-120 word SEO paragraphs:
- "What Makes SAFARI Fragrances Unique?"
- "Our Collection of Luxury Perfumes in Pakistan"
- "Best Perfumes in Pakistan Curated by SAFARI"
- "Why We Are a Leading Fragrance Brand"
- "Buy Perfume Online in Pakistan – Shop From Home"

Add a "Read More / Read Less" toggle (React state) that expands/collapses these subsections, default collapsed with a fade-gradient cutoff (1-2 lines on mobile, slightly more on desktop). Match existing typography (font sizes, line-height, spacing).

### TASK 6 — Real Customer Reviews System
Replace the static testimonials section with a dynamic reviews system, keeping the same section background/spacing:
- Average rating + total review count at top (e.g. "4.8/5 from 300+ reviews").
- Horizontal scroll row: star rating, review text, customer name, linked product name (Next.js Link to product page), and date.
- Remove stock Unsplash avatar images — use initials-based avatar styled with brand accent color background.
- If no backend reviews table exists, scaffold a simple schema (`productId`, `customerName`, `rating`, `text`, `date`) and seed placeholder data structured like real reviews, ready for real data later.

### TASK 7 — Currency Consistency (PKR Everywhere)
Search the entire codebase for `$` or `USD` pricing (especially bundles/gift-sets pages and components). Convert all pricing display to PKR consistently — same font weight/size as before, just symbol/value change. Check: bundle cards, gift cards page, footer, cart, checkout components. List every file changed.

### TASK 8 — Frequently Bought Together in Cart Drawer
In the cart drawer/sidebar component, below cart items and totals, add a "You Might Also Like" horizontal scroll row showing 4-6 product cards (image, name, discounted price, small "Add" button), matching the drawer's existing padding/card style. Clicking "Add" adds to cart without closing the drawer. Add a subtle divider before "Proceed to Checkout." Ensure cart drawer scroll behavior on mobile still works smoothly with the added section. On mobile, drawer must be full-screen width (see Mobile-First Rule #9).

### TASK 9 — Sticky Scrolling Announcement Bar
Convert the top announcement bar (currently static "FREE SHIPPING ON ORDERS OVER $100") into a CSS/JS marquee that auto-scrolls horizontally in a continuous loop (~20s), containing multiple promo messages separated by "|". Update "$100" to PKR equivalent. Keep the same bar height, background color, and font — only scroll behavior and text content change. Reduce font size slightly on mobile for readability.

### TASK 10 — Wishlist + Quick View Icons
In `ProductCard`, replace the plain-text "Quick View" link with two icon-button overlays on the top-right of the product image (stacked vertically):
- Heart icon (wishlist toggle — filled/outline state, persist via localStorage for guests, account-linked if logged in).
- Eye icon (quick view — opens modal with larger image, price, short description, variant selector, Add to Cart, without navigating away).

Minimum 44x44px touch target on mobile. Must not overlap with the discount badge from Task 1 — badge top-left, icons top-right.

### TASK 11 — Multi-Level Mobile Menu
Make the mobile hamburger menu's "Collections" item expandable (accordion-style) with nested sub-links: Men, Women, Unisex, Scent Profiles (Woody, Fresh, Floral). Add a chevron icon that rotates 180° on expand/collapse. Keep top-level items (Home, Shop All, New Arrivals, Gifts & Sets) as flat direct links. Animate expand/collapse with 200-300ms slide transition matching existing easing. Menu must slide in from the side as a full-height drawer with min 48px row height (see Mobile-First Rule #5). Tapping nested links must not close the whole menu unexpectedly.

---

## EXECUTION INSTRUCTIONS

Go through these tasks **in order**. Before starting, run a quick scan of the project structure (components, pages/app directory, data models) so changes match existing code conventions (TypeScript types, Tailwind classes, existing component patterns).

After completing each task:
1. Confirm "Tested at 375px — [pass/fail + notes]"
2. Give a short summary of files changed
3. Confirm the UI still looks consistent before moving to the next task

Ask me only if something is genuinely ambiguous — otherwise proceed with reasonable defaults matching the existing codebase style.