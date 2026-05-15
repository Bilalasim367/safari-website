# Plan: Order Tracking & Email Notification System

> Date: 2026-05-15
> Status: In Progress

## Problem
- `/track` page shows fake mock data — never queries real DB
- No `trackingNumber` field on Order model
- No email sending capability despite SMTP fields existing in Settings
- Customer account shows basic order list but no status timeline

## Phases

### Phase 1: Database Schema
- Add `trackingNumber`, `shippedAt`, `estimatedDelivery` to Order model
- Run migration

### Phase 2: Email Utility
- Install `nodemailer`
- Create `src/lib/email.ts` — reads SMTP from Settings, exports `sendOrderShippedEmail()`

### Phase 3: Admin Tracking Number + Ship Notification
- Update admin orders API to accept `trackingNumber`
- Add tracking number input in admin order dialog
- Create `/api/orders/ship-notification` endpoint to trigger email
- Wire: when status → "shipped" with tracking number → send email

### Phase 4: Rewrite Track Page
- Replace mock data with real `GET /api/orders/[id]` lookup
- Support `?order=ORDER_NUMBER` URL param
- Display real status, tracking number, items, address
- Timeline driven by actual `status` value

### Phase 5: Customer Account Status
- Show color-coded status badges on account orders list
- Show tracking number link when available
- Add progress indicator (Order Placed → Processing → Shipped → Delivered)

### Phase 6: Order Placement Notification
- Create in-app notification when order is placed
- `prisma.notification.create({ type: 'order', ... })`

## Files Changed
| File | Change |
|------|--------|
| `prisma/schema.prisma` | +`trackingNumber`, `shippedAt`, `estimatedDelivery` |
| `src/lib/email.ts` | New — nodemailer SMTP utility |
| `package.json` | +`nodemailer`, +`@types/nodemailer` |
| `src/app/api/orders/route.ts` | Notification on order creation |
| `src/app/api/orders/ship-notification/route.ts` | New — trigger email |
| `src/app/api/admin/orders/route.ts` | Accept `trackingNumber` |
| `src/app/admin/orders/page.tsx` | Tracking number input in dialog |
| `src/app/track/page.tsx` | Real data lookup, no more mock |
| `src/app/account/page.tsx` | Status badges, tracking link |
