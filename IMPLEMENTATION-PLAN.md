# Safari Perfumes — Premium PDP Redesign + Conversion Features

## Saved: 2026-09-05
## Status: IN PROGRESS

---

## CRITICAL RULES
- prisma/schema.prisma: ONLY add new columns. NO rename/retype/mapping changes.
- NO migration files — use `prisma db push` + `prisma generate`
- server.js, next.config.js = NO TOUCH
- Admin: only add new fields to product form, NO redesign
- Customer pages (home, shop, bundles) = NO TOUCH

---

## PART 0: DATABASE + ADMIN EDITABLE FIELDS

### Schema Changes (Product model)
- [ ] Add `genderDisplay String?` — "Male" | "Female" | "Unisex" (display-only, separate from existing `gender`)
  NOTE: Actually, `gender` already exists as String with default "Unisex". The task says add gender but it's already there. Need to check if it matches the requirements.
- [ ] Add `fragranceNotes String?` — comma separated notes (e.g. "Woody, Musk, Oud, Amber")
  NOTE: `fragranceFamily` already exists. Need `notes` as a new column for the comma-separated display notes.
- [ ] Verify existing `size` and `fragranceFamily` columns meet requirements

### Admin Form Changes
- [ ] Add Gender dropdown (existing field — just verify it's in the form)
- [ ] Add Fragrance Family dropdown
- [ ] Add Attar Notes input (comma separated)
- [ ] Add Size input
- [ ] Run `prisma db push` + `prisma generate`

---

## PART 1: PRODUCT DETAIL PAGE REDESIGN

### Files to Create/Modify
- [ ] `src/app/shop/[slug]/page.tsx` — REWRITE product detail page
- [ ] Possibly new component files for PDP sections

### Layout
- Mobile: stacked, sticky header, sticky bottom bar
- Desktop: 2-column (image left sticky, info right)

---

## PART 2: WHATSAPP ORDER

### Files
- [ ] `data/popup-settings.json` — create with default WhatsApp number
- [ ] WhatsApp button on PDP
- [ ] Floating WhatsApp button (all pages) — add to layout

---

## PART 3: SOCIAL PROOF PURCHASE POPUP

### Files
- [ ] `src/components/SocialProofPopup.tsx` — new component
- [ ] Admin "Popup Settings" page — new admin page
- [ ] API route for popup settings
- [ ] Add popup to layout (conditionally)

---

## BUILD VERIFICATION
- [ ] `npm run lint` — 0 errors
- [ ] `npm run build` — clean compile
- [ ] UPDATE-PLAN.md update
- [ ] FINAL SUMMARY
