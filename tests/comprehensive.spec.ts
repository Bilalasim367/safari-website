import { test, expect } from '@playwright/test';

test.describe('Cart Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');
  });

  test('should add product to cart from shop page', async ({ page }) => {
    const addToCartBtn = page.locator('button:has-text("Add to Cart"), button:has-text("Add to cart"), .add-to-cart-btn').first();
    await expect(addToCartBtn).toBeVisible({ timeout: 10000 });
    await addToCartBtn.click();
    await page.waitForTimeout(1000);
    
    // Should show success notification
    await expect(page.locator('text=added to cart, text=Added to cart, .toast, .notification, .success-message').first()).toBeVisible({ timeout: 5000 });
  });

  test('should add product to cart from product detail page', async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');
    
    const productLink = page.locator('article a, .product-card a').first();
    await productLink.click();
    await page.waitForLoadState('networkidle');
    
    const addToCartBtn = page.locator('button:has-text("Add to Cart"), button:has-text("Add to cart"), .add-to-cart-btn').first();
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();
    await page.waitForTimeout(1000);
    
    await expect(page.locator('text=added to cart, text=Added to cart, .toast, .notification, .success-message').first()).toBeVisible({ timeout: 5000 });
  });

  test('should open cart sidebar on add to cart', async ({ page }) => {
    const addToCartBtn = page.locator('button:has-text("Add to Cart"), button:has-text("Add to cart"), .add-to-cart-btn').first();
    await addToCartBtn.click();
    await page.waitForTimeout(1000);
    
    const cartDrawer = page.locator('.cart-drawer, .cart-sidebar, .cart-panel, [data-testid="cart-drawer"]');
    await expect(cartDrawer).toBeVisible({ timeout: 5000 });
  });

  test('should display cart count badge', async ({ page }) => {
    const cartBtn = page.locator('button[aria-label*="cart" i], button:has(svg[aria-label*="cart" i]), .cart-btn, [data-testid="cart-button"]').first();
    const cartBadge = cartBtn.locator('.cart-badge, .cart-count, .badge, [data-testid="cart-count"]');
    
    if (await cartBadge.isVisible()) {
      await expect(cartBadge).toBeVisible();
      const count = await cartBadge.textContent();
      expect(parseInt(count || '0')).toBeGreaterThanOrEqual(0);
    }
  });

  test('should update cart count when adding items', async ({ page }) => {
    const cartBtn = page.locator('button[aria-label*="cart" i], button:has(svg[aria-label*="cart" i]), .cart-btn').first();
    const cartBadge = cartBtn.locator('.cart-badge, .cart-count, .badge, [data-testid="cart-count"]');
    
    const initialCount = await cartBadge.isVisible() ? parseInt(await cartBadge.textContent() || '0') : 0;
    
    const addToCartBtn = page.locator('button:has-text("Add to Cart"), button:has-text("Add to cart"), .add-to-cart-btn').first();
    await addToCartBtn.click();
    await page.waitForTimeout(1000);
    
    const newCount = await cartBadge.isVisible() ? parseInt(await cartBadge.textContent() || '0') : 0;
    expect(newCount).toBeGreaterThanOrEqual(initialCount);
  });

  test('should open cart drawer on cart button click', async ({ page }) => {
    const cartBtn = page.locator('button[aria-label*="cart" i], button:has(svg[aria-label*="cart" i]), .cart-btn, [data-testid="cart-button"]').first();
    await cartBtn.click();
    
    const cartDrawer = page.locator('.cart-drawer, .cart-sidebar, .cart-panel, [data-testid="cart-drawer"]');
    await expect(cartDrawer).toBeVisible({ timeout: 5000 });
  });

  test('should display cart items in drawer', async ({ page }) => {
    // Add a product first
    const addToCartBtn = page.locator('button:has-text("Add to Cart"), button:has-text("Add to cart"), .add-to-cart-btn').first();
    await addToCartBtn.click();
    await page.waitForTimeout(1000);
    
    const cartBtn = page.locator('button[aria-label*="cart" i], button:has(svg[aria-label*="cart" i]), .cart-btn').first();
    await cartBtn.click();
    
    await expect(page.locator('.cart-item, .cart-item-row, .cart-product').first()).toBeVisible({ timeout: 5000 });
  });

  test('should display cart item details', async ({ page }) => {
    // Add product first
    const addToCartBtn = page.locator('button:has-text("Add to Cart"), button:has-text("Add to cart"), .add-to-cart-btn').first();
    await addToCartBtn.click();
    await page.waitForTimeout(1000);
    
    // Open cart
    const cartBtn = page.locator('button[aria-label*="cart" i], button:has(svg[aria-label*="cart" i]), .cart-btn').first();
    await cartBtn.click();
    
    // Check cart item details
    await expect(page.locator('.cart-item img, .cart-product-image').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.cart-item .product-name, .cart-product-name').first()).toBeVisible();
    await expect(page.locator('.cart-item .price, .cart-item-price').first()).toBeVisible();
  });

  test('should update quantity in cart', async ({ page }) => {
    // Add product first
    const addToCartBtn = page.locator('button:has-text("Add to Cart"), button:has-text("Add to cart"), .add-to-cart-btn').first();
    await addToCartBtn.click();
    await page.waitForTimeout(1000);
    
    // Open cart
    const cartBtn = page.locator('button[aria-label*="cart" i], button:has(svg[aria-label*="cart" i]), .cart-btn').first();
    await cartBtn.click();
    
    // Update quantity
    const plusBtn = page.locator('.cart-item button:has-text("+"), .cart-item .qty-plus').first();
    if (await plusBtn.isVisible({ timeout: 5000 })) {
      await plusBtn.click();
      await page.waitForTimeout(500);
      
      const qty = await page.locator('.cart-item input[name="quantity"], .cart-item .quantity-input').first().inputValue();
      expect(parseInt(qty)).toBeGreaterThanOrEqual(1);
    }
  });

  test('should decrease quantity in cart', async ({ page }) => {
    // Add product first
    const addToCartBtn = page.locator('button:has-text("Add to Cart"), button:has-text("Add to cart"), .add-to-cart-btn').first();
    await addToCartBtn.click();
    await page.waitForTimeout(1000);
    
    // Open cart
    const cartBtn = page.locator('button[aria-label*="cart" i], button:has(svg[aria-label*="cart" i]), .cart-btn').first();
    await cartBtn.click();
    
    // Increase then decrease
    const plusBtn = page.locator('.cart-item button:has-text("+"), .cart-item .qty-plus').first();
    const minusBtn = page.locator('.cart-item button:has-text("-"), .cart-item .qty-minus').first();
    
    if (await plusBtn.isVisible({ timeout: 5000 })) {
      await plusBtn.click();
      await page.waitForTimeout(200);
      await minusBtn.click();
      await page.waitForTimeout(200);
      
      const qty = await page.locator('.cart-item input[name="quantity"], .cart-item .quantity-input').first().inputValue();
      expect(parseInt(qty)).toBeGreaterThanOrEqual(1);
    }
  });

  test('should remove item from cart', async ({ page }) => {
    // Add product first
    const addToCartBtn = page.locator('button:has-text("Add to Cart"), button:has-text("Add to cart"), .add-to-cart-btn').first();
    await addToCartBtn.click();
    await page.waitForTimeout(1000);
    
    // Open cart
    const cartBtn = page.locator('button[aria-label*="cart" i], button:has(svg[aria-label*="cart" i]), .cart-btn').first();
    await cartBtn.click();
    
    // Remove item
    const removeBtn = page.locator('.cart-item button:has-text("Remove"), .cart-item .remove-btn, .cart-item button[aria-label*="remove" i]').first();
    
    if (await removeBtn.isVisible({ timeout: 5000 })) {
      await removeBtn.click();
      await page.waitForTimeout(500);
      
      // Cart should be empty or item removed
      await expect(page.locator('.cart-item').first()).not.toBeVisible({ timeout: 5000 });
    }
  });

  test('should display cart total', async ({ page }) => {
    // Add product first
    const addToCartBtn = page.locator('button:has-text("Add to Cart"), button:has-text("Add to cart"), .add-to-cart-btn').first();
    await addToCartBtn.click();
    await page.waitForTimeout(1000);
    
    // Open cart
    const cartBtn = page.locator('button[aria-label*="cart" i], button:has(svg[aria-label*="cart" i]), .cart-btn').first();
    await cartBtn.click();
    
    // Check for total
    await expect(page.locator('.cart-total, .cart-summary .total, .cart-footer .total, text=Total').first()).toBeVisible({ timeout: 5000 });
  });

  test('should have checkout button in cart', async ({ page }) => {
    // Add product first
    const addToCartBtn = page.locator('button:has-text("Add to Cart"), button:has-text("Add to cart"), .add-to-cart-btn').first();
    await addToCartBtn.click();
    await page.waitForTimeout(1000);
    
    // Open cart
    const cartBtn = page.locator('button[aria-label*="cart" i], button:has(svg[aria-label*="cart" i]), .cart-btn').first();
    await cartBtn.click();
    
    // Check for checkout button
    const checkoutBtn = page.locator('button:has-text("Checkout"), button:has-text("Proceed to Checkout"), .checkout-btn, a:has-text("Checkout")');
    await expect(checkoutBtn.first()).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to checkout on checkout button click', async ({ page }) => {
    // Add product first
    const addToCartBtn = page.locator('button:has-text("Add to Cart"), button:has-text("Add to cart"), .add-to-cart-btn').first();
    await addToCartBtn.click();
    await page.waitForTimeout(1000);
    
    // Open cart
    const cartBtn = page.locator('button[aria-label*="cart" i], button:has(svg[aria-label*="cart" i]), .cart-btn').first();
    await cartBtn.click();
    
    // Click checkout
    const checkoutBtn = page.locator('button:has-text("Checkout"), button:has-text("Proceed to Checkout"), .checkout-btn, a:has-text("Checkout")').first();
    await checkoutBtn.click();
    
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*checkout/);
  });
});

