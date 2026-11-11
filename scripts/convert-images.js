#!/usr/bin/env node
/**
 * convert-images.js — Safari Perfumes
 *
 * Converts every .jpg / .jpeg / .png raster image under the scanned roots to .webp
 * (quality 80, max width 1200px, never enlarging, aspect ratio preserved).
 *
 * Guarantees:
 *  - Originals are copied to images_backup/ before anything is written.
 *  - Already-converted files (target .webp exists and is newer) are skipped.
 *  - Folder structure and filename are preserved; only the extension changes.
 *  - Never touches node_modules, .next, .git, dist, build, deploy-app,
 *    images_backup, src/app/icon.* or src/app/apple-icon.* (Next.js file
 *    conventions do not support .webp there).
 *
 * Usage:
 *   node scripts/convert-images.js           # convert
 *   node scripts/convert-images.js --dry-run # report only, writes nothing
 */

'use strict';

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const QUALITY = 80;
const MAX_WIDTH = 1200;

const ROOT = process.cwd();
const BACKUP_DIR = path.join(ROOT, 'images_backup');
const SOURCE_ROOTS = ['public', 'src'];

const SKIP_DIRS = new Set([
  'node_modules',
  '.next',
  '.git',
  'dist',
  'build',
  'deploy-app',
  'images_backup',
  '.vercel',
  'coverage',
  '.playwright-mcp',
]);

// Next.js 16 metadata file conventions accept only ico/jpg/jpeg/png/svg.
// Converting these to .webp breaks the favicon and apple-touch-icon.
const SKIP_FILES = new Set([
  path.join('src', 'app', 'icon.png'),
  path.join('src', 'app', 'icon.jpg'),
  path.join('src', 'app', 'icon.jpeg'),
  path.join('src', 'app', 'apple-icon.png'),
  path.join('src', 'app', 'apple-icon.jpg'),
  path.join('src', 'app', 'apple-icon.jpeg'),
]);

const RASTER = /\.(png|jpe?g)$/i;
const DRY_RUN = process.argv.includes('--dry-run');

const toWebpName = (f) => f.replace(/\.(png|jpe?g)$/i, '.webp');
const rel = (f) => path.relative(ROOT, f).split(path.sep).join('/');

function walk(dir, out) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(full, out);
    } else if (RASTER.test(entry.name)) {
      const relPath = path.relative(ROOT, full);
      if (SKIP_FILES.has(relPath)) continue;
      out.push(full);
    }
  }
  return out;
}

function formatKb(bytes) {
  return (bytes / 1024).toFixed(1).padStart(9) + ' KB';
}

