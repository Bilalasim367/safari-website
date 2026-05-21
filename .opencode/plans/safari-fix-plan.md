# Full Fix Plan — Safari Perfumes

Organized into 6 phases, ordered by impact.

---

## Phase 1: Security (7 items)

### 1.1 Remove `.env` from git & rotate all secrets
**Files:** `.env`, `.gitignore`
- Add `.env` to `.gitignore` (verify it's there)
- Remove `.env` from git tracking: `git rm --cached .env`
- Rotate: `TURSO_AUTH_TOKEN`, `JWT_SECRET`, `ADMIN_SECRET_KEY`, `ADMIN_API_KEY`
- Update `.env.example` with placeholder values (no real secrets)

### 1.2 Remove hardcoded admin key from client code
**File:** `src/app/admin/signup/page.tsx`
- Remove `const ADMIN_KEY = "safari-admin-setup-key-2024"`
- Move the key check to a server action or API route instead

### 1.3 Add auth to all unprotected API routes
**Files:**
- `src/app/api/orders/[id]/route.ts` — add JWT auth + user ownership check
- `src/app/api/orders/by-number/[orderNumber]/route.ts` — add JWT auth + user ownership check
- `src/app/api/products/[id]/route.ts` — add `x-api-key` or JWT admin auth
- `src/app/api/users/route.ts` — add admin auth
- `src/app/api/upload/route.ts` — add JWT admin auth + file type + size validation
- `src/app/api/settings/route.ts` — add admin auth (both GET and PUT)
- `src/app/api/notifications/route.ts` — add user-scoped JWT auth
- `src/app/api/categories/route.ts` — add admin auth on POST/PUT/DELETE

### 1.4 Add server-side auth guard to admin layout
**File:** `src/app/admin/layout.tsx`
- Add server-side session check using `getSession()` from `@/lib/auth`
- Redirect to `/admin/login` if not authenticated or not admin

### 1.5 Fix password reset token generation
**File:** `src/app/api/auth/forgot-password/route.ts`
- Replace `Math.random().toString(36).substring(2, 8)` with `crypto.randomBytes(4).toString('hex').toUpperCase()`

### 1.6 Sanitize error messages — stop leaking `String(e)`
**Files:**
- `src/app/admin/actions.ts` — replace `String(e)` with `'Failed to [action]'` everywhere
- `src/app/api/admin/products/route.ts`
- `src/app/api/admin/products/bulk-upload/route.ts`
- `src/lib/email.ts`

### 1.7 Remove fallback secrets from source code
**File:** `src/lib/auth.ts:4`
- Remove `|| 'development-fallback-secret-change-in-production'`
- Let it throw if `JWT_SECRET` is not set
- Same pattern in `api/auth/register/route.ts`, `api/admin/setup/route.ts`

---

## Phase 2: Critical Runtime Bugs (6 items)

### 2.1 Fix POST /api/products — JSON.stringify array fields
**File:** `src/app/api/products/route.ts:130-148`
- Change `images: body.images || []` → `images: JSON.stringify(body.images || [])`
- Same for `notesTop`, `notesHeart`, `notesBase`

### 2.2 Fix sort dropdown — add onChange handler
**File:** `src/app/shop/ShopContent.tsx:235-244`
- Replace `<select>` with a client component using `useRouter`
- `onChange` navigates to `?sort=<value>&<existing-params>`

### 2.3 Fix price filter — preserve existing query params
**File:** `src/app/shop/ShopContent.tsx:344-348` (FilterSection)
- Use `URLSearchParams` to preserve all existing params
- `const sp = new URLSearchParams(currentSearch); sp.set('minPrice', ...); sp.set('maxPrice', ...)`

### 2.4 Fix csv-parser toInt — use parseFloat or validate integers
**File:** `src/lib/csv-parser.ts:114-118`
- Change `parseInt` to `parseFloat`, then `Math.round()` for Int fields
- Or add a validation warning for non-integer prices

### 2.5 Fix csv-parser inStock — map from stock_status
**File:** `src/lib/csv-parser.ts:232`
- Change `inStock: true` → `inStock: row.stock_status?.trim() !== 'out_of_stock'`

### 2.6 Fix CartContext — move saveCartToDB out of state updaters
**File:** `src/context/CartContext.tsx:87-134`
- Remove `saveCartToDB(...)` from inside `setItems(prev => ...)` callbacks
- Let the existing debounced `useEffect` (lines 137-141) handle all DB syncs
- Keeps state updaters pure

---

## Phase 3: React Compiler Compliance (4 items)

### 3.1 Fix setState-in-effect across 6 files
**Strategy:** Replace `useEffect(() => { setState(...) }, [])` patterns

| File | Line | Fix |
|------|------|-----|
| `src/app/signup/page.tsx` | 18 | Use `useState` initializer: `useState(() => new URLSearchParams(...).get(...) \|\| '/account')` |
| `src/app/admin/login/page.tsx` | 24 | Same pattern |
| `src/app/admin/orders/page.tsx` | 73, 79 | Use lazy initializer |
| `src/components/SearchOverlay.tsx` | 26, 51 | Use `useRef` or `useSyncExternalStore` for non-React state |
| `src/context/CartContext.tsx` | 57 | Replace effect + setState with `useState` lazy initializer for localStorage |
| `src/context/WishlistContext.tsx` | 38 | Move fetch into an event-driven pattern |
| `src/hooks/use-mobile.ts` | 14 | Initialize from matchMedia directly, use `useSyncExternalStore` |

### 3.2 Fix JSX-in-try/catch in ShopContent
**File:** `src/app/shop/ShopContent.tsx` (30+ errors)
- Restructure: move `try/catch` to only wrap data fetching Prisma calls
- Move the JSX return (product grid, filters, pagination) outside the `try` block
- Extract `formattedProducts`, `totalPages`, etc. before the JSX
- Keep try/catch around just the `prisma.product.findMany()` call

### 3.3 Fix useMemo/useCallback dep mismatches
**Files:**
- `src/app/shop/[slug]/page.tsx:87,136` — align deps with React Compiler inference
- `src/context/AuthContext.tsx:44` — align or remove manual memoization

### 3.4 Fix AuthContext immutability — reorder functions
**File:** `src/context/AuthContext.tsx:37-44`
- Move `refreshUser` definition above `startRefreshTimer` (or convert both to `useCallback` in order)
- Add `refreshUser` to `startRefreshTimer` dep array

---

## Phase 4: API & Server-side Fixes (6 items)

### 4.1 Filter inactive products in public API
**File:** `src/app/api/products/route.ts:21-39`
- Add `where.isActive = true` and `where.inStock = true` to GET query

### 4.2 Add bulk upload transaction + size limit
**File:** `src/app/api/admin/products/bulk-upload/route.ts`
- Wrap batch in `prisma.$transaction()`
- Add 5MB file size check
- Add 1000-row limit
- Handle duplicate `product_id` within CSV

### 4.3 Fix updateProduct cart lock — remove over-restrictive check
**File:** `src/app/admin/actions.ts:103-106`
- Remove the cart-count check, or replace with a warning toast (non-blocking)

### 4.4 Fix AdminContext — remove dead products state
**File:** `src/context/AdminContext.tsx:35`
- Remove the unused `products` state and related imports/types

### 4.5 Add rate limiting to remaining sensitive endpoints
**Files:** Registration, password reset, settings, upload, order creation
- Import the existing in-memory `rateLimit` helper
- Add rate limit check with reasonable limits

### 4.6 Add caching headers to API routes
- `Cache-Control: no-store, no-cache, must-revalidate` on all authenticated/order routes
- `Cache-Control: public, s-maxage=60` on public product listing

---

## Phase 5: Code Quality & Cleanup (10 items)

### 5.1 Remove unused dependencies
**File:** `package.json`
- Remove: `jsonwebtoken`, `@types/jsonwebtoken`
- Move to devDependencies: `shadcn`, `@types/papaparse`
- Consider removing: `tw-animate-css`, `@tailwindcss/postcss`, `@tailwindcss/forms`, `babel-plugin-react-compiler`

### 5.2 Replace `<img>` with `next/image` (16 occurrences across 9 files)
- Convert all `<img>` tags to `<Image>` with proper `width`/`height` or `fill`
- Files: `[slug]/page.tsx`, `admin/products/page.tsx`, `admin/bundles/page.tsx`, `admin/dashboard/page.tsx`, `admin/categories/page.tsx`, `bundles/[slug]/page.tsx`, `bundles/page.tsx`, `HomePage.tsx`, `HeroSlider.tsx`, `Testimonials.tsx`, `collections/page.tsx`

### 5.3 Fix 10 `any` types
- `HomePage.tsx:57-59` — replace `any[]` with proper `Product[]` / `Bundle[]` types
- `lib/api.ts` — add proper return types
- `bundles/page.tsx:9` — type as `Bundle[]`
- `admin/orders/route.ts:84` — use `Record<string, unknown>`

### 5.4 Remove 15 unused imports/variables across all files
- `admin/categories/page.tsx`, `admin/users/page.tsx`, `AdminLayout.tsx`, `AdminSidebar.tsx`, `ui/form.tsx`, `checkout/page.tsx`, `shipping/page.tsx`, `forgot-password/page.tsx`, `bulk-upload/page.tsx`

### 5.5 Add display names to forwardRef components
**File:** `src/components/ui/breadcrumb.tsx`
- Add `Breadcrumb.displayName = 'Breadcrumb'` for all 5 components

### 5.6 Fix 7 unescaped entities
- Replace `'` with `&apos;` and `"` with `&quot;` in JSX text content

### 5.7 Fix 1 `prefer-const`
**File:** `ShopContent.tsx:342` — change `let newSelected` to `const newSelected`

### 5.8 Fix `require()` in tailwind.config.js
- Change `require("tailwindcss-animate")` to ESM `import` syntax

### 5.9 Fix URL.createObjectURL memory leak
**File:** `admin/products/page.tsx:158-182`
- Store blob URL in a `useRef`, revoke on cleanup effect or modal close

### 5.10 Fix stale timeout in ProductCard
**File:** `components/ProductCard.tsx:41-54`
- Store timeout ID in `useRef`, clear on unmount via `useEffect` cleanup

---

## Phase 6: UI & Polish (8 items)

### 6.1 Fix sort not resetting page to 1
**File:** `ShopContent.tsx` — all filter links should include `page=1` or omit `page`

### 6.2 Fix ProductCard hardcoded `$` currency
**File:** `ProductCard.tsx:178,181`
- Change `$` to use the `currency` prop (default `'PKR'`)

### 6.3 Fix bulk upload column validation — check names, not just count
**File:** `bulk-upload/page.tsx:133-135`
- Change to: `SAMPLE_HEADERS.every(h => headers.includes(h))`

### 6.4 Handle Papa.parse errors in preview
**File:** `bulk-upload/page.tsx:81-93`
- Check `parsed.errors` and show warning to user

### 6.5 Fix duplicate product_id in CSV bulk upload
**File:** `api/admin/products/bulk-upload/route.ts:62`
- Track seen `productId`s within the CSV batch to handle duplicates

### 6.6 Fix Bulk Upload `Badge` unused import
**File:** `bulk-upload/page.tsx:7` — remove unused `Badge` import

### 6.7 Clean up conflicting `force-dynamic` + `revalidate`
**File:** `ShopContent.tsx:5,46`
- Remove `revalidate = 60` when `force-dynamic` is set (latter wins anyway)

### 6.8 Remove orphan `null` file and empty `scripts/` dir
- `./null` — delete the 0-byte file
- `scripts/` — remove empty directory

---

## Summary by File

| File | Fixes |
|------|-------|
| `.gitignore` | 1.1 Add `.env` |
| `.env` | 1.1 Remove from git |
| `package.json` | 5.1 Remove unused deps, fix dep groups |
| `src/lib/auth.ts` | 1.7 Remove fallback secret |
| `src/lib/csv-parser.ts` | 2.4, 2.5 Fix toInt + inStock |
| `src/lib/email.ts` | 1.6 Sanitize error |
| `src/lib/api.ts` | 5.3 Fix `any` types |
| `src/context/AuthContext.tsx` | 3.3, 3.4 Fix useCallback ordering + deps |
| `src/context/CartContext.tsx` | 2.6, 3.1 Fix impure updaters + localStorage init |
| `src/context/WishlistContext.tsx` | 3.1 Fix setState-in-effect |
| `src/context/AdminContext.tsx` | 4.4 Remove dead products state |
| `src/hooks/use-mobile.ts` | 3.1 Fix setState-in-effect |
| `src/app/admin/layout.tsx` | 1.4 Add server-side auth guard |
| `src/app/admin/login/page.tsx` | 3.1 Fix setState-in-effect |
| `src/app/admin/products/page.tsx` | 5.9 Fix memory leak (blob URL) |
| `src/app/admin/products/bulk-upload/page.tsx` | 5.4, 6.3, 6.4, 6.6 Fix validation + cleanup |
| `src/app/admin/actions.ts` | 1.6, 4.3 Sanitize errors + fix cart check |
| `src/app/admin/orders/page.tsx` | 3.1 Fix setState-in-effect |
| `src/app/admin/signup/page.tsx` | 1.2 Remove hardcoded key |
| `src/app/api/admin/products/bulk-upload/route.ts` | 1.6, 4.2, 6.5 Add transaction + limits + dedup |
| `src/app/api/products/route.ts` | 2.1, 4.1 Fix JSON.stringify + filter inactive |
| `src/app/api/products/[id]/route.ts` | 1.3 Add auth |
| `src/app/api/orders/[id]/route.ts` | 1.3 Add auth + ownership check |
| `src/app/api/users/route.ts` | 1.3 Add auth |
| `src/app/api/upload/route.ts` | 1.3 Add auth + file validation |
| `src/app/api/settings/route.ts` | 1.3 Add auth |
| `src/app/api/notifications/route.ts` | 1.3 Add user-scoped auth |
| `src/app/api/categories/route.ts` | 1.3 Add auth on mutations |
| `src/app/api/auth/forgot-password/route.ts` | 1.5 Fix weak token |
| `src/app/api/auth/register/route.ts` | 1.7 Remove fallback |
| `src/app/api/admin/setup/route.ts` | 1.7 Remove fallback |
| `src/app/shop/ShopContent.tsx` | 2.2, 2.3, 3.2, 5.7, 6.1, 6.7 Fix sort + price filter + try/catch |
| `src/app/shop/[slug]/page.tsx` | 3.3 Fix useMemo deps, 5.2 Replace `<img>` |
| `src/components/ProductCard.tsx` | 5.10, 6.2 Fix timeout + currency |
| `src/components/ui/breadcrumb.tsx` | 5.5 Add display names |
| `tailwind.config.js` | 5.8 Fix require() |
| `./null` | 6.8 Delete orphan file |
| `scripts/` | 6.8 Delete empty dir |

---

**Total: ~50 actionable fixes across ~35 files in 6 phases.**

**Estimated effort:** 2-3 sessions of focused work.
