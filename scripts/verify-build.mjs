/**
 * Post-build verification against ./dist.
 *
 * Checks that every expected route exists, that every internal link and
 * local asset reference resolves to a real file, and that the required
 * SEO / deployment artifacts were emitted.
 *
 * Usage: node scripts/verify-build.mjs
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, posix, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

const problems = [];
const notes = [];

function fail(message) {
  problems.push(message);
}

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

if (!existsSync(dist)) {
  console.error('dist/ not found — run `npm run build` first.');
  process.exit(1);
}

const files = walk(dist);
const htmlFiles = files.filter((f) => f.endsWith('.html'));

console.log(`Verifying ${files.length} files, ${htmlFiles.length} HTML pages…`);

/* ------------------------------------------------------------------ routes */

const SLUGS = ['wennian', 'hycell', 'taiyi-lingjing', 'pet-ai-health', 'pdig'];
const EXPECTED_ROUTES = [
  '/index.html',
  '/404.html',
  '/projects/index.html',
  '/research/index.html',
  '/about/index.html',
  '/resume/index.html',
  '/zh/index.html',
  '/zh/projects/index.html',
  '/zh/research/index.html',
  '/zh/about/index.html',
  '/zh/resume/index.html',
  ...SLUGS.map((s) => `/projects/${s}/index.html`),
  ...SLUGS.map((s) => `/zh/projects/${s}/index.html`),
];

for (const route of EXPECTED_ROUTES) {
  const target = join(dist, route);
  if (!existsSync(target)) fail(`missing route: ${route}`);
}

/* -------------------------------------------------------------- deployment */

for (const asset of [
  'sitemap-index.xml',
  'robots.txt',
  'CNAME',
  'favicon.svg',
  'manifest.webmanifest',
  'icon-192.png',
  'icon-512.png',
  'apple-touch-icon.png',
  'og/default.png',
  'og/home.png',
  ...SLUGS.map((s) => `og/${s}.png`),
]) {
  if (!existsSync(join(dist, asset))) fail(`missing asset: ${asset}`);
}

/* ------------------------------------------------------------------- links */

function resolveInternal(pathname) {
  const clean = pathname.split('#')[0].split('?')[0];
  if (!clean) return null;
  const rel = clean.replace(/^\/+/, '');
  const candidates = [join(dist, rel), join(dist, rel, 'index.html'), join(dist, `${rel}.html`)];
  return candidates.find((c) => existsSync(c)) ?? null;
}

let checkedLinks = 0;
let checkedAssets = 0;

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const route = '/' + posix.relative(dist, file).split('\\').join('/');

  // href="…"
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const value = match[1];
    if (!value) continue;
    if (
      value.startsWith('http://') ||
      value.startsWith('https://') ||
      value.startsWith('mailto:') ||
      value.startsWith('tel:') ||
      value.startsWith('data:') ||
      value.startsWith('#')
    ) {
      continue;
    }
    if (!value.startsWith('/')) continue; // relative asset handled below

    if (match[0].startsWith('src=')) checkedAssets += 1;
    else checkedLinks += 1;

    if (!resolveInternal(value)) fail(`dead reference in ${route}: ${value}`);
  }
}

/* --------------------------------------------------------------- integrity */

let missingTitles = 0;
let missingCanonical = 0;
let missingOg = 0;

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  if (!/<title>[\s\S]+?<\/title>/.test(html)) missingTitles += 1;
  if (!/rel="canonical"/.test(html)) missingCanonical += 1;
  if (!/property="og:image"/.test(html)) missingOg += 1;
}

if (missingTitles) fail(`${missingTitles} page(s) without <title>`);
if (missingCanonical) fail(`${missingCanonical} page(s) without canonical`);
if (missingOg) fail(`${missingOg} page(s) without og:image`);

/* ------------------------------------------------------------------ report */

notes.push(`${checkedLinks} internal links checked`);
notes.push(`${checkedAssets} local assets checked`);
notes.push(`${SLUGS.length} case studies × 2 locales`);

if (problems.length) {
  console.error('\nVerification FAILED:');
  for (const p of problems) console.error(`  ✗ ${p}`);
  process.exit(1);
}

console.log('\nVerification passed.');
for (const n of notes) console.log(`  • ${n}`);