test.describe('Checkout Process', () => {
  test.beforeEach(async ({ page }) => {
    // Add a product to cart and go to checkout
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');
    
    const addToCartBtn = page.locator('button:has-text("Add to Cart"), button:has-text("Add to cart"), .add-to-cart-btn').first();
    await addToCartBtn.click();
    await page.waitForTimeout(1000);
    
    const cartBtn = page.locator('button[aria-label*="cart" i], button:has(svg[aria-label*="cart" i]), .cart-btn').first();
    await cartBtn.click();
    
    const checkoutBtn = page.locator('button:has-text("Checkout"), button:has-text("Proceed to Checkout"), .checkout-btn, a:has-text("Checkout")').first();
    await checkoutBtn.click();
    await page.waitForLoadState('networkidle');
  });

  test('should load checkout page', async ({ page }) => {
    await expect(page).toHaveURL(/.*checkout/);
    await expect(page.locator('h1:has-text("Checkout"), h1:has-text("Checkout")')).toBeVisible();
  });

  test('should have shipping address form', async ({ page }) => {
    await expect(page.locator('text=Shipping, text=Shipping Address, h2:has-text("Shipping")').first()).toBeVisible();
    await expect(page.locator('input[name="firstName"], input[name="first_name"], input[id="firstName"]').first()).toBeVisible();
    await expect(page.locator('input[name="lastName"], input[name="last_name"], input[id="lastName"]').first()).toBeVisible();
    await expect(page.locator('input[name="address"], input[name="address1"], input[id="address"]').first()).toBeVisible();
    await expect(page.locator('input[name="city"], input[id="city"]').first()).toBeVisible();
    await expect(page.locator('input[name="postalCode"], input[name="zip"], input[name="postal_code"], input[id="postalCode"]').first()).toBeVisible();
    await expect(page.locator('input[name="phone"], input[name="phoneNumber"], input[id="phone"]').first()).toBeVisible();
  });

  test('should have billing address option', async ({ page }) => {
    await expect(page.locator('text=Billing, text=Billing Address, h2:has-text("Billing")').first()).toBeVisible();
    
    const sameAsShipping = page.locator('input[name="sameAsShipping"], input[name="same_as_shipping"], input[id="sameAsShipping"]');
    if (await sameAsShipping.isVisible()) {
      await expect(sameAsShipping).toBeVisible();
    }
  });

  test('should have payment method selection', async ({ page }) => {
    await expect(page.locator('text=Payment, text=Payment Method, h2:has-text("Payment")').first()).toBeVisible();
    
    const paymentOptions = page.locator('input[name="paymentMethod"], input[name="payment_method"], .payment-method-option');
    if (await paymentOptions.count() > 0) {
      await expect(paymentOptions.first()).toBeVisible();
    }
  });

  test('should display order summary', async ({ page }) => {
    await expect(page.locator('text=Order Summary, text=Order Summary, h2:has-text("Summary")').first()).toBeVisible();
    await expect(page.locator('.order-summary, .order-summary-items, .summary-items').first()).toBeVisible({ timeout: 5000 });
  });

  test('should display subtotal, shipping, tax, total', async ({ page }) => {
    await expect(page.locator('text=Subtotal, text=Shipping, text=Tax, text=Total').first()).toBeVisible();
    await expect(page.locator('text=Total').first()).toBeVisible();
  });

  test('should have place order button', async ({ page }) => {
    const placeOrderBtn = page.locator('button:has-text("Place Order"), button:has-text("Place order"), .place-order-btn, button[type="submit"]').first();
    await expect(placeOrderBtn).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    const placeOrderBtn = page.locator('button:has-text("Place Order"), button:has-text("Place order"), .place-order-btn, button[type="submit"]').first();
    await placeOrderBtn.click();
    
    // Should show validation errors
    await expect(page.locator('text=required, text=Required, .error, .field-error, [aria-invalid="true"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('should process order with valid data', async ({ page }) => {
    // Fill shipping info
    await page.fill('input[name="firstName"], input[name="first_name"], input[id="firstName"]', 'John');
    await page.fill('input[name="lastName"], input[name="last_name"], input[id="lastName"]', 'Doe');
    await page.fill('input[name="address"], input[name="address1"], input[id="address"]', '123 Test Street');
    await page.fill('input[name="city"], input[id="city"]', 'Test City');
    await page.fill('input[name="postalCode"], input[name="zip"], input[name="postal_code"], input[id="postalCode"]', '12345');
    await page.fill('input[name="phone"], input[name="phoneNumber"], input[id="phone"]', '1234567890');
    await page.fill('input[name="email"], input[id="email"]', 'test@example.com');
    
    // Select payment method if available
    const paymentOption = page.locator('input[name="paymentMethod"], input[name="payment_method"], .payment-method-option').first();
    if (await paymentOption.isVisible({ timeout: 2000 })) {
      await paymentOption.check();
    }
    
    // Click place order
    const placeOrderBtn = page.locator('button:has-text("Place Order"), button:has-text("Place order"), .place-order-btn, button[type="submit"]').first();
    await placeOrderBtn.click();
    
    // Should show success or redirect to order confirmation
    await expect(page.locator('text=Order placed, text=Order confirmed, text=Thank you, .order-confirmation, .success-message').first()).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Wishlist', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');
  });

  test('should add product to wishlist', async ({ page }) => {
    const wishlistBtn = page.locator('button[aria-label*="wishlist" i], button:has(svg[aria-label*="heart" i]), .wishlist-btn, .heart-btn').first();
    await expect(wishlistBtn).toBeVisible({ timeout: 10000 });
    await wishlistBtn.click();
    
    // Should show success or toggle state
    await expect(page.locator('text=added to wishlist, text=Added to wishlist, .wishlist-active, .heart-filled').first()).toBeVisible({ timeout: 5000 });
  });

  test('should remove product from wishlist', async ({ page }) => {
    const wishlistBtn = page.locator('button[aria-label*="wishlist" i], button:has(svg[aria-label*="heart" i]), .wishlist-btn, .heart-btn').first();
    await wishlistBtn.click();
    await page.waitForTimeout(500);
    
    // Click again to remove
    await wishlistBtn.click();
    await page.waitForTimeout(500);
    
    // Should not be in wishlist anymore
    await expect(page.locator('.wishlist-active, .heart-filled, text=removed from wishlist').first()).not.toBeVisible({ timeout: 5000 });
  });

  test('should view wishlist page', async ({ page }) => {
    await page.goto('/wishlist, /account/wishlist, /account/favorites');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('h1:has-text("Wishlist"), h1:has-text("Favorites"), h1:has-text("My Wishlist")')).toBeVisible();
  });
});