async function main() {
  const files = [];
  for (const r of SOURCE_ROOTS) {
    const abs = path.join(ROOT, r);
    if (fs.existsSync(abs)) walk(abs, files);
  }
  files.sort();

  if (files.length === 0) {
    console.log('No .jpg / .jpeg / .png images found. Nothing to do.');
    return;
  }

  const totalOriginal = files.reduce((s, f) => s + fs.statSync(f).size, 0);

  console.log('='.repeat(78));
  console.log('images -> webp converter');
  console.log(`roots      : ${SOURCE_ROOTS.join(', ')}`);
  console.log(`quality    : ${QUALITY}`);
  console.log(`max width  : ${MAX_WIDTH}px (never enlarges)`);
  console.log(`backup dir : ${rel(BACKUP_DIR)}`);
  console.log(`mode       : ${DRY_RUN ? 'DRY RUN (no files written)' : 'LIVE'}`);
  console.log('='.repeat(78));
  console.log(
    `${'original'.padEnd(22)}${'webp'.padEnd(22)}${'before'.padStart(12)}${'after'.padStart(12)}${  'saved'.padStart(12)}  status`
  );
  console.log('-'.repeat(78));

  let converted = 0;
  let skipped = 0;
  let failed = 0;
  let resized = 0;
  let beforeTotal = 0;
  let afterTotal = 0;
  const failures = [];

  for (const file of files) {
    const target = toWebpName(file);
    const relPath = rel(file);
    const relTarget = rel(target);
    const originalSize = fs.statSync(file).size;

    // Backup first — never lose an original.
    if (!DRY_RUN) {
      const backupPath = path.join(BACKUP_DIR, relPath);
      fs.mkdirSync(path.dirname(backupPath), { recursive: true });
      if (!fs.existsSync(backupPath)) fs.copyFileSync(file, backupPath);
    }

    const alreadyConverted =
      fs.existsSync(target) && fs.statSync(target).mtimeMs >= fs.statSync(file).mtimeMs;

    if (alreadyConverted) {
      skipped += 1;
      beforeTotal += originalSize;
      afterTotal += fs.statSync(target).size;
      console.log(
        relPath.slice(0, 21).padEnd(22) +
          relTarget.slice(0, 21).padEnd(22) +
          formatKb(originalSize) +
          formatKb(fs.statSync(target).size) +
          '     skipped  (already converted)'
      );
      continue;
    }

    try {
      const image = sharp(file, { failOn: 'none' });
      const meta = await image.metadata();
      const needsResize = (meta.width || 0) > MAX_WIDTH;

      const pipeline = sharp(file, { failOn: 'none' });
      if (needsResize) pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
      pipeline.webp({ quality: QUALITY });

      const buffer = await pipeline.toBuffer();

      if (!DRY_RUN) fs.writeFileSync(target, buffer);

      if (needsResize) resized += 1;
      converted += 1;
      beforeTotal += originalSize;
      afterTotal += buffer.length;

      const saved = originalSize - buffer.length;
      const pct = originalSize > 0 ? ((saved / originalSize) * 100).toFixed(0) : '0';
      console.log(
        relPath.slice(0, 21).padEnd(22) +
          relTarget.slice(0, 21).padEnd(22) +
          formatKb(originalSize) +
          formatKb(buffer.length) +
          `  ${(saved / 1024).toFixed(1).padStart(7)} KB ${pct.padStart(3)}%  ${needsResize ? `resized ${meta.width}->${MAX_WIDTH}` : 'converted'}`
      );
    } catch (error) {
      failed += 1;
      failures.push({ file: relPath, error: error.message });
      beforeTotal += originalSize;
      afterTotal += originalSize;
      console.log(
        relPath.slice(0, 21).padEnd(22) +
          ' '.repeat(22) +
          formatKb(originalSize) +
          '        n/a      FAILED  ' +
          error.message
      );
    }
  }

  console.log('-'.repeat(78));
  console.log(`images found     : ${files.length}`);
  console.log(`converted        : ${converted} (${resized} resized to max ${MAX_WIDTH}px)`);
  console.log(`skipped (done)   : ${skipped}`);
  console.log(`failed           : ${failed}`);
  console.log(`size before      : ${(beforeTotal / 1048576).toFixed(2)} MB`);
  console.log(`size after       : ${(afterTotal / 1048576).toFixed(2)} MB`);
  const savedTotal = beforeTotal - afterTotal;
  const savedPct = beforeTotal > 0 ? ((savedTotal / beforeTotal) * 100).toFixed(1) : '0.0';
  console.log(
    `space saved      : ${(savedTotal / 1048576).toFixed(2)} MB (${savedPct}%)`
  );
  console.log(`originals on disk: ${(totalOriginal / 1048576).toFixed(2)} MB (not deleted by this script)`);

  if (failures.length) {
    console.log('\nFAILURES:');
    for (const f of failures) console.log(`  ${f.file} :: ${f.error}`);
  }

  if (DRY_RUN) {
    console.log('\nDRY RUN — no files were written. Re-run without --dry-run to apply.');
  } else {
    console.log(
      `\nOriginals are still in place. Run scripts/delete-originals.js after verifying no references remain.`
    );
  }
}

main().catch((error) => {
  console.error('Fatal:', error);
  process.exit(1);
});
