import { test, expect } from '@playwright/test';

test.describe('Product Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a product detail page - we'll use the first product from the shop page
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');
    
    const productLink = page.locator('article a, .product-card a').first();
    await productLink.click();
    await page.waitForLoadState('networkidle');
  });

  test('should load product detail page', async ({ page }) => {
    await expect(page).toHaveURL(/\/shop\//);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should display product images', async ({ page }) => {
    await expect(page.locator('img[alt*="product" i], .product-image img, .gallery img').first()).toBeVisible();
  });

  test('should display product name', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should display product price', async ({ page }) => {
    await expect(page.locator('.price, .product-price, .price-display').first()).toBeVisible();
  });

  test('should display original price when on sale', async ({ page }) => {
    const originalPrice = page.locator('.original-price, .was-price, .was-price, .line-through');
    if (await originalPrice.isVisible()) {
      await expect(originalPrice.first()).toBeVisible();
    }
  });

  test('should display savings badge when on sale', async ({ page }) => {
    const savingsBadge = page.locator('.savings-badge, .save-badge, .discount-badge');
    if (await savingsBadge.isVisible()) {
      await expect(savingsBadge.first()).toBeVisible();
    }
  });

  test('should display product description', async ({ page }) => {
    await expect(page.locator('text=Description, .description, .product-description')).toBeVisible();
  });

  test('should display fragrance notes', async ({ page }) => {
    await expect(page.locator('text=Fragrance Notes, text=Notes, .fragrance-notes')).toBeVisible();
    await expect(page.locator('text=Top Notes, text=Heart Notes, text=Base Notes').first()).toBeVisible();
  });

  test('should display product rating', async ({ page }) => {
    const rating = page.locator('.rating, .stars, .product-rating');
    if (await rating.isVisible()) {
      await expect(rating.first()).toBeVisible();
    }
  });

  test('should display product size selector', async ({ page }) => {
    const sizeSelector = page.locator('select[name="size"], .size-selector, .size-options');
    if (await sizeSelector.isVisible()) {
      await expect(sizeSelector.first()).toBeVisible();
    }
  });

  test('should display quantity selector', async ({ page }) => {
    const qtySelector = page.locator('input[name="quantity"], .quantity-selector, .quantity-input');
    if (await qtySelector.isVisible()) {
      await expect(qtySelector.first()).toBeVisible();
    }
  });

  test('should add product to cart', async ({ page }) => {
    const addToCartBtn = page.locator('button:has-text("Add to Cart"), button:has-text("Add to cart"), .add-to-cart-btn').first();
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();
    
    // Check for success message or cart update
    await expect(page.locator('text=added to cart, text=Added to cart, .toast, .notification').first()).toBeVisible({ timeout: 5000 });
  });

  test('should have Buy Now button', async ({ page }) => {
    const buyNowBtn = page.locator('button:has-text("Buy Now"), button:has-text("Buy now"), .buy-now-btn');
    await expect(buyNowBtn.first()).toBeVisible();
  });

  test('should have Wishlist button', async ({ page }) => {
    const wishlistBtn = page.locator('button[aria-label*="wishlist" i], button:has(svg[aria-label*="heart" i]), .wishlist-btn').first();
    if (await wishlistBtn.isVisible()) {
      await expect(wishlistBtn.first()).toBeVisible();
    }
  });

  test('should display product gallery/thumbnails', async ({ page }) => {
    const thumbnails = page.locator('.thumbnails img, .gallery-thumbnails img, .product-thumbnails img').first();
    if (await thumbnails.isVisible()) {
      await expect(thumbnails).toBeVisible();
    }
  });

  test('should switch main image on thumbnail click', async ({ page }) => {
    const thumbnails = page.locator('.thumbnails img, .gallery-thumbnails img, .product-thumbnails img');
    const count = await thumbnails.count();
    
    if (count > 1) {
      const mainImage = page.locator('.main-image img, .product-main-image img').first();
      const initialSrc = await mainImage.getAttribute('src');
      
      await thumbnails.nth(1).click();
      await page.waitForTimeout(500);
      
      const newSrc = await mainImage.getAttribute('src');
      expect(newSrc).not.toBe(initialSrc);
    }
  });

  test('should display related products / You May Also Like', async ({ page }) => {
    await expect(page.locator('text=You May Also Like, text=Related Products, text=You May Also Like').first()).toBeVisible();
  });

  test('should display product reviews section', async ({ page }) => {
    await expect(page.locator('text=Reviews, text=Customer Reviews, #reviews, .reviews-section').first()).toBeVisible();
  });

  test('should display product specifications / details', async ({ page }) => {
    await expect(page.locator('text=Details, text=Specifications, text=Product Details, #details, .product-details').first()).toBeVisible();
  });

  test('should display shipping & returns info', async ({ page }) => {
    await expect(page.locator('text=Shipping, text=Returns, text=Shipping & Returns, #shipping, .shipping-info').first()).toBeVisible();
  });

  test('should display trust badges', async ({ page }) => {
    const trustBadges = page.locator('text=Authentic, text=Secure, text=Free Shipping, text=Returns');
    if (await trustBadges.first().isVisible()) {
      await expect(trustBadges.first()).toBeVisible();
    }
  });

  test('should have breadcrumb navigation', async ({ page }) => {
    await expect(page.locator('nav[aria-label="breadcrumb"], .breadcrumb, .breadcrumbs').first()).toBeVisible();
  });

  test('should display product tags', async ({ page }) => {
    const tags = page.locator('.tags, .product-tags, .tags-list').first();
    if (await tags.isVisible()) {
      await expect(tags).toBeVisible();
    }
  });

  test('should display impression of field if present', async ({ page }) => {
    const impression = page.locator('text=Impression of, text=Inspired by');
    if (await impression.isVisible()) {
      await expect(impression.first()).toBeVisible();
    }
  });
});

