-- Normalize existing gender/type data in the database
-- Run this migration to fix existing inconsistent data

-- Normalize gender values to capitalized format
UPDATE "Product" SET "gender" = CASE 
  WHEN LOWER("gender") = 'men' THEN 'Men'
  WHEN LOWER("gender") = 'women' THEN 'Women'
  WHEN LOWER("gender") = 'unisex' THEN 'Unisex'
  ELSE 'Unisex'
END;

-- Normalize type values to standardized format
UPDATE "Product" SET "type" = CASE 
  WHEN LOWER("type") LIKE '%attar%' THEN 'Attar'
  WHEN LOWER("type") LIKE '%perfume%' THEN 'Perfume'
  ELSE 'Attar'
END;

-- Normalize categorySlug to lowercase
UPDATE "Product" SET "categorySlug" = LOWER("categorySlug");

-- Verify the changes
SELECT "gender", COUNT(*) as count FROM "Product" GROUP BY "gender";
SELECT "type", COUNT(*) as count FROM "Product" GROUP BY "type";
SELECT "categorySlug", COUNT(*) as count FROM "Product" GROUP BY "categorySlug";