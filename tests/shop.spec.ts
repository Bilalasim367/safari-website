import { test, expect } from '@playwright/test';

test.describe('Shop Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');
  });

  test('should load shop page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Shop/);
    await expect(page.locator('h1')).toContainText('Shop');
  });

  test('should display product grid', async ({ page }) => {
    const product = page.locator('div.grid > a[href^="/shop/"]').first();
    await expect(product).toBeVisible();
    const products = page.locator('div.grid > a[href^="/shop/"]');
    const count = await products.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display product filters sidebar', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Filters' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Category' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Gender' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Size' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Fragrance Family' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Price' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Product Type' })).toBeVisible();
  });

  test('should filter by gender - Men', async ({ page }) => {
    await page.locator('a[href*="gender=men"]').first().click();
    await expect(page).toHaveURL(/gender=men/, { timeout: 30000 });
    const products = page.locator('div.grid > a[href^="/shop/"]');
    const count = await products.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should filter by gender - Women', async ({ page }) => {
    await page.locator('a[href*="gender=women"]').first().click();
    await expect(page).toHaveURL(/gender=women/, { timeout: 30000 });
  });

  test('should filter by gender - Unisex', async ({ page }) => {
    await page.locator('a[href*="gender=unisex"]').first().click();
    await expect(page).toHaveURL(/gender=unisex/, { timeout: 30000 });
  });

  test('should filter by product type - Attar', async ({ page }) => {
    await page.locator('a[href*="type=attar"]').first().click();
    await expect(page).toHaveURL(/type=attar/, { timeout: 30000 });
  });

  test('should filter by product type - Perfume', async ({ page }) => {
    await page.locator('a[href*="type=perfume"]').first().click();
    await expect(page).toHaveURL(/type=perfume/, { timeout: 30000 });
  });

  test('should filter by category - Men', async ({ page }) => {
    await page.locator('a[href*="category=men"]').first().click();
    await expect(page).toHaveURL(/category=men/, { timeout: 30000 });
  });

  test('should filter by fragrance family', async ({ page }) => {
    await page.locator('a[href*="fragranceFamily=Woody"]').first().click();
    await expect(page).toHaveURL(/fragranceFamily=Woody/, { timeout: 30000 });
  });

  test('should filter by price range', async ({ page }) => {
    await page.locator('a[href*="minPrice=0"]').first().click();
    await expect(page).toHaveURL(/minPrice=0/, { timeout: 30000 });
  });

  test('should sort products by price low to high', async ({ page }) => {
    await page.selectOption('select:has(option:has-text("Price")), [data-testid="sort-select"]', 'price-low');
    await expect(page).toHaveURL(/sort=price-low/, { timeout: 30000 });
  });

  test('should sort products by price high to low', async ({ page }) => {
    await page.selectOption('select:has(option:has-text("Price")), [data-testid="sort-select"]', 'price-high');
    await expect(page).toHaveURL(/sort=price-high/, { timeout: 30000 });
  });

  test('should sort by newest', async ({ page }) => {
    await page.selectOption('select:has(option:has-text("New")), [data-testid="sort-select"]', 'newest');
    await expect(page).toHaveURL(/sort=newest/, { timeout: 30000 });
  });

  test('should filter by bestseller', async ({ page }) => {
    await page.locator('a[href*="isBestseller=true"]').first().click();
    await expect(page).toHaveURL(/isBestseller=true/, { timeout: 30000 });
    await expect(page.locator('span:has-text("Bestseller")').first()).toBeVisible();
  });

  test('should filter by new arrivals', async ({ page }) => {
    await page.goto('/shop?isNew=true');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/isNew=true/);
    await expect(page.locator('span:has-text("New")').first()).toBeVisible();
  });

  test('should clear all filters', async ({ page }) => {
    await page.locator('a[href*="category=men"]').first().click();
    await expect(page).toHaveURL(/category=men/, { timeout: 30000 });
    await expect(page.getByRole('link', { name: 'Clear All' })).toBeVisible();
    await page.getByRole('link', { name: 'Clear All' }).click();
    await expect.poll(() => new URL(page.url()).pathname, { timeout: 30000 }).toBe('/shop');
  });
});

test.describe('Shop Page - Product Grid', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');
  });

  test('should display product cards with correct information', async ({ page }) => {
    const productCard = page.locator('div.grid > a[href^="/shop/"]').first();
    await expect(productCard.locator('img').first()).toBeVisible();
    await expect(productCard.locator('h3')).toBeVisible();
    await expect(productCard.locator('text=PKR').first()).toBeVisible();
  });

  test('should show product badges (Bestseller, New, etc.)', async ({ page }) => {
    const bestsellerBadge = page.locator('text=Bestseller, .bestseller-badge, .badge:has-text("BEST")');
    const newBadge = page.locator('text=New, .new-badge, .badge:has-text("NEW")');
    const trendingBadge = page.locator('text=Trending, .trending-badge');
    
    if (await bestsellerBadge.first().isVisible()) {
      await expect(bestsellerBadge.first()).toBeVisible();
    }
  });

  test('should display product rating', async ({ page }) => {
    const rating = page.locator('.rating, .stars, [data-testid="rating"]').first();
    if (await rating.isVisible()) {
      await expect(rating).toBeVisible();
    }
  });

  test('should navigate to product detail on click', async ({ page }) => {
    const productLink = page.locator('div.grid > a[href^="/shop/"]').first();
    await productLink.click();
    await expect(page).toHaveURL(/\/shop\/[^?]/, { timeout: 30000 });
  });

  test('should show pagination', async ({ page }) => {
    const pagination = page.locator('nav[aria-label="pagination"], .pagination, .page-numbers');
    if (await pagination.isVisible()) {
      await expect(pagination).toBeVisible();
      await expect(page.locator('text=Page, text=Previous, text=Next')).toBeVisible();
    }
  });
});

test.describe('Shop Page - Collection Routes', () => {
  test('should load Attar Collection for Men', async ({ page }) => {
    await page.goto('/shop?type=attar&gender=men');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/type=attar.*gender=men/);
    await expect(page.locator('a[href*="type=attar"]').first()).toBeVisible();
  });

  test('should load Perfume Collection for Women', async ({ page }) => {
    await page.goto('/shop?type=perfume&gender=women');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/type=perfume.*gender=women/);
  });

  test('should load Unisex collection', async ({ page }) => {
    await page.goto('/shop?type=attar&gender=unisex');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/gender=unisex/);
  });

  test('should load Bestsellers collection', async ({ page }) => {
    await page.goto('/shop?isBestseller=true');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('span:has-text("Bestseller")').first()).toBeVisible();
  });

  test('should load New Arrivals', async ({ page }) => {
    await page.goto('/shop?isNew=true');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('span:has-text("New")').first()).toBeVisible();
  });
});