# Safari Perfumes E-commerce Improvements - Implementation Plan

## Phase 1: Checkout Page - Free Delivery Display
**File:** `src/app/checkout/page.tsx`

- Remove shipping calculation logic (lines 45-47)
- Set `shipping = 0` always, show "Free Delivery" in summary
- Remove "Add $X more for free shipping" message (lines 419-423)
- Update order summary to show: Subtotal, Free Delivery, Tax, Total

## Phase 2: PDP - Professional E-commerce Layout + Fake Reviews
**File:** `src/app/shop/[slug]/page.tsx`

- Add trust badges row (Authentic, Free Returns, Secure Pay, Fast Ship)
- Add Customer Reviews section after accordions, before "You May Also Like"
- Include 6 fake Pakistani reviews with names, locations, ratings, text
- Add rating breakdown bars (5★ to 1★)
- Add "Write a Review" CTA button

## Phase 3: Header/Navbar - Logo Between Announcement Bars
**File:** `src/components/Header.tsx`

- Move logo from Main Header to between the two announcement bars
- Increase logo size: `h-16 w-16 md:h-20 md:w-20` → `h-24 w-24 md:h-28 md:w-28`
- Remove logo from Main Header (keep nav, search, account, cart)
- Adjust spacing/padding on announcement bars

## Phase 4A: Mobile View - 2 Column Product Grids
**Files:** 
- `src/app/shop/ShopContent.tsx` (line 378)
- `src/components/HomePage.tsx` (multiple grids)
- `src/components/ProductCarousel.tsx` (line 112)

- Shop page: `grid-cols-1 sm:grid-cols-2 xl:grid-cols-3` → `grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4`
- HomePage: Update all `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` → `grid-cols-2 sm:grid-cols-2 lg:grid-cols-4`
- ProductCarousel: `flex-[0_0_80%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%] xl:flex-[0_0_25%]` → `flex-[0_0_100%] sm:flex-[0_0_50%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%] xl:flex-[0_0_25%]`

## Phase 4B: Best Sellers - Move Under Hero
**File:** `src/components/HomePage.tsx`

- Move Best Sellers section (lines 592-637) to right after Hero section (line 164)
- Keep "View All" link pointing to `/shop?filter=bestseller`

## Phase 4C: Hero Image - Reduce Height on Mobile
**File:** `src/components/HeroSlider.tsx`

- Mobile: `min-h-[90vh]` → `min-h-[60vh]`
- Content padding: `py-32 md:py-40 lg:py-48` → `py-16 md:py-24 lg:py-32`

## Phase 5: Additional Polish
**Files:** `src/app/shop/[slug]/page.tsx`

- Trust badges row on PDP (after qty selector)
- Mobile sticky cart bar shows "Free Delivery" text
- Verify all currency displays use PKR

---

## Implementation Order
1. Phase 1: Checkout page
2. Phase 2: PDP reviews + trust badges
3. Phase 3: Header logo reposition
4. Phase 4A: Mobile 2-col grids
5. Phase 4B: Best Sellers move
6. Phase 4C: Hero mobile height
7. Phase 5: Polish items

---

## Fake Reviews Data (for PDP)
```typescript
const fakeReviews = [
  { name: "Ahmed Hassan", location: "Karachi", rating: 5, text: "Bohot zabardast fragrance hai, poora din chalti hai. Packaging bhi premium lagi. Definitely recommend!", date: "2025-01-15" },
  { name: "Fatima Ali", location: "Lahore", rating: 5, text: "Maine apni behen ke liye liya tha, usay bohot pasand aaya. Scent fresh hai aur long lasting bhi. Safari ka fan ban gaya hun.", date: "2025-01-10" },
  { name: "Muhammad Usman", location: "Islamabad", rating: 5, text: "Price ke hisaab se best quality. Delivery bhi fast thi. Ab har baar Safari se hi order karunga.", date: "2025-01-05" },
  { name: "Ayesha Khan", location: "Rawalpindi", rating: 4, text: "Fragrance achi hai lekin thora strong lagi pehle. Baad mein adjust ho gayi. Overall good experience.", date: "2025-01-02" },
  { name: "Bilal Ahmed", location: "Faisalabad", rating: 5, text: "Original product mila, koi duplicate nahi. Box, bottle sab branded. Trustworthy seller.", date: "2024-12-28" },
  { name: "Sana Malik", location: "Multan", rating: 5, text: "Gift ke liye liya tha, packing bohot premium thi. Recipient bohot khush hua. Safari team ka shukriya!", date: "2024-12-20" },
]
```