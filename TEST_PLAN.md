# Playwright Test Plan - Safari Perfumes E-commerce

## Test Coverage Overview

### Test Suites Created:
1. **homepage.spec.ts** - Homepage sections, navigation, featured collections
2. **shop.spec.ts** - Shop page, filters, collection routes, product grid
3. **product-detail.spec.ts** - Product detail page, variants, gallery, reviews
4. **cart-checkout.spec.ts** - Cart drawer, checkout flow, validation
4. **admin.spec.ts** - Admin authentication, products, categories, orders
5. **comprehensive.spec.ts** - Search API, Products API, search overlay
6. **cart-checkout.spec.ts** - Cart drawer, checkout flow, wishlist, account

---

## Test Coverage Areas

### 1. Homepage Tests (`homepage.spec.ts`)
- ✅ Homepage loads with Hero section
- ✅ Hot Selling Carousel displays
- ✅ Trending for Him/Her/Unisex sections
- ✅ Featured Collections section
- ✅ Brand Story section
- ✅ Testimonials section
- ✅ Newsletter signup
- ✅ Navigation: Shop, Collections, Bundles
- ✅ Navbar dropdowns (Attar/Perfume collections)
- ✅ Collection navigation links

### 2. Shop Page Tests (`shop.spec.ts`)
- ✅ Product grid display
- ✅ Filter sidebar: Category, Gender, Size, Fragrance Family, Price, Type
- ✅ Sort options (price, newest, rating)
- ✅ Collection routes (Attar/Perfume + Gender)
- ✅ Bestsellers/New Arrivals filters
- ✅ Product grid display
- ✅ Pagination
- ✅ Collection routes (for-him, for-her, unisex, attars, etc.)

### 3. Product Detail Page
- Product images & gallery
- Product info (name, price, description)
- Fragrance notes (top/heart/base)
- Size selection & price updates
- Add to cart / Buy now / Wishlist
- Quantity selector
- Product gallery/thumbnails
- Reviews section
- Related products
- Product specifications
- Shipping & returns info
- Trust badges
- Breadcrumb navigation
- Product tags
- Impression of field
- Size variant price updates
- Quantity increment/decrement
- Mobile responsive layout
- Sticky add-to-cart on mobile

### 4. Cart & Checkout
- Cart drawer/sidebar
- Cart items display
- Quantity updates
- Item removal
- Cart total calculation
- Checkout navigation
- Empty cart state
- Shipping address form
- Billing address (same as shipping option)
- Shipping method selection
- Payment method selection
- Order summary (subtotal, shipping, tax, total)
- Place order button
- Form validation
- Order confirmation
- Mobile cart drawer
- Sticky add-to-cart on mobile

### 5. Admin Panel
- **Authentication**: Login, logout, dashboard
- **Products**: List, search, filter (gender, type, status), create/edit/delete
- **Categories**: CRUD operations
- **Orders**: List, filter by status, view details
- **Settings**: Store, email, payment tabs
- **Categories management**: CRUD operations

### 5. Search & API
- Search overlay open/close
- Search with results
- Search navigation to product
- No results handling
- Search API endpoints
- Products API (filter, sort, paginate)
- Products home API (bestsellers, new)
- Search API with gender/type filters

### 6. Shop Filters
- Category filter
- Gender filter (Men/Women/Unisex)
- Size filter
- Fragrance Family filter
- Price range filter
- Product Type filter (Attar/Perfume)
- Sort select (price, newest, rating)
- Clear all filters

### 7. Cart & Checkout Flow
- Add to cart
- Cart drawer/sidebar
- Quantity updates
- Item removal
- Cart total
- Checkout navigation
- Empty cart handling
- Shipping address form
- Billing address
- Shipping method selection
- Payment method selection
- Order summary
- Place order
- Form validation
- Order confirmation

### 8. Admin Panel
- Login/logout
- Dashboard with stats
- Products CRUD with filters
- Categories CRUD
- Orders management
- Settings tabs

### 9. User Account
- Dashboard
- Order history
- Order details
- Profile/settings
- Address book
- Wishlist

### 10. Footer & Legal
- Footer links
- Privacy Policy
- Terms of Service
- Contact
- Shipping/Returns
- Social media links
- Newsletter signup

### 11. Mobile Responsiveness
- Mobile cart drawer
- Sticky add-to-cart
- Mobile navigation drawer
- Touch-friendly interactions

---

## Test Execution Commands

```bash
# Run all tests
npm run test

# Run specific test suite
npx playwright test tests/homepage.spec.ts
npx playwright test tests/shop.spec.ts
npx playwright test tests/product-detail.spec.ts
npx playwright test tests/cart-checkout.spec.ts
npx playwright test tests/admin.spec.ts
npx playwright test tests/comprehensive.spec.ts
npx playwright test tests/cart-checkout.spec.ts

# Run with specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"

# Run with UI mode
npx playwright test --ui

# Run headed (visible browser)
npx playwright test --headed

# Run with trace
npx playwright test --trace on

# Generate report
npx playwright show-report
```

## Test Data Requirements

### Required Test Accounts
- Admin: `admin@safari.com` / `password123`
- Customer: `test@example.com` / `password123`

### Required Test Products
- Products with various genders (Men, Women, Unisex)
- Products with different types (Attar, Perfume)
- Products with isTrending=true, isHotSelling=true, isNew=true
- Products with isBestseller=true
- Products with different categories (men, women, unisex)
- Products with different fragrance families
- Products with different price ranges

### Test Environment Setup
1. Start dev server: `npm run dev` (port 3001)
2. Ensure database has test data (run seed if needed)
3. Run tests: `npm run test` or `npx playwright test`

---

## CI/CD Integration

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test
        env:
          PLAYWRIGHT_BASE_URL: http://localhost:3001
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

---

## Test Maintenance Notes

1. **Selector Strategy**: Prefer semantic selectors (`role`, `text`, `label`) over CSS classes
2. **Wait Strategies**: Use `waitForLoadState('networkidle')` and explicit waits
3. **Test Data**: Use unique identifiers (timestamps) for created entities
4. **Cleanup**: Tests should clean up created data or use unique identifiers
5. **Flaky Tests**: Use retries for flaky network-dependent tests
6. **Mobile Testing**: Test critical paths on mobile viewports

---

## Reporting

- HTML Reporter: `npx playwright show-report`
- Trace Viewer: `npx playwright show-trace trace.zip`
- JSON Results: `npx playwright test --reporter=json`
- JUnit XML: `npx playwright test --reporter=junit`

---

## Debugging Failed Tests

1. Run with `--headed` to see browser
2. Use `--debug` for step-by-step debugging
3. Check trace: `npx playwright show-trace trace.zip`
4. Screenshots on failure (auto-captured)
5. Check dev server logs for API errors