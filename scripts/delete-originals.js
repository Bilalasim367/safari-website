'use strict';
/**
 * delete-originals.js — refuses to run unless ZERO source references remain.
 * Verifies code (src/, prisma/, scripts/, data/, tests/, root configs),
 * the database (product.image + product.images), and CSS url() before deleting.
 */
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const ROOT = process.cwd();
const BACKUP = path.join(ROOT, 'images_backup');
const DRY_RUN = process.argv.includes('--dry-run');

const skip = new Set([
  'node_modules', '.next', '.git', 'dist', 'build', 'deploy-app',
  '.vercel', 'coverage', '.playwright-mcp', 'images_backup',
]);
const exts = /\.(tsx?|jsx?|mjs|css|scss|json|sql|md|txt|html)$/i;

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const originals = [];
(function w(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const fp = path.join(d, f.name);
    if (f.isDirectory()) { if (!skip.has(f.name)) w(fp); }
    else if (/\.(png|jpe?g)$/i.test(f.name)) originals.push(fp);
  }
})(path.join(ROOT, 'public'));

async function main() {
if (!originals.length) {
  console.log('No original .png/.jpg/.jpeg files left in public/. Nothing to do.');
  return;
}

// --- 1. every original must have a converted sibling ---
// A file with no .webp sibling was unconvertible (e.g. 0 bytes / corrupt). Those
// are PRESERVED, not deleted: the code still points at them, and removing them
// would turn a broken image into a 404.
const noSibling = originals.filter((f) => !fs.existsSync(f.replace(/\.(png|jpe?g)$/i, '.webp')));
const deletable = originals.filter((f) => !noSibling.includes(f));
console.log('originals found: ' + originals.length);
console.log('  convertible (have a .webp sibling): ' + deletable.length);
console.log('  unconvertible — PRESERVED, not deleted: ' + noSibling.length);
for (const f of noSibling) {
  console.log('  ~~ ' + path.relative(ROOT, f) + ' (' + fs.statSync(f).size + ' bytes, sharp could not read it)');
}

// --- 2. every original must be present in the backup ---
const noBackup = originals.filter((f) => {
  const rel = path.relative(ROOT, f);
  return !fs.existsSync(path.join(BACKUP, rel));
});
console.log('originals MISSING from images_backup/: ' + noBackup.length);
for (const f of noBackup) console.log('  !! ' + path.relative(ROOT, f));

// --- 3. zero source references, EXCLUDING the preserved unconvertible files ---
// A reference to a preserved (unconvertible) file is expected and harmless — that
// file is staying. Only references to files we intend to delete are blockers.
const files = [];
(function w(d) {
  let entries;
  try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    const fp = path.join(d, e.name);
    if (e.isDirectory()) { if (!skip.has(e.name)) w(fp); }
    else if (exts.test(e.name) && !e.name.endsWith('.d.ts')) files.push(fp);
  }
})('.');

const refs = [];
const preservedRefs = [];
for (const f of files) {
  const c = fs.readFileSync(f, 'utf8');
  for (const o of originals) {
    const asset = '/' + path.relative('public', o).split(path.sep).join('/');
    const re = new RegExp(esc(asset.replace(/\.(png|jpe?g)$/i, '')) + '\\.(png|jpe?g)', 'gi');
    const m = c.match(re);
    if (!m) continue;
    const line = `${path.relative(ROOT, f)} -> ${asset} (x${m.length})`;
    (noSibling.includes(o) ? preservedRefs : refs).push(line);
  }
}
console.log('\nsource references to files being deleted: ' + refs.length);
for (const r of refs) console.log('  !! ' + r);
console.log('source references to PRESERVED unconvertible files (expected): ' + preservedRefs.length);
for (const r of preservedRefs) console.log('  ~~ ' + r);

// --- 4. zero database references ---
const prisma = new PrismaClient();
let dbRefs = [];
try {
  const rows = await prisma.$queryRawUnsafe('SELECT image, images FROM product');
  const set = new Set(originals.map((f) => '/' + path.relative('public', f).split(path.sep).join('/')));
  const stems = new Set([...set].map((s) => s.replace(/\.(png|jpe?g)$/i, '')));
  for (const r of rows) {
    const vals = [];
    if (r.image) vals.push(r.image);
    if (r.images) { try { const a = JSON.parse(r.images); if (Array.isArray(a)) vals.push(...a); } catch {} }
    for (const v of vals) {
      if (typeof v !== 'string' || /^https?:\/\//i.test(v)) continue;
      for (const stem of stems) if (v.startsWith(stem) && /\.(png|jpe?g)$/i.test(v)) dbRefs.push(v);
    }
  }
} catch (e) {
  console.log('\n!! DATABASE CHECK FAILED: ' + e.message);
  dbRefs = ['<db check failed>'];
} finally {
  await prisma.$disconnect();
}
console.log('database references to original paths: ' + dbRefs.length);
for (const r of dbRefs) console.log('  !! ' + r);

// --- decision ---
const blockers = noBackup.length + refs.length + dbRefs.length;
console.log('\n' + '='.repeat(60));
if (blockers > 0) {
  console.log('BLOCKED — ' + blockers + ' issue(s) above. Nothing deleted.');
  process.exitCode = 1;
  return;
}

if (DRY_RUN) {
  console.log('DRY RUN — all checks passed. Would delete ' + deletable.length +
    ' originals and preserve ' + noSibling.length + ' unconvertible files.');
  return;
}

let freed = 0;
for (const f of deletable) {
  freed += fs.statSync(f).size;
  fs.unlinkSync(f);
}
console.log('DELETED ' + deletable.length + ' original files (' + (freed / 1048576).toFixed(2) + ' MB).');
console.log('PRESERVED ' + noSibling.length + ' unconvertible files (still referenced by code).');
console.log('Backups are intact in images_backup/ — restore any file from there.');
}

main().catch((e) => { console.error(e); process.exit(1); });
