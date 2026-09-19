/**
 * v2.0-P0 visual reset screenshots — exactly three, Paper, 1440px, /zh/.
 *
 * Usage: node scripts/qa-v20-shots.mjs [baseUrl]
 *
 * The brief asks for three images rather than twenty (§33), so this script
 * produces three and nothing else:
 *
 *   hero-first-screen.png   1440 × 900, scroll 0
 *   featured-projects.png   the #work section, clipped at real resolution
 *   homepage-full.png       the whole document
 *
 * Local review artifacts only; `.qa-screens/` is gitignored.
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const BASE = process.argv[2] ?? 'http://127.0.0.1:4321';
const OUT = '.qa-screens/v20';
const ROUTE = '/zh/';
const THEME = 'paper';

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();

await page.addInitScript((theme) => {
  try {
    localStorage.setItem('haoleilab-theme', theme);
    localStorage.setItem('haoleilab-language', 'zh');
  } catch {
    /* storage unavailable */
  }
}, THEME);

await page.goto(`${BASE}${ROUTE}`, { waitUntil: 'networkidle' });

// Reveal anything that animates in, then settle back at the top.
await page.evaluate(async () => {
  const step = window.innerHeight / 2;
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 50));
  }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(600);

/* 1. the first screen */
await page.screenshot({ path: `${OUT}/hero-first-screen.png` });

/* 2. Featured Projects, captured as an element so a section taller than the
      viewport is stitched correctly rather than clipped to a blank band. */
const work = page.locator('#work');
const workBox = await work.boundingBox();
if (!workBox) throw new Error('#work not found');
await work.screenshot({ path: `${OUT}/featured-projects.png` });

/* 3. the whole page */
await page.screenshot({ path: `${OUT}/homepage-full.png`, fullPage: true });

const height = await page.evaluate(() => document.documentElement.scrollHeight);
const heroBox = await page.locator('.hero').boundingBox();

console.log(`hero-first-screen.png   1440 x 900`);
console.log(`featured-projects.png   1440 x ${Math.round(workBox.height)}`);
console.log(`homepage-full.png       1440 x ${height}`);
console.log(`\nDocument height: ${height}px`);
console.log(`Hero height:     ${Math.round(heroBox?.height ?? 0)}px`);
console.log(`Work section:    ${Math.round(workBox.height)}px`);

await browser.close();
