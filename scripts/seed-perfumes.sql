-- =============================================================================
-- SEED PERFUMES (50ml) — run in phpMyAdmin on the cPanel MySQL DB:
--   Database: safariperfumes_perfume_db
-- =============================================================================
-- PURPOSE:
--   Perfumes are 50ml bottles. Only Attars (12ml) are currently shown in the
--   store. When a perfume is ready to go live, copy one INSERT below, fill in
--   real values, and run it. The storefront automatically shows it as
--   "Perfume / 50ml" (type=Perfume, size=50ml).
--
-- REQUIRED columns (no DB default): id, name, slug, price, image, images,
--   sizePrices, notesTop, notesHeart, notesBase.
--   -> notesTop/Heart/Base must be a JSON array string, e.g. '["Bergamot"]'
--   -> sizePrices must be a JSON string, e.g. '[{\"size\":\"50ml\",\"price\":9900}]'
--   -> image must be a real path OR '' (empty shows the image placeholder)
--
-- TYPE = 'Perfume'  -> 50ml           (defaultSizeForType in src/lib/normalize.ts)
-- TYPE = 'Attar'    -> 12ml
--
-- UNIQUE: slug  /  productId  (productId may be NULL — leave NULL unless the
--   bulk-price CSV references this product by name, not by productId).
-- =============================================================================

-- raw material required for a brand-new perfume (own-brand style)
INSERT INTO product
(id, name, slug, price, originalPrice, image, images, categorySlug, size, sizePrices,
 fragranceFamily, rating, reviewCount, notesTop, notesHeart, notesBase, inStock,
 isBestseller, isNew, isHotSelling, isTrending, isActive, productId,
 gender, type, season, bestTime, impressionOf, shortDescription, longDescription,
 sizesAvailable, concentration, bottleStyle, longevity, sillage,
 currency, stockStatus, createdAt, updatedAt)
VALUES
(
  'prf-own-signature-one',                 -- id (must be unique)
  'Safari Signature One',                  -- name (shown on PDP)
  'safari-signature-one',                  -- slug (must be unique, lowercase w/ dashes)
  9900,                                    -- price (PKR)
  NULL,                                    -- originalPrice (NULL = no strikethrough)
  '',                                      -- image ('' = placeholder; or '/images/x.jpg')
  '[]',                                    -- images (JSON array)
  'unisex',                                -- categorySlug (men/women/unisex)
  '50ml',                                  -- size — ALWAYS 50ml for perfume
  '[{"size":"50ml","price":9900,"originalPrice":null}]',  -- sizePrices (JSON)
  'Woody',                                 -- fragranceFamily
  0,                                       -- rating
  0,                                       -- reviewCount
  '["Bergamot","Saffron"]',                -- notesTop (JSON array)
  '["Rose","Amber"]',                      -- notesHeart (JSON array)
  '["Oud","Musk","Vanilla"]',              -- notesBase (JSON array)
  1,                                       -- inStock (1 = true)
  1,                                       -- isBestseller
  1,                                       -- isNew
  0,                                       -- isHotSelling
  0,                                       -- isTrending
  1,                                       -- isActive (1 = visible on site)
  NULL,                                    -- productId (optional unique; NULL ok)
  'Unisex',                                -- gender (Men/Women/Unisex)
  'Perfume',                               -- type — ALWAYS 'Perfume'
  'Winter',                                -- season (optional)
  'Night',                                 -- bestTime (optional)
  'Creed Aventus',                         -- impressionOf (optional; local-clone style)
  'A bold signature scent. Copy from admin or write your own.', -- shortDescription
  NULL,                                    -- longDescription (optional)
  '30ml,50ml,100ml',                       -- sizesAvailable
  'EDP',                                   -- concentration (EDP/EDT/Parfum/Extrait)
  'Spray',                                 -- bottleStyle (Spray/Atomizer/Splash/Decant)
  'Very Long',                             -- longevity (Very Long/Long/Moderate/Light)
  'Heavy',                                 -- sillage (Heavy/Moderate/Soft/Intimate)
  'PKR',                                   -- currency
  'in_stock',                              -- stockStatus (in_stock/out_of_stock/backorder)
  NOW(),                                   -- createdAt
  NOW()                                    -- updatedAt
);
-- =============================================================================
-- TEMPLATES — copy/paste + edit. Delete the examples you don't need.
-- (Only one INSERT at a time if you keep the unique ids below — each id/slug
--  must be unique across the whole table.)
-- =============================================================================

-- Template A — Local Clone perfume (uses impressionOf = the designer it mimics)
-- INSERT INTO product
-- (id, name, slug, price, image, images, categorySlug, size, sizePrices,
--  fragranceFamily, rating, reviewCount, notesTop, notesHeart, notesBase, inStock,
--  isBestseller, isNew, isActive, gender, type, season, bestTime, impressionOf,
--  shortDescription, sizesAvailable, concentration, bottleStyle, longevity, sillage,
--  currency, stockStatus, createdAt, updatedAt)
-- VALUES
-- (
--   'prf-clone-tom-ford-oud-wood',
--   'Oud Wood By Tom Ford',
--   'oud-wood-by-tom-ford',
--   7900,
--   '',
--   '[]',
--   'men',
--   '50ml',
--   '[{"size":"50ml","price":7900,"originalPrice":null}]',
--   'Woody',
--   0,
--   0,
--   '["Rosewood","Cardamom"]',
--   '["Sandalwood","Vetiver"]',
--   '["Amber","Vanilla"]',
--   1,
--   1,
--   1,
--   1,
--   'Men',
--   'Perfume',
--   'All Seasons',
--   'Night',
--   'Tom Ford Oud Wood',
--   'A warm, luxurious clone of Oud Wood.',
--   '30ml,50ml,100ml',
--   'EDP',
--   'Spray',
--   'Very Long',
--   'Moderate',
--   'PKR',
--   'in_stock',
--   NOW(),
--   NOW()
-- );

-- Template B — Own-brand perfume (no impressionOf)
-- INSERT INTO product
-- (id, name, slug, price, image, images, categorySlug, size, sizePrices,
--  fragranceFamily, rating, reviewCount, notesTop, notesHeart, notesBase, inStock,
--  isBestseller, isNew, isActive, gender, type, season, bestTime,
--  shortDescription, sizesAvailable, concentration, bottleStyle, longevity, sillage,
--  currency, stockStatus, createdAt, updatedAt)
-- VALUES
-- (
--   'prf-own-ocean-breeze',
--   'Safari Ocean Breeze',
--   'safari-ocean-breeze',
--   6500,
--   '',
--   '[]',
--   'unisex',
--   '50ml',
--   '[{"size":"50ml","price":6500,"originalPrice":null}]',
--   'Fresh',
--   0,
--   0,
--   '["Sea Salt","Lemon"]',
--   '["Jasmine","Ylang"]',
--   '["Musk","Cedarwood"]',
--   1,
--   0,
--   1,
--   1,
--   'Unisex',
--   'Perfume',
--   'Summer',
--   'Day',
--   'A crisp, marine fragrance for daily wear.',
--   '30ml,50ml,100ml',
--   'EDT',
--   'Spray',
--   'Long',
--   'Moderate',
--   'PKR',
--   'in_stock',
--   NOW(),
--   NOW()
-- );
-- =============================================================================
-- VERIFY AFTER INSERT:
--   SELECT id, name, slug, type, size, gender, isActive FROM product
--   WHERE type = 'Perfume';
-- The product appears in /shop?type=perfume and in the header "Perfumes
-- Collection" dropdown. If a photo is needed, set image to an uploaded path.
-- =============================================================================