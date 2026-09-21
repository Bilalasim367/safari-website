import { test, expect, Page } from '@playwright/test';
import path from 'path';

const ADMIN_EMAIL = 'admin@safari.com';
const ADMIN_PASS = 'Admin123!';
const WA_NUMBER = '923107435020';
const PHONE_DISPLAY = '+92 3107435020';
const LOGIN_TIMEOUT = 30_000;

interface Watcher {
  errors: string[];
  badAssets: string[];
}

function watch(page: Page): Watcher {
  const w: Watcher = { errors: [], badAssets: [] };
  page.on('console', (m) => {
    if (m.type() === 'error') w.errors.push(m.text());
  });
  page.on('response', (r) => {
    if (r.status() >= 400) {
      const url = r.url();
      if (!/\/api\//.test(url) && !/favicon/.test(url)) {
        w.badAssets.push(`${r.status()} ${url}`);
      }
    }
  });
  return w;
}

async function brokenImages(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('img'))
      .filter((i) => i.complete && i.naturalWidth === 0)
      .map((i) => i.getAttribute('src') || '')
  );
}

async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
}

async function adminLogin(page: Page) {
  await page.goto('/admin/login');
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASS);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin\/(?!login)/, { timeout: LOGIN_TIMEOUT });
}

async function openFirstProduct(page: Page): Promise<string> {
  await page.goto('/shop', { waitUntil: 'load' });
  const firstCard = page.locator('main a[href^="/shop/"]').first();
  await expect(firstCard).toBeVisible({ timeout: 30_000 });
  await firstCard.click();
  await page.waitForURL(/\/shop\/[\w-]+/, { timeout: 30_000 });
  return page.url().split('/').pop() || '';
}

const CART_DIALOG = '[role="dialog"]';

test.describe('Homepage', () => {
  test('loads with header, hero, footer phone, socials, and clean assets', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Covered by the dedicated 375px mobile test');
    const w = watch(page);
    await page.goto('/', { waitUntil: 'load' });

    await expect(page).toHaveTitle(/Safari Perfumes/);
    const logo = page.locator('img[alt="SAFARI Logo"]');
    await expect(logo).toBeVisible({ timeout: 30_000 });
    const hero = page.getByRole('heading', { level: 1 });
    await expect(hero).toContainText('Discover Your', { timeout: 30_000 });

    const phone = page.locator('a[href="tel:+923107435020"]');
    await expect(phone).toBeVisible();
    await expect(phone).toContainText(PHONE_DISPLAY);

    const insta = page.locator('footer').getByLabel('Instagram');
    await expect(insta).toHaveAttribute('href', /instagram\.com\/safariperfumesofficial/);
    await expect(insta).toHaveAttribute('target', '_blank');
    const tiktok = page.locator('footer').getByLabel('TikTok');
    await expect(tiktok).toHaveAttribute('href', /tiktok\.com\//);
    await expect(tiktok).toHaveAttribute('target', '_blank');

    const waFloat = page.locator('a[aria-label="Chat with us on WhatsApp"]');
    if ((await waFloat.count()) > 0) {
      await expect(waFloat.first()).toHaveAttribute('href', new RegExp(`wa\\.me/${WA_NUMBER}`));
    }

    await expect(page.getByText('Our Story', { exact: false })).toBeVisible();

    expect(await brokenImages(page)).toEqual([]);
    expect(w.errors).toEqual([]);
    expect(w.badAssets).toEqual([]);
    await expect(page.locator('body')).not.toContainText('Buy 2 Get 1 Free');
  });
});

test.describe('Shop', () => {
  test('lists products with prices, supports sort and filters', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Covered by the dedicated 375px mobile test');
    const w = watch(page);
    await page.goto('/shop', { waitUntil: 'load' });

    const firstCard = page.locator('main a[href^="/shop/"]').first();
    await expect(firstCard).toBeVisible({ timeout: 30_000 });
    await expect(firstCard).toContainText(/PKR|Rs/);

    const sortSelect = page.locator('select').filter({
      has: page.locator('option', { hasText: 'Sort: Featured' }),
    });
    await expect(sortSelect).toBeVisible();
    await sortSelect.selectOption('price-low');
    await expect(page).toHaveURL(/sort=price-low/, { timeout: 10_000 });
    await expect(page.locator('main a[href^="/shop/"]').first()).toBeVisible();

    await page.goto('/shop?isNew=true', { waitUntil: 'load' });
    await expect(page.locator('main a[href^="/shop/"]').first()).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('body')).not.toContainText('Buy 2 Get 1 Free');

    expect(await brokenImages(page)).toEqual([]);
    expect(w.errors).toEqual([]);
    expect(w.badAssets).toEqual([]);
  });
});