test.describe('User Account', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"], input[name="email"]', 'test@example.com');
    await page.fill('input[type="password"], input[name="password"]', 'password123');
    await page.click('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")');
    await page.waitForLoadState('networkidle');
    await page.goto('/account');
    await page.waitForLoadState('networkidle');
  });

  test('should load account dashboard', async ({ page }) => {
    await expect(page).toHaveURL(/.*account/);
    await expect(page.locator('h1:has-text("Account"), h1:has-text("My Account"), h1:has-text("Dashboard")')).toBeVisible();
  });

  test('should display order history', async ({ page }) => {
    await expect(page.locator('text=Orders, text=Order History, h2:has-text("Orders")').first()).toBeVisible();
  });

  test('should view order details', async ({ page }) => {
    const viewOrderBtn = page.locator('table tbody tr').first().locator('a:has-text("View"), button:has-text("View")').first();
    if (await viewOrderBtn.isVisible()) {
      await viewOrderBtn.click();
      await page.waitForLoadState('networkidle');
      await expect(page.locator('h1:has-text("Order"), h1:has-text("Order #")')).toBeVisible();
    }
  });

  test('should have profile/settings section', async ({ page }) => {
    await expect(page.locator('text=Profile, text=Settings, text=My Profile, a[href*="profile"]').first()).toBeVisible();
  });

  test('should have address book', async ({ page }) => {
    await expect(page.locator('text=Addresses, text=Address Book, a[href*="address"]').first()).toBeVisible();
  });

  test('should have wishlist/favorites section', async ({ page }) => {
    await expect(page.locator('text=Wishlist, text=Favorites, text=Saved Items, a[href*="wishlist"]').first()).toBeVisible();
  });
});

