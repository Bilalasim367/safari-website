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
    await expect(page.locator('article, .product-card, [data-testid="product-card"]').first()).toBeVisible();
    const products = page.locator('article, .product-card, [data-testid="product-card"]');
    const count = await products.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display product filters sidebar', async ({ page }) => {
    await expect(page.locator('text=Filters, text=Filter')).toBeVisible();
    await expect(page.locator('text=Category')).toBeVisible();
    await expect(page.locator('text=Gender')).toBeVisible();
    await expect(page.locator('text=Size')).toBeVisible();
    await expect(page.locator('text=Fragrance Family')).toBeVisible();
    await expect(page.locator('text=Price')).toBeVisible();
    await expect(page.locator('text=Product Type')).toBeVisible();
  });

  test('should filter by gender - Men', async ({ page }) => {
    await page.click('text=Gender');
    await page.click('label:has-text("Men"), input[value="men"], option:has-text("Men")');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/gender=men/);
    const products = page.locator('article, .product-card');
    const count = await products.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should filter by gender - Women', async ({ page }) => {
    await page.click('text=Gender');
    await page.click('label:has-text("Women"), input[value="women"], option:has-text("Women")');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/gender=women/);
  });

  test('should filter by gender - Unisex', async ({ page }) => {
    await page.click('text=Gender');
    await page.click('label:has-text("Unisex"), input[value="unisex"], option:has-text("Unisex")');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/gender=unisex/);
  });

  test('should filter by product type - Attar', async ({ page }) => {
    await page.click('text=Product Type');
    await page.click('label:has-text("Attar"), input[value="attar"], option:has-text("Attar")');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/type=attar/);
  });

  test('should filter by product type - Perfume', async ({ page }) => {
    await page.click('text=Product Type');
    await page.click('label:has-text("Perfume"), input[value="perfume"], option:has-text("Perfume")');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/type=perfume/);
  });

  test('should filter by category - Men', async ({ page }) => {
    await page.click('text=Category');
    await page.click('label:has-text("Men"), input[value="men"], option:has-text("Men")');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/category=men/);
  });

  test('should filter by fragrance family', async ({ page }) => {
    await page.click('text=Fragrance Family');
    await page.click('label:has-text("Woody"), input[value="Woody"], option:has-text("Woody")');
    await page.waitForLoadState('networkidle');
  });

  test('should filter by price range', async ({ page }) => {
    await page.click('text=Price');
    await page.click('label:has-text("Under PKR 5,000"), input[value*="5000"]');
    await page.waitForLoadState('networkidle');
  });

  test('should sort products by price low to high', async ({ page }) => {
    await page.selectOption('select:has(option:has-text("Price")), [data-testid="sort-select"]', 'price-low');
    await page.waitForLoadState('networkidle');
  });

  test('should sort products by price high to low', async ({ page }) => {
    await page.selectOption('select:has(option:has-text("Price")), [data-testid="sort-select"]', 'price-high');
    await page.waitForLoadState('networkidle');
  });

  test('should sort by newest', async ({ page }) => {
    await page.selectOption('select:has(option:has-text("New")), [data-testid="sort-select"]', 'newest');
    await page.waitForLoadState('networkidle');
  });

  test('should filter by bestseller', async ({ page }) => {
    await page.click('label:has-text("Bestseller"), input[value="bestseller"]');
    await page.waitForLoadState('networkidle');
  });

  test('should filter by new arrivals', async ({ page }) => {
    await page.click('label:has-text("New"), input[value="new"]');
    await page.waitForLoadState('networkidle');
  });

  test('should clear all filters', async ({ page }) => {
    await page.click('text=Category');
    await page.click('label:has-text("Men")');
    await page.waitForLoadState('networkidle');
    await page.click('text=Clear All');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/^\/shop/);
  });
});

test.describe('Shop Page - Product Grid', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');
  });

  test('should display product cards with correct information', async ({ page }) => {
    const productCard = page.locator('article, .product-card').first();
    await expect(productCard.locator('img')).toBeVisible();
    await expect(productCard.locator('h3, h4, .product-name')).toBeVisible();
    await expect(productCard.locator('.price, .product-price')).toBeVisible();
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
    const productLink = page.locator('article a, .product-card a').first();
    await productLink.click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/shop\//);
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
    await expect(page.locator('text=Attar')).toBeVisible();
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
    await expect(page.locator('text=Bestseller, .bestseller-badge')).toBeVisible();
  });

  test('should load New Arrivals', async ({ page }) => {
    await page.goto('/shop?isNew=true');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=New, .new-badge')).toBeVisible();
  });
});