# Safari Perfumes - shadcn/ui Migration Plan

## Strategy
Migrate all public-facing pages to use shadcn/ui components and unify all hardcoded colors to CSS variables.

---

## PHASE 1: CSS Variable Unification

### 1.1 Add missing utility classes to globals.css
**File: `src/app/globals.css`**

Add after `.container-custom`:
- `btn-primary` - matches shadcn Button default style
- `btn-outline` - matches shadcn Button outline style
- `input-field` - matches shadcn Input style
- `section-padding` - consistent section vertical spacing

### 1.2 Color mapping reference
| Hardcoded | CSS Variable |
|-----------|-------------|
| `bg-black`, `text-black` | `bg-foreground`, `text-foreground` |
| `bg-white` | `bg-background` |
| `bg-[#0D0D0D]` | `bg-background` |
| `bg-[#1A1A1A]` | `bg-card` |
| `text-[#C9A962]` | `text-primary` |
| `bg-[#C9A962]` | `bg-primary` |
| `bg-[#C9A962]/10` | `bg-primary/10` |
| `text-white` on dark | `text-primary-foreground` |
| `text-white/60` | `text-muted-foreground` |
| `border-[#2D2D2D]` | `border-border` |
| `bg-gray-50` | `bg-muted/50` |
| `text-gray-500/600` | `text-muted-foreground` |
| `border-gray-200/300` | `border-border` |
| `hover:bg-gray-100` | `hover:bg-muted` |
| `hover:bg-gray-800` | `hover:bg-accent` |
| `bg-red-50` | `bg-destructive/10` |
| `text-red-600` | `text-destructive` |
| `border-red-200` | `border-destructive/20` |

---

## PHASE 2: Product Detail Page (`src/app/shop/[slug]/page.tsx`)

### Changes:
1. Replace heart icon (inline SVG) with `Heart` from `lucide-react`
2. Replace thumbnail buttons with `Button variant="ghost" size="sm"`
3. CSS variable consistency (replace `bg-green-50`, `text-green-700`)
4. Replace `btn-primary` class with `Button variant="default"` for "Back to Shop"
5. Replace green discount Badge styling with CSS vars

---

## PHASE 3: Auth Pages

### 3.1 Login (`src/app/login/page.tsx`)
- `<input>` → `<Input>`
- `<label>` → `<Label>`
- Checkbox → `<Checkbox>`
- `<button>` → `<Button>`
- Error div → shadcn border pattern

### 3.2 Signup (`src/app/signup/page.tsx`)
Same as Login.

### 3.3 Forgot Password (`src/app/forgot-password/page.tsx`)
Same as Login + success icon from `lucide-react`.

---

## PHASE 4: Shop Listing Page

### 4.1 `src/app/shop/page.tsx`
- Breadcrumb (raw spans) → `<Breadcrumb>`

### 4.2 `src/app/shop/ShopContent.tsx`
- Filter checkboxes → `<Checkbox>`
- Sort dropdown → `<Select>`
- Pagination → `<Button variant="outline">`
- Empty/error states → use CSS vars

---

## PHASE 5: Checkout Page (`src/app/checkout/page.tsx`)
- All `<input>` → `<Input>`
- All `<label>` → `<Label>`
- All `<button>` → `<Button>`
- Step indicators → `<Badge>`
- Error → shadcn pattern
- Order summary → `<Card>`
- Radio buttons → `<RadioGroup>` (install) or keep

---

## PHASE 6: Account Page (`src/app/account/page.tsx`)
- Tab buttons → `<Tabs>`
- Sidebar nav → `<Button variant="ghost">`
- Form → `<Input>` + `<Label>`
- Avatar → `<Avatar>`
- Order cards → `<Card>`

---

## PHASE 7: Info Pages

### 7.1 Contact
- Form → `<Input>`, `<Select>`, `<Textarea>`
- Info blocks → `<Card>`
- Social → `<Button variant="outline" size="icon">`
- All `#0D0D0D` → `bg-background`, `#1A1A1A` → `bg-card`, `#C9A962` → `text-primary`

### 7.2 Returns
- Form → `<Input>`, `<Select>`, `<Textarea>`
- Submit → `<Button>`
- Info cards → `<Card>`
- Color hardcodes → CSS vars

### 7.3 Shipping
- Cards → `<Card>`
- Country items → `<Badge variant="outline">`
- Color hardcodes → CSS vars

### 7.4 Track Order
- Form → `<Input>`
- Buttons → `<Button>`
- Cards → `<Card>`
- Color hardcodes → CSS vars

### 7.5 Gift Cards
- Amount buttons → `<Button>`
- Form → `<Input>`, `<Textarea>`
- Info cards → `<Card>`

### 7.6 Collections
- Cards → `<Card>`
- Arrow icon → `ArrowRight` from `lucide-react`

### 7.7 About
- Value cards → `<Card>`
- Color hardcodes → CSS vars

---

## PHASE 8: HomePage (`src/components/HomePage.tsx`)
- Trust cards → `<Card>`
- Newsletter → `<Input>` + `<Button>`
- Testimonials → `<Card>`
- Star SVGs → `Star` from `lucide-react`
- Inline `style={{ backgroundColor }}` → Tailwind CSS var classes

---

## PHASE 9: Component Refinements

### 9.1 ProductCard
- Add to Cart `<button>` → `<Button>`
- Badges → `<Badge>`

### 9.2 Footer
- Social buttons → `<Button variant="outline" size="icon">`
- Color hardcodes → CSS vars

### 9.3 Header
- Social SVGs → `lucide-react` icons
- Minor CSS var cleanup

### 9.4 CartSidebar
- Quantity controls → `<Button variant="ghost">`
- Remove → `X` from `lucide-react`

---

## PHASE 10: Empty Routes
Create: blog, cookies, privacy, terms - consistent pattern.

---

## EXECUTION ORDER
Phase 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10
Lint after each phase.
