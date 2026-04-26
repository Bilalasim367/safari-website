# Safari Perfumes E-commerce Website Specification

## 1. Project Overview

**Project Name:** Safari Perfumes E-commerce Website
**Project Type:** Full-featured e-commerce web application
**Core Functionality:** A luxury perfume e-commerce website with product catalog, shopping cart, checkout, and admin capabilities
**Target Users:** Luxury fragrance enthusiasts seeking premium perfumes

---

## 2. UI/UX Specification

### 2.1 Layout Structure

**Header (Sticky)**
- Logo on left (text-based "SAFARI" with elegant styling)
- Navigation links center: Shop, Collections, About, Contact
- Right side: Search icon, User icon, Cart icon with item count
- Height: 80px desktop, 70px mobile

**Hero Section (Homepage)**
- Full viewport width, 85vh height
- Background: Dark luxurious image with gradient overlay
- Centered content: Tagline, headline, CTA button
- Subtle parallax effect

**Content Sections**
- Featured Collections: 4-column grid (desktop), 2-column (tablet), 1-column (mobile)
- Best Sellers: Horizontal scroll carousel
- About Section: 2-column layout (image + text)
- Testimonials: Card-based grid
- Newsletter: Full-width section with email signup

**Footer**
- 4-column layout (desktop), stacked (mobile)
- Columns: Shop, Customer Service, About Us, Social/Newsletter
- Bottom bar: Copyright, payment icons, legal links

### 2.2 Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### 2.3 Visual Design

**Color Palette**
- Primary Dark: `#0D0D0D` (near black)
- Secondary Dark: `#1A1A1A` (dark charcoal)
- Accent Gold: `#C9A962` (luxurious gold)
- Accent Gold Light: `#E5D4A1` (soft gold)
- Text Primary: `#FFFFFF` (white)
- Text Secondary: `#A0A0A0` (muted gray)
- Border Color: `#2D2D2D` (subtle dark gray)
- Success: `#4CAF50`
- Error: `#E53935`

**Typography**
- Headings: "Playfair Display", serif (elegant, luxury feel)
- Body: "Inter", sans-serif (clean, readable)
- Accent Text: "Cormorant Garamond", serif (for special elements)
- Font Sizes:
  - H1: 56px / 3.5rem (desktop), 36px / 2.25rem (mobile)
  - H2: 40px / 2.5rem (desktop), 28px / 1.75rem (mobile)
  - H3: 28px / 1.75rem (desktop), 22px / 1.375rem (mobile)
  - Body: 16px / 1rem
  - Small: 14px / 0.875rem
  - Caption: 12px / 0.75rem

**Spacing System**
- Base unit: 4px
- XS: 4px | SM: 8px | MD: 16px | LG: 24px | XL: 32px | 2XL: 48px | 3XL: 64px | 4XL: 96px

**Visual Effects**
- Box shadows: `0 4px 20px rgba(0, 0, 0, 0.3)` for cards
- Hover transitions: 0.3s ease-in-out
- Gold gradient: `linear-gradient(135deg, #C9A962 0%, #E5D4A1 50%, #C9A962 100%)`
- Subtle grain texture overlay on hero
- Image hover: scale 1.05 with overflow hidden

### 2.4 Components

**Buttons**
- Primary: Gold background (#C9A962), dark text, hover darkens
- Secondary: Transparent with gold border, gold text, hover fills
- Size: 48px height, 24px horizontal padding

**Product Cards**
- Image container with aspect ratio 3:4
- Overlay on hover with quick view button
- Product name, price below image
- Wishlist icon in corner

**Form Inputs**
- Dark background (#1A1A1A)
- Gold border on focus
- 48px height
- Rounded corners (4px)

**Modal/Cart Sidebar**
- Slide-in from right
- Dark overlay background
- Close button and clear cart option

---

## 3. Functionality Specification

### 3.1 Core Features

**Navigation**
- Sticky header with background blur on scroll
- Mobile hamburger menu with slide-in drawer
- Search modal with autocomplete
- Cart icon with item count badge

**Homepage**
- Hero section with video/image background
- Featured collections grid (4 items)
- Best sellers carousel (8 products)
- New arrivals section
- Brand story excerpt
- Testimonials section (3 reviews)
- Newsletter signup form

**Shop Page**
- Grid view (3 columns desktop, 2 tablet, 1 mobile)
- Sidebar filters:
  - Category (Men, Women, Unisex)
  - Size (30ml, 50ml, 100ml)
  - Price range
  - Fragrance family (Floral, Woody, Oriental, Fresh)
- Sort dropdown (Featured, Price Low-High, Price High-Low, Newest)
- Pagination (12 products per page)
- Quick view on hover

**Product Detail Page**
- Image gallery with thumbnail navigation
- Product info: Name, price, rating
- Size/volume selector dropdown
- Quantity selector
- Add to Cart button with animation
- Accordion sections:
  - Description
  - Notes (Top, Heart, Base)
  - Ingredients
- Customer reviews with rating breakdown
- Related products section (4 items)

**Shopping Cart**
- Slide-out cart sidebar
- Product list with image, name, size, quantity, price
- Quantity update (+/- buttons)
- Remove item option
- Subtotal calculation
- Proceed to checkout button
- Continue shopping link

**Checkout Page (UI only)**
- Multi-step form:
  - Shipping Information
  - Payment Method (placeholder)
  - Order Review
- Order summary sidebar

**About Page**
- Brand story with timeline
- Mission and values
- Team section (optional)
- Image gallery

**Contact Page**
- Contact form (name, email, subject, message)
- Contact information (email, phone, address)
- Embedded map placeholder

### 3.2 User Interactions

- Smooth scroll behavior
- Page transitions
- Button hover effects
- Card hover animations
- Form validation feedback
- Toast notifications for cart actions
- Loading states for async actions

### 3.3 Data Handling

- Static product data (JSON)
- Local storage for cart persistence
- React Context for cart state management

### 3.4 Edge Cases

- Empty cart state
- No search results
- Product not found (404)
- Form validation errors
- Empty product filters

---

## 4. Page Structure

```
/                    - Homepage
/shop                - All Products
/shop/[slug]         - Product Detail
/about               - About Us
/contact             - Contact Us
/cart                - Cart Page
/checkout            - Checkout Page
```

---

## 5. Acceptance Criteria

### Visual Checkpoints
- [ ] Dark luxury aesthetic with gold accents throughout
- [ ] Consistent typography hierarchy
- [ ] Responsive layout works on all breakpoints
- [ ] Smooth animations and transitions
- [ ] Professional product imagery

### Functional Checkpoints
- [ ] Navigation works between all pages
- [ ] Products display with correct information
- [ ] Filter and sort functionality works
- [ ] Cart adds/removes products correctly
- [ ] Cart persists on page refresh
- [ ] Forms validate and submit
- [ ] Mobile menu works correctly

### Technical Checkpoints
- [ ] No console errors
- [ ] Fast page load times
- [ ] Clean URL structure
- [ ] Semantic HTML
- [ ] Accessible (proper ARIA labels)