test.describe('Product detail', () => {
  test('PDP: info, WhatsApp CTA, scarcity colour, no white strip, qty + cart', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Covered by the dedicated 375px mobile test');
    const w = watch(page);
    const slug = await openFirstProduct(page);

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('main')).toContainText(/PKR|Rs\s?\d/);
    await expect(page.getByText('Description')).toBeVisible();
    await expect(page.getByText('Attar Notes')).toBeVisible();

    const wa = page.locator('a[href^="https://wa.me"]:has-text("Order on WhatsApp")').first();
    await expect(wa).toBeVisible();
    await expect(wa).toHaveAttribute('target', '_blank');
    const waHref = (await wa.getAttribute('href')) || '';
    expect(waHref).toContain(`wa.me/${WA_NUMBER}`);
    expect(waHref).toContain(encodeURIComponent('Assalam o Alaikum!'));
    expect(waHref).toContain(encodeURIComponent(`/shop/${slug}`));

    const scarcity = page
      .getByText(/Only \d+ left in stock|people bought this in the last 24 hours/)
      .first();
    await expect(scarcity).toBeVisible({ timeout: 30_000 });
    const color = await scarcity.evaluate((el) => getComputedStyle(el).color);
    expect(color).toBe('rgb(229, 229, 229)');

    const pdpRoot = page.locator('main > div').first();
    const bg = await pdpRoot.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toBe('rgb(10, 10, 10)');
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);

    await page.getByLabel('Increase quantity').first().click();
    await page.getByRole('button', { name: 'Add to Cart' }).first().click();

    const cartBadge = page.locator('button[aria-label="Cart"] span').first();
    await expect(cartBadge).toHaveText('2', { timeout: 10_000 });

    await expect(page.locator(`${CART_DIALOG} h3`).first()).toBeVisible({ timeout: 10_000 });
    const itemName = (await page.locator(`${CART_DIALOG} h3`).first().textContent())?.trim() || '';
    expect(itemName.length).toBeGreaterThan(0);
    await expect(page.getByText('Subtotal')).toBeVisible();

    const removeBtn = page
      .locator(`${CART_DIALOG} h3`, { hasText: itemName })
      .locator('xpath=ancestor::div[contains(@class,"justify-between")][1]/button');
    await removeBtn.click();
    await expect(
      page.locator(`${CART_DIALOG}`).getByText('Cart is empty', { exact: false }).or(
        page.locator(`${CART_DIALOG}`).getByText('Continue Shopping')
      )
    ).toBeVisible({ timeout: 10_000 });

    expect(w.errors).toEqual([]);
    expect(w.badAssets).toEqual([]);
  });
});

test.describe('Cart → Checkout (real COD order)', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Places a real order — run once');

  test('complete checkout and confirm the order in admin', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Runs on desktop only');
    await page.goto('/shop', { waitUntil: 'load' });
    const firstCard = page.locator('main a[href^="/shop/"]').first();
    await expect(firstCard).toBeVisible({ timeout: 30_000 });
    await firstCard.click();
    await page.waitForURL(/\/shop\/[\w-]+/, { timeout: 30_000 });

    await page.getByRole('button', { name: 'Add to Cart' }).first().click();
    await expect(page.locator(`${CART_DIALOG} h3`).first()).toBeVisible({ timeout: 10_000 });
    const itemName =
      (await page.locator(`${CART_DIALOG} h3`).first().textContent())?.trim() || '';
    await page.getByRole('button', { name: 'Checkout' }).click();
    await page.waitForURL(/\/checkout/, { timeout: 30_000 });

    await page.fill('input[name="email"]', 'playwright@test.local');
    await page.fill('input[name="firstName"]', 'Playwright');
    await page.fill('input[name="lastName"]', 'Tester');
    await page.fill('input[name="address1"]', 'Test House 42');
    await page.fill('input[name="address2"]', 'Phase 5');
    await page.fill('input[name="city"]', 'Karachi');
    await page.fill('input[name="state"]', 'Sindh');
    await page.fill('input[name="zipCode"]', '75500');
    await page.fill('input[name="phone"]', '03001234567');
    await page.getByRole('button', { name: 'Continue to Payment' }).click();
    await page.getByRole('button', { name: 'Review Order' }).click();
    await expect(page.getByText('Shipping Address').first()).toBeVisible();
    await expect(page.getByText(itemName, { exact: false }).first()).toBeVisible();
    await page.getByRole('button', { name: 'Place Order' }).click();
    await page.waitForURL(/\/track\?order=/, { timeout: 30_000 });

    const orderNumber = new URL(page.url()).searchParams.get('order') || '';
    expect(orderNumber).toBeTruthy();
    await expect(page.getByText(orderNumber).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Pending|Placed|Processing|Confirmed/).first()).toBeVisible();

    await adminLogin(page);
    await page.goto('/admin/orders', { waitUntil: 'load' });
    await expect(page.getByText(orderNumber).first()).toBeVisible({ timeout: 30_000 });
  });
});

