# Admin Panel Fix Plan

## Files to Create
| File | Action |
|---|---|
| `middleware.ts` (project root) | Create — exposes `x-pathname` header |

## Files to Modify
| File | Fixes |
|---|---|
| `src/app/layout.tsx` | FIX 1 — Conditionally hide storefront chrome on /admin/* |
| `src/components/admin/AdminLayout.tsx` | FIX 2 — Use CSS variables, fix sidebar styling |
| `src/app/admin/dashboard/page.tsx` | FIX 3, FIX 4, FIX 5 — Stat cards, panels, quick actions |

## Files Not Changed
- `src/app/admin/layout.tsx` — already exists and works correctly
- `src/components/Header.tsx` — no changes
- `src/components/Footer.tsx` — no changes

## FIX 1 — Isolate Admin from Storefront Layout
**Why**: Root layout wraps ALL routes in `<Header />`, `<Footer />`, `<CartSidebar />`.
The admin layout exists but renders INSIDE root layout's `<main>{children}</main>`.
**What**:
1. Create `middleware.ts` at project root that sets `x-pathname` header on every request
2. In `src/app/layout.tsx`: make `RootLayout` async, read `headers()`, get `x-pathname`, conditionally render `Header`/`Footer`/`CartSidebar` only when path does NOT start with `/admin`

## FIX 2 — Sidebar Responsiveness
**Why**: Sidebar uses hardcoded colors (`border-gray-800`, `text-white`) instead of CSS variables defined in globals.css.
**What**:
- Replace `border-gray-800` → `border-sidebar-border`
- Replace `text-white` → `text-sidebar-foreground`
- Replace `bg-gray-800` → `bg-sidebar-accent`
- Replace `text-gray-500` → `text-sidebar-muted-foreground`
- Ensure parent div layout is correct

## FIX 3 — Dashboard Stat Cards
**What**:
- Grid: `lg:grid-cols-4` → `xl:grid-cols-4`, `gap-6` → `gap-5`
- Card: keep `hover:shadow-md transition-shadow`, add `duration-200`
- Number: add `tracking-tight`
- Label: change to `text-xs uppercase tracking-widest text-muted-foreground mt-1`
- Icon container: `w-12 h-12 bg-black rounded-lg` → `rounded-xl bg-primary/10 p-3`
- Icon: `h-6 w-6 text-white` → `w-5 h-5 text-primary`

## FIX 4 — Recent Orders & Recent Products Panels
**What**:
- Grid wrapper already correct (`grid-cols-1 lg:grid-cols-2 gap-6`)
- Empty state: already centered — stays same
- Product rows: `p-4 hover:bg-muted/50 transition-colors` → `py-3 border-b border-border last:border-0`
- Product name: add `truncate max-w-[160px]`
- Price: add `ml-auto`
- NEW badge: replace `variant="secondary"` with inline `bg-blue-50 text-blue-700 text-[10px]`
- BEST badge: replace default variant with inline `bg-amber-50 text-amber-700 text-[10px]`
- Remove `hover:bg-muted/50 transition-colors` from both orders and products rows

## FIX 5 — Quick Actions Grid
**What**:
- Grid: `sm:grid-cols-4` → `md:grid-cols-4`
- Icon container: `w-12 h-12 bg-black rounded-full` → `rounded-xl bg-primary/10 w-12 h-12 flex items-center justify-center mx-auto mb-3`
- Icon: `h-6 w-6 text-white` → `h-6 w-6 text-primary`
- Card wrapper: `flex flex-col items-center gap-3 p-6 bg-muted rounded-xl hover:bg-muted/80 transition-colors` → `text-center p-6 hover:border-primary hover:shadow-sm transition-all cursor-pointer border border-transparent` (remove `bg-muted`)
- Label: add `text-foreground mt-2`

## FIX 6 — Remove Floating Debug Artifacts
**Status**: Nothing found in source code. No action needed.
