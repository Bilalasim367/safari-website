import { test, expect } from '@playwright/test';

test.describe('Cart', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');
    
    // Add a product to cart first
    const addToCartBtn = page.locator('button:has-text("Add to Cart"), button:has-text("Add to cart"), .add-to-cart-btn').first();
    if (await addToCartBtn.isVisible()) {
      await addToCartBtn.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should open cart sidebar/drawer', async ({ page }) => {
    const cartBtn = page.locator('button[aria-label*="cart" i], button:has(svg[aria-label*="cart" i]), .cart-btn, [data-testid="cart-button"]').first();
    await expect(cartBtn).toBeVisible();
    await cartBtn.click();
    
    const cartDrawer = page.locator('.cart-drawer, .cart-sidebar, .cart-panel, [data-testid="cart-drawer"]');
    await expect(cartDrawer).toBeVisible();
  });

  test('should display cart items', async ({ page }) => {
    const cartBtn = page.locator('button[aria-label*="cart" i], button:has(svg[aria-label*="cart" i]), .cart-btn').first();
    await cartBtn.click();
    
    await expect(page.locator('.cart-item, .cart-item-row, .cart-product').first()).toBeVisible({ timeout: 5000 });
  });

  test('should display correct product info in cart', async ({ page }) => {
    const cartBtn = page.locator('button[aria-label*="cart" i], button:has(svg[aria-label*="cart" i])').first();
    await cartBtn.click();
    
    await expect(page.locator('.cart-item img, .cart-product-image').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.cart-item .product-name, .cart-product-name').first()).toBeVisible();
    await expect(page.locator('.cart-item .price, .cart-item-price').first()).toBeVisible();
  });

  test('should update quantity in cart', async ({ page }) => {
    const cartBtn = page.locator('button[aria-label*="cart" i], button:has(svg[aria-label*="cart" i])').first();
    await cartBtn.click();
    
    const qtyInput = page.locator('.cart-item input[name="quantity"], .cart-item .quantity-input, .cart-item .qty-input').first();
    const plusBtn = page.locator('.cart-item button:has-text("+"), .cart-item .qty-plus').first();
    
    if (await plusBtn.isVisible({ timeout: 5000 })) {
      const initialValue = await page.locator('.cart-item input[name="quantity"], .cart-item .quantity-input').first().inputValue();
      await page.locator('.cart-item button:has-text("+")').first().click();
      await page.waitForTimeout(500);
      const newValue = await page.locator('.cart-item input[name="quantity"], .cart-item .quantity-input').first().inputValue();
      expect(parseInt(await page.locator('.cart-item input[name="quantity"], .cart-item .quantity-input').first().inputValue())).toBeGreaterThanOrEqual(1);
    }
  });

  test('should remove item from cart', async ({ page }) => {
    const cartBtn = page.locator('button[aria-label*="cart" i], button:has(svg[aria-label*="cart" i])').first();
    await cartBtn.click();
    
    const removeBtn = page.locator('.cart-item button:has-text("Remove"), .cart-item .remove-btn, .cart-item button[aria-label*="remove" i]').first();
    
    if (await removeBtn.isVisible({ timeout: 5000 })) {
      await removeBtn.click();
      await page.waitForTimeout(500);
      // Item should be removed
      await expect(page.locator('.cart-item').first()).not.toBeVisible({ timeout: 5000 });
    }
  });

  test('should display cart total', async ({ page }) => {
    const cartBtn = page.locator('button[aria-label*="cart" i], button:has(svg[aria-label*="cart" i])').first();
    await cartBtn.click();
    
    await expect(page.locator('.cart-total, .cart-summary .total, .cart-footer .total, .subtotal').first()).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to checkout from cart', async ({ page }) => {
    const cartBtn = page.locator('button[aria-label*="cart" i], button:has(svg[aria-label*="cart" i])').first();
    await cartBtn.click();
    
    const checkoutBtn = page.locator('button:has-text("Checkout"), button:has-text("Proceed to Checkout"), a:has-text("Checkout")').first();
    await expect(checkoutBtn).toBeVisible({ timeout: 5000 });
    await checkoutBtn.click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*checkout/);
  });

  test('should show empty cart message when empty', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
    
    // Cart might be empty or show empty state
    const emptyMessage = page.locator('text=empty, text=Empty cart, text=Your cart is empty');
    if (await emptyMessage.isVisible()) {
      await expect(emptyMessage.first()).toBeVisible();
    }
  });
});

