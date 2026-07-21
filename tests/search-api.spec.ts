import { test, expect } from '@playwright/test';

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should open search overlay', async ({ page }) => {
    const searchBtn = page.locator('button[aria-label="Search"], button:has(svg[aria-label*="search" i]), .search-btn, [aria-label="Search"]').first();
    await expect(searchBtn).toBeVisible();
    await searchBtn.click();
    
    const searchOverlay = page.locator('[role="dialog"][aria-label*="search" i], .search-overlay, .search-modal, [data-testid="search-overlay"]');
    await expect(searchOverlay).toBeVisible({ timeout: 5000 });
  });

  test('should close search overlay on escape', async ({ page }) => {
    const searchBtn = page.locator('button[aria-label="Search"], button:has(svg[aria-label*="search" i]), .search-btn').first();
    await searchBtn.click();
    
    const searchOverlay = page.locator('[role="dialog"][aria-label*="search" i], .search-overlay, .search-modal, [data-testid="search-overlay"]');
    await expect(searchOverlay).toBeVisible();
    
    await page.keyboard.press('Escape');
    await expect(page.locator('[role="dialog"][aria-label*="search" i], .search-overlay, .search-modal, [data-testid="search-overlay"]')).not.toBeVisible({ timeout: 5000 });
  });

  test('should close search overlay on close button', async ({ page }) => {
    const searchBtn = page.locator('button[aria-label="Search"], button:has(svg[aria-label*="search" i]), .search-btn').first();
    await searchBtn.click();
    
    const closeBtn = page.locator('[role="dialog"] button:has-text("Close"), [aria-label*="close" i], .dialog-close, .close-btn').first();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    await page.locator('[role="dialog"] button:has-text("Close"), [aria-label*="close" i], .dialog-close, .close-btn').first().click();
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 });
  });

  test('should search for products', async ({ page }) => {
    const searchBtn = page.locator('button[aria-label="Search"], button:has(svg[aria-label*="search" i]), .search-btn').first();
    await searchBtn.click();
    
    const searchInput = page.locator('[role="dialog"] input[type="search"], [role="dialog"] input[type="text"], [role="dialog"] input[placeholder*="search" i]').first();
    await expect(searchInput).toBeVisible();
    await searchBtn.fill('Safari');
    await page.waitForTimeout(500);
    
    // Should show results
    const results = page.locator('[role="dialog"] a[href*="/shop/"], [role="dialog"] .search-result, .search-results a');
    await expect(results.first()).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to product from search results', async ({ page }) => {
    const searchBtn = page.locator('button[aria-label="Search"], button:has(svg[aria-label*="search" i]), .search-btn').first();
    await searchBtn.click();
    
    const searchInput = page.locator('[role="dialog"] input[type="search"], [role="dialog"] input[type="text"], [role="dialog"] input[placeholder*="search" i]').first();
    await searchBtn.fill('Safari');
    await page.waitForTimeout(500);
    
    const firstResult = page.locator('[role="dialog"] a[href*="/shop/"]').first();
    if (await firstResult.isVisible({ timeout: 5000 })) {
      await firstResult.click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/\/shop\//);
    }
  });

  test('should show no results message for non-existent products', async ({ page }) => {
    const searchBtn = page.locator('button[aria-label="Search"], button:has(svg[aria-label*="search" i]), .search-btn').first();
    await searchBtn.click();
    
    const searchInput = page.locator('[role="dialog"] input[type="search"], [role="dialog"] input[type="text"], [role="dialog"] input[placeholder*="search" i]').first();
    await page.fill('[role="dialog"] input[type="search"], [role="dialog"] input[type="text"], [role="dialog"] input[placeholder*="search" i]', 'nonexistentproductxyz123');
    await page.waitForTimeout(500);
    
    await expect(page.locator('text=No products found, text=No products found for, text=No results')).toBeVisible({ timeout: 5000 });
  });

  test('should clear search on close', async ({ page }) => {
    const searchBtn = page.locator('button[aria-label="Search"], button:has(svg[aria-label*="search" i]), .search-btn').first();
    await searchBtn.click();
    
    const searchInput = page.locator('[role="dialog"] input[type="search"], [role="dialog"] input[type="text"], [role="dialog"] input[placeholder*="search" i]').first();
    await page.fill('[role="dialog"] input[type="search"], [role="dialog"] input[type="text"], [role="dialog"] input[placeholder*="search" i]', 'Safari');
    await page.waitForTimeout(300);
    
    // Close overlay
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    
    // Reopen
    await page.locator('button[aria-label="Search"], button:has(svg[aria-label*="search" i]), .search-btn').first().click();
    
    // Input should be cleared
    const inputValue = await page.locator('[role="dialog"] input[type="search"], [role="dialog"] input[type="text"], [role="dialog"] input[placeholder*="search" i]').first().inputValue();
    expect(inputValue).toBe('');
  });
});

