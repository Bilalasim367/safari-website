-- Storefront placement control.
-- Higher `displayOrder` values appear first on the storefront; 0 means normal order.
ALTER TABLE `product` ADD COLUMN `displayOrder` INTEGER NOT NULL DEFAULT 0;

CREATE INDEX `product_isActive_displayOrder_idx` ON `product`(`isActive`, `displayOrder`);