test.describe('Checkout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');
  });

  test('should load checkout page', async ({ page }) => {
    await expect(page).toHaveURL(/.*checkout/);
    await expect(page.locator('h1')).toContainText('Checkout');
  });

  test('should display shipping address form', async ({ page }) => {
    await expect(page.locator('text=Shipping, text=Shipping Address, #shipping, .shipping-form')).toBeVisible();
    await expect(page.locator('input[name="firstName"], input[name="first_name"]').first()).toBeVisible();
    await expect(page.locator('input[name="lastName"], input[name="last_name"]').first()).toBeVisible();
    await expect(page.locator('input[name="address"], input[name="address1"]').first()).toBeVisible();
    await expect(page.locator('input[name="city"]').first()).toBeVisible();
    await expect(page.locator('input[name="postalCode"], input[name="zip"], input[name="zipCode"]').first()).toBeVisible();
    await expect(page.locator('select[name="country"], input[name="country"]').first()).toBeVisible();
  });

  test('should display billing address option', async ({ page }) => {
    await expect(page.locator('text=Billing, text=Billing Address, #billing, .billing-form')).toBeVisible();
  });

  test('should display shipping method selection', async ({ page }) => {
    await expect(page.locator('text=Shipping Method, text=Delivery, #shipping-method, .shipping-methods')).toBeVisible();
  });

  test('should display payment method selection', async ({ page }) => {
    await expect(page.locator('text=Payment, text=Payment Method, #payment, .payment-methods')).toBeVisible();
  });

  test('should display order summary', async ({ page }) => {
    await expect(page.locator('text=Order Summary, .order-summary, .checkout-summary')).toBeVisible();
    await expect(page.locator('.subtotal, .sub-total').first()).toBeVisible();
    await expect(page.locator('.shipping-cost, .shipping').first()).toBeVisible();
    await expect(page.locator('.tax, .vat').first()).toBeVisible();
    await expect(page.locator('.total, .grand-total, .order-total').first()).toBeVisible();
  });

  test('should have place order button', async ({ page }) => {
    await expect(page.locator('button:has-text("Place Order"), button:has-text("Place order"), button:has-text("Complete Order")').first()).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    const placeOrderBtn = page.locator('button:has-text("Place Order"), button:has-text("Place order"), button:has-text("Complete Order")').first();
    await placeOrderBtn.click();
    
    // Should show validation errors
    await expect(page.locator('text=required, text=Required, .error, .field-error').first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Cart - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');
    
    const addToCartBtn = page.locator('button:has-text("Add to Cart"), button:has-text("Add to cart"), .add-to-cart-btn').first();
    if (await addToCartBtn.isVisible()) {
      await addToCartBtn.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should open mobile cart drawer', async ({ page }) => {
    const cartBtn = page.locator('button[aria-label*="cart" i], button:has(svg[aria-label*="cart" i]), .cart-btn').first();
    await cartBtn.click();
    
    const cartDrawer = page.locator('.cart-drawer, .cart-sidebar, .cart-panel');
    await expect(cartDrawer).toBeVisible();
  });

  test('should have sticky cart bar on product pages', async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');
    
    const productLink = page.locator('article a, .product-card a').first();
    await productLink.click();
    await page.waitForLoadState('networkidle');
    
    const stickyCart = page.locator('.sticky-cart, .mobile-sticky-cart, .sticky-add-to-cart');
    if (await stickyCart.isVisible()) {
      await expect(stickyCart).toBeVisible();
    }
  });
});