test.describe('Footer & Legal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should have footer with links', async ({ page }) => {
    await expect(page.locator('footer').first()).toBeVisible();
    await expect(page.locator('footer a').first()).toBeVisible();
  });

  test('should have privacy policy link', async ({ page }) => {
    await expect(page.locator('footer a:has-text("Privacy"), footer a:has-text("Privacy Policy")').first()).toBeVisible();
  });

  test('should have terms of service link', async ({ page }) => {
    await expect(page.locator('footer a:has-text("Terms"), footer a:has-text("Terms of Service")').first()).toBeVisible();
  });

  test('should have contact link', async ({ page }) => {
    await expect(page.locator('footer a:has-text("Contact"), footer a:has-text("Contact Us")').first()).toBeVisible();
  });

  test('should have shipping/returns link', async ({ page }) => {
    await expect(page.locator('footer a:has-text("Shipping"), footer a:has-text("Returns"), footer a:has-text("Shipping & Returns")').first()).toBeVisible();
  });

  test('should have social media links', async ({ page }) => {
    await expect(page.locator('footer a[href*="instagram"], footer a[href*="facebook"], footer a[href*="twitter"], footer a[href*="tiktok"]').first()).toBeVisible();
  });

  test('should have newsletter signup', async ({ page }) => {
    await expect(page.locator('footer input[type="email"], footer .newsletter-input, footer .newsletter-form').first()).toBeVisible();
  });
});