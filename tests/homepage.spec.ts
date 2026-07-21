import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load homepage successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/SAFARI/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should display Hero section', async ({ page }) => {
    await expect(page.locator('section').first()).toBeVisible();
  });

  test('should display Hot Selling Carousel', async ({ page }) => {
    await expect(page.locator('text=Hot Selling').first()).toBeVisible();
    await expect(page.locator('[data-testid="hot-selling-carousel"], .hot-selling-carousel, section:has-text("Hot Selling")').first()).toBeVisible();
  });

  test('should display Trending for Him section with correct products', async ({ page }) => {
    await expect(page.locator('text=Trending for Him')).toBeVisible();
    const menProducts = page.locator('section:has-text("Trending for Him") >> .. >> article');
    const count = await menProducts.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(4);
  });

  test('should display Trending for Her section with correct products', async ({ page }) => {
    await expect(page.locator('text=Trending for Her')).toBeVisible();
    const womenProducts = page.locator('section:has-text("Trending for Her") >> .. >> article');
    const count = await womenProducts.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(4);
  });

  test('should display Unisex Trending section with correct products', async ({ page }) => {
    await expect(page.locator('text=Unisex Trending')).toBeVisible();
    const unisexProducts = page.locator('section:has-text("Unisex Trending") >> .. >> article');
    const count = await unisexProducts.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(4);
  });

  test('should display Featured Collections section', async ({ page }) => {
    await expect(page.locator('text=Featured Collections')).toBeVisible();
    await expect(page.locator('text=Attar Collection')).toBeVisible();
    await expect(page.locator('text=Perfumes Collection')).toBeVisible();
  });

  test('should display Brand Story section', async ({ page }) => {
    await expect(page.locator('text=Brand Story, text=Our Story')).toBeVisible();
  });

  test('should display Testimonials section', async ({ page }) => {
    await expect(page.locator('text=Testimonials, text=Customer Reviews')).toBeVisible();
  });

  test('should display Newsletter signup', async ({ page }) => {
    await expect(page.locator('text=Newsletter, text=Subscribe')).toBeVisible();
  });
});

test.describe('Homepage Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to Shop page from navbar', async ({ page }) => {
    await page.click('a[href="/shop"], nav >> text=Shop');
    await expect(page).toHaveURL(/.*shop/);
  });

  test('should navigate to Collections page', async ({ page }) => {
    await page.click('a[href="/collections"], nav >> text=Collections');
    await expect(page).toHaveURL(/.*collections/);
  });

  test('should navigate to Bundles page', async ({ page }) => {
    await page.click('a[href="/bundles"], nav >> text=Bundles');
    await expect(page).toHaveURL(/.*bundles/);
  });

  test('should open Attar Collection dropdown', async ({ page }) => {
    await page.hover('nav >> text=Attar Collection');
    await expect(page.locator('text=Men')).toBeVisible();
    await expect(page.locator('text=Women')).toBeVisible();
    await expect(page.locator('text=Unisex')).toBeVisible();
  });

  test('should navigate to Men Attar Collection', async ({ page }) => {
    await page.hover('nav >> text=Attar Collection');
    await page.click('text=Men');
    await expect(page).toHaveURL(/shop.*type=attar.*gender=men/);
  });

  test('should navigate to Women Perfume Collection', async ({ page }) => {
    await page.hover('nav >> text=Perfumes Collection');
    await page.click('text=Women');
    await expect(page).toHaveURL(/shop.*type=perfume.*gender=women/);
  });
});