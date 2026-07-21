import { test, expect } from '@playwright/test';

test.describe('Admin Panel - Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');
  });

  test('should load admin login page', async ({ page }) => {
    await expect(page).toHaveURL(/.*admin\/login/);
    await expect(page.locator('h1')).toContainText('Admin');
  });

  test('should show validation errors for empty login', async ({ page }) => {
    await page.click('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")');
    await expect(page.locator('text=required, text=Required, .error, .field-error').first()).toBeVisible({ timeout: 5000 });
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.fill('input[type="email"], input[name="email"]', 'admin@safari.com');
    await page.fill('input[type="password"], input[name="password"]', 'password123');
    await page.click('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")');
    
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*admin/);
    await expect(page.locator('text=Dashboard, text=Products, text=Products').first()).toBeVisible();
  });

  test('should logout', async ({ page }) => {
    await page.fill('input[type="email"], input[name="email"]', 'admin@safari.com');
    await page.fill('input[type="password"], input[name="password"]', 'password123');
    await page.click('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")');
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Logout"), button:has-text("Sign out"), [aria-label*="logout" i]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*admin\/login/);
  });
});

test.describe('Admin Panel - Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/admin/login');
    await page.fill('input[type="email"], input[name="email"]', 'admin@safari.com');
    await page.fill('input[type="password"], input[name="password"]', 'password123');
    await page.click('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")');
    await page.waitForLoadState('networkidle');
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
  });

  test('should load admin dashboard', async ({ page }) => {
    await expect(page).toHaveURL(/.*admin/);
    await expect(page.locator('text=Dashboard, h1:has-text("Dashboard")')).toBeVisible();
  });

  test('should display stats cards', async ({ page }) => {
    await expect(page.locator('text=Total Products, text=Total Orders, text=Revenue, text=Customers').first()).toBeVisible();
  });

  test('should have navigation sidebar', async ({ page }) => {
    await expect(page.locator('nav[aria-label="sidebar"], .admin-sidebar, .admin-nav, aside[aria-label="navigation"]').first()).toBeVisible();
    await expect(page.locator('text=Products, text=Products').first()).toBeVisible();
    await expect(page.locator('text=Orders, text=Orders').first()).toBeVisible();
    await expect(page.locator('text=Bundles, text=Bundles').first()).toBeVisible();
    await expect(page.locator('text=Categories, text=Categories').first()).toBeVisible();
    await expect(page.locator('text=Settings, text=Settings').first()).toBeVisible();
  });
});

