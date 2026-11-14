-- Meta / Facebook Ads settings on the single Settings row
ALTER TABLE `settings`
  ADD COLUMN `metaPixelEnabled` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `metaPixelId` VARCHAR(191) NULL,
  ADD COLUMN `metaCapiEnabled` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `metaCapiToken` VARCHAR(191) NULL,
  ADD COLUMN `metaTestEventCode` VARCHAR(191) NULL,
  ADD COLUMN `metaCatalogToken` VARCHAR(191) NULL,
  ADD COLUMN `metaDomainVerification` VARCHAR(191) NULL;

-- Marketing attribution snapshot on orders (JSON text)
ALTER TABLE `order`
  ADD COLUMN `attribution` TEXT NULL;

-- Admin-managed homepage promo slider
CREATE TABLE `homepageslide` (
  `id` VARCHAR(191) NOT NULL,
  `placement` VARCHAR(191) NOT NULL DEFAULT 'home_main',
  `eyebrow` VARCHAR(191) NULL,
  `title` VARCHAR(191) NULL,
  `subtitle` TEXT NULL,
  `imageDesktop` VARCHAR(191) NOT NULL,
  `imageMobile` VARCHAR(191) NULL,
  `imageAlt` VARCHAR(191) NULL,
  `href` VARCHAR(191) NULL,
  `ctaLabel` VARCHAR(191) NULL,
  `openInNewTab` BOOLEAN NOT NULL DEFAULT false,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `startsAt` DATETIME(3) NULL,
  `endsAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `homepageslide_placement_isActive_sortOrder_idx` (`placement`, `isActive`, `sortOrder`),
  INDEX `homepageslide_startsAt_endsAt_idx` (`startsAt`, `endsAt`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Homepage section order / visibility / copy
CREATE TABLE `homepagesection` (
  `id` VARCHAR(191) NOT NULL,
  `key` VARCHAR(191) NOT NULL,
  `eyebrow` VARCHAR(191) NULL,
  `title` VARCHAR(191) NULL,
  `subtitle` TEXT NULL,
  `isVisible` BOOLEAN NOT NULL DEFAULT true,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `config` TEXT NULL,
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `homepagesection_key_key` (`key`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Generic editable site blocks (header announcement, footer contact, page copy)
CREATE TABLE `sitecontent` (
  `id` VARCHAR(191) NOT NULL,
  `key` VARCHAR(191) NOT NULL,
  `value` TEXT NOT NULL,
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `sitecontent_key_key` (`key`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Newsletter subscribers (the homepage/footer forms previously posted to a
-- route that did not exist, so every signup failed)
CREATE TABLE `newslettersubscriber` (
  `id` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `source` VARCHAR(191) NOT NULL DEFAULT 'homepage',
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `subscribedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `newslettersubscriber_email_key` (`email`),
  INDEX `newslettersubscriber_subscribedAt_idx` (`subscribedAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
