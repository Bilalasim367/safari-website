# Plan: Fix Admin Product Form UI

## Current Issues

| Issue | What it looks like | Admin convention |
|-------|-------------------|-----------------|
| **No card container** | Bare `<form>` floats on white bg | `bg-white rounded-xl shadow-sm border border-muted` or `<Card>` |
| **Wrong title style** | `text-2xl font-bold` | `text-3xl font-serif font-bold` |
| **Tab content is flat** | Fields stacked with no visual grouping | Each section inside a `<Card>` |
| **Main image too large** | `h-32 w-32` | `h-24 w-24` (matches bundles page) |
| **No section headers** | All fields blend together | `CardTitle` per logical group |
| **Checkbox labels** | Plain `<span>` | Should use `<Label>` component |
| **Responsive gaps** | Grids break on small screens | Consistent breakpoints |
| **Loading state** | Spinner on edit page | Should match admin skeleton |

## Changes

### ProductForm.tsx
- Wrap `<form>` in `bg-white rounded-xl shadow-sm border border-muted overflow-hidden p-6 md:p-8`
- Header: `text-3xl font-serif font-bold` + `text-muted-foreground mt-1` subtitle
- Each tab section gets `<Card>` + `<CardHeader>` + `<CardTitle>` wrapping
- Main image: `h-32 w-32` → `h-24 w-24`
- Gallery grid: `grid-cols-3 sm:grid-cols-4 md:grid-cols-5` → `grid-cols-2 sm:grid-cols-3 md:grid-cols-4`
- Notes grid: `grid-cols-1 md:grid-cols-3` → `grid-cols-1 sm:grid-cols-3`
- Size prices grid: `grid-cols-2 md:grid-cols-4` → `grid-cols-2 sm:grid-cols-4`
- Checkbox labels: `<span>` → `<Label>`
- Add `Card` import from `@/components/ui/card`

### [id]/edit/page.tsx
- Loading: spinner → skeleton with `animate-pulse` matching admin pattern

## Files Modified
- `src/components/admin/ProductForm.tsx`
- `src/app/admin/products/[id]/edit/page.tsx`