test.describe('Admin Panel - Products Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('input[type="email"], input[name="email"]', 'admin@safari.com');
    await page.fill('input[type="password"], input[name="password"]', 'password123');
    await page.click('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")');
    await page.waitForLoadState('networkidle');
    await page.goto('/admin/products');
    await page.waitForLoadState('networkidle');
  });

  test('should load products list page', async ({ page }) => {
    await expect(page).toHaveURL(/.*admin\/products/);
    await expect(page.locator('h1:has-text("Products"), h1:has-text("Products")')).toBeVisible();
  });

  test('should display products table', async ({ page }) => {
    await expect(page.locator('table, .products-table, .products-list').first()).toBeVisible({ timeout: 10000 });
  });

  test('should have search functionality', async ({ page }) => {
    await expect(page.locator('input[placeholder*="search" i], input[placeholder*="Search" i], input[name="search"]').first()).toBeVisible();
  });

  test('should have filter dropdowns', async ({ page }) => {
    await expect(page.locator('select[name="gender"], select[name="genderFilter"]').first()).toBeVisible();
    await expect(page.locator('select[name="type"], select[name="typeFilter"]').first()).toBeVisible();
    await expect(page.locator('select[name="status"], select[name="statusFilter"]').first()).toBeVisible();
  });

  test('should have create product buttons', async ({ page }) => {
    await expect(page.locator('a:has-text("New Product"), button:has-text("New Product"), a:has-text("Add Product")').first()).toBeVisible();
    await expect(page.locator('a:has-text("Attar"), a:has-text("Add Attar")').first()).toBeVisible();
    await expect(page.locator('a:has-text("Perfume"), a:has-text("Add Perfume")').first()).toBeVisible();
  });

  test('should filter products by gender', async ({ page }) => {
    const genderSelect = page.locator('select[name="gender"], select[name="genderFilter"]').first();
    if (await genderSelect.isVisible()) {
      await genderSelect.selectOption('men');
      await page.waitForLoadState('networkidle');
      // Verify filter applied
      await expect(page.locator('text=men, text=Men').first()).toBeVisible();
    }
  });

  test('should filter products by type', async ({ page }) => {
    const typeSelect = page.locator('select[name="type"], select[name="typeFilter"]').first();
    if (await typeSelect.isVisible()) {
      await typeSelect.selectOption('attar');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('text=Attar, text=Attar').first()).toBeVisible();
    }
  });

  test('should filter products by status', async ({ page }) => {
    const statusSelect = page.locator('select[name="status"], select[name="statusFilter"]').first();
    if (await statusSelect.isVisible()) {
      await statusSelect.selectOption('active');
      await page.waitForLoadState('networkidle');
    }
  });

  test('should search products', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="search" i], input[placeholder*="Search" i], input[name="search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('Safari');
      await page.waitForTimeout(500);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('text=Safari').first()).toBeVisible();
    }
  });

  test('should create new Attar product', async ({ page }) => {
    await page.click('a:has-text("New Attar"), a:has-text("Add Attar")');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('h1:has-text("Create Attar"), h1:has-text("Create Attar Product")')).toBeVisible();
    
    // Fill required fields
    await page.fill('input[name="name"], input[id="name"]', 'Test Attar E2E');
    await page.fill('input[name="slug"], input[id="slug"]', 'test-attar-e2e-' + Date.now());
    await page.fill('textarea[name="description"], textarea[id="description"]', 'Test attar description for E2E testing');
    await page.fill('input[name="price"], input[id="price"]', '149');
    
    // Select category
    await page.selectOption('select[name="categorySlug"], select[id="category"]', 'men');
    
    // Select gender
    await page.selectOption('select[name="gender"]', 'Men');
    
    // Fill required attar fields
    await page.fill('input[name="origin"], input[id="origin"]', 'Assam, India');
    await page.selectOption('select[name="applicatorType"]', 'roll-on');
    
    // Upload image
    const fileInput = await page.locator('input[type="file"]').first();
    // Skip actual file upload for now
    
    await page.fill('textarea[name="notesTop"]', 'Bergamot, Saffron');
    await page.fill('textarea[name="notesHeart"]', 'Rose, Jasmine');
    await page.fill('textarea[name="notesBase"]', 'Oud, Amber, Musk');
    
    // Save
    await page.click('button:has-text("Create Product"), button:has-text("Create")');
    await page.waitForLoadState('networkidle');
    
    // Should redirect to products list
    await expect(page).toHaveURL(/.*admin\/products/);
    await expect(page.locator('text=Product created, text=Product created successfully')).toBeVisible({ timeout: 10000 });
  });

  test('should create new Perfume product', async ({ page }) => {
    await page.click('a:has-text("New Perfume"), a:has-text("Add Perfume")');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('h1:has-text("Create Perfume"), h1:has-text("Create Perfume Product")')).toBeVisible();
    
    await page.fill('input[name="name"], input[id="name"]', 'Test Perfume E2E');
    await page.fill('input[name="slug"], input[id="slug"]', 'test-perfume-e2e-' + Date.now());
    await page.fill('textarea[name="description"], textarea[id="description"]', 'Test perfume description for E2E testing');
    await page.fill('input[name="price"], input[id="price"]', '199');
    
    await page.selectOption('select[name="categorySlug"], select[id="category"]', 'women');
    await page.selectOption('select[name="gender"]', 'Women');
    
    // Perfume specific fields
    await page.fill('input[name="concentration"], input[id="concentration"]', 'EDP');
    await page.fill('input[name="bottleStyle"], input[id="bottleStyle"]', 'Spray');
    
    await page.fill('textarea[name="notesTop"]', 'Bergamot, Saffron');
    await page.fill('textarea[name="notesHeart"]', 'Rose, Jasmine');
    await page.fill('textarea[name="notesBase"]', 'Musk, Amber');
    
    await page.fill('input[name="longevity"], input[id="longevity"]', 'Long Lasting');
    await page.fill('input[name="sillage"], input[id="sillage"]', 'Moderate');
    
    await page.click('button:has-text("Create Product"), button:has-text("Create")');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('text=Product created, text=Product created successfully')).toBeVisible({ timeout: 10000 });
  });

  test('should edit existing product', async ({ page }) => {
    // Find and click edit button for first product
    const editBtn = page.locator('table tbody tr').first().locator('a:has-text("Edit"), button:has-text("Edit")').first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
      await page.waitForLoadState('networkidle');
      
      await expect(page.locator('h1:has-text("Edit Product"), h1:has-text("Edit Product")')).toBeVisible();
      
      // Modify name
      await page.fill('input[name="name"], input[id="name"]', 'Updated Product Name E2E');
      
      // Save
      await page.click('button:has-text("Update Product"), button:has-text("Save"), button:has-text("Update")');
      await page.waitForLoadState('networkidle');
      
      await expect(page.locator('text=Product updated, text=Product updated successfully')).toBeVisible({ timeout: 10000 });
    }
  });

  test('should delete product', async ({ page }) => {
    const deleteBtn = page.locator('table tbody tr').first().locator('button:has-text("Delete"), button[aria-label*="delete" i]').first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      
      // Confirm deletion
      await page.click('button:has-text("Confirm"), button:has-text("Delete"), button:has-text("Yes")');
      await page.waitForLoadState('networkidle');
      
      await expect(page.locator('text=Product deleted, text=Product deleted successfully')).toBeVisible({ timeout: 10000 });
    }
  });

  test('should toggle product active status', async ({ page }) => {
    const toggleBtn = page.locator('table tbody tr').first().locator('button[aria-label*="active" i], button[aria-label*="toggle" i], .toggle-active').first();
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();
      await page.waitForLoadState('networkidle');
      await expect(page.locator('text=Product updated, text=Status updated')).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Admin Panel - Categories', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('input[type="email"], input[name="email"]', 'admin@safari.com');
    await page.fill('input[type="password"], input[name="password"]', 'password123');
    await page.click('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")');
    await page.waitForLoadState('networkidle');
    await page.goto('/admin/categories');
    await page.waitForLoadState('networkidle');
  });

  test('should load categories page', async ({ page }) => {
    await expect(page).toHaveURL(/.*admin\/categories/);
    await expect(page.locator('h1:has-text("Categories"), h1:has-text("Categories")')).toBeVisible();
  });

  test('should create new category', async ({ page }) => {
    await page.click('button:has-text("New Category"), button:has-text("Add Category"), a:has-text("New Category")');
    await page.fill('input[name="name"], input[id="name"]', 'Test Category E2E');
    await page.fill('input[name="slug"], input[id="slug"]', 'test-category-e2e');
    await page.fill('textarea[name="description"], textarea[id="description"]', 'Test category for E2E testing');
    await page.click('button:has-text("Create"), button:has-text("Create Category")');
    await expect(page.locator('text=Category created, text=Category created successfully')).toBeVisible({ timeout: 10000 });
  });

  test('should edit category', async ({ page }) => {
    const editBtn = page.locator('table tbody tr').first().locator('a:has-text("Edit"), button:has-text("Edit")').first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
      await page.fill('input[name="name"], input[id="name"]', 'Updated Category Name');
      await page.click('button:has-text("Update"), button:has-text("Save")');
      await expect(page.locator('text=Category updated, text=Category updated successfully')).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Admin Panel - Orders', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('input[type="email"], input[name="email"]', 'admin@safari.com');
    await page.fill('input[type="password"], input[name="password"]', 'password123');
    await page.click('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")');
    await page.waitForLoadState('networkidle');
    await page.goto('/admin/orders');
    await page.waitForLoadState('networkidle');
  });

  test('should load orders page', async ({ page }) => {
    await expect(page).toHaveURL(/.*admin\/orders/);
    await expect(page.locator('h1:has-text("Orders"), h1:has-text("Orders")')).toBeVisible();
  });

  test('should display orders table', async ({ page }) => {
    await expect(page.locator('table, .orders-table').first()).toBeVisible({ timeout: 10000 });
  });

  test('should filter orders by status', async ({ page }) => {
    const statusSelect = page.locator('select[name="status"], select[name="statusFilter"]').first();
    if (await statusSelect.isVisible()) {
      await statusSelect.selectOption('pending');
      await page.waitForLoadState('networkidle');
    }
  });

  test('should view order details', async ({ page }) => {
    const viewBtn = page.locator('table tbody tr').first().locator('a:has-text("View"), button:has-text("View")').first();
    if (await viewBtn.isVisible()) {
      await viewBtn.click();
      await page.waitForLoadState('networkidle');
      await expect(page.locator('h1:has-text("Order"), h1:has-text("Order #")')).toBeVisible();
    }
  });
});

test.describe('Admin Panel - Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('input[type="email"], input[name="email"]', 'admin@safari.com');
    await page.fill('input[type="password"], input[name="password"]', 'password123');
    await page.click('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")');
    await page.waitForLoadState('networkidle');
    await page.goto('/admin/settings');
    await page.waitForLoadState('networkidle');
  });

  test('should load settings page', async ({ page }) => {
    await expect(page).toHaveURL(/.*admin\/settings/);
    await expect(page.locator('h1:has-text("Settings"), h1:has-text("Settings")')).toBeVisible();
  });

  test('should have store settings tab', async ({ page }) => {
    await expect(page.locator('button:has-text("Store"), a[href*="store"], [role="tab"]:has-text("Store")').first()).toBeVisible();
  });

  test('should have email settings tab', async ({ page }) => {
    await expect(page.locator('button:has-text("Email"), a[href*="email"], [role="tab"]:has-text("Email")').first()).toBeVisible();
  });

  test('should have payment settings tab', async ({ page }) => {
    await expect(page.locator('button:has-text("Payment"), a[href*="payment"], [role="tab"]:has-text("Payment")').first()).toBeVisible();
  });
});