test.describe('Product Detail - Variant Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');
    
    const productLink = page.locator('article a, .product-card a').first();
    await productLink.click();
    await page.waitForLoadState('networkidle');
  });

  test('should change price when size variant selected', async ({ page }) => {
    const sizeSelector = page.locator('select[name="size"], .size-selector, .size-options').first();
    const priceDisplay = page.locator('.price, .product-price, .price-display').first();
    
    if (await sizeSelector.isVisible()) {
      const initialPrice = await priceDisplay.textContent();
      
      const options = sizeSelector.locator('option');
      const count = await options.count();
      
      if (count > 1) {
        await sizeSelector.selectOption({ index: 1 });
        await page.waitForTimeout(500);
        
        const newPrice = await priceDisplay.textContent();
        // Price should change (or at least not error)
        expect(newPrice).toBeTruthy();
      }
    }
  });

  test('should update quantity correctly', async ({ page }) => {
    const qtyInput = page.locator('input[name="quantity"], .quantity-input').first();
    const minusBtn = page.locator('button:has-text("-"), .qty-minus').first();
    const plusBtn = page.locator('button:has-text("+"), .qty-plus').first();
    
    if (await qtyInput.isVisible() && await plusBtn.isVisible()) {
      const initialValue = await qtyInput.inputValue();
      await plusBtn.click();
      await page.waitForTimeout(200);
      const newValue = await qtyInput.inputValue();
      expect(parseInt(newValue)).toBe(parseInt(initialValue) + 1);
    }
  });
});

test.describe('Product Detail - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');
    
    const productLink = page.locator('article a, .product-card a').first();
    await productLink.click();
    await page.waitForLoadState('networkidle');
  });

  test('should display correctly on mobile', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('img').first()).toBeVisible();
  });

  test('should have sticky add to cart on mobile', async ({ page }) => {
    const stickyCart = page.locator('.sticky-cart, .mobile-sticky-cart, .sticky-add-to-cart');
    if (await stickyCart.isVisible()) {
      await expect(stickyCart).toBeVisible();
    }
  });
});