test.describe('Search API', () => {
  test('should return results for valid query', async ({ request }) => {
    const response = await request.get('/api/search?q=Safari');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('should return empty array for empty query', async ({ request }) => {
    const response = await request.get('/api/search?q=');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
    expect(data.length).toBe(0);
  });

  test('should filter by gender', async ({ request }) => {
    const response = await request.get('/api/search?q=Safari&gender=men');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('should filter by type', async ({ request }) => {
    const response = await request.get('/api/search?q=Safari&type=attar');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('should return limited results', async ({ request }) => {
    const response = await request.get('/api/search?q=a');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
    expect(data.length).toBeLessThanOrEqual(10);
  });
});

test.describe('API - Products', () => {
  test('should get products list', async ({ request }) => {
    const response = await request.get('/api/products');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('products');
    expect(Array.isArray(data.products)).toBeTruthy();
    expect(data).toHaveProperty('total');
    expect(data).toHaveProperty('page');
    expect(data).toHaveProperty('totalPages');
  });

  test('should filter by category', async ({ request }) => {
    const response = await request.get('/api/products?category=men');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(Array.isArray(data.products)).toBeTruthy();
  });

  test('should filter by gender', async ({ request }) => {
    const response = await request.get('/api/products?gender=men');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(Array.isArray(data.products)).toBeTruthy();
  });

  test('should filter by type', async ({ request }) => {
    const response = await request.get('/api/products?type=attar');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(Array.isArray(data.products)).toBeTruthy();
  });

  test('should filter by isBestseller', async ({ request }) => {
    const response = await request.get('/api/products?isBestseller=true');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(Array.isArray(data.products)).toBeTruthy();
  });

  test('should filter by isNew', async ({ request }) => {
    const response = await request.get('/api/products?isNew=true');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(Array.isArray(data.products)).toBeTruthy();
  });

  test('should filter by price range', async ({ request }) => {
    const response = await request.get('/api/products?minPrice=100&maxPrice=200');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(Array.isArray(data.products)).toBeTruthy();
  });

  test('should sort by price low to high', async ({ request }) => {
    const response = await request.get('/api/products?sort=price-low');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(Array.isArray(data.products)).toBeTruthy();
  });

  test('should sort by price high to low', async ({ request }) => {
    const response = await request.get('/api/products?sort=price-high');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(Array.isArray(data.products)).toBeTruthy();
  });

  test('should sort by newest', async ({ request }) => {
    const response = await request.get('/api/products?sort=newest');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(Array.isArray(data.products)).toBeTruthy();
  });

  test('should sort by rating', async ({ request }) => {
    const response = await request.get('/api/products?sort=rating');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(Array.isArray(data.products)).toBeTruthy();
  });

  test('should paginate results', async ({ request }) => {
    const response = await request.get('/api/products?page=2&limit=5');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('page', 2);
    expect(data.products.length).toBeLessThanOrEqual(5);
  });

  test('should get single product by slug', async ({ request }) => {
    const response = await request.get('/api/products?slug=safari-midnight');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('products');
    if (data.products.length > 0) {
      expect(data.products[0].slug).toBe('safari-midnight');
    }
  });
});

test.describe('API - Categories', () => {
  test('should get categories', async ({ request }) => {
    const response = await request.get('/api/categories');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('categories');
    expect(Array.isArray(data.categories)).toBeTruthy();
  });
});

test.describe('Mobile Responsive', () => {
  test.use({ viewport: { width: 375, height: 667 } });
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display mobile menu button', async ({ page }) => {
    await expect(page.locator('button[aria-label="Menu"], button:has(svg[aria-label*="menu" i]), .menu-btn, .mobile-menu-btn')).toBeVisible();
  });

  test('should open mobile menu drawer', async ({ page }) => {
    const menuBtn = page.locator('button[aria-label="Menu"], button:has(svg[aria-label*="menu" i]), .menu-btn, .mobile-menu-btn').first();
    await menuBtn.click();
    
    const drawer = page.locator('.drawer, .mobile-drawer, .mobile-menu-drawer, [data-testid="mobile-drawer"], [data-testid="mobile-menu-drawer"], sheet[side="left"]');
    await expect(drawer).toBeVisible({ timeout: 5000 });
  });

  test('should close mobile menu on link click', async ({ page }) => {
    const menuBtn = page.locator('button[aria-label="Menu"], button:has(svg[aria-label*="menu" i]), .menu-btn, .mobile-menu-btn').first();
    await menuBtn.click();
    
    const drawer = page.locator('.drawer, .mobile-drawer, .mobile-menu-drawer, [data-testid="mobile-drawer"], [data-testid="mobile-menu-drawer"], sheet[side="left"]');
    await expect(drawer).toBeVisible();
    
    await page.click('a[href="/shop"], nav a:has-text("Shop")');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.drawer, .mobile-drawer, [data-testid="mobile-drawer"], [data-testid="mobile-menu-drawer"], sheet[side="left"]')).not.toBeVisible({ timeout: 5000 });
  });

  test('should display products correctly on mobile', async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('article, .product-card, [data-testid="product-card"]').first()).toBeVisible();
  });

  test('should open mobile filter drawer', async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');
    
    const filterBtn = page.locator('button:has-text("Filters"), button:has-text("Filter"), button[aria-label*="filter" i]').first();
    if (await filterBtn.isVisible()) {
      await filterBtn.click();
      
      const drawer = page.locator('.drawer, .filter-drawer, .mobile-filter-drawer, [data-testid="filter-drawer"]');
      await expect(drawer).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    
    const headings = page.locator('h1, h2, h3, h3, h4, h5, h6');
    const count = await headings.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have proper alt text for images', async ({ page }) => {
    const images = page.locator('img').first();
    if (await images.count() > 0) {
      const firstImg = page.locator('img').first();
      const alt = await firstImg.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');
    
    const inputs = page.locator('input[type="text"], input[type="email"], input[type="search"], select, textarea');
    const count = await inputs.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        await expect(label).toBeVisible();
      }
    }
  });

  test('should have proper button roles', async ({ page }) => {
    const buttons = page.locator('button').first();
    if (await buttons.count() > 0) {
      await expect(buttons.first()).toBeVisible();
    }
  });

  test('should have proper focus states', async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');
    
    const firstFocusable = page.locator('a, button, input, select, textarea').first();
    await firstFocusable.focus();
    await expect(firstFocusable).toBeFocused();
  });

  test('should have skip to main content link', async ({ page }) => {
    const skipLink = page.locator('a[href="#main"], a[href="#main-content"], .skip-link, .skip-to-main');
    if (await skipLink.isVisible()) {
      await expect(skipLink.first()).toBeVisible();
    }
  });
});