test.describe('Returns & Exchange form', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Writes a real return request — run once');

  test('submit a return request and confirm it in admin', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Runs on desktop only');
    await page.goto('/returns', { waitUntil: 'load' });
    await expect(page.getByRole('heading', { name: /Returns & Exchange/ })).toBeVisible();

    await page.fill('input[placeholder="Your name"]', 'Playwright User');
    await page.fill('input[placeholder="your@email.com"]', `returns+${Date.now()}@test.local`);
    await page.fill('input[placeholder="03XX-XXXXXXX"]', '03001112233');
    await page.fill('input[placeholder="e.g. Rose Wood by Ajmal"]', 'Playwright Test Perfume');
    await page.locator('select').nth(0).selectOption('3ml');
    await page.locator('select').nth(1).selectOption('defective');
    await page.fill('textarea[placeholder^="Please describe"]', 'Automated e2e test request.');
    await page.getByRole('button', { name: 'Submit Return Request' }).click();

    await expect(page.getByRole('heading', { name: 'Request Received!' })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText('Your Request ID')).toBeVisible();
    const requestId = (await page.locator('p[class*="tracking-widest"]').textContent()) || '';
    expect(requestId.trim().length).toBeGreaterThan(0);

    await adminLogin(page);
    await page.goto('/admin/returns', { waitUntil: 'load' });
    await expect(page.getByText(requestId.trim()).first()).toBeVisible({ timeout: 30_000 });
  });
});

test.describe('Admin — Bulk Price Update (CSV)', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Writes prices from perfume.csv — run once');

  test('upload CSV, preview matches, confirm update', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Runs on desktop only');
    await adminLogin(page);
    await page.goto('/admin/products/bulk-price', { waitUntil: 'load' });

    await page.setInputFiles('input[type="file"]', path.join(__dirname, '..', 'perfume.csv'));
    await page.getByRole('button', { name: 'Preview Changes' }).click();

    const confirmBtn = page.getByRole('button', { name: /Confirm Update \(\d+ products?\)/ });
    await expect(confirmBtn).toBeVisible({ timeout: 60_000 });
    const matchedText = (await confirmBtn.textContent()) || '';
    const matched = parseInt(matchedText.match(/\((\d+)/)?.[1] || '0', 10);
    expect(matched).toBeGreaterThan(300);

    const rows = await page.locator('table tbody tr').count();
    expect(rows).toBeGreaterThan(0);

    await confirmBtn.click();
    await expect(page.getByRole('button', { name: 'Upload Another File' }).first()).toBeVisible({
      timeout: 60_000,
    });
  });
});

test.describe('Storefront console/asset health', () => {
  test('no console errors or 404 assets on key pages', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Covered by the dedicated 375px mobile test');
    const pages = ['/', '/shop', '/returns', '/about'];
    for (const p of pages) {
      const w = watch(page);
      await page.goto(p, { waitUntil: 'load' });
      await expect(page.locator('main').first()).toBeVisible({ timeout: 30_000 });
      expect(w.errors, `console errors on ${p}`).toEqual([]);
      expect(w.badAssets, `bad assets on ${p}`).toEqual([]);
      expect(await brokenImages(page), `broken images on ${p}`).toEqual([]);
    }
  });
});

test.describe('Mobile — 375px viewport', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('homepage and PDP render without horizontal overflow on 375px', async ({ page }) => {
    const w = watch(page);
    await page.goto('/', { waitUntil: 'load' });
    await expect(page.getByRole('button', { name: 'Menu', exact: true })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator('img[alt="SAFARI Logo"]')).toBeVisible();
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);

    await page.getByRole('button', { name: 'Menu', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'MENU' })).toBeVisible();
    await page.keyboard.press('Escape');

    await page.goto('/shop', { waitUntil: 'load' });
    const firstCard = page.locator('main a[href^="/shop/"]').first();
    await expect(firstCard).toBeVisible({ timeout: 30_000 });
    await firstCard.click();
    await page.waitForURL(/\/shop\/[\w-]+/, { timeout: 30_000 });
    await expect(page.getByRole('button', { name: 'Add to Cart' }).first()).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page.locator('a[href^="https://wa.me"]:has-text("Order on WhatsApp")').first()
    ).toBeVisible();
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);

    expect(w.errors).toEqual([]);
    expect(w.badAssets).toEqual([]);
